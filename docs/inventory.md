
# Módulo de Inventario — Orígenes SV

## 1. Descripción

El módulo de inventario administra ingredientes, existencias por sucursal, movimientos, alertas de stock, recetas y consumo de productos vendidos.

Arquitectura:
Route → Controller → Service → DAO → PostgreSQL

## 2. Archivos principales

backend/src/modules/inventory/
- inventoryRoutes.js: define los endpoints HTTP.
- inventoryController.js: recibe peticiones y envía respuestas.
- inventoryService.js: implementa reglas de negocio.
- inventoryDao.js: ejecuta consultas SQL.

## 3. Endpoints

Prefijo: /api/v1/inventory

| Método | Ruta | Descripción |
|---|---|---|
| GET | /ingredients | Lista ingredientes |
| POST | /ingredients | Registra un ingrediente |
| GET | /branches/:branchId/stock | Consulta existencias |
| POST | /branches/:branchId/movements | Registra entrada IN |
| POST | /branches/:branchId/movements/out | Registra salida OUT |
| GET | /branches/:branchId/movements | Consulta movimientos |
| GET | /branches/:branchId/alerts | Consulta stock bajo |
| GET | /products/:productId/recipe | Consulta receta |
| PUT | /products/:productId/recipe | Reemplaza receta completa |
| GET | /branches/:branchId/products/:productId/availability | Verifica disponibilidad |

### Ejemplo: registrar entrada

POST /api/v1/inventory/branches/1/movements

{
  "ingredientId": 1,
  "quantity": 2000,
  "reason": "Compra de pollo"
}

### Ejemplo: registrar salida

POST /api/v1/inventory/branches/1/movements/out

{
  "ingredientId": 1,
  "quantity": 500,
  "reason": "Retiro interno"
}

### Ejemplo: consultar disponibilidad

GET /api/v1/inventory/branches/1/products/1/availability?quantity=3

La respuesta incluye:
- available: true o false
- Ingredientes requeridos
- Cantidades necesarias
- Cantidades disponibles
- Indicador de suficiencia por ingrediente

Esta consulta no reserva existencias.

## 4. Integración con ventas

Función pública del servicio:

consumeSaleProduct(client, {
    branchId,
    productId,
    quantity,
    userId
})

Parámetros:
- client: cliente PostgreSQL con transacción activa.
- branchId: identificador de la sucursal.
- productId: identificador del producto.
- quantity: unidades positivas a consumir.
- userId: usuario responsable, opcional temporalmente.

Comportamiento:
- PREPARED: consume los ingredientes de la receta.
- RESELL: consume las unidades del artículo asociado.
- Verifica existencia, estado y stock.
- Registra movimientos CONSUMPTION.
- Lanza errores cuando la operación no es válida.

IMPORTANTE:
Esta función NO inicia ni confirma transacciones.
El modulo llamador controla BEGIN, COMMIT y ROLLBACK.

Todas las consultas que forman parte de la misma venta
deben ejecutarse utilizando el mismo client.

El consumo debe realizarse una sola vez por venta
o evento de negocio acordado.

## 5. Tablas que se utilizaron

- ingredient
- product
- product_ingredient
- branch
- branch_inventory
- inventory_movement

## 6. Errores HTTP

- 400: datos inválidos.
- 404: recurso inexistente.
- 409: operación incompatible o stock insuficiente.
- 500: error interno inesperado.

## 7. Pruebas

Ejecutar desde backend/:

node scripts/testInventoryConsumption.js
node scripts/testResaleConsumption.js
node scripts/testSaleRollback.js

Las pruebas transaccionales utilizan ROLLBACK
para no conservar sus cambios.

## 8. Pendientes de integración

- Autenticación y autorización por rol.
- Restricción de acceso por sucursal.
- Asociar movimientos al usuario autenticado.
- Trazabilidad de movimientos con pedidos o facturas.
- Evitar procesamiento duplicado de ventas.
- Acordar momento exacto de consumo del inventario.
- Revisar tratamiento de utensilios reutilizables.
- Pruebas automatizadas adicionales y concurrencia.

## 9. Realizar documentacion

Una vez que terminen sus partes creen un .md donde explique de manera clara el trabajo que han
realizado.

## 10. Cookies Token

Abre Orígenes SV en una ventana de incógnito, presiona F12 y activa Preserve log en la pestaña Red (Network). Inicia sesión y comprueba que POST /api/v1/auth/login devuelva 200 y que el encabezado Set-Cookie incluya access_token con el atributo HttpOnly. Recarga la página a la que entraste y verifica que GET /api/v1/auth/me devuelva 200 y que sigas dentro de la aplicación. Por último, cierra sesión, comprueba que POST /api/v1/auth/logout devuelva 204 y que la cookie desaparezca. Escribe de nuevo la dirección de la página que tenías abierta y confirma que la aplicación te redirija al login.