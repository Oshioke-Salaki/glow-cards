import { NextResponse } from "next/server";
import { SHA3 } from "sha3";
import EC from "elliptic";

const ec = new EC.ec("p256");

const signWithKey = (privateKey: string, msgHex: string) => {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
  const sig = key.sign(
    new SHA3(256).update(Buffer.from(msgHex, "hex")).digest(),
  );
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, "be", n);
  const s = sig.s.toArrayLike(Buffer, "be", n);
  return Buffer.concat([r, s]).toString("hex");
};

// Flow Testnet Admin account used to sponsor transactions (the "Gas Relayer")
const ADMIN_PRIVATE_KEY =
  process.env.ADMIN_PRIVATE_KEY ||
  "80e53c2ef4f634d1adc7e6f7514ec7d902ff4df22648ceb680741548fa98ec99";

export async function POST(req: Request) {
  try {
    const signable = await req.json();

    // The FCL payload wraps the hex message in a `message` property
    if (!signable || !signable.message) {
      return NextResponse.json(
        { error: "Invalid signable payload" },
        { status: 400 },
      );
    }

    // Sign the transaction message with the admin's private key
    const signature = signWithKey(ADMIN_PRIVATE_KEY, signable.message);

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Relay signing error:", error);
    return NextResponse.json(
      { error: "Failed to sign transaction" },
      { status: 500 },
    );
  }
}
