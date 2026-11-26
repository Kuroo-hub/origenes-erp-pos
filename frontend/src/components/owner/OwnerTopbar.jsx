import React from 'react';

const TAB_META = {
  overview: {
    crumb: 'Resumen ejecutivo',
    title: 'Panel de Owner',
    subtitle: 'Indicadores financieros, rendimiento por sucursal y platos más vendidos.',
  },
  finance: {
    crumb: 'Finanzas y pagos',
    title: 'Control Financiero y Proveedores',
    subtitle: 'Balance de ingresos, costos operativos y obligaciones pendientes de pago.',
  },
  branches: {
    crumb: 'Sucursales',
    title: 'Supervisión de Sucursales',
    subtitle: 'Estado de cajas, personal activo y alertas operativas por ubicación.',
  },
};

const SUCURSALES_RESPALDO = [
  { id: 1, branch_id: 1, name: 'Sucursal San Salvador' },
  { id: 2, branch_id: 2, name: 'Sucursal Santa Ana' },
  { id: 3, branch_id: 3, name: 'Sucursal San Miguel' },
];

const OwnerTopbar = ({
  activeTab,
  selectedBranch,
  onChangeBranch,
  branches = [],
  allowAll = true,
}) => {
  const current = TAB_META[activeTab] || TAB_META.overview;
  const opcionesSucursal =
    Array.isArray(branches) && branches.length > 0 ? branches : SUCURSALES_RESPALDO;

  return (
    <header className="own-header-wrapper">
      <div className="own-breadcrumb">
        <span className="own-breadcrumb__root">Módulo Owner</span>
        <span className="own-breadcrumb__sep">›</span>
        <span className="own-breadcrumb__current">{current.crumb}</span>
      </div>

      <div className="own-topbar">
        <div className="own-topbar__info">
          <h1 className="own-topbar__title">{current.title}</h1>
          <p className="own-topbar__subtitle">{current.subtitle}</p>
        </div>

        <div className="own-branch-box">
          <span className="own-branch-box__label">ALCANCE DE REPORTE</span>
          <select
            id="owner-branch-select"
            value={String(selectedBranch ?? 'ALL')}
            onChange={(e) => onChangeBranch(e.target.value)}
          >
            {allowAll && <option value="ALL">Todas las sucursales</option>}
            {opcionesSucursal.map((sucursal) => {
              const id = String(sucursal.branch_id ?? sucursal.id);
              const nombre = sucursal.name ?? sucursal.nombre ?? `Sucursal ${id}`;
              return (
                <option key={id} value={id}>
                  {nombre}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    </header>
  );
};

export default OwnerTopbar;