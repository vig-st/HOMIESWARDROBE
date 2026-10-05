import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../utils/CartContext';
import { WishlistContext } from '../utils/WishlistContext';
import { Button } from '../components/ui/Button';
import { getImageUrl } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;

export function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  const moveToCart = (item) => {
    addToCart({ ...item, selectedSize: item.selectedSize || item.sizes?.[0] || '', selectedColor: item.selectedColor || item.colors?.[0] || '', quantity: 1 });
    removeFromWishlist(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-4xl font-heading font-semibold uppercase mb-4">Your Wishlist is Empty</h1>
        <p className="text-secondary mb-8">Save items for later and build a curated collection of favorites.</p>
        <Button asChild>
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight">Wishlist</h1>
          <p className="mt-3 text-sm text-secondary">Your saved favorites are waiting. Add them to your cart or save for later.</p>
        </div>
        <Button variant="outline" onClick={clearWishlist}>Clear Wishlist</Button>
      </div>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-3xl border border-gray-200 p-6 shadow-sm">
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
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-sm text-secondary mt-2">{item.collection} · {item.category}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xl font-semibold">₹{(item.price - (item.discountPrice || 0)).toFixed(2)}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => moveToCart(item)}>Move to Cart</Button>
                    <Button variant="ghost" onClick={() => removeFromWishlist(item.id)}>Remove</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
