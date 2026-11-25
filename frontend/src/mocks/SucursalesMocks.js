export const SUCURSALES = [
  {
    id: 1,
    branch_id: 1,
    nombre: 'Centro Histórico',
    name: 'Centro Histórico',
    direccion: 'Av. Libertad 123, San Salvador',
  },
  {
    id: 2,
    branch_id: 2,
    nombre: 'Santa Ana',
    name: 'Santa Ana',
    direccion: '15 Calle Poniente #24, Santa Ana',
  },
  {
    id: 3,
    branch_id: 3,
    nombre: 'San Miguel',
    name: 'San Miguel',
    direccion: 'Av. Roosevelt #318, San Miguel',
  },
];

export const SUCURSALES_RRHH = SUCURSALES.map(({ id, nombre }) => ({
  id,
  nombre,
}));

export const SUCURSALES_TOPBAR = SUCURSALES.map(({ branch_id, name }) => ({
  branch_id,
  name,
}));
