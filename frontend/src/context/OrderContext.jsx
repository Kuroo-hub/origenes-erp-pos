import { createContext, useContext, useMemo, useState } from 'react';
import { ORDENES_COCINA_INICIALES } from '../mocks/ChefMocks.js';
import { SUCURSALES } from '../mocks/SucursalesMocks.js';

export { SUCURSALES };

export const obtenerOrigenPedido = (orden) =>
  orden?.tipoEntrega === 'domicilio' ? 'Por llamada' : (orden?.origen ?? 'Presencial');

const OrderContext = createContext(null);

const crearEstadoCajas = () =>
  Object.fromEntries(
    SUCURSALES.map((sucursal) => [
      sucursal.id,
      {
        abierta: true,
        abiertaDesde: Date.now() - 2 * 60 * 60 * 1000,
        cerradaDesde: null,
        montoInicial: 150,
        montoFinal: null,
      },
    ])
  );

export function OrderProvider({ children }) {
  const [ordenes, setOrdenes] = useState(ORDENES_COCINA_INICIALES);
  const [sucursalId, setSucursalId] = useState(SUCURSALES[0].id);
  const [cajas, setCajas] = useState(crearEstadoCajas);

  const sucursal =
    SUCURSALES.find((item) => item.id === sucursalId)?.nombre ?? SUCURSALES[0].nombre;

  const ordenesSucursal = useMemo(
    () => ordenes.filter((orden) => orden.sucursalId === sucursalId),
    [ordenes, sucursalId]
  );

  const caja = cajas[sucursalId] ?? {
    abierta: false,
    abiertaDesde: null,
    cerradaDesde: null,
    montoInicial: null,
    montoFinal: null,
  };
  const cajaAbierta = caja.abierta;

  const abrirCaja = (id = sucursalId, montoInicial = 0) => {
    setCajas((actuales) => ({
      ...actuales,
      [id]: {
        abierta: true,
        abiertaDesde: Date.now(),
        cerradaDesde: null,
        montoInicial: Number(montoInicial) || 0,
        montoFinal: null,
      },
    }));
  };

  const cerrarCaja = (id = sucursalId, montoFinal = 0) => {
    setCajas((actuales) => ({
      ...actuales,
      [id]: {
        ...(actuales[id] ?? {}),
        abierta: false,
        cerradaDesde: Date.now(),
        montoFinal: Number(montoFinal) || 0,
      },
    }));
  };

  const registrarPedido = (pedido) => {
    setOrdenes((actuales) => [pedido, ...actuales]);
  };

  const cambiarEstado = (id, estado) => {
    setOrdenes((actuales) =>
      actuales.map((orden) =>
        orden.id === id ? { ...orden, estado } : orden
      )
    );
  };

  const cambiarEstadoEntrega = (id, deliveryStatus, estado) => {
    setOrdenes((actuales) =>
      actuales.map((orden) =>
        orden.id === id ? { ...orden, deliveryStatus, estado } : orden
      )
    );
  };

  const valor = useMemo(
    () => ({
      ordenes,
      ordenesSucursal,
      sucursalId,
      sucursal,
      sucursales: SUCURSALES,
      seleccionarSucursal: setSucursalId,
      cajas,
      caja,
      cajaAbierta,
      abrirCaja,
      cerrarCaja,
      registrarPedido,
      cambiarEstado,
      cambiarEstadoEntrega,
    }),
    [ordenes, ordenesSucursal, sucursalId, sucursal, cajas, caja, cajaAbierta]
  );

  return <OrderContext.Provider value={valor}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const contexto = useContext(OrderContext);

  if (!contexto) {
    throw new Error('useOrders debe usarse dentro de OrderProvider');
  }

  return contexto;
}
