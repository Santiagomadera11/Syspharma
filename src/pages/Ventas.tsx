import { useState, useRef, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  DollarSign,
  ShoppingCart,
  Eye,
  Edit,
  Printer,
  X,
  CheckCircle,
  Calendar,
  Filter,
  FileText,
  RotateCcw,
  AlertCircle,
  CreditCard,
  Package,
  ArrowLeft,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign as DollarIcon,
  Lock,
  Download,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useDarkMode } from "../hooks/useDarkMode";
import { useCategorias } from "../hooks/useEntities";
import { PaginationCustom } from "../components/ui/pagination-custom";
import {
  TablaProductosVenta,
  ProductoVenta,
} from "../components/ventas/TablaProductosVenta";
import { TicketImprimible } from "../components/ventas/TicketImprimible";
import { motion, AnimatePresence } from "motion/react";
import {
  ventasStorage,
  productosStorage,
  categoriasStorage,
} from "../utils/localStorage";

interface Venta {
  id: string;
  codigo: string;
  fecha: Date;
  cliente: string;
  cedulaCliente?: string;
  productos: ProductoVenta[];
  subtotal: number;
  descuentoTotal: number;
  iva: number;
  total: number;
  metodoPago: string;
  montoPagado?: number;
  cambio?: number;
  estado: "Completada" | "Anulada";
  fechaAnulacion?: Date;
}

interface Gasto {
  id: string;
  fecha: Date;
  descripcion: string;
  monto: number;
  categoria: "Materiales" | "Servicios" | "Reparto" | "Otros";
}

interface CierreCaja {
  fecha: Date;
  ventasBrutas: number;
  totalGastos: number;
  gananciaNeta: number;
  efectivoEsperado: number;
  efectivoReal: number;
  observaciones: string;
}

interface Devolucion {
  id: string;
  ventaId: string;
  codigoVenta: string;
  fecha: Date;
  cliente: string;
  productos: ProductoVenta[];
  totalDevuelto: number;
  motivo: string;
}

interface VentasProps {
  user: any;
}

const productosDisponibles = [
  { id: "1", nombre: "Acetaminofén 500mg", precio: 2500, stock: 200 },
  { id: "2", nombre: "Ibuprofeno 400mg", precio: 3200, stock: 150 },
  { id: "3", nombre: "Amoxicilina 500mg", precio: 8500, stock: 180 },
  { id: "4", nombre: "Loratadina 10mg", precio: 4500, stock: 120 },
  { id: "5", nombre: "Omeprazol 20mg", precio: 5800, stock: 160 },
  { id: "6", nombre: "Metformina 850mg", precio: 6200, stock: 140 },
  { id: "7", nombre: "Atorvastatina 20mg", precio: 12500, stock: 90 },
  { id: "8", nombre: "Losartán 50mg", precio: 9800, stock: 110 },
  { id: "9", nombre: "Vitamina C 1000mg", precio: 15000, stock: 200 },
  { id: "10", nombre: "Complejo B", precio: 18500, stock: 150 },
];

// Base de datos de clientes con cédulas
const clientesDB = [
  {
    cedula: "1020304050",
    nombre: "Laura Fernández",
    telefono: "3001234567",
    direccion: "Calle 45 #12-34",
  },
  {
    cedula: "1030405060",
    nombre: "Roberto Díaz",
    telefono: "3109876543",
    direccion: "Carrera 23 #56-78",
  },
  {
    cedula: "1040506070",
    nombre: "María García",
    telefono: "3201234567",
    direccion: "Avenida 68 #34-12",
  },
  {
    cedula: "1050607080",
    nombre: "Carlos López",
    telefono: "3159876543",
    direccion: "Calle 100 #45-67",
  },
  {
    cedula: "1060708090",
    nombre: "Ana Martínez",
    telefono: "3181234567",
    direccion: "Carrera 7 #23-45",
  },
  {
    cedula: "1070809000",
    nombre: "Pedro Ramírez",
    telefono: "3229876543",
    direccion: "Calle 72 #56-89",
  },
];

const metodosPago = [
  "Efectivo",
  "Tarjeta Débito",
  "Tarjeta Crédito",
  "Transferencia",
  "Nequi",
  "Daviplata",
];

// Generar ventas de ejemplo para HOY
const generarVentasEjemplo = (): Venta[] => {
  const ventas: Venta[] = [];
  const hoy = new Date();

  for (let i = 0; i < 15; i++) {
    const cantidadProductos = Math.floor(Math.random() * 4) + 1;
    const productosVenta: ProductoVenta[] = [];

    for (let j = 0; j < cantidadProductos; j++) {
      const producto =
        productosDisponibles[
          Math.floor(Math.random() * productosDisponibles.length)
        ];
      const cantidad = Math.floor(Math.random() * 3) + 1;
      const descuento =
        Math.random() > 0.7 ? Math.floor(Math.random() * 15) : 0;
      const subtotal = producto.precio * cantidad * (1 - descuento / 100);

      productosVenta.push({
        id: producto.id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad,
        descuentoPorcentaje: descuento,
        subtotal,
      });
    }

    const subtotal = productosVenta.reduce((sum, p) => sum + p.subtotal, 0);
    const descuentoTotal = productosVenta.reduce(
      (sum, p) =>
        sum + (p.precioUnitario * p.cantidad * p.descuentoPorcentaje) / 100,
      0
    );
    const baseImponible = subtotal;
    const iva = baseImponible * 0.16;
    const total = baseImponible + iva;

    const clienteDB = clientesDB[Math.floor(Math.random() * clientesDB.length)];
    const metodoPago =
      metodosPago[Math.floor(Math.random() * metodosPago.length)];

    // Crear venta del día de hoy con hora aleatoria
    const fechaVenta = new Date(hoy);
    fechaVenta.setHours(
      Math.floor(Math.random() * 12) + 8,
      Math.floor(Math.random() * 60),
      0,
      0
    );

    ventas.push({
      id: `V-${1000 + i}`,
      codigo: `VTA-2024-${String(1000 + i).padStart(6, "0")}`,
      fecha: fechaVenta,
      cliente: clienteDB.nombre,
      cedulaCliente: clienteDB.cedula,
      productos: productosVenta,
      subtotal,
      descuentoTotal,
      iva,
      total,
      metodoPago,
      montoPagado:
        metodoPago === "Efectivo" ? Math.ceil(total / 1000) * 1000 : undefined,
      cambio:
        metodoPago === "Efectivo"
          ? Math.ceil(total / 1000) * 1000 - total
          : undefined,
      estado: Math.random() > 0.9 ? "Anulada" : "Completada",
      fechaAnulacion: Math.random() > 0.9 ? new Date() : undefined,
    });
  }

  return ventas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
};

// Generar gastos de ejemplo para HOY
const generarGastosEjemplo = (): Gasto[] => {
  const hoy = new Date();
  return [
    {
      id: "G-001",
      fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 9, 30),
      descripcion: "Compra de bolsas plásticas",
      monto: 45000,
      categoria: "Materiales",
    },
    {
      id: "G-002",
      fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 11, 15),
      descripcion: "Pago servicio de luz",
      monto: 120000,
      categoria: "Servicios",
    },
    {
      id: "G-003",
      fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 14, 45),
      descripcion: "Uber repartidor domicilios",
      monto: 25000,
      categoria: "Reparto",
    },
  ];
};

export default function Ventas({ user }: VentasProps) {
  const { isDark } = useDarkMode();

  // Estados principales
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productosReales, setProductosReales] = useState<any[]>([]);

  // Obtener categorías desde el hook y productos desde storage
  const { items: categoriasFromHook } = useCategorias();
  useEffect(() => {
    const categoriasActivas = (categoriasFromHook || []).filter(
      (c: any) => c.estado === "Activo" || c.estado === "Activa"
    );
    setCategorias(categoriasActivas);

    // Cargar productos
    const productosFromStorage = productosStorage.getAll();
    const productosActivos = productosFromStorage.filter(
      (p) => p.estado === "Activo"
    );
    setProductosReales(productosActivos);
  }, [categoriasFromHook]);

  // Cargar ventas desde localStorage al montar
  useEffect(() => {
    const storedVentas = ventasStorage.getAll();
    if (storedVentas.length > 0) {
      // Convertir las fechas string a Date
      const ventasConFechas = storedVentas.map((v) => ({
        ...v,
        fecha: new Date(v.fecha),
        fechaAnulacion: v.fechaAnulacion
          ? new Date(v.fechaAnulacion)
          : undefined,
        productos: v.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
        })),
      })) as Venta[];
      setVentas(ventasConFechas);
    } else {
      // Si no hay ventas, usar ejemplos iniciales
      setVentas(generarVentasEjemplo());
    }
    // Cargar gastos de ejemplo
    setGastos(generarGastosEjemplo());
  }, []);

  // Guardar en localStorage cuando cambien las ventas
  useEffect(() => {
    if (ventas.length > 0) {
      const ventasParaGuardar = ventas.map((v) => ({
        id: v.id,
        fecha: v.fecha.toISOString(),
        cliente: v.cliente,
        productos: v.productos.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
        })),
        subtotal: v.subtotal,
        descuento: v.descuentoTotal,
        total: v.total,
        metodoPago: v.metodoPago,
        estado:
          v.estado === "Completada"
            ? ("Completada" as const)
            : ("Cancelada" as const),
        createdAt: new Date().toISOString(),
      }));
      ventasStorage.save(ventasParaGuardar);
    }
  }, [ventas]);
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [modalGastoOpen, setModalGastoOpen] = useState(false);
  const [modalCierreOpen, setModalCierreOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [loading, setLoading] = useState(false);
  const [cajaCerrada, setCajaCerrada] = useState(false);
  const [cierreCaja, setCierreCaja] = useState<CierreCaja | null>(null);
  const [modalDevolucionOpen, setModalDevolucionOpen] = useState(false);
  const [ventaParaDevolucion, setVentaParaDevolucion] = useState<Venta | null>(
    null
  );
  const [modalEliminarVentaOpen, setModalEliminarVentaOpen] = useState(false);
  const [ventaParaEliminar, setVentaParaEliminar] = useState<Venta | null>(
    null
  );
  const [modalEliminarGastoOpen, setModalEliminarGastoOpen] = useState(false);
  const [gastoParaEliminar, setGastoParaEliminar] = useState<Gasto | null>(
    null
  );

  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState("");
  const [cedulaCliente, setCedulaCliente] = useState("");
  const [clienteEncontrado, setClienteEncontrado] = useState<
    (typeof clientesDB)[0] | null
  >(null);
  const [mostrarCrearCliente, setMostrarCrearCliente] = useState(false);
  const [usarClienteGenerico, setUsarClienteGenerico] = useState(false);

  // Estados para nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });

  // Estados de formulario de venta
  const [formData, setFormData] = useState({
    cliente: "",
    metodoPago: "Efectivo",
    productos: [] as ProductoVenta[],
    montoPagado: 0,
    notas: "",
  });

  // Estados de formulario de gasto
  const [formGasto, setFormGasto] = useState({
    descripcion: "",
    monto: 0,
    categoria: "Materiales" as "Materiales" | "Servicios" | "Reparto" | "Otros",
  });

  // Estados de cierre de caja
  const [formCierre, setFormCierre] = useState({
    efectivoReal: 0,
    observaciones: "",
  });

  // Búsqueda de productos
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [productoSeleccionado, setProductoSeleccionado] = useState<
    (typeof productosDisponibles)[0] | null
  >(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [paginaProductos, setPaginaProductos] = useState(1);
  const productosPerPage = 6;

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;

  // Imprimir ticket
  const ticketRef = useRef<HTMLDivElement>(null);

  // Clases de estilos
  const bgPrimary = isDark ? "bg-[#1a1d2e]" : "bg-white";
  const bgCard = isDark ? "bg-[#22262e]" : "bg-white";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const border = isDark ? "border-gray-700" : "border-gray-200";
  const inputBg = isDark ? "bg-[#1a1d2e]" : "bg-white";
  const inputBorder = isDark ? "border-gray-600" : "border-gray-300";
  const inputText = isDark ? "text-gray-100" : "text-gray-900";

  // Calcular estadísticas del día
  const ventasDelDia = ventas.filter((v) => {
    const hoy = new Date();
    const fechaVenta = new Date(v.fecha);
    return (
      fechaVenta.toDateString() === hoy.toDateString() &&
      v.estado === "Completada"
    );
  });

  const ventasBrutas = ventasDelDia.reduce((sum, v) => sum + v.total, 0);
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gananciaNeta = ventasBrutas - totalGastos;
  const efectivoEsperado = ventasDelDia
    .filter((v) => v.metodoPago === "Efectivo")
    .reduce((sum, v) => sum + v.total, 0);

  // Obtener fecha formateada
  const obtenerFechaHoy = () => {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const fecha = new Date().toLocaleDateString("es-ES", opciones);
    return fecha.charAt(0).toUpperCase() + fecha.slice(1);
  };

  // Buscar cliente por cédula
  const buscarClientePorCedula = () => {
    if (!cedulaCliente.trim()) {
      toast.error("Ingresa la cédula del cliente", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    const cliente = clientesDB.find((c) => c.cedula === cedulaCliente);

    if (cliente) {
      setClienteEncontrado(cliente);
      setMostrarCrearCliente(false);
      setUsarClienteGenerico(false);
      toast.success(`Cliente encontrado: ${cliente.nombre}`, {
        style: { background: "#14B8A6", color: "white" },
      });
    } else {
      setClienteEncontrado(null);
      setMostrarCrearCliente(true);
      setUsarClienteGenerico(false);
    }
  };

  // Crear cliente rápido
  const crearClienteRapido = () => {
    if (!nuevoCliente.nombre.trim()) {
      toast.error("El nombre del cliente es obligatorio", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    const nuevoClienteDB = {
      cedula: cedulaCliente,
      nombre: nuevoCliente.nombre,
      telefono: nuevoCliente.telefono,
      direccion: nuevoCliente.direccion,
    };

    clientesDB.push(nuevoClienteDB);
    setClienteEncontrado(nuevoClienteDB);
    setMostrarCrearCliente(false);

    toast.success("Cliente creado exitosamente", {
      style: { background: "#14B8A6", color: "white" },
    });

    // Limpiar formulario
    setNuevoCliente({ nombre: "", telefono: "", direccion: "" });
  };

  // Usar cliente genérico
  const usarGenerico = () => {
    setUsarClienteGenerico(true);
    setClienteEncontrado({
      cedula: "GENERICO",
      nombre: "Cliente Genérico",
      telefono: "N/A",
      direccion: "N/A",
    });
    setMostrarCrearCliente(false);
    setCedulaCliente("GENERICO");

    toast.info("Venta como cliente genérico", {
      style: { background: "#6B7280", color: "white" },
    });
  };

  // Productos filtrados
  const productosParaMostrar =
    productosReales.length > 0 ? productosReales : productosDisponibles;

  const productosFiltrados = productosParaMostrar.filter((p) => {
    const nombreProducto =
      p.nombreComercial || p.nombre || p.nombreGenerico || "";
    const coincideBusqueda =
      nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      (p.codigo &&
        p.codigo.toLowerCase().includes(busquedaProducto.toLowerCase()));

    if (!categoriaFiltro || categoriaFiltro === "todas") {
      return coincideBusqueda;
    }

    return (
      coincideBusqueda &&
      (p.categoriaId === categoriaFiltro || p.categoria === categoriaFiltro)
    );
  });

  // Añadir producto a la venta
  const agregarProducto = (producto: (typeof productosDisponibles)[0]) => {
    const productoExistente = formData.productos.find(
      (p) => p.id === producto.id
    );

    if (productoExistente) {
      // Si ya existe, aumentar cantidad
      const nuevosProductos = formData.productos.map((p) =>
        p.id === producto.id
          ? {
              ...p,
              cantidad: p.cantidad + 1,
              subtotal: (p.cantidad + 1) * p.precioUnitario,
            }
          : p
      );
      setFormData({ ...formData, productos: nuevosProductos });
    } else {
      // Si no existe, agregar nuevo
      const nuevoProducto: ProductoVenta = {
        id: producto.id,
        nombre:
          producto.nombreComercial ||
          producto.nombre ||
          producto.nombreGenerico ||
          "Producto",
        precioUnitario: producto.precio,
        cantidad: 1,
        descuentoPorcentaje: 0,
        subtotal: producto.precio,
      };
      setFormData({
        ...formData,
        productos: [...formData.productos, nuevoProducto],
      });
    }

    setBusquedaProducto("");
    setProductoSeleccionado(null);
  };

  // Actualizar cantidad de producto
  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad < 1) return;

    const nuevosProductos = formData.productos.map((p) =>
      p.id === id
        ? {
            ...p,
            cantidad,
            subtotal:
              cantidad * p.precioUnitario * (1 - p.descuentoPorcentaje / 100),
          }
        : p
    );
    setFormData({ ...formData, productos: nuevosProductos });
  };

  // Actualizar descuento de producto
  const actualizarDescuento = (id: string, descuento: number) => {
    if (descuento < 0 || descuento > 100) return;

    const nuevosProductos = formData.productos.map((p) =>
      p.id === id
        ? {
            ...p,
            descuentoPorcentaje: descuento,
            subtotal: p.cantidad * p.precioUnitario * (1 - descuento / 100),
          }
        : p
    );
    setFormData({ ...formData, productos: nuevosProductos });
  };

  // Eliminar producto
  const eliminarProducto = (id: string) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((p) => p.id !== id),
    });
  };

  // Cálculos de venta
  const calcularSubtotal = (productos: ProductoVenta[]) => {
    return productos.reduce((sum, p) => sum + p.precioUnitario * p.cantidad, 0);
  };

  const calcularDescuentoTotal = (productos: ProductoVenta[]) => {
    return productos.reduce(
      (sum, p) =>
        sum + (p.precioUnitario * p.cantidad * p.descuentoPorcentaje) / 100,
      0
    );
  };

  const calcularIva = (productos: ProductoVenta[]) => {
    const baseImponible = productos.reduce((sum, p) => sum + p.subtotal, 0);
    return baseImponible * 0.16;
  };

  const calcularTotal = (productos: ProductoVenta[]) => {
    const baseImponible = productos.reduce((sum, p) => sum + p.subtotal, 0);
    const iva = baseImponible * 0.16;
    return baseImponible + iva;
  };

  const calcularCambio = () => {
    const total = calcularTotal(formData.productos);
    return formData.montoPagado - total;
  };

  // Abrir modal de nueva venta
  const abrirModalNuevaVenta = () => {
    setSelectedVenta(null);
    setFormData({
      cliente: "",
      metodoPago: "Efectivo",
      productos: [],
      montoPagado: 0,
      notas: "",
    });
    setCedulaCliente("");
    setClienteEncontrado(null);
    setMostrarCrearCliente(false);
    setUsarClienteGenerico(false);
    setModalVentaOpen(true);
  };

  // Guardar venta
  const guardarVenta = async () => {
    if (!clienteEncontrado) {
      toast.error(
        "Debes ingresar la cédula del cliente o usar cliente genérico",
        {
          style: { background: "#EF4444", color: "white" },
        }
      );
      return;
    }

    if (formData.productos.length === 0) {
      toast.error("Agrega al menos un producto", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    const total = calcularTotal(formData.productos);

    if (formData.metodoPago === "Efectivo" && formData.montoPagado < total) {
      toast.error("El monto pagado es insuficiente", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    setLoading(true);

    // Simular guardado
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nuevaVenta: Venta = {
      id: `V-${Date.now()}`,
      codigo: `VTA-2024-${String(ventas.length + 1).padStart(6, "0")}`,
      fecha: new Date(),
      cliente: clienteEncontrado.nombre,
      cedulaCliente: clienteEncontrado.cedula,
      productos: formData.productos,
      subtotal: calcularSubtotal(formData.productos),
      descuentoTotal: calcularDescuentoTotal(formData.productos),
      iva: calcularIva(formData.productos),
      total,
      metodoPago: formData.metodoPago,
      montoPagado:
        formData.metodoPago === "Efectivo" ? formData.montoPagado : undefined,
      cambio: formData.metodoPago === "Efectivo" ? calcularCambio() : undefined,
      estado: "Completada",
    };

    setVentas([nuevaVenta, ...ventas]);
    setLoading(false);
    setModalVentaOpen(false);

    toast.success("Venta registrada exitosamente", {
      style: { background: "#14B8A6", color: "white" },
    });

    // Resetear formulario
    setFormData({
      cliente: "",
      metodoPago: "Efectivo",
      productos: [],
      montoPagado: 0,
      notas: "",
    });
    setCedulaCliente("");
    setClienteEncontrado(null);
  };

  // Guardar gasto
  const guardarGasto = async () => {
    if (!formGasto.descripcion.trim()) {
      toast.error("La descripción es obligatoria", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    if (formGasto.monto <= 0) {
      toast.error("El monto debe ser mayor a 0", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    const nuevoGasto: Gasto = {
      id: `G-${Date.now()}`,
      fecha: new Date(),
      descripcion: formGasto.descripcion,
      monto: formGasto.monto,
      categoria: formGasto.categoria,
    };

    setGastos([...gastos, nuevoGasto]);
    setModalGastoOpen(false);

    toast.success("Gasto registrado exitosamente", {
      style: { background: "#14B8A6", color: "white" },
    });

    // Resetear formulario
    setFormGasto({
      descripcion: "",
      monto: 0,
      categoria: "Materiales",
    });
  };

  // Cerrar caja
  const cerrarCaja = async () => {
    if (formCierre.efectivoReal <= 0) {
      toast.error("Ingresa el efectivo real contado", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    const cierre: CierreCaja = {
      fecha: new Date(),
      ventasBrutas,
      totalGastos,
      gananciaNeta,
      efectivoEsperado,
      efectivoReal: formCierre.efectivoReal,
      observaciones: formCierre.observaciones,
    };

    setCierreCaja(cierre);
    setCajaCerrada(true);
    setModalCierreOpen(false);

    toast.success("Caja cerrada exitosamente", {
      style: { background: "#14B8A6", color: "white" },
    });
  };

  // Descargar reporte de cierre
  const descargarReporteCierre = () => {
    if (!cierreCaja) return;

    toast.success("Descargando reporte de cierre...", {
      style: { background: "#14B8A6", color: "white" },
    });
  };

  // Ver detalle de venta
  const verDetalle = (venta: Venta) => {
    setSelectedVenta(venta);
    setModalDetalleOpen(true);
  };

  // Anular venta
  const anularVenta = (id: string) => {
    if (cajaCerrada) {
      toast.error("No puedes anular ventas con la caja cerrada", {
        style: { background: "#EF4444", color: "white" },
      });
      return;
    }

    setVentas(
      ventas.map((v) =>
        v.id === id
          ? { ...v, estado: "Anulada" as const, fechaAnulacion: new Date() }
          : v
      )
    );

    toast.success("Venta anulada", {
      style: { background: "#14B8A6", color: "white" },
    });
  };

  // Abrir modal de devolución
  const abrirModalDevolucion = (venta: Venta) => {
    setVentaParaDevolucion(venta);
    setModalDevolucionOpen(true);
  };

  // Procesar devolución
  const procesarDevolucion = () => {
    if (!ventaParaDevolucion) return;

    // Crear registro de devolución
    const devolucion: Devolucion = {
      id: `DEV-${Date.now()}`,
      ventaId: ventaParaDevolucion.id,
      codigoVenta: ventaParaDevolucion.codigo,
      fecha: new Date(),
      cliente: ventaParaDevolucion.cliente,
      productos: ventaParaDevolucion.productos,
      totalDevuelto: ventaParaDevolucion.total,
      motivo: "Devolución procesada",
    };

    // Anular la venta
    setVentas(
      ventas.map((v) =>
        v.id === ventaParaDevolucion.id
          ? { ...v, estado: "Anulada" as const, fechaAnulacion: new Date() }
          : v
      )
    );

    toast.success("Devolución procesada. Nota de crédito generada", {
      style: { background: "#14B8A6", color: "white" },
    });

    setModalDevolucionOpen(false);
    setVentaParaDevolucion(null);
  };

  // Abrir modal eliminar venta
  const abrirModalEliminarVenta = (venta: Venta) => {
    setVentaParaEliminar(venta);
    setModalEliminarVentaOpen(true);
  };

  // Eliminar venta permanentemente
  const eliminarVenta = () => {
    if (!ventaParaEliminar) return;

    setVentas(ventas.filter((v) => v.id !== ventaParaEliminar.id));

    toast.success("Venta eliminada permanentemente", {
      style: { background: "#14B8A6", color: "white" },
    });

    setModalEliminarVentaOpen(false);
    setVentaParaEliminar(null);
  };

  // Abrir modal eliminar gasto
  const abrirModalEliminarGasto = (gasto: Gasto) => {
    setGastoParaEliminar(gasto);
    setModalEliminarGastoOpen(true);
  };

  // Eliminar gasto
  const eliminarGasto = () => {
    if (!gastoParaEliminar) return;

    setGastos(gastos.filter((g) => g.id !== gastoParaEliminar.id));

    toast.success("Gasto eliminado. Se restará del cierre del día", {
      style: { background: "#14B8A6", color: "white" },
    });

    setModalEliminarGastoOpen(false);
    setGastoParaEliminar(null);
  };

  // Filtrar ventas
  const ventasFiltradas = ventasDelDia.filter((venta) => {
    const searchLower = busqueda.toLowerCase();
    return (
      (venta.codigo && venta.codigo.toLowerCase().includes(searchLower)) ||
      (venta.cliente && venta.cliente.toLowerCase().includes(searchLower)) ||
      (venta.cedulaCliente && venta.cedulaCliente.includes(busqueda)) ||
      (venta.fecha &&
        new Date(venta.fecha).toLocaleDateString("es-ES").includes(busqueda))
    );
  });

  // Paginación
  const totalPaginas = Math.ceil(ventasFiltradas.length / itemsPorPagina);
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  return (
    <div className={`min-h-screen ${bgPrimary} p-8`}>
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header con título y botón de cierre */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`${textPrimary} mb-2`}
              style={{ fontSize: "32px", fontWeight: 700 }}
            >
              Ventas del día
            </h1>
            <p className={textSecondary} style={{ fontSize: "16px" }}>
              {obtenerFechaHoy()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setModalGastoOpen(true)}
              disabled={cajaCerrada}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 px-8 shadow-lg disabled:opacity-50"
              style={{ fontSize: "15px", fontWeight: 600 }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Registrar Gasto
            </Button>

            <Button
              onClick={() => setModalCierreOpen(true)}
              disabled={cajaCerrada}
              className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-2xl h-14 px-8 shadow-lg disabled:opacity-50"
              style={{ fontSize: "15px", fontWeight: 600 }}
            >
              {cajaCerrada ? (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Caja Cerrada
                </>
              ) : (
                <>
                  <DollarIcon className="w-5 h-5 mr-2" />
                  Cerrar Caja del Día
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ventas brutas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${bgCard} rounded-3xl p-8 border-2 ${border} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <p
              className={textSecondary}
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Ventas Brutas del Día
            </p>
            <p
              className="text-[#14B8A6] mt-2"
              style={{ fontSize: "36px", fontWeight: 700 }}
            >
              ${ventasBrutas.toLocaleString("es-CO")}
            </p>
            <p className={`${textSecondary} mt-2`} style={{ fontSize: "13px" }}>
              {ventasDelDia.length} ventas completadas
            </p>
          </motion.div>

          {/* Gastos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${bgCard} rounded-3xl p-8 border-2 ${border} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
            </div>
            <p
              className={textSecondary}
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Gastos del Día
            </p>
            <p
              className="text-orange-500 mt-2"
              style={{ fontSize: "36px", fontWeight: 700 }}
            >
              -${totalGastos.toLocaleString("es-CO")}
            </p>
            <p className={`${textSecondary} mt-2`} style={{ fontSize: "13px" }}>
              {gastos.length} gastos registrados
            </p>
          </motion.div>

          {/* Ganancia neta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${bgCard} rounded-3xl p-8 border-2 border-green-500 shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/10`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <p
              className={textSecondary}
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Ganancia Neta del Día
            </p>
            <p
              className="text-green-500 mt-2"
              style={{ fontSize: "36px", fontWeight: 700 }}
            >
              ${gananciaNeta.toLocaleString("es-CO")}
            </p>
            <p className={`${textSecondary} mt-2`} style={{ fontSize: "13px" }}>
              Ventas - Gastos
            </p>
          </motion.div>
        </div>

        {/* Sección de Gastos */}
        {gastos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${bgCard} rounded-3xl p-8 border-2 ${border} shadow-lg`}
          >
            <h3
              className={`${textPrimary} mb-6`}
              style={{ fontSize: "20px", fontWeight: 700 }}
            >
              Gastos del Día
            </h3>

            <div className="space-y-3">
              {gastos.map((gasto, index) => (
                <motion.div
                  key={gasto.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-2xl ${
                    isDark ? "bg-[#1a1d2e]" : "bg-gray-50"
                  } border ${border}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        gasto.categoria === "Materiales"
                          ? "bg-blue-500"
                          : gasto.categoria === "Servicios"
                          ? "bg-purple-500"
                          : gasto.categoria === "Reparto"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    >
                      <Package className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                      <p
                        className={textPrimary}
                        style={{ fontSize: "15px", fontWeight: 600 }}
                      >
                        {gasto.descripcion}
                      </p>
                      <p className={textSecondary} style={{ fontSize: "13px" }}>
                        {gasto.categoria} •{" "}
                        {new Date(gasto.fecha).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <p
                      className="text-orange-500"
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      -${gasto.monto.toLocaleString("es-CO")}
                    </p>
                  </div>

                  {!cajaCerrada && (
                    <Button
                      onClick={() => abrirModalEliminarGasto(gasto)}
                      className="ml-4 h-10 w-10 p-0 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Barra de acciones */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`}
              />
              <Input
                type="text"
                placeholder="Buscar por código, cliente, documento o fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`pl-12 h-14 rounded-2xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                style={{ fontSize: "15px" }}
              />
            </div>
          </div>

          <Button
            onClick={abrirModalNuevaVenta}
            disabled={cajaCerrada}
            className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0D9488] hover:to-[#0284C7] text-white rounded-2xl h-14 px-8 shadow-lg disabled:opacity-50"
            style={{ fontSize: "15px", fontWeight: 600 }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Venta
          </Button>
        </div>

        {/* Tabla de ventas */}
        <div
          className={`${bgCard} rounded-3xl border-2 ${border} shadow-lg overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? "bg-[#1a1d2e]" : "bg-gray-50"}>
                <tr>
                  <th
                    className={`${textPrimary} text-left p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Código
                  </th>
                  <th
                    className={`${textPrimary} text-left p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Hora
                  </th>
                  <th
                    className={`${textPrimary} text-left p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Cliente
                  </th>
                  <th
                    className={`${textPrimary} text-left p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Productos
                  </th>
                  <th
                    className={`${textPrimary} text-left p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Método Pago
                  </th>
                  <th
                    className={`${textPrimary} text-right p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Total
                  </th>
                  <th
                    className={`${textPrimary} text-center p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Estado
                  </th>
                  <th
                    className={`${textPrimary} text-center p-6`}
                    style={{ fontSize: "14px", fontWeight: 700 }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {ventasPaginadas.map((venta, index) => (
                  <motion.tr
                    key={venta.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-t ${border} hover:bg-[#14B8A6] hover:bg-opacity-5 transition-colors`}
                  >
                    <td
                      className={`${textPrimary} p-6`}
                      style={{ fontSize: "14px", fontWeight: 600 }}
                    >
                      {venta.codigo}
                    </td>
                    <td
                      className={`${textSecondary} p-6`}
                      style={{ fontSize: "14px" }}
                    >
                      {new Date(venta.fecha).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td
                      className={`${textPrimary} p-6`}
                      style={{ fontSize: "14px" }}
                    >
                      <div className="flex items-center gap-2">
                        {venta.cedulaCliente === "GENERICO" ? (
                          <Users className="w-4 h-4 text-gray-400" />
                        ) : (
                          <User className="w-4 h-4 text-[#14B8A6]" />
                        )}
                        {venta.cliente}
                      </div>
                    </td>
                    <td
                      className={`${textSecondary} p-6`}
                      style={{ fontSize: "14px" }}
                    >
                      {venta.productos.length} items
                    </td>
                    <td
                      className={`${textSecondary} p-6`}
                      style={{ fontSize: "14px" }}
                    >
                      {venta.metodoPago}
                    </td>
                    <td
                      className={`text-[#14B8A6] text-right p-6`}
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      ${venta.total.toLocaleString("es-CO")}
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <span
                          className={`px-4 py-2 rounded-xl text-white ${
                            venta.estado === "Completada"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{ fontSize: "12px", fontWeight: 600 }}
                        >
                          {venta.estado}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => verDetalle(venta)}
                          className="h-10 w-10 p-0 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {venta.estado === "Completada" && !cajaCerrada && (
                          <>
                            <Button
                              onClick={() => abrirModalDevolucion(venta)}
                              className="h-10 w-10 p-0 rounded-xl bg-orange-500 hover:bg-orange-600 text-white"
                              title="Procesar devolución"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => abrirModalEliminarVenta(venta)}
                              className="h-10 w-10 p-0 rounded-xl bg-red-500 hover:bg-red-600 text-white"
                              title="Eliminar venta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {ventasFiltradas.length === 0 && (
            <div className="p-12 text-center">
              <ShoppingCart
                className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`}
              />
              <p className={textSecondary} style={{ fontSize: "16px" }}>
                No hay ventas registradas hoy
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center">
            <PaginationCustom
              currentPage={paginaActual}
              totalPages={totalPaginas}
              onPageChange={setPaginaActual}
              itemsPerPage={itemsPorPagina}
              totalItems={ventasFiltradas.length}
            />
          </div>
        )}
      </div>

      {/* MODAL: Nueva Venta */}
      <Dialog open={modalVentaOpen} onOpenChange={setModalVentaOpen}>
        <DialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl p-0 overflow-hidden`}
          style={{ maxWidth: "1200px", width: "95vw", maxHeight: "90vh" }}
        >
          <div
            className="p-8 space-y-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 100px)" }}
          >
            <DialogHeader>
              <DialogTitle
                className={`${textPrimary}`}
                style={{ fontSize: "28px", fontWeight: 700 }}
              >
                {selectedVenta ? "Editar Venta" : "Nueva Venta"}
              </DialogTitle>
              <DialogDescription
                className={textSecondary}
                style={{ fontSize: "15px" }}
              >
                Completa los datos para registrar la venta
              </DialogDescription>
            </DialogHeader>

            {/* SECCIÓN 1: Cliente por Cédula */}
            <div className={`${bgCard} rounded-2xl p-6 border-2 ${border}`}>
              <h3
                className={`${textPrimary} mb-4`}
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Información del Cliente
              </h3>

              {!clienteEncontrado ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label
                        className={`${textPrimary} mb-2 block`}
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        Cédula del Cliente
                      </label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search
                            className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`}
                          />
                          <Input
                            type="text"
                            placeholder="Escribe DNI / Cédula / Pasaporte y presiona Enter"
                            value={cedulaCliente}
                            onChange={(e) => setCedulaCliente(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                buscarClientePorCedula();
                              }
                            }}
                            className={`pl-12 h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                            style={{ fontSize: "15px" }}
                          />
                        </div>
                        <Button
                          onClick={buscarClientePorCedula}
                          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-14 px-8"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          <Search className="w-5 h-5 mr-2" />
                          Buscar
                        </Button>
                      </div>
                    </div>

                    {/* Botón Cliente Genérico */}
                    <div className="text-center pt-2 border-t border-gray-300 dark:border-gray-600">
                      <Button
                        onClick={usarGenerico}
                        className={`${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        } ${textPrimary} rounded-xl h-12 px-6`}
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        El cliente no quiere dar cédula → Vender como Genérico
                      </Button>
                    </div>

                    {/* Formulario de creación rápida */}
                    {mostrarCrearCliente && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3 pt-4 border-t border-orange-300 dark:border-orange-600"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          <p
                            className="text-orange-500"
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            Cliente no encontrado. Crear nuevo cliente:
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              className={`${textPrimary} mb-2 block`}
                              style={{ fontSize: "13px", fontWeight: 600 }}
                            >
                              Nombre Completo *
                            </label>
                            <Input
                              type="text"
                              placeholder="Ej: Juan Pérez"
                              value={nuevoCliente.nombre}
                              onChange={(e) =>
                                setNuevoCliente({
                                  ...nuevoCliente,
                                  nombre: e.target.value,
                                })
                              }
                              className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: "14px" }}
                            />
                          </div>

                          <div>
                            <label
                              className={`${textPrimary} mb-2 block`}
                              style={{ fontSize: "13px", fontWeight: 600 }}
                            >
                              Teléfono
                            </label>
                            <Input
                              type="text"
                              placeholder="Ej: 3001234567"
                              value={nuevoCliente.telefono}
                              onChange={(e) =>
                                setNuevoCliente({
                                  ...nuevoCliente,
                                  telefono: e.target.value,
                                })
                              }
                              className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: "14px" }}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            className={`${textPrimary} mb-2 block`}
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            Dirección
                          </label>
                          <Input
                            type="text"
                            placeholder="Ej: Calle 123 #45-67"
                            value={nuevoCliente.direccion}
                            onChange={(e) =>
                              setNuevoCliente({
                                ...nuevoCliente,
                                direccion: e.target.value,
                              })
                            }
                            className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                            style={{ fontSize: "14px" }}
                          />
                        </div>

                        <Button
                          onClick={crearClienteRapido}
                          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-xl h-12"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Crear Cliente Rápido
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500 bg-opacity-10 border-2 border-green-500 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1">
                        <p
                          className="text-green-600 dark:text-green-400 mb-2"
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          {usarClienteGenerico
                            ? "👥 Cliente Genérico"
                            : "✓ Cliente Encontrado"}
                        </p>
                        <p
                          className={textPrimary}
                          style={{ fontSize: "18px", fontWeight: 700 }}
                        >
                          {clienteEncontrado.nombre}
                        </p>
                        <div
                          className={`${textSecondary} mt-2 space-y-1`}
                          style={{ fontSize: "13px" }}
                        >
                          <p>📋 Cédula: {clienteEncontrado.cedula}</p>
                          <p>📞 Teléfono: {clienteEncontrado.telefono}</p>
                          <p>📍 Dirección: {clienteEncontrado.direccion}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setClienteEncontrado(null);
                        setCedulaCliente("");
                        setUsarClienteGenerico(false);
                      }}
                      className="h-10 w-10 p-0 rounded-xl bg-red-500 hover:bg-red-600 text-white flex-shrink-0"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* SECCIÓN 2: Método de Pago */}
            <div className={`${bgCard} rounded-2xl p-6 border-2 ${border}`}>
              <h3
                className={`${textPrimary} mb-4`}
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Método de Pago
              </h3>

              <Select
                value={formData.metodoPago}
                onValueChange={(value) =>
                  setFormData({ ...formData, metodoPago: value })
                }
              >
                <SelectTrigger
                  className={`h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metodosPago.map((metodo) => (
                    <SelectItem key={metodo} value={metodo}>
                      {metodo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* SECCIÓN 3: Búsqueda de Productos */}
            <div className={`${bgCard} rounded-2xl p-6 border-2 ${border}`}>
              <h3
                className={`${textPrimary} mb-4`}
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Añadir Productos
              </h3>

              {/* Dropdown de Categorías */}
              <div className="mb-4">
                <Select
                  value={categoriaFiltro}
                  onValueChange={(value) => {
                    setCategoriaFiltro(value);
                    setBusquedaProducto("");
                  }}
                >
                  <SelectTrigger
                    className={`h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  >
                    <SelectValue placeholder="Filtrar por categoría..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las categorías</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`}
                />
                <Input
                  type="text"
                  placeholder="Buscar producto por nombre o código..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className={`pl-12 h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  style={{ fontSize: "15px" }}
                />
              </div>

              {/* Dropdown de productos */}
              {busquedaProducto && productosFiltrados.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 ${bgCard} border-2 ${border} rounded-xl overflow-hidden shadow-lg max-h-64 overflow-y-auto`}
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
                            <p
                              className={textPrimary}
                              style={{ fontSize: "14px", fontWeight: 600 }}
                            >
                              {producto.nombreComercial ||
                                producto.nombre ||
                                producto.nombreGenerico}
                            </p>
                            <p
                              className={textSecondary}
                              style={{ fontSize: "12px" }}
                            >
                              Stock: {producto.stock} unidades
                            </p>
                          </div>
                        </div>
                        <p
                          className="text-[#14B8A6]"
                          style={{ fontSize: "15px", fontWeight: 700 }}
                        >
                          ${producto.precio.toLocaleString("es-CO")}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* SECCIÓN 4: Lista de Productos (con scroll si >12 filas) */}
            {formData.productos.length > 0 && (
              <div
                className={`${bgCard} rounded-2xl border-2 ${border} overflow-hidden`}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3
                    className={`${textPrimary}`}
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Productos en la Venta ({formData.productos.length})
                  </h3>
                </div>

                {/* Lista con scroll si pasa de 12 filas */}
                <div style={{ maxHeight: "480px", overflowY: "auto" }}>
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {formData.productos.map((producto) => (
                      <div
                        key={producto.id}
                        className="p-4 hover:bg-[#14B8A6] hover:bg-opacity-5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {/* Icono */}
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-white" />
                          </div>

                          {/* Nombre */}
                          <div className="flex-1 min-w-[140px]">
                            <div
                              className={`${textPrimary} truncate`}
                              style={{ fontSize: "14px", fontWeight: 700 }}
                            >
                              {producto.nombre}
                            </div>
                            <div
                              className={`${textSecondary}`}
                              style={{ fontSize: "11px" }}
                            >
                              ${producto.precioUnitario.toLocaleString("es-CO")}{" "}
                              c/u
                            </div>
                          </div>

                          {/* Cantidad */}
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() =>
                                actualizarCantidad(
                                  producto.id,
                                  producto.cantidad - 1
                                )
                              }
                              disabled={producto.cantidad <= 1}
                              className="h-8 w-8 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-30"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={producto.cantidad}
                              onChange={(e) =>
                                actualizarCantidad(
                                  producto.id,
                                  Number(e.target.value) || 1
                                )
                              }
                              className={`h-8 w-14 text-center rounded-lg border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: "13px", fontWeight: 700 }}
                            />
                            <Button
                              onClick={() =>
                                actualizarCantidad(
                                  producto.id,
                                  producto.cantidad + 1
                                )
                              }
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
                              onChange={(e) =>
                                actualizarDescuento(
                                  producto.id,
                                  Number(e.target.value)
                                )
                              }
                              placeholder="%"
                              className={`h-8 text-center rounded-lg border-2 ${inputBorder} ${inputBg} ${inputText}`}
                              style={{ fontSize: "12px", fontWeight: 700 }}
                            />
                          </div>

                          {/* Subtotal */}
                          <div className="w-24 text-right">
                            <div
                              className="text-[#14B8A6]"
                              style={{ fontSize: "15px", fontWeight: 700 }}
                            >
                              ${producto.subtotal.toLocaleString("es-CO")}
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

            {/* SECCIÓN 5: RESUMEN DE VENTA (siempre visible y fijo) */}
            {formData.productos.length > 0 && (
              <div
                className={`${bgCard} rounded-2xl p-6 border-2 border-[#14B8A6] shadow-lg`}
              >
                <div className="grid grid-cols-2 gap-8">
                  {/* Columna izquierda - Totales */}
                  <div className="space-y-3">
                    <h4
                      className={`${textPrimary} mb-3`}
                      style={{ fontSize: "15px", fontWeight: 700 }}
                    >
                      Resumen de la Venta
                    </h4>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span
                        className={textSecondary}
                        style={{ fontSize: "14px" }}
                      >
                        Subtotal:
                      </span>
                      <span
                        className={textPrimary}
                        style={{ fontSize: "16px", fontWeight: 700 }}
                      >
                        $
                        {calcularSubtotal(formData.productos).toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span
                        className={textSecondary}
                        style={{ fontSize: "14px" }}
                      >
                        Descuento:
                      </span>
                      <span
                        className="text-red-500"
                        style={{ fontSize: "16px", fontWeight: 700 }}
                      >
                        -$
                        {calcularDescuentoTotal(
                          formData.productos
                        ).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <span
                        className={textSecondary}
                        style={{ fontSize: "14px" }}
                      >
                        IVA (16%):
                      </span>
                      <span
                        className={textPrimary}
                        style={{ fontSize: "16px", fontWeight: 700 }}
                      >
                        $
                        {calcularIva(formData.productos).toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t-2 border-[#14B8A6]">
                      <span
                        className={textPrimary}
                        style={{ fontSize: "18px", fontWeight: 700 }}
                      >
                        TOTAL:
                      </span>
                      <span
                        className="text-[#14B8A6]"
                        style={{ fontSize: "28px", fontWeight: 700 }}
                      >
                        $
                        {calcularTotal(formData.productos).toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Columna derecha - Pago (solo efectivo) */}
                  {formData.metodoPago === "Efectivo" ? (
                    <div className="space-y-3">
                      <h4
                        className={`${textPrimary} mb-3`}
                        style={{ fontSize: "15px", fontWeight: 700 }}
                      >
                        Información de Pago
                      </h4>

                      <div>
                        <label
                          className={`${textPrimary} mb-2 block`}
                          style={{ fontSize: "13px", fontWeight: 700 }}
                        >
                          Cliente pagó con:
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#14B8A6]" />
                          <Input
                            type="number"
                            min={0}
                            value={formData.montoPagado || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                montoPagado: Number(e.target.value),
                              })
                            }
                            placeholder="0"
                            className={`pl-11 h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} text-right`}
                            style={{ fontSize: "18px", fontWeight: 700 }}
                          />
                        </div>
                      </div>

                      {formData.montoPagado >=
                        calcularTotal(formData.productos) &&
                        formData.montoPagado > 0 && (
                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 shadow-md">
                            <div className="text-white text-center">
                              <div
                                style={{ fontSize: "13px", fontWeight: 600 }}
                              >
                                Cambio a devolver
                              </div>
                              <div
                                style={{ fontSize: "32px", fontWeight: 700 }}
                                className="mt-1"
                              >
                                ${calcularCambio().toLocaleString("es-CO")}
                              </div>
                            </div>
                          </div>
                        )}

                      {formData.montoPagado > 0 &&
                        formData.montoPagado <
                          calcularTotal(formData.productos) && (
                          <div className="bg-red-500 bg-opacity-10 border-2 border-red-500 rounded-xl p-3 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span
                              className="text-red-600 dark:text-red-400"
                              style={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              Monto insuficiente. Faltan $
                              {(
                                calcularTotal(formData.productos) -
                                formData.montoPagado
                              ).toLocaleString("es-CO")}
                            </span>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <CreditCard
                          className={`w-16 h-16 mx-auto mb-3 ${textSecondary}`}
                        />
                        <div
                          className={textSecondary}
                          style={{ fontSize: "14px" }}
                        >
                          Pago por {formData.metodoPago}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje cuando no hay productos */}
            {formData.productos.length === 0 && (
              <div
                className={`${bgCard} rounded-2xl p-12 border-2 ${border} text-center`}
              >
                <ShoppingCart
                  className={`w-16 h-16 mx-auto mb-4 ${textSecondary} opacity-50`}
                />
                <p className={textSecondary} style={{ fontSize: "15px" }}>
                  Busca y selecciona productos para comenzar la venta
                </p>
              </div>
            )}

            {/* BOTONES DE ACCIÓN (siempre visibles y fijos) */}
            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  setModalVentaOpen(false);
                  setCedulaCliente("");
                  setClienteEncontrado(null);
                  setMostrarCrearCliente(false);
                  setUsarClienteGenerico(false);
                }}
                className={`${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${textPrimary} rounded-xl h-12 px-8`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Cancelar
              </Button>

              <Button
                onClick={guardarVenta}
                disabled={
                  loading ||
                  formData.productos.length === 0 ||
                  !clienteEncontrado
                }
                className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9] hover:from-[#0D9488] hover:to-[#0284C7] text-white rounded-xl h-12 px-8 shadow-lg disabled:opacity-50"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {selectedVenta ? "Actualizar Venta" : "Registrar Venta"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Registrar Gasto */}
      <Dialog open={modalGastoOpen} onOpenChange={setModalGastoOpen}>
        <DialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl`}
          style={{ maxWidth: "600px" }}
        >
          <DialogHeader>
            <DialogTitle
              className={`${textPrimary}`}
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              Registrar Gasto del Día
            </DialogTitle>
            <DialogDescription
              className={textSecondary}
              style={{ fontSize: "14px" }}
            >
              Registra gastos operativos, materiales, servicios, etc.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <label
                className={`${textPrimary} mb-2 block`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Descripción del Gasto *
              </label>
              <Input
                type="text"
                placeholder="Ej: Compra de bolsas, luz, Uber del repartidor..."
                value={formGasto.descripcion}
                onChange={(e) =>
                  setFormGasto({ ...formGasto, descripcion: e.target.value })
                }
                className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                style={{ fontSize: "14px" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`${textPrimary} mb-2 block`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  Monto *
                </label>
                <div className="relative">
                  <DollarSign
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={formGasto.monto || ""}
                    onChange={(e) =>
                      setFormGasto({
                        ...formGasto,
                        monto: Number(e.target.value),
                      })
                    }
                    className={`pl-11 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`${textPrimary} mb-2 block`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  Categoría *
                </label>
                <Select
                  value={formGasto.categoria}
                  onValueChange={(value: any) =>
                    setFormGasto({ ...formGasto, categoria: value })
                  }
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Materiales">Materiales</SelectItem>
                    <SelectItem value="Servicios">Servicios</SelectItem>
                    <SelectItem value="Reparto">Reparto</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setModalGastoOpen(false)}
                className={`${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${textPrimary} rounded-xl h-12 px-8`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Cancelar
              </Button>

              <Button
                onClick={guardarGasto}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-8"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Guardar Gasto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Cierre de Caja */}
      <Dialog open={modalCierreOpen} onOpenChange={setModalCierreOpen}>
        <DialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl max-h-[90vh] overflow-y-auto`}
          style={{ maxWidth: "600px" }}
        >
          <DialogHeader>
            <DialogTitle
              className={`${textPrimary}`}
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              Cerrar Caja del Día
            </DialogTitle>
            <DialogDescription
              className={textSecondary}
              style={{ fontSize: "14px" }}
            >
              Revisa el resumen del día y confirma el cierre de caja
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Resumen completo */}
            <div
              className={`${
                isDark ? "bg-[#1a1d2e]" : "bg-gray-50"
              } rounded-2xl p-6 space-y-3`}
            >
              <h4
                className={`${textPrimary} mb-4`}
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                Resumen del Día
              </h4>

              <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                <span className={textSecondary} style={{ fontSize: "14px" }}>
                  Ventas Brutas:
                </span>
                <span
                  className="text-[#14B8A6]"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  ${ventasBrutas.toLocaleString("es-CO")}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-300 dark:border-gray-600">
                <span className={textSecondary} style={{ fontSize: "14px" }}>
                  Total Gastos:
                </span>
                <span
                  className="text-orange-500"
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  -${totalGastos.toLocaleString("es-CO")}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-t-2 border-green-500">
                <span
                  className={textPrimary}
                  style={{ fontSize: "16px", fontWeight: 700 }}
                >
                  Ganancia Neta:
                </span>
                <span
                  className="text-green-500"
                  style={{ fontSize: "24px", fontWeight: 700 }}
                >
                  ${gananciaNeta.toLocaleString("es-CO")}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 mt-4 border-t border-gray-300 dark:border-gray-600">
                <span className={textSecondary} style={{ fontSize: "14px" }}>
                  Efectivo Esperado:
                </span>
                <span
                  className={textPrimary}
                  style={{ fontSize: "16px", fontWeight: 700 }}
                >
                  ${efectivoEsperado.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* Efectivo real contado */}
            <div>
              <label
                className={`${textPrimary} mb-2 block`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Efectivo Real Contado *
              </label>
              <div className="relative">
                <DollarSign
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Cuenta el efectivo en caja"
                  value={formCierre.efectivoReal || ""}
                  onChange={(e) =>
                    setFormCierre({
                      ...formCierre,
                      efectivoReal: Number(e.target.value),
                    })
                  }
                  className={`pl-11 h-14 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} text-right`}
                  style={{ fontSize: "18px", fontWeight: 700 }}
                />
              </div>

              {/* Diferencia */}
              {formCierre.efectivoReal > 0 && (
                <div
                  className={`mt-3 p-4 rounded-xl ${
                    Math.abs(formCierre.efectivoReal - efectivoEsperado) < 1000
                      ? "bg-green-500 bg-opacity-10 border-2 border-green-500"
                      : "bg-yellow-500 bg-opacity-10 border-2 border-yellow-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={textSecondary}
                      style={{ fontSize: "14px" }}
                    >
                      Diferencia:
                    </span>
                    <span
                      className={`${
                        Math.abs(formCierre.efectivoReal - efectivoEsperado) <
                        1000
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      {formCierre.efectivoReal - efectivoEsperado >= 0
                        ? "+"
                        : ""}
                      $
                      {(
                        formCierre.efectivoReal - efectivoEsperado
                      ).toLocaleString("es-CO")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label
                className={`${textPrimary} mb-2 block`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Observaciones del Cierre
              </label>
              <Textarea
                placeholder="Notas adicionales, incidencias, comentarios..."
                value={formCierre.observaciones}
                onChange={(e) =>
                  setFormCierre({
                    ...formCierre,
                    observaciones: e.target.value,
                  })
                }
                className={`rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} min-h-[100px]`}
                style={{ fontSize: "14px" }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setModalCierreOpen(false)}
                className={`${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } ${textPrimary} rounded-xl h-12 px-8`}
                style={{ fontSize: "14px", fontWeight: 600 }}
              >
                Cancelar
              </Button>

              <Button
                onClick={cerrarCaja}
                className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white rounded-xl h-12 px-8"
                style={{ fontSize: "14px", fontWeight: 700 }}
              >
                <Lock className="w-5 h-5 mr-2" />
                Confirmar Cierre del Día
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Detalle de Venta */}
      <Dialog open={modalDetalleOpen} onOpenChange={setModalDetalleOpen}>
        <DialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl`}
          style={{ maxWidth: "800px" }}
        >
          {selectedVenta && (
            <>
              <DialogHeader>
                <DialogTitle
                  className={`${textPrimary}`}
                  style={{ fontSize: "24px", fontWeight: 700 }}
                >
                  Detalle de Venta
                </DialogTitle>
                <DialogDescription
                  className={textSecondary}
                  style={{ fontSize: "14px" }}
                >
                  {selectedVenta.codigo}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Info general */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={textSecondary} style={{ fontSize: "13px" }}>
                      Cliente
                    </p>
                    <p
                      className={textPrimary}
                      style={{ fontSize: "16px", fontWeight: 600 }}
                    >
                      {selectedVenta.cliente}
                    </p>
                    <p className={textSecondary} style={{ fontSize: "12px" }}>
                      CC: {selectedVenta.cedulaCliente}
                    </p>
                  </div>

                  <div>
                    <p className={textSecondary} style={{ fontSize: "13px" }}>
                      Fecha y Hora
                    </p>
                    <p
                      className={textPrimary}
                      style={{ fontSize: "16px", fontWeight: 600 }}
                    >
                      {new Date(selectedVenta.fecha).toLocaleDateString(
                        "es-ES"
                      )}
                    </p>
                    <p className={textSecondary} style={{ fontSize: "12px" }}>
                      {new Date(selectedVenta.fecha).toLocaleTimeString(
                        "es-ES"
                      )}
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4
                    className={`${textPrimary} mb-3`}
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Productos
                  </h4>
                  <div className="space-y-2">
                    {selectedVenta.productos.map((producto) => (
                      <div
                        key={producto.id}
                        className={`flex justify-between items-center p-3 rounded-xl ${
                          isDark ? "bg-[#1a1d2e]" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex-1">
                          <p
                            className={textPrimary}
                            style={{ fontSize: "14px", fontWeight: 600 }}
                          >
                            {producto.nombre}
                          </p>
                          <p
                            className={textSecondary}
                            style={{ fontSize: "12px" }}
                          >
                            {producto.cantidad} x $
                            {producto.precioUnitario.toLocaleString("es-CO")}
                            {producto.descuentoPorcentaje > 0 &&
                              ` (-${producto.descuentoPorcentaje}%)`}
                          </p>
                        </div>
                        <p
                          className="text-[#14B8A6]"
                          style={{ fontSize: "15px", fontWeight: 700 }}
                        >
                          ${producto.subtotal.toLocaleString("es-CO")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totales */}
                <div
                  className={`${
                    isDark ? "bg-[#1a1d2e]" : "bg-gray-50"
                  } rounded-2xl p-6 space-y-3`}
                >
                  <div className="flex justify-between">
                    <span className={textSecondary}>Subtotal:</span>
                    <span className={textPrimary} style={{ fontWeight: 600 }}>
                      ${selectedVenta.subtotal.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>Descuento:</span>
                    <span className="text-red-500" style={{ fontWeight: 600 }}>
                      -${selectedVenta.descuentoTotal.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={textSecondary}>IVA (16%):</span>
                    <span className={textPrimary} style={{ fontWeight: 600 }}>
                      ${selectedVenta.iva.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t-2 border-[#14B8A6]">
                    <span
                      className={textPrimary}
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      TOTAL:
                    </span>
                    <span
                      className="text-[#14B8A6]"
                      style={{ fontSize: "24px", fontWeight: 700 }}
                    >
                      ${selectedVenta.total.toLocaleString("es-CO")}
                    </span>
                  </div>

                  {selectedVenta.metodoPago === "Efectivo" && (
                    <>
                      <div className="flex justify-between pt-3 border-t border-gray-300 dark:border-gray-600">
                        <span className={textSecondary}>Pagó con:</span>
                        <span
                          className={textPrimary}
                          style={{ fontWeight: 600 }}
                        >
                          ${selectedVenta.montoPagado?.toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={textSecondary}>Cambio:</span>
                        <span
                          className="text-green-500"
                          style={{ fontWeight: 600 }}
                        >
                          ${selectedVenta.cambio?.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => setModalDetalleOpen(false)}
                    className={`${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    } ${textPrimary} rounded-xl h-12 px-8`}
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL: Confirmar Devolución */}
      <AlertDialog
        open={modalDevolucionOpen}
        onOpenChange={setModalDevolucionOpen}
      >
        <AlertDialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl`}
        >
          <AlertDialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className={`${textPrimary} text-center text-2xl`}>
              ¿Procesar devolución de esta venta?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} text-center text-base mt-2`}
            >
              Esta acción generará una nota de crédito y anulará la venta. El
              proceso no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className={`${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${textPrimary} rounded-xl h-12 px-6`}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={procesarDevolucion}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 px-6"
            >
              Sí, procesar devolución
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL: Confirmar Eliminar Venta */}
      <AlertDialog
        open={modalEliminarVentaOpen}
        onOpenChange={setModalEliminarVentaOpen}
      >
        <AlertDialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl`}
        >
          <AlertDialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className={`${textPrimary} text-center text-2xl`}>
              ¿Eliminar esta venta permanentemente?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} text-center text-base mt-2`}
            >
              Esta acción no se puede deshacer. La venta será eliminada de forma
              permanente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className={`${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${textPrimary} rounded-xl h-12 px-6`}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarVenta}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 px-6"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL: Confirmar Eliminar Gasto */}
      <AlertDialog
        open={modalEliminarGastoOpen}
        onOpenChange={setModalEliminarGastoOpen}
      >
        <AlertDialogContent
          className={`${bgCard} border-2 ${border} rounded-3xl`}
        >
          <AlertDialogHeader>
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className={`${textPrimary} text-center text-2xl`}>
              ¿Eliminar este gasto?
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} text-center text-base mt-2`}
            >
              Se restará del cierre del día. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className={`${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${textPrimary} rounded-xl h-12 px-6`}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarGasto}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-12 px-6"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mensaje de caja cerrada */}
      {cajaCerrada && cierreCaja && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-2xl max-w-md"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 style={{ fontSize: "16px", fontWeight: 700 }}>
                Caja Cerrada
              </h4>
              <p style={{ fontSize: "13px" }} className="opacity-90 mt-1">
                El cierre del día se realizó exitosamente
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={descargarReporteCierre}
                  className="bg-white text-purple-700 hover:bg-gray-100 rounded-xl h-9 px-4"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Reporte
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
