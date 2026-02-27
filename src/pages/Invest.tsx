import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle,
  ChevronRight,
  Info,
  Wallet,
  ShieldAlert,
  AlertTriangle,
  Receipt,
  Printer,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { investmentApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function Invest() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    setLoadingPlans(true);
    investmentApi.getPlans()
      .then(({ data }) => {
        setInvestmentPlans(data.plans || []);
      })
      .catch(err => {
        console.error('Failed to load investment plans:', err);
        setInvestmentPlans([]);
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, []);

  const handleInvest = (plan: any) => {
    if ((user?.availableBalance || 0) < plan.minAmount) {
      setSelectedPlan(plan);
      setShowInsufficientFunds(true);
      // Auto-redirect to deposit after 3 seconds
      setTimeout(() => {
        setShowInsufficientFunds(false);
        navigate('/dashboard/deposit');
      }, 3000);
      return;
    }
    setSelectedPlan(plan);
    setInvestAmount(plan.minAmount.toString());
    setShowConfirm(true);
  };

  const handleConfirmInvest = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      await investmentApi.create({ planId: selectedPlan.id, amount: parseFloat(investAmount) });
      setShowConfirm(false);

      await refreshUser();

      // Success notification
      const { toast } = await import('sonner');
      toast.success('Investment Successful!', {
        description: `Your investment of $${parseFloat(investAmount).toLocaleString()} has been processed.`,
      });

      // Reset form
      setInvestAmount('');
      setShowConfirm(false); // Corrected from setShowConfirmDialog

      setReceiptData({
        planName: selectedPlan.name,
        amount: parseFloat(investAmount),
        dailyProfit: selectedPlan.dailyProfit,
        duration: selectedPlan.duration,
        endDate: new Date(Date.now() + selectedPlan.duration * 24 * 60 * 60 * 1000).toLocaleDateString(),
        reference: `INV-${Date.now()}`
      });
      setShowReceipt(true);

      setSelectedPlan(null);
      setInvestAmount('');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create investment');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100';
    }
  };

  if (authLoading || loadingPlans) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading investment environment...</p>
      </div>
    );
  }

  if (user?.kycStatus !== 'VERIFIED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Identity Verification Required</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          To ensure the security of your funds and comply with financial regulations, you must verify your identity before you can invest.
        </p>
        <Link to="/dashboard/kyc">
          <Button className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700">
            Verify Identity Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Investment Plans</h1>
        <p className="text-gray-500">Choose a plan that fits your financial goals</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-blue-100/80 text-sm font-medium tracking-wide">Available for Investment</p>
              <h2 className="text-4xl font-black tracking-tight tracking-tighter">
                ${(user?.availableBalance || 0).toLocaleString()}
              </h2>
            </div>
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
              <Wallet className="w-8 h-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Grid */}
      <div className="space-y-6">
        {investmentPlans.filter(p => p.status?.toLowerCase() === 'active').length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No active plans found</h3>
            <p className="text-sm text-gray-500 max-w-xs text-center mt-1">
              There are currently no active investment plans available. Please check back later or contact support.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {investmentPlans.filter(p => p.status?.toLowerCase() === 'active').map((plan) => (
              <Card
                key={plan.id}
                className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 border-none shadow-lg hover:shadow-2xl bg-white/80 backdrop-blur-xl ring-1 ring-gray-200/50 ${plan.popular ? 'ring-2 ring-blue-500/50 shadow-blue-500/10' : ''}`}
              >
                {/* Animated Background Blob */}
                <div
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ backgroundColor: plan.color }}
                />

                {plan.popular && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-xl shadow-lg shadow-blue-600/20">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* New/Limited Badge logic */}
                {plan.createdAt && new Date(plan.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 && (
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-2 py-0 text-[10px] uppercase font-bold tracking-tighter">New</Badge>
                  </div>
                )}

                <CardHeader className="relative pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                      style={{ backgroundColor: (plan.color || '#3B82F6') + '15' }}
                    >
                      <TrendingUp className="w-7 h-7" style={{ color: plan.color || '#3B82F6' }} />
                    </div>
                    <Badge className={`${getRiskColor(plan.riskLevel)} border-opacity-20 backdrop-blur-md uppercase text-[10px] font-black tracking-widest px-3 py-1 shadow-sm`}>
                      {plan.riskLevel} Risk
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-gray-900 leading-tight">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-2 leading-relaxed italic">
                    {plan.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50 shadow-inner group-hover:bg-white transition-colors duration-500">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-4xl font-black tracking-tighter" style={{ color: plan.color || '#3B82F6' }}>
                        {plan.dailyProfit || 0}%
                      </span>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Daily ROI</span>
                    </div>
                    <div className="h-1 w-full bg-gray-200/50 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min((plan.dailyProfit || 0) * 10, 100)}%`, backgroundColor: plan.color || '#3B82F6' }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min Entry</p>
                      <p className="text-base font-bold text-gray-800">${(plan.minAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Max Cap</p>
                      <p className="text-base font-bold text-gray-800">${(plan.maxAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maturity</p>
                      <p className="text-base font-bold text-gray-800">{(plan.duration || 0)} Days</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Affiliate</p>
                      <p className="text-base font-bold text-emerald-600">+{(plan.referralBonus || 0)}%</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {(plan.features || []).slice(0, 3).map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-emerald-50 shadow-sm border border-emerald-100">
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        </div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button
                    className="w-full h-14 rounded-2xl text-base font-black tracking-tight shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group-hover:shadow-2xl"
                    style={{
                      backgroundColor: plan.color || '#3B82F6',
                      boxShadow: `0 10px 30px -10px ${(plan.color || '#3B82F6')}60`
                    }}
                    onClick={() => handleInvest(plan)}
                  >
                    Launch Investment
                    <ChevronRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          All investments are subject to market risks. Please read our risk disclosure before investing.
        </AlertDescription>
      </Alert>

      {/* Insufficient Funds Dialog */}
      <Dialog open={showInsufficientFunds} onOpenChange={setShowInsufficientFunds}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Insufficient Funds
            </DialogTitle>
            <DialogDescription>
              You don't have enough balance to invest in {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Your Available Balance</span>
                <span className="font-bold text-red-600">${(user?.availableBalance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Required</span>
                <span className="font-bold text-gray-900">${selectedPlan?.minAmount?.toLocaleString() || '0'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Redirecting you to the deposit page in 3 seconds...
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInsufficientFunds(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => { setShowInsufficientFunds(false); navigate('/dashboard/deposit'); }}
            >
              Deposit Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invest Confirm Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Investment</DialogTitle>
            <DialogDescription>
              You are about to invest in {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Investment Amount (USD)</label>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                min={selectedPlan?.minAmount}
                max={Math.min(selectedPlan?.maxAmount || 0, user?.availableBalance || 0)}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Min: ${selectedPlan?.minAmount} | Max: ${Math.min(selectedPlan?.maxAmount || 0, user?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Daily Profit</span>
                <span className="font-medium">{selectedPlan?.dailyProfit}%</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Expected Daily Return</span>
                <span className="font-medium text-green-600">
                  ${((parseFloat(investAmount) * (selectedPlan?.dailyProfit || 0)) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{selectedPlan?.duration} days</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500 font-medium">Expected Total Return</span>
                <span className="font-bold text-green-600">
                  ${((parseFloat(investAmount) * (selectedPlan?.dailyProfit || 0) / 100) * (selectedPlan?.duration || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInvest}
              disabled={!investAmount || parseFloat(investAmount) < (selectedPlan?.minAmount || 0) || submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investment Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Investment Successful!</h2>
            <p className="text-sm text-gray-500 mt-1">Your investment has been created</p>
          </div>

          {receiptData && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">Investment Receipt</span>
                </div>
                <span className="text-xs text-gray-400">#{receiptData.reference?.slice(-8)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium">{receiptData.planName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category</span>
                <span className="font-medium capitalize">{receiptData.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Risk Level</span>
                <span className="font-medium capitalize">{receiptData.riskLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Invested</span>
                <span className="font-bold text-gray-900">${receiptData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Daily Profit Rate</span>
                <span className="font-medium text-green-600">{receiptData.dailyProfit}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expected Daily Return</span>
                <span className="font-medium text-green-600">${receiptData.dailyReturn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{receiptData.duration} days</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-medium text-gray-700">Expected Total Return</span>
                <span className="font-bold text-green-600">${receiptData.totalReturn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{receiptData.date}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => { setShowReceipt(false); navigate('/dashboard/portfolio'); }}
            >
              View Portfolio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
