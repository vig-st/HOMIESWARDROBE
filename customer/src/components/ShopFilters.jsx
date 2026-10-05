import { Filter, X } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export function ShopFilters({
  categories,
  sizes,
  colors,
  filters,
  setFilters,
  minPrice,
  maxPrice,
  isMobile,
  onClose,
  resetFilters,
}) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn('space-y-8', isMobile ? 'min-h-screen bg-white' : 'sticky top-24')}> 
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm uppercase tracking-[0.32em] text-secondary">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        {isMobile && (
          <button type="button" onClick={onClose} aria-label="Close filters" className="text-secondary">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">Gender</div>
        <div className="grid grid-cols-3 gap-2">
          {[['', 'All'], ['men', 'Men'], ['women', 'Women']].map(([value, label]) => (
            <button
              key={value || 'all'}
              onClick={() => handleChange('gender', value)}
              className={cn(
                'rounded-md border px-2 py-2 text-sm transition-colors',
                filters.gender === value ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-secondary hover:border-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">Category</div>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => handleChange('category', filters.category === item ? '' : item)}
              className={cn(
                'rounded-md border px-3 py-2 text-left text-sm transition-colors',
                filters.category === item ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-secondary hover:border-primary'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">Price</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-secondary mb-2">Min</label>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', Number(e.target.value))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-primary"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.25em] text-secondary mb-2">Max</label>
            <input
              type="number"
              min={minPrice}
              max={maxPrice}
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-primary"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">Size</div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((item) => (
            <button
              key={item}
              onClick={() => handleChange('size', filters.size === item ? '' : item)}
              className={cn(
                'rounded-full border px-3 py-2 text-sm transition-colors',
                filters.size === item ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-secondary hover:border-primary'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.35em] text-secondary font-semibold">Color</div>
        <div className="flex flex-wrap gap-2">
          {colors.map((item) => (
            <button
              key={item}
              onClick={() => handleChange('color', filters.color === item ? '' : item)}
              className={cn(
                'rounded-full border px-3 py-2 text-sm transition-colors',
                filters.color === item ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-secondary hover:border-primary'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => handleChange('availability', !filters.availability)}
          className={cn(
            'w-full rounded-md border px-4 py-3 text-sm uppercase tracking-[0.3em] transition-colors',
            filters.availability ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white text-secondary hover:border-primary'
          )}
        >
          {filters.availability ? 'In stock only' : 'Show all availability'}
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
