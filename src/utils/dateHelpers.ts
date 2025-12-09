/**
 * Utilidades para manejo correcto de fechas
 * Soluciona problemas de zona horaria en calendarios
 */

/**
 * Normaliza una fecha para evitar problemas de zona horaria
 * Fija la hora a mediodía (12:00) para que la fecha sea consistente
 */
export const normalizarFecha = (fecha: Date): Date => {
  const normalized = new Date(fecha);
  normalized.setHours(12, 0, 0, 0);
  return normalized;
};

/**
 * Convierte una fecha a string en formato YYYY-MM-DD (local, no UTC)
 */
export const fechaAString = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Convierte un string ISO o YYYY-MM-DD a Date local (sin problemas de zona horaria)
 */
export const stringAFecha = (fechaStr: string): Date => {
  // Si es formato YYYY-MM-DD
  if (fechaStr.includes('-') && !fechaStr.includes('T')) {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }
  
  // Si es ISO string
  const fecha = new Date(fechaStr);
  return normalizarFecha(fecha);
};

/**
 * Compara si dos fechas son el mismo día (ignora hora)
 */
export const mismaFecha = (fecha1: Date, fecha2: Date): boolean => {
  return (
    fecha1.getFullYear() === fecha2.getFullYear() &&
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getDate() === fecha2.getDate()
  );
};

/**
 * Obtiene la fecha actual normalizada (mediodía, sin problemas de hora)
 */
export const fechaHoy = (): Date => {
  return normalizarFecha(new Date());
};

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY)
 */
export const formatearFecha = (fecha: Date | string): string => {
  const f = typeof fecha === 'string' ? stringAFecha(fecha) : fecha;
  const day = String(f.getDate()).padStart(2, '0');
  const month = String(f.getMonth() + 1).padStart(2, '0');
  const year = f.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha para mostrar (Día DD de Mes YYYY)
 */
export const formatearFechaLarga = (fecha: Date | string): string => {
  const f = typeof fecha === 'string' ? stringAFecha(fecha) : fecha;
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  return `${dias[f.getDay()]} ${f.getDate()} de ${meses[f.getMonth()]} ${f.getFullYear()}`;
};
