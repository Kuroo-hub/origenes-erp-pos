import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import ClientPage from '../pages/client/ClientPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/cliente" element={<ClientPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
