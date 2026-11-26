
import { formatearMonedaCajero } from '../../utils/formatters.js';
import { obtenerOrigenPedido } from '../../context/OrderContext.jsx';

const obtenerClaseEstado = (estado) => {
  const clases = {
    Pendiente: 'pending',
    'En preparación': 'preparing',
    Listo: 'ready',
    Anulada: 'cancelled',
  };

  return clases[estado] ?? 'pending';
};

export default function CashierSummary({
  ordenes = [],
  ventasTurno = 0,
  sucursal,
}) {
  const pedidosEnPreparacion = ordenes.filter(
    (pedido) => pedido.estado === 'En preparación'
  ).length;

  const pedidosListos = ordenes.filter(
    (pedido) => pedido.estado === 'Listo'
  ).length;

  const indicadores = [
    {
      id: 'ventas',
      titulo: 'Ventas del turno',
      valor: formatearMonedaCajero(ventasTurno),
      detalle: 'Acumulado de ventas registradas',
      icono: 'bi-currency-dollar',
      color: 'primary',
    },
    {
      id: 'preparacion',
      titulo: 'En preparación',
      valor: String(pedidosEnPreparacion).padStart(2, '0'),
      detalle: 'Pedidos en cocina',
      icono: 'bi-clock-history',
      color: 'warning',
    },
    {
      id: 'listos',
      titulo: 'Pedidos listos',
      valor: String(pedidosListos).padStart(2, '0'),
      detalle: 'Listos para entrega',
      icono: 'bi-check2-circle',
      color: 'success',
    },
  ];

  const actividadReciente = ordenes.slice(0, 5);

  return (
    <section className="cashier-summary">
      <header className="cashier-section-header">
        <div>
          <h1>Resumen del turno</h1>
          <p>
            Consulta la actividad y el estado actual de tu jornada.
          </p>
        </div>

        <p className="cashier-summary__branch">
          <strong>Sucursal:</strong> {sucursal}
        </p>
      </header>

      <div className="cashier-indicators">
        {indicadores.map((indicador) => (
          <article
            key={indicador.id}
            className={`cashier-indicator cashier-indicator--${indicador.color}`}
          >
            <div className="cashier-indicator__icon">
              <i
                className={`bi ${indicador.icono}`}
                aria-hidden="true"
              />
            </div>

            <div className="cashier-indicator__content">
              <span>{indicador.titulo}</span>
              <strong>{indicador.valor}</strong>
              <small>{indicador.detalle}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="cashier-activity">
        <div className="cashier-activity__header">
          <div>
            <h2>Actividad reciente</h2>
            <p>
              Últimos pedidos registrados en esta sucursal.
            </p>
          </div>
        </div>

        <div className="cashier-activity__table-wrapper">
          <table className="cashier-activity__table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Origen</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {actividadReciente.map((pedido) => (
                <tr key={pedido.id}>
                  <td>
                    <strong>{pedido.id}</strong>
                  </td>

                  <td>{pedido.cliente}</td>

                  <td>
                    <span className="cashier-orders__origin-text">
                      {obtenerOrigenPedido(pedido)}
                    </span>
                  </td>

                  <td>{pedido.hora}</td>

                  <td>
                    {formatearMonedaCajero(pedido.total)}
                  </td>

                  <td>
                    <span
                      className={`cashier-order-status cashier-order-status--${obtenerClaseEstado(
                        pedido.estado
                      )}`}
                    >
                      {pedido.estado}
                    </span>
                  </td>
                </tr>
              ))}

              {actividadReciente.length === 0 && (
                <tr>
                  <td colSpan="6">
                    No hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
