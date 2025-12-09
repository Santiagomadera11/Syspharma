import { ReactNode } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function Table<T extends { id: string }>({ 
  data, 
  columns, 
  onRowClick,
  isLoading = false,
}: TableProps<T>) {
  const { isDark, bgCard, textPrimary, textSecondary, border, tableHeader, tableRow } = useDarkMode();

  if (isLoading) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden ${border} border transition-all duration-300`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                {columns.map(column => (
                  <th key={column.key} className="px-6 py-4 text-left text-white">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className={`${border} border-b`}>
                  {columns.map(column => (
                    <td key={column.key} className="px-6 py-4">
                      <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-shimmer`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`${bgCard} rounded-2xl shadow-sm p-12 text-center ${border} border transition-all duration-300`}>
        <p className={`${textSecondary} transition-colors duration-300`}>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className={`${bgCard} rounded-2xl shadow-sm overflow-hidden ${border} border transition-all duration-300`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={tableHeader}>
            <tr>
              {columns.map(column => (
                <th key={column.key} className="px-6 py-4 text-left text-white">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={`
                  ${border} border-b ${tableRow} transition-colors duration-300
                  ${onRowClick ? 'cursor-pointer' : ''}
                `}
              >
                {columns.map(column => (
                  <td key={column.key} className={`px-6 py-4 ${textPrimary} transition-colors duration-300`}>
                    {column.render 
                      ? column.render(item)
                      : (item as any)[column.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
