import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface DashboardClienteProps {
  user: any;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  precioUnidad?: number;
  imagen: string;
  categoria: string;
  nuevaImagen?: boolean;
  recetaMedica?: boolean;
}

interface CartItem extends Producto {
  cantidad: number;
}

const CATEGORIAS = [
  "Farmacia",
  "Cuidado Personal",
  "Salud y Bienestar",
  "Salud Sexual",
  "Nutrición",
  "Primeros Auxilios y Curación",
  "Bebés y Maternidades",
  "Medicamentos",
];

const PRODUCTOS_MOCK: Producto[] = [
  {
    id: "1",
    nombre: "Acetaminofén 500mg x 20 tabletas",
    precio: 8500,
    precioUnidad: 425,
    imagen:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
    categoria: "Medicamentos",
    recetaMedica: false,
  },
  {
    id: "2",
    nombre: "Ibuprofeno 400mg x 30 cápsulas",
    precio: 15000,
    precioUnidad: 500,
    imagen:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400",
    categoria: "Medicamentos",
    nuevaImagen: true,
  },
  {
    id: "3",
    nombre: "Vitamina C 1000mg Efervescente",
    precio: 12000,
    precioUnidad: 1200,
    imagen: "https://images.unsplash.com/photo-1550572017-4fade94d71e6?w=400",
    categoria: "Nutrición",
  },
  {
    id: "4",
    nombre: "Alcohol Antiséptico 500ml",
    precio: 6500,
    imagen:
      "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400",
    categoria: "Primeros Auxilios y Curación",
  },
  {
    id: "5",
    nombre: "Crema Hidratante Facial 50ml",
    precio: 25000,
    imagen: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400",
    categoria: "Cuidado Personal",
    nuevaImagen: true,
  },
  {
    id: "6",
    nombre: "Protector Solar SPF 50+ 100ml",
    precio: 35000,
    imagen:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
    categoria: "Cuidado Personal",
  },
  {
    id: "7",
    nombre: "Probióticos x 30 cápsulas",
    precio: 45000,
    precioUnidad: 1500,
    imagen: "https://images.unsplash.com/photo-1526686050-b5e3f7b1d66d?w=400",
    categoria: "Salud y Bienestar",
  },
  {
    id: "8",
    nombre: "Termómetro Digital Infrarrojo",
    precio: 55000,
    imagen:
      "https://images.unsplash.com/photo-1603791239531-3712381c2c18?w=400",
    categoria: "Primeros Auxilios y Curación",
  },
  {
    id: "9",
    nombre: "Pañales Bebé Talla M x 40 unidades",
    precio: 42000,
    precioUnidad: 1050,
    imagen:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
    categoria: "Bebés y Maternidades",
  },
  {
    id: "10",
    nombre: "Loción Corporal 400ml",
    precio: 18000,
    imagen:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
    categoria: "Cuidado Personal",
  },
];

export default function DashboardCliente({ user }: DashboardClienteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filtrar productos
  const filteredProducts = PRODUCTOS_MOCK.filter((producto) => {
    const matchesSearch = producto.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(producto.categoria);
    return matchesSearch && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Filtrar categorías para búsqueda
  const filteredCategories = CATEGORIAS.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleCategory = (categoria: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoria)
        ? prev.filter((c) => c !== categoria)
        : [...prev, categoria]
    );
  };

  const addToCart = (producto: Producto) => {
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
    toast.success("Producto añadido al pedido", {
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
  };

  const totalCart = cart.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const enviarPedido = () => {
    if (cart.length === 0) {
      toast.error("El carrito está vacío", {
        style: { background: "#FBCFE8", color: "#9F1239" },
      });
      return;
    }

    // Guardar pedido en localStorage
    const pedido = {
      id: `PED-${Date.now()}`,
      clienteId: user?.id || "cliente-1",
      clienteNombre: user?.nombre || "Cliente",
      fecha: new Date().toISOString(),
      productos: cart.map((item) => ({
        productoId: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio,
        requiereReceta: item.recetaMedica,
      })),
      total: totalCart,
      estado: "Pendiente",
      requiereReceta: cart.some((item) => item.recetaMedica),
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
    <div className="min-h-screen bg-white">
      {/* Hero / Banner */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#FFF8F0" }}
      >
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Lado izquierdo - Texto y badges */}
            <div className="space-y-6">
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 800,
                  color: "#1F2937",
                  lineHeight: "1.1",
                }}
              >
                Tu farmacia
                <br />
                de confianza
              </h1>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    Envío gratis
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    Entrega rápida
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-full px-5 py-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <span style={{ color: "#374151", fontWeight: 600 }}>
                    Productos originales
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  window.scrollTo({ top: 400, behavior: "smooth" })
                }
                className="px-8 py-4 rounded-xl text-white transition-all duration-300 hover:scale-105 shadow-lg"
                style={{
                  backgroundColor: "#14B8A6",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                EXPLORAR PRODUCTOS
              </button>
            </div>

            {/* Lado derecho - Imagen */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600"
                alt="Farmacia"
                className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda fija */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <p
                style={{ fontSize: "20px", fontWeight: 700, color: "#1F2937" }}
              >
                ¡Hola! ¿Qué producto buscas?
              </p>
            </div>

            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                style={{ width: "22px", height: "22px" }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar medicamentos, vitaminas, cuidado personal..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 outline-none transition-all duration-300 focus:border-teal-400"
                style={{ fontSize: "16px" }}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all duration-300"
              style={{ fontWeight: 600, color: "#374151" }}
            >
              <SlidersHorizontal style={{ width: "20px", height: "20px" }} />
              FILTROS
              {selectedCategories.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs text-white bg-teal-500">
                  {selectedCategories.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de filtros */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#1F2937",
                    }}
                  >
                    Filtrar por categoría
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X style={{ width: "20px", height: "20px" }} />
                  </button>
                </div>

                <div className="relative mb-4">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    style={{ width: "18px", height: "18px" }}
                  />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Buscar categoría"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-teal-400"
                  />
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredCategories.map((categoria) => (
                    <button
                      key={categoria}
                      onClick={() => toggleCategory(categoria)}
                      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "#374151",
                        }}
                      >
                        {categoria}
                      </span>
                      {selectedCategories.includes(categoria) && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check
                            className="text-white"
                            style={{ width: "14px", height: "14px" }}
                          />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedCategories([]);
                      setCategorySearch("");
                    }}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-colors"
                    style={{ fontWeight: 600, color: "#6B7280" }}
                  >
                    Limpiar
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-3 rounded-xl text-white transition-all duration-300"
                    style={{ backgroundColor: "#3B82F6", fontWeight: 600 }}
                  >
                    Buscar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sección de productos */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-8">
          <h2
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#1F2937",
              marginBottom: "8px",
            }}
          >
            nuestros productos
          </h2>
          <p style={{ fontSize: "16px", color: "#6B7280" }}>
            Tenemos todo lo que buscas
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
          {paginatedProducts.map((producto) => (
            <motion.div
              key={producto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {producto.nuevaImagen && (
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white bg-orange-500"
                    style={{ fontWeight: 600 }}
                  >
                    NUEVA IMAGEN
                  </div>
                )}
                {producto.recetaMedica && (
                  <div
                    className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs text-white bg-red-500"
                    style={{ fontWeight: 600 }}
                  >
                    Receta médica
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#1F2937",
                    lineHeight: "1.4",
                    marginBottom: "8px",
                  }}
                  className="line-clamp-2"
                >
                  {producto.nombre}
                </h3>

                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#1F2937",
                    marginBottom: "4px",
                  }}
                >
                  ${producto.precio.toLocaleString()}
                </p>

                {producto.precioUnidad && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      marginBottom: "12px",
                    }}
                  >
                    Unidad ${producto.precioUnidad.toLocaleString()}
                  </p>
                )}

                <button
                  onClick={() => addToCart(producto)}
                  className="w-full py-3 rounded-xl text-white transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: "#14B8A6",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  + Añadir al pedido
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft style={{ width: "20px", height: "20px" }} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10 rounded-lg transition-all duration-300"
                style={{
                  backgroundColor:
                    currentPage === page ? "#14B8A6" : "transparent",
                  color: currentPage === page ? "white" : "#374151",
                  fontWeight: 600,
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight style={{ width: "20px", height: "20px" }} />
            </button>
          </div>
        )}
      </div>

      {/* Botón carrito flotante */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
        style={{ backgroundColor: "#14B8A6" }}
      >
        <ShoppingBag
          className="text-white"
          style={{ width: "24px", height: "24px" }}
        />
        {cart.length > 0 && (
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{cart.length}</span>
          </div>
        )}
      </button>

      {/* Panel lateral del carrito */}
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      color: "#1F2937",
                    }}
                  >
                    Mi Pedido
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X style={{ width: "24px", height: "24px" }} />
                  </button>
                </div>
                {cart.length > 0 && (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    {cart.length} {cart.length === 1 ? "producto" : "productos"}
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingBag
                      className="text-gray-300 mb-4"
                      style={{ width: "64px", height: "64px" }}
                    />
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#9CA3AF",
                      }}
                    >
                      Tu carrito está vacío
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 rounded-xl border-2 border-gray-100"
                      >
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4
                            style={{
                              fontSize: "14px",
                              fontWeight: 600,
                              color: "#1F2937",
                              marginBottom: "4px",
                            }}
                            className="line-clamp-2"
                          >
                            {item.nombre}
                          </h4>
                          <p
                            style={{
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#14B8A6",
                              marginBottom: "8px",
                            }}
                          >
                            ${item.precio.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span style={{ fontSize: "14px", fontWeight: 600 }}>
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-red-500 hover:text-red-700 text-sm"
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
                <div className="border-t-2 border-gray-100 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#6B7280",
                      }}
                    >
                      Total:
                    </span>
                    <span
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#1F2937",
                      }}
                    >
                      ${totalCart.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={enviarPedido}
                    className="w-full py-4 rounded-xl text-white transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: "#14B8A6",
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    Enviar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
