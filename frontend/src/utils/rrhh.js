export const ROLES_RRHH = [
  { id: 'ADMINISTRATOR', etiqueta: 'Administrador' },
  { id: 'MANAGER', etiqueta: 'Gerente' },
  { id: 'EMPLOYEE', etiqueta: 'Empleado' },
  { id: 'HR', etiqueta: 'Recursos humanos' },
  { id: 'INVENTORY_MANAGER', etiqueta: 'Encargado de inventario' },
];

export const etiquetaRolRRHH = (id) =>
  ROLES_RRHH.find((rol) => rol.id === id)?.etiqueta ?? id;
