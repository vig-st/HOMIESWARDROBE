import { useMemo, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ShopFilters } from '../components/ShopFilters';
import { ShopSortBar } from '../components/ShopSortBar';
import { ShopBreadcrumb } from '../components/ShopBreadcrumb';
import { Button } from '../components/ui/Button';
import apiRequest, { getImageUrl } from '../services/api';

const PAGE_SIZE = 12;

const sortFunctions = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  best: (a, b) => (b.rating || 0) - (a.rating || 0),
  low: (a, b) => (a.price - (a.discountPrice || 0)) - (b.price - (b.discountPrice || 0)),
  high: (a, b) => (b.price - (b.discountPrice || 0)) - (a.price - (a.discountPrice || 0)),
};

export function Shop({ initialGender = '' }) {
  const filterDialog = useRef(null);
  const [searchParams] = useSearchParams();
  const selectedGender = initialGender || searchParams.get('gender') || '';
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('newest');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: selectedGender,
    minPrice: 0,
    maxPrice: 99999,
    size: '',
    color: '',
    availability: false,
  });
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  useEffect(() => {
    const dialog = filterDialog.current;
    if (!mobileFiltersOpen) {
      dialog?.close();
      return;
    }
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileFiltersOpen]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryParam = searchParams.get('category') || '';
  const [previousRoute, setPreviousRoute] = useState({ category: categoryParam, gender: selectedGender });
  // Adjust only URL-driven filters when navigation changes; preserve other selections.
  if (previousRoute.category !== categoryParam || previousRoute.gender !== selectedGender) {
    setPreviousRoute({ category: categoryParam, gender: selectedGender });
    setFilters({ ...filters, category: categoryParam, gender: selectedGender });
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = selectedGender ? `?gender=${encodeURIComponent(selectedGender)}` : '';
        const response = await apiRequest(`/api/products${query}`);
        const products = (response.data || []).map(p => ({
          ...p,
          id: p._id || p.id,
          images: p.images?.length ? p.images.map(img => getImageUrl(img)) : [getImageUrl('')],
        }));
        setAllProducts(products);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedGender]);

  const categories = useMemo(() => [...new Set(allProducts.map(p => p.category).filter(Boolean))], [allProducts]);
  const sizes = useMemo(() => [...new Set(allProducts.flatMap(p => p.sizes || []))], [allProducts]);
  const colors = useMemo(() => [...new Set(allProducts.flatMap(p => p.colors || []))], [allProducts]);

  const minPrice = useMemo(() => allProducts.length ? Math.min(...allProducts.map(p => p.price - (p.discountPrice || 0))) : 0, [allProducts]);
  const maxPrice = useMemo(() => allProducts.length ? Math.max(...allProducts.map(p => p.price - (p.discountPrice || 0))) : 99999, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product) => {
        const price = product.price - (product.discountPrice || 0);
        const termMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = filters.category ? product.category.toLowerCase() === filters.category.toLowerCase() : true;
        const genderMatch = filters.gender
          ? (product.gender || 'unisex').toLowerCase() === 'unisex' || (product.gender || '').toLowerCase() === filters.gender.toLowerCase()
          : true;
        const sizeMatch = filters.size ? (product.sizes || []).includes(filters.size) : true;
        const colorMatch = filters.color ? (product.colors || []).includes(filters.color) : true;
        const priceMatch = price >= (filters.minPrice || 0) && price <= (filters.maxPrice || 99999);
        const availabilityMatch = filters.availability ? (product.stock || 0) > 0 : true;
        return termMatch && categoryMatch && genderMatch && sizeMatch && colorMatch && priceMatch && availabilityMatch;
      })
      .sort(sortFunctions[sort]);
  }, [searchTerm, filters, sort, allProducts]);

  const displayedProducts = filteredProducts.slice(0, page * PAGE_SIZE);
  const canLoadMore = displayedProducts.length < filteredProducts.length;

  const resetFilters = () => {
    setFilters({ category: '', gender: '', minPrice, maxPrice, size: '', color: '', availability: false });
    setSearchTerm('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <ShopBreadcrumb />
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight">
            {filters.gender ? `${filters.gender}'s` : 'Shop'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-secondary">
            Explore premium basics, elevated essentials, and seasonless silhouettes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shrink-0 lg:hidden" aria-haspopup="dialog" onClick={() => setMobileFiltersOpen(true)}>
            <Filter className="mr-2 w-4 h-4" /> Filters
          </Button>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-primary shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600 mb-8">
          {error} — Please try again shortly.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <ShopFilters
            categories={categories}
            sizes={sizes}
            colors={colors}
            filters={filters}
            setFilters={setFilters}
            minPrice={minPrice}
            maxPrice={maxPrice}
            resetFilters={resetFilters}
          />
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ShopSortBar sort={sort} onSortChange={(value) => { setSort(value); setPage(1); }} productCount={filteredProducts.length} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
              <h2 className="text-2xl font-semibold mb-2">No products match your search</h2>
              <p className="text-sm text-secondary mb-6">Try adjusting your filters or search criteria.</p>
              <Button variant="outline" onClick={resetFilters}>Reset filters</Button>
            </div>
          ) : (
            <motion.div layout className="product-grid grid grid-cols-2 gap-6 xl:grid-cols-3">
              {displayedProducts.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {canLoadMore && (
            <div className="mt-10 flex justify-center">
              <Button onClick={() => setPage(prev => prev + 1)} className="px-10 py-4">Load More</Button>
            </div>
          )}
        </section>
      </div>

      <dialog
        ref={filterDialog}
        aria-label="Product filters"
        onCancel={() => setMobileFiltersOpen(false)}
        className="m-auto h-[calc(100dvh-2rem)] max-h-none w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl backdrop:bg-black/40"
      >
            <ShopFilters
              categories={categories}
              sizes={sizes}
              colors={colors}
              filters={filters}
              setFilters={(payload) => { setFilters(payload); setPage(1); }}
              minPrice={minPrice}
              maxPrice={maxPrice}
              isMobile
              onClose={() => setMobileFiltersOpen(false)}
              resetFilters={() => { resetFilters(); setMobileFiltersOpen(false); }}
            />
      </dialog>
    </div>
  );
}
