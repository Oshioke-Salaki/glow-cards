import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import GlowCards from 0xGlowCards

// Relayer (gas payer) is the authorizer, but the newly created child account receives the funds
transaction(giftId: UInt64, recipientAddress: Address) {
    
    let escrowManager: &GlowCards.EscrowManager
    let recipientVault: &{FungibleToken.Receiver}

    // The relayer signs this and pays gas.
    prepare(relayer: AuthAccount) {
        
        // Normally, the relayer fetches the Admin's EscrowManager reference through a public capability
        self.escrowManager = getAccount(0xGlowCards)
            .getCapability(/public/GlowCardsEscrowManager)
            .borrow<&GlowCards.EscrowManager>()
            ?? panic("Could not borrow public EscrowManager")
            
        // Get the recipient's public account object and Receiver capability
        let recipient = getAccount(recipientAddress)
        self.recipientVault = recipient.getCapability(/public/flowTokenReceiver)
            .borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")
    }

    execute {
        // Claim the gift
        let funds <- self.escrowManager.claimGift(id: giftId, recipient: recipientAddress)
        // Deposit into recipient's vault
        self.recipientVault.deposit(from: <-funds)
    }
}
