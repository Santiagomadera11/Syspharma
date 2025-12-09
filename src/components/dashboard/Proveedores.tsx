import { useState } from 'react';
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Table } from '../common/Table';
import { Modal } from '../common/Modal';
import { FormInput } from '../FormInput';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { Proveedor } from '../../types';
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateNIT,
  validateUniqueCode,
} from '../../utils/validation';

export const Proveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([
    {
      id: '1',
      nombre: 'Laboratorios PharmaCol',
      nit: '9001234567',
      telefono: '6015551234',
      email: 'contacto@pharmacol.com',
      direccion: 'Calle 100 #15-20, Bogotá',
      activo: true,
    },
    {
      id: '2',
      nombre: 'Distribuidora MediPlus',
      nit: '9007654321',
      telefono: '6045556789',
      email: 'ventas@mediplus.com',
      direccion: 'Carrera 50 #30-10, Medellín',
      activo: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [activo, setActivo] = useState(true);

  const { showToast } = useToast();

  // Validations
  const existingNITs = proveedores
    .filter(p => p.id !== editingProveedor?.id)
    .map(p => p.nit);
  
  const nombreValidation = validateRequired(nombre, 'El nombre');
  const nitValidation = validateNIT(nit);
  const nitUniqueValidation = validateUniqueCode(nit, existingNITs);
  const telefonoValidation = validatePhone(telefono);
  const emailValidation = validateEmail(email);
  const direccionValidation = validateRequired(direccion, 'La dirección');

  const isFormValid =
    nombreValidation.isValid &&
    nitValidation.isValid &&
    nitUniqueValidation.isValid &&
    telefonoValidation.isValid &&
    emailValidation.isValid &&
    direccionValidation.isValid;

  const resetForm = () => {
    setNombre('');
    setNit('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setActivo(true);
    setShowValidation(false);
    setEditingProveedor(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setNombre(proveedor.nombre);
    setNit(proveedor.nit);
    setTelefono(proveedor.telefono);
    setEmail(proveedor.email);
    setDireccion(proveedor.direccion);
    setActivo(proveedor.activo);
    setShowValidation(false);
    setIsModalOpen(true);
  };

  const handleDelete = (proveedor: Proveedor) => {
    if (confirm(`¿Estás seguro de eliminar ${proveedor.nombre}?`)) {
      setProveedores(prev => prev.filter(p => p.id !== proveedor.id));
      showToast('Proveedor eliminado exitosamente', 'success');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    if (!isFormValid) {
      showToast('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingProveedor) {
        setProveedores(prev =>
          prev.map(p =>
            p.id === editingProveedor.id
              ? { ...p, nombre, nit, telefono, email, direccion, activo }
              : p
          )
        );
        showToast('Proveedor actualizado exitosamente', 'success');
      } else {
        const newProveedor: Proveedor = {
          id: Math.random().toString(36).substr(2, 9),
          nombre,
          nit,
          telefono,
          email,
          direccion,
          activo,
        };
        setProveedores(prev => [...prev, newProveedor]);
        showToast('Proveedor creado exitosamente', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al guardar proveedor', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = (proveedor: Proveedor) => {
    setProveedores(prev =>
      prev.map(p =>
        p.id === proveedor.id ? { ...p, activo: !p.activo } : p
      )
    );
    showToast(
      `Proveedor ${proveedor.activo ? 'desactivado' : 'activado'} exitosamente`,
      'info'
    );
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Proveedor',
      render: (proveedor: Proveedor) => (
        <div>
          <p>{proveedor.nombre}</p>
          <p className="text-sm text-gray-500">NIT: {proveedor.nit}</p>
        </div>
      ),
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (proveedor: Proveedor) => (
        <div>
          <p className="text-sm">{proveedor.email}</p>
          <p className="text-sm text-gray-500">{proveedor.telefono}</p>
        </div>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (proveedor: Proveedor) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleActivo(proveedor);
          }}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
            ${proveedor.activo ? 'bg-[#A7F3D0]' : 'bg-gray-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
              ${proveedor.activo ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(proveedor);
            }}
            className="p-2 rounded-xl hover:bg-[#93C5FD] hover:bg-opacity-20 transition-colors duration-200"
          >
            <Edit size={18} className="text-[#1e40af]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(proveedor);
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
          <h2>Gestión de Proveedores</h2>
          <p className="text-gray-600 mt-1">Administra tus proveedores</p>
        </div>
        <Button variant="success" onClick={handleAdd}>
          <Plus size={20} />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Table */}
      <Table data={proveedores} columns={columns} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Nombre del proveedor"
            type="text"
            icon={Truck}
            value={nombre}
            onChange={setNombre}
            error={nombreValidation.message}
            isValid={nombreValidation.isValid}
            showValidation={showValidation}
          />

          <FormInput
            label="NIT (9-10 dígitos)"
            type="text"
            icon={FileText}
            value={nit}
            onChange={setNit}
            error={nitValidation.message || nitUniqueValidation.message}
            isValid={nitValidation.isValid && nitUniqueValidation.isValid}
            showValidation={showValidation}
            maxLength={10}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          </div>

          <FormInput
            label="Dirección"
            type="text"
            icon={MapPin}
            value={direccion}
            onChange={setDireccion}
            error={direccionValidation.message}
            isValid={direccionValidation.isValid}
            showValidation={showValidation}
          />

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
            <span className="text-gray-700">Proveedor activo</span>
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
              {editingProveedor ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
