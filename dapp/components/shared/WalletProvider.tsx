"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as fcl from "@onflow/fcl";
import "../../flow/config"; // Import FCL config

interface WalletContextType {
  userAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to FCL user state
    fcl.currentUser.subscribe((user: any) => {
      if (user.loggedIn) {
        setUserAddress(user.addr);
      } else {
        setUserAddress(null);
      }
    });
  }, []);

  const connect = async () => {
    setIsLoading(true);
    try {
      await fcl.logIn();
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    fcl.unauthenticate();
  };

  return (
    <WalletContext.Provider
      value={{ userAddress, connect, disconnect, isLoading }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
