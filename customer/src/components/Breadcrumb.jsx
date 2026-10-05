import { Link } from 'react-router-dom';

export function Breadcrumb({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav className="mb-6 text-sm text-secondary" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((it, idx) => (
          <li key={idx} className="inline-flex items-center">
            {it.to ? (
              <Link to={it.to} className="text-secondary hover:text-primary">{it.label}</Link>
            ) : (
              <span className="font-semibold text-primary uppercase tracking-[0.28em]">{it.label}</span>
            )}
            {idx < items.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
