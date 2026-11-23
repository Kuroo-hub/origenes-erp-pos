import React from 'react';
import BrandMark from '../auth/BrandMark';
import { IconBox, IconReceipt, IconActivity } from './InventoryIcons';
import OrigenesLogo from '../common/OrigenesLogo';

const NAV_ITEMS = [
  { id: 'stock', label: 'Control de stock', Icon: IconBox },
  { id: 'purchases', label: 'Compras y proveedores', Icon: IconReceipt },
  { id: 'movements', label: 'Movimientos', Icon: IconActivity },
];

const InventorySidebar = ({ activeTab, onSelectTab, alertCount = 0, isOffline = false, onLogout }) => {
  return (
    <aside className="inv-sidebar">
      <div className="inv-sidebar__brand">
        <OrigenesLogo />
          <div className="inv-sidebar__brand-text">
          <span className="inv-sidebar__title">Orígenes SV</span>
          <span className="inv-sidebar__role">Inventario</span>
        </div>
      </div>

      <div className="inv-sidebar__section-label">MÓDULO</div>

      <nav className="inv-sidebar__nav" aria-label="Navegación de inventario">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              className={`inv-sidebar__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectTab(id)}
            >
              <span className="inv-sidebar__icon">
                <Icon />
              </span>
              <span className="inv-sidebar__label">{label}</span>
              {id === 'stock' && alertCount > 0 && (
                <span className="inv-sidebar__badge" title="Insumos en stock mínimo">
                  {alertCount}
                </span>
              )}
              <span className="inv-sidebar__dot" aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      <div className="inv-sidebar__footer">
        <span className="inv-sidebar__status-text">
          {isOffline ? 'Modo demostración' : 'Conectado a API'}
        </span>
        <button type="button" className="inv-sidebar__logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default InventorySidebar;