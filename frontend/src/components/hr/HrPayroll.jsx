
import { useMemo, useState } from 'react';

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateIncomeTax(taxableBase) {
  if (taxableBase <= 176) return 0;

  if (taxableBase <= 447.24) {
    return (taxableBase - 176) * 0.10 + 8.80;
  }

  if (taxableBase <= 1019.05) {
    return (taxableBase - 447.24) * 0.20 + 35.92;
  }

  return (taxableBase - 1019.05) * 0.30 + 150.28;
}

function calculatePayroll(baseSalary, otherDeductions = 0, bonus = 0) {
  const baseBiweeklySalary = roundMoney(Number(baseSalary) / 2);
  const bonusAmount = roundMoney(Number(bonus));
  const grossSalary = roundMoney(baseBiweeklySalary + bonusAmount);

  const isssDeduction = roundMoney(
    Math.min(grossSalary * 0.03, 30)
  );

  const afpDeduction = roundMoney(grossSalary * 0.0725);

  const taxableBase = roundMoney(
    grossSalary - isssDeduction - afpDeduction
  );

  const incomeTax = roundMoney(calculateIncomeTax(taxableBase));

  const netSalary = roundMoney(
    grossSalary -
    isssDeduction -
    afpDeduction -
    incomeTax -
    Number(otherDeductions)
  );

  return {
    baseBiweeklySalary,
    bonusAmount,
    grossSalary,
    isssDeduction,
    afpDeduction,
    incomeTax,
    otherDeductions: roundMoney(Number(otherDeductions)),
    netSalary,
  };
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return 'No especificada';

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const CAMPOS_MONETARIOS = [
  { key: 'baseBiweeklySalary', label: 'Salario quincenal' },
  { key: 'bonusAmount', label: 'Bonos' },
  { key: 'grossSalary', label: 'Salario bruto', total: true },
  { key: 'isssDeduction', label: 'ISSS' },
  { key: 'afpDeduction', label: 'AFP' },
  { key: 'incomeTax', label: 'Renta' },
  { key: 'otherDeductions', label: 'Otras deducciones' },
  { key: 'netSalary', label: 'Salario neto', total: true },
];

export default function HrPayroll({ empleados = [] }) {
  const empleadosActivos = useMemo(
    () => empleados.filter((empleado) => empleado.active),
    [empleados]
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [bonuses, setBonuses] = useState({});
  const [deductions, setDeductions] = useState({});
  const [resultado, setResultado] = useState(null);
  const [periodosProcesados, setPeriodosProcesados] = useState([]);
  const [error, setError] = useState('');

  const actualizarMonto = (setter, userId, value) => {
    setter((actuales) => ({
      ...actuales,
      [userId]: value,
    }));

    setResultado(null);
    setError('');
  };

  const procesarPlanilla = (event) => {
    event.preventDefault();
    setError('');
    setResultado(null);

    if (!startDate || !endDate) {
      setError('Debes seleccionar la fecha inicial y final del período.');
      return;
    }

    if (endDate < startDate) {
      setError('La fecha final no puede ser anterior a la fecha inicial.');
      return;
    }

    if (paymentDate && paymentDate < endDate) {
      setError('La fecha de pago no puede ser anterior al período de planilla.');
      return;
    }

    const periodo = `${startDate}_${endDate}`;

    if (periodosProcesados.includes(periodo)) {
      setError('Ya procesaste una planilla para este período en esta sesión.');
      return;
    }

    // VALIDACIÓN DE BONOS Y DEDUCCIONES
  const montosInvalidos = empleadosActivos.some((empleado) => {
    const bonus = Number(bonuses[empleado.userId] || 0);
    const otherDeductions = Number(deductions[empleado.userId] || 0);

    return (
      !Number.isFinite(bonus) ||
      bonus < 0 ||
      !Number.isFinite(otherDeductions) ||
      otherDeductions < 0
    );
  });

  if (montosInvalidos) {
    setError('Los bonos y deducciones deben ser montos válidos y no negativos.');
    return;
  }


    const detalles = empleadosActivos.map((empleado) => {
      const bonus = Number(bonuses[empleado.userId] || 0);
      const otherDeductions = Number(deductions[empleado.userId] || 0);

      if (
        !Number.isFinite(bonus) ||
        bonus < 0 ||
        !Number.isFinite(otherDeductions) ||
        otherDeductions < 0
      ) {
        throw new Error('Los bonos y deducciones deben ser montos válidos y no negativos.');
      }

      return {
        employeeId: empleado.employeeId,
        userId: empleado.userId,
        fullName: empleado.fullName,
        jobTitle: empleado.jobTitle,
        ...calculatePayroll(
          empleado.baseSalary,
          otherDeductions,
          bonus
        ),
      };
    });

    const totales = detalles.reduce(
      (acumulado, detalle) => ({
        grossSalary: acumulado.grossSalary + detalle.grossSalary,
        isssDeduction: acumulado.isssDeduction + detalle.isssDeduction,
        afpDeduction: acumulado.afpDeduction + detalle.afpDeduction,
        incomeTax: acumulado.incomeTax + detalle.incomeTax,
        otherDeductions: acumulado.otherDeductions + detalle.otherDeductions,
        netSalary: acumulado.netSalary + detalle.netSalary,
      }),
      {
        grossSalary: 0,
        isssDeduction: 0,
        afpDeduction: 0,
        incomeTax: 0,
        otherDeductions: 0,
        netSalary: 0,
      }
    );

    Object.keys(totales).forEach((key) => {
      totales[key] = roundMoney(totales[key]);
    });

    setResultado({
      startDate,
      endDate,
      paymentDate,
      employeeCount: detalles.length,
      details: detalles,
      totals: totales,
    });

    setPeriodosProcesados((actuales) => [...actuales, periodo]);
  };

  const limpiarFormulario = () => {
    setStartDate('');
    setEndDate('');
    setPaymentDate('');
    setBonuses({});
    setDeductions({});
    setResultado(null);
    setError('');
  };

  return (
    <section className="hr-payroll">
      <div className="hr-section-header">
        <div>
          <h1>Planillas</h1>
          <p>
            Procesamiento de planillas quincenales del personal activo.
          </p>
        </div>
      </div>

      {!resultado && (
        <form className="hr-payroll__form" onSubmit={procesarPlanilla}>
          <section className="hr-payroll__panel">
            <div className="hr-payroll__panel-header">
              <div>
                <h2>Período de planilla</h2>
                <p>Define el período y la fecha de pago.</p>
              </div>
              <i className="bi bi-calendar-range" aria-hidden="true" />
            </div>

            <div className="hr-payroll__dates">
              <label>
                Fecha de inicio
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </label>

              <label>
                Fecha de finalización
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </label>

              <label>
                Fecha de pago
                <input
                  type="date"
                  value={paymentDate}
                  min={endDate || startDate || undefined}
                  onChange={(event) => setPaymentDate(event.target.value)}
                />
                <small>Opcional.</small>
              </label>
            </div>
          </section>

          <section className="hr-payroll__panel">
            <div className="hr-payroll__panel-header">
              <div>
                <h2>Personal incluido</h2>
                <p>
                  Configura bonos y otras deducciones por empleado.
                </p>
              </div>
              <span className="hr-payroll__employee-count">
                {empleadosActivos.length} activos
              </span>
            </div>

            {empleadosActivos.length > 0 ? (
              <div className="hr-payroll__employees">
                {empleadosActivos.map((empleado) => (
                  <article
                    className="hr-payroll__employee"
                    key={empleado.employeeId}
                  >
                    <div className="hr-payroll__employee-info">
                      <strong>{empleado.fullName}</strong>
                      <span>{empleado.jobTitle}</span>
                      <small>
                        Salario mensual: {formatCurrency(empleado.baseSalary)}
                      </small>
                    </div>

                    <label>
                      Bono ($)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={bonuses[empleado.userId] ?? ''}
                        placeholder="0.00"
                        onChange={(event) =>
                          actualizarMonto(
                            setBonuses,
                            empleado.userId,
                            event.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Otras deducciones ($)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deductions[empleado.userId] ?? ''}
                        placeholder="0.00"
                        onChange={(event) =>
                          actualizarMonto(
                            setDeductions,
                            empleado.userId,
                            event.target.value
                          )
                        }
                      />
                    </label>
                  </article>
                ))}
              </div>
            ) : (
              <div className="hr-payroll__empty">
                No hay empleados activos para procesar la planilla.
              </div>
            )}
          </section>

          {error && (
            <div className="hr-payroll__error" role="alert">
              <i className="bi bi-exclamation-circle" />
              {error}
            </div>
          )}

          <div className="hr-payroll__actions">
            <button
              type="button"
              className="hr-payroll__secondary"
              onClick={limpiarFormulario}
            >
              Limpiar
            </button>

            <button
              type="submit"
              className="hr-payroll__primary"
              disabled={empleadosActivos.length === 0}
            >
              <i className="bi bi-calculator" />
              Procesar planilla
            </button>
          </div>
        </form>
      )}

      {resultado && (
        <section className="hr-payroll__result">
          <div className="hr-payroll__success">
            <div>
              <i className="bi bi-check-circle-fill" />
              <div>
                <h2>Planilla procesada</h2>
                <p>
                  Resultado simulado para {resultado.employeeCount} empleados.
                </p>
              </div>
            </div>

            <button type="button" onClick={limpiarFormulario}>
              Nueva planilla
            </button>
          </div>

          <section className="hr-payroll__panel">
            <div className="hr-payroll__panel-header">
              <div>
                <h2>Información del período</h2>
                <p>
                  {formatDate(resultado.startDate)} al{' '}
                  {formatDate(resultado.endDate)}
                </p>
              </div>
              <i className="bi bi-calendar-check" />
            </div>

            <div className="hr-payroll__period-info">
              <div>
                <span>Fecha de pago</span>
                <strong>{formatDate(resultado.paymentDate)}</strong>
              </div>
              <div>
                <span>Empleados incluidos</span>
                <strong>{resultado.employeeCount}</strong>
              </div>
            </div>
          </section>

          <section className="hr-payroll__totals">
            <article>
              <span>Salario bruto total</span>
              <strong>{formatCurrency(resultado.totals.grossSalary)}</strong>
            </article>
            <article>
              <span>Total de descuentos</span>
              <strong>
                {formatCurrency(
                  resultado.totals.isssDeduction +
                  resultado.totals.afpDeduction +
                  resultado.totals.incomeTax +
                  resultado.totals.otherDeductions
                )}
              </strong>
            </article>
            <article>
              <span>Total neto a pagar</span>
              <strong>{formatCurrency(resultado.totals.netSalary)}</strong>
            </article>
          </section>

          <section className="hr-payroll__panel">
            <div className="hr-payroll__panel-header">
              <div>
                <h2>Detalle de salarios</h2>
                <p>Desglose de cada empleado incluido en la planilla.</p>
              </div>
            </div>

            <div className="hr-payroll__table-wrapper">
              <table className="hr-payroll__table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Salario bruto</th>
                    <th>ISSS</th>
                    <th>AFP</th>
                    <th>Renta</th>
                    <th>Otras deducciones</th>
                    <th>Salario neto</th>
                  </tr>
                </thead>

                <tbody>
                  {resultado.details.map((detalle) => (
                    <tr key={detalle.employeeId}>
                      <td>
                        <div className="hr-employee-cell">
                          <strong>{detalle.fullName}</strong>
                          <small>{detalle.jobTitle}</small>
                        </div>
                      </td>
                      <td>{formatCurrency(detalle.grossSalary)}</td>
                      <td>{formatCurrency(detalle.isssDeduction)}</td>
                      <td>{formatCurrency(detalle.afpDeduction)}</td>
                      <td>{formatCurrency(detalle.incomeTax)}</td>
                      <td>{formatCurrency(detalle.otherDeductions)}</td>
                      <td className="hr-payroll__net">
                        {formatCurrency(detalle.netSalary)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th>Total</th>
                    <th>{formatCurrency(resultado.totals.grossSalary)}</th>
                    <th>{formatCurrency(resultado.totals.isssDeduction)}</th>
                    <th>{formatCurrency(resultado.totals.afpDeduction)}</th>
                    <th>{formatCurrency(resultado.totals.incomeTax)}</th>
                    <th>{formatCurrency(resultado.totals.otherDeductions)}</th>
                    <th>{formatCurrency(resultado.totals.netSalary)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </section>
      )}
    </section>
  );
}
