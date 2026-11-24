import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerSidebar from '../../components/manager/ManagerSidebar.jsx';
import ManagerTopbar from '../../components/manager/ManagerTopbar.jsx';
import ManagerCashRegister from '../../components/manager/ManagerCashRegister.jsx';
import CashierSummary from '../../components/cashier/CashierSummary.jsx';
import CashierCashFlow from '../../components/cashier/CashierCashFlow.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import '../../styles/manager.css';

export default function ManagerPage() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('resumen');

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

  const handleLogout = () => {
    localStorage.removeItem('token');
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
              onAbrir={(monto) => abrirCaja(sucursalId, monto)}
              onCerrar={(monto) => cerrarCaja(sucursalId, monto)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
