import { useState } from 'react';
import { Plus, Edit, Trash2, Package, DollarSign, Hash, Layers } from 'lucide-react';
import { Table } from '../common/Table';
import { Modal } from '../common/Modal';
import { FormInput } from '../FormInput';
import { FormSelect } from '../common/FormSelect';
import { Button } from '../Button';
import { useToast } from '../../contexts/ToastContext';
import { Producto } from '../../types';
import { useDarkMode } from '../../hooks/useDarkMode';
import {
  validateRequired,
  validateNumber,
  validateStock,
  validateUniqueCode,
} from '../../utils/validation';

export const Productos = () => {
  const { isDark, bgCard, textPrimary, textSecondary, border } = useDarkMode();
  const [productos, setProductos] = useState<Producto[]>([
    {
      id: '1',
      codigo: 'MED001',
      nombre: 'Paracetamol 500mg',
      descripcion: 'Analgésico y antipirético',
      precio: 2500,
      precioCompra: 1500,
      stock: 150,
      stockMinimo: 50,
      proveedorId: '1',
      categoria: 'Analgésicos',
      activo: true,
    },
    {
      id: '2',
      codigo: 'MED002',
      nombre: 'Ibuprofeno 400mg',
      descripcion: 'Antiinflamatorio no esteroideo',
      precio: 3200,
      precioCompra: 2000,
      stock: 85,
      stockMinimo: 30,
      proveedorId: '1',
      categoria: 'Antiinflamatorios',
      activo: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Form fields
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [stock, setStock] = useState('');
  const [stockMinimo, setStockMinimo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [activo, setActivo] = useState(true);

  const { showToast } = useToast();

  // Validations
  const existingCodes = productos
    .filter(p => p.id !== editingProduct?.id)
    .map(p => p.codigo);
  
  const codigoValidation = validateUniqueCode(codigo, existingCodes);
  const nombreValidation = validateRequired(nombre, 'El nombre');
  const precioValidation = validateNumber(precio, 0);
  const precioCompraValidation = validateNumber(precioCompra, 0);
  const stockValidation = validateStock(stock, 0);
  const stockMinimoValidation = validateStock(stockMinimo, 0);
  const categoriaValidation = validateRequired(categoria, 'La categoría');

  const isFormValid =
    codigoValidation.isValid &&
    nombreValidation.isValid &&
    precioValidation.isValid &&
    precioCompraValidation.isValid &&
    stockValidation.isValid &&
    stockMinimoValidation.isValid &&
    categoriaValidation.isValid;

  const resetForm = () => {
    setCodigo('');
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setPrecioCompra('');
    setStock('');
    setStockMinimo('');
    setCategoria('');
    setActivo(true);
    setShowValidation(false);
    setEditingProduct(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setCodigo(product.codigo);
    setNombre(product.nombre);
    setDescripcion(product.descripcion);
    setPrecio(product.precio.toString());
    setPrecioCompra(product.precioCompra.toString());
    setStock(product.stock.toString());
    setStockMinimo(product.stockMinimo.toString());
    setCategoria(product.categoria);
    setActivo(product.activo);
    setShowValidation(false);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Producto) => {
    if (confirm(`¿Estás seguro de eliminar ${product.nombre}?`)) {
      setProductos(prev => prev.filter(p => p.id !== product.id));
      showToast('Producto eliminado exitosamente', 'success');
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

      if (editingProduct) {
        setProductos(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  codigo,
                  nombre,
                  descripcion,
                  precio: parseFloat(precio),
                  precioCompra: parseFloat(precioCompra),
                  stock: parseInt(stock),
                  stockMinimo: parseInt(stockMinimo),
                  categoria,
                  activo,
                }
              : p
          )
        );
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        const newProduct: Producto = {
          id: Math.random().toString(36).substr(2, 9),
          codigo,
          nombre,
          descripcion,
          precio: parseFloat(precio),
          precioCompra: parseFloat(precioCompra),
          stock: parseInt(stock),
          stockMinimo: parseInt(stockMinimo),
          proveedorId: '1',
          categoria,
          activo,
        };
        setProductos(prev => [...prev, newProduct]);
        showToast('Producto creado exitosamente', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error al guardar producto', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivo = (product: Producto) => {
    setProductos(prev =>
      prev.map(p =>
        p.id === product.id ? { ...p, activo: !p.activo } : p
      )
    );
    showToast(
      `Producto ${product.activo ? 'desactivado' : 'activado'} exitosamente`,
      'info'
    );
  };

  const columns = [
    {
      key: 'codigo',
      label: 'Código',
      render: (product: Producto) => (
        <span className="font-mono text-sm">{product.codigo}</span>
      ),
    },
    {
      key: 'nombre',
      label: 'Producto',
      render: (product: Producto) => (
        <div>
          <p>{product.nombre}</p>
          <p className="text-sm text-gray-500">{product.categoria}</p>
        </div>
      ),
    },
    {
      key: 'precio',
      label: 'Precio',
      render: (product: Producto) => (
        <span>${product.precio.toLocaleString('es-CO')}</span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product: Producto) => {
        const percentage = (product.stock / product.stockMinimo) * 100;
        const isLow = percentage <= 100;
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'text-[#9f1239]' : ''}>{product.stock}</span>
            {isLow && (
              <span className="text-xs bg-[#FBCFE8] text-[#9f1239] px-2 py-0.5 rounded-full">
                Bajo
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (product: Producto) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleActivo(product);
          }}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
            ${product.activo ? 'bg-[#A7F3D0]' : 'bg-gray-300'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
              ${product.activo ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      ),
    },
    {
      key: 'acciones',
      label: 'Acciones',
      render: (product: Producto) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(product);
            }}
            className="p-2 rounded-xl hover:bg-[#93C5FD] hover:bg-opacity-20 transition-colors duration-200"
          >
            <Edit size={18} className="text-[#1e40af]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(product);
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
          <h2 className={`${textPrimary} transition-colors duration-300`}>Gestión de Productos</h2>
          <p className={`${textSecondary} mt-1 transition-colors duration-300`}>Administra el inventario de productos</p>
        </div>
        <Button variant="success" onClick={handleAdd}>
          <Plus size={20} />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${bgCard} rounded-2xl p-6 shadow-sm ${border} border transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <Package size={24} className="text-[#93C5FD]" />
            <span className={`${textSecondary} transition-colors duration-300`}>Total Productos</span>
          </div>
          <h3 className={`${textPrimary} transition-colors duration-300`}>{productos.length}</h3>
        </div>
        <div className={`${bgCard} rounded-2xl p-6 shadow-sm ${border} border transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <DollarSign size={24} className="text-[#A7F3D0]" />
            <span className={`${textSecondary} transition-colors duration-300`}>Valor Inventario</span>
          </div>
          <h3 className={`${textPrimary} transition-colors duration-300`}>
            ${productos.reduce((sum, p) => sum + p.precio * p.stock, 0).toLocaleString('es-CO')}
          </h3>
        </div>
        <div className={`${bgCard} rounded-2xl p-6 shadow-sm ${border} border transition-all duration-300`}>
          <div className="flex items-center gap-3 mb-2">
            <Layers size={24} className="text-[#FBCFE8]" />
            <span className={`${textSecondary} transition-colors duration-300`}>Stock Bajo</span>
          </div>
          <h3 className={`${textPrimary} transition-colors duration-300`}>
            {productos.filter(p => p.stock <= p.stockMinimo).length}
          </h3>
        </div>
      </div>

      {/* Table */}
      <Table data={productos} columns={columns} />

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Código del producto"
              type="text"
              icon={Hash}
              value={codigo}
              onChange={setCodigo}
              error={codigoValidation.message}
              isValid={codigoValidation.isValid}
              showValidation={showValidation}
            />

            <FormSelect
              label="Categoría"
              icon={Layers}
              value={categoria}
              onChange={setCategoria}
              error={categoriaValidation.message}
              isValid={categoriaValidation.isValid}
              showValidation={showValidation}
              options={[
                { value: 'Analgésicos', label: 'Analgésicos' },
                { value: 'Antiinflamatorios', label: 'Antiinflamatorios' },
                { value: 'Antibióticos', label: 'Antibióticos' },
                { value: 'Vitaminas', label: 'Vitaminas' },
                { value: 'Otros', label: 'Otros' },
              ]}
            />
          </div>

          <FormInput
            label="Nombre del producto"
            type="text"
            icon={Package}
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
              label="Precio de compra"
              type="number"
              icon={DollarSign}
              value={precioCompra}
              onChange={setPrecioCompra}
              error={precioCompraValidation.message}
              isValid={precioCompraValidation.isValid}
              showValidation={showValidation}
            />

            <FormInput
              label="Precio de venta"
              type="number"
              icon={DollarSign}
              value={precio}
              onChange={setPrecio}
              error={precioValidation.message}
              isValid={precioValidation.isValid}
              showValidation={showValidation}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Stock actual"
              type="number"
              value={stock}
              onChange={setStock}
              error={stockValidation.message}
              isValid={stockValidation.isValid}
              showValidation={showValidation}
            />

            <FormInput
              label="Stock mínimo"
              type="number"
              value={stockMinimo}
              onChange={setStockMinimo}
              error={stockMinimoValidation.message}
              isValid={stockMinimoValidation.isValid}
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
            <span className="text-gray-700">Producto activo</span>
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
              {editingProduct ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
