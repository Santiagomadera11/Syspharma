import { useState } from 'react';
import { Mail, Lock, Pill } from 'lucide-react';
import { InputWithValidation } from './ui/input-with-validation';
import { ButtonPastel } from './ui/button-pastel';
import { validateEmail, validateRequired } from '../utils/validation';
import { toast } from 'sonner@2.0.3';
import type { User } from '../App';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

export function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const emailError = touched.email && !validateRequired(email)
    ? 'Este campo es obligatorio'
    : touched.email && !validateEmail(email)
    ? 'Ingresa un email válido'
    : '';

  const passwordError = touched.password && !validateRequired(password)
    ? 'Este campo es obligatorio'
    : '';

  const isValid = validateEmail(email) && validateRequired(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isValid) {
      toast.error('Por favor completa todos los campos correctamente', {
        style: { background: '#FBCFE8', color: '#9F1239' }
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockUsers = JSON.parse(localStorage.getItem('syspharma_users') || '[]');
      const user = mockUsers.find((u: any) => u.email === email && u.password === password);

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        toast.success('¡Bienvenido a SysPharma!', {
          style: { background: '#A7F3D0', color: '#065F46' }
        });
        onLogin(userWithoutPassword);
      } else {
        toast.error('Email o contraseña incorrectos', {
          style: { background: '#FBCFE8', color: '#9F1239' }
        });
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #C4B5FD 100%)' }}
            >
              <Pill style={{ width: '28px', height: '28px', color: 'white' }} />
            </div>
            <div>
              <h1 className="m-0" style={{ color: '#93C5FD', fontSize: '1.75rem' }}>SysPharma</h1>
              <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>Sistema de Gestión</p>
            </div>
          </div>

          <h2 className="mb-2" style={{ color: '#93C5FD' }}>Iniciar Sesión</h2>
          <p className="mb-8" style={{ color: '#9CA3AF' }}>
            Ingresa tus credenciales para acceder
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputWithValidation
              label="Correo Electrónico"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              error={emailError}
              success={touched.email && !emailError && email.length > 0}
              showValidation={touched.email && email.length > 0}
            />

            <InputWithValidation
              label="Contraseña"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              error={passwordError}
              success={touched.password && !passwordError && password.length > 0}
              showValidation={touched.password && password.length > 0}
            />

            <ButtonPastel
              variant="green"
              type="submit"
              disabled={!isValid}
              loading={loading}
              className="w-full"
            >
              Iniciar Sesión
            </ButtonPastel>

            <div className="text-center">
              <p style={{ color: '#9CA3AF' }}>
                ¿No tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="transition-colors"
                  style={{ color: '#93C5FD', fontWeight: 500 }}
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #C4B5FD 0%, #A7F3D0 50%, #93C5FD 100%)'
        }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1744960151119-533c2df6e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMGxhYm9yYXRvcnklMjBwYXN0ZWx8ZW58MXx8fHwxNzYzNjUzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Laboratorio Farmacéutico"
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 text-center px-12 max-w-2xl">
          <h2 className="mb-4 text-white" style={{ fontSize: '2.5rem' }}>
            SysPharma
          </h2>
          <p className="text-white text-xl">
            Tu salud en buenas manos
          </p>
        </div>
      </div>
    </div>
  );
}
