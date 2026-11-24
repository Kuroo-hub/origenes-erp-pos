const TITULOS = {
  resumen: 'Resumen',
  flujo: 'Flujo de caja',
  caja: 'Apertura y cierre de caja',
};

export default function ManagerTopbar({
  seccion,
  sucursalId,
  sucursales = [],
  cajaAbierta,
  onCambiarSucursal,
}) {
  return (
    <header className="cashier-topbar">
      <div className="cashier-topbar__crumbs">
        <span>Manager</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>{TITULOS[seccion] ?? 'Resumen'}</strong>
      </div>

      <div className="manager-topbar__actions">
        <span
          className={`manager-caja-pill ${
            cajaAbierta ? 'is-open' : 'is-closed'
          }`}
        >
          <i
            className={`bi ${cajaAbierta ? 'bi-unlock-fill' : 'bi-lock-fill'}`}
            aria-hidden="true"
          />
          {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
        </span>

        <label className="cashier-topbar__sucursal">
          <i className="bi bi-geo-alt" aria-hidden="true" />
          <select
            value={sucursalId}
            onChange={(evento) => onCambiarSucursal(Number(evento.target.value))}
            aria-label="Sucursal del manager"
          >
            {sucursales.map((sucursal) => (
              <option key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}
