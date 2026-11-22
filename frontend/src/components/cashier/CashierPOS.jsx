import { useMemo, useState } from 'react';
import { Alert } from 'reactstrap';
import CashierCart from './CashierCart.jsx';
import {
  CATEGORIAS_CAJERO,
  PRODUCTOS_CAJERO,
  formatearMonedaCajero,
} from '../../mocks/cashierMocks.js';

export default function CashierPOS({ onRegistrarPedido }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notificacion, setNotificacion] = useState('');

  const productosFiltrados = useMemo(() => {
    return PRODUCTOS_CAJERO.filter((producto) => {
      const coincideCategoria =
        categoria === 'Todos' || producto.categoria === categoria;
      const coincideBusqueda = producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      return coincideCategoria && coincideBusqueda;
    });
  }, [categoria, busqueda]);

  const agregarProducto = (producto) => {
    if (!producto.disponible) return;

    setNotificacion('');
    setCarrito((previo) => {
      const existente = previo.find((item) => item.id === producto.id);

      if (existente) {
        return previo.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...previo, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId, delta) => {
    setCarrito((previo) =>
      previo
        .map((item) =>
          item.id === productoId
            ? { ...item, cantidad: item.cantidad + delta }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (productoId) => {
    setCarrito((previo) => previo.filter((item) => item.id !== productoId));
  };

  const confirmarPedido = () => {
    if (carrito.length === 0) return;

    const total = carrito.reduce(
      (suma, item) => suma + item.precio * item.cantidad,
      0
    );

    onRegistrarPedido({
      cliente,
      metodoPago,
      total,
      productos: carrito.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
      })),
    });

    setNotificacion(
      `Pedido de ${formatearMonedaCajero(total)} registrado correctamente.`
    );
    setCarrito([]);
    setCliente('');
    setMetodoPago('efectivo');
  };

  return (
    <section className="cashier-pos">
      <header className="cashier-section-header">
        <div>
          <h1>Punto de venta</h1>
          <p>Selecciona los productos para registrar un pedido presencial.</p>
        </div>
      </header>

      {notificacion && (
        <Alert
          color="success"
          fade={false}
          toggle={() => setNotificacion('')}
        >
          <i className="bi bi-check-circle me-2" />
          {notificacion}
        </Alert>
      )}

      <div className="cashier-pos__layout">
        <div className="cashier-pos__catalog">
          <div className="cashier-pos__toolbar">
            <div className="cashier-pos__search">
              <i className="bi bi-search" aria-hidden="true" />
              <input
                type="search"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
              />
            </div>

            <div className="cashier-pos__categories">
              {CATEGORIAS_CAJERO.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={categoria === opcion ? 'is-active' : ''}
                  onClick={() => setCategoria(opcion)}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          <div className="cashier-pos__products">
            {productosFiltrados.map((producto) => (
              <article className="cashier-product" key={producto.id}>
                <div className="cashier-product__image">
                  <i className={`bi ${producto.imagen}`} aria-hidden="true" />
                </div>

                <div className="cashier-product__content">
                  <span className="cashier-product__category">
                    {producto.categoria}
                  </span>
                  <h3>{producto.nombre}</h3>
                  <p>{producto.descripcion}</p>

                  <div className="cashier-product__footer">
                    <strong>{formatearMonedaCajero(producto.precio)}</strong>
                    <button
                      type="button"
                      onClick={() => agregarProducto(producto)}
                      disabled={!producto.disponible}
                      aria-label={`Agregar ${producto.nombre}`}
                    >
                      <i className="bi bi-plus-lg" />
                    </button>
                  </div>
                </div>

                {!producto.disponible && (
                  <span className="cashier-product__unavailable">
                    No disponible
                  </span>
                )}
              </article>
            ))}

            {productosFiltrados.length === 0 && (
              <div className="cashier-pos__empty">
                <i className="bi bi-search" />
                <strong>No se encontraron productos</strong>
                <span>Prueba con otra búsqueda o categoría.</span>
              </div>
            )}
          </div>
        </div>

        <CashierCart
          items={carrito}
          cliente={cliente}
          onCambiarCliente={setCliente}
          metodoPago={metodoPago}
          onCambiarMetodo={setMetodoPago}
          onCambiarCantidad={cambiarCantidad}
          onEliminar={eliminarProducto}
          onConfirmar={confirmarPedido}
        />
      </div>
    </section>
  );
}
