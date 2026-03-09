"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Gift, Mail, Loader2, CheckCircle2 } from "lucide-react";
import * as fcl from "@onflow/fcl";
import { Magic } from "magic-sdk";
import { FlowExtension } from "@magic-ext/flow";
import { serverAuthorization } from "@/flow/relay";
import "@/flow/config";
import { toast } from "sonner";

export default function ClaimGift({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [yieldEarned, setYieldEarned] = useState<string | null>(null);
  const [liveYield, setLiveYield] = useState<number>(0);
  const [giftMessage, setGiftMessage] = useState<string | null>(null);
  const [isUnboxed, setIsUnboxed] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  useEffect(() => {
    const fetchGiftAmount = async () => {
      try {
        const unwrappedParams = await params;
        const giftId = unwrappedParams.id;
        const result = await fcl.query({
          cadence: `
            import GlowCardsV3 from 0x2515004a5408a7f0
            
            access(all) struct GiftData {
                access(all) let balance: UFix64
                access(all) let yield: UFix64
                access(all) let message: String
                init(_ b: UFix64, _ y: UFix64, _ m: String) {
                    self.balance = b
                    self.yield = y
                    self.message = m
                }
            }
            
            access(all) fun main(giftId: UInt64): GiftData {
                let manager = getAccount(0x2515004a5408a7f0).capabilities.borrow<&GlowCardsV3.EscrowManager>(/public/GlowCardsV3EscrowManager)
                    ?? panic("Could not borrow EscrowManager")
                
                if manager.gifts[giftId] == nil {
                    return GiftData(0.0, 0.0, "")
                }
                
                let b = manager.gifts[giftId]!.initialAmount
                let y = manager.calculateYield(id: giftId)
                let m = manager.gifts[giftId]!.message
                return GiftData(b, y, m)
            }
          `,
          args: (arg: any, t: any) => [arg(giftId, t.UInt64)],
        });

        if (Number(result.balance) > 0) {
          setBalance(Number(result.balance).toFixed(2));
          setYieldEarned(Number(result.yield).toFixed(4));
          setLiveYield(Number(result.yield));
          setGiftMessage(result.message);
        } else {
          setBalance("0.00");
          setYieldEarned("0.0000");
          setLiveYield(0);
        }
      } catch (err) {
        console.error("Failed to fetch balance", err);
        setBalance("---");
        setYieldEarned("0.0000");
      }
    };
    fetchGiftAmount();
  }, [params]);

  // Real-Time Yield Ticker Magic!
  useEffect(() => {
    if (!balance || !yieldEarned) return;
    const baseBal = parseFloat(balance);
    if (isNaN(baseBal) || baseBal <= 0) return;

    // 5% APR calculated per 50ms tick
    // (Prinical * 0.05) / (SecondsInYear * 20 ticksPerSecond)
    const yieldPerTick = (baseBal * 0.05) / (31536000 * 20);

    const interval = setInterval(() => {
      setLiveYield((prev) => prev + yieldPerTick);
    }, 50);

    return () => clearInterval(interval);
  }, [balance, yieldEarned]);

  const openWallet = async () => {
    const magic = new Magic(
      process.env.NEXT_PUBLIC_MAGIC_API_KEY || "pk_live_placeholder",
      {
        extensions: [
          new FlowExtension({
            rpcUrl: "https://rest-testnet.onflow.org",
            network: "testnet",
          }),
        ],
      },
    );
    await magic.wallet.showUI().catch(console.error);
  };

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const unwrappedParams = await params;
      const giftId = unwrappedParams.id; // FCL requires string for UInt64

      // 1. Initialize Magic SDK with Flow Extension
      const magic = new Magic(
        process.env.NEXT_PUBLIC_MAGIC_API_KEY || "pk_live_placeholder",
        {
          extensions: [
            new FlowExtension({
              rpcUrl: "https://rest-testnet.onflow.org",
              network: "testnet",
            }),
          ],
        },
      );

      // 2. Authenticate user via Email Magic Link
      await magic.auth.loginWithMagicLink({ email });

      // 3. Get the fully scoped Flow authorization function from Magic
      const AUTHORIZATION_FUNCTION = magic.flow.authorization;

      // 4. Execute the Gasless Claim Transaction on Flow
      const txId = await fcl.mutate({
        cadence: `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868
          import GlowCardsV3 from 0x2515004a5408a7f0

          transaction(giftId: UInt64) {
              let receiverRef: &{FungibleToken.Receiver}
              let recipientAddress: Address

              prepare(signer: auth(BorrowValue, Storage, Capabilities) &Account) {
                  // Ensure the new Magic wallet has a FlowToken Vault setup
                  if signer.storage.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault) == nil {
                      signer.storage.save(<-FlowToken.createEmptyVault(vaultType: Type<@FlowToken.Vault>()), to: /storage/flowTokenVault)
                      let cap = signer.capabilities.storage.issue<&FlowToken.Vault>(/storage/flowTokenVault)
                      signer.capabilities.publish(cap, at: /public/flowTokenReceiver)
                  }

                  self.receiverRef = signer.capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                      ?? panic("Could not borrow receiver reference to the recipient's Vault")
                  self.recipientAddress = signer.address
              }

              execute {
                  let manager = getAccount(0x2515004a5408a7f0).capabilities.borrow<&GlowCardsV3.EscrowManager>(/public/GlowCardsV3EscrowManager)
                      ?? panic("Could not borrow EscrowManager")
                  
                  let funds <- manager.claimGift(id: giftId, recipient: self.recipientAddress)
                  self.receiverRef.deposit(from: <-funds)
              }
          }
        `,
        args: (arg: any, t: any) => [arg(giftId, t.UInt64)],
        // User proposes and authorizes the transaction, but our Server pays the gas fee
        proposer: AUTHORIZATION_FUNCTION as any,
        authorizations: [AUTHORIZATION_FUNCTION as any],
        payer: serverAuthorization as any,
        limit: 999,
      });

      // 5. Wait for the transaction to be sealed
      fcl.tx(txId).subscribe(async (res: any) => {
        if (res.status === 4 && res.errorMessage === "") {
          // Save to local history so it doesn't vanish from the 250-block window
          try {
            const flowAddress = await magic.flow.getAccount();
            const sealed = await fcl.tx(txId).onceSealed();
            // Find the deposit event targeting this user
            const depositEvent = sealed.events.find(
              (e: any) =>
                e.type.includes("TokensDeposited") && e.data.to === flowAddress,
            );
            if (depositEvent) {
              const localKey = `flow_txs_${flowAddress}`;
              const historyStr = localStorage.getItem(localKey);
              let history = historyStr ? JSON.parse(historyStr) : [];
              history.push({
                type: "deposit",
                amount: depositEvent.data.amount,
                txId: depositEvent.transactionId,
                timestamp: Date.now(),
              });
              localStorage.setItem(localKey, JSON.stringify(history));
            }
          } catch (e) {
            console.error("Local history save error", e);
          }

          setIsSuccess(true);
          setIsLoading(false);
        } else if (res.status === 4) {
          console.error("Claim Transaction Failed:", res.errorMessage);
          setIsLoading(false);
          toast.error("Claim failed. Please try again.");
        }
      });
    } catch (error) {
      console.error("Claim Error:", error);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-12 h-12 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white/90">
          Claim Successful
        </h1>
        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
          The smart contract has transferred 102.45 FLOW directly to your new
          secure wallet tied to{" "}
          <span className="text-white font-medium">{email}</span>.
        </p>
        <div className="flex flex-col gap-3 mt-8">
          <Button
            className="w-full h-12 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 font-medium rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)]"
            onClick={openWallet}
          >
            Open Magic Wallet
          </Button>
          <Button
            className="w-full h-12 bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-xl transition-all"
            onClick={() => (window.location.href = "/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!isUnboxed && !isSuccess) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-1000">
        <div
          onClick={() => setIsUnboxed(true)}
          className="cursor-pointer group flex flex-col items-center justify-center space-y-8"
        >
          <div className="w-40 h-40 rounded-[2.5rem] bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-all duration-700 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_120px_rgba(16,185,129,0.4)] animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Gift className="w-20 h-20 text-emerald-400 group-hover:rotate-12 transition-all duration-700 relative z-10" />
          </div>
          <p className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-white animate-pulse tracking-widest uppercase">
            Tap to Unbox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-12 animate-in zoom-in-50 fade-in slide-in-from-bottom-12 duration-1000">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden group/icon">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
          <Gift className="w-8 h-8 text-white/90 relative z-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white/90">
          You received a Gift!
        </h1>
        <p className="text-muted-foreground text-sm">
          {giftMessage ? (
            <span className="italic">"{giftMessage}"</span>
          ) : (
            "Someone sent you Flow tokens that have been growing in value."
          )}
        </p>
      </div>

      <Card className="glass-card border-none relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-4 relative z-10 text-center border-b border-white/5">
          <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Current Value
          </CardDescription>
          <div className="text-5xl font-mono font-medium mt-3 flex flex-row items-center justify-center gap-2">
            <span className="text-muted-foreground/50 text-3xl">₣</span>
            {balance === null ? (
              <Loader2 className="w-8 h-8 animate-spin text-white/40 my-2 mx-4" />
            ) : (
              balance
            )}
          </div>
          <p className="text-xs text-emerald-400 mt-2 font-mono tracking-wide flex items-center justify-center gap-1">
            {yieldEarned === null ? "..." : `+${liveYield.toFixed(6)}`}
            <span className="text-[10px] text-emerald-500/80 uppercase font-sans tracking-widest ml-1">
              Live Yield
            </span>
          </p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 relative z-10">
          <div className="space-y-3 text-center">
            <Label
              htmlFor="email"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Claim with Email
            </Label>
            <Input
              id="email"
              value={email}
              readOnly={true}
              placeholder="name@example.com"
              type="email"
              className="text-center bg-black/40 border-white/5 h-12 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all rounded-xl shadow-inner placeholder:text-white/20 select-none cursor-not-allowed opacity-80"
            />
          </div>
        </CardContent>
        <CardFooter className="relative z-10">
          <Button
            disabled={isLoading || !email || !email.includes("@")}
            onClick={handleClaim}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 text-zinc-600" />
                Claim Gift Securely
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          No wallet required. 100% Gasless.
        </p>
      </div>
    </div>
  );
}
