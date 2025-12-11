import { useState, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Download,
  Calendar,
  Users,
  ShoppingCart,
  Activity,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Star,
  Package2,
  Receipt,
  CreditCard,
} from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import { useStorageSync } from "../../hooks/useStorageSync";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ventasStorage,
  productosStorage,
  pedidosStorage,
  citasStorage,
} from "../../utils/localStorage";
import { toast } from "sonner";

interface EstadisticaCard {
  id: string;
  titulo: string;
  valor: string | number;
  cambio?: number;
  icono: any;
  color: string;
  descripcion: string;
}

export const Inicio = () => {
  const { user } = useAuth();
  const { isDark, bgCard, textPrimary, textSecondary, border, bgSecondary } =
    useDarkMode();
  const [vistaActual, setVistaActual] = useState<
    "general" | "ventas" | "productos" | "citas"
  >("general");

  // Hook de sincronización para recargar datos cuando cambia localStorage
  const syncTrigger = useStorageSync();

  // Cargar datos del localStorage - se recargará automáticamente con syncTrigger
  const ventas = useMemo(() => ventasStorage.getAll(), [syncTrigger]);
  const productos = useMemo(() => productosStorage.getAll(), [syncTrigger]);
  const pedidos = useMemo(() => pedidosStorage.getAll(), [syncTrigger]);
  const citas = useMemo(() => citasStorage.getAll(), [syncTrigger]);

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    const ventasCompletadas = ventas.filter((v) => v.estado === "Completada");
    const totalVentas = ventasCompletadas.reduce((sum, v) => sum + v.total, 0);
    const ventasHoy = ventasCompletadas.filter((v) => {
      const fecha = new Date(v.fecha);
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString();
    }).length;

    const productosActivos = productos.filter(
      (p) => p.estado === "Activo"
    ).length;
    const productosBajoStock = productos.filter((p) => p.stock < 20).length;

    const pedidosPendientes = pedidos.filter(
      (p) => p.estado === "Pendiente" || p.estado === "En Proceso"
    ).length;

    const citasHoy = citas.filter((c) => {
      const fecha = new Date(c.fecha);
      const hoy = new Date();
      return fecha.toDateString() === hoy.toDateString();
    }).length;

    return {
      totalVentas,
      ventasHoy,
      productosActivos,
      productosBajoStock,
      pedidosPendientes,
      citasHoy,
      cantidadVentas: ventasCompletadas.length,
      promedioVenta:
        ventasCompletadas.length > 0
          ? totalVentas / ventasCompletadas.length
          : 0,
    };
  }, [ventas, productos, pedidos, citas]);

  // Datos para gráfico de ventas por mes
  const datosVentasMensuales = useMemo(() => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    const datos = meses.map((mes, index) => {
      const ventasMes = ventas.filter((v) => {
        const fecha = new Date(v.fecha);
        return fecha.getMonth() === index && v.estado === "Completada";
      });
      const total = ventasMes.reduce((sum, v) => sum + v.total, 0);
      const cantidad = ventasMes.length;
      return { mes, ventas: total, cantidad };
    });
    return datos;
  }, [ventas]);

  // Datos para gráfico de productos más vendidos
  const productosTopVentas = useMemo(() => {
    const ventasProductos: {
      [key: string]: { nombre: string; cantidad: number; ingresos: number };
    } = {};

    ventas.forEach((venta) => {
      if (venta.estado === "Completada" && venta.productos) {
        venta.productos.forEach((prod) => {
          if (!ventasProductos[prod.nombre]) {
            ventasProductos[prod.nombre] = {
              nombre: prod.nombre,
              cantidad: 0,
              ingresos: 0,
            };
          }
          ventasProductos[prod.nombre].cantidad += prod.cantidad;
          ventasProductos[prod.nombre].ingresos += prod.precio * prod.cantidad;
        });
      }
    });

    return Object.values(ventasProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);
  }, [ventas]);

  // Datos para gráfico de métodos de pago
  const datosMetodosPago = useMemo(() => {
    const metodos: { [key: string]: number } = {};
    ventas.forEach((venta) => {
      if (venta.estado === "Completada") {
        const metodo = venta.metodoPago || "Efectivo";
        metodos[metodo] = (metodos[metodo] || 0) + venta.total;
      }
    });

    return Object.entries(metodos).map(([name, value]) => ({ name, value }));
  }, [ventas]);

  // Datos para gráfico de estados de pedidos
  const datosPedidos = useMemo(() => {
    const estados = ["Pendiente", "En Proceso", "Completado", "Cancelado"];
    return estados.map((estado) => ({
      estado,
      cantidad: pedidos.filter((p) => p.estado === estado).length,
    }));
  }, [pedidos]);

  // Datos de citas por estado
  const datosCitas = useMemo(() => {
    const estados = ["Pendiente", "Confirmada", "Completada", "Cancelada"];
    return estados.map((estado) => ({
      estado,
      cantidad: citas.filter((c) => c.estado === estado).length,
    }));
  }, [citas]);

  // Datos de ventas últimos 7 días
  const ventasUltimos7Dias = useMemo(() => {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const ventasDia = ventas.filter((v) => {
        const fechaVenta = new Date(v.fecha);
        return (
          fechaVenta.toDateString() === fecha.toDateString() &&
          v.estado === "Completada"
        );
      });
      const total = ventasDia.reduce((sum, v) => sum + v.total, 0);
      dias.push({
        dia: fecha.toLocaleDateString("es-ES", { weekday: "short" }),
        ventas: total,
        cantidad: ventasDia.length,
      });
    }
    return dias;
  }, [ventas]);

  // Productos con bajo stock
  const lowStockProducts = useMemo(() => {
    return productos
      .filter((p) => p.stock < 20 && p.estado === "Activo")
      .slice(0, 5)
      .map((p) => ({
        name: p.nombre,
        stock: p.stock,
        min: 20,
      }));
  }, [productos]);

  const handleDownloadReport = (reportId: string) => {
    toast.success("Generando reporte...", {
      description: "Se descargará el archivo en formato PDF y Excel",
    });
    setTimeout(() => {
      toast.success("Reporte generado exitosamente");
    }, 2000);
  };

  const COLORS = [
    "#63E6BE",
    "#3D4756",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#10B981",
    "#3B82F6",
    "#EC4899",
  ];

  // Tarjetas de estadísticas principales
  const tarjetasEstadisticas: EstadisticaCard[] = [
    {
      id: "1",
      titulo: "Total Ventas",
      valor: `₡${estadisticas.totalVentas.toLocaleString()}`,
      cambio: 12.5,
      icono: DollarSign,
      color: "#63E6BE",
      descripcion: `${estadisticas.cantidadVentas} ventas realizadas`,
    },
    {
      id: "2",
      titulo: "Ventas Hoy",
      valor: estadisticas.ventasHoy,
      cambio: 8.3,
      icono: ShoppingCart,
      color: "#8B5CF6",
      descripcion: "Ventas del día actual",
    },
    {
      id: "3",
      titulo: "Productos Activos",
      valor: estadisticas.productosActivos,
      cambio: 5.2,
      icono: Package,
      color: "#10B981",
      descripcion: `${estadisticas.productosBajoStock} bajo stock`,
    },
    {
      id: "4",
      titulo: "Pedidos Pendientes",
      valor: estadisticas.pedidosPendientes,
      cambio: -3.1,
      icono: Receipt,
      color: "#F59E0B",
      descripcion: "Requieren atención",
    },
    {
      id: "5",
      titulo: "Citas Hoy",
      valor: estadisticas.citasHoy,
      cambio: 0,
      icono: Calendar,
      color: "#3B82F6",
      descripcion: "Agendadas para hoy",
    },
    {
      id: "6",
      titulo: "Promedio Venta",
      valor: `₡${Math.round(estadisticas.promedioVenta).toLocaleString()}`,
      cambio: 7.8,
      icono: TrendingUp,
      color: "#EC4899",
      descripcion: "Por transacción",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${
          isDark
            ? "bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#63E6BE]"
            : "bg-gradient-to-r from-[#93C5FD] to-[#C4B5FD]"
        } rounded-2xl p-8 text-white shadow-lg transition-all duration-300`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1
              className="text-white mb-2"
              style={{ fontSize: "28px", fontWeight: 700 }}
            >
              ¡Bienvenido, {user?.nombre}!
            </h1>
            <p className="text-lg opacity-90">
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleDownloadReport("completo")}
              className="h-11 px-6 rounded-xl bg-white text-[#3D4756] hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300"
              style={{ fontWeight: 600 }}
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar Reporte Completo
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Navegación de vistas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`${bgCard} rounded-2xl border ${border} p-2 shadow-sm`}
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: "general", label: "Vista General", icon: Activity },
            { id: "ventas", label: "Ventas", icon: DollarSign },
            { id: "productos", label: "Productos", icon: Package },
            { id: "citas", label: "Citas", icon: Calendar },
          ].map((vista) => (
            <button
              key={vista.id}
              onClick={() => setVistaActual(vista.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                vistaActual === vista.id
                  ? "bg-[#63E6BE] text-white shadow-lg"
                  : `${
                      isDark
                        ? "text-gray-400 hover:bg-[#161b22]"
                        : "text-gray-600 hover:bg-gray-50"
                    }`
              }`}
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              <vista.icon className="w-4 h-4" />
              {vista.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tarjetasEstadisticas.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
            className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm hover:shadow-xl transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                }}
              >
                <stat.icono className="w-6 h-6" />
              </div>

              {stat.cambio !== undefined && stat.cambio !== 0 && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                    stat.cambio > 0
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {stat.cambio > 0 ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )}
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>
                    {Math.abs(stat.cambio)}%
                  </span>
                </div>
              )}
            </div>

            <h3
              className={`${textSecondary} mb-2`}
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              {stat.titulo}
            </h3>

            <p
              className={textPrimary}
              style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}
            >
              {stat.valor}
            </p>

            <p className={textSecondary} style={{ fontSize: "12px" }}>
              {stat.descripcion}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Vista General */}
      <AnimatePresence mode="wait">
        {vistaActual === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de ventas últimos 7 días */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={textPrimary}
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      Ventas Últimos 7 Días
                    </h3>
                    <p className={textSecondary} style={{ fontSize: "13px" }}>
                      Tendencia semanal de ventas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-[#63E6BE]" />
                    <Button
                      onClick={() => handleDownloadReport("ventas-7dias")}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ventasUltimos7Dias}>
                    <defs>
                      <linearGradient
                        id="colorVentas"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#63E6BE"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#63E6BE"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#2d3748" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="dia"
                      stroke={isDark ? "#9ca3af" : "#6b7280"}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={isDark ? "#9ca3af" : "#6b7280"}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "white",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ventas"
                      stroke="#63E6BE"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVentas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Gráfico de métodos de pago */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={textPrimary}
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      Métodos de Pago
                    </h3>
                    <p className={textSecondary} style={{ fontSize: "13px" }}>
                      Distribución por tipo de pago
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-[#8B5CF6]" />
                    <Button
                      onClick={() => handleDownloadReport("metodos-pago")}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={datosMetodosPago}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosMetodosPago.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "white",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Gráfico de estados de pedidos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3
                      className={textPrimary}
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      Estados de Pedidos
                    </h3>
                    <p className={textSecondary} style={{ fontSize: "13px" }}>
                      Distribución por estado
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package2 className="w-6 h-6 text-[#F59E0B]" />
                    <Button
                      onClick={() => handleDownloadReport("pedidos")}
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 rounded-lg"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosPedidos}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#2d3748" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="estado"
                      stroke={isDark ? "#9ca3af" : "#6b7280"}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={isDark ? "#9ca3af" : "#6b7280"}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "white",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                      {datosPedidos.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Stock bajo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle size={24} className="text-[#FBCFE8]" />
                  <h3
                    className={textPrimary}
                    style={{ fontSize: "18px", fontWeight: 700 }}
                  >
                    Stock Bajo
                  </h3>
                </div>
                <div className="space-y-4">
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p
                            className={textPrimary}
                            style={{ fontSize: "14px" }}
                          >
                            {product.name}
                          </p>
                          <span className="text-sm text-[#9f1239]">
                            {product.stock} / {product.min}
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 ${
                            isDark ? "bg-gray-700" : "bg-gray-100"
                          } rounded-full overflow-hidden`}
                        >
                          <div
                            className="h-full bg-[#FBCFE8] rounded-full transition-all duration-300"
                            style={{
                              width: `${(product.stock / product.min) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={textSecondary} style={{ fontSize: "14px" }}>
                      No hay productos con stock bajo
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Vista de Ventas */}
        {vistaActual === "ventas" && (
          <motion.div
            key="ventas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6"
          >
            {/* Gráfico de ventas mensuales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={textPrimary}
                    style={{ fontSize: "18px", fontWeight: 700 }}
                  >
                    Ventas por Mes
                  </h3>
                  <p className={textSecondary} style={{ fontSize: "13px" }}>
                    Análisis mensual del año actual
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#63E6BE]" />
                  <Button
                    onClick={() => handleDownloadReport("ventas-mensuales")}
                    className="h-10 px-4 rounded-xl bg-[#63E6BE] text-white hover:bg-[#4ec9a3] shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reporte
                  </Button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={datosVentasMensuales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#2d3748" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="mes"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="ventas" fill="#63E6BE" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* Vista de Productos */}
        {vistaActual === "productos" && (
          <motion.div
            key="productos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6"
          >
            {/* Productos más vendidos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3
                    className={textPrimary}
                    style={{ fontSize: "18px", fontWeight: 700 }}
                  >
                    Productos Más Vendidos
                  </h3>
                  <p className={textSecondary} style={{ fontSize: "13px" }}>
                    Top 8 productos por cantidad vendida
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-[#F59E0B]" />
                  <Button
                    onClick={() => handleDownloadReport("productos-top")}
                    className="h-10 px-4 rounded-xl bg-[#63E6BE] text-white hover:bg-[#4ec9a3] shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Reporte
                  </Button>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productosTopVentas} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#2d3748" : "#e2e8f0"}
                  />
                  <XAxis
                    type="number"
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={150}
                    stroke={isDark ? "#9ca3af" : "#6b7280"}
                    style={{ fontSize: "11px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                    {productosTopVentas.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* Vista de Citas */}
        {vistaActual === "citas" && (
          <motion.div
            key="citas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Estadísticas de citas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className={textPrimary}
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  Estadísticas de Citas
                </h3>
                <Button
                  onClick={() => handleDownloadReport("citas-stats")}
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {datosCitas.map((item, index) => {
                  const color = COLORS[index % COLORS.length];
                  const total = datosCitas.reduce(
                    (sum, d) => sum + d.cantidad,
                    0
                  );
                  const porcentaje =
                    total > 0 ? ((item.cantidad / total) * 100).toFixed(1) : 0;

                  return (
                    <div key={item.estado}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={textPrimary}
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          {item.estado}
                        </span>
                        <span
                          className={textSecondary}
                          style={{ fontSize: "13px" }}
                        >
                          {item.cantidad} ({porcentaje}%)
                        </span>
                      </div>
                      <div
                        className={`w-full h-2.5 rounded-full ${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className="h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${porcentaje}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`mt-6 pt-6 border-t ${border}`}>
                <div className="flex items-center justify-between">
                  <span className={textSecondary} style={{ fontSize: "14px" }}>
                    Total de Citas
                  </span>
                  <span
                    className={textPrimary}
                    style={{ fontSize: "24px", fontWeight: 700 }}
                  >
                    {datosCitas.reduce((sum, d) => sum + d.cantidad, 0)}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Gráfico circular de citas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${bgCard} rounded-2xl border ${border} p-6 shadow-sm`}
            >
              <h3
                className={textPrimary}
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "24px",
                }}
              >
                Distribución de Citas
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosCitas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, cantidad }) => `${estado}: ${cantidad}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {datosCitas.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "white",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
