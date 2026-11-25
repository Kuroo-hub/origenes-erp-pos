
import { useMemo } from 'react';
import { formatearMonedaCajero } from '../../utils/formatters.js';

const METODOS_PAGO = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  bitcoin: 'Bitcoin',
  chivo: 'Chivo Wallet',
};

export default function CashierCashFlow({
  ordenes = [],
  sucursal,
}) {
  const ventas = useMemo(
    () => ordenes.filter((orden) => orden.ventaTurno),
    [ordenes]
  );

  const totalVentas = ventas.reduce(
    (total, orden) => total + orden.total,
    0
  );

  const ingresosPorMetodo = useMemo(() => {
    return ventas.reduce(
      (acumulado, venta) => {
        const metodo = venta.metodoPago;

        if (metodo in acumulado) {
          acumulado[metodo] += venta.total;
        }

        return acumulado;
      },
      {
        efectivo: 0,
        tarjeta: 0,
        bitcoin: 0,
        chivo: 0,
      }
    );
  }, [ventas]);

  const metodos = [
    {
      id: 'efectivo',
      titulo: 'Ingresos en efectivo',
      icono: 'bi-cash-coin',
    },
    {
      id: 'tarjeta',
      titulo: 'Ingresos con tarjeta',
      icono: 'bi-credit-card',
    },
    {
      id: 'bitcoin',
      titulo: 'Ingresos con Bitcoin',
      icono: 'bi-currency-bitcoin',
    },
    {
      id: 'chivo',
      titulo: 'Ingresos con Chivo Wallet',
      icono: 'bi-wallet2',
    },
  ];

  return (
    <section className="cashier-cashflow">
      <header className="cashier-section-header">
        <div>
          <h1>Flujo de caja</h1>
          <p>
            Consulta las ventas e ingresos registrados en {sucursal}.
          </p>
        </div>
      </header>

      <div className="cashier-cashflow__summary">
        <article className="cashier-cashflow__card">
          <span>Total de ventas</span>
          <strong>
            {formatearMonedaCajero(totalVentas)}
          </strong>
          <small>{ventas.length} ventas registradas en el turno</small>
        </article>

        {metodos.map((metodo) => (
          <article
            className="cashier-cashflow__card"
            key={metodo.id}
          >
            <span>{metodo.titulo}</span>

            <strong>
              {formatearMonedaCajero(
                ingresosPorMetodo[metodo.id]
              )}
            </strong>

            <small>
              <i
                className={`bi ${metodo.icono}`}
                aria-hidden="true"
              />{' '}
              {METODOS_PAGO[metodo.id]}
            </small>
          </article>
        ))}
      </div>

      <section className="cashier-cashflow__movements">
        <div className="cashier-cashflow__heading">
          <div>
            <h2>Ventas registradas</h2>
            <p>
              Historial de ventas realizadas en esta sucursal.
            </p>
          </div>

          <span>{ventas.length} movimientos</span>
        </div>

        {ventas.length === 0 ? (
          <div className="cashier-pos__empty">
            <i className="bi bi-receipt" aria-hidden="true" />
            <strong>Sin ventas registradas</strong>
            <span>
              Las ventas aparecerán aquí cuando se registren desde el punto de venta.
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Método de pago</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>

              <tbody>
                {ventas.map((venta) => (
                  <tr key={venta.id}>
                    <td>
                      <strong>{venta.id}</strong>
                    </td>

                    <td>{venta.hora}</td>

                    <td>{venta.cliente}</td>

                    <td>
                      {METODOS_PAGO[venta.metodoPago] ?? 'Otro'}
                    </td>

                    <td className="text-end">
                      <strong>
                        {formatearMonedaCajero(venta.total)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
