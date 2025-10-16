import { ArrowLeft, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showSearch?: boolean;
  notificationCount?: number;
  showLogo?: boolean;
}

export const MobileHeader = ({ 
  title = "AgriLinka",
  showBack = false,
  showNotifications = true,
  showSearch = false,
  notificationCount = 0,
  showLogo = false
}: MobileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border safe-area-inset-top">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="touch-manipulation"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {showLogo ? (
            <Logo size="sm" showText={false} />
          ) : (
            <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="touch-manipulation relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
