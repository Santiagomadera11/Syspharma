import { useState } from 'react';
import { ChevronLeft, ChevronRight, XCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

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

interface CalendarioDisponibilidadProps {
  empleado: Empleado;
  onToggleDia: (fecha: Date) => void;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  bgCard: string;
  border: string;
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarioDisponibilidad({
  empleado,
  onToggleDia,
  isDark,
  textPrimary,
  textSecondary,
  bgCard,
  border
}: CalendarioDisponibilidadProps) {
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
    const fechaISO = fecha.toISOString().split('T')[0];
    return empleado.diasNoDisponibles?.includes(fechaISO) || false;
  };

  return (
    <div className={`${bgCard} rounded-xl p-6 border ${border} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${textPrimary}`} style={{ fontSize: '18px', fontWeight: 700 }}>
          Días No Disponibles - {empleado.nombre}
        </h3>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() - 1, 1))}
            className={`h-9 w-9 p-0 rounded-lg ${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className={textPrimary} style={{ fontSize: '15px', fontWeight: 600, minWidth: '150px', textAlign: 'center' }}>
            {MESES[fechaCalendario.getMonth()]} {fechaCalendario.getFullYear()}
          </span>
          <Button
            onClick={() => setFechaCalendario(new Date(fechaCalendario.getFullYear(), fechaCalendario.getMonth() + 1, 1))}
            className={`h-9 w-9 p-0 rounded-lg ${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-gray-200 hover:bg-gray-300 text-[#3D4756]'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <p className={`${textSecondary} mb-4`} style={{ fontSize: '13px' }}>
        Haz clic en un día para marcarlo como no disponible. Los días marcados aparecerán en rojo con una X.
      </p>

      {/* Calendario mensual */}
      <div>
        {/* Encabezado días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="text-center py-2">
              <span className={textSecondary} style={{ fontSize: '12px', fontWeight: 600 }}>
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
            const esHoy = dia.toDateString() === new Date().toDateString();

            return (
              <motion.div
                key={dia.toISOString()}
                whileHover={{ scale: 1.05 }}
                onClick={() => onToggleDia(dia)}
                className={`aspect-square rounded-xl p-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                  esNoDisponible
                    ? 'bg-red-500 text-white shadow-md'
                    : esHoy
                    ? `${isDark ? 'bg-[#1f6feb1a]' : 'bg-blue-50'} border-2 border-[#14B8A6]`
                    : `${isDark ? 'hover:bg-[#161b22]' : 'hover:bg-gray-100'} border ${border}`
                }`}
              >
                <span style={{ fontSize: '13px', fontWeight: esHoy || esNoDisponible ? 700 : 500 }}>
                  {dia.getDate()}
                </span>
                {esNoDisponible && (
                  <XCircle className="w-4 h-4 mt-1" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-[#161b22]' : 'bg-gray-50'}`}>
        <p className={textSecondary} style={{ fontSize: '12px' }}>
          <strong>Días marcados como no disponibles:</strong> {empleado.diasNoDisponibles.length === 0 ? 'Ninguno' : empleado.diasNoDisponibles.length}
        </p>
      </div>
    </div>
  );
}
