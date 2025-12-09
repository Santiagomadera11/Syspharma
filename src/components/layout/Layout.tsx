import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarByRole from './SidebarByRole';
import Navbar from './Navbar';
import { useTheme } from '../../contexts/ThemeContext';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Inicio',
    '/usuarios': 'Gestión de Usuarios',
    '/productos': 'Gestión de Productos',
    '/categorias': 'Gestión de Categorías',
    '/proveedores': 'Gestión de Proveedores',
    '/compras': 'Gestión de Compras',
    '/ventas': 'Punto de Venta',
    '/pedidos': 'Gestión de Pedidos',
    '/citas': 'Gestión de Citas',
    '/servicios': 'Gestión de Servicios',
    '/reportes': 'Reportes y Análisis',
    '/configuracion': 'Configuración del Sistema',
    '/mis-pedidos': 'Mis Pedidos',
    '/mis-citas': 'Mis Citas',
    '/mi-perfil': 'Mi Perfil',
    '/catalogo-cliente': 'Catálogo de Productos',
  };

  const currentTitle = pageTitles[location.pathname] || 'SysPharma';

  // Manejar clic en carrito (solo para clientes)
  const handleCartClick = () => {
    if (user?.rol?.toLowerCase() === 'cliente') {
      // Si ya estamos en el catálogo, disparar evento para abrir el modal
      if (location.pathname === '/catalogo-cliente') {
        window.dispatchEvent(new CustomEvent('openCart'));
      } else {
        // Si no, navegar al catálogo
        navigate('/catalogo-cliente');
      }
    }
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300"
      style={{ background: theme === 'dark' ? '#0d1117' : '#F9FAFB' }}
    >
      {/* Sidebar a la derecha */}
      <SidebarByRole 
        user={user} 
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:mr-[280px] min-h-screen flex flex-col">
        <Navbar 
          user={user} 
          title={currentTitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onCartClick={handleCartClick}
        />
        
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}