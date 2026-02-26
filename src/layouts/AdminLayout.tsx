import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { notificationApi } from '@/services/api';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ArrowLeftRight,
  ShieldCheck,
  Package,
  MessageSquare,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Crown,
  Bell,
  Search,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notification count
  useEffect(() => {
    if (user) {
      const fetchNotifs = () => {
        notificationApi.unreadCount().then(({ data }) => setUnreadCount(data.count)).catch(console.error);
      };
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenNotifications = () => {
    notificationApi.list().then(({ data }) => setNotifications(data.notifications?.slice(0, 8) || [])).catch(console.error);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Investments', href: '/admin/investments', icon: TrendingUp },
    { name: 'Transactions', href: '/admin/transactions', icon: ArrowLeftRight },
    { name: 'KYC Verification', href: '/admin/kyc', icon: ShieldCheck },
    { name: 'Plans', href: '/admin/plans', icon: Package },
    { name: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
    { name: 'System Logs', href: '/admin/logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ] as any[];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg'
          : 'bg-slate-900'
          }`}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5 text-slate-300" />
            </button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">Admin Panel</span>
                <span className="text-xs text-slate-400 block -mt-1">Fintrivox</span>
              </div>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users, transactions..."
                className="w-full pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <DropdownMenu onOpenChange={(open) => { if (open) handleOpenNotifications(); }}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-800">
                  <Bell className="w-5 h-5 text-slate-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-[420px] overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-500">No notifications</div>
                ) : (
                  notifications.map((n: any) => (
                    <DropdownMenuItem key={n.id} className={`flex flex-col items-start gap-1 py-3 cursor-pointer ${!n.read ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        if (!n.read) {
                          notificationApi.markRead(n.id).then(() => setUnreadCount(c => Math.max(0, c - 1))).catch(console.error);
                        }
                        if (n.link) navigate(n.link);
                      }}
                    >
                      <p className={`text-sm ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-800">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    View Website
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
      <aside className="hidden lg:block fixed left-0 top-16 bottom-0 w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto">
        <div className="p-4">
          {/* Admin Badge */}
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl mb-6 border border-amber-500/30">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-amber-400">Super Administrator</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <Badge className="bg-red-500 text-white text-xs">
                    {item.badge}
                  </Badge>
                )}
                {isActive(item.href) && <ChevronRight className="w-4 h-4" />}
              </Link>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-slate-800 rounded-xl">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Today's Activity
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">New Users</span>
                <span className="text-sm font-medium text-green-400">+15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Deposits</span>
                <span className="text-sm font-medium text-blue-400">$125K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300">Profit Paid</span>
                <span className="text-sm font-medium text-amber-400">$45K</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 overflow-y-auto lg:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <Link to="/admin" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white block">Admin Panel</span>
                    <span className="text-xs text-slate-400 block -mt-1">Fintrivox</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5 text-slate-300" />
                </button>
              </div>

              {/* Admin Badge */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl mb-6 border border-amber-500/30">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-medium">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-amber-400">Super Administrator</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive(item.href) ? 'text-white' : 'text-slate-400'}`} />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>

              <Button
                variant="outline"
                className="w-full mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
