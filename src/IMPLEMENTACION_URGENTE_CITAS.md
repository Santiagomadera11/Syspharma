# 🚨 Implementación Urgente - Módulo de Citas

## Cambios a Realizar en `/pages/Citas.tsx`

### 1. Actualizar Imports (Línea ~1-25)

```typescript
import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, Clock, Search, Edit, Trash2, CheckCircle, XCircle, User, ChevronLeft, ChevronRight, Filter, AlertCircle, Eye, CalendarDays, List, UserCircle, Stethoscope } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useDarkMode } from '../hooks/useDarkMode';
import { motion } from 'motion/react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useCitas, useServicios } from '../hooks/useEntities'; // ✅ AGREGAR
import { normalizarFecha, fechaAString, stringAFecha, mismaFecha } from '../utils/dateHelpers'; // ✅ AGREGAR
import CalendarioDisponibilidad from '../components/citas/CalendarioDisponibilidad';
```

### 2. Actualizar Estados del Componente (Línea ~70-130)

**BUSCAR:**
```typescript
// Servicios
const servicios = [
  { nombre: 'Consulta General', duracion: 30 },
  ...
];
```

**REEMPLAZAR CON:**
```typescript
// ✅ Usar hooks globales
const { items: citas, add: addCita, update: updateCita, remove: removeCita } = useCitas();
const { items: servicios } = useServicios();

// Servicios activos solamente
const serviciosActivos = useMemo(
  () => servicios.filter(s => s.estado === 'Activo'),
  [servicios]
);
```

### 3. Agregar Estados para Modal Nueva Cita (Después de estados existentes)

```typescript
// Estados para nueva cita
const [modalOpen, setModalOpen] = useState(false);
const [tipoDocumento, setTipoDocumento] = useState('');
const [numeroDocumento, setNumeroDocumento] = useState('');
const [nombreCliente, setNombreCliente] = useState('');
const [servicioSeleccionado, setServicioSeleccionado] = useState('');
const [fechaCitaSeleccionada, setFechaCitaSeleccionada] = useState<Date | null>(null);
const [horaSeleccionada, setHoraSeleccionada] = useState('');
const [notasCita, setNotasCita] = useState('');
const [detailModalOpen, setDetailModalOpen] = useState(false);
const [citaDetalle, setCitaDetalle] = useState<any>(null);
```

### 4. Horas Disponibles - Ocultar Reservadas (Nueva lógica)

**BUSCAR donde se definen las horas disponibles y REEMPLAZAR:**

```typescript
// Obtener horas disponibles para la fecha seleccionada
const horasDisponiblesParaFecha = useMemo(() => {
  if (!fechaCitaSeleccionada) return [];
  
  // Obtener TODAS las citas del día seleccionado (sin importar estado)
  const citasDelDia = citas.filter(c => {
    const citaFecha = typeof c.fecha === 'string' ? stringAFecha(c.fecha) : c.fecha;
    return mismaFecha(citaFecha, fechaCitaSeleccionada);
  });
  
  // Horas ya reservadas
  const horasReservadas = citasDelDia.map(c => c.hora);
  
  // Filtrar horas disponibles
  return HORARIOS_DIA.filter(hora => !horasReservadas.includes(hora));
}, [fechaCitaSeleccionada, citas]);
```

### 5. Modal Nueva Cita - Estructura Completa

**BUSCAR:** `{/* MODAL: Nueva Cita */}` o similar

**REEMPLAZAR CON:**

```tsx
{/* MODAL: Nueva Cita */}
<Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-2xl max-h-[90vh] overflow-y-auto`}>
    <DialogHeader>
      <DialogTitle className={`${textPrimary} text-2xl font-bold`}>Nueva Cita</DialogTitle>
    </DialogHeader>

    <div className="space-y-4 mt-4">
      {/* 🔴 SECCIÓN 1: Tipo y Número de Documento (AL INICIO) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block ${textPrimary} mb-2 font-semibold`}>Tipo de Documento *</label>
          <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
            <SelectTrigger className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}>
              <SelectValue placeholder="Selecciona tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="Cédula">Cédula</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={`block ${textPrimary} mb-2 font-semibold`}>Número de Documento *</label>
          <Input
            type="text"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
          />
        </div>
      </div>

      {/* SECCIÓN 2: Nombre del Cliente */}
      <div>
        <label className={`block ${textPrimary} mb-2 font-semibold`}>Nombre del Cliente *</label>
        <Input
          type="text"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
        />
      </div>

      {/* SECCIÓN 3: Servicio (DINÁMICO desde tabla) */}
      <div>
        <label className={`block ${textPrimary} mb-2 font-semibold`}>Servicio *</label>
        <Select value={servicioSeleccionado} onValueChange={setServicioSeleccionado}>
          <SelectTrigger className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}>
            <SelectValue placeholder="Selecciona un servicio" />
          </SelectTrigger>
          <SelectContent>
            {serviciosActivos.map(servicio => (
              <SelectItem key={servicio.id} value={servicio.id}>
                {servicio.nombre} - ${servicio.precio.toLocaleString()} ({servicio.duracion} min)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SECCIÓN 4: Fecha */}
      <div>
        <label className={`block ${textPrimary} mb-2 font-semibold`}>Fecha de la Cita *</label>
        <Input
          type="date"
          value={fechaCitaSeleccionada ? fechaAString(fechaCitaSeleccionada) : ''}
          onChange={(e) => {
            if (e.target.value) {
              setFechaCitaSeleccionada(stringAFecha(e.target.value));
              setHoraSeleccionada(''); // Resetear hora al cambiar fecha
            }
          }}
          min={fechaAString(new Date())}
          className={`h-12 rounded-xl ${inputBorder} ${inputBg}`}
        />
      </div>

      {/* SECCIÓN 5: Hora (Solo si hay fecha seleccionada) */}
      {fechaCitaSeleccionada && (
        <div>
          <label className={`block ${textPrimary} mb-2 font-semibold`}>
            Hora de la Cita * 
            {horasDisponiblesParaFecha.length === 0 && (
              <span className="text-red-500 text-sm ml-2">(No hay horas disponibles)</span>
            )}
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-2">
            {horasDisponiblesParaFecha.map(hora => (
              <button
                key={hora}
                onClick={() => setHoraSeleccionada(hora)}
                className={`
                  px-4 py-3 rounded-xl font-semibold text-sm transition-all
                  ${horaSeleccionada === hora 
                    ? 'bg-[#63E6BE] text-white shadow-lg scale-105' 
                    : 'bg-white dark:bg-gray-800 hover:bg-[#63E6BE]/10 border-2 border-gray-200 dark:border-gray-700 hover:border-[#63E6BE]'
                  }
                `}
              >
                {hora}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN 6: Notas */}
      <div>
        <label className={`block ${textPrimary} mb-2 font-semibold`}>Notas (Opcional)</label>
        <Textarea
          value={notasCita}
          onChange={(e) => setNotasCita(e.target.value)}
          placeholder="Agregar notas sobre la cita..."
          className={`rounded-xl ${inputBorder} ${inputBg}`}
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={() => setModalOpen(false)}
          className="flex-1 h-12 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCrearCita}
          className="flex-1 h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
        >
          Agendar Cita
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 6. Función para Crear Cita

```typescript
const handleCrearCita = () => {
  // Validaciones
  if (!tipoDocumento || !numeroDocumento) {
    toast.error('El tipo y número de documento son obligatorios');
    return;
  }

  if (!nombreCliente.trim()) {
    toast.error('El nombre del cliente es obligatorio');
    return;
  }

  if (!servicioSeleccionado) {
    toast.error('Debes seleccionar un servicio');
    return;
  }

  if (!fechaCitaSeleccionada) {
    toast.error('Debes seleccionar una fecha');
    return;
  }

  if (!horaSeleccionada) {
    toast.error('Debes seleccionar una hora');
    return;
  }

  // Obtener info del servicio
  const servicio = servicios.find(s => s.id === servicioSeleccionado);

  // Crear objeto de cita
  const nuevaCita = {
    id: `CITA-${Date.now()}`,
    fecha: fechaAString(fechaCitaSeleccionada),
    hora: horaSeleccionada,
    clienteId: numeroDocumento, // Usar número de documento como ID
    clienteNombre: nombreCliente,
    servicioId: servicioSeleccionado,
    servicioNombre: servicio?.nombre || '',
    estado: 'Pendiente' as const,
    notas: notasCita,
    createdAt: new Date().toISOString()
  };

  // Guardar con hook
  addCita(nuevaCita);

  // Limpiar formulario
  setTipoDocumento('');
  setNumeroDocumento('');
  setNombreCliente('');
  setServicioSeleccionado('');
  setFechaCitaSeleccionada(null);
  setHoraSeleccionada('');
  setNotasCita('');

  toast.success('¡Cita agendada exitosamente!', {
    style: { background: '#A7F3D0', color: '#065F46' }
  });

  setModalOpen(false);
};
```

### 7. Tabla de Citas - Agregar Botón Detalle

**BUSCAR:** La sección de botones de acciones en la tabla

**AGREGAR antes del botón de Editar:**

```tsx
<Button
  onClick={() => {
    setCitaDetalle(cita);
    setDetailModalOpen(true);
  }}
  className="h-8 w-8 p-0 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
  title="Ver detalle"
>
  <Eye className="w-4 h-4" />
</Button>
```

### 8. Modal de Detalle

```tsx
{/* MODAL: Detalle de Cita */}
<Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
  <DialogContent className={`${modalBg} rounded-2xl p-6 max-w-md`}>
    <DialogHeader>
      <DialogTitle className={`${textPrimary} text-2xl font-bold`}>Detalle de Cita</DialogTitle>
    </DialogHeader>

    {citaDetalle && (
      <div className="space-y-4 mt-4">
        <div>
          <label className={`block ${textSecondary} mb-1 text-sm`}>Cliente</label>
          <p className={`${textPrimary} font-semibold`}>{citaDetalle.clienteNombre}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block ${textSecondary} mb-1 text-sm`}>Fecha</label>
            <p className={`${textPrimary} font-semibold`}>
              {new Date(citaDetalle.fecha).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            <label className={`block ${textSecondary} mb-1 text-sm`}>Hora</label>
            <p className={`${textPrimary} font-semibold`}>{citaDetalle.hora}</p>
          </div>
        </div>

        <div>
          <label className={`block ${textSecondary} mb-1 text-sm`}>Servicio</label>
          <p className={`${textPrimary} font-semibold`}>{citaDetalle.servicioNombre}</p>
        </div>

        <div>
          <label className={`block ${textSecondary} mb-1 text-sm`}>Estado</label>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            citaDetalle.estado === 'Confirmada' ? 'bg-green-500/10 text-green-500' :
            citaDetalle.estado === 'Pendiente' ? 'bg-yellow-500/10 text-yellow-500' :
            citaDetalle.estado === 'Completada' ? 'bg-blue-500/10 text-blue-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {citaDetalle.estado}
          </span>
        </div>

        {citaDetalle.notas && (
          <div>
            <label className={`block ${textSecondary} mb-1 text-sm`}>Notas</label>
            <p className={`${textPrimary}`}>{citaDetalle.notas}</p>
          </div>
        )}

        <Button
          onClick={() => setDetailModalOpen(false)}
          className="w-full h-12 rounded-xl bg-[#63E6BE] hover:bg-[#5DD5BE] text-white font-semibold"
        >
          Cerrar
        </Button>
      </div>
    )}
  </DialogContent>
</Dialog>
```

### 9. Calendario - Mostrar Citas Creadas

**BUSCAR:** Donde se renderiza el calendario (celdas de días)

**AGREGAR después de mostrar el número del día:**

```tsx
{/* Mostrar citas del día */}
{citas
  .filter(c => {
    const citaFecha = typeof c.fecha === 'string' ? stringAFecha(c.fecha) : c.fecha;
    return citaFecha.getDate() === dia &&
           citaFecha.getMonth() === fechaActual.getMonth() &&
           citaFecha.getFullYear() === fechaActual.getFullYear();
  })
  .slice(0, 2) // Mostrar máximo 2 citas
  .map(cita => (
    <div 
      key={cita.id}
      className="text-xs bg-[#63E6BE]/20 px-1 rounded mt-1 truncate cursor-pointer hover:bg-[#63E6BE]/30"
      onClick={() => {
        setCitaDetalle(cita);
        setDetailModalOpen(true);
      }}
    >
      {cita.hora} - {cita.clienteNombre}
    </div>
  ))
}
```

## ✅ Checklist de Implementación

- [ ] Importar hooks useC itas y useServicios
- [ ] Importar funciones de dateHelpers
- [ ] Agregar estados para modal (tipo documento, número, etc.)
- [ ] Actualizar lógica de horas disponibles (ocultar reservadas)
- [ ] Implementar modal nueva cita completo
- [ ] Agregar función handleCrearCita
- [ ] Agregar botón de detalle en tabla
- [ ] Implementar modal de detalle
- [ ] Actualizar calendario para mostrar citas creadas

## 🎯 Resultado Esperado

1. ✅ Modal nueva cita pide tipo y número de documento
2. ✅ Selector de servicios es dinámico (desde tabla de admin)
3. ✅ Las horas ya reservadas NO aparecen
4. ✅ Se puede seleccionar hora sin problemas
5. ✅ Las citas creadas aparecen en el calendario
6. ✅ Botón de detalle funciona en la tabla
7. ✅ No hay problemas con fechas (día correcto)
