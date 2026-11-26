
import { formatearMonedaCajero } from '../../utils/formatters.js';
import { METODOS_PAGO_CAJERO } from '../../constants/paymentMethods.js';
import { TIEMPOS_PREPARACION } from '../../utils/cashierInvoiceValidation.js';

const ICONOS_METODO = {
  efectivo: 'bi-cash-coin',
  tarjeta: 'bi-credit-card',
  bitcoin: 'bi-currency-bitcoin',
  chivo: 'bi-wallet2',
};

const REFERENCIAS_PAGO = {
  tarjeta: 'Ej. Autorización 482910',
  bitcoin: 'Ej. ID de transacción bc1q...',
  chivo: 'Ej. Número de transacción CHV-12345',
};

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
  referenciaPago,
  onCambiarReferencia,
  errores = {},
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

      <p className="cashier-cart__required-note">
        <i className="bi bi-exclamation-circle" aria-hidden="true" />
        Todos los campos son obligatorios para emitir la factura.
      </p>

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-cliente">
          Nombre del cliente *
        </label>

        <input
          id="cashier-cliente"
          type="text"
          className={errores.cliente ? 'is-invalid' : ''}
          value={cliente}
          onChange={(evento) =>
            onCambiarCliente(evento.target.value)
          }
          placeholder="Nombre y apellido del cliente"
          maxLength={80}
          aria-invalid={Boolean(errores.cliente)}
        />
        {errores.cliente && (
          <span className="cashier-cart__error" role="alert">
            {errores.cliente}
          </span>
        )}
      </div>

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-tipo-entrega">
          Tipo de orden *
        </label>

        <select
          id="cashier-tipo-entrega"
          className={errores.tipoEntrega ? 'is-invalid' : ''}
          value={entrega.tipo}
          onChange={(evento) =>
            onCambiarEntrega('tipo', evento.target.value)
          }
          aria-invalid={Boolean(errores.tipoEntrega)}
        >
          <option value="">Selecciona el tipo de orden</option>
          <option value="local">Dentro del local</option>
          <option value="domicilio">Entrega a domicilio</option>
        </select>
        {errores.tipoEntrega && (
          <span className="cashier-cart__error" role="alert">
            {errores.tipoEntrega}
          </span>
        )}
      </div>

      {entrega.tipo === 'domicilio' && (
        <div className="cashier-cart__delivery">
          <label htmlFor="cashier-direccion">
            Dirección de la casa *
          </label>
          <input
            id="cashier-direccion"
            type="text"
            className={errores.direccion ? 'is-invalid' : ''}
            value={entrega.direccion}
            onChange={(evento) =>
              onCambiarEntrega('direccion', evento.target.value)
            }
            placeholder="Ej. Colonia Escalón, Calle La Mascota"
            maxLength={120}
            aria-invalid={Boolean(errores.direccion)}
          />
          {errores.direccion && (
            <span className="cashier-cart__error" role="alert">
              {errores.direccion}
            </span>
          )}

          <div className="cashier-cart__delivery-row">
            <div>
              <label htmlFor="cashier-numero-casa">
                Número de casa *
              </label>
              <input
                id="cashier-numero-casa"
                type="text"
                className={errores.numeroCasa ? 'is-invalid' : ''}
                value={entrega.numeroCasa}
                onChange={(evento) =>
                  onCambiarEntrega('numeroCasa', evento.target.value)
                }
                placeholder="Ej. 412"
                maxLength={20}
                aria-invalid={Boolean(errores.numeroCasa)}
              />
              {errores.numeroCasa && (
                <span className="cashier-cart__error" role="alert">
                  {errores.numeroCasa}
                </span>
              )}
            </div>

            <div>
              <label htmlFor="cashier-telefono">
                Teléfono *
              </label>
              <input
                id="cashier-telefono"
                type="tel"
                className={errores.telefono ? 'is-invalid' : ''}
                value={entrega.telefono}
                onChange={(evento) =>
                  onCambiarEntrega('telefono', evento.target.value)
                }
                placeholder="Ej. 7845-1290"
                maxLength={20}
                aria-invalid={Boolean(errores.telefono)}
              />
              {errores.telefono && (
                <span className="cashier-cart__error" role="alert">
                  {errores.telefono}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="cashier-cart__customer">
        <label htmlFor="cashier-tiempo">
          Tiempo estimado de preparación *
        </label>

        <select
          id="cashier-tiempo"
          className={errores.tiempoPreparacion ? 'is-invalid' : ''}
          value={tiempoPreparacion}
          onChange={(evento) =>
            onCambiarTiempo(evento.target.value)
          }
          aria-invalid={Boolean(errores.tiempoPreparacion)}
        >
          <option value="">Selecciona el tiempo</option>
          {TIEMPOS_PREPARACION.map((minutos) => (
            <option key={minutos} value={minutos}>
              {minutos} min
            </option>
          ))}
        </select>
        {errores.tiempoPreparacion && (
          <span className="cashier-cart__error" role="alert">
            {errores.tiempoPreparacion}
          </span>
        )}

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
        <h3>Método de pago *</h3>

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

        {errores.metodoPago && (
          <span className="cashier-cart__error" role="alert">
            {errores.metodoPago}
          </span>
        )}

        {metodoPago && metodoPago !== 'efectivo' && (
          <div className="cashier-cart__reference">
            <label htmlFor="cashier-referencia-pago">
              Referencia de pago *
            </label>
            <input
              id="cashier-referencia-pago"
              type="text"
              className={errores.referenciaPago ? 'is-invalid' : ''}
              value={referenciaPago}
              onChange={(evento) =>
                onCambiarReferencia(evento.target.value)
              }
              placeholder={
                REFERENCIAS_PAGO[metodoPago] ?? 'Referencia de pago'
              }
              maxLength={60}
              aria-invalid={Boolean(errores.referenciaPago)}
            />
            {errores.referenciaPago && (
              <span className="cashier-cart__error" role="alert">
                {errores.referenciaPago}
              </span>
            )}
          </div>
        )}
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
