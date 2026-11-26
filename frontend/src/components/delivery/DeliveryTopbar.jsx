import React from 'react';

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

const SUCURSALES_RESPALDO = [
  { id: 1, branch_id: 1, name: 'Sucursal San Salvador' },
  { id: 2, branch_id: 2, name: 'Sucursal Santa Ana' },
  { id: 3, branch_id: 3, name: 'Sucursal San Miguel' },
];

const DeliveryTopbar = ({ activeTab, selectedBranch, onChangeBranch, branches = [] }) => {
  const current = TAB_META[activeTab] || TAB_META.active;
  const opcionesSucursal =
    Array.isArray(branches) && branches.length > 0 ? branches : SUCURSALES_RESPALDO;

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
            value={Number(selectedBranch ?? 1)}
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
    </header>
  );
};

export default DeliveryTopbar;