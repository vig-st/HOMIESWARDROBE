import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../utils/CartContext';
import { AuthContext } from '../utils/AuthContext';
import { ToastContext } from '../utils/ToastContext';
import { Button } from '../components/ui/Button';
import apiRequest, { getImageUrl } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;

export function Checkout() {
  const { items, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [storeSettings, setStoreSettings] = useState({ shippingFee: 50, freeShippingMinimum: 999, taxRate: 18 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/api/settings')
      .then((res) => {
        if (res.data) setStoreSettings(res.data);
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price - (item.discountPrice || item.discount || 0)) * item.quantity, 0);
  const shippingFee = subtotal >= storeSettings.freeShippingMinimum ? 0 : storeSettings.shippingFee;
  const tax = Number(((subtotal * storeSettings.taxRate) / 100).toFixed(2));
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-heading uppercase mb-4">Your Cart is Empty</h1>
        <p className="text-secondary mb-8">Add products to your cart before proceeding to checkout.</p>
        <Button asChild>
          <Link to="/shop">Return to Shop</Link>
        </Button>
      </div>
    );
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.zip) {
      setError('Please fill in all required shipping fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const orderPayload = {
        items: items.map((item) => ({
          product: item.id || item._id,
          name: item.name,
          price: item.price - (item.discountPrice || item.discount || 0),
          quantity: item.quantity,
          size: item.selectedSize || '',
          color: item.selectedColor || '',
          image: item.images?.[0] || '',
        })),
        shippingAddress,
        paymentMethod,
      };

      const response = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      if (response.success) {
        clearCart();
        showToast(paymentMethod === 'Cash on Delivery' ? 'COD order placed successfully!' : 'Demo order placed. No payment was collected; payment remains pending.', 'success');
        navigate('/account/orders');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-heading font-bold uppercase tracking-tight mb-10">Checkout</h1>

      {error && (
        <div className="mb-8 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-12">
        <div className="space-y-8">
          {/* Shipping Address */}
          <div className="rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-sm space-y-6">
            <h2 className="text-xl font-heading font-semibold uppercase">1. Shipping Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">Country *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-secondary mb-2">Street Address *</label>
              <input
                type="text"
                required
                placeholder="House number, street name, apartment"
                value={shippingAddress.address}
                onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">City *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">State *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary mb-2">PIN / Postal Code *</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-sm space-y-4">
            <h2 className="text-xl font-heading font-semibold uppercase mb-4">2. Payment Method</h2>

            <p className="text-sm text-secondary">Online payments are simulated for academic/demo purposes. No money is collected or verified; payment remains pending.</p>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border rounded-2xl cursor-pointer hover:border-black transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={paymentMethod === 'Cash on Delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-black"
                  />
                  <div>
                    <div className="font-semibold text-sm">Cash on Delivery (COD)</div>
                    <div className="text-xs text-secondary">Pay upon arrival of your package</div>
                  </div>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">Available</span>
              </label>

              <label className="flex items-center justify-between p-4 border rounded-2xl cursor-pointer hover:border-black transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit / Debit Card"
                    checked={paymentMethod === 'Credit / Debit Card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-black"
                  />
                  <div>
                    <div className="font-semibold text-sm">Credit / Debit Card</div>
                    <div className="text-xs text-secondary">Visa, Mastercard, RuPay</div>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">Demo / Simulation</span>
              </label>

              <label className="flex items-center justify-between p-4 border rounded-2xl cursor-pointer hover:border-black transition">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-black"
                  />
                  <div>
                    <div className="font-semibold text-sm">UPI Payment</div>
                    <div className="text-xs text-secondary">Google Pay, PhonePe, Paytm</div>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full">Demo / Simulation</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-sm space-y-6 sticky top-28">
            <h2 className="text-xl font-heading font-semibold uppercase">Order Summary</h2>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.itemId} className="pt-3 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(item.images?.[0])}
                      alt={item.name}
                      onError={(e) => {
                        if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                          e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                        }
                      }}
                      className="w-12 h-12 object-cover rounded-xl"
                    />
                    <div>
                      <div className="font-semibold text-primary">{item.name}</div>
                      <div className="text-xs text-secondary">Qty: {item.quantity} {item.selectedSize ? `· Size: ${item.selectedSize}` : ''}</div>
                    </div>
                  </div>
                  <div className="font-semibold shrink-0">₹{((item.price - (item.discountPrice || item.discount || 0)) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3 text-sm text-secondary uppercase tracking-wider">
              <div className="flex justify-between">Subtotal <span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between">Shipping <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`}</span></div>
              <div className="flex justify-between">Tax ({storeSettings.taxRate}%) <span>₹{tax.toFixed(2)}</span></div>
            </div>

            <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg font-bold uppercase tracking-wide">
              Total Payable <span>₹{total.toFixed(2)}</span>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-4 bg-black text-white hover:bg-gray-800">
              {loading ? 'Processing Order...' : 'Place Order Now'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
