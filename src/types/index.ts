export type UserRole = 'admin' | 'empleado' | 'cliente';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: UserRole;
  foto?: string;
  activo: boolean;
  telefono?: string;
  createdAt: string;
}

export interface Permiso {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
  permisos: string[];
  activo: boolean;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precioCompra: number;
  stock: number;
  stockMinimo: number;
  proveedorId: string;
  categoria: string;
  activo: boolean;
  imagen?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number; // minutos
  precio: number;
  activo: boolean;
}

export interface Cita {
  id: string;
  clienteId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  notas?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  documento: string;
  telefono: string;
  email: string;
  direccion?: string;
}

export interface DetalleVenta {
  productoId: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface Venta {
  id: string;
  clienteId?: string;
  vendedorId: string;
  fecha: string;
  productos: DetalleVenta[];
  total: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia';
  estado: 'completada' | 'cancelada';
}

export interface Compra {
  id: string;
  proveedorId: string;
  fecha: string;
  total: number;
  estado: 'pendiente' | 'recibida' | 'cancelada';
  productos: {
    productoId: string;
    cantidad: number;
    precioCompra: number;
    subtotal: number;
  }[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}
