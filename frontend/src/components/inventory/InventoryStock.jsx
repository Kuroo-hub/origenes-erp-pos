import React, { useState } from 'react';
import { createInventoryAdjustment } from '../../services/inventoryApi';

const TYPE_LABELS = {
  RAW_MATERIAL: 'Materia Prima',
  PACKAGING: 'Empaque y Servicio',
  RESALE: 'Producto Reventa',
};

const InventoryStock = ({ branchId, inventory, setInventory, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  // Estado para modal/panel de ajuste manual
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('ADJUSTMENT');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Cálculos de KPIs mediante iteradores de arreglos
  const totalItems = inventory.length;
  const criticalItems = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.minimum_stock)
  );
  const outOfStockCount = inventory.filter((item) => Number(item.quantity) === 0).length;
  const healthyCount = totalItems - criticalItems.length;

  // Filtrado combinado de la tabla
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.ingredient_type === typeFilter;
    const isLow = Number(item.quantity) <= Number(item.minimum_stock);
    const matchesAlert = !onlyAlerts || isLow;
    return matchesSearch && matchesType && matchesAlert;
  });

  const handleOpenAdjustment = (item) => {
    setSelectedItem(item);
    setAdjustmentType('ADJUSTMENT');
    setAdjustmentQty('');
    setAdjustmentReason('');
    setFeedback(null);
  };

  const handleCloseAdjustment = () => {
    setSelectedItem(null);
    setAdjustmentQty('');
    setAdjustmentReason('');
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();
    const numericQty = Number(adjustmentQty);

    if (!numericQty || numericQty <= 0) {
      setFeedback({ type: 'error', text: 'Ingresa una cantidad válida mayor a cero.' });
      return;
    }

    if (!adjustmentReason.trim()) {
      setFeedback({ type: 'error', text: 'Debes indicar el motivo del ajuste.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      branch_id: branchId,
      ingredient_id: selectedItem.ingredient_id,
      movement_type: adjustmentType,
      quantity: numericQty,
      reason: adjustmentReason.trim(),
    };

    try {
      await createInventoryAdjustment(payload);
      setFeedback({ type: 'success', text: 'Ajuste registrado correctamente en el servidor.' });
      await onRefresh();
      handleCloseAdjustment();
    } catch {
      // Actualización optimista local si el backend está en modo offline
      setInventory((prev) =>
        prev.map((inv) => {
          if (inv.ingredient_id !== selectedItem.ingredient_id) return inv;
          const current = Number(inv.quantity);
          const updated =
            adjustmentType === 'IN' ? current + numericQty : Math.max(0, current - numericQty);
          return { ...inv, quantity: updated };
        })
      );
      setFeedback({
        type: 'success',
        text: `Ajuste aplicado localmente a ${selectedItem.name}.`,
      });
      handleCloseAdjustment();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="inv-section">
      {/* Tarjetas de Resumen (KPIs) */}
      <div className="inv-kpi-grid">
        <article className="inv-kpi-card">
          <span className="inv-kpi-card__label">Total de Insumos</span>
          <strong className="inv-kpi-card__value">{totalItems}</strong>
          <span className="inv-kpi-card__hint">Catálogo activo en sucursal</span>
        </article>

        <article className="inv-kpi-card inv-kpi-card--success">
          <span className="inv-kpi-card__label">Stock Óptimo</span>
          <strong className="inv-kpi-card__value">{healthyCount}</strong>
          <span className="inv-kpi-card__hint">Por encima del mínimo</span>
        </article>

        <article className="inv-kpi-card inv-kpi-card--warning">
          <span className="inv-kpi-card__label">Alerta Stock Mínimo</span>
          <strong className="inv-kpi-card__value">{criticalItems.length}</strong>
          <span className="inv-kpi-card__hint">Requieren reabastecimiento</span>
        </article>

        <article className="inv-kpi-card inv-kpi-card--danger">
          <span className="inv-kpi-card__label">Agotados</span>
          <strong className="inv-kpi-card__value">{outOfStockCount}</strong>
          <span className="inv-kpi-card__hint">Existencia en 0</span>
        </article>
      </div>

      {/* Alerta visual destacada si existen insumos críticos */}
      {criticalItems.length > 0 && (
        <div className="inv-alert-box" role="alert">
          <div className="inv-alert-box__content">
            <strong>Atención de abastecimiento:</strong> Hay {criticalItems.length} insumo(s) en
            nivel mínimo o agotado ({criticalItems.slice(0, 3).map((i) => i.name).join(', ')}
            {criticalItems.length > 3 ? '...' : ''}).
          </div>
          <button
            type="button"
            className="inv-btn inv-btn--outline-warning"
            onClick={() => setOnlyAlerts((prev) => !prev)}
          >
            {onlyAlerts ? 'Ver todos los insumos' : 'Filtrar críticos'}
          </button>
        </div>
      )}

      {feedback && (
        <div className={`inv-toast inv-toast--${feedback.type}`}>{feedback.text}</div>
      )}

      {/* Barra de Filtros */}
      <div className="inv-toolbar">
        <div className="inv-toolbar__search">
          <input
            type="text"
            placeholder="Buscar insumo por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inv-input"
          />
        </div>

        <div className="inv-toolbar__filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="inv-select"
            aria-label="Filtrar por categoría"
          >
            <option value="ALL">Todas las categorías</option>
            <option value="RAW_MATERIAL">Materia Prima</option>
            <option value="PACKAGING">Empaque y Servicio</option>
            <option value="RESALE">Producto Reventa</option>
          </select>

          <label className="inv-checkbox">
            <input
              type="checkbox"
              checked={onlyAlerts}
              onChange={(e) => setOnlyAlerts(e.target.checked)}
            />
            <span>Solo stock mínimo</span>
          </label>
        </div>
      </div>

      {/* Tabla de Existencias */}
      <div className="inv-table-wrapper">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Categoría</th>
              <th>Existencia Actual</th>
              <th>Stock Mínimo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="inv-table__empty">
                  No se encontraron insumos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const qty = Number(item.quantity);
                const min = Number(item.minimum_stock);
                const isOut = qty === 0;
                const isLow = qty > 0 && qty <= min;

                return (
                  <tr key={item.ingredient_id} className={isOut || isLow ? 'is-critical-row' : ''}>
                    <td className="inv-table__name">{item.name}</td>
                    <td>
                      <span className="inv-tag">
                        {TYPE_LABELS[item.ingredient_type] || item.ingredient_type}
                      </span>
                    </td>
                    <td className="inv-table__num">
                      <strong>{qty.toLocaleString('es-SV')}</strong> {item.unit}
                    </td>
                    <td className="inv-table__num">
                      {min.toLocaleString('es-SV')} {item.unit}
                    </td>
                    <td>
                      {isOut ? (
                        <span className="inv-status inv-status--danger">Agotado</span>
                      ) : isLow ? (
                        <span className="inv-status inv-status--warning">Stock Mínimo</span>
                      ) : (
                        <span className="inv-status inv-status--success">Óptimo</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="inv-btn inv-btn--sm"
                        onClick={() => handleOpenAdjustment(item)}
                      >
                        Ajustar stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Ajuste Manual */}
      {selectedItem && (
        <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
          <div className="inv-modal">
            <div className="inv-modal__header">
              <h3>Ajuste de Inventario: {selectedItem.name}</h3>
              <button
                type="button"
                className="inv-modal__close"
                onClick={handleCloseAdjustment}
                aria-label="Cerrar ventana"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="inv-form">
              <p className="inv-form__meta">
                Existencia actual:{' '}
                <strong>
                  {Number(selectedItem.quantity).toLocaleString('es-SV')} {selectedItem.unit}
                </strong>
              </p>

              <div className="inv-form__group">
                <label htmlFor="adj-type">Tipo de movimiento</label>
                <select
                  id="adj-type"
                  className="inv-select"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value)}
                >
                  <option value="ADJUSTMENT">Reducción por merma / vencimiento</option>
                  <option value="OUT">Salida manual operativa</option>
                  <option value="IN">Entrada por corrección de conteo</option>
                </select>
              </div>

              <div className="inv-form__group">
                <label htmlFor="adj-qty">Cantidad ({selectedItem.unit})</label>
                <input
                  id="adj-qty"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="inv-input"
                  placeholder="Ej. 250"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  required
                />
              </div>

              <div className="inv-form__group">
                <label htmlFor="adj-reason">Motivo o justificación</label>
                <input
                  id="adj-reason"
                  type="text"
                  className="inv-input"
                  placeholder="Ej. Ajuste por merma en cocina"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  required
                />
              </div>

              <div className="inv-modal__actions">
                <button
                  type="button"
                  className="inv-btn inv-btn--secondary"
                  onClick={handleCloseAdjustment}
                >
                  Cancelar
                </button>
                <button type="submit" className="inv-btn inv-btn--primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Confirmar ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default InventoryStock;