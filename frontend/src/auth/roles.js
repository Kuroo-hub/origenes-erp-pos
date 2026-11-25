export const ROLES = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
};

export const RUTA_POR_ROL = {
  [ROLES.ADMINISTRATOR]: '/gerencia',
  [ROLES.MANAGER]: '/manager',
  [ROLES.HR]: '/rrhh',
  [ROLES.INVENTORY_MANAGER]: '/inventario',
  [ROLES.EMPLOYEE]: '/cajero',
};

export function rutaPorRol(role, fallback = '/login') {
  return RUTA_POR_ROL[role] ?? fallback;
}
