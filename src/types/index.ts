// User Types
export interface User {
  id: string;
  email: string;
  password: string;
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
  referralCode: string;
  referredBy?: string;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  lastLogin?: Date;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  kycSubmittedAt?: Date;
  kycDocuments?: KYCDocument[];
  isAdmin: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  emailVerified: boolean;
  withdrawalKey?: string;
  sessionExpiresAt?: Date;
}

export interface KYCDocument {
  id: string;
  type: 'passport' | 'id_card' | 'driver_license' | 'utility_bill' | 'bank_statement';
  documentNumber?: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

// Investment Plan Types
export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  duration: number;
  referralBonus: number;
  riskLevel: 'low' | 'medium' | 'high';
  category: 'crypto' | 'stocks' | 'forex' | 'commodities' | 'mixed';
  image?: string;
  status: 'active' | 'inactive';
  features: string[];
  color: string;
  popular?: boolean;
}

// Investment Types
export interface Investment {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  dailyProfitRate: number;
  totalProfit: number;
  earnedProfit: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  lastProfitUpdate: Date;
  nextProfitDate: Date;
}

// Transaction Types
export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'profit' 
  | 'referral' 
  | 'investment' 
  | 'admin_adjustment'
  | 'fee'
  | 'bonus';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
  reference?: string;
  method?: string;
  fee?: number;
  netAmount?: number;
  txHash?: string;
  withdrawalKey?: string;
}

// Deposit/Withdrawal Methods
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'bank' | 'card' | 'wallet';
  icon: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  feeType: 'fixed' | 'percentage';
  processingTime: string;
  supportedCurrencies: string[];
  status: 'active' | 'inactive';
  instructions?: string;
}

// Admin Action Types
export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  targetType?: 'user' | 'transaction' | 'investment' | 'plan' | 'kyc';
  details: string;
  amount?: number;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
  ipAddress?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalInvestments: number;
  activeInvestments: number;
  totalDeposits: number;
  pendingDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  todayProfit: number;
  totalProfitPaid: number;
  totalFees: number;
  platformBalance: number;
}

// User Dashboard Stats
export interface UserDashboardStats {
  totalBalance: number;
  availableBalance: number;
  investedAmount: number;
  totalProfit: number;
  todayProfit: number;
  totalWithdrawn: number;
  totalDeposited: number;
  activeInvestments: number;
  pendingTransactions: number;
  profitChange24h: number;
  profitChange7d: number;
  profitChange30d: number;
}

// Market Data
export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap?: number;
  high24h: number;
  low24h: number;
  type: 'crypto' | 'stock' | 'forex' | 'commodity';
  logo?: string;
}

// Portfolio Holdings
export interface PortfolioHolding {
  id: string;
  userId: string;
  assetId: string;
  assetName: string;
  assetSymbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  unrealizedProfit: number;
  unrealizedProfitPercent: number;
  allocation: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  category: 'general' | 'technical' | 'billing' | 'account' | 'investment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  message: string;
  createdAt: Date;
}

// Educational Content
export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'article' | 'video' | 'quiz';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  duration?: string;
  createdAt: Date;
  views: number;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  enable2FA: () => Promise<{ secret: string; qrCode: string }>;
  disable2FA: (code: string) => Promise<boolean>;
  extendSession: () => void;
}

// Session Types
export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location?: string;
  createdAt: Date;
  lastActive: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

// Referral
export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  status: 'pending' | 'active' | 'inactive';
  bonusEarned: number;
  createdAt: Date;
  activatedAt?: Date;
}
