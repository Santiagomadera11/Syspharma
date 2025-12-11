import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Stethoscope,
  X,
  AlertCircle,
  Clock,
  DollarSign,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
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
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { useDarkMode } from "../hooks/useDarkMode";
import { useCategorias } from "../hooks/useEntities";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { CategoryBadge } from "../components/ui/category-badge";
import { serviciosStorage } from "../utils/localStorage";

interface Servicio {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  categoriaColor: string;
  duracion: number; // en minutos
  precio: number;
  imagen?: string;
  estado: "Activo" | "Inactivo";
}

interface ServiciosProps {
  user: any;
}

export default function Servicios({ user }: ServiciosProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
    inputText,
    bgSecondary,
    modalBg,
  } = useDarkMode();

  const [servicios, setServicios] = useState<Servicio[]>([]);

  // Cargar servicios desde localStorage al montar
  useEffect(() => {
    const storedServicios = serviciosStorage.getAll();
    if (storedServicios.length > 0) {
      // Adaptar la estructura del localStorage a la interfaz local
      const serviciosAdaptados = storedServicios.map((s) => ({
        id: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria || "General",
        categoriaColor: "#14B8A6",
        duracion: s.duracion,
        precio: s.precio,
        imagen: s.imagen,
        estado: s.estado,
      })) as Servicio[];
      setServicios(serviciosAdaptados);
    } else {
      // Si no hay servicios, usar ejemplos iniciales
      const serviciosIniciales: Servicio[] = [
        {
          id: "1",
          codigo: "SRV001",
          nombre: "Consulta General",
          descripcion:
            "Consulta médica general con evaluación completa del estado de salud del paciente",
          categoria: "Consultas",
          categoriaColor: "#14B8A6",
          duracion: 30,
          precio: 50000,
          imagen:
            "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
          estado: "Activo",
        },
        {
          id: "2",
          codigo: "SRV002",
          nombre: "Vacunación",
          descripcion:
            "Aplicación de vacunas según esquema de inmunización requerido",
          categoria: "Preventivos",
          categoriaColor: "#0EA5E9",
          duracion: 15,
          precio: 30000,
          imagen:
            "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=400&fit=crop",
          estado: "Activo",
        },
        {
          id: "3",
          codigo: "SRV003",
          nombre: "Toma de Presión",
          descripcion:
            "Medición de presión arterial y evaluación de signos vitales",
          categoria: "Diagnósticos",
          categoriaColor: "#8B5CF6",
          duracion: 10,
          precio: 10000,
          imagen:
            "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=400&h=400&fit=crop",
          estado: "Activo",
        },
        {
          id: "4",
          codigo: "SRV004",
          nombre: "Glucometría",
          descripcion: "Medición de glucosa en sangre para control de diabetes",
          categoria: "Diagnósticos",
          categoriaColor: "#8B5CF6",
          duracion: 10,
          precio: 15000,
          imagen:
            "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&h=400&fit=crop",
          estado: "Activo",
        },
        {
          id: "5",
          codigo: "SRV005",
          nombre: "Aplicación de Inyección",
          descripcion:
            "Aplicación de medicamentos vía intramuscular o intravenosa",
          categoria: "Tratamientos",
          categoriaColor: "#EC4899",
          duracion: 15,
          precio: 8000,
          estado: "Inactivo",
        },
        {
          id: "6",
          codigo: "SRV006",
          nombre: "Curaciones",
          descripcion:
            "Curación de heridas, quemaduras y procedimientos post-quirúrgicos",
          categoria: "Tratamientos",
          categoriaColor: "#EC4899",
          duracion: 20,
          precio: 25000,
          imagen:
            "https://images.unsplash.com/photo-1551601651-bc60f254d532?w=400&h=400&fit=crop",
          estado: "Activo",
        },
      ];
      setServicios(serviciosIniciales);
    }
  }, []);

  // Guardar en localStorage cuando cambien los servicios
  useEffect(() => {
    if (servicios.length > 0) {
      const serviciosParaGuardar = servicios.map((s) => ({
        id: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria,
        duracion: s.duracion,
        precio: s.precio,
        imagen: s.imagen,
        estado: s.estado,
        createdAt: new Date().toISOString(),
      }));
      serviciosStorage.save(serviciosParaGuardar);
    }
  }, [servicios]);

  // Mejora 1: Estados para búsqueda, filtro y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false); // Mejora 2
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    duracion: "",
    precio: "",
    imagen: "",
  });

  const [errors, setErrors] = useState({
    codigo: "",
    nombre: "",
    duracion: "",
    precio: "",
  });

  const [touched, setTouched] = useState({
    codigo: false,
    nombre: false,
    duracion: false,
    precio: false,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Obtener categorías desde storage para mantener selects sincronizados
  const { items: categoriasStorage } = useCategorias();
  const categorias = categoriasStorage
    .filter((c) => c.estado === "Activo")
    .map((c) => c.nombre);
  // Fallback si no hay categorías creadas
  if (categorias.length === 0) {
    categorias.push("Consultas", "Preventivos", "Diagnósticos", "Tratamientos");
  }

  const validateCodigo = (codigo: string) => {
    if (!codigo) return "Requerido";
    const exists = servicios.some(
      (s) =>
        s.codigo &&
        s.codigo.toLowerCase() === codigo.toLowerCase() &&
        s.id !== selectedServicio?.id
    );
    if (exists) return "Código ya existe";
    return "";
  };

  const validateNombre = (nombre: string) => {
    if (!nombre) return "Requerido";
    if (nombre.length < 3) return "Mínimo 3 caracteres";
    return "";
  };

  const validateDuracion = (duracion: string) => {
    if (!duracion) return "Requerido";
    const num = parseInt(duracion);
    if (isNaN(num) || num <= 0) return "Debe ser mayor a 0";
    return "";
  };

  const validatePrecio = (precio: string) => {
    if (!precio) return "Requerido";
    const num = parseFloat(precio);
    if (isNaN(num) || num <= 0) return "Debe ser mayor a 0";
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

    if (field === "codigo") {
      setErrors({ ...errors, codigo: validateCodigo(formData.codigo) });
    } else if (field === "nombre") {
      setErrors({ ...errors, nombre: validateNombre(formData.nombre) });
    } else if (field === "duracion") {
      setErrors({ ...errors, duracion: validateDuracion(formData.duracion) });
    } else if (field === "precio") {
      setErrors({ ...errors, precio: validatePrecio(formData.precio) });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (touched[field as keyof typeof touched]) {
      if (field === "codigo") {
        setErrors({ ...errors, codigo: validateCodigo(value) });
      } else if (field === "nombre") {
        setErrors({ ...errors, nombre: validateNombre(value) });
      } else if (field === "duracion") {
        setErrors({ ...errors, duracion: validateDuracion(value) });
      } else if (field === "precio") {
        setErrors({ ...errors, precio: validatePrecio(value) });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imagen: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imagen: "" });
  };

  const isFormValid = () => {
    if (
      !formData.codigo ||
      !formData.nombre ||
      !formData.duracion ||
      !formData.precio
    )
      return false;

    const codigoError = validateCodigo(formData.codigo);
    const nombreError = validateNombre(formData.nombre);
    const duracionError = validateDuracion(formData.duracion);
    const precioError = validatePrecio(formData.precio);

    return !codigoError && !nombreError && !duracionError && !precioError;
  };

  const openCreateModal = () => {
    setSelectedServicio(null);
    // Generar código automáticamente
    const maxNumero = servicios.reduce((max, servicio) => {
      if (!servicio.codigo) return max;
      const match = servicio.codigo.match(/SRV(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nuevoCodigo = `SRV${String(maxNumero + 1).padStart(3, "0")}`;

    setFormData({
      codigo: nuevoCodigo,
      nombre: "",
      descripcion: "",
      categoria: "",
      duracion: "",
      precio: "",
      imagen: "",
    });
    setImagePreview(null);
    setErrors({ codigo: "", nombre: "", duracion: "", precio: "" });
    setTouched({
      codigo: false,
      nombre: false,
      duracion: false,
      precio: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setFormData({
      codigo: servicio.codigo,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      categoria: servicio.categoria,
      duracion: String(servicio.duracion),
      precio: String(servicio.precio),
      imagen: servicio.imagen || "",
    });
    setImagePreview(servicio.imagen || null);
    setErrors({ codigo: "", nombre: "", duracion: "", precio: "" });
    setTouched({
      codigo: false,
      nombre: false,
      duracion: false,
      precio: false,
    });
    setModalOpen(true);
  };

  // Mejora 2: Vista de detalle
  const openDetalleModal = (servicio: Servicio) => {
    setSelectedServicio(servicio);
    setDetalleModalOpen(true);
  };

  // Cambiar estado del servicio
  const toggleEstadoServicio = async (servicio: Servicio) => {
    const nuevoEstado = servicio.estado === "Activo" ? "Inactivo" : "Activo";

    setServicios(
      servicios.map((s) =>
        s.id === servicio.id ? { ...s, estado: nuevoEstado } : s
      )
    );

    toast.success(
      `Servicio ${
        nuevoEstado === "Activo" ? "activado" : "desactivado"
      } exitosamente`,
      {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ codigo: true, nombre: true, duracion: true, precio: true });

    if (!isFormValid()) {
      toast.error("Por favor completa todos los campos correctamente", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "1px solid #EF4444",
        },
      });
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const categoriaColor = (servicio) => {
      const catMap = {
        Consultas: "#14B8A6",
        Preventivos: "#0EA5E9",
        Diagnósticos: "#8B5CF6",
        Tratamientos: "#EC4899",
      };
      return catMap[formData.categoria] || "#6B7280";
    };

    if (selectedServicio) {
      setServicios(
        servicios.map((s) =>
          s.id === selectedServicio.id
            ? {
                ...s,
                codigo: formData.codigo,
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                categoria: formData.categoria,
                categoriaColor: categoriaColor(),
                duracion: parseInt(formData.duracion),
                precio: parseFloat(formData.precio),
                imagen: formData.imagen || undefined,
              }
            : s
        )
      );
      toast.success("Servicio actualizado exitosamente", {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      });
    } else {
      const newServicio: Servicio = {
        id: String(Date.now()),
        codigo: formData.codigo,
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        categoriaColor: categoriaColor(),
        duracion: parseInt(formData.duracion),
        precio: parseFloat(formData.precio),
        imagen: formData.imagen || undefined,
        estado: "Activo",
      };
      setServicios([...servicios, newServicio]);
      toast.success("Servicio creado exitosamente", {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      });
    }

    setLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedServicio) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setServicios(servicios.filter((s) => s.id !== selectedServicio.id));
    toast.success("Servicio eliminado exitosamente", {
      style: {
        background: "#EF4444",
        color: "white",
        border: "1px solid #EF4444",
      },
    });

    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedServicio(null);
  };

  // Mejora 1: Filtrado por búsqueda y estado
  const filteredServicios = servicios.filter((s) => {
    const matchesSearch =
      s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = estadoFiltro === "Todos" || s.estado === estadoFiltro;

    return matchesSearch && matchesEstado;
  });

  // Mejora 1: Paginación
  const totalPages = Math.ceil(filteredServicios.length / itemsPerPage);
  const paginatedServicios = filteredServicios.slice(
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
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Gestión de Servicios
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Administra los servicios médicos ofrecidos en la farmacia
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Mejora 1: Buscador y filtros */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className={`lg:col-span-2 ${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300`}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#14B8A6]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre, código o descripción..."
              className={`pl-12 h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#14B8A6]`}
            />
          </div>
        </div>

        <div
          className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300`}
        >
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#14B8A6]" />
            <Select
              value={estadoFiltro}
              onValueChange={(value) => {
                setEstadoFiltro(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger
                className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#14B8A6]`}
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className={bgCard}>
                <SelectItem value="Todos" className={textPrimary}>
                  Todos
                </SelectItem>
                <SelectItem value="Activo" className={textPrimary}>
                  Activos
                </SelectItem>
                <SelectItem value="Inactivo" className={textPrimary}>
                  Inactivos
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mejora 3: Cards de servicios disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedServicios.length === 0 ? (
          <div
            className={`col-span-full text-center p-8 ${textSecondary} ${bgCard} border ${border} rounded-xl`}
          >
            No se encontraron servicios
          </div>
        ) : (
          paginatedServicios.map((servicio) => (
            <motion.div
              key={servicio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`${bgCard} rounded-xl border ${border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                servicio.estado === "Inactivo" ? "opacity-60" : ""
              }`}
            >
              {/* Imagen del servicio */}
              <div className="relative h-48 overflow-hidden">
                {servicio.imagen ? (
                  <ImageWithFallback
                    src={servicio.imagen}
                    alt={servicio.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center ${
                      isDark ? "bg-[#161b22]" : "bg-gray-100"
                    }`}
                  >
                    <Stethoscope className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Badge de estado */}
                <div className="absolute top-3 right-3">
                  {servicio.estado === "Activo" ? (
                    <span
                      className="px-3 py-1 rounded-full bg-[#14B8A6] text-white shadow-lg"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      Disponible
                    </span>
                  ) : (
                    <span
                      className="px-3 py-1 rounded-full bg-gray-500 text-white shadow-lg"
                      style={{ fontSize: "12px", fontWeight: 600 }}
                    >
                      No disponible
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido de la card */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`${textPrimary} flex-1`}
                      style={{ fontSize: "18px", fontWeight: 700 }}
                    >
                      {servicio.nombre}
                    </h3>
                    <CategoryBadge
                      nombre={servicio.categoria}
                      color={servicio.categoriaColor}
                      size="sm"
                    />
                  </div>
                  <p
                    className={`${textSecondary} line-clamp-2`}
                    style={{ fontSize: "13px" }}
                  >
                    {servicio.descripcion}
                  </p>
                </div>

                {/* Info: Duración y Precio */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      isDark ? "bg-[#161b22]" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#14B8A6]" />
                      <span
                        className={`${textSecondary}`}
                        style={{ fontSize: "12px" }}
                      >
                        Duración
                      </span>
                    </div>
                    <span
                      className={textPrimary}
                      style={{ fontSize: "14px", fontWeight: 700 }}
                    >
                      {servicio.duracion} min
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl bg-[#14B8A6] bg-opacity-10`}>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#14B8A6]" />
                      <span
                        className={`${textSecondary}`}
                        style={{ fontSize: "12px" }}
                      >
                        Precio
                      </span>
                    </div>
                    <span
                      className="text-white"
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      {typeof servicio.precio === "number" &&
                      !isNaN(servicio.precio)
                        ? `$${servicio.precio.toLocaleString("es-CO")}`
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button
                    onClick={() => openDetalleModal(servicio)}
                    className={`h-10 rounded-xl ${
                      isDark
                        ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                    }`}
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button
                    onClick={() => openEditModal(servicio)}
                    className="h-10 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => toggleEstadoServicio(servicio)}
                    className={`h-10 rounded-xl ${
                      servicio.estado === "Activo"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-[#14B8A6] hover:bg-[#0D9488]"
                    } text-white`}
                    style={{ fontWeight: 600, fontSize: "12px" }}
                  >
                    {servicio.estado === "Activo" ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Mejora 1: Paginación */}
      {totalPages > 1 && (
        <div
          className={`${bgCard} rounded-xl border ${border} p-4 shadow-sm transition-colors duration-300`}
        >
          <div className="flex items-center justify-between">
            <p className={textSecondary} style={{ fontSize: "14px" }}>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredServicios.length)}{" "}
              de {filteredServicios.length} servicios
            </p>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                  currentPage === 1
                    ? `${
                        isDark
                          ? "bg-[#161b22] text-gray-600"
                          : "bg-gray-200 text-gray-400"
                      } cursor-not-allowed`
                    : `${
                        isDark
                          ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                      }`
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 p-0 rounded-lg transition-all ${
                      currentPage === page
                        ? "bg-[#14B8A6] text-white shadow-md"
                        : `${
                            isDark
                              ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                          }`
                    }`}
                    style={{ fontWeight: currentPage === page ? 700 : 500 }}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`h-9 w-9 p-0 rounded-lg transition-all ${
                  currentPage === totalPages
                    ? `${
                        isDark
                          ? "bg-[#161b22] text-gray-600"
                          : "bg-gray-200 text-gray-400"
                      } cursor-not-allowed`
                    : `${
                        isDark
                          ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                          : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                      }`
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mejora 2: Modal de detalle del servicio */}
      <Dialog open={detalleModalOpen} onOpenChange={setDetalleModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[640px] rounded-xl border-2 ${border}`}
        >
          {selectedServicio && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className={textPrimary}
                      style={{ fontSize: "22px", fontWeight: 700 }}
                    >
                      Detalle del Servicio
                    </span>
                    <p
                      className={`${textSecondary}`}
                      style={{ fontSize: "13px" }}
                    >
                      Código: {selectedServicio.codigo}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-6">
                {/* Imagen grande */}
                <div className="relative h-64 rounded-xl overflow-hidden">
                  {selectedServicio.imagen ? (
                    <ImageWithFallback
                      src={selectedServicio.imagen}
                      alt={selectedServicio.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center ${
                        isDark ? "bg-[#161b22]" : "bg-gray-100"
                      } border-2 border-dashed ${border}`}
                    >
                      <Stethoscope className="w-20 h-20 text-gray-400 mb-3" />
                      <p
                        className={`${textSecondary}`}
                        style={{ fontSize: "13px" }}
                      >
                        Sin imagen
                      </p>
                    </div>
                  )}
                </div>

                {/* Nombre y categoría */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className={`${textPrimary} flex-1 min-w-0`}
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        lineHeight: "1.2",
                      }}
                    >
                      {selectedServicio.nombre}
                    </h3>
                    <CategoryBadge
                      nombre={selectedServicio.categoria}
                      color={selectedServicio.categoriaColor}
                      size="md"
                      className="shrink-0"
                    />
                  </div>
                  <p
                    className={textSecondary}
                    style={{ fontSize: "14px", lineHeight: "1.6" }}
                  >
                    {selectedServicio.descripcion}
                  </p>
                </div>

                {/* Grid de información */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-[#161b22]" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#14B8A6] bg-opacity-20 flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-[#14B8A6]" />
                      </div>
                      <span
                        className={textSecondary}
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Precio
                      </span>
                    </div>
                    <span
                      className="text-[#14B8A6] block"
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        lineHeight: "1",
                      }}
                    >
                      ${selectedServicio.precio.toLocaleString("es-CO")}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-xl ${
                      isDark ? "bg-[#161b22]" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0EA5E9] bg-opacity-20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-[#0EA5E9]" />
                      </div>
                      <span
                        className={textSecondary}
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Duración
                      </span>
                    </div>
                    <span
                      className={`${textPrimary} block`}
                      style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        lineHeight: "1",
                      }}
                    >
                      {selectedServicio.duracion}{" "}
                      <span style={{ fontSize: "16px", fontWeight: 500 }}>
                        min
                      </span>
                    </span>
                  </div>
                </div>

                {/* Estado con toggle */}
                <div
                  className={`p-4 rounded-xl ${
                    isDark ? "bg-[#161b22]" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label
                        className={`block ${textPrimary} mb-1`}
                        style={{ fontSize: "14px", fontWeight: 600 }}
                      >
                        Estado del servicio
                      </label>
                      <p
                        className={`${textSecondary}`}
                        style={{ fontSize: "12px" }}
                      >
                        Los servicios inactivos no estarán disponibles para
                        agendar
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`${
                          selectedServicio.estado === "Activo"
                            ? "text-[#14B8A6]"
                            : textSecondary
                        }`}
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {selectedServicio.estado}
                      </span>
                      <Switch
                        checked={selectedServicio.estado === "Activo"}
                        onCheckedChange={() => {
                          toggleEstadoServicio(selectedServicio);
                          setDetalleModalOpen(false);
                        }}
                        className="data-[state=checked]:bg-[#14B8A6]"
                      />
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => setDetalleModalOpen(false)}
                    className={`h-12 rounded-xl ${
                      isDark
                        ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-[#374151]"
                    } transition-all duration-200`}
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setDetalleModalOpen(false);
                      openEditModal(selectedServicio);
                    }}
                    className="h-12 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl transition-all duration-200"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar servicio
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Servicio */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[600px] rounded-xl border-2 ${border} max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <span
                  className={textPrimary}
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {selectedServicio ? "Editar Servicio" : "Nuevo Servicio"}
                </span>
                <p className={`${textSecondary} text-sm`}>
                  Complete la información del servicio
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Upload de imagen */}
            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Imagen del Servicio
              </label>

              <div className="grid grid-cols-[140px_1fr] gap-4">
                <div
                  className={`w-full h-32 rounded-xl border-2 border-dashed ${border} flex items-center justify-center overflow-hidden ${
                    isDark ? "bg-[#0d1117]" : "bg-gray-50"
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <ImageWithFallback
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-2">
                      <Stethoscope className="w-10 h-10 mx-auto mb-1 text-gray-400" />
                      <p
                        className={`${textSecondary}`}
                        style={{ fontSize: "10px" }}
                      >
                        Sin imagen
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} mb-2`}
                  />
                  <p
                    className={`${textSecondary}`}
                    style={{ fontSize: "11px" }}
                  >
                    Formato: JPG, PNG. Tamaño recomendado: 400x400px
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Código
                </label>
                <Input
                  value={formData.codigo}
                  onChange={(e) => handleChange("codigo", e.target.value)}
                  onBlur={() => handleBlur("codigo")}
                  placeholder="SRV001"
                  className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                    touched.codigo && errors.codigo
                      ? "border-red-500"
                      : inputBorder
                  }`}
                />
                {touched.codigo && errors.codigo && (
                  <p
                    className="text-red-500 mt-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    {errors.codigo}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Categoría
                </label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleChange("categoria", value)}
                >
                  <SelectTrigger
                    className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className={bgCard}>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat} className={textPrimary}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Nombre del Servicio
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                placeholder="Ej: Consulta General"
                className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                  touched.nombre && errors.nombre
                    ? "border-red-500"
                    : inputBorder
                }`}
              />
              {touched.nombre && errors.nombre && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.nombre}
                </p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Descripción
              </label>
              <Textarea
                value={formData.descripcion}
                onChange={(e) => handleChange("descripcion", e.target.value)}
                placeholder="Describe el servicio..."
                rows={3}
                className={`rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Duración (minutos)
                </label>
                <Input
                  type="number"
                  value={formData.duracion}
                  onChange={(e) => handleChange("duracion", e.target.value)}
                  onBlur={() => handleBlur("duracion")}
                  placeholder="30"
                  className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                    touched.duracion && errors.duracion
                      ? "border-red-500"
                      : inputBorder
                  }`}
                />
                {touched.duracion && errors.duracion && (
                  <p
                    className="text-red-500 mt-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    {errors.duracion}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Precio
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.precio}
                  onChange={(e) => handleChange("precio", e.target.value)}
                  onBlur={() => handleBlur("precio")}
                  placeholder="50000"
                  className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                    touched.precio && errors.precio
                      ? "border-red-500"
                      : inputBorder
                  }`}
                />
                {touched.precio && errors.precio && (
                  <p
                    className="text-red-500 mt-1.5"
                    style={{ fontSize: "12px" }}
                  >
                    {errors.precio}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`h-11 rounded-xl ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-[#374151]"
                }`}
                style={{ fontWeight: 600 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className={`h-11 rounded-xl transition-all duration-300 ${
                  isFormValid() && !loading
                    ? "bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-lg shadow-[#14B8A6]/20"
                    : `${
                        isDark
                          ? "bg-[#161b22] text-gray-600"
                          : "bg-gray-300 text-gray-500"
                      } cursor-not-allowed`
                }`}
                style={{ fontWeight: 600 }}
              >
                {loading
                  ? "Guardando..."
                  : selectedServicio
                  ? "Guardar Cambios"
                  : "Crear Servicio"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={`${modalBg} rounded-xl border-2 ${border}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span
                className="text-red-600"
                style={{ fontSize: "22px", fontWeight: 700 }}
              >
                ¿Eliminar servicio?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} ml-16`}
              style={{ fontSize: "14px" }}
            >
              Se eliminará permanentemente "{selectedServicio?.nombre}". Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              className={`h-11 rounded-xl ${
                isDark
                  ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white border-0"
                  : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
              }`}
              style={{ fontWeight: 600 }}
            >
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
