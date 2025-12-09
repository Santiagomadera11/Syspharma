import { useState } from 'react';
import { Sidebar, type MenuOption } from './Sidebar';
import { Navbar } from './Navbar';
import { DashboardHome } from './dashboard/DashboardHome';
import { UsuariosView } from './dashboard/UsuariosView';
import { ProductosView } from './dashboard/ProductosView';
import { ProveedoresView } from './dashboard/ProveedoresView';
import { ComprasView } from './dashboard/ComprasView';
import { VentasView } from './dashboard/VentasView';
import { CitasView } from './dashboard/CitasView';
import { ServiciosView } from './dashboard/ServiciosView';
import { ConfiguracionView } from './dashboard/ConfiguracionView';
import { Plus } from 'lucide-react';
import type { User } from '../App';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const viewTitles: Record<MenuOption, string> = {
  inicio: 'Inicio',
  usuarios: 'Gestión de Usuarios',
  productos: 'Gestión de Productos',
  proveedores: 'Gestión de Proveedores',
  compras: 'Gestión de Compras',
  ventas: 'Punto de Venta',
  citas: 'Gestión de Citas',
  servicios: 'Gestión de Servicios',
  configuracion: 'Configuración del Sistema'
};

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<MenuOption>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'inicio':
        return <DashboardHome user={user} />;
      case 'usuarios':
        return <UsuariosView />;
      case 'productos':
        return <ProductosView />;
      case 'proveedores':
        return <ProveedoresView />;
      case 'compras':
        return <ComprasView />;
      case 'ventas':
        return <VentasView />;
      case 'citas':
        return <CitasView user={user} />;
      case 'servicios':
        return <ServiciosView />;
      case 'configuracion':
        return <ConfiguracionView />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col" style={{ marginRight: '280px' }}>
        <Navbar
          title={viewTitles[currentView]}
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {renderView()}
        </main>
      </div>

      {/* Sidebar - Right Side */}
      <Sidebar
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Floating Action Button - Mobile */}
      <button
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 z-30"
        style={{ backgroundColor: '#A7F3D0', color: '#065F46' }}
        onClick={() => {
          // This could open a quick action menu or create modal
          setSidebarOpen(true);
        }}
      >
        <Plus style={{ width: '24px', height: '24px' }} />
      </button>
    </div>
  );
}
