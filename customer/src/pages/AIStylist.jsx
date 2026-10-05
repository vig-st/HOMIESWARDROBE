import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { CartContext } from '../utils/CartContext';
import { WishlistContext } from '../utils/WishlistContext';
import { ToastContext } from '../utils/ToastContext';
import apiRequest, { getImageUrl } from '../services/api';
import { Button } from '../components/ui/Button';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;
const STYLES = ['Streetwear', 'Minimal', 'Casual', 'Oversized', 'Formal', 'Smart Casual', 'Vintage', 'Sporty'];
const FITS = ['Oversized', 'Regular', 'Slim', 'Relaxed', 'Straight'];
const OCCASIONS = ['Casual', 'College', 'Office', 'Date', 'Party', 'Travel', 'Gym'];

export function AIStylist() {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist } = useContext(WishlistContext);
  const { showToast } = useContext(ToastContext);

  const [gender, setGender] = useState('men');
  const [occasion, setOccasion] = useState('College');
  const [style, setStyle] = useState('Streetwear');
  const [color, setColor] = useState('Black');
  const [budget, setBudget] = useState(5000);
  const [fit, setFit] = useState('Oversized');

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');

  const handleGenerateOutfit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setRecommendation(null);

      const response = await apiRequest('/api/stylist/recommend', {
        method: 'POST',
        body: JSON.stringify({ gender, occasion, style, color, budget: Number(budget), fit }),
      });

      if (response.success && response.data) {
        setRecommendation(response.data);
      } else {
        throw new Error(response.message || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations from backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompleteLook = () => {
    if (!recommendation?.outfit) return;
    recommendation.outfit.forEach((product) => {
      addToCart({
        ...product,
        quantity: 1,
        selectedSize: product.sizes?.[0] || 'M',
        selectedColor: product.colors?.[0] || 'Default',
      });
    });
    showToast('Added entire outfit look to your cart!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> AI Personal Stylist
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight">
          Curate Your Signature Look
        </h1>
        <p className="mt-3 text-sm text-secondary">
          Tell us what you're dressing for. Our AI Stylist recommends matching items within your budget straight from our real MongoDB catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-12 items-start">
        {/* Form Panel */}
        <form onSubmit={handleGenerateOutfit} className="rounded-3xl border border-gray-200 p-6 md:p-8 bg-white shadow-sm space-y-6">
          <h2 className="text-xl font-heading font-bold uppercase tracking-tight mb-4">Stylist Preferences</h2>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Gender Category</label>
            <div className="grid grid-cols-2 gap-3">
              {['men', 'women'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3 rounded-xl border text-sm font-semibold uppercase transition ${gender === g ? 'border-black bg-black text-white' : 'border-gray-200 text-primary hover:border-gray-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Occasion</label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary font-medium focus:border-black focus:outline-none"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Aesthetic / Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary font-medium focus:border-black focus:outline-none"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Fit */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Silhouettes / Fit</label>
            <select
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-primary font-medium focus:border-black focus:outline-none"
            >
              {FITS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Preferred Tone / Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. Black, Beige, Olive"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-black focus:outline-none"
            />
          </div>

          {/* Budget */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase text-secondary">Max Budget</label>
              <span className="text-sm font-bold text-primary">₹{budget}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full py-4 bg-black text-white hover:bg-gray-800">
            {loading ? 'Curating Outfit...' : 'Create My Look'}
          </Button>
        </form>

        {/* Outfit Recommendations Result */}
        <div>
          {loading && (
            <div className="rounded-3xl border border-dashed border-gray-300 p-6 md:p-20 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto" />
              <h2 className="text-xl font-heading uppercase font-semibold">Creating your personalized look...</h2>
              <p className="text-sm text-secondary">Analyzing catalog styles, scoring matches, and assembling outfit items.</p>
            </div>
          )}

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-600">
              {error}
            </div>
          )}

          {!loading && !recommendation && !error && (
            <div className="rounded-3xl border border-dashed border-gray-300 p-6 md:p-16 text-center space-y-4 bg-gray-50">
              <Sparkles className="w-10 h-10 text-gray-400 mx-auto" />
              <h2 className="text-2xl font-heading uppercase font-semibold">Your Outfit Canvas</h2>
              <p className="text-sm text-secondary max-w-md mx-auto">
                Select your style options on the left and click <strong>Create My Look</strong> to generate a custom-matched outfit.
              </p>
            </div>
          )}

          {!loading && recommendation && (
            <div className="space-y-8">
              <div className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-heading font-bold uppercase tracking-tight">Your Personalized Look</h2>
                    <p className="text-sm text-secondary mt-1">{recommendation.explanation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-secondary">Selected Budget: ₹{recommendation.preferences.budget}</div>
                    <div className="text-xs uppercase text-secondary tracking-widest font-semibold">Look Total</div>
                    <div className="text-2xl font-bold text-primary">₹{recommendation.totalCost}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAddCompleteLook} className="complete-look bg-black text-white hover:bg-gray-800 py-3 px-6 inline-flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Add Complete Look to Cart
                  </Button>
                </div>
              </div>

              {/* Recommended Items Grid */}
              <div className="stylist-products product-grid grid grid-cols-2 xl:grid-cols-3 gap-6">
                {recommendation.outfit.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between p-4">
                    <div>
                      <img
                        src={getImageUrl(item.images?.[0])}
                        alt={item.name}
                        onError={(e) => {
                          if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                            e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                          }
                        }}
                        className="w-full h-56 object-cover rounded-2xl mb-4"
                      />
                      <div className="text-xs text-secondary font-semibold uppercase tracking-wider">{item.category} · {item.style}</div>
                      <h3 className="font-semibold text-lg text-primary mt-1 line-clamp-1">{item.name}</h3>
                      <div className="text-sm font-bold text-primary mt-2">₹{(item.price - (item.discountPrice || 0)).toFixed(2)}</div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => {
                          addToCart({ ...item, quantity: 1, selectedSize: item.sizes?.[0] || 'M', selectedColor: item.colors?.[0] || 'Default' });
                          showToast('Added to cart', 'success');
                        }}
                        className="flex-1 text-xs py-2.5 bg-black text-white"
                      >
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          addToWishlist(item);
                          showToast('Added to wishlist', 'success');
                        }}
                        className="p-2.5"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" asChild className="p-2.5">
                        <Link to={`/product/${item.id}`}>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
