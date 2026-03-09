import { config } from "@onflow/fcl";

config({
  "app.detail.title": "GlowCards",
  "app.detail.icon": "https://placekitten.com/g/200/200", // A generic placeholder icon
  "accessNode.api": "https://rest-testnet.onflow.org", // Flow Testnet
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn", // Testnet wallet discovery
  "flow.network": "testnet",
  "0xGlowCardsV3": "0x2515004a5408a7f0",
});
