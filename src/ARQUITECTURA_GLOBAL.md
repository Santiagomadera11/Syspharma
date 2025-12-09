# 🏗️ Arquitectura Global de Sincronización - SysPharma

## 📋 Resumen

Sistema completo de sincronización automática en tiempo real para TODAS las entidades de la aplicación.

## 🎯 Principios Globales

### 1. **Un Hook por Entidad**

Cada entidad tiene su propio hook que maneja TODO:

- Carga de datos
- Sincronización automática
- Métodos CRUD
- Actualización en tiempo real

### 2. **Dependencias Automáticas**

Cuando una entidad depende de otra (ej: Productos → Categorías):

- Los selects se actualizan automáticamente
- Los formularios muestran opciones nuevas al instante
- Las relaciones se mantienen sincronizadas

### 3. **Persistencia Garantizada**

- Los datos NUNCA se pierden al recargar
- localStorage se actualiza automáticamente
- Eventos personalizados notifican a todos los componentes

---

## 🔧 Hooks Disponibles

### Importación

```typescript
import {
  useUsuarios,
  useProductos,
  useCategorias,
  useProveedores,
  useCompras,
  useVentas,
  usePedidos,
  useCitas,
  useServicios,
  useAllEntities, // Hook combinado para múltiples entidades
} from "../hooks/useEntities";
```

### Estructura de cada Hook

Todos los hooks retornan:

```typescript
{
  items: T[],        // Array de elementos
  add: (item) => {}, // Agregar nuevo
  update: (id, data) => {}, // Actualizar existente
  remove: (id) => {}, // Eliminar
  refresh: () => {},  // Forzar recarga
  setItems: (items) => {} // Setear directamente (usar con cuidado)
}
```

---

## 📝 Patrón de Implementación

### ❌ ANTES (Manual, No usar)

```typescript
const [productos, setProductos] = useState<Producto[]>([]);

useEffect(() => {
  const data = productosStorage.getAll();
  setProductos(data);
}, []);

const handleAdd = (producto: Producto) => {
  productosStorage.add(producto);
  const updated = productosStorage.getAll();
  setProductos(updated);
};
```

### ✅ DESPUÉS (Automático, Usar siempre)

```typescript
const {
  items: productos,
  add,
  update,
  remove,
} = useProductos();

const handleAdd = (producto: Producto) => {
  add(producto); // ¡Eso es todo! Se sincroniza automáticamente
};
```

---

## 🎨 Casos de Uso por Componente

### 1. Vista de Tabla/Lista (CRUD Básico)

```typescript
export default function Productos() {
  const { items: productos, add, update, remove } = useProductos();
  const { items: categorias } = useCategorias(); // Para el selector

  return (
    <div>
      {/* Tabla de productos - se actualiza automáticamente */}
      {productos.map(producto => (
        <Row key={producto.id} data={producto} />
      ))}

      {/* Selector de categoría - se actualiza si se crea una nueva */}
      <Select>
        {categorias.map(cat => (
          <SelectItem key={cat.id} value={cat.nombre}>
            {cat.nombre}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
```

### 2. Formulario de Creación

```typescript
function FormularioProducto() {
  const { add } = useProductos();
  const { items: categorias } = useCategorias();
  const [formData, setFormData] = useState({...});

  const handleSubmit = () => {
    const nuevoProducto = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      createdAt: new Date().toISOString()
    };

    add(nuevoProducto); // ✅ Se sincroniza en TODA la app
    toast.success('Producto creado');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Categorías siempre actualizadas */}
      <Select value={formData.categoria}>
        {categorias
          .filter(c => c.estado === 'Activo')
          .map(cat => (
            <SelectItem key={cat.id} value={cat.nombre}>
              {cat.nombre}
            </SelectItem>
          ))
        }
      </Select>
    </form>
  );
}
```

### 3. Dashboard con Múltiples Entidades

```typescript
function Dashboard() {
  const { items: productos } = useProductos();
  const { items: ventas } = useVentas();
  const { items: pedidos } = usePedidos();
  const { items: citas } = useCitas();

  // Todas se actualizan automáticamente en tiempo real
  const estadisticas = useMemo(() => ({
    totalProductos: productos.length,
    totalVentas: ventas.reduce((sum, v) => sum + v.total, 0),
    pedidosPendientes: pedidos.filter(p => p.estado === 'Pendiente').length,
    citasHoy: citas.filter(c => /* hoy */).length
  }), [productos, ventas, pedidos, citas]);

  return <div>{/* Estadísticas siempre sincronizadas */}</div>;
}
```

### 4. Vista de Cliente (Filtrada por Usuario)

```typescript
function MisPedidos() {
  const { user } = useAuth();
  const { items: pedidos } = usePedidos();

  const misPedidos = useMemo(
    () => pedidos.filter(p => p.clienteId === user?.id),
    [pedidos, user]
  );

  return (
    <div>
      {misPedidos.map(pedido => (
        <PedidoCard key={pedido.id} pedido={pedido} />
      ))}
    </div>
  );
}
```

---

## 🔗 Relaciones Entre Entidades

### Productos ← Categorías

```typescript
// Cuando se crea una categoría nueva
function FormularioCategoria() {
  const { add } = useCategorias();

  const handleSubmit = () => {
    add(nuevaCategoria);
    // ✅ Automáticamente disponible en:
    //    - Formulario de productos
    //    - Filtros de productos
    //    - Edición de productos
    //    - Catálogo de clientes
  };
}
```

### Pedidos ← Productos + Usuarios

```typescript
function CrearPedido() {
  const { add } = usePedidos();
  const { items: productos } = useProductos(); // Siempre actualizados
  const { items: usuarios } = useUsuarios(); // Siempre actualizados

  const handleSubmit = () => {
    const nuevoPedido = {
      id: generateId(),
      productos: productosSeleccionados, // De productos actuales
      clienteId: user.id,
      clienteNombre: user.nombre,
      // ...
    };

    add(nuevoPedido);
    // ✅ Visible inmediatamente en:
    //    - Panel de admin (todos los pedidos)
    //    - Vista de empleado
    //    - "Mis Pedidos" del cliente
  };
}
```

### Citas ← Servicios + Usuarios

```typescript
function AgendarCita() {
  const { add } = useCitas();
  const { items: servicios } = useServicios(); // Actualizados
  const { user } = useAuth();

  const handleSubmit = () => {
    const nuevaCita = {
      id: generateId(),
      servicioId: servicioSeleccionado.id,
      servicioNombre: servicioSeleccionado.nombre,
      clienteId: user.id,
      clienteNombre: user.nombre,
      // ...
    };

    add(nuevaCita);
    // ✅ Sincronizado en:
    //    - Dashboard admin
    //    - Panel empleado
    //    - "Mis Citas" cliente
  };
}
```

---

## 🚀 Flujo de Sincronización

```
1. Usuario crea/edita/elimina dato
         ↓
2. Hook llama a storage.add/update/delete
         ↓
3. localStorage se actualiza
         ↓
4. Se dispara evento CustomEvent('localStorageUpdated')
         ↓
5. TODOS los componentes con ese hook escuchan el evento
         ↓
6. Se recargan automáticamente los datos
         ↓
7. UI se actualiza en TODOS los lugares
```

---

## ✅ Checklist de Implementación

### Para Cada Componente CRUD:

- [ ] Importar el hook correspondiente
- [ ] Reemplazar `useState` + `useEffect` manual con el hook
- [ ] Usar `add/update/remove` en lugar de llamar a storage directamente
- [ ] Eliminar código de sincronización manual
- [ ] Verificar que los selects usen hooks para opciones dinámicas

### Para Formularios con Dependencias:

- [ ] Importar hooks de todas las entidades relacionadas
- [ ] Usar `items` del hook para poblar selects
- [ ] NO hardcodear listas de opciones
- [ ] Filtrar por `estado === 'Activo'` si aplica

### Para Dashboards/Reportes:

- [ ] Usar hooks para todas las entidades que se muestren
- [ ] Envolver cálculos en `useMemo` con dependencias de items
- [ ] NO usar datos hardcodeados o mockups

---

## 🎯 Reglas Globales Obligatorias

### 1. **NUNCA usar localStorage directamente**

❌ `localStorage.getItem('syspharma_productos')`
✅ `const { items: productos } = useProductos()`

### 2. **NUNCA setear estado manualmente después de CRUD**

❌

```typescript
productosStorage.add(producto);
setProductos([...productos, producto]);
```

✅

```typescript
add(producto); // El hook maneja todo
```

### 3. **SIEMPRE usar hooks para selects dinámicos**

❌

```typescript
const categorias = ["Analgésicos", "Antibióticos"];
```

✅

```typescript
const { items: categorias } = useCategorias();
```

### 4. **SIEMPRE filtrar por estado activo en selects**

```typescript
const categoriasActivas = categorias.filter(
  (c) => c.estado === "Activo",
);
```

### 5. **SIEMPRE generar IDs únicos**

```typescript
const nuevoId = Math.random().toString(36).substr(2, 9);
// O mejor: usar una función utilitaria
const nuevoId = generateUniqueId();
```

---

## 🔍 Ejemplo Completo: CRUD de Productos

```typescript
import { useProductos, useCategorias } from '../hooks/useEntities';

export default function Productos() {
  const { items: productos, add, update, remove } = useProductos();
  const { items: categorias } = useCategorias();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [formData, setFormData] = useState({
    nombreComercial: '',
    categoria: '',
    stock: 0,
    precio: 0,
    // ...
  });

  // Categorías activas para el selector
  const categoriasActivas = useMemo(
    () => categorias.filter(c => c.estado === 'Activo'),
    [categorias]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editando) {
      // Actualizar
      update(editando.id, formData);
      toast.success('Producto actualizado');
    } else {
      // Crear
      const nuevoProducto = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        estado: 'Activo' as const,
        createdAt: new Date().toISOString()
      };
      add(nuevoProducto);
      toast.success('Producto creado');
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    remove(id);
    toast.success('Producto eliminado');
  };

  return (
    <div>
      {/* Botón crear */}
      <Button onClick={() => { resetForm(); setModalOpen(true); }}>
        Nuevo Producto
      </Button>

      {/* Tabla */}
      <table>
        <tbody>
          {productos.map(producto => (
            <tr key={producto.id}>
              <td>{producto.nombreComercial}</td>
              <td>{producto.categoria}</td>
              <td>
                <Button onClick={() => { setEditando(producto); setFormData(producto); setModalOpen(true); }}>
                  Editar
                </Button>
                <Button onClick={() => handleDelete(producto.id)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit}>
          <Input
            value={formData.nombreComercial}
            onChange={e => setFormData({...formData, nombreComercial: e.target.value})}
          />

          {/* Select dinámico de categorías */}
          <Select value={formData.categoria} onValueChange={val => setFormData({...formData, categoria: val})}>
            {categoriasActivas.map(cat => (
              <SelectItem key={cat.id} value={cat.nombre}>
                {cat.nombre}
              </SelectItem>
            ))}
          </Select>

          <Button type="submit">
            {editando ? 'Actualizar' : 'Crear'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
```

---

## 🧪 Testing de Sincronización

Para probar que todo funciona:

1. **Test básico:**
   - Crear un producto desde Admin
   - Ver que aparece en vista de Empleado
   - Ver que aparece en Catálogo de Cliente

2. **Test de dependencias:**
   - Crear una categoría nueva
   - Abrir formulario de producto
   - Verificar que la categoría está en el select

3. **Test de actualización:**
   - Editar stock de un producto
   - Ver que se actualiza en dashboard
   - Ver que se actualiza en catálogo cliente

4. **Test de recarga:**
   - Crear varios elementos
   - Recargar página (F5)
   - Verificar que todos los datos persisten

5. **Test multi-pestaña:**
   - Abrir app en 2 pestañas
   - Crear algo en pestaña 1
   - Verificar que aparece en pestaña 2

---

## 📚 Resumen de Componentes a Actualizar

### ✅ Ya Actualizados:

- Dashboard (Inicio) - Usa hooks de sincronización

### 🔄 Pendientes de Actualizar:

- `/pages/Usuarios.tsx` → useUsuarios()
- `/pages/Productos.tsx` → useProductos() + useCategorias()
- `/pages/Categorias.tsx` → useCategorias()
- `/pages/Proveedores.tsx` → useProveedores()
- `/pages/Compras.tsx` → useCompras() + useProveedores() + useProductos()
- `/pages/Ventas.tsx` → useVentas() + useProductos()
- `/pages/Pedidos.tsx` → usePedidos() + useProductos()
- `/pages/Citas.tsx` → useCitas() + useServicios()
- `/pages/Servicios.tsx` → useServicios()
- `/pages/MisPedidos.tsx` → usePedidos()
- `/pages/MisCitas.tsx` → useCitas()
- `/pages/CatalogoCliente.tsx` → useProductos() + useCategorias()
- `/pages/ProductosCliente.tsx` → useProductos()

---

## 🎓 Conclusión

Esta arquitectura garantiza que:

✅ **Todos los datos persisten** - No se pierden al recargar
✅ **Sincronización automática** - Todos los componentes se actualizan
✅ **Dependencias resueltas** - Categorías nuevas aparecen en productos
✅ **Código limpio** - No más useEffect manuales
✅ **Escalable** - Fácil agregar nuevas entidades
✅ **Consistente** - Misma lógica en toda la app

**Usa siempre los hooks. Nunca localStorage directamente.**