import { useState, useEffect, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  X,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { useDarkMode } from "../hooks/useDarkMode";
import { useProductos, useCategorias } from "../hooks/useEntities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

interface ProductosClienteProps {
  user: any;
}

interface CartItem {
  id: string;
  nombreComercial: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  requiereReceta?: boolean;
}

export default function ProductosCliente({ user }: ProductosClienteProps) {
  const {
    isDark,
    bgPrimary,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
    inputText,
  } = useDarkMode();

  // ✅ Usar hooks globales para sincronización automática
  const { items: productos } = useProductos();
  const { items: categorias } = useCategorias();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(1000000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);

  const ITEMS_PER_PAGE = 12;

  // Load cart
  useEffect(() => {
    const savedCart = localStorage.getItem("syspharma_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("syspharma_cart", JSON.stringify(cart));
  }, [cart]);

  // Categorías disponibles
  const categoriasDisponibles = useMemo(() => {
    return [
      "Todas",
      ...categorias.filter((c) => c.estado === "Activo").map((c) => c.nombre),
    ];
  }, [categorias]);

  // Filtrar solo productos activos, con stock y marcados para mostrarse en catálogo
  const productosActivos = useMemo(() => {
    return productos.filter(
      (p) =>
        p.estado === "Activo" &&
        p.stock > 0 &&
        ((p as any).mostrarEnCatalogo ?? true)
    );
  }, [productos]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return productosActivos.filter((producto) => {
      const matchesSearch =
        producto.nombreComercial
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        producto.nombreGenerico
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        producto.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todas" || producto.categoria === selectedCategory;
      const matchesPrecio =
        producto.precio >= precioMin && producto.precio <= precioMax;

      return matchesSearch && matchesCategory && matchesPrecio;
    });
  }, [productosActivos, searchTerm, selectedCategory, precioMin, precioMax]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const addToCart = (producto: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    toast.success("Producto añadido al carrito", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Producto eliminado");
  };

  const totalCart = cart.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
  const envio = totalCart >= 50000 ? 0 : 5000;

  const procederPago = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    const pedido = {
      id: `PED-${Date.now()}`,
      clienteId: user?.id || "cliente-1",
      clienteNombre: user?.nombre || "Cliente",
      fecha: new Date().toISOString(),
      productos: cart.map((item) => ({
        productoId: item.id,
        nombre: item.nombreComercial,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
      total: totalCart + envio,
      estado: "Pendiente",
      createdAt: new Date().toISOString(),
    };

    const pedidos = JSON.parse(
      localStorage.getItem("syspharma_pedidos") || "[]"
    );
    pedidos.push(pedido);
    localStorage.setItem("syspharma_pedidos", JSON.stringify(pedidos));

    toast.success("¡Pedido enviado exitosamente!", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });

    setCart([]);
    setShowCart(false);
  };

  return (
    <div className={`min-h-screen ${bgPrimary} transition-colors duration-300`}>
      {/* Header de la página */}
      <div
        className={`${bgCard} border-b-2 ${border} transition-colors duration-300`}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1
            className={`${textPrimary} mb-4 transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Todos los Productos
          </h1>

          {/* Buscador y vista */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14B8A6] w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar productos..."
                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} outline-none focus:border-[#14B8A6] transition-colors duration-300`}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-[#14B8A6] text-white"
                    : `${bgCard} ${textSecondary} hover:bg-[#14B8A6]/10`
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === "list"
                    ? "bg-[#14B8A6] text-white"
                    : `${bgCard} ${textSecondary} hover:bg-[#14B8A6]/10`
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filtros laterales */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } md:block w-full md:w-64 flex-shrink-0`}
          >
            <div
              className={`${bgCard} rounded-2xl p-6 border-2 ${border} sticky top-4 transition-colors duration-300`}
            >
              <h3
                className={`${textPrimary} mb-6 transition-colors duration-300`}
                style={{ fontSize: "18px", fontWeight: 700 }}
              >
                Filtros
              </h3>

              {/* Categoría */}
              <div className="mb-6">
                <h4
                  className={`${textPrimary} mb-3 transition-colors duration-300`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  Categoría
                </h4>
                <div className="space-y-2">
                  {categoriasDisponibles.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="categoria"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="w-4 h-4 text-teal-500"
                      />
                      <span
                        className={`text-sm ${textSecondary} transition-colors duration-300`}
                      >
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rango de precio */}
              <div className="mb-6">
                <h4
                  className={`${textPrimary} mb-3 transition-colors duration-300`}
                  style={{ fontSize: "14px", fontWeight: 600 }}
                >
                  Rango de Precio
                </h4>
                <div className="space-y-3">
                  <div>
                    <label
                      className={`text-xs ${textSecondary} transition-colors duration-300`}
                    >
                      Mínimo
                    </label>
                    <input
                      type="number"
                      value={precioMin}
                      onChange={(e) => setPrecioMin(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm transition-colors duration-300`}
                    />
                  </div>
                  <div>
                    <label
                      className={`text-xs ${textSecondary} transition-colors duration-300`}
                    >
                      Máximo
                    </label>
                    <input
                      type="number"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(Number(e.target.value))}
                      className={`w-full px-3 py-2 rounded-lg border ${inputBorder} ${inputBg} ${inputText} text-sm transition-colors duration-300`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            <p
              className={`text-sm ${textSecondary} mb-6 transition-colors duration-300`}
            >
              Mostrando {paginatedProducts.length} de {filteredProducts.length}{" "}
              productos
            </p>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedProducts.map((producto) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${bgCard} rounded-2xl border-2 ${border} overflow-hidden hover:shadow-xl transition-all group`}
                  >
                    <div
                      className={`relative aspect-square overflow-hidden ${
                        isDark ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <img
                        src={producto.imagen}
                        alt={producto.nombreComercial}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />

                      {producto.descuento && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold text-white bg-red-500">
                          -{producto.descuento}%
                        </div>
                      )}

                      {producto.nuevo && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold text-white bg-orange-500">
                          NUEVO
                        </div>
                      )}

                      <button
                        onClick={() =>
                          setSelectedProduct(producto) &&
                          setShowProductDetail(true)
                        }
                        className={`absolute top-3 right-3 w-10 h-10 rounded-full ${
                          isDark
                            ? "bg-gray-700/90 hover:bg-gray-700"
                            : "bg-white/90 hover:bg-white"
                        } flex items-center justify-center transition-all`}
                      >
                        <Info className={`w-5 h-5 ${"text-gray-400"}`} />
                      </button>
                    </div>

                    <div className="p-4">
                      <h3
                        className={`text-sm ${textPrimary} mb-2 line-clamp-2 h-10 transition-colors duration-300`}
                        style={{ fontWeight: 700 }}
                      >
                        {producto.nombreComercial}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <p
                          className={`${textPrimary} transition-colors duration-300`}
                          style={{ fontSize: "20px", fontWeight: 700 }}
                        >
                          ${producto.precio.toLocaleString()}
                        </p>
                        {producto.precioAnterior && (
                          <p
                            className={`text-sm ${textSecondary} line-through transition-colors duration-300`}
                          >
                            ${producto.precioAnterior.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(producto)}
                        className="w-full py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-all hover:scale-105"
                        style={{ fontWeight: 700 }}
                      >
                        Añadir al Carrito
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                {paginatedProducts.map((producto) => (
                  <motion.div
                    key={producto.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${bgCard} rounded-2xl border-2 ${border} overflow-hidden hover:shadow-lg transition-all flex`}
                  >
                    <img
                      src={producto.imagen}
                      alt={producto.nombreComercial}
                      className="w-32 h-32 object-cover"
                    />
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div>
                        <h3
                          className={`${textPrimary} mb-2 transition-colors duration-300`}
                          style={{ fontSize: "16px", fontWeight: 700 }}
                        >
                          {producto.nombreComercial}
                        </h3>
                        <p
                          className={`text-sm ${textSecondary} mb-2 transition-colors duration-300`}
                        >
                          {producto.laboratorio}
                        </p>
                        <div className="flex items-center gap-2">
                          <p
                            className={`${textPrimary} transition-colors duration-300`}
                            style={{ fontSize: "20px", fontWeight: 700 }}
                          >
                            ${producto.precio.toLocaleString()}
                          </p>
                          {producto.precioAnterior && (
                            <p
                              className={`text-sm ${textSecondary} line-through transition-colors duration-300`}
                            >
                              ${producto.precioAnterior.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(producto)}
                        className="px-6 py-3 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white transition-all"
                        style={{ fontWeight: 700 }}
                      >
                        Añadir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${bgCard} hover:bg-[#14B8A6]/10 disabled:opacity-50 ${textPrimary} transition-all`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        currentPage === page
                          ? "bg-[#14B8A6] text-white"
                          : `${bgCard} ${textPrimary} hover:bg-[#14B8A6]/10`
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${bgCard} hover:bg-[#14B8A6]/10 disabled:opacity-50 ${textPrimary} transition-all`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón carrito flotante */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#14B8A6] hover:bg-[#0D9488] shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-40"
      >
        <ShoppingBag className="text-white w-7 h-7" />
        {totalItems > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{totalItems}</span>
          </div>
        )}
      </button>

      {/* Panel del carrito */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed right-0 top-0 h-full w-full max-w-md ${bgCard} shadow-2xl z-50 flex flex-col transition-colors duration-300`}
            >
              <div
                className={`p-6 border-b-2 ${border} transition-colors duration-300`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`${textPrimary} transition-colors duration-300`}
                    style={{ fontSize: "22px", fontWeight: 700 }}
                  >
                    Mi Carrito
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className={`p-2 hover:bg-[#14B8A6]/10 rounded-lg transition-all ${textPrimary}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {cart.length > 0 && (
                  <p
                    className={`text-sm ${textSecondary} mt-1 transition-colors duration-300`}
                  >
                    {totalItems} {totalItems === 1 ? "producto" : "productos"}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <ShoppingBag
                      className={`${textSecondary} mb-4 w-20 h-20 transition-colors duration-300`}
                    />
                    <p
                      className={`${textSecondary} transition-colors duration-300`}
                      style={{ fontSize: "18px", fontWeight: 600 }}
                    >
                      Tu carrito está vacío
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 rounded-xl border-2 ${border} transition-colors duration-300`}
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombreComercial}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4
                            className={`text-sm ${textPrimary} mb-1 line-clamp-2 transition-colors duration-300`}
                            style={{ fontWeight: 600 }}
                          >
                            {item.nombreComercial}
                          </h4>
                          <p
                            className={`mb-2 transition-colors duration-300`}
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#14B8A6",
                            }}
                          >
                            ${item.precio.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className={`w-8 h-8 rounded-lg ${
                                isDark
                                  ? "bg-gray-700 hover:bg-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200"
                              } font-bold transition-all`}
                            >
                              -
                            </button>
                            <span
                              className={`${textPrimary} w-8 text-center transition-colors duration-300`}
                              style={{ fontWeight: 600 }}
                            >
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className={`w-8 h-8 rounded-lg ${
                                isDark
                                  ? "bg-gray-700 hover:bg-gray-600"
                                  : "bg-gray-100 hover:bg-gray-200"
                              } font-bold transition-all`}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-500 hover:text-red-700 text-sm font-semibold"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div
                  className={`border-t-2 ${border} p-6 space-y-4 transition-colors duration-300`}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex justify-between ${textSecondary} transition-colors duration-300`}
                    >
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>
                        ${totalCart.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between ${textSecondary} transition-colors duration-300`}
                    >
                      <span>Envío:</span>
                      <span style={{ fontWeight: 600 }}>
                        {envio === 0 ? "GRATIS" : `$${envio.toLocaleString()}`}
                      </span>
                    </div>
                    <div
                      className={`border-t-2 ${border} pt-2 flex justify-between items-center transition-colors duration-300`}
                    >
                      <span
                        className={`${textPrimary} transition-colors duration-300`}
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        Total:
                      </span>
                      <span
                        className={`${textPrimary} transition-colors duration-300`}
                        style={{ fontSize: "22px", fontWeight: 700 }}
                      >
                        ${(totalCart + envio).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className={`flex-1 py-3 rounded-xl border-2 ${border} hover:bg-[#14B8A6]/10 ${textPrimary} font-bold transition-all`}
                    >
                      Continuar
                    </button>
                    <button
                      onClick={procederPago}
                      className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
                    >
                      Proceder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detalle del producto */}
      <AnimatePresence>
        {showProductDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowProductDetail(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed bottom-0 left-0 h-full w-full max-w-md ${bgCard} shadow-2xl z-50 flex flex-col transition-colors duration-300`}
            >
              <div
                className={`p-6 border-b-2 ${border} transition-colors duration-300`}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className={`${textPrimary} transition-colors duration-300`}
                    style={{ fontSize: "22px", fontWeight: 700 }}
                  >
                    Detalles del Producto
                  </h3>
                  <button
                    onClick={() => setShowProductDetail(false)}
                    className={`p-2 hover:bg-[#14B8A6]/10 rounded-lg transition-all ${textPrimary}`}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {selectedProduct && (
                  <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={selectedProduct.imagen}
                        alt={selectedProduct.nombreComercial}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3
                      className={`text-sm ${textPrimary} mb-2 line-clamp-2 h-10 transition-colors duration-300`}
                      style={{ fontWeight: 700 }}
                    >
                      {selectedProduct.nombreComercial}
                    </h3>
                    <p
                      className={`text-sm ${textSecondary} mb-2 transition-colors duration-300`}
                    >
                      {selectedProduct.laboratorio}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <p
                        className={`${textPrimary} transition-colors duration-300`}
                        style={{ fontSize: "20px", fontWeight: 700 }}
                      >
                        ${selectedProduct.precio.toLocaleString()}
                      </p>
                      {selectedProduct.precioAnterior && (
                        <p
                          className={`text-sm ${textSecondary} line-through transition-colors duration-300`}
                        >
                          ${selectedProduct.precioAnterior.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p
                      className={`text-sm ${textSecondary} mb-2 transition-colors duration-300`}
                    >
                      {selectedProduct.descripcion}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(selectedProduct.id, -1)}
                        className={`w-8 h-8 rounded-lg ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        } font-bold transition-all`}
                      >
                        -
                      </button>
                      <span
                        className={`${textPrimary} w-8 text-center transition-colors duration-300`}
                        style={{ fontWeight: 600 }}
                      >
                        {selectedProduct.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(selectedProduct.id, 1)}
                        className={`w-8 h-8 rounded-lg ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        } font-bold transition-all`}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(selectedProduct.id)}
                        className="ml-auto text-red-500 hover:text-red-700 text-sm font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div
                  className={`border-t-2 ${border} p-6 space-y-4 transition-colors duration-300`}
                >
                  <div className="space-y-2">
                    <div
                      className={`flex justify-between ${textSecondary} transition-colors duration-300`}
                    >
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: 600 }}>
                        ${totalCart.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className={`flex justify-between ${textSecondary} transition-colors duration-300`}
                    >
                      <span>Envío:</span>
                      <span style={{ fontWeight: 600 }}>
                        {envio === 0 ? "GRATIS" : `$${envio.toLocaleString()}`}
                      </span>
                    </div>
                    <div
                      className={`border-t-2 ${border} pt-2 flex justify-between items-center transition-colors duration-300`}
                    >
                      <span
                        className={`${textPrimary} transition-colors duration-300`}
                        style={{ fontSize: "16px", fontWeight: 600 }}
                      >
                        Total:
                      </span>
                      <span
                        className={`${textPrimary} transition-colors duration-300`}
                        style={{ fontSize: "22px", fontWeight: 700 }}
                      >
                        ${(totalCart + envio).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className={`flex-1 py-3 rounded-xl border-2 ${border} hover:bg-[#14B8A6]/10 ${textPrimary} font-bold transition-all`}
                    >
                      Continuar
                    </button>
                    <button
                      onClick={procederPago}
                      className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition-all"
                    >
                      Proceder
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
