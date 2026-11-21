import { useState } from 'react';
import { detalleMetodoPago } from '../../clientMock.js';
import { formatearFecha, formatearMoneda } from '../../clientMock.js';

const CLASES_ESTADO = {
  Entregado: 'is-delivered',
  'En preparación': 'is-preparing',
  Cancelado: 'is-cancelled',
};

export default function OrderHistory({ pedidos }) {
  const [pedidoAbierto, setPedidoAbierto] = useState(null);

  if (pedidos.length === 0) {
    return (
      <div className="client-empty-state">
        <i className="bi bi-receipt" aria-hidden="true" />
        <h2>Aún no tienes pedidos</h2>
        <p>Cuando confirmes un pedido aparecerá aquí con su estado y detalle.</p>
      </div>
    );
  }

  return (
    <div className="client-order-list">
      {pedidos.map((pedido) => {
        const abierto = pedidoAbierto === pedido.id;

        return (
          <article key={pedido.id} className="client-order-card">
            <button
              type="button"
              className="client-order-card__head"
              onClick={() => setPedidoAbierto(abierto ? null : pedido.id)}
              aria-expanded={abierto}
            >
              <span className="client-order-card__id">
                <small>Pedido</small>
                <strong>{pedido.id}</strong>
              </span>
              <span className="client-order-card__date">
                <small>Fecha</small>
                <strong>{formatearFecha(pedido.fecha)}</strong>
              </span>
              <span className="client-order-card__total">
                <small>Total</small>
                <strong>{formatearMoneda(pedido.total)}</strong>
              </span>
              <span className={`client-order-card__status ${CLASES_ESTADO[pedido.estado] ?? ''}`}>
                {pedido.estado}
              </span>
              <i
                className={`bi bi-chevron-down client-order-card__chevron${abierto ? ' is-open' : ''}`}
                aria-hidden="true"
              />
            </button>

            {abierto && (
              <div className="client-order-card__detail">
                <p className="client-order-card__branch">
                  <i className="bi bi-geo-alt" aria-hidden="true" />
                  {pedido.sucursal}
                </p>
                <p className="client-order-card__payment">
                  <i
                    className={`bi ${detalleMetodoPago(pedido.metodoPago).icono}`}
                    aria-hidden="true"
                  />
                  Pagado con {detalleMetodoPago(pedido.metodoPago).etiqueta}
                </p>
                <ul>
                  {pedido.items.map((item, indice) => (
                    <li key={`${item.nombre}-${indice}`}>
                      <span>
                        {item.cantidad} × {item.nombre}
                      </span>
                      <strong>{formatearMoneda(item.subtotal)}</strong>
                    </li>
                  ))}
                </ul>
                <div className="client-order-card__detail-total">
                  <span>Total del pedido</span>
                  <strong>{formatearMoneda(pedido.total)}</strong>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
