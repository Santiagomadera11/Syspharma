import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const validations = [
    { label: 'Mínimo 8 caracteres', valid: hasMinLength },
    { label: 'Una mayúscula', valid: hasUpperCase },
    { label: 'Un número', valid: hasNumber },
    { label: 'Un símbolo', valid: hasSymbol },
  ];

  const validCount = validations.filter(v => v.valid).length;
  const strength = validCount === 0 ? 0 : validCount === 1 || validCount === 2 ? 1 : validCount === 3 ? 2 : 3;
  const strengthColors = ['#FBCFE8', '#fde047', '#A7F3D0'];
  const strengthLabels = ['Débil', 'Media', 'Fuerte'];

  return (
    <div className="space-y-2">
      {password && (
        <>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i < strength ? strengthColors[strength - 1] : '#E5E7EB',
                }}
              />
            ))}
          </div>
          {password.length > 0 && (
            <p className="text-xs" style={{ color: strengthColors[strength - 1] || '#9CA3AF' }}>
              Contraseña: {strength > 0 ? strengthLabels[strength - 1] : 'Muy débil'}
            </p>
          )}
        </>
      )}
      <div className="space-y-1 mt-3">
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {validation.valid ? (
              <Check size={16} style={{ color: '#A7F3D0' }} />
            ) : (
              <X size={16} style={{ color: '#FBCFE8' }} />
            )}
            <span className={validation.valid ? 'text-gray-600' : 'text-gray-400'}>
              {validation.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  );
}
