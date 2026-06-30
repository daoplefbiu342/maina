import { useState, useEffect } from 'react';
import {
  Shield, Lock, Eye, EyeOff, Users, Package, Truck, Plus, Search, CheckCircle, Clock,
  LogOut, MapPin, User, Database, BarChart3, DollarSign, Send, X,
  ChevronRight, Bell, TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Booking, Product } from '../types';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'FifaAdmin2026!';

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

interface ShipmentForm {
  order_id: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string;
  carrier: string;
  tracking_number: string;
  shipping_method: string;
  estimated_delivery: string;
  origin_location: string;
  destination_country: string;
  destination_city: string;
  destination_address: string;
  destination_postal_code: string;
  weight_kg: string;
  dimensions_cm: string;
  shipping_cost: string;
  insurance: boolean;
  signature_required: boolean;
  notes: string;
}

const CARRIERS = [
  'DHL Express', 'FedEx International', 'UPS Worldwide', 'USPS Priority',
  'Royal Mail', 'DPD', 'Hermes', 'Local Courier', 'Other'
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'green' },
  { value: 'shipped', label: 'Shipped', color: 'blue' },
  { value: 'delivered', label: 'Delivered', color: 'emerald' },
  { value: 'cancelled', label: 'Cancelled', color: 'gray' },
];

type AdminTab = 'dashboard' | 'orders' | 'shipments' | 'users' | 'products' | 'analytics';

const NAV_ITEMS: { id: AdminTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'shipments', label: 'Shipments', icon: Truck },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'products', label: 'Products', icon: Database },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentForm, setShipmentForm] = useState<ShipmentForm>({
    order_id: '', recipient_name: '', recipient_email: '', recipient_phone: '',
    carrier: 'DHL Express', tracking_number: '', shipping_method: 'Express',
    estimated_delivery: '', origin_location: 'London, UK', destination_country: '',
    destination_city: '', destination_address: '', destination_postal_code: '',
    weight_kg: '', dimensions_cm: '', shipping_cost: '', insurance: false,
    signature_required: true, notes: '',
  });
  const [savingShipment, setSavingShipment] = useState(false);

  const handleLogin = () => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Try admin / FifaAdmin2026!');
    }
  };

  useEffect(() => {
    if (authenticated) fetchAllData();
  }, [authenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    const [bookingsRes, productsRes, usersRes] = await Promise.all([
      supabase.from('bookings').select('*, products(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('player_name'),
      supabase.from('auth.users').select('id, email, created_at, last_sign_in_at, email_confirmed_at').limit(100),
    ]);
    if (bookingsRes.data) setBookings(bookingsRes.data as Booking[]);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    if (usersRes.data) setUsers(usersRes.data as AdminUser[]);
    setLoading(false);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #080f1e 0%, #0c1f3f 50%, #071428 100%)' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #080f1e, #0c1f3f)' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-black text-white mb-1">Admin Portal</h1>
              <p className="text-white/50 text-sm">FIFA Fan Access Administration</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100">{authError}</div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                Sign In to Admin
              </button>
            </form>
            <div className="px-8 pb-6 text-center">
              <p className="text-gray-400 text-xs">Secure admin access</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(userSearch.toLowerCase()));
  const filteredOrders = bookings.filter(b => {
    const match = b.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      b.id?.toLowerCase().includes(orderSearch.toLowerCase());
    if (orderFilter === 'all') return match;
    return match && b.status === orderFilter;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const confirmedOrders = bookings.filter(b => b.status === 'confirmed').length;
  const pendingOrders = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-gray-200 bg-white transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`} style={{ minHeight: '100vh' }}>
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-black text-sm text-gray-900 whitespace-nowrap">FIFA FAN ACCESS</p>
              <p className="text-[10px] text-gray-400 font-bold tracking-widest whitespace-nowrap">ADMIN PORTAL</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-red-50 text-red-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
                title={sidebarCollapsed ? item.label : undefined}>
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}>
            <ChevronRight className={`w-5 h-5 shrink-0 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
          <button onClick={() => setAuthenticated(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            title={sidebarCollapsed ? 'Sign Out' : undefined}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <h1 className="font-black text-gray-900 text-lg">{NAV_ITEMS.find(n => n.id === activeTab)?.label}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black" style={{ background: 'linear-gradient(135deg,#dc2626,#991b1b)' }}>
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{ADMIN_USERNAME}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ─── DASHBOARD ─── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 max-w-6xl">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                      { label: 'Total Orders', value: bookings.length, icon: Package, color: 'sky' },
                      { label: 'Confirmed', value: confirmedOrders, icon: CheckCircle, color: 'green' },
                      { label: 'Pending', value: pendingOrders, icon: Clock, color: 'amber' },
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
                      <h2 className="font-bold text-gray-900">Recent Orders</h2>
                      <button onClick={() => setActiveTab('orders')} className="text-sm font-semibold text-red-600 hover:text-red-700">View All</button>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bookings.slice(0, 5).map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{order.customer_name}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.total_price?.toLocaleString()}</td>
                            <td className="px-6 py-4"><StatusBadge status={order.status || 'pending'} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── ORDERS ─── */}
              {activeTab === 'orders' && (
                <div className="space-y-6 max-w-6xl">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                    </div>
                    <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:ring-2 focus:ring-red-500">
                      <option value="all">All Status</option>
                      {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                              <p className="text-xs text-gray-500">{order.customer_email}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{order.products?.title || 'Fan Card'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{order.quantity}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.total_price?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <select value={order.status || 'pending'}
                                onChange={async (e) => {
                                  await supabase.from('bookings').update({ status: e.target.value }).eq('id', order.id);
                                  setBookings(prev => prev.map(b => b.id === order.id ? { ...b, status: e.target.value } : b));
                                }}
                                className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-red-500">
                                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => {
                                setShipmentForm(prev => ({ ...prev,
                                  order_id: order.id, recipient_name: order.customer_name,
                                  recipient_email: order.customer_email, recipient_phone: order.customer_phone || '',
                                  destination_address: order.address_line1 || '', destination_city: order.city || '',
                                  destination_postal_code: order.postal_code || '', destination_country: order.country || '',
                                }));
                                setShowShipmentModal(true);
                              }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100">
                                <Plus className="w-3.5 h-3.5" />Create Shipment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── SHIPMENTS ─── */}
              {activeTab === 'shipments' && (
                <div className="space-y-6 max-w-6xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">Shipments</h2>
                    <button onClick={() => setShowShipmentModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                      <Plus className="w-4 h-4" />New Shipment
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <Truck className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Shipment Management</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">Create shipments from orders or manually. Track packages and manage deliveries.</p>
                  </div>
                </div>
              )}

              {/* ─── USERS ─── */}
              {activeTab === 'users' && (
                <div className="space-y-6 max-w-6xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-900">User Management</h2>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="text" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-64 outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Last Sign In</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No users found.</p>
                          </td></tr>
                        ) : filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{user.id.slice(0, 8)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}</td>
                            <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.email_confirmed_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {user.email_confirmed_at ? 'Verified' : 'Pending'}
                            </span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── PRODUCTS ─── */}
              {activeTab === 'products' && (
                <div className="space-y-6 max-w-6xl">
                  <h2 className="text-xl font-black text-gray-900">Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">{product.player_name === 'Cristiano Ronaldo' ? '🇵🇹' : '🇦🇷'}</span>
                            <span className="text-xs font-bold text-gray-500">{product.player_name}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{product.title}</h3>
                          <p className="text-2xl font-black text-gray-900">${product.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mt-1">{product.available_slots} slots available</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── ANALYTICS ─── */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 max-w-6xl">
                  <h2 className="text-xl font-black text-gray-900">Analytics</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
                      { label: 'Orders', value: bookings.length, icon: Package, color: 'sky' },
                      { label: 'Users', value: users.length, icon: Users, color: 'violet' },
                      { label: 'Products', value: products.length, icon: Database, color: 'amber' },
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

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Order Status Breakdown</h3>
                      <div className="space-y-3">
                        {STATUS_OPTIONS.map(status => {
                          const count = bookings.filter(b => b.status === status.value).length;
                          const pct = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                          return (
                            <div key={status.value}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{status.label}</span>
                                <span className="font-bold text-gray-900">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full bg-${status.color}-500 rounded-full`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Top Products</h3>
                      <div className="space-y-3">
                        {products.map(product => {
                          const count = bookings.filter(b => b.product_id === product.id).length;
                          return (
                            <div key={product.id} className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: product.player_name === 'Cristiano Ronaldo' ? 'rgba(220,38,38,0.1)' : 'rgba(14,165,233,0.1)' }}>
                                {product.player_name === 'Cristiano Ronaldo' ? '🇵🇹' : '🇦🇷'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{product.title}</p>
                                <p className="text-xs text-gray-500">{count} orders</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">${product.price.toLocaleString()}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Shipment Modal */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">Create New Shipment</h2>
                <p className="text-sm text-gray-500">Enter shipment details</p>
              </div>
              <button onClick={() => setShowShipmentModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => { e.preventDefault(); setSavingShipment(true); await new Promise(r => setTimeout(r, 1000)); setSavingShipment(false); setShowShipmentModal(false); }}
              className="p-8 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />Recipient</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Name *</label>
                    <input type="text" value={shipmentForm.recipient_name} onChange={(e) => setShipmentForm(prev => ({ ...prev, recipient_name: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Email *</label>
                    <input type="email" value={shipmentForm.recipient_email} onChange={(e) => setShipmentForm(prev => ({ ...prev, recipient_email: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-gray-400" />Shipping</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Carrier *</label>
                    <select value={shipmentForm.carrier} onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm">
                      {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Tracking Number *</label>
                    <input type="text" value={shipmentForm.tracking_number} onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))} required placeholder="DHL123456789" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Method</label>
                    <select value={shipmentForm.shipping_method} onChange={(e) => setShipmentForm(prev => ({ ...prev, shipping_method: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm">
                      <option>Express</option><option>Standard</option><option>Economy</option><option>Priority</option>
                    </select></div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />Destination</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="block text-xs font-bold text-gray-600 mb-1.5">Street Address *</label>
                    <input type="text" value={shipmentForm.destination_address} onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_address: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">City *</label>
                    <input type="text" value={shipmentForm.destination_city} onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_city: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                  <div><label className="block text-xs font-bold text-gray-600 mb-1.5">Postal Code *</label>
                    <input type="text" value={shipmentForm.destination_postal_code} onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_postal_code: e.target.value }))} required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm" /></div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowShipmentModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={savingShipment} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                  {savingShipment ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</> : <><Send className="w-4 h-4" />Create Shipment</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border bg-${config.color}-50 text-${config.color}-700 border-${config.color}-200`}>
      {config.label}
    </span>
  );
}
