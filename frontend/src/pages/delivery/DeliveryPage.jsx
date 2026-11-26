import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/delivery.css';

const PAYMENT_LABELS = {
  CASH: 'Efectivo contra entrega',
  CARD: 'Tarjeta (Pagado)',
  BITCOIN: 'Bitcoin (Pagado)',
  CHIVO: 'Chivo Wallet (Pagado)',
};

const DELIVERY_STATUS_META = {
  READY: { label: 'Listo en sucursal', badge: 'warning' },
  IN_TRANSIT: { label: 'Pedido recogido', badge: 'blue' },
  DELIVERED: { label: 'Entregado', badge: 'success' },
};

const SUCURSALES_OFICIALES = [
  { id: 1, branch_id: 1, name: 'Sucursal San Salvador' },
  { id: 2, branch_id: 2, name: 'Sucursal Santa Ana' },
  { id: 3, branch_id: 3, name: 'Sucursal San Miguel' },
];

const DeliveryPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { sucursalId, seleccionarSucursal, sucursales = [] } = useOrders();
  const [activeTab, setActiveTab] = useState('active');
  const [localBranchId, setLocalBranchId] = useState(null);

  const listaSucursales =
    Array.isArray(sucursales) && sucursales.length > 0
      ? sucursales
      : SUCURSALES_OFICIALES;

  const branchActual = Number(
    localBranchId ??
      sucursalId ??
      listaSucursales[0]?.branch_id ??
      listaSucursales[0]?.id ??
      1
  );

  const handleChangeBranch = (nuevoId) => {
    const idNumerico = Number(nuevoId);
    setLocalBranchId(idNumerico);
    if (typeof seleccionarSucursal === 'function') {
      seleccionarSucursal(idNumerico);
    }
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadDeliveries = useCallback(async (branchId) => {
    if (!branchId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getDeliveryOrders(branchId);
      setOrders(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setOrders([]);
      setError(err?.message ?? 'No se pudieron cargar las entregas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeliveries(branchActual);
  }, [branchActual, loadDeliveries]);

  const activeOrders = orders.filter((o) => o.delivery_status !== 'DELIVERED');
  const deliveredOrders = orders.filter((o) => o.delivery_status === 'DELIVERED');
  const pickedUpCount = activeOrders.filter((o) => o.delivery_status === 'IN_TRANSIT').length;

  const cashToCollect = activeOrders
    .filter((o) => o.payment_status === 'PENDING_COLLECTION')
    .reduce((sum, o) => sum + Number(o.total_amount ?? 0), 0);

  const handleAdvanceStatus = async (order, nextStatus) => {
    setFeedback(null);

    try {
      await updateDeliveryStatus(order.order_id, {
        delivery_status: nextStatus,
      });
      await loadDeliveries(branchActual);
      setFeedback({
        type: 'success',
        text:
          nextStatus === 'IN_TRANSIT'
            ? `Pedido ${order.order_id} marcado como recogido.`
            : `Pedido ${order.order_id} entregado correctamente.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message ?? 'No se pudo actualizar el estado de la entrega.',
      });
    }
  };

  const handleLogout = async () => {
    if (typeof logout === 'function') {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="del-layout">
      <DeliverySidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingCount={activeOrders.length}
        isOffline={Boolean(error)}
        onLogout={handleLogout}
      />

      <div className="del-main">
        <DeliveryTopbar
          activeTab={activeTab}
          selectedBranch={branchActual}
          onChangeBranch={handleChangeBranch}
          branches={listaSucursales}
        />

        {error && <div className="del-banner-offline">{error}</div>}

        <main className="del-content">
          {/* 4 Tarjetas KPI */}
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
                <span className="del-kpi-card__label">Pedidos recogidos</span>
                <strong className="del-kpi-card__value">{pickedUpCount}</strong>
                <span className="del-kpi-card__hint">Recogidos por el repartidor</span>
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
                  const items = Array.isArray(order.items) ? order.items : [];

                  return (
                    <article key={order.order_id} className="del-order-card">
                      <div className="del-order-card__header">
                        <div>
                          <span className="del-order-card__id">{order.order_id}</span>
                          <span className="del-order-card__time"> · {order.created_at}</span>
                          {order.origen && (
                            <span className="del-order-card__origin">{order.origen}</span>
                          )}
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
                        {items.map((item, idx) => (
                          <li key={idx}>
                            <span>
                              {item.quantity}x {item.name ?? item.product_name ?? 'Producto'}
                            </span>
                            <span>
                              ${(Number(item.quantity ?? 0) * Number(item.price ?? 0)).toFixed(2)}
                            </span>
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
                            ? `$${Number(order.total_amount ?? 0).toFixed(2)}`
                            : `$0.00 (Pagado: $${Number(order.total_amount ?? 0).toFixed(2)})`}
                        </strong>
                      </div>

                      {/* Botones de Acción */}
                      <div className="del-order-card__actions">
                        {order.delivery_status !== 'IN_TRANSIT' && (
                          <button
                            type="button"
                            className="del-btn del-btn--primary"
                            onClick={() => handleAdvanceStatus(order, 'IN_TRANSIT')}
                          >
                            Pedido recogido
                          </button>
                        )}

                        {order.delivery_status === 'IN_TRANSIT' && (
                          <button
                            type="button"
                            className="del-btn del-btn--success"
                            onClick={() => handleAdvanceStatus(order, 'DELIVERED')}
                          >
                            Entregado
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
                            ${Number(ord.total_amount ?? 0).toFixed(2)}
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