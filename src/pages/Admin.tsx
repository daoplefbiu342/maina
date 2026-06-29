import { useState, useEffect } from 'react';
import {
  Shield, Lock, Eye, EyeOff, TrendingUp, ShoppingBag, Users, DollarSign,
  Search, ChevronDown, CheckCircle, Clock, XCircle, RotateCcw,
  CreditCard, Zap, AlertTriangle, RefreshCw, MapPin, Mail, Phone,
  Trophy, ExternalLink, ArrowLeft, Download, Wallet, Smartphone, Link, Key, Globe,
  Package, Truck, Calendar, FileText, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

const ADMIN_PASSWORD = 'admin2026';

interface AdminProps {
  onBack: () => void;
}

const ORDER_STATUS_STYLES: Record<string, { color: string; bg: string; icon: typeof CheckCircle }> = {
  confirmed: { color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  pending:   { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock },
  cancelled: { color: 'text-red-700',   bg: 'bg-red-50 border-red-200',      icon: XCircle },
};

const TRACKING_STATUS_STYLES: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  processing:       { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock, label: 'Processing' },
  shipped:          { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: Package, label: 'Shipped' },
  in_transit:       { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: Truck, label: 'In Transit' },
  customs:          { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle, label: 'At Customs' },
  out_for_delivery: { color: 'text-green-700', bg: 'bg-green-50 border-green-200',   icon: Truck, label: 'Out for Delivery' },
  delivered:        { color: 'text-green-700', bg: 'bg-green-50 border-green-200',   icon: CheckCircle, label: 'Delivered' },
  delayed:          { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: AlertTriangle, label: 'Delayed' },
  returned:         { color: 'text-gray-700',  bg: 'bg-gray-50 border-gray-200',     icon: Package, label: 'Returned' },
};

const CARRIERS = ['DHL', 'FedEx', 'UPS', 'USPS', 'Royal Mail', 'DPD', 'Hermes', 'Local Courier', 'Other'];

type AdminTab = 'orders' | 'tracking' | 'payment' | 'analytics';

interface BookingWithTracking extends Booking {
  tracking_code?: string;
  tracking_status?: string;
  tracking_carrier?: string;
  tracking_eta?: string;
  tracking_last_update?: string;
  tracking_notes?: string;
}

export default function Admin({ onBack }: AdminProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState<BookingWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tab, setTab] = useState<AdminTab>('orders');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [oxapayMerchantId, setOxapayMerchantId] = useState('');
  const [paymentSaved, setPaymentSaved] = useState(false);

  // Tracking update form state
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');
  const [trackingEta, setTrackingEta] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');
  const [trackingEventNotes, setTrackingEventNotes] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect password. Hint: admin2026');
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchBookings();
  }, [authenticated]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setBookings(data as BookingWithTracking[]);
    setLoading(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    setUpdating(id);
    await supabase.from('bookings').update({ status }).eq('id', id);
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    setUpdating(null);
  };

  const updateTracking = async (booking: BookingWithTracking) => {
    setUpdating(booking.id);
    const updates: Record<string, unknown> = {};
    if (trackingStatus) updates.tracking_status = trackingStatus;
    if (trackingCarrier) updates.tracking_carrier = trackingCarrier;
    if (trackingEta) updates.tracking_eta = trackingEta;
    if (trackingNotes) updates.tracking_notes = trackingNotes;
    updates.tracking_last_update = new Date().toISOString();

    await supabase.from('bookings').update(updates).eq('id', booking.id);

    // Add tracking history event
    if (trackingStatus && (trackingLocation || trackingEventNotes)) {
      await supabase.from('tracking_history').insert({
        booking_id: booking.id,
        status: trackingStatus,
        location: trackingLocation || null,
        notes: trackingEventNotes || null,
      });
    }

    // If package delivered, also add to live_purchases for social proof
    if (trackingStatus === 'delivered') {
      await supabase.from('live_purchases').insert({
        customer_name: booking.customer_name.split(' ')[0] + ' ' + (booking.customer_name.split(' ')[1]?.[0] || '') + '.',
        city: booking.city || 'Unknown',
        product_title: booking.products?.title || 'FIFA Fan Card',
        player_name: booking.products?.player_name || 'Unknown',
        slot_type: booking.products?.slot_type || 'Standard',
      });
    }

    await fetchBookings();
    setTrackingStatus('');
    setTrackingCarrier('');
    setTrackingEta('');
    setTrackingNotes('');
    setTrackingLocation('');
    setTrackingEventNotes('');
    setUpdating(null);
  };

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || [b.customer_name, b.customer_email, b.city || '', b.tracking_code || ''].some(
      (f) => f.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    revenue: bookings.filter((b) => b.status !== 'cancelled').reduce((s, b) => s + b.total_price, 0),
    ronaldo: bookings.filter((b) => b.products?.player_name?.includes('Ronaldo')).length,
    messi: bookings.filter((b) => b.products?.player_name?.includes('Messi')).length,
    delivered: bookings.filter((b) => b.tracking_status === 'delivered').length,
    inTransit: bookings.filter((b) => ['shipped', 'in_transit', 'out_for_delivery'].includes(b.tracking_status || '')).length,
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg,#080f1e,#0c1f3f)' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-2xl"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Admin Portal</h1>
            <p className="text-white/50 text-sm">FIFA Fan Access · Restricted Access</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: '#fef9c3', border: '1px solid #fef08a' }}>
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <p className="text-yellow-800 text-sm font-medium">This area is for authorized administrators only.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter admin password"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && <p className="text-red-500 text-xs mt-1.5">{authError}</p>}
              </div>

              <button
                onClick={handleLogin}
                className="w-full py-3.5 rounded-xl text-white font-black transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
              >
                Sign In to Dashboard
              </button>

              <button onClick={onBack} className="w-full py-3 text-gray-500 text-sm hover:text-gray-700 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Admin header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Exit Admin
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sky-500" />
              <span className="font-black text-gray-900">FIFA Fan Access</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>ADMIN</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBookings} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>A</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
            { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
            { label: 'In Transit', value: stats.inTransit, icon: Truck, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
            { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-2xl font-black text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
            { id: 'tracking' as AdminTab, label: 'Tracking Management', icon: Truck },
            { id: 'payment' as AdminTab, label: 'Payment Integration', icon: CreditCard },
            { id: 'analytics' as AdminTab, label: 'Analytics', icon: TrendingUp },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === id ? 'text-white shadow-md' : 'bg-white text-gray-500 hover:text-gray-900 border border-gray-200'}`}
              style={tab === id ? { background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' } : {}}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, tracking code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-16"><div className="w-10 h-10 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 font-bold text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Experience</th>
                      <th className="px-4 py-3 text-left">Tracking</th>
                      <th className="px-4 py-3 text-left">Amount</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((booking) => {
                      const st = ORDER_STATUS_STYLES[booking.status] || ORDER_STATUS_STYLES.pending;
                      const StatusIcon = st.icon;
                      const isRonaldo = booking.products?.player_name?.includes('Ronaldo');
                      const trackingSt = TRACKING_STATUS_STYLES[booking.tracking_status || 'processing'] || TRACKING_STATUS_STYLES.processing;
                      const TrackingIcon = trackingSt.icon;

                      return (
                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black shrink-0"
                                style={{ background: `linear-gradient(135deg,${isRonaldo ? '#dc2626,#991b1b' : '#0ea5e9,#1d4ed8'})` }}>
                                {booking.customer_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{booking.customer_name}</p>
                                <p className="text-xs text-gray-500">{booking.customer_email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-gray-900">{booking.products?.player_name?.split(' ').pop()}</p>
                            <p className="text-xs text-gray-500">{booking.products?.slot_type} · ×{booking.quantity}</p>
                          </td>
                          <td className="px-4 py-4">
                            {booking.tracking_code ? (
                              <div>
                                <p className="font-mono text-xs text-gray-900">{booking.tracking_code}</p>
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${trackingSt.color} ${trackingSt.bg}`}>
                                  <TrackingIcon className="w-3 h-3" />
                                  {trackingSt.label}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">Not generated</span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-black text-gray-900">${booking.total_price.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.color} ${st.bg}`}>
                              <StatusIcon className="w-3 h-3" />
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tracking Management tab */}
        {tab === 'tracking' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 text-lg mb-2">Package Tracking Management</h3>
              <p className="text-gray-500 text-sm mb-6">Update tracking status, carrier, and estimated delivery date for each order. Add notes about delays, customs clearance, or delivery issues.</p>

              {/* Quick filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['all', 'processing', 'shipped', 'in_transit', 'customs', 'out_for_delivery', 'delivered', 'delayed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status === 'all' ? 'all' : 'confirmed'); setSearch(''); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {status === 'all' ? 'All Orders' : TRACKING_STATUS_STYLES[status]?.label || status}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="text-center py-16"><div className="w-10 h-10 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="space-y-4">
                  {bookings.filter((b) => b.tracking_code).map((booking) => {
                    const trackingSt = TRACKING_STATUS_STYLES[booking.tracking_status || 'processing'] || TRACKING_STATUS_STYLES.processing;
                    const TrackingIcon = trackingSt.icon;
                    const isSelected = expandedId === booking.id;
                    const isRonaldo = booking.products?.player_name?.includes('Ronaldo');

                    return (
                      <div key={booking.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div
                          className="p-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedId(isSelected ? null : booking.id)}
                        >
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                            style={{ background: isRonaldo ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                            {isRonaldo ? '🇵🇹' : '🇦🇷'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{booking.customer_name}</p>
                            <p className="text-xs text-gray-500">{booking.city}, {booking.country}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm text-gray-900">{booking.tracking_code}</p>
                            <p className="text-xs text-gray-500">{booking.tracking_carrier || 'No carrier assigned'}</p>
                          </div>
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${trackingSt.color} ${trackingSt.bg}`}>
                            <TrackingIcon className="w-3.5 h-3.5" />
                            {trackingSt.label}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Expanded form */}
                        {isSelected && (
                          <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">Tracking Status</label>
                                <select
                                  value={trackingStatus || booking.tracking_status || 'processing'}
                                  onChange={(e) => setTrackingStatus(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                >
                                  {Object.entries(TRACKING_STATUS_STYLES).map(([key, val]) => (
                                    <option key={key} value={key}>{val.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">Carrier</label>
                                <select
                                  value={trackingCarrier || booking.tracking_carrier || ''}
                                  onChange={(e) => setTrackingCarrier(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                                >
                                  <option value="">Select carrier</option>
                                  {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">Estimated Delivery</label>
                                <input
                                  type="date"
                                  value={trackingEta || booking.tracking_eta || ''}
                                  onChange={(e) => setTrackingEta(e.target.value)}
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1.5">Location (for event)</label>
                                <input
                                  type="text"
                                  value={trackingLocation}
                                  onChange={(e) => setTrackingLocation(e.target.value)}
                                  placeholder="e.g., New York, USA"
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">Admin Notes (visible to customer)</label>
                              <textarea
                                value={trackingNotes}
                                onChange={(e) => setTrackingNotes(e.target.value)}
                                placeholder="e.g., Delayed due to customs clearance. Expected to arrive in 3-5 days."
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-xs font-bold text-gray-600 mb-1.5">Event Notes (for tracking timeline)</label>
                              <input
                                type="text"
                                value={trackingEventNotes}
                                onChange={(e) => setTrackingEventNotes(e.target.value)}
                                placeholder="e.g., Package arrived at sorting facility"
                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => updateTracking(booking)}
                                disabled={updating === booking.id}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
                              >
                                {updating === booking.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Save Tracking Update
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setTrackingStatus('');
                                  setTrackingCarrier('');
                                  setTrackingEta('');
                                  setTrackingNotes('');
                                  setTrackingLocation('');
                                  setTrackingEventNotes('');
                                }}
                                className="px-4 py-2.5 rounded-xl text-gray-600 font-bold text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Integration tab */}
        {tab === 'payment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}>
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-lg">Oxapay Payment Gateway</h3>
                    <p className="text-gray-500 text-sm">Accept cards, Apple Pay, CashApp, and 50+ payment methods</p>
                  </div>
                  <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
                    Not Connected
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Key className="w-4 h-4 text-violet-500" />
                      Oxapay Merchant ID
                    </label>
                    <input
                      type="text"
                      value={oxapayMerchantId}
                      onChange={(e) => setOxapayMerchantId(e.target.value)}
                      placeholder="merchant_..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-violet-500" />
                      API Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk_live_... (stored securely server-side)"
                      value=""
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-violet-500 font-mono bg-gray-50"
                      disabled
                    />
                    <p className="text-xs text-gray-400 mt-1">Stored securely in Edge Function secrets</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-violet-500" />
                    Oxapay Dashboard
                  </label>
                  <input
                    type="text"
                    value="https://oxapay.com/"
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPaymentSaved(true); setTimeout(() => setPaymentSaved(false), 3000); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                    style={{ background: paymentSaved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#8b5cf6,#6366f1)' }}
                  >
                    {paymentSaved ? <><CheckCircle className="w-4 h-4" />Connected!</> : 'Connect Oxapay'}
                  </button>
                  <a
                    href="https://oxapay.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Oxapay Dashboard
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-black text-gray-900 text-lg mb-4">Supported Payment Methods</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Apple Pay', icon: '🍎', active: true },
                  { name: 'Cash App', icon: '💵', active: true },
                  { name: 'Visa', icon: '💳', active: true },
                  { name: 'Mastercard', icon: '💳', active: true },
                ].map(({ name, icon }) => (
                  <div key={name} className="p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <span className="font-bold text-gray-900 text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics tab */}
        {tab === 'analytics' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-200 mb-4" />
            <h3 className="font-black text-gray-900 text-xl mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500 mb-6">Connect your analytics provider for detailed insights.</p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {[
                { label: 'Avg Order Value', value: stats.total > 0 ? `$${Math.round(stats.revenue / stats.total).toLocaleString()}` : 'N/A' },
                { label: 'Delivery Rate', value: stats.total > 0 ? `${Math.round((stats.delivered / stats.total) * 100)}%` : 'N/A' },
                { label: 'In Transit', value: stats.inTransit },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xl font-black text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
