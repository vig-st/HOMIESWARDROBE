import { motion } from 'framer-motion';

export function ShopSortBar({ sort, onSortChange, productCount }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-secondary">
        <span className="font-semibold text-primary">{productCount}</span> products found
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm uppercase tracking-[0.3em] text-secondary">Sort</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-primary"
        >
          <option value="newest">Newest</option>
          <option value="best">Best Selling</option>
          <option value="low">Price Low to High</option>
          <option value="high">Price High to Low</option>
        </select>
      </div>
    </motion.div>
  );
}
