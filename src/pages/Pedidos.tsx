import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Calendar, User, ShoppingCart, CheckCircle, Clock, XCircle, AlertCircle, Truck, X, DollarSign, Filter, CreditCard, Bell, Loader2, Minus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
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
import { PaginationCustom } from '../components/ui/pagination-custom';
import { motion, AnimatePresence } from 'motion/react';
import { pedidosStorage, productosStorage, categoriasStorage } from '../utils/localStorage';

interface ProductoPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  subtotal: number;
}

interface Pedido {
  id: string;
  codigo: string;
  fecha: Date;
  tipoDocumento: string;
  numeroDocumento: string;
  cliente: string;
  productos: ProductoPedido[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: 'Pendiente' | 'En Proceso' | 'Entregado' | 'Cancelado';
  notas?: string;
  historial: {
    estado: string;
    fecha: Date;
  }[];
}

interface PedidosProps {
  user: any;
}

const productosDisponibles = [
  { id: '1', nombre: 'Acetaminofén 500mg', precio: 2500, categoria: 'Analgésicos' },
  { id: '2', nombre: 'Ibuprofeno 400mg', precio: 3200, categoria: 'Analgésicos' },
  { id: '3', nombre: 'Amoxicilina 500mg', precio: 8500, categoria: 'Antibióticos' },
  { id: '4', nombre: 'Loratadina 10mg', precio: 4500, categoria: 'Antialérgicos' },
  { id: '5', nombre: 'Omeprazol 20mg', precio: 5800, categoria: 'Antiácidos' },
  { id: '6', nombre: 'Metformina 850mg', precio: 6200, categoria: 'Diabetes' },
  { id: '7', nombre: 'Atorvastatina 20mg', precio: 12500, categoria: 'Cardiovascular' },
  { id: '8', nombre: 'Losartán 50mg', precio: 9800, categoria: 'Cardiovascular' },
  { id: '9', nombre: 'Vitamina C 1000mg', precio: 15000, categoria: 'Vitaminas' },
  { id: '10', nombre: 'Complejo B', precio: 18500, categoria: 'Vitaminas' },
  { id: '11', nombre: 'Azitromicina 500mg', precio: 12000, categoria: 'Antibióticos' },
  { id: '12', nombre: 'Clonazepam 2mg', precio: 7500, categoria: 'Ansiolíticos' },
];

const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'Pasaporte', 'NIT'];
const CATEGORIAS = ['Todas', 'Analgésicos', 'Antibióticos', 'Antialérgicos', 'Antiácidos', 'Diabetes', 'Cardiovascular', 'Vitaminas', 'Ansiolíticos'];

// Generar pedidos de ejemplo
const generarPedidosEjemplo = (): Pedido[] => {
  const pedidos: Pedido[] = [];
  const nombres = ['Laura Fernández', 'Roberto Díaz', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Ramírez', 'Sofia Torres', 'Juan Vargas', 'Carmen Ruiz', 'Diego Morales', 'Valentina Castro', 'Andrés Silva', 'Isabella Romero', 'Santiago Mendoza', 'Camila Herrera'];
  const documentos = ['1020304050', '1030405060', '1040506070', '1050607080', '1060708090', '1070809000', '1080900010', '1090001020', '1100102030', '1110203040', '1120304050', '1130405060', '1140506070', '1150607080', '1160708090'];
  const estados: Array<'Pendiente' | 'En Proceso' | 'Entregado' | 'Cancelado'> = ['Pendiente', 'Pendiente', 'En Proceso', 'Entregado', 'Pendiente', 'Entregado', 'En Proceso', 'Entregado', 'Cancelado'];
  
  for (let i = 0; i < 25; i++) {
    const cantidadProductos = Math.floor(Math.random() * 3) + 1;
    const productosSeleccionados: ProductoPedido[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < cantidadProductos; j++) {
      const producto = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1;
      const descuento = Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0;
      const subtotalProd = producto.precio * cantidad * (1 - descuento / 100);
      
      productosSeleccionados.push({
        id: `${i}-${j}`,
        nombre: producto.nombre,
        cantidad,
        precioUnitario: producto.precio,
        descuentoPorcentaje: descuento,
        subtotal: subtotalProd
      });
      
      subtotal += subtotalProd;
    }
    
    const descuento = productosSeleccionados.reduce((sum, p) => 
      sum + (p.precioUnitario * p.cantidad * p.descuentoPorcentaje / 100), 0);
    const iva = Math.round(subtotal * 0.16);
    const total = subtotal + iva;
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    const fecha = new Date(2025, 11, Math.floor(i / 3) + 1, 9 + (i % 8), 30);
    
    pedidos.push({
      id: String(i + 1),
      codigo: `PED-2025-${String(i + 1).padStart(4, '0')}`,
      fecha,
      tipoDocumento: 'CC',
      numeroDocumento: documentos[i % documentos.length],
      cliente: nombres[i % nombres.length],
      productos: productosSeleccionados,
      subtotal,
      descuento,
      iva,
      total,
      estado,
      historial: [
        { estado: 'Pendiente', fecha },
        ...(estado !== 'Pendiente' ? [{ estado, fecha: new Date(fecha.getTime() + 3600000) }] : [])
      ]
    });
  }
  
  return pedidos;
};

export default function Pedidos({ user }: PedidosProps) {
  const { isDark } = useDarkMode();

  // Clases de estilos
  const bgPrimary = isDark ? 'bg-[#1a1d2e]' : 'bg-white';
  const bgCard = isDark ? 'bg-[#22262e]' : 'bg-white';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDark ? 'bg-[#1a1d2e]' : 'bg-white';
  const inputBorder = isDark ? 'border-gray-600' : 'border-gray-300';
  const inputText = isDark ? 'text-gray-100' : 'text-gray-900';

  // Estados principales
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productosReales, setProductosReales] = useState<any[]>([]);
  
  // Cargar categorías y productos
  useEffect(() => {
    const categoriasFromStorage = categoriasStorage.getAll();
    const categoriasActivas = categoriasFromStorage.filter(c => c.estado === 'Activa' || c.estado === 'Activo');
    setCategorias(categoriasActivas);
    
    const productosFromStorage = productosStorage.getAll();
    const productosActivos = productosFromStorage.filter(p => p.estado === 'Activo');
    setProductosReales(productosActivos);
  }, []);
  
  // Cargar pedidos desde localStorage al montar
  useEffect(() => {
    const storedPedidos = pedidosStorage.getAll();
    if (storedPedidos.length > 0) {
      // Convertir las fechas string a Date y adaptar la estructura
      const pedidosConFechas = storedPedidos.map(p => ({
        id: p.id,
        codigo: `PED-${p.id.slice(0, 8)}`,
        fecha: new Date(p.fecha),
        tipoDocumento: 'CC',
        numeroDocumento: '1234567890',
        cliente: p.clienteNombre,
        productos: p.productos.map(prod => ({
          id: prod.productoId,
          nombre: prod.nombre,
          cantidad: prod.cantidad,
          precioUnitario: prod.precio,
          descuentoPorcentaje: 0,
          subtotal: prod.cantidad * prod.precio
        })),
        subtotal: p.subtotal,
        descuento: p.descuento,
        iva: p.iva,
        total: p.total,
        estado: p.estado,
        notas: p.notas,
        historial: [{
          estado: p.estado,
          fecha: new Date(p.createdAt)
        }]
      })) as Pedido[];
      setPedidos(pedidosConFechas);
    }
    // No cargar datos de ejemplo, solo mostrar pedidos registrados
  }, []);

  // Guardar en localStorage cuando cambien los pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      const pedidosParaGuardar = pedidos.map(p => ({
        id: p.id,
        fecha: p.fecha.toISOString(),
        clienteId: p.id,
        clienteNombre: p.cliente,
        productos: p.productos.map(prod => ({
          productoId: prod.id,
          nombre: prod.nombre,
          cantidad: prod.cantidad,
          precio: prod.precioUnitario,
          requiereReceta: false
        })),
        subtotal: p.subtotal,
        descuento: p.descuento,
        iva: p.iva,
        total: p.total,
        estado: p.estado,
        notas: p.notas,
        createdAt: p.fecha.toISOString()
      }));
      pedidosStorage.save(pedidosParaGuardar);
    }
  }, [pedidos]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales y estados
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [busquedaRapida, setBusquedaRapida] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Formulario
  const [formData, setFormData] = useState({
    tipoDocumento: 'CC',
    numeroDocumento: '',
    cliente: '',
    productos: [] as ProductoPedido[],
    descuentoPorcentaje: 0,
    ivaPorcentaje: 16,
    notas: '',
    estado: 'Pendiente' as 'Pendiente' | 'En Proceso' | 'Entregado' | 'Cancelado'
  });

  // Búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');

  // Notificación de pedidos pendientes
  useEffect(() => {
    const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length;
    if (pendientes > 0) {
      setTimeout(() => {
        toast.info(`Tienes ${pendientes} pedido${pendientes > 1 ? 's' : ''} pendiente${pendientes > 1 ? 's' : ''}`, {
          duration: 5000,
          style: { background: '#EAB308', color: 'white', border: '1px solid #EAB308' }
        });
      }, 500);
    }
  }, []);

  // Generar código de pedido
  const generarCodigoPedido = () => {
    const año = new Date().getFullYear();
    const numero = String(pedidos.length + 1).padStart(4, '0');
    return `PED-${año}-${numero}`;
  };

  // Productos filtrados
  const productosParaMostrar = productosReales.length > 0 ? productosReales : productosDisponibles;
  
  const productosFiltrados = productosParaMostrar.filter(p => {
    const nombreProducto = p.nombre || p.nombreComercial || '';
    const coincideNombre = nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
                          (p.codigo && p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()));
    const coincideCategoria = categoriaFiltro === 'Todas' || p.categoriaId === categoriaFiltro || p.categoria === categoriaFiltro;
    return coincideNombre && coincideCategoria;
  });

  // Agregar producto al carrito
  const agregarProducto = (producto: typeof productosDisponibles[0]) => {
    const productoExistente = formData.productos.find(p => p.id === producto.id);
    
    if (productoExistente) {
      // Si ya existe, aumentar cantidad
      const nuevosProductos = formData.productos.map(p =>
        p.id === producto.id
          ? { 
              ...p, 
              cantidad: p.cantidad + 1, 
              subtotal: (p.cantidad + 1) * p.precioUnitario * (1 - p.descuentoPorcentaje / 100)
            }
          : p
      );
      setFormData({ ...formData, productos: nuevosProductos });
      toast.success('Cantidad actualizada', {
        style: { background: '#14B8A6', color: 'white' }
      });
    } else {
      // Si no existe, agregar nuevo
      const nuevoProducto: ProductoPedido = {
        id: producto.id,
        nombre: producto.nombre || producto.nombreComercial || 'Producto sin nombre',
        precioUnitario: producto.precio,
        cantidad: 1,
        descuentoPorcentaje: 0,
        subtotal: producto.precio
      };
      setFormData({ ...formData, productos: [...formData.productos, nuevoProducto] });
      toast.success('Producto agregado al carrito', {
        style: { background: '#14B8A6', color: 'white' }
      });
    }
    
    setBusquedaProducto('');
  };

  // Actualizar cantidad de producto en carrito
  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return;
    
    const nuevosProductos = formData.productos.map(p =>
      p.id === id
        ? { 
            ...p, 
            cantidad, 
            subtotal: cantidad * p.precioUnitario * (1 - p.descuentoPorcentaje / 100)
          }
        : p
    );
    setFormData({ ...formData, productos: nuevosProductos });
  };

  // Actualizar descuento de producto
  const actualizarDescuento = (id: string, descuento: number) => {
    if (descuento < 0 || descuento > 100) return;
    
    const nuevosProductos = formData.productos.map(p =>
      p.id === id
        ? { 
            ...p, 
            descuentoPorcentaje: descuento,
            subtotal: p.cantidad * p.precioUnitario * (1 - descuento / 100)
          }
        : p
    );
    setFormData({ ...formData, productos: nuevosProductos });
  };

  // Eliminar producto del carrito
  const eliminarProducto = (id: string) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter(p => p.id !== id)
    });
    toast.success('Producto eliminado del carrito', {
      style: { background: '#14B8A6', color: 'white' }
    });
  };

  // Cálculos
  const calcularSubtotal = () => {
    return formData.productos.reduce((sum, p) => sum + (p.precioUnitario * p.cantidad), 0);
  };

  const calcularDescuentoTotal = () => {
    return formData.productos.reduce((sum, p) => 
      sum + (p.precioUnitario * p.cantidad * p.descuentoPorcentaje / 100), 0);
  };

  const calcularIva = () => {
    const baseImponible = formData.productos.reduce((sum, p) => sum + p.subtotal, 0);
    return baseImponible * (formData.ivaPorcentaje / 100);
  };

  const calcularTotal = () => {
    const baseImponible = formData.productos.reduce((sum, p) => sum + p.subtotal, 0);
    const iva = calcularIva();
    return baseImponible + iva;
  };

  // Abrir modal de nuevo pedido
  const abrirModalNuevo = () => {
    setSelectedPedido(null);
    setFormData({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      cliente: '',
      productos: [],
      descuentoPorcentaje: 0,
      ivaPorcentaje: 16,
      notas: '',
      estado: 'Pendiente'
    });
    setBusquedaProducto('');
    setCategoriaFiltro('Todas');
    setModalOpen(true);
  };

  // Abrir modal de edición
  const abrirModalEdicion = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setFormData({
      tipoDocumento: pedido.tipoDocumento,
      numeroDocumento: pedido.numeroDocumento,
      cliente: pedido.cliente,
      productos: [...pedido.productos],
      descuentoPorcentaje: (pedido.descuento / pedido.subtotal) * 100 || 0,
      ivaPorcentaje: (pedido.iva / (pedido.subtotal - pedido.descuento)) * 100 || 16,
      notas: pedido.notas || '',
      estado: pedido.estado
    });
    setBusquedaProducto('');
    setCategoriaFiltro('Todas');
    setModalOpen(true);
  };

  // Guardar pedido
  const guardarPedido = async () => {
    // Validaciones
    if (!formData.numeroDocumento.trim()) {
      toast.error('El número de documento es obligatorio', {
        style: { background: '#EF4444', color: 'white' }
      });
      return;
    }

    if (!formData.cliente.trim()) {
      toast.error('El nombre del cliente es obligatorio', {
        style: { background: '#EF4444', color: 'white' }
      });
      return;
    }

    if (formData.productos.length === 0) {
      toast.error('Debes agregar al menos un producto', {
        style: { background: '#EF4444', color: 'white' }
      });
      return;
    }

    setLoading(true);

    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));

    const subtotal = calcularSubtotal();
    const descuento = calcularDescuentoTotal();
    const iva = calcularIva();
    const total = calcularTotal();

    if (selectedPedido) {
      // Actualizar pedido existente
      const pedidoActualizado: Pedido = {
        ...selectedPedido,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        cliente: formData.cliente,
        productos: formData.productos,
        subtotal,
        descuento,
        iva,
        total,
        estado: formData.estado,
        notas: formData.notas,
        historial: [
          ...selectedPedido.historial,
          ...(selectedPedido.estado !== formData.estado ? [{
            estado: formData.estado,
            fecha: new Date()
          }] : [])
        ]
      };

      setPedidos(pedidos.map(p => p.id === selectedPedido.id ? pedidoActualizado : p));
      
      toast.success('Pedido actualizado exitosamente', {
        style: { background: '#14B8A6', color: 'white' }
      });
    } else {
      // Crear nuevo pedido
      const nuevoPedido: Pedido = {
        id: String(Date.now()),
        codigo: generarCodigoPedido(),
        fecha: new Date(),
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        cliente: formData.cliente,
        productos: formData.productos,
        subtotal,
        descuento,
        iva,
        total,
        estado: formData.estado,
        notas: formData.notas,
        historial: [{
          estado: formData.estado,
          fecha: new Date()
        }]
      };

      setPedidos([nuevoPedido, ...pedidos]);
      
      toast.success('Pedido creado exitosamente', {
        style: { background: '#14B8A6', color: 'white' }
      });
    }

    setLoading(false);
    setModalOpen(false);
  };

  // Ver detalle
  const verDetalle = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setDetalleModalOpen(true);
  };

  // Abrir diálogo de eliminación
  const abrirDialogoEliminar = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setDeleteDialogOpen(true);
  };

  // Eliminar pedido
  const eliminarPedido = () => {
    if (!selectedPedido) return;
    
    setPedidos(pedidos.filter(p => p.id !== selectedPedido.id));
    setDeleteDialogOpen(false);
    
    toast.success('Pedido eliminado exitosamente', {
      style: { background: '#14B8A6', color: 'white' }
    });
  };

  // Búsqueda rápida por código
  const buscarPorCodigo = () => {
    if (!busquedaRapida.trim()) return;
    
    const pedido = pedidos.find(p => 
      p.codigo.toLowerCase().includes(busquedaRapida.toLowerCase())
    );
    
    if (pedido) {
      verDetalle(pedido);
      setBusquedaRapida('');
    } else {
      toast.error('No se encontró ningún pedido con ese código', {
        style: { background: '#EF4444', color: 'white' }
      });
    }
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = 
      pedido.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.numeroDocumento.includes(searchTerm);
    
    const coincideEstado = filtroEstado === 'Todos' || pedido.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });

  // Paginación
  const totalPaginas = Math.ceil(pedidosFiltrados.length / itemsPerPage);
  const pedidosPaginados = pedidosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obtener color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-500';
      case 'En Proceso':
        return 'bg-blue-500';
      case 'Entregado':
        return 'bg-green-500';
      case 'Cancelado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obtener ícono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
        return <Clock className="w-4 h-4" />;
      case 'En Proceso':
        return <Truck className="w-4 h-4" />;
      case 'Entregado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`min-h-screen ${bgPrimary} p-8`}>
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`${textPrimary} mb-2`} style={{ fontSize: '32px', fontWeight: 700 }}>
              Gestión de Pedidos
            </h1>
            <p className={textSecondary} style={{ fontSize: '16px' }}>
              Administra y realiza seguimiento de todos los pedidos
            </p>
          </div>
          
          <Button
            onClick={abrirModalNuevo}
            className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0D9488] hover:to-[#0284C7] text-white rounded-2xl h-14 px-8 shadow-lg"
            style={{ fontSize: '15px', fontWeight: 600 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Pedido
          </Button>
        </div>

        {/* Búsqueda rápida */}
        <div className={`${bgCard} rounded-3xl p-6 border-2 ${border} shadow-lg`}>
          <h3 className={`${textPrimary} mb-4`} style={{ fontSize: '18px', fontWeight: 700 }}>
            Búsqueda Rápida
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
              <Input
                type="text"
                placeholder="Buscar por código..."
                value={busquedaRapida}
                onChange={(e) => setBusquedaRapida(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    buscarPorCodigo();
                  }
                }}
                className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                style={{ fontSize: '14px' }}
              />
            </div>
            <Button
              onClick={buscarPorCodigo}
              className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-12 px-8"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
            <Input
              type="text"
              placeholder="Buscar por código, cliente o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-12 h-14 rounded-2xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              style={{ fontSize: '15px' }}
            />
          </div>

          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className={`w-64 h-14 rounded-2xl border-2 ${inputBorder} ${inputBg} ${inputText}`}>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                <SelectValue placeholder="Filtrar por estado" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Proceso">En Proceso</SelectItem>
              <SelectItem value="Entregado">Entregado</SelectItem>
              <SelectItem value="Cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla de pedidos */}
        <div className={`${bgCard} rounded-3xl border-2 ${border} shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-[#1a1d2e]' : 'bg-gray-50'}>
                <tr>
                  <th className={`${textPrimary} text-left p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Código
                  </th>
                  <th className={`${textPrimary} text-left p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Cliente
                  </th>
                  <th className={`${textPrimary} text-left p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Documento
                  </th>
                  <th className={`${textPrimary} text-left p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Fecha
                  </th>
                  <th className={`${textPrimary} text-left p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Productos
                  </th>
                  <th className={`${textPrimary} text-right p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Total
                  </th>
                  <th className={`${textPrimary} text-center p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Estado
                  </th>
                  <th className={`${textPrimary} text-center p-6`} style={{ fontSize: '14px', fontWeight: 700 }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pedidosPaginados.map((pedido, index) => (
                  <motion.tr
                    key={pedido.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-t ${border} hover:bg-[#14B8A6] hover:bg-opacity-5 transition-colors`}
                  >
                    <td className={`${textPrimary} p-6`} style={{ fontSize: '14px', fontWeight: 600 }}>
                      {pedido.codigo}
                    </td>
                    <td className={`${textPrimary} p-6`} style={{ fontSize: '14px' }}>
                      {pedido.cliente}
                    </td>
                    <td className={`${textSecondary} p-6`} style={{ fontSize: '14px' }}>
                      {pedido.tipoDocumento} {pedido.numeroDocumento}
                    </td>
                    <td className={`${textSecondary} p-6`} style={{ fontSize: '14px' }}>
                      {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                    </td>
                    <td className={`${textSecondary} p-6`} style={{ fontSize: '14px' }}>
                      {pedido.productos.length} items
                    </td>
                    <td className={`text-[#14B8A6] text-right p-6`} style={{ fontSize: '16px', fontWeight: 700 }}>
                      ${pedido.total.toLocaleString('es-CO')}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <span
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white ${getEstadoColor(pedido.estado)}`}
                          style={{ fontSize: '12px', fontWeight: 600 }}
                        >
                          {getEstadoIcon(pedido.estado)}
                          {pedido.estado}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => verDetalle(pedido)}
                          className="h-10 w-10 p-0 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => abrirModalEdicion(pedido)}
                          className="h-10 w-10 p-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => abrirDialogoEliminar(pedido)}
                          className="h-10 w-10 p-0 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {pedidosFiltrados.length === 0 && (
            <div className="p-12 text-center">
              <Package className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`} />
              <p className={textSecondary} style={{ fontSize: '16px' }}>
                No se encontraron pedidos
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center">
            <PaginationCustom
              currentPage={currentPage}
              totalPages={totalPaginas}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={pedidosFiltrados.length}
            />
          </div>
        )}
      </div>

      {/* MODAL: Crear/Editar Pedido */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent 
          className={`${bgCard} border-2 ${border} rounded-3xl p-0 overflow-hidden`}
          style={{ maxWidth: '1200px', width: '95vw', maxHeight: '90vh' }}
        >
          <div className="p-8 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
            <DialogHeader>
              <DialogTitle className={`${textPrimary}`} style={{ fontSize: '28px', fontWeight: 700 }}>
                {selectedPedido ? 'Editar Pedido' : 'Crear Nuevo Pedido'}
              </DialogTitle>
              <DialogDescription className={textSecondary} style={{ fontSize: '15px' }}>
                Completa la información del pedido y agrega los productos
              </DialogDescription>
            </DialogHeader>

            {/* SECCIÓN 1: Información del Cliente */}
            <div className={`${bgCard} rounded-2xl p-6 border-2 ${border}`}>
              <h3 className={`${textPrimary} mb-4`} style={{ fontSize: '16px', fontWeight: 700 }}>
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`${textPrimary} mb-2 block`} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Tipo de Documento *
                  </label>
                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(value) => setFormData({ ...formData, tipoDocumento: value })}
                  >
                    <SelectTrigger className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTO.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className={`${textPrimary} mb-2 block`} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Número de Documento *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: 1234567890"
                    value={formData.numeroDocumento}
                    onChange={(e) => setFormData({ ...formData, numeroDocumento: e.target.value })}
                    className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <div>
                  <label className={`${textPrimary} mb-2 block`} style={{ fontSize: '14px', fontWeight: 600 }}>
                    Nombre del Cliente *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                    style={{ fontSize: '14px' }}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Búsqueda de Productos */}
            <div className={`${bgCard} rounded-2xl p-6 border-2 ${border}`}>
              <h3 className={`${textPrimary} mb-4`} style={{ fontSize: '16px', fontWeight: 700 }}>
                Buscar Productos
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
                  <Input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                    style={{ fontSize: '14px' }}
                  />
                </div>

                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas las categorías</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lista de productos disponibles */}
              {(busquedaProducto || categoriaFiltro !== 'Todas') && productosFiltrados.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${bgCard} border-2 ${border} rounded-xl overflow-hidden max-h-64 overflow-y-auto`}
                >
                  {productosFiltrados.map((producto) => (
                    <div
                      key={producto.id}
                      onClick={() => agregarProducto(producto)}
                      className={`p-4 cursor-pointer hover:bg-[#14B8A6] hover:bg-opacity-10 transition-colors border-b ${border} last:border-b-0`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                              {producto.nombre || producto.nombreComercial || 'Producto sin nombre'}
                            </p>
                            <p className={textSecondary} style={{ fontSize: '12px' }}>
                              {producto.categoria || 'Sin categoría'}
                            </p>
                          </div>
                        </div>
                        <p className="text-[#14B8A6]" style={{ fontSize: '15px', fontWeight: 700 }}>
                          ${producto.precio.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* SECCIÓN 3: Carrito de Compras */}
            {formData.productos.length > 0 && (
              <div className={`${bgCard} rounded-2xl border-2 ${border} overflow-hidden`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className={`${textPrimary}`} style={{ fontSize: '16px', fontWeight: 700 }}>
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Carrito de Compras ({formData.productos.length})
                  </h3>
                </div>

                {/* Lista de productos con scroll */}
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {formData.productos.map((producto) => (
                      <div key={producto.id} className="p-4 hover:bg-[#14B8A6] hover:bg-opacity-5 transition-colors">
                        <div className="flex items-center gap-3">
                          {/* Icono */}
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white" />
                          </div>

                          {/* Nombre */}
                          <div className="flex-1 min-w-[140px]">
                            <div className={`${textPrimary} truncate`} style={{ fontSize: '14px', fontWeight: 700 }}>
                              {producto.nombre}
                            </div>
                            <div className={`${textSecondary}`} style={{ fontSize: '11px' }}>
                              ${producto.precioUnitario.toLocaleString('es-CO')} c/u
                            </div>
                          </div>

                          {/* Cantidad */}
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => actualizarCantidad(producto.id, producto.cantidad - 1)}
                              disabled={producto.cantidad <= 1}
                              className="h-8 w-8 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-30"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={producto.cantidad}
                              onChange={(e) => actualizarCantidad(producto.id, Number(e.target.value) || 1)}
                              className={`h-8 w-14 text-center rounded-lg border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: '13px', fontWeight: 700 }}
                            />
                            <Button
                              onClick={() => actualizarCantidad(producto.id, producto.cantidad + 1)}
                              className="h-8 w-8 p-0 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Descuento */}
                          <div className="w-16">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={producto.descuentoPorcentaje}
                              onChange={(e) => actualizarDescuento(producto.id, Number(e.target.value))}
                              placeholder="%"
                              className={`h-8 text-center rounded-lg border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: '12px', fontWeight: 700 }}
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="w-24 text-right">
                            <div className="text-[#14B8A6]" style={{ fontSize: '15px', fontWeight: 700 }}>
                              ${producto.subtotal.toLocaleString('es-CO')}
                            </div>
                          </div>

                          {/* Eliminar */}
                          <Button
                            onClick={() => eliminarProducto(producto.id)}
                            className="h-8 w-8 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN 4: Resumen y Cálculos */}
            {formData.productos.length > 0 && (
              <div className={`${bgCard} rounded-2xl p-6 border-2 border-[#14B8A6] shadow-lg`}>
                <div className="grid grid-cols-2 gap-8">
                  {/* Columna izquierda - Totales */}
                  <div className="space-y-3">
                    <h4 className={`${textPrimary} mb-3`} style={{ fontSize: '15px', fontWeight: 700 }}>
                      Resumen del Pedido
                    </h4>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className={textSecondary} style={{ fontSize: '14px' }}>Subtotal:</span>
                      <span className={textPrimary} style={{ fontSize: '16px', fontWeight: 700 }}>
                        ${calcularSubtotal().toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span className={textSecondary} style={{ fontSize: '14px' }}>Descuento:</span>
                      <span className="text-red-500" style={{ fontSize: '16px', fontWeight: 700 }}>
                        -${calcularDescuentoTotal().toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className={textSecondary} style={{ fontSize: '14px' }}>IVA:</span>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.ivaPorcentaje}
                          onChange={(e) => setFormData({ ...formData, ivaPorcentaje: Number(e.target.value) })}
                          className={`h-8 w-16 text-center rounded-lg border-2 ${inputBorder} ${inputBg} ${inputText}`}
                          style={{ fontSize: '12px', fontWeight: 700 }}
                        />
                        <span className={textSecondary} style={{ fontSize: '12px' }}>%</span>
                      </div>
                      <span className={textPrimary} style={{ fontSize: '16px', fontWeight: 700 }}>
                        ${calcularIva().toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-[#14B8A6]">
                      <span className={textPrimary} style={{ fontSize: '18px', fontWeight: 700 }}>TOTAL:</span>
                      <span className="text-[#14B8A6]" style={{ fontSize: '28px', fontWeight: 700 }}>
                        ${calcularTotal().toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>

                  {/* Columna derecha - Estado y Notas */}
                  <div className="space-y-4">
                    <div>
                      <label className={`${textPrimary} mb-2 block`} style={{ fontSize: '14px', fontWeight: 600 }}>
                        Estado del Pedido
                      </label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
                      >
                        <SelectTrigger className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="En Proceso">En Proceso</SelectItem>
                          <SelectItem value="Entregado">Entregado</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={`${textPrimary} mb-2 block`} style={{ fontSize: '14px', fontWeight: 600 }}>
                        Notas Adicionales
                      </label>
                      <Textarea
                        placeholder="Observaciones, instrucciones especiales..."
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        className={`rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} min-h-[100px]`}
                        style={{ fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {formData.productos.length === 0 && (
              <div className={`${bgCard} rounded-2xl p-12 border-2 ${border} text-center`}>
                <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`} />
                <p className={textSecondary} style={{ fontSize: '15px' }}>
                  Busca y selecciona productos para agregar al pedido
                </p>
              </div>
            )}

            {/* BOTONES DE ACCIÓN */}
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setModalOpen(false)}
                className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} rounded-xl h-12 px-8`}
                style={{ fontSize: '14px', fontWeight: 600 }}
              >
                Cancelar
              </Button>

              <Button
                onClick={guardarPedido}
                disabled={loading || formData.productos.length === 0 || !formData.cliente || !formData.numeroDocumento}
                className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0D9488] hover:to-[#0284C7] text-white rounded-xl h-12 px-8 shadow-lg disabled:opacity-50"
                style={{ fontSize: '14px', fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {selectedPedido ? 'Actualizar Pedido' : 'Crear Pedido'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Detalle del Pedido */}
      <Dialog open={detalleModalOpen} onOpenChange={setDetalleModalOpen}>
        <DialogContent className={`${bgCard} border-2 ${border} rounded-3xl`} style={{ maxWidth: '800px' }}>
          {selectedPedido && (
            <>
              <DialogHeader>
                <DialogTitle className={`${textPrimary}`} style={{ fontSize: '24px', fontWeight: 700 }}>
                  Detalle del Pedido
                </DialogTitle>
                <DialogDescription className={textSecondary} style={{ fontSize: '14px' }}>
                  {selectedPedido.codigo}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Info general */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={textSecondary} style={{ fontSize: '13px' }}>Cliente</p>
                    <p className={textPrimary} style={{ fontSize: '16px', fontWeight: 600 }}>
                      {selectedPedido.cliente}
                    </p>
                    <p className={textSecondary} style={{ fontSize: '12px' }}>
                      {selectedPedido.tipoDocumento}: {selectedPedido.numeroDocumento}
                    </p>
                  </div>

                  <div>
                    <p className={textSecondary} style={{ fontSize: '13px' }}>Fecha</p>
                    <p className={textPrimary} style={{ fontSize: '16px', fontWeight: 600 }}>
                      {new Date(selectedPedido.fecha).toLocaleDateString('es-ES')}
                    </p>
                    <p className={textSecondary} style={{ fontSize: '12px' }}>
                      {new Date(selectedPedido.fecha).toLocaleTimeString('es-ES')}
                    </p>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <p className={textSecondary} style={{ fontSize: '13px' }}>Estado Actual</p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white ${getEstadoColor(selectedPedido.estado)}`}
                      style={{ fontSize: '14px', fontWeight: 600 }}
                    >
                      {getEstadoIcon(selectedPedido.estado)}
                      {selectedPedido.estado}
                    </span>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className={`${textPrimary} mb-3`} style={{ fontSize: '16px', fontWeight: 700 }}>
                    Productos
                  </h4>
                  <div className="space-y-2">
                    {selectedPedido.productos.map((producto) => (
                      <div key={producto.id} className={`flex justify-between items-center p-3 rounded-xl ${isDark ? 'bg-[#1a1d2e]' : 'bg-gray-50'}`}>
                        <div className="flex-1">
                          <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                            {producto.nombre}
                          </p>
                          <p className={textSecondary} style={{ fontSize: '12px' }}>
                            {producto.cantidad} x ${producto.precioUnitario.toLocaleString('es-CO')}
                            {producto.descuentoPorcentaje > 0 && ` (-${producto.descuentoPorcentaje}%)`}
                          </p>
                        </div>
                        <p className="text-[#14B8A6]" style={{ fontSize: '15px', fontWeight: 700 }}>
                          ${producto.subtotal.toLocaleString('es-CO')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div className={`${isDark ? 'bg-[#1a1d2e]' : 'bg-gray-50'} rounded-2xl p-6 space-y-3`}>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Subtotal:</span>
                    <span className={textPrimary} style={{ fontWeight: 600 }}>
                      ${selectedPedido.subtotal.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Descuento:</span>
                    <span className="text-red-500" style={{ fontWeight: 600 }}>
                      -${selectedPedido.descuento.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>IVA:</span>
                    <span className={textPrimary} style={{ fontWeight: 600 }}>
                      ${selectedPedido.iva.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-[#14B8A6]">
                    <span className={textPrimary} style={{ fontSize: '18px', fontWeight: 700 }}>TOTAL:</span>
                    <span className="text-[#14B8A6]" style={{ fontSize: '24px', fontWeight: 700 }}>
                      ${selectedPedido.total.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Historial */}
                <div>
                  <h4 className={`${textPrimary} mb-3`} style={{ fontSize: '16px', fontWeight: 700 }}>
                    Historial de Estados
                  </h4>
                  <div className="space-y-2">
                    {selectedPedido.historial.map((hist, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-[#1a1d2e]' : 'bg-gray-50'}`}>
                        <div className={`w-8 h-8 rounded-lg ${getEstadoColor(hist.estado)} flex items-center justify-center`}>
                          {getEstadoIcon(hist.estado)}
                        </div>
                        <div className="flex-1">
                          <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                            {hist.estado}
                          </p>
                          <p className={textSecondary} style={{ fontSize: '12px' }}>
                            {new Date(hist.fecha).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                {selectedPedido.notas && (
                  <div>
                    <h4 className={`${textPrimary} mb-2`} style={{ fontSize: '14px', fontWeight: 700 }}>
                      Notas
                    </h4>
                    <p className={textSecondary} style={{ fontSize: '14px' }}>
                      {selectedPedido.notas}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => setDetalleModalOpen(false)}
                    className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} rounded-xl h-12 px-8`}
                    style={{ fontSize: '14px', fontWeight: 600 }}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG: Confirmar Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${bgCard} border-2 ${border} rounded-3xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
              ¿Eliminar pedido?
            </AlertDialogTitle>
            <AlertDialogDescription className={textSecondary} style={{ fontSize: '14px' }}>
              Esta acción no se puede deshacer. El pedido {selectedPedido?.codigo} será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${textPrimary} rounded-xl h-11 px-6`}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarPedido}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
