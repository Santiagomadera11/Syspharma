import { useState } from "react";
import { fechaAString } from "../../utils/dateHelpers";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "motion/react";
import {
  fechaAString,
  stringAFecha,
  mismaFecha,
} from "../../utils/dateHelpers";

interface Empleado {
  id: string;
  nombre: string;
  especialidad: string;
  foto?: string;
  disponibilidad: {
    [key: string]: string[];
  };
  diasNoDisponibles: string[];
}

interface CalendarioSeleccionFechaProps {
  fechaSeleccionada: Date | null;
  empleadoSeleccionado: Empleado | null;
  onSelectFecha: (fecha: Date) => void;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  border: string;
}

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

export default function CalendarioSeleccionFecha({
  fechaSeleccionada,
  empleadoSeleccionado,
  onSelectFecha,
  isDark,
  textPrimary,
  textSecondary,
  border,
}: CalendarioSeleccionFechaProps) {
  const [fechaCalendario, setFechaCalendario] = useState(new Date());

  const getDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();

    const dias: (Date | null)[] = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }

    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(new Date(año, mes, i));
    }

    return dias;
  };

  const esDiaNoDisponible = (fecha: Date) => {
    if (!empleadoSeleccionado) return false;
    const fechaISO = fechaAString(fecha);
    return empleadoSeleccionado.diasNoDisponibles?.includes(fechaISO) || false;
  };

  const esDiaPasado = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  const esFechaSeleccionada = (fecha: Date) => {
    if (!fechaSeleccionada) return false;
    return mismaFecha(fecha, fechaSeleccionada);
  };

  return (
    <div className={`rounded-xl p-4 border-2 ${border}`}>
      {/* Navegación del mes */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          onClick={() =>
            setFechaCalendario(
              new Date(
                fechaCalendario.getFullYear(),
                fechaCalendario.getMonth() - 1,
                1
              )
            )
          }
          className={`h-9 w-9 p-0 rounded-lg ${
            isDark
              ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
              : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span
          className={textPrimary}
          style={{
            fontSize: "15px",
            fontWeight: 600,
            minWidth: "150px",
            textAlign: "center",
          }}
        >
          {MESES[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
        </span>
        <Button
          type="button"
          onClick={() =>
            setFechaCalendario(
              new Date(
                fechaCalendario.getFullYear(),
                fechaCalendario.getMonth() + 1,
                1
              )
            )
          }
          className={`h-9 w-9 p-0 rounded-lg ${
            isDark
              ? "bg-[#161b22] hover:bg-[#1f6feb1a] text-white"
              : "bg-gray-200 hover:bg-gray-300 text-[#3D4756]"
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Encabezado días de la semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DIAS_SEMANA.map((dia) => (
          <div key={dia} className="text-center py-2">
            <span
              className={textSecondary}
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              {dia}
            </span>
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2">
        {getDiasDelMes(fechaCalendario).map((dia, index) => {
          if (!dia) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const esNoDisponible = esDiaNoDisponible(dia);
          const esPasado = esDiaPasado(dia);
          const esSeleccionado = esFechaSeleccionada(dia);
          const esHoy = dia.toDateString() === new Date().toDateString();
          const esDisabled = esPasado || esNoDisponible;

          return (
            <motion.button
              key={dia.toISOString()}
              type="button"
              whileHover={!esDisabled ? { scale: 1.05 } : {}}
              onClick={() => {
                if (!esDisabled) {
                  onSelectFecha(dia);
                }
              }}
              disabled={esDisabled}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                esSeleccionado
                  ? "bg-[#63E6BE] text-white shadow-lg scale-105 font-bold"
                  : esNoDisponible
                  ? "bg-red-500 text-white cursor-not-allowed opacity-75"
                  : esPasado
                  ? "opacity-30 cursor-not-allowed text-gray-400"
                  : esHoy
                  ? `${
                      isDark ? "bg-[#1f6feb1a]" : "bg-blue-50"
                    } border-2 border-[#63E6BE] ${textPrimary}`
                  : `${
                      isDark ? "hover:bg-[#161b22]" : "hover:bg-gray-100"
                    } border ${border} ${textPrimary}`
              }`}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: esHoy || esSeleccionado ? 700 : 500,
                }}
              >
                {dia.getDate()}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-[#63E6BE]" />
          <span className={textSecondary}>Seleccionado</span>
        </div>
        {empleadoSeleccionado &&
          empleadoSeleccionado.diasNoDisponibles.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-red-500" />
              <span className={textSecondary}>No disponible</span>
            </div>
          )}
        <div className="flex items-center gap-1.5">
          <div
            className={`w-5 h-5 rounded border-2 border-[#63E6BE] ${
              isDark ? "bg-[#1f6feb1a]" : "bg-blue-50"
            }`}
          />
          <span className={textSecondary}>Hoy</span>
        </div>
      </div>

      {/* Advertencia si hay médico seleccionado con días no disponibles */}
      {empleadoSeleccionado &&
        empleadoSeleccionado.diasNoDisponibles.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-red-600 dark:text-red-400 text-xs">
              <strong>{empleadoSeleccionado.nombre}</strong> no está disponible
              en {empleadoSeleccionado.diasNoDisponibles.length} día
              {empleadoSeleccionado.diasNoDisponibles.length > 1 ? "s" : ""}{" "}
              (marcado
              {empleadoSeleccionado.diasNoDisponibles.length > 1 ? "s" : ""} en
              rojo).
            </p>
          </div>
        )}
    </div>
  );
}
