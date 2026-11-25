import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerSidebar from '../../components/manager/ManagerSidebar.jsx';
import ManagerTopbar from '../../components/manager/ManagerTopbar.jsx';
import ManagerCashRegister from '../../components/manager/ManagerCashRegister.jsx';
import CashierSummary from '../../components/cashier/CashierSummary.jsx';
import CashierCashFlow from '../../components/cashier/CashierCashFlow.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/manager.css';

export default function ManagerPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [seccion, setSeccion] = useState('resumen');
  const [feedback, setFeedback] = useState(null);

  const {
    ordenesSucursal,
    sucursalId,
    sucursal,
    sucursales,
    seleccionarSucursal,
    caja,
    cajaAbierta,
    abrirCaja,
    cerrarCaja,
  } = useOrders();

  const ventasTurno = useMemo(
    () =>
      ordenesSucursal
        .filter((orden) => orden.ventaTurno)
        .reduce((total, orden) => total + orden.total, 0),
    [ordenesSucursal]
  );

  const handleAbrir = async (monto) => {
    setFeedback(null);
    try {
      await abrirCaja(sucursalId, monto);
      setFeedback({ type: 'success', text: 'Caja abierta correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error?.message ?? 'No se pudo abrir la caja.' });
    }
  };

  const handleCerrar = async (monto) => {
    setFeedback(null);
    try {
      await cerrarCaja(sucursalId, monto);
      setFeedback({ type: 'success', text: 'Caja cerrada correctamente.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error?.message ?? 'No se pudo cerrar la caja.' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="cashier-shell">
      <ManagerSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
        onLogout={handleLogout}
      />

      <div className="cashier-workspace">
        <ManagerTopbar
          seccion={seccion}
          sucursalId={sucursalId}
          sucursales={sucursales}
          cajaAbierta={cajaAbierta}
          onCambiarSucursal={seleccionarSucursal}
        />

        <main className="cashier-main">
          {feedback && (
            <div className={`cashier-caja-banner is-${feedback.type}`}>
              <i
                className={`bi ${
                  feedback.type === 'success'
                    ? 'bi-check-circle-fill'
                    : 'bi-exclamation-triangle-fill'
                }`}
              />
              <div>
                <strong>{feedback.text}</strong>
              </div>
            </div>
          )}

          {seccion === 'resumen' && (
            <CashierSummary
              ordenes={ordenesSucursal}
              ventasTurno={ventasTurno}
              sucursal={sucursal}
            />
          )}

          {seccion === 'flujo' && (
            <CashierCashFlow ordenes={ordenesSucursal} sucursal={sucursal} />
          )}

          {seccion === 'caja' && (
            <ManagerCashRegister
              sucursal={sucursal}
              caja={caja}
              onAbrir={handleAbrir}
              onCerrar={handleCerrar}
            />
          )}
        </main>
      </div>
    </div>
  );
}
