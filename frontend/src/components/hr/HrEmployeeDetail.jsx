
import { etiquetaRolRRHH } from '../../utils/rrhh.js';

function formatCurrency(value) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'No disponible';

  const fecha = String(value).length === 10 ? `${value}T00:00:00` : value;

  return new Date(fecha).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function HrEmployeeDetail({
  empleado,
  onCerrar,
  performance,
  cargandoDetalle = false,
}) {
  if (!empleado) return null;

  const empleadoCompleto = performance?.employee ?? empleado;
  const resumen = performance?.payrollSummary;

  const detalles = [
    { label: 'ID de empleado', value: `#${empleadoCompleto.employeeId}` },
    { label: 'Correo electrónico', value: empleadoCompleto.email },
    {
      label: 'Fecha de contratación',
      value: formatDate(empleadoCompleto.hireDate),
    },
    {
      label: 'Salario base mensual',
      value: formatCurrency(empleadoCompleto.baseSalary),
    },
    { label: 'Rol del sistema', value: etiquetaRolRRHH(empleadoCompleto.role) },
    {
      label: 'Usuario de acceso',
      value: empleadoCompleto.email ?? 'No disponible',
    },
    { label: 'Contraseña', value: 'No disponible por seguridad' },
    { label: 'Sucursal', value: empleadoCompleto.branchName },
    {
      label: 'ID de sucursal',
      value: empleadoCompleto.branchId
        ? `#${empleadoCompleto.branchId}`
        : 'No disponible',
    },
    { label: 'Dirección de sucursal', value: empleadoCompleto.branchAddress },
    { label: 'Teléfono de sucursal', value: empleadoCompleto.branchPhone },
  ];

  const resumenPlanilla = resumen
    ? [
        { label: 'Planillas procesadas', value: resumen.payrollCount },
        {
          label: 'Total bruto acumulado',
          value: formatCurrency(resumen.totalGrossSalary),
        },
        {
          label: 'Total neto acumulado',
          value: formatCurrency(resumen.totalNetSalary),
        },
        {
          label: 'Promedio neto',
          value: formatCurrency(resumen.averageNetSalary),
        },
        {
          label: 'Último período de planilla',
          value: formatDate(resumen.lastPayrollPeriodEnd),
        },
        {
          label: 'Última fecha de pago',
          value: formatDate(resumen.lastPaymentDate),
        },
      ]
    : [];

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
            <h2 id="hr-detail-title">{empleadoCompleto.fullName}</h2>
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
            <strong>{etiquetaRolRRHH(empleadoCompleto.role)}</strong>
            <span>{empleadoCompleto.branchName}</span>
            <span
              className={`hr-status ${
                empleadoCompleto.active
                  ? 'hr-status--active'
                  : 'hr-status--inactive'
              }`}
            >
              {empleadoCompleto.active ? 'Activo' : 'Inactivo'}
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

        {cargandoDetalle && (
          <p className="hr-employees__results" role="status">
            Cargando historial de planillas...
          </p>
        )}

        {performance?.evaluationAvailable === false && performance?.message && (
          <p className="hr-employees__results">{performance.message}</p>
        )}

        {resumen && (
          <section>
            <p className="hr-employees__results">Resumen de planillas</p>
            <div className="hr-detail__grid cashier-orders__detail-grid">
              {resumenPlanilla.map((detalle) => (
                <article key={detalle.label}>
                  <span>{detalle.label}</span>
                  <strong>{detalle.value ?? 'No disponible'}</strong>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
