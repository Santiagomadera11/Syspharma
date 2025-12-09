import { useState } from 'react';
import { Plus, Edit, Trash2, Briefcase, Clock, DollarSign } from 'lucide-react';
import { Table } from '../common/Table';
import { Modal } from '../common/Modal';
import { FormInput } from '../FormInput';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { Servicio } from '../../types';
import { validateRequired, validateNumber } from '../../utils/validation';

export const Servicios = () => {
  const [servicios, setServicios] = useState<Servicio[]>([
    {
      id: '1',
      nombre: 'Consulta Médica General',
      descripcion: 'Consulta médica general con especialista',
      duracion: 30,
      precio: 50000,
      activo: true,
    },
    {
      id: '2',
      nombre: 'Aplicación de Inyecciones',
      descripcion: 'Servicio de aplicación de medicamentos inyectables',
      duracion: 15,
      precio: 15000,
      activo: true,
    },
    {
      id: '3',
      nombre: 'Toma de Presión Arterial',
      descripcion: 'Medición de presión arterial',
      duracion: 10,
      precio: 5000,
      activo: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Form fields
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState('');
  const [precio, setPrecio] = useState('');
  const [activo, setActivo] = useState(true);

  const { showToast } = useToast();

  // Validations
  const nombreValidation = validateRequired(nombre, 'El nombre');
  const duracionValidation = validateNumber(duracion, 0);
  const precioValidation = validateNumber(precio, 0);

  const isFormValid =
    nombreValidation.isValid &&
    duracionValidation.isValid &&
    precioValidation.isValid;

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setDuracion('');
    setPrecio('');
    setActivo(true);
    setShowValidation(false);
    setEditingServicio(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setNombre(servicio.nombre);
    setDescripcion(servicio.descripcion);
    setDuracion(servicio.duracion.toString());
    setPrecio(servicio.precio.toString());
    setActivo(servicio.activo);
    setShowValidation(false);
    setIsModalOpen(true);
  };

  const handleDelete = (servicio: Servicio) => {
    if (confirm(`¿Estás seguro de eliminar ${servicio.nombre}?`)) {
      setServicios(prev => prev.filter(s => s.id !== servicio.id));
      showToast('Servicio eliminado exitosamente', 'success');
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

      if (editingServicio) {
        setServicios(prev =>
          prev.map(s =>
            s.id === editingServicio.id
              ? {
                  ...s,
                  nombre,
                  descripcion,
                  duracion: parseInt(duracion),
                  precio: parseFloat(precio),
                  activo,
                }
              : s
          )
        );
        showToast('Servicio actualizado exitosamente', 'success');
      } else {
        const newServicio: Servicio = {
          id: Math.random().toString(36).substr(2, 9),
          nombre,
          descripcion,
          duracion: parseInt(duracion),
          precio: parseFloat(precio),
          activo,
        };
        setServicios(prev => [...prev, newServicio]);
        showToast('Servicio creado exitosamente', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al guardar servicio', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = (servicio: Servicio) => {
    setServicios(prev =>
      prev.map(s =>
        s.id === servicio.id ? { ...s, activo: !s.activo } : s
      )
    );
    showToast(
      `Servicio ${servicio.activo ? 'desactivado' : 'activado'} exitosamente`,
      'info'
    );
  };

  const columns = [
    {
      key: 'nombre',
      label: 'Servicio',
      render: (servicio: Servicio) => (
        <div>
          <p>{servicio.nombre}</p>
          <p className="text-sm text-gray-500">{servicio.descripcion}</p>
        </div>
      ),
    },
    {
      key: 'duracion',
      label: 'Duración',
      render: (servicio: Servicio) => (
        <span>{servicio.duracion} min</span>
      ),
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (servicio: Servicio) => (
        <span>${servicio.precio.toLocaleString('es-CO')}</span>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (servicio: Servicio) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleActivo(servicio);
          }}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
            ${servicio.activo ? 'bg-[#A7F3D0]' : 'bg-gray-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
              ${servicio.activo ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (servicio: Servicio) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(servicio);
            }}
            className="p-2 rounded-xl hover:bg-[#93C5FD] hover:bg-opacity-20 transition-colors duration-200"
          >
            <Edit size={18} className="text-[#1e40af]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(servicio);
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
          <h2>Gestión de Servicios</h2>
          <p className="text-gray-600 mt-1">Administra los servicios ofrecidos</p>
        </div>
        <Button variant="success" onClick={handleAdd}>
          <Plus size={20} />
          Nuevo Servicio
        </Button>
      </div>

      {/* Table */}
      <Table data={servicios} columns={columns} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="Nombre del servicio"
            type="text"
            icon={Briefcase}
            value={nombre}
            onChange={setNombre}
            error={nombreValidation.message}
            isValid={nombreValidation.isValid}
            showValidation={showValidation}
          />

          <FormInput
            label="Descripción"
            type="text"
            value={descripcion}
            onChange={setDescripcion}
            showValidation={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Duración (minutos)"
              type="number"
              icon={Clock}
              value={duracion}
              onChange={setDuracion}
              error={duracionValidation.message}
              isValid={duracionValidation.isValid}
              showValidation={showValidation}
            />

            <FormInput
              label="Precio"
              type="number"
              icon={DollarSign}
              value={precio}
              onChange={setPrecio}
              error={precioValidation.message}
              isValid={precioValidation.isValid}
              showValidation={showValidation}
            />
          </div>

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
            <span className="text-gray-700">Servicio activo</span>
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
              {editingServicio ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
