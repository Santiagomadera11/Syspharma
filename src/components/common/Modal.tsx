import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md',
}: ModalProps) => {
  const { isDark, modalBg, textPrimary, border, borderStrong } = useDarkMode();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'md':
        return 'max-w-lg';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Overlay */}
      <div
        className={`absolute inset-0 ${isDark ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'} animate-fade-in transition-all duration-300`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative ${modalBg} rounded-2xl shadow-2xl 
          w-full ${getSizeClass()} 
          max-h-[80vh] my-8 flex flex-col
          animate-scale-in transition-all duration-300
        `}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${borderStrong} border-b`}>
          <h3 className={`${textPrimary} transition-colors duration-300`}>{title}</h3>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} flex items-center justify-center transition-colors duration-200`}
          >
            <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};