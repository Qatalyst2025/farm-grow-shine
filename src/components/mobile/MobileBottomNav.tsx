import { Link, useLocation } from "react-router-dom";
import { Home, Sprout, DollarSign, ShoppingCart, User } from "lucide-react";

export const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/farmer", icon: Home, label: "Home" },
    { path: "/farmer/crops/1", icon: Sprout, label: "My Crops" },
    { path: "/farmer/apply-loan", icon: DollarSign, label: "Loans" },
    { path: "/marketplace", icon: ShoppingCart, label: "Market" },
    { path: "/buyer/profile", icon: User, label: "Profile" }
  ];

  const isActive = (path: string) => {
    if (path === "/farmer") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 touch-manipulation active:scale-95 transition-all ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${active ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium truncate ${active ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
