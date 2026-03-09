import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import GlowCardsV3 from 0x2515004a5408a7f0

transaction(amount: UFix64) {
    let adminRef: &GlowCardsV3.Admin
    let vaultRef: @{FungibleToken.Vault}

    prepare(signer: auth(BorrowValue, Storage) &Account) {
        self.adminRef = signer.storage.borrow<&GlowCardsV3.Admin>(from: /storage/GlowCardsV3Admin)
            ?? panic("Could not borrow Admin reference! Ensure you are signing with the exact account that deployed GlowCardsV3.")
            
        let ownerVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow owner FlowToken Vault!")
            
        self.vaultRef <- ownerVault.withdraw(amount: amount)
    }

    execute {
        self.adminRef.fundTreasury(funds: <-self.vaultRef)
    }
}
