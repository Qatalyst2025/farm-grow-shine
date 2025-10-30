"use client";
import { createContext, useContext, useState } from "react";
import { connectWallet } from "@/services/hedera";

interface WalletContextProps {
  address: string | null;
  walletType: string | null;
  isConnecting: boolean;
  connect: (walletType: string) => Promise<void>;
}

const WalletContext = createContext<WalletContextProps>({
  address: null,
  walletType: null,
  isConnecting: false,
  connect: async () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async (walletType: string) => {
    try {
      console.log("🔄 WalletContext: Starting connection to", walletType);
      setIsConnecting(true);
      
      const result = await connectWallet(walletType);
      console.log("✅ WalletContext: Connection successful", result);
      
      setWalletType(walletType);
      setAddress(result.address);
      
      console.log("✅ WalletContext: State updated", { 
        address: result.address, 
        walletType 
      });
    } catch (err: any) {
      console.error("❌ WalletContext: Connection failed", err);
      throw err; // Re-throw to handle in component
    } finally {
      setIsConnecting(false);
      console.log("🔄 WalletContext: isConnecting set to false");
    }
  };

  return (
    <WalletContext.Provider value={{ address, walletType, isConnecting, connect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
