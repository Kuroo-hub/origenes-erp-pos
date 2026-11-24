import { createContext, useContext, useMemo, useState } from 'react';
import { ORDENES_COCINA_INICIALES } from '../mocks/ChefMocks.js';

export const SUCURSALES = [
  { id: 1, nombre: 'Centro Histórico' },
  { id: 2, nombre: 'Santa Ana' },
];

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [ordenes, setOrdenes] = useState(ORDENES_COCINA_INICIALES);
  const [sucursalId, setSucursalId] = useState(SUCURSALES[0].id);

  const sucursal =
    SUCURSALES.find((item) => item.id === sucursalId)?.nombre ?? SUCURSALES[0].nombre;

  const ordenesSucursal = useMemo(
    () => ordenes.filter((orden) => orden.sucursalId === sucursalId),
    [ordenes, sucursalId]
  );

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
      registrarPedido,
      cambiarEstado,
      cambiarEstadoEntrega,
    }),
    [ordenes, ordenesSucursal, sucursalId, sucursal]
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
