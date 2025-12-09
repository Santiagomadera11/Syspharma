import { forwardRef } from 'react';
import { ProductoVenta } from './TablaProductosVenta';

interface TicketImprimibleProps {
  venta: {
    codigo: string;
    fecha: Date;
    cliente: string;
    productos: ProductoVenta[];
    subtotal: number;
    descuentoTotal: number;
    iva: number;
    total: number;
    metodoPago?: string;
  };
}

export const TicketImprimible = forwardRef<HTMLDivElement, TicketImprimibleProps>(
  ({ venta }, ref) => {
    return (
      <div ref={ref} className="bg-white text-black p-8 max-w-3xl mx-auto">
        {/* Encabezado */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-3xl font-bold text-[#14B8A6] mb-2">SysPharma</h1>
          <p className="text-sm">NIT: 900.123.456-7</p>
          <p className="text-sm">Calle 123 #45-67, Bogotá D.C.</p>
          <p className="text-sm">Tel: (601) 234-5678 | Email: info@syspharma.com</p>
          <p className="text-sm mt-2 font-semibold">FACTURA DE VENTA</p>
        </div>

        {/* Información de venta */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><strong>Factura N°:</strong> {venta.codigo}</p>
            <p><strong>Fecha:</strong> {venta.fecha.toLocaleDateString('es-ES')}</p>
            <p><strong>Hora:</strong> {venta.fecha.toLocaleTimeString('es-ES')}</p>
          </div>
          <div>
            <p><strong>Cliente:</strong> {venta.cliente}</p>
            {venta.metodoPago && (
              <p><strong>Método de Pago:</strong> {venta.metodoPago}</p>
            )}
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-black">
              <tr>
                <th className="text-left py-2">Producto</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">P. Unit.</th>
                <th className="text-center py-2">Desc%</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.productos.map((producto, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-2">{producto.nombre}</td>
                  <td className="text-center py-2">{producto.cantidad}</td>
                  <td className="text-right py-2">${producto.precioUnitario.toLocaleString('es-CO')}</td>
                  <td className="text-center py-2">{producto.descuentoPorcentaje}%</td>
                  <td className="text-right py-2">${producto.subtotal.toLocaleString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="border-t-2 border-black pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">${venta.subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Descuento:</span>
                <span className="font-semibold">-${venta.descuentoTotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%):</span>
                <span className="font-semibold">${venta.iva.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between border-t-2 border-black pt-2 text-lg">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold text-[#14B8A6]">${venta.total.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Código QR Placeholder */}
        <div className="mt-8 text-center">
          <div className="inline-block border-2 border-gray-300 p-4">
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              Código QR
            </div>
          </div>
          <p className="text-xs mt-2">Escanea para verificar la factura</p>
        </div>

        {/* Pie de página */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs">
          <p className="font-semibold">¡Gracias por su compra!</p>
          <p className="mt-2">Esta es una representación impresa de la factura electrónica</p>
          <p>Para cualquier reclamación conserve este documento</p>
        </div>

        {/* Estilos de impresión */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>
      </div>
    );
  }
);

TicketImprimible.displayName = 'TicketImprimible';
