import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  ChevronRight,
  Plus,
  Minus,
  Eye,
  EyeOff,
  Activity,
  BarChart3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, transactionApi, notificationApi } from '@/services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// TradingView Chart Widget
function TradingViewChartWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'NASDAQ:AAPL',
      interval: 'D',
      timezone: 'Etc/UTC',
      theme: 'light',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com'
    });

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode === containerRef.current) {
        containerRef.current.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" style={{ height: '400px' }}>
      <div ref={containerRef} className="tradingview-widget-container__widget" style={{ height: '100%' }} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBalance: 0, availableBalance: 0, investedAmount: 0,
    totalProfit: 0, profitChange24h: 2.35, profitChange30d: 12.5,
    todayProfit: 0, totalWithdrawn: 0, totalDeposited: 0,
    activeInvestments: 0, pendingTransactions: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<any[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const [statsRes, txRes, invRes, notifRes] = await Promise.allSettled([
          userApi.getDashboardStats(),
          transactionApi.list({ limit: 5 }),
          userApi.getInvestments(),
          notificationApi.list(),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(s => ({ ...s, ...statsRes.value.data.stats }));
        } else {
          // Fallback: use user balance from auth context
          setStats(s => ({
            ...s,
            totalBalance: user.balance || 0,
            availableBalance: user.availableBalance || 0,
            investedAmount: user.investedAmount || 0,
            totalProfit: user.totalProfit || 0,
          }));
        }

        if (txRes.status === 'fulfilled') {
          setRecentTransactions(txRes.value.data.transactions.map((tx: any) => ({
            ...tx,
            type: tx.type.toLowerCase(),
            status: tx.status.toLowerCase(),
            createdAt: new Date(tx.createdAt),
          })));
        }

        if (invRes.status === 'fulfilled') {
          setActiveInvestments(
            invRes.value.data.investments
              .filter((inv: any) => inv.status === 'ACTIVE')
              .slice(0, 3)
              .map((inv: any) => ({
                ...inv,
                planName: inv.plan?.name || 'Investment',
              }))
          );
        }

        if (notifRes.status === 'fulfilled') {
          setUnreadNotifications(
            notifRes.value.data.notifications
              .filter((n: any) => !n.read)
              .slice(0, 3)
              .map((n: any) => ({
                ...n,
                type: n.type.toLowerCase(),
                createdAt: new Date(n.createdAt),
              }))
          );
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Fallback to auth context data
        setStats(s => ({
          ...s,
          totalBalance: user.balance || 0,
          availableBalance: user.availableBalance || 0,
          investedAmount: user.investedAmount || 0,
          totalProfit: user.totalProfit || 0,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Live profit counter — tiny increments every second
  useEffect(() => {
    if (!stats.totalProfit || stats.totalProfit <= 0) return;
    // Approximate: profit grows ~0.5% daily → per second = 0.005 / 86400
    const perSecondRate = 0.005 / 86400;
    const interval = setInterval(() => {
      setStats(s => ({
        ...s,
        totalProfit: s.totalProfit + (s.investedAmount * perSecondRate),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [stats.investedAmount]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Chart data
  const profitData = [
    { name: 'Jan', profit: 1200 },
    { name: 'Feb', profit: 1900 },
    { name: 'Mar', profit: 2400 },
    { name: 'Apr', profit: 2800 },
    { name: 'May', profit: 3200 },
    { name: 'Jun', profit: 3800 },
    { name: 'Jul', profit: 4200 },
  ];

  const allocationData = [
    { name: 'Crypto', value: 35, color: '#3B82F6' },
    { name: 'Stocks', value: 40, color: '#10B981' },
    { name: 'Forex', value: 15, color: '#8B5CF6' },
    { name: 'Commodities', value: 10, color: '#F59E0B' },
  ];

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    color
  }: {
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative';
    icon: React.ElementType;
    color: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            {change && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                {changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.firstName}! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/deposit">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Deposit
            </Button>
          </Link>
          <Link to="/dashboard/withdraw">
            <Button variant="outline">
              <Minus className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </Link>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-blue-100">Total Balance</p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-blue-200 hover:text-white"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h3 className="text-3xl font-bold">
                  {showBalance ? `$${stats.totalBalance.toLocaleString()}` : '****'}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-sm text-blue-100">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{stats.profitChange24h}% today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <StatCard
          title="Available Balance"
          value={`$${stats.availableBalance.toLocaleString()}`}
          icon={PiggyBank}
          color="bg-green-500"
        />

        <StatCard
          title="Invested Amount"
          value={`$${stats.investedAmount.toLocaleString()}`}
          icon={BarChart3}
          color="bg-purple-500"
        />

        <StatCard
          title="Total Profit"
          value={`$${stats.totalProfit.toLocaleString()}`}
          change={`+${stats.profitChange30d}% (30d)`}
          changeType="positive"
          icon={TrendingUp}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profit Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Profit Overview
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-green-600 bg-green-50">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
              <select className="text-sm border rounded-lg px-2 py-1">
                <option>7 Days</option>
                <option>30 Days</option>
                <option>90 Days</option>
                <option>1 Year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={profitData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  formatter={(value: number) => [`$${value}`, 'Profit']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Allocation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Portfolio Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Market Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Live Market Chart
          </CardTitle>
          <Link to="/dashboard/markets">
            <Button variant="ghost" size="sm">
              View All Markets
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewChartWidget />
        </CardContent>
      </Card>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Active Investments</CardTitle>
            <Link to="/dashboard/invest">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeInvestments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inv.planName}</p>
                    <p className="text-sm text-gray-500">${inv.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+${inv.earnedProfit.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">{inv.dailyProfitRate}% daily</p>
                  </div>
                </div>
              ))}
              {activeInvestments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No active investments</p>
                  <Link to="/dashboard/invest">
                    <Button variant="outline" className="mt-4">
                      Start Investing
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            <Link to="/dashboard/transactions">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100' :
                      tx.type === 'withdrawal' ? 'bg-red-100' :
                        tx.type === 'profit' ? 'bg-blue-100' :
                          'bg-gray-100'
                      }`}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5 text-green-600" /> :
                        tx.type === 'withdrawal' ? <ArrowUpRight className="w-5 h-5 text-red-600" /> :
                          tx.type === 'profit' ? <TrendingUp className="w-5 h-5 text-blue-600" /> :
                            <Activity className="w-5 h-5 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500">{tx.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${tx.type === 'deposit' || tx.type === 'profit' ? 'text-green-600' :
                      tx.type === 'withdrawal' ? 'text-red-600' :
                        'text-gray-900'
                      }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <Link to="/dashboard/notifications">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {unreadNotifications.map((notif) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notif.type === 'success' ? 'bg-green-500' :
                    notif.type === 'warning' ? 'bg-amber-500' :
                      notif.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                    }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notif.title}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {unreadNotifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
