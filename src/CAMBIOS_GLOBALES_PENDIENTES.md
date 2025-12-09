# 📋 Cambios Globales Pendientes - SysPharma

## ✅ COMPLETADO

1. ✅ **Registro con Tipo de Documento** - Agregado selector de tipo documento en /pages/Register.tsx
2. ✅ **Sistema de Roles en localStorage** - Agregados tipos e interfaces para Rol en localStorage.ts
3. ✅ **Hook useRoles()** - Agregado en /hooks/useEntities.ts

## 🔨 PENDIENTE DE IMPLEMENTAR

### 1. Agregar rolesStorage a localStorage.ts

Después de `serviciosStorage`, agregar:

```typescript
// CRUD para Roles
export const rolesStorage = {
  getAll: (): Rol[] => getItem(KEYS.ROLES, INITIAL_DATA.ROLES),
  save: (roles: Rol[]): void => setItem(KEYS.ROLES, roles),
  add: (rol: Rol): Rol[] => {
    const roles = rolesStorage.getAll();
    const newRoles = [...roles, rol];
    rolesStorage.save(newRoles);
    return newRoles;
  },
  update: (id: string, rolData: Partial<Rol>): Rol[] => {
    const roles = rolesStorage.getAll();
    const newRoles = roles.map(r => r.id === id ? { ...r, ...rolData } : r);
    rolesStorage.save(newRoles);
    return newRoles;
  },
  delete: (id: string): Rol[] => {
    const roles = rolesStorage.getAll();
    const newRoles = roles.filter(r => r.id !== id);
    rolesStorage.save(newRoles);
    return newRoles;
  },
};
```

Y en `initializeLocalStorage()` agregar:
```typescript
if (!localStorage.getItem(KEYS.ROLES)) {
  setItem(KEYS.ROLES, INITIAL_DATA.ROLES);
}
```

### 2. Actualizar User interface en localStorage.ts

Agregar campos faltantes:

```typescript
export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: 'Administrador' | 'Empleado' | 'Cliente';
  activo: boolean;
  telefono: string;
  tipoDocumento?: string;  // ✅ AGREGAR
  numeroDocumento?: string; // ✅ AGREGAR
  createdAt: string;
}
```

### 3. Actualizar INITIAL_DATA.USERS en localStorage.ts

Agregar tipo y número de documento a cada usuario:

```typescript
USERS: [
  {
    id: '1',
    nombre: 'Carlos Administrador',
    email: 'admin@syspharma.com',
    password: 'admin123',
    rol: 'Administrador' as const,
    activo: true,
    telefono: '3001234567',
    tipoDocumento: 'Cédula',  // ✅ AGREGAR
    numeroDocumento: '1001234567', // ✅ AGREGAR
    createdAt: new Date().toISOString(),
  },
  // ... mismo para empleado y cliente
]
```

### 4. Actualizar /pages/Usuarios.tsx

#### 4.1 Agregar hook de roles y limpiar imports:

```typescript
import { useUsuarios, useRoles } from '../hooks/useEntities';

export default function Usuarios({ user }: UsuariosProps) {
  const { items: usuarios, add: addUsuario, update: updateUsuario, remove: removeUsuario } = useUsuarios();
  const { items: roles } = useRoles();
  
  // Roles activos para el selector
  const rolesActivos = useMemo(
    () => roles.filter(r => r.estado === 'Activo'),
    [roles]
  );
```

#### 4.2 Actualizar tabla para mostrar documento completo:

Buscar la columna de documento y cambiar a:

```jsx
<td className={`px-6 py-4 whitespace-nowrap text-sm ${textPrimary}`}>
  {usuario.tipoDocumento} - {usuario.numeroDocumento}
</td>
```

#### 4.3 Actualizar modal EDITAR para mostrar contraseña actual:

En el campo de contraseña del modal de edición:

```jsx
<Input
  type={showPassword ? 'text' : 'password'}
  value={selectedUsuario?.password || ''}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  placeholder="••••••••"
  className="..."
/>
```

#### 4.4 Actualizar modal CREAR con selector de roles dinámico:

```jsx
<Select 
  value={formData.rol} 
  onValueChange={(value) => handleChange('rol', value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona un rol" />
  </SelectTrigger>
  <SelectContent>
    {rolesActivos.map(rol => (
      <SelectItem key={rol.id} value={rol.nombre}>
        {rol.nombre}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### 5. CORREGIR TAMAÑOS DE MODALES GLOBALMENTE

Buscar en TODOS los archivos `.tsx` las instancias de:

```jsx
<DialogContent className="...">
```

Y asegurarse que tienen:
- `max-w-md` → modales pequeños (login, confirmaciones)
- `max-w-xl` → modales medianos (formularios simples)
- `max-w-2xl` → modales grandes (formularios complejos)
- `max-w-4xl` → modales extra grandes (tablas, listas)

**NUNCA** usar `w-full` o `max-w-full` que hacen que ocupen toda la pantalla.

### 6. QUITAR PLACEHOLDERS INNECESARIOS

Buscar todos los `<Input>` y `<Textarea>` y:

**MANTENER placeholders solo en:**
- Campos de contraseña: `placeholder="••••••••"`
- Campos opcionales: `placeholder="Opcional"`
- Campos de búsqueda: `placeholder="Buscar..."`
- Campos donde sea necesario dar ejemplo: `placeholder="ejemplo@email.com"`

**ELIMINAR placeholders en:**
- Todos los demás inputs dentro de modales de creación/edición
- Los labels ya indican qué va en cada campo

Ejemplo de cambio:
```jsx
// ❌ ANTES
<Input placeholder="Ingresa el nombre completo" />

// ✅ DESPUÉS
<Input />
```

### 7. DESACTIVAR DRAG & DROP EN TODAS LAS TABLAS

Buscar en TODOS los archivos las etiquetas `<tr>` (table row) y asegurarse que NO tengan:
- `draggable={true}`
- `onDragStart={...}`
- `onDragOver={...}`
- `onDrop={...}`

Si encuentras alguna de estas propiedades, **eliminarlas completamente**.

### 8. AGREGAR COLUMNA ID EN TODAS LAS TABLAS

Para CADA tabla en la aplicación, agregar una columna de ID al inicio:

**Para Usuarios:**
```jsx
<th className="...">Documento</th> {/* ID único */}
...
<td>{usuario.tipoDocumento} - {usuario.numeroDocumento}</td>
```

**Para Productos:**
```jsx
<th className="...">Código</th> {/* ID único */}
...
<td>{producto.codigo}</td>
```

**Para Categorías, Servicios, Roles:**
```jsx
<th className="...">ID</th>
...
<td>{item.id}</td>
```

**Para Pedidos:**
```jsx
<th className="...">N° Pedido</th> {/* ID único */}
...
<td>{pedido.id}</td>
```

**Para Citas:**
```jsx
<th className="...">N° Cita</th> {/* ID único */}
...
<td>{cita.id}</td>
```

**Para Compras/Ventas:**
```jsx
<th className="...">N° Transacción</th> {/* ID único */}
...
<td>{transaccion.id}</td>
```

### 9. IDS AUTOINCREMENTABLES

Al crear nuevos registros, generar IDs secuenciales:

```typescript
// Función auxiliar para generar ID autoincremental
const generateId = (existingItems: any[], prefix: string = '') => {
  const maxId = existingItems.length > 0 
    ? Math.max(...existingItems.map(item => {
        const numericPart = item.id.replace(/\D/g, '');
        return parseInt(numericPart) || 0;
      }))
    : 0;
  
  return prefix 
    ? `${prefix}${String(maxId + 1).padStart(4, '0')}`
    : String(maxId + 1);
};

// Uso:
const nuevoProducto = {
  id: generateId(productos),
  codigo: `PROD-${new Date().getFullYear()}-${generateId(productos).padStart(4, '0')}`,
  ...
};
```

## 📁 Archivos a Modificar

1. ✅ `/pages/Register.tsx` - COMPLETADO
2. ✅ `/utils/localStorage.ts` - Agregar rolesStorage y actualizar initializeLocalStorage
3. ✅ `/hooks/useEntities.ts` - COMPLETADO
4. `/pages/Usuarios.tsx` - Actualizar según puntos 4.1 a 4.4
5. `/pages/Productos.tsx` - Agregar columna código, quitar placeholders, corregir modal
6. `/pages/Categorias.tsx` - Agregar columna ID, quitar placeholders
7. `/pages/Proveedores.tsx` - Agregar columna ID, quitar placeholders
8. `/pages/Compras.tsx` - Agregar columna N° Transacción
9. `/pages/Ventas.tsx` - Agregar columna N° Transacción
10. `/pages/Pedidos.tsx` - Agregar columna N° Pedido
11. `/pages/Citas.tsx` - Agregar columna N° Cita
12. `/pages/Servicios.tsx` - Agregar columna ID, quitar placeholders
13. `/pages/MisPedidos.tsx` - Agregar columna N° Pedido
14. `/pages/MisCitas.tsx` - Ya tiene calendario, verificar tamaño de modal
15. `/pages/CatalogoCliente.tsx` - Verificar tamaño de modal del carrito

## 🎯 Resumen de Cambios por Vista

### TODOS LOS MODALES
- ✅ Tamaño adecuado (max-w-xl, max-w-2xl, etc.)
- ✅ Sin placeholders innecesarios (solo contraseñas, opcionales, búsqueda)

### TODAS LAS TABLAS
- ✅ Columna ID visible al inicio
- ✅ Sin drag & drop
- ✅ IDs autoincrementables en creación

### USUARIOS ESPECÍFICAMENTE
- ✅ Mostrar documento completo en tabla (tipo + número)
- ✅ Mostrar contraseña actual en modal editar (solo admin)
- ✅ Selector de rol dinámico desde tabla de roles
- ✅ Solo roles activos en el selector

## ⚠️ IMPORTANTE

Todos estos cambios deben aplicarse GLOBALMENTE:
- Si hay 10 tablas, las 10 deben tener columna ID
- Si hay 20 modales, los 20 deben tener tamaño correcto
- Si hay 50 inputs en modales, 45 NO deben tener placeholder

**NO hacer cambios puntuales, sino sistemáticos y consistentes en TODA la aplicación.**
