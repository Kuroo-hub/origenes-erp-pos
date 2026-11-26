import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerSidebar from '../../components/owner/OwnerSidebar';
import OwnerTopbar from '../../components/owner/OwnerTopbar';
import {
  IconTrendingUp,
  IconWallet,
  IconAlertCircle,
  IconBuilding,
} from '../../components/owner/OwnerIcons';
import { getOwnerDashboard } from '../../services/ownerApi';
import { useOrders } from '../../context/OrderContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import '../../styles/owner.css';

const SUCURSALES_OFICIALES = [
  { id: 1, branch_id: 1, name: 'Sucursal San Salvador' },
  { id: 2, branch_id: 2, name: 'Sucursal Santa Ana' },
  { id: 3, branch_id: 3, name: 'Sucursal San Miguel' },
];

const OwnerPage = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const esAdministrador = user?.role === 'ADMINISTRATOR' || !user?.role;
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBranch, setSelectedBranch] = useState(
    esAdministrador ? 'ALL' : String(user?.branchId ?? 'ALL')
  );
  const { sesionesActivas = [], sucursales = [] } = useOrders();

  const [allBranches, setAllBranches] = useState(SUCURSALES_OFICIALES);
  const [dashboard, setDashboard] = useState({ branches: [], top_products: [], payables: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'ADMINISTRATOR') {
      setSelectedBranch('ALL');
    } else if (user?.branchId) {
      setSelectedBranch(String(user.branchId));
    }
  }, [user?.role, user?.branchId]);

  const loadDashboard = useCallback(async (branchFilter) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getOwnerDashboard(branchFilter);
      const data = res?.data || res || {};
      const fetchedBranches = Array.isArray(data.branches) ? data.branches : [];

      setDashboard({
        branches: fetchedBranches,
        top_products: Array.isArray(data.top_products) ? data.top_products : [],
        payables: Array.isArray(data.payables) ? data.payables : [],
      });

      if (branchFilter === 'ALL' && fetchedBranches.length > 0) {
        setAllBranches(
          fetchedBranches.map((b) => ({
            id: b.branch_id,
            branch_id: b.branch_id,
            name: b.name,
          }))
        );
      }
    } catch (err) {
      setError(err?.message ?? 'No se pudieron cargar los indicadores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(selectedBranch);
  }, [selectedBranch, loadDashboard]);

  const listaSucursales =
    allBranches.length > 0
      ? allBranches
      : Array.isArray(sucursales) && sucursales.length > 0
        ? sucursales
        : SUCURSALES_OFICIALES;

  const cajaAbiertaPorSucursal = (branchId) =>
    sesionesActivas.some((sesion) => Number(sesion.branchId) === Number(branchId));

  const visibleBranches =
    selectedBranch === 'ALL'
      ? dashboard.branches
      : dashboard.branches.filter((b) => String(b.branch_id) === String(selectedBranch));

  const visiblePayables =
    selectedBranch === 'ALL'
      ? dashboard.payables
      : dashboard.payables.filter((p) => String(p.branch_id) === String(selectedBranch));

  const totalRevenue = visibleBranches.reduce((sum, b) => sum + Number(b.monthly_revenue ?? 0), 0);
  const totalExpenses = visibleBranches.reduce((sum, b) => sum + Number(b.monthly_expenses ?? 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalPendingDebt = visiblePayables.reduce(
    (sum, p) => sum + Number(p.outstanding_amount ?? 0),
    0
  );
  const totalAlerts = visibleBranches.reduce((sum, b) => sum + Number(b.low_stock_alerts ?? 0), 0);

  const handleLogout = async () => {
    if (typeof logout === 'function') {
      await logout();
    }
    navigate('/login');
  };

  return (
    <div className="own-layout">
      <OwnerSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOffline={Boolean(error)}
        onLogout={handleLogout}
      />

      <div className="own-main">
        <OwnerTopbar
          activeTab={activeTab}
          selectedBranch={selectedBranch}
          onChangeBranch={setSelectedBranch}
          branches={listaSucursales}
          allowAll={esAdministrador}
        />

        {error && <div className="own-banner-offline">{error}</div>}

        <main className="own-content">
          {/* 4 Tarjetas KPI Ejecutivas */}
          <div className="own-kpi-grid">
            <article className="own-kpi-card">
              <div className="own-kpi-card__icon own-kpi-card__icon--blue">
                <IconTrendingUp />
              </div>
              <div className="own-kpi-card__body">
                <span className="own-kpi-card__label">Ingresos del mes</span>
                <strong className="own-kpi-card__value">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                <span className="own-kpi-card__hint">Ventas brutas registradas</span>
              </div>
            </article>

            <article className="own-kpi-card">
              <div className="own-kpi-card__icon own-kpi-card__icon--green">
                <IconWallet />
              </div>
              <div className="own-kpi-card__body">
                <span className="own-kpi-card__label">Utilidad operativa</span>
                <strong className="own-kpi-card__value">
                  ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                <span className="own-kpi-card__hint">Ingresos menos compras</span>
              </div>
            </article>

            <article className="own-kpi-card">
              <div className="own-kpi-card__icon own-kpi-card__icon--gold">
                <IconAlertCircle />
              </div>
              <div className="own-kpi-card__body">
                <span className="own-kpi-card__label">Cuentas por pagar</span>
                <strong className="own-kpi-card__value">
                  ${totalPendingDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </strong>
                <span className="own-kpi-card__hint">
                  {visiblePayables.length} facturas pendientes
                </span>
              </div>
            </article>

            <article className="own-kpi-card">
              <div className="own-kpi-card__icon own-kpi-card__icon--red">
                <IconBuilding />
              </div>
              <div className="own-kpi-card__body">
                <span className="own-kpi-card__label">Alertas de inventario</span>
                <strong className="own-kpi-card__value">{totalAlerts}</strong>
                <span className="own-kpi-card__hint">Insumos en stock mínimo</span>
              </div>
            </article>
          </div>

          {loading ? (
            <div className="own-loading">Cargando indicadores ejecutivos...</div>
          ) : (
            <>
              {/* Pestaña 1: Resumen Ejecutivo */}
              {activeTab === 'overview' && (
                <div className="own-overview-stack">
                  <div className="own-panel-card">
                    <div className="own-panel-card__header">
                      <div>
                        <h2 className="own-panel-card__title">Rendimiento por sucursal</h2>
                        <p className="own-panel-card__subtitle">
                          Comparativa de ventas, egresos por abastecimiento y órdenes atendidas.
                        </p>
                      </div>
                      <span className="own-pill-count">
                        {visibleBranches.length}{' '}
                        {visibleBranches.length === 1 ? 'sucursal' : 'sucursales'}
                      </span>
                    </div>

                    <div className="own-table-scroll">
                      <table className="own-table">
                        <thead>
                          <tr>
                            <th>Sucursal</th>
                            <th>Órdenes del mes</th>
                            <th>Ingresos</th>
                            <th>Egresos (Compras)</th>
                            <th>Margen neto</th>
                            <th>Estado caja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleBranches.map((b) => {
                            const margin = Number(b.monthly_revenue ?? 0) - Number(b.monthly_expenses ?? 0);
                            const cajaAbierta = cajaAbiertaPorSucursal(b.branch_id);
                            return (
                              <tr key={b.branch_id}>
                                <td>
                                  <div className="own-table__name">{b.name}</div>
                                  <div className="own-table__sub">{b.address}</div>
                                </td>
                                <td>{b.orders_count} pedidos</td>
                                <td className="own-table__name">
                                  ${Number(b.monthly_revenue ?? 0).toFixed(2)}
                                </td>
                                <td>${Number(b.monthly_expenses ?? 0).toFixed(2)}</td>
                                <td className="own-text-success">
                                  <strong>${margin.toFixed(2)}</strong>
                                </td>
                                <td>
                                  <span
                                    className={`own-status ${
                                      cajaAbierta
                                        ? 'own-status--success'
                                        : 'own-status--warning'
                                    }`}
                                  >
                                    {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="own-panel-card">
                    <div className="own-panel-card__header">
                      <div>
                        <h2 className="own-panel-card__title">Platos más vendidos</h2>
                        <p className="own-panel-card__subtitle">
                          Ranking de productos con mayor demanda y facturación.
                        </p>
                      </div>
                    </div>

                    <div className="own-table-scroll">
                      <table className="own-table">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Unidades vendidas</th>
                            <th>Ingresos generados</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.top_products.map((prod, idx) => (
                            <tr key={prod.product_id ?? idx}>
                              <td className="own-table__name">{prod.name}</td>
                              <td>{prod.category}</td>
                              <td>{prod.units_sold} uds.</td>
                              <td className="own-table__name">
                                ${Number(prod.revenue ?? 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Pestaña 2: Finanzas y Cuentas por Pagar */}
              {activeTab === 'finance' && (
                <div className="own-panel-card">
                  <div className="own-panel-card__header">
                    <div>
                      <h2 className="own-panel-card__title">
                        Cuentas por pagar a proveedores
                      </h2>
                      <p className="own-panel-card__subtitle">
                        Facturas de compra registradas con saldo pendiente de liquidación.
                      </p>
                    </div>
                    <span className="own-pill-count own-pill-count--warning">
                      Saldo total: ${totalPendingDebt.toFixed(2)}
                    </span>
                  </div>

                  <div className="own-table-scroll">
                    <table className="own-table">
                      <thead>
                        <tr>
                          <th>Factura</th>
                          <th>Proveedor</th>
                          <th>Sucursal</th>
                          <th>Vencimiento</th>
                          <th>Total factura</th>
                          <th>Saldo pendiente</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visiblePayables.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="own-table__empty">
                              No existen cuentas por pagar pendientes para esta selección.
                            </td>
                          </tr>
                        ) : (
                          visiblePayables.map((pay, idx) => (
                            <tr key={pay.payable_id ?? idx}>
                              <td className="own-table__name">{pay.invoice_number}</td>
                              <td>{pay.supplier_name}</td>
                              <td>{pay.branch_name}</td>
                              <td>{pay.due_date}</td>
                              <td>${Number(pay.total ?? 0).toFixed(2)}</td>
                              <td className="own-table__name">
                                ${Number(pay.outstanding_amount ?? 0).toFixed(2)}
                              </td>
                              <td>
                                <span
                                  className={`own-status ${
                                    pay.status === 'PARTIAL'
                                      ? 'own-status--blue'
                                      : 'own-status--warning'
                                  }`}
                                >
                                  {pay.status === 'PARTIAL' ? 'Abono parcial' : 'Pendiente'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pestaña 3: Supervisión de Sucursales */}
              {activeTab === 'branches' && (
                <div className="own-branches-grid">
                  {visibleBranches.map((b) => {
                    const cajaAbierta = cajaAbiertaPorSucursal(b.branch_id);

                    return (
                      <article key={b.branch_id} className="own-branch-card">
                        <div className="own-branch-card__header">
                          <div>
                            <h3 className="own-branch-card__title">{b.name}</h3>
                            <p className="own-branch-card__address">{b.address}</p>
                          </div>
                          <span
                            className={`own-status ${
                              cajaAbierta
                                ? 'own-status--success'
                                : 'own-status--warning'
                            }`}
                          >
                            {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
                          </span>
                        </div>

                        <div className="own-branch-card__metrics">
                          <div className="own-branch-metric">
                            <span>Personal activo</span>
                            <strong>{b.active_staff} empleados</strong>
                          </div>
                          <div className="own-branch-metric">
                            <span>Órdenes atendidas</span>
                            <strong>{b.orders_count} pedidos</strong>
                          </div>
                          <div className="own-branch-metric">
                            <span>Alertas de stock</span>
                            <strong>{b.low_stock_alerts} insumos</strong>
                          </div>
                          <div className="own-branch-metric">
                            <span>Facturación mensual</span>
                            <strong>${Number(b.monthly_revenue ?? 0).toFixed(2)}</strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default OwnerPage;