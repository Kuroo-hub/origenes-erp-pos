
import { etiquetaRolRRHH } from '../../mocks/HrMocks.js';

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

  const detalles = [
    { label: 'ID de empleado', value: `#${empleado.employeeId}` },
    { label: 'Correo electrónico', value: empleado.email },
    { label: 'Fecha de contratación', value: formatDate(empleado.hireDate) },
    { label: 'Salario base mensual', value: formatCurrency(empleado.baseSalary) },
    { label: 'Rol del sistema', value: etiquetaRolRRHH(empleado.role) },
    { label: 'Usuario de acceso', value: empleado.username ?? 'No disponible' },
    {
      label: 'Contraseña temporal',
      value: empleado.temporaryPassword ?? 'No disponible',
    },
    { label: 'ID de usuario', value: `#${empleado.userId}` },
    { label: 'Sucursal', value: empleado.branchName },
    { label: 'ID de sucursal', value: `#${empleado.branchId}` },
  ];

  return (
    <div
      className="hr-detail-backdrop cashier-orders__modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <section
        className="hr-detail-modal cashier-orders__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hr-detail-title"
      >
        <header className="hr-detail__header cashier-orders__modal-header">
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
            <strong>{etiquetaRolRRHH(empleado.role)}</strong>
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

        <div className="hr-detail__grid cashier-orders__detail-grid">
          {detalles.map((detalle) => (
            <div key={detalle.label}>
              <span>{detalle.label}</span>
              <strong>{detalle.value ?? 'No disponible'}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
