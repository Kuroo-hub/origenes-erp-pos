import React from 'react';

const TAB_META = {
  overview: {
    crumb: 'Resumen ejecutivo',
    title: 'Panel de Gerencia',
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

const OwnerTopbar = ({ activeTab, selectedBranch, onChangeBranch }) => {
  const current = TAB_META[activeTab] || TAB_META.overview;

  return (
    <header className="own-header-wrapper">
      <div className="own-breadcrumb">
        <span className="own-breadcrumb__root">Módulo gerencia</span>
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
            value={selectedBranch}
            onChange={(e) => onChangeBranch(e.target.value)}
          >
            <option value="ALL">Todas las sucursales</option>
            <option value="1">Sucursal San Salvador</option>
            <option value="2">Sucursal Santa Ana</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default OwnerTopbar;