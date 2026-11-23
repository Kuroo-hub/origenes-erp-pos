
import logoOrigenes from '../../public/origenes-logo.svg';

const SECCIONES_RRHH = [
  {
    id: 'resumen',
    etiqueta: 'Resumen',
    icono: 'bi-grid-1x2',
  },
  {
    id: 'empleados',
    etiqueta: 'Empleados',
    icono: 'bi-people',
  },
  {
    id: 'planillas',
    etiqueta: 'Planillas',
    icono: 'bi-wallet2',
  },
];

const COLORES_SECCION = {
  resumen: 'hr-nav-item__dot--resumen',
  empleados: 'hr-nav-item__dot--empleados',
  planillas: 'hr-nav-item__dot--planillas',
};

export default function HrSidebar({ seccion, onSeleccionar }) {
  return (
    <aside className="hr-sidebar">
      <div className="hr-sidebar__brand">
        <span className="hr-sidebar__mark">
          <img
            src={logoOrigenes}
            alt="Orígenes SV"
            className="hr-sidebar__mark-svg"
          />
        </span>

        <span className="hr-sidebar__brand-text">
          <strong>Orígenes SV</strong>
          <small>Recursos Humanos</small>
        </span>
      </div>

      <nav
        className="hr-sidebar__nav"
        aria-label="Navegación del módulo de recursos humanos"
      >
        <p className="hr-sidebar__section">Módulo</p>

        {SECCIONES_RRHH.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`hr-nav-item${
              seccion === opcion.id ? ' is-active' : ''
            }`}
            onClick={() => onSeleccionar(opcion.id)}
            aria-current={seccion === opcion.id ? 'page' : undefined}
          >
            <i className={`bi ${opcion.icono}`} aria-hidden="true" />
            <span>{opcion.etiqueta}</span>
            <span className={`hr-nav-item__dot ${COLORES_SECCION[opcion.id]}`} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
