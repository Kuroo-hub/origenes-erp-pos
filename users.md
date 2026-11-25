# Usuarios de prueba

API base: `http://localhost:3000/api/v1`

Contraseña para todos los usuarios de prueba: `Prueba123!`

| Perfil | Rol | Correo | ID empleado | Sucursal | Ruta funcional |
|---|---|---|---:|---:|---|
| Cajero | EMPLOYEE | test.cajero@origenessv.com | 8 | 1 | `/cajero` |
| Chef | EMPLOYEE | test.chef@origenessv.com | 11 | 1 | `/chef` |
| Delivery | EMPLOYEE | test.delivery@origenessv.com | 12 | 1 | `/repartidor` |
| Owner | ADMINISTRATOR | test.owner@origenessv.com | 13 | 1 | `/gerencia` |
| Admin | ADMINISTRATOR | test.admin@origenessv.com | 6 | 1 | `/gerencia` |
| Gerente | MANAGER | test.gerente@origenessv.com | 7 | 1 | `/manager` |
| RRHH | HR | test.rrhh@origenessv.com | 9 | 1 | `/rrhh` |
| Inventario | INVENTORY_MANAGER | test.inventario@origenessv.com | 10 | 2 | `/inventario` |

Nota: los usuarios `EMPLOYEE` inician sesión en `/cajero`; para probar chef o delivery, navegar manualmente a `/chef` o `/repartidor`.

Los ocho usuarios fueron creados con `POST /auth/register` y verificados con `POST /auth/login`.
