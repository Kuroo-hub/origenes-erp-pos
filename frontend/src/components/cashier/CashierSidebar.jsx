import logoOrigenes from '../../public/origenes-logo.svg';

const SECCIONES_CAJERO = [
  {
    id: 'resumen',
    etiqueta: 'Resumen',
    icono: 'bi-grid-1x2',
  },
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
  {
    id: 'flujo',
    etiqueta: 'Flujo de caja',
    icono: 'bi-graph-up-arrow',
  },
];

const COLORES_SECCION = {
  resumen: 'cashier-nav-item__dot--resumen',
  pos: 'cashier-nav-item__dot--pos',
  ordenes: 'cashier-nav-item__dot--ordenes',
  flujo: 'cashier-nav-item__dot--caja',
};

export default function CashierSidebar({
  seccion,
  onSeleccionar,
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
    </aside>
  );
}