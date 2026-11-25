import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import CashierPage from '../pages/cashier/CashierPage.jsx';
import ChefPage from '../pages/chef/ChefPage.jsx';
import HrPage from '../pages/hr/HrPage.jsx';
import InventoryPage from '../pages/inventory/InventoryPage';
import DeliveryPage from '../pages/delivery/DeliveryPage';
import ManagerPage from '../pages/manager/ManagerPage.jsx';
import OwnerPage from '../pages/owner/OwnerPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cajero" element={<CashierPage />} />
      <Route path="/chef" element={<ChefPage />} />
      <Route path="/rrhh" element={<HrPage />} />
      <Route path="/inventario" element={<InventoryPage />} />
      <Route path="/repartidor" element={<DeliveryPage />} />
      <Route path="/gerencia" element={<OwnerPage />} />
      <Route path="/manager" element={<ManagerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
