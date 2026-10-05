import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionHeading } from '../components/ui/SectionHeading';
import { ProductCard } from '../components/ProductCard';
import apiRequest, { getImageUrl } from '../services/api';

export function Home() {
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiRequest('/api/products');
        const products = (response.data || []).map(p => ({
          ...p,
          id: p._id || p.id,
          images: p.images?.length ? p.images.map(img => getImageUrl(img)) : [getImageUrl('')],
        }));
        setAllProducts(products);
      } catch (err) {
        console.error('Failed to load products:', err.message);
      }
    };
    fetchProducts();
  }, []);

  const newArrivals = allProducts.slice(0, 4);
  const markedBestSellers = allProducts.filter(p => p.bestSeller || p.best_seller);
  const bestSellers = markedBestSellers.length >= 4
    ? markedBestSellers.slice(0, 4)
    : allProducts.filter(p => p.stock >= 15).slice(0, 4);

  const categories = [
    {
      id: 'men',
      name: 'Menswear',
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800',
      link: '/men'
    },
    {
      id: 'women',
      name: 'Womenswear',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      link: '/women'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
      link: '/shop?category=Accessories'
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-section">
        <motion.img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=2000"
          alt="Hero Fashion"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-90"
          animate={{ scale: [1, 1.05, 1], x: [0, 8, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/20" />
        <motion.div
          className="hero-orb hero-orb-one absolute left-[-8%] top-[10%] h-48 w-48 rounded-full bg-brand/30 blur-3xl"
          animate={{ y: [0, 24, 0], x: [0, 18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-orb hero-orb-two absolute bottom-[-8%] right-[-5%] h-64 w-64 rounded-full bg-white/20 blur-3xl"
          animate={{ y: [0, -24, 0], x: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          className="hero-card absolute left-6 top-8 hidden rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white backdrop-blur md:flex"
          animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          New season · 2026 edit
        </motion.div>

        <motion.div
          className="hero-card absolute bottom-12 right-6 hidden max-w-xs rounded-2xl border border-white/20 bg-black/20 p-4 text-left text-white shadow-2xl backdrop-blur md:block"
          animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Curated drop</p>
          <p className="mt-2 text-lg font-semibold">Modern silhouettes with elevated texture.</p>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="px-4 max-w-4xl"
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-gray-100 backdrop-blur"
            >
              Elevated essentials for every moment
            </motion.span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-white tracking-tighter uppercase mb-6 drop-shadow-lg">
              Redefine <br /> <span className="text-brand">Your</span> Style
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-xl mx-auto font-medium drop-shadow-md">
              Discover the latest elevated essentials for the modern wardrobe.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link to="/shop">Shop Collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10 hover:text-white">
                <Link to="/about">Our Story</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <SectionHeading title="Shop by Category" subtitle="Curated selections" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={cat.link} className="group relative block aspect-[4/5] overflow-hidden bg-section">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <h3 className="text-2xl font-semibold text-white uppercase tracking-wider mb-2 drop-shadow-md">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center text-white text-sm font-medium uppercase tracking-widest group-hover:text-brand transition-colors">
                    Explore <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 bg-section w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <SectionHeading title="New Arrivals" subtitle="Fresh additions to your rotation" className="mb-0 text-left" />
            <Link to="/shop?sort=newest" className="hidden md:inline-flex items-center text-sm font-semibold uppercase tracking-widest text-primary hover:text-brand transition-colors border-b border-primary hover:border-brand pb-1">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
          <div className="mt-12 text-center md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link to="/shop?sort=newest">View All New Arrivals</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-primary text-white flex items-center">
          <img
            src="/images/editorial.jpg"
            alt="A curated rail of neutral wardrobe essentials"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="relative z-10 p-8 md:p-16 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-heading uppercase tracking-tighter mb-6">
              The Minimalist Approach
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Explore our core collection designed for longevity. Pieces that transcend seasons and trends.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
              <Link to="/shop">Shop Essentials</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <SectionHeading title="Best Sellers" subtitle="Most loved by our community" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {bestSellers.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

    </div>
  );
}
