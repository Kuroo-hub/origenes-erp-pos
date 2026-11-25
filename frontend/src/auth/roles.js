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

function normalizarTexto(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function rutaPorRol(role, profile = {}, fallback = '/login') {
  if (role === ROLES.EMPLOYEE) {
    const jobTitle = normalizarTexto(profile?.jobTitle);
    const email = normalizarTexto(profile?.email);

    if (jobTitle.includes('chef') || jobTitle.includes('cocina') || email.startsWith('test.chef')) {
      return '/chef';
    }

    if (
      jobTitle.includes('delivery') ||
      jobTitle.includes('repartidor') ||
      email.startsWith('test.delivery')
    ) {
      return '/repartidor';
    }

    return '/cajero';
  }

  return RUTA_POR_ROL[role] ?? fallback;
}
