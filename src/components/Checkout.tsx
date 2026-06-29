import { useState } from 'react';
import { X, Check, ChevronRight, MapPin, User as UserIcon, Mail, Phone, Globe, CreditCard, Smartphone, Wallet, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { CartItem, ShippingForm } from '../types';
import type { User } from '@supabase/supabase-js';

interface CheckoutProps {
  cart: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

const COUNTRIES = ['United States', 'United Kingdom', 'Australia', 'Canada', 'United Arab Emirates', 'Saudi Arabia', 'Germany', 'France', 'Spain', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Japan', 'South Korea', 'India', 'China', 'South Africa', 'Nigeria', 'Ghana', 'Other'];

const STEPS = ['Contact', 'Shipping', 'Payment', 'Review'];

const EMPTY_FORM: ShippingForm = {
  customer_name: '', customer_email: '', customer_phone: '',
  address_line1: '', address_line2: '', city: '', state_province: '', postal_code: '', country: 'United States',
};

type PaymentMethod = 'applepay' | 'cashapp' | 'card';

export default function Checkout({ cart, onClose, onSuccess, user }: CheckoutProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ShippingForm>({
    ...EMPTY_FORM,
    customer_name: user?.user_metadata?.full_name || '',
    customer_email: user?.email || '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('applepay');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const set = (field: keyof ShippingForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const bookingDate = new Date().toISOString().split('T')[0];
    const results = await Promise.all(cart.map((item) =>
      supabase.from('bookings').insert({
        product_id: item.id,
        user_id: user?.id || null,
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        customer_phone: form.customer_phone || null,
        quantity: item.quantity,
        total_price: item.price * item.quantity,
        booking_date: bookingDate,
        status: 'confirmed',
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        state_province: form.state_province,
        postal_code: form.postal_code,
        country: form.country,
      })
    ));
    const hasError = results.some((r) => r.error);
    setSubmitting(false);
    if (!hasError) {
      await Promise.all(cart.map((item) =>
        supabase.from('live_purchases').insert({
          customer_name: form.customer_name.split(' ')[0] + ' ' + (form.customer_name.split(' ')[1]?.[0] || '') + '.',
          city: form.city,
          product_title: item.title,
          player_name: item.player_name,
          slot_type: item.slot_type,
        })
      ));
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 3500);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-5"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
            <Check className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Order Confirmed!</h3>
          <p className="text-gray-500 mb-1">Your FIFA Fan Cards are on their way.</p>
          <p className="text-gray-400 text-sm">Confirmation sent to <strong>{form.customer_email}</strong></p>
          <div className="mt-4 p-3 rounded-xl text-sm text-gray-600 text-left"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="font-semibold mb-1">Delivery to:</p>
            <p>{form.address_line1}{form.address_line2 ? `, ${form.address_line2}` : ''}</p>
            <p>{form.city}, {form.state_province} {form.postal_code}</p>
            <p>{form.country}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 pt-6 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Secure Checkout</h2>
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
          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><UserIcon className="w-5 h-5 text-sky-500" />Contact Details</h3>
              <Field label="Full Name" required error={errors.customer_name}>
                <input type="text" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} placeholder="John Smith" className={inputCls(!!errors.customer_name)} />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" required error={errors.customer_email} icon={<Mail className="w-4 h-4" />}>
                  <input type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} placeholder="john@example.com" className={inputCls(!!errors.customer_email)} />
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
              <Field label="Address Line 1" required error={errors.address_line1}>
                <input type="text" value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} placeholder="123 Main Street" className={inputCls(!!errors.address_line1)} />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input type="text" value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} placeholder="Apt, Suite, Floor..." className={inputCls(false)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" required error={errors.city}>
                  <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="New York" className={inputCls(!!errors.city)} />
                </Field>
                <Field label="State / Province" required error={errors.state_province}>
                  <input type="text" value={form.state_province} onChange={(e) => set('state_province', e.target.value)} placeholder="NY" className={inputCls(!!errors.state_province)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal Code" required error={errors.postal_code}>
                  <input type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="10001" className={inputCls(!!errors.postal_code)} />
                </Field>
                <Field label="Country" required icon={<Globe className="w-4 h-4" />}>
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls(false)}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-sky-500" />Payment Method</h3>
              <p className="text-sm text-gray-500">Choose how you want to pay for your order.</p>

              <div className="space-y-3">
                {/* Apple Pay */}
                <button
                  onClick={() => setPaymentMethod('applepay')}
                  className={`w-full text-left p-5 rounded-2xl transition-all ${
                    paymentMethod === 'applepay'
                      ? 'border-2 border-sky-500 bg-sky-50'
                      : 'border border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      paymentMethod === 'applepay' ? 'bg-sky-500 text-white' : 'bg-gray-900 text-white'
                    }`}>
                      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.36-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.36C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98 1.09 7.14-.53 1.31-1.23 2.61-2.14 3.07zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.73-2.47 4.5-3.74 4.25z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Apple Pay</p>
                      <p className="text-sm text-gray-500">Fast, secure payment with Face ID or Touch ID</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'applepay' ? 'border-sky-500 bg-sky-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'applepay' && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>

                {/* Cash App */}
                <button
                  onClick={() => setPaymentMethod('cashapp')}
                  className={`w-full text-left p-5 rounded-2xl transition-all ${
                    paymentMethod === 'cashapp'
                      ? 'border-2 border-green-500 bg-green-50'
                      : 'border border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      paymentMethod === 'cashapp' ? 'bg-green-500 text-white' : 'bg-[#00D632] text-white'
                    }`}>
                      <Wallet className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Cash App Pay</p>
                      <p className="text-sm text-gray-500">Pay directly from your Cash App balance</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'cashapp' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'cashapp' && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>

                {/* Credit/Debit Card via Oxapay */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full text-left p-5 rounded-2xl transition-all ${
                    paymentMethod === 'card'
                      ? 'border-2 border-violet-500 bg-violet-50'
                      : 'border border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                      paymentMethod === 'card' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <CreditCard className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">Credit / Debit Card</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, Amex — powered by Oxapay</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === 'card' ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                      {paymentMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Payment info */}
              <div className="p-4 rounded-xl" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Secure Payment</p>
                    <p className="text-gray-600 text-xs mt-0.5">All transactions are encrypted and processed through Oxapay's secure infrastructure. Your payment details are never stored on our servers.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
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

              {/* Payment recap */}
              <div className="p-4 rounded-2xl" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                <p className="text-xs font-bold text-violet-600 mb-2 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" />PAYMENT METHOD</p>
                <div className="flex items-center gap-3">
                  {paymentMethod === 'applepay' && (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.36-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.36C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98 1.09 7.14-.53 1.31-1.23 2.61-2.14 3.07zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.73-2.47 4.5-3.74 4.25z"/></svg>
                      </div>
                      <p className="text-sm font-bold text-gray-900">Apple Pay</p>
                    </>
                  )}
                  {paymentMethod === 'cashapp' && (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-[#00D632] flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Cash App Pay</p>
                    </>
                  )}
                  {paymentMethod === 'card' && (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-sm font-bold text-gray-900">Credit / Debit Card (Oxapay)</p>
                    </>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-2">
                {[
                  { label: 'Subtotal', value: `$${cartTotal.toLocaleString()}` },
                  { label: 'Shipping & Handling', value: 'FREE' },
                  { label: 'FIFA Experience Tax', value: 'Included' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className={`font-semibold ${value === 'FREE' ? 'text-green-600' : 'text-gray-900'}`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-sky-600">${cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl text-xs text-gray-500 flex items-start gap-2"
                style={{ background: '#fefce8', border: '1px solid #fef08a' }}>
                <span className="text-yellow-500 shrink-0">⚡</span>
                You will be redirected to complete payment via {paymentMethod === 'applepay' ? 'Apple Pay' : paymentMethod === 'cashapp' ? 'Cash App' : 'Oxapay'}. By confirming you agree to our Terms of Service.
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
            {step < 3 ? (
              <button onClick={handleNext} className="flex-1 py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
              >
                {submitting ? <><Spinner />Processing...</> : <><Check className="w-5 h-5" />Pay ${cartTotal.toLocaleString()}</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, icon, children }: { label: string; required?: boolean; error?: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        {children}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
}

const inputCls = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-gray-900 text-sm outline-none transition-all focus:ring-2 focus:ring-sky-500 focus:border-transparent ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`;
