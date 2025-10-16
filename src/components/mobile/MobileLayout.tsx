import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { WifiOff, RefreshCw } from "lucide-react";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  title?: string;
}

export const MobileLayout = ({ 
  children, 
  showBottomNav = true,
  showHeader = true,
  title
}: MobileLayoutProps) => {
  const { t } = useTranslation();
  const { isOnline, pendingActions, isSyncing } = useOfflineSync();

  return (
    <div className="min-h-screen bg-background pb-safe-area">
      {/* Skip to main content link for keyboard navigation */}
      <a 
        href="#main-content" 
        className="skip-to-main"
      >
        Skip to main content
      </a>

      {showHeader && <MobileHeader title={title} />}
      
      {/* Offline Indicator */}
      {!isOnline && (
        <div 
          className="sticky top-0 z-40 bg-warning/10 border-b border-warning/20 px-4 py-2"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-warning" aria-hidden="true" />
              <span className="text-sm font-medium text-warning">
                {t('offline.youAreOffline')}
              </span>
            </div>
            {pendingActions.length > 0 && (
              <Badge 
                variant="outline" 
                className="border-warning text-warning"
                aria-label={`${pendingActions.length} ${t('offline.pending')}`}
              >
                {pendingActions.length} {t('offline.pending')}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sync Indicator */}
      {isSyncing && (
        <div 
          className="sticky top-0 z-40 bg-info/10 border-b border-info/20 px-4 py-2"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-info animate-spin" aria-hidden="true" />
            <span className="text-sm font-medium text-info">
              {t('offline.syncingData')}
            </span>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main 
        id="main-content"
        className={`${showBottomNav ? 'pb-20' : 'pb-4'}`}
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};
