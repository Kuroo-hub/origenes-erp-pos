import AppRoutes from './routes/AppRoutes.jsx';
import { OrderProvider } from './context/OrderContext.jsx';

export default function App() {
  return (
    <OrderProvider>
      <AppRoutes />
    </OrderProvider>
  );
}
