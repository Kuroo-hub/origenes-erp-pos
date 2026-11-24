const TITULOS = {
  resumen: 'Resumen del turno',
  pos: 'Punto de venta',
  ordenes: 'Gestión de órdenes',
  flujo: 'Flujo de caja',
};

export default function CashierTopbar({
  seccion,
  sucursalId,
  sucursales = [],
  onCambiarSucursal,
}) {
  return (
    <header className="cashier-topbar">
      <div className="cashier-topbar__crumbs">
        <span>Módulo cajero</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>
          {TITULOS[seccion] ?? 'Resumen del turno'}
        </strong>
      </div>

      <label className="cashier-topbar__sucursal">
        <i className="bi bi-geo-alt" aria-hidden="true" />
        <select
          value={sucursalId}
          onChange={(evento) => onCambiarSucursal(Number(evento.target.value))}
          aria-label="Sucursal del cajero"
        >
          {sucursales.map((sucursal) => (
            <option key={sucursal.id} value={sucursal.id}>
              {sucursal.nombre}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
