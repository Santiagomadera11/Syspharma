import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useDarkMode } from '../../hooks/useDarkMode';

export interface ProductoVenta {
  id: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  subtotal: number;
}

interface TablaProductosVentaProps {
  productos: ProductoVenta[];
  onUpdateCantidad: (id: string, cantidad: number) => void;
  onUpdateDescuento: (id: string, descuento: number) => void;
  onEliminar: (id: string) => void;
  readonly?: boolean;
}

export function TablaProductosVenta({
  productos,
  onUpdateCantidad,
  onUpdateDescuento,
  onEliminar,
  readonly = false
}: TablaProductosVentaProps) {
  const { isDark, textPrimary, textSecondary, border, inputBg, inputBorder } = useDarkMode();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-[#14B8A6] to-[#0EA5E9]">
          <tr>
            <th className="text-left p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>Producto</th>
            <th className="text-center p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>Cantidad</th>
            <th className="text-right p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>P. Unitario</th>
            <th className="text-center p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>Desc %</th>
            <th className="text-right p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>Subtotal</th>
            {!readonly && (
              <th className="text-center p-3 text-white" style={{ fontWeight: 600, fontSize: '13px' }}>Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan={readonly ? 5 : 6} className={`text-center p-8 ${textSecondary}`}>
                No hay productos agregados
              </td>
            </tr>
          ) : (
            productos.map((producto) => (
              <tr key={producto.id} className={`border-b ${border} hover:bg-[#14B8A6] hover:bg-opacity-5 transition-colors`}>
                <td className={`p-3 ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  {producto.nombre}
                </td>
                <td className="p-3">
                  {readonly ? (
                    <div className={`text-center ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                      {producto.cantidad}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        onClick={() => onUpdateCantidad(producto.id, producto.cantidad - 1)}
                        disabled={producto.cantidad <= 1}
                        className="h-7 w-7 p-0 rounded-lg bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className={textPrimary} style={{ fontSize: '14px', fontWeight: 700, minWidth: '30px', textAlign: 'center' }}>
                        {producto.cantidad}
                      </span>
                      <Button
                        onClick={() => onUpdateCantidad(producto.id, producto.cantidad + 1)}
                        className="h-7 w-7 p-0 rounded-lg bg-[#14B8A6] hover:bg-[#0D9488] text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </td>
                <td className={`p-3 text-right ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                  ${producto.precioUnitario.toLocaleString('es-CO')}
                </td>
                <td className="p-3">
                  {readonly ? (
                    <div className={`text-center ${textPrimary}`} style={{ fontSize: '13px', fontWeight: 600 }}>
                      {producto.descuentoPorcentaje}%
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={producto.descuentoPorcentaje}
                        onChange={(e) => onUpdateDescuento(producto.id, Number(e.target.value))}
                        className={`w-20 h-8 text-center rounded-lg border ${inputBorder} ${inputBg}`}
                        style={{ fontSize: '13px', fontWeight: 600 }}
                      />
                    </div>
                  )}
                </td>
                <td className="p-3 text-right text-[#14B8A6]" style={{ fontSize: '15px', fontWeight: 700 }}>
                  ${producto.subtotal.toLocaleString('es-CO')}
                </td>
                {!readonly && (
                  <td className="p-3">
                    <div className="flex justify-center">
                      <Button
                        onClick={() => onEliminar(producto.id)}
                        className="h-8 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
