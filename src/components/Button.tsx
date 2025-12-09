import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'info';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const getVariantStyles = () => {
    const baseStyles = 'rounded-2xl px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2';
    
    if (disabled || isLoading) {
      return `${baseStyles} bg-gray-200 text-gray-400 cursor-not-allowed`;
    }

    switch (variant) {
      case 'success':
        return `${baseStyles} bg-[#A7F3D0] text-[#065f46] hover:scale-[1.03] active:scale-[0.98] shadow-sm`;
      case 'danger':
        return `${baseStyles} bg-[#FBCFE8] text-[#9f1239] hover:scale-[1.03] active:scale-[0.98] shadow-sm`;
      case 'info':
        return `${baseStyles} bg-[#93C5FD] text-[#1e40af] hover:scale-[1.03] active:scale-[0.98] shadow-sm`;
      case 'secondary':
        return `${baseStyles} bg-[#C4B5FD] text-[#5b21b6] hover:scale-[1.03] active:scale-[0.98] shadow-sm`;
      case 'primary':
      default:
        return `${baseStyles} bg-[#93C5FD] text-[#1e40af] hover:scale-[1.03] active:scale-[0.98] shadow-sm`;
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${getVariantStyles()} ${className}`}
    >
      {isLoading && <Loader2 size={20} className="animate-spin" />}
      {children}
    </button>
  );
};
