import { useEffect, useMemo, useState } from 'react';
import { Alert, Spinner } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import CartPanel from '../../components/client/CartPanel';
import ClientSidebar from '../../components/client/ClientSidebar';
import ClientTopbar from '../../components/client/ClientTopbar';
import { detalleMetodoPago } from '../../clientMock.js';
import OrderHistory from '../../components/client/OrderHistory';
import ProductCard from '../../components/client/ProductCard';
import SettingsPanel from '../../components/client/SettingsPanel';
import {
  calcularTotales,
  cambiarContrasena,
  cerrarSesion,
  confirmarPedido,
  guardarMetodoPago,
  guardarPerfil,
  obtenerMetodoPago,
  obtenerPedidos,
  obtenerPerfil,
  obtenerProductos,
  obtenerSucursales,
} from '../../clientMock.js';

export default function ClientPage() {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState('menu');
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState('');
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [perfil, setPerfil] = useState({ nombre: 'Cliente' });
  const [metodoPago, setMetodoPago] = useState(null);
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('efectivo');
  const [carrito, setCarrito] = useState([]);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [cargandoPedido, setCargandoPedido] = useState(false);
  const [error, setError] = useState('');
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    let activo = true;

    Promise.all([
      obtenerSucursales(),
      obtenerPedidos(),
      obtenerPerfil(),
      obtenerMetodoPago(),
    ])
      .then(([sucursalesData, pedidosData, perfilData, metodoPagoData]) => {
        if (!activo) return;
        setSucursales(sucursalesData);
        setPedidos(pedidosData);
        setPerfil(perfilData);
        setMetodoPago(metodoPagoData);
        setSucursalId(sucursalesData[0]?.id ?? '');
      })
      .catch((fallo) => {
        if (activo) setError(fallo.message ?? 'No se pudo cargar la información del cliente.');
      })
      .finally(() => {
        if (activo) setCargandoInicial(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (!sucursalId) return undefined;

    let activo = true;
    setCargandoProductos(true);
    setError('');

    obtenerProductos(sucursalId)
      .then((datos) => {
        if (activo) setProductos(datos);
      })
      .catch((fallo) => {
        if (activo) setError(fallo.message ?? 'No se pudo cargar el menú de la sucursal.');
      })
      .finally(() => {
        if (activo) setCargandoProductos(false);
      });

    return () => {
      activo = false;
    };
  }, [sucursalId]);

  useEffect(() => {
    if (!notificacion) return undefined;

    const temporizador = window.setTimeout(() => setNotificacion(null), 4500);
    return () => window.clearTimeout(temporizador);
  }, [notificacion]);

  useEffect(() => {
    if (metodoPago?.tipo) {
      setMetodoSeleccionado(metodoPago.tipo);
    }
  }, [metodoPago]);

  const sucursal = useMemo(
    () => sucursales.find((entrada) => entrada.id === sucursalId),
    [sucursales, sucursalId]
  );

  const totales = useMemo(() => calcularTotales(carrito, productos), [carrito, productos]);

  const cambiarSucursal = (evento) => {
    const nuevoId = evento.target.value;
    if (nuevoId === sucursalId) return;

    const nuevaSucursal = sucursales.find((entrada) => entrada.id === nuevoId);
    setSucursalId(nuevoId);
    setCarrito([]);
    setNotificacion({
      tipo: 'info',
      texto: `Menú y carrito actualizados para ${nuevaSucursal?.nombre ?? 'la sucursal'}.`,
    });
  };

  const agregarAlCarrito = (producto) => {
    if (!producto.disponible) return;

    setCarrito((previo) => {
      const existente = previo.find((item) => item.productoId === producto.id);
      if (existente) {
        return previo.map((item) =>
          item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...previo, { productoId: producto.id, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((previo) =>
      previo
        .map((item) =>
          item.productoId === productoId ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito((previo) => previo.filter((item) => item.productoId !== productoId));
    setNotificacion({ tipo: 'info', texto: 'Producto eliminado del carrito.' });
  };

  const confirmarCompra = async () => {
    if (totales.items.length === 0 || !sucursal) return;

    setCargandoPedido(true);
    setError('');

    try {
      const pedido = await confirmarPedido({
        sucursal: sucursal.nombre,
        items: totales.items,
        total: totales.total,
        metodoPago: metodoSeleccionado,
      });
      setPedidos((previo) => [pedido, ...previo]);
      setCarrito([]);
      setNotificacion({
        tipo: 'success',
        texto: `Pedido ${pedido.id} confirmado con ${detalleMetodoPago(pedido.metodoPago).etiqueta}. Estado: ${pedido.estado}.`,
      });
    } catch (fallo) {
      setError(fallo.message ?? 'No se pudo confirmar el pedido.');
    } finally {
      setCargandoPedido(false);
    }
  };

  const guardarDatosPerfil = async (datos) => {
    const actualizado = await guardarPerfil(datos);
    setPerfil(actualizado);
    setNotificacion({ tipo: 'success', texto: 'Datos personales actualizados.' });
    return actualizado;
  };

  const guardarDatosMetodoPago = async (datos) => {
    const guardado = await guardarMetodoPago(datos);
    setMetodoPago(guardado);
    setNotificacion({ tipo: 'success', texto: 'Método de pago guardado correctamente.' });
    return guardado;
  };

  const actualizarContrasena = async (datos) => {
    await cambiarContrasena(datos);
    setNotificacion({ tipo: 'success', texto: 'Contraseña actualizada correctamente.' });
  };

  const finalizarSesion = async () => {
    await cerrarSesion();
    navigate('/');
  };

  return (
    <div className="client-shell">
      <ClientSidebar seccion={seccion} onSeleccionar={setSeccion} />

      <div className="client-workspace">
        <ClientTopbar seccion={seccion} />

        <div className={`client-body${seccion === 'menu' ? '' : ' client-body--no-cart'}`}>
          <main className="client-main">
            {error && (
              <Alert color="danger" className="client-alert" fade={false}>
                <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
                {error}
              </Alert>
            )}

            {notificacion && (
              <Alert
                color={notificacion.tipo === 'info' ? 'info' : 'success'}
                className="client-alert"
                fade={false}
              >
                <i
                  className={`bi ${
                    notificacion.tipo === 'info' ? 'bi-info-circle' : 'bi-check-circle'
                  } me-2`}
                  aria-hidden="true"
                />
                {notificacion.texto}
              </Alert>
            )}

            {seccion === 'menu' && (
              <>
                <header className="client-main__header">
                  <div>
                    <h1 className="client-main__title">
                      MENÚ DEL DÍA DE #{sucursal?.nombre.toUpperCase() ?? '—'}
                    </h1>
                    <p className="client-main__subtitle">
                      <i className="bi bi-geo-alt" aria-hidden="true" />
                      {sucursal?.direccion ?? 'Selecciona una sucursal'}
                    </p>
                  </div>

                  <label className="client-sucursal-select">
                    <span>Sucursal</span>
                    <select
                      value={sucursalId}
                      onChange={cambiarSucursal}
                      disabled={cargandoInicial}
                    >
                      {sucursales.map((entrada) => (
                        <option key={entrada.id} value={entrada.id}>
                          {entrada.nombre}
                        </option>
                      ))}
                    </select>
                  </label>
                </header>

                {cargandoProductos ? (
                  <div className="client-loader">
                    <Spinner color="primary" />
                    <span>Cargando menú…</span>
                  </div>
                ) : (
                  <>
                    <div className="client-catalog">
                      {productos.map((producto) => (
                        <ProductCard
                          key={producto.id}
                          producto={producto}
                          onAgregar={agregarAlCarrito}
                        />
                      ))}
                    </div>

                    {productos.length === 0 && (
                      <div className="client-empty-state">
                        <i className="bi bi-cup-hot" aria-hidden="true" />
                        <h2>Sin productos</h2>
                        <p>No hay productos disponibles para esta sucursal.</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {seccion === 'historial' && (
              <>
                <header className="client-main__header">
                  <div>
                    <h1 className="client-main__title">HISTORIAL DE PEDIDOS</h1>
                    <p className="client-main__subtitle">
                      Consulta el estado y el detalle de tus compras anteriores.
                    </p>
                  </div>
                </header>
                <div className="client-section-content">
                  <OrderHistory pedidos={pedidos} />
                </div>
              </>
            )}

            {seccion === 'configuracion' && (
              <>
                <header className="client-main__header">
                  <div>
                    <h1 className="client-main__title">CONFIGURACIÓN</h1>
                    <p className="client-main__subtitle">
                      Gestiona tu perfil, método de pago, contraseña y sesión.
                    </p>
                  </div>
                </header>
                <div className="client-section-content">
                  <SettingsPanel
                    perfil={perfil}
                    metodoPago={metodoPago}
                    onGuardar={guardarDatosPerfil}
                    onGuardarMetodoPago={guardarDatosMetodoPago}
                    onCambiarContrasena={actualizarContrasena}
                    onCerrarSesion={finalizarSesion}
                  />
                </div>
              </>
            )}
          </main>

          {seccion === 'menu' && (
            <CartPanel
              items={totales.items}
              subtotal={totales.subtotal}
              total={totales.total}
              cantidadTotal={totales.cantidadTotal}
              sucursal={sucursal?.nombre ?? '—'}
              cargando={cargandoPedido}
              metodoGuardado={metodoPago}
              metodoSeleccionado={metodoSeleccionado}
              onCambiarMetodo={setMetodoSeleccionado}
              onCambiarCantidad={cambiarCantidad}
              onEliminar={eliminarDelCarrito}
              onConfirmar={confirmarCompra}
            />
          )}
        </div>
      </div>
    </div>
  );
}
