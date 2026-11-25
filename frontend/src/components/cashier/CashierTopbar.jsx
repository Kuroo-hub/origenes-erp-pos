const TITULOS = {
  pos: 'Punto de venta',
  ordenes: 'Gestión de órdenes',
};

export default function CashierTopbar({
  seccion,
  sucursalId,
  sucursales = [],
  onCambiarSucursal,
}) {
  const valorSucursal = sucursalId ?? '';

  return (
    <header className="cashier-topbar">
      <div className="cashier-topbar__crumbs">
        <span>Módulo cajero</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>
          {TITULOS[seccion] ?? 'Punto de venta'}
        </strong>
      </div>

      <label className="cashier-topbar__sucursal">
        <i className="bi bi-geo-alt" aria-hidden="true" />
        <select
          value={valorSucursal}
          onChange={(evento) => {
            if (evento.target.value === '') return;
            onCambiarSucursal(Number(evento.target.value));
          }}
          aria-label="Sucursal del cajero"
        >
          {valorSucursal === '' && (
            <option value="" disabled>
              Seleccione sucursal
            </option>
          )}
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
