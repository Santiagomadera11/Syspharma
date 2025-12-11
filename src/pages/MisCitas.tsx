import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Check,
  Search,
  Filter,
  MapPin,
  Info,
  User,
  DollarSign,
} from "lucide-react";
import { useDarkMode } from "../hooks/useDarkMode";
import { useCitas, useServicios, useUsuarios } from "../hooks/useEntities";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";

interface MisCitasProps {
  user: any;
}

// Componente de calendario simple
function MiniCalendar({ selectedDate, onSelectDate, citasOcupadas }: any) {
  const { isDark, textPrimary, textSecondary, border } = useDarkMode();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
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

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const prevMonth = () => {
    const today = new Date();
    const prevMonthDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1
    );
    // No permitir navegar a meses anteriores al actual
    if (prevMonthDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prevMonthDate);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const isDateOccupied = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return citasOcupadas.includes(dateStr);
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const checkDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return (
      checkDate <
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return (
      selected.getDate() === day &&
      selected.getMonth() === currentMonth.getMonth() &&
      selected.getFullYear() === currentMonth.getFullYear()
    );
  };

  const today = new Date();
  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isCurrentMonth}
          className={`p-2 rounded-lg ${
            isCurrentMonth
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          } ${textPrimary}`}
        >
          ‹
        </button>
        <h3 className={`${textPrimary} font-semibold`}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${textPrimary}`}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className={`${textSecondary} text-center text-xs font-semibold py-2`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isPast = isPastDate(day);
          const isOccupied = isDateOccupied(day);
          const isSelected = isSelectedDate(day);

          return (
            <button
              key={day}
              onClick={() => {
                if (!isPast) {
                  const dateStr = `${currentMonth.getFullYear()}-${String(
                    currentMonth.getMonth() + 1
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  onSelectDate(dateStr);
                }
              }}
              disabled={isPast}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200
                ${
                  isPast
                    ? "opacity-30 cursor-not-allowed text-gray-400"
                    : "hover:bg-[#63E6BE]/20"
                }
                ${
                  isSelected ? "bg-[#63E6BE] text-white font-bold" : textPrimary
                }
                ${
                  isOccupied && !isSelected
                    ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : ""
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300" />
          <span className={textSecondary}>Ocupado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#63E6BE]" />
          <span className={textSecondary}>Seleccionado</span>
        </div>
      </div>
    </div>
  );
}

export default function MisCitas({ user }: MisCitasProps) {
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
  const { items: todasCitas, add: addCita } = useCitas();
  const { items: servicios } = useServicios();
  const { items: usuarios } = useUsuarios();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCita, setSelectedCita] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    servicioId: "",
    notas: "",
  });

  // Filtrar solo citas del cliente actual
  const citas = useMemo(() => {
    return todasCitas.filter((c) => c.clienteId === user?.id);
  }, [todasCitas, user?.id]);

  // Servicios activos
  const serviciosActivos = useMemo(() => {
    return servicios.filter((s) => s.estado === "Activo");
  }, [servicios]);

  // Obtener servicio seleccionado
  const servicioSeleccionado = useMemo(() => {
    return servicios.find((s) => s.id === formData.servicioId);
  }, [servicios, formData.servicioId]);

  // Obtener fechas ocupadas
  const citasOcupadas = useMemo(() => {
    return todasCitas.map((c) => c.fecha.split("T")[0]);
  }, [todasCitas]);

  // Obtener horas ocupadas para la fecha seleccionada
  const horasOcupadas = useMemo(() => {
    if (!formData.fecha) return [];
    return todasCitas
      .filter((c) => c.fecha.startsWith(formData.fecha))
      .map((c) => {
        const fecha = new Date(c.fecha);
        return `${String(fecha.getHours()).padStart(2, "0")}:${String(
          fecha.getMinutes()
        ).padStart(2, "0")}`;
      });
  }, [todasCitas, formData.fecha]);

  // Generar horas disponibles
  const horasDisponibles = useMemo(() => {
    const horas = [];
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const horaStr = `${String(h).padStart(2, "0")}:${String(m).padStart(
          2,
          "0"
        )}`;
        if (!horasOcupadas.includes(horaStr)) {
          horas.push(horaStr);
        }
      }
    }
    return horas;
  }, [horasOcupadas]);

  const openCreateModal = () => {
    setFormData({
      fecha: "",
      hora: "",
      servicioId: "",
      notas: "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fecha || !formData.servicioId) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    const servicio = servicios.find((s) => s.id === formData.servicioId);
    if (!servicio) {
      toast.error("Servicio no encontrado");
      return;
    }

    // Asignar automáticamente la primera hora disponible
    const horaAsignada =
      horasDisponibles.length > 0 ? horasDisponibles[0] : "08:00";

    const nuevaCita = {
      id: `CITA-${Date.now()}`,
      fecha: `${formData.fecha}T${horaAsignada}:00`,
      hora: horaAsignada,
      clienteId: user?.id || "",
      clienteNombre: user?.nombre || "",
      servicioId: formData.servicioId,
      servicioNombre: servicio.nombre,
      estado: "Pendiente" as const,
      notas: formData.notas,
      createdAt: new Date().toISOString(),
    };

    addCita(nuevaCita);

    toast.success("¡Cita agendada exitosamente!", {
      style: { background: "#A7F3D0", color: "#065F46" },
    });

    setModalOpen(false);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Completada":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          border: "border-green-500/20",
        };
      case "Confirmada":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-500",
          border: "border-blue-500/20",
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

  const filteredCitas = citas.filter((cita) => {
    const matchesSearch = cita.servicioNombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterEstado === "todos" || cita.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2
            className={`${textPrimary} transition-colors duration-300`}
            style={{ fontSize: "28px", fontWeight: 700 }}
          >
            Mis Citas
          </h2>
          <p
            className={`${textSecondary} transition-colors duration-300`}
            style={{ fontSize: "14px" }}
          >
            Gestiona tus citas médicas
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-11 px-6 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Total Citas
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {citas.length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Pendientes
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {
                  citas.filter(
                    (c) => c.estado === "Pendiente" || c.estado === "Confirmada"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className={`${bgCard} rounded-xl p-5 border ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: "12px" }}>
                Completadas
              </p>
              <p
                className={textPrimary}
                style={{ fontSize: "20px", fontWeight: 700 }}
              >
                {citas.filter((c) => c.estado === "Completada").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={`${bgCard} rounded-xl p-6 border ${border}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#63E6BE]" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por servicio..."
              className={`pl-12 h-12 rounded-xl border-2 ${inputBorder} ${inputBg}`}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterEstado("todos")}
              className={`rounded-xl ${
                filterEstado === "todos"
                  ? "bg-[#63E6BE] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Todas
            </Button>
            <Button
              onClick={() => setFilterEstado("Pendiente")}
              className={`rounded-xl ${
                filterEstado === "Pendiente"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Pendientes
            </Button>
            <Button
              onClick={() => setFilterEstado("Completada")}
              className={`rounded-xl ${
                filterEstado === "Completada"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Completadas
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredCitas.map((cita, index) => {
            const estadoStyle = getEstadoColor(cita.estado);
            const fecha = new Date(cita.fecha);

            return (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`${bgCard} rounded-xl border ${border} p-5 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl ${estadoStyle.bg} flex items-center justify-center`}
                    >
                      <Calendar className={`w-6 h-6 ${estadoStyle.text}`} />
                    </div>
                    <div>
                      <h3
                        className={`${textPrimary} font-bold`}
                        style={{ fontSize: "16px" }}
                      >
                        {cita.servicioNombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-4 h-4 ${textSecondary}`} />
                        <p
                          className={textSecondary}
                          style={{ fontSize: "13px" }}
                        >
                          {fecha.toLocaleDateString("es-ES")} -{" "}
                          {fecha.toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full ${estadoStyle.bg} border ${estadoStyle.border}`}
                  >
                    <span
                      className={`${estadoStyle.text} text-xs font-semibold`}
                    >
                      {cita.estado}
                    </span>
                  </div>
                </div>

                {cita.notas && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className={textSecondary} style={{ fontSize: "12px" }}>
                      {cita.notas}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${textSecondary}`} />
                    <p className={textSecondary} style={{ fontSize: "12px" }}>
                      SysPharma - Sede Principal
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedCita(cita);
                      setShowDetailModal(true);
                    }}
                    className="h-9 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white text-sm px-4"
                  >
                    <Info className="w-4 h-4 mr-1.5" />
                    Ver Detalle
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCitas.length === 0 && (
        <div
          className={`${bgCard} rounded-2xl p-12 text-center border ${border}`}
        >
          <Calendar className={`w-16 h-16 mx-auto mb-4 ${textSecondary}`} />
          <h3 className={`${textPrimary} text-xl font-bold mb-2`}>
            No tienes citas agendadas
          </h3>
          <p className={textSecondary}>Agenda tu primera cita médica</p>
          <Button
            onClick={openCreateModal}
            className="mt-4 bg-[#63E6BE] hover:bg-[#5DD5BE] text-white rounded-xl h-10 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </Button>
        </div>
      )}

      {/* Modal Detalle de Cita */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent
          className={`${bgCard} rounded-2xl p-0 max-w-2xl max-h-[85vh] overflow-hidden`}
        >
          {selectedCita &&
            (() => {
              const estadoStyle = getEstadoColor(selectedCita.estado);
              const fecha = new Date(selectedCita.fecha);
              const servicio = servicios.find(
                (s) => s.id === selectedCita.servicioId
              );
              const medico = usuarios.find(
                (u) => u.id === selectedCita.medicoId
              );

              return (
                <>
                  {/* Header con color según estado */}
                  <div
                    className={`${estadoStyle.bg} p-6 border-b ${estadoStyle.border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2
                          className={`${textPrimary} font-bold mb-2`}
                          style={{ fontSize: "24px" }}
                        >
                          {selectedCita.servicioNombre}
                        </h2>
                        <div className="flex items-center gap-2">
                          <Clock className={`w-5 h-5 ${textSecondary}`} />
                          <p
                            className={textPrimary}
                            style={{ fontSize: "16px", fontWeight: 600 }}
                          >
                            {fecha.toLocaleDateString("es-ES", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className={`w-4 h-4 ${textSecondary}`} />
                          <p className={textSecondary}>
                            {fecha.toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`px-4 py-2 rounded-full ${estadoStyle.bg} border-2 ${estadoStyle.border}`}
                      >
                        <span className={`${estadoStyle.text} font-bold`}>
                          {selectedCita.estado}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Información del Servicio */}
                    <div>
                      <h3
                        className={`${textPrimary} font-semibold mb-3 flex items-center`}
                        style={{ fontSize: "18px" }}
                      >
                        <Calendar className="w-5 h-5 mr-2 text-[#63E6BE]" />
                        Detalles del Servicio
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {servicio && (
                          <>
                            <div
                              className={`p-4 rounded-xl ${
                                isDark ? "bg-gray-800" : "bg-gray-50"
                              }`}
                            >
                              <p className={`${textSecondary} text-sm mb-1`}>
                                Duración
                              </p>
                              <p className={`${textPrimary} font-semibold`}>
                                {servicio.duracion} minutos
                              </p>
                            </div>
                            <div className={`p-4 rounded-xl bg-[#63E6BE]/10`}>
                              <p className={`${textSecondary} text-sm mb-1`}>
                                Precio
                              </p>
                              <p className="text-[#63E6BE] font-bold text-xl">
                                ${servicio.precio.toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      {servicio?.descripcion && (
                        <div className="mt-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <p className={textSecondary}>
                            {servicio.descripcion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Información del Médico */}
                    {medico && (
                      <div>
                        <h3
                          className={`${textPrimary} font-semibold mb-3 flex items-center`}
                          style={{ fontSize: "18px" }}
                        >
                          <User className="w-5 h-5 mr-2 text-[#63E6BE]" />
                          Médico Asignado
                        </h3>
                        <div
                          className={`p-4 rounded-xl border ${border} flex items-center gap-4`}
                        >
                          <img
                            src={
                              medico.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${medico.nombre}`
                            }
                            alt={medico.nombre}
                            className="w-16 h-16 rounded-full border-2 border-[#63E6BE]"
                          />
                          <div>
                            <p
                              className={`${textPrimary} font-bold`}
                              style={{ fontSize: "16px" }}
                            >
                              {medico.nombre}
                            </p>
                            <p className={textSecondary}>
                              {medico.especialidad || "Médico General"}
                            </p>
                            {medico.email && (
                              <p className={`${textSecondary} text-sm mt-1`}>
                                {medico.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notas */}
                    {selectedCita.notas && (
                      <div>
                        <h3
                          className={`${textPrimary} font-semibold mb-3 flex items-center`}
                          style={{ fontSize: "18px" }}
                        >
                          <Info className="w-5 h-5 mr-2 text-[#63E6BE]" />
                          Notas de la Cita
                        </h3>
                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className={textSecondary}>{selectedCita.notas}</p>
                        </div>
                      </div>
                    )}

                    {/* Ubicación */}
                    <div>
                      <h3
                        className={`${textPrimary} font-semibold mb-3 flex items-center`}
                        style={{ fontSize: "18px" }}
                      >
                        <MapPin className="w-5 h-5 mr-2 text-[#63E6BE]" />
                        Ubicación
                      </h3>
                      <div className={`p-4 rounded-xl border ${border}`}>
                        <p className={`${textPrimary} font-semibold mb-1`}>
                          SysPharma - Sede Principal
                        </p>
                        <p className={textSecondary}>
                          Calle 123 #45-67, Centro, Ciudad
                        </p>
                        <p className={`${textSecondary} text-sm mt-2`}>
                          Tel: (123) 456-7890
                        </p>
                      </div>
                    </div>

                    {/* Información del Pago */}
                    {servicio && (
                      <div className="p-5 rounded-xl bg-gradient-to-r from-[#63E6BE]/10 to-blue-500/10 border-2 border-[#63E6BE]/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-[#63E6BE]" />
                            <h3
                              className={`${textPrimary} font-bold`}
                              style={{ fontSize: "18px" }}
                            >
                              Total a Pagar
                            </h3>
                          </div>
                          <p className="text-[#63E6BE] font-bold text-3xl">
                            ${servicio.precio.toLocaleString()}
                          </p>
                        </div>
                        <p className={`${textSecondary} text-sm`}>
                          * El pago se realiza en el momento de la consulta
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer con botón */}
                  <div className={`border-t ${border} p-6`}>
                    <Button
                      onClick={() => setShowDetailModal(false)}
                      className="w-full h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
                    >
                      Cerrar
                    </Button>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Modal Nueva Cita */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className={`${bgCard} rounded-2xl p-6 max-w-2xl max-h-[85vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle
              className={`${textPrimary} text-2xl font-bold flex items-center`}
            >
              <Calendar className="w-6 h-6 mr-2 text-[#63E6BE]" />
              Agendar Nueva Cita
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Calendario */}
            <div>
              <label className={`block ${textPrimary} mb-2 font-semibold`}>
                Selecciona una Fecha *
              </label>
              <div className={`p-4 rounded-xl border ${border}`}>
                <MiniCalendar
                  selectedDate={formData.fecha}
                  onSelectDate={(fecha: string) =>
                    setFormData({ ...formData, fecha, hora: "" })
                  }
                  citasOcupadas={citasOcupadas}
                />
              </div>
            </div>

            {/* Servicio */}
            <div>
              <label className={`block ${textPrimary} mb-3 font-semibold`}>
                Servicio *
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto p-2">
                {serviciosActivos.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No hay servicios activos
                  </div>
                ) : (
                  serviciosActivos.map((servicio) => (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, servicioId: servicio.id })
                      }
                      className={`p-3 rounded-xl transition-all duration-200 text-left ${
                        formData.servicioId === servicio.id
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
                            {servicio.nombre}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              formData.servicioId === servicio.id
                                ? "text-white/90"
                                : "text-gray-500"
                            }`}
                          >
                            {servicio.duracion || 30} minutos
                          </div>
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: 700 }}>
                          ${servicio.precio?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              {servicioSeleccionado && (
                <div className="mt-2 p-3 rounded-lg bg-[#63E6BE]/10">
                  <p className={textSecondary} style={{ fontSize: "12px" }}>
                    {servicioSeleccionado.descripcion}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={textSecondary}
                      style={{ fontSize: "12px" }}
                    >
                      Duración: {servicioSeleccionado.duracion} minutos
                    </span>
                    <span className="text-[#63E6BE] font-bold">
                      ${servicioSeleccionado.precio.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className={`block ${textPrimary} mb-2 font-semibold`}>
                Notas (Opcional)
              </label>
              <Textarea
                value={formData.notas}
                onChange={(e) =>
                  setFormData({ ...formData, notas: e.target.value })
                }
                placeholder="Describe el motivo de tu consulta o información adicional..."
                className={`rounded-xl ${inputBorder} ${inputBg}`}
                rows={4}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
              >
                Agendar Cita
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
