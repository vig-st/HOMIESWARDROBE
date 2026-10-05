import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { CartContext } from '../utils/CartContext';
import { WishlistContext } from '../utils/WishlistContext';
import { ToastContext } from '../utils/ToastContext';
import { AuthContext } from '../utils/AuthContext';
import { Button } from '../components/ui/Button';
import apiRequest, { getImageUrl } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;

export function Product() {
  const { id } = useParams();
  return <ProductDetails key={id} id={id} />;
}

function ProductDetails({ id }) {
  const [refresh, setRefresh] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const { addToCart } = useContext(CartContext);
  const { addToWishlist, items: wishlistItems, removeFromWishlist } = useContext(WishlistContext);
  const { showToast } = useContext(ToastContext);
  const { isAuthenticated } = useContext(AuthContext);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [failedImageIndices, setFailedImageIndices] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchProductAndReviews = async () => {
      try {
        const response = await apiRequest(`/api/products/${id}`);
        if (cancelled) return;
        const p = response.data;
        const normalized = {
          ...p,
          id: p._id || p.id,
          images: (p.images && p.images.length > 0)
            ? p.images.slice(0, 6).map(img => getImageUrl(img))
            : [DEFAULT_FALLBACK_IMAGE],
        };
        setProduct(normalized);
        setSelectedImageIndex(0);
        setFailedImageIndices(new Set());
        setSelectedSize(normalized.sizes?.[0] || '');
        setSelectedColor(normalized.colors?.[0] || '');

        // Fetch reviews
        try {
          const revRes = await apiRequest(`/api/products/${id}/reviews`);
          if (!cancelled && revRes.success) {
            setReviews(revRes.data || []);
          }
        } catch (err) {
          console.error('Failed to load reviews:', err.message);
        }

        // Fetch related products
        const allRes = await apiRequest('/api/products');
        const related = (allRes.data || [])
          .filter(rp => rp.category === p.category && (rp._id || rp.id) !== id)
          .slice(0, 4)
          .map(rp => ({
            ...rp,
            id: rp._id || rp.id,
            images: (rp.images || []).map(img => getImageUrl(img)),
          }));
        if (!cancelled) setRelatedProducts(related);
      } catch (err) {
        console.error('Failed to load product:', err.message);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProductAndReviews();
    return () => { cancelled = true; };
  }, [id, refresh]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Please enter a review comment');
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError('');
      const res = await apiRequest(`/api/products/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      if (res.success) {
        showToast('Review submitted successfully!', 'success');
        setNewComment('');
        setNewRating(5);
        setLoading(true);
        setRefresh((value) => value + 1);
      }
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-28 text-center">
        <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
        <Link to="/shop" className="text-black font-semibold underline">Back to shop</Link>
      </div>
    );
  }

  const finalPrice = (product.price - (product.discountPrice || 0)).toFixed(2);
  const rawGallery = product.images || [DEFAULT_FALLBACK_IMAGE];

  // Filter out any images that failed to load (404)
  const validGallery = rawGallery.filter((_, idx) => !failedImageIndices.has(idx));
  
  // If all local images failed to load, use the local neutral placeholder
  const displayGallery = validGallery.length > 0 ? validGallery : [DEFAULT_FALLBACK_IMAGE];
  const activeImageIndex = Math.min(selectedImageIndex, displayGallery.length - 1);
  const selectedImageSrc = displayGallery[activeImageIndex] || DEFAULT_FALLBACK_IMAGE;

  const handleThumbnailError = (originalIndex) => {
    setFailedImageIndices(prev => {
      const next = new Set(prev);
      next.add(originalIndex);
      return next;
    });
  };

  const handleMainImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
      event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* 3-Column Layout on Desktop: LEFT: thumbnails | CENTER: large image | RIGHT: product details */}
      <div className="grid grid-cols-1 lg:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
        
        {/* LEFT: Thumbnail Gallery (Desktop: vertical sidebar / Mobile: horizontal scroll underneath main image) */}
        {validGallery.length > 1 && (
          <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto max-w-full lg:max-h-[560px] scrollbar-thin pb-2 lg:pb-0 pr-0 lg:pr-2 shrink-0">
            {rawGallery.map((src, idx) => {
              if (failedImageIndices.has(idx)) return null;
              const validIdx = validGallery.indexOf(src);
              const isSelected = activeImageIndex === validIdx;
              return (
                <button
                  key={`${product.id}-thumb-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(validIdx)}
                  className={`flex-shrink-0 overflow-hidden rounded-2xl border-2 transition focus:outline-none focus:ring-2 focus:ring-black ${
                    isSelected ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`View ${product.name} detail image ${validIdx + 1}`}
                  aria-pressed={isSelected}
                >
                  <img
                    src={src}
                    alt={`${product.name} detail ${validIdx + 1}`}
                    onError={() => handleThumbnailError(idx)}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 object-cover"
                  />
                </button>
              );
            })}
          </div>
        )}

        {/* CENTER: Main Product Image Display */}
        <div className={`order-1 lg:order-2 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 ${validGallery.length <= 1 ? 'lg:col-span-2' : ''}`}>
          <img
            src={selectedImageSrc}
            alt={product.name}
            onError={handleMainImageError}
            className="product-gallery-image w-full h-[400px] sm:h-[500px] lg:h-[560px] object-cover"
          />
        </div>

        {/* RIGHT: Product Information & Controls */}
        <div className="order-3">
          <h1 className="text-3xl font-heading font-bold mb-2 uppercase">{product.name}</h1>
          <p className="text-secondary mb-4">
            {product.category} {product.collection ? `· ${product.collection}` : ''} · <span className="uppercase">{product.gender || 'unisex'}</span>
          </p>

          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-4 h-4 ${star <= Math.round(product.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm font-bold">{product.rating || '0.0'}</span>
            <span className="text-xs text-secondary">({reviews.length || product.numReviews || 0} reviews)</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-4 mb-6">
            <span className="text-3xl font-bold text-primary">₹{finalPrice}</span>
            {(product.discountPrice || 0) > 0 && <span className="text-base text-secondary line-through">₹{product.price.toFixed(2)}</span>}
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Size</label>
            <div className="flex gap-2 flex-wrap">
              {(product.sizes || []).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 border rounded-xl font-medium text-sm transition ${selectedSize === s ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase text-secondary mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {(product.colors || []).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 border rounded-xl font-medium text-sm transition ${selectedColor === c ? 'border-black bg-black text-white' : 'border-gray-300 hover:border-black'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-4">
            <label className="text-xs font-semibold uppercase text-secondary">Quantity</label>
            <div className="flex items-center gap-3 border rounded-xl p-1">
              <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg font-bold">-</button>
              <span className="px-2 font-medium">{quantity}</span>
              <button type="button" onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 text-lg font-bold">+</button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => {
                addToCart({ ...product, selectedSize, selectedColor, quantity });
                showToast('Added to cart', 'success');
              }}
              className="bg-black text-white py-4 px-8"
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const isSaved = wishlistItems.some((item) => item.id === product.id);
                if (isSaved) {
                  removeFromWishlist(product.id);
                  showToast('Removed from wishlist', 'success');
                } else {
                  addToWishlist({ ...product, selectedSize, selectedColor });
                  showToast('Added to wishlist', 'success');
                }
              }}
              className="py-4 px-8"
            >
              {wishlistItems.some((item) => item.id === product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold uppercase mb-2">Description</h3>
            <p className="text-secondary text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-20 border-t border-gray-200 pt-12">
        <h2 className="text-2xl font-heading font-bold uppercase tracking-tight mb-8">Customer Reviews & Ratings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12">
          {/* Write a Review */}
          <div className="rounded-3xl border border-gray-200 p-6 bg-white shadow-sm space-y-4">
            <h3 className="text-lg font-bold uppercase">Write a Review</h3>
            {!isAuthenticated ? (
              <p className="text-sm text-secondary">
                Please <Link to="/login" className="text-black font-semibold underline">log in</Link> to post a customer review.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl">{reviewError}</div>}
                <div>
                  <label className="block text-xs font-semibold uppercase text-secondary mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-secondary mb-2">Your Comment</label>
                  <textarea
                    rows={4}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on fit, fabric quality, and comfort..."
                    className="w-full rounded-2xl border border-gray-200 p-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>
                <Button type="submit" disabled={reviewSubmitting} className="w-full bg-black text-white py-3">
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </form>
            )}
          </div>

          {/* Existing Reviews List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold uppercase">Recent Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-secondary italic">No reviews yet for this product. Be the first to leave one!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="rounded-3xl border border-gray-100 bg-gray-50 p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                        {rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'}
                      </div>
                      <span className="font-semibold text-sm">{rev.user?.name || 'Customer'}</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-primary leading-relaxed">{rev.comment}</p>
                  <div className="text-[10px] text-secondary">{new Date(rev.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20">
          <h3 className="text-xl font-bold uppercase mb-6">You Might Also Like</h3>
          <div className="product-grid related-products grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="group block rounded-2xl border p-3 hover:shadow-md transition">
                <img
                  src={p.images?.[0] || DEFAULT_FALLBACK_IMAGE}
                  alt={p.name}
                  onError={(e) => {
                    if (e.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }
                  }}
                  className="w-full h-44 object-cover rounded-xl mb-3"
                />
                <div className="text-sm font-semibold group-hover:text-brand transition">{p.name}</div>
                <div className="text-xs text-secondary mt-1">₹{(p.price - (p.discountPrice || 0)).toFixed(2)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
