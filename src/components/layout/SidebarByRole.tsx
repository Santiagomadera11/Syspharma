import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Tag,
  Building2, 
  ShoppingCart, 
  DollarSign, 
  Calendar, 
  Stethoscope,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  PackageSearch,
  ShoppingBag,
  Clock,
  User,
  Box
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDarkMode } from '../../hooks/useDarkMode';

interface SidebarByRoleProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  cartItemsCount?: number;
}

export default function SidebarByRole({ user, onLogout, isOpen, onClose, cartItemsCount = 0 }: SidebarByRoleProps) {
  const location = useLocation();
  const { theme } = useTheme();
  const { sidebarBg, sidebarItemActive, sidebarItemHover, sidebarIconActive, sidebarIconInactive, sidebarTextActive, sidebarTextInactive } = useDarkMode();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    compras: true,
    ventas: true,
    servicios: true
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  // Menú completo del Administrador
  const adminMenuItems = [
    { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { path: '/usuarios', label: 'Usuarios', icon: Users },
    { 
      path: '/compras',
      label: 'Compras', 
      icon: ShoppingCart, 
      key: 'compras',
      submenu: [
        { path: '/productos', label: 'Productos', icon: Package },
        { path: '/categorias', label: 'Categorías', icon: Tag },
        { path: '/proveedores', label: 'Proveedores', icon: Building2 },
      ]
    },
    { 
      path: '/ventas',
      label: 'Ventas', 
      icon: DollarSign, 
      key: 'ventas',
      submenu: [
        { path: '/pedidos', label: 'Pedidos', icon: PackageSearch },
      ]
    },
    { 
      path: '/servicios',
      label: 'Servicios', 
      icon: Stethoscope, 
      key: 'servicios',
      submenu: [
        { path: '/citas', label: 'Citas', icon: Calendar },
      ]
    },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  // Menú del Empleado (basado en permisos de Configuración)
  const empleadoMenuItems = [
    { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { path: '/compras', label: 'Compras', icon: ShoppingCart },
    { path: '/ventas', label: 'Ventas', icon: DollarSign },
    { path: '/productos', label: 'Productos', icon: Package },
    { path: '/pedidos', label: 'Pedidos', icon: PackageSearch },
    { path: '/citas', label: 'Citas', icon: Calendar },
  ];

  // Menú del Cliente (basado en permisos de Configuración)
  const clienteMenuItems = [
    { path: '/catalogo-cliente', label: 'Catálogo', icon: ShoppingBag },
    { path: '/productos-cliente', label: 'Productos', icon: Box },
    { path: '/mis-pedidos', label: 'Mis Pedidos', icon: PackageSearch },
    { path: '/mis-citas', label: 'Mis Citas', icon: Calendar },
    { path: '/mi-perfil', label: 'Mi Perfil', icon: User },
  ];

  // Seleccionar el menú según el rol
  const getMenuItems = () => {
    const rol = user?.rol?.toLowerCase();
    if (rol === 'administrador' || rol === 'admin') return adminMenuItems;
    if (rol === 'empleado') return empleadoMenuItems;
    if (rol === 'cliente') return clienteMenuItems;
    return clienteMenuItems; // Por defecto cliente
  };

  const menuItems = getMenuItems();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar a la derecha */}
      <aside 
        className={`
          fixed top-0 right-0 h-full w-[280px] z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          lg:translate-x-0
        `}
        style={{ background: theme === 'dark' ? '#0d1117' : '#3D4756' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Rol */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#63E6BE] flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white" style={{ fontSize: '18px', fontWeight: 700 }}>
                  SysPharma
                </h1>
                <p className="text-white/60 text-xs">
                  {user?.rol || 'Usuario'}
                </p>
              </div>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.submenu ? (
                  <>
                    {/* Elemento principal con enlace + botón expandir */}
                    <div className="flex items-center gap-1 mb-1">
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isActive(item.path) 
                            ? sidebarItemActive
                            : `${sidebarItemHover} text-white/70 hover:text-white`
                          }
                        `}
                      >
                        <item.icon className={`w-5 h-5 ${
                          isActive(item.path) ? sidebarIconActive : sidebarIconInactive
                        }`} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {item.label}
                        </span>
                      </Link>
                      <button
                        onClick={() => toggleMenu(item.key!)}
                        className={`
                          px-2 py-3 rounded-xl
                          transition-all duration-200
                          ${sidebarItemHover} text-white/70 hover:text-white
                        `}
                      >
                        {expandedMenus[item.key!] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    {expandedMenus[item.key!] && (
                      <div className="ml-4 mb-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            onClick={onClose}
                            className={`
                              flex items-center gap-3 px-4 py-2.5 rounded-xl
                              transition-all duration-200
                              ${isActive(subItem.path) 
                                ? sidebarItemActive
                                : `${sidebarItemHover} text-white/70 hover:text-white`
                              }
                            `}
                          >
                            <subItem.icon className={`w-4 h-4 ${
                              isActive(subItem.path) ? sidebarIconActive : sidebarIconInactive
                            }`} />
                            <span style={{ fontSize: '13px', fontWeight: 600 }}>
                              {subItem.label}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl mb-1
                      transition-all duration-200
                      ${isActive(item.path) 
                        ? sidebarItemActive
                        : `${sidebarItemHover} text-white/70 hover:text-white`
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 ${
                      isActive(item.path) ? sidebarIconActive : sidebarIconInactive
                    }`} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {item.label}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Usuario y logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#63E6BE] flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {user?.nombre || 'Usuario'}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {user?.email || 'usuario@syspharma.com'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}