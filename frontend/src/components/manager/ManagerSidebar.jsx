import logoOrigenes from '../../public/origenes-logo.svg';

const SECCIONES_MANAGER = [
  {
    id: 'resumen',
    etiqueta: 'Resumen',
    icono: 'bi-grid-1x2',
  },
  {
    id: 'flujo',
    etiqueta: 'Flujo de caja',
    icono: 'bi-graph-up-arrow',
  },
  {
    id: 'caja',
    etiqueta: 'Apertura y cierre',
    icono: 'bi-cash-coin',
  },
];

const COLORES_SECCION = {
  resumen: 'manager-nav-dot--resumen',
  flujo: 'manager-nav-dot--flujo',
  caja: 'manager-nav-dot--caja',
};

export default function ManagerSidebar({
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
          <small>Manager</small>
        </span>
      </div>

      <nav
        className="cashier-sidebar__nav"
        aria-label="Navegación del módulo manager"
      >
        <p className="cashier-sidebar__section">Módulo</p>

        {SECCIONES_MANAGER.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`cashier-nav-item${
              seccion === opcion.id ? ' is-active' : ''
            }`}
            onClick={() => onSeleccionar(opcion.id)}
            aria-current={seccion === opcion.id ? 'page' : undefined}
          >
            <i className={`bi ${opcion.icono}`} aria-hidden="true" />

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
        <button
          type="button"
          className="cashier-sidebar__logout"
          onClick={onLogout}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
