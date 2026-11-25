import { SUCURSALES_RRHH } from './SucursalesMocks.js';

export { SUCURSALES_RRHH };

export const ROLES_RRHH = [
  { id: 'ADMINISTRATOR', etiqueta: 'Administrador' },
  { id: 'MANAGER', etiqueta: 'Gerente' },
  { id: 'EMPLOYEE', etiqueta: 'Empleado' },
  { id: 'HR', etiqueta: 'Recursos humanos' },
  { id: 'INVENTORY_MANAGER', etiqueta: 'Encargado de inventario' },
];

export const etiquetaRolRRHH = (id) =>
  ROLES_RRHH.find((rol) => rol.id === id)?.etiqueta ?? id;

export const EMPLEADOS_INICIALES = [
  {
    employeeId: 1,
    fullName: 'María Fernanda López',
    jobTitle: 'Administrador',
    hireDate: '2024-03-15',
    baseSalary: 950,
    email: 'maria.lopez@origenes.com',
    role: 'ADMINISTRATOR',
    active: true,
    branchId: 1,
    branchName: 'Centro Histórico',
  },
  {
    employeeId: 2,
    fullName: 'Carlos Méndez',
    jobTitle: 'Empleado',
    hireDate: '2024-06-10',
    baseSalary: 450,
    email: 'carlos.mendez@origenes.com',
    role: 'EMPLOYEE',
    active: true,
    branchId: 1,
    branchName: 'Centro Histórico',
  },
  {
    employeeId: 3,
    fullName: 'Ana Martínez',
    jobTitle: 'Empleado',
    hireDate: '2023-11-20',
    baseSalary: 500,
    email: 'ana.martinez@origenes.com',
    role: 'EMPLOYEE',
    active: true,
    branchId: 2,
    branchName: 'Santa Ana',
  },
  {
    employeeId: 4,
    fullName: 'José Hernández',
    jobTitle: 'Empleado',
    hireDate: '2023-08-05',
    baseSalary: 400,
    email: 'jose.hernandez@origenes.com',
    role: 'EMPLOYEE',
    active: false,
    branchId: 2,
    branchName: 'Santa Ana',
  },
  {
    employeeId: 5,
    fullName: 'Laura García',
    jobTitle: 'Gerente',
    hireDate: '2025-01-12',
    baseSalary: 750,
    email: 'laura.garcia@origenes.com',
    role: 'MANAGER',
    active: true,
    branchId: 3,
    branchName: 'San Miguel',
  },
  {
    employeeId: 6,
    fullName: 'Roberto Sánchez',
    jobTitle: 'Empleado',
    hireDate: '2025-04-02',
    baseSalary: 425,
    email: 'roberto.sanchez@origenes.com',
    role: 'EMPLOYEE',
    active: true,
    branchId: 2,
    branchName: 'Santa Ana',
  },
];
