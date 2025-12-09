import { useState, InputHTMLAttributes } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  onChange?: (value: string) => void;
}

export const FormInput = ({
  label,
  icon: Icon,
  error,
  isValid,
  showValidation = false,
  type = 'text',
  onChange,
  className = '',
  ...props
}: FormInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = props.value && String(props.value).length > 0;

  const getBorderColor = () => {
    if (!showValidation) return 'border-gray-200';
    if (error) return 'border-[#FBCFE8]';
    if (isValid && hasValue) return 'border-[#A7F3D0]';
    return 'border-gray-200';
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          {...props}
          type={inputType}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3 pr-12 border-2 rounded-2xl
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:ring-opacity-30
            ${getBorderColor()}
            ${Icon ? 'pl-12' : ''}
            ${className}
          `}
          placeholder=" "
        />
        
        {/* Label flotante */}
        <label
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${Icon ? 'left-12' : 'left-4'}
            ${isFocused || hasValue 
              ? '-top-2.5 text-xs bg-white px-2 text-[#93C5FD]' 
              : 'top-3.5 text-gray-400'
            }
          `}
        >
          {label}
        </label>

        {/* Ícono izquierdo */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon size={20} />
          </div>
        )}

        {/* Ícono derecho - validación o mostrar/ocultar contraseña */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          ) : showValidation && hasValue && (
            <div>
              {isValid ? (
                <div className="text-[#A7F3D0]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="currentColor" />
                    <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div className="text-[#FBCFE8]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="currentColor" />
                    <path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mensaje de error */}
      {showValidation && error && (
        <p className="mt-1.5 text-sm text-[#9f1239] ml-1">{error}</p>
      )}
    </div>
  );
};
