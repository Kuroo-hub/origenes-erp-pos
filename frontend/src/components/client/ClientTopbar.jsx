const TITULOS = {
  menu: 'Menú del día',
  historial: 'Historial de pedidos',
  configuracion: 'Configuración',
};

export default function ClientTopbar({ seccion }) {
  return (
    <header className="client-topbar">
      <div className="client-topbar__crumbs">
        <span>Módulo cliente</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>{TITULOS[seccion]}</strong>
      </div>
    </header>
  );
}
