import { Users, Package, ShoppingBag, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { User } from '../../App';

interface DashboardHomeProps {
  user: User;
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const isAdmin = user.role === 'admin';
  const isEmpleado = user.role === 'empleado';
  
  const [productosView, setProductosView] = useState<'mas-vendidos' | 'menos-vendidos'>('mas-vendidos');
  const [serviciosView, setServiciosView] = useState<'mas-solicitados' | 'menos-solicitados'>('mas-solicitados');

  const stats = [
    { label: 'Usuarios', value: '245', icon: Users, color: '#93C5FD', visible: isAdmin },
    { label: 'Productos', value: '1,234', icon: Package, color: '#A7F3D0', visible: true },
    { label: 'Ventas Hoy', value: '$12,450', icon: ShoppingBag, color: '#C4B5FD', visible: isAdmin || isEmpleado },
    { label: 'Citas Pendientes', value: '18', icon: Calendar, color: '#FBCFE8', visible: true },
    { label: 'Ganancia Mensual', value: '$89,234', icon: DollarSign, color: '#93C5FD', visible: isAdmin },
    { label: 'Crecimiento', value: '+12.5%', icon: TrendingUp, color: '#A7F3D0', visible: isAdmin }
  ].filter(stat => stat.visible);

  // Datos de productos más vendidos
  const productosMasVendidos = [
    { nombre: 'Paracetamol 500mg', ventas: 450, stock: 1200 },
    { nombre: 'Ibuprofeno 400mg', ventas: 380, stock: 950 },
    { nombre: 'Amoxicilina 500mg', ventas: 320, stock: 680 },
    { nombre: 'Loratadina 10mg', ventas: 290, stock: 540 },
    { nombre: 'Omeprazol 20mg', ventas: 250, stock: 720 }
  ];

  // Datos de productos menos vendidos
  const productosMenosVendidos = [
    { nombre: 'Multivitamínico Senior', ventas: 15, stock: 320 },
    { nombre: 'Jarabe Tos Infantil', ventas: 12, stock: 180 },
    { nombre: 'Crema Dermatológica', ventas: 10, stock: 95 },
    { nombre: 'Suplemento Calcio', ventas: 8, stock: 150 },
    { nombre: 'Gotas Oculares', ventas: 5, stock: 78 }
  ];

  // Datos de servicios más solicitados
  const serviciosMasSolicitados = [
    { nombre: 'Consulta General', cantidad: 120, precio: '$50' },
    { nombre: 'Toma de Presión', cantidad: 95, precio: '$15' },
    { nombre: 'Inyectables', cantidad: 85, precio: '$20' },
    { nombre: 'Curaciones', cantidad: 65, precio: '$30' },
    { nombre: 'Vacunación', cantidad: 45, precio: '$40' }
  ];

  // Datos de servicios menos solicitados
  const serviciosMenosSolicitados = [
    { nombre: 'Electrocardiograma', cantidad: 8, precio: '$80' },
    { nombre: 'Prueba de Glucosa', cantidad: 6, precio: '$25' },
    { nombre: 'Test de Embarazo', cantidad: 5, precio: '$15' },
    { nombre: 'Nebulización', cantidad: 4, precio: '$35' },
    { nombre: 'Oximetría', cantidad: 3, precio: '$20' }
  ];

  // Datos para gráfico de torta - Ventas por categorías
  const ventasPorCategoria = [
    { nombre: 'Medicamentos', valor: 45000, color: '#63E6BE' },
    { nombre: 'Suplementos', valor: 18000, color: '#93C5FD' },
    { nombre: 'Cuidado Personal', valor: 15000, color: '#C4B5FD' },
    { nombre: 'Servicios', valor: 12000, color: '#FBCFE8' },
    { nombre: 'Otros', valor: 8000, color: '#FCD34D' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Card */}
      <div
        className="p-8 rounded-2xl shadow-sm"
        style={{ background: 'linear-gradient(135deg, #93C5FD 0%, #C4B5FD 100%)' }}
      >
        <h2 className="text-white mb-2">
          ¡Bienvenido, {user.name}!
        </h2>
        <p className="text-white text-lg">
          {isAdmin && 'Panel de administración - Gestiona todo tu sistema'}
          {isEmpleado && 'Panel de empleado - Gestiona ventas y servicios'}
          {user.role === 'cliente' && 'Panel de cliente - Consulta tus compras y citas'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm hover:scale-103 transition-all duration-300 border-2"
              style={{ borderColor: stat.color }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                  <h3 className="m-0" style={{ color: '#374151' }}>{stat.value}</h3>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.color }}
                >
                  <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vista específica para Admin */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de Productos con Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="m-0" style={{ color: '#374151' }}>Productos</h3>
              <select
                value={productosView}
                onChange={(e) => setProductosView(e.target.value as 'mas-vendidos' | 'menos-vendidos')}
                className="px-4 py-2 rounded-xl border-2 transition-all duration-300"
                style={{ 
                  borderColor: '#63E6BE',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                <option value="mas-vendidos">Más Vendidos</option>
                <option value="menos-vendidos">Menos Vendidos</option>
              </select>
            </div>
            <div className="space-y-3">
              {(productosView === 'mas-vendidos' ? productosMasVendidos : productosMenosVendidos).map((producto, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl border-2 hover:scale-102 transition-all duration-300"
                  style={{ borderColor: '#F3F4F6' }}
                >
                  <div className="flex-1">
                    <p className="m-0" style={{ color: '#374151' }}>{producto.nombre}</p>
                    <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>Stock: {producto.stock} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="m-0" style={{ color: '#63E6BE' }}>{producto.ventas}</p>
                    <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>ventas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card de Servicios con Selector */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="m-0" style={{ color: '#374151' }}>Servicios</h3>
              <select
                value={serviciosView}
                onChange={(e) => setServiciosView(e.target.value as 'mas-solicitados' | 'menos-solicitados')}
                className="px-4 py-2 rounded-xl border-2 transition-all duration-300"
                style={{ 
                  borderColor: '#93C5FD',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                <option value="mas-solicitados">Más Solicitados</option>
                <option value="menos-solicitados">Menos Solicitados</option>
              </select>
            </div>
            <div className="space-y-3">
              {(serviciosView === 'mas-solicitados' ? serviciosMasSolicitados : serviciosMenosSolicitados).map((servicio, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-xl border-2 hover:scale-102 transition-all duration-300"
                  style={{ borderColor: '#F3F4F6' }}
                >
                  <div className="flex-1">
                    <p className="m-0" style={{ color: '#374151' }}>{servicio.nombre}</p>
                    <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>Precio: {servicio.precio}</p>
                  </div>
                  <div className="text-right">
                    <p className="m-0" style={{ color: '#93C5FD' }}>{servicio.cantidad}</p>
                    <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>solicitudes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card de Ventas por Categorías - Gráfico de Torta */}
          <div className="bg-white p-6 rounded-2xl shadow-sm lg:col-span-2">
            <h3 className="mb-6" style={{ color: '#374151' }}>Ventas por Categorías</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ nombre, percent }: any) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {ventasPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '2px solid #F3F4F6',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              {ventasPorCategoria.map((categoria, index) => (
                <div 
                  key={index} 
                  className="text-center p-3 rounded-xl"
                  style={{ backgroundColor: categoria.color + '20' }}
                >
                  <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>{categoria.nombre}</p>
                  <p className="m-0" style={{ color: '#374151' }}>${categoria.valor.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h3 className="mb-4" style={{ color: '#374151' }}>Actividad Reciente</h3>
        <div className="space-y-4">
          {[
            { action: 'Nueva venta registrada', time: 'Hace 5 minutos', color: '#A7F3D0' },
            { action: 'Cita agendada', time: 'Hace 15 minutos', color: '#93C5FD' },
            { action: 'Producto agregado', time: 'Hace 1 hora', color: '#C4B5FD' },
            { action: 'Usuario registrado', time: 'Hace 2 horas', color: '#FBCFE8' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 rounded-xl border-2" style={{ borderColor: '#F3F4F6' }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activity.color }} />
              <div className="flex-1">
                <p className="m-0" style={{ color: '#374151' }}>{activity.action}</p>
                <p className="m-0 text-sm" style={{ color: '#9CA3AF' }}>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}