import { useState, useEffect, useMemo, useCallback } from "react";
import {
  usersStorage,
  productosStorage,
  categoriasStorage,
  proveedoresStorage,
  comprasStorage,
  ventasStorage,
  pedidosStorage,
  citasStorage,
  serviciosStorage,
  medicosStorage,
  rolesStorage,
  type User,
  type Producto,
  type Categoria,
  type Proveedor,
  type Compra,
  type Venta,
  type Pedido,
  type Cita,
  type Servicio,
  type Rol,
  type Medico,
} from "../utils/localStorage";

/**
 * Hook genérico para manejar cualquier entidad con sincronización automática
 */
function useEntity<T>(
  storageKey: string,
  storage: {
    getAll: () => T[];
    save: (items: T[]) => void;
    add: (item: T) => T[];
    update: (id: string, data: Partial<T>) => T[];
    delete: (id: string) => T[];
  }
) {
  const [items, setItems] = useState<T[]>([]);
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Cargar datos iniciales y sincronizar
  useEffect(() => {
    const loadData = () => {
      const data = storage.getAll();
      setItems(data);
    };

    loadData();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        loadData();
      }
    };

    const handleCustomStorageChange = (e: CustomEvent) => {
      if (e.detail?.key === storageKey) {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "localStorageUpdated",
      handleCustomStorageChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageUpdated",
        handleCustomStorageChange as EventListener
      );
    };
  }, [storageKey, syncTrigger]);

  const refresh = useCallback(() => {
    setSyncTrigger((prev) => prev + 1);
  }, []);

  const add = useCallback(
    (item: T) => {
      const newItems = storage.add(item);
      setItems(newItems);
      refresh();
      return newItems;
    },
    [storage, refresh]
  );

  const update = useCallback(
    (id: string, data: Partial<T>) => {
      const newItems = storage.update(id, data);
      setItems(newItems);
      refresh();
      return newItems;
    },
    [storage, refresh]
  );

  const remove = useCallback(
    (id: string) => {
      const newItems = storage.delete(id);
      setItems(newItems);
      refresh();
      return newItems;
    },
    [storage, refresh]
  );

  return {
    items,
    add,
    update,
    remove,
    refresh,
    setItems,
  };
}

/**
 * Hook para Usuarios
 */
export function useUsuarios() {
  return useEntity<User>("syspharma_users", usersStorage);
}

/**
 * Hook para Productos
 */
export function useProductos() {
  return useEntity<Producto>("syspharma_productos", productosStorage);
}

/**
 * Hook para Categorías
 */
export function useCategorias() {
  return useEntity<Categoria>("syspharma_categorias", categoriasStorage);
}

/**
 * Hook para Proveedores
 */
export function useProveedores() {
  return useEntity<Proveedor>("syspharma_proveedores", proveedoresStorage);
}

/**
 * Hook para Compras
 */
export function useCompras() {
  return useEntity<Compra>("syspharma_compras", comprasStorage);
}

/**
 * Hook para Ventas
 */
export function useVentas() {
  return useEntity<Venta>("syspharma_ventas", ventasStorage);
}

/**
 * Hook para Pedidos
 */
export function usePedidos() {
  return useEntity<Pedido>("syspharma_pedidos", pedidosStorage);
}

/**
 * Hook para Citas
 */
export function useCitas() {
  return useEntity<Cita>("syspharma_citas", citasStorage);
}

/**
 * Hook para Médicos (no son usuarios del sistema, solo para agendamiento)
 */
export function useMedicos() {
  return useEntity<Medico>("syspharma_medicos", medicosStorage);
}

/**
 * Hook para Servicios
 */
export function useServicios() {
  return useEntity<Servicio>("syspharma_servicios", serviciosStorage);
}

/**
 * Hook para Roles
 */
export function useRoles() {
  return useEntity<Rol>("syspharma_roles", rolesStorage);
}

/**
 * Hook combinado para obtener todas las entidades que necesitas
 * Útil cuando necesitas múltiples entidades relacionadas
 */
export function useAllEntities() {
  const usuarios = useUsuarios();
  const productos = useProductos();
  const categorias = useCategorias();
  const proveedores = useProveedores();
  const compras = useCompras();
  const ventas = useVentas();
  const pedidos = usePedidos();
  const citas = useCitas();
  const servicios = useServicios();
  const roles = useRoles();
  const medicos = useMedicos();

  return {
    usuarios,
    productos,
    categorias,
    proveedores,
    compras,
    ventas,
    pedidos,
    citas,
    servicios,
    roles,
    medicos,
  };
}
