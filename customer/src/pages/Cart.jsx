import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../utils/CartContext';
import { Button } from '../components/ui/Button';
import apiRequest, { getImageUrl } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;

export function Cart() {
  const { items, removeFromCart, increaseQty, decreaseQty, clearCart } = useContext(CartContext);
  const [coupon, setCoupon] = useState('');
  const [storeSettings, setStoreSettings] = useState({ shippingFee: 50, freeShippingMinimum: 999, taxRate: 18 });

  useEffect(() => {
    apiRequest('/api/settings')
      .then((response) => { if (response.data) setStoreSettings(response.data); })
      .catch(() => {});
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.price - (item.discountPrice || item.discount || 0)) * item.quantity, 0),
    [items]
  );
  const shipping = items.length === 0 || subtotal >= storeSettings.freeShippingMinimum ? 0 : storeSettings.shippingFee;
  const tax = Number((subtotal * storeSettings.taxRate / 100).toFixed(2));
  const total = +(subtotal + shipping + tax).toFixed(2);

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-heading font-semibold uppercase mb-4">Your Cart is Empty</h1>
        <p className="text-secondary mb-8">Add premium pieces to your cart and return when you’re ready to check out.</p>
        <Button asChild>
          <Link to="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight">Shopping Cart</h1>
          <p className="mt-3 text-sm text-secondary">Review your selected items, update quantities, and proceed to checkout.</p>
        </div>
        <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.itemId} className="rounded-3xl border border-gray-200 p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                <img
                  src={getImageUrl(item.images?.[0])}
                  alt={item.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }
                  }}
                  className="h-44 w-full max-w-[160px] rounded-3xl object-cover"
                />
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{item.name}</h2>
                      <p className="text-sm text-secondary">{item.selectedSize} · {item.selectedColor}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.itemId)} className="text-sm uppercase tracking-[0.28em] text-secondary hover:text-primary">Remove</button>
                  </div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => decreaseQty(item.itemId)} className="rounded-full border border-gray-300 px-3 py-2">-</button>
                      <span className="min-w-[30px] text-center font-medium">{item.quantity}</span>
                      <button onClick={() => increaseQty(item.itemId)} className="rounded-full border border-gray-300 px-3 py-2">+</button>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-secondary line-through">₹{item.price.toFixed(2)}</div>
                      <div className="text-xl font-semibold">₹{((item.price - (item.discountPrice || item.discount || 0)) * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-secondary uppercase tracking-[0.3em]">Subtotal <span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-sm text-secondary uppercase tracking-[0.3em]">Shipping <span>₹{shipping.toFixed(2)}</span></div>
            <div className="flex items-center justify-between text-sm text-secondary uppercase tracking-[0.3em]">Tax ({storeSettings.taxRate}%) <span>₹{tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between text-lg font-semibold uppercase tracking-[0.3em]">Total <span>₹{total.toFixed(2)}</span></div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm uppercase tracking-[0.28em] text-secondary">Coupon</label>
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Enter code"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary"
            />
          </div>
          <Button asChild className="w-full py-4 bg-black text-white">
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
          <Button variant="outline" asChild className="w-full py-4">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
