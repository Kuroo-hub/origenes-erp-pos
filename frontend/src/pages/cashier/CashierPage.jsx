
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierSidebar from '../../components/cashier/CashierSidebar.jsx';
import CashierTopbar from '../../components/cashier/CashierTopbar.jsx';
import CashierSummary from '../../components/cashier/CashierSummary.jsx';
import CashierPOS from '../../components/cashier/CashierPOS.jsx';
import CashierOrders from '../../components/cashier/CashierOrders.jsx';
import CashierCashFlow from '../../components/cashier/CashierCashFlow.jsx';
import { PRODUCTOS_CAJERO } from '../../mocks/CashierMocks.js';
import { useOrders, SUCURSALES } from '../../context/OrderContext.jsx';

export default function CashierPage() {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState('resumen');
  const {
    ordenesSucursal,
    sucursalId,
    sucursal,
    sucursales,
    seleccionarSucursal,
    registrarPedido,
    cambiarEstado,
  } = useOrders();

  const [productos, setProductos] = useState(() =>
    PRODUCTOS_CAJERO.map((producto) => ({
      ...producto,
      stockPorSucursal: Object.fromEntries(
        SUCURSALES.map((item) => [item.nombre, producto.stock ?? 0])
      ),
    }))
  );

  const productosSucursal = useMemo(
    () =>
      productos.map((producto) => {
        const stock = producto.stockPorSucursal[sucursal] ?? 0;

        return {
          ...producto,
          stock,
          disponible: stock > 0,
        };
      }),
    [productos, sucursal]
  );

  const registrarVenta = (datosPedido) => {
    const ahora = new Date();

    registrarPedido({
      id: `ORD-${Date.now()}`,
      cliente: datosPedido.cliente.trim() || 'Cliente presencial',
      origen: 'Presencial',
      hora: ahora.toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      created_at: ahora.toISOString(),
      estado: 'Pendiente',
      sucursalId,
      sucursal,
      tipoEntrega: datosPedido.tipoEntrega ?? 'local',
      deliveryStatus:
        datosPedido.tipoEntrega === 'domicilio' ? 'PREPARING' : null,
      direccion: datosPedido.direccion ?? '',
      numeroCasa: datosPedido.numeroCasa ?? '',
      telefono: datosPedido.telefono ?? '',
      tiempoObjetivoMin: datosPedido.tiempoPreparacion ?? 15,
      prioridad: 'normal',
      productos: datosPedido.productos.map((producto) => ({
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio ?? 0,
      })),
      total: datosPedido.total,
      metodoPago: datosPedido.metodoPago,
      ventaTurno: true,
    });
  };

  const descontarStock = (productosVendidos) => {
    setProductos((actuales) =>
      actuales.map((producto) => {
        const vendido = productosVendidos.find(
          (item) => item.id === producto.id
        );

        if (!vendido) return producto;

        const stockActual = producto.stockPorSucursal[sucursal] ?? 0;

        return {
          ...producto,
          stockPorSucursal: {
            ...producto.stockPorSucursal,
            [sucursal]: Math.max(
              0,
              stockActual - vendido.cantidad
            ),
          },
        };
      })
    );
  };

  const ventasTurno = ordenesSucursal
    .filter((orden) => orden.ventaTurno)
    .reduce((total, orden) => total + orden.total, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="cashier-shell">
      <CashierSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
        onLogout={handleLogout}
      />

      <div className="cashier-workspace">
        <CashierTopbar
          seccion={seccion}
          sucursalId={sucursalId}
          sucursales={sucursales}
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

          {seccion === 'pos' && (
            <CashierPOS
              sucursal={sucursal}
              productos={productosSucursal}
              onDescontarStock={descontarStock}
              onRegistrarPedido={registrarVenta}
            />
          )}

          {seccion === 'ordenes' && (
            <CashierOrders
              ordenes={ordenesSucursal}
              onCambiarEstado={cambiarEstado}
            />
          )}

          {seccion === 'flujo' && (
            <CashierCashFlow
              ordenes={ordenesSucursal}
              sucursal={sucursal}
            />
          )}
        </main>
      </div>
    </div>
  );
}
