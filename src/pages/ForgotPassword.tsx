import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Shield, RefreshCw, Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/services/api';

// Steps:
//  1 — Enter email → send code
//  2 — Enter 6-digit code → verify it (password fields hidden until code is confirmed valid)
//  3 — Set new password
//  4 — Done

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const navigate = useNavigate();

  // Step 1: send code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: verify code — triggered on 6th digit or "Verify Code" button
  const handleVerifyCode = async () => {
    if (code.length !== 6) { setCodeError('Please enter the full 6-digit code.'); return; }
    setCodeError('');
    setIsLoading(true);
    try {
      await authApi.verifyResetCode(email, code);
      setCodeVerified(true);
      setStep(3);
    } catch (err: any) {
      setCodeError(err.response?.data?.error || 'The code is invalid, expired, or incorrect. Please check and try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(digits);
    setCodeError('');
    if (digits.length === 6) {
      // Auto-verify when 6 digits entered
      setTimeout(() => {
        setCode(digits);
        handleVerifyCodeImmediate(digits);
      }, 200);
    }
  };

  const handleVerifyCodeImmediate = async (c: string) => {
    setCodeError('');
    setIsLoading(true);
    try {
      await authApi.verifyResetCode(email, c);
      setCodeVerified(true);
      setStep(3);
    } catch (err: any) {
      setCodeError(err.response?.data?.error || 'The code is invalid, expired, or incorrect.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    setIsResending(true);
    setResendMsg('');
    setCodeError('');
    setCode('');
    try {
      await authApi.forgotPassword(email);
      setResendMsg('A new code has been sent to your email.');
    } catch {
      setCodeError('Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code, password);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Logo = () => (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex items-center gap-2">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">Fintrivox</span>
      </Link>
    </div>
  );

  // Step 4 — Success
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Logo />
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset!</h2>
            <p className="text-gray-600 mb-6">Your password has been successfully reset. You can now log in with your new password.</p>
            <Button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Logo />

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          {/* Step 1 — Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-gray-600 mt-2">Enter your email and we'll send a 6-digit reset code</p>
              </div>

              {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

              <form onSubmit={handleRequestCode} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12" disabled={isLoading}>
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send Reset Code'}
                </Button>
              </form>
            </>
          )}

          {/* Step 2 — Enter & Verify Code */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Enter Reset Code</h2>
                <p className="text-gray-600 mt-2">
                  We sent a 6-digit code to <strong className="text-gray-800">{email}</strong>
                </p>
              </div>

              {resendMsg && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <AlertDescription className="text-green-700">{resendMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">6-Digit Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={e => handleCodeChange(e.target.value)}
                    placeholder="_ _ _ _ _ _"
                    className={`text-center tracking-[0.5em] font-mono h-14 text-xl mt-1 ${codeError ? 'border-red-400 bg-red-50' : ''}`}
                    autoFocus
                    disabled={isLoading}
                  />
                  {codeError && (
                    <div className="flex items-start gap-2 mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{codeError}</span>
                    </div>
                  )}
                </div>

                {isLoading && (
                  <p className="text-center text-sm text-blue-600 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying code...
                  </p>
                )}

                {!isLoading && (
                  <Button
                    onClick={handleVerifyCode}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                    disabled={code.length !== 6}
                  >
                    Verify Code
                  </Button>
                )}

                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setCode(''); setCodeError(''); setResendMsg(''); }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Different email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5"
                  >
                    {isResending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Resend Code
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 3 — Set New Password (only visible after code verified) */}
          {step === 3 && codeVerified && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                <p className="text-gray-600 mt-2">Code verified! Now create your new password.</p>
              </div>

              {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className={`pl-10 h-12 ${confirmPassword && confirmPassword !== password ? 'border-red-400' : ''}`}
                      required
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </Button>
              </form>
            </>
          )}

        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
