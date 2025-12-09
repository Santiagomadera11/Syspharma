import { useState } from 'react';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { FormInput } from '../FormInput';
import { Button } from '../Button';
import { PasswordStrength } from '../PasswordStrength';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRequired,
  validatePhone,
} from '../../utils/validation';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();

  const nombreValidation = validateRequired(nombre, 'El nombre');
  const emailValidation = validateEmail(email);
  const telefonoValidation = validatePhone(telefono);
  const passwordValidation = validatePassword(password);
  const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);

  const isFormValid =
    nombreValidation.isValid &&
    emailValidation.isValid &&
    telefonoValidation.isValid &&
    passwordValidation.isValid &&
    confirmPasswordValidation.isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid) {
      showToast('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register({
        nombre,
        email,
        telefono,
        password,
        activo: true,
      });

      if (success) {
        showToast('¡Cuenta creada exitosamente!', 'success');
      } else {
        showToast('Este email ya está registrado', 'error');
      }
    } catch (error) {
      showToast('Error al crear la cuenta', 'error');
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#A7F3D0] mb-4">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 8v24M28 16h-8a4 4 0 000 8h8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-[#A7F3D0] mb-2">Crear Cuenta</h1>
            <p className="text-gray-600">Únete a SysPharma hoy</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Nombre completo"
              type="text"
              icon={User}
              value={nombre}
              onChange={setNombre}
              error={nombreValidation.message}
              isValid={nombreValidation.isValid}
              showValidation={showValidation}
              autoComplete="name"
            />

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
              label="Teléfono (10 dígitos)"
              type="tel"
              icon={Phone}
              value={telefono}
              onChange={setTelefono}
              error={telefonoValidation.message}
              isValid={telefonoValidation.isValid}
              showValidation={showValidation}
              autoComplete="tel"
              maxLength={10}
            />

            <div>
              <FormInput
                label="Contraseña"
                type="password"
                icon={Lock}
                value={password}
                onChange={setPassword}
                error={passwordValidation.message}
                isValid={passwordValidation.isValid}
                showValidation={showValidation}
                autoComplete="new-password"
              />
              <PasswordStrength
                password={password}
                strength={passwordValidation.strength}
              />
            </div>

            <FormInput
              label="Confirmar contraseña"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={confirmPasswordValidation.message}
              isValid={confirmPasswordValidation.isValid}
              showValidation={showValidation}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="success"
              isLoading={isLoading}
              disabled={showValidation && !isFormValid}
              className="w-full"
            >
              Crear Cuenta
            </Button>
          </form>

          {/* Switch to Login */}
          <div className="text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#A7F3D0] hover:underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#93C5FD] via-[#C4B5FD] to-[#FBCFE8] relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <img
          src="https://images.unsplash.com/photo-1744960151119-533c2df6e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaGFybWFjeSUyMGxhYm9yYXRvcnklMjBwYXN0ZWx8ZW58MXx8fHwxNzYzNjUzMDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Pharmacy"
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white space-y-4">
            <h2 className="text-white drop-shadow-lg">Bienvenido a SysPharma</h2>
            <p className="text-xl drop-shadow-md">Tu salud en buenas manos</p>
            <p className="text-lg opacity-90 drop-shadow-md">
              Gestiona tu farmacia de manera profesional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
