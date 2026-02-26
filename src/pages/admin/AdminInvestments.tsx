import { useState, useEffect } from 'react';
import { Search, TrendingUp, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/services/api';

export default function AdminInvestments() {
  const [activeTab, setActiveTab] = useState('plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, statsRes] = await Promise.all([
          adminApi.getPlans(),
          adminApi.getStats(),
        ]);
        setPlans(plansRes.data.plans);
        setStats(statsRes.data.stats);

        // Fetch all users to get investment data
        const usersRes = await adminApi.getUsers({ limit: 100 });
        const allInvestments: any[] = [];
        for (const u of usersRes.data.users) {
          try {
            const userRes = await adminApi.getUser(u.id);
            if (userRes.data.user?.investments) {
              userRes.data.user.investments.forEach((inv: any) => {
                allInvestments.push({ ...inv, userName: `${u.firstName} ${u.lastName}` });
              });
            }
          } catch { }
        }
        setInvestments(allInvestments);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredPlans = plans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredInvestments = investments.filter(inv =>
    inv.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low': return <Badge className="bg-green-100 text-green-700">Low</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 'high': return <Badge className="bg-red-100 text-red-700">High</Badge>;
      default: return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Investment Management</h1><p className="text-gray-500">Manage plans and user investments</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Plans</p><p className="text-2xl font-bold">{plans.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active Investments</p><p className="text-2xl font-bold text-blue-600">{stats?.activeInvestments || investments.filter(i => i.status === 'ACTIVE').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Invested</p><p className="text-2xl font-bold text-green-600">${(stats?.totalInvestments || 0).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Profit Paid</p><p className="text-2xl font-bold text-amber-600">${investments.reduce((s, i) => s + (i.earnedProfit || 0), 0).toLocaleString()}</p></CardContent></Card>
      </div>

      <div className="flex gap-4 border-b">
        <button onClick={() => setActiveTab('plans')} className={`pb-2 px-4 font-medium ${activeTab === 'plans' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Investment Plans</button>
        <button onClick={() => setActiveTab('investments')} className={`pb-2 px-4 font-medium ${activeTab === 'investments' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>User Investments</button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input placeholder={activeTab === 'plans' ? 'Search plans...' : 'Search investments...'} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {activeTab === 'plans' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Daily Profit</TableHead>
                  <TableHead>Min/Max</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (plan.color || '#3B82F6') + '20' }}>
                          <TrendingUp className="w-5 h-5" style={{ color: plan.color || '#3B82F6' }} />
                        </div>
                        <div><p className="font-medium">{plan.name}</p><p className="text-sm text-gray-500">{plan.description?.slice(0, 40)}</p></div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{plan.dailyProfitRate}%</TableCell>
                    <TableCell>${plan.minAmount?.toLocaleString()} / ${plan.maxAmount?.toLocaleString()}</TableCell>
                    <TableCell>{plan.duration} days</TableCell>
                    <TableCell>{getRiskBadge(plan.riskLevel)}</TableCell>
                    <TableCell><Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>{plan.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'investments' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Earned</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestments.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.userName}</TableCell>
                    <TableCell>{inv.plan?.name || 'N/A'}</TableCell>
                    <TableCell className="font-medium">${inv.amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">${(inv.earnedProfit || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge className={inv.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>{inv.status}</Badge></TableCell>
                    <TableCell>{new Date(inv.startDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {filteredInvestments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No investments found</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
