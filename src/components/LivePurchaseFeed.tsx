import { useEffect, useState, useRef } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LivePurchase } from '../types';

const EXTRA_PURCHASES: Omit<LivePurchase, 'id' | 'created_at'>[] = [
  { customer_name: 'Daniel F.', city: 'Manchester', product_title: 'VIP Meet & Greet Experience', player_name: 'Cristiano Ronaldo', slot_type: 'VIP' },
  { customer_name: 'Amina K.', city: 'Casablanca', product_title: 'Premium Training Session Access', player_name: 'Lionel Messi', slot_type: 'Premium' },
  { customer_name: 'Leo B.', city: 'Rome', product_title: 'Standard Fan Experience', player_name: 'Cristiano Ronaldo', slot_type: 'Standard' },
  { customer_name: 'Mei L.', city: 'Shanghai', product_title: 'VIP Meet & Greet Experience', player_name: 'Lionel Messi', slot_type: 'VIP' },
  { customer_name: 'Ivan P.', city: 'Moscow', product_title: 'Premium Training Session Access', player_name: 'Cristiano Ronaldo', slot_type: 'Premium' },
  { customer_name: 'Grace O.', city: 'Lagos', product_title: 'VIP Meet & Greet Experience', player_name: 'Cristiano Ronaldo', slot_type: 'VIP' },
  { customer_name: 'Raj M.', city: 'Delhi', product_title: 'Standard Fan Experience', player_name: 'Lionel Messi', slot_type: 'Standard' },
  { customer_name: 'Anna S.', city: 'Stockholm', product_title: 'Premium Training Session Access', player_name: 'Lionel Messi', slot_type: 'Premium' },
];

export default function LivePurchaseFeed() {
  const [purchases, setPurchases] = useState<LivePurchase[]>([]);
  const [current, setCurrent] = useState<LivePurchase | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    const extras: LivePurchase[] = EXTRA_PURCHASES.map((p, i) => ({ ...p, id: `extra-${i}`, created_at: new Date().toISOString() }));
    supabase.from('live_purchases').select('*').order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setPurchases([...(data || []), ...extras]))
      .catch(() => setPurchases(extras));
  }, []);

  useEffect(() => {
    if (purchases.length === 0) return;

    const show = () => {
      if (dismissed) return;
      const purchase = purchases[indexRef.current % purchases.length];
      indexRef.current++;
      setCurrent(purchase);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    };

    const initial = setTimeout(show, 3000);
    const interval = setInterval(show, 12000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [purchases, dismissed]);

  if (!current || !visible || dismissed) return null;

  const isRonaldo = current.player_name.includes('Ronaldo');

  return (
    <div
      className="fixed bottom-6 left-6 z-50 max-w-sm"
      style={{ animation: visible ? 'slideUpFade 0.4s ease-out' : 'slideDownFade 0.3s ease-in' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg"
          style={{ background: isRonaldo ? 'rgba(220,38,38,0.08)' : 'rgba(14,165,233,0.08)' }}>
          {isRonaldo ? '🇵🇹' : '🇦🇷'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ShoppingBag className="w-3.5 h-3.5 text-green-500" />
            <span className="text-green-600 text-xs font-bold">Just booked</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <p className="text-gray-900 text-sm font-bold leading-tight truncate">
            {current.customer_name} from {current.city}
          </p>
          <p className="text-gray-500 text-xs truncate mt-0.5">
            <span className={`font-semibold ${isRonaldo ? 'text-red-600' : 'text-sky-600'}`}>{current.slot_type}</span>
            {' '}{current.player_name.split(' ').pop()} Experience
          </p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => { setVisible(false); setDismissed(true); }}
          className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 -mt-1 -mr-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
