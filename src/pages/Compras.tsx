import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  Edit,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Package,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import {
  useCompras,
  useProductos,
  useProveedores,
  useCategorias,
} from "../hooks/useEntities";
import { motion, AnimatePresence } from "motion/react";

interface ComprasProps {
  user: any;
}

interface ProductoCarrito {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export default function Compras({ user }: ComprasProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
    modalBg,
    tableHeader,
    tableRow,
  } = useDarkMode();

  // ✅ Usar hooks globales
  const {
    items: compras,
    add: addCompra,
    update: updateCompra,
    remove: removeCompra,
  } = useCompras();
  const { items: productos } = useProductos();
  const { items: proveedores } = useProveedores();
  const { items: categorias } = useCategorias();

  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<
    "Todas" | "Pendiente" | "Recibida" | "Cancelada"
  >("Todas");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompra, setSelectedCompra] = useState<any>(null);

  // Formulario Nueva Compra
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [estadoCompra, setEstadoCompra] = useState<
    "Pendiente" | "Recibida" | "Cancelada"
  >("Pendiente");
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const productsPerPage = 6;

  // Productos activos
  const productosActivos = useMemo(() => {
    return productos.filter((p) => p.estado === "Activo");
  }, [productos]);

  // Filtrar productos para mostrar
  const productosFiltrados = useMemo(() => {
    let filtered = productosActivos;

    // Filtrar por proveedor si está seleccionado
    if (proveedorSeleccionado) {
      // En un escenario real, los productos tendrían proveedorId
      // Por ahora mostramos todos si hay proveedor seleccionado
      filtered = productosActivos;
    }

    // Filtrar por categoría
    if (categoriaSeleccionada) {
      filtered = filtered.filter((p) => p.categoria === categoriaSeleccionada);
    }

    // Filtrar por búsqueda de nombre
    if (busquedaProducto) {
      filtered = filtered.filter(
        (p) =>
          p.nombreComercial
            ?.toLowerCase()
            .includes(busquedaProducto.toLowerCase()) ||
          p.nombreGenerico
            ?.toLowerCase()
            .includes(busquedaProducto.toLowerCase())
      );
    }

    return filtered;
  }, [
    productosActivos,
    proveedorSeleccionado,
    categoriaSeleccionada,
    busquedaProducto,
  ]);

  // Paginación de productos
  const totalProductPages = Math.ceil(
    productosFiltrados.length / productsPerPage
  );
  const productosPaginados = productosFiltrados.slice(
    (currentProductPage - 1) * productsPerPage,
    currentProductPage * productsPerPage
  );

  // Calcular total del carrito
  const totalCarrito = carrito.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  // Filtrar compras
  const comprasFiltradas = useMemo(() => {
    return compras.filter((compra) => {
      const matchesSearch =
        compra.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        compra.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado =
        estadoFiltro === "Todas" || compra.estado === estadoFiltro;
      return matchesSearch && matchesEstado;
    });
  }, [compras, searchTerm, estadoFiltro]);

  // Paginación de compras
  const totalPages = Math.ceil(comprasFiltradas.length / itemsPerPage);
  const comprasPaginadas = comprasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openCreateModal = () => {
    setProveedorSeleccionado("");
    setCategoriaSeleccionada("");
    setBusquedaProducto("");
    setEstadoCompra("Pendiente");
    setCarrito([]);
    setCurrentProductPage(1);
    setModalOpen(true);
  };

  const openEditModal = (compra: any) => {
    setSelectedCompra(compra);
    setEditModalOpen(true);
  };

  const openDetailModal = (compra: any) => {
    setSelectedCompra(compra);
    setDetailModalOpen(true);
  };

  const openDeleteDialog = (compra: any) => {
    setSelectedCompra(compra);
    setDeleteDialogOpen(true);
  };

  const agregarAlCarrito = (producto: any) => {
    setCarrito((prev) => {
      const existing = prev.find((item) => item.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: producto.id,
          nombre: producto.nombreComercial || producto.nombreGenerico,
          cantidad: 1,
          precio: producto.precio,
        },
      ];
    });
    toast.success("Producto agregado al carrito");
  };

  const actualizarCantidad = (id: string, delta: number) => {
    setCarrito((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newCantidad = Math.max(1, item.cantidad + delta);
          return { ...item, cantidad: newCantidad };
        }
        return item;
      });
    });
  };

  const quitarDelCarrito = (id: string) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
    toast.success("Producto eliminado del carrito");
  };

  const handleCreateCompra = () => {
    if (!proveedorSeleccionado) {
      toast.error("Selecciona un proveedor");
      return;
    }

    if (carrito.length === 0) {
      toast.error("Agrega al menos un producto");
      return;
    }

    const proveedor = proveedores.find((p) => p.id === proveedorSeleccionado);

    const nuevaCompra = {
      id: `COMP-${Date.now()}`,
      fecha: new Date().toISOString(),
      proveedor: proveedor?.nombre || "",
      productos: carrito.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      total: totalCarrito,
      estado: estadoCompra,
      createdAt: new Date().toISOString(),
    };

    addCompra(nuevaCompra);

    toast.success("¡Compra registrada exitosamente!", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });

    setModalOpen(false);
  };

  const handleUpdateEstado = () => {
    if (!selectedCompra) return;

    updateCompra(selectedCompra.id, { estado: selectedCompra.estado });

    toast.success("Estado actualizado correctamente");
    setEditModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedCompra) return;

    removeCompra(selectedCompra.id);

    toast.success("Compra eliminada correctamente");
    setDeleteDialogOpen(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Recibida":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          border: "border-green-500/20",
        };
      case "Pendiente":
        return {
          bg: "bg-yellow-500/10",
          text: "text-yellow-500",
          border: "border-yellow-500/20",
        };
      case "Cancelada":
        return {
          bg: "bg-red-500/10",
          text: "text-red-500",
          border: "border-red-500/20",
        };
      default:
        return {
          bg: "bg-gray-500/10",
          text: "text-gray-500",
          border: "border-gray-500/20",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Gestión de Compras
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Registra y gestiona las compras a proveedores
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Compra
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Total Compras
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {compras.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Pendientes
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {compras.filter((c) => c.estado === "Pendiente").length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Recibidas
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {compras.filter((c) => c.estado === "Recibida").length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Monto Total
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "16px", fontWeight: 700 }}
              >
                ${compras.reduce((sum, c) => sum + c.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div
        className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#63E6BE]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por proveedor o ID..."
              className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${
                isDark ? "text-white placeholder-gray-400" : ""
              } focus:border-[#63E6BE]`}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setEstadoFiltro("Todas")}
              className={`rounded-xl ${
                estadoFiltro === "Todas"
                  ? "bg-[#63E6BE] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Todas
            </Button>
            <Button
              onClick={() => setEstadoFiltro("Pendiente")}
              className={`rounded-xl ${
                estadoFiltro === "Pendiente"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Pendientes
            </Button>
            <Button
              onClick={() => setEstadoFiltro("Recibida")}
              className={`rounded-xl ${
                estadoFiltro === "Recibida"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Recibidas
            </Button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div
        className={`${bgCard} rounded-xl border ${border} overflow-hidden shadow-sm transition-colors duration-300`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  ID Compra
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {comprasPaginadas.map((compra) => {
                const estadoStyle = getEstadoColor(compra.estado);
                return (
                  <tr key={compra.id} className={tableRow}>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textPrimary}`}
                    >
                      {compra.id}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondary}`}
                    >
                      {new Date(compra.fecha).toLocaleDateString("es-ES")}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}
                    >
                      {compra.proveedor}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondary}`}
                    >
                      {compra.productos?.length || 0} producto(s)
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${textPrimary}`}
                    >
                      ${compra.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full ${estadoStyle.bg} ${estadoStyle.text} border ${estadoStyle.border} text-xs font-semibold`}
                      >
                        {compra.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => openDetailModal(compra)}
                          className="h-8 w-8 p-0 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openEditModal(compra)}
                          className="h-8 w-8 p-0 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(compra)}
                          className="h-8 w-8 p-0 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {comprasPaginadas.length === 0 && (
          <div className="text-center py-12">
            <Package className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
            <p className={textSecondary}>No se encontraron compras</p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className={textSecondary} style={{ fontSize: "14px" }}>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a{" "}
              {Math.min(currentPage * itemsPerPage, comprasFiltradas.length)} de{" "}
              {comprasFiltradas.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className={textPrimary}>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nueva Compra */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} rounded-2xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              Nueva Compra
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Proveedor y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block ${textPrimary} mb-2 font-semibold`}>
                  Proveedor *
                </label>
                <Select
                  value={proveedorSeleccionado}
                  onValueChange={setProveedorSeleccionado}
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
                  >
                    <SelectValue placeholder="Selecciona un proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {proveedores.filter((p) => p.estado === "Activo").length ===
                    0 ? (
                      <SelectItem value="__none" disabled>
                        No hay proveedores
                      </SelectItem>
                    ) : (
                      proveedores
                        .filter((p) => p.estado === "Activo")
                        .map((proveedor) => (
                          <SelectItem key={proveedor.id} value={proveedor.id}>
                            {proveedor.nombre}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block ${textPrimary} mb-2 font-semibold`}>
                  Estado de la Compra *
                </label>
                <Select
                  value={estadoCompra}
                  onValueChange={(value: any) => setEstadoCompra(value)}
                >
                  <SelectTrigger
                    className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Recibida">Recibida</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filtros de Productos */}
            <div className="space-y-4">
              <h3 className={`${textPrimary} font-bold text-lg`}>
                Seleccionar Productos
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textPrimary} mb-2 font-semibold`}>
                    Categoría
                  </label>
                  <Select
                    value={categoriaSeleccionada}
                    onValueChange={setCategoriaSeleccionada}
                  >
                    <SelectTrigger
                      className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
                    >
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.filter((c) => c.estado === "Activo")
                        .length === 0 ? (
                        <SelectItem value="__none" disabled>
                          No hay categorías
                        </SelectItem>
                      ) : (
                        categorias
                          .filter((c) => c.estado === "Activo")
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.nombre}>
                              {cat.nombre}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                  {categoriaSeleccionada && (
                    <button
                      onClick={() => setCategoriaSeleccionada("")}
                      className={`mt-2 text-xs ${textSecondary} hover:text-[#63E6BE] underline`}
                    >
                      Limpiar filtro
                    </button>
                  )}
                </div>

                <div>
                  <label className={`block ${textPrimary} mb-2 font-semibold`}>
                    Buscar Producto
                  </label>
                  <Input
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    placeholder="Buscar por nombre..."
                    className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
                  />
                </div>
              </div>

              {/* Grid de Productos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnimatePresence>
                  {productosPaginados.map((producto, index) => (
                    <motion.div
                      key={producto.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${bgCard} rounded-xl border ${border} p-4 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-[#63E6BE] bg-[#63E6BE]/10 px-2 py-1 rounded inline-block mb-2">
                            {producto.categoria}
                          </div>
                          <h4
                            className={`${textPrimary} font-bold text-sm mb-1`}
                          >
                            {producto.nombreComercial ||
                              producto.nombreGenerico}
                          </h4>
                          <p className={`${textSecondary} text-xs mb-2`}>
                            {producto.laboratorio}
                          </p>
                          <p className={`${textPrimary} font-bold text-lg`}>
                            ${producto.precio.toLocaleString()}
                          </p>
                          <p className={`${textSecondary} text-xs`}>
                            Stock: {producto.stock}
                          </p>
                        </div>
                        <Button
                          onClick={() => agregarAlCarrito(producto)}
                          className="w-full mt-3 bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-lg h-9"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {productosFiltrados.length === 0 && (
                <div className="text-center py-8">
                  <Package
                    className={`w-12 h-12 mx-auto mb-2 ${textSecondary}`}
                  />
                  <p className={textSecondary}>No se encontraron productos</p>
                </div>
              )}

              {/* Paginación de productos */}
              {totalProductPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <Button
                    onClick={() =>
                      setCurrentProductPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentProductPage === 1}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className={textPrimary} style={{ fontSize: "14px" }}>
                    {currentProductPage} / {totalProductPages}
                  </span>
                  <Button
                    onClick={() =>
                      setCurrentProductPage((prev) =>
                        Math.min(totalProductPages, prev + 1)
                      )
                    }
                    disabled={currentProductPage === totalProductPages}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Carrito de Compra */}
            {carrito.length > 0 && (
              <div
                className={`p-4 rounded-xl border-2 ${border} bg-gray-50 dark:bg-gray-800/50`}
              >
                <h3
                  className={`${textPrimary} font-bold text-lg mb-4 flex items-center`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2 text-[#63E6BE]" />
                  Carrito de Compra ({carrito.length} productos)
                </h3>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${border} bg-white dark:bg-gray-900`}
                    >
                      <div className="flex-1">
                        <h4 className={`${textPrimary} font-semibold text-sm`}>
                          {item.nombre}
                        </h4>
                        <p className={`${textSecondary} text-xs`}>
                          ${item.precio.toLocaleString()} c/u
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => actualizarCantidad(item.id, -1)}
                          className="h-7 w-7 p-0 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span
                          className={`${textPrimary} font-bold w-8 text-center`}
                        >
                          {item.cantidad}
                        </span>
                        <Button
                          onClick={() => actualizarCantidad(item.id, 1)}
                          className="h-7 w-7 p-0 rounded-lg bg-[#63E6BE] text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => quitarDelCarrito(item.id)}
                          className="h-7 w-7 p-0 rounded-lg bg-red-500 text-white ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className={`${textPrimary} font-bold`}>
                        ${(item.precio * item.cantidad).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className={`${textPrimary} font-bold text-lg`}>
                    Total:
                  </span>
                  <span className="text-[#63E6BE] font-bold text-2xl">
                    ${totalCarrito.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setModalOpen(false)}
                className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCompra}
                className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
              >
                Registrar Compra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Estado */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              Editar Estado de Compra
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className={`block ${textPrimary} mb-2 font-semibold`}>
                ID Compra
              </label>
              <Input
                value={selectedCompra?.id || ""}
                disabled
                className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
              />
            </div>

            <div>
              <label className={`block ${textPrimary} mb-2 font-semibold`}>
                Estado *
              </label>
              <Select
                value={selectedCompra?.estado || ""}
                onValueChange={(value) =>
                  setSelectedCompra({ ...selectedCompra, estado: value })
                }
              >
                <SelectTrigger
                  className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Recibida">Recibida</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setEditModalOpen(false)}
                className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateEstado}
                className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-2xl`}>
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              Detalle de Compra
            </DialogTitle>
          </DialogHeader>

          {selectedCompra && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block ${textSecondary} mb-1 text-sm`}>
                    ID Compra
                  </label>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedCompra.id}
                  </p>
                </div>
                <div>
                  <label className={`block ${textSecondary} mb-1 text-sm`}>
                    Fecha
                  </label>
                  <p className={`${textPrimary} font-semibold`}>
                    {new Date(selectedCompra.fecha).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div>
                  <label className={`block ${textSecondary} mb-1 text-sm`}>
                    Proveedor
                  </label>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedCompra.proveedor}
                  </p>
                </div>
                <div>
                  <label className={`block ${textSecondary} mb-1 text-sm`}>
                    Estado
                  </label>
                  <span
                    className={`px-3 py-1 rounded-full ${
                      getEstadoColor(selectedCompra.estado).bg
                    } ${getEstadoColor(selectedCompra.estado).text} border ${
                      getEstadoColor(selectedCompra.estado).border
                    } text-xs font-semibold`}
                  >
                    {selectedCompra.estado}
                  </span>
                </div>
              </div>

              <div>
                <label className={`block ${textSecondary} mb-2 text-sm`}>
                  Productos
                </label>
                <div className="space-y-2">
                  {selectedCompra.productos?.map(
                    (producto: any, index: number) => (
                      <div
                        key={index}
                        className={`flex justify-between items-center p-3 rounded-lg border ${border}`}
                      >
                        <div>
                          <p className={`${textPrimary} font-semibold`}>
                            {producto.nombre}
                          </p>
                          <p className={`${textSecondary} text-xs`}>
                            Cantidad: {producto.cantidad}
                          </p>
                        </div>
                        <p className={`${textPrimary} font-bold`}>
                          $
                          {(
                            producto.precio * producto.cantidad
                          ).toLocaleString()}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className={`flex justify-between items-center p-4 rounded-xl bg-[#63E6BE]/10 border-2 border-[#63E6BE]`}
              >
                <span className={`${textPrimary} font-bold text-lg`}>
                  Total:
                </span>
                <span className="text-[#63E6BE] font-bold text-2xl">
                  ${selectedCompra.total?.toLocaleString()}
                </span>
              </div>

              <Button
                onClick={() => setDetailModalOpen(false)}
                className="w-full h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${modalBg} rounded-2xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={textPrimary}>
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className={textSecondary}>
              Esta acción eliminará la compra permanentemente. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
