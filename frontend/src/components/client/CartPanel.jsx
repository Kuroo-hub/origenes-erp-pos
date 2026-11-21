import { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import ProductImage from './ProductImage';
import { METODOS_PAGO, detalleMetodoPago } from '../../clientMock.js';
import { formatearMoneda } from '../../clientMock.js';

export default function CartPanel({
  items,
  subtotal,
  total,
  cantidadTotal,
  sucursal,
  cargando,
  metodoGuardado,
  metodoSeleccionado,
  onCambiarMetodo,
  onCambiarCantidad,
  onEliminar,
  onConfirmar,
}) {
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      setConfirmando(false);
    }
  }, [items.length]);

  const opcionesPago = METODOS_PAGO.map((metodo) => {
    let detalle = '';

    if (metodoGuardado?.tipo === metodo.id) {
      if (metodo.id === 'tarjeta') {
        detalle = `Visa •••• ${metodoGuardado.ultimos4}`;
      } else if (metodo.id === 'bitcoin' || metodo.id === 'chivo') {
        detalle = metodoGuardado.identificador;
      }
    }

    return { ...metodo, detalle };
  });

  return (
    <aside className="client-cart" aria-label="Carrito de compras">
      <header className="client-cart__header">
        <div>
          <h2 className="client-cart__title">Carrito</h2>
          <p className="client-cart__subtitle">
            {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'} · {sucursal}
          </p>
        </div>
        <span className="client-cart__icon">
          <i className="bi bi-bag" aria-hidden="true" />
        </span>
      </header>

      <div className="client-cart__list">
        {items.length === 0 ? (
          <div className="client-cart__empty">
            <i className="bi bi-bag-heart" aria-hidden="true" />
            <p>Tu carrito está vacío.</p>
            <span>Agrega productos del menú para comenzar.</span>
          </div>
        ) : (
          items.map((item) => (
            <article key={item.productoId} className="client-cart-item">
              <div className="client-cart-item__image">
                <ProductImage variant={item.variant} color={item.color} nombre={item.nombre} />
              </div>

              <div className="client-cart-item__info">
                <strong>{item.nombre}</strong>
                <span>{formatearMoneda(item.precioUnitario)} c/u</span>
                <div className="client-cart-item__quantity">
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.productoId, -1)}
                    disabled={item.cantidad <= 1 || cargando}
                    aria-label={`Reducir cantidad de ${item.nombre}`}
                  >
                    <i className="bi bi-dash" aria-hidden="true" />
                  </button>
                  <span aria-label={`Cantidad: ${item.cantidad}`}>{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.productoId, 1)}
                    disabled={cargando}
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                  >
                    <i className="bi bi-plus" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="client-cart-item__actions">
                <strong>{formatearMoneda(item.subtotal)}</strong>
                <button
                  type="button"
                  className="client-cart-item__remove"
                  onClick={() => onEliminar(item.productoId)}
                  disabled={cargando}
                  aria-label={`Eliminar ${item.nombre} del carrito`}
                >
                  <i className="bi bi-trash3" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <footer className="client-cart__footer">
        <fieldset className="client-cart__payment">
          <legend>Método de pago</legend>
          <div className="client-cart__payment-options">
            {opcionesPago.map((opcion) => (
              <label
                key={opcion.id}
                className={`client-payment-option${
                  metodoSeleccionado === opcion.id ? ' is-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="metodo-pago"
                  value={opcion.id}
                  checked={metodoSeleccionado === opcion.id}
                  onChange={() => onCambiarMetodo(opcion.id)}
                  disabled={cargando}
                />
                <i className={`bi ${opcion.icono}`} aria-hidden="true" />
                <span>
                  {opcion.etiqueta}
                  {opcion.detalle && <small>{opcion.detalle}</small>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="client-cart__totals">
          <div>
            <span>Subtotal</span>
            <strong>{formatearMoneda(subtotal)}</strong>
          </div>
          <div className="client-cart__total">
            <span>Total</span>
            <strong>{formatearMoneda(total)}</strong>
          </div>
        </div>

        {confirmando ? (
          <div className="client-cart__confirm">
            <p>
              ¿Confirmar con {detalleMetodoPago(metodoSeleccionado).etiqueta}?
            </p>
            <div>
              <Button
                type="button"
                color="light"
                size="sm"
                onClick={() => setConfirmando(false)}
                disabled={cargando}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                color="success"
                size="sm"
                onClick={() => {
                  onConfirmar();
                  setConfirmando(false);
                }}
                disabled={cargando}
              >
                {cargando ? 'Procesando…' : 'Sí, confirmar'}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            className="client-confirm-button"
            onClick={() => setConfirmando(true)}
            disabled={items.length === 0 || cargando}
          >
            <i className="bi bi-check2-circle" aria-hidden="true" />
            {cargando ? 'Confirmando…' : 'Confirmar pedido'}
          </Button>
        )}
      </footer>
    </aside>
  );
}
