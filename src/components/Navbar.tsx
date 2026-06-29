import { useState } from 'react';
import { Trophy, ShoppingCart, Menu, X, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface NavbarProps {
  cartCount: number;
  onCartOpen: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'Experiences', id: 'experiences' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

export default function Navbar({ cartCount, onCartOpen, onNavigate, currentPage }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNav = (id: string) => {
    if (id === 'experiences' || id === 'about' || id === 'contact') {
      onNavigate('home');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate(id);
    }
    setMobileOpen(false);
    setShowUserMenu(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleNav('home')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="font-black text-gray-900 text-base leading-tight tracking-tight">FIFA FAN ACCESS</p>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest leading-tight">WORLD CUP 2026</p>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentPage === id
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => handleNav('admin')}
            className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* User menu or login button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}>
                  {user.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || user.email?.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-gray-600">{user.user_metadata?.full_name?.split(' ')[0] || 'Account'}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <button
                    onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Dashboard
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          <button
            onClick={onCartOpen}
            className="relative p-2.5 rounded-xl text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
          {user ? (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                My Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-sky-600 hover:bg-sky-50 flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4" />
              Login / Sign Up
            </button>
          )}
          <button
            onClick={() => handleNav('admin')}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </div>
      )}
    </header>
  );
}
