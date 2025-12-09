interface CategoryBadgeProps {
  nombre: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryBadge({ nombre, color, size = 'md', className = '' }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5 text-base'
  };

  const fontWeights = {
    sm: '500',
    md: '600',
    lg: '700'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full text-white shadow-sm ${sizeClasses[size]} ${className}`}
      style={{ 
        backgroundColor: color,
        fontSize: size === 'lg' ? '14px' : size === 'md' ? '13px' : '12px',
        fontWeight: fontWeights[size]
      }}
    >
      {nombre}
    </span>
  );
}
