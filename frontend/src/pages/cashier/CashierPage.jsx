import { useState } from 'react';
import CashierSidebar from '../../components/cashier/CashierSidebar.jsx';
import CashierTopbar from '../../components/cashier/CashierTopbar.jsx';
import CashierSummary from '../../components/cashier/CashierSummary.jsx';
import CashierPOS from '../../components/cashier/CashierPOS.jsx';
import CashierOrders from '../../components/cashier/CashierOrders.jsx';
import CashierRegister from '../../components/cashier/CashierRegister.jsx';

const ORDENES_INICIALES = [
  {
    id: 'ORD-1048',
    cliente: 'María López',
    origen: 'Presencial',
    hora: '09:42',
    estado: 'Pendiente',
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
    productos: [
      { nombre: 'Café Americano', cantidad: 1 },
    ],
    total: 2.50,
    metodoPago: 'efectivo',
    ventaTurno: false,
  },
];

const ESTADOS_ACTIVOS = [
  'Pendiente',
  'Aceptado',
  'En preparación',
  'Listo',
];

export default function CashierPage() {
  const [seccion, setSeccion] = useState('resumen');
  const [ordenes, setOrdenes] = useState(ORDENES_INICIALES);

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
      productos: datosPedido.productos,
      total: datosPedido.total,
      metodoPago: datosPedido.metodoPago,
      ventaTurno: true,
    };

    setOrdenes((actuales) => [nuevoPedido, ...actuales]);
  };

  const actualizarEstado = (id, nuevoEstado) => {
    setOrdenes((actuales) =>
      actuales.map((orden) =>
        orden.id === id ? { ...orden, estado: nuevoEstado } : orden
      )
    );
  };

  const ventasTurno = ordenes
    .filter((orden) => orden.ventaTurno)
    .reduce((total, orden) => total + orden.total, 0);

  const ventasEfectivo = ordenes
    .filter(
      (orden) => orden.ventaTurno && orden.metodoPago === 'efectivo'
    )
    .reduce((total, orden) => total + orden.total, 0);

  const pedidosActivos = ordenes.filter((orden) =>
    ESTADOS_ACTIVOS.includes(orden.estado)
  ).length;

  return (
    <div className="cashier-shell">
      <CashierSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
      />

      <div className="cashier-workspace">
        <CashierTopbar seccion={seccion} />

        <main className="cashier-main">
          {/* Se mantienen montadas para conservar el estado al navegar. */}
          <div hidden={seccion !== 'resumen'}>
            <CashierSummary
              ordenes={ordenes}
              ventasTurno={ventasTurno}
            />
          </div>

          <div hidden={seccion !== 'pos'}>
            <CashierPOS onRegistrarPedido={registrarPedido} />
          </div>

          <div hidden={seccion !== 'ordenes'}>
            <CashierOrders
              ordenes={ordenes}
              onActualizarEstado={actualizarEstado}
            />
          </div>

          <div hidden={seccion !== 'caja'}>
            <CashierRegister
              ventasTurno={ventasTurno}
              ventasEfectivo={ventasEfectivo}
              pedidosActivos={pedidosActivos}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
