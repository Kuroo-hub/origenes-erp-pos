import logoOrigenes from '../../public/origenes-logo.svg';

const SECCIONES_CAJERO = [
  {
    id: 'pos',
    etiqueta: 'Punto de venta',
    icono: 'bi-cart3',
  },
  {
    id: 'ordenes',
    etiqueta: 'Órdenes',
    icono: 'bi-clipboard-check',
  },
];

const COLORES_SECCION = {
  pos: 'cashier-nav-item__dot--pos',
  ordenes: 'cashier-nav-item__dot--ordenes',
};

export default function CashierSidebar({
  seccion,
  onSeleccionar,
  onLogout,
}) {
  return (
    <aside className="cashier-sidebar">
      <div className="cashier-sidebar__brand">
        <span className="cashier-sidebar__mark">
          <img
            src={logoOrigenes}
            alt="Orígenes SV"
            className="cashier-sidebar__mark-svg"
          />
        </span>

        <span className="cashier-sidebar__brand-text">
          <strong>Orígenes SV</strong>
          <small>Cajero</small>
        </span>
      </div>

      <nav
        className="cashier-sidebar__nav"
        aria-label="Navegación del módulo cajero"
      >
        <p className="cashier-sidebar__section">Módulo</p>

        {SECCIONES_CAJERO.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`cashier-nav-item${
              seccion === opcion.id ? ' is-active' : ''
            }`}
            onClick={() => onSeleccionar(opcion.id)}
            aria-current={
              seccion === opcion.id ? 'page' : undefined
            }
          >
            <i
              className={`bi ${opcion.icono}`}
              aria-hidden="true"
            />

            <span>{opcion.etiqueta}</span>

            <span
              className={`cashier-nav-item__dot ${
                COLORES_SECCION[opcion.id]
              }`}
            />
          </button>
        ))}
      </nav>

      <div className="cashier-sidebar__footer">
        <span className="cashier-sidebar__status-text">Modo demostración</span>
        <button type="button" className="cashier-sidebar__logout" onClick={onLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}