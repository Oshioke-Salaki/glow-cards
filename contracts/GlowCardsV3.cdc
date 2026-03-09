import "FungibleToken"
import "FlowToken"

access(all) contract GlowCardsV3 {

    // --- Events ---
    access(all) event GiftCreated(id: UInt64, sender: Address, initialAmount: UFix64, message: String)
    access(all) event GiftClaimed(id: UInt64, recipient: Address, finalAmount: UFix64, yieldEarned: UFix64)
    access(all) event TreasuryFunded(amount: UFix64)

    // --- State ---
    access(all) var totalGiftsCreated: UInt64
    access(all) let apr: UFix64 // Annual Percentage Rate (e.g. 0.05 = 5%)
    
    // Central Yield Treasury managed by the protocol
    access(contract) var yieldTreasury: @{FungibleToken.Vault}
    
    // --- Interfaces ---
    access(all) resource interface GiftPublic {
        access(all) let id: UInt64
        access(all) let sender: Address
        access(all) let initialAmount: UFix64
        access(all) let createdAt: UFix64
        access(all) let message: String
    }

    // --- Resources ---
    access(all) resource Gift: GiftPublic {
        access(all) let id: UInt64
        access(all) let sender: Address
        access(all) let initialAmount: UFix64
        access(all) let createdAt: UFix64
        access(all) let message: String
        
        access(all) var vault: @{FungibleToken.Vault}

        init(id: UInt64, sender: Address, payment: @{FungibleToken.Vault}, message: String) {
            self.id = id
            self.sender = sender
            self.initialAmount = payment.balance
            self.createdAt = getCurrentBlock().timestamp
            self.message = message
            self.vault <- payment
        }

        access(all) fun claim(recipient: Address): @{FungibleToken.Vault} {
            let principalBal = self.vault.balance
            
            // Calculate mathematically exact time-based yield
            let secondsElapsed = getCurrentBlock().timestamp - self.createdAt
            let secondsInYear = 31536000.0 // 365 * 24 * 60 * 60
            
            // simple interest: Principal * Rate * Time
            let targetYield = (principalBal * GlowCardsV3.apr) * (secondsElapsed / secondsInYear)
            
            let payoutVault <- self.vault.withdraw(amount: principalBal)
            
            // Withdraw yield from the global treasury if available
            var actualYield = 0.0
            if targetYield > 0.0 && GlowCardsV3.yieldTreasury.balance >= targetYield {
                let interest <- GlowCardsV3.withdrawFromTreasury(amount: targetYield)
                payoutVault.deposit(from: <-interest)
                actualYield = targetYield
            }

            emit GiftClaimed(id: self.id, recipient: recipient, finalAmount: payoutVault.balance, yieldEarned: actualYield)
            return <-payoutVault
        }
    }

    access(all) resource EscrowManager {
        access(all) var gifts: @{UInt64: Gift}

        init() {
            self.gifts <- {}
        }

        access(all) fun createGift(sender: Address, payment: @{FungibleToken.Vault}, message: String): UInt64 {
            let id = GlowCardsV3.totalGiftsCreated
            GlowCardsV3.totalGiftsCreated = GlowCardsV3.totalGiftsCreated + 1
            
            let amt = payment.balance
            let newGift <- create Gift(id: id, sender: sender, payment: <-payment, message: message)
            self.gifts[id] <-! newGift
            
            emit GiftCreated(id: id, sender: sender, initialAmount: amt, message: message)
            return id
        }

        access(all) fun claimGift(id: UInt64, recipient: Address): @{FungibleToken.Vault} {
            pre {
                self.gifts[id] != nil: "Gift ID does not exist or has already been claimed."
            }
            
            let gift <- self.gifts.remove(key: id)!
            let funds <- gift.claim(recipient: recipient)
            
            destroy gift
            return <-funds
        }
        
        // Expose a way to calculate yield purely for frontend rendering
        access(all) fun calculateYield(id: UInt64): UFix64 {
            if self.gifts[id] == nil { return 0.0 }
            let giftRef = (&self.gifts[id] as &GlowCardsV3.Gift?)!
            
            let secondsElapsed = getCurrentBlock().timestamp - giftRef.createdAt
            let secondsInYear = 31536000.0
            return (giftRef.initialAmount * GlowCardsV3.apr) * (secondsElapsed / secondsInYear)
        }
    }

    access(all) resource Admin {
        access(all) fun fundTreasury(funds: @{FungibleToken.Vault}) {
            let amt = funds.balance
            GlowCardsV3.yieldTreasury.deposit(from: <-funds)
            emit TreasuryFunded(amount: amt)
        }
    }

    // Internal contract method to extract yield
    access(contract) fun withdrawFromTreasury(amount: UFix64): @{FungibleToken.Vault} {
        return <-self.yieldTreasury.withdraw(amount: amount)
    }

    access(all) fun createEscrowManager(): @EscrowManager {
        return <-create EscrowManager()
    }

    // --- Initialization ---
    init() {
        self.totalGiftsCreated = 0
        self.apr = 0.05 // 5% APR
        
        let emptyVault <- FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>())
        self.yieldTreasury <- emptyVault
        
        self.account.storage.save(<-create EscrowManager(), to: /storage/GlowCardsV3EscrowManager)
        let escrowCap = self.account.capabilities.storage.issue<&EscrowManager>(/storage/GlowCardsV3EscrowManager)
        self.account.capabilities.publish(escrowCap, at: /public/GlowCardsV3EscrowManager)
        
        self.account.storage.save(<-create Admin(), to: /storage/GlowCardsV3Admin)
    }
}
