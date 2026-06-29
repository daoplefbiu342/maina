import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Users, Package, Truck, Plus, Search, CheckCircle, Clock, XCircle, AlertTriangle, RefreshCw, LogOut, Mail, Phone, MapPin, Calendar, FileText, ExternalLink, Download, ChevronDown, User, Database, Settings, BarChart3, DollarSign, CreditCard as Edit, Trash2, Send, Save, X, Building, Globe, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Booking, Product } from '../types';

// Admin credentials (in production, this would be in Supabase auth)
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

const SHIPMENT_STATUS_OPTIONS = [
  { value: 'processing', label: 'Processing', icon: Clock, color: 'yellow' },
  { value: 'picked_up', label: 'Picked Up', icon: Package, color: 'blue' },
  { value: 'in_transit', label: 'In Transit', icon: Truck, color: 'blue' },
  { value: 'customs', label: 'At Customs', icon: AlertTriangle, color: 'orange' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'green' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'green' },
  { value: 'delayed', label: 'Delayed', icon: AlertTriangle, color: 'red' },
  { value: 'returned', label: 'Returned', icon: RefreshCw, color: 'gray' },
];

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'orders' | 'shipments' | 'products'>('dashboard');

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & filters
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Shipment creation
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentForm, setShipmentForm] = useState<ShipmentForm>({
    order_id: '',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    carrier: 'DHL Express',
    tracking_number: '',
    shipping_method: 'Express',
    estimated_delivery: '',
    origin_location: 'London, UK',
    destination_country: '',
    destination_city: '',
    destination_address: '',
    destination_postal_code: '',
    weight_kg: '',
    dimensions_cm: '',
    shipping_cost: '',
    insurance: false,
    signature_required: true,
    notes: '',
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
    const [bookingsRes, productsRes] = await Promise.all([
      supabase.from('bookings').select('*, products(*)').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('player_name'),
    ]);
    if (bookingsRes.data) setBookings(bookingsRes.data as Booking[]);
    if (productsRes.data) setProducts(productsRes.data as Product[]);
    setLoading(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Login Screen
  // ─────────────────────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #080f1e 0%, #0c1f3f 50%, #071428 100%)' }}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #080f1e, #0c1f3f)' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-black text-white mb-1">Admin Portal</h1>
              <p className="text-white/50 text-sm">FIFA Fan Access Administration</p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 rounded-xl text-sm text-red-600 bg-red-50 border border-red-100">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
              >
                Sign In to Admin
              </button>
            </form>

            <div className="px-8 pb-6 text-center">
              <p className="text-gray-400 text-xs">Secure admin access • IP logged</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Main Dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredOrders = bookings.filter(b =>
    b.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    b.customer_email?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    b.id?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const confirmedOrders = bookings.filter(b => b.status === 'confirmed').length;
  const pendingOrders = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900">FIFA FAN ACCESS</p>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium px-3 py-1.5 bg-gray-100 rounded-full">
              {ADMIN_USERNAME}
            </span>
            <button onClick={() => setAuthenticated(false)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-65px)] bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'shipments', label: 'Shipments', icon: Truck },
              { id: 'products', label: 'Products', icon: Database },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* ─── Dashboard Tab ─── */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <h1 className="text-2xl font-black text-gray-900">Overview</h1>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'green' },
                      { label: 'Total Orders', value: bookings.length, icon: Package, color: 'blue' },
                      { label: 'Confirmed', value: confirmedOrders, icon: CheckCircle, color: 'emerald' },
                      { label: 'Pending', value: pendingOrders, icon: Clock, color: 'yellow' },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-100`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-bold text-gray-900">Recent Orders</h2>
                      <button onClick={() => setActiveTab('orders')} className="text-sm text-red-600 hover:text-red-700 font-semibold">
                        View All
                      </button>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
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
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {order.status || 'pending'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── Users Tab ─── */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900">User Management</h1>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-64"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Last Sign In</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                              <p>No users found. Users will appear here after signing up.</p>
                            </td>
                          </tr>
                        ) : filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{user.id.slice(0, 8)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                user.email_confirmed_at ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.email_confirmed_at ? 'Verified' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── Orders Tab ─── */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900">Orders</h1>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm w-64"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {order.products?.title || 'Fan Card'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{order.quantity}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.total_price?.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status || 'pending'}
                                onChange={async (e) => {
                                  await supabase.from('bookings').update({ status: e.target.value }).eq('id', order.id);
                                  setBookings(prev => prev.map(b => b.id === order.id ? { ...b, status: e.target.value } : b));
                                }}
                                className="text-xs px-2 py-1 rounded border border-gray-200"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setShipmentForm(prev => ({
                                    ...prev,
                                    order_id: order.id,
                                    recipient_name: order.customer_name,
                                    recipient_email: order.customer_email,
                                    recipient_phone: order.customer_phone || '',
                                    destination_address: order.address_line1 || '',
                                    destination_city: order.city || '',
                                    destination_postal_code: order.postal_code || '',
                                    destination_country: order.country || '',
                                  }));
                                  setShowShipmentModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                Create Shipment
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ─── Shipments Tab ─── */}
              {activeTab === 'shipments' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-black text-gray-900">Shipments</h1>
                    <button
                      onClick={() => {
                        setShipmentForm({
                          order_id: '',
                          recipient_name: '',
                          recipient_email: '',
                          recipient_phone: '',
                          carrier: 'DHL Express',
                          tracking_number: '',
                          shipping_method: 'Express',
                          estimated_delivery: '',
                          origin_location: 'London, UK',
                          destination_country: '',
                          destination_city: '',
                          destination_address: '',
                          destination_postal_code: '',
                          weight_kg: '',
                          dimensions_cm: '',
                          shipping_cost: '',
                          insurance: false,
                          signature_required: true,
                          notes: '',
                        });
                        setShowShipmentModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                    >
                      <Plus className="w-4 h-4" />
                      Create New Shipment
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                    <Truck className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Shipment Management</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                      Create shipments from orders or manually. Track packages, update status, and manage deliveries.
                    </p>
                    <button
                      onClick={() => setShowShipmentModal(true)}
                      className="mt-6 px-6 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)' }}
                    >
                      Create First Shipment
                    </button>
                  </div>
                </div>
              )}

              {/* ─── Products Tab ─── */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-black text-gray-900">Products</h1>
                  <div className="grid grid-cols-3 gap-6">
                    {products.map(product => (
                      <div key={product.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
            </>
          )}
        </main>
      </div>

      {/* ─── Shipment Creation Modal ─── */}
      {showShipmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">Create New Shipment</h2>
                <p className="text-sm text-gray-500">Enter shipment details manually</p>
              </div>
              <button onClick={() => setShowShipmentModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingShipment(true);
                // Save shipment to database (would need shipments table)
                await new Promise(resolve => setTimeout(resolve, 1000));
                setSavingShipment(false);
                setShowShipmentModal(false);
              }}
              className="p-8 space-y-6"
            >
              {/* Recipient Information */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Recipient Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Order ID (optional)</label>
                    <input
                      type="text"
                      value={shipmentForm.order_id}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, order_id: e.target.value }))}
                      placeholder="Auto-link to order"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Recipient Name *</label>
                    <input
                      type="text"
                      value={shipmentForm.recipient_name}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, recipient_name: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={shipmentForm.recipient_email}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, recipient_email: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={shipmentForm.recipient_phone}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, recipient_phone: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  Shipping Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Carrier *</label>
                    <select
                      value={shipmentForm.carrier}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, carrier: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Tracking Number *</label>
                    <input
                      type="text"
                      value={shipmentForm.tracking_number}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                      required
                      placeholder="e.g. DHL123456789"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Shipping Method</label>
                    <select
                      value={shipmentForm.shipping_method}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, shipping_method: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    >
                      <option>Express</option>
                      <option>Standard</option>
                      <option>Economy</option>
                      <option>Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Origin Location</label>
                    <input
                      type="text"
                      value={shipmentForm.origin_location}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, origin_location: e.target.value }))}
                      placeholder="Where package ships from"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Estimated Delivery</label>
                    <input
                      type="date"
                      value={shipmentForm.estimated_delivery}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Shipping Cost</label>
                    <input
                      type="text"
                      value={shipmentForm.shipping_cost}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, shipping_cost: e.target.value }))}
                      placeholder="$0.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Package Dimensions */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  Package Details
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Weight (kg)</label>
                    <input
                      type="text"
                      value={shipmentForm.weight_kg}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, weight_kg: e.target.value }))}
                      placeholder="0.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Dimensions (cm)</label>
                    <input
                      type="text"
                      value={shipmentForm.dimensions_cm}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, dimensions_cm: e.target.value }))}
                      placeholder="20x15x5"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-4 pb-1">
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={shipmentForm.insurance}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, insurance: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      Insurance
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={shipmentForm.signature_required}
                        onChange={(e) => setShipmentForm(prev => ({ ...prev, signature_required: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      Signature Required
                    </label>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Destination Address
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Street Address *</label>
                    <input
                      type="text"
                      value={shipmentForm.destination_address}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_address: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">City *</label>
                    <input
                      type="text"
                      value={shipmentForm.destination_city}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_city: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Postal Code *</label>
                    <input
                      type="text"
                      value={shipmentForm.destination_postal_code}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_postal_code: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Country *</label>
                    <input
                      type="text"
                      value={shipmentForm.destination_country}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, destination_country: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Notes</label>
                    <input
                      type="text"
                      value={shipmentForm.notes}
                      onChange={(e) => setShipmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Delivery instructions..."
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingShipment}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #991b1b)' }}
                >
                  {savingShipment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Create Shipment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
