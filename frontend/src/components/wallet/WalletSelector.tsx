// components/wallet/WalletSelector.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Wallet, ExternalLink } from "lucide-react";

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (walletType: string) => void;
}

const wallets = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Most popular Ethereum wallet",
    icon: "🦊",
    url: "https://metamask.io/download/"
  },
  {
    id: "trustwallet",
    name: "Trust Wallet",
    description: "Binance's official wallet",
    icon: "🔷",
    url: "https://trustwallet.com/download"
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Coinbase's Web3 wallet",
    icon: "📱",
    url: "https://www.coinbase.com/wallet/downloads"
  },
  {
    id: "binance",
    name: "Binance Web3 Wallet",
    description: "Built into Binance app",
    icon: "⚡",
    url: "https://www.binance.com/en/web3wallet"
  },
  {
    id: "okx",
    name: "OKX Wallet",
    description: "Multi-chain Web3 wallet",
    icon: "🔶",
    url: "https://www.okx.com/web3"
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Solana & Ethereum wallet",
    icon: "👻",
    url: "https://phantom.app/download"
  }
];

export const WalletSelector = ({ isOpen, onClose, onWalletSelect }: WalletSelectorProps) => {
  const handleWalletClick = (walletId: string) => {
    onWalletSelect(walletId);
    onClose();
  };

  const handleInstallClick = (url: string, walletName: string) => {
    window.open(url, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect to the application
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wallet.icon}</span>
                <div>
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-sm text-muted-foreground">{wallet.description}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleInstallClick(wallet.url, wallet.name)}
                >
                  Install
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleWalletClick(wallet.id)}
                >
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center">
          By connecting, I accept the Terms of Service
        </div>
      </DialogContent>
    </Dialog>
  );
};
