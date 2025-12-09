import { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Camera, Save, Edit, X } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner@2.0.3';

interface MiPerfilProps {
  user: any;
}

export default function MiPerfil({ user }: MiPerfilProps) {
  const { isDark, bgCard, textPrimary, textSecondary, border, inputBg, inputBorder } = useDarkMode();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || 'Juan Cliente',
    email: user?.email || 'cliente@syspharma.com',
    telefono: user?.telefono || '+57 300 555 1234',
    documento: '1234567890',
    fechaNacimiento: '1990-01-15'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    email: '',
    telefono: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const validateEmail = (email: string) => {
    if (!email) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email inválido';
    return '';
  };

  const validatePhone = (phone: string) => {
    if (!phone) return 'El teléfono es requerido';
    if (phone.length < 10) return 'Teléfono inválido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(password)) return 'Debe tener al menos una mayúscula';
    if (!/[a-z]/.test(password)) return 'Debe tener al menos una minúscula';
    if (!/[0-9]/.test(password)) return 'Debe tener al menos un número';
    return '';
  };

  const handleSaveProfile = () => {
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.telefono);

    if (emailError || phoneError) {
      setErrors({ ...errors, email: emailError, telefono: phoneError });
      return;
    }

    toast.success('Perfil actualizado exitosamente');
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    const currentError = !passwordData.currentPassword ? 'Ingresa tu contraseña actual' : '';
    const newError = validatePassword(passwordData.newPassword);
    const confirmError = passwordData.newPassword !== passwordData.confirmPassword 
      ? 'Las contraseñas no coinciden' 
      : '';

    setErrors({
      ...errors,
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: confirmError
    });

    if (currentError || newError || confirmError) return;

    toast.success('Contraseña actualizada exitosamente');
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className={`${textPrimary} transition-colors duration-300`} style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Mi Perfil
        </h2>
        <p className={`${textSecondary} mt-1 transition-colors duration-300`} style={{ fontSize: '14px' }}>
          Gestiona tu información personal
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Avatar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${bgCard} rounded-xl border ${border} p-6 lg:col-span-1`}
        >
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#63E6BE] to-[#14B8A6] flex items-center justify-center">
                <User className="w-16 h-16 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#63E6BE] rounded-full flex items-center justify-center hover:bg-[#14B8A6] transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <h3 className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
              {formData.nombre}
            </h3>
            <p className={textSecondary} style={{ fontSize: '14px' }} className="mb-1">
              {formData.email}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mt-2">
              <span className="text-purple-500 text-xs" style={{ fontWeight: 600 }}>
                {user?.rol || 'Cliente'}
              </span>
            </div>

            <div className={`w-full mt-6 pt-6 border-t ${border}`}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className={`w-4 h-4 ${textSecondary}`} />
                  <span className={textSecondary} style={{ fontSize: '13px' }}>
                    {formData.telefono}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Información Personal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${bgCard} rounded-xl border ${border} p-6 lg:col-span-2`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
                Información Personal
              </h3>
              <p className={textSecondary} style={{ fontSize: '13px' }}>
                Actualiza tus datos personales
              </p>
            </div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#63E6BE] hover:bg-[#14B8A6] text-white rounded-xl h-10 px-4 gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl h-10 px-4 gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-[#63E6BE] hover:bg-[#14B8A6] text-white rounded-xl h-10 px-4 gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Nombre Completo
              </label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
              {errors.telefono && (
                <p className="text-red-400 text-xs mt-1">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Documento
              </label>
              <Input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Fecha de Nacimiento
              </label>
              <Input
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Ciudad
              </label>
              <Input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                disabled={!isEditing}
                className="h-11 rounded-xl"
              />
            </div>

            
          </div>
        </motion.div>

        {/* Cambiar Contraseña */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${bgCard} rounded-xl border ${border} p-6 lg:col-span-3`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
                  Seguridad
                </h3>
                <p className={textSecondary} style={{ fontSize: '13px' }}>
                  Cambia tu contraseña
                </p>
              </div>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl h-10 px-4 gap-2"
              >
                <Lock className="w-4 h-4" />
                Cambiar Contraseña
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  Contraseña Actual
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="••••••••"
                />
                {errors.currentPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  Nueva Contraseña
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label className={`block ${textPrimary} mb-2`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  Confirmar Contraseña
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="h-11 rounded-xl"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="md:col-span-3 flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl h-10 px-6"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleChangePassword}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl h-10 px-6"
                >
                  Actualizar Contraseña
                </Button>
              </div>
            </div>
          )}

          {!isChangingPassword && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className={textSecondary} style={{ fontSize: '13px' }}>
                Por seguridad, te recomendamos cambiar tu contraseña periódicamente.
                Última actualización: 15 de noviembre, 2024
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}