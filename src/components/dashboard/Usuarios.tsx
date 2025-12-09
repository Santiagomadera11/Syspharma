import { useState } from 'react';
import { Plus, Edit, Trash2, User, Mail, Phone, UserCog } from 'lucide-react';
import { Table } from '../common/Table';
import { Modal } from '../common/Modal';
import { FormInput } from '../FormInput';
import { FormSelect } from '../common/FormSelect';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { User as UserType } from '../../types';
import {
  validateEmail,
  validatePassword,
  validateRequired,
  validatePhone,
} from '../../utils/validation';

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<UserType[]>([
    {
      id: '1',
      nombre: 'Admin SysPharma',
      email: 'admin@syspharma.com',
      rol: 'admin',
      telefono: '3001234567',
      activo: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nombre: 'María González',
      email: 'empleado@syspharma.com',
      rol: 'empleado',
      telefono: '3009876543',
      activo: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<'admin' | 'empleado' | 'cliente'>('cliente');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(true);

  const { showToast } = useToast();

  // Validations
  const nombreValidation = validateRequired(nombre, 'El nombre');
  const emailValidation = validateEmail(email);
  const telefonoValidation = validatePhone(telefono);
  const passwordValidation = editingUser ? { isValid: true, message: '', strength: 'medium' as const } : validatePassword(password);
  const rolValidation = validateRequired(rol, 'El rol');

  const isFormValid =
    nombreValidation.isValid &&
    emailValidation.isValid &&
    telefonoValidation.isValid &&
    passwordValidation.isValid &&
    rolValidation.isValid;

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setTelefono('');
    setRol('cliente');
    setPassword('');
    setActivo(true);
    setShowValidation(false);
    setEditingUser(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setNombre(user.nombre);
    setEmail(user.email);
    setTelefono(user.telefono || '');
    setRol(user.rol);
    setActivo(user.activo);
    setShowValidation(false);
    setIsModalOpen(true);
  };

  const handleDelete = (user: UserType) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.nombre}?`)) {
      setUsuarios(prev => prev.filter(u => u.id !== user.id));
      showToast('Usuario eliminado exitosamente', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid) {
      showToast('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    // Check email duplicate
    const emailExists = usuarios.some(
      u => u.email === email && u.id !== editingUser?.id
    );
    if (emailExists) {
      showToast('Este email ya está registrado', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingUser) {
        setUsuarios(prev =>
          prev.map(u =>
            u.id === editingUser.id
              ? { ...u, nombre, email, telefono, rol, activo }
              : u
          )
        );
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        const newUser: UserType = {
          id: Math.random().toString(36).substr(2, 9),
          nombre,
          email,
          telefono,
          rol,
          activo,
          createdAt: new Date().toISOString(),
        };
        setUsuarios(prev => [...prev, newUser]);
        showToast('Usuario creado exitosamente', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al guardar usuario', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = (user: UserType) => {
    setUsuarios(prev =>
      prev.map(u =>
        u.id === user.id ? { ...u, activo: !u.activo } : u
      )
    );
    showToast(
      `Usuario ${user.activo ? 'desactivado' : 'activado'} exitosamente`,
      'info'
    );
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (user: UserType) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#93C5FD] flex items-center justify-center text-white">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p>{user.nombre}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'telefono',
      label: 'Teléfono',
    },
    {
      key: 'rol',
      label: 'Rol',
      render: (user: UserType) => {
        const colors = {
          admin: 'bg-[#C4B5FD] text-[#5b21b6]',
          empleado: 'bg-[#93C5FD] text-[#1e40af]',
          cliente: 'bg-[#A7F3D0] text-[#065f46]',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-sm ${colors[user.rol]}`}>
            {user.rol.charAt(0).toUpperCase() + user.rol.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (user: UserType) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleActivo(user);
          }}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
            ${user.activo ? 'bg-[#A7F3D0]' : 'bg-gray-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
              ${user.activo ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (user: UserType) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(user);
            }}
            className="p-2 rounded-xl hover:bg-[#93C5FD] hover:bg-opacity-20 transition-colors duration-200"
          >
            <Edit size={18} className="text-[#1e40af]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(user);
            }}
            className="p-2 rounded-xl hover:bg-[#FBCFE8] hover:bg-opacity-20 transition-colors duration-200"
          >
            <Trash2 size={18} className="text-[#9f1239]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Gestión de Usuarios</h2>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <Button variant="success" onClick={handleAdd}>
          <Plus size={20} />
          Nuevo Usuario
        </Button>
      </div>

      {/* Table */}
      <Table data={usuarios} columns={columns} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
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
            maxLength={10}
          />

          <FormSelect
            label="Rol"
            icon={UserCog}
            value={rol}
            onChange={(value) => setRol(value as 'admin' | 'empleado' | 'cliente')}
            error={rolValidation.message}
            isValid={rolValidation.isValid}
            showValidation={showValidation}
            options={[
              { value: 'admin', label: 'Administrador' },
              { value: 'empleado', label: 'Empleado' },
              { value: 'cliente', label: 'Cliente' },
            ]}
          />

          {!editingUser && (
            <FormInput
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              error={passwordValidation.message}
              isValid={passwordValidation.isValid}
              showValidation={showValidation}
            />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivo(!activo)}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
                ${activo ? 'bg-[#A7F3D0]' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
                  ${activo ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
            <span className="text-gray-700">Usuario activo</span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="success"
              isLoading={isLoading}
              disabled={showValidation && !isFormValid}
              className="flex-1"
            >
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
