
const TITULOS = {
  resumen: 'Resumen de recursos humanos',
  empleados: 'Gestión de empleados',
  planillas: 'Gestión de planillas',
};

export default function HrTopbar({ seccion }) {
  return (
    <header className="hr-topbar">
      <div className="hr-topbar__crumbs">
        <span>Módulo RRHH</span>
        <i className="bi bi-chevron-right" aria-hidden="true" />
        <strong>{TITULOS[seccion] ?? 'Resumen de recursos humanos'}</strong>
      </div>
    </header>
  );
}
