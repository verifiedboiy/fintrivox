import { useState, useEffect } from 'react';
import { Shield, Lock, Key, Smartphone, Eye, EyeOff, RefreshCw, CheckCircle, Smartphone as DeviceIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/api';

export default function Security() {
  const { user, refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled);
  const [showWithdrawalKey, setShowWithdrawalKey] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await userApi.getSessions();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      await userApi.toggle2FA(enabled);
      setTwoFAEnabled(enabled);
      await refreshUser();
      alert(`Two-Factor Authentication has been ${enabled ? 'enabled' : 'disabled'}.`);
    } catch (error) {
      alert('Failed to update 2FA status.');
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await userApi.updatePassword({ currentPassword, newPassword });
      alert('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshKey = async () => {
    if (!confirm('Are you sure you want to regenerate your withdrawal key? This will void your old key.')) return;

    try {
      await userApi.refreshWithdrawalKey();
      await refreshUser();
      alert('Withdrawal key regenerated successfully.');
    } catch (error) {
      alert('Failed to refresh withdrawal key.');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session? The device will be logged out.')) return;

    try {
      await userApi.terminateSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (error) {
      alert('Failed to terminate session.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security</h1>
        <p className="text-gray-500">Manage your account security settings</p>
      </div>

      {/* 2FA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-gray-500">
                {twoFAEnabled ? '2FA is enabled' : 'Add an extra layer of security'}
              </p>
            </div>
            <Switch checked={twoFAEnabled} onCheckedChange={handleToggle2FA} />
          </div>
          {twoFAEnabled && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-700">2FA is active and protecting your account</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleUpdatePassword}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Withdrawal Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" />
            Withdrawal Key
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <p className="text-sm text-gray-500 max-w-md">
              This key is required for all withdrawals. If you don't have one, you can purchase it by contacting support.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="text-amber-600 border-amber-200 hover:bg-amber-50"
              onClick={() => {
                const subject = encodeURIComponent(`Withdrawal Key Request - ${user?.firstName} ${user?.lastName}`);
                const body = encodeURIComponent(`Hello,\n\nI would like to purchase a withdrawal key for my account (${user?.email}).\n\nPlease provide payment details.`);
                window.location.href = `mailto:requ.est@mail.com?subject=${subject}&body=${body}`;
              }}
            >
              Buy Key
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              value={user?.withdrawalKey || 'NO KEY SET'}
              type={showWithdrawalKey ? 'text' : 'password'}
              readOnly
              className="font-mono"
            />
            <Button variant="outline" onClick={() => setShowWithdrawalKey(!showWithdrawalKey)}>
              {showWithdrawalKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={handleRefreshKey}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border">
                    <DeviceIcon className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{session.device || 'Unknown Device'}</p>
                    <p className="text-sm text-gray-500">
                      Started: {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {idx === 0 ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Current</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-center text-gray-500 py-4">No active sessions found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
