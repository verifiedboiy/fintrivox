import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SessionTimeoutWarning() {
  const { showTimeoutWarning, remainingTime, extendSession, logout } = useAuth();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showTimeoutWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Session Timeout Warning</DialogTitle>
              <DialogDescription>
                Your session is about to expire due to inactivity.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
            <Clock className="w-8 h-8 text-amber-500" />
            {formatTime(remainingTime)}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Time remaining before automatic logout
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={logout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout Now
          </Button>
          <Button 
            onClick={extendSession}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Stay Logged In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
