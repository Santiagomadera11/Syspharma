import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { useDarkMode } from '../../hooks/useDarkMode';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function PaginationCustom({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage, 
  totalItems 
}: PaginationProps) {
  const { isDark, textPrimary, textSecondary, bgCard, border } = useDarkMode();

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Siempre mostrar última página
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Validar que los valores no sean NaN
  const validStartItem = isNaN(startItem) ? 0 : startItem;
  const validEndItem = isNaN(endItem) ? 0 : endItem;
  const validTotalItems = isNaN(totalItems) ? 0 : totalItems;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${border}`}>
      {/* Información de items */}
      <div className={`${textSecondary}`} style={{ fontSize: '14px' }}>
        Mostrando <span className={`${textPrimary} font-semibold`}>{validStartItem}</span> a{' '}
        <span className={`${textPrimary} font-semibold`}>{validEndItem}</span> de{' '}
        <span className={`${textPrimary} font-semibold`}>{validTotalItems}</span> registros
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Anterior */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`h-9 px-3 rounded-lg transition-all ${
            currentPage === 1
              ? `${isDark ? 'bg-[#161b22] text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
              : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-white hover:bg-gray-100 text-[#3D4756]'} border ${border}`
          }`}
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={`px-2 ${textSecondary}`}
                style={{ fontSize: '14px' }}
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`h-9 min-w-[36px] px-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[#14B8A6] text-white shadow-lg shadow-[#14B8A6]/20'
                  : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-white hover:bg-gray-100 text-[#3D4756]'} border ${border}`
              }`}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              {pageNum}
            </Button>
          );
        })}

        {/* Botón Siguiente */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`h-9 px-3 rounded-lg transition-all ${
            currentPage === totalPages
              ? `${isDark ? 'bg-[#161b22] text-gray-600' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
              : `${isDark ? 'bg-[#161b22] hover:bg-[#1f6feb1a] text-white' : 'bg-white hover:bg-gray-100 text-[#3D4756]'} border ${border}`
          }`}
          style={{ fontSize: '13px', fontWeight: 600 }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}