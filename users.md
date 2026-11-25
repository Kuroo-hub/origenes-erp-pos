# Usuarios de prueba

API base: `http://localhost:3000/api/v1`

Contraseña para todos los usuarios: `Prueba123!`

Los IDs corresponden a una carga limpia de `scripts-sql/origenes-ddl.sql` y `scripts-sql/origenes-data.sql`.

Distribución: 1 administrador general, 1 manager por sucursal y 26 empleados. No hay usuarios `HR` ni `INVENTORY_MANAGER` en el seed.

| ID | Perfil | Rol | Correo | Sucursal | Ruta funcional |
|---:|---|---|---|---|---|
| 1 | Admin general | ADMINISTRATOR | admin@origenessv.com | San Salvador | `/gerencia` |
| 2 | Gerente | MANAGER | gerente@origenessv.com | San Salvador | `/manager` |
| 3 | Cajera | EMPLOYEE | empleado@origenessv.com | San Salvador | `/cajero` |
| 4 | Chef | EMPLOYEE | chef@origenessv.com | San Salvador | `/chef` |
| 5 | Delivery | EMPLOYEE | delivery@origenessv.com | San Salvador | `/repartidor` |
| 6 | Cajera | EMPLOYEE | cajero2@origenessv.com | San Salvador | `/cajero` |
| 7 | Cocina | EMPLOYEE | cocina2@origenessv.com | San Salvador | `/chef` |
| 8 | Delivery | EMPLOYEE | repartidor2@origenessv.com | San Salvador | `/repartidor` |
| 9 | Cajera | EMPLOYEE | cajero3@origenessv.com | San Salvador | `/cajero` |
| 10 | Cocina | EMPLOYEE | cocina3@origenessv.com | San Salvador | `/chef` |
| 11 | Gerente | MANAGER | gerente.santaana@origenessv.com | Santa Ana | `/manager` |
| 12 | Cajero | EMPLOYEE | cajero.santaana@origenessv.com | Santa Ana | `/cajero` |
| 13 | Chef | EMPLOYEE | chef.santaana@origenessv.com | Santa Ana | `/chef` |
| 14 | Delivery | EMPLOYEE | delivery.santaana@origenessv.com | Santa Ana | `/repartidor` |
| 15 | Cajera | EMPLOYEE | cajero2.santaana@origenessv.com | Santa Ana | `/cajero` |
| 16 | Cocina | EMPLOYEE | cocina2.santaana@origenessv.com | Santa Ana | `/chef` |
| 17 | Delivery | EMPLOYEE | repartidor2.santaana@origenessv.com | Santa Ana | `/repartidor` |
| 18 | Cajera | EMPLOYEE | cajero3.santaana@origenessv.com | Santa Ana | `/cajero` |
| 19 | Cocina | EMPLOYEE | cocina3.santaana@origenessv.com | Santa Ana | `/chef` |
| 20 | Delivery | EMPLOYEE | repartidor3.santaana@origenessv.com | Santa Ana | `/repartidor` |
| 21 | Gerente | MANAGER | gerente.sanmiguel@origenessv.com | San Miguel | `/manager` |
| 22 | Cajero | EMPLOYEE | cajero.sanmiguel@origenessv.com | San Miguel | `/cajero` |
| 23 | Chef | EMPLOYEE | chef.sanmiguel@origenessv.com | San Miguel | `/chef` |
| 24 | Delivery | EMPLOYEE | delivery.sanmiguel@origenessv.com | San Miguel | `/repartidor` |
| 25 | Cajera | EMPLOYEE | cajero2.sanmiguel@origenessv.com | San Miguel | `/cajero` |
| 26 | Cocina | EMPLOYEE | cocina2.sanmiguel@origenessv.com | San Miguel | `/chef` |
| 27 | Delivery | EMPLOYEE | repartidor2.sanmiguel@origenessv.com | San Miguel | `/repartidor` |
| 28 | Cajera | EMPLOYEE | cajero3.sanmiguel@origenessv.com | San Miguel | `/cajero` |
| 29 | Cocina | EMPLOYEE | cocina3.sanmiguel@origenessv.com | San Miguel | `/chef` |
| 30 | Delivery | EMPLOYEE | repartidor3.sanmiguel@origenessv.com | San Miguel | `/repartidor` |

Notas:

- `ADMINISTRATOR` ve todas las sucursales; los managers y empleados solo operan la suya.
- `EMPLOYEE` con `job_title` de chef/cocina entra en `/chef`; con repartidor entra en `/repartidor`; el resto en `/cajero`.
- El manager debe abrir la caja de su sucursal antes de registrar ventas.
- El seed conserva las recetas, pero no deja turnos de caja abiertos ni facturas en estado pagado que se muestren como pedidos activos en cocina.
