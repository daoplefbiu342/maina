import { useEffect, useState } from 'react';
import { Check, Package, Clock, ArrowLeft, Home } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#080f1e 0%,#0c1f3f 50%,#071428 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
          {/* Animated check */}
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }} />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              <Check className="w-12 h-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Confirmed!</h1>
          <p className="text-gray-500 mb-6">
            Your Bitcoin payment has been received and your order is confirmed.
          </p>

          {orderId && (
            <div className="p-4 rounded-2xl mb-6 text-left" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wider">Order ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">{orderId}</p>
            </div>
          )}

          {/* Status timeline */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Payment Received</p>
                <p className="text-xs text-gray-500">Your Bitcoin transaction is confirmed on the network</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                <Package className="w-5 h-5 text-sky-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Preparing Shipment</p>
                <p className="text-xs text-gray-500">Your FIFA Fan Card is being prepared for delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(14,165,233,0.1)' }}>
                <Clock className="w-5 h-5 text-sky-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 text-sm">Estimated Delivery</p>
                <p className="text-xs text-gray-500">5-10 business days depending on your location</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              My Orders
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Redirecting to home in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
