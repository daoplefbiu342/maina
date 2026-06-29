import { useState, useEffect } from 'react';
import {
  Package, Truck, MapPin, Clock, CheckCircle, AlertTriangle, Home,
  Calendar, ChevronRight, ChevronDown, Copy, Eye, EyeOff, LogOut, Trophy
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { Booking } from '../types';

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  notes: string | null;
  created_at: string;
}

interface BookingWithTracking extends Booking {
  tracking_history?: TrackingEvent[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle; description: string }> = {
  processing: { label: 'Processing', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', icon: Clock, description: 'Your order is being prepared' },
  shipped: { label: 'Shipped', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Package, description: 'Package has been shipped' },
  in_transit: { label: 'In Transit', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Truck, description: 'Package is on the way' },
  customs: { label: 'At Customs', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: AlertTriangle, description: 'Package is clearing customs' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: Truck, description: 'Package will arrive today' },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle, description: 'Package has been delivered' },
  delayed: { label: 'Delayed', color: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: AlertTriangle, description: 'Delivery has been delayed' },
  returned: { label: 'Returned', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200', icon: Package, description: 'Package was returned to sender' },
};

interface UserDashboardProps {
  onBack: () => void;
}

export default function UserDashboard({ onBack }: UserDashboardProps) {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<BookingWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<BookingWithTracking | null | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, products(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setBookings((data as BookingWithTracking[]) || []);
    setLoading(false);
  };

  const fetchTrackingHistory = async (bookingId: string) => {
    const { data } = await supabase
      .from('tracking_history')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });
    return data as TrackingEvent[];
  };

  const toggleExpand = async (bookingId: string) => {
    if (expandedId === bookingId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(bookingId);
    const history = await fetchTrackingHistory(bookingId);
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, tracking_history: history } : b));
  };

  const handleTrackByCode = async () => {
    if (!trackingInput.trim()) return;
    setTrackingResult(undefined);
    const { data } = await supabase
      .from('bookings')
      .select('*, products(*)')
      .eq('tracking_code', trackingInput.trim().toUpperCase())
      .single();
    setTrackingResult(data as BookingWithTracking | null);
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    onBack();
  };

  return (
    <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              <Home className="w-4 h-4" />
              Home
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sky-500" />
              <span className="font-black text-gray-900">My Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.user_metadata?.full_name && (
              <span className="text-sm text-gray-600 hidden sm:block">Hi, {user.user_metadata.full_name.split(' ')[0]}</span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Track by code */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-black text-gray-900 mb-4">Track Your Package</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="Enter tracking code (e.g., FFA-XXXXXXXX)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              onClick={handleTrackByCode}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
            >
              Track
            </button>
          </div>

          {trackingResult === null && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
              No package found with that tracking code. Please check the code and try again.
            </div>
          )}

          {trackingResult && (
            <div className="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">{trackingResult.tracking_code}</span>
                <TrackingStatusBadge status={trackingResult.tracking_status || 'processing'} />
              </div>
              <p className="text-xs text-gray-500">
                {trackingResult.products?.player_name} · {trackingResult.products?.slot_type}
              </p>
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-black text-gray-900 text-lg">My Orders</h2>
            <p className="text-gray-500 text-sm mt-0.5">View your FIFA Fan Card purchases and delivery status</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 mx-auto border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Package className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <p className="font-bold text-gray-400 mb-1">No orders yet</p>
              <p className="text-gray-400 text-sm">Your purchased FIFA Fan Cards will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const config = STATUS_CONFIG[booking.tracking_status || 'processing'] || STATUS_CONFIG.processing;
                const StatusIcon = config.icon;
                const isExpanded = expandedId === booking.id;
                const isRonaldo = booking.products?.player_name?.includes('Ronaldo');

                return (
                  <div key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <div
                      className="p-5 flex flex-wrap items-center gap-4 cursor-pointer"
                      onClick={() => toggleExpand(booking.id)}
                    >
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: isRonaldo ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                        {isRonaldo ? '🇵🇹' : '🇦🇷'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm">{booking.products?.player_name || 'FIFA Fan Card'}</p>
                        <p className="text-xs text-gray-500">{booking.products?.slot_type} · ×{booking.quantity}</p>
                        {booking.tracking_code && (
                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(booking.tracking_code!); }}
                            className="flex items-center gap-1.5 mt-1.5 text-xs font-mono text-sky-600 hover:text-sky-700"
                          >
                            {booking.tracking_code}
                            {copiedCode === booking.tracking_code ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Status */}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.color} ${config.bg}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>

                      {/* Amount & Date */}
                      <div className="text-right shrink-0">
                        <p className="font-black text-gray-900 text-sm">${booking.total_price.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</p>
                      </div>

                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-0">
                        <div className="rounded-2xl overflow-hidden border border-gray-100">
                          {/* Delivery address */}
                          {booking.address_line1 && (
                            <div className="p-4 border-b border-gray-100">
                              <p className="text-xs font-bold text-gray-400 tracking-widest mb-2 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />DELIVERY ADDRESS
                              </p>
                              <p className="text-sm text-gray-700">{booking.address_line1}{booking.address_line2 ? `, ${booking.address_line2}` : ''}</p>
                              <p className="text-sm text-gray-700">{booking.city}, {booking.state_province} {booking.postal_code}</p>
                              <p className="text-sm text-gray-700">{booking.country}</p>
                            </div>
                          )}

                          {/* Tracking info */}
                          <div className="p-4 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-400 tracking-widest mb-3 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" />TRACKING INFO
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-bold text-gray-900">{config.label}</p>
                              </div>
                              {booking.tracking_carrier && (
                                <div>
                                  <p className="text-gray-500">Carrier</p>
                                  <p className="font-bold text-gray-900">{booking.tracking_carrier}</p>
                                </div>
                              )}
                              {booking.tracking_eta && (
                                <div>
                                  <p className="text-gray-500">Estimated Delivery</p>
                                  <p className="font-bold text-gray-900">{new Date(booking.tracking_eta).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                </div>
                              )}
                              {booking.tracking_last_update && (
                                <div>
                                  <p className="text-gray-500">Last Update</p>
                                  <p className="font-bold text-gray-900">{new Date(booking.tracking_last_update).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                            {booking.tracking_notes && (
                              <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                                <p className="text-xs text-yellow-800">{booking.tracking_notes}</p>
                              </div>
                            )}
                          </div>

                          {/* Tracking history */}
                          {booking.tracking_history && booking.tracking_history.length > 0 && (
                            <div className="p-4">
                              <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">TRACKING TIMELINE</p>
                              <div className="space-y-3">
                                {booking.tracking_history.map((event, i) => {
                                  const eventConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.processing;
                                  const EventIcon = eventConfig.icon;
                                  return (
                                    <div key={event.id} className="flex items-start gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${eventConfig.bg}`}>
                                        <EventIcon className={`w-4 h-4 ${eventConfig.color}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="font-bold text-gray-900 text-sm">{eventConfig.label}</p>
                                          <p className="text-xs text-gray-400">{new Date(event.created_at).toLocaleDateString()}</p>
                                        </div>
                                        {event.location && <p className="text-xs text-gray-500">{event.location}</p>}
                                        {event.notes && <p className="text-xs text-gray-600 mt-0.5">{event.notes}</p>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function TrackingStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${config.color} ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
