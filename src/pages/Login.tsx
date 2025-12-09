import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import bgFarmacia from 'figma:asset/c94108fbd09d1fb7e5fb8871f505830b1321c004.png';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  const validateEmail = (email: string) => {
    if (!email) return 'Este campo es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingresa un email válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Este campo es obligatorio';
    if (password.length < 6) return 'Mínimo 6 caracteres';
    return '';
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(formData.email) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field as keyof typeof touched]) {
      if (field === 'email') {
        setErrors({ ...errors, email: validateEmail(value) });
      } else if (field === 'password') {
        setErrors({ ...errors, password: validatePassword(value) });
      }
    }
  };

  const isFormValid = () => {
    return formData.email && 
           formData.password && 
           !validateEmail(formData.email) && 
           !validatePassword(formData.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true, password: true });
    
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    setErrors({
      email: emailError,
      password: passwordError
    });

    if (emailError || passwordError) {
      return;
    }

    // Intentar login con el AuthContext
    const success = await login(formData.email, formData.password);
    
    if (success) {
      toast.success('Inicio de sesión exitoso', {
        style: {
          background: '#63E6BE',
          color: 'white',
          border: '1px solid #63E6BE',
        }
      });
      navigate('/dashboard');
    } else {
      toast.error('Credenciales incorrectas', {
        description: 'Verifica tu email y contraseña',
        style: {
          background: '#EF4444',
          color: 'white',
          border: '1px solid #EF4444',
        }
      });
    }
  };

  const handleSendRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(recoveryEmail)) {
      toast.success('Código de verificación enviado', {
        description: `Se ha enviado un código a ${recoveryEmail}`,
        style: {
          background: '#63E6BE',
          color: 'white',
          border: '1px solid #63E6BE',
        }
      });
      setShowVerificationCode(true);
    } else {
      toast.error('Por favor ingresa un email válido');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Ingresa el código de verificación');
      return;
    }

    if (verificationCode !== '123456') {
      toast.error('Código incorrecto. Usa 123456 para esta demo');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    toast.success('Contraseña restablecida exitosamente', {
      style: {
        background: '#63E6BE',
        color: 'white',
        border: '1px solid #63E6BE',
      }
    });

    setShowForgotPassword(false);
    setShowVerificationCode(false);
    setRecoveryEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setShowVerificationCode(false);
    setRecoveryEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (showForgotPassword) {
    return (
      <div className="h-screen flex items-center justify-center p-4" style={{ background: '#3D4756' }}>
        <div className="w-full max-w-md bg-[#2D3748] rounded-3xl shadow-2xl p-8 md:p-10">
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-[#63E6BE] hover:text-[#5DD5BE] transition-colors mb-4"
            style={{ fontSize: '14px', fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </button>
          
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg"
              style={{ background: '#63E6BE' }}
            >
              <KeyRound className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-white text-center" style={{ fontSize: '28px', fontWeight: 700 }}>
              {!showVerificationCode ? 'Recuperar Contraseña' : 'Verificar Código'}
            </h2>
            <p className="text-gray-300 text-center mt-2" style={{ fontSize: '14px' }}>
              {!showVerificationCode 
                ? 'Ingresa tu correo para recibir el código de verificación' 
                : 'Ingresa el código enviado a tu correo y tu nueva contraseña'
              }
            </p>
          </div>

          {!showVerificationCode ? (
            <form onSubmit={handleSendRecoveryCode} className="space-y-5">
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                  CORREO
                </label>
                <Input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="h-12 rounded-xl bg-[#3D4756] border-[#4A5568] text-white placeholder:text-gray-400 focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ background: '#63E6BE', fontWeight: 600, fontSize: '15px' }}
              >
                Enviar Código
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              <div>
                <label className="block text-white mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                  CÓDIGO DE VERIFICACIÓN
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="h-12 rounded-xl bg-[#3D4756] border-[#4A5568] text-white placeholder:text-gray-400 focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20"
                  placeholder="Ingresa el código"
                  required
                />
                <p className="text-gray-400 mt-1.5" style={{ fontSize: '11px' }}>
                  💡 Para esta demo, usa el código: <span className="text-[#63E6BE]" style={{ fontWeight: 600 }}>123456</span>
                </p>
              </div>

              <div>
                <label className="block text-white mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                  NUEVA CONTRASEÑA
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl bg-[#3D4756] border-[#4A5568] text-white placeholder:text-gray-400 focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                  CONFIRMAR CONTRASEÑA
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-xl bg-[#3D4756] border-[#4A5568] text-white placeholder:text-gray-400 focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20"
                  placeholder="Repite la contraseña"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                style={{ background: '#63E6BE', fontWeight: 600, fontSize: '15px' }}
              >
                Restablecer Contraseña
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Lado izquierdo - Imagen de farmacia */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden"
        style={{ 
          backgroundImage: `url(${bgFarmacia})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black opacity-30"></div>
        
        {/* Contenido sobre la imagen */}
        <div className="relative z-10 text-center">
          <h1 className="text-white mb-4" style={{ fontSize: '48px', fontWeight: 700, textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
            SYSPHARMA
          </h1>
          <p className="text-white" style={{ fontSize: '20px', fontWeight: 500, textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
            Sistema de Gestión Farmacéutica
          </p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12"
        style={{ background: '#3D4756' }}
      >
        <div className="w-full max-w-md">
          {/* Título */}
          <div className="mb-12">
            <h2 className="text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
              Iniciar Sesión
            </h2>
            <p className="text-gray-400 mt-2" style={{ fontSize: '14px' }}>
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                CORREO
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`h-12 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200 ${
                  touched.email && errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                }`}
                placeholder="tu@email.com"
              />
              {touched.email && errors.email && (
                <p className="text-red-400 mt-1.5 flex items-center gap-1" style={{ fontSize: '12px' }}>
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                CONTRASEÑA
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`h-12 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 pr-12 transition-all duration-200 ${
                    touched.password && errors.password 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#63E6BE] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="text-red-400 mt-1.5 flex items-center gap-1" style={{ fontSize: '12px' }}>
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Recordar y olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-gray-400 data-[state=checked]:bg-[#63E6BE] data-[state=checked]:border-[#63E6BE]"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors" style={{ fontSize: '13px' }}>
                  Recordarme
                </span>
              </label>
              <button 
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-[#63E6BE] hover:text-[#5DD5BE] transition-colors" 
                style={{ fontSize: '13px', fontWeight: 500 }}
              >
                Olvidé mi contraseña
              </button>
            </div>

            {/* Botón de login */}
            <Button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full h-12 rounded-xl transition-all duration-300 shadow-lg ${
                isFormValid()
                  ? 'text-white hover:shadow-xl hover:scale-[1.02]'
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed shadow-none'
              }`}
              style={{ 
                background: isFormValid() ? '#63E6BE' : undefined,
                fontWeight: 600, 
                fontSize: '15px' 
              }}
            >
              Iniciar Sesión
            </Button>

            {/* Link a registro */}
            <p className="text-center text-gray-400" style={{ fontSize: '13px' }}>
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-[#63E6BE] hover:text-[#5DD5BE] transition-colors"
                style={{ fontWeight: 600 }}
              >
                Regístrate aquí
              </Link>
            </p>
            
            {/* Cuentas de prueba */}
            <div className="mt-8 p-4 rounded-xl bg-[#2D3748] border-2 border-[#4A5568]">
              <p className="text-white mb-3" style={{ fontSize: '13px', fontWeight: 600 }}>
                🔑 Cuentas de Prueba:
              </p>
              <div className="space-y-2 text-gray-300" style={{ fontSize: '12px' }}>
                <div>
                  <p className="text-[#63E6BE]" style={{ fontWeight: 600 }}>Administrador:</p>
                  <p>admin@syspharma.com / admin123</p>
                </div>
                <div>
                  <p className="text-[#63E6BE]" style={{ fontWeight: 600 }}>Empleado:</p>
                  <p>empleado@syspharma.com / empleado123</p>
                </div>
                <div>
                  <p className="text-[#63E6BE]" style={{ fontWeight: 600 }}>Cliente:</p>
                  <p>cliente@syspharma.com / cliente123</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}