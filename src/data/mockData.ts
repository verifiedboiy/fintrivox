import type {
  User,
  InvestmentPlan,
  Investment,
  Transaction,
  PaymentMethod,
  MarketAsset,
  PortfolioHolding,
  SupportTicket,
  EducationalContent,
  AdminAction,
  Notification,
  DashboardStats,
  UserDashboardStats
} from '@/types';

// Mock Users
export const mockUsers: any[] = [
  {
    id: '1',
    email: 'admin@Fintrivox.com',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1 (555) 000-0001',
    country: 'United States',
    balance: 1000000,
    availableBalance: 1000000,
    investedAmount: 0,
    totalProfit: 0,
    totalWithdrawn: 0,
    totalDeposited: 1000000,
    referralCode: 'ADMIN001',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    kycStatus: 'verified',
    isAdmin: true,
    twoFactorEnabled: true,
    emailVerified: true,
    withdrawalKey: 'WITHDRAW-ADMIN-001'
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    password: 'User@123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001',
    dateOfBirth: '1985-06-15',
    balance: 50000,
    availableBalance: 15000,
    investedAmount: 35000,
    totalProfit: 8750,
    totalWithdrawn: 5000,
    totalDeposited: 55000,
    referralCode: 'JOHN2024',
    referredBy: 'ADMIN001',
    status: 'active',
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date(),
    kycStatus: 'verified',
    kycSubmittedAt: new Date('2024-02-16'),
    isAdmin: false,
    twoFactorEnabled: true,
    emailVerified: true,
    withdrawalKey: 'WITHDRAW-JOHN-002'
  },
  {
    id: '3',
    email: 'sarah.smith@example.com',
    password: 'User@123',
    firstName: 'Sarah',
    lastName: 'Smith',
    phone: '+44 20 7946 0958',
    country: 'United Kingdom',
    address: '45 Oxford Street',
    city: 'London',
    postalCode: 'W1D 2DZ',
    dateOfBirth: '1990-03-22',
    balance: 25000,
    availableBalance: 5000,
    investedAmount: 20000,
    totalProfit: 3200,
    totalWithdrawn: 2000,
    totalDeposited: 27000,
    referralCode: 'SARAH2024',
    status: 'active',
    createdAt: new Date('2024-03-01'),
    lastLogin: new Date(),
    kycStatus: 'verified',
    kycSubmittedAt: new Date('2024-03-02'),
    isAdmin: false,
    twoFactorEnabled: false,
    emailVerified: true,
    withdrawalKey: 'WITHDRAW-SARAH-003'
  },
  {
    id: '4',
    email: 'mike.johnson@example.com',
    password: 'User@123',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '+1 (555) 987-6543',
    country: 'Canada',
    balance: 10000,
    availableBalance: 10000,
    investedAmount: 0,
    totalProfit: 0,
    totalWithdrawn: 0,
    totalDeposited: 10000,
    referralCode: 'MIKE2024',
    status: 'pending',
    createdAt: new Date('2024-03-10'),
    kycStatus: 'not_submitted',
    isAdmin: false,
    twoFactorEnabled: false,
    emailVerified: false,
    withdrawalKey: 'WITHDRAW-MIKE-004'
  },
  {
    id: '5',
    email: 'emma.wilson@example.com',
    password: 'User@123',
    firstName: 'Emma',
    lastName: 'Wilson',
    phone: '+61 2 9374 4000',
    country: 'Australia',
    balance: 75000,
    availableBalance: 25000,
    investedAmount: 50000,
    totalProfit: 12500,
    totalWithdrawn: 10000,
    totalDeposited: 85000,
    referralCode: 'EMMA2024',
    referredBy: 'JOHN2024',
    status: 'active',
    createdAt: new Date('2024-01-20'),
    lastLogin: new Date(),
    kycStatus: 'verified',
    kycSubmittedAt: new Date('2024-01-21'),
    isAdmin: false,
    twoFactorEnabled: true,
    emailVerified: true,
    withdrawalKey: 'WITHDRAW-EMMA-005'
  }
];

// Investment Plans
export const investmentPlans: InvestmentPlan[] = [
  {
    id: '1',
    name: 'Crypto Starter',
    description: 'Perfect for beginners looking to enter the cryptocurrency market with minimal risk.',
    minAmount: 100,
    maxAmount: 5000,
    dailyProfit: 0.5,
    monthlyProfit: 15,
    yearlyProfit: 180,
    duration: 28,
    referralBonus: 3,
    riskLevel: 'low',
    category: 'crypto',
    status: 'active',
    features: [
      'Daily profit distribution',
      'Capital protection',
      'Instant withdrawals',
      '24/7 support',
      'Real-time tracking'
    ],
    color: '#10B981'
  },
  {
    id: '2',
    name: 'Stock Growth',
    description: 'Invest in a diversified portfolio of blue-chip stocks with steady growth potential.',
    minAmount: 1000,
    maxAmount: 25000,
    dailyProfit: 0.8,
    monthlyProfit: 24,
    yearlyProfit: 288,
    duration: 28,
    referralBonus: 5,
    riskLevel: 'medium',
    category: 'stocks',
    status: 'active',
    features: [
      'Professional portfolio management',
      'Dividend reinvestment',
      'Quarterly reports',
      'Tax optimization',
      'Auto-rebalancing'
    ],
    color: '#3B82F6'
  },
  {
    id: '3',
    name: 'Forex Pro',
    description: 'Advanced forex trading with professional traders and AI-powered strategies.',
    minAmount: 5000,
    maxAmount: 100000,
    dailyProfit: 1.2,
    monthlyProfit: 36,
    yearlyProfit: 432,
    duration: 28,
    referralBonus: 7,
    riskLevel: 'high',
    category: 'forex',
    status: 'active',
    features: [
      'AI-powered trading bots',
      'Multi-currency support',
      'Leverage up to 1:100',
      'Daily market analysis',
      'Personal account manager'
    ],
    color: '#8B5CF6'
  },
  {
    id: '4',
    name: 'Gold Secure',
    description: 'Invest in precious metals and commodities for long-term wealth preservation.',
    minAmount: 2500,
    maxAmount: 50000,
    dailyProfit: 0.4,
    monthlyProfit: 12,
    yearlyProfit: 144,
    duration: 28,
    referralBonus: 4,
    riskLevel: 'low',
    category: 'commodities',
    status: 'active',
    features: [
      'Physical gold backing',
      'Inflation hedge',
      'Secure storage',
      'Insurance included',
      'Buyback guarantee'
    ],
    color: '#F59E0B'
  },
  {
    id: '5',
    name: 'Elite Portfolio',
    description: 'Premium diversified investment across all asset classes with highest returns.',
    minAmount: 10000,
    maxAmount: 500000,
    dailyProfit: 1.5,
    monthlyProfit: 45,
    yearlyProfit: 540,
    duration: 28,
    referralBonus: 10,
    riskLevel: 'high',
    category: 'mixed',
    status: 'active',
    features: [
      'Dedicated wealth manager',
      'Priority support',
      'Exclusive investment opportunities',
      'Tax planning services',
      'Monthly performance calls',
      'VIP events access'
    ],
    color: '#EF4444'
  },
  {
    id: '6',
    name: 'Green Energy',
    description: 'Sustainable investments in renewable energy and ESG-compliant companies.',
    minAmount: 2000,
    maxAmount: 30000,
    dailyProfit: 0.6,
    monthlyProfit: 18,
    yearlyProfit: 216,
    duration: 28,
    referralBonus: 4,
    riskLevel: 'medium',
    category: 'stocks',
    status: 'active',
    features: [
      'ESG compliant',
      'Carbon offset included',
      'Impact reporting',
      'Green certification',
      'Sustainable dividends'
    ],
    color: '#059669'
  }
];

// User Investments
export const userInvestments: Investment[] = [
  {
    id: 'inv-1',
    userId: '2',
    planId: '1',
    planName: 'Crypto Starter',
    amount: 5000,
    dailyProfitRate: 0.5,
    totalProfit: 1250,
    earnedProfit: 875,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2025-02-20'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv-2',
    userId: '2',
    planId: '2',
    planName: 'Stock Growth',
    amount: 15000,
    dailyProfitRate: 0.8,
    totalProfit: 3600,
    earnedProfit: 2400,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-07-14'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv-3',
    userId: '3',
    planId: '1',
    planName: 'Crypto Starter',
    amount: 10000,
    dailyProfitRate: 0.5,
    totalProfit: 2000,
    earnedProfit: 1600,
    startDate: new Date('2024-03-05'),
    endDate: new Date('2025-03-05'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv-4',
    userId: '3',
    planId: '4',
    planName: 'Gold Secure',
    amount: 10000,
    dailyProfitRate: 0.4,
    totalProfit: 1600,
    earnedProfit: 1600,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2026-02-01'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv-5',
    userId: '5',
    planId: '3',
    planName: 'Forex Pro',
    amount: 25000,
    dailyProfitRate: 1.2,
    totalProfit: 9000,
    earnedProfit: 6750,
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-04-25'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    id: 'inv-6',
    userId: '5',
    planId: '5',
    planName: 'Elite Portfolio',
    amount: 25000,
    dailyProfitRate: 1.5,
    totalProfit: 11250,
    earnedProfit: 5625,
    startDate: new Date('2024-02-10'),
    endDate: new Date('2025-02-10'),
    status: 'active',
    lastProfitUpdate: new Date(),
    nextProfitDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
  }
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: 'tx-1',
    userId: '2',
    type: 'deposit',
    amount: 25000,
    currency: 'USD',
    status: 'completed',
    description: 'Initial deposit via Bank Transfer',
    createdAt: new Date('2024-02-15'),
    processedAt: new Date('2024-02-15'),
    reference: 'DEP-20240215-001',
    method: 'Bank Transfer',
    fee: 0,
    netAmount: 25000
  },
  {
    id: 'tx-2',
    userId: '2',
    type: 'deposit',
    amount: 30000,
    currency: 'USD',
    status: 'completed',
    description: 'Deposit via Bitcoin',
    createdAt: new Date('2024-02-18'),
    processedAt: new Date('2024-02-18'),
    reference: 'DEP-20240218-002',
    method: 'Bitcoin',
    fee: 150,
    netAmount: 29850,
    txHash: '0x1234567890abcdef'
  },
  {
    id: 'tx-3',
    userId: '2',
    type: 'investment',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Crypto Starter Plan',
    createdAt: new Date('2024-02-20'),
    processedAt: new Date('2024-02-20'),
    reference: 'INV-20240220-001'
  },
  {
    id: 'tx-4',
    userId: '2',
    type: 'investment',
    amount: 15000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Stock Growth Plan',
    createdAt: new Date('2024-01-15'),
    processedAt: new Date('2024-01-15'),
    reference: 'INV-20240115-002'
  },
  {
    id: 'tx-5',
    userId: '2',
    type: 'profit',
    amount: 25,
    currency: 'USD',
    status: 'completed',
    description: 'Daily profit from Crypto Starter Plan',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reference: 'PROF-001'
  },
  {
    id: 'tx-6',
    userId: '2',
    type: 'profit',
    amount: 120,
    currency: 'USD',
    status: 'completed',
    description: 'Daily profit from Stock Growth Plan',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reference: 'PROF-002'
  },
  {
    id: 'tx-7',
    userId: '2',
    type: 'withdrawal',
    amount: 5000,
    currency: 'USD',
    status: 'completed',
    description: 'Withdrawal to Bank Account',
    createdAt: new Date('2024-03-01'),
    processedAt: new Date('2024-03-02'),
    reference: 'WIT-20240301-001',
    method: 'Bank Transfer',
    fee: 50,
    netAmount: 4950,
    withdrawalKey: 'WITHDRAW-JOHN-002'
  },
  {
    id: 'tx-8',
    userId: '3',
    type: 'deposit',
    amount: 20000,
    currency: 'USD',
    status: 'completed',
    description: 'Deposit via Ethereum',
    createdAt: new Date('2024-03-01'),
    processedAt: new Date('2024-03-01'),
    reference: 'DEP-20240301-003',
    method: 'Ethereum',
    fee: 100,
    netAmount: 19900,
    txHash: '0xabcdef1234567890'
  },
  {
    id: 'tx-9',
    userId: '3',
    type: 'investment',
    amount: 10000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Crypto Starter Plan',
    createdAt: new Date('2024-03-05'),
    processedAt: new Date('2024-03-05'),
    reference: 'INV-20240305-003'
  },
  {
    id: 'tx-10',
    userId: '3',
    type: 'investment',
    amount: 10000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Gold Secure Plan',
    createdAt: new Date('2024-02-01'),
    processedAt: new Date('2024-02-01'),
    reference: 'INV-20240201-004'
  },
  {
    id: 'tx-11',
    userId: '3',
    type: 'withdrawal',
    amount: 2000,
    currency: 'USD',
    status: 'completed',
    description: 'Withdrawal to Bank Account',
    createdAt: new Date('2024-03-15'),
    processedAt: new Date('2024-03-16'),
    reference: 'WIT-20240315-002',
    method: 'Bank Transfer',
    fee: 30,
    netAmount: 1970,
    withdrawalKey: 'WITHDRAW-SARAH-003'
  },
  {
    id: 'tx-12',
    userId: '5',
    type: 'deposit',
    amount: 50000,
    currency: 'USD',
    status: 'completed',
    description: 'Deposit via USDT',
    createdAt: new Date('2024-01-20'),
    processedAt: new Date('2024-01-20'),
    reference: 'DEP-20240120-005',
    method: 'USDT',
    fee: 250,
    netAmount: 49750,
    txHash: '0x9876543210fedcba'
  },
  {
    id: 'tx-13',
    userId: '5',
    type: 'deposit',
    amount: 35000,
    currency: 'USD',
    status: 'completed',
    description: 'Deposit via Bank Wire',
    createdAt: new Date('2024-01-22'),
    processedAt: new Date('2024-01-23'),
    reference: 'DEP-20240122-006',
    method: 'Bank Wire',
    fee: 100,
    netAmount: 34900
  },
  {
    id: 'tx-14',
    userId: '5',
    type: 'investment',
    amount: 25000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Forex Pro Plan',
    createdAt: new Date('2024-01-25'),
    processedAt: new Date('2024-01-25'),
    reference: 'INV-20240125-005'
  },
  {
    id: 'tx-15',
    userId: '5',
    type: 'investment',
    amount: 25000,
    currency: 'USD',
    status: 'completed',
    description: 'Investment in Elite Portfolio Plan',
    createdAt: new Date('2024-02-10'),
    processedAt: new Date('2024-02-10'),
    reference: 'INV-20240210-006'
  },
  {
    id: 'tx-16',
    userId: '5',
    type: 'withdrawal',
    amount: 10000,
    currency: 'USD',
    status: 'completed',
    description: 'Withdrawal to Crypto Wallet',
    createdAt: new Date('2024-02-28'),
    processedAt: new Date('2024-02-28'),
    reference: 'WIT-20240228-003',
    method: 'Bitcoin',
    fee: 100,
    netAmount: 9900,
    withdrawalKey: 'WITHDRAW-EMMA-005'
  },
  {
    id: 'tx-17',
    userId: '5',
    type: 'referral',
    amount: 500,
    currency: 'USD',
    status: 'completed',
    description: 'Referral bonus from Mike Johnson',
    createdAt: new Date('2024-03-10'),
    processedAt: new Date('2024-03-10'),
    reference: 'REF-20240310-001'
  },
  {
    id: 'tx-18',
    userId: '4',
    type: 'deposit',
    amount: 10000,
    currency: 'USD',
    status: 'pending',
    description: 'Deposit via Bitcoin - Awaiting Confirmation',
    createdAt: new Date('2024-03-10'),
    reference: 'DEP-20240310-007',
    method: 'Bitcoin',
    fee: 50,
    netAmount: 9950,
    txHash: '0x pending...'
  }
];

// Payment Methods
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    name: 'Bitcoin',
    type: 'crypto',
    icon: 'bitcoin',
    minAmount: 100,
    maxAmount: 100000,
    fee: 0.5,
    feeType: 'percentage',
    processingTime: '10-60 minutes',
    supportedCurrencies: ['BTC', 'USD'],
    status: 'active',
    instructions: 'Send Bitcoin to the provided address. Funds will be credited after 3 confirmations.'
  },
  {
    id: 'pm-2',
    name: 'Ethereum',
    type: 'crypto',
    icon: 'ethereum',
    minAmount: 100,
    maxAmount: 100000,
    fee: 0.5,
    feeType: 'percentage',
    processingTime: '5-30 minutes',
    supportedCurrencies: ['ETH', 'USD'],
    status: 'active',
    instructions: 'Send Ethereum to the provided address. Funds will be credited after 12 confirmations.'
  },
  {
    id: 'pm-3',
    name: 'USDT (TRC20)',
    type: 'crypto',
    icon: 'usdt',
    minAmount: 50,
    maxAmount: 500000,
    fee: 1,
    feeType: 'fixed',
    processingTime: '1-5 minutes',
    supportedCurrencies: ['USDT', 'USD'],
    status: 'active',
    instructions: 'Send USDT on TRC20 network to the provided address.'
  },
  {
    id: 'pm-4',
    name: 'Bank Transfer',
    type: 'bank',
    icon: 'bank',
    minAmount: 500,
    maxAmount: 100000,
    fee: 0,
    feeType: 'fixed',
    processingTime: '1-3 business days',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    status: 'active',
    instructions: 'Transfer funds to our bank account using the provided details.'
  },
  {
    id: 'pm-5',
    name: 'Bank Wire',
    type: 'bank',
    icon: 'wire',
    minAmount: 1000,
    maxAmount: 500000,
    fee: 25,
    feeType: 'fixed',
    processingTime: '1-2 business days',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    status: 'active',
    instructions: 'Send an international wire transfer using the provided SWIFT code.'
  },
  {
    id: 'pm-6',
    name: 'Credit/Debit Card',
    type: 'card',
    icon: 'card',
    minAmount: 50,
    maxAmount: 10000,
    fee: 2.5,
    feeType: 'percentage',
    processingTime: 'Instant',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    status: 'active',
    instructions: 'Enter your card details securely. 3D Secure verification may be required.'
  }
];

// Market Assets
export const marketAssets: MarketAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67245.32,
    change24h: 1256.78,
    changePercent24h: 1.91,
    volume24h: 32500000000,
    marketCap: 1320000000000,
    high24h: 68500.00,
    low24h: 65800.50,
    type: 'crypto'
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3521.45,
    change24h: 45.23,
    changePercent24h: 1.30,
    volume24h: 15000000000,
    marketCap: 423000000000,
    high24h: 3580.00,
    low24h: 3450.75,
    type: 'crypto'
  },
  {
    id: 'aapl',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.35,
    change24h: 2.15,
    changePercent24h: 1.22,
    volume24h: 45000000,
    marketCap: 2750000000000,
    high24h: 179.50,
    low24h: 176.20,
    type: 'stock'
  },
  {
    id: 'msft',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 421.78,
    change24h: 5.42,
    changePercent24h: 1.30,
    volume24h: 28000000,
    marketCap: 3130000000000,
    high24h: 425.00,
    low24h: 416.50,
    type: 'stock'
  },
  {
    id: 'googl',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 165.89,
    change24h: -1.23,
    changePercent24h: -0.74,
    volume24h: 22000000,
    marketCap: 2050000000000,
    high24h: 168.50,
    low24h: 164.80,
    type: 'stock'
  },
  {
    id: 'tsla',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 242.15,
    change24h: 8.75,
    changePercent24h: 3.75,
    volume24h: 98000000,
    marketCap: 770000000000,
    high24h: 248.00,
    low24h: 235.50,
    type: 'stock'
  },
  {
    id: 'gold',
    symbol: 'XAU',
    name: 'Gold',
    price: 2185.40,
    change24h: 12.30,
    changePercent24h: 0.57,
    volume24h: 150000000,
    high24h: 2190.00,
    low24h: 2170.50,
    type: 'commodity'
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: 1.0845,
    change24h: 0.0023,
    changePercent24h: 0.21,
    volume24h: 85000000000,
    high24h: 1.0860,
    low24h: 1.0815,
    type: 'forex'
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    price: 1.2654,
    change24h: -0.0045,
    changePercent24h: -0.35,
    volume24h: 45000000000,
    high24h: 1.2710,
    low24h: 1.2620,
    type: 'forex'
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 145.78,
    change24h: 7.23,
    changePercent24h: 5.22,
    volume24h: 2800000000,
    marketCap: 65000000000,
    high24h: 152.00,
    low24h: 138.50,
    type: 'crypto'
  }
];

// Portfolio Holdings
export const portfolioHoldings: PortfolioHolding[] = [
  {
    id: 'ph-1',
    userId: '2',
    assetId: 'btc',
    assetName: 'Bitcoin',
    assetSymbol: 'BTC',
    quantity: 0.045,
    averageBuyPrice: 65000.00,
    currentPrice: 67245.32,
    totalValue: 3026.04,
    totalCost: 2925.00,
    unrealizedProfit: 101.04,
    unrealizedProfitPercent: 3.45,
    allocation: 8.65
  },
  {
    id: 'ph-2',
    userId: '2',
    assetId: 'eth',
    assetName: 'Ethereum',
    assetSymbol: 'ETH',
    quantity: 1.2,
    averageBuyPrice: 3400.00,
    currentPrice: 3521.45,
    totalValue: 4225.74,
    totalCost: 4080.00,
    unrealizedProfit: 145.74,
    unrealizedProfitPercent: 3.57,
    allocation: 12.07
  },
  {
    id: 'ph-3',
    userId: '2',
    assetId: 'aapl',
    assetName: 'Apple Inc.',
    assetSymbol: 'AAPL',
    quantity: 50,
    averageBuyPrice: 175.00,
    currentPrice: 178.35,
    totalValue: 8917.50,
    totalCost: 8750.00,
    unrealizedProfit: 167.50,
    unrealizedProfitPercent: 1.91,
    allocation: 25.48
  },
  {
    id: 'ph-4',
    userId: '2',
    assetId: 'msft',
    assetName: 'Microsoft Corporation',
    assetSymbol: 'MSFT',
    quantity: 30,
    averageBuyPrice: 415.00,
    currentPrice: 421.78,
    totalValue: 12653.40,
    totalCost: 12450.00,
    unrealizedProfit: 203.40,
    unrealizedProfitPercent: 1.63,
    allocation: 36.15
  },
  {
    id: 'ph-5',
    userId: '2',
    assetId: 'tsla',
    assetName: 'Tesla Inc.',
    assetSymbol: 'TSLA',
    quantity: 20,
    averageBuyPrice: 235.00,
    currentPrice: 242.15,
    totalValue: 4843.00,
    totalCost: 4700.00,
    unrealizedProfit: 143.00,
    unrealizedProfitPercent: 3.04,
    allocation: 13.84
  },
  {
    id: 'ph-6',
    userId: '5',
    assetId: 'btc',
    assetName: 'Bitcoin',
    assetSymbol: 'BTC',
    quantity: 0.15,
    averageBuyPrice: 64000.00,
    currentPrice: 67245.32,
    totalValue: 10086.80,
    totalCost: 9600.00,
    unrealizedProfit: 486.80,
    unrealizedProfitPercent: 5.07,
    allocation: 20.17
  },
  {
    id: 'ph-7',
    userId: '5',
    assetId: 'gold',
    assetName: 'Gold',
    assetSymbol: 'XAU',
    quantity: 2.5,
    averageBuyPrice: 2150.00,
    currentPrice: 2185.40,
    totalValue: 5463.50,
    totalCost: 5375.00,
    unrealizedProfit: 88.50,
    unrealizedProfitPercent: 1.65,
    allocation: 10.93
  }
];

// Support Tickets
export const supportTickets: SupportTicket[] = [
  {
    id: 'tk-1',
    userId: '2',
    userName: 'John Doe',
    subject: 'Deposit not showing in account',
    message: 'I made a Bitcoin deposit 2 hours ago but it is not showing in my account. Transaction hash: 0x1234567890abcdef',
    category: 'billing',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T11:45:00'),
    replies: [
      {
        id: 'tr-1',
        ticketId: 'tk-1',
        userId: '1',
        userName: 'Support Team',
        isAdmin: true,
        message: 'Thank you for contacting us. We are looking into your deposit and will update you shortly.',
        createdAt: new Date('2024-03-15T11:45:00')
      }
    ]
  },
  {
    id: 'tk-2',
    userId: '3',
    userName: 'Sarah Smith',
    subject: 'KYC Verification Status',
    message: 'I submitted my KYC documents 3 days ago. Could you please check the status?',
    category: 'account',
    priority: 'medium',
    status: 'resolved',
    createdAt: new Date('2024-03-12T14:20:00'),
    updatedAt: new Date('2024-03-13T09:15:00'),
    replies: [
      {
        id: 'tr-2',
        ticketId: 'tk-2',
        userId: '1',
        userName: 'Support Team',
        isAdmin: true,
        message: 'Your KYC has been approved. You can now access all features.',
        createdAt: new Date('2024-03-13T09:15:00')
      }
    ]
  },
  {
    id: 'tk-3',
    userId: '5',
    userName: 'Emma Wilson',
    subject: 'Withdrawal delay',
    message: 'My withdrawal has been pending for 24 hours. Please help.',
    category: 'billing',
    priority: 'urgent',
    status: 'open',
    createdAt: new Date('2024-03-18T08:00:00'),
    updatedAt: new Date('2024-03-18T08:00:00'),
    replies: []
  }
];

// Educational Content
export const educationalContent: EducationalContent[] = [
  {
    id: 'edu-1',
    title: 'Introduction to Cryptocurrency Investing',
    description: 'Learn the basics of cryptocurrency, blockchain technology, and how to start investing safely.',
    content: 'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security...',
    type: 'article',
    category: 'Crypto Basics',
    difficulty: 'beginner',
    thumbnail: '/images/edu-crypto-basics.jpg',
    duration: '15 min read',
    createdAt: new Date('2024-01-15'),
    views: 15420
  },
  {
    id: 'edu-2',
    title: 'Stock Market Fundamentals',
    description: 'Understanding how the stock market works, key terminology, and investment strategies.',
    content: 'The stock market is where buyers and sellers trade shares of publicly listed companies...',
    type: 'video',
    category: 'Stock Market',
    difficulty: 'beginner',
    thumbnail: '/images/edu-stocks.jpg',
    duration: '25 min',
    createdAt: new Date('2024-01-20'),
    views: 12350
  },
  {
    id: 'edu-3',
    title: 'Risk Management in Trading',
    description: 'Essential risk management techniques to protect your investment portfolio.',
    content: 'Risk management is crucial for long-term trading success...',
    type: 'article',
    category: 'Trading',
    difficulty: 'intermediate',
    thumbnail: '/images/edu-risk.jpg',
    duration: '20 min read',
    createdAt: new Date('2024-02-01'),
    views: 8920
  },
  {
    id: 'edu-4',
    title: 'Technical Analysis Masterclass',
    description: 'Deep dive into chart patterns, indicators, and technical trading strategies.',
    content: 'Technical analysis involves studying past market data to predict future price movements...',
    type: 'video',
    category: 'Technical Analysis',
    difficulty: 'advanced',
    thumbnail: '/images/edu-technical.jpg',
    duration: '45 min',
    createdAt: new Date('2024-02-15'),
    views: 6750
  },
  {
    id: 'edu-5',
    title: 'Investment Risk Assessment Quiz',
    description: 'Test your knowledge of investment risks and learn your risk tolerance profile.',
    content: 'Quiz content...',
    type: 'quiz',
    category: 'Risk Assessment',
    difficulty: 'beginner',
    thumbnail: '/images/edu-quiz.jpg',
    duration: '10 min',
    createdAt: new Date('2024-03-01'),
    views: 9870
  }
];

// Admin Actions
export const adminActions: AdminAction[] = [
  {
    id: 'act-1',
    adminId: '1',
    adminName: 'System Administrator',
    action: 'user_status_change',
    targetUserId: '4',
    targetUserName: 'Mike Johnson',
    targetType: 'user',
    details: 'Changed user status from pending to active',
    oldValue: 'pending',
    newValue: 'active',
    createdAt: new Date('2024-03-10T12:00:00'),
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-2',
    adminId: '1',
    adminName: 'System Administrator',
    action: 'add_funds',
    targetUserId: '2',
    targetUserName: 'John Doe',
    targetType: 'user',
    details: 'Added bonus funds to user account',
    amount: 500,
    createdAt: new Date('2024-03-12T15:30:00'),
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-3',
    adminId: '1',
    adminName: 'System Administrator',
    action: 'kyc_approve',
    targetUserId: '3',
    targetUserName: 'Sarah Smith',
    targetType: 'kyc',
    details: 'Approved KYC verification',
    createdAt: new Date('2024-03-13T09:15:00'),
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-4',
    adminId: '1',
    adminName: 'System Administrator',
    action: 'profit_adjustment',
    targetUserId: '5',
    targetUserName: 'Emma Wilson',
    targetType: 'user',
    details: 'Increased daily profit rate for Forex Pro investment',
    amount: 150,
    createdAt: new Date('2024-03-15T11:00:00'),
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-5',
    adminId: '1',
    adminName: 'System Administrator',
    action: 'withdrawal_approve',
    targetUserId: '2',
    targetUserName: 'John Doe',
    targetType: 'transaction',
    details: 'Approved withdrawal request',
    amount: 5000,
    createdAt: new Date('2024-03-16T14:20:00'),
    ipAddress: '192.168.1.1'
  }
];

// Notifications
export const notifications: Notification[] = [
  {
    id: 'not-1',
    userId: '2',
    title: 'Deposit Successful',
    message: 'Your deposit of $30,000 via Bitcoin has been confirmed.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    link: '/transactions'
  },
  {
    id: 'not-2',
    userId: '2',
    title: 'Daily Profit Credited',
    message: 'You earned $145.00 in profit today from your investments.',
    type: 'success',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    link: '/portfolio'
  },
  {
    id: 'not-3',
    userId: '2',
    title: 'KYC Verified',
    message: 'Your identity verification has been approved.',
    type: 'success',
    read: true,
    createdAt: new Date('2024-02-17'),
    link: '/profile'
  },
  {
    id: 'not-4',
    userId: '2',
    title: 'Security Alert',
    message: 'New login detected from Chrome on Windows.',
    type: 'warning',
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    link: '/security'
  },
  {
    id: 'not-5',
    userId: '3',
    title: 'Investment Matured',
    message: 'Your Crypto Starter investment has completed its term.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    link: '/investments'
  }
];

// Dashboard Stats
export const adminDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  newUsersToday: 15,
  totalInvestments: 3420,
  activeInvestments: 2856,
  totalDeposits: 15850000,
  pendingDeposits: 125000,
  totalWithdrawals: 4200000,
  pendingWithdrawals: 185000,
  todayProfit: 45000,
  totalProfitPaid: 2100000,
  totalFees: 315000,
  platformBalance: 11350000
};

// User Dashboard Stats
export const getUserDashboardStats = (userId: string): UserDashboardStats => {
  const user = mockUsers.find(u => u.id === userId);
  const userInvests = userInvestments.filter(inv => inv.userId === userId && inv.status === 'active');
  const userTxs = transactions.filter(tx => tx.userId === userId);

  const todayProfit = userInvests.reduce((sum, inv) => {
    const dailyProfit = (inv.amount * inv.dailyProfitRate) / 100;
    return sum + dailyProfit;
  }, 0);

  return {
    totalBalance: user?.balance || 0,
    availableBalance: user?.availableBalance || 0,
    investedAmount: user?.investedAmount || 0,
    totalProfit: user?.totalProfit || 0,
    todayProfit: todayProfit,
    totalWithdrawn: user?.totalWithdrawn || 0,
    totalDeposited: user?.totalDeposited || 0,
    activeInvestments: userInvests.length,
    pendingTransactions: userTxs.filter(tx => tx.status === 'pending').length,
    profitChange24h: 2.35,
    profitChange7d: 8.42,
    profitChange30d: 15.78
  };
};

// Helper functions
export const getUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};

export const getUserTransactions = (userId: string): Transaction[] => {
  return transactions.filter(tx => tx.userId === userId).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
};

export const getUserInvestments = (userId: string): Investment[] => {
  return userInvestments.filter(inv => inv.userId === userId).sort((a, b) =>
    b.startDate.getTime() - a.startDate.getTime()
  );
};

export const getUserNotifications = (userId: string): Notification[] => {
  return notifications.filter(n => n.userId === userId).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
};

export const getUserPortfolio = (userId: string): PortfolioHolding[] => {
  return portfolioHoldings.filter(ph => ph.userId === userId);
};
