import { useMemo, useState } from 'react';
import { Alert } from 'reactstrap';
import { formatearMonedaCajero } from '../../mocks/cashierMocks.js';

const ESTADOS = [
  'Todos',
  'Pendiente',
  'Aceptado',
  'En preparación',
  'Listo',
  'Entregado',
];

const ORIGENES = ['Todos', 'Presencial', 'En línea'];

export default function CashierOrders({ ordenes, onActualizarEstado }) {
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [origenFiltro, setOrigenFiltro] = useState('Todos');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [notificacion, setNotificacion] = useState('');

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((orden) => {
      const coincideBusqueda =
        orden.id.toLowerCase().includes(busqueda.toLowerCase()) ||
        orden.cliente.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEstado =
        estadoFiltro === 'Todos' || orden.estado === estadoFiltro;

      const coincideOrigen =
        origenFiltro === 'Todos' || orden.origen === origenFiltro;

      return coincideBusqueda && coincideEstado && coincideOrigen;
    });
  }, [ordenes, busqueda, estadoFiltro, origenFiltro]);

  const cambiarEstado = (id, nuevoEstado) => {
    onActualizarEstado(id, nuevoEstado);
    setOrdenSeleccionada(null);
    setNotificacion(`${id}: estado actualizado a "${nuevoEstado}".`);
  };

  const obtenerClaseEstado = (estado) => {
    const clases = {
      Pendiente: 'pending',
      Aceptado: 'accepted',
      'En preparación': 'preparing',
      Listo: 'ready',
      Entregado: 'delivered',
    };

    return clases[estado] ?? 'pending';
  };

  return (
    <section className="cashier-orders">
      <header className="cashier-section-header">
        <div>
          <h1>Gestión de órdenes</h1>
          <p>Consulta y administra los pedidos del restaurante.</p>
        </div>

        <div className="cashier-orders__count">
          <strong>{ordenes.length}</strong>
          <span>Órdenes registradas</span>
        </div>
      </header>

      {notificacion && (
        <Alert
          color="success"
          fade={false}
          toggle={() => setNotificacion('')}
        >
          <i className="bi bi-check-circle me-2" />
          {notificacion}
        </Alert>
      )}

      <div className="cashier-orders__filters">
        <div className="cashier-orders__search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por orden o cliente..."
            aria-label="Buscar órdenes"
          />
        </div>

        <select
          value={estadoFiltro}
          onChange={(evento) => setEstadoFiltro(evento.target.value)}
          aria-label="Filtrar por estado"
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado === 'Todos' ? 'Todos los estados' : estado}
            </option>
          ))}
        </select>

        <select
          value={origenFiltro}
          onChange={(evento) => setOrigenFiltro(evento.target.value)}
          aria-label="Filtrar por origen"
        >
          {ORIGENES.map((origen) => (
            <option key={origen} value={origen}>
              {origen === 'Todos' ? 'Todos los orígenes' : origen}
            </option>
          ))}
        </select>
      </div>

      <div className="cashier-orders__table-wrapper">
        <table className="cashier-orders__table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ordenesFiltradas.map((orden) => (
              <tr key={orden.id}>
                <td>
                  <strong className="cashier-orders__id">{orden.id}</strong>
                </td>
                <td>{orden.cliente}</td>
                <td>
                  <span
                    className={`cashier-orders__origin cashier-orders__origin--${
                      orden.origen === 'En línea' ? 'online' : 'local'
                    }`}
                  >
                    <i
                      className={`bi ${
                        orden.origen === 'En línea' ? 'bi-globe' : 'bi-shop'
                      }`}
                      aria-hidden="true"
                    />
                    {orden.origen}
                  </span>
                </td>
                <td>{orden.hora}</td>
                <td>
                  <span
                    className={`cashier-order-status cashier-order-status--${obtenerClaseEstado(
                      orden.estado
                    )}`}
                  >
                    {orden.estado}
                  </span>
                </td>
                <td>
                  <strong>{formatearMonedaCajero(orden.total)}</strong>
                </td>
                <td>
                  <div className="cashier-orders__actions">
                    <button
                      type="button"
                      className="cashier-orders__detail-button"
                      onClick={() => setOrdenSeleccionada(orden)}
                      title="Ver detalle"
                      aria-label={`Ver detalle de ${orden.id}`}
                    >
                      <i className="bi bi-eye" />
                    </button>

                    {orden.estado === 'Pendiente' && (
                      <button
                        type="button"
                        className="cashier-orders__action-button"
                        onClick={() => cambiarEstado(orden.id, 'Aceptado')}
                      >
                        Aceptar
                      </button>
                    )}

                    {orden.estado === 'Listo' && (
                      <button
                        type="button"
                        className="cashier-orders__action-button"
                        onClick={() => cambiarEstado(orden.id, 'Entregado')}
                      >
                        Entregar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {ordenesFiltradas.length === 0 && (
              <tr>
                <td colSpan="7">
                  <div className="cashier-orders__empty">
                    <i className="bi bi-inbox" />
                    <strong>No se encontraron órdenes</strong>
                    <span>Prueba modificando los filtros de búsqueda.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ordenSeleccionada && (
        <div className="cashier-orders__modal-backdrop">
          <section
            className="cashier-orders__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cashier-order-detail-title"
          >
            <div className="cashier-orders__modal-header">
              <div>
                <span>Detalle del pedido</span>
                <h2 id="cashier-order-detail-title">
                  {ordenSeleccionada.id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOrdenSeleccionada(null)}
                aria-label="Cerrar detalle"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="cashier-orders__modal-info">
              <div>
                <span>Cliente</span>
                <strong>{ordenSeleccionada.cliente}</strong>
              </div>
              <div>
                <span>Origen</span>
                <strong>{ordenSeleccionada.origen}</strong>
              </div>
              <div>
                <span>Hora del pedido</span>
                <strong>{ordenSeleccionada.hora}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{ordenSeleccionada.estado}</strong>
              </div>
            </div>

            <h3>Productos solicitados</h3>

            <div className="cashier-orders__modal-products">
              {ordenSeleccionada.productos.map((producto, indice) => (
                <div key={`${producto.nombre}-${indice}`}>
                  <span>{producto.nombre}</span>
                  <strong>x{producto.cantidad}</strong>
                </div>
              ))}
            </div>

            <div className="cashier-orders__modal-total">
              <span>Total del pedido</span>
              <strong>
                {formatearMonedaCajero(ordenSeleccionada.total)}
              </strong>
            </div>

            <button
              type="button"
              className="cashier-orders__modal-close"
              onClick={() => setOrdenSeleccionada(null)}
            >
              Cerrar
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
