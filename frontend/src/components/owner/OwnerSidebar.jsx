import React from 'react';
import OrigenesLogo from '../common/OrigenesLogo';
import { IconChart, IconWallet, IconBuilding } from './OwnerIcons';

const NAV_ITEMS = [
  { id: 'overview', label: 'Resumen ejecutivo', Icon: IconChart },
  { id: 'finance', label: 'Finanzas y pagos', Icon: IconWallet },
  { id: 'branches', label: 'Sucursales', Icon: IconBuilding },
];

const OwnerSidebar = ({ activeTab, onSelectTab, onLogout }) => {
  return (
    <aside className="own-sidebar">
      <div className="own-sidebar__brand">
        <OrigenesLogo />
        <div className="own-sidebar__brand-text">
          <span className="own-sidebar__title">Orígenes SV</span>
          <span className="own-sidebar__role">Owner</span>
        </div>
      </div>

      <div className="own-sidebar__section-label">MÓDULO</div>

      <nav className="own-sidebar__nav" aria-label="Navegación de Owner">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`own-sidebar__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectTab(id)}
            >
              <span className="own-sidebar__icon">
                <Icon />
              </span>
              <span className="own-sidebar__label">{label}</span>
              <span className="own-sidebar__dot" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <div className="own-sidebar__footer">
        <button type="button" className="own-sidebar__logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default OwnerSidebar;