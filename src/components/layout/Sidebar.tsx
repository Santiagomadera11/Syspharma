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
  PackageSearch
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useDarkMode } from '../../hooks/useDarkMode';

interface SidebarProps {
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, onLogout, isOpen, onClose }: SidebarProps) {
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

  const menuItems = [
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
    { path: '/reportes', label: 'Reportes', icon: FileText },
    { path: '/configuracion', label: 'Configuración', icon: Settings },
  ];

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
          {/* Logo/Nombre del sistema */}
          <div className="p-6 border-b border-white border-opacity-10">
            <div className="flex items-center gap-3 justify-center">
              <span 
                className={`transition-colors duration-300 ${theme === 'dark' ? 'text-[#63E6BE]' : 'text-white'}`} 
                style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                SYSPHARMA
              </span>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                if ('submenu' in item) {
                  const isExpanded = expandedMenus[item.key!];
                  const isParentActive = isActive(item.path);
                  
                  return (
                    <li key={item.key}>
                      <Link
                        to={item.path}
                        onClick={() => toggleMenu(item.key!)}
                        className={`
                          flex items-center justify-between w-full px-4 py-3 rounded-xl
                          transition-all duration-300 group
                          ${isParentActive 
                            ? 'text-white shadow-lg shadow-[#63E6BE]/20' 
                            : 'text-white hover:bg-white hover:text-black'
                          }
                        `}
                        style={{
                          background: isParentActive ? '#63E6BE' : undefined
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 transition-colors duration-300" />
                          <span 
                            className="transition-colors duration-300" 
                            style={{ fontSize: '14px', fontWeight: isParentActive ? 600 : 500 }}
                          >
                            {item.label}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleMenu(item.key!);
                          }}
                          className="p-1 hover:bg-opacity-10 rounded transition-all duration-300"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                          ) : (
                            <ChevronRight className="w-4 h-4 transition-transform duration-300" />
                          )}
                        </button>
                      </Link>
                      
                      {isExpanded && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((subitem) => {
                            const active = isActive(subitem.path);
                            
                            return (
                              <li key={subitem.path}>
                                <Link
                                  to={subitem.path}
                                  onClick={onClose}
                                  className={`
                                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                                    transition-all duration-300 group
                                    ${active 
                                      ? 'text-white shadow-lg shadow-[#63E6BE]/20' 
                                      : 'text-white hover:bg-white hover:text-black'
                                    }
                                  `}
                                  style={{
                                    background: active ? '#63E6BE' : undefined
                                  }}
                                >
                                  <subitem.icon className="w-4 h-4 transition-colors duration-300" />
                                  <span 
                                    className="transition-colors duration-300" 
                                    style={{ fontSize: '14px', fontWeight: active ? 600 : 500 }}
                                  >
                                    {subitem.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                } else {
                  const active = isActive(item.path);
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={onClose}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-300 group
                          ${active 
                            ? 'text-white shadow-lg shadow-[#63E6BE]/20' 
                            : 'text-white hover:bg-white hover:text-black'
                          }
                        `}
                        style={{
                          background: active ? '#63E6BE' : undefined
                        }}
                      >
                        <item.icon className="w-5 h-5 transition-colors duration-300" />
                        <span 
                          className="transition-colors duration-300" 
                          style={{ fontSize: '14px', fontWeight: active ? 600 : 500 }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>

          {/* Botón salir */}
          <div className="p-4 border-t border-white border-opacity-10">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white hover:bg-white hover:text-red-600 transition-all duration-300 group"
            >
              <LogOut className="w-5 h-5 transition-colors duration-300" />
              <span className="transition-colors duration-300" style={{ fontSize: '14px', fontWeight: 500 }}>Salir</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}