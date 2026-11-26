import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierSidebar from '../../components/cashier/CashierSidebar.jsx';
import CashierTopbar from '../../components/cashier/CashierTopbar.jsx';
import CashierPOS from '../../components/cashier/CashierPOS.jsx';
import CashierOrders from '../../components/cashier/CashierOrders.jsx';
import InvoiceModal from '../../components/cashier/InvoiceModal.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getProductRecipe, getProducts } from '../../services/catalogApi.js';
import { getBranchInventory, getBranchStockAlerts } from '../../services/inventoryApi.js';

function mapearProducto(producto) {
  return {
    id: producto.product_id,
    nombre: producto.name,
    descripcion: producto.description ?? '',
    precio: Number(producto.price ?? 0),
    categoria: producto.category,
    tipoProducto: producto.product_type,
    disponible: producto.active,
    imagen:
      producto.product_type === 'PREPARED'
        ? 'bi-egg-fried'
        : 'bi-basket',
    receta: [],
    stock: null
  };
}

function calcularStockPorReceta(receta, inventario) {
  if (!Array.isArray(receta) || receta.length === 0) return null;

  const cantidades = receta.map((ingrediente) => {
    const requerido = Number(ingrediente.quantity);
    const disponible = Number(
      inventario.find(
        (item) =>
          Number(item.ingredient_id) === Number(ingrediente.ingredient_id)
      )?.quantity ?? 0
    );

    if (!Number.isFinite(requerido) || requerido <= 0) return 0;
    return Math.max(0, Math.floor((Number.isFinite(disponible) ? disponible : 0) / requerido));
  });

  return cantidades.length === 0
    ? null
    : Math.min(...cantidades);
}

export default function CashierPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [seccion, setSeccion] = useState('pos');
  const {
    ordenesSucursal,
    cajaAbierta,
    sucursalId,
    sucursal,
    sucursales,
    seleccionarSucursal,
    registrarPedido,
    cambiarEstado,
    versionStock,
  } = useOrders();

  const [productos, setProductos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [inventarioSucursal, setInventarioSucursal] = useState([]);
  const [factura, setFactura] = useState(null);
  const [errorProductos, setErrorProductos] = useState('');
  const [errorRecetas, setErrorRecetas] = useState(false);
  const [errorStock, setErrorStock] = useState('');

  useEffect(() => {
    let activo = true;
    let huboErrorReceta = false;

    getProducts()
      .then(async (respuesta) => {
        if (!activo) return;

        const filas = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];
        const base = filas
          .filter((producto) => producto.active)
          .map(mapearProducto);

        const paresRecetas = await Promise.all(
          base.map(async (producto) => {
            if (producto.tipoProducto !== 'PREPARED') {
              return [producto.id, []];
            }

            try {
              const respuestaReceta = await getProductRecipe(producto.id);
              return [
                producto.id,
                respuestaReceta?.data?.ingredients ??
                  respuestaReceta?.ingredients ??
                  [],
              ];
            } catch {
              huboErrorReceta = true;
              return [producto.id, []];
            }
          })
        );

        if (!activo) return;

        setErrorRecetas(huboErrorReceta);
        const recetasPorProducto = Object.fromEntries(paresRecetas);
        setProductos(
          base.map((producto) => ({
            ...producto,
            receta: recetasPorProducto[producto.id] ?? [],
          }))
        );
      })
      .catch((caughtError) => {
        if (activo) {
          setProductos([]);
          setErrorProductos(caughtError?.message ?? 'No se pudieron cargar los productos.');
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const recargarInventario = useCallback(async () => {
    if (!sucursalId) {
      setAlertasStock([]);
      setInventarioSucursal([]);
      return;
    }

    try {
      const [respuestaAlertas, respuestaInventario] = await Promise.all([
        getBranchStockAlerts(sucursalId),
        getBranchInventory(sucursalId),
      ]);

      const filasAlertas = Array.isArray(respuestaAlertas)
        ? respuestaAlertas
        : respuestaAlertas?.data ?? [];
      const filasInventario = Array.isArray(respuestaInventario)
        ? respuestaInventario
        : respuestaInventario?.data ?? [];

      setAlertasStock(filasAlertas);
      setInventarioSucursal(filasInventario);
      setErrorStock('');
    } catch (caughtError) {
      setErrorStock(caughtError?.message ?? 'No se pudo cargar el inventario de la sucursal.');
    }
  }, [sucursalId]);

  useEffect(() => {
    recargarInventario();
  }, [recargarInventario, versionStock]);

  const productosSucursal = useMemo(
    () =>
      productos.map((producto) => {
        const stock = calcularStockPorReceta(
          producto.receta,
          inventarioSucursal
        );

        return {
          ...producto,
          stock,
          disponible: stock == null ? true : stock > 0,
        };
      }),
    [productos, inventarioSucursal]
  );

  const estadoConexion = errorProductos || errorRecetas || errorStock
    ? 'Error de datos'
    : 'Conectado a API';

  const registrarVenta = async (datosPedido) => {
    const respuesta = await registrarPedido({
      id: `ORD-${Date.now()}`,
      cliente: datosPedido.cliente.trim() || 'Cliente presencial',
      tipoEntrega: datosPedido.tipoEntrega ?? 'local',
      direccion: datosPedido.direccion ?? '',
      numeroCasa: datosPedido.numeroCasa ?? '',
      telefono: datosPedido.telefono ?? '',
      sucursalId,
      sucursal,
      productos: datosPedido.productos.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio ?? 0,
      })),
      metodoPago: datosPedido.metodoPago,
    });

    setFactura(respuesta?.data ?? respuesta ?? null);
    await recargarInventario();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="cashier-shell">
      <CashierSidebar
        seccion={seccion}
        onSeleccionar={setSeccion}
        onLogout={handleLogout}
        estadoConexion={estadoConexion}
      />

      <div className="cashier-workspace">
        <CashierTopbar
          seccion={seccion}
          sucursalId={sucursalId}
          sucursales={sucursales}
          onCambiarSucursal={seleccionarSucursal}
        />

        <main className="cashier-main">
          {(errorProductos || errorRecetas || errorStock) && (
            <div className="cashier-caja-banner">
              <i className="bi bi-exclamation-triangle-fill" />
              <div>
                <strong>Error de datos</strong>
                <span>
                  {errorProductos || errorStock || 'No se pudieron cargar las recetas de los productos.'}
                </span>
              </div>
            </div>
          )}

          {!cajaAbierta && (
            <div className="cashier-caja-banner">
              <i className="bi bi-lock-fill" />
              <div>
                <strong>Caja cerrada</strong>
                <span>
                  Manager debe abrir la caja de {sucursal} para registrar ventas.
                </span>
              </div>
            </div>
          )}

          {seccion === 'pos' && (
            <CashierPOS
              sucursal={sucursal}
              productos={productosSucursal}
              alertasStock={alertasStock}
              cajaAbierta={cajaAbierta}
              bloqueadoPorError={Boolean(errorProductos || errorRecetas || errorStock)}
              onRegistrarPedido={registrarVenta}
            />
          )}

          {seccion === 'ordenes' && (
            <CashierOrders
              ordenes={ordenesSucursal}
              onCambiarEstado={cambiarEstado}
            />
          )}
        </main>

        {factura && (
          <InvoiceModal factura={factura} onClose={() => setFactura(null)} />
        )}
      </div>
    </div>
  );
}
