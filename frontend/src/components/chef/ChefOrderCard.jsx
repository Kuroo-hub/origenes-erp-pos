import { useState } from 'react';
import { obtenerOrigenPedido } from '../../context/OrderContext.jsx';

export default function ChefOrderCard({ orden, minutos, tiempo, urgencia, onCambiarEstado }) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const claseEstado = {
    Pendiente: 'pendiente',
    'En preparación': 'preparando',
  }[orden.estado] ?? 'pendiente';

  const cambiarEstado = async (nuevoEstado) => {
    setProcesando(true);
    setError('');

    try {
      await onCambiarEstado?.(orden.id, nuevoEstado);
    } catch (caughtError) {
      setError(caughtError?.message ?? 'No se pudo actualizar el estado de la orden.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <article className={`chef-order chef-order--${urgencia.id}`}>
      <header className="chef-order__header">
        <div>
          <p className="chef-order__label">Orden</p>
          <h2 className="chef-order__id">#{orden.id}</h2>
        </div>
        <span className={`chef-order__estado chef-order__estado--${claseEstado}`}>
          {orden.estado}
        </span>
      </header>

      <div className="chef-order__timer">
        <i className="bi bi-stopwatch" aria-hidden="true" />
        <span className="chef-order__timer-value" aria-label={`${minutos} minutos esperando`}>
          {tiempo}
        </span>
        <span className="chef-order__timer-caption">esperando</span>
        <span className={`chef-order__urgencia chef-order__urgencia--${urgencia.id}`}>
          <i className={`bi ${urgencia.icono}`} aria-hidden="true" />
          {urgencia.etiqueta}
        </span>
      </div>

      <div className="chef-order__meta">
        <span>
          <i className="bi bi-geo-alt" aria-hidden="true" />
          {orden.sucursal}
        </span>
        <span>
          <i className="bi bi-receipt" aria-hidden="true" />
          {orden.estadoFacturaTexto || 'Factura'}
        </span>
        <span>
          <i className="bi bi-arrow-repeat" aria-hidden="true" />
          {obtenerOrigenPedido(orden)}
        </span>
        {orden.tipoEntrega === 'domicilio' && (
          <span className="chef-order__delivery">
            <i className="bi bi-truck" aria-hidden="true" />
            Para entrega
          </span>
        )}
        {orden.prioridad === 'alta' && (
          <span className="chef-order__priority">
            <i className="bi bi-fire" aria-hidden="true" />
            Prioridad alta
          </span>
        )}
      </div>

      <ul className="chef-order__items">
        {orden.productos.map((item, indice) => (
          <li key={`${item.nombre}-${indice}`} className="chef-order__item">
            <span className="chef-order__quantity">{item.cantidad}×</span>
            <span className="chef-order__item-name">{item.nombre}</span>
          </li>
        ))}
      </ul>

      {error && (
        <div className="chef-order__error" role="alert">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          {error}
        </div>
      )}

      <footer className="chef-order__footer">
        <span>Objetivo {orden.tiempoObjetivoMin} min · {minutos} min transcurridos</span>
        {orden.estado === 'Pendiente' && (
          <button
            type="button"
            className="chef-order__action"
            onClick={() => cambiarEstado('En preparación')}
            disabled={procesando}
          >
            <i className="bi bi-play-circle" aria-hidden="true" />
            {procesando ? 'Actualizando...' : 'Iniciar preparación'}
          </button>
        )}
        {orden.estado === 'En preparación' && (
          <button
            type="button"
            className="chef-order__action chef-order__action--ready"
            onClick={() => cambiarEstado('Listo')}
            disabled={procesando}
          >
            <i className="bi bi-check2-circle" aria-hidden="true" />
            {procesando ? 'Actualizando...' : 'Marcar listo'}
          </button>
        )}
      </footer>
    </article>
  );
}
