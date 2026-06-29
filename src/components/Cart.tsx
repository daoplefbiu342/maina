import { X, Plus, Minus, ShoppingCart, ChevronRight, Trash2 } from 'lucide-react';
import type { CartItem } from '../types';

interface CartProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ cart, onClose, onUpdateQty, onRemove, onCheckout }: CartProps) {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Your Basket</h2>
            {count > 0 && <p className="text-sm text-gray-500">{count} item{count > 1 ? 's' : ''}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto p-5">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-200 mb-4" />
              <p className="font-bold text-gray-400">Your basket is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add experiences to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const isRonaldo = item.player_name.includes('Ronaldo');
                return (
                  <div key={item.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Item header */}
                    <div className="flex items-center gap-3 p-4"
                      style={{ background: isRonaldo ? 'linear-gradient(135deg,rgba(220,38,38,0.04),rgba(220,38,38,0.02))' : 'linear-gradient(135deg,rgba(14,165,233,0.04),rgba(14,165,233,0.02))' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                        style={{ background: isRonaldo ? 'rgba(220,38,38,0.08)' : 'rgba(14,165,233,0.08)' }}>
                        {isRonaldo ? '🇵🇹' : '🇦🇷'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm leading-tight">{item.player_name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.slot_type} — {item.title}</p>
                        <p className={`text-xs font-bold mt-0.5 ${isRonaldo ? 'text-red-600' : 'text-sky-600'}`}>
                          ${item.price.toLocaleString()} / person
                        </p>
                      </div>
                      <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Qty + subtotal */}
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <button onClick={() => onUpdateQty(item.id, -1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
                          <Minus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                        <span className="font-black text-gray-900 w-6 text-center">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.id, 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
                          <Plus className="w-3.5 h-3.5 text-gray-600" />
                        </button>
                      </div>
                      <p className="font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-100 space-y-4">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full py-4 rounded-xl text-white font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 hover:shadow-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#1d4ed8)' }}
            >
              Proceed to Checkout
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-center text-xs text-gray-400">Secure checkout · Free worldwide shipping</p>
          </div>
        )}
      </div>
    </div>
  );
}
