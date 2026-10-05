import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CartContext } from '../utils/CartContext';
import { ToastContext } from '../utils/ToastContext';
import { getImageUrl } from '../services/api';

const DEFAULT_FALLBACK_IMAGE = new URL('/placeholder.svg', window.location.origin).href;

export function ProductCard({ product, index }) {
  const { addToCart } = useContext(CartContext);
  const { showToast } = useContext(ToastContext);

  const productId = product.id || product._id;
  const rawImage = product.images?.[0] || product.image;
  const initialSrc = getImageUrl(rawImage);
  const discount = product.discountPrice || product.discount || 0;

  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_FALLBACK_IMAGE) {
      event.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col gap-4"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-section">
        <Link to={`/product/${productId}`} className="block w-full h-full">
          <img
            src={initialSrc}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        {/* Quick Add overlay */}
        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={(event) => {
              event.preventDefault();
              addToCart({ ...product, selectedSize: product.sizes?.[0] || '', selectedColor: product.colors?.[0] || '', quantity: 1 });
              showToast('Added to cart', 'success');
            }}
            className="w-full bg-white/90 backdrop-blur-sm text-primary py-3 text-sm font-semibold uppercase tracking-wider hover:bg-white transition-colors shadow-sm"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col gap-1">
        <Link to={`/product/${productId}`} className="hover:underline underline-offset-4">
          <h3 className="text-sm font-medium text-primary uppercase tracking-wide truncate">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          {discount > 0 ? (
            <>
              <span className="text-brand font-medium">₹{(product.price - discount).toFixed(2)}</span>
              <span className="text-secondary text-sm line-through">₹{product.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-primary font-medium">₹{product.price.toFixed(2)}</span>
          )}
        </div>
        <p className="text-secondary text-xs">{product.colors.length} Color{product.colors.length > 1 ? 's' : ''}</p>
      </div>
    </motion.div>
  );
}
