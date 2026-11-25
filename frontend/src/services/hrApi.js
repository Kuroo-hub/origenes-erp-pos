import { apiGet, apiPost } from './apiClient.js';

const roundMoney = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const toAmountArray = (valores, empleadosActivos) =>
  (empleadosActivos ?? []).reduce((resultado, empleado) => {
    const valor = valores?.[empleado.employeeId];

    if (valor === '' || valor === null || valor === undefined) {
      return resultado;
    }

    const employeeId = Number(empleado.employeeId);
    const amount = Number(valor);

    if (
      !Number.isInteger(employeeId) ||
      employeeId < 1 ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return resultado;
    }

    return [...resultado, { employeeId, amount }];
  }, []);

export const listEmployees = async () => {
  const response = await apiGet('/hr/employees');
  return response.data;
};

export const getEmployeePerformance = async (id) => {
  const response = await apiGet(`/hr/employees/${id}/performance`);
  return response.data;
};

export const runPayroll = async (payload) => {
  const response = await apiPost('/hr/payrolls/run', payload);
  return { ...(response.data ?? {}), message: response.message };
};

export const buildPayrollPayload = ({
  startDate,
  endDate,
  paymentDate,
  bonuses = {},
  deductions = {},
  empleadosActivos = [],
}) => ({
  startDate,
  endDate,
  ...(paymentDate ? { paymentDate } : {}),
  bonuses: toAmountArray(bonuses, empleadosActivos),
  otherDeductions: toAmountArray(deductions, empleadosActivos),
});

const TOTALES_KEYS = [
  'grossSalary',
  'isssDeduction',
  'afpDeduction',
  'incomeTax',
  'otherDeductions',
  'netSalary',
];

export const sumPayrollDetails = (details = []) => {
  const totales = (details ?? []).reduce(
    (acumulado, detalle) => {
      TOTALES_KEYS.forEach((key) => {
        acumulado[key] += Number(detalle?.[key]) || 0;
      });

      return acumulado;
    },
    Object.fromEntries(TOTALES_KEYS.map((key) => [key, 0]))
  );

  TOTALES_KEYS.forEach((key) => {
    totales[key] = roundMoney(totales[key]);
  });

  return totales;
};

export const mapPayrollResponseToResult = (
  response,
  empleados = [],
  etiquetaRolRRHH
) => {
  const payroll = response?.data ?? response ?? {};
  const empleadosPorId = new Map(
    (empleados ?? []).map((empleado) => [
      Number(empleado.employeeId),
      empleado,
    ])
  );

  const details = (payroll.details ?? []).map((detalle) => {
    const empleado = empleadosPorId.get(Number(detalle.employeeId));
    const cargo = empleado?.role ?? empleado?.jobTitle;

    return {
      ...detalle,
      jobTitle: cargo
        ? etiquetaRolRRHH?.(cargo) ?? cargo
        : detalle.jobTitle ?? '',
    };
  });

  return {
    startDate: payroll.startDate,
    endDate: payroll.endDate,
    paymentDate: payroll.paymentDate,
    employeeCount: payroll.employeeCount ?? details.length,
    details,
    totals: sumPayrollDetails(details),
  };
};
