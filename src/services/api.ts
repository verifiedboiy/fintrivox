import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://172.20.10.8:3001/api';
const API_BASE = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

// ============================================================
// Axios instance with JWT interceptors
// ============================================================

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('Fintrivox_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('Fintrivox_refresh_token');
            if (!refreshToken) {
                // No refresh token — clear everything and redirect
                localStorage.removeItem('Fintrivox_token');
                localStorage.removeItem('Fintrivox_refresh_token');
                localStorage.removeItem('Fintrivox_user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });

                localStorage.setItem('Fintrivox_token', data.accessToken);
                localStorage.setItem('Fintrivox_refresh_token', data.refreshToken);
                localStorage.setItem('Fintrivox_user', JSON.stringify(data.user));

                processQueue(null, data.accessToken);

                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('Fintrivox_token');
                localStorage.removeItem('Fintrivox_refresh_token');
                localStorage.removeItem('Fintrivox_user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
    register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; country?: string; referralCode?: string }) =>
        api.post('/auth/register', data),

    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),

    verify2FA: (tempToken: string, code: string) =>
        api.post('/auth/verify-2fa', { tempToken, code }),

    refresh: (refreshToken: string) =>
        api.post('/auth/refresh', { refreshToken }),

    logout: (refreshToken?: string) =>
        api.post('/auth/logout', { refreshToken }),

    getMe: () =>
        api.get('/auth/me'),

    sendVerification: (email: string) =>
        api.post('/auth/send-verification', { email }),

    verifyEmail: (email: string, code: string) =>
        api.post('/auth/verify-email', { email, code }),

    forgotPassword: (email: string) =>
        api.post('/auth/forgot-password', { email }),

    resetPassword: (email: string, code: string, newPassword: string) =>
        api.post('/auth/reset-password', { email, code, newPassword }),

    verifyResetCode: (email: string, code: string) =>
        api.post('/auth/verify-reset-code', { email, code }),
};

// ============================================================
// USER API
// ============================================================

export const userApi = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data: Record<string, unknown>) => api.patch('/users/profile', data),
    getDashboardStats: () => api.get('/users/dashboard-stats'),
    getInvestments: () => api.get('/users/investments'),
    getReferrals: () => api.get('/users/referrals'),
    updatePassword: (data: Record<string, unknown>) => api.patch('/users/security/password', data),
    toggle2FA: (enabled: boolean) => api.patch('/users/security/2fa', { enabled }),
    refreshWithdrawalKey: () => api.post('/users/security/refresh-key'),
    getSessions: () => api.get('/users/security/sessions'),
    terminateSession: (id: string) => api.delete(`/users/security/sessions/${id}`),
};

// ============================================================
// TRANSACTIONS API
// ============================================================

export const transactionApi = {
    list: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
        api.get('/transactions', { params }),

    get: (id: string) => api.get(`/transactions/${id}`),
};

// ============================================================
// DEPOSITS API
// ============================================================

export const depositApi = {
    create: (data: { amount: number; method: string; txHash?: string }) =>
        api.post('/deposits', data),

    list: () => api.get('/deposits'),
};

// ============================================================
// WITHDRAWALS API
// ============================================================

export const withdrawalApi = {
    create: (data: { amount: number; method: string; withdrawalKey: string; walletAddress?: string }) =>
        api.post('/withdrawals', data),

    list: () => api.get('/withdrawals'),
};

// ============================================================
// NOTIFICATIONS API
// ============================================================

export const notificationApi = {
    list: () => api.get('/notifications'),
    unreadCount: () => api.get('/notifications/unread-count'),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch('/notifications/read-all'),
};

// ============================================================
// INVESTMENTS API
// ============================================================

export const investmentApi = {
    getPlans: () => api.get('/investments/plans'),
    create: (data: { planId: string; amount: number }) => api.post('/investments', data),
};

// ============================================================
// PAYMENT METHODS API (public)
// ============================================================

export const paymentMethodApi = {
    list: () => api.get('/payment-methods'),
};

// ============================================================
// ADMIN API
// ============================================================

export const adminApi = {
    // Dashboard
    getStats: () => api.get('/admin/stats'),
    getAlerts: () => api.get('/admin/alerts'),

    // Users
    getUsers: (params?: { search?: string; status?: string; kycStatus?: string; page?: number; limit?: number }) =>
        api.get('/admin/users', { params }),

    getUser: (id: string) => api.get(`/admin/users/${id}`),

    updateUser: (id: string, data: Record<string, unknown>) =>
        api.patch(`/admin/users/${id}`, data),

    deleteUser: (id: string) =>
        api.delete(`/admin/users/${id}`),

    // Transactions
    getTransactions: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
        api.get('/admin/transactions', { params }),

    approveTransaction: (id: string) =>
        api.post(`/admin/transactions/${id}/approve`),

    denyTransaction: (id: string, reason?: string) =>
        api.post(`/admin/transactions/${id}/deny`, { reason }),

    // Audit Logs
    getAuditLogs: (params?: { page?: number; limit?: number }) =>
        api.get('/admin/audit-logs', { params }),

    // Plans
    getPlans: () => api.get('/admin/plans'),
    createPlan: (data: Record<string, unknown>) => api.post('/admin/plans', data),
    updatePlan: (id: string, data: Record<string, unknown>) => api.patch(`/admin/plans/${id}`, data),

    // Payment Methods
    getPaymentMethods: () => api.get('/admin/payment-methods'),

    // Support Tickets
    getSupportTickets: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get('/admin/support-tickets', { params }),
    replySupportTicket: (id: string, message: string) =>
        api.post(`/admin/support-tickets/${id}/reply`, { message }),
    updateSupportTicket: (id: string, data: Record<string, unknown>) =>
        api.patch(`/admin/support-tickets/${id}`, data),

    // KYC
    getKycList: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get('/admin/kyc', { params }),
    approveKyc: (userId: string) =>
        api.post(`/admin/kyc/${userId}/approve`),
    rejectKyc: (userId: string, reason: string) =>
        api.post(`/admin/kyc/${userId}/reject`, { reason }),
    deleteKycDoc: (userId: string, field: string) =>
        api.delete(`/admin/kyc/${userId}/documents/${field}`),
    wipeKycDocs: (userId: string) =>
        api.delete(`/admin/kyc/${userId}/documents`),
};

// ============================================================
// SUPPORT API (user-facing)
// ============================================================

export const supportApi = {
    create: (data: { subject: string; message: string; category?: string; priority?: string }) =>
        api.post('/support', data),
    list: () => api.get('/support'),
    reply: (id: string, message: string) =>
        api.post(`/support/${id}/reply`, { message }),
};

// ============================================================
// KYC API (user-facing)
// ============================================================

export const kycApi = {
    submit: (data: { documentType: string; documentNumber: string; frontImage: string; backImage?: string | null; selfieVideo: string }) =>
        api.post('/kyc/submit', data),
    getStatus: () => api.get('/kyc/status'),
};

export default api;

