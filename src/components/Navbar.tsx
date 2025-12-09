import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import type { User } from '../App';

interface NavbarProps {
  title: string;
  user: User;
  onLogout: () => void;
  onMenuClick: () => void;
}

const roleLabels = {
  admin: 'Administrador',
  empleado: 'Empleado',
  cliente: 'Cliente'
};

export function Navbar({ title, user, onLogout, onMenuClick }: NavbarProps) {
  return (
    <div
      className="h-16 flex items-center justify-between px-6 shadow-sm"
      style={{ backgroundColor: '#C4B5FD' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors hover:bg-white hover:bg-opacity-20"
          style={{ color: '#5B21B6' }}
        >
          <Menu style={{ width: '24px', height: '24px' }} />
        </button>
        <h2 className="m-0" style={{ color: '#5B21B6' }}>{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <p className="m-0 text-sm" style={{ color: '#5B21B6', fontWeight: 500 }}>
              {user.name}
            </p>
            <p className="m-0 text-xs" style={{ color: '#7C3AED' }}>
              {roleLabels[user.role]}
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
            style={{ backgroundColor: '#FAFAFA' }}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon style={{ width: '20px', height: '20px', color: '#C4B5FD' }} />
            )}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-103"
          style={{ backgroundColor: 'white', color: '#5B21B6' }}
        >
          <LogOut style={{ width: '18px', height: '18px' }} />
          <span className="text-sm">Salir</span>
        </button>
      </div>
    </div>
  );
}
