import { cloneElement, forwardRef, isValidElement } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({
  asChild = false,
  className,
  variant = 'primary',
  size = 'default',
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-black/90 active:scale-[0.98]',
    secondary: 'bg-section text-primary hover:bg-gray-200 active:scale-[0.98]',
    outline: 'border border-primary text-primary hover:bg-section active:scale-[0.98]',
    ghost: 'hover:bg-section text-primary active:scale-[0.98]',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-11 px-6 py-2',
    sm: 'h-9 px-4 text-sm',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10',
  };

  const buttonClassName = cn(
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 uppercase tracking-widest',
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ref,
      className: cn(buttonClassName, children.props.className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={buttonClassName}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
