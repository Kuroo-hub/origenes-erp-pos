
import { formatearMonedaCajero } from '../../utils/formatters.js';
import { METODOS_PAGO_CAJERO } from '../../constants/paymentMethods.js';

const ICONOS_METODO = {
  efectivo: 'bi-cash-coin',
  tarjeta: 'bi-credit-card',
  bitcoin: 'bi-currency-bitcoin',
  chivo: 'bi-wallet2',
};

const TIEMPOS_PREPARACION = [10, 15, 20, 30];

export default function CashierCart({
  items,
  cliente,
  onCambiarCliente,
  entrega,
  onCambiarEntrega,
  tiempoPreparacion,
  onCambiarTiempo,
  metodoPago,
  onCambiarMetodo,
  onCambiarCantidad,
  onEliminar,
  onConfirmar,
  cajaAbierta = true,
  sucursal,
}) {
  const cantidadProductos = items.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const subtotal = items.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  const iva = Number((subtotal * 0.13).toFixed(2));
  const totalCalculado = Number((subtotal + iva).toFixed(2));

  return (
    <aside className="cashier-cart">
      <header className="cashier-cart__header">
        <div>
          <h2>Carrito</h2>
          <p>
            {cantidadProductos} productos
            {sucursal ? ` · ${sucursal}` : ''}
          </p>
        </div>

        <span className="cashier-cart__header-icon">
          <i className="bi bi-bag" aria-hidden="true" />
        </span>
      </header>

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-cliente">
          Nombre del cliente (opcional)
        </label>

        <input
          id="cashier-cliente"
          type="text"
          value={cliente}
          onChange={(evento) =>
            onCambiarCliente(evento.target.value)
          }
          placeholder="Nombre del cliente"
          maxLength={80}
        />
      </div>

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-tipo-entrega">
          Tipo de orden
        </label>

        <select
          id="cashier-tipo-entrega"
          value={entrega.tipo}
          onChange={(evento) =>
            onCambiarEntrega('tipo', evento.target.value)
          }
        >
          <option value="local">Dentro del local</option>
          <option value="domicilio">Entrega a domicilio</option>
        </select>
      </div>

      {entrega.tipo === 'domicilio' && (
        <div className="cashier-cart__delivery">
          <label htmlFor="cashier-direccion">
            Dirección de la casa
          </label>
          <input
            id="cashier-direccion"
            type="text"
            value={entrega.direccion}
            onChange={(evento) =>
              onCambiarEntrega('direccion', evento.target.value)
            }
            placeholder="Ej. Colonia Escalón, Calle La Mascota"
            maxLength={120}
          />

          <div className="cashier-cart__delivery-row">
            <div>
              <label htmlFor="cashier-numero-casa">
                Número de casa
              </label>
              <input
                id="cashier-numero-casa"
                type="text"
                value={entrega.numeroCasa}
                onChange={(evento) =>
                  onCambiarEntrega('numeroCasa', evento.target.value)
                }
                placeholder="Ej. 412"
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="cashier-telefono">
                Teléfono
              </label>
              <input
                id="cashier-telefono"
                type="tel"
                value={entrega.telefono}
                onChange={(evento) =>
                  onCambiarEntrega('telefono', evento.target.value)
                }
                placeholder="Ej. 7845-1290"
                maxLength={20}
              />
            </div>
          </div>
        </div>
      )}

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-tiempo">
          Tiempo estimado de preparación
        </label>

        <select
          id="cashier-tiempo"
          value={tiempoPreparacion}
          onChange={(evento) =>
            onCambiarTiempo(Number(evento.target.value))
          }
        >
          {TIEMPOS_PREPARACION.map((minutos) => (
            <option key={minutos} value={minutos}>
              {minutos} min
            </option>
          ))}
        </select>

        <small>Este tiempo se muestra en el panel de cocina.</small>
      </div>

      <div className="cashier-cart__items">
        {items.length === 0 ? (
          <div className="cashier-cart__empty">
            <i className="bi bi-basket3" aria-hidden="true" />
            <strong>Tu carrito está vacío</strong>
            <span>
              Selecciona productos del menú para comenzar.
            </span>
          </div>
        ) : (
          items.map((item) => (
            <article className="cashier-cart-item" key={item.id}>
              <div className="cashier-cart-item__info">
                <strong>{item.nombre}</strong>

                <span>
                  {formatearMonedaCajero(item.precio)} c/u
                </span>

                <small>
                  Subtotal:{' '}
                  {formatearMonedaCajero(
                    item.precio * item.cantidad
                  )}
                </small>
              </div>

              <div className="cashier-cart-item__actions">
                <div className="cashier-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      onCambiarCantidad(item.id, -1)
                    }
                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                  >
                    <i className="bi bi-dash" />
                  </button>

                  <span>{item.cantidad}</span>

                  <button
                    type="button"
                    onClick={() =>
                      onCambiarCantidad(item.id, 1)
                    }
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
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <section className="cashier-cart__payment">
        <h3>Método de pago</h3>

        <div className="cashier-cart__payment-options">
          {METODOS_PAGO_CAJERO.map((metodo) => (
            <label
              key={metodo.id}
              className={`cashier-cart__payment-option ${
                metodoPago === metodo.id ? 'is-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="cashier-metodo-pago"
                value={metodo.id}
                checked={metodoPago === metodo.id}
                onChange={() => onCambiarMetodo(metodo.id)}
              />

              <i
                className={`bi ${
                  ICONOS_METODO[metodo.id] ?? 'bi-wallet2'
                }`}
                aria-hidden="true"
              />

              <span>{metodo.etiqueta}</span>
            </label>
          ))}
        </div>
      </section>

      <div className="cashier-cart__totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatearMonedaCajero(subtotal)}</strong>
        </div>

        <div>
          <span>IVA 13%</span>
          <strong>{formatearMonedaCajero(iva)}</strong>
        </div>

        <div className="cashier-cart__total">
          <span>Total Calculado</span>
          <strong>{formatearMonedaCajero(totalCalculado)}</strong>
        </div>
      </div>

      <button
        type="button"
        className="cashier-cart__confirm"
        disabled={items.length === 0 || !cajaAbierta}
        onClick={onConfirmar}
      >
        <i className="bi bi-check-circle" aria-hidden="true" />
        {cajaAbierta ? 'Registrar venta' : 'Caja cerrada'}
      </button>
    </aside>
  );
}
