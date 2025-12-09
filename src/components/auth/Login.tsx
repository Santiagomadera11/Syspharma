import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { FormInput } from '../FormInput';
import { Button } from '../Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateEmail, validateRequired } from '../../utils/validation';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login = ({ onSwitchToRegister }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();

  const emailValidation = validateEmail(email);
  const passwordValidation = validateRequired(password, 'La contraseña');

  const isFormValid = emailValidation.isValid && passwordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid) {
      showToast('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        showToast('¡Bienvenido a SysPharma!', 'success');
      } else {
        showToast('Credenciales incorrectas. Intenta de nuevo.', 'error');
      }
    } catch (error) {
      showToast('Error al iniciar sesión', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Formulario */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo y Título */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#93C5FD] mb-4">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 8v24M28 16h-8a4 4 0 000 8h8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-[#93C5FD] mb-2">SysPharma</h1>
            <p className="text-gray-600">Inicia sesión en tu cuenta</p>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-[#93C5FD] bg-opacity-10 border border-[#93C5FD] rounded-2xl p-4 text-sm">
            <p className="font-semibold text-[#1e40af] mb-2">Cuentas de demostración:</p>
            <div className="space-y-1 text-gray-600">
              <p>• Admin: admin@syspharma.com / Admin123</p>
              <p>• Empleado: empleado@syspharma.com / Empleado123</p>
              <p>• Cliente: cliente@syspharma.com / Cliente123</p>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Correo"
              type="email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              error={emailValidation.message}
              isValid={emailValidation.isValid}
              showValidation={showValidation}
              autoComplete="email"
            />

            <FormInput
              label="Contraseña"
              type="password"
              icon={Lock}
              value={password}
              onChange={setPassword}
              error={passwordValidation.message}
              isValid={passwordValidation.isValid}
              showValidation={showValidation}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="success"
              isLoading={isLoading}
              disabled={showValidation && !isFormValid}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-[#93C5FD] hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#C4B5FD] via-[#A7F3D0] to-[#93C5FD] relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <img
          src="https://images.unsplash.com/photo-1744960151119-533c2df6e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMGxhYm9yYXRvcnklMjBwYXN0ZWx8ZW58MXx8fHwxNzYzNjUzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Pharmacy"
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-4">
            <h2 className="text-white drop-shadow-lg">SysPharma</h2>
            <p className="text-xl drop-shadow-md">Tu salud en buenas manos</p>
            <p className="text-lg opacity-90 drop-shadow-md">
              Sistema integral de gestión farmacéutica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
