import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { useToast } from '@/hooks/use-toast';

interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial network status
    Network.getStatus().then(status => {
      setIsOnline(status.connected);
    });

    // Listen for network changes
    let networkListener: any;
    Network.addListener('networkStatusChange', status => {
      const wasOffline = !isOnline;
      setIsOnline(status.connected);
      
      if (status.connected && wasOffline) {
        toast({
          title: "Back online",
          description: "Syncing your pending actions...",
        });
        syncPendingActions();
      } else if (!status.connected) {
        toast({
          title: "You're offline",
          description: "Actions will be saved and synced when you reconnect.",
          variant: "destructive"
        });
      }
    }).then(listener => {
      networkListener = listener;
    });

    // Load pending actions from storage
    const loadPendingActions = () => {
      const stored = localStorage.getItem('pendingActions');
      if (stored) {
        setPendingActions(JSON.parse(stored));
      }
    };

    loadPendingActions();

    return () => {
      if (networkListener) {
        networkListener.remove();
      }
    };
  }, []);

  const addPendingAction = (type: string, data: any) => {
    const action: PendingAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now()
    };

    const updated = [...pendingActions, action];
    setPendingActions(updated);
    localStorage.setItem('pendingActions', JSON.stringify(updated));

    if (!isOnline) {
      toast({
        title: "Action queued",
        description: "This will be synced when you're back online",
      });
    }
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    
    try {
      // Process each pending action
      for (const action of pendingActions) {
        // In a real app, you would send these to your backend
        console.log('Syncing action:', action);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      }

      // Clear pending actions after successful sync
      setPendingActions([]);
      localStorage.removeItem('pendingActions');
      
      toast({
        title: "Sync complete",
        description: `${pendingActions.length} actions synced successfully`,
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync failed",
        description: "Will retry when connection improves",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions
  };
};
