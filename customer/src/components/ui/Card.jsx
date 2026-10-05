import { cn } from '../../utils/cn';

export function Card({ title, children, className }) {
  return (
    <div className={cn('rounded-3xl border border-gray-200 bg-white p-6 shadow-sm', className)}>
      {title && <h2 className="mb-4 text-xl font-semibold text-primary">{title}</h2>}
      {children}
    </div>
  );
}
