import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliverySidebar from '../../components/delivery/DeliverySidebar';
import DeliveryTopbar from '../../components/delivery/DeliveryTopbar';
import {
  IconTruck,
  IconClock,
  IconCheckCircle,
  IconDollar,
  IconMapPin,
  IconPhone,
} from '../../components/delivery/DeliveryIcons';
import { getDeliveryOrders, updateDeliveryStatus } from '../../services/deliveryApi';
import { useOrders } from '../../context/OrderContext.jsx';
import { INITIAL_DELIVERIES_MOCK } from '../../mocks/DeliveryMocks';
import '../../styles/delivery.css';

const PAYMENT_LABELS = {
  CASH: 'Efectivo contra entrega',
  CARD: 'Tarjeta (Pagado en línea)',
  BITCOIN: 'Bitcoin (Pagado en línea)',
  CHIVO: 'Chivo Wallet (Pagado en línea)',
};

const DELIVERY_STATUS_META = {
  PREPARING: { label: 'En preparación', badge: 'blue' },
  READY: { label: 'Listo en sucursal', badge: 'warning' },
  IN_TRANSIT: { label: 'En camino', badge: 'blue' },
  DELIVERED: { label: 'Entregado', badge: 'success' },
};

const METODOS_DELIVERY = {
  efectivo: 'CASH',
  tarjeta: 'CARD',
  bitcoin: 'BITCOIN',
  chivo: 'CHIVO',
};

const ordenADelivery = (orden) => {
  const deliveryStatus =
    orden.deliveryStatus ??
    (orden.estado === 'Entregado'
      ? 'DELIVERED'
      : orden.estado === 'Listo'
        ? 'READY'
        : 'PREPARING');

  return {
    order_id: orden.id,
    branch_id: orden.sucursalId,
    customer_name: orden.cliente,
    customer_phone: orden.telefono,
    delivery_address: `${orden.direccion}, Casa #${orden.numeroCasa}`,
    items: orden.productos.map((producto) => ({
      name: producto.nombre,
      quantity: producto.cantidad,
      price: Number(producto.precio ?? 0),
    })),
    total_amount: Number(orden.total),
    payment_method: METODOS_DELIVERY[orden.metodoPago] ?? 'CASH',
    payment_status:
      deliveryStatus === 'DELIVERED'
        ? 'COLLECTED'
        : orden.metodoPago === 'efectivo'
          ? 'PENDING_COLLECTION'
          : 'PAID_ONLINE',
    delivery_status: deliveryStatus,
    created_at: orden.hora,
    fromCashier: true,
  };
};

const DeliveryPage = () => {
  const navigate = useNavigate();
  const { ordenes, cambiarEstadoEntrega } = useOrders();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedBranch, setSelectedBranch] = useState(1);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingOfflineData, setUsingOfflineData] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadDeliveries = useCallback(async (branchId) => {
    setLoading(true);
    try {
      const res = await getDeliveryOrders(branchId);
      setOrders(Array.isArray(res) ? res : res.data || []);
      setUsingOfflineData(false);
    } catch {
      setOrders(INITIAL_DELIVERIES_MOCK.filter((o) => o.branch_id === branchId));
      setUsingOfflineData(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries(selectedBranch);
  }, [selectedBranch, loadDeliveries]);

  const pedidosCajero = useMemo(
    () =>
      ordenes
        .filter(
          (orden) =>
            orden.tipoEntrega === 'domicilio' &&
            orden.sucursalId === selectedBranch
        )
        .map(ordenADelivery),
    [ordenes, selectedBranch]
  );

  const pedidos = useMemo(() => {
    const idsCajero = new Set(pedidosCajero.map((pedido) => pedido.order_id));

    return [
      ...pedidosCajero,
      ...orders.filter((pedido) => !idsCajero.has(pedido.order_id)),
    ];
  }, [pedidosCajero, orders]);

  const activeOrders = pedidos.filter((o) => o.delivery_status !== 'DELIVERED');
  const deliveredOrders = pedidos.filter((o) => o.delivery_status === 'DELIVERED');
  const inTransitCount = activeOrders.filter((o) => o.delivery_status === 'IN_TRANSIT').length;

  const cashToCollect = activeOrders
    .filter((o) => o.payment_status === 'PENDING_COLLECTION')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const handleAdvanceStatus = async (order, nextStatus) => {
    setFeedback(null);

    const mensaje =
      nextStatus === 'READY'
        ? `Pedido ${order.order_id} marcado listo en cocina.`
        : nextStatus === 'IN_TRANSIT'
          ? `Pedido ${order.order_id} marcado en camino hacia ${order.customer_name}.`
          : `Pedido ${order.order_id} entregado correctamente.`;

    if (order.fromCashier) {
      cambiarEstadoEntrega(
        order.order_id,
        nextStatus,
        nextStatus === 'DELIVERED' ? 'Entregado' : 'Listo'
      );
      setFeedback({ type: 'success', text: mensaje });
      return;
    }

    const nextPaymentStatus =
      nextStatus === 'DELIVERED' ? 'COLLECTED' : order.payment_status;

    try {
      await updateDeliveryStatus(order.order_id, {
        delivery_status: nextStatus,
        payment_status: nextPaymentStatus,
      });
      await loadDeliveries(selectedBranch);
    } catch {
      setOrders((prev) =>
        prev.map((item) =>
          item.order_id === order.order_id
            ? { ...item, delivery_status: nextStatus, payment_status: nextPaymentStatus }
            : item
        )
      );
    }

    setFeedback({ type: 'success', text: mensaje });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="del-layout">
      <DeliverySidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={activeOrders.length}
        isOffline={usingOfflineData}
        onLogout={handleLogout}
      />

      <div className="del-main">
        <DeliveryTopbar
          activeTab={activeTab}
          selectedBranch={selectedBranch}
          onChangeBranch={setSelectedBranch}
        />

        {usingOfflineData && (
          <div className="del-banner-offline">
            Modo demostración activo con pedidos de prueba de la sucursal.
          </div>
        )}

        <main className="del-content">
          {/* 4 Tarjetas KPI estilo exacto de Cajero / RRHH */}
          <div className="del-kpi-grid">
            <article className="del-kpi-card">
              <div className="del-kpi-card__icon del-kpi-card__icon--blue">
                <IconClock />
              </div>
              <div className="del-kpi-card__body">
                <span className="del-kpi-card__label">Pedidos por entregar</span>
                <strong className="del-kpi-card__value">{activeOrders.length}</strong>
                <span className="del-kpi-card__hint">Asignados en ruta</span>
              </div>
            </article>

            <article className="del-kpi-card">
              <div className="del-kpi-card__icon del-kpi-card__icon--gold">
                <IconTruck />
              </div>
              <div className="del-kpi-card__body">
                <span className="del-kpi-card__label">En camino</span>
                <strong className="del-kpi-card__value">{inTransitCount}</strong>
                <span className="del-kpi-card__hint">En tránsito al cliente</span>
              </div>
            </article>

            <article className="del-kpi-card">
              <div className="del-kpi-card__icon del-kpi-card__icon--red">
                <IconDollar />
              </div>
              <div className="del-kpi-card__body">
                <span className="del-kpi-card__label">Efectivo por cobrar</span>
                <strong className="del-kpi-card__value">${cashToCollect.toFixed(2)}</strong>
                <span className="del-kpi-card__hint">Contra entrega pendiente</span>
              </div>
            </article>

            <article className="del-kpi-card">
              <div className="del-kpi-card__icon del-kpi-card__icon--green">
                <IconCheckCircle />
              </div>
              <div className="del-kpi-card__body">
                <span className="del-kpi-card__label">Entregados hoy</span>
                <strong className="del-kpi-card__value">{deliveredOrders.length}</strong>
                <span className="del-kpi-card__hint">Completados en turno</span>
              </div>
            </article>
          </div>

          {feedback && (
            <div className={`del-toast del-toast--${feedback.type}`}>{feedback.text}</div>
          )}

          {loading ? (
            <div className="del-loading">Cargando entregas de la sucursal...</div>
          ) : activeTab === 'active' ? (
            /* Vista de Entregas Activas */
            <div className="del-orders-grid">
              {activeOrders.length === 0 ? (
                <div className="del-empty-card">
                  No hay entregas pendientes en esta sucursal por el momento.
                </div>
              ) : (
                activeOrders.map((order) => {
                  const statusMeta =
                    DELIVERY_STATUS_META[order.delivery_status] || DELIVERY_STATUS_META.READY;
                  const mustCollect = order.payment_status === 'PENDING_COLLECTION';

                  return (
                    <article key={order.order_id} className="del-order-card">
                      <div className="del-order-card__header">
                        <div>
                          <span className="del-order-card__id">{order.order_id}</span>
                          <span className="del-order-card__time"> · {order.created_at}</span>
                        </div>
                        <span className={`del-status del-status--${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Información del Cliente y Dirección */}
                      <div className="del-order-card__customer">
                        <h3 className="del-order-card__name">{order.customer_name}</h3>
                        <p className="del-order-card__phone">
                          <IconPhone />
                          <span>{order.customer_phone}</span>
                        </p>
                      </div>

                      <div className="del-order-card__address-box">
                        <div className="del-order-card__address-line">
                          <IconMapPin />
                          <strong>{order.delivery_address}</strong>
                        </div>
                        {order.address_reference && (
                          <p className="del-order-card__reference">
                            Referencia: {order.address_reference}
                          </p>
                        )}
                      </div>

                      {/* Detalle de productos */}
                      <ul className="del-order-card__items">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>${(item.quantity * item.price).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Bloque de Monto a Pagar / Cobrar */}
                      <div
                        className={`del-payment-box ${
                          mustCollect ? 'is-collect' : 'is-prepaid'
                        }`}
                      >
                        <div>
                          <span className="del-payment-box__label">
                            {mustCollect ? 'MONTO A COBRAR AL CLIENTE' : 'ESTADO DEL PAGO'}
                          </span>
                          <span className="del-payment-box__method">
                            {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                          </span>
                        </div>
                        <strong className="del-payment-box__amount">
                          {mustCollect
                            ? `$${Number(order.total_amount).toFixed(2)}`
                            : `$0.00 (Pagado: $${Number(order.total_amount).toFixed(2)})`}
                        </strong>
                      </div>

                      {/* Botones de Acción */}
                      <div className="del-order-card__actions">
                        {order.delivery_status === 'PREPARING' && (
                          <button
                            type="button"
                            className="del-btn del-btn--primary"
                            onClick={() => handleAdvanceStatus(order, 'READY')}
                          >
                            Marcar listo en cocina
                          </button>
                        )}

                        {order.delivery_status === 'READY' && (
                          <button
                            type="button"
                            className="del-btn del-btn--primary"
                            onClick={() => handleAdvanceStatus(order, 'IN_TRANSIT')}
                          >
                            Iniciar entrega en ruta
                          </button>
                        )}

                        {order.delivery_status === 'IN_TRANSIT' && (
                          <button
                            type="button"
                            className="del-btn del-btn--success"
                            onClick={() => handleAdvanceStatus(order, 'DELIVERED')}
                          >
                            {mustCollect
                              ? `Confirmar cobro ($${Number(order.total_amount).toFixed(2)}) y entrega`
                              : 'Confirmar pedido entregado'}
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          ) : (
            /* Vista de Historial de Entregas Completadas */
            <div className="del-panel-card">
              <div className="del-panel-card__header">
                <div>
                  <h2 className="del-panel-card__title">Historial de pedidos entregados</h2>
                  <p className="del-panel-card__subtitle">
                    Resumen de entregas finalizadas en la sucursal seleccionada.
                  </p>
                </div>
                <span className="del-pill-count">{deliveredOrders.length} registros</span>
              </div>

              <div className="del-table-scroll">
                <table className="del-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Dirección de entrega</th>
                      <th>Método de pago</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="del-table__empty">
                          Aún no hay entregas completadas en este turno.
                        </td>
                      </tr>
                    ) : (
                      deliveredOrders.map((ord) => (
                        <tr key={ord.order_id}>
                          <td className="del-table__name">{ord.order_id}</td>
                          <td>
                            <div className="del-table__name">{ord.customer_name}</div>
                            <div className="del-table__sub">{ord.customer_phone}</div>
                          </td>
                          <td>{ord.delivery_address}</td>
                          <td>{PAYMENT_LABELS[ord.payment_method] || ord.payment_method}</td>
                          <td className="del-table__name">
                            ${Number(ord.total_amount).toFixed(2)}
                          </td>
                          <td>
                            <span className="del-status del-status--success">Entregado</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeliveryPage;