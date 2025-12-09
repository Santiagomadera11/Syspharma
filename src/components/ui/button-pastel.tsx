import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonPastelProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'green' | 'blue' | 'pink' | 'purple';
  loading?: boolean;
}

const variants = {
  green: {
    bg: '#A7F3D0',
    hover: '#86EFAC',
    disabled: '#D1FAE5',
    text: '#065F46'
  },
  blue: {
    bg: '#93C5FD',
    hover: '#60A5FA',
    disabled: '#DBEAFE',
    text: '#1E40AF'
  },
  pink: {
    bg: '#FBCFE8',
    hover: '#F9A8D4',
    disabled: '#FCE7F3',
    text: '#9F1239'
  },
  purple: {
    bg: '#C4B5FD',
    hover: '#A78BFA',
    disabled: '#EDE9FE',
    text: '#5B21B6'
  }
};

export const ButtonPastel = forwardRef<HTMLButtonElement, ButtonPastelProps>(
  ({ variant = 'green', loading = false, disabled, children, className, style, ...props }, ref) => {
    const colors = variants[variant];
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-103 active:scale-98 shadow-sm flex items-center justify-center gap-2 ${className || ''}`}
        style={{
          backgroundColor: isDisabled ? colors.disabled : colors.bg,
          color: isDisabled ? '#9CA3AF' : colors.text,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.6 : 1,
          ...style
        }}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" style={{ width: '20px', height: '20px' }} />}
        {children}
      </button>
    );
  }
);

ButtonPastel.displayName = 'ButtonPastel';
