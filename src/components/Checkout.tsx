import { useState } from 'react';
import { X, Check, ChevronRight, MapPin, User as UserIcon, Mail, Phone, Globe, Bitcoin, ArrowUpRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CartItem, ShippingForm } from '../types';
import type { User } from '@supabase/supabase-js';

interface CheckoutProps {
  cart: CartItem[];
  onClose: () => void;
  user: User | null;
}

const COUNTRIES = ['United States', 'United Kingdom', 'Australia', 'Canada', 'United Arab Emirates', 'Saudi Arabia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Japan', 'South Korea', 'India', 'China', 'South Africa', 'Nigeria', 'Ghana', 'Other'];

const STEPS = ['Contact', 'Shipping', 'Review'];

const EMPTY_FORM: ShippingForm = {
  customer_name: '', customer_email: '', customer_phone: '',
  address_line1: '', address_line2: '', city: '', state_province: '', postal_code: '', country: 'United States',
};

export default function Checkout({ cart, onClose, user }: CheckoutProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ShippingForm>({
    ...EMPTY_FORM,
    customer_name: user?.user_metadata?.full_name || '',
    customer_email: user?.email || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const set = (field: keyof ShippingForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const validateStep = () => {
    const e: Partial<ShippingForm> = {};
    if (step === 0) {
      if (!form.customer_name.trim()) e.customer_name = 'Required';
      if (!form.customer_email.trim() || !/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Valid email required';
    }
    if (step === 1) {
      if (!form.address_line1.trim()) e.address_line1 = 'Required';
      if (!form.city.trim()) e.city = 'Required';
      if (!form.state_province.trim()) e.state_province = 'Required';
      if (!form.postal_code.trim()) e.postal_code = 'Required';
    }
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handlePayWithBitcoin = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Create bookings first with pending status
      const bookingDate = new Date().toISOString().split('T')[0];
      const bookingInserts = cart.map((item) =>
        supabase.from('bookings').insert({
          product_id: item.id,
          user_id: user?.id || null,
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone || null,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          booking_date: bookingDate,
          status: 'pending_payment',
          address_line1: form.address_line1,
          address_line2: form.address_line2 || null,
          city: form.city,
          state_province: form.state_province,
          postal_code: form.postal_code,
          country: form.country,
        }).select('id')
      );

      const results = await Promise.all(bookingInserts);
      const hasError = results.some((r) => r.error);

      if (hasError) {
        setError('Failed to create order. Please try again.');
        setSubmitting(false);
        return;
      }

      const orderIds = results.map((r) => r.data?.[0]?.id).filter(Boolean);
      const orderId = orderIds[0];

      // Call BTCPay edge function to create invoice
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/btcpay-invoice`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: cartTotal,
          orderId: orderId,
          customerEmail: form.customer_email,
          customerName: form.customer_name,
          redirectUrl: `${window.location.origin}/#/success?orderId=${orderId}`,
          cartItems: cart.map((item) => ({
            name: item.title,
            player: item.player_name,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Payment setup failed (${response.status})`);
      }

      const invoice = await response.json();

      // Update bookings with invoice ID
      await Promise.all(
        orderIds.map((id) =>
          supabase.from('bookings').update({ btcpay_invoice_id: invoice.invoiceId }).eq('id', id)
        )
      );

      // Insert live purchases
      await Promise.all(cart.map((item) =>
        supabase.from('live_purchases').insert({
          customer_name: form.customer_name.split(' ')[0] + ' ' + (form.customer_name.split(' ')[1]?.[0] || '') + '.',
          city: form.city,
          product_title: item.title,
          player_name: item.player_name,
          slot_type: item.slot_type,
        })
      ));

      // Redirect to BTCPay checkout
      if (invoice.checkoutLink) {
        window.location.href = invoice.checkoutLink;
      } else {
        setError('Payment link not available. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment setup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Checkout</h2>
              <p className="text-gray-500 text-sm mt-0.5">{cartCount} experience{cartCount > 1 ? 's' : ''} · ${cartTotal.toLocaleString()}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5 shrink-0">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  i === step ? 'text-white' : i < step ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'
                }`}
                  style={i === step ? { background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' } : {}}>
                  {i < step ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error banner */}
          {error && (
            <div className="p-4 rounded-2xl text-sm text-red-700" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><UserIcon className="w-5 h-5 text-sky-500" />Contact Details</h3>
              <Field label="Full Name" required>
                <input type="text" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} placeholder="John Smith" className={inputCls(false)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" required icon={<Mail className="w-4 h-4" />}>
                  <input type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} placeholder="john@example.com" className={inputCls(false)} />
                </Field>
                <Field label="Phone Number" icon={<Phone className="w-4 h-4" />}>
                  <input type="tel" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} placeholder="+1 (555) 000-0000" className={inputCls(false)} />
                </Field>
              </div>
            </div>
          )}

          {/* Step 1: Shipping */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-500" />Delivery Address</h3>
              <p className="text-sm text-gray-500">Your FIFA Fan Card(s) will be physically shipped to this address.</p>
              <Field label="Address Line 1" required>
                <input type="text" value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} placeholder="123 Main Street" className={inputCls(false)} />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input type="text" value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} placeholder="Apt, Suite, Floor..." className={inputCls(false)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required>
                  <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="New York" className={inputCls(false)} />
                </Field>
                <Field label="State / Province" required>
                  <input type="text" value={form.state_province} onChange={(e) => set('state_province', e.target.value)} placeholder="NY" className={inputCls(false)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal Code" required>
                  <input type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="10001" className={inputCls(false)} />
                </Field>
                <Field label="Country" required icon={<Globe className="w-4 h-4" />}>
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls(false)}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-black text-gray-900">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: item.player_name.includes('Ronaldo') ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                      {item.player_name.includes('Ronaldo') ? '🇵🇹' : '🇦🇷'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-sm">{item.player_name}</p>
                      <p className="text-xs text-gray-500">{item.slot_type} — {item.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-sm">${(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery recap */}
              <div className="p-4 rounded-2xl" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <p className="text-xs font-bold text-sky-600 mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />DELIVER TO</p>
                <p className="text-sm font-bold text-gray-900">{form.customer_name}</p>
                <p className="text-sm text-gray-600">{form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ''}</p>
                <p className="text-sm text-gray-600">{form.city}, {form.state_province} {form.postal_code}</p>
                <p className="text-sm text-gray-600">{form.country}</p>
              </div>

              {/* Bitcoin payment info */}
              <div className="p-5 rounded-2xl" style={{ background: '#fffbeb', border: '1px solid #fcd34d' }}>
                <div className="flex items-start gap-3">
                  <Bitcoin className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Pay with Bitcoin</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      You will be redirected to BTCPay Server to complete your Bitcoin payment. 
                      After payment confirmation, you will be returned to our site.
                    </p>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping & Handling</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-sky-600">${cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {step < 2 ? (
              <button onClick={handleNext} className="flex-1 py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePayWithBitcoin}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}
              >
                {submitting ? <><Spinner />Processing...</> : <><Bitcoin className="w-5 h-5" />Pay with Bitcoin <ArrowUpRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, icon, children }: { label: string; required?: boolean; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        {children}
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
}

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-gray-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sky-500 focus:border-transparent ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`;
