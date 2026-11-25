import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierSidebar from '../../components/cashier/CashierSidebar.jsx';
import CashierTopbar from '../../components/cashier/CashierTopbar.jsx';
import CashierPOS from '../../components/cashier/CashierPOS.jsx';
import CashierOrders from '../../components/cashier/CashierOrders.jsx';
import InvoiceModal from '../../components/cashier/InvoiceModal.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getProducts } from '../../services/catalogApi.js';
import { getBranchStockAlerts } from '../../services/inventoryApi.js';

function mapearProducto(producto) {
  return {
    id: producto.product_id,
    nombre: producto.name,
    descripcion: producto.description ?? '',
    precio: Number(producto.price ?? 0),
    categoria: producto.category,
    disponible: producto.active,
    imagen:
      producto.product_type === 'PREPARED'
        ? 'bi-egg-fried'
        : 'bi-basket',
    stock: null
  };
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
  } = useOrders();

  const [productos, setProductos] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [factura, setFactura] = useState(null);

  useEffect(() => {
    let activo = true;

    getProducts()
      .then((respuesta) => {
        if (!activo) return;

        const filas = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];
        setProductos(filas.filter((producto) => producto.active).map(mapearProducto));
      })
      .catch(() => {
        if (activo) setProductos([]);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    let activo = true;

    if (!sucursalId) {
      setAlertasStock([]);
      return undefined;
    }

    getBranchStockAlerts(sucursalId)
      .then((respuesta) => {
        if (!activo) return;
        const filas = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];
        setAlertasStock(filas);
      })
      .catch(() => {
        if (activo) setAlertasStock([]);
      });

    return () => {
      activo = false;
    };
  }, [sucursalId]);

  const productosSucursal = useMemo(
    () => productos.map((producto) => ({ ...producto, disponible: true })),
    [productos]
  );

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
      />

      <div className="cashier-workspace">
        <CashierTopbar
          seccion={seccion}
          sucursalId={sucursalId}
          sucursales={sucursales}
          onCambiarSucursal={seleccionarSucursal}
        />

        <main className="cashier-main">
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
