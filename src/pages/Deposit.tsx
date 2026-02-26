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

import { useAuth } from '@/contexts/AuthContext';
import { depositApi, paymentMethodApi } from '@/services/api';

export default function Deposit() {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardPaid, setCardPaid] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    paymentMethodApi.list().then(({ data }) => setPaymentMethods(data.methods)).catch(console.error);
  }, []);

  // Deposit page is always accessible — no KYC gate

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const validateCard = () => {
    const num = cardNumber.replace(/\s/g, "");
    const exp = cardExpiry;
    const cvv = cardCvv;

    if (cardName.trim().length < 2) return "Enter cardholder name.";
    if (num.length !== 16) return "Card number must be 16 digits (demo).";
    if (!/^\d{2}\/\d{2}$/.test(exp)) return "Expiry must be MM/YY.";
    const [mmStr, yyStr] = exp.split("/");
    const mm = Number(mmStr);
    const yy = Number(yyStr);
    if (mm < 1 || mm > 12) return "Invalid expiry month.";
    // Simple expiry check (20YY)
    const now = new Date();
    const curYY = Number(String(now.getFullYear()).slice(-2));
    const curMM = now.getMonth() + 1;
    if (yy < curYY || (yy === curYY && mm < curMM)) return "Card is expired.";
    if (!/^\d{3,4}$/.test(cvv)) return "CVV must be 3–4 digits.";
    return null;
  };

  const handleCardPay = async () => {
    const err = validateCard();
    if (err) {
      setCardError(err);
      setCardPaid(false);
      return;
    }
    setCardError(null);
    try {
      await depositApi.create({
        amount: parseFloat(amount),
        method: selectedPaymentMethod?.name || '',
      });
      setCardPaid(true);
      setStep('confirm');
    } catch (err: any) {
      setCardError(err.response?.data?.error || 'Payment failed');
    }
  };

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
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
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
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {paymentMethods.filter(pm => pm.status === 'active').map((method) => {
                const isBank = method.name.toLowerCase().includes('bank') || method.name.toLowerCase().includes('wire');
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all ${isBank ? 'opacity-60 grayscale' : 'hover:border-blue-500 hover:shadow-lg'}`}
                    onClick={() => {
                      if (isBank) {
                        alert('Bank and Wire transfers are currently unavailable. please choose a crypto method for instant funding.');
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
              </div>

              {/* Crypto Payment Instructions */}
              {selectedPaymentMethod?.type === 'crypto' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4">Payment Instructions</h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-500">Send {selectedPaymentMethod.name} to this address:</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={cryptoAddresses[selectedMethod || ''] || 'Address loading...'}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleCopyAddress(cryptoAddresses[selectedMethod || ''] || '')}
                        >
                          {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">Transaction Hash (after sending):</Label>
                      <Input
                        placeholder="Enter transaction hash..."
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        {selectedMethod === 'pm-1' && 'Bitcoin deposits require 3 confirmations.'}
                        {selectedMethod === 'pm-2' && 'Ethereum deposits require 12 confirmations.'}
                        {selectedMethod === 'pm-3' && 'USDT deposits are usually instant.'}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}

              {selectedPaymentMethod?.type === "card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cardholder Name</Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      autoComplete="cc-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="123"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
                    </div>
                  </div>

                  {cardError && (
                    <p className="text-sm text-red-500">{cardError}</p>
                  )}

                  <Button
                    type="button"
                    onClick={handleCardPay}
                    className="w-full"
                    disabled={!amount || Number(amount) <= 0}
                  >
                    {cardPaid ? "Paid " : "Pay "}
                  </Button>

                  <p className="text-xs opacity-70">
                    Demo only. Card payment will be connected to Stripe/Paystack later.
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

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                onClick={handleSubmit}
                disabled={
                  !amount ||
                  Number(amount) <= 0 ||
                  (selectedPaymentMethod?.type === "card" && !cardPaid)
                }
              >
                Confirm Deposit
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
