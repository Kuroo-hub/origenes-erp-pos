import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import ClientPage from '../pages/client/ClientPage.jsx';
import CashierPage from '../pages/cashier/CashierPage.jsx';
import HrPage from '../pages/hr/HrPage.jsx';
import InventoryPage from '../pages/inventory/InventoryPage';
import DeliveryPage from '../pages/delivery/DeliveryPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/cliente" element={<ClientPage />} />
      <Route path="/cajero" element={<CashierPage />} />
            <Route path="/rrhh" element={<HrPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/inventario" element={<InventoryPage />} />
      <Route path="/repartidor" element={<DeliveryPage />} />
    </Routes>
  );
}
