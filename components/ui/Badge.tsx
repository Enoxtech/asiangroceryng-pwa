import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'sale' | 'new' | 'out-of-stock' | 'success' | 'warning';
  className?: string;
}

const variants = {
  default: 'bg-gray-100 text-gray-700',
  sale: 'bg-red-600 text-white',
  new: 'bg-green-700 text-white',
  'out-of-stock': 'bg-gray-400 text-white',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
