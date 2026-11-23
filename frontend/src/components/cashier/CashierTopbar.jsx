const TITULOS = {
  resumen: 'Resumen del turno',
  pos: 'Punto de venta',
  ordenes: 'Gestión de órdenes',
  flujo: 'Flujo de caja',
};

export default function CashierTopbar({ seccion }) {
  return (
    <header className="cashier-topbar">
      <div className="cashier-topbar__crumbs">
        <span>Módulo cajero</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>
          {TITULOS[seccion] ?? 'Resumen del turno'}
        </strong>
      </div>
    </header>
  );
}