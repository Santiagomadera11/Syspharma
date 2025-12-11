import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner@2.0.3";
import { useDarkMode } from "../hooks/useDarkMode";
import { useProductos, useCategorias, usePedidos } from "../hooks/useEntities";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

interface CatalogoClienteProps {
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

export default function CatalogoCliente({ user }: CatalogoClienteProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
  } = useDarkMode();

  // ✅ Usar hooks globales para sincronización automática
  const { items: productos } = useProductos();
  const { items: categorias } = useCategorias();
  const { add: addPedido } = usePedidos();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [telefonoEntrega, setTelefonoEntrega] = useState(user?.telefono || "");
  const [notasPedido, setNotasPedido] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // Anuncios y ofertas para el carrusel
  const slides = [
    {
      id: 1,
      titulo: "¡Ofertas Especiales!",
      descripcion: "Descuentos de hasta 30% en productos seleccionados",
      color: "from-blue-500 to-purple-600",
      imagen:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop",
    },
    {
      id: 2,
      titulo: "Envío Gratis",
      descripcion: "En compras mayores a $50.000",
      color: "from-green-500 to-teal-600",
      imagen:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=400&fit=crop",
    },
    {
      id: 3,
      titulo: "Programa de Puntos",
      descripcion: "Acumula puntos en cada compra y canjéalos por descuentos",
      color: "from-orange-500 to-red-600",
      imagen:
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&h=400&fit=crop",
    },
  ];

  // Auto-avance del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("syspharma_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Escuchar evento para abrir carrito desde el navbar
    const handleOpenCart = () => {
      setShowCart(true);
    };

    window.addEventListener("openCart", handleOpenCart);

    return () => {
      window.removeEventListener("openCart", handleOpenCart);
    };
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("syspharma_cart", JSON.stringify(cart));
    // Disparar evento para actualizar contador en navbar
    window.dispatchEvent(new Event("storage"));
  }, [cart]);

  // Categorías activas únicas de los productos
  const categoriasDisponibles = useMemo(() => {
    const categsActivas = categorias.filter((c) => c.estado === "Activo");
    return categsActivas;
  }, [categorias]);

  // Filtrar solo productos activos y marcados para mostrar en catálogo
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
        selectedCategories.length === 0 ||
        selectedCategories.includes(producto.categoria);
      return matchesSearch && matchesCategory;
    });
  }, [productosActivos, searchTerm, selectedCategories]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Filtrar categorías para búsqueda
  const filteredCategories = categoriasDisponibles.filter((cat) =>
    cat.nombre.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleCategory = (categoria: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
    setCurrentPage(1);
  };

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
      return [
        ...prev,
        {
          id: producto.id,
          nombreComercial: producto.nombreComercial || producto.nombreGenerico,
          precio: producto.precio,
          imagen: producto.imagen,
          cantidad: 1,
          requiereReceta: producto.requiereReceta,
        },
      ];
    });
    toast.success("Producto añadido al carrito", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const newCantidad = Math.max(1, item.cantidad + delta);
            return { ...item, cantidad: newCantidad };
          }
          return item;
        })
        .filter((item) => item.cantidad > 0);
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Producto eliminado del carrito");
  };

  const totalCart = cart.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const realizarPedido = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    if (!telefonoEntrega.trim()) {
      toast.error("Por favor ingresa un teléfono de contacto");
      return;
    }

    // Verificar si algún producto requiere receta
    const requiereReceta = cart.some((item) => item.requiereReceta);

    // Crear pedido usando el hook global
    const nuevoPedido = {
      id: `PED-${Date.now()}`,
      fecha: new Date().toISOString(),
      clienteId: user?.id || "",
      clienteNombre: user?.nombre || "",
      productos: cart.map((item) => ({
        productoId: item.id,
        nombre: item.nombreComercial,
        cantidad: item.cantidad,
        precio: item.precio,
        requiereReceta: item.requiereReceta,
      })),
      total: totalCart,
      estado: "Pendiente" as const,
      requiereReceta,
      telefono: telefonoEntrega,
      notas: notasPedido,
      createdAt: new Date().toISOString(),
    };

    addPedido(nuevoPedido);

    toast.success("¡Pedido realizado exitosamente!", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });

    // Limpiar carrito y formulario
    setCart([]);
    localStorage.removeItem("syspharma_cart");
    setNotasPedido("");
    setShowCart(false);
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
            Catálogo de Productos
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            {filteredProducts.length} productos disponibles
          </p>
        </div>

        <Button
          onClick={() => setShowCart(true)}
          className="relative bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Ver Carrito ({totalItems})
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      {/* Carrusel de Anuncios y Ofertas */}
      <div className="relative overflow-hidden rounded-2xl h-64 shadow-lg">
        <AnimatePresence mode="wait">
          {slides.map(
            (slide, index) =>
              index === currentSlide && (
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-r ${slide.color}`}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-20" />
                  <img
                    src={slide.imagen}
                    alt={slide.titulo}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                  />
                  <div className="relative h-full flex flex-col justify-center px-12">
                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white font-bold mb-3"
                      style={{ fontSize: "36px" }}
                    >
                      {slide.titulo}
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white text-lg"
                    >
                      {slide.descripcion}
                    </motion.p>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>

        {/* Botones de navegación */}
        <button
          onClick={() =>
            setCurrentSlide(
              (prev) => (prev - 1 + slides.length) % slides.length
            )
          }
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 backdrop-blur-sm flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-2 bg-white bg-opacity-50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
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
              placeholder="Buscar productos..."
              className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${
                isDark ? "text-white placeholder-gray-400" : ""
              } focus:border-[#63E6BE]`}
            />
          </div>

          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-6 rounded-xl ${
              showFilters
                ? "bg-[#63E6BE] text-white"
                : "bg-gray-200 text-gray-700"
            } transition-all duration-200`}
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filtros
            {selectedCategories.length > 0 && (
              <span className="ml-2 bg-white text-[#63E6BE] px-2 py-0.5 rounded-full text-xs font-bold">
                {selectedCategories.length}
              </span>
            )}
          </Button>
        </div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className={`${textPrimary} font-semibold mb-3`}>
                  Categorías
                </h3>
                <Input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar categoría..."
                  className={`mb-3 h-10 rounded-xl ${inputBorder} ${inputBg}`}
                />
                <div className="flex flex-wrap gap-2">
                  {filteredCategories.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => toggleCategory(categoria.nombre)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedCategories.includes(categoria.nombre)
                          ? "bg-[#63E6BE] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {categoria.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {paginatedProducts.map((producto, index) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`${bgCard} rounded-2xl overflow-hidden border ${border} shadow-sm hover:shadow-xl transition-all duration-300 group`}
            >
              {/* Imagen */}
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={
                    producto.imagen ||
                    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
                  }
                  alt={producto.nombreComercial || producto.nombreGenerico}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {producto.requiereReceta && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Requiere Receta
                  </div>
                )}
                {producto.stock < 10 && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Pocas unidades
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-[#63E6BE] bg-[#63E6BE]/10 px-2 py-1 rounded">
                    {producto.categoria}
                  </span>
                </div>
                <h3
                  onClick={() => {
                    setSelectedProduct(producto);
                    setShowProductDetail(true);
                  }}
                  className={`${textPrimary} font-bold mb-1 cursor-pointer hover:text-[#63E6BE] transition-colors`}
                  style={{ fontSize: "16px" }}
                >
                  {producto.nombreComercial || producto.nombreGenerico}
                </h3>
                {producto.nombreGenerico && producto.nombreComercial && (
                  <p className={`${textSecondary} text-xs mb-2`}>
                    {producto.nombreGenerico}
                  </p>
                )}
                {producto.laboratorio && (
                  <p className={`${textSecondary} text-xs mb-2`}>
                    {producto.laboratorio}
                  </p>
                )}
                <p className={`${textSecondary} text-xs mb-3`}>
                  {producto.presentacion}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className={`${textPrimary} font-bold text-xl`}>
                      ${producto.precio.toLocaleString()}
                    </p>
                    <p className={`${textSecondary} text-xs`}>
                      Stock: {producto.stock}
                    </p>
                  </div>
                  <Button
                    onClick={() => addToCart(producto)}
                    className="bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-10 px-4"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setSelectedProduct(producto);
                    setShowProductDetail(true);
                  }}
                  className="w-full h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
                >
                  <Info className="w-4 h-4 mr-1.5" />
                  Ver Detalles
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mensaje sin productos */}
      {filteredProducts.length === 0 && (
        <div
          className={`${bgCard} rounded-2xl p-12 text-center border ${border}`}
        >
          <Package className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
          <h3 className={`${textPrimary} text-xl font-bold mb-2`}>
            No se encontraron productos
          </h3>
          <p className={textSecondary}>
            Intenta ajustar los filtros o la búsqueda
          </p>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="h-10 w-10 p-0 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <span className={`${textPrimary} px-4`}>
            Página {currentPage} de {totalPages}
          </span>

          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="h-10 w-10 p-0 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Modal Carrito */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent
          className={`${bgCard} rounded-2xl p-6 max-w-2xl max-h-[85vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle
              className={`${textPrimary} text-2xl font-bold flex items-center`}
            >
              <ShoppingCart className="w-6 h-6 mr-2 text-[#63E6BE]" />
              Mi Carrito ({totalItems} productos)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart
                  className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`}
                />
                <p className={textSecondary}>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-xl border ${border} bg-gray-50 dark:bg-gray-800/50`}
                    >
                      <img
                        src={
                          item.imagen ||
                          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100"
                        }
                        alt={item.nombreComercial}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className={`${textPrimary} font-semibold text-sm`}>
                          {item.nombreComercial}
                        </h4>
                        <p className={`${textSecondary} text-xs`}>
                          ${item.precio.toLocaleString()} c/u
                        </p>
                        {item.requiereReceta && (
                          <span className="text-xs text-red-500 font-semibold">
                            ⚠️ Requiere receta
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-8 w-8 p-0 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span
                          className={`${textPrimary} font-bold w-8 text-center`}
                        >
                          {item.cantidad}
                        </span>
                        <Button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-8 w-8 p-0 rounded-lg bg-[#63E6BE] text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 p-0 rounded-lg bg-red-500 text-white ml-2"
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

                {/* Formulario de entrega */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label
                      className={`block ${textPrimary} mb-2 font-semibold text-sm`}
                    >
                      Teléfono de Contacto *
                    </label>
                    <Input
                      value={telefonoEntrega}
                      onChange={(e) => setTelefonoEntrega(e.target.value)}
                      placeholder="3001234567"
                      className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2 font-semibold text-sm`}
                    >
                      Notas del Pedido (Opcional)
                    </label>
                    <Textarea
                      value={notasPedido}
                      onChange={(e) => setNotasPedido(e.target.value)}
                      placeholder="Instrucciones especiales, horario preferido de entrega, etc."
                      className={`rounded-xl ${inputBorder} ${inputBg}`}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Total */}
                <div
                  className={`flex justify-between items-center p-4 rounded-xl bg-[#63E6BE]/10 border-2 border-[#63E6BE]`}
                >
                  <span className={`${textPrimary} font-bold text-lg`}>
                    Total:
                  </span>
                  <span className="text-[#63E6BE] font-bold text-2xl">
                    ${totalCart.toLocaleString()}
                  </span>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCart(false)}
                    className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                  >
                    Continuar Comprando
                  </Button>
                  <Button
                    onClick={realizarPedido}
                    className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
                  >
                    Realizar Pedido
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle del Producto */}
      <Dialog open={showProductDetail} onOpenChange={setShowProductDetail}>
        <DialogContent
          className={`${bgCard} rounded-2xl p-0 max-w-3xl max-h-[85vh] overflow-hidden`}
        >
          {selectedProduct && (
            <>
              <div className="relative h-64 overflow-hidden">
                <img
                  src={
                    selectedProduct.imagen ||
                    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800"
                  }
                  alt={
                    selectedProduct.nombreComercial ||
                    selectedProduct.nombreGenerico
                  }
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 flex gap-2">
                  {selectedProduct.requiereReceta && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Requiere Receta
                    </div>
                  )}
                  {selectedProduct.stock < 10 && (
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Pocas unidades
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h2
                        className={`${textPrimary} font-bold mb-2`}
                        style={{ fontSize: "28px" }}
                      >
                        {selectedProduct.nombreComercial ||
                          selectedProduct.nombreGenerico}
                      </h2>
                      {selectedProduct.nombreGenerico &&
                        selectedProduct.nombreComercial && (
                          <p className={`${textSecondary} text-base mb-2`}>
                            Nombre genérico: {selectedProduct.nombreGenerico}
                          </p>
                        )}
                    </div>
                    <span className="text-sm font-semibold text-[#63E6BE] bg-[#63E6BE]/10 px-3 py-1.5 rounded-lg shrink-0">
                      {selectedProduct.categoria}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <p className={`${textSecondary} text-sm mb-1`}>
                      Laboratorio
                    </p>
                    <p className={`${textPrimary} font-semibold`}>
                      {selectedProduct.laboratorio || "No especificado"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <p className={`${textSecondary} text-sm mb-1`}>
                      Presentación
                    </p>
                    <p className={`${textPrimary} font-semibold`}>
                      {selectedProduct.presentacion}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-gray-800" : "bg-gray-50"
                    }`}
                  >
                    <p className={`${textSecondary} text-sm mb-1`}>
                      Stock disponible
                    </p>
                    <p className={`${textPrimary} font-semibold`}>
                      {selectedProduct.stock} unidades
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl bg-[#63E6BE]/10`}>
                    <p className={`${textSecondary} text-sm mb-1`}>Precio</p>
                    <p className="text-[#63E6BE] font-bold text-2xl">
                      ${selectedProduct.precio.toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedProduct.descripcion && (
                  <div>
                    <h3
                      className={`${textPrimary} font-semibold mb-2`}
                      style={{ fontSize: "18px" }}
                    >
                      Descripción
                    </h3>
                    <p className={`${textSecondary} leading-relaxed`}>
                      {selectedProduct.descripcion}
                    </p>
                  </div>
                )}

                {selectedProduct.requiereReceta && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xl">⚠️</span>
                      </div>
                      <div>
                        <h4 className="text-red-700 dark:text-red-400 font-semibold mb-1">
                          Receta médica obligatoria
                        </h4>
                        <p className="text-red-600 dark:text-red-300 text-sm">
                          Este medicamento requiere prescripción médica. Por
                          favor adjunta una foto o escaneado de tu receta médica
                          al realizar el pedido.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowProductDetail(false)}
                    className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 font-semibold"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      addToCart(selectedProduct);
                      setShowProductDetail(false);
                    }}
                    className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar al Carrito
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
