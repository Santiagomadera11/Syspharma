import { 
  Home, 
  Users, 
  Package, 
  Truck, 
  ShoppingCart, 
  ShoppingBag, 
  Calendar, 
  Briefcase, 
  Settings, 
  LogOut,
  Pill,
  X,
  PackageSearch
} from 'lucide-react';
import type { User } from '../App';

export type MenuOption = 
  | 'inicio' 
  | 'usuarios' 
  | 'productos' 
  | 'proveedores' 
  | 'compras' 
  | 'ventas' 
  | 'pedidos'
  | 'citas' 
  | 'servicios' 
  | 'configuracion';

interface SidebarProps {
  user: User;
  currentView: MenuOption;
  onViewChange: (view: MenuOption) => void;
  onLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = {
  admin: [
    { id: 'inicio' as MenuOption, label: 'Inicio', icon: Home },
    { id: 'usuarios' as MenuOption, label: 'Usuarios', icon: Users },
    { id: 'productos' as MenuOption, label: 'Productos', icon: Package },
    { id: 'proveedores' as MenuOption, label: 'Proveedores', icon: Truck },
    { id: 'compras' as MenuOption, label: 'Compras', icon: ShoppingCart },
    { id: 'ventas' as MenuOption, label: 'Ventas', icon: ShoppingBag },
    { id: 'pedidos' as MenuOption, label: 'Pedidos', icon: PackageSearch },
    { id: 'citas' as MenuOption, label: 'Citas', icon: Calendar },
    { id: 'servicios' as MenuOption, label: 'Servicios', icon: Briefcase },
    { id: 'configuracion' as MenuOption, label: 'Configuración', icon: Settings }
  ],
  empleado: [
    { id: 'inicio' as MenuOption, label: 'Inicio', icon: Home },
    { id: 'productos' as MenuOption, label: 'Productos', icon: Package },
    { id: 'ventas' as MenuOption, label: 'Ventas', icon: ShoppingBag },
    { id: 'pedidos' as MenuOption, label: 'Pedidos', icon: PackageSearch },
    { id: 'citas' as MenuOption, label: 'Citas', icon: Calendar },
    { id: 'servicios' as MenuOption, label: 'Servicios', icon: Briefcase }
  ],
  cliente: [
    { id: 'inicio' as MenuOption, label: 'Inicio', icon: Home },
    { id: 'productos' as MenuOption, label: 'Productos', icon: Package },
    { id: 'citas' as MenuOption, label: 'Mis Citas', icon: Calendar },
    { id: 'ventas' as MenuOption, label: 'Mis Compras', icon: ShoppingBag }
  ]
};

export function Sidebar({ user, currentView, onViewChange, onLogout, isOpen = true, onClose }: SidebarProps) {
  const items = menuItems[user.role];

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #C4B5FD 100%)' }}
          >
            <Pill style={{ width: '24px', height: '24px', color: 'white' }} />
          </div>
          <div>
            <h3 className="m-0" style={{ color: '#93C5FD', fontSize: '1.25rem' }}>SysPharma</h3>
            <p className="m-0 text-xs" style={{ color: '#9CA3AF' }}>Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (onClose) onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-103"
              style={{
                backgroundColor: isActive ? '#93C5FD' : 'transparent',
                color: isActive ? '#1E40AF' : '#374151'
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-103"
          style={{ backgroundColor: '#FBCFE8', color: '#9F1239' }}
        >
          <LogOut style={{ width: '20px', height: '20px' }} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Right Side */}
      <div
        className="hidden lg:flex flex-col bg-white border-l animate-slide-in-right"
        style={{
          width: '280px',
          borderLeftColor: '#93C5FD',
          borderLeftWidth: '5px',
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0
        }}
      >
        {sidebarContent}
      </div>

      {/* Mobile Drawer - Right Side */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
            onClick={onClose}
          />
          <div
            className="lg:hidden fixed top-0 right-0 bottom-0 bg-white z-50 flex flex-col animate-slide-in-right shadow-2xl"
            style={{
              width: '280px',
              borderLeftColor: '#93C5FD',
              borderLeftWidth: '5px'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h3 className="m-0" style={{ color: '#93C5FD' }}>Menú</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#9CA3AF' }}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}