"use client";

import { useState } from "react";
import * as fcl from "@onflow/fcl";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, Loader2, Wallet } from "lucide-react";
import { useWallet } from "@/components/shared/WalletProvider";
import { toast } from "sonner";

export default function Home() {
  const [amount, setAmount] = useState<string>("100.00");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("A gift for you!");
  const [isFunding, setIsFunding] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [giftTxId, setGiftTxId] = useState("");
  const { userAddress, connect, disconnect, isLoading } = useWallet();

  if (isSuccess) {
    const claimUrl = `${window.location.origin}/claim/${giftTxId}?email=${encodeURIComponent(email)}`;

    return (
      <div className="w-full max-w-md mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-white to-white/40">
            GlowCards
          </h1>
          <p className="text-emerald-400 tracking-widest text-xs uppercase font-bold">
            Gift Sent Successfully ✨
          </p>
        </div>

        <Card className="glass-card border-none mt-8 relative overflow-hidden group border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent" />
          <CardHeader className="pb-6 relative z-10 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-wide text-white">
              ₣{amount} FLOW Locked
            </CardTitle>
            <CardDescription className="text-sm text-emerald-100/60 leading-relaxed">
              We just emailed{" "}
              <strong className="text-white font-medium">{email}</strong> a
              magic link to claim their yielding gift!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Backup Claim Link
              </p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={claimUrl}
                  className="font-mono text-xs bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-white/60 selection:bg-emerald-500/30 overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent hover:text-white shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(claimUrl);
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="relative z-10 flex flex-col gap-3">
            <Button
              onClick={() => {
                setIsSuccess(false);
                setAmount("100.00");
                setEmail("");
                setMessage("A gift for you!");
              }}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl font-medium tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
            >
              Send Another Gift
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-3">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-white to-white/40">
          GlowCards
        </h1>
        <p className="text-muted-foreground tracking-widest text-xs uppercase font-medium">
          Give the Gift of Yield
        </p>
      </div>

      <Card className="glass-card border-none mt-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="pb-6 relative z-10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium tracking-wide">
              Create Gift Card
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80 mt-1">
              Funds automatically accrue interest until claimed.
            </CardDescription>
          </div>
          {userAddress && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-emerald-400/80 font-mono tracking-wider bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                Connected
              </span>
              <button
                onClick={disconnect}
                className="text-[10px] text-muted-foreground hover:text-white transition-colors mt-2 underline underline-offset-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label
              htmlFor="amount"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Gift Amount (FLOW)
            </Label>
            <div className="relative group/input">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium transition-colors group-focus-within/input:text-white">
                ₣
              </span>
              <Input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                type="number"
                className="pl-9 bg-black/40 border-white/5 h-14 text-xl focus-visible:ring-1 focus-visible:ring-white/20 transition-all font-mono rounded-xl shadow-inner placeholder:text-white/10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="email"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Recipient Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              type="email"
              className="bg-black/40 border-white/5 h-14 text-base focus-visible:ring-1 focus-visible:ring-white/20 transition-all rounded-xl shadow-inner placeholder:text-white/20"
            />
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="message"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Personal Message
            </Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Happy birthday!"
              type="text"
              maxLength={100}
              className="bg-black/40 border-white/5 h-14 text-base focus-visible:ring-1 focus-visible:ring-white/20 transition-all rounded-xl shadow-inner placeholder:text-white/20"
            />
          </div>
        </CardContent>
        <CardFooter className="relative z-10">
          {!userAddress ? (
            <Button
              onClick={connect}
              disabled={isLoading}
              className="w-full h-12 bg-white/10 text-white hover:bg-white/20 transition-all rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 border border-white/10 hover:border-white/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-white/60" />
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-white/80" />
                  Connect Flow Wallet
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled={
                isFunding || !amount || parseFloat(amount) <= 0 || !email
              }
              onClick={async () => {
                setIsFunding(true);
                try {
                  const txId = await fcl.mutate({
                    cadence: `
                      import FungibleToken from 0x9a0766d93b6608b7
                      import FlowToken from 0x7e60df042a9c0868
                      import GlowCardsV3 from 0x2515004a5408a7f0

                      transaction(amount: UFix64, message: String) {
                          let vaultRef: @{FungibleToken.Vault}
                          let senderAddress: Address

                          prepare(signer: auth(BorrowValue) &Account) {
                              let mainVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                                  ?? panic("Could not borrow reference to the owner's Vault!")
                              self.vaultRef <- mainVault.withdraw(amount: amount)
                              self.senderAddress = signer.address
                          }

                          execute {
                              let manager = getAccount(0x2515004a5408a7f0).capabilities.borrow<&GlowCardsV3.EscrowManager>(/public/GlowCardsV3EscrowManager)
                                  ?? panic("Could not borrow EscrowManager")
                              
                              manager.createGift(sender: self.senderAddress, payment: <-self.vaultRef, message: message)
                          }
                      }
                    `,
                    args: (arg: any, t: any) => [
                      arg(parseFloat(amount).toFixed(8), t.UFix64),
                      arg(message || "A gift for you!", t.String),
                    ],
                    limit: 999,
                  });

                  // Wait for the transaction to be sealed
                  fcl.tx(txId).subscribe(async (res: any) => {
                    if (res.status === 4 && res.errorMessage === "") {
                      // Extract the actual Gift ID generated by the smart contract
                      let realGiftId = "";
                      const giftEvent = res.events.find((e: any) =>
                        e.type.includes("GlowCardsV3.GiftCreated"),
                      );

                      if (
                        giftEvent &&
                        giftEvent.data &&
                        giftEvent.data.id !== undefined
                      ) {
                        realGiftId = giftEvent.data.id;
                      } else {
                        console.error(
                          "Failed to find GiftCreated event on chain",
                        );
                        return;
                      }

                      // Fire off the background email using our Next.js API route!
                      try {
                        await fetch("/api/send-gift", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            email,
                            amount: parseFloat(amount).toFixed(8),
                            claimUrl: `${window.location.origin}/claim/${realGiftId}?email=${encodeURIComponent(email)}`,
                          }),
                        });
                      } catch (err) {
                        console.error("Failed to send notification email", err);
                      }

                      // Transition UI from loading to Success instead of redirecting
                      setGiftTxId(realGiftId);
                      setIsSuccess(true);
                      setIsFunding(false);
                    } else if (res.status === 4) {
                      console.error("Tx Failed", res.errorMessage);
                      setIsFunding(false);
                    }
                  });
                } catch (error) {
                  console.error("Funding failed", error);
                  setIsFunding(false);
                }
              }}
              className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFunding ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-600" />
                  Continue to Fund
                  <ArrowRight className="w-4 h-4 ml-1 opacity-50" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          Powered by Flow & Increment Fi
        </p>
      </div>
    </div>
  );
}
