// Sistema centralizado de localStorage para SysPharma
// Garantiza que todos los roles vean los mismos datos

// Tipos de datos
export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: 'Administrador' | 'Empleado' | 'Cliente';
  activo: boolean;
  telefono: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  createdAt: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombreComercial: string;
  nombreGenerico: string;
  formaFarmaceutica: string;
  concentracion: string;
  accionTerapeutica: string;
  presentacion: string;
  laboratorio: string;
  categoria: string;
  stock: number;
  precio: number;
  precioAnterior?: number;
  requiereReceta?: boolean;
  imagen?: string;
  estado: 'Activo' | 'Inactivo';
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  nit: string;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
}

export interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  productos: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  total: number;
  estado: 'Pendiente' | 'Recibida' | 'Cancelada';
  createdAt: string;
}

export interface Venta {
  id: string;
  fecha: string;
  cliente: string;
  productos: Array<{
    id: string;
    nombre: string;
    cantidad: number;
    precio: number;
  }>;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  estado: 'Completada' | 'Cancelada';
  createdAt: string;
}

export interface Pedido {
  id: string;
  fecha: string;
  clienteId: string;
  clienteNombre: string;
  productos: Array<{
    productoId: string;
    nombre: string;
    cantidad: number;
    precio: number;
    requiereReceta?: boolean;
  }>;
  total: number;
  estado: 'Pendiente' | 'En Proceso' | 'Completado' | 'Cancelado';
  requiereReceta?: boolean;
  direccionEntrega?: string;
  telefono?: string;
  createdAt: string;
}

export interface Cita {
  id: string;
  fecha: string;
  hora: string;
  clienteId: string;
  clienteNombre: string;
  servicioId: string;
  servicioNombre: string;
  estado: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada';
  notas?: string;
  createdAt: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // en minutos
  precio: number;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  createdAt: string;
}

// Claves de localStorage
const KEYS = {
  USERS: 'syspharma_users',
  PRODUCTOS: 'syspharma_productos',
  CATEGORIAS: 'syspharma_categorias',
  PROVEEDORES: 'syspharma_proveedores',
  COMPRAS: 'syspharma_compras',
  VENTAS: 'syspharma_ventas',
  PEDIDOS: 'syspharma_pedidos',
  CITAS: 'syspharma_citas',
  SERVICIOS: 'syspharma_servicios',
  ROLES: 'syspharma_roles',
  CURRENT_USER: 'syspharma_user',
};

// Datos iniciales de demostración
const INITIAL_DATA = {
  USERS: [
    {
      id: '1',
      nombre: 'Carlos Administrador',
      email: 'admin@syspharma.com',
      password: 'admin123',
      rol: 'Administrador' as const,
      activo: true,
      telefono: '3001234567',
      tipoDocumento: 'DNI',
      numeroDocumento: '123456789',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nombre: 'María Empleada',
      email: 'empleado@syspharma.com',
      password: 'empleado123',
      rol: 'Empleado' as const,
      activo: true,
      telefono: '3009876543',
      tipoDocumento: 'Cédula',
      numeroDocumento: '987654321',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nombre: 'Juan Cliente',
      email: 'cliente@syspharma.com',
      password: 'cliente123',
      rol: 'Cliente' as const,
      activo: true,
      telefono: '3005551234',
      tipoDocumento: 'Pasaporte',
      numeroDocumento: '456789123',
      createdAt: new Date().toISOString(),
    },
  ] as User[],

  PRODUCTOS: [
    {
      id: '1',
      codigo: 'MED001',
      nombreComercial: 'Advil',
      nombreGenerico: 'Ibuprofeno',
      formaFarmaceutica: 'Tableta',
      concentracion: '400mg',
      accionTerapeutica: 'Analgésico/Antiinflamatorio',
      presentacion: 'Caja x 20 tabletas',
      laboratorio: 'Pfizer',
      categoria: 'Analgésicos',
      stock: 200,
      precio: 15000,
      imagen: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      estado: 'Activo' as const,
    },
    {
      id: '2',
      codigo: 'MED002',
      nombreComercial: 'Amoxil',
      nombreGenerico: 'Amoxicilina',
      formaFarmaceutica: 'Cápsula',
      concentracion: '500mg',
      accionTerapeutica: 'Antibiótico',
      presentacion: 'Caja x 12 cápsulas',
      laboratorio: 'GSK',
      categoria: 'Antibióticos',
      stock: 150,
      precio: 28000,
      imagen: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop',
      estado: 'Activo' as const,
    },
    {
      id: '3',
      codigo: 'VIT001',
      nombreComercial: 'Redoxon',
      nombreGenerico: 'Ácido Ascórbico',
      formaFarmaceutica: 'Tableta Efervescente',
      concentracion: '1g',
      accionTerapeutica: 'Vitamínico',
      presentacion: 'Tubo x 10 tabletas',
      laboratorio: 'Bayer',
      categoria: 'Vitaminas',
      stock: 300,
      precio: 12000,
      estado: 'Activo' as const,
    },
    {
      id: '4',
      codigo: 'MED003',
      nombreComercial: 'Aspirina',
      nombreGenerico: 'Ácido Acetilsalicílico',
      formaFarmaceutica: 'Tableta',
      concentracion: '500mg',
      accionTerapeutica: 'Analgésico/Antipirético',
      presentacion: 'Caja x 10 tabletas',
      laboratorio: 'Bayer',
      categoria: 'Analgésicos',
      stock: 180,
      precio: 8000,
      imagen: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop',
      estado: 'Activo' as const,
    },
  ] as Producto[],

  CATEGORIAS: [
    {
      id: '1',
      nombre: 'Analgésicos',
      descripcion: 'Medicamentos para aliviar el dolor',
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nombre: 'Antibióticos',
      descripcion: 'Medicamentos para combatir infecciones bacterianas',
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nombre: 'Vitaminas',
      descripcion: 'Suplementos vitamínicos y minerales',
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
  ] as Categoria[],

  PROVEEDORES: [
    {
      id: '1',
      nombre: 'Drogas La Rebaja',
      contacto: 'Pedro Martínez',
      telefono: '3101234567',
      email: 'contacto@drogaslarebaja.com',
      direccion: 'Calle 50 #45-23',
      ciudad: 'Bogotá',
      nit: '900123456-7',
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nombre: 'Coopidrogas',
      contacto: 'Laura Gómez',
      telefono: '3209876543',
      email: 'ventas@coopidrogas.com',
      direccion: 'Carrera 30 #15-40',
      ciudad: 'Medellín',
      nit: '900654321-8',
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
  ] as Proveedor[],

  COMPRAS: [] as Compra[],
  VENTAS: [] as Venta[],
  PEDIDOS: [] as Pedido[],
  CITAS: [] as Cita[],
  
  SERVICIOS: [
    {
      id: '1',
      nombre: 'Aplicación de Inyecciones',
      descripcion: 'Servicio de aplicación de medicamentos intramusculares',
      duracion: 15,
      precio: 5000,
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      nombre: 'Toma de Presión Arterial',
      descripcion: 'Medición de presión arterial',
      duracion: 10,
      precio: 3000,
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      nombre: 'Consulta Farmacéutica',
      descripción: 'Asesoría y consulta con farmacéutico profesional',
      duracion: 30,
      precio: 15000,
      estado: 'Activo' as const,
      createdAt: new Date().toISOString(),
    },
  ] as Servicio[],
};

// Funciones de utilidad genéricas
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Disparar evento personalizado para sincronización en la misma pestaña
    window.dispatchEvent(new CustomEvent('localStorageUpdated', { 
      detail: { key, value } 
    }));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Inicializar datos si no existen
export function initializeLocalStorage(): void {
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, INITIAL_DATA.USERS);
  }
  if (!localStorage.getItem(KEYS.PRODUCTOS)) {
    setItem(KEYS.PRODUCTOS, INITIAL_DATA.PRODUCTOS);
  }
  if (!localStorage.getItem(KEYS.CATEGORIAS)) {
    setItem(KEYS.CATEGORIAS, INITIAL_DATA.CATEGORIAS);
  }
  if (!localStorage.getItem(KEYS.PROVEEDORES)) {
    setItem(KEYS.PROVEEDORES, INITIAL_DATA.PROVEEDORES);
  }
  if (!localStorage.getItem(KEYS.COMPRAS)) {
    setItem(KEYS.COMPRAS, INITIAL_DATA.COMPRAS);
  }
  if (!localStorage.getItem(KEYS.VENTAS)) {
    setItem(KEYS.VENTAS, INITIAL_DATA.VENTAS);
  }
  if (!localStorage.getItem(KEYS.PEDIDOS)) {
    setItem(KEYS.PEDIDOS, INITIAL_DATA.PEDIDOS);
  }
  if (!localStorage.getItem(KEYS.CITAS)) {
    setItem(KEYS.CITAS, INITIAL_DATA.CITAS);
  }
  if (!localStorage.getItem(KEYS.SERVICIOS)) {
    setItem(KEYS.SERVICIOS, INITIAL_DATA.SERVICIOS);
  }
  if (!localStorage.getItem(KEYS.ROLES)) {
    setItem(KEYS.ROLES, INITIAL_DATA.ROLES);
  }
}

// CRUD para Usuarios
export const usersStorage = {
  getAll: (): User[] => getItem(KEYS.USERS, INITIAL_DATA.USERS),
  save: (users: User[]): void => setItem(KEYS.USERS, users),
  add: (user: User): User[] => {
    const users = usersStorage.getAll();
    const newUsers = [...users, user];
    usersStorage.save(newUsers);
    return newUsers;
  },
  update: (id: string, userData: Partial<User>): User[] => {
    const users = usersStorage.getAll();
    const newUsers = users.map(u => u.id === id ? { ...u, ...userData } : u);
    usersStorage.save(newUsers);
    return newUsers;
  },
  delete: (id: string): User[] => {
    const users = usersStorage.getAll();
    const newUsers = users.filter(u => u.id !== id);
    usersStorage.save(newUsers);
    return newUsers;
  },
};

// CRUD para Productos
export const productosStorage = {
  getAll: (): Producto[] => getItem(KEYS.PRODUCTOS, INITIAL_DATA.PRODUCTOS),
  save: (productos: Producto[]): void => setItem(KEYS.PRODUCTOS, productos),
  add: (producto: Producto): Producto[] => {
    const productos = productosStorage.getAll();
    const newProductos = [...productos, producto];
    productosStorage.save(newProductos);
    return newProductos;
  },
  update: (id: string, productoData: Partial<Producto>): Producto[] => {
    const productos = productosStorage.getAll();
    const newProductos = productos.map(p => p.id === id ? { ...p, ...productoData } : p);
    productosStorage.save(newProductos);
    return newProductos;
  },
  delete: (id: string): Producto[] => {
    const productos = productosStorage.getAll();
    const newProductos = productos.filter(p => p.id !== id);
    productosStorage.save(newProductos);
    return newProductos;
  },
  updateStock: (id: string, cantidad: number): Producto[] => {
    const productos = productosStorage.getAll();
    const newProductos = productos.map(p => 
      p.id === id ? { ...p, stock: p.stock + cantidad } : p
    );
    productosStorage.save(newProductos);
    return newProductos;
  },
};

// CRUD para Categorías
export const categoriasStorage = {
  getAll: (): Categoria[] => getItem(KEYS.CATEGORIAS, INITIAL_DATA.CATEGORIAS),
  save: (categorias: Categoria[]): void => setItem(KEYS.CATEGORIAS, categorias),
  add: (categoria: Categoria): Categoria[] => {
    const categorias = categoriasStorage.getAll();
    const newCategorias = [...categorias, categoria];
    categoriasStorage.save(newCategorias);
    return newCategorias;
  },
  update: (id: string, categoriaData: Partial<Categoria>): Categoria[] => {
    const categorias = categoriasStorage.getAll();
    const newCategorias = categorias.map(c => c.id === id ? { ...c, ...categoriaData } : c);
    categoriasStorage.save(newCategorias);
    return newCategorias;
  },
  delete: (id: string): Categoria[] => {
    const categorias = categoriasStorage.getAll();
    const newCategorias = categorias.filter(c => c.id !== id);
    categoriasStorage.save(newCategorias);
    return newCategorias;
  },
};

// CRUD para Proveedores
export const proveedoresStorage = {
  getAll: (): Proveedor[] => getItem(KEYS.PROVEEDORES, INITIAL_DATA.PROVEEDORES),
  save: (proveedores: Proveedor[]): void => setItem(KEYS.PROVEEDORES, proveedores),
  add: (proveedor: Proveedor): Proveedor[] => {
    const proveedores = proveedoresStorage.getAll();
    const newProveedores = [...proveedores, proveedor];
    proveedoresStorage.save(newProveedores);
    return newProveedores;
  },
  update: (id: string, proveedorData: Partial<Proveedor>): Proveedor[] => {
    const proveedores = proveedoresStorage.getAll();
    const newProveedores = proveedores.map(p => p.id === id ? { ...p, ...proveedorData } : p);
    proveedoresStorage.save(newProveedores);
    return newProveedores;
  },
  delete: (id: string): Proveedor[] => {
    const proveedores = proveedoresStorage.getAll();
    const newProveedores = proveedores.filter(p => p.id !== id);
    proveedoresStorage.save(newProveedores);
    return newProveedores;
  },
};

// CRUD para Compras
export const comprasStorage = {
  getAll: (): Compra[] => getItem(KEYS.COMPRAS, INITIAL_DATA.COMPRAS),
  save: (compras: Compra[]): void => setItem(KEYS.COMPRAS, compras),
  add: (compra: Compra): Compra[] => {
    const compras = comprasStorage.getAll();
    const newCompras = [...compras, compra];
    comprasStorage.save(newCompras);
    return newCompras;
  },
  update: (id: string, compraData: Partial<Compra>): Compra[] => {
    const compras = comprasStorage.getAll();
    const newCompras = compras.map(c => c.id === id ? { ...c, ...compraData } : c);
    comprasStorage.save(newCompras);
    return newCompras;
  },
  delete: (id: string): Compra[] => {
    const compras = comprasStorage.getAll();
    const newCompras = compras.filter(c => c.id !== id);
    comprasStorage.save(newCompras);
    return newCompras;
  },
};

// CRUD para Ventas
export const ventasStorage = {
  getAll: (): Venta[] => getItem(KEYS.VENTAS, INITIAL_DATA.VENTAS),
  save: (ventas: Venta[]): void => setItem(KEYS.VENTAS, ventas),
  add: (venta: Venta): Venta[] => {
    const ventas = ventasStorage.getAll();
    const newVentas = [...ventas, venta];
    ventasStorage.save(newVentas);
    return newVentas;
  },
  update: (id: string, ventaData: Partial<Venta>): Venta[] => {
    const ventas = ventasStorage.getAll();
    const newVentas = ventas.map(v => v.id === id ? { ...v, ...ventaData } : v);
    ventasStorage.save(newVentas);
    return newVentas;
  },
  delete: (id: string): Venta[] => {
    const ventas = ventasStorage.getAll();
    const newVentas = ventas.filter(v => v.id !== id);
    ventasStorage.save(newVentas);
    return newVentas;
  },
};

// CRUD para Pedidos
export const pedidosStorage = {
  getAll: (): Pedido[] => getItem(KEYS.PEDIDOS, INITIAL_DATA.PEDIDOS),
  getByClient: (clienteId: string): Pedido[] => {
    const pedidos = pedidosStorage.getAll();
    return pedidos.filter(p => p.clienteId === clienteId);
  },
  save: (pedidos: Pedido[]): void => setItem(KEYS.PEDIDOS, pedidos),
  add: (pedido: Pedido): Pedido[] => {
    const pedidos = pedidosStorage.getAll();
    const newPedidos = [...pedidos, pedido];
    pedidosStorage.save(newPedidos);
    return newPedidos;
  },
  update: (id: string, pedidoData: Partial<Pedido>): Pedido[] => {
    const pedidos = pedidosStorage.getAll();
    const newPedidos = pedidos.map(p => p.id === id ? { ...p, ...pedidoData } : p);
    pedidosStorage.save(newPedidos);
    return newPedidos;
  },
  delete: (id: string): Pedido[] => {
    const pedidos = pedidosStorage.getAll();
    const newPedidos = pedidos.filter(p => p.id !== id);
    pedidosStorage.save(newPedidos);
    return newPedidos;
  },
};

// CRUD para Citas
export const citasStorage = {
  getAll: (): Cita[] => getItem(KEYS.CITAS, INITIAL_DATA.CITAS),
  getByClient: (clienteId: string): Cita[] => {
    const citas = citasStorage.getAll();
    return citas.filter(c => c.clienteId === clienteId);
  },
  save: (citas: Cita[]): void => setItem(KEYS.CITAS, citas),
  add: (cita: Cita): Cita[] => {
    const citas = citasStorage.getAll();
    const newCitas = [...citas, cita];
    citasStorage.save(newCitas);
    return newCitas;
  },
  update: (id: string, citaData: Partial<Cita>): Cita[] => {
    const citas = citasStorage.getAll();
    const newCitas = citas.map(c => c.id === id ? { ...c, ...citaData } : c);
    citasStorage.save(newCitas);
    return newCitas;
  },
  delete: (id: string): Cita[] => {
    const citas = citasStorage.getAll();
    const newCitas = citas.filter(c => c.id !== id);
    citasStorage.save(newCitas);
    return newCitas;
  },
};

// CRUD para Servicios
export const serviciosStorage = {
  getAll: (): Servicio[] => getItem(KEYS.SERVICIOS, INITIAL_DATA.SERVICIOS),
  save: (servicios: Servicio[]): void => setItem(KEYS.SERVICIOS, servicios),
  add: (servicio: Servicio): Servicio[] => {
    const servicios = serviciosStorage.getAll();
    const newServicios = [...servicios, servicio];
    serviciosStorage.save(newServicios);
    return newServicios;
  },
  update: (id: string, servicioData: Partial<Servicio>): Servicio[] => {
    const servicios = serviciosStorage.getAll();
    const newServicios = servicios.map(s => s.id === id ? { ...s, ...servicioData } : s);
    serviciosStorage.save(newServicios);
    return newServicios;
  },
  delete: (id: string): Servicio[] => {
    const servicios = serviciosStorage.getAll();
    const newServicios = servicios.filter(s => s.id !== id);
    serviciosStorage.save(newServicios);
    return newServicios;
  },
};

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

// Usuario actual
export const currentUserStorage = {
  get: (): User | null => getItem(KEYS.CURRENT_USER, null),
  set: (user: User | null): void => {
    if (user) {
      setItem(KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  clear: (): void => localStorage.removeItem(KEYS.CURRENT_USER),
};