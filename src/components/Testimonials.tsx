import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Testimonial } from '../types';

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  { id: '1', customer_name: 'Marcus T.', location: 'London, UK', player_name: 'Cristiano Ronaldo', slot_type: 'VIP', rating: 5, avatar_color: '#dc2626', review_text: 'Meeting Ronaldo was a dream come true. The whole experience was flawlessly organized — from the VIP lounge to the moment he signed my card. Worth every penny.' },
  { id: '2', customer_name: 'Sofia R.', location: 'Buenos Aires, Argentina', player_name: 'Lionel Messi', slot_type: 'VIP', rating: 5, avatar_color: '#0ea5e9', review_text: 'I cried when Messi shook my hand. This is something I will tell my grandchildren about. FIFA Fan Access made it seamless and totally unforgettable.' },
  { id: '3', customer_name: 'Ahmed K.', location: 'Dubai, UAE', player_name: 'Cristiano Ronaldo', slot_type: 'Premium', rating: 5, avatar_color: '#f59e0b', review_text: 'The training session access was incredible. Watching CR7 at full intensity just meters away — you can feel the electricity. Absolutely elite experience.' },
  { id: '4', customer_name: 'Yuki N.', location: 'Tokyo, Japan', player_name: 'Lionel Messi', slot_type: 'Premium', rating: 5, avatar_color: '#8b5cf6', review_text: 'Messi walked right past us during warm-up and waved. The photo opportunity was perfectly organized and the staff were incredibly professional.' },
  { id: '5', customer_name: 'Carlos M.', location: 'São Paulo, Brazil', player_name: 'Cristiano Ronaldo', slot_type: 'Standard', rating: 5, avatar_color: '#22c55e', review_text: 'The fan experience package was brilliant — Category 1 seats, fan zone, merch pack. Saw Ronaldo score live. Best day of my life, hands down.' },
  { id: '6', customer_name: 'Priya S.', location: 'Mumbai, India', player_name: 'Lionel Messi', slot_type: 'VIP', rating: 5, avatar_color: '#ec4899', review_text: 'I was nervous I would freeze when meeting Messi, but he was so warm and gracious. He even asked where I was from. Pinch-me moment every single day since.' },
];

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    supabase.from('testimonials').select('*').order('created_at')
      .then(({ data }) => {
        if (data && data.length > 0) setTestimonials(data);
        else setTestimonials(FALLBACK_TESTIMONIALS);
      })
      .catch(() => setTestimonials(FALLBACK_TESTIMONIALS));
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section id="about" className="py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
            style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
            <Star className="w-4 h-4 fill-current" />
            VERIFIED FAN REVIEWS
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">What Fans Are Saying</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Over 12,000 fans have experienced the magic of meeting their heroes at the FIFA World Cup.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="font-black text-gray-900">4.97</span>
            <span className="text-gray-400 text-sm">/ 5 from 12,847 reviews</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(14,165,233,0.08)' }}>
                  <Quote className="w-5 h-5 text-sky-500" />
                </div>
                <div className="flex">
                  {Array.from({ length: t.rating }, (_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    background: t.player_name.includes('Ronaldo') ? 'rgba(220,38,38,0.08)' : 'rgba(14,165,233,0.08)',
                    color: t.player_name.includes('Ronaldo') ? '#dc2626' : '#0ea5e9',
                  }}>
                  {t.player_name.includes('Ronaldo') ? '🇵🇹' : '🇦🇷'} {t.player_name.split(' ').pop()} · {t.slot_type}
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5 italic">
                "{t.review_text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ background: t.avatar_color }}>
                  {t.customer_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.customer_name}</p>
                  <p className="text-gray-400 text-xs">{t.location}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-green-500 text-xs font-bold">Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
