import { Menu, Sun, Moon, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';

interface NavbarProps {
  user: any;
  title: string;
  onMenuClick: () => void;
  onCartClick?: () => void;
}

export default function Navbar({ user, title, onMenuClick, onCartClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [cartCount, setCartCount] = useState(0);

  // Obtener cantidad de items del carrito
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('syspharma_cart') || '[]');
      const total = cart.reduce((sum: number, item: any) => sum + item.cantidad, 0);
      setCartCount(total);
    };

    updateCartCount();
    
    // Actualizar cada segundo para detectar cambios
    const interval = setInterval(updateCartCount, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const isCliente = user?.rol?.toLowerCase() === 'cliente';

  return (
    <header 
      className="h-16 border-b px-6 flex items-center justify-between shadow-sm transition-colors duration-300"
      style={{ 
        background: theme === 'dark' ? '#1F2937' : '#63E6BE',
        borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(99, 230, 190, 0.2)'
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <span 
            className={`${theme === 'dark' ? 'text-[#63E6BE]' : 'text-white'} transition-colors duration-300`} 
            style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}
          >
            SYSPHARMA
          </span>
          <span 
            className={`${theme === 'dark' ? 'text-gray-500' : 'text-white'} opacity-60 transition-colors duration-300`} 
            style={{ fontSize: '20px', fontWeight: 400 }}
          >
            |
          </span>
          <h1 
            className={`${theme === 'dark' ? 'text-gray-300' : 'text-white'} transition-colors duration-300`} 
            style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            {title}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Toggle de tema */}
        <motion.button
          onClick={toggleTheme}
          className="relative w-16 h-8 rounded-full p-1 transition-all duration-300 shadow-inner"
          style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(to right, #1F2937, #374151)' 
              : 'linear-gradient(to right, #FEF3C7, #FCD34D)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 rounded-full shadow-lg flex items-center justify-center"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' 
                : 'linear-gradient(135deg, #FBBF24, #F59E0B)'
            }}
            animate={{
              x: theme === 'dark' ? 32 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          >
            <motion.div
              initial={false}
              animate={{
                scale: theme === 'dark' ? 1 : 0,
                rotate: theme === 'dark' ? 0 : 180,
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
              }}
            >
              <Moon className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                scale: theme === 'light' ? 1 : 0,
                rotate: theme === 'light' ? 0 : -180,
              }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
              }}
            >
              <Sun className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>
        </motion.button>

        {/* Botón de carrito para clientes (ANTES del avatar) */}
        {isCliente && (
          <button
            onClick={onCartClick}
            className={`relative p-2 rounded-xl transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-white bg-opacity-20 hover:bg-opacity-30'
            }`}
          >
            <ShoppingBag 
              className={`w-6 h-6 ${theme === 'dark' ? 'text-[#63E6BE]' : 'text-white'} transition-colors duration-300`} 
            />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
              >
                {cartCount}
              </span>
            )}
          </button>
        )}

        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <p 
              className={`${theme === 'dark' ? 'text-gray-300' : 'text-white'} transition-colors duration-300`} 
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              {user.nombre}
            </p>
            <p 
              className={`${theme === 'dark' ? 'text-gray-400' : 'text-white'} opacity-90 transition-colors duration-300`} 
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {user.rol}
            </p>
          </div>
          <img 
            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nombre}`}
            alt={user.nombre}
            className="w-10 h-10 rounded-full border-2 shadow-lg transition-colors duration-300"
            style={{ borderColor: theme === 'dark' ? '#63E6BE' : 'white' }}
          />
        </div>

        {/* Botón hamburguesa para móvil */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden p-2 rounded-xl transition-all duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          }`}
        >
          <Menu 
            className={`w-6 h-6 ${theme === 'dark' ? 'text-[#63E6BE]' : 'text-white'} transition-colors duration-300`} 
          />
        </button>
      </div>
    </header>
  );
}