# 🔧 Correcciones Críticas Pendientes - SysPharma

## 1. ✅ CATEGORIAS
- Modal ya tiene tamaño correcto (`sm:max-w-[540px]`)
- **ESTADO:** Completado

## 2. ✅ PROVEEDORES
- Dejar tal cual
- **ESTADO:** Completado

## 3. ⏳ VENTAS

### Modal "Cerrar Caja"
- Ya tiene `maxWidth: '700px'`
- **ESTADO:** Completado

### Modal "Nueva Venta" - PENDIENTE
**Requiere:**
- Mostrar productos desde `productosStorage`
- Agregar paginador (6 productos por página)
- Agregar filtro por categorías (desde `categoriasStorage`)
- Mantener input de búsqueda por nombre o código

**Cambios necesarios:**
```typescript
// Estados agregados:
const [categoriaFiltro, setCategoriaFiltro] = useState('');
const [paginaProductos, setPaginaProductos] = useState(1);
const productosPerPage = 6;

// Importar hooks:
import { useProductos, useCategorias } from '../hooks/useEntities';
const { items: productos } = useProductos();
const { items: categorias } = useCategorias();

// Actualizar productosFiltrados:
const productosFiltrados = useMemo(() => {
  let filtered = productos.filter(p => p.estado === 'Activo');
  
  if (categoriaFiltro) {
    filtered = filtered.filter(p => p.categoria === categoriaFiltro);
  }
  
  if (busquedaProducto) {
    filtered = filtered.filter(p =>
      p.nombreComercial?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.nombreGenerico?.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(busquedaProducto.toLowerCase())
    );
  }
  
  return filtered;
}, [productos, categoriaFiltro, busquedaProducto]);

// Paginación
const totalPaginasProductos = Math.ceil(productosFiltrados.length / productosPerPage);
const productosPaginados = productosFiltrados.slice(
  (paginaProductos - 1) * productosPerPage,
  paginaProductos * productosPerPage
);
```

**UI Cambios (línea ~1350-1400):**
- Cambiar dropdown por grid de cards
- Agregar selector de categorías antes del buscador
- Mostrar productos en grid 3x2
- Agregar paginador

## 4. 🔴 ARREGLO GLOBAL - FECHAS DE CALENDARIOS - CRÍTICO

**Problema:** Al seleccionar fecha 12, aparece 11
**Causa:** Zona horaria UTC vs local

**Solución Global:**
```typescript
// Función helper para normalizar fechas
const normalizarFecha = (fecha: Date): Date => {
  const normalized = new Date(fecha);
  normalized.setHours(12, 0, 0, 0); // Fijar a mediodía para evitar problemas de zona horaria
  return normalized;
};

// Al crear fechas desde string ISO:
const fecha = new Date(isoString);
const fechaLocal = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);

// Al guardar fechas:
const guardarFecha = (fecha: Date): string => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
```

**Archivos a corregir:**
- `/pages/Citas.tsx` - Calendario de citas
- `/pages/MisCitas.tsx` - Calendario cliente
- `/pages/Compras.tsx` - Si tiene calendario
- Cualquier componente que use `<input type="date">`

## 5. 🔴 CITAS - MÚLTIPLES CAMBIOS CRÍTICOS

### A. Tabla de Citas - Agregar botón Detalle
**Línea:** ~línea donde están los botones de acciones

```tsx
<Button
  onClick={() => openDetailModal(cita)}
  className="h-8 w-8 p-0 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
>
  <Eye className="w-4 h-4" />
</Button>
```

### B. Modal Nueva Cita - Tipo de Documento
**Agregar AL INICIO del formulario (primera sección):**

```tsx
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
```

### C. Selector de Servicios - Dinámico
**Cambiar hardcoded por:**

```typescript
import { useServicios } from '../hooks/useEntities';
const { items: servicios } = useServicios();

// En el Select:
<SelectContent>
  {servicios.filter(s => s.estado === 'Activo').map(servicio => (
    <SelectItem key={servicio.id} value={servicio.id}>
      {servicio.nombre} - ${servicio.precio.toLocaleString()}
    </SelectItem>
  ))}
</SelectContent>
```

### D. Selección de Horas - CRÍTICO

**Problema:** No deja seleccionar horas
**Solución:** Verificar que el evento onClick no esté bloqueado

```tsx
{horasDisponibles.map(hora => {
  const estaOcupada = citasDelDia.some(c => c.hora === hora);
  
  return (
    <button
      key={hora}
      onClick={() => !estaOcupada && setHoraSeleccionada(hora)}
      disabled={estaOcupada}
      className={`
        px-4 py-3 rounded-xl font-semibold text-sm transition-all
        ${horaSeleccionada === hora 
          ? 'bg-[#63E6BE] text-white' 
          : estaOcupada
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
            : 'bg-white dark:bg-gray-800 hover:bg-[#63E6BE]/10 border-2 border-gray-200 dark:border-gray-700'
        }
      `}
    >
      {hora}
    </button>
  );
})}
```

### E. Ocultar Horas Reservadas - MUY IMPORTANTE

**Lógica:**
```typescript
// Obtener TODAS las citas del día (sin importar estado)
const citasDelDia = citas.filter(c => {
  const citaFecha = new Date(c.fecha);
  return citaFecha.toDateString() === fechaSeleccionada.toDateString();
});

// Filtrar horas disponibles
const horasDisponibles = HORARIOS_DIA.filter(hora => {
  // Excluir horas ya reservadas en cualquier cita
  return !citasDelDia.some(c => c.hora === hora);
});
```

**IMPORTANTE:** Esto debe aplicarse en:
- Vista Admin/Empleado (Citas.tsx)
- Vista Cliente (MisCitas.tsx)

### F. Calendario Admin/Empleado - Mostrar Citas Creadas

**Agregar eventos al calendario:**
```typescript
// En el renderizado del calendario
const citasDelMes = citas.filter(c => {
  const citaFecha = new Date(c.fecha);
  return citaFecha.getMonth() === fechaActual.getMonth() &&
         citaFecha.getFullYear() === fechaActual.getFullYear();
});

// En cada celda del día:
{citasDelMes
  .filter(c => new Date(c.fecha).getDate() === dia)
  .map(cita => (
    <div 
      key={cita.id}
      className="text-xs bg-[#63E6BE]/20 px-1 rounded mt-1 truncate"
    >
      {cita.hora} - {cita.cliente}
    </div>
  ))
}
```

## 📋 Orden de Implementación Sugerido

1. **URGENTE:** Arreglo global de fechas (afecta todo)
2. **URGENTE:** Selección de horas en Citas (no funciona)
3. **URGENTE:** Ocultar horas reservadas (funcionalidad clave)
4. **ALTA:** Modal nueva cita con tipo documento y servicios dinámicos
5. **MEDIA:** Botón detalle en tabla de citas
6. **MEDIA:** Calendario admin muestra citas
7. **BAJA:** Modal Nueva Venta con productos paginados

## 🔍 Búsqueda Rápida de Código

### Para Fechas:
```bash
Buscar: "new Date(" en todos los archivos
Buscar: "toISOString()" 
Buscar: "type=\"date\""
```

### Para Horas en Citas:
```bash
Archivo: /pages/Citas.tsx
Buscar: "horasDisponibles"
Buscar: "onClick"
Buscar: "setHoraSeleccionada"
```

### Para Modal Nueva Venta:
```bash
Archivo: /pages/Ventas.tsx
Línea: ~1350 (sección de productos)
Buscar: "Añadir Productos"
```
