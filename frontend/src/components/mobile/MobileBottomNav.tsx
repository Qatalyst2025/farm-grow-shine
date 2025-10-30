import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Sprout, DollarSign, ShoppingCart, User, MessageCircle, Users } from "lucide-react";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  // Get user role from localStorage
  const userRole = localStorage.getItem("user_role");

  // Farmer navigation items
  const farmerNavItems = [
    { path: "/farmer", icon: Home, labelKey: "nav.home" },
    { path: "/farmer/crops", icon: Sprout, labelKey: "nav.myCrops" },
    { path: "/farmer/apply-loan", icon: DollarSign, labelKey: "nav.loans" },
    { path: "/community", icon: Users, labelKey: "nav.community" },
    { path: "/messages", icon: MessageCircle, labelKey: "nav.messages" }
  ];

  // Buyer navigation items
  const buyerNavItems = [
    { path: "/marketplace", icon: Home, labelKey: "nav.marketplace" },
    { path: "/community", icon: Users, labelKey: "nav.community" },
    { path: "/negotiations", icon: DollarSign, labelKey: "nav.negotiations" },
    { path: "/messages", icon: MessageCircle, labelKey: "nav.messages" },
    { path: "/buyer/profile", icon: User, labelKey: "nav.profile" }
  ];

  // Select navigation items based on user role
  const navItems = userRole === "FARMER" ? farmerNavItems : buyerNavItems;

  const isActive = (path: string) => {
    // Special case for home routes
    if (path === "/farmer" || path === "/marketplace") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const label = t(item.labelKey);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 touch-manipulation active:scale-95 transition-all ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'text-primary' : ''}`} aria-hidden="true" />
              <span className={`text-xs font-medium truncate ${active ? 'text-primary' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
