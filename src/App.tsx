import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, X, Plus, Minus, Check, Trophy, ChevronRight,
  Wifi, Star, Dumbbell, Ticket, Shield, Globe, Users, Zap,
  Camera, Video, Award, Crown, User as UserIcon,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './lib/auth';
import type { Product, CartItem } from './types';
import { PLAYER_CONFIG } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Testimonials from './components/Testimonials';
import LivePurchaseFeed from './components/LivePurchaseFeed';
import Admin from './pages/Admin';
import AuthPage from './pages/Auth';
import UserDashboard from './pages/UserDashboard';

// ─── FALLBACK PRODUCTS (shown when Supabase is unreachable) ───────────────
const FALLBACK_PRODUCTS: import('./types').Product[] = [
  {
    id: 'cr7-vip', player_name: 'Cristiano Ronaldo', slot_type: 'VIP',
    title: 'CR7 All Access Fan Card', price: 4999,
    description: 'The ultimate VIP experience — meet Cristiano Ronaldo at the FIFA World Cup 2026. Includes pitch-side access, exclusive meet & greet, and a signed collectible card.',
    image_url: '', venue: 'MetLife Stadium, New York', event_date: '2026-07-15',
    available_slots: 12,
    features: ['VIP Meet & Greet with CR7', 'Pitch-side Stadium Access', 'Signed All Access Fan Card', 'Exclusive Photo Opportunity', 'VIP Lounge Entry', 'World Cup Merchandise Pack'],
  },
  {
    id: 'lm10-vip', player_name: 'Lionel Messi', slot_type: 'VIP',
    title: 'Messi All Access Fan Card', price: 4999,
    description: 'An unforgettable VIP experience with Lionel Messi at the FIFA World Cup 2026. Includes stadium access, exclusive meet & greet, and a signed collectible card.',
    image_url: '', venue: 'SoFi Stadium, Los Angeles', event_date: '2026-07-18',
    available_slots: 10,
    features: ['VIP Meet & Greet with Messi', 'Pitch-side Stadium Access', 'Signed All Access Fan Card', 'Exclusive Photo Opportunity', 'VIP Lounge Entry', 'World Cup Merchandise Pack'],
  },
  {
    id: 'cr7-premium', player_name: 'Cristiano Ronaldo', slot_type: 'Premium',
    title: 'CR7 Training Access Card', price: 2499,
    description: 'Watch Cristiano Ronaldo train up close at an exclusive pitch-side session ahead of the World Cup. Includes photo opportunity and expert analysis.',
    image_url: '', venue: 'Training Ground, Dallas', event_date: '2026-07-10',
    available_slots: 25,
    features: ['Pitch-side Training View', 'Photo Opportunity', 'Expert Analysis Session', 'Training Access Pass', 'Signed Memorabilia'],
  },
  {
    id: 'lm10-premium', player_name: 'Lionel Messi', slot_type: 'Premium',
    title: 'Messi Training Access Card', price: 2499,
    description: 'Watch Lionel Messi train at an exclusive pitch-side session ahead of the World Cup. A unique insight into the GOAT\'s preparation.',
    image_url: '', venue: 'Training Ground, Miami', event_date: '2026-07-11',
    available_slots: 20,
    features: ['Pitch-side Training View', 'Photo Opportunity', 'Expert Analysis Session', 'Training Access Pass', 'Signed Memorabilia'],
  },
  {
    id: 'cr7-standard', player_name: 'Cristiano Ronaldo', slot_type: 'Standard',
    title: 'CR7 Fan Experience Ticket', price: 899,
    description: 'Experience the magic of the World Cup with a Category 1 match ticket, fan zone access, and exclusive CR7 merchandise pack.',
    image_url: '', venue: 'MetLife Stadium, New York', event_date: '2026-07-15',
    available_slots: 100,
    features: ['Category 1 Match Ticket', 'Fan Zone Access', 'CR7 Merchandise Pack', 'Stadium Tour', 'World Cup Programme'],
  },
  {
    id: 'lm10-standard', player_name: 'Lionel Messi', slot_type: 'Standard',
    title: 'Messi Fan Experience Ticket', price: 899,
    description: 'Experience the World Cup magic with a Category 1 match ticket, fan zone entry, and exclusive Messi merchandise pack.',
    image_url: '', venue: 'SoFi Stadium, Los Angeles', event_date: '2026-07-18',
    available_slots: 100,
    features: ['Category 1 Match Ticket', 'Fan Zone Access', 'Messi Merchandise Pack', 'Stadium Tour', 'World Cup Programme'],
  },
];

// ─── CARD COMPONENTS ──────────────────────────────────────────────────────

function AllAccessCard({ product, onAdd, inCart }: { product: Product; onAdd: () => void; inCart: boolean }) {
  const cfg = PLAYER_CONFIG[product.player_name] || PLAYER_CONFIG['Cristiano Ronaldo'];
  const isRonaldo = product.player_name.includes('Ronaldo');

  return (
    <div className="group flex flex-col items-center">
      <div className="relative w-72 rounded-[22px] overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-3 hover:shadow-[0_30px_80px_rgba(0,0,0,0.45)] cursor-pointer">
        <div className="absolute -inset-[1.5px] rounded-[23px] z-0 opacity-90"
          style={{ background: 'conic-gradient(from 90deg, #ff6b6b, #ffd93d, #6bcbff, #c77dff, #ff6b6b)', filter: 'blur(2px)' }} />
        <div className="relative z-1 rounded-[20px] overflow-hidden m-[2px]"
          style={{ background: 'linear-gradient(160deg,#1c1c1e 0%,#111 60%,#0a0a0a 100%)' }}>
          <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <div>
              <p className="text-white font-black text-[11px] tracking-[0.25em] leading-none">FIFA WORLD CUP</p>
              <p className="font-black leading-none" style={{ fontSize: 28, letterSpacing: '0.05em', background: 'linear-gradient(90deg,#fff,#ccc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>20<br />26</p>
            </div>
            <div className="w-14 h-16 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/10"
              style={{ background: 'linear-gradient(145deg,#2a2a2a,#1a1a1a)' }}>
              <Trophy className="w-7 h-7 text-white/80" />
              <span className="text-white font-black text-[9px] tracking-widest">FIFA</span>
              <span className="text-white/60 font-bold text-[8px]">2026</span>
            </div>
          </div>
          <div className="mx-4 mb-2 px-3 py-1 rounded text-center"
            style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.12),rgba(255,255,255,0.06))', border: '1px solid rgba(255,255,255,0.15)' }}>
            <span className="text-[10px] font-bold tracking-[0.35em] text-white/80">ALL ACCESS FAN CARD</span>
          </div>
          <div className="flex mx-4 rounded-xl overflow-hidden" style={{ height: 200 }}>
            <div className="flex-1 relative overflow-hidden"
              style={{ background: isRonaldo ? 'radial-gradient(ellipse,#8b2020,#2d0a0a)' : 'radial-gradient(ellipse,#1a4a7a,#0a1a2d)' }}>
              <img
                src={isRonaldo
                  ? 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=400'
                  : 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=400'}
                alt={product.player_name} className="w-full h-full object-cover object-top" />
              <div className="absolute left-0 top-0 bottom-0 flex items-center" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
                <span className="px-1 py-2 text-[9px] font-black tracking-[0.3em] bg-black/40"
                  style={{ background: 'linear-gradient(180deg,#ff6b6b,#ffd93d,#6bcbff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ALL ACCESS</span>
              </div>
            </div>
            <div className="w-16 flex flex-col items-center py-2 gap-2 border-l border-white/10" style={{ background: 'linear-gradient(180deg,#252525,#1a1a1a)' }}>
              <div className="w-10 h-7 rounded flex items-center justify-center text-lg border border-white/20 shadow-lg"><span>{cfg.flag}</span></div>
              <span className="text-white font-black text-[11px] tracking-widest">{cfg.code}</span>
              <div className="w-8 h-px bg-white/20 my-1" />
              {[{ icon: Star, label: 'LEGEND' }, { icon: Globe, label: 'GLOBAL' }, { icon: Users, label: 'ICON' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <Icon className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span className="text-white/60 text-[7px] font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-4 mt-2 rounded-xl px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-white font-black text-lg leading-tight tracking-wide">{product.player_name.toUpperCase().split(' ')[0]}</p>
              <p className="text-white font-black text-lg leading-tight tracking-wide">{product.player_name.toUpperCase().split(' ').slice(1).join(' ')}</p>
              <p className="text-white/50 text-[9px] mt-1">{cfg.dob} | {cfg.height} | {cfg.weight}</p>
              <p className="text-white/40 text-[9px]">{cfg.club}</p>
            </div>
            <div className="w-12 h-12 shrink-0">
              <div className="w-full h-full rounded grid grid-cols-4 gap-px p-1 bg-white">
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="rounded-[1px]" style={{ background: [0,1,4,5,8,10,11,13,15].includes(i) ? '#000' : '#fff' }} />
                ))}
              </div>
              <p className="text-white/30 text-[7px] text-center mt-0.5">{cfg.cardId}-AA001</p>
            </div>
          </div>
          <div className="px-3 py-2 mt-1 flex items-center justify-between"
            style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.08),rgba(255,255,255,0.04))', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {[{ icon: Shield, label: 'STADIUM\nACCESS' }, { icon: Award, label: 'VIP\nEXPERIENCES' }, { icon: Video, label: 'EXCLUSIVE\nCONTENT' }, { icon: Users, label: 'MEET &\nGREETS' }, { icon: Star, label: 'COLLECT\n& PLAY' }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <Icon className="w-3.5 h-3.5 text-white/60" />
                <span className="text-white/40 text-[7px] font-bold text-center leading-tight whitespace-pre">{label}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-1 flex items-center gap-2"><Wifi className="w-3.5 h-3.5 text-white/30" /><div className="w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full" style={{ background: isRonaldo ? '#dc2626' : '#38bdf8' }} /></div></div>
          <div className="text-center py-1.5 border-t border-white/5"><span className="text-white/25 text-[8px] font-bold tracking-[0.3em]">UNITED. PASSION. FUTURE.</span></div>
        </div>
      </div>
      <PurchasePanel product={product} onAdd={onAdd} inCart={inCart} accentClass="from-sky-500 to-blue-600" checkClass="text-green-500" />
    </div>
  );
}

function TrainingAccessCard({ product, onAdd, inCart }: { product: Product; onAdd: () => void; inCart: boolean }) {
  const cfg = PLAYER_CONFIG[product.player_name] || PLAYER_CONFIG['Cristiano Ronaldo'];
  const isRonaldo = product.player_name.includes('Ronaldo');

  return (
    <div className="group flex flex-col items-center">
      <div className="relative w-72 rounded-[22px] overflow-hidden shadow-2xl transition-transform duration-500 hover:-translate-y-3 cursor-pointer">
        <div className="absolute -inset-[1.5px] rounded-[23px] z-0"
          style={{ background: isRonaldo ? 'conic-gradient(from 90deg,#ef4444,#f97316,#ef4444)' : 'conic-gradient(from 90deg,#38bdf8,#818cf8,#38bdf8)', filter: 'blur(2px)' }} />
        <div className="relative z-1 rounded-[20px] overflow-hidden m-[2px]"
          style={{ background: isRonaldo ? 'linear-gradient(160deg,#1a0505,#2d0a0a,#1a0505)' : 'linear-gradient(160deg,#020d1f,#051a38,#020d1f)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRonaldo ? 'bg-red-600' : 'bg-sky-500'}`}><Dumbbell className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-white font-black text-[10px] tracking-[0.2em]">FIFA WORLD CUP 2026</p>
                <p className={`font-black text-[11px] tracking-[0.3em] ${isRonaldo ? 'text-red-400' : 'text-sky-400'}`}>TRAINING ACCESS</p>
              </div>
            </div>
            <span className="text-white font-black text-xs">{cfg.cardId}-TR</span>
          </div>
          <div className="h-px mx-4 mb-3" style={{ background: isRonaldo ? 'linear-gradient(90deg,transparent,#ef4444,transparent)' : 'linear-gradient(90deg,transparent,#38bdf8,transparent)' }} />
          <div className="relative mx-4 rounded-xl overflow-hidden" style={{ height: 180 }}>
            <img
              src={isRonaldo
                ? 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600'
                : 'https://images.pexels.com/photos/38024084/pexels-photo-38024084.jpeg?auto=compress&cs=tinysrgb&w=600'}
              alt="Training" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.8),transparent 60%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-black text-xl leading-tight tracking-wide">{product.player_name.toUpperCase()}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">{cfg.flag}</span>
                <span className={`text-xs font-bold ${isRonaldo ? 'text-red-400' : 'text-sky-400'}`}>{cfg.country}</span>
              </div>
            </div>
          </div>
          <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
            {[{ label: 'POSITION', value: 'FWD' }, { label: 'SESSIONS', value: '3' }, { label: 'CAPACITY', value: String(product.available_slots) }].map(({ label, value }) => (
              <div key={label} className="rounded-lg py-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className={`font-black text-lg ${isRonaldo ? 'text-red-400' : 'text-sky-400'}`}>{value}</p>
                <p className="text-white/40 text-[8px] font-bold tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          <div className="mx-4 mt-3 mb-3 space-y-1.5">
            {[{ icon: Dumbbell, text: 'Pitch-side Training View' }, { icon: Camera, text: 'Photo Opportunity' }, { icon: Zap, text: 'Expert Analysis Session' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Icon className={`w-4 h-4 shrink-0 ${isRonaldo ? 'text-red-400' : 'text-sky-400'}`} />
                <span className="text-white/70 text-[11px] font-medium">{text}</span>
              </div>
            ))}
          </div>
          <div className={`text-center py-2 border-t ${isRonaldo ? 'border-red-900/40' : 'border-sky-900/40'}`}>
            <span className="text-white/25 text-[8px] font-bold tracking-[0.3em]">TRAIN. INSPIRE. ACHIEVE.</span>
          </div>
        </div>
      </div>
      <PurchasePanel product={product} onAdd={onAdd} inCart={inCart}
        accentClass={isRonaldo ? 'from-red-500 to-red-700' : 'from-sky-500 to-blue-600'}
        checkClass={isRonaldo ? 'text-red-500' : 'text-sky-500'} />
    </div>
  );
}

function FanExperienceCard({ product, onAdd, inCart }: { product: Product; onAdd: () => void; inCart: boolean }) {
  const cfg = PLAYER_CONFIG[product.player_name] || PLAYER_CONFIG['Cristiano Ronaldo'];
  const isRonaldo = product.player_name.includes('Ronaldo');

  return (
    <div className="group flex flex-col items-center">
      <div className="relative w-72 rounded-[22px] overflow-hidden shadow-xl transition-transform duration-500 hover:-translate-y-3 cursor-pointer">
        <div className="absolute -inset-[1.5px] rounded-[23px] z-0" style={{ background: 'linear-gradient(135deg,#e5e7eb,#d1d5db,#e5e7eb)', filter: 'blur(1px)' }} />
        <div className="relative z-1 rounded-[20px] overflow-hidden m-[2px]" style={{ background: 'linear-gradient(160deg,#f8fafc,#f1f5f9,#e2e8f0)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2"
            style={{ background: isRonaldo ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
            <div>
              <p className="text-white/90 font-black text-[9px] tracking-[0.25em]">FIFA WORLD CUP 2026</p>
              <p className="text-white font-black text-base tracking-widest">FAN EXPERIENCE</p>
            </div>
            <div className="flex items-center gap-2"><span className="text-3xl">{cfg.flag}</span><span className="text-white font-black text-base tracking-widest">{cfg.code}</span></div>
          </div>
          <div className="relative" style={{ height: 160 }}>
            <img src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Stadium" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.5))' }} />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-white text-[10px] font-bold tracking-widest"
              style={{ background: isRonaldo ? 'rgba(220,38,38,0.85)' : 'rgba(14,165,233,0.85)' }}>MATCH DAY ACCESS</div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-black text-lg tracking-wide">{product.player_name.toUpperCase()}</p>
              <p className="text-white/70 text-xs">{product.venue}</p>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[{ label: 'TICKET CLASS', value: 'CAT 1' }, { label: 'MATCH DATE', value: new Date(product.event_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) }].map(({ label, value }) => (
                <div key={label} className="px-3 py-2 rounded-xl text-center"
                  style={{ background: isRonaldo ? 'rgba(220,38,38,0.06)' : 'rgba(14,165,233,0.06)', border: isRonaldo ? '1px solid rgba(220,38,38,0.15)' : '1px solid rgba(14,165,233,0.15)' }}>
                  <p className={`font-black text-sm ${isRonaldo ? 'text-red-600' : 'text-sky-600'}`}>{value}</p>
                  <p className="text-gray-500 text-[8px] font-bold tracking-wider">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-1 mb-3">
              {[{ icon: Ticket, label: 'MATCH TICKET' }, { icon: Star, label: 'FAN ZONE' }, { icon: Shield, label: 'MERCH PACK' }, { icon: Trophy, label: 'STADIUM TOUR' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRonaldo ? 'bg-red-100' : 'bg-sky-100'}`}><Icon className={`w-4 h-4 ${isRonaldo ? 'text-red-600' : 'text-sky-600'}`} /></div>
                  <span className="text-gray-500 text-[7px] font-bold text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex gap-0.5">{Array.from({ length: 20 }).map((_, i) => (<div key={i} className="w-0.5 rounded-full" style={{ height: [4,8,6,10,5,8,4,7,9,5,8,4,6,10,5,7,4,8,6,9][i], background: '#d1d5db' }} />))}</div>
              <span className="text-gray-400 text-[9px] font-mono">{cfg.cardId}-STD</span>
            </div>
          </div>
          <div className={`text-center py-1.5 border-t ${isRonaldo ? 'border-red-200' : 'border-sky-200'}`}
            style={{ background: isRonaldo ? 'rgba(220,38,38,0.05)' : 'rgba(14,165,233,0.05)' }}>
            <span className={`text-[8px] font-bold tracking-[0.3em] ${isRonaldo ? 'text-red-400' : 'text-sky-400'}`}>UNITED. PASSION. FUTURE.</span>
          </div>
        </div>
      </div>
      <PurchasePanel product={product} onAdd={onAdd} inCart={inCart}
        accentClass={isRonaldo ? 'from-red-500 to-red-700' : 'from-sky-500 to-blue-600'}
        checkClass={isRonaldo ? 'text-red-500' : 'text-sky-500'} />
    </div>
  );
}

function PurchasePanel({ product, onAdd, inCart, accentClass, checkClass }: {
  product: Product; onAdd: () => void; inCart: boolean; accentClass: string; checkClass: string;
}) {
  return (
    <div className="mt-4 w-72 bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
      <h3 className="font-bold text-gray-900 text-base">{product.title}</h3>
      <p className="text-gray-500 text-xs mt-1 mb-3 line-clamp-2">{product.description}</p>
      <ul className="space-y-1 mb-4">
        {product.features.slice(0, 3).map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
            <Check className={`w-3.5 h-3.5 shrink-0 ${checkClass}`} />{f}
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-2xl font-extrabold text-gray-900">${product.price.toLocaleString()}</span>
          <span className="text-xs text-gray-400 ml-1">/ person</span>
        </div>
        <button
          onClick={onAdd}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 bg-gradient-to-r ${inCart ? 'from-green-500 to-green-600' : accentClass} hover:shadow-lg`}
        >
          {inCart ? <><Check className="w-4 h-4" />Added</> : <><ShoppingCart className="w-4 h-4" />Add to Basket</>}
        </button>
      </div>
      <p className="text-xs text-red-500 mt-2 font-medium">{product.available_slots} slots remaining</p>
    </div>
  );
}

// ─── ABOUT SECTION ────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about-info" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
              style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0ea5e9' }}>
              <Trophy className="w-4 h-4" />
              ABOUT FIFA FAN ACCESS
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-6 leading-tight">The World's Premier Football Fan Experience Platform</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FIFA Fan Access is the official platform for exclusive World Cup fan experiences. We connect passionate football supporters with once-in-a-lifetime moments — from VIP meet & greets with global icons to pitch-side training sessions.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Every experience is meticulously curated to deliver memories that last a lifetime. Our team works directly with player management and FIFA to ensure authenticity, safety, and an unforgettable journey for every fan.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[{ value: '12,000+', label: 'Happy Fans' }, { value: '97%', label: 'Satisfaction' }, { value: '6', label: 'Experience Types' }].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-3xl font-black text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Stadium" className="rounded-2xl shadow-lg w-full h-48 object-cover" />
              <img src="https://images.pexels.com/photos/1171084/pexels-photo-1171084.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Match" className="rounded-2xl shadow-lg w-full h-48 object-cover mt-8" />
              <img src="https://images.pexels.com/photos/38259036/pexels-photo-38259036.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Training" className="rounded-2xl shadow-lg w-full h-48 object-cover -mt-4" />
              <img src="https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Pitch" className="rounded-2xl shadow-lg w-full h-48 object-cover mt-4" />
            </div>
            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.08),transparent)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activePlayer, setActivePlayer] = useState<'all' | 'Cristiano Ronaldo' | 'Lionel Messi'>('all');
  const [page, setPage] = useState<'home' | 'admin' | 'login' | 'signup' | 'dashboard'>('home');
  const experiencesRef = useRef<HTMLElement>(null);

  // ── All hooks must be before any conditional returns ──
  useEffect(() => {
    supabase.from('products').select('*').order('player_name').order('price', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) setProducts(data);
        else setProducts(FALLBACK_PRODUCTS);
        setLoading(false);
      })
      .catch(() => {
        setProducts(FALLBACK_PRODUCTS);
        setLoading(false);
      });
  }, []);

  // Redirect logged-in users away from auth pages
  useEffect(() => {
    if (user && (page === 'login' || page === 'signup')) {
      setPage('dashboard');
    }
  }, [user, page]);

  // Redirect unauthenticated users away from dashboard
  useEffect(() => {
    if (!authLoading && !user && page === 'dashboard') {
      setPage('login');
    }
  }, [authLoading, user, page]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter((i) => i.quantity > 0));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const isInCart = (id: string) => cart.some((i) => i.id === id);

  const filteredProducts = activePlayer === 'all' ? products : products.filter((p) => p.player_name === activePlayer);

  const renderCard = (product: Product) => {
    const props = { product, onAdd: () => addToCart(product), inCart: isInCart(product.id) };
    if (product.slot_type === 'VIP') return <AllAccessCard key={product.id} {...props} />;
    if (product.slot_type === 'Premium') return <TrainingAccessCard key={product.id} {...props} />;
    return <FanExperienceCard key={product.id} {...props} />;
  };

  const scrollToExperiences = () => {
    document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Conditional page renders (no hooks below this line) ──
  if (page === 'login') return <AuthPage mode="login" onSwitch={(m) => setPage(m)} onBack={() => setPage('home')} />;
  if (page === 'signup') return <AuthPage mode="signup" onSwitch={(m) => setPage(m)} onBack={() => setPage('home')} />;
  if (page === 'admin') return <Admin onBack={() => setPage('home')} />;

  if (page === 'dashboard') {
    if (authLoading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
    return <UserDashboard onBack={() => setPage('home')} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#f0f7ff 0%,#fff 40%,#f8fafc 100%)' }}>
      <Navbar cartCount={cartCount} onCartOpen={() => setShowCart(true)} onNavigate={(p) => setPage(p as 'home' | 'admin')} currentPage={page} />

      {/* Hero — split screen */}
      <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
        {/* Left — Ronaldo */}
        <div className="absolute inset-y-0 left-0 w-1/2">
          <img src="https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1" alt="Cristiano Ronaldo" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(180,0,0,0.72) 0%,rgba(120,0,0,0.55) 40%,transparent 70%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(to top,#000,transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-32" style={{ background: 'linear-gradient(to right,transparent,#000)' }} />
          <div className="absolute inset-0 flex items-center justify-start pl-6 pointer-events-none select-none">
            <span className="font-black text-white/8" style={{ fontSize: 280, lineHeight: 1 }}>7</span>
          </div>
          <div className="absolute bottom-12 left-6 sm:left-12">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🇵🇹</span>
              <span className="text-white/70 font-bold text-sm tracking-widest">PORTUGAL</span>
              <div className="px-2 py-0.5 rounded text-xs font-black text-white ml-1" style={{ background: 'rgba(180,0,0,0.8)' }}>#7</div>
            </div>
            <h2 className="text-white font-black leading-none tracking-tight" style={{ fontSize: 'clamp(2rem,5vw,4rem)', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>CRISTIANO<br />RONALDO</h2>
            <p className="text-white/60 text-sm font-bold tracking-widest mt-2">CR7 · AL-NASSR FC</p>
          </div>
        </div>

        {/* Right — Messi */}
        <div className="absolute inset-y-0 right-0 w-1/2">
          <img src="https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1200&h=1600&dpr=1" alt="Lionel Messi" className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(225deg,rgba(0,80,180,0.72) 0%,rgba(0,50,140,0.55) 40%,transparent 70%)' }} />
          <div className="absolute inset-x-0 bottom-0 h-48" style={{ background: 'linear-gradient(to top,#000,transparent)' }} />
          <div className="absolute inset-y-0 left-0 w-32" style={{ background: 'linear-gradient(to left,transparent,#000)' }} />
          <div className="absolute inset-0 flex items-center justify-end pr-6 pointer-events-none select-none">
            <span className="font-black text-white/8" style={{ fontSize: 220, lineHeight: 1 }}>10</span>
          </div>
          <div className="absolute bottom-12 right-6 sm:right-12 text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <div className="px-2 py-0.5 rounded text-xs font-black text-white mr-1" style={{ background: 'rgba(0,80,180,0.8)' }}>#10</div>
              <span className="text-white/70 font-bold text-sm tracking-widest">ARGENTINA</span>
              <span className="text-2xl">🇦🇷</span>
            </div>
            <h2 className="text-white font-black leading-none tracking-tight" style={{ fontSize: 'clamp(2rem,5vw,4rem)', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>LIONEL<br />MESSI</h2>
            <p className="text-white/60 text-sm font-bold tracking-widest mt-2">LEO · INTER MIAMI CF</p>
          </div>
        </div>

        {/* Centre overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-none">
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full border border-white/20 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.55)' }}>
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-black text-sm tracking-widest">FIFA WORLD CUP 2026</span>
            </div>
            <div className="px-4 py-1 rounded-full text-xs font-bold text-white/70 tracking-[0.3em]" style={{ background: 'rgba(0,0,0,0.4)' }}>OFFICIAL FAN EXPERIENCE</div>
          </div>
          <div className="flex flex-col items-center" style={{ marginTop: '-4vh' }}>
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-md shadow-2xl"
                style={{ background: 'radial-gradient(circle,rgba(255,255,255,0.15),rgba(0,0,0,0.7))' }}>
                <span className="text-white font-black text-xl sm:text-2xl tracking-widest">VS</span>
              </div>
              <div className="absolute -inset-1 rounded-full animate-spin" style={{ animationDuration: '8s', background: 'conic-gradient(from 0deg,#dc2626,transparent,#38bdf8,transparent,#dc2626)', filter: 'blur(1px)' }} />
            </div>
          </div>
          {/* Hero CTAs — pointer-events enabled */}
          <div className="mb-10 flex flex-col items-center gap-4 pointer-events-auto">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={scrollToExperiences}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl text-white font-black text-base shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_rgba(255,215,0,0.4)]"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <Crown className="w-5 h-5" />
                Get Your All Access Card
              </button>
              <button
                onClick={scrollToExperiences}
                className="flex items-center gap-2 px-7 py-4 rounded-2xl text-white font-black text-base shadow-xl transition-all hover:scale-105 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                Browse Experiences
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/80 border border-white/20 backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-bold tracking-wider">3 CARD TYPES · 6 EXPERIENCES · LIMITED SLOTS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Card type legend */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'ALL ACCESS CARD', desc: 'VIP meet & greet with the legends', icon: Crown, color: 'from-yellow-400 to-amber-500' },
            { label: 'TRAINING ACCESS', desc: 'Pitch-side training session access', icon: Dumbbell, color: 'from-sky-400 to-blue-600' },
            { label: 'FAN EXPERIENCE', desc: 'Match day ticket & fan zone entry', icon: Ticket, color: 'from-gray-400 to-gray-600' },
          ].map(({ label, desc, icon: Icon, color }) => (
            <button key={label} onClick={scrollToExperiences} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-black text-gray-900 text-sm tracking-wide">{label}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" ref={experiencesRef as React.RefObject<HTMLElement>} className="max-w-7xl mx-auto px-4 pb-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Choose Your Experience</h2>
          <p className="text-gray-500 text-lg">Select from our exclusive FIFA Fan Card collection</p>
        </div>

        {/* Player filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {(['all', 'Cristiano Ronaldo', 'Lionel Messi'] as const).map((p) => (
            <button key={p} onClick={() => setActivePlayer(p)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${
                activePlayer === p
                  ? p === 'Cristiano Ronaldo' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100'
                  : p === 'Lionel Messi' ? 'bg-sky-500 text-white border-sky-500 shadow-lg shadow-sky-100'
                  : 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}>
              {p === 'all' ? 'All Cards' : p === 'Cristiano Ronaldo' ? '🇵🇹 Ronaldo' : '🇦🇷 Messi'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24"><div className="w-14 h-14 mx-auto border-4 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="flex flex-wrap justify-center gap-8">{filteredProducts.map((p) => renderCard(p))}</div>
        )}
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* About section */}
      <AboutSection />

      {/* Footer */}
      <Footer onNavigate={(p) => setPage(p as 'home' | 'admin' | 'login' | 'signup' | 'dashboard')} />

      {/* Cart */}
      {showCart && (
        <Cart
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {/* Checkout */}
      {showCheckout && (
        <Checkout
          cart={cart}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => setCart([])}
          user={user}
        />
      )}

      {/* Live purchase feed */}
      <LivePurchaseFeed />
    </div>
  );
}
