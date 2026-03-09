"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Link from "next/link";

export function WalletNavButton() {
  const pathname = usePathname();

  if (pathname === "/wallet") {
    return null;
  }

  return (
    <Link href="/wallet">
      <Button
        variant="outline"
        className="hidden sm:flex border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors rounded-full px-5 h-9 text-xs font-semibold tracking-wide"
      >
        <Wallet className="w-3.5 h-3.5 mr-2" />
        Access My Wallet
      </Button>
    </Link>
  );
}
