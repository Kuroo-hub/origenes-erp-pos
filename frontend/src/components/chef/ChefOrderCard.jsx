import { obtenerOrigenPedido } from '../../context/OrderContext.jsx';

export default function ChefOrderCard({ orden, minutos, tiempo, urgencia }) {
  const claseEstado = {
    Pendiente: 'pendiente',
    'En preparación': 'preparando',
  }[orden.estado] ?? 'pendiente';

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

      <footer className="chef-order__footer">
        Objetivo {orden.tiempoObjetivoMin} min · {minutos} min transcurridos
      </footer>
    </article>
  );
}
