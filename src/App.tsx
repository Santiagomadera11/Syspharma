import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardEmpleado from "./pages/DashboardEmpleado";
import DashboardCliente from "./pages/DashboardCliente";
import CatalogoCliente from "./pages/CatalogoCliente";
import ProductosCliente from "./pages/ProductosCliente";
import Usuarios from "./pages/Usuarios";
import Productos from "./pages/Productos";
import Categorias from "./pages/Categorias";
import Proveedores from "./pages/Proveedores";
import Compras from "./pages/Compras";
import Ventas from "./pages/Ventas";
import Pedidos from "./pages/Pedidos";
import Citas from "./pages/Citas";
import Servicios from "./pages/Servicios";
import Reportes from "./pages/Reportes";
import Configuracion from "./pages/Configuracion";
import MisPedidos from "./pages/MisPedidos";
import MisCitas from "./pages/MisCitas";
import MiPerfil from "./pages/MiPerfil";
import Layout from "./components/layout/Layout";
import { Toaster } from "sonner@2.0.3";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { initializeLocalStorage } from "./utils/localStorage";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  avatar?: string;
}

// Componente que maneja las rutas protegidas
function ProtectedRoutes() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Función para obtener el componente Dashboard según el rol
  const getDashboardComponent = () => {
    const rol = user.rol?.toLowerCase();
    if (rol === "administrador" || rol === "admin") {
      return <Dashboard user={user} />;
    } else if (rol === "empleado") {
      return <DashboardEmpleado user={user} />;
    } else {
      // Para clientes, redirigir al catálogo
      return <Navigate to="/catalogo-cliente" />;
    }
  };

  // Función para verificar permisos
  const hasPermission = (requiredRole: string[]) => {
    const rol = user.rol?.toLowerCase();
    return requiredRole.some((r) => r.toLowerCase() === rol);
  };

  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/dashboard" element={getDashboardComponent()} />

        {/* Rutas solo para Admin */}
        {hasPermission(["administrador", "admin"]) && (
          <>
            <Route path="/usuarios" element={<Usuarios user={user} />} />
            <Route path="/productos" element={<Productos user={user} />} />
            <Route path="/categorias" element={<Categorias user={user} />} />
            <Route path="/proveedores" element={<Proveedores user={user} />} />
            <Route path="/compras" element={<Compras user={user} />} />
            <Route path="/ventas" element={<Ventas user={user} />} />
            <Route path="/pedidos" element={<Pedidos user={user} />} />
            <Route path="/citas" element={<Citas user={user} />} />
            <Route path="/servicios" element={<Servicios user={user} />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route
              path="/configuracion"
              element={<Configuracion user={user} />}
            />
          </>
        )}

        {/* Rutas para Empleado */}
        {hasPermission(["empleado"]) && (
          <>
            <Route path="/compras" element={<Compras user={user} />} />
            <Route path="/ventas" element={<Ventas user={user} />} />
            <Route path="/pedidos" element={<Pedidos user={user} />} />
            <Route path="/productos" element={<Productos user={user} />} />
            <Route path="/citas" element={<Citas user={user} />} />
          </>
        )}

        {/* Rutas para Cliente */}
        {hasPermission(["cliente"]) && (
          <>
            <Route path="/mis-pedidos" element={<MisPedidos user={user} />} />
            <Route path="/mis-citas" element={<MisCitas user={user} />} />
            <Route path="/mi-perfil" element={<MiPerfil user={user} />} />
            <Route
              path="/catalogo-cliente"
              element={<CatalogoCliente user={user} />}
            />
            <Route
              path="/productos-cliente"
              element={<ProductosCliente user={user} />}
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />

        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}

function App() {
  useEffect(() => {
    initializeLocalStorage();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "#374151",
              border: "1px solid #93C5FD",
              borderRadius: "16px",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
