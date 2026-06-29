import { useState } from 'react';
import { Trophy, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, Check, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onSwitch: (mode: 'login' | 'signup') => void;
  onBack: () => void;
}

export default function AuthPage({ mode, onSwitch, onBack }: AuthPageProps) {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error);
      } else {
        const { error } = await signUp(email, password, name);
        if (error) setError(error);
        else setSuccess(true);
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#080f1e 0%,#0c1f3f 50%,#071428 100%)' }}>
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 mb-1">Please check your email to confirm your account.</p>
          <p className="text-sm text-gray-400 mb-8 font-mono">{email}</p>
          <button
            onClick={() => onSwitch('login')}
            className="w-full py-4 rounded-2xl text-white font-black text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
          >
            Continue to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg,#080f1e 0%,#0c1f3f 50%,#071428 100%)' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle,#dc2626,transparent)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle,#0ea5e9,transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-black text-white text-base tracking-tight">FIFA FAN ACCESS</p>
            <p className="text-white/40 text-[10px] font-bold tracking-widest">WORLD CUP 2026</p>
          </div>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <p className="text-white/90 font-black text-4xl leading-tight mb-6">
            Your journey to meet the legends starts here.
          </p>
          <div className="space-y-3">
            {[
              'Track your FIFA Fan Card shipment',
              'Manage your VIP experience bookings',
              'Access exclusive World Cup content',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)' }}>
                  <Check className="w-3 h-3 text-sky-400" />
                </div>
                <span className="text-white/60 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="flex -space-x-3">
            {['🇵🇹', '🇦🇷'].map((flag, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-lg bg-gray-800">
                {flag}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm">CR7 & Messi experiences available</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                  {isLogin ? <Lock className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-gray-400 text-xs">
                    {isLogin ? 'Sign in to manage your orders' : 'Join to track your FIFA Fan Card'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Smith"
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  {isLogin && (
                    <button type="button" className="text-xs text-sky-600 hover:text-sky-700 font-semibold">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-black text-sm transition-all hover:opacity-90 hover:shadow-xl shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </button>

              {/* Security note */}
              <div className="flex items-center gap-2 justify-center">
                <Shield className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-gray-400 text-xs">Secured with 256-bit encryption</span>
              </div>
            </form>

            {/* Switch mode */}
            <div className="px-8 pb-8 text-center">
              <p className="text-gray-500 text-sm">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => { setError(null); onSwitch(isLogin ? 'signup' : 'login'); }}
                  className="font-black text-sky-600 hover:text-sky-700 transition-colors"
                >
                  {isLogin ? 'Sign Up Free' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            {['FIFA Official', 'SSL Secured', 'PCI DSS'].map((badge) => (
              <span key={badge} className="text-white/25 text-xs font-bold tracking-widest">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
