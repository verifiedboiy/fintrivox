import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Gift, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/api';

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  useEffect(() => {
    userApi.getReferrals().then(({ data }) => {
      setReferralData(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  const totalReferrals = referralData?.referrals?.length || 0;
  const activeReferrals = referralData?.referrals?.filter((r: any) => r.status === 'ACTIVE').length || 0;
  const bonusEarned = referralData?.totalBonus || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
        <p className="text-gray-500">Invite friends and earn rewards</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Referrals</p>
          <p className="text-2xl font-bold">{totalReferrals}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Active Referrals</p>
          <p className="text-2xl font-bold text-green-600">{activeReferrals}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Bonus Earned</p>
          <p className="text-2xl font-bold text-amber-600">${bonusEarned}</p>
        </CardContent></Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your Referral Link</h2>
          <p className="text-blue-100 mb-2">Your referral code: <strong>{user?.referralCode}</strong></p>
          <p className="text-blue-100 mb-6">Share this link with friends and earn 5% of their investments</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input value={referralLink} readOnly className="bg-white/10 border-white/20 text-white" />
            <Button onClick={handleCopy} className="bg-white text-blue-600 hover:bg-gray-100">
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {referralData?.referrals?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Your Referrals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.referrals.map((ref: any) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{ref.firstName} {ref.lastName}</p>
                      <p className="text-sm text-gray-500">Joined {new Date(ref.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Send your unique referral link to friends and family' },
              { step: 2, title: 'They Sign Up', desc: 'Your friends create an account using your link' },
              { step: 3, title: 'You Earn Rewards', desc: 'Earn 5% bonus on their first investment' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">{item.step}</div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
