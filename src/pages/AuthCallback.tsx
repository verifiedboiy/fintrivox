import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (accessToken && refreshToken) {
        try {
          // Temporarily store tokens to fetch user data
          localStorage.setItem('Fintrivox_token', accessToken);
          
          const { data } = await authApi.getMe();
          
          completeLogin({
            user: data.user,
            accessToken,
            refreshToken
          });

          navigate('/dashboard');
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/login?error=callback_failed');
        }
      } else {
        navigate('/login?error=missing_tokens');
      }
    };

    handleCallback();
  }, [location, completeLogin, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900">Authenticating...</h2>
        <p className="text-gray-500 text-sm">Please wait while we complete your secure sign-in.</p>
      </div>
    </div>
  );
}
