import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, TrendingUp, ArrowLeftRight, Wallet, ArrowUpRight, ArrowDownRight,
  Activity, Clock, AlertCircle, CheckCircle, Download, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { adminApi } from '@/services/api';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingTx, setPendingTx] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, alertsRes, usersRes, txRes, ticketsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getAlerts(),
          adminApi.getUsers({ limit: 5 }),
          adminApi.getTransactions({ status: 'PENDING', limit: 5 }),
          adminApi.getSupportTickets({ status: 'OPEN', limit: 3 }),
        ]);
        setStats(statsRes.data.stats);
        setAlerts(alertsRes.data);
        setRecentUsers(usersRes.data.users);
        setPendingTx(txRes.data.transactions);
        setTickets(ticketsRes.data.tickets);
      } catch (err) { console.error('Admin dashboard error:', err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load dashboard data</div>;

  const userGrowthData = [
    { name: 'Mon', users: stats.newUsersToday || 0, deposits: stats.totalDeposits * 0.14 || 0 },
    { name: 'Tue', users: Math.max(1, stats.newUsersToday * 1.2 | 0), deposits: stats.totalDeposits * 0.16 || 0 },
    { name: 'Wed', users: Math.max(1, stats.newUsersToday * 0.9 | 0), deposits: stats.totalDeposits * 0.13 || 0 },
    { name: 'Thu', users: Math.max(1, stats.newUsersToday * 1.3 | 0), deposits: stats.totalDeposits * 0.17 || 0 },
    { name: 'Fri', users: Math.max(1, stats.newUsersToday * 1.5 | 0), deposits: stats.totalDeposits * 0.15 || 0 },
    { name: 'Sat', users: Math.max(1, stats.newUsersToday * 1.1 | 0), deposits: stats.totalDeposits * 0.12 || 0 },
    { name: 'Sun', users: Math.max(1, stats.newUsersToday * 0.8 | 0), deposits: stats.totalDeposits * 0.13 || 0 },
  ];

  const profitData = [
    { name: 'Week 1', profit: stats.totalInvestments * 0.02 || 0, withdrawals: stats.totalWithdrawals * 0.25 || 0 },
    { name: 'Week 2', profit: stats.totalInvestments * 0.025 || 0, withdrawals: stats.totalWithdrawals * 0.25 || 0 },
    { name: 'Week 3', profit: stats.totalInvestments * 0.03 || 0, withdrawals: stats.totalWithdrawals * 0.25 || 0 },
    { name: 'Week 4', profit: stats.totalInvestments * 0.035 || 0, withdrawals: stats.totalWithdrawals * 0.25 || 0 },
  ];

  const StatCard = ({ title, value, subValue, change, changeType, icon: Icon, color, link }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {changeType === 'positive' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {link && (<Link to={link} className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700">View Details<ArrowUpRight className="w-4 h-4 ml-1" /></Link>)}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} subValue={`${stats.newUsersToday} new today`} change="+12.5%" changeType="positive" icon={Users} color="bg-blue-600" link="/admin/users" />
        <StatCard title="Total Deposits" value={`$${(stats.totalDeposits / (stats.totalDeposits > 1000000 ? 1000000 : 1)).toFixed(stats.totalDeposits > 1000000 ? 1 : 0)}${stats.totalDeposits > 1000000 ? 'M' : ''}`} subValue={`${stats.pendingDeposits} pending`} change="+8.2%" changeType="positive" icon={Wallet} color="bg-green-600" link="/admin/transactions" />
        <StatCard title="Active Investments" value={stats.activeInvestments.toLocaleString()} subValue={`$${stats.totalInvestments.toLocaleString()} total`} change="+15.3%" changeType="positive" icon={TrendingUp} color="bg-purple-600" link="/admin/investments" />
        <StatCard title="Total Withdrawn" value={`$${stats.totalWithdrawals?.toLocaleString() || '0'}`} subValue={`${stats.pendingWithdrawals} pending`} icon={Activity} color="bg-amber-600" link="/admin/transactions" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-amber-600" /></div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">Pending KYC</p>
              <p className="text-sm text-amber-700">{alerts?.pendingKyc || 0} verifications awaiting review</p>
            </div>
            <Link to="/admin/kyc"><Button size="sm" variant="outline" className="border-amber-300 text-amber-700">Review</Button></Link>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><ArrowLeftRight className="w-5 h-5 text-red-600" /></div>
            <div className="flex-1">
              <p className="font-medium text-red-900">Pending Withdrawals</p>
              <p className="text-sm text-red-700">{alerts?.pendingWithdrawals || 0} to process</p>
            </div>
            <Link to="/admin/transactions"><Button size="sm" variant="outline" className="border-red-300 text-red-700">Process</Button></Link>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 text-blue-600" /></div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">Support Tickets</p>
              <p className="text-sm text-blue-700">{alerts?.openTickets || 0} tickets need attention</p>
            </div>
            <Link to="/admin/support"><Button size="sm" variant="outline" className="border-blue-300 text-blue-700">View</Button></Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">User Growth & Deposits</CardTitle>
            <Badge variant="secondary">Last 7 Days</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Area yAxisId="left" type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" name="New Users" />
                <Area yAxisId="right" type="monotone" dataKey="deposits" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorDeposits)" name="Deposits ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Profit vs Withdrawals</CardTitle>
            <Badge variant="secondary">This Month</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Bar dataKey="profit" fill="#3B82F6" name="Profit Paid" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" fill="#EF4444" name="Withdrawals" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
            <Link to="/admin/users"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10"><AvatarFallback className="bg-blue-100 text-blue-700">{u.firstName?.[0]}{u.lastName?.[0]}</AvatarFallback></Avatar>
                    <div><p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p><p className="text-sm text-gray-500">{u.email}</p></div>
                  </div>
                  <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'} className={u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>{u.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Pending Transactions</CardTitle>
            <Link to="/admin/transactions"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTx.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {tx.type === 'DEPOSIT' ? <ArrowDownRight className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{tx.type.toLowerCase()}</p>
                      <p className="text-sm text-gray-500">{tx.user?.firstName} {tx.user?.lastName}</p>
                    </div>
                  </div>
                  <p className="font-medium">${tx.amount?.toLocaleString()}</p>
                </div>
              ))}
              {pendingTx.length === 0 && (
                <div className="text-center py-8 text-gray-500"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" /><p>No pending transactions</p></div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Support Tickets</CardTitle>
            <Link to="/admin/support"><Button variant="ghost" size="sm">View All</Button></Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-gray-900 line-clamp-1">{ticket.subject}</p>
                    <Badge variant={ticket.priority === 'URGENT' ? 'destructive' : 'secondary'} className="text-xs">{ticket.priority}</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{ticket.user?.firstName} {ticket.user?.lastName}</p>
                  <span className="text-xs text-gray-400">{ticket.category}</span>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-8 text-gray-500"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" /><p>No open tickets</p></div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
