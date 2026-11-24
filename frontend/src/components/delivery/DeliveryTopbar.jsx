import React from 'react';

const BRANCHES = [
  { branch_id: 1, name: 'Sucursal San Salvador' },
  { branch_id: 2, name: 'Sucursal Santa Ana' },
];

const TAB_META = {
  active: {
    crumb: 'Entregas asignadas',
    title: 'Gestión de Entregas',
    subtitle: 'Datos del cliente, dirección de destino y monto a cobrar contra entrega.',
  },
  history: {
    crumb: 'Historial de entregas',
    title: 'Entregas Completadas',
    subtitle: 'Registro de pedidos entregados y montos cobrados en el turno.',
  },
};

const DeliveryTopbar = ({ activeTab, selectedBranch, onChangeBranch }) => {
  const current = TAB_META[activeTab] || TAB_META.active;

  return (
    <header className="del-header-wrapper">
      <div className="del-breadcrumb">
        <span className="del-breadcrumb__root">Módulo repartidor</span>
        <span className="del-breadcrumb__sep">›</span>
        <span className="del-breadcrumb__current">{current.crumb}</span>
      </div>

      <div className="del-topbar">
        <div className="del-topbar__info">
          <h1 className="del-topbar__title">{current.title}</h1>
          <p className="del-topbar__subtitle">{current.subtitle}</p>
        </div>

        <div className="del-branch-box">
          <span className="del-branch-box__label">SUCURSAL</span>
          <select
            id="delivery-branch-select"
            value={selectedBranch}
            onChange={(e) => onChangeBranch(Number(e.target.value))}
          >
            {BRANCHES.map((branch) => (
              <option key={branch.branch_id} value={branch.branch_id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default DeliveryTopbar;