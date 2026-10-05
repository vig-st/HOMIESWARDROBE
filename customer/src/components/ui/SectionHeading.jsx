import { cn } from '../../utils/cn';

export function SectionHeading({ title, subtitle, className }) {
  return (
    <div className={cn('text-center mb-12', className)}>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight uppercase">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-secondary text-sm tracking-wider uppercase">
          {subtitle}
        </p>
      )}
    </div>
  );
}
