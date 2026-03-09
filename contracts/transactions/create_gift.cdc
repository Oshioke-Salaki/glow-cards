import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import GlowCards from 0xGlowCards

transaction(amount: UFix64) {
    let paymentVault: @FungibleToken.Vault
    let escrowManager: &GlowCards.EscrowManager
    let senderAddress: Address

    prepare(sender: AuthAccount) {
        self.senderAddress = sender.address
        
        let vaultRef = sender.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow reference to the owner's Vault!")
            
        self.paymentVault <- vaultRef.withdraw(amount: amount)
        
        // This assumes the EscrowManager is stored in the deployer's account 
        // and accessible via a capability. For simplicity in this architectural demo, 
        // we borrow it as if the sender is the admin or we have a public capability.
        self.escrowManager = sender.borrow<&GlowCards.EscrowManager>(from: /storage/GlowCardsEscrowManager)
            ?? panic("Could not borrow EscrowManager")
    }

    execute {
        self.escrowManager.createGift(sender: self.senderAddress, payment: <-self.paymentVault)
    }
}
