import AppRoutes from './routes/AppRoutes.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <AppRoutes />
      </OrderProvider>
    </AuthProvider>
  );
}
