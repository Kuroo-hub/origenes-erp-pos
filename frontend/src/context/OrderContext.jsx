import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { getSales, registerSale } from '../services/salesApi.js';
import {
  getActiveCashSessions,
  closeCashSession,
  openCashSession
} from '../services/cashFlowApi.js';
import { getBranches, getCashRegisters } from '../services/catalogApi.js';

export const obtenerOrigenPedido = (orden) =>
  orden?.tipoEntrega === 'domicilio' ? 'Por llamada' : (orden?.origen ?? 'Presencial');

const OrderContext = createContext(null);

const METODOS_BACKEND_FRONTEND = {
  CASH: 'efectivo',
  CARD: 'tarjeta',
  BITCOIN: 'bitcoin',
  CHIVO: 'chivo'
};

const METODOS_FRONTEND_BACKEND = {
  efectivo: 'CASH',
  tarjeta: 'CARD',
  bitcoin: 'BITCOIN',
  chivo: 'CHIVO'
};

const extraerLista = (respuesta) =>
  Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];

function formatearHora(fecha) {
  if (!fecha) return '—';

  return new Date(fecha).toLocaleTimeString('es-SV', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function mapearVenta(venta) {
  const paymentMethod = METODOS_BACKEND_FRONTEND[venta.paymentMethod] ?? 'efectivo';

  return {
    id: `FAC-${venta.consecutiveNumber ?? venta.invoiceId}`,
    cliente: venta.customerName || 'Cliente presencial',
    origen: 'Presencial',
    hora: formatearHora(venta.issueDate),
    created_at: venta.issueDate,
    estado: venta.status === 'CANCELLED' ? 'Entregado' : 'Pendiente',
    sucursalId: Number(venta.branchId),
    sucursal: venta.branchName,
    tipoEntrega: venta.isDelivery ? 'domicilio' : 'local',
    deliveryStatus: venta.deliveryStatus ?? null,
    direccion: venta.deliveryAddress ?? '',
    numeroCasa: '',
    telefono: venta.deliveryPhone ?? '',
    tiempoObjetivoMin: 15,
    prioridad: 'normal',
    productos: (venta.items ?? []).map((item) => ({
      id: item.productId,
      nombre: item.name,
      cantidad: Number(item.quantity ?? 0),
      precio: Number(item.price ?? 0),
    })),
    total: Number(venta.total ?? 0),
    metodoPago: paymentMethod,
    ventaTurno: true
  };
}

export function OrderProvider({ children }) {
  const { user, token } = useAuth();
  const esAdministrador = user?.role === 'ADMINISTRATOR';
  const [ordenes, setOrdenes] = useState([]);
  const [sesionesActivas, setSesionesActivas] = useState([]);
  const [registrosCaja, setRegistrosCaja] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState(user?.branchId ?? null);
  const [cargandoDatos, setCargandoDatos] = useState(Boolean(token));
  const [errorDatos, setErrorDatos] = useState('');

  useEffect(() => {
    if (!token) {
      setSucursales([]);
      setCargandoDatos(false);
      return undefined;
    }

    let activo = true;

    getBranches()
      .then((respuesta) => {
        if (!activo) return;

        const filas = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];
        const normalizadas = filas.map((sucursal) => ({
          id: sucursal.branch_id,
          branch_id: sucursal.branch_id,
          nombre: sucursal.name,
          name: sucursal.name,
          direccion: sucursal.address,
          address: sucursal.address,
        }));

        const sucursalesVisibles = esAdministrador
          ? normalizadas
          : normalizadas.filter((sucursal) => Number(sucursal.id) === Number(user?.branchId));

        setSucursales(sucursalesVisibles);

        setSucursalId((actual) => {
          if (!esAdministrador && user?.branchId) return Number(user.branchId);
          if (actual) return actual;
          if (user?.branchId) return user.branchId;
          return sucursalesVisibles[0]?.id ?? null;
        });
      })
      .catch((caughtError) => {
        if (!activo) return;
        setSucursales([]);
        setErrorDatos(caughtError?.message ?? 'No se pudieron cargar las sucursales.');
      });

    return () => {
      activo = false;
    };
  }, [token, user?.branchId]);

  useEffect(() => {
    if (!esAdministrador && user?.branchId) {
      setSucursalId(Number(user.branchId));
    } else if (user?.branchId) {
      setSucursalId(user.branchId);
    }
  }, [esAdministrador, user?.branchId]);

  const recargarDatos = useCallback(
    async (branchId = sucursalId) => {
      setCargandoDatos(true);
      setErrorDatos('');

      try {
        const [ventas, sesiones, registros] = await Promise.all([
          getSales(branchId),
          getActiveCashSessions(),
          getCashRegisters(branchId)
        ]);

        setOrdenes(extraerLista(ventas).map(mapearVenta));
        setSesionesActivas(extraerLista(sesiones));
        setRegistrosCaja(extraerLista(registros));
      } catch (caughtError) {
        setOrdenes([]);
        setSesionesActivas([]);
        setRegistrosCaja([]);
        setErrorDatos(caughtError?.message ?? 'No se pudieron cargar los datos de la sucursal.');
      } finally {
        setCargandoDatos(false);
      }
    },
    [sucursalId]
  );

  useEffect(() => {
    if (!token || !sucursalId) {
      setCargandoDatos(false);
      return;
    }

    recargarDatos(sucursalId);
  }, [token, sucursalId, recargarDatos]);

  const sucursal =
    sucursales.find((item) => item.id === sucursalId)?.nombre ??
    sesionesActivas.find((item) => Number(item.branchId) === Number(sucursalId))
      ?.nombreSucursal ??
    sucursales[0]?.nombre ??
    '';

  const ordenesSucursal = useMemo(
    () => ordenes.filter((orden) => orden.sucursalId === sucursalId),
    [ordenes, sucursalId]
  );

  const sesionActiva = useMemo(
    () =>
      sesionesActivas.find(
        (sesion) => Number(sesion.branchId) === Number(sucursalId)
      ) ?? null,
    [sesionesActivas, sucursalId]
  );

  const caja = sesionActiva
    ? {
        abierta: true,
        abiertaDesde: sesionActiva.fechaApertura,
        cerradaDesde: null,
        montoInicial: Number(sesionActiva.montoInicial ?? 0),
        montoFinal: null,
        sessionId: sesionActiva.id,
        nombreCaja: sesionActiva.nombreCaja
      }
    : {
        abierta: false,
        abiertaDesde: null,
        cerradaDesde: null,
        montoInicial: null,
        montoFinal: null,
        sessionId: null,
        nombreCaja: registrosCaja[0]?.name ?? null
      };

  const cajaAbierta = caja.abierta;

  const abrirCaja = async (id = sucursalId, montoInicial = 0) => {
    const registro = registrosCaja[0];

    if (!registro) {
      throw new Error('No hay una caja configurada para esta sucursal.');
    }

    if (!sesionActiva) {
      await openCashSession({
        cashRegisterId: registro.cashRegisterId,
        employeeId: user?.employeeId,
        initialAmount: Number(montoInicial).toFixed(2)
      });
      await recargarDatos(id);
    }
  };

  const cerrarCaja = async (id = sucursalId, montoFinal = 0) => {
    if (!sesionActiva) {
      throw new Error('No hay una sesión de caja abierta.');
    }

    await closeCashSession(sesionActiva.id, {
      realAmount: Number(montoFinal).toFixed(2)
    });
    await recargarDatos(id);
  };

  const registrarPedido = async (pedido) => {
    const esDomicilio = pedido.tipoEntrega === 'domicilio';

    if (!sesionActiva) {
      throw new Error('La caja está cerrada. Manager debe abrirla para vender.');
    }

    const respuesta = await registerSale({
      customerData: pedido.cliente?.trim()
        ? { fullName: pedido.cliente.trim() }
        : null,
      branchId: pedido.sucursalId ?? sucursalId,
      shiftId: sesionActiva.id,
      documentType: 'FINAL_CONSUMER',
      paymentMethod: METODOS_FRONTEND_BACKEND[pedido.metodoPago] ?? 'CASH',
      isDelivery: esDomicilio,
      deliveryStatus: esDomicilio ? 'READY' : null,
      deliveryAddress: esDomicilio ? pedido.direccion : null,
      deliveryPhone: esDomicilio ? pedido.telefono : null,
      items: pedido.productos.map((producto) => ({
        productId: producto.id,
        quantity: producto.cantidad
      }))
    });

    await recargarDatos(pedido.sucursalId ?? sucursalId);

    return respuesta;
  };

  const cambiarEstado = (id, estado) => {
    setOrdenes((actuales) =>
      actuales.map((orden) => (orden.id === id ? { ...orden, estado } : orden))
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
      sucursales,
      seleccionarSucursal: (branchId) => {
        if (!esAdministrador && user?.branchId) {
          setSucursalId(Number(user.branchId));
          return;
        }
        setSucursalId(Number(branchId));
      },
      sesionesActivas,
      registrosCaja,
      cargandoDatos,
      errorDatos,
      recargarDatos,
      caja,
      cajaAbierta,
      abrirCaja,
      cerrarCaja,
      registrarPedido,
      cambiarEstado,
      cambiarEstadoEntrega
    }),
    [
      ordenes,
      ordenesSucursal,
      sucursalId,
      sucursal,
      sesionesActivas,
      registrosCaja,
      cargandoDatos,
      errorDatos,
      recargarDatos,
      caja,
      cajaAbierta
    ]
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
