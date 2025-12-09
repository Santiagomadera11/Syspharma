import { useState } from 'react';
import { Mail, Lock, User, Phone, Pill } from 'lucide-react';
import { InputWithValidation } from './ui/input-with-validation';
import { ButtonPastel } from './ui/button-pastel';
import { validateEmail, validatePassword, validatePhone, validateRequired } from '../utils/validation';
import { toast } from 'sonner@2.0.3';
import type { User as UserType } from '../App';

interface RegisterProps {
  onRegister: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

export function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });
  
  const [loading, setLoading] = useState(false);

  const passwordValidation = validatePassword(formData.password);

  const errors = {
    name: touched.name && !validateRequired(formData.name) ? 'Este campo es obligatorio' : '',
    email: touched.email && !validateRequired(formData.email)
      ? 'Este campo es obligatorio'
      : touched.email && !validateEmail(formData.email)
      ? 'Ingresa un email válido'
      : '',
    phone: touched.phone && !validateRequired(formData.phone)
      ? 'Este campo es obligatorio'
      : touched.phone && !validatePhone(formData.phone)
      ? 'Debe tener 10 dígitos'
      : '',
    password: touched.password && !passwordValidation.hasMinLength
      ? 'Mínimo 8 caracteres'
      : touched.password && !passwordValidation.hasUpperCase
      ? 'Debe tener al menos una mayúscula'
      : touched.password && !passwordValidation.hasNumber
      ? 'Debe tener al menos un número'
      : '',
    confirmPassword: touched.confirmPassword && formData.password !== formData.confirmPassword
      ? 'Las contraseñas no coinciden'
      : ''
  };

  const isValid = 
    validateRequired(formData.name) &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone) &&
    passwordValidation.isValid &&
    formData.password === formData.confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });

    if (!isValid) {
      toast.error('Por favor completa todos los campos correctamente', {
        style: { background: '#FBCFE8', color: '#9F1239' }
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const existingUsers = JSON.parse(localStorage.getItem('syspharma_users') || '[]');
      
      // Check if email already exists
      if (existingUsers.some((u: any) => u.email === formData.email)) {
        toast.error('Este email ya está registrado', {
          style: { background: '#FBCFE8', color: '#9F1239' }
        });
        setLoading(false);
        return;
      }

      const newUser: UserType & { password: string } = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'cliente',
        active: true,
        password: formData.password
      };

      existingUsers.push(newUser);
      localStorage.setItem('syspharma_users', JSON.stringify(existingUsers));

      const { password: _, ...userWithoutPassword } = newUser;
      toast.success('¡Registro exitoso! Bienvenido a SysPharma', {
        style: { background: '#A7F3D0', color: '#065F46' }
      });
      onRegister(userWithoutPassword);
      setLoading(false);
    }, 1000);
  };

  const getStrengthColor = () => {
    if (!formData.password) return '#E5E7EB';
    switch (passwordValidation.strength) {
      case 'strong': return '#A7F3D0';
      case 'medium': return '#FDE047';
      case 'weak': return '#FBCFE8';
      default: return '#E5E7EB';
    }
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

          <h2 className="mb-2" style={{ color: '#93C5FD' }}>Crear Cuenta</h2>
          <p className="mb-8" style={{ color: '#9CA3AF' }}>
            Completa el formulario para registrarte
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputWithValidation
              label="Nombre Completo"
              icon={User}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={() => setTouched({ ...touched, name: true })}
              error={errors.name}
              success={touched.name && !errors.name && formData.name.length > 0}
              showValidation={touched.name && formData.name.length > 0}
            />

            <InputWithValidation
              label="Correo Electrónico"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              onBlur={() => setTouched({ ...touched, email: true })}
              error={errors.email}
              success={touched.email && !errors.email && formData.email.length > 0}
              showValidation={touched.email && formData.email.length > 0}
            />

            <InputWithValidation
              label="Teléfono (10 dígitos)"
              type="tel"
              icon={Phone}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              onBlur={() => setTouched({ ...touched, phone: true })}
              error={errors.phone}
              success={touched.phone && !errors.phone && formData.phone.length > 0}
              showValidation={touched.phone && formData.phone.length > 0}
            />

            <div>
              <InputWithValidation
                label="Contraseña"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onBlur={() => setTouched({ ...touched, password: true })}
                error={errors.password}
                success={touched.password && passwordValidation.isValid}
                showValidation={touched.password && formData.password.length > 0}
              />
              {formData.password && (
                <div className="mt-2 space-y-2 animate-fade-in">
                  <div className="flex gap-1">
                    <div className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: passwordValidation.hasMinLength ? getStrengthColor() : '#E5E7EB' }} />
                    <div className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: passwordValidation.hasUpperCase ? getStrengthColor() : '#E5E7EB' }} />
                    <div className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: passwordValidation.hasNumber ? getStrengthColor() : '#E5E7EB' }} />
                    <div className="h-1.5 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: passwordValidation.hasSymbol ? getStrengthColor() : '#E5E7EB' }} />
                  </div>
                  <div className="text-xs space-y-1" style={{ color: '#9CA3AF' }}>
                    <div className={passwordValidation.hasMinLength ? 'text-[#065F46]' : ''}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={passwordValidation.hasUpperCase ? 'text-[#065F46]' : ''}>
                      ✓ Al menos una mayúscula
                    </div>
                    <div className={passwordValidation.hasNumber ? 'text-[#065F46]' : ''}>
                      ✓ Al menos un número
                    </div>
                  </div>
                </div>
              )}
            </div>

            <InputWithValidation
              label="Confirmar Contraseña"
              type="password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              error={errors.confirmPassword}
              success={touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword.length > 0}
              showValidation={touched.confirmPassword && formData.confirmPassword.length > 0}
            />

            <ButtonPastel
              variant="green"
              type="submit"
              disabled={!isValid}
              loading={loading}
              className="w-full"
            >
              Crear Cuenta
            </ButtonPastel>

            <div className="text-center">
              <p style={{ color: '#9CA3AF' }}>
                ¿Ya tienes cuenta?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="transition-colors"
                  style={{ color: '#93C5FD', fontWeight: 500 }}
                >
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Gradient on mobile, Image on desktop */}
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
            Únete a SysPharma
          </h2>
          <p className="text-white text-xl">
            Gestiona tu salud de manera inteligente y segura
          </p>
        </div>
      </div>
    </div>
  );
}
