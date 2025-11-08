import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { BellIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { useWallet } from "@/contexts/WalletContext";
import { detectAvailableWallets } from "@/services/hedera";
import { useToast } from "@/hooks/use-toast";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const getFarmerNavItems = () => [
  { path: "/farmer", labelKey: "Home" },
  { path: "/farmer/crops", labelKey: "My Crops" },
  { path: "/farmer/apply-loan", labelKey: "Loans" },
  { path: "/community", labelKey: "Community" },
  { path: "/messages", labelKey: "Messages" },
];

const getBuyerNavItems = () => [
  { path: "/marketplace", labelKey: "Marketplace" },
  { path: "/community", labelKey: "Community" },
  { path: "/negotiations", labelKey: "Negotiations" },
  { path: "/messages", labelKey: "Messages" },
  { path: "/buyer/profile", labelKey: "Profile" },
];

interface MobileHeaderProps {
  userRole?: string;
  userName?: string;
  userImage?: string;
  farmerProfile?: any;
  notificationCount?: number;
}

export const MobileHeader = ({
  userRole = "FARMER",
  userName = "User",
  userImage,
  farmerProfile,
  notificationCount = 0,
}: MobileHeaderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { address, connect, isConnecting } = useWallet();
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!(window as any).ethereum;

  const navigation =
    userRole === "FARMER" ? getFarmerNavItems() : getBuyerNavItems();

  useEffect(() => {
    setAvailableWallets(detectAvailableWallets());
  }, []);

  const handleInstallMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  const handleConnectWallet = async (walletType?: string) => {
    try {
      if (!walletType && availableWallets.length === 1) walletType = availableWallets[0];
      else if (!walletType) return setShowWalletSelector(true);
      await connect(walletType);
      toast({ title: "Wallet Connected" });
      setShowWalletSelector(false);
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = () => {
    // Clear all auth/session data
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_role");

    // Optionally clear other sensitive localStorage items
    // localStorage.removeItem("crops");

    // Toast and redirect
    toast({ title: "Logged out", description: "You have been signed out successfully", variant: "destructive" });
    navigate("/login");
  };

  return (
    <Disclosure as="nav" className="bg-background border-b border-border sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative flex h-16 items-center justify-between">
              {/* LEFT: Logo */}
              <div className="flex items-center flex-1">
                <Logo size="lg" />
              </div>

              {/* RIGHT: Desktop items */}
              <div className="hidden sm:flex items-center gap-3">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={classNames(
                      location.pathname === item.path
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {t(item.labelKey)}
                  </Link>
                ))}

                <button className="p-1 text-muted-foreground hover:text-foreground relative">
                  <BellIcon className="h-6 w-6" />
                  {notificationCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Badge>
                  )}
                </button>

                {!address ? (
                  !isMetaMaskInstalled ? (
                    <Button onClick={handleInstallMetaMask} variant="secondary" size="sm">
                      <Wallet className="h-4 w-4 mr-2" /> Install MetaMask
                    </Button>
                  ) : (
                    <div className="relative">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleConnectWallet(); }}
                        variant="secondary"
                        size="sm"
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : <><Wallet className="h-4 w-4 mr-2" /> Connect Wallet</>}
                      </Button>
                      {showWalletSelector && availableWallets.length > 0 && (
                        <Card className="absolute top-full right-0 mt-2 w-48 z-50 p-2">
                          {availableWallets.map((wallet) => (
                            <Button key={wallet} variant="ghost" size="sm" className="w-full justify-start"
                              onClick={() => handleConnectWallet(wallet)}>
                              {wallet}
                            </Button>
                          ))}
                        </Card>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg border border-green-600/40">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                  </div>
                )}

                {farmerProfile?.hedera_account_id && (
                  <div className="text-xs px-2 py-1 bg-white/10 rounded-md truncate max-w-[150px]">
                    Hedera: {farmerProfile.hedera_account_id}
                  </div>
                )}

                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>

              {/* Mobile Hamburger */}
              <div className="sm:hidden flex items-center">
                <Disclosure.Button className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Panel */}
          <Disclosure.Panel className="sm:hidden border-t border-border">
            <div className="space-y-1 px-2 py-3">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={classNames(
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              ))}

              <button className="p-1 text-muted-foreground hover:text-foreground relative w-full flex items-center gap-2 animate-pulse">
                <BellIcon className="h-6 w-6" />
                {notificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Badge>
                )}
                Notifications
              </button>

              {!address ? (
                !isMetaMaskInstalled ? (
                  <Button onClick={handleInstallMetaMask} variant="secondary" size="sm" className="w-full">
                    <Wallet className="h-4 w-4 mr-2" /> Install MetaMask
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleConnectWallet()}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    disabled={isConnecting}
                  >
                    {isConnecting ? "Connecting..." : <><Wallet className="h-4 w-4 mr-2" /> Connect Wallet</>}
                  </Button>
                )
              ) : (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-800 px-3 py-2 rounded-lg border border-green-600/40">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-mono">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </div>
              )}

              {farmerProfile?.hedera_account_id && (
                <div className="text-xs px-2 py-1 bg-white/10 rounded-md truncate max-w-[150px]">
                  Hedera: {farmerProfile.hedera_account_id}
                </div>
              )}

              <Button onClick={handleLogout} variant="ghost" size="sm" className="w-full justify-start mt-2">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
