import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { LucideIcon, Check, X } from 'lucide-react';

export interface InputWithValidationProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  success?: boolean;
  showValidation?: boolean;
}

export const InputWithValidation = forwardRef<HTMLInputElement, InputWithValidationProps>(
  ({ label, icon: Icon, error, success, showValidation = false, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value && String(props.value).length > 0;

    return (
      <div className="relative w-full">
        <div className="relative">
          {Icon && (
            <Icon
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{
                width: '20px',
                height: '20px',
                color: error ? '#FBCFE8' : success ? '#A7F3D0' : isFocused ? '#93C5FD' : '#9CA3AF'
              }}
            />
          )}
          <input
            ref={ref}
            className={`w-full px-4 ${Icon ? 'pl-12' : ''} ${showValidation ? 'pr-12' : ''} py-3.5 bg-white rounded-2xl border-2 transition-all duration-300 outline-none ${className || ''}`}
            style={{
              borderColor: error ? '#FBCFE8' : success ? '#A7F3D0' : isFocused ? '#93C5FD' : '#E5E7EB',
              color: '#374151'
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          <label
            className="absolute left-4 transition-all duration-300 pointer-events-none"
            style={{
              top: isFocused || hasValue ? '8px' : '50%',
              transform: isFocused || hasValue ? 'translateY(0)' : 'translateY(-50%)',
              fontSize: isFocused || hasValue ? '0.75rem' : '0.95rem',
              color: error ? '#FBCFE8' : success ? '#A7F3D0' : isFocused ? '#93C5FD' : '#9CA3AF',
              left: Icon ? '3rem' : '1rem'
            }}
          >
            {label}
          </label>
          {showValidation && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {success && <Check style={{ width: '20px', height: '20px', color: '#A7F3D0' }} />}
              {error && <X style={{ width: '20px', height: '20px', color: '#FBCFE8' }} />}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 ml-1 text-xs animate-fade-in" style={{ color: '#FBCFE8' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputWithValidation.displayName = 'InputWithValidation';
