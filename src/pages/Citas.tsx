import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  Eye,
  CalendarDays,
  List,
  UserCircle,
  Stethoscope,
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
import { useUsuarios } from "../hooks/useEntities";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useCitas, useServicios } from "../hooks/useEntities";
import {
  normalizarFecha,
  fechaAString,
  stringAFecha,
  mismaFecha,
} from "../utils/dateHelpers";
import CalendarioDisponibilidad from "../components/citas/CalendarioDisponibilidad";
import CalendarioSeleccionFecha from "../components/citas/CalendarioSeleccionFecha";
import {
  onlyNumbers,
  validateDNI,
  validateFullName,
  onlyLetters,
} from "../utils/validation";

interface Cita {
  id: string;
  codigo: string;
  cliente: string;
  empleado: string;
  empleadoId: string;
  servicio: string; // ID del servicio
  servicioNombre?: string; // Nombre del servicio (para mostrar)
  fecha: Date;
  hora: string;
  duracion: number;
  estado: "Pendiente" | "Confirmada" | "Cancelada" | "Completada";
  notas?: string;
}

interface Empleado {
  id: string;
  nombre: string;
  especialidad: string;
  foto?: string;
  disponibilidad: {
    [key: string]: string[]; // día de semana -> array de horarios
  };
  diasNoDisponibles: string[]; // Array de fechas en formato ISO que el médico NO está disponible
}

interface CitasProps {
  user: any;
}

type VistaCalendario = "mes" | "semana" | "dia";
type VistaPrincipal = "calendario" | "lista" | "disponibilidad" | "medicos";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Horarios de medio en medio desde 06:00 hasta 22:00
const HORARIOS_DIA = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

export default function Citas({ user }: CitasProps) {
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

  // Estados principales
  const [vistaPrincipal, setVistaPrincipal] =
    useState<VistaPrincipal>("calendario");
  const [vistaCalendario, setVistaCalendario] =
    useState<VistaCalendario>("mes");
  const [fechaActual, setFechaActual] = useState(new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());

  // Empleados
  const [empleados, setEmpleados] = useState<Empleado[]>([
    {
      id: "1",
      nombre: "Dr. Carlos Méndez",
      especialidad: "Medicina General",
      foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop",
      disponibilidad: {
        Lunes: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        Martes: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        Miércoles: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
        Jueves: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
        Viernes: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00"],
      },
      diasNoDisponibles: [],
    },
    {
      id: "2",
      nombre: "Dra. Ana López",
      especialidad: "Enfermería",
      foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop",
      disponibilidad: {
        Lunes: ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
        Martes: ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
        Miércoles: ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
        Jueves: ["09:00", "10:00", "11:00", "15:00", "16:00", "17:00"],
        Viernes: ["09:00", "10:00", "11:00", "15:00", "16:00"],
      },
      diasNoDisponibles: [],
    },
    {
      id: "3",
      nombre: "Dr. Miguel Torres",
      especialidad: "Pediatría",
      foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop",
      disponibilidad: {
        Martes: ["10:00", "11:00", "14:00", "15:00", "16:00"],
        Jueves: ["10:00", "11:00", "14:00", "15:00", "16:00"],
        Viernes: ["10:00", "11:00", "14:00", "15:00", "16:00", "17:00"],
      },
      diasNoDisponibles: [],
    },
  ]);

  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<Empleado | null>(null);
  const [fechaCalendarioDisponibilidad, setFechaCalendarioDisponibilidad] =
    useState(new Date());
  const [diasSeleccionadosTemp, setDiasSeleccionadosTemp] = useState<string[]>(
    []
  );

  // ✅ Usar hooks globales para citas y servicios
  const {
    items: citasGlobales,
    add: addCita,
    update: updateCita,
    remove: removeCita,
  } = useCitas();

  // Obtener usuarios desde storage para poblar selects dinámicos (p.ej. médicos)
  const {
    items: usuariosFromStorage,
    add: addUsuario,
    update: updateUsuario,
    remove: removeUsuario,
  } = useUsuarios();

  // Sincronizar `empleados` con los usuarios (si existen). Si no hay usuarios,
  // mantenemos el set de empleados por defecto (fallback) ya definido más arriba.
  useEffect(() => {
    if (usuariosFromStorage && usuariosFromStorage.length > 0) {
      const empleadosDesdeUsuarios = usuariosFromStorage
        .filter((u: any) => {
          const rol = (u.rol || "").toString().toLowerCase();
          return (
            rol.includes("emple") ||
            rol.includes("medic") ||
            rol.includes("doctor") ||
            rol.includes("dra") ||
            rol.includes("dr")
          );
        })
        .map((u: any) => ({
          id: u.id,
          nombre: u.nombre,
          especialidad: u.especialidad || "",
          foto: u.avatar || "",
          disponibilidad: u.disponibilidad || {},
          diasNoDisponibles: u.diasNoDisponibles || [],
        }));

      if (empleadosDesdeUsuarios.length > 0) {
        setEmpleados(empleadosDesdeUsuarios);
      }
    }
  }, [usuariosFromStorage]);

  // Estados y lógica para CRUD de médicos (modal + formulario)
  const [medicoModalOpen, setMedicoModalOpen] = useState(false);
  const [selectedMedicoUsuario, setSelectedMedicoUsuario] = useState<
    any | null
  >(null);
  const [medicoForm, setMedicoForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipoDocumento: "",
    numeroDocumento: "",
  });

  const openCreateMedicoModal = () => {
    setSelectedMedicoUsuario(null);
    setMedicoForm({
      nombre: "",
      email: "",
      telefono: "",
      tipoDocumento: "",
      numeroDocumento: "",
    });
    setMedicoModalOpen(true);
  };

  const openEditMedicoModal = (usuario: any) => {
    setSelectedMedicoUsuario(usuario);
    setMedicoForm({
      nombre: usuario.nombre || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      tipoDocumento: usuario.tipoDocumento || "",
      numeroDocumento: usuario.numeroDocumento || "",
    });
    setMedicoModalOpen(true);
  };

  const handleMedicoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMedicoUsuario) {
      // actualizar
      updateUsuario(selectedMedicoUsuario.id, {
        nombre: medicoForm.nombre,
        email: medicoForm.email,
        telefono: medicoForm.telefono,
        tipoDocumento: medicoForm.tipoDocumento,
        numeroDocumento: medicoForm.numeroDocumento,
      });
      toast.success("Médico actualizado");
    } else {
      // crear nuevo usuario con rol Médico
      const newUser = {
        id: `USR-${Date.now()}`,
        nombre: medicoForm.nombre,
        email: medicoForm.email,
        telefono: medicoForm.telefono || "",
        tipoDocumento: medicoForm.tipoDocumento || "",
        numeroDocumento: medicoForm.numeroDocumento || "",
        rol: "Médico",
        activo: true,
        createdAt: new Date().toISOString(),
      };
      addUsuario(newUser);
      toast.success("Médico creado");
    }

    setMedicoModalOpen(false);
  };

  const handleMedicoDelete = (usuario: any) => {
    if (!usuario) return;
    if (!confirm(`¿Eliminar a ${usuario.nombre}?`)) return;
    removeUsuario(usuario.id);
    toast.success("Médico eliminado");
  };
  const { items: serviciosGlobales } = useServicios();

  // Servicios activos
  const servicios = useMemo(() => {
    return serviciosGlobales.filter((s) => s.estado === "Activo");
  }, [serviciosGlobales]);

  // Adaptar citas globales a interfaz local
  const citas = useMemo(() => {
    return citasGlobales.map((c) => ({
      id: c.id,
      codigo: `CIT${c.id.slice(0, 8)}`,
      cliente: c.clienteNombre || "Cliente",
      empleado: c.empleadoNombre || "Empleado",
      empleadoId: c.empleadoId || "1",
      servicio: c.servicioId || c.servicioNombre || "Servicio",
      servicioNombre: c.servicioNombre || "Servicio",
      fecha: typeof c.fecha === "string" ? stringAFecha(c.fecha) : c.fecha,
      hora: c.hora || "08:00",
      duracion: c.duracion || 30,
      estado: c.estado as
        | "Pendiente"
        | "Confirmada"
        | "Cancelada"
        | "Completada",
      notas: c.notas,
    }));
  }, [citasGlobales]);

  // Modales y estados
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [citasDiaModalOpen, setCitasDiaModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<Cita | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [citaDetalle, setCitaDetalle] = useState<Cita | null>(null);

  // Estados para nueva cita
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");

  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroEmpleado, setFiltroEmpleado] = useState("Todos");
  const [filtroServicio, setFiltroServicio] = useState("Todos");
  const [filtroEmpleadoCalendario, setFiltroEmpleadoCalendario] =
    useState("Todos");

  // Formulario
  const [formData, setFormData] = useState({
    codigo: "",
    cliente: "",
    empleadoId: "",
    servicio: "",
    fecha: new Date(),
    hora: "",
    duracion: 30,
    notas: "",
  });

  const [errors, setErrors] = useState({
    codigo: "",
    cliente: "",
    empleadoId: "",
    servicio: "",
    hora: "",
  });

  const [touched, setTouched] = useState({
    codigo: false,
    cliente: false,
    empleadoId: false,
    servicio: false,
    hora: false,
  });

  // Funciones de calendario
  const getDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias: (Date | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i));
    }

    return dias;
  };

  const getCitasDelDia = (fecha: Date) => {
    return citas.filter(
      (c) =>
        c.fecha.getDate() === fecha.getDate() &&
        c.fecha.getMonth() === fecha.getMonth() &&
        c.fecha.getFullYear() === fecha.getFullYear()
    );
  };

  // 🔴 IMPORTANTE: Obtener horas disponibles (ocultar las reservadas y respetar disponibilidad del médico)
  const horasDisponiblesParaFecha = useMemo(() => {
    if (!formData.fecha) return HORARIOS_DIA;

    // Obtener TODAS las citas del día seleccionado
    const citasDelDia = citas.filter((c) =>
      mismaFecha(c.fecha, formData.fecha)
    );

    // Horas ya reservadas (global)
    const horasReservadas = citasDelDia.map((c) => c.hora);

    // Si no hay empleado seleccionado, devolvemos las horas no reservadas
    if (!formData.empleadoId)
      return HORARIOS_DIA.filter((h) => !horasReservadas.includes(h));

    const empleado = empleados.find((e) => e.id === formData.empleadoId);
    if (!empleado)
      return HORARIOS_DIA.filter((h) => !horasReservadas.includes(h));

    // Si el día está marcado como no disponible para el empleado, no hay horas
    const fechaISO = fechaAString(formData.fecha);
    if (empleado.diasNoDisponibles?.includes(fechaISO)) return [];

    const diaSemana = getDiaNombre(formData.fecha);
    const horariosEmpleado = empleado.disponibilidad[diaSemana] || [];

    // Devolvemos sólo las horas que el empleado tiene como disponibles y que no estén reservadas
    return HORARIOS_DIA.filter(
      (h) => horariosEmpleado.includes(h) && !horasReservadas.includes(h)
    );
  }, [formData.fecha, formData.empleadoId, citas, empleados]);

  const getNumeroCitasDia = (fecha: Date) => {
    return getCitasDelDia(fecha).length;
  };

  const cambiarMes = (incremento: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaActual(nuevaFecha);
  };

  const irAHoy = () => {
    const hoy = new Date();
    setFechaActual(hoy);
    setFechaSeleccionada(hoy);
  };

  function getDiaNombre(fecha: Date) {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dias[fecha.getDay()];
  }

  // Funciones para manejar días no disponibles
  const toggleDiaNoDisponible = (empleado: Empleado, fecha: Date) => {
    const fechaISO = fechaAString(fecha);
    const diasNoDisponibles = empleado.diasNoDisponibles || [];

    const nuevosDias = diasNoDisponibles.includes(fechaISO)
      ? diasNoDisponibles.filter((d) => d !== fechaISO)
      : [...diasNoDisponibles, fechaISO];

    setEmpleados(
      empleados.map((e) =>
        e.id === empleado.id ? { ...e, diasNoDisponibles: nuevosDias } : e
      )
    );

    // Si el empleado seleccionado es el mismo, actualizarlo para reflejar cambios inmediatos
    if (empleadoSeleccionado?.id === empleado.id) {
      const actualizado =
        empleados
          .map((e) =>
            e.id === empleado.id ? { ...e, diasNoDisponibles: nuevosDias } : e
          )
          .find((x) => x.id === empleado.id) || null;
      setEmpleadoSeleccionado(actualizado as Empleado | null);
    }

    // Persistir cambio en storage (si existe hook de usuarios)
    try {
      // updateUsuario proviene de useUsuarios() y está en scope
      // Actualizamos el usuario/empleado con los nuevos días
      // @ts-ignore
      if (typeof updateUsuario === "function") {
        // Guardar sólo el campo diasNoDisponibles
        // @ts-ignore
        updateUsuario(empleado.id, { diasNoDisponibles: nuevosDias });
      }
    } catch (err) {
      // no crítico, seguimos
      console.warn("No se pudo persistir diasNoDisponibles:", err);
    }

    toast.success(
      diasNoDisponibles.includes(fechaISO)
        ? "Día marcado como disponible"
        : "Día marcado como no disponible",
      {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      }
    );
  };

  // Toggle para marcar/quitar un horario como disponible para un día de semana
  const toggleHorarioDisponibilidad = (
    empleado: Empleado,
    diaSemana: string,
    hora: string
  ) => {
    const horarios = empleado.disponibilidad[diaSemana] || [];
    const nuevos = horarios.includes(hora)
      ? horarios.filter((h) => h !== hora)
      : [...horarios, hora];

    const empleadosActualizados = empleados.map((e) =>
      e.id === empleado.id
        ? { ...e, disponibilidad: { ...e.disponibilidad, [diaSemana]: nuevos } }
        : e
    );

    setEmpleados(empleadosActualizados);

    // Actualizar seleccion actual si corresponde
    if (empleadoSeleccionado?.id === empleado.id) {
      const actualizado =
        empleadosActualizados.find((x) => x.id === empleado.id) || null;
      setEmpleadoSeleccionado(actualizado);
    }

    // Persistir disponibilidad en storage
    try {
      // @ts-ignore
      if (typeof updateUsuario === "function") {
        // @ts-ignore
        updateUsuario(empleado.id, {
          disponibilidad: { ...empleado.disponibilidad, [diaSemana]: nuevos },
        });
      }
    } catch (err) {
      console.warn("No se pudo persistir disponibilidad:", err);
    }

    toast.success(
      nuevos.includes(hora)
        ? "Horario marcado como disponible"
        : "Horario marcado como no disponible",
      {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      }
    );
  };

  const esDiaNoDisponible = (empleado: Empleado, fecha: Date) => {
    const fechaISO = fechaAString(fecha);
    return empleado.diasNoDisponibles?.includes(fechaISO) || false;
  };

  // Validaciones
  const validateCodigo = (codigo: string) => {
    if (!codigo) return "Requerido";
    const exists = citas.some(
      (c) => c.codigo === codigo && c.id !== selectedCita?.id
    );
    if (exists) return "Código ya existe";
    return "";
  };

  const validateCliente = (cliente: string) => {
    if (!cliente) return "Requerido";
    if (cliente.length < 3) return "Mínimo 3 caracteres";
    return "";
  };

  const validateEmpleado = (empleadoId: string) => {
    if (!empleadoId) return "Selecciona un empleado";
    return "";
  };

  const validateServicio = (servicio: string) => {
    if (!servicio) return "Selecciona un servicio";
    return "";
  };

  const validateHora = (hora: string) => {
    if (!hora) return "Selecciona una hora";
    return "";
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

    if (field === "codigo") {
      setErrors({ ...errors, codigo: validateCodigo(formData.codigo) });
    } else if (field === "cliente") {
      setErrors({ ...errors, cliente: validateCliente(formData.cliente) });
    } else if (field === "empleadoId") {
      setErrors({
        ...errors,
        empleadoId: validateEmpleado(formData.empleadoId),
      });
    } else if (field === "servicio") {
      setErrors({ ...errors, servicio: validateServicio(formData.servicio) });
    } else if (field === "hora") {
      setErrors({ ...errors, hora: validateHora(formData.hora) });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });

    if (field === "servicio") {
      const servicioData = servicios.find((s) => s.id === value);
      if (servicioData) {
        setFormData({
          ...formData,
          servicio: value,
          duracion: servicioData.duracion,
        });
      }
    }

    if (touched[field as keyof typeof touched]) {
      if (field === "codigo") {
        setErrors({ ...errors, codigo: validateCodigo(value) });
      } else if (field === "cliente") {
        setErrors({ ...errors, cliente: validateCliente(value) });
      } else if (field === "empleadoId") {
        setErrors({ ...errors, empleadoId: validateEmpleado(value) });
      } else if (field === "servicio") {
        setErrors({ ...errors, servicio: validateServicio(value) });
      } else if (field === "hora") {
        setErrors({ ...errors, hora: validateHora(value) });
      }
    }
  };

  const isFormValid = () => {
    if (
      !formData.codigo ||
      !formData.cliente ||
      !formData.empleadoId ||
      !formData.servicio ||
      !formData.hora
    )
      return false;

    const codigoError = validateCodigo(formData.codigo);
    const clienteError = validateCliente(formData.cliente);
    const empleadoError = validateEmpleado(formData.empleadoId);
    const servicioError = validateServicio(formData.servicio);
    const horaError = validateHora(formData.hora);

    return (
      !codigoError &&
      !clienteError &&
      !empleadoError &&
      !servicioError &&
      !horaError
    );
  };

  const openCreateModal = () => {
    setSelectedCita(null);
    setFormData({
      codigo: `CIT${String(citas.length + 1).padStart(3, "0")}`,
      cliente: "",
      empleadoId: "",
      servicio: "",
      fecha: fechaSeleccionada,
      hora: "",
      duracion: 30,
      notas: "",
    });
    setErrors({
      codigo: "",
      cliente: "",
      empleadoId: "",
      servicio: "",
      hora: "",
    });
    setTouched({
      codigo: false,
      cliente: false,
      empleadoId: false,
      servicio: false,
      hora: false,
    });
    // Limpiar campos de documento
    setTipoDocumento("");
    setNumeroDocumento("");
    setModalOpen(true);
  };

  const openEditModal = (cita: Cita) => {
    setSelectedCita(cita);
    setFormData({
      codigo: cita.codigo,
      cliente: cita.cliente,
      empleadoId: cita.empleadoId,
      servicio: cita.servicio,
      fecha: cita.fecha,
      hora: cita.hora,
      duracion: cita.duracion,
      notas: cita.notas || "",
    });
    setErrors({
      codigo: "",
      cliente: "",
      empleadoId: "",
      servicio: "",
      hora: "",
    });
    setTouched({
      codigo: false,
      cliente: false,
      empleadoId: false,
      servicio: false,
      hora: false,
    });
    // Limpiar campos de documento
    setTipoDocumento("");
    setNumeroDocumento("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 Validar tipo y número de documento
    if (!tipoDocumento || !numeroDocumento) {
      toast.error("El tipo y número de documento son obligatorios", {
        style: {
          background: "#EF4444",
          color: "white",
          border: "1px solid #EF4444",
        },
      });
      return;
    }

    setTouched({
      codigo: true,
      cliente: true,
      empleadoId: true,
      servicio: true,
      hora: true,
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

    const empleado = empleados.find((e) => e.id === formData.empleadoId);

    if (selectedCita) {
      // Actualizar cita existente
      const servicio = servicios.find((s) => s.id === formData.servicio);
      updateCita(selectedCita.id, {
        clienteNombre: formData.cliente,
        empleadoId: formData.empleadoId,
        empleadoNombre: empleado?.nombre || "",
        servicioId: servicio?.id || "",
        servicioNombre: servicio?.nombre || "",
        fecha: fechaAString(formData.fecha),
        hora: formData.hora,
        duracion: formData.duracion,
        notas: formData.notas,
      });
      toast.success("Cita actualizada exitosamente", {
        style: {
          background: "#14B8A6",
          color: "white",
          border: "1px solid #14B8A6",
        },
      });
    } else {
      // Crear nueva cita
      const servicio = servicios.find((s) => s.id === formData.servicio);
      const nuevaCita = {
        id: `CITA-${Date.now()}`,
        fecha: fechaAString(formData.fecha),
        hora: formData.hora,
        clienteId: formData.cliente,
        clienteNombre: formData.cliente,
        empleadoId: formData.empleadoId,
        empleadoNombre: empleado?.nombre || "",
        servicioId: servicio?.id || "",
        servicioNombre: servicio?.nombre || "",
        duracion: formData.duracion,
        estado: "Pendiente" as const,
        notas: formData.notas,
        createdAt: new Date().toISOString(),
      };
      addCita(nuevaCita);
      toast.success("Cita creada exitosamente", {
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
    if (!selectedCita) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    removeCita(selectedCita.id);
    toast.success("Cita eliminada exitosamente", {
      style: {
        background: "#EF4444",
        color: "white",
        border: "1px solid #EF4444",
      },
    });

    setLoading(false);
    setDeleteDialogOpen(false);
    setSelectedCita(null);
  };

  const cambiarEstadoCita = (citaId: string, nuevoEstado: Cita["estado"]) => {
    updateCita(citaId, { estado: nuevoEstado });
    toast.success(`Cita marcada como ${nuevoEstado}`, {
      style: {
        background: "#14B8A6",
        color: "white",
        border: "1px solid #14B8A6",
      },
    });
  };

  // Obtener horarios disponibles
  const getHorariosDisponibles = () => {
    if (!formData.empleadoId || !formData.fecha) return [];

    const empleado = empleados.find((e) => e.id === formData.empleadoId);
    if (!empleado) return [];

    // Verificar si el día está marcado como no disponible
    const diaNoDisponible = esDiaNoDisponible(empleado, formData.fecha);
    if (diaNoDisponible) {
      // Si el día no está disponible, todos los horarios están no disponibles
      return HORARIOS_DIA.map((hora) => ({
        hora,
        disponible: false,
        ocupado: true,
      }));
    }

    const diaSemana = getDiaNombre(formData.fecha);
    const horariosEmpleado = empleado.disponibilidad[diaSemana] || [];

    // 🔴 CAMBIO: Permitir múltiples citas del mismo médico en el mismo día
    // Filtramos por empleadoId para permitir que el médico tenga múltiples citas
    const citasDelDia = getCitasDelDia(formData.fecha).filter(
      (c) =>
        c.empleadoId === formData.empleadoId &&
        (!selectedCita || c.id !== selectedCita.id)
    );

    return HORARIOS_DIA.map((hora) => {
      const disponible = horariosEmpleado.includes(hora);
      const ocupado = citasDelDia.some((c) => c.hora === hora);
      return { hora, disponible, ocupado };
    });
  };

  // Filtrado de citas
  const citasFiltradas = citas.filter((c) => {
    const matchesSearch =
      c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.servicio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
    const matchesEmpleado =
      filtroEmpleado === "Todos" || c.empleado === filtroEmpleado;
    const matchesServicio =
      filtroServicio === "Todos" || c.servicio === filtroServicio;

    return matchesSearch && matchesEstado && matchesEmpleado && matchesServicio;
  });

  const getEstadoColor = (estado: Cita["estado"]) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-500";
      case "Confirmada":
        return "bg-[#14B8A6]";
      case "Completada":
        return "bg-green-500";
      case "Cancelada":
        return "bg-red-500";
    }
  };

  const getEstadoIcon = (estado: Cita["estado"]) => {
    switch (estado) {
      case "Pendiente":
        return Clock;
      case "Confirmada":
        return CheckCircle;
      case "Completada":
        return CheckCircle;
      case "Cancelada":
        return XCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Gestión de Citas
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Administra las citas médicas y agenda de profesionales
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openCreateModal}
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg shadow-[#14B8A6]/20 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Pestañas de vista */}
      <div
        className={`${bgCard} rounded-xl p-2 border ${border} shadow-sm transition-colors duration-300 inline-flex gap-2`}
      >
        <Button
          onClick={() => setVistaPrincipal("calendario")}
          className={`h-10 rounded-lg transition-all duration-200 ${
            vistaPrincipal === "calendario"
              ? "bg-[#14B8A6] text-white shadow-md"
              : `${
                  isDark
                    ? "bg-transparent hover:bg-[#1f6feb1a] text-white"
                    : "bg-transparent hover:bg-gray-100 text-[#3D4756]"
                }`
          }`}
          style={{ fontWeight: 600, fontSize: "13px" }}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Calendario
        </Button>
        <Button
          onClick={() => setVistaPrincipal("lista")}
          className={`h-10 rounded-lg transition-all duration-200 ${
            vistaPrincipal === "lista"
              ? "bg-[#14B8A6] text-white shadow-md"
              : `${
                  isDark
                    ? "bg-transparent hover:bg-[#1f6feb1a] text-white"
                    : "bg-transparent hover:bg-gray-100 text-[#3D4756]"
                }`
          }`}
          style={{ fontWeight: 600, fontSize: "13px" }}
        >
          <List className="w-4 h-4 mr-2" />
          Lista
        </Button>
        <Button
          onClick={() => setVistaPrincipal("disponibilidad")}
          className={`h-10 rounded-lg transition-all duration-200 ${
            vistaPrincipal === "disponibilidad"
              ? "bg-[#14B8A6] text-white shadow-md"
              : `${
                  isDark
                    ? "bg-transparent hover:bg-[#1f6feb1a] text-white"
                    : "bg-transparent hover:bg-gray-100 text-[#3D4756]"
                }`
          }`}
          style={{ fontWeight: 600, fontSize: "13px" }}
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Disponibilidad
        </Button>
        <Button
          onClick={() => setVistaPrincipal("medicos")}
          className={`h-10 rounded-lg transition-all duration-200 ${
            vistaPrincipal === "medicos"
              ? "bg-[#14B8A6] text-white shadow-md"
              : `${
                  isDark
                    ? "bg-transparent hover:bg-[#1f6feb1a] text-white"
                    : "bg-transparent hover:bg-gray-100 text-[#3D4756]"
                }`
          }`}
          style={{ fontWeight: 600, fontSize: "13px" }}
        >
          <User className="w-4 h-4 mr-2" />
          Médicos
        </Button>
      </div>

      {/* Vista Calendario */}
      {vistaPrincipal === "calendario" && (
        <div className="space-y-4">
          {/* Controles del calendario */}
          <div
            className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300`}
          >
            {/* Filtro por médico */}
            <div className="mb-4">
              <label
                className={`block ${textSecondary} mb-2`}
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                Filtrar por médico:
              </label>
              <Select
                value={filtroEmpleadoCalendario}
                onValueChange={setFiltroEmpleadoCalendario}
              >
                <SelectTrigger
                  className={`h-10 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                >
                  <SelectValue placeholder="Todos los médicos" />
                </SelectTrigger>
                <SelectContent className={bgCard}>
                  <SelectItem value="Todos" className={textPrimary}>
                    Todos los médicos
                  </SelectItem>
                  {empleados.map((emp) => (
                    <SelectItem
                      key={emp.id}
                      value={emp.id}
                      className={textPrimary}
                    >
                      {emp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => cambiarMes(-1)}
                  className={`h-10 w-10 p-0 rounded-lg ${
                    isDark
                      ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3
                  className={textPrimary}
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    minWidth: "180px",
                    textAlign: "center",
                  }}
                >
                  {MESES[fechaActual.getMonth()]} {fechaActual.getFullYear()}
                </h3>
                <Button
                  onClick={() => cambiarMes(1)}
                  className={`h-10 w-10 p-0 rounded-lg ${
                    isDark
                      ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={irAHoy}
                  className={`h-10 px-4 rounded-lg ${
                    isDark
                      ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                  }`}
                  style={{ fontWeight: 600, fontSize: "13px" }}
                >
                  Hoy
                </Button>

                <div
                  className="flex gap-1 p-1 rounded-lg"
                  style={{ background: isDark ? "#161b22" : "#f3f4f6" }}
                >
                  <Button
                    onClick={() => setVistaCalendario("dia")}
                    className={`h-8 px-3 rounded-md transition-all ${
                      vistaCalendario === "dia"
                        ? "bg-[#14B8A6] text-white"
                        : "bg-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    Día
                  </Button>
                  <Button
                    onClick={() => setVistaCalendario("semana")}
                    className={`h-8 px-3 rounded-md transition-all ${
                      vistaCalendario === "semana"
                        ? "bg-[#14B8A6] text-white"
                        : "bg-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    Semana
                  </Button>
                  <Button
                    onClick={() => setVistaCalendario("mes")}
                    className={`h-8 px-3 rounded-md transition-all ${
                      vistaCalendario === "mes"
                        ? "bg-[#14B8A6] text-white"
                        : "bg-transparent text-gray-500 hover:text-gray-700"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    Mes
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendario Mensual */}
          {vistaCalendario === "mes" && (
            <div
              className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm transition-colors duration-300`}
            >
              {/* Encabezado días de la semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {DIAS_SEMANA.map((dia) => (
                  <div key={dia} className="text-center py-2">
                    <span
                      className={textSecondary}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {dia}
                    </span>
                  </div>
                ))}
              </div>

              {/* Días del mes */}
              <div className="grid grid-cols-7 gap-2">
                {getDiasDelMes(fechaActual).map((dia, index) => {
                  if (!dia) {
                    return (
                      <div key={`empty-${index}`} className="aspect-square" />
                    );
                  }

                  const numCitas = getNumeroCitasDia(dia);
                  const esHoy =
                    dia.toDateString() === new Date().toDateString();
                  const esSeleccionado =
                    dia.toDateString() === fechaSeleccionada.toDateString();

                  return (
                    <motion.div
                      key={dia.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setFechaSeleccionada(dia);
                        if (numCitas > 0) {
                          setCitasDiaModalOpen(true);
                        }
                      }}
                      className={`aspect-square rounded-xl p-2 cursor-pointer transition-all duration-200 ${
                        esSeleccionado
                          ? "bg-[#14B8A6] shadow-lg"
                          : esHoy
                          ? `${
                              isDark ? "bg-[#1f6feb1a]" : "bg-blue-50"
                            } border-2 border-[#14B8A6]`
                          : numCitas > 0
                          ? `${
                              isDark
                                ? "bg-[#161b22] hover:bg-[#1f6feb1a]"
                                : "bg-gray-50 hover:bg-gray-100"
                            }`
                          : `${
                              isDark ? "hover:bg-[#161b22]" : "hover:bg-gray-50"
                            }`
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={`${
                            esSeleccionado
                              ? "text-white"
                              : esHoy
                              ? "text-[#14B8A6]"
                              : textPrimary
                          }`}
                          style={{
                            fontSize: "14px",
                            fontWeight: esHoy || esSeleccionado ? 700 : 500,
                          }}
                        >
                          {dia.getDate()}
                        </span>

                        {/* 🔴 Mostrar citas del día en el calendario */}
                        {getCitasDelDia(dia)
                          .slice(0, 2)
                          .map((cita) => (
                            <div
                              key={cita.id}
                              className={`text-xs px-1 py-0.5 rounded mt-1 truncate ${
                                esSeleccionado
                                  ? "bg-white/20 text-white"
                                  : "bg-[#63E6BE]/20 text-[#14B8A6]"
                              }`}
                              title={`${cita.hora} - ${cita.cliente} - ${
                                cita.servicioNombre || cita.servicio
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCitaDetalle(cita);
                                setDetailModalOpen(true);
                              }}
                            >
                              {cita.hora} {cita.cliente.split(" ")[0]}
                            </div>
                          ))}

                        {numCitas > 2 && (
                          <div className="mt-auto">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full ${
                                esSeleccionado
                                  ? "bg-white text-[#14B8A6]"
                                  : "bg-[#14B8A6] text-white"
                              }`}
                              style={{ fontSize: "10px", fontWeight: 600 }}
                            >
                              +{numCitas - 2} más
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Vista Día (Timeline) */}
          {vistaCalendario === "dia" && (
            <div
              className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm transition-colors duration-300`}
            >
              <div className="mb-4">
                <h3
                  className={textPrimary}
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  {getDiaNombre(fechaSeleccionada)},{" "}
                  {fechaSeleccionada.getDate()} de{" "}
                  {MESES[fechaSeleccionada.getMonth()]}
                </h3>
              </div>

              <div className="space-y-2">
                {HORARIOS_DIA.map((hora) => {
                  const citasHora = getCitasDelDia(fechaSeleccionada).filter(
                    (c) => c.hora === hora
                  );

                  return (
                    <div
                      key={hora}
                      className="grid grid-cols-[80px_1fr] gap-4 items-start"
                    >
                      <div
                        className={`${textSecondary} text-right pt-2`}
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        {hora}
                      </div>
                      <div
                        className={`min-h-[60px] rounded-xl border-2 border-dashed ${border} p-3 ${
                          citasHora.length > 0 ? bgCard : ""
                        }`}
                      >
                        {citasHora.map((cita) => {
                          const Icon = getEstadoIcon(cita.estado);
                          return (
                            <div
                              key={cita.id}
                              onClick={() => openEditModal(cita)}
                              className={`p-3 rounded-lg mb-2 last:mb-0 cursor-pointer transition-all hover:shadow-md ${getEstadoColor(
                                cita.estado
                              )} bg-opacity-10 border-l-4`}
                              style={{
                                borderLeftColor: getEstadoColor(
                                  cita.estado
                                ).replace("bg-", "#"),
                              }}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4" />
                                    <span
                                      className={textPrimary}
                                      style={{
                                        fontSize: "14px",
                                        fontWeight: 700,
                                      }}
                                    >
                                      {cita.cliente}
                                    </span>
                                  </div>
                                  <p
                                    className={textSecondary}
                                    style={{ fontSize: "12px" }}
                                  >
                                    {cita.servicioNombre || cita.servicio} ·{" "}
                                    {cita.duracion} min
                                  </p>
                                  <p
                                    className={textSecondary}
                                    style={{ fontSize: "12px" }}
                                  >
                                    {cita.empleado}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full ${getEstadoColor(
                                    cita.estado
                                  )} text-white`}
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                >
                                  {cita.estado}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vista Lista */}
      {vistaPrincipal === "lista" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm`}
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#14B8A6]" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cita..."
                  className={`pl-10 h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} focus:border-[#14B8A6]`}
                />
              </div>
            </div>

            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger
                className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className={bgCard}>
                <SelectItem value="Todos" className={textPrimary}>
                  Todos los estados
                </SelectItem>
                <SelectItem value="Pendiente" className={textPrimary}>
                  Pendiente
                </SelectItem>
                <SelectItem value="Confirmada" className={textPrimary}>
                  Confirmada
                </SelectItem>
                <SelectItem value="Completada" className={textPrimary}>
                  Completada
                </SelectItem>
                <SelectItem value="Cancelada" className={textPrimary}>
                  Cancelada
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
              <SelectTrigger
                className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              >
                <SelectValue placeholder="Empleado" />
              </SelectTrigger>
              <SelectContent className={bgCard}>
                <SelectItem value="Todos" className={textPrimary}>
                  Todos los empleados
                </SelectItem>
                {empleados.map((emp) => (
                  <SelectItem
                    key={emp.id}
                    value={emp.nombre}
                    className={textPrimary}
                  >
                    {emp.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroServicio} onValueChange={setFiltroServicio}>
              <SelectTrigger
                className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              >
                <SelectValue placeholder="Servicio" />
              </SelectTrigger>
              <SelectContent className={bgCard}>
                <SelectItem value="Todos" className={textPrimary}>
                  Todos los servicios
                </SelectItem>
                {servicios.map((srv) => (
                  <SelectItem
                    key={srv.nombre}
                    value={srv.nombre}
                    className={textPrimary}
                  >
                    {srv.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de citas */}
          <div
            className={`${bgCard} rounded-xl border ${border} shadow-sm overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9]">
                  <tr>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Código
                    </th>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Fecha/Hora
                    </th>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Cliente
                    </th>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Empleado
                    </th>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Servicio
                    </th>
                    <th
                      className="text-left p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Estado
                    </th>
                    <th
                      className="text-center p-4 text-white"
                      style={{ fontWeight: 600, fontSize: "14px" }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className={`text-center p-8 ${textSecondary}`}
                      >
                        No se encontraron citas
                      </td>
                    </tr>
                  ) : (
                    citasFiltradas.map((cita) => {
                      const Icon = getEstadoIcon(cita.estado);
                      return (
                        <tr
                          key={cita.id}
                          className={`border-b ${border} hover:bg-[#14B8A6] hover:bg-opacity-10 transition-all duration-200`}
                        >
                          <td
                            className={`p-4 ${textPrimary}`}
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            {cita.codigo}
                          </td>
                          <td
                            className={`p-4 ${textPrimary}`}
                            style={{ fontSize: "13px" }}
                          >
                            <div>{cita.fecha.toLocaleDateString("es-ES")}</div>
                            <div
                              className={textSecondary}
                              style={{ fontSize: "12px" }}
                            >
                              {cita.hora}
                            </div>
                          </td>
                          <td
                            className={`p-4 ${textPrimary}`}
                            style={{ fontSize: "13px", fontWeight: 600 }}
                          >
                            {cita.cliente}
                          </td>
                          <td
                            className={`p-4 ${textSecondary}`}
                            style={{ fontSize: "13px" }}
                          >
                            {cita.empleado}
                          </td>
                          <td
                            className={`p-4 ${textSecondary}`}
                            style={{ fontSize: "13px" }}
                          >
                            {cita.servicioNombre || cita.servicio}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getEstadoColor(
                                cita.estado
                              )} text-white`}
                              style={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {cita.estado}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => {
                                  setCitaDetalle(cita);
                                  setDetailModalOpen(true);
                                }}
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg h-9 w-9 p-0"
                                title="Ver detalle"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => openEditModal(cita)}
                                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-lg h-9 px-3"
                                style={{ fontSize: "12px", fontWeight: 600 }}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedCita(cita);
                                  setDeleteDialogOpen(true);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-9 px-3"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista Médicos */}
      {vistaPrincipal === "medicos" && (
        <div className="space-y-4">
          <div
            className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm transition-colors duration-300 flex items-center justify-between`}
          >
            <div>
              <h2 className={`${textPrimary} text-lg font-bold`}>
                Gestión de Médicos
              </h2>
              <p className={`${textSecondary} text-sm`}>
                Lista de médicos registrados en el sistema
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openCreateMedicoModal}
                className="h-10 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                style={{ fontWeight: 600 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Médico
              </Button>
            </div>
          </div>

          <div
            className={`${bgCard} rounded-xl border ${border} shadow-sm overflow-hidden`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9]">
                  <tr>
                    <th className="text-left p-4 text-white">Nombre</th>
                    <th className="text-left p-4 text-white">Especialidad</th>
                    <th className="text-left p-4 text-white">Contacto</th>
                    <th className="text-center p-4 text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className={`text-center p-8 ${textSecondary}`}
                      >
                        No hay médicos registrados
                      </td>
                    </tr>
                  ) : (
                    empleados.map((emp) => {
                      const usuario =
                        usuariosFromStorage.find((u: any) => u.id === emp.id) ||
                        null;
                      return (
                        <tr key={emp.id} className={`border-b ${border}`}>
                          <td className={`p-4 ${textPrimary} font-semibold`}>
                            {emp.nombre}
                          </td>
                          <td className={`p-4 ${textSecondary}`}>
                            {emp.especialidad}
                          </td>
                          <td className={`p-4 ${textSecondary}`}>
                            {usuario?.telefono || "—"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => {
                                  setEmpleadoSeleccionado(emp);
                                  setVistaPrincipal("disponibilidad");
                                }}
                                className="h-9 w-9 p-0 rounded-lg bg-blue-500/10 text-blue-500"
                                title="Ver disponibilidad"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  openEditMedicoModal(usuario || emp)
                                }
                                className="h-9 px-3 rounded-lg bg-[#0EA5E9] text-white"
                              >
                                Editar
                              </Button>
                              <Button
                                onClick={() =>
                                  handleMedicoDelete(
                                    usuario || {
                                      id: emp.id,
                                      nombre: emp.nombre,
                                    }
                                  )
                                }
                                className="h-9 w-9 p-0 rounded-lg bg-red-500 text-white"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vista Disponibilidad */}
      {vistaPrincipal === "disponibilidad" && (
        <div className="space-y-4">
          {/* Selector de empleado */}
          <div
            className={`${bgCard} rounded-xl p-4 border ${border} shadow-sm`}
          >
            <label
              className={`block ${textPrimary} mb-3`}
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Selecciona un empleado para ver/editar su disponibilidad
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {empleados.map((empleado) => (
                <motion.div
                  key={empleado.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setEmpleadoSeleccionado(empleado)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    empleadoSeleccionado?.id === empleado.id
                      ? "border-[#14B8A6] bg-[#14B8A6] bg-opacity-10"
                      : `${border} hover:border-[#14B8A6]`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {empleado.foto ? (
                      <ImageWithFallback
                        src={empleado.foto}
                        alt={empleado.nombre}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-full ${
                          isDark ? "bg-[#161b22]" : "bg-gray-200"
                        } flex items-center justify-center`}
                      >
                        <Stethoscope className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4
                        className={textPrimary}
                        style={{ fontSize: "15px", fontWeight: 700 }}
                      >
                        {empleado.nombre}
                      </h4>
                      <p className={textSecondary} style={{ fontSize: "12px" }}>
                        {empleado.especialidad}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Calendario de disponibilidad */}
          {empleadoSeleccionado && (
            <>
              {/* Calendario para marcar días no disponibles */}
              <CalendarioDisponibilidad
                empleado={empleadoSeleccionado}
                onToggleDia={(fecha) =>
                  toggleDiaNoDisponible(empleadoSeleccionado, fecha)
                }
                isDark={isDark}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                bgCard={bgCard}
                border={border}
              />

              {/* Horarios de disponibilidad por día de la semana */}
              <div
                className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm`}
              >
                <h3
                  className={`${textPrimary} mb-4`}
                  style={{ fontSize: "18px", fontWeight: 700 }}
                >
                  Horarios de disponibilidad - {empleadoSeleccionado.nombre}
                </h3>

                <div className="space-y-4">
                  {[
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                    "Domingo",
                  ].map((dia) => {
                    const horariosDisponibles =
                      empleadoSeleccionado.disponibilidad[dia] || [];

                    return (
                      <div
                        key={dia}
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-[#161b22]" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={textPrimary}
                            style={{ fontSize: "14px", fontWeight: 700 }}
                          >
                            {dia}
                          </span>
                          <span
                            className={textSecondary}
                            style={{ fontSize: "12px" }}
                          >
                            {horariosDisponibles.length} horarios disponibles
                          </span>
                        </div>

                        <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                          {HORARIOS_DIA.map((hora) => {
                            const estaDisponible =
                              horariosDisponibles.includes(hora);

                            return (
                              <button
                                key={hora}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (!canEditAvailability) {
                                    toast.error(
                                      "No tienes permiso para modificar horarios",
                                      {
                                        duration: 2000,
                                      }
                                    );
                                    return;
                                  }
                                  if (empleadoSeleccionado) {
                                    toggleHorarioDisponibilidad(
                                      empleadoSeleccionado,
                                      dia,
                                      hora
                                    );
                                  }
                                }}
                                className={`h-10 rounded-lg transition-all duration-200 ${
                                  estaDisponible
                                    ? "bg-[#14B8A6] text-white hover:bg-[#0D9488]"
                                    : `${
                                        isDark
                                          ? "bg-[#0d1117] hover:bg-[#14B8A6]"
                                          : "bg-white hover:bg-[#14B8A6]"
                                      } ${textSecondary} hover:text-white border ${border}`
                                }`}
                                style={{ fontSize: "11px", fontWeight: 600 }}
                              >
                                {hora}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal de citas del día */}
      {/* Modal Crear/Editar Médico */}
      <Dialog open={medicoModalOpen} onOpenChange={setMedicoModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[600px] rounded-xl border-2 ${border} max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span
                  className={textPrimary}
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {selectedMedicoUsuario ? "Editar Médico" : "Nuevo Médico"}
                </span>
                <p className={textSecondary} style={{ fontSize: "13px" }}>
                  Registra un médico en el sistema
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleMedicoSubmit} className="space-y-4 mt-4">
            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Nombre *
              </label>
              <Input
                value={medicoForm.nombre}
                onChange={(e) =>
                  setMedicoForm({ ...medicoForm, nombre: e.target.value })
                }
                className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Email
              </label>
              <Input
                value={medicoForm.email}
                onChange={(e) =>
                  setMedicoForm({ ...medicoForm, email: e.target.value })
                }
                className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                placeholder="email@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Teléfono
                </label>
                <Input
                  value={medicoForm.telefono}
                  onChange={(e) =>
                    setMedicoForm({ ...medicoForm, telefono: e.target.value })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                  placeholder="Teléfono"
                />
              </div>
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Especialidad
                </label>
                <Input
                  value={medicoForm.tipoDocumento}
                  onChange={(e) =>
                    setMedicoForm({
                      ...medicoForm,
                      tipoDocumento: e.target.value,
                    })
                  }
                  className={`h-11 rounded-xl ${inputBorder} ${inputBg}`}
                  placeholder="Especialidad (p.ej. Pediatría)"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setMedicoModalOpen(false)}
                className={`flex-1 h-11 rounded-xl ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
                }`}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white"
              >
                {selectedMedicoUsuario ? "Guardar" : "Crear Médico"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={citasDiaModalOpen} onOpenChange={setCitasDiaModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[600px] rounded-xl border-2 ${border}`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span
                  className={textPrimary}
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  Citas del día
                </span>
                <p className={textSecondary} style={{ fontSize: "13px" }}>
                  {fechaSeleccionada.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {getCitasDelDia(fechaSeleccionada).length === 0 ? (
              <p className={`${textSecondary} text-center py-8`}>
                No hay citas programadas para este día
              </p>
            ) : (
              getCitasDelDia(fechaSeleccionada).map((cita) => {
                const Icon = getEstadoIcon(cita.estado);
                return (
                  <div
                    key={cita.id}
                    className={`p-4 rounded-xl border ${border} ${
                      isDark ? "bg-[#161b22]" : "bg-gray-50"
                    } cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => {
                      setCitasDiaModalOpen(false);
                      openEditModal(cita);
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-[#14B8A6]" />
                          <span
                            className={textPrimary}
                            style={{ fontSize: "15px", fontWeight: 700 }}
                          >
                            {cita.hora}
                          </span>
                          <span
                            className={textSecondary}
                            style={{ fontSize: "13px" }}
                          >
                            ({cita.duracion} min)
                          </span>
                        </div>
                        <p
                          className={textPrimary}
                          style={{ fontSize: "14px", fontWeight: 600 }}
                        >
                          {cita.cliente}
                        </p>
                        <p
                          className={textSecondary}
                          style={{ fontSize: "13px" }}
                        >
                          {cita.servicioNombre || cita.servicio}
                        </p>
                        <p
                          className={textSecondary}
                          style={{ fontSize: "12px" }}
                        >
                          {cita.empleado}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${getEstadoColor(
                          cita.estado
                        )} text-white shrink-0`}
                        style={{ fontSize: "12px", fontWeight: 600 }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Cita */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${modalBg} sm:max-w-[640px] rounded-xl border-2 ${border} max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14B8A6] to-[#0EA5E9] flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <span
                  className={textPrimary}
                  style={{ fontSize: "22px", fontWeight: 700 }}
                >
                  {selectedCita ? "Editar Cita" : "Nueva Cita"}
                </span>
                <p className={textSecondary} style={{ fontSize: "13px" }}>
                  Complete la información de la cita
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            {/* 🔴 SECCIÓN 1: Tipo y Número de Documento (AL INICIO) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Tipo de Documento *
                </label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger
                    className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg}`}
                  >
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className={`${bgCard} z-[9999]`}
                    sideOffset={5}
                  >
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="Cédula">Cédula</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Número de Documento *
                </label>
                <Input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) =>
                    setNumeroDocumento(onlyNumbers(e.target.value))
                  }
                  placeholder="Ej: 12345678"
                  className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
                  maxLength={10}
                />
                {numeroDocumento && validateDNI(numeroDocumento).message && (
                  <p className="text-red-500 text-xs mt-1">
                    {validateDNI(numeroDocumento).message}
                  </p>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: Nombre del Cliente */}
            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Nombre del Cliente *
              </label>
              <Input
                value={formData.cliente}
                onChange={(e) =>
                  handleChange("cliente", onlyLetters(e.target.value))
                }
                onBlur={() => handleBlur("cliente")}
                placeholder="Nombre completo"
                className={`h-11 rounded-xl border-2 ${inputBg} ${inputText} ${
                  touched.cliente && errors.cliente
                    ? "border-red-500"
                    : inputBorder
                }`}
              />
              {touched.cliente && errors.cliente && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.cliente}
                </p>
              )}
            </div>

            {/* Selector de Empleado */}
            <div>
              <label
                className={`block ${textPrimary} mb-3`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Empleado / Médico
              </label>
              <div className="grid grid-cols-1 gap-2">
                {empleados.map((empleado) => (
                  <div
                    key={empleado.id}
                    onClick={() => {
                      handleChange("empleadoId", empleado.id);

                      // 🔴 ALERTA: Si hay fecha seleccionada y el médico no está disponible
                      if (
                        formData.fecha &&
                        esDiaNoDisponible(empleado, formData.fecha)
                      ) {
                        toast.error(
                          `⚠️ ${
                            empleado.nombre
                          } NO está disponible en la fecha seleccionada (${fechaAString(
                            formData.fecha
                          )})`,
                          {
                            style: { background: "#EF4444", color: "white" },
                            duration: 4000,
                          }
                        );
                      }
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      formData.empleadoId === empleado.id
                        ? "border-[#14B8A6] bg-[#14B8A6] bg-opacity-10"
                        : `${border} hover:border-[#14B8A6]`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {empleado.foto ? (
                        <ImageWithFallback
                          src={empleado.foto}
                          alt={empleado.nombre}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full ${
                            isDark ? "bg-[#161b22]" : "bg-gray-200"
                          } flex items-center justify-center`}
                        >
                          <Stethoscope className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4
                          className={textPrimary}
                          style={{ fontSize: "14px", fontWeight: 700 }}
                        >
                          {empleado.nombre}
                        </h4>
                        <p
                          className={textSecondary}
                          style={{ fontSize: "12px" }}
                        >
                          {empleado.especialidad}
                        </p>
                      </div>
                      {formData.empleadoId === empleado.id && (
                        <CheckCircle className="w-5 h-5 text-[#14B8A6]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {touched.empleadoId && errors.empleadoId && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.empleadoId}
                </p>
              )}
            </div>

            {/* 🔴 Los días no disponibles ahora se muestran en rojo directamente en el calendario visual */}

            {/* 🔴 Selector de Servicios DINÁMICO (desde tabla de admin) */}
            <div>
              <label
                className={`block ${textPrimary} mb-3`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Servicio *
                {servicios.length === 0 && (
                  <span className="text-red-500 text-xs ml-2">
                    (No hay servicios activos)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-2">
                {servicios.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay servicios activos
                  </div>
                ) : (
                  servicios.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          servicio: srv.id,
                          duracion: srv.duracion,
                        });
                        setTouched({ ...touched, servicio: true });
                      }}
                      className={`p-3 rounded-xl transition-all duration-200 text-left ${
                        formData.servicio === srv.id
                          ? "bg-[#63E6BE] text-white shadow-lg scale-[1.02]"
                          : `${
                              isDark
                                ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                                : "bg-white hover:bg-[#63E6BE]/10 text-[#3D4756]"
                            } border-2 ${border} hover:border-[#63E6BE]`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div style={{ fontSize: "14px", fontWeight: 600 }}>
                            {srv.nombre}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              formData.servicio === srv.id
                                ? "text-white/90"
                                : "text-gray-500"
                            }`}
                          >
                            {srv.duracion || 30} minutos
                          </div>
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 700 }}>
                          ${srv.precio?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {touched.servicio && errors.servicio && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.servicio}
                </p>
              )}
            </div>

            {/* 🔴 Calendario visual para seleccionar fecha */}
            <div>
              <label
                className={`block ${textPrimary} mb-3`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Fecha de la Cita *
              </label>
              <CalendarioSeleccionFecha
                fechaSeleccionada={formData.fecha}
                empleadoSeleccionado={
                  empleados.find((e) => e.id === formData.empleadoId) || null
                }
                onSelectFecha={(fecha) => {
                  handleChange("fecha", fecha);
                  // Resetear hora al cambiar fecha
                  handleChange("hora", "");

                  // 🔴 ALERTA: Si el médico no está disponible ese día
                  if (formData.empleadoId) {
                    const empleado = empleados.find(
                      (e) => e.id === formData.empleadoId
                    );
                    if (empleado && esDiaNoDisponible(empleado, fecha)) {
                      toast.error(
                        "⚠️ Este médico NO está disponible en la fecha seleccionada",
                        {
                          style: { background: "#EF4444", color: "white" },
                          duration: 4000,
                        }
                      );
                    }
                  }
                }}
                isDark={isDark}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                border={border}
              />
              {touched.fecha && errors.fecha && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.fecha}
                </p>
              )}
            </div>

            {/* Duración */}
            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Duración (min)
              </label>
              <Input
                type="number"
                value={formData.duracion}
                readOnly
                className={`h-11 rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText} opacity-70`}
              />
            </div>

            {/* 🔴 Selector de horarios - Solo muestra horas NO reservadas */}
            <div>
              <label
                className={`block ${textPrimary} mb-3`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Hora Disponible *
                {horasDisponiblesParaFecha.length === 0 && (
                  <span className="text-red-500 text-xs ml-2">
                    (No hay horas disponibles)
                  </span>
                )}
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2">
                {horasDisponiblesParaFecha.map((hora) => (
                  <button
                    key={hora}
                    type="button"
                    onClick={() => handleChange("hora", hora)}
                    className={`h-11 rounded-xl transition-all duration-200 ${
                      formData.hora === hora
                        ? "bg-[#63E6BE] text-white shadow-lg scale-105"
                        : `${
                            isDark
                              ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                              : "bg-white hover:bg-[#63E6BE]/10 text-[#3D4756]"
                          } border-2 ${border} hover:border-[#63E6BE]`
                    }`}
                    style={{ fontSize: "13px", fontWeight: 600 }}
                  >
                    {hora}
                  </button>
                ))}
              </div>
              {horasDisponiblesParaFecha.length === 0 && (
                <p className="text-amber-600 mt-2 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Todas las horas están reservadas para esta fecha
                </p>
              )}
              {touched.hora && errors.hora && (
                <p className="text-red-500 mt-1.5" style={{ fontSize: "12px" }}>
                  {errors.hora}
                </p>
              )}
            </div>

            {selectedCita && (
              <div>
                <label
                  className={`block ${textPrimary} mb-2`}
                  style={{ fontSize: "13px", fontWeight: 600 }}
                >
                  Estado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "Pendiente",
                      "Confirmada",
                      "Completada",
                      "Cancelada",
                    ] as const
                  ).map((estado) => {
                    const Icon = getEstadoIcon(estado);
                    return (
                      <button
                        key={estado}
                        type="button"
                        onClick={() =>
                          cambiarEstadoCita(selectedCita.id, estado)
                        }
                        className={`h-11 rounded-xl flex items-center justify-center gap-2 transition-all ${
                          selectedCita.estado === estado
                            ? `${getEstadoColor(estado)} text-white shadow-md`
                            : `${
                                isDark
                                  ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                                  : "bg-gray-100 hover:bg-gray-200 text-[#3D4756]"
                              } border ${border}`
                        }`}
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      >
                        <Icon className="w-4 h-4" />
                        {estado}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label
                className={`block ${textPrimary} mb-2`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Notas
              </label>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleChange("notas", e.target.value)}
                placeholder="Notas adicionales..."
                rows={3}
                className={`rounded-xl border-2 ${inputBorder} ${inputBg} ${inputText}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`h-12 rounded-xl ${
                  isDark
                    ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-[#374151]"
                } transition-all`}
                style={{ fontWeight: 600, fontSize: "14px" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || loading}
                className={`h-12 rounded-xl transition-all duration-300 ${
                  isFormValid() && !loading
                    ? "bg-[#14B8A6] hover:bg-[#0D9488] text-white shadow-lg shadow-[#14B8A6]/20"
                    : `${
                        isDark
                          ? "bg-[#161b22] text-gray-600"
                          : "bg-gray-300 text-gray-500"
                      } cursor-not-allowed`
                }`}
                style={{ fontWeight: 600, fontSize: "14px" }}
              >
                {loading
                  ? "Guardando..."
                  : selectedCita
                  ? "Guardar Cambios"
                  : "Crear Cita"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🔴 Modal de Detalle de Cita */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent
          className={`${modalBg} rounded-2xl p-6 max-w-md border-2 ${border}`}
        >
          <DialogHeader>
            <DialogTitle
              className={`${textPrimary} text-2xl font-bold flex items-center gap-3`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              Detalle de Cita
            </DialogTitle>
          </DialogHeader>

          {citaDetalle && (
            <div className="space-y-4 mt-4">
              <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                <label
                  className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                >
                  Código
                </label>
                <p className={`${textPrimary} font-bold text-lg`}>
                  {citaDetalle.codigo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                  <label
                    className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                  >
                    Fecha
                  </label>
                  <p className={`${textPrimary} font-semibold`}>
                    {citaDetalle.fecha.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                  <label
                    className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                  >
                    Hora
                  </label>
                  <p className={`${textPrimary} font-bold text-lg`}>
                    {citaDetalle.hora}
                  </p>
                </div>
              </div>

              <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                <label
                  className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                >
                  Cliente
                </label>
                <p className={`${textPrimary} font-semibold text-lg`}>
                  {citaDetalle.cliente}
                </p>
              </div>

              <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                <label
                  className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                >
                  Empleado/Médico
                </label>
                <p className={`${textPrimary} font-semibold`}>
                  {citaDetalle.empleado}
                </p>
              </div>

              <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                <label
                  className={`block ${textSecondary} mb-1 text-xs uppercase tracking-wide`}
                >
                  Servicio
                </label>
                <p className={`${textPrimary} font-semibold`}>
                  {citaDetalle.servicioNombre || citaDetalle.servicio}
                </p>
                <p className={`${textSecondary} text-sm mt-1`}>
                  Duración: {citaDetalle.duracion} minutos
                </p>
              </div>

              <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                <label
                  className={`block ${textSecondary} mb-2 text-xs uppercase tracking-wide`}
                >
                  Estado
                </label>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                    citaDetalle.estado === "Confirmada"
                      ? "bg-green-500/10 text-green-500"
                      : citaDetalle.estado === "Pendiente"
                      ? "bg-yellow-500/10 text-yellow-500"
                      : citaDetalle.estado === "Completada"
                      ? "bg-blue-500/10 text-blue-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {(() => {
                    const Icon = getEstadoIcon(citaDetalle.estado);
                    return <Icon className="w-4 h-4" />;
                  })()}
                  {citaDetalle.estado}
                </span>
              </div>

              {citaDetalle.notas && (
                <div className={`${bgCard} rounded-xl p-4 border ${border}`}>
                  <label
                    className={`block ${textSecondary} mb-2 text-xs uppercase tracking-wide`}
                  >
                    Notas
                  </label>
                  <p className={`${textPrimary} text-sm leading-relaxed`}>
                    {citaDetalle.notas}
                  </p>
                </div>
              )}

              <Button
                onClick={() => setDetailModalOpen(false)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#63E6BE] to-[#14B8A6] hover:from-[#5DD5BE] hover:to-[#0D9488] text-white font-bold text-base shadow-lg"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className={`${modalBg} rounded-xl border-2 ${border}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span
                className="text-red-600"
                style={{ fontSize: "22px", fontWeight: 700 }}
              >
                ¿Eliminar esta cita?
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription
              className={`${textSecondary} ml-16`}
              style={{ fontSize: "14px" }}
            >
              La cita de "{selectedCita?.cliente}" se eliminará permanentemente.
              Esta acción no se puede deshacer.
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
