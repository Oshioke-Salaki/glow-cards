import "GlowCards"

transaction {
    prepare(signer: auth(Storage, Capabilities) &Account) {
        // Double check if it exists in storage
        if signer.storage.borrow<&GlowCards.EscrowManager>(from: /storage/GlowCardsEscrowManager) == nil {
            // If it somehow doesn't exist, create and save it
            signer.storage.save(<-GlowCards.createEscrowManager(), to: /storage/GlowCardsEscrowManager)
        }

        // Unpublish any existing broken capabilities
        signer.capabilities.unpublish(/public/GlowCardsEscrowManager)

        // Re-issue and publish the capability with the correct type
        let escrowCap = signer.capabilities.storage.issue<&GlowCards.EscrowManager>(/storage/GlowCardsEscrowManager)
        signer.capabilities.publish(escrowCap, at: /public/GlowCardsEscrowManager)
    }

    execute {
        log("EscrowManager Capability successfully published to /public/GlowCardsEscrowManager")
    }
}
