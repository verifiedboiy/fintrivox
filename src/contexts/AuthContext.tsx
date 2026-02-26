import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/services/api';

// ============================================================
// Types
// ============================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  balance: number;
  availableBalance: number;
  investedAmount: number;
  totalProfit: number;
  totalWithdrawn: number;
  totalDeposited: number;
  role: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  kycStatus: string;
  kycSubmittedAt?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLogin?: string;
  suspensionReason?: string;
  // Legacy compat fields used by frontend pages
  isAdmin: boolean;
  withdrawalKey?: string;
  password?: string; // not returned from API, only used for mock compat
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDemo: boolean;
  loading: boolean;
  showTimeoutWarning: boolean;
  remainingTime: number;
  extendSession: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; requiresEmailVerification?: boolean; tempToken?: string }>;
  verify2FA: (code: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; requiresEmailVerification?: boolean; tempToken?: string }>;
  logout: () => void;
  register: (userData: Partial<User> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail: (email: string, code: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  enable2FA: () => Promise<{ secret: string; qrCode: string }>;
  disable2FA: (code: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// ============================================================
// Helper: normalize API user → frontend User shape
// ============================================================

function normalizeUser(apiUser: any): User {
  return {
    ...apiUser,
    isAdmin: apiUser.role === 'ADMIN',
    // Keep kycStatus uppercase (VERIFIED, PENDING, REJECTED, NOT_SUBMITTED)
    kycStatus: (apiUser.kycStatus || 'NOT_SUBMITTED').toUpperCase(),
    // Keep status uppercase (ACTIVE, SUSPENDED, PENDING)
    status: (apiUser.status || 'ACTIVE').toUpperCase(),
    suspensionReason: apiUser.suspensionReason,
  };
}

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending2FATempToken, setPending2FATempToken] = useState<string | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(SESSION_TIMEOUT);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // ---- Session timeout ----
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;
      setRemainingTime(Math.max(0, remaining));
      if (remaining <= WARNING_BEFORE_TIMEOUT && remaining > 0) {
        setShowTimeoutWarning(true);
      }
      if (remaining <= 0) {
        logout();
        setShowTimeoutWarning(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity]);

  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowTimeoutWarning(false);
  }, []);

  const extendSession = useCallback(() => updateActivity(), [updateActivity]);

  // Activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handler = () => updateActivity();
    events.forEach(e => document.addEventListener(e, handler));
    return () => events.forEach(e => document.removeEventListener(e, handler));
  }, [isAuthenticated, updateActivity]);

  // ---- Restore session on mount ----
  useEffect(() => {
    const token = localStorage.getItem('Fintrivox_token');
    const storedUser = localStorage.getItem('Fintrivox_user');

    if (token && storedUser) {
      try {
        const userData = normalizeUser(JSON.parse(storedUser));
        setUser(userData);
        setIsAuthenticated(true);
        setIsAdmin(userData.isAdmin);
        setIsDemo(userData.email === 'john.doe@example.com');
        setLastActivity(Date.now());

        // Refresh user data in background
        authApi.getMe().then(({ data }) => {
          const freshUser = normalizeUser(data.user);
          setUser(freshUser);
          setIsAdmin(freshUser.isAdmin);
          localStorage.setItem('Fintrivox_user', JSON.stringify(data.user));
        }).catch(() => {
          // Token expired — try refresh
          const refreshToken = localStorage.getItem('Fintrivox_refresh_token');
          if (refreshToken) {
            authApi.refresh(refreshToken).then(({ data }) => {
              localStorage.setItem('Fintrivox_token', data.accessToken);
              localStorage.setItem('Fintrivox_refresh_token', data.refreshToken);
              localStorage.setItem('Fintrivox_user', JSON.stringify(data.user));
              const freshUser = normalizeUser(data.user);
              setUser(freshUser);
              setIsAdmin(freshUser.isAdmin);
            }).catch(() => {
              // Refresh failed — log out
              logout();
            });
          } else {
            logout();
          }
        });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // ---- Complete login (store tokens and user) ----
  const completeLogin = (data: { user: any; accessToken: string; refreshToken: string }) => {
    const normalizedUser = normalizeUser(data.user);
    setUser(normalizedUser);
    setIsAuthenticated(true);
    setIsAdmin(normalizedUser.isAdmin);
    setIsDemo(normalizedUser.email === 'john.doe@example.com');
    setLastActivity(Date.now());

    localStorage.setItem('Fintrivox_token', data.accessToken);
    localStorage.setItem('Fintrivox_refresh_token', data.refreshToken);
    localStorage.setItem('Fintrivox_user', JSON.stringify(data.user));
  };

  // ---- Login ----
  const login = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);

      if (data.requiresEmailVerification) {
        return { success: true, requiresEmailVerification: true };
      }

      if (data.requires2FA) {
        setPending2FATempToken(data.tempToken);
        return { success: true, requires2FA: true, tempToken: data.tempToken };
      }

      completeLogin(data);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false };
    }
  };

  // ---- 2FA Verification ----
  const verify2FA = async (code: string): Promise<boolean> => {
    if (!pending2FATempToken) return false;
    try {
      const { data } = await authApi.verify2FA(pending2FATempToken, code);
      completeLogin(data);
      setPending2FATempToken(null);
      return true;
    } catch (err) {
      console.error('2FA verification error:', err);
      return false;
    }
  };

  // ---- Admin Login (same as login, but enforce admin role) ----
  const adminLogin = async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);

      if (data.requiresEmailVerification) {
        return { success: true, requiresEmailVerification: true };
      }

      if (data.requires2FA) {
        setPending2FATempToken(data.tempToken);
        return { success: true, requires2FA: true, tempToken: data.tempToken };
      }

      if (data.user.role !== 'ADMIN') {
        return { success: false };
      }

      completeLogin(data);
      return { success: true };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false };
    }
  };

  // ---- Logout ----
  const logout = () => {
    const refreshToken = localStorage.getItem('Fintrivox_refresh_token');
    if (refreshToken) {
      authApi.logout(refreshToken).catch(() => { }); // fire and forget
    }

    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsDemo(false);
    setPending2FATempToken(null);
    setShowTimeoutWarning(false);

    localStorage.removeItem('Fintrivox_token');
    localStorage.removeItem('Fintrivox_refresh_token');
    localStorage.removeItem('Fintrivox_user');
    // Legacy cleanup
    localStorage.removeItem('Fintrivox_session');
  };

  const register = async (userData: Partial<User> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      await authApi.register({
        email: userData.email!,
        password: userData.password!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        phone: userData.phone,
        country: userData.country,
        referralCode: userData.referralCode,
      });
      return { success: true };
    } catch (err: any) {
      console.error('Registration error details:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'An unexpected error occurred during registration.';
      return { success: false, error: errorMessage };
    }
  };

  // ---- Update user ----
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('Fintrivox_user', JSON.stringify(updatedUser));
    }
  };

  // ---- Refresh user from API ----
  const refreshUser = async () => {
    try {
      const { data } = await authApi.getMe();
      const freshUser = normalizeUser(data.user);
      setUser(freshUser);
      setIsAdmin(freshUser.isAdmin);
      localStorage.setItem('Fintrivox_user', JSON.stringify(data.user));
    } catch {
      // silently fail
    }
  };

  // ---- Core Methods ----
  const verifyEmail = async (email: string, code: string): Promise<boolean> => {
    try {
      const { data } = await authApi.verifyEmail(email, code);
      // The API now returns { success: true } or we can check data.user
      return !!(data.success || data.user);
    } catch (err) {
      console.error('Email verification error:', err);
      return false;
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      await authApi.sendVerification(email);
      return true;
    } catch {
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authApi.forgotPassword(email);
      return true;
    } catch {
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await authApi.resetPassword(email, code, newPassword);
      return true;
    } catch {
      return false;
    }
  };
  const enable2FA = async () => ({
    secret: 'JBSWY3DPEHPK3PXP',
    qrCode: `otpauth://totp/Fintrivox:${user?.email}?secret=JBSWY3DPEHPK3PXP&issuer=Fintrivox`,
  });
  const disable2FA = async (code: string) => code.length === 6;

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isAdmin,
    isDemo,
    loading,
    login,
    verify2FA,
    adminLogin,
    logout,
    register,
    updateUser,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    enable2FA,
    disable2FA,
    extendSession,
    refreshUser,
    showTimeoutWarning,
    remainingTime,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
