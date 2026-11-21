import BrandMark from '../auth/BrandMark.jsx';
import { SECCIONES } from '../../clientMock.js';

const COLORES_SECCION = {
  menu: 'client-nav-item__dot--menu',
  historial: 'client-nav-item__dot--historial',
  configuracion: 'client-nav-item__dot--configuracion',
};

export default function ClientSidebar({ seccion, onSeleccionar }) {
  return (
    <aside className="client-sidebar">
      <div className="client-sidebar__brand">
        <span className="client-sidebar__mark">
          <BrandMark className="client-sidebar__mark-svg" />
        </span>
        <span className="client-sidebar__brand-text">
          <strong>Orígenes SV</strong>
          <small>Cliente</small>
        </span>
      </div>

      <nav className="client-sidebar__nav" aria-label="Navegación del módulo cliente">
        <p className="client-sidebar__section">Módulo</p>

        {SECCIONES.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`client-nav-item${seccion === opcion.id ? ' is-active' : ''}`}
            onClick={() => onSeleccionar(opcion.id)}
            aria-current={seccion === opcion.id ? 'page' : undefined}
          >
            <i className={`bi ${opcion.icono}`} aria-hidden="true" />
            <span>{opcion.etiqueta}</span>
            <span className={`client-nav-item__dot ${COLORES_SECCION[opcion.id]}`} />
          </button>
        ))}
      </nav>
    </aside>
  );
}
