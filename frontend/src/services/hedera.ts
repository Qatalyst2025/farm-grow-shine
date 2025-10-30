import { ethers } from "ethers";

let provider: ethers.BrowserProvider | null = null;
let signer: ethers.JsonRpcSigner | null = null;

// Simple wallet detection
export function detectAvailableWallets() {
  if (typeof window === 'undefined') return [];

  const availableWallets = [];
  
  if (window.ethereum?.isMetaMask) availableWallets.push('metamask');
  if (window.ethereum?.isTrust) availableWallets.push('trustwallet');
  if (window.ethereum?.isCoinbaseWallet) availableWallets.push('coinbase');

  console.log('Available wallets:', availableWallets);
  return availableWallets;
}

// Simple direct connection - just like other dApps
export async function connectWallet(walletType: string) {
  try {
    console.log(`🔗 Connecting to ${walletType}...`);

    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("Please install MetaMask to connect your wallet.");
    }

    // Request accounts - this will trigger MetaMask popup
    console.log('📝 Requesting accounts from MetaMask...');
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    console.log('✅ Accounts received:', accounts);

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please make sure your wallet has accounts.");
    }

    const address = accounts[0];
    console.log('👤 Connected address:', address);
    
    // Create ethers provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    console.log(`🎉 Successfully connected to ${walletType}: ${address}`);

    return { 
      address, 
      signer, 
      provider,
      walletType 
    };

  } catch (error: any) {
    console.error('❌ Wallet connection failed:', error);
    
    // Handle common MetaMask errors
    if (error.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection in MetaMask.");
    } else if (error.code === -32002) {
      throw new Error("Connection request already pending. Please check MetaMask.");
    } else {
      throw new Error(`Connection failed: ${error.message}`);
    }
  }
}

export function getSigner() {
  if (!signer) throw new Error("Wallet not connected!");
  return signer;
}

export function getProvider() {
  if (!provider) throw new Error("Provider not available!");
  return provider;
}

export function isConnected() {
  return !!(signer && provider);
}

// Add global type for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
