import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BarChart3,
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  Shield,
  User,
  Users,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  BadgeCheck,
  Landmark,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notificationApi } from '@/services/api';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [showDemoRestriction, setShowDemoRestriction] = useState(false);

  // Demo mode: allowed paths
  const demoAllowedPaths = [
    '/dashboard/portfolio',
    '/dashboard/invest',
    '/dashboard/transactions',
    '/dashboard/profile',
    '/dashboard/notifications',
  ];

  useEffect(() => {
    if (isDemo) return; // No referral popup for demo
    // Show referral popup a little after loading layout
    const timer1 = setTimeout(() => setShowReferralPopup(true), 1500);
    // Auto-dismiss after 15 seconds (1500 + 15000 = 16500)
    const timer2 = setTimeout(() => setShowReferralPopup(false), 16500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  useEffect(() => {
    if (user) {
      notificationApi.unreadCount().then(({ data }) => setUnreadCount(data.count)).catch(console.error);
      const interval = setInterval(() => {
        notificationApi.unreadCount().then(({ data }) => setUnreadCount(data.count)).catch(console.error);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Portfolio', href: '/dashboard/portfolio', icon: Wallet },
    { name: 'Invest', href: '/dashboard/invest', icon: TrendingUp },
    { name: 'Markets', href: '/dashboard/markets', icon: BarChart3 },
    { name: 'Transactions', href: '/dashboard/transactions', icon: ArrowLeftRight },
  ];

  const financeNavItems = [
    { name: 'Deposit', href: '/dashboard/deposit', icon: PlusCircle },
    { name: 'Withdraw', href: '/dashboard/withdraw', icon: MinusCircle },
    { name: 'KYC Verification', href: '/dashboard/kyc', icon: BadgeCheck, badge: user?.kycStatus },
  ];

  const accountNavItems = [
    { name: 'Profile', href: '/dashboard/profile', icon: User },
    { name: 'Security', href: '/dashboard/security', icon: Shield },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
  ];

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  const renderNavSection = (title: string, items: { name: string; href: string; icon: React.ElementType; badge?: string | number | null }[]) => (
    <div className="mb-6">
      <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isDemoRestricted = isDemo && !demoAllowedPaths.includes(item.href);
          return (
            <Link
              key={item.name}
              to={isDemoRestricted ? '#' : item.href}
              onClick={(e) => {
                if (isDemoRestricted) {
                  e.preventDefault();
                  setShowDemoRestriction(true);
                }
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive(item.href)
                ? 'bg-blue-600 text-white'
                : isDemoRestricted
                  ? 'text-gray-400 hover:bg-gray-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : isDemoRestricted ? 'text-gray-300' : 'text-gray-400'}`} />
              <span className="flex-1">{item.name}</span>
              {isDemoRestricted && (
                <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Locked</span>
              )}
              {!isDemoRestricted && item.badge && (
                <Badge
                  variant={item.badge === 'verified' ? 'default' : 'secondary'}
                  className={`text-xs ${item.badge === 'verified'
                    ? 'bg-green-100 text-green-700'
                    : item.badge === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Demo Account — This is not real money. For demonstration purposes only.</span>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="ml-3 px-3 py-0.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-semibold transition-colors"
            >
              Sign up for real account
            </button>
          </div>
        </div>
      )}

      {/* Demo Restriction Modal */}
      {showDemoRestriction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Feature Restricted</h3>
            <p className="text-gray-500 mb-6 text-sm">
              This feature is not available in demo mode. Please login with a real account to access all features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDemoRestriction(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={() => { logout(); navigate('/register'); }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isDemo ? 'mt-[36px]' : ''} ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
          : 'bg-white border-b border-gray-200'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:block">Fintrivox</span>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Balance */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-lg">
              <Landmark className="w-4 h-4 text-gray-500" />
              <div className="text-sm">
                <span className="text-gray-500">Balance:</span>
                <span className="font-semibold text-gray-900 ml-1">
                  ${user?.balance.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <Link to="/dashboard/notifications">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      {user?.firstName} {user?.lastName}
                      {user?.kycStatus === 'VERIFIED' && <BadgeCheck className="w-4 h-4 text-blue-500" fill="currentColor" stroke="white" />}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/security" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:block fixed left-0 ${isDemo ? 'top-[calc(36px+4rem)]' : 'top-16'} bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-30`}>
        <div className="p-4">
          {renderNavSection("Main", mainNavItems)}
          {renderNavSection("Finance", financeNavItems)}
          {renderNavSection("Account", accountNavItems)}
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 overflow-y-auto lg:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-900">Fintrivox</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mb-6">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    {user?.firstName} {user?.lastName}
                    {user?.kycStatus === 'VERIFIED' && <BadgeCheck className="w-5 h-5 text-blue-500" fill="currentColor" stroke="white" />}
                  </p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    ${user?.balance.toLocaleString()}
                  </p>
                </div>
              </div>

              {renderNavSection("Main", mainNavItems)}
              {renderNavSection("Finance", financeNavItems)}
              {renderNavSection("Account", accountNavItems)}

              <Button
                variant="outline"
                className="w-full mt-4 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className={`lg:ml-64 ${isDemo ? 'pt-[calc(36px+4rem)]' : 'pt-16'} min-h-screen`}>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating Telegram Button (Glowing) */}
      <a
        href="https://t.me/IFPBrokeragent"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] bg-[#0088cc] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-pulse flex items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-[#0088cc] animate-ping opacity-75 pointer-events-none"></span>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><path d="m15 10-4 4 6 6 4-16-18 7 4 2 2 6 3-4" /></svg>
      </a>

      {/* Referral Popup */}
      {showReferralPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in zoom-in-95 duration-500">
            <button onClick={() => setShowReferralPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Invite Friends, Earn 5%</h3>
            <p className="text-center text-gray-500 mb-6">
              Share your referral link with friends and earn 5% of their first investment.
              The more you invite, the more you earn!
            </p>
            <Link to="/dashboard/referrals" onClick={() => setShowReferralPopup(false)}>
              <Button className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700">
                View My Referral Link
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
