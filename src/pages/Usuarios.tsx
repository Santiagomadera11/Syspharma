import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  Filter,
  FileText,
  Info,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
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
import { motion, AnimatePresence } from "motion/react";
import * as Popover from "@radix-ui/react-popover";
import { useDarkMode } from "../hooks/useDarkMode";
import { useRoles } from "../hooks/useEntities";
import { usersStorage, User as StorageUser } from "../utils/localStorage";
import {
  validateFullName,
  validateEmail as validateEmailUtil,
  validatePhone,
  validateDNI,
  onlyNumbers,
  onlyLetters,
} from "../utils/validation";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  activo: boolean;
  estado?: boolean;
  avatar?: string;
  createdAt?: string;
}

interface UsuariosProps {
  user: any;
}

const tiposDocumento = ["DNI", "Cédula", "Pasaporte", "Otro"];

export default function Usuarios({ user }: UsuariosProps) {
  const {
    isDark,
    bgCard,
    textPrimary,
    textSecondary,
    border,
    borderStrong,
    inputBg,
    inputBorder,
    tableHeader,
    tableRow,
    modalBg,
  } = useDarkMode();
  const [sortField, setSortField] = useState<"nombre" | "documento" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Cargar usuarios desde localStorage al iniciar
  useEffect(() => {
    const usersFromStorage = usersStorage.getAll();
    const mappedUsers = usersFromStorage.map((u) => ({
      ...u,
      estado: u.activo,
      tipoDocumento: u.tipoDocumento || "DNI",
      numeroDocumento: u.numeroDocumento || "",
    }));
    setUsuarios(mappedUsers);
  }, []);

  // Sincronizar cambios con localStorage
  useEffect(() => {
    if (usuarios.length > 0) {
      const mappedForStorage = usuarios.map((u) => ({
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        password: u.password,
        rol: u.rol,
        activo: u.estado ?? u.activo ?? true,
        telefono: u.telefono || "",
        tipoDocumento: u.tipoDocumento,
        numeroDocumento: u.numeroDocumento,
        createdAt: u.createdAt || new Date().toISOString(),
      })) as StorageUser[];
      usersStorage.save(mappedForStorage);
    }
  }, [usuarios]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState<string>("");
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [filterTipoDoc, setFilterTipoDoc] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    tipoDocumento: "",
    numeroDocumento: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    estado: true,
  });

  const [errors, setErrors] = useState({
    nombre: "",
    email: "",
    rol: "",
    tipoDocumento: "",
    numeroDocumento: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    nombre: false,
    email: false,
    rol: false,
    tipoDocumento: false,
    numeroDocumento: false,
    password: false,
    confirmPassword: false,
  });

  // Obtener roles desde storage para que los selects se mantengan sincronizados
  const { items: rolesFromStorage } = useRoles();
  const roles = rolesFromStorage.filter((r) => r.estado).map((r) => r.nombre);

  const validateNombre = (nombre: string) => {
    const result = validateFullName(nombre);
    return result.isValid ? "" : result.message;
  };

  const validateEmail = (email: string, isEdit: boolean = false) => {
    const result = validateEmailUtil(email);
    if (!result.isValid) return result.message;

    const exists = usuarios.some(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        (!isEdit || u.id !== selectedUsuario?.id)
    );
    if (exists) return "Email ya registrado";

    return "";
  };

  const validateRol = (rol: string) => {
    if (!rol) return "Selecciona un rol";
    return "";
  };

  const validateTipoDocumento = (tipo: string) => {
    if (!tipo) return "Selecciona un tipo";
    return "";
  };

  const validateNumeroDocumento = (numero: string) => {
    if (!numero) return "Requerido";
    const result = validateDNI(numero);
    return result.isValid ? "" : result.message;
  };

  const validatePassword = (password: string, isEdit: boolean = false) => {
    // En edición, la contraseña es opcional
    if (!password && isEdit) return "";
    if (!password && !isEdit) return "Requerido";
    if (password && password.length < 8) return "Mínimo 8 caracteres";
    if (password && !/[A-Z]/.test(password)) return "Debe contener mayúscula";
    if (password && !/[0-9]/.test(password)) return "Debe contener número";
    return "";
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    isEdit: boolean = false
  ) => {
    // En edición, solo validar si se ingresó contraseña
    if (!formData.password && isEdit) return "";
    if (!confirmPassword && !isEdit) return "Requerido";
    if (formData.password && confirmPassword !== formData.password)
      return "No coinciden";
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const isEdit = !!selectedUsuario;

    if (field === "nombre") {
      setErrors({ ...errors, nombre: validateNombre(formData.nombre) });
    } else if (field === "email") {
      setErrors({ ...errors, email: validateEmail(formData.email, isEdit) });
    } else if (field === "rol") {
      setErrors({ ...errors, rol: validateRol(formData.rol) });
    } else if (field === "tipoDocumento") {
      setErrors({
        ...errors,
        tipoDocumento: validateTipoDocumento(formData.tipoDocumento),
      });
    } else if (field === "numeroDocumento") {
      setErrors({
        ...errors,
        numeroDocumento: validateNumeroDocumento(formData.numeroDocumento),
      });
    } else if (field === "password") {
      setErrors({
        ...errors,
        password: validatePassword(formData.password, isEdit),
      });
    } else if (field === "confirmPassword") {
      setErrors({
        ...errors,
        confirmPassword: validateConfirmPassword(
          formData.confirmPassword,
          isEdit
        ),
      });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    if (touched[field as keyof typeof touched]) {
      const isEdit = !!selectedUsuario;

      if (field === "nombre") {
        setErrors({ ...errors, nombre: validateNombre(value as string) });
      } else if (field === "email") {
        setErrors({ ...errors, email: validateEmail(value as string, isEdit) });
      } else if (field === "rol") {
        setErrors({ ...errors, rol: validateRol(value as string) });
      } else if (field === "tipoDocumento") {
        setErrors({
          ...errors,
          tipoDocumento: validateTipoDocumento(value as string),
        });
      } else if (field === "numeroDocumento") {
        setErrors({
          ...errors,
          numeroDocumento: validateNumeroDocumento(value as string),
        });
      } else if (field === "password") {
        setErrors({
          ...errors,
          password: validatePassword(value as string, isEdit),
        });
        if (touched.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword:
              value !== formData.confirmPassword ? "No coinciden" : "",
          }));
        }
      } else if (field === "confirmPassword") {
        setErrors({
          ...errors,
          confirmPassword: validateConfirmPassword(value as string, isEdit),
        });
      }
    }
  };

  const isFormValid = () => {
    const isEdit = !!selectedUsuario;

    if (
      !formData.nombre ||
      !formData.email ||
      !formData.rol ||
      !formData.tipoDocumento ||
      !formData.numeroDocumento
    )
      return false;

    // En creación, la contraseña es obligatoria
    if (!isEdit && (!formData.password || !formData.confirmPassword))
      return false;

    // En edición, solo validar contraseña si se ingresó
    if (isEdit && formData.password && !formData.confirmPassword) return false;

    const nombreError = validateNombre(formData.nombre);
    const emailError = validateEmail(formData.email, isEdit);
    const rolError = validateRol(formData.rol);
    const tipoDocError = validateTipoDocumento(formData.tipoDocumento);
    const numDocError = validateNumeroDocumento(formData.numeroDocumento);
    const passwordError = validatePassword(formData.password, isEdit);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      isEdit
    );

    return (
      !nombreError &&
      !emailError &&
      !rolError &&
      !tipoDocError &&
      !numDocError &&
      !passwordError &&
      !confirmPasswordError
    );
  };

  const openCreateModal = () => {
    setSelectedUsuario(null);
    setFormData({
      nombre: "",
      email: "",
      rol: "",
      tipoDocumento: "",
      numeroDocumento: "",
      telefono: "",
      password: "",
      confirmPassword: "",
      estado: true,
    });
    setErrors({
      nombre: "",
      email: "",
      rol: "",
      tipoDocumento: "",
      numeroDocumento: "",
      password: "",
      confirmPassword: "",
    });
    setTouched({
      nombre: false,
      email: false,
      rol: false,
      tipoDocumento: false,
      numeroDocumento: false,
      password: false,
      confirmPassword: false,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      tipoDocumento: usuario.tipoDocumento || "DNI",
      numeroDocumento: usuario.numeroDocumento || "",
      telefono: usuario.telefono || "",
      password: "",
      confirmPassword: "",
      estado: usuario.estado ?? true,
    });
    setErrors({
      nombre: "",
      email: "",
      rol: "",
      tipoDocumento: "",
      numeroDocumento: "",
      password: "",
      confirmPassword: "",
    });
    setTouched({
      nombre: false,
      email: false,
      rol: false,
      tipoDocumento: false,
      numeroDocumento: false,
      password: false,
      confirmPassword: false,
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalOpen(true);
  };

  const openDetailModal = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDetailModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      nombre: true,
      email: true,
      rol: true,
      tipoDocumento: true,
      numeroDocumento: true,
      password: true,
      confirmPassword: true,
    });

    const isEdit = !!selectedUsuario;
    const nombreError = validateNombre(formData.nombre);
    const emailError = validateEmail(formData.email, isEdit);
    const rolError = validateRol(formData.rol);
    const tipoDocError = validateTipoDocumento(formData.tipoDocumento);
    const numDocError = validateNumeroDocumento(formData.numeroDocumento);
    const passwordError = validatePassword(formData.password, isEdit);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      isEdit
    );

    setErrors({
      nombre: nombreError,
      email: emailError,
      rol: rolError,
      tipoDocumento: tipoDocError,
      numeroDocumento: numDocError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (
      nombreError ||
      emailError ||
      rolError ||
      tipoDocError ||
      numDocError ||
      passwordError ||
      confirmPasswordError
    ) {
      return;
    }

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (selectedUsuario) {
      setUsuarios(
        usuarios.map((u) =>
          u.id === selectedUsuario.id
            ? {
                ...u,
                nombre: formData.nombre,
                email: formData.email,
                rol: formData.rol,
                tipoDocumento: formData.tipoDocumento,
                numeroDocumento: formData.numeroDocumento,
                telefono: formData.telefono,
                // Solo actualizar password si se ingresó una nueva
                ...(formData.password ? { password: formData.password } : {}),
                estado: formData.estado,
              }
            : u
        )
      );
      toast.success("Usuario actualizado exitosamente", {
        style: {
          background: "#63E6BE",
          color: "white",
          border: "1px solid #63E6BE",
        },
      });
    } else {
      const avatars = {
        Administrador:
          "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
        Empleado:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
        Cliente:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      };

      const newUsuario: Usuario = {
        id: String(Date.now()),
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        telefono: formData.telefono,
        estado: formData.estado,
        activo: formData.estado,
        avatar:
          avatars[formData.rol as keyof typeof avatars] ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.nombre}`,
        createdAt: new Date().toISOString(),
      };
      setUsuarios([...usuarios, newUsuario]);
      toast.success("Usuario creado exitosamente", {
        style: {
          background: "#63E6BE",
          color: "white",
          border: "1px solid #63E6BE",
        },
      });
    }

    setLoading(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedUsuario) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setUsuarios(usuarios.filter((u) => u.id !== selectedUsuario.id));
    toast.success("Usuario eliminado exitosamente", {
      style: {
        background: "#63E6BE",
        color: "white",
        border: "1px solid #63E6BE",
      },
    });

    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedUsuario(null);
  };

  const toggleEstado = (usuario: Usuario) => {
    setUsuarios(
      usuarios.map((u) =>
        u.id === usuario.id ? { ...u, estado: !u.estado, activo: !u.estado } : u
      )
    );
    toast.success(`Usuario ${!usuario.estado ? "activado" : "desactivado"}`, {
      style: {
        background: "#63E6BE",
        color: "white",
        border: "1px solid #63E6BE",
      },
    });
  };

  const handleSort = (field: "nombre" | "documento") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredUsuarios = usuarios
    .filter((u) => {
      const matchesSearch =
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.numeroDocumento &&
          u.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRol =
        !filterRol || filterRol.trim() === "" || u.rol === filterRol;
      const matchesEstado =
        !filterEstado ||
        filterEstado.trim() === "" ||
        (filterEstado === "activo" ? u.estado : !u.estado);
      const matchesTipoDoc =
        !filterTipoDoc ||
        filterTipoDoc.trim() === "" ||
        u.tipoDocumento === filterTipoDoc;

      return matchesSearch && matchesRol && matchesEstado && matchesTipoDoc;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let comparison = 0;
      if (sortField === "nombre") {
        comparison = a.nombre.localeCompare(b.nombre);
      } else if (sortField === "documento") {
        comparison = (a.numeroDocumento || "").localeCompare(
          b.numeroDocumento || ""
        );
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const hasActiveFilters = filterRol || filterEstado || filterTipoDoc;

  const clearFilters = () => {
    setFilterRol("");
    setFilterEstado("");
    setFilterTipoDoc("");
  };

  const getPasswordValidation = () => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  };

  const passwordValidation = getPasswordValidation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Gestión de Usuarios
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300 mt-1`}
            style={{ fontSize: "14px" }}
          >
            Administra los usuarios del sistema
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          style={{ fontWeight: 600 }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Usuario
        </Button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`${bgCard} rounded-2xl p-6 ${border} border shadow-sm transition-colors duration-300`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#63E6BE]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o documento..."
              className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg} ${
                isDark ? "text-white placeholder-gray-400" : ""
              } focus:border-[#63E6BE] focus:ring-2 focus:ring-[#63E6BE]/20 transition-colors duration-300`}
            />
          </div>

          <Popover.Root open={showFilters} onOpenChange={setShowFilters}>
            <Popover.Trigger asChild>
              <Button
                className="h-12 px-6 rounded-xl bg-[#3D4756] hover:bg-[#2D3746] text-white shadow-md transition-all duration-300"
                style={{ fontWeight: 600 }}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-[#63E6BE] rounded-full" />
                )}
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className={`${
                  isDark ? "bg-[#1F2937]" : "bg-white"
                } rounded-xl shadow-2xl ${
                  isDark ? "border-gray-700" : "border-gray-200"
                } border p-4 w-[320px] z-50`}
                sideOffset={5}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <h4
                    className={`${textPrimary}`}
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  >
                    Filtros Avanzados
                  </h4>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Rol
                    </label>
                    <Select value={filterRol} onValueChange={setFilterRol}>
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Todos los roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todos los roles</SelectItem>
                        {roles.map((rol) => (
                          <SelectItem key={rol} value={rol}>
                            {rol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Estado
                    </label>
                    <Select
                      value={filterEstado}
                      onValueChange={setFilterEstado}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todos los estados</SelectItem>
                        <SelectItem value="activo">Activos</SelectItem>
                        <SelectItem value="inactivo">Inactivos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      className={`block ${textPrimary} mb-2`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Tipo de Documento
                    </label>
                    <Select
                      value={filterTipoDoc}
                      onValueChange={setFilterTipoDoc}
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=" ">Todos los tipos</SelectItem>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={clearFilters}
                      className="flex-1 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-[#3D4756] transition-all"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Limpiar
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 h-10 rounded-lg bg-[#63E6BE] hover:bg-[#5DD5BE] text-white transition-all"
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      Aplicar
                    </Button>
                  </div>
                </motion.div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`${bgCard} rounded-2xl ${border} border shadow-sm overflow-hidden transition-colors duration-300`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                <th className="text-left p-4 text-white">
                  <button
                    onClick={() => handleSort("nombre")}
                    className="flex items-center gap-2 hover:text-[#63E6BE] transition-colors"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Usuario
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Email
                </th>
                <th
                  className="text-left p-4 text-white"
                  style={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Rol
                </th>
                <th className="text-left p-4 text-white">
                  <button
                    onClick={() => handleSort("documento")}
                    className="flex items-center gap-2 hover:text-[#63E6BE] transition-colors"
                    style={{ fontWeight: 600, fontSize: "14px" }}
                  >
                    Documento
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th
                  className="text-left p-4 text-white"
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
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className={`text-center p-8 ${textSecondary}`}
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((usuario, index) => (
                    <motion.tr
                      key={usuario.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${border} border-b ${tableRow} transition-all duration-300 group`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              usuario.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${usuario.nombre}`
                            }
                            alt={usuario.nombre}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#63E6BE] shadow-md group-hover:scale-110 transition-transform duration-300"
                          />
                          <span
                            className={`${textPrimary} transition-colors duration-300`}
                            style={{ fontWeight: 600, fontSize: "14px" }}
                          >
                            {usuario.nombre}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`p-4 ${textSecondary} transition-colors duration-300`}
                        style={{ fontSize: "14px" }}
                      >
                        {usuario.email}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            usuario.rol === "Administrador"
                              ? "bg-purple-100 text-purple-700"
                              : usuario.rol === "Empleado"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {usuario.rol}
                        </span>
                      </td>
                      <td
                        className={`p-4 ${textSecondary} transition-colors duration-300`}
                        style={{ fontSize: "14px" }}
                      >
                        {usuario.tipoDocumento}: {usuario.numeroDocumento}
                      </td>
                      <td className="p-4">
                        <Switch
                          checked={usuario.estado ?? true}
                          onCheckedChange={() => toggleEstado(usuario)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => openDetailModal(usuario)}
                            className="h-9 w-9 p-0 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => openEditModal(usuario)}
                            className="h-9 w-9 p-0 rounded-lg bg-[#63E6BE] hover:bg-[#5DD5BE] text-white transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedUsuario(usuario);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-9 w-9 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
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

      {/* Modal Crear/Editar Usuario */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              {selectedUsuario ? "Editar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Fila 1: Tipo de Documento + Número de Documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Tipo de Documento *
                </label>
                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) =>
                    handleChange("tipoDocumento", value)
                  }
                >
                  <SelectTrigger
                    className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                      errors.tipoDocumento && touched.tipoDocumento
                        ? "border-red-500"
                        : ""
                    }`}
                    onBlur={() => handleBlur("tipoDocumento")}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposDocumento.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoDocumento && touched.tipoDocumento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tipoDocumento}
                  </p>
                )}
              </div>

              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Número de Documento *
                </label>
                <Input
                  type="text"
                  value={formData.numeroDocumento}
                  onChange={(e) =>
                    handleChange("numeroDocumento", onlyNumbers(e.target.value))
                  }
                  onBlur={() => handleBlur("numeroDocumento")}
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  } ${
                    errors.numeroDocumento && touched.numeroDocumento
                      ? "border-red-500"
                      : ""
                  }`}
                  placeholder="Ej: 12345678"
                  maxLength={10}
                />
                {errors.numeroDocumento && touched.numeroDocumento && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.numeroDocumento}
                  </p>
                )}
              </div>
            </div>

            {/* Nombre Completo */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Nombre Completo *
              </label>
              <Input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  handleChange("nombre", onlyLetters(e.target.value))
                }
                onBlur={() => handleBlur("nombre")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.nombre && touched.nombre ? "border-red-500" : ""}`}
                placeholder="Juan Pérez"
              />
              {errors.nombre && touched.nombre && (
                <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                } ${errors.email && touched.email ? "border-red-500" : ""}`}
                placeholder="juan@ejemplo.com"
              />
              {errors.email && touched.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Rol */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Rol *
              </label>
              <Select
                value={formData.rol}
                onValueChange={(value) => handleChange("rol", value)}
              >
                <SelectTrigger
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                    errors.rol && touched.rol ? "border-red-500" : ""
                  }`}
                  onBlur={() => handleBlur("rol")}
                >
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((rol) => (
                    <SelectItem key={rol} value={rol}>
                      {rol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.rol && touched.rol && (
                <p className="text-red-500 text-xs mt-1">{errors.rol}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                {selectedUsuario
                  ? "Cambiar Contraseña (opcional)"
                  : "Contraseña *"}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  className={`h-11 rounded-xl pr-10 ${inputBorder} ${inputBg} ${
                    isDark ? "text-white" : ""
                  } ${
                    errors.password && touched.password ? "border-red-500" : ""
                  }`}
                  placeholder={
                    selectedUsuario ? "Dejar vacío para no cambiar" : "••••••••"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}

              {/* Validación en una línea con checks verdes */}
              {formData.password && (
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span
                    className={`flex items-center gap-1 ${
                      passwordValidation.minLength
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {passwordValidation.minLength ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      "○"
                    )}
                    Mínimo 8 caracteres
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordValidation.hasUpperCase
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {passwordValidation.hasUpperCase ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      "○"
                    )}
                    Una mayúscula
                  </span>
                  <span
                    className={`flex items-center gap-1 ${
                      passwordValidation.hasNumber
                        ? "text-green-500"
                        : "text-gray-400"
                    }`}
                  >
                    {passwordValidation.hasNumber ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      "○"
                    )}
                    Un número
                  </span>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña - Solo si se ingresó contraseña */}
            {(formData.password || !selectedUsuario) && (
              <div>
                <label
                  className={`block ${textPrimary} mb-2 font-semibold`}
                  style={{ fontSize: "13px" }}
                >
                  Confirmar Contraseña {!selectedUsuario && "*"}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange("confirmPassword", e.target.value)
                    }
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`h-11 rounded-xl pr-10 ${inputBorder} ${inputBg} ${
                      isDark ? "text-white" : ""
                    } ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Teléfono */}
            <div>
              <label
                className={`block ${textPrimary} mb-2 font-semibold`}
                style={{ fontSize: "13px" }}
              >
                Teléfono
              </label>
              <Input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className={`h-11 rounded-xl ${inputBorder} ${inputBg} ${
                  isDark ? "text-white" : ""
                }`}
                placeholder="+57 300 123 4567"
              />
            </div>

            {/* Estado */}
            <div
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: isDark
                  ? "rgba(99, 230, 190, 0.1)"
                  : "rgba(99, 230, 190, 0.1)",
              }}
            >
              <span
                className={`${textPrimary} font-semibold`}
                style={{ fontSize: "14px" }}
              >
                Usuario Activo
              </span>
              <Switch
                checked={formData.estado}
                onCheckedChange={(checked) => handleChange("estado", checked)}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 h-11 rounded-xl bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                style={{ fontWeight: 600 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className="flex-1 h-11 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontWeight: 600 }}
              >
                {loading
                  ? "Guardando..."
                  : selectedUsuario
                  ? "Actualizar"
                  : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detalle Usuario */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-md`}>
          <DialogHeader>
            <DialogTitle className={`${textPrimary} text-2xl font-bold`}>
              Detalle de Usuario
            </DialogTitle>
          </DialogHeader>

          {selectedUsuario && (
            <div className="space-y-4 mt-4">
              <div className="flex justify-center">
                <img
                  src={
                    selectedUsuario.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUsuario.nombre}`
                  }
                  alt={selectedUsuario.nombre}
                  className="w-24 h-24 rounded-full border-4 border-[#63E6BE]"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <p className={`${textSecondary} text-xs`}>Nombre</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedUsuario.nombre}
                  </p>
                </div>

                <div>
                  <p className={`${textSecondary} text-xs`}>Email</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedUsuario.email}
                  </p>
                </div>

                <div>
                  <p className={`${textSecondary} text-xs`}>Documento</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedUsuario.tipoDocumento}:{" "}
                    {selectedUsuario.numeroDocumento}
                  </p>
                </div>

                <div>
                  <p className={`${textSecondary} text-xs`}>Rol</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedUsuario.rol}
                  </p>
                </div>

                {selectedUsuario.telefono && (
                  <div>
                    <p className={`${textSecondary} text-xs`}>Teléfono</p>
                    <p className={`${textPrimary} font-semibold`}>
                      {selectedUsuario.telefono}
                    </p>
                  </div>
                )}

                <div>
                  <p className={`${textSecondary} text-xs`}>Estado</p>
                  <p className={`${textPrimary} font-semibold`}>
                    {selectedUsuario.estado ? "Activo" : "Inactivo"}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setDetailModalOpen(false)}
                className="w-full h-11 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white mt-4"
                style={{ fontWeight: 600 }}
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={`${modalBg} rounded-2xl`}>
          <AlertDialogHeader>
            <AlertDialogTitle className={`${textPrimary} text-xl font-bold`}>
              ¿Estás seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className={textSecondary}>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario {selectedUsuario?.nombre}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-red-500 hover:bg-red-600"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
