
function formatCurrency(value) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'No disponible';

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function HrEmployeeDetail({ empleado, onCerrar }) {
  if (!empleado) return null;

  return (
    <div
      className="hr-detail-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section
        className="hr-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-detail-title"
      >
        <header className="hr-detail__header">
          <div>
            <span>Ficha del empleado</span>
            <h2 id="hr-detail-title">{empleado.fullName}</h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <div className="hr-detail__profile">
          <div className="hr-detail__avatar">
            <i className="bi bi-person" aria-hidden="true" />
          </div>

          <div>
            <strong>{empleado.jobTitle}</strong>
            <span>{empleado.branchName}</span>
            <span
              className={`hr-status ${
                empleado.active
                  ? 'hr-status--active'
                  : 'hr-status--inactive'
              }`}
            >
              {empleado.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <div className="hr-detail__grid">
          <article>
            <span>ID de empleado</span>
            <strong>#{empleado.employeeId}</strong>
          </article>

          <article>
            <span>Correo electrónico</span>
            <strong>{empleado.email}</strong>
          </article>

          <article>
            <span>Fecha de contratación</span>
            <strong>{formatDate(empleado.hireDate)}</strong>
          </article>

          <article>
            <span>Salario base mensual</span>
            <strong>{formatCurrency(empleado.baseSalary)}</strong>
          </article>

          <article>
            <span>Rol del sistema</span>
            <strong>{empleado.role}</strong>
          </article>

          <article>
            <span>ID de usuario</span>
            <strong>#{empleado.userId}</strong>
          </article>

          <article>
            <span>Sucursal</span>
            <strong>{empleado.branchName}</strong>
          </article>

          <article>
            <span>ID de sucursal</span>
            <strong>#{empleado.branchId}</strong>
          </article>
        </div>

        <footer className="hr-detail__footer">
          <button type="button" onClick={onCerrar}>
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}
