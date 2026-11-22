
function formatCurrency(value) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value) {
  if (!value) return 'Sin fecha';

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function HrSummary({ empleados = [] }) {
  const empleadosActivos = empleados.filter(
    (empleado) => empleado.active
  );

  const empleadosInactivos = empleados.filter(
    (empleado) => !empleado.active
  );

  const sucursales = new Set(
    empleados.map((empleado) => empleado.branchId)
  );

  const empleadosRecientes = [...empleados]
    .sort((a, b) => new Date(b.hireDate) - new Date(a.hireDate))
    .slice(0, 5);

  const indicadores = [
    {
      titulo: 'Total de empleados',
      valor: empleados.length,
      descripcion: 'Empleados registrados',
      icono: 'bi-people',
      estilo: 'primary',
    },
    {
      titulo: 'Empleados activos',
      valor: empleadosActivos.length,
      descripcion: 'Personal actualmente activo',
      icono: 'bi-person-check',
      estilo: 'success',
    },
    {
      titulo: 'Empleados inactivos',
      valor: empleadosInactivos.length,
      descripcion: 'Cuentas desactivadas',
      icono: 'bi-person-dash',
      estilo: 'warning',
    },
    {
      titulo: 'Sucursales',
      valor: sucursales.size,
      descripcion: 'Sucursales con empleados',
      icono: 'bi-shop',
      estilo: 'info',
    },
  ];

  return (
    <section className="hr-summary">
      <div className="hr-section-header">
        <div>
          <h1>Resumen de RRHH</h1>
          <p>
            Vista general del personal de Orígenes SV.
          </p>
        </div>
      </div>

      <div className="hr-indicators">
        {indicadores.map((indicador) => (
          <article
            className={`hr-indicator hr-indicator--${indicador.estilo}`}
            key={indicador.titulo}
          >
            <div className="hr-indicator__icon">
              <i className={`bi ${indicador.icono}`} aria-hidden="true" />
            </div>

            <div className="hr-indicator__content">
              <span>{indicador.titulo}</span>
              <strong>{indicador.valor}</strong>
              <small>{indicador.descripcion}</small>
            </div>
          </article>
        ))}
      </div>

      <section className="hr-activity">
        <div className="hr-activity__header">
          <div>
            <h2>Personal de la empresa</h2>
            <p>Empleados incorporados más recientemente.</p>
          </div>

          <span className="hr-activity__count">
            {empleados.length} registros
          </span>
        </div>

        <div className="hr-activity__table-wrapper">
          <table className="hr-activity__table">
            <thead>
              <tr>
                <th>Empleado</th>
                <th>Cargo</th>
                <th>Sucursal</th>
                <th>Fecha de ingreso</th>
                <th>Salario base</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {empleadosRecientes.length > 0 ? (
                empleadosRecientes.map((empleado) => (
                  <tr key={empleado.employeeId}>
                    <td>
                      <div className="hr-employee-cell">
                        <strong>{empleado.fullName}</strong>
                        <small>{empleado.email}</small>
                      </div>
                    </td>

                    <td>{empleado.jobTitle}</td>
                    <td>{empleado.branchName}</td>
                    <td>{formatDate(empleado.hireDate)}</td>
                    <td>{formatCurrency(empleado.baseSalary)}</td>
                    <td>
                      <span
                        className={`hr-status ${
                          empleado.active
                            ? 'hr-status--active'
                            : 'hr-status--inactive'
                        }`}
                      >
                        {empleado.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="hr-table-empty">
                    No hay empleados registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
