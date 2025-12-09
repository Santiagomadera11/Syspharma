import { SelectHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  isValid?: boolean;
  showValidation?: boolean;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
}

export const FormSelect = ({
  label,
  icon: Icon,
  error,
  isValid,
  showValidation = false,
  onChange,
  options,
  className = '',
  ...props
}: FormSelectProps) => {
  const hasValue = props.value && String(props.value).length > 0;

  const getBorderColor = () => {
    if (!showValidation) return 'border-gray-200';
    if (error) return 'border-[#FBCFE8]';
    if (isValid && hasValue) return 'border-[#A7F3D0]';
    return 'border-gray-200';
  };

  return (
    <div className="w-full">
      <label className="block text-sm text-gray-600 mb-2 ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          onChange={(e) => onChange?.(e.target.value)}
          className={`
            w-full px-4 py-3 pr-12 border-2 rounded-2xl appearance-none
            transition-all duration-200 bg-white
            focus:outline-none focus:ring-2 focus:ring-[#93C5FD] focus:ring-opacity-30
            ${getBorderColor()}
            ${Icon ? 'pl-12' : ''}
            ${className}
          `}
        >
          <option value="">Seleccionar...</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Ícono izquierdo */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        {/* Flecha dropdown */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Validación visual */}
        {showValidation && hasValue && !Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
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

      {/* Mensaje de error */}
      {showValidation && error && (
        <p className="mt-1.5 text-sm text-[#9f1239] ml-1">{error}</p>
      )}
    </div>
  );
};
