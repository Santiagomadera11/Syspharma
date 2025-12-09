import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Tag, AlertTriangle, GripVertical, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useDarkMode } from '../hooks/useDarkMode';
import { CategoryBadge } from '../components/ui/category-badge';
import { categoriasStorage, Categoria as StorageCategoria } from '../utils/localStorage';

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  productosCount?: number;
  estado: 'Activo' | 'Inactivo' | 'Activa' | 'Inactiva';
  orden?: number;
  createdAt?: string;
}

interface CategoriasProps {
  user: any;
}

const COLORES_PREDEFINIDOS = [
  { nombre: 'Turquesa', valor: '#14B8A6' },
  { nombre: 'Azul', valor: '#0EA5E9' },
  { nombre: 'Índigo', valor: '#6366F1' },
  { nombre: 'Violeta', valor: '#8B5CF6' },
  { nombre: 'Rosa', valor: '#EC4899' },
  { nombre: 'Rojo', valor: '#EF4444' },
  { nombre: 'Naranja', valor: '#F97316' },
  { nombre: 'Amarillo', valor: '#F59E0B' },
  { nombre: 'Lima', valor: '#84CC16' },
  { nombre: 'Verde', valor: '#10B981' },
  { nombre: 'Esmeralda', valor: '#059669' },
  { nombre: 'Cian', valor: '#06B6D4' },
  { nombre: 'Azul Oscuro', valor: '#1E40AF' },
  { nombre: 'Púrpura', valor: '#7C3AED' },
  { nombre: 'Gris', valor: '#6B7280' },
];

export default function Categorias({ user }: CategoriasProps) {
  const { isDark, bgCard, textPrimary, textSecondary, border, inputBg, inputBorder, inputText, modalBg } = useDarkMode();
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  // Cargar categorías desde localStorage
  useEffect(() => {
    const categoriasFromStorage = categoriasStorage.getAll();
    const mapped = categoriasFromStorage.map((c, index) => ({
      ...c,
      estado: c.estado as 'Activo' | 'Inactivo',
      color: c.color || COLORES_PREDEFINIDOS[index % COLORES_PREDEFINIDOS.length].valor,
      productosCount: c.productosCount || 0,
      orden: c.orden || index + 1
    }));
    setCategorias(mapped);
  }, []);

  // Sincronizar cambios con localStorage
  useEffect(() => {
    if (categorias.length > 0 || categoriasStorage.getAll().length > 0) {
      categoriasStorage.save(categorias as StorageCategoria[]);
    }
  }, [categorias]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Categoria | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    color: '#14B8A6',
    activa: true
  });

  const [errors, setErrors] = useState({
    nombre: ''
  });

  const [touched, setTouched] = useState({
    nombre: false
  });

  const validateNombre = (nombre: string) => {
    if (!nombre.trim()) return 'El nombre es requerido';
    if (nombre.length < 2) return 'Mínimo 2 caracteres';
    
    const exists = categorias.some(c => 
      c.nombre.toLowerCase() === nombre.toLowerCase() && 
      c.id !== selectedCategoria?.id
    );
    if (exists) return 'Esta categoría ya existe';
    
    return '';
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'nombre') {
      setErrors({ ...errors, nombre: validateNombre(formData.nombre) });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    
    if (field === 'nombre' && touched.nombre) {
      setErrors({ ...errors, nombre: validateNombre(value as string) });
    }
  };

  const isFormValid = () => {
    if (!formData.nombre) return false;
    const nombreError = validateNombre(formData.nombre);
    return !nombreError;
  };

  const openCreateModal = () => {
    setSelectedCategoria(null);
    setFormData({
      nombre: '',
      color: '#14B8A6',
      activa: true
    });
    setErrors({ nombre: '' });
    setTouched({ nombre: false });
    setModalOpen(true);
  };

  const openEditModal = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setFormData({
      nombre: categoria.nombre,
      color: categoria.color,
      activa: categoria.estado === 'Activa'
    });
    setErrors({ nombre: '' });
    setTouched({ nombre: false });
    setModalOpen(true);
  };

  const openDeleteDialog = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ nombre: true });

    if (!isFormValid()) {
      toast.error('Por favor completa todos los campos correctamente', {
        style: { background: '#EF4444', color: 'white', border: '1px solid #EF4444' }
      });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (selectedCategoria) {
      setCategorias(categorias.map(c => 
        c.id === selectedCategoria.id 
          ? { 
              ...c, 
              nombre: formData.nombre,
              color: formData.color,
              estado: formData.activa ? 'Activa' : 'Inactiva'
            }
          : c
      ));
      toast.success('Categoría actualizada exitosamente', {
        style: { background: '#14B8A6', color: 'white', border: '1px solid #14B8A6' }
      });
    } else {
      const newCategoria: Categoria = {
        id: String(Date.now()),
        nombre: formData.nombre,
        color: formData.color,
        productosCount: 0,
        estado: formData.activa ? 'Activa' : 'Inactiva',
        orden: categorias.length + 1
      };
      setCategorias([...categorias, newCategoria]);
      toast.success('Categoría creada exitosamente', {
        style: { background: '#14B8A6', color: 'white', border: '1px solid #14B8A6' }
      });
    }

    setLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedCategoria) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCategorias(categorias.filter(c => c.id !== selectedCategoria.id));
    
    toast.success('Categoría eliminada exitosamente', {
      style: { background: '#EF4444', color: 'white', border: '1px solid #EF4444' }
    });
    
    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedCategoria(null);
  };

  const toggleEstado = (categoria: Categoria) => {
    const newEstado = categoria.estado === 'Activa' ? 'Inactiva' : 'Activa';
    setCategorias(categorias.map(c => 
      c.id === categoria.id ? { ...c, estado: newEstado } : c
    ));
    
    toast.success(`Categoría ${newEstado === 'Activa' ? 'activada' : 'desactivada'} exitosamente`, {
      style: { 
        background: newEstado === 'Activa' ? '#14B8A6' : '#6B7280', 
        color: 'white', 
        border: `1px solid ${newEstado === 'Activa' ? '#14B8A6' : '#6B7280'}` 
      }
    });
  };

  const ordenarAlfabeticamente = () => {
    const ordenadas = [...categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));
    ordenadas.forEach((cat, index) => {
      cat.orden = index + 1;
    });
    setCategorias(ordenadas);
    toast.success('Categorías ordenadas alfabéticamente', {
      style: { background: '#14B8A6', color: 'white', border: '1px solid #14B8A6' }
    });
  };

  // Drag and drop
  const handleDragStart = (categoria: Categoria) => {
    setDraggedItem(categoria);
  };

  const handleDragOver = (e: React.DragEvent, categoria: Categoria) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === categoria.id) return;

    const items = [...categorias];
    const draggedIndex = items.findIndex(c => c.id === draggedItem.id);
    const targetIndex = items.findIndex(c => c.id === categoria.id);

    items.splice(draggedIndex, 1);
    items.splice(targetIndex, 0, draggedItem);

    items.forEach((cat, index) => {
      cat.orden = index + 1;
    });

    setCategorias(items);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const filteredCategorias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.orden - b.orden);

  // Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const paginatedCategorias = filteredCategorias.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`${textPrimary} transition-colors duration-300`} style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Gestión de Categorías
          </h2>
          <p className={`${textSecondary} mt-1 transition-colors duration-300`} style={{ fontSize: '14px' }}>
            Administra las categorías de productos de tu farmacia
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={ordenarAlfabeticamente}
            className={`h-11 px-4 rounded-xl transition-all ${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Ordenar A-Z
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#14B8A6]" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar categoría..."
            className={`pl-12 h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#14B8A6]`}
          />
        </div>
        {searchTerm && (
          <p className={`${textSecondary} mt-2 text-sm`}>
            Se encontraron {filteredCategorias.length} resultado(s)
          </p>
        )}
      </div>

      {/* Tabla de categorías */}
      <div className={`${bgCard} rounded-xl border ${border} shadow-sm overflow-hidden transition-colors duration-300`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9]">
              <tr>
                <th className="text-left p-4 text-white" style={{ fontWeight: 600, fontSize: '14px', width: '40px' }}>
                  <GripVertical className="w-4 h-4" />
                </th>
                <th className="text-left p-4 text-white" style={{ fontWeight: 600, fontSize: '14px' }}>Nombre</th>
                <th className="text-left p-4 text-white" style={{ fontWeight: 600, fontSize: '14px' }}>Categoría</th>
                <th className="text-left p-4 text-white" style={{ fontWeight: 600, fontSize: '14px' }}>Productos</th>
                <th className="text-left p-4 text-white" style={{ fontWeight: 600, fontSize: '14px' }}>Estado</th>
                <th className="text-center p-4 text-white" style={{ fontWeight: 600, fontSize: '14px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategorias.length === 0 ? (
                <tr>
                  <td colSpan={6} className={`text-center p-8 ${textSecondary}`}>
                    No se encontraron categorías
                  </td>
                </tr>
              ) : (
                paginatedCategorias.map((categoria) => (
                  <tr 
                    key={categoria.id}
                    className={`border-b ${border} transition-all duration-300 ${
                      categoria.estado === 'Inactiva' 
                        ? `${isDark ? 'bg-[#161b22]/50' : 'bg-gray-100/50'} opacity-60` 
                        : 'hover:bg-[#14B8A6] hover:bg-opacity-10'
                    }`}
                  >
                    <td className="p-4">
                      <span className={`${textSecondary} text-sm font-mono`}>{categoria.orden}</span>
                    </td>
                    <td className={`p-4 ${textPrimary}`} style={{ fontSize: '14px', fontWeight: 600 }}>
                      {categoria.nombre}
                    </td>
                    <td className="p-4">
                      <CategoryBadge nombre={categoria.nombre} color={categoria.color} size="md" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-[#161b22]' : 'bg-gray-100'}`}>
                          <span className={textPrimary} style={{ fontSize: '13px', fontWeight: 700 }}>
                            {categoria.productosCount}
                          </span>
                        </div>
                        <span className={textSecondary} style={{ fontSize: '13px' }}>
                          producto{categoria.productosCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={categoria.estado === 'Activa'}
                          onCheckedChange={() => toggleEstado(categoria)}
                          className="data-[state=checked]:bg-[#14B8A6]"
                        />
                        <span 
                          className={`text-sm ${categoria.estado === 'Activa' ? 'text-[#14B8A6]' : textSecondary}`}
                          style={{ fontWeight: 600, fontSize: '13px' }}
                        >
                          {categoria.estado}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => openEditModal(categoria)}
                          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg h-9 px-3 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(categoria)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-9 px-3 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between p-4 border-t ${border}`}>
            <p className={textSecondary} style={{ fontSize: '14px' }}>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredCategorias.length)} de {filteredCategorias.length} categorías
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                  currentPage === 1
                    ? `${isDark ? 'bg-[#161b22] text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 p-0 rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-[#14B8A6] text-white shadow-md'
                      : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`
                  }`}
                  style={{ fontWeight: currentPage === page ? 700 : 500 }}
                >
                  {page}
                </Button>
              ))}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? `${isDark ? 'bg-[#161b22] text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                    : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar Categoría */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className={`${modalBg} sm:max-w-[540px] rounded-xl border-2 ${border}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={textPrimary} style={{ fontSize: '22px', fontWeight: 700 }}>
                  {selectedCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </span>
                <p className={`${textSecondary}`} style={{ fontSize: '13px' }}>Complete la información de la categoría</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Campo Nombre */}
            <div className="space-y-2">
              <label className={`flex items-center gap-2 ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                <Tag className="w-4 h-4" />
                Nombre de la Categoría
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                onBlur={() => handleBlur('nombre')}
                placeholder="Ej: Analgésicos"
                className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                  touched.nombre && errors.nombre 
                    ? 'border-red-500' 
                    : inputBorder
                }`}
              />
              {touched.nombre && errors.nombre && (
                <p className="text-red-500" style={{ fontSize: '12px' }}>{errors.nombre}</p>
              )}
            </div>

            {/* Selector de Color */}
            <div className="space-y-3">
              <label className={`block ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                Color de la Categoría
              </label>
              
              {/* Grid de colores predefinidos */}
              <div className="grid grid-cols-5 gap-2">
                {COLORES_PREDEFINIDOS.map((colorItem) => (
                  <button
                    key={colorItem.valor}
                    type="button"
                    onClick={() => handleChange('color', colorItem.valor)}
                    className={`h-12 rounded-xl transition-all duration-200 hover:scale-105 ${
                      formData.color === colorItem.valor 
                        ? 'ring-3 ring-[#14B8A6] ring-offset-2 scale-105' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    style={{ 
                      backgroundColor: colorItem.valor,
                      boxShadow: formData.color === colorItem.valor ? `0 4px 16px ${colorItem.valor}50` : 'none',
                      ringOffsetColor: isDark ? '#0d1117' : '#ffffff'
                    }}
                    title={colorItem.nombre}
                  />
                ))}
              </div>

              {/* Color personalizado */}
              <div className="space-y-2 pt-1">
                <label className={`block ${textSecondary}`} style={{ fontSize: '12px' }}>
                  O elige un color personalizado
                </label>
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="h-11 w-full rounded-xl cursor-pointer border-2 border-gray-300 dark:border-gray-700"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => handleChange('color', e.target.value)}
                    placeholder="#14B8A6"
                    className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  />
                </div>
              </div>

              {/* Preview del badge */}
              <div className={`p-4 rounded-xl border-2 border-dashed ${border}`}>
                <p className={`${textSecondary} mb-2`} style={{ fontSize: '12px', fontWeight: 500 }}>Vista previa:</p>
                <CategoryBadge 
                  nombre={formData.nombre || 'Ejemplo'} 
                  color={formData.color}
                  size="lg"
                />
              </div>
            </div>

            {/* Toggle Activa */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#161b22]' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <label className={`block ${textPrimary} mb-1`} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Categoría activa
                  </label>
                  <p className={`${textSecondary}`} style={{ fontSize: '12px' }}>
                    Las categorías inactivas no aparecerán en los formularios
                  </p>
                </div>
                <Switch
                  checked={formData.activa}
                  onCheckedChange={(checked) => handleChange('activa', checked)}
                  className="data-[state=checked]:bg-[#14B8A6] shrink-0"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`h-12 rounded-xl ${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#374151]'} transition-all duration-200`}
                style={{ fontWeight: 600, fontSize: '14px' }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className={`h-12 rounded-xl transition-all duration-300 ${
                  isFormValid() && !loading
                    ? 'bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl'
                    : `${isDark ? 'bg-[#161b22] text-gray-600' : 'bg-gray-300 text-gray-500'} cursor-not-allowed`
                }`}
                style={{ fontWeight: 600, fontSize: '14px' }}
              >
                {loading ? 'Guardando...' : selectedCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${modalBg} rounded-xl border-2 ${border}`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-red-600" style={{ fontSize: '22px', fontWeight: 700 }}>
                ¿Eliminar categoría?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className={`${textSecondary} ml-16`} style={{ fontSize: '14px' }}>
              Los productos asociados ({selectedCategoria?.productosCount || 0}) pasarán a categoría "Sin categoría". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className={`h-11 rounded-xl ${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white border-0' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`} style={{ fontWeight: 600 }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg"
              style={{ fontWeight: 600 }}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}