import { useState, useMemo } from 'react';
import { Package, Search, Filter, Eye, Download, Clock, CheckCircle, XCircle, Truck, ShoppingBag } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { usePedidos } from '../hooks/useEntities';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';

interface MisPedidosProps {
  user: any;
}

export default function MisPedidos({ user }: MisPedidosProps) {
  const { isDark, bgCard, textPrimary, textSecondary, border, inputBg, inputBorder } = useDarkMode();
  
  // ✅ Usar hook global para sincronización automática
  const { items: todosPedidos } = usePedidos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filtrar solo pedidos del cliente actual
  const pedidos = useMemo(() => {
    return todosPedidos.filter(p => p.clienteId === user?.id);
  }, [todosPedidos, user?.id]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      case 'Enviado':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'En proceso':
        return { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' };
      case 'Pendiente':
        return { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' };
      case 'Cancelado':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return <CheckCircle className="w-5 h-5" />;
      case 'Enviado':
        return <Truck className="w-5 h-5" />;
      case 'En proceso':
        return <Clock className="w-5 h-5" />;
      case 'Pendiente':
        return <Clock className="w-5 h-5" />;
      case 'Cancelado':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = pedido.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pedido.productos.some(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterEstado === 'todos' || pedido.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const handleVerDetalle = (pedido: any) => {
    setSelectedPedido(pedido);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className={`${textPrimary} transition-colors duration-300`} style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Mis Pedidos
        </h2>
        <p className={`${textSecondary} mt-1 transition-colors duration-300`} style={{ fontSize: '14px' }}>
          Historial completo de tus compras
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${bgCard} rounded-xl p-5 border ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: '12px' }}>Total Pedidos</p>
              <p className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>{pedidos.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`${bgCard} rounded-xl p-5 border ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: '12px' }}>Entregados</p>
              <p className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
                {pedidos.filter(p => p.estado === 'Entregado').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${bgCard} rounded-xl p-5 border ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: '12px' }}>En Proceso</p>
              <p className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
                {pedidos.filter(p => p.estado === 'En proceso' || p.estado === 'Enviado').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${bgCard} rounded-xl p-5 border ${border}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-500" style={{ fontSize: '16px', fontWeight: 700 }}>$</span>
            </div>
            <div>
              <p className={textSecondary} style={{ fontSize: '12px' }}>Total Gastado</p>
              <p className={textPrimary} style={{ fontSize: '20px', fontWeight: 700 }}>
                ${pedidos.reduce((sum, p) => sum + p.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className={`${bgCard} rounded-xl p-6 border ${border}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textSecondary}`} />
            <Input
              type="text"
              placeholder="Buscar por ID o producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterEstado('todos')}
              className={`rounded-xl ${filterEstado === 'todos' ? 'bg-[#63E6BE] text-white' : 'bg-gray-500/10 text-gray-500'}`}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilterEstado('En proceso')}
              className={`rounded-xl ${filterEstado === 'En proceso' ? 'bg-yellow-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}
            >
              En Proceso
            </Button>
            <Button
              onClick={() => setFilterEstado('Entregado')}
              className={`rounded-xl ${filterEstado === 'Entregado' ? 'bg-green-500 text-white' : 'bg-gray-500/10 text-gray-500'}`}
            >
              Entregados
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {filteredPedidos.map((pedido, index) => {
          const estadoStyle = getEstadoColor(pedido.estado);
          return (
            <motion.div
              key={pedido.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${bgCard} rounded-xl border ${border} overflow-hidden hover:shadow-lg transition-all duration-300`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${estadoStyle.bg} flex items-center justify-center`}>
                      <div className={estadoStyle.text}>
                        {getEstadoIcon(pedido.estado)}
                      </div>
                    </div>
                    <div>
                      <p className={textPrimary} style={{ fontSize: '16px', fontWeight: 700 }}>
                        {pedido.id}
                      </p>
                      <p className={textSecondary} style={{ fontSize: '13px' }}>
                        {pedido.fecha}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${estadoStyle.bg} border ${estadoStyle.border}`}>
                      <span className={`${estadoStyle.text} text-xs`} style={{ fontWeight: 600 }}>
                        {pedido.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {pedido.productos.slice(0, 2).map((producto, idx) => (
                    <div key={`${producto.id}-${idx}`} className="flex items-center justify-between text-sm">
                      <span className={textSecondary}>
                        {producto.nombre} x{producto.cantidad}
                      </span>
                      <span className={textPrimary} style={{ fontWeight: 600 }}>
                        ${producto.precio.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {pedido.productos.length > 2 && (
                    <p className={textSecondary} style={{ fontSize: '12px' }}>
                      +{pedido.productos.length - 2} productos más
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: isDark ? 'rgba(99, 230, 190, 0.1)' : '#e5e7eb' }}>
                  <div>
                    <p className={textSecondary} style={{ fontSize: '12px' }}>Total</p>
                    <p className="text-[#63E6BE]" style={{ fontSize: '22px', fontWeight: 700 }}>
                      ${pedido.total.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerDetalle(pedido)}
                      className="bg-[#63E6BE] hover:bg-[#14B8A6] text-white rounded-xl h-10 px-4 gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </Button>
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-10 px-4 gap-2">
                      <Download className="w-4 h-4" />
                      Factura
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de detalle */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className={`${bgCard} border ${border} max-w-2xl`}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>Detalle del Pedido</DialogTitle>
            <DialogDescription className={textSecondary}>
              Información completa del pedido {selectedPedido?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedPedido && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={textSecondary} style={{ fontSize: '12px' }}>Fecha</p>
                  <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedPedido.fecha}
                  </p>
                </div>
                <div>
                  <p className={textSecondary} style={{ fontSize: '12px' }}>Estado</p>
                  <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedPedido.estado}
                  </p>
                </div>
                <div>
                  <p className={textSecondary} style={{ fontSize: '12px' }}>Método de Pago</p>
                  <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedPedido.metodoPago}
                  </p>
                </div>
                <div>
                  <p className={textSecondary} style={{ fontSize: '12px' }}>Dirección de Envío</p>
                  <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                    {selectedPedido.direccionEnvio}
                  </p>
                </div>
              </div>

              <div>
                <h4 className={textPrimary} style={{ fontSize: '16px', fontWeight: 700 }} className="mb-3">
                  Productos
                </h4>
                <div className="space-y-2">
                  {selectedPedido.productos.map((producto) => (
                    <div key={producto.id} className={`p-3 rounded-xl border ${border} flex items-center justify-between`}>
                      <div>
                        <p className={textPrimary} style={{ fontSize: '14px', fontWeight: 600 }}>
                          {producto.nombre}
                        </p>
                        <p className={textSecondary} style={{ fontSize: '12px' }}>
                          Cantidad: {producto.cantidad}
                        </p>
                      </div>
                      <p className="text-[#63E6BE]" style={{ fontSize: '16px', fontWeight: 700 }}>
                        ${producto.precio.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: isDark ? 'rgba(99, 230, 190, 0.1)' : '#e5e7eb' }}>
                <div className="flex items-center justify-between">
                  <p className={textPrimary} style={{ fontSize: '18px', fontWeight: 700 }}>
                    Total
                  </p>
                  <p className="text-[#63E6BE]" style={{ fontSize: '24px', fontWeight: 700 }}>
                    ${selectedPedido.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}