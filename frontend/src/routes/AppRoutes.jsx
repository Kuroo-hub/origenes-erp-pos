import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import CashierPage from '../pages/cashier/CashierPage.jsx';
import ChefPage from '../pages/chef/ChefPage.jsx';
import HrPage from '../pages/hr/HrPage.jsx';
import InventoryPage from '../pages/inventory/InventoryPage';
import DeliveryPage from '../pages/delivery/DeliveryPage';
import ManagerPage from '../pages/manager/ManagerPage.jsx';
import OwnerPage from '../pages/owner/OwnerPage';
import ProtectedRoute from './ProtectedRoute.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES, rutaPorRol } from '../auth/roles.js';

const OPERACION = [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.EMPLOYEE];
const INVENTARIO = [ROLES.ADMINISTRATOR, ROLES.MANAGER, ROLES.INVENTORY_MANAGER];
const RRHH = [ROLES.ADMINISTRATOR, ROLES.HR];
const GERENCIA = [ROLES.ADMINISTRATOR, ROLES.MANAGER];

function HomeRedirect() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div className="auth-loading">Verificando sesión...</div>;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Navigate to={rutaPorRol(user?.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/cajero"
        element={
          <ProtectedRoute allowedRoles={OPERACION}>
            <CashierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chef"
        element={
          <ProtectedRoute allowedRoles={OPERACION}>
            <ChefPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rrhh"
        element={
          <ProtectedRoute allowedRoles={RRHH}>
            <HrPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventario"
        element={
          <ProtectedRoute allowedRoles={INVENTARIO}>
            <InventoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/repartidor"
        element={
          <ProtectedRoute allowedRoles={OPERACION}>
            <DeliveryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gerencia"
        element={
          <ProtectedRoute allowedRoles={GERENCIA}>
            <OwnerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={GERENCIA}>
            <ManagerPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
