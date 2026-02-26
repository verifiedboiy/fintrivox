import { useState, useEffect } from 'react';
import {
  Wallet,
  Bitcoin,
  Building2,
  Lock,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Shield,
  Key,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { paymentMethodApi } from '@/services/api';

export default function Withdraw() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalKey, setWithdrawalKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [step, setStep] = useState<'select' | 'details' | 'key' | 'confirm'>('select');
  const [copied, setCopied] = useState(false);
  const [showKeyError, setShowKeyError] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([
    { id: 'def-1', name: 'Bitcoin', type: 'crypto', icon: 'bitcoin', minAmount: 50, maxAmount: 1000000, fee: 0, feeType: 'percentage', processingTime: '10-30 mins', status: 'active' },
    { id: 'def-2', name: 'Ethereum', type: 'crypto', icon: 'ethereum', minAmount: 50, maxAmount: 500000, fee: 0, feeType: 'percentage', processingTime: '5-15 mins', status: 'active' },
    { id: 'def-3', name: 'USDT (TRC20)', type: 'crypto', icon: 'usdt', minAmount: 10, maxAmount: 1000000, fee: 1, feeType: 'fixed', processingTime: '1-5 mins', status: 'active' },
    { id: 'def-4', name: 'Bank Transfer', type: 'bank', icon: 'bank', minAmount: 100, maxAmount: 500000, fee: 0.5, feeType: 'percentage', processingTime: '1-3 days', status: 'active' },
    { id: 'def-5', name: 'Credit/Debit Card', type: 'card', icon: 'card', minAmount: 10, maxAmount: 10000, fee: 2.5, feeType: 'percentage', processingTime: 'Instant', status: 'active' }
  ]);

  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    paymentMethodApi.list().then(({ data }) => {
      if (data.methods && data.methods.length > 0) {
        setPaymentMethods(data.methods);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    let timer: any;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setStep('key');
      setCountdown(5);
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  // KYC Check is now handled inline to allow seeing methods
  const isKycVerified = user?.kycStatus === 'VERIFIED';

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedMethod);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  const handleCopyKey = () => {
    if (user?.withdrawalKey) {
      navigator.clipboard.writeText(user.withdrawalKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProceedToKey = () => {
    setIsCountingDown(true);
    setCountdown(5);
  };

  const handleVerifyKey = () => {
    // In a real app, verify the withdrawal key
    if (withdrawalKey && withdrawalKey === user?.withdrawalKey) {
      setStep('confirm');
    } else {
      setShowKeyError(true);
      setTimeout(() => setShowKeyError(false), 5000);
    }
  };



  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'bitcoin':
      case 'ethereum':
      case 'usdt':
        return <Bitcoin className="w-6 h-6" />;
      case 'bank':
      case 'wire':
        return <Building2 className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  const maxWithdrawable = Math.max(0, (user?.totalProfit || 0));

  if (isCountingDown) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-amber-100 bg-amber-50/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Shield className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h2>
            <p className="text-gray-600 mb-8">
              Preparing secure withdrawal tunnel. Please wait...
            </p>
            <div className="text-6xl font-bold text-amber-600 mb-4 tabular-nums">
              {countdown}
            </div>
            <p className="text-sm text-amber-700 font-medium">
              Mandatory security hold for your protection
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your withdrawal request of ${amount} is being processed.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Method</span>
                <span className="font-medium">{selectedPaymentMethod?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium">
                  {selectedPaymentMethod?.feeType === 'percentage'
                    ? `${selectedPaymentMethod.fee}%`
                    : `$${selectedPaymentMethod?.fee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">You Will Receive</span>
                <span className="font-bold text-green-600">
                  ${(parseFloat(amount) * (1 - (selectedPaymentMethod?.feeType === 'percentage' ? selectedPaymentMethod.fee / 100 : 0)) - (selectedPaymentMethod?.feeType === 'fixed' ? selectedPaymentMethod.fee : 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <Alert className="mb-6">
              <Clock className="w-4 h-4" />
              <AlertDescription>
                Processing time: {selectedPaymentMethod?.processingTime}
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                Make Another Withdrawal
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = '/dashboard/transactions'}>
                View Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-500">Withdraw your funds securely</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 mb-1">Profit Available for Withdrawal</p>
              <h2 className="text-3xl font-bold">${maxWithdrawable.toLocaleString()}</h2>
              <p className="text-sm text-green-200 mt-1">
                Total Balance: ${user?.balance.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Key Info */}
      <Alert className="bg-amber-50 border-amber-200">
        <Key className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <span className="font-semibold">Security Notice:</span> Withdrawals require your unique withdrawal key for verification.
          Never share this key with anyone.
        </AlertDescription>
      </Alert>

      {!isKycVerified && (
        <Alert className="bg-blue-50 border-blue-200">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-800 flex items-center justify-between">
            <span className="text-sm">Please verify your identity to enable withdrawals.</span>
            <Link to="/dashboard/kyc">
              <Button size="sm" variant="outline" className="h-8 border-blue-300">Verify Now</Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {step === 'select' ? (
        <>
          {/* Withdrawal Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Withdrawal Method</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paymentMethods.filter(pm => pm.status === 'active').map((method) => {
                const isCard = method.type === 'card' || method.name.toLowerCase().includes('card');
                return (
                  <Card
                    key={method.id}
                    className="cursor-pointer transition-all hover:border-green-500 hover:shadow-lg"
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                          {getMethodIcon(method.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{method.name}</h4>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Min: $100 | Max: ${method.maxAmount.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-3 text-sm">
                            <Badge variant="secondary">
                              Fee: {method.feeType === 'percentage' ? `${method.fee}%` : `$${method.fee}`}
                            </Badge>
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {method.processingTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      ) : step === 'details' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('select')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <CardTitle>Withdraw via {selectedPaymentMethod?.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">Withdrawal Amount (USD)</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 text-lg"
                  min={100}
                  max={Math.min(selectedPaymentMethod?.maxAmount || 0, maxWithdrawable)}
                />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-sm text-gray-500 mt-1">
                  Min: $100 | Max: ${Math.min(selectedPaymentMethod?.maxAmount || 0, maxWithdrawable).toLocaleString()}
                </p>
                <button
                  onClick={() => setAmount(maxWithdrawable.toString())}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Withdrawal Address */}
            <div>
              <Label htmlFor="address">
                {selectedPaymentMethod?.type === 'crypto' ? 'Wallet Address' : 'Bank Account Details'}
              </Label>
              <Input
                id="address"
                placeholder={selectedPaymentMethod?.type === 'crypto' ? 'Enter your wallet address...' : 'Enter your bank account...'}
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                className="mt-2"
              />
              <Alert className="mt-3">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Double-check your address. Transactions cannot be reversed.
                </AlertDescription>
              </Alert>
            </div>

            {/* Summary */}
            {amount && (
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Withdrawal Amount</span>
                  <span className="font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Fee</span>
                  <span className="font-medium">
                    {selectedPaymentMethod?.feeType === 'percentage'
                      ? `$${(parseFloat(amount) * selectedPaymentMethod.fee / 100).toFixed(2)} (${selectedPaymentMethod.fee}%)`
                      : `$${selectedPaymentMethod?.fee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">You Will Receive</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${(parseFloat(amount) * (1 - (selectedPaymentMethod?.feeType === 'percentage' ? selectedPaymentMethod.fee / 100 : 0)) - (selectedPaymentMethod?.feeType === 'fixed' ? selectedPaymentMethod.fee : 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-green-600 hover:bg-green-700 h-12"
              onClick={handleProceedToKey}
              disabled={!isKycVerified || !amount || parseFloat(amount) < 100 || !withdrawalAddress || parseFloat(amount) > maxWithdrawable}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isKycVerified ? 'Proceed to Security Verification' : 'Verify Identity to Withdraw'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Security Key Verification */
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('details')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-600" />
                Security Verification
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                For your security, please enter your withdrawal key to complete this transaction. If you don't have a key, you can purchase one by clicking the BUY KEY button to contact requ.est@mail.com.
              </AlertDescription>
            </Alert>

            {showKeyError && (
              <Alert className="bg-red-50 border-red-200 animate-in fade-in slide-in-from-top-4">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Invalid withdrawal key. You cannot withdraw without a valid key. Please buy a key to continue.
                </AlertDescription>
              </Alert>
            )}

            {/* Your Withdrawal Key */}
            <div className="bg-gray-50 rounded-lg p-4">
              <Label className="text-sm text-gray-500">Your Withdrawal Key:</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const subject = encodeURIComponent(`Buy Withdrawal Key - ${user?.firstName} ${user?.lastName}`);
                    const body = encodeURIComponent(
                      `Hello,\n\nI would like to purchase a withdrawal key.\n\nUser: ${user?.firstName} ${user?.lastName} (${user?.email})\nWithdrawal Amount: $${amount}\nMethod: ${selectedPaymentMethod?.name}\n\nPlease provide instructions for payment.`
                    );

                    window.location.href = `mailto:requ.est@mail.com?subject=${subject}&body=${body}`;
                  }}
                >
                  Buy Key
                </Button>
                <Input
                  value={user?.withdrawalKey || ''}
                  readOnly
                  type={showKey ? 'text' : 'password'}
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                  disabled
                  title="Locked. Buy key to unlock."
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyKey}
                  disabled
                  title="Locked. Buy key to unlock."
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>


            {/* Enter Key */}
            <div>
              <Label htmlFor="withdrawalKey">Enter Withdrawal Key</Label>
              <div className="relative mt-2">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="withdrawalKey"
                  type="password"
                  placeholder="Enter your withdrawal key..."
                  value={withdrawalKey}
                  onChange={(e) => setWithdrawalKey(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('details')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                onClick={handleVerifyKey}
                disabled={!withdrawalKey}
              >
                <Lock className="w-4 h-4 mr-2" />
                Verify & Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>
      )
      }
    </div >
  );
}
