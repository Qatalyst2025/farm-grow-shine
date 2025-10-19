import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, Sprout, DollarSign, ShoppingCart, User } from "lucide-react";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: "/farmer", icon: Home, labelKey: "nav.home" },
    { path: "/farmer/crops/1", icon: Sprout, labelKey: "nav.myCrops" },
    { path: "/farmer/apply-loan", icon: DollarSign, labelKey: "nav.loans" },
    { path: "/marketplace", icon: ShoppingCart, labelKey: "nav.market" },
    { path: "/buyer/profile", icon: User, labelKey: "nav.profile" }
  ];

  const isActive = (path: string) => {
    if (path === "/farmer") {
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
