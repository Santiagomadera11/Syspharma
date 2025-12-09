import { useEffect, useState } from 'react';

/**
 * Hook para sincronizar automáticamente componentes con cambios en localStorage
 * Escucha eventos de storage para actualizar en tiempo real
 */
export function useStorageSync() {
  const [syncTrigger, setSyncTrigger] = useState(0);

  useEffect(() => {
    // Función que se ejecuta cuando hay cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      // Si el cambio es en alguna de nuestras claves de SysPharma, actualizar
      if (e.key && e.key.startsWith('syspharma_')) {
        setSyncTrigger(prev => prev + 1);
      }
    };

    // Escuchar cambios en storage desde otras pestañas
    window.addEventListener('storage', handleStorageChange);

    // Crear un evento personalizado para cambios en la misma pestaña
    const handleCustomStorageChange = () => {
      setSyncTrigger(prev => prev + 1);
    };

    window.addEventListener('localStorageUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleCustomStorageChange);
    };
  }, []);

  return syncTrigger;
}

/**
 * Función para disparar evento de actualización de localStorage
 * Debe llamarse después de cada operación de escritura en localStorage
 */
export function triggerStorageUpdate() {
  window.dispatchEvent(new Event('localStorageUpdated'));
}
