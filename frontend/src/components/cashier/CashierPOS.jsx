
import { useMemo, useState } from 'react';
import { Alert } from 'reactstrap';
import CashierCart from './CashierCart.jsx';

import {
  CATEGORIAS_CAJERO,
  formatearMonedaCajero,
} from '../../mocks/CashierMocks.js';

export default function CashierPOS({
  sucursal,
  productos,
  onRegistrarPedido,
  onDescontarStock,
}) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [carrito, setCarrito] = useState([]);
  const [cliente, setCliente] = useState('');
  const [entrega, setEntrega] = useState({
    tipo: 'local',
    direccion: '',
    numeroCasa: '',
    telefono: '',
  });
  const [tiempoPreparacion, setTiempoPreparacion] = useState(15);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [notificacion, setNotificacion] = useState('');

  const cambiarEntrega = (campo, valor) => {
    setEntrega((previo) => ({ ...previo, [campo]: valor }));
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const coincideCategoria =
        categoria === 'Todos' ||
        producto.categoria === categoria;

      const coincideBusqueda = producto.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      return coincideCategoria && coincideBusqueda;
    });
  }, [productos, categoria, busqueda]);

  const cantidadEnCarrito = (productoId) =>
    carrito.find((item) => item.id === productoId)?.cantidad ?? 0;

  const agregarProducto = (producto) => {
    const cantidadActual = cantidadEnCarrito(producto.id);

    if (
      !producto.disponible ||
      cantidadActual >= producto.stock
    ) {
      return;
    }

    setNotificacion('');

    setCarrito((previo) => {
      const existente = previo.find(
        (item) => item.id === producto.id
      );

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
        .map((item) => {
          if (item.id !== productoId) return item;

          const productoActual = productos.find(
            (producto) => producto.id === productoId
          );

          const nuevaCantidad = item.cantidad + delta;

          if (
            nuevaCantidad < 1 ||
            nuevaCantidad > (productoActual?.stock ?? 0)
          ) {
            return item;
          }

          return {
            ...item,
            cantidad: nuevaCantidad,
          };
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarProducto = (productoId) => {
    setCarrito((previo) =>
      previo.filter((item) => item.id !== productoId)
    );
  };

  const confirmarPedido = () => {
    if (carrito.length === 0) return;

    if (
      entrega.tipo === 'domicilio' &&
      (!entrega.direccion.trim() ||
        !entrega.numeroCasa.trim() ||
        !entrega.telefono.trim())
    ) {
      setNotificacion(
        'Completa dirección, número de casa y teléfono para la entrega.'
      );
      return;
    }

    if (
      typeof onRegistrarPedido !== 'function' ||
      typeof onDescontarStock !== 'function'
    ) {
      setNotificacion(
        'No se pudo registrar la venta. Intenta nuevamente.'
      );
      return;
    }

    const inventarioInsuficiente = carrito.some((item) => {
      const productoActual = productos.find(
        (producto) => producto.id === item.id
      );

      return (
        !productoActual ||
        item.cantidad > productoActual.stock
      );
    });

    if (inventarioInsuficiente) {
      setNotificacion(
        'El inventario cambió. Revisa las cantidades antes de confirmar.'
      );
      return;
    }

    const total = carrito.reduce(
      (suma, item) => suma + item.precio * item.cantidad,
      0
    );

    const productosVendidos = carrito.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
    }));

    onRegistrarPedido({
      cliente,
      metodoPago,
      tipoEntrega: entrega.tipo,
      direccion: entrega.direccion,
      numeroCasa: entrega.numeroCasa,
      telefono: entrega.telefono,
      tiempoPreparacion,
      total,
      productos: productosVendidos,
    });

    onDescontarStock(
      carrito.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
      }))
    );

    setNotificacion(
      entrega.tipo === 'domicilio'
        ? `Venta de ${formatearMonedaCajero(total)} registrada y enviada a entregas en ${sucursal}.`
        : `Venta de ${formatearMonedaCajero(total)} registrada correctamente en ${sucursal}.`
    );

    setCarrito([]);
    setCliente('');
    setEntrega({
      tipo: 'local',
      direccion: '',
      numeroCasa: '',
      telefono: '',
    });
    setTiempoPreparacion(15);
    setMetodoPago('efectivo');
  };

  return (
    <section className="cashier-pos">
      <header className="cashier-section-header">
        <div>
          <h1>Punto de venta</h1>
          <p>
            Registra ventas y consulta el inventario de {sucursal}.
          </p>
        </div>
      </header>

      {notificacion && (
        <Alert
          color="success"
          fade={false}
          toggle={() => setNotificacion('')}
        >
          <i className="bi bi-info-circle me-2" aria-hidden="true" />
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
                onChange={(evento) =>
                  setBusqueda(evento.target.value)
                }
                placeholder="Buscar productos..."
                aria-label="Buscar productos"
              />
            </div>

            <div className="cashier-pos__categories">
              {CATEGORIAS_CAJERO.map((opcion) => (
                <button
                  key={opcion}
                  type="button"
                  className={
                    categoria === opcion ? 'is-active' : ''
                  }
                  onClick={() => setCategoria(opcion)}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          <div className="cashier-pos__products">
            {productosFiltrados.map((producto) => {
              const sinStock = producto.stock <= 0;

              const limiteAlcanzado =
                cantidadEnCarrito(producto.id) >= producto.stock;

              return (
                <article
                  className="cashier-product"
                  key={producto.id}
                >
                  <div className="cashier-product__image">
                    <i
                      className={`bi ${producto.imagen}`}
                      aria-hidden="true"
                    />
                  </div>

                  <div className="cashier-product__content">
                    <span className="cashier-product__category">
                      {producto.categoria}
                    </span>

                    <h3>{producto.nombre}</h3>
                    <p>{producto.descripcion}</p>

                    <div className="cashier-product__footer">
                      <strong>
                        {formatearMonedaCajero(producto.precio)}
                      </strong>

                      <span>Stock: {producto.stock}</span>

                      <button
                        type="button"
                        onClick={() => agregarProducto(producto)}
                        disabled={sinStock || limiteAlcanzado}
                        aria-label={`Agregar ${producto.nombre}`}
                      >
                        <i className="bi bi-plus-lg" />
                      </button>
                    </div>
                  </div>

                  {sinStock && (
                    <span className="cashier-product__unavailable">
                      Sin existencias
                    </span>
                  )}
                </article>
              );
            })}

            {productosFiltrados.length === 0 && (
              <div className="cashier-pos__empty">
                <i className="bi bi-search" aria-hidden="true" />
                <strong>No se encontraron productos</strong>
                <span>
                  Prueba con otra búsqueda o categoría.
                </span>
              </div>
            )}
          </div>
        </div>

        <CashierCart
          items={carrito}
          cliente={cliente}
          onCambiarCliente={setCliente}
          entrega={entrega}
          onCambiarEntrega={cambiarEntrega}
          tiempoPreparacion={tiempoPreparacion}
          onCambiarTiempo={setTiempoPreparacion}
          metodoPago={metodoPago}
          onCambiarMetodo={setMetodoPago}
          onCambiarCantidad={cambiarCantidad}
          onEliminar={eliminarProducto}
          onConfirmar={confirmarPedido}
          sucursal={sucursal}
        />
      </div>
    </section>
  );
}
