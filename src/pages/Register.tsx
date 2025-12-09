import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, Check, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import bgFarmacia from 'figma:asset/c94108fbd09d1fb7e5fb8871f505830b1321c004.png';

const tiposDocumento = ['DNI', 'Cédula', 'Pasaporte', 'Otro'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    tipoDocumento: '',
    documento: '',
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [touched, setTouched] = useState({
    tipoDocumento: false,
    documento: false,
    nombre: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const validateTipoDocumento = (tipo: string) => {
    if (!tipo) return 'Selecciona un tipo de documento';
    return '';
  };

  const validateDocumento = (documento: string) => {
    if (!documento) return 'Este campo es obligatorio';
    if (documento.length < 6) return 'Mínimo 6 caracteres';
    return '';
  };

  const validateNombre = (nombre: string) => {
    if (!nombre) return 'Este campo es obligatorio';
    if (nombre.length < 3) return 'Mínimo 3 caracteres';
    return '';
  };

  const validateEmail = (email: string) => {
    if (!email) return 'Este campo es obligatorio';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Ingresa un email válido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Este campo es obligatorio';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe tener al menos una mayúscula';
    if (!/[a-z]/.test(password)) return 'Debe tener al menos una minúscula';
    if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Este campo es obligatorio';
    if (confirmPassword !== formData.password) return 'Las contraseñas no coinciden';
    return '';
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'tipoDocumento') {
      setErrors({ ...errors, tipoDocumento: validateTipoDocumento(formData.tipoDocumento) });
    } else if (field === 'documento') {
      setErrors({ ...errors, documento: validateDocumento(formData.documento) });
    } else if (field === 'nombre') {
      setErrors({ ...errors, nombre: validateNombre(formData.nombre) });
    } else if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(formData.email) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    } else if (field === 'confirmPassword') {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(formData.confirmPassword) });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    if (touched[field as keyof typeof touched]) {
      if (field === 'tipoDocumento') {
        setErrors({ ...errors, tipoDocumento: validateTipoDocumento(value) });
      } else if (field === 'documento') {
        setErrors({ ...errors, documento: validateDocumento(value) });
      } else if (field === 'nombre') {
        setErrors({ ...errors, nombre: validateNombre(value) });
      } else if (field === 'email') {
        setErrors({ ...errors, email: validateEmail(value) });
      } else if (field === 'password') {
        setErrors({ ...errors, password: validatePassword(value) });
        if (touched.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: value !== formData.confirmPassword ? 'Las contraseñas no coinciden' : '' }));
        }
      } else if (field === 'confirmPassword') {
        setErrors({ ...errors, confirmPassword: validateConfirmPassword(value) });
      }
    }
  };

  const isFormValid = () => {
    return formData.tipoDocumento &&
           formData.documento &&
           formData.nombre &&
           formData.email &&
           formData.password &&
           formData.confirmPassword &&
           !validateTipoDocumento(formData.tipoDocumento) &&
           !validateDocumento(formData.documento) &&
           !validateNombre(formData.nombre) &&
           !validateEmail(formData.email) &&
           !validatePassword(formData.password) &&
           !validateConfirmPassword(formData.confirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ tipoDocumento: true, documento: true, nombre: true, email: true, password: true, confirmPassword: true });
    
    const tipoDocumentoError = validateTipoDocumento(formData.tipoDocumento);
    const documentoError = validateDocumento(formData.documento);
    const nombreError = validateNombre(formData.nombre);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    
    setErrors({
      tipoDocumento: tipoDocumentoError,
      documento: documentoError,
      nombre: nombreError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    });

    if (tipoDocumentoError || documentoError || nombreError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    // Crear usuario con el AuthContext
    const success = await register({
      nombre: formData.nombre,
      email: formData.email,
      password: formData.password,
      rol: 'Cliente',
      activo: true,
      telefono: '',
    });

    if (success) {
      toast.success('Cuenta creada exitosamente', {
        style: {
          background: '#63E6BE',
          color: 'white',
          border: '1px solid #63E6BE',
        }
      });
      navigate('/dashboard');
    } else {
      toast.error('El email ya está registrado', {
        style: {
          background: '#EF4444',
          color: 'white',
          border: '1px solid #EF4444',
        }
      });
    }
  };

  const passwordRequirements = [
    { text: 'Mínimo 8 caracteres', met: formData.password.length >= 8 },
    { text: 'Una mayúscula', met: /[A-Z]/.test(formData.password) },
    { text: 'Una minúscula', met: /[a-z]/.test(formData.password) },
    { text: 'Un número', met: /[0-9]/.test(formData.password) }
  ];

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
          <div className="mb-6">
            <h2 className="text-white" style={{ fontSize: '32px', fontWeight: 700 }}>
              Registrarse
            </h2>
            <p className="text-gray-400 mt-2" style={{ fontSize: '14px' }}>
              Crea tu cuenta para acceder al sistema
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Tipo de Documento */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                TIPO DE DOCUMENTO
              </label>
              <Select
                value={formData.tipoDocumento}
                onValueChange={(value) => handleChange('tipoDocumento', value)}
                onBlur={() => handleBlur('tipoDocumento')}
                className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200 ${
                  touched.tipoDocumento && errors.tipoDocumento 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                }`}
              >
                <SelectTrigger className="h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200">
                  <SelectValue placeholder="Selecciona un tipo de documento" />
                </SelectTrigger>
                <SelectContent className="bg-[#3D4756] text-white">
                  {tiposDocumento.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.tipoDocumento && errors.tipoDocumento && (
                <p className="text-red-400 mt-1 flex items-center gap-1" style={{ fontSize: '11px' }}>
                  <span>⚠</span> {errors.tipoDocumento}
                </p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                DOCUMENTO
              </label>
              <Input
                type="text"
                value={formData.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                onBlur={() => handleBlur('documento')}
                className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200 ${
                  touched.documento && errors.documento 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                }`}
                placeholder="Número de documento"
              />
              {touched.documento && errors.documento && (
                <p className="text-red-400 mt-1 flex items-center gap-1" style={{ fontSize: '11px' }}>
                  <span>⚠</span> {errors.documento}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                NOMBRE COMPLETO
              </label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                onBlur={() => handleBlur('nombre')}
                className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200 ${
                  touched.nombre && errors.nombre 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                }`}
                placeholder="Ingresa tu nombre completo"
              />
              {touched.nombre && errors.nombre && (
                <p className="text-red-400 mt-1 flex items-center gap-1" style={{ fontSize: '11px' }}>
                  <span>⚠</span> {errors.nombre}
                </p>
              )}
            </div>

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
                className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 transition-all duration-200 ${
                  touched.email && errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                }`}
                placeholder="tu@email.com"
              />
              {touched.email && errors.email && (
                <p className="text-red-400 mt-1 flex items-center gap-1" style={{ fontSize: '11px' }}>
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
                  className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 pr-12 transition-all duration-200 ${
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

              {/* Barra de fortaleza */}
              {formData.password && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((threshold) => (
                      <div
                        key={threshold}
                        className={`h-1 flex-1 rounded-full transition-all duration-300`}
                        style={{
                          background: passwordStrength >= threshold 
                            ? threshold === 25 ? '#ef4444' 
                              : threshold === 50 ? '#f97316'
                              : threshold === 75 ? '#eab308'
                              : '#63E6BE'
                            : '#4A5568'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Requisitos compactos */}
              {formData.password && (
                <div className="mt-1.5 grid grid-cols-2 gap-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      {req.met ? (
                        <Check className="w-3 h-3 text-[#63E6BE]" strokeWidth={3} />
                      ) : (
                        <X className="w-3 h-3 text-gray-500" strokeWidth={3} />
                      )}
                      <span 
                        className={req.met ? 'text-[#63E6BE]' : 'text-gray-500'}
                        style={{ fontSize: '10px' }}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmar Password */}
            <div>
              <label className="block text-white mb-2" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                CONFIRMAR CONTRASEÑA
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`h-11 rounded-xl bg-transparent border-2 text-white placeholder:text-gray-500 pr-12 transition-all duration-200 ${
                    touched.confirmPassword && errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-[#4A5568] focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#63E6BE] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-400 mt-1 flex items-center gap-1" style={{ fontSize: '11px' }}>
                  <span>⚠</span> {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Botón */}
            <Button
              type="submit"
              disabled={!isFormValid()}
              className={`w-full h-11 rounded-xl transition-all duration-300 shadow-lg ${
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
              Registrarse
            </Button>

            {/* Ya tienes cuenta */}
            <p className="text-center text-gray-400 pt-1" style={{ fontSize: '12px' }}>
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-[#63E6BE] hover:text-[#5DD5BE] transition-colors"
                style={{ fontWeight: 600 }}
              >
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}