import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Truck, MapPin, Clock, CheckCircle, AlertTriangle,
  ChevronDown, Copy, LogOut, Trophy, User, Bell, Search,
  ChevronRight, Shield, CreditCard, Home
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
  tracking_code?: string;
  tracking_status?: string;
  tracking_carrier?: string;
  tracking_eta?: string;
  tracking_last_update?: string;
  tracking_notes?: string;
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

type UserTab = 'dashboard' | 'orders' | 'tracking' | 'profile';

const NAV_ITEMS: { id: UserTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'tracking', label: 'Tracking', icon: Truck },
  { id: 'profile', label: 'Profile', icon: User },
];

export default function UserDashboard({ onBack }: UserDashboardProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<UserTab>('dashboard');
  const [bookings, setBookings] = useState<BookingWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<BookingWithTracking | null | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBookings = bookings.filter(b =>
    b.products?.player_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.products?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const activeOrders = bookings.filter(b => b.tracking_status !== 'delivered' && b.tracking_status !== 'returned').length;
  const deliveredOrders = bookings.filter(b => b.tracking_status === 'delivered').length;

  const userInitials = user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    || user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
        style={{ minHeight: '100vh' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-black text-sm text-gray-900 whitespace-nowrap">FIFA FAN ACCESS</p>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest whitespace-nowrap">MY ACCOUNT</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="font-black text-gray-900 text-lg">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                {userInitials}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-6 overflow-auto">
          {loading && activeTab !== 'tracking' ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ─── DASHBOARD TAB ─── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 max-w-6xl">
                  {/* Welcome */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-gray-900">Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Fan'}!</h2>
                        <p className="text-gray-500 text-sm mt-1">Here is what is happening with your FIFA Fan Access account.</p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Total Orders', value: bookings.length, icon: Package, color: 'sky' },
                      { label: 'Active Orders', value: activeOrders, icon: Truck, color: 'amber' },
                      { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: CreditCard, color: 'emerald' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                          </div>
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-${stat.color}-50`}>
                            <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Recent Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                        View All
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 text-sm">No orders yet. Start shopping!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {bookings.slice(0, 3).map((booking) => {
                          const config = STATUS_CONFIG[booking.tracking_status || 'processing'] || STATUS_CONFIG.processing;
                          const StatusIcon = config.icon;
                          const isRonaldo = booking.products?.player_name?.includes('Ronaldo');
                          return (
                            <div key={booking.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                style={{ background: isRonaldo ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                                {isRonaldo ? '🇵🇹' : '🇦🇷'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm">{booking.products?.player_name || 'FIFA Fan Card'}</p>
                                <p className="text-xs text-gray-500">{booking.products?.slot_type} · {new Date(booking.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} ${config.bg}`}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </span>
                              <p className="font-black text-gray-900 text-sm shrink-0">${booking.total_price.toLocaleString()}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('tracking')} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left hover:border-sky-200 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-3 group-hover:bg-sky-100 transition-colors">
                        <Truck className="w-5 h-5 text-sky-600" />
                      </div>
                      <p className="font-bold text-gray-900">Track a Package</p>
                      <p className="text-sm text-gray-500 mt-0.5">Enter your tracking code to see delivery status</p>
                    </button>
                    <button onClick={onBack} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-left hover:border-sky-200 hover:shadow-md transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                        <Home className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="font-bold text-gray-900">Shop More</p>
                      <p className="text-sm text-gray-500 mt-0.5">Browse new FIFA Fan Card experiences</p>
                    </button>
                  </div>
                </div>
              )}

              {/* ─── ORDERS TAB ─── */}
              {activeTab === 'orders' && (
                <div className="space-y-6 max-w-6xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">My Orders</h2>
                    <div className="relative w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search orders..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-16">
                        <Package className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                        <p className="font-bold text-gray-400 mb-1">No orders found</p>
                        <p className="text-gray-400 text-sm">Your purchased FIFA Fan Cards will appear here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {filteredBookings.map((booking) => {
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
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                                  style={{ background: isRonaldo ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                                  {isRonaldo ? '🇵🇹' : '🇦🇷'}
                                </div>
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
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.color} ${config.bg}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {config.label}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-black text-gray-900 text-sm">${booking.total_price.toLocaleString()}</p>
                                  <p className="text-xs text-gray-400">{new Date(booking.created_at).toLocaleDateString()}</p>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>

                              {isExpanded && (
                                <div className="px-5 pb-5 pt-0">
                                  <div className="rounded-2xl overflow-hidden border border-gray-100">
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
                                      </div>
                                    </div>
                                    {booking.tracking_history && booking.tracking_history.length > 0 && (
                                      <div className="p-4">
                                        <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">TRACKING TIMELINE</p>
                                        <div className="space-y-3">
                                          {booking.tracking_history.map((event) => {
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
                </div>
              )}

              {/* ─── TRACKING TAB ─── */}
              {activeTab === 'tracking' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-8 h-8 text-sky-600" />
                    </div>
                    <h2 className="font-black text-gray-900 text-xl mb-2">Track Your Package</h2>
                    <p className="text-gray-500 text-sm mb-6">Enter your tracking code to see real-time delivery status</p>
                    <div className="flex gap-3 max-w-md mx-auto">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                        placeholder="Enter tracking code (e.g., FFA-XXXXXXXX)"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleTrackByCode}
                        className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
                      >
                        Track
                      </button>
                    </div>

                    {trackingResult === null && (
                      <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 max-w-md mx-auto">
                        No package found with that tracking code. Please check the code and try again.
                      </div>
                    )}

                    {trackingResult && (
                      <div className="mt-6 p-5 rounded-xl bg-sky-50 border border-sky-100 max-w-md mx-auto text-left">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-gray-900">{trackingResult.tracking_code}</span>
                          <TrackingStatusBadge status={trackingResult.tracking_status || 'processing'} />
                        </div>
                        <p className="text-sm text-gray-700 mb-1">{trackingResult.products?.player_name} · {trackingResult.products?.slot_type}</p>
                        <p className="text-xs text-gray-500">Order #{trackingResult.id?.slice(0, 8)}</p>
                      </div>
                    )}
                  </div>

                  {/* Active shipments from orders */}
                  {bookings.filter(b => b.tracking_code).length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Your Active Shipments</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {bookings.filter(b => b.tracking_code).map((booking) => {
                          const config = STATUS_CONFIG[booking.tracking_status || 'processing'] || STATUS_CONFIG.processing;
                          const StatusIcon = config.icon;
                          return (
                            <div key={booking.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                                <StatusIcon className={`w-5 h-5 ${config.color}`} />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900 text-sm">{booking.products?.player_name}</p>
                                <p className="text-xs text-gray-500">{booking.tracking_code}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${config.color} ${config.bg}`}>
                                {config.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── PROFILE TAB ─── */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-3xl">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-black"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                        {userInitials}
                      </div>
                      <div>
                        <h2 className="font-black text-gray-900 text-lg">{user?.user_metadata?.full_name || 'User'}</h2>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-1.5">Full Name</label>
                          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
                            {user?.user_metadata?.full_name || 'Not set'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-1.5">Email</label>
                          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
                            {user?.email}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-1.5">Member Since</label>
                          <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase mb-1.5">Account Status</label>
                          <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-emerald-700 font-semibold flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Active
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Total Orders</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{bookings.length}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Delivered</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{deliveredOrders}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">Total Spent</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">${totalSpent.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
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
