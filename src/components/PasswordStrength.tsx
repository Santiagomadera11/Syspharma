interface PasswordStrengthProps {
  password: string;
  strength: 'weak' | 'medium' | 'strong';
}

export const PasswordStrength = ({ password, strength }: PasswordStrengthProps) => {
  if (!password) return null;

  const getColor = () => {
    switch (strength) {
      case 'weak':
        return '#FBCFE8';
      case 'medium':
        return '#fbbf24';
      case 'strong':
        return '#A7F3D0';
    }
  };

  const getWidth = () => {
    switch (strength) {
      case 'weak':
        return '33.33%';
      case 'medium':
        return '66.66%';
      case 'strong':
        return '100%';
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
    }
  };

  const requirements = [
    { met: password.length >= 8, text: 'Mínimo 8 caracteres' },
    { met: /[A-Z]/.test(password), text: 'Una mayúscula' },
    { met: /[0-9]/.test(password), text: 'Un número' },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: 'Un símbolo (opcional)' },
  ];

  return (
    <div className="mt-3 space-y-2">
      {/* Barra de fuerza */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: getWidth(),
              backgroundColor: getColor(),
            }}
          />
        </div>
        <span className="text-sm" style={{ color: getColor() }}>
          {getLabel()}
        </span>
      </div>

      {/* Requisitos */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className={req.met ? 'text-[#A7F3D0]' : 'text-gray-400'}>
              {req.met ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="currentColor" />
                  <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              )}
            </div>
            <span className={req.met ? 'text-gray-700' : 'text-gray-400'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
