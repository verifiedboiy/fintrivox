import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/services/api';

export default function Portfolio() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await userApi.getInvestments();
        setInvestments(data.investments.map((inv: any) => ({
          ...inv,
          planName: inv.plan?.name || 'Investment',
          dailyProfitRate: inv.plan?.dailyProfitRate || 0,
          startDate: new Date(inv.startDate),
          endDate: inv.endDate ? new Date(inv.endDate) : null,
        })));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  // Live profit counter for active investments
  useEffect(() => {
    const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
    if (activeInvestments.length === 0) return;

    const interval = setInterval(() => {
      setInvestments(prev => prev.map(inv => {
        if (inv.status !== 'ACTIVE') return inv;
        // Daily rate is inv.dailyProfitRate %, e.g., 0.5
        // Per second rate = (inv.dailyProfitRate / 100) / 86400
        const perSecondRate = (inv.dailyProfitRate / 100) / 86400;
        const incrementalProfit = inv.amount * perSecondRate;
        return {
          ...inv,
          earnedProfit: (inv.earnedProfit || 0) + incrementalProfit
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [investments.length]);

  if (!user) return null;

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  const active = investments.filter(i => i.status === 'ACTIVE');
  const completed = investments.filter(i => i.status === 'COMPLETED');
  const totalInvested = investments.reduce((s, i) => s + i.amount, 0);
  const totalProfit = investments.reduce((s, i) => s + (i.earnedProfit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-500">Your investment portfolio overview</p>
        </div>
        <Link to="/dashboard/invest"><Button className="bg-blue-600 hover:bg-blue-700"><TrendingUp className="w-4 h-4 mr-2" /> New Investment</Button></Link>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Invested</p>
          <p className="text-2xl font-bold">${totalInvested.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Total Profit</p>
          <p className="text-2xl font-bold text-green-600">+${totalProfit.toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-blue-600">{active.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">{completed.length}</p>
        </CardContent></Card>
      </div>

      {active.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Active Investments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {active.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inv.planName}</p>
                    <p className="text-sm text-gray-500">${inv.amount.toLocaleString()} invested</p>
                    <p className="text-xs text-gray-400">Started {inv.startDate.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">+${(inv.earnedProfit || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{inv.dailyProfitRate}% daily</p>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {completed.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Completed Investments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completed.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inv.planName}</p>
                    <p className="text-sm text-gray-500">${inv.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-medium">+${(inv.earnedProfit || 0).toLocaleString()}</p>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {investments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No investments yet</p>
            <p className="text-gray-500 mb-4">Start investing to grow your portfolio</p>
            <Link to="/dashboard/invest"><Button className="bg-blue-600 hover:bg-blue-700">Explore Plans</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
