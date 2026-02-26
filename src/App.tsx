import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { Loader2 } from 'lucide-react';

// Layouts (not lazy-loaded — they wrap everything)
import MainLayout from '@/layouts/MainLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Components
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';
import SuspendedScreen from '@/components/SuspendedScreen';

// --- Lazy-loaded Pages ---

// Public Pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const About = lazy(() => import('@/pages/About'));
const Support = lazy(() => import('@/pages/Support'));
const Learn = lazy(() => import('@/pages/Learn'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Protected User Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Portfolio = lazy(() => import('@/pages/Portfolio'));
const Invest = lazy(() => import('@/pages/Invest'));
const Markets = lazy(() => import('@/pages/Markets'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const Deposit = lazy(() => import('@/pages/Deposit'));
const Withdraw = lazy(() => import('@/pages/Withdraw'));
const KYC = lazy(() => import('@/pages/KYC'));
const Profile = lazy(() => import('@/pages/Profile'));
const Security = lazy(() => import('@/pages/Security'));
const Referrals = lazy(() => import('@/pages/Referrals'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// Admin Pages
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminInvestments = lazy(() => import('@/pages/admin/AdminInvestments'));
const AdminTransactions = lazy(() => import('@/pages/admin/AdminTransactions'));
const AdminKYC = lazy(() => import('@/pages/admin/AdminKYC'));
const AdminPlans = lazy(() => import('@/pages/admin/AdminPlans'));
const AdminSupport = lazy(() => import('@/pages/admin/AdminSupport'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminLogs = lazy(() => import('@/pages/admin/AdminLogs'));

// Loading spinner shown while lazy chunks load
function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route - redirects to dashboard if already logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const isSuspended = isAuthenticated && user?.status === 'SUSPENDED' && !isAdmin;

  if (isSuspended) {
    return (
      <>
        <SuspendedScreen />
        <SessionTimeoutWarning />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/support" element={<Support />} />
            <Route path="/learn" element={<Learn />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/verify-email" element={<PublicRoute><VerifyEmail /></PublicRoute>} />

          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="invest" element={<Invest />} />
            <Route path="markets" element={<Markets />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="deposit" element={<Deposit />} />
            <Route path="withdraw" element={<Withdraw />} />
            <Route path="kyc" element={<KYC />} />
            <Route path="profile" element={<Profile />} />
            <Route path="security" element={<Security />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="investments" element={<AdminInvestments />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="kyc" element={<AdminKYC />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <SessionTimeoutWarning />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
