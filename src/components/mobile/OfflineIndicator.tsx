import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md bg-destructive/10 border-destructive/20">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-sm">
        You're offline. Some features may be limited.
      </AlertDescription>
    </Alert>
  );
}