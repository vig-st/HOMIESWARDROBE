import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(({
  label,
  error,
  helper,
  className,
  type = 'text',
  icon,
  ...props
}, ref) => {
  return (
    <label className={cn('block text-sm font-medium text-primary', className)}>
      {label && <span className="mb-2 block text-sm font-medium text-secondary">{label}</span>}
      <div className="relative">
        {icon && <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary">{icon}</div>}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10',
            icon ? 'pl-12' : '',
            error ? 'border-red-300' : ''
          )}
          {...props}
        />
      </div>
      {helper && <p className="mt-2 text-xs text-secondary">{helper}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </label>
  );
});

Input.displayName = 'Input';
export { Input };
