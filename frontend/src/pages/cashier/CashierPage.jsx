
import { useMemo, useState } from 'react';
import CashierSidebar from '../../components/cashier/CashierSidebar.jsx';
import CashierTopbar from '../../components/cashier/CashierTopbar.jsx';
import CashierSummary from '../../components/cashier/CashierSummary.jsx';
import CashierPOS from '../../components/cashier/CashierPOS.jsx';
import CashierOrders from '../../components/cashier/CashierOrders.jsx';
import CashierCashFlow from '../../components/cashier/CashierCashFlow.jsx';
import { PRODUCTOS_CAJERO } from '../../mocks/CashierMocks.js';

const SUCURSAL_CAJERO = 'Centro Histórico';

const ORDENES_INICIALES = [
  {
    id: 'ORD-1048',
    cliente: 'María López',
    origen: 'Presencial',
    hora: '09:42',
    estado: 'Pendiente',
    sucursal: SUCURSAL_CAJERO,
    productos: [
      { nombre: 'Café Americano', cantidad: 2 },
      { nombre: 'Croissant', cantidad: 1 },
    ],
    total: 7.50,
    metodoPago: 'efectivo',
    ventaTurno: false,
  },
  {
    id: 'ORD-1047',
    cliente: 'Carlos Méndez',
    origen: 'En línea',
    hora: '09:35',
    estado: 'Aceptado',
    sucursal: SUCURSAL_CAJERO,
    productos: [
      { nombre: 'Capuchino', cantidad: 1 },
      { nombre: 'Cheesecake', cantidad: 2 },
    ],
    total: 10.50,
    metodoPago: 'tarjeta',
    ventaTurno: false,
  },
  {
    id: 'ORD-1046',
    cliente: 'Ana Martínez',
    origen: 'Presencial',
    hora: '09:28',
    estado: 'En preparación',
    sucursal: SUCURSAL_CAJERO,
    productos: [
      { nombre: 'Latte', cantidad: 1 },
      { nombre: 'Pan artesanal', cantidad: 2 },
    ],
    total: 7.25,
    metodoPago: 'efectivo',
    ventaTurno: false,
  },
  {
    id: 'ORD-1045',
    cliente: 'José Hernández',
    origen: 'En línea',
    hora: '09:15',
    estado: 'Listo',
    sucursal: SUCURSAL_CAJERO,
    productos: [
      { nombre: 'Limonada', cantidad: 2 },
      { nombre: 'Croissant', cantidad: 2 },
    ],
    total: 9.00,
    metodoPago: 'chivo',
    ventaTurno: false,
  },
  {
    id: 'ORD-1044',
    cliente: 'Laura García',
    origen: 'Presencial',
    hora: '09:03',
    estado: 'Entregado',
    sucursal: SUCURSAL_CAJERO,
    productos: [
      { nombre: 'Café Americano', cantidad: 1 },
    ],
    total: 2.50,
    metodoPago: 'efectivo',
    ventaTurno: false,
  },
];

export default function CashierPage() {
  const [seccion, setSeccion] = useState('resumen');
  const [ordenes, setOrdenes] = useState(ORDENES_INICIALES);

  const [productos, setProductos] = useState(() =>
    PRODUCTOS_CAJERO.map((producto) => ({
      ...producto,
      stockPorSucursal: {
        [SUCURSAL_CAJERO]: producto.stock ?? 0,
      },
    }))
  );

  const productosSucursal = useMemo(
    () =>
      productos.map((producto) => {
        const stock =
          producto.stockPorSucursal[SUCURSAL_CAJERO] ?? 0;

        return {
          ...producto,
          stock,
          disponible: stock > 0,
        };
      }),
    [productos]
  );

  const ordenesSucursal = useMemo(
    () =>
      ordenes.filter(
        (orden) => orden.sucursal === SUCURSAL_CAJERO
      ),
    [ordenes]
  );

  const registrarPedido = (datosPedido) => {
    const ahora = new Date();

    const nuevoPedido = {
      id: `ORD-${Date.now()}`,
      cliente: datosPedido.cliente.trim() || 'Cliente presencial',
      origen: 'Presencial',
      hora: ahora.toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      estado: 'Pendiente',
      sucursal: SUCURSAL_CAJERO,
      productos: datosPedido.productos,
      total: datosPedido.total,
      metodoPago: datosPedido.metodoPago,
      ventaTurno: true,
    };

    setOrdenes((actuales) => [nuevoPedido, ...actuales]);
  };

  const descontarStock = (productosVendidos) => {
    setProductos((actuales) =>
      actuales.map((producto) => {
        const vendido = productosVendidos.find(
          (item) => item.id === producto.id
        );

        if (!vendido) return producto;

        const stockActual =
          producto.stockPorSucursal[SUCURSAL_CAJERO] ?? 0;

        return {
          ...producto,
          stockPorSucursal: {
            ...producto.stockPorSucursal,
            [SUCURSAL_CAJERO]: Math.max(
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

  return (
    <div className="cashier-shell">
      <CashierSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
      />

      <div className="cashier-workspace">
        <CashierTopbar seccion={seccion} />

        <main className="cashier-main">
          {seccion === 'resumen' && (
            <CashierSummary
              ordenes={ordenesSucursal}
              ventasTurno={ventasTurno}
              sucursal={SUCURSAL_CAJERO}
            />
          )}

          {seccion === 'pos' && (
            <CashierPOS
              sucursal={SUCURSAL_CAJERO}
              productos={productosSucursal}
              onDescontarStock={descontarStock}
              onRegistrarPedido={registrarPedido}
            />
          )}

          {seccion === 'ordenes' && (
            <CashierOrders ordenes={ordenesSucursal} />
          )}

          {seccion === 'flujo' && (
            <CashierCashFlow
              ordenes={ordenesSucursal}
              sucursal={SUCURSAL_CAJERO}
            />
          )}
        </main>
      </div>
    </div>
  );
}
