import React from 'react';
import BrandMark from '../auth/BrandMark';

const NAV_ITEMS = [
  { id: 'stock', label: 'Control de Stock' },
  { id: 'purchases', label: 'Compras y Proveedores' },
  { id: 'movements', label: 'Bitácora de Movimientos' },
];

const InventorySidebar = ({ activeTab, onSelectTab, alertCount = 0, onLogout }) => {
  return (
    <aside className="inv-sidebar">
      <div className="inv-sidebar__brand">
        <BrandMark />
        <div className="inv-sidebar__brand-text">
          <span className="inv-sidebar__title">Orígenes SV</span>
          <span className="inv-sidebar__role">Gestor de Inventario</span>
        </div>
      </div>

      <nav className="inv-sidebar__nav" aria-label="Navegación de inventario">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`inv-sidebar__item ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span className="inv-sidebar__indicator" aria-hidden="true" />
              <span className="inv-sidebar__label">{item.label}</span>
              {item.id === 'stock' && alertCount > 0 && (
                <span className="inv-sidebar__badge" title="Insumos en stock mínimo">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="inv-sidebar__footer">
        <button type="button" className="inv-sidebar__logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default InventorySidebar;