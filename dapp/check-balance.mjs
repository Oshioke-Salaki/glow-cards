import * as fcl from "@onflow/fcl";

fcl.config({
  "accessNode.api": "https://rest-testnet.onflow.org",
});

async function run() {
  try {
    const cadence = `
        import GlowCards from 0x2515004a5408a7f0

        access(all) struct EscrowState {
            access(all) let totalGifts: UInt64
            access(all) let giftExists: Bool
            
            init(total: UInt64, exists: Bool) {
                self.totalGifts = total
                self.giftExists = exists
            }
        }

        access(all) fun main(): EscrowState {
            let total = GlowCards.totalGiftsCreated
            
            // Note: In Cadence, dicts inside a resource are often kept private unless explicitly returned.
            // Since we can't easily check the Escrow keys from a script without a public accessor,
            // we will just return the totalGiftsCreated integer to see if ANY gifts were created.
            return EscrowState(total: total, exists: false)
        }
    `;

    const result = await fcl.query({
      cadence: cadence,
    });

    console.log("Escrow State:", result);
  } catch (err) {
    console.error(err);
  }
}

run();
