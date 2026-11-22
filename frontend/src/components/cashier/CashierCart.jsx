
import { formatearMonedaCajero, METODOS_PAGO_CAJERO } from '../../mocks/cashierMocks.js';

export default function CashierCart({
  items,
  cliente,
  onCambiarCliente,
  metodoPago,
  onCambiarMetodo,
  onCambiarCantidad,
  onEliminar,
  onConfirmar,
}) {
  const subtotal = items.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  return (
    <aside className="cashier-cart">
      <div className="cashier-cart__header">
        <div>
          <h2>Pedido actual</h2>
          <p>{items.reduce((total, item) => total + item.cantidad, 0)} productos</p>
        </div>
        <i className="bi bi-cart3" aria-hidden="true" />
      </div>

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-cliente">Nombre del cliente (opcional)</label>
        <input
          id="cashier-cliente"
          type="text"
          value={cliente}
          onChange={(evento) => onCambiarCliente(evento.target.value)}
          placeholder="Nombre del cliente"
          maxLength={80}
        />
      </div>

      <div className="cashier-cart__items">
        {items.length === 0 ? (
          <div className="cashier-cart__empty">
            <i className="bi bi-basket3" aria-hidden="true" />
            <strong>Tu carrito está vacío</strong>
            <span>Selecciona productos del menú para comenzar.</span>
          </div>
        ) : (
          items.map((item) => (
            <article className="cashier-cart-item" key={item.id}>
              <div className="cashier-cart-item__info">
                <strong>{item.nombre}</strong>
                <span>{formatearMonedaCajero(item.precio)}</span>
              </div>

              <div className="cashier-cart-item__actions">
                <div className="cashier-quantity">
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.id, -1)}
                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                  >
                    <i className="bi bi-dash" />
                  </button>

                  <span>{item.cantidad}</span>

                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.id, 1)}
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                  >
                    <i className="bi bi-plus" />
                  </button>
                </div>

                <button
                  type="button"
                  className="cashier-cart-item__remove"
                  onClick={() => onEliminar(item.id)}
                  aria-label={`Eliminar ${item.nombre}`}
                >
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="cashier-cart__payment">
        <label htmlFor="cashier-metodo-pago">Método de pago</label>
        <select
          id="cashier-metodo-pago"
          value={metodoPago}
          onChange={(evento) => onCambiarMetodo(evento.target.value)}
        >
          {METODOS_PAGO_CAJERO.map((metodo) => (
            <option key={metodo.id} value={metodo.id}>
              {metodo.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="cashier-cart__totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatearMonedaCajero(subtotal)}</strong>
        </div>

        <div className="cashier-cart__total">
          <span>Total</span>
          <strong>{formatearMonedaCajero(subtotal)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="cashier-cart__confirm"
        disabled={items.length === 0}
        onClick={onConfirmar}
      >
        <i className="bi bi-check-circle me-2" />
        Confirmar pedido
      </button>
    </aside>
  );
}
