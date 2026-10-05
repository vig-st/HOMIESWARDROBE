import { Link } from 'react-router-dom';

export function ShopBreadcrumb() {
  return (
    <div className="text-sm text-secondary mb-8 flex flex-wrap items-center gap-2">
      <Link to="/" className="text-secondary hover:text-primary">Home</Link>
      <span>/</span>
      <span className="font-semibold text-primary uppercase tracking-[0.28em]">Shop</span>
    </div>
  );
}
