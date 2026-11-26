import React from 'react';

const TAB_META = {
  stock: {
    crumb: 'Control de stock',
    title: 'Control de Inventario',
    subtitle: 'Existencias actuales, alertas de stock mínimo y ajustes de Orígenes SV.',
  },
  purchases: {
    crumb: 'Compras y proveedores',
    title: 'Compras y Proveedores',
    subtitle: 'Registro de facturas de abastecimiento y control de cuentas por pagar.',
  },
  movements: {
    crumb: 'Movimientos',
    title: 'Bitácora de Movimientos',
    subtitle: 'Historial de entradas, consumos por venta y ajustes de inventario.',
  },
};

const SUCURSALES_RESPALDO = [
  { id: 1, branch_id: 1, name: 'San Salvador' },
  { id: 2, branch_id: 2, name: 'Santa Ana' },
  { id: 3, branch_id: 3, name: 'San Miguel' },
];

const InventoryTopbar = ({
  activeTab,
  selectedBranch,
  onChangeBranch,
  branches = [],
}) => {
  const current = TAB_META[activeTab] || TAB_META.stock;
  const opcionesSucursal =
    Array.isArray(branches) && branches.length > 0 ? branches : SUCURSALES_RESPALDO;

  return (
    <header className="inv-header-wrapper">
      <div className="inv-breadcrumb">
        <span className="inv-breadcrumb__root">Módulo inventario</span>
        <span className="inv-breadcrumb__sep">›</span>
        <span className="inv-breadcrumb__current">{current.crumb}</span>
      </div>

      <div className="inv-topbar">
        <div className="inv-topbar__info">
          <h1 className="inv-topbar__title">{current.title}</h1>
          <p className="inv-topbar__subtitle">{current.subtitle}</p>
        </div>

        <div className="inv-topbar__controls">
          <div className="inv-branch-box">
            <span className="inv-branch-box__label">SUCURSAL</span>
            <select
              id="branch-select"
              value={selectedBranch ?? 1}
              onChange={(e) => onChangeBranch(Number(e.target.value))}
            >
              {opcionesSucursal.map((branch) => {
                const id = Number(branch.branch_id ?? branch.id);
                const nombre = branch.name ?? branch.nombre ?? `Sucursal ${id}`;
                return (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InventoryTopbar;