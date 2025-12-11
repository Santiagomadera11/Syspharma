import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
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
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
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
  proveedoresStorage,
  Proveedor as StorageProveedor,
} from "../utils/localStorage";
import {
  onlyNumbers,
  onlyLetters,
  validateNIT,
  validateEmail as validateEmailUtil,
  validatePhone,
} from "../utils/validation";

interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad?: string;
  estado: "Activo" | "Inactivo";
  logo?: string;
  createdAt?: string;
}

interface ProveedoresProps {
  user: any;
}

type SortField = "nombre" | "nit" | "telefono" | "email" | "estado";
type SortDirection = "asc" | "desc";

export default function Proveedores({ user }: ProveedoresProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    inputBg,
    inputBorder,
    inputText,
    modalBg,
  } = useDarkMode();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Cargar proveedores desde localStorage
  useEffect(() => {
    const proveedoresFromStorage = proveedoresStorage.getAll();
    const mapped = proveedoresFromStorage.map((p) => ({
      ...p,
      estado: p.estado as "Activo" | "Inactivo",
      logo:
        p.logo ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${p.nombre.substring(
          0,
          2
        )}&backgroundColor=14B8A6`,
    }));
    setProveedores(mapped);
  }, []);

  // Sincronizar cambios con localStorage
  useEffect(() => {
    if (proveedores.length > 0 || proveedoresStorage.getAll().length > 0) {
      proveedoresStorage.save(proveedores as StorageProveedor[]);
    }
  }, [proveedores]);

  // Estados para búsqueda, ordenamiento y paginación
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("nombre");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados para modales
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const [errors, setErrors] = useState({
    nombre: "",
    nit: "",
    contacto: "",
    telefono: "",
    email: "",
  });

  const [touched, setTouched] = useState({
    nombre: false,
    nit: false,
    contacto: false,
    telefono: false,
    email: false,
  });

  // Validaciones
  const validateNombre = (nombre: string) => {
    if (!nombre.trim()) return "El nombre es requerido";
    if (nombre.length < 3) return "Mínimo 3 caracteres";
    return "";
  };

  const validateNit = (nit: string) => {
    if (!nit.trim()) return "El NIT es requerido";
    const nitRegex = /^\d{9,10}-\d{1}$/;
    if (!nitRegex.test(nit)) return "Formato: 123456789-0";
    return "";
  };

  const validateContacto = (contacto: string) => {
    if (!contacto.trim()) return "El contacto es requerido";
    return "";
  };

  const validateTelefono = (telefono: string) => {
    if (!telefono.trim()) return "El teléfono es requerido";
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(telefono.replace(/\s/g, "")))
      return "Formato inválido";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Email inválido";
    return "";
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });

    let error = "";
    switch (field) {
      case "nombre":
        error = validateNombre(formData.nombre);
        break;
      case "nit":
        error = validateNit(formData.nit);
        break;
      case "contacto":
        error = validateContacto(formData.contacto);
        break;
      case "telefono":
        error = validateTelefono(formData.telefono);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
    }

    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (touched[field as keyof typeof touched]) {
      let error = "";
      switch (field) {
        case "nombre":
          error = validateNombre(value);
          break;
        case "nit":
          error = validateNit(value);
          break;
        case "contacto":
          error = validateContacto(value);
          break;
        case "telefono":
          error = validateTelefono(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
      }
      setErrors({ ...errors, [field]: error });
    }
  };

  const isFormValid = () => {
    const nombreError = validateNombre(formData.nombre);
    const nitError = validateNit(formData.nit);
    const contactoError = validateContacto(formData.contacto);
    const telefonoError = validateTelefono(formData.telefono);
    const emailError = validateEmail(formData.email);

    return (
      !nombreError &&
      !nitError &&
      !contactoError &&
      !telefonoError &&
      !emailError
    );
  };

  const openCreateModal = () => {
    setSelectedProveedor(null);
    setFormData({
      nombre: "",
      nit: "",
      contacto: "",
      telefono: "",
      email: "",
      direccion: "",
    });
    setErrors({
      nombre: "",
      nit: "",
      contacto: "",
      telefono: "",
      email: "",
    });
    setTouched({
      nombre: false,
      nit: false,
      contacto: false,
      telefono: false,
      email: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      nombre: proveedor.nombre,
      nit: proveedor.nit,
      contacto: proveedor.contacto,
      telefono: proveedor.telefono,
      email: proveedor.email,
      direccion: proveedor.direccion,
    });
    setErrors({
      nombre: "",
      nit: "",
      contacto: "",
      telefono: "",
      email: "",
    });
    setTouched({
      nombre: false,
      nit: false,
      contacto: false,
      telefono: false,
      email: false,
    });
    setModalOpen(true);
  };

  const openDeleteDialog = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      nombre: true,
      nit: true,
      contacto: true,
      telefono: true,
      email: true,
    });

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

    if (selectedProveedor) {
      setProveedores(
        proveedores.map((p) =>
          p.id === selectedProveedor.id ? { ...p, ...formData } : p
        )
      );
      toast.success("Proveedor actualizado exitosamente", {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      });
    } else {
      const newProveedor: Proveedor = {
        id: String(Date.now()),
        ...formData,
        estado: "Activo",
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${formData.nombre}&backgroundColor=14B8A6`,
      };
      setProveedores([newProveedor, ...proveedores]);
      toast.success("Proveedor registrado exitosamente", {
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
    if (!selectedProveedor) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProveedores(proveedores.filter((p) => p.id !== selectedProveedor.id));

    toast.success("Proveedor eliminado exitosamente", {
      style: {
        background: "#EF4444",
        color: "white",
        border: "1px solid #EF4444",
      },
    });

    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedProveedor(null);
  };

  // Mejora 3: Toggle de estado con animación
  const toggleEstado = (proveedor: Proveedor) => {
    const newEstado = proveedor.estado === "Activo" ? "Inactivo" : "Activo";
    setProveedores(
      proveedores.map((p) =>
        p.id === proveedor.id ? { ...p, estado: newEstado } : p
      )
    );

    toast.success(
      `Proveedor ${
        newEstado === "Activo" ? "activado" : "desactivado"
      } exitosamente`,
      {
        style: {
          background: newEstado === "Activo" ? "#14B8A6" : "#6B7280",
          color: "white",
          border: `1px solid ${newEstado === "Activo" ? "#14B8A6" : "#6B7280"}`,
        },
      }
    );
  };

  // Mejora 1: Búsqueda mejorada
  const filteredProveedores = proveedores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefono.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mejora 1: Ordenamiento
  const sortedProveedores = [...filteredProveedores].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "estado") {
      aValue = a.estado === "Activo" ? "1" : "2";
      bValue = b.estado === "Activo" ? "1" : "2";
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Mejora 1: Paginación
  const totalPages = Math.ceil(sortedProveedores.length / itemsPerPage);
  const paginatedProveedores = sortedProveedores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
            Gestión de Proveedores
          </h2>
          <p
            className={`${textSecondary} mt-1 transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Administra y controla tus proveedores de productos farmacéuticos
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Mejora 1: Buscador mejorado */}
      <div
        className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300`}
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
            placeholder="Buscar por nombre, RUC, email..."
            className={`pl-12 h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#14B8A6]`}
          />
        </div>
        {searchTerm && (
          <p className={`${textSecondary} mt-2 text-sm`}>
            Se encontraron {filteredProveedores.length} resultado(s)
          </p>
        )}
      </div>

      {/* Mejora 1: Tabla con columnas ordenables */}
      <div
        className={`${bgCard} rounded-xl border ${border} shadow-sm overflow-hidden transition-colors duration-300`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9]">
              <tr>
                {[
                  { field: "nombre" as SortField, label: "Nombre" },
                  { field: "nit" as SortField, label: "RUC" },
                  { field: "telefono" as SortField, label: "Teléfono" },
                  { field: "email" as SortField, label: "Email" },
                  { field: "estado" as SortField, label: "Estado" },
                ].map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="text-left p-4 text-white cursor-pointer hover:bg-white/10 transition-colors"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    <div className="flex items-center gap-2">
                      {label}
                      <ArrowUpDown
                        className={`w-4 h-4 ${
                          sortField === field ? "text-white" : "text-white/50"
                        }`}
                      />
                    </div>
                  </th>
                ))}
                <th
                  className="text-center p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProveedores.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`text-center p-8 ${textSecondary}`}
                  >
                    No se encontraron proveedores
                  </td>
                </tr>
              ) : (
                paginatedProveedores.map((proveedor) => (
                  <tr
                    key={proveedor.id}
                    className={`border-b ${border} transition-all duration-300 ${
                      proveedor.estado === "Inactivo"
                        ? `${
                            isDark ? "bg-[#161b22]/50" : "bg-gray-100/50"
                          } opacity-60`
                        : "hover:bg-[#14B8A6] hover:bg-opacity-10"
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={proveedor.logo}
                          alt={proveedor.nombre}
                          className={`w-10 h-10 rounded-full border-2 ${
                            isDark ? "border-[#161b22]" : "border-white"
                          }`}
                        />
                        <span
                          className={`${textPrimary} ${
                            proveedor.estado === "Inactivo"
                              ? "line-through"
                              : ""
                          }`}
                          style={{ fontWeight: 600, fontSize: "14px" }}
                        >
                          {proveedor.nombre}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`p-4 ${textPrimary} ${
                        proveedor.estado === "Inactivo" ? "line-through" : ""
                      }`}
                      style={{ fontSize: "14px" }}
                    >
                      {proveedor.nit}
                    </td>
                    <td
                      className={`p-4 ${textPrimary} ${
                        proveedor.estado === "Inactivo" ? "line-through" : ""
                      }`}
                      style={{ fontSize: "14px" }}
                    >
                      {proveedor.telefono}
                    </td>
                    <td
                      className={`p-4 ${textPrimary} ${
                        proveedor.estado === "Inactivo" ? "line-through" : ""
                      }`}
                      style={{ fontSize: "14px" }}
                    >
                      {proveedor.email}
                    </td>
                    <td className="p-4">
                      {/* Mejora 3: Toggle de estado bonito con animación */}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={proveedor.estado === "Activo"}
                          onCheckedChange={() => toggleEstado(proveedor)}
                          className="data-[state=checked]:bg-[#14B8A6]"
                        />
                        <span
                          className={`text-sm ${
                            proveedor.estado === "Activo"
                              ? "text-[#14B8A6]"
                              : textSecondary
                          }`}
                          style={{ fontWeight: 600, fontSize: "13px" }}
                        >
                          {proveedor.estado}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => {
                            setSelectedProveedor(proveedor);
                            setDetailModalOpen(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg h-9 w-9 p-0 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => openEditModal(proveedor)}
                          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg h-9 px-3 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => openDeleteDialog(proveedor)}
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

        {/* Mejora 1: Paginación */}
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between p-4 border-t ${border}`}
          >
            <p className={textSecondary} style={{ fontSize: "14px" }}>
              Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, sortedProveedores.length)}{" "}
              de {sortedProveedores.length} proveedores
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
        )}
      </div>

      {/* Modal Detalle Proveedor */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-2xl`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span
                className={textPrimary}
                style={{ fontSize: "22px", fontWeight: 700 }}
              >
                Detalle del Proveedor
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedProveedor && (
            <div className="space-y-6 mt-4">
              {/* Logo y nombre */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedProveedor.logo}
                  alt={selectedProveedor.nombre}
                  className="w-20 h-20 rounded-full border-4 border-[#14B8A6]"
                />
                <div>
                  <h3 className={`${textPrimary} text-xl font-bold`}>
                    {selectedProveedor.nombre}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedProveedor.estado === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedProveedor.estado}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    <FileText className="w-3 h-3 inline mr-1" />
                    RUC / NIT
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProveedor.nit}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    <Building2 className="w-3 h-3 inline mr-1" />
                    Contacto
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProveedor.contacto}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    <Phone className="w-3 h-3 inline mr-1" />
                    Teléfono
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProveedor.telefono}
                  </p>
                </div>
                <div>
                  <p className={`${textSecondary} text-xs mb-1`}>
                    <Mail className="w-3 h-3 inline mr-1" />
                    Email
                  </p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedProveedor.email}
                  </p>
                </div>
                {selectedProveedor.direccion && (
                  <div className="col-span-2">
                    <p className={`${textSecondary} text-xs mb-1`}>
                      <MapPin className="w-3 h-3 inline mr-1" />
                      Dirección
                    </p>
                    <p className={`${textPrimary} font-semibold`}>
                      {selectedProveedor.direccion}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setDetailModalOpen(false)}
                className="w-full h-11 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                style={{ fontWeight: 600 }}
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Proveedor */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[600px] rounded-xl border-2 ${border} max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span
                  className={textPrimary}
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {selectedProveedor ? "Editar Proveedor" : "Nuevo Proveedor"}
                </span>
                <p className={`${textSecondary} text-sm`}>
                  Complete la información del proveedor
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Nombre *
              </label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                onBlur={() => handleBlur("nombre")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.nombre && touched.nombre ? "border-red-500" : ""}`}
                placeholder="Nombre del proveedor"
              />
              {errors.nombre && touched.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                RUC / NIT *
              </label>
              <Input
                value={formData.nit}
                onChange={(e) => handleChange("nit", e.target.value)}
                onBlur={() => handleBlur("nit")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.nit && touched.nit ? "border-red-500" : ""}`}
                placeholder="123456789-0"
              />
              {errors.nit && touched.nit && (
                <p className="text-red-500 text-xs mt-1">{errors.nit}</p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Contacto *
              </label>
              <Input
                value={formData.contacto}
                onChange={(e) => handleChange("contacto", e.target.value)}
                onBlur={() => handleBlur("contacto")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${
                  errors.contacto && touched.contacto ? "border-red-500" : ""
                }`}
                placeholder="Nombre de contacto"
              />
              {errors.contacto && touched.contacto && (
                <p className="text-red-500 text-xs mt-1">{errors.contacto}</p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Teléfono *
              </label>
              <Input
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                onBlur={() => handleBlur("telefono")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${
                  errors.telefono && touched.telefono ? "border-red-500" : ""
                }`}
                placeholder="+57 310 1234567"
              />
              {errors.telefono && touched.telefono && (
                <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Email *
              </label>
              <Input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.email && touched.email ? "border-red-500" : ""}`}
                placeholder="proveedor@ejemplo.com"
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Dirección
              </label>
              <Textarea
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                className={`${inputBorder} ${inputBg}`}
                placeholder="Dirección del proveedor"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`flex-1 h-11 rounded-xl ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                }`}
                style={{ fontWeight: 600 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                style={{ fontWeight: 600 }}
              >
                {selectedProveedor ? "Guardar cambios" : "Crear proveedor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mejora 2: Modal de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={`${modalBg} rounded-xl border-2 ${border}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span
                className="text-red-600"
                style={{ fontSize: "22px", fontWeight: 700 }}
              >
                ¿Eliminar proveedor?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} ml-16`}
              style={{ fontSize: "14px" }}
            >
              Se eliminará permanentemente a "{selectedProveedor?.nombre}". Esta
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
