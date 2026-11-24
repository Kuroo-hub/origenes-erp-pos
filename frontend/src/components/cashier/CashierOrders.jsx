
import { useMemo, useState } from 'react';
import { formatearMonedaCajero } from '../../mocks/CashierMocks.js';

const ESTADOS = [
  'Todos',
  'Pendiente',
  'Aceptado',
  'En preparación',
  'Listo',
  'Entregado',
];

const ESTADOS_CAMBIO = ESTADOS.filter((estado) => estado !== 'Todos');

const obtenerClaseEstado = (estado) => {
  const clases = {
    Pendiente: 'cashier-order-status--pending',
    Aceptado: 'cashier-order-status--accepted',
    'En preparación': 'cashier-order-status--preparing',
    Listo: 'cashier-order-status--ready',
    Entregado: 'cashier-order-status--delivered',
  };

  return clases[estado] ?? '';
};

export default function CashierOrders({ ordenes = [], onCambiarEstado }) {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [origen, setOrigen] = useState('Todos');
  const [idSeleccionada, setIdSeleccionada] = useState(null);

  const ordenSeleccionada =
    ordenes.find((orden) => orden.id === idSeleccionada) ?? null;

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((orden) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        orden.id.toLowerCase().includes(texto) ||
        orden.cliente.toLowerCase().includes(texto);

      const coincideEstado =
        estado === 'Todos' || orden.estado === estado;

      const coincideOrigen =
        origen === 'Todos' || orden.origen === origen;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideOrigen
      );
    });
  }, [ordenes, busqueda, estado, origen]);

  const cambiarEstadoOrden = (id, nuevoEstado) => {
    onCambiarEstado?.(id, nuevoEstado);
  };

  return (
    <section className="cashier-orders">
      <header className="cashier-section-header">
        <div>
          <h1>Pedidos</h1>
          <p>Consulta y actualiza los pedidos registrados en tu sucursal.</p>
        </div>
      </header>

      <div className="cashier-orders__filters">
        <div className="cashier-pos__search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por código o cliente..."
            aria-label="Buscar pedidos"
          />
        </div>

        <select
          value={estado}
          onChange={(evento) => setEstado(evento.target.value)}
          aria-label="Filtrar por estado"
        >
          {ESTADOS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion === 'Todos' ? 'Todos los estados' : opcion}
            </option>
          ))}
        </select>

        <select
          value={origen}
          onChange={(evento) => setOrigen(evento.target.value)}
          aria-label="Filtrar por origen"
        >
          <option value="Todos">Todos los orígenes</option>
          <option value="Presencial">Presencial</option>
          <option value="En línea">En línea</option>
        </select>
      </div>

      <div className="cashier-orders__table-wrapper">
        <table className="cashier-orders__table">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Origen</th>
              <th>Hora</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Detalle</th>
            </tr>
          </thead>

          <tbody>
            {ordenesFiltradas.map((orden) => (
              <tr key={orden.id}>
                <td>
                  <strong>{orden.id}</strong>
                </td>

                <td>{orden.cliente}</td>

                <td>
                  <span className="cashier-orders__origin-text">
                    {orden.origen}
                  </span>
                </td>

                <td>{orden.hora}</td>

                <td>
                  <strong>
                    {formatearMonedaCajero(orden.total)}
                  </strong>
                </td>

                <td>
                  <div className="cashier-orders__estado-celda">
                    <span
                      className={`cashier-order-status ${obtenerClaseEstado(
                        orden.estado
                      )}`}
                    >
                      {orden.estado}
                    </span>
                    {orden.tipoEntrega === 'domicilio' ? (
                      <span className="cashier-orders__estado-bloqueado">
                        <i className="bi bi-lock" aria-hidden="true" />
                        Delivery
                      </span>
                    ) : (
                      <select
                        value={orden.estado}
                        onChange={(evento) =>
                          cambiarEstadoOrden(orden.id, evento.target.value)
                        }
                        aria-label={`Cambiar estado de ${orden.id}`}
                      >
                        {ESTADOS_CAMBIO.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </td>

                <td>
                  <button
                    type="button"
                    className="cashier-orders__detail-button"
                    onClick={() => setIdSeleccionada(orden.id)}
                    aria-label={`Ver detalle de ${orden.id}`}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}

            {ordenesFiltradas.length === 0 && (
              <tr>
                <td colSpan="7" className="cashier-orders__empty">
                  No se encontraron pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ordenSeleccionada && (
        <div
          className="cashier-orders__modal-backdrop"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) {
              setIdSeleccionada(null);
            }
          }}
        >
          <section
            className="cashier-orders__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cashier-order-detail-title"
          >
            <header className="cashier-orders__modal-header">
              <div>
                <h2 id="cashier-order-detail-title">
                  Detalle del pedido
                </h2>
                <p>{ordenSeleccionada.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setIdSeleccionada(null)}
                aria-label="Cerrar detalle"
              >
                <i className="bi bi-x-lg" />
              </button>
            </header>

            <div className="cashier-orders__modal-body">
              <div className="cashier-orders__detail-grid">
                <div>
                  <span>Cliente</span>
                  <strong>{ordenSeleccionada.cliente}</strong>
                </div>

                <div>
                  <span>Origen</span>
                  <strong>{ordenSeleccionada.origen}</strong>
                </div>

                <div>
                  <span>Hora</span>
                  <strong>{ordenSeleccionada.hora}</strong>
                </div>

                <div>
                  <span>Estado</span>
                  {ordenSeleccionada.tipoEntrega === 'domicilio' ? (
                    <strong>
                      {ordenSeleccionada.estado} · gestionado por Delivery
                    </strong>
                  ) : (
                    <select
                      value={ordenSeleccionada.estado}
                      onChange={(evento) =>
                        cambiarEstadoOrden(
                          ordenSeleccionada.id,
                          evento.target.value
                        )
                      }
                      aria-label={`Cambiar estado de ${ordenSeleccionada.id}`}
                    >
                      {ESTADOS_CAMBIO.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {ordenSeleccionada.tipoEntrega === 'domicilio' && (
                <div className="cashier-orders__detail-delivery">
                  <span>Entrega a domicilio</span>
                  <strong>
                    {ordenSeleccionada.direccion}, Casa #
                    {ordenSeleccionada.numeroCasa} · {ordenSeleccionada.telefono}
                  </strong>
                </div>
              )}

              <h3>Productos</h3>

              <div className="cashier-orders__detail-products">
                {ordenSeleccionada.productos.map((producto, index) => (
                  <div key={`${producto.nombre}-${index}`}>
                    <span>
                      {producto.nombre} × {producto.cantidad}
                    </span>
                  </div>
                ))}
              </div>

              <div className="cashier-orders__detail-total">
                <span>Total</span>
                <strong>
                  {formatearMonedaCajero(ordenSeleccionada.total)}
                </strong>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
