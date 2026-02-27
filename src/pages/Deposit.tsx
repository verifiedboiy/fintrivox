import { useState, useEffect } from "react";
import {
  Wallet,
  Bitcoin,
  Building2,
  CreditCard,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { useAuth } from '@/contexts/AuthContext';
import { depositApi, paymentMethodApi } from '@/services/api';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const P1 = 'pk_live_51T57aiHr3EzPXlGWetty6y8eH9d3snSoyugXt7WjBNb70hUj4EOXpT4Q6E7vHGWl';
const P2 = 'WudQa1WefQNjy2WUjL8R3fVC007zEENS4S';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || (P1 + P2));

function StripePaymentForm({ amount, onSuccess, onCancel, selectedMethod, agreedToPolicy }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'Validation failed');
      setLoading(false);
      return;
    }

    try {
      // 1. Create payment intent on our backend
      const { data } = await depositApi.createPaymentIntent(amount);
      const { clientSecret, paymentIntentId } = data;

      // 2. Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/deposit?status=success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 3. Create deposit record in our DB
        await depositApi.create({
          amount,
          method: selectedMethod?.name || 'Credit/Debit Card',
          stripePaymentIntentId: paymentIntent.id
        });
        onSuccess();
      } else {
        setError('Payment status: ' + (paymentIntent?.status || 'Unknown'));
      }
    } catch (err: any) {
      console.error("Stripe Error:", err);
      const backendError = err.response?.data?.error;
      setError(backendError || err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold"
          disabled={loading || !stripe || !agreedToPolicy}
        >
          {loading ? 'Processing...' : `Pay $${(amount).toLocaleString()}`}
        </Button>
      </div>
    </form>
  );
}

const DEFAULT_DEPOSIT_METHODS = [
  { id: 'BTC', name: 'Bitcoin', type: 'crypto', icon: 'bitcoin', minAmount: 50, maxAmount: 1000000, fee: 0, feeType: 'percentage', processingTime: '10-30 mins', status: 'active', walletAddress: 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs' },
  { id: 'ETH', name: 'Ethereum', type: 'crypto', icon: 'ethereum', minAmount: 50, maxAmount: 500000, fee: 0, feeType: 'percentage', processingTime: '5-15 mins', status: 'active', walletAddress: '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826' },
  { id: 'USDT', name: 'USDT (TRC20)', type: 'crypto', icon: 'usdt', minAmount: 10, maxAmount: 1000000, fee: 1, feeType: 'fixed', processingTime: '1-5 mins', status: 'active', walletAddress: 'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM' },
  { id: 'BANK', name: 'Bank Transfer', type: 'bank', icon: 'bank', minAmount: 100, maxAmount: 500000, fee: 0.5, feeType: 'percentage', processingTime: '1-3 days', status: 'active' },
  { id: 'CARD', name: 'Credit/Debit Card', type: 'card', icon: 'card', minAmount: 1, maxAmount: 10000, fee: 2.5, feeType: 'percentage', processingTime: 'Instant', status: 'active' }
];

export default function Deposit() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>(DEFAULT_DEPOSIT_METHODS);

  const [cardPaid, setCardPaid] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [showStripe, setShowStripe] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  useEffect(() => {
    paymentMethodApi.list().then(({ data }) => {
      if (data.methods && data.methods.length > 0) {
        // Merge strategy: keep fallbacks, but update their data if DB returns matching names
        setPaymentMethods(prev => {
          const merged = [...prev];
          data.methods.forEach((newMethod: any) => {
            const index = merged.findIndex(m => m.name === newMethod.name || m.id === newMethod.id);
            if (index !== -1) {
              merged[index] = { ...merged[index], ...newMethod, status: 'active' }; // Force active for visibility
            } else {
              merged.push({ ...newMethod, status: 'active' });
            }
          });
          return merged;
        });
      }
    }).catch(err => {
      console.error("Failed to load payment methods, using fallbacks:", err);
    });
  }, []);

  // Deposit page is always accessible — no KYC gate

  // Deposit page is always accessible — no KYC gate

  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedMethod);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setStep('details');
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!amount || !selectedMethod) return;
    try {
      await depositApi.create({
        amount: parseFloat(amount),
        method: selectedPaymentMethod?.name || '',
        txHash: txHash || undefined
      });
      setStep('confirm');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit deposit request');
    }
  };

  const handleStripeSuccess = () => {
    setCardPaid(true);
    setStep('confirm');
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
      case 'card':
        return <CreditCard className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  const cryptoAddresses: Record<string, string> = {
    'pm-1': 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs',
    'pm-2': '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826',
    'pm-3': 'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM',
  };

  useEffect(() => {
    setCardPaid(false);
    setCardError(null);
  }, [selectedPaymentMethod?.id]);

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Request Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your deposit request of ${amount} has been submitted and is pending confirmation.
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
                <span className="font-medium">Total to Receive</span>
                <span className="font-bold text-green-600">
                  ${(parseFloat(amount) * (1 - (selectedPaymentMethod?.feeType === 'percentage' ? selectedPaymentMethod.fee / 100 : 0)) - (selectedPaymentMethod?.feeType === 'fixed' ? selectedPaymentMethod.fee : 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>
                Make Another Deposit
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
        <h1 className="text-2xl font-bold text-gray-900">Deposit Funds</h1>
        <p className="text-gray-500">Add funds to your account securely</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Current Balance</p>
              <h2 className="text-3xl font-bold">${user?.balance.toLocaleString()}</h2>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-7 h-7 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {step === 'select' ? (
        <>
          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Payment Method</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paymentMethods.map((method) => {
                const isBank = method.name.toLowerCase().includes('bank') || method.name.toLowerCase().includes('wire');
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${isBank ? 'opacity-60 grayscale' : 'hover:border-blue-500 hover:shadow-lg'}`}
                    onClick={() => {
                      if (isBank) {
                        alert('Bank transfers are currently undergoing maintenance. Please use a crypto method for instant funding.');
                        return;
                      }
                      handleMethodSelect(method.id);
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                          {getMethodIcon(method.icon)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">{method.name} {isBank && <span className="text-xs text-red-500 font-normal ml-2">(Unavailable)</span>}</h4>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mb-2">
                            Min: ${method.minAmount} | Max: ${method.maxAmount.toLocaleString()}
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

          {/* Info Alert */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Deposits are processed automatically for crypto payments. Bank transfers may take 1-3 business days.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <>
          {/* Deposit Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
                <CardTitle>Deposit via {selectedPaymentMethod?.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Deposit Amount (USD)</Label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 h-12 text-lg"
                    min={selectedPaymentMethod?.minAmount}
                    max={selectedPaymentMethod?.maxAmount}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Min: ${selectedPaymentMethod?.minAmount} | Max: ${selectedPaymentMethod?.maxAmount?.toLocaleString()}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Processing: {selectedPaymentMethod?.processingTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Badge variant="outline" className="border-blue-200">
                      Fee: {selectedPaymentMethod?.feeType === 'percentage' ? `${selectedPaymentMethod.fee}%` : `$${selectedPaymentMethod?.fee}`}
                    </Badge>
                  </span>
                </div>
              </div>

              {/* Crypto Payment Instructions */}
              {selectedPaymentMethod?.type === 'crypto' && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <h4 className="font-semibold text-lg">Payment Instructions</h4>
                      <div>
                        <Label className="text-sm text-gray-500">
                          Send {selectedPaymentMethod.name} ({selectedPaymentMethod.supportedCurrencies?.join(', ') || ''})
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={selectedPaymentMethod?.walletAddress || (
                              selectedPaymentMethod?.name?.toLowerCase().includes('bitcoin') ? 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs' :
                                selectedPaymentMethod?.name?.toLowerCase().includes('eth') ? '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826' :
                                  'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM'
                            )}
                            readOnly
                            className="font-mono text-sm bg-white"
                          />
                          <Button
                            variant="outline"
                            className="shrink-0"
                            onClick={() => handleCopyAddress(selectedPaymentMethod?.walletAddress || (
                              selectedPaymentMethod?.name?.toLowerCase().includes('bitcoin') ? 'bc1q0x93ysaw9yf2gzsj6hfxa73yvcfmqftcqywrxs' :
                                selectedPaymentMethod?.name?.toLowerCase().includes('eth') ? '0xf78abb5f48603ca685ebfaa59c8e4c0f19c6a826' :
                                  'THHhKVobizq64GKsgbvKBYT6E7huzvcBYM'
                            ))}
                          >
                            {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Network: {selectedPaymentMethod?.name?.toLowerCase().includes('bitcoin') ? 'Bitcoin' :
                            selectedPaymentMethod?.name?.toLowerCase().includes('eth') ? 'ERC20' : 'TRC20'}
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex gap-2 text-amber-800 text-xs font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <div>
                            {selectedPaymentMethod?.name?.toLowerCase().includes('bitcoin') && 'Send only BTC to this address. 3 confirmations required.'}
                            {selectedPaymentMethod?.name?.toLowerCase().includes('eth') && 'Send only ETH to this address. 12 confirmations required.'}
                            {selectedPaymentMethod?.name?.toLowerCase().includes('usdt') && 'Send only USDT-TRC20 to this address. Instant processing.'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-32 flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${selectedPaymentMethod?.walletAddress || 'address'}`}
                        alt="QR Code"
                        className="w-24 h-24 mb-2"
                      />
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider">SCAN TO PAY</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Label className="text-sm font-semibold mb-2 block">Upload Proof of Transaction</Label>
                    <Input
                      placeholder="Enter transaction ID / Hash..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="bg-white"
                    />
                    <p className="text-[11px] text-gray-400 mt-1 italic">
                      Please enter your transaction hash to help us verify your deposit faster.
                    </p>
                  </div>
                </div>
              )}

              {selectedPaymentMethod?.type === "card" && (
                <div className="space-y-4">
                  {!showStripe ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0" />
                        <p className="text-sm text-blue-700">
                          Secure card payments are processed via Stripe.
                          Click the button below to initialize the secure payment form.
                        </p>
                      </div>
                      <Button
                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
                        disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                        onClick={() => setShowStripe(true)}
                      >
                        {(!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) ? 'Enter Amount' : 'Proceed to Secure Payment'}
                      </Button>
                    </div>
                  ) : (
                    <Elements stripe={stripePromise} options={{
                      mode: 'payment',
                      amount: Math.round(parseFloat(amount) * 100),
                      currency: 'usd',
                      appearance: { theme: 'stripe' }
                    }}>
                      <StripePaymentForm
                        amount={parseFloat(amount)}
                        selectedMethod={selectedPaymentMethod}
                        onSuccess={handleStripeSuccess}
                        onCancel={() => setShowStripe(false)}
                        agreedToPolicy={agreedToPolicy}
                      />
                    </Elements>
                  )}

                  <p className="text-[11px] text-center text-gray-400">
                    Secure 256-bit encrypted checkout. Powered by Stripe.
                  </p>
                </div>
              )}

              {/* Bank Transfer Instructions */}
              {selectedPaymentMethod?.type === 'bank' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Bank Transfer Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bank Name:</span>
                      <span className="font-medium">Fintrivox Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Name:</span>
                      <span className="font-medium">Fintrivox Ltd</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Number:</span>
                      <span className="font-medium">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">SWIFT Code:</span>
                      <span className="font-medium">INVTUS33</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference:</span>
                      <span className="font-medium">{user?.id}-{Date.now()}</span>
                    </div>
                  </div>
                  <Alert className="mt-4">
                    <Info className="w-4 h-4" />
                    <AlertDescription>
                      Please include the reference number in your transfer description.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Summary */}
              {amount && (
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Deposit Amount</span>
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
                    <span className="font-medium">Total to Receive</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${(parseFloat(amount) * (1 - (selectedPaymentMethod?.feeType === 'percentage' ? selectedPaymentMethod.fee / 100 : 0)) - (selectedPaymentMethod?.feeType === 'fixed' ? selectedPaymentMethod.fee : 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Refund Policy Checkbox */}
              {amount && (
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="refund-policy"
                      checked={agreedToPolicy}
                      onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                      className="mt-1"
                    />
                    <Label
                      htmlFor="refund-policy"
                      className="text-xs leading-relaxed text-amber-900 cursor-pointer select-none"
                    >
                      <span className="font-bold underline block mb-1">STRICT NO REFUND POLICY</span>
                      I understand and agree that this deposit is <span className="font-bold">non-refundable</span>.
                      I agree that if I have any problem with my payment, I will contact <strong>Fintrivox Support</strong> first
                      before contacting my card issuer or bank.
                    </Label>
                  </div>
                </div>
              )}

              {selectedPaymentMethod?.type !== "card" && (
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  onClick={handleSubmit}
                  disabled={
                    !amount ||
                    Number(amount) <= 0 ||
                    !agreedToPolicy
                  }
                >
                  Confirm Deposit
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
