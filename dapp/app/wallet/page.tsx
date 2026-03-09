"use client";

import { useState } from "react";
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
import {
  Wallet,
  Loader2,
  Sparkles,
  RefreshCcw,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { Magic } from "magic-sdk";
import Link from "next/link";
import { FlowExtension } from "@magic-ext/flow";
import * as fcl from "@onflow/fcl";
import { serverAuthorization } from "@/flow/relay";
import "@/flow/config";
import { toast } from "sonner";

export default function WalletPortal() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [magicInstance, setMagicInstance] = useState<Magic<any> | null>(null);

  // Send State
  const [isSending, setIsSending] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [sendAddress, setSendAddress] = useState("");

  // History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetchingTx, setIsFetchingTx] = useState(false);

  const fetchBalance = async (magicAddr: string) => {
    try {
      const balanceCode = `
        import FlowToken from 0x7e60df042a9c0868
        import FungibleToken from 0x9a0766d93b6608b7

        access(all) fun main(address: Address): UFix64 {
            let vaultRef = getAccount(address).capabilities.borrow<&FlowToken.Vault>(/public/flowTokenBalance)
                ?? panic("Could not borrow Balance reference to the Vault")

            return vaultRef.balance
        }
      `;
      const bal = await fcl.query({
        cadence: balanceCode,
        args: (arg: any, t: any) => [arg(magicAddr, t.Address)],
      });
      setBalance(parseFloat(bal).toFixed(2));
    } catch (err) {
      console.error("Balance fetch error", err);
      // In case the vault isn't fully initialized or empty
      setBalance("0.00");
    }
  };

  const fetchTransactions = async (magicAddr: string) => {
    setIsFetchingTx(true);
    try {
      // Flow public nodes currently limit event scans to ~250 block ranges
      const blockBuilder = await fcl.getBlock(true);
      const blockResponse = await fcl.send([blockBuilder as any]);
      const block: any = await fcl.decode(blockResponse);
      const endHeight = block.height;
      const startHeight = endHeight - 240;

      // Scan for deposits
      const depositsBuilder = await fcl.getEventsAtBlockHeightRange(
        "A.7e60df042a9c0868.FlowToken.TokensDeposited",
        startHeight,
        endHeight,
      );
      const depositsResponse = await fcl.send([depositsBuilder as any]);
      const deposits: any = await fcl.decode(depositsResponse);

      // Scan for withdrawals
      const withdrawalsBuilder = await fcl.getEventsAtBlockHeightRange(
        "A.7e60df042a9c0868.FlowToken.TokensWithdrawn",
        startHeight,
        endHeight,
      );
      const withdrawalsResponse = await fcl.send([withdrawalsBuilder as any]);
      const withdrawals: any = await fcl.decode(withdrawalsResponse);

      // Filter and format
      let history: any[] = [];
      deposits.forEach((evt: any) => {
        if (evt.data.to === magicAddr) {
          history.push({
            type: "deposit",
            amount: evt.data.amount,
            txId: evt.transactionId,
            timestamp: Date.now(),
          });
        }
      });
      withdrawals.forEach((evt: any) => {
        if (evt.data.from === magicAddr) {
          history.push({
            type: "withdraw",
            amount: evt.data.amount,
            txId: evt.transactionId,
            timestamp: Date.now(),
          });
        }
      });

      // Merge with localStorage cached history to prevent vanishing
      const localKey = `flow_txs_${magicAddr}`;
      let localTxs: any[] = [];
      try {
        const stored = localStorage.getItem(localKey);
        if (stored) localTxs = JSON.parse(stored);
      } catch (e) {}

      history = [...history, ...localTxs];

      // Simple dedup based on txId and type
      history = history.filter(
        (v, i, a) =>
          a.findIndex((t) => t.txId === v.txId && t.type === v.type) === i,
      );

      // Sort newest first
      history.sort((a, b) => b.timestamp - a.timestamp);

      // Save back to local storage
      try {
        localStorage.setItem(localKey, JSON.stringify(history));
      } catch (e) {}

      setTransactions(history);
    } catch (err) {
      console.error("History fetch error", err);
    } finally {
      setIsFetchingTx(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
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

      // Check if user is already logged securely
      const isLoggedIn = await magic.user.isLoggedIn();
      if (!isLoggedIn) {
        // Authenticate user via Email Magic Link
        await magic.auth.loginWithMagicLink({ email });
      }
      setMagicInstance(magic as any);

      const flowAddress = await magic.flow.getAccount();
      console.log("Magic Flow Address:", flowAddress);

      if (flowAddress) {
        setAddress(flowAddress);
        await Promise.all([
          fetchBalance(flowAddress),
          fetchTransactions(flowAddress),
        ]);
      } else {
        throw new Error(
          "Could not extract Flow public address from Magic session.",
        );
      }
    } catch (error: any) {
      console.error("Wallet Access Error:", error);
      toast.error(
        error?.message || "Failed to access wallet. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openMagicUI = async () => {
    if (magicInstance) {
      await magicInstance.wallet.showUI().catch(console.error);
    }
  };

  const handleSend = async () => {
    if (!magicInstance) return;
    setIsSending(true);

    try {
      const AUTHORIZATION_FUNCTION = magicInstance.flow.authorization;
      const amountFormat = parseFloat(sendAmount).toFixed(8);

      const txId = await fcl.mutate({
        cadence: `
          import FungibleToken from 0x9a0766d93b6608b7
          import FlowToken from 0x7e60df042a9c0868

          transaction(amount: UFix64, to: Address) {
              let sentVault: @{FungibleToken.Vault}
              prepare(signer: auth(BorrowValue) &Account) {
                  let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(from: /storage/flowTokenVault)
                      ?? panic("Your account does not have a FlowToken Vault initialized.")

                  self.sentVault <- vaultRef.withdraw(amount: amount)
              }
              execute {
                  let receiverRef = getAccount(to).capabilities.borrow<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
                      ?? panic("The recipient's Flow address is not set up to receive FLOW. Please check the address.")

                  receiverRef.deposit(from: <-self.sentVault)
              }
          }
        `,
        args: (arg: any, t: any) => [
          arg(amountFormat, t.UFix64),
          arg(sendAddress, t.Address),
        ],
        proposer: AUTHORIZATION_FUNCTION as any,
        authorizations: [AUTHORIZATION_FUNCTION as any],
        payer: serverAuthorization as any, // Gasless!
        limit: 999,
      });

      fcl.tx(txId).subscribe(async (res: any) => {
        if (res.status === 4 && res.errorMessage === "") {
          toast.success(
            `Successfully sent ${amountFormat} FLOW to ${sendAddress}!`,
          );
          setIsSending(false);
          setSendAmount("");
          setSendAddress("");
          if (address) {
            await fetchBalance(address);
            await fetchTransactions(address);
          }
        } else if (res.status === 4) {
          console.error("Send TX Failed:", res.errorMessage);

          let cleanError = res.errorMessage;
          const match = res.errorMessage.match(/panic: (.*?)(?:\n|$)/);
          if (match && match[1]) {
            cleanError = match[1];
          }

          toast.error("Transfer Failed: " + cleanError);
          setIsSending(false);
        }
      });
    } catch (e: any) {
      console.error(e);
      let cleanError = e.message;
      const match = e.message?.match(/panic: (.*?)(?:\n|$)/);
      if (match && match[1]) {
        cleanError = match[1];
      }
      toast.error("Error initiating send: " + cleanError);
      setIsSending(false);
    }
  };

  if (address) {
    return (
      <div className="w-full max-w-md mx-auto space-y-8 animate-in zoom-in-95 duration-500 text-center">
        <div className="flex justify-start -mb-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-white transition-colors font-semibold"
          >
            <ChevronLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-white/90">
            Your Wallet
          </h1>
          <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">
            Connected as <span className="text-emerald-400">{email}</span>
          </p>
        </div>

        <Card className="glass-card border-none relative overflow-hidden group p-8 bg-black/40">
          <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
            On-Chain Balance (Testnet)
          </CardDescription>
          <div className="text-6xl font-mono font-medium mt-3 flex items-center justify-center gap-2">
            <span className="text-muted-foreground/50 text-4xl">₣</span>
            {balance ?? "..."}
          </div>
          <p className="text-[10px] text-muted-foreground/60 mt-4 break-all">
            Address: {address}
          </p>
        </Card>

        {/* Send Tokens Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent pointer-events-none" />
          <h3 className="font-semibold text-white/90 text-sm tracking-wide flex items-center gap-2 relative z-10">
            <ArrowRight className="w-4 h-4 text-indigo-400" /> Transfer FLOW
          </h3>

          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Recipient Address
              </Label>
              <Input
                placeholder="0x..."
                value={sendAddress}
                onChange={(e) => setSendAddress(e.target.value)}
                className="bg-black/40 border-white/10 h-11 text-sm font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Amount (FLOW)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
                  ₣
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-black/40 border-white/10 h-11 text-sm pl-8 font-mono"
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase"
                  onClick={() =>
                    balance &&
                    setSendAmount((parseFloat(balance) - 0.0001).toString())
                  }
                >
                  Max
                </button>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={
                isSending ||
                !sendAddress ||
                !sendAmount ||
                parseFloat(sendAmount) <= 0
              }
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(99,102,241,0.2)] h-11"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                </>
              ) : (
                "Send Tokens Gaslessly"
              )}
            </Button>
          </div>
        </div>

        {/* Transaction History Panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white/90 text-sm tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Recent Activity
            </h3>
            {isFetchingTx && (
              <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
            )}
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground/60 py-4">
                No recent transactions found on the network.
              </p>
            ) : (
              transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                    >
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/90 capitalize">
                        {tx.type}
                      </p>
                      <a
                        href={`https://testnet.flowdiver.io/tx/${tx.txId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-muted-foreground flex items-center gap-1 hover:text-emerald-400 transition-colors"
                      >
                        View TX <ExternalLink className="w-2 h-2" />
                      </a>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-mono font-medium ${tx.type === "deposit" ? "text-emerald-400" : "text-white/90"}`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}
                      {parseFloat(tx.amount).toFixed(2)} ₣
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-8">
          <Button
            className="w-full h-12 bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10 font-medium rounded-xl transition-all"
            onClick={openMagicUI}
          >
            Access Magic Settings
          </Button>
          <Button
            className="w-full h-12 text-muted-foreground hover:text-white hover:bg-white/5 transition-all rounded-xl text-sm"
            variant="ghost"
            onClick={async () => {
              if (address) {
                await Promise.all([
                  fetchBalance(address),
                  fetchTransactions(address),
                ]);
              }
            }}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh Balance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-2xl relative overflow-hidden group/icon">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
          <Sparkles className="w-8 h-8 text-white/90 relative z-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white/90">
          Recipient Portal
        </h1>
        <p className="text-muted-foreground text-sm">
          Access your secure GlowCards wallet to manage your gifts and yield.
        </p>
      </div>

      <Card className="glass-card border-none relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="pb-4 relative z-10 text-center border-b border-white/5">
          <CardDescription className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Secure Login
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 relative z-10">
          <div className="space-y-3 text-center">
            <Label
              htmlFor="email"
              className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold"
            >
              Email Address
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              type="email"
              className="text-center bg-black/40 border-white/5 h-12 text-sm focus-visible:ring-1 focus-visible:ring-white/20 transition-all rounded-xl shadow-inner placeholder:text-white/20"
            />
          </div>
        </CardContent>
        <CardFooter className="relative z-10 flex flex-col gap-3">
          <Button
            disabled={isLoading || !email || !email.includes("@")}
            onClick={handleLogin}
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-all rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 text-zinc-600" />
                Access My Wallet
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="w-full h-12 text-muted-foreground hover:text-white hover:bg-white/5 transition-all rounded-xl text-sm"
          >
            Return to Homepage
          </Button>
        </CardFooter>
      </Card>

      <div className="text-center">
        <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          Secured by Magic.link & Flow
        </p>
      </div>
    </div>
  );
}
