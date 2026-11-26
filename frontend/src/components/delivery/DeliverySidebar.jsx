import React from 'react';
import OrigenesLogo from '../common/OrigenesLogo';
import { IconTruck, IconCheckCircle } from './DeliveryIcons';

const NAV_ITEMS = [
  { id: 'active', label: 'Entregas asignadas', Icon: IconTruck },
  { id: 'history', label: 'Historial de entregas', Icon: IconCheckCircle },
];

const DeliverySidebar = ({ activeTab, onSelectTab, pendingCount = 0, onLogout }) => {
  return (
    <aside className="del-sidebar">
      <div className="del-sidebar__brand">
        <OrigenesLogo />
        <div className="del-sidebar__brand-text">
          <span className="del-sidebar__title">Orígenes SV</span>
          <span className="del-sidebar__role">Repartidor</span>
        </div>
      </div>            

      <div className="del-sidebar__section-label">MÓDULO</div>

      <nav className="del-sidebar__nav" aria-label="Navegación de repartidor">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`del-sidebar__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectTab(id)}
            >
              <span className="del-sidebar__icon">
                <Icon />
              </span>
              <span className="del-sidebar__label">{label}</span>
              {id === 'active' && pendingCount > 0 && (
                <span className="del-sidebar__badge">{pendingCount}</span>
              )}
              <span className="del-sidebar__dot" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <div className="del-sidebar__footer">
        <button type="button" className="del-sidebar__logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default DeliverySidebar;