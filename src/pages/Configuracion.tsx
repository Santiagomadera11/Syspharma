import { useState, useEffect } from "react";
import {
  Save,
  Building2,
  User,
  Bell,
  Shield,
  Database,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  Users as UsersIcon,
  Search,
  Filter,
  Plus,
  Info,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Checkbox } from "../components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useDarkMode } from "../hooks/useDarkMode";
import { rolesStorage } from "../utils/localStorage";
import { motion, AnimatePresence } from "motion/react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Popover from "@radix-ui/react-popover";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

interface Rol {
  id: string;
  nombre: string;
  color: string;
  descripcion: string;
  permisos: string[];
  usuariosActivos: number;
  estado: boolean;
  fechaCreacion: string;
}

interface ConfiguracionProps {
  user: any;
}

const permisosDisponibles = {
  usuarios: [
    {
      id: "ver_usuarios",
      nombre: "Ver Usuarios",
      descripcion: "Visualizar lista de usuarios",
    },
    {
      id: "crear_usuarios",
      nombre: "Crear Usuarios",
      descripcion: "Agregar nuevos usuarios",
    },
    {
      id: "editar_usuarios",
      nombre: "Editar Usuarios",
      descripcion: "Modificar usuarios existentes",
    },
    {
      id: "eliminar_usuarios",
      nombre: "Eliminar Usuarios",
      descripcion: "Eliminar usuarios del sistema",
    },
  ],
  facturacion: [
    {
      id: "ver_facturas",
      nombre: "Ver Facturas",
      descripcion: "Visualizar facturas",
    },
    {
      id: "crear_facturas",
      nombre: "Crear Facturas",
      descripcion: "Generar nuevas facturas",
    },
    {
      id: "anular_facturas",
      nombre: "Anular Facturas",
      descripcion: "Anular facturas existentes",
    },
  ],
  reportes: [
    {
      id: "ver_reportes",
      nombre: "Ver Reportes",
      descripcion: "Acceso a reportes",
    },
    {
      id: "exportar_reportes",
      nombre: "Exportar Reportes",
      descripcion: "Descargar reportes",
    },
  ],
  configuracion: [
    {
      id: "ver_config",
      nombre: "Ver Configuración",
      descripcion: "Ver ajustes del sistema",
    },
    {
      id: "editar_config",
      nombre: "Editar Configuración",
      descripcion: "Modificar configuración",
    },
    {
      id: "gestionar_roles",
      nombre: "Gestionar Roles",
      descripcion: "Administrar roles y permisos",
    },
  ],
  inventario: [
    {
      id: "ver_productos",
      nombre: "Ver Productos",
      descripcion: "Visualizar inventario",
    },
    {
      id: "crear_productos",
      nombre: "Crear Productos",
      descripcion: "Agregar productos",
    },
    {
      id: "editar_productos",
      nombre: "Editar Productos",
      descripcion: "Modificar productos",
    },
  ],
};

const coloresDisponibles = [
  { value: "#63E6BE", label: "Turquesa" },
  { value: "#3D4756", label: "Gris Oscuro" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#F59E0B", label: "Naranja" },
  { value: "#10B981", label: "Verde" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#8B5CF6", label: "Morado" },
  { value: "#EC4899", label: "Rosa" },
];

export default function Configuracion({ user }: ConfiguracionProps) {
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
  const [roles, setRoles] = useState<Rol[]>(() => {
    return rolesStorage.getAll();
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<
    "todos" | "activos" | "inactivos"
  >("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [activeTab, setActiveTab] = useState("datos");

  const [formData, setFormData] = useState({
    nombre: "",
    color: "#63E6BE",
    descripcion: "",
    permisos: [] as string[],
  });

  const [errors, setErrors] = useState({
    nombre: "",
    descripcion: "",
  });

  const [touched, setTouched] = useState({
    nombre: false,
    descripcion: false,
  });

  // Guardar roles en localStorage cada vez que cambien
  useEffect(() => {
    rolesStorage.save(roles);
  }, [roles]);

  const validateNombre = (nombre: string) => {
    if (!nombre) return "El nombre es requerido";
    if (nombre.length < 3) return "Mínimo 3 caracteres";
    return "";
  };

  const validateDescripcion = (descripcion: string) => {
    if (!descripcion) return "La descripción es requerida";
    if (descripcion.length < 10) return "Mínimo 10 caracteres";
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

    if (field === "nombre") {
      setErrors({ ...errors, nombre: validateNombre(formData.nombre) });
    } else if (field === "descripcion") {
      setErrors({
        ...errors,
        descripcion: validateDescripcion(formData.descripcion),
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (touched[field as keyof typeof touched]) {
      if (field === "nombre") {
        setErrors({ ...errors, nombre: validateNombre(value) });
      } else if (field === "descripcion") {
        setErrors({ ...errors, descripcion: validateDescripcion(value) });
      }
    }
  };

  const togglePermiso = (permisoId: string) => {
    if (formData.permisos.includes(permisoId)) {
      setFormData({
        ...formData,
        permisos: formData.permisos.filter((p) => p !== permisoId),
      });
    } else {
      setFormData({ ...formData, permisos: [...formData.permisos, permisoId] });
    }
  };

  const openCreateModal = () => {
    setSelectedRol(null);
    // Reiniciar los datos del formulario al crear un nuevo rol
    setFormData({
      nombre: "",
      color: "#63E6BE",
      descripcion: "",
      permisos: [],
    });
    setErrors({ nombre: "", descripcion: "" });
    setTouched({ nombre: false, descripcion: false });
    setModalOpen(true);
  };

  const openEditModal = (rol: Rol) => {
    setSelectedRol(rol);
    setFormData({
      nombre: rol.nombre,
      color: rol.color,
      descripcion: rol.descripcion,
      permisos: [...rol.permisos],
    });
    setErrors({ nombre: "", descripcion: "" });
    setTouched({ nombre: false, descripcion: false });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    setTouched({ nombre: true, descripcion: true });

    const nombreError = validateNombre(formData.nombre);
    const descripcionError = validateDescripcion(formData.descripcion);

    setErrors({
      nombre: nombreError,
      descripcion: descripcionError,
    });

    if (nombreError || descripcionError) {
      return;
    }

    if (selectedRol) {
      setRoles(
        roles.map((r) => (r.id === selectedRol.id ? { ...r, ...formData } : r))
      );
      toast.success("Rol actualizado exitosamente", {
        style: {
          background: "#63E6BE",
          color: "white",
          border: "1px solid #63E6BE",
        },
      });
    } else {
      const newRol: Rol = {
        id: String(Date.now()),
        ...formData,
        usuariosActivos: 0,
        estado: true,
        fechaCreacion: new Date().toISOString().split("T")[0],
      };
      setRoles([...roles, newRol]);
      toast.success("Rol creado exitosamente", {
        style: {
          background: "#63E6BE",
          color: "white",
          border: "1px solid #63E6BE",
        },
      });
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedRol) return;

    setRoles(roles.filter((r) => r.id !== selectedRol.id));
    toast.success("Rol eliminado exitosamente", {
      style: {
        background: "#63E6BE",
        color: "white",
        border: "1px solid #63E6BE",
      },
    });

    setDeleteDialogOpen(false);
    setSelectedRol(null);
  };

  const toggleEstado = (rol: Rol) => {
    if (rol.usuariosActivos > 0 && rol.estado) {
      return; // No permitir desactivar si hay usuarios activos
    }

    setRoles(
      roles.map((r) => (r.id === rol.id ? { ...r, estado: !r.estado } : r))
    );

    toast.success(`Rol ${!rol.estado ? "activado" : "desactivado"}`, {
      style: {
        background: "#63E6BE",
        color: "white",
        border: "1px solid #63E6BE",
      },
    });
  };

  const filteredRoles = roles.filter((rol) => {
    const matchesSearch =
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterEstado === "todos" ||
      (filterEstado === "activos" && rol.estado) ||
      (filterEstado === "inactivos" && !rol.estado);
    return matchesSearch && matchesFilter;
  });

  const isFormValid = () => {
    return (
      formData.nombre &&
      formData.descripcion &&
      !validateNombre(formData.nombre) &&
      !validateDescripcion(formData.descripcion)
    );
  };

  return (
    <Tooltip.Provider>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Gestión de Roles y Permisos
          </h2>
          <p
            className={`${textSecondary} mt-1 transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Administra los roles y permisos del sistema
          </p>
        </motion.div>

        {/* Tarjeta compacta: Botón para crear rol */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`${bgCard} rounded-2xl shadow-lg border ${border} p-8 transition-colors duration-300 flex items-center justify-between`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#63E6BE] to-[#3D4756] flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3
                className={textPrimary}
                style={{ fontSize: "18px", fontWeight: 700 }}
              >
                Crear Nuevo Rol
              </h3>
              <p className={textSecondary} style={{ fontSize: "13px" }}>
                Abre el modal para definir nombre, descripción y asignar
                permisos
              </p>
            </div>
          </div>

          <Button
            onClick={openCreateModal}
            className="h-11 px-6 rounded-xl text-white shadow-lg transition-all duration-300 bg-[#63E6BE] hover:bg-[#5DD5BE] hover:shadow-xl hover:scale-105 flex-shrink-0"
            style={{ fontWeight: 600 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear
          </Button>
        </motion.div>

        {/* Buscador y Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`${bgCard} rounded-2xl shadow-sm border ${border} p-6 transition-colors duration-300`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#63E6BE]" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20`}
              />
            </div>

            {/* Botón de Filtros */}
            <Popover.Root open={showFilters} onOpenChange={setShowFilters}>
              <Popover.Trigger asChild>
                <Button
                  className="h-12 px-6 rounded-xl bg-[#3D4756] hover:bg-[#2D3746] text-white shadow-md transition-all duration-300"
                  style={{ fontWeight: 600 }}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                  {filterEstado !== "todos" && (
                    <span className="ml-2 w-2 h-2 bg-[#63E6BE] rounded-full" />
                  )}
                </Button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className={`${bgCard} rounded-xl shadow-2xl border ${border} p-4 w-[300px] z-50`}
                  sideOffset={5}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h4
                      className={textPrimary}
                      style={{ fontSize: "16px", fontWeight: 700 }}
                    >
                      Filtros Avanzados
                    </h4>

                    <div className="space-y-3 mt-4">
                      <div>
                        <label
                          className={`block ${textPrimary} mb-2`}
                          style={{ fontSize: "13px", fontWeight: 600 }}
                        >
                          Estado
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: "todos", label: "Todos los roles" },
                            { value: "activos", label: "Solo activos" },
                            { value: "inactivos", label: "Solo inactivos" },
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() =>
                                setFilterEstado(option.value as any)
                              }
                              className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                                filterEstado === option.value
                                  ? "bg-[#63E6BE] text-white shadow-md"
                                  : `${
                                      isDark
                                        ? "bg-[#0d1117] text-gray-300 hover:bg-[#161b22]"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`
                              }`}
                              style={{ fontSize: "13px", fontWeight: 500 }}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          setFilterEstado("todos");
                          setShowFilters(false);
                        }}
                        className={`w-full h-10 rounded-lg transition-all ${
                          isDark
                            ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                            : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                        }`}
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </motion.div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </motion.div>

        {/* Tabla de Roles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`${bgCard} rounded-2xl border ${border} shadow-lg overflow-hidden transition-colors duration-300`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#63E6BE] to-[#3D4756]">
                <tr>
                  <th
                    className="text-left p-4 text-white"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Nombre del Rol
                  </th>
                  <th
                    className="text-left p-4 text-white"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Descripción
                  </th>
                  <th
                    className="text-center p-4 text-white"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Usuarios
                  </th>
                  <th
                    className="text-center p-4 text-white"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Estado
                  </th>
                  <th
                    className="text-right p-4 text-white"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredRoles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className={`text-center p-8 ${textSecondary}`}
                      >
                        No se encontraron roles
                      </td>
                    </tr>
                  ) : (
                    filteredRoles.map((rol, index) => (
                      <motion.tr
                        key={rol.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`border-b ${border} hover:bg-[#63E6BE] hover:bg-opacity-10 transition-all duration-300 group`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                              style={{ background: rol.color }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={textPrimary}
                                  style={{ fontSize: "15px", fontWeight: 700 }}
                                >
                                  {rol.nombre}
                                </span>
                                <span
                                  className="px-3 py-0.5 rounded-full text-white shadow-sm"
                                  style={{
                                    background: rol.color,
                                    fontSize: "11px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {rol.permisos.length} permisos
                                </span>
                              </div>
                              <p
                                className={textSecondary}
                                style={{ fontSize: "12px" }}
                              >
                                ID: {rol.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p
                            className={textPrimary}
                            style={{ fontSize: "14px" }}
                          >
                            {rol.descripcion}
                          </p>
                          <p
                            className={`${textSecondary} mt-1 flex items-center gap-1`}
                            style={{ fontSize: "11px" }}
                          >
                            <Calendar className="w-3 h-3" />
                            Creado:{" "}
                            {new Date(rol.fechaCreacion).toLocaleDateString(
                              "es-ES"
                            )}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-[#63E6BE] bg-opacity-20 flex items-center justify-center">
                              <UsersIcon className="w-5 h-5 text-[#63E6BE]" />
                            </div>
                            <span
                              className={textPrimary}
                              style={{ fontSize: "16px", fontWeight: 700 }}
                            >
                              {rol.usuariosActivos}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <Tooltip.Root>
                              <Tooltip.Trigger asChild>
                                <div className="inline-block">
                                  <Switch
                                    checked={rol.estado}
                                    onCheckedChange={() => toggleEstado(rol)}
                                    disabled={
                                      rol.usuariosActivos > 0 && rol.estado
                                    }
                                    className={`${
                                      rol.usuariosActivos > 0 && rol.estado
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                    } data-[state=checked]:bg-[#63E6BE]`}
                                  />
                                </div>
                              </Tooltip.Trigger>
                              {rol.usuariosActivos > 0 && rol.estado && (
                                <Tooltip.Portal>
                                  <Tooltip.Content
                                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl max-w-xs z-50"
                                    sideOffset={5}
                                  >
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-400" />
                                      <div>
                                        <p style={{ fontWeight: 600 }}>
                                          No se puede desactivar
                                        </p>
                                        <p className="text-xs opacity-90">
                                          Hay {rol.usuariosActivos} usuarios
                                          activos con este rol
                                        </p>
                                      </div>
                                    </div>
                                    <Tooltip.Arrow className="fill-gray-900" />
                                  </Tooltip.Content>
                                </Tooltip.Portal>
                              )}
                            </Tooltip.Root>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              onClick={() => openEditModal(rol)}
                              className="bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-9 px-3 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedRol(rol);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={rol.usuariosActivos > 0}
                              className={`rounded-xl h-9 px-3 shadow-md transition-all duration-300 ${
                                rol.usuariosActivos > 0
                                  ? `${
                                      isDark
                                        ? "bg-[#161b22] text-gray-600"
                                        : "bg-gray-300 text-gray-500"
                                    } cursor-not-allowed`
                                  : "bg-red-500 hover:bg-red-600 text-white hover:shadow-lg hover:scale-110"
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal de Edición */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent
            className={`${modalBg} sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${border}`}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: formData.color }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span
                    className={`${textPrimary} block`}
                    style={{ fontSize: "22px", fontWeight: 700 }}
                  >
                    {selectedRol ? "Editar Rol" : "Crear Nuevo Rol"}
                  </span>
                  <span
                    className={`${textSecondary} block`}
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {formData.nombre || "Complete los datos básicos"}
                  </span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList
                className={`grid w-full grid-cols-2 ${
                  isDark ? "bg-[#0d1117]" : "bg-gray-100"
                }`}
              >
                <TabsTrigger
                  value="datos"
                  className={`data-[state=active]:bg-[#63E6BE] data-[state=active]:text-white ${textPrimary}`}
                >
                  Datos Básicos
                </TabsTrigger>
                <TabsTrigger
                  value="permisos"
                  className={`data-[state=active]:bg-[#63E6BE] data-[state=active]:text-white ${textPrimary}`}
                >
                  Permisos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="datos" className="space-y-4 mt-4">
                {/* Formulario de Datos Básicos */}
                <div>
                  <label
                    className={`block ${textPrimary} mb-2`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    Nombre del Rol *
                  </label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    onBlur={() => handleBlur("nombre")}
                    placeholder="Ej: Gerente de Ventas"
                    className={`h-11 rounded-xl border-2 transition-all ${inputBg} ${inputText} ${
                      touched.nombre && errors.nombre
                        ? "border-red-500"
                        : `${inputBorder} focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20`
                    }`}
                  />
                  {touched.nombre && errors.nombre && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className={`block ${textPrimary} mb-2`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    Color del Rol *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className={`w-full h-11 pl-4 pr-10 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20 outline-none appearance-none`}
                      style={{ fontSize: "14px", fontWeight: 500 }}
                    >
                      {coloresDisponibles.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-2 ${
                        isDark ? "border-[#161b22]" : "border-white"
                      } shadow-md`}
                      style={{ background: formData.color }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block ${textPrimary} mb-2`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    Descripción *
                  </label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) =>
                      handleChange("descripcion", e.target.value)
                    }
                    onBlur={() => handleBlur("descripcion")}
                    placeholder="Describe las responsabilidades de este rol (mínimo 10 caracteres)"
                    rows={4}
                    className={`rounded-xl border-2 transition-all ${inputBg} ${inputText} ${
                      touched.descripcion && errors.descripcion
                        ? "border-red-500"
                        : `${inputBorder} focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20`
                    }`}
                  />
                  {touched.descripcion && errors.descripcion && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.descripcion}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-[#63E6BE] bg-opacity-10 rounded-xl border border-[#63E6BE]">
                  <p
                    className={textPrimary}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    💡 Complete los datos básicos y luego vaya a la pestaña
                    "Permisos" para asignar los permisos del rol.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="permisos" className="space-y-4 mt-4">
                {/* Resumen de datos básicos */}
                <div
                  className={`p-4 ${
                    isDark ? "bg-[#0d1117]" : "bg-gray-50"
                  } rounded-xl`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className={`${textSecondary} text-xs mb-1`}>
                        Nombre del Rol
                      </p>
                      <p className={`${textPrimary} font-semibold`}>
                        {formData.nombre || "Sin especificar"}
                      </p>
                    </div>
                    <div>
                      <p className={`${textSecondary} text-xs mb-1`}>Color</p>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full shadow-md"
                          style={{ background: formData.color }}
                        />
                        <span
                          className={`${textPrimary} font-semibold text-xs`}
                        >
                          {formData.color}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permisos por Módulo */}
                <div className="space-y-4">
                  <h4
                    className={`${textPrimary} flex items-center gap-2`}
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    <Shield className="w-5 h-5 text-[#63E6BE]" />
                    Permisos del Rol
                  </h4>

                  {Object.entries(permisosDisponibles).map(
                    ([modulo, permisos]) => (
                      <motion.div
                        key={modulo}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border-2 ${border} rounded-xl p-4 hover:border-[#63E6BE] transition-all duration-300`}
                      >
                        <h5
                          className={`${textPrimary} mb-3 capitalize`}
                          style={{ fontSize: "15px", fontWeight: 700 }}
                        >
                          {modulo}
                        </h5>
                        <div className="space-y-2">
                          {permisos.map((permiso) => (
                            <div
                              key={permiso.id}
                              className={`flex items-start gap-3 p-3 rounded-lg ${
                                isDark
                                  ? "hover:bg-[#161b22]"
                                  : "hover:bg-gray-50"
                              } transition-all cursor-pointer`}
                              onClick={() => togglePermiso(permiso.id)}
                            >
                              <Checkbox
                                checked={formData.permisos.includes(permiso.id)}
                                onCheckedChange={() =>
                                  togglePermiso(permiso.id)
                                }
                                className="mt-1 data-[state=checked]:bg-[#63E6BE] data-[state=checked]:border-[#63E6BE]"
                              />
                              <div className="flex-1">
                                <p
                                  className={textPrimary}
                                  style={{ fontSize: "14px", fontWeight: 600 }}
                                >
                                  {permiso.nombre}
                                </p>
                                <p
                                  className={textSecondary}
                                  style={{ fontSize: "12px" }}
                                >
                                  {permiso.descripcion}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  )}
                </div>

                {/* Resumen */}
                <div className="p-4 bg-[#63E6BE] bg-opacity-10 rounded-xl border border-[#63E6BE]">
                  <p
                    className={textPrimary}
                    style={{ fontSize: "14px", fontWeight: 600 }}
                  >
                    Total de permisos seleccionados:{" "}
                    <span className="text-[#63E6BE] font-bold">
                      {formData.permisos.length}
                    </span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Botones */}
            <div className={`flex gap-3 mt-6 pt-6 border-t ${border}`}>
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`flex-1 h-12 rounded-xl transition-all duration-300 ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                }`}
                style={{ fontWeight: 600 }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`flex-1 h-12 rounded-xl shadow-lg transition-all duration-300 ${
                  isFormValid()
                    ? "bg-[#63E6BE] hover:bg-[#5DD5BE] hover:shadow-xl text-white"
                    : `${
                        isDark
                          ? "bg-[#161b22] text-gray-600"
                          : "bg-gray-400 text-gray-600"
                      } cursor-not-allowed`
                }`}
                style={{ fontWeight: 600 }}
              >
                <Shield className="w-4 h-4 mr-2" />
                {selectedRol ? "Guardar Cambios" : "Crear Rol"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Eliminación */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent
            className={`${modalBg} rounded-2xl border-2 ${border}`}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <span
                  className={textPrimary}
                  style={{ fontSize: "20px", fontWeight: 700 }}
                >
                  ¿Eliminar rol?
                </span>
              </AlertDialogTitle>
              <AlertDialogDescription
                className={`${textSecondary} ml-16`}
                style={{ fontSize: "14px" }}
              >
                ¿Estás seguro de eliminar el rol "{selectedRol?.nombre}"? Esta
                acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel
                className={`h-11 rounded-xl ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
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
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Tooltip.Provider>
  );
}
