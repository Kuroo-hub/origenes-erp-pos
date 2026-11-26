import React, { useState } from 'react';
import { createInventoryAdjustment } from '../../services/inventoryApi';
import { IconBox, IconCheckCircle, IconAlertTriangle, IconClockAlert } from './InventoryIcons';

const TYPE_LABELS = {
  RAW_MATERIAL: 'Materia Prima',
  PACKAGING: 'Empaque y Servicio',
  RESALE: 'Producto Reventa',
};

const getItemName = (item) =>
  item?.name ?? item?.ingredient_name ?? item?.nombre ?? 'Insumo';

const InventoryStock = ({ branchId, inventory = [], setInventory, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentType, setAdjustmentType] = useState('ADJUSTMENT');
  const [adjustmentQty, setAdjustmentQty] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const totalItems = inventory.length;
  const criticalItems = inventory.filter(
    (item) => Number(item.quantity) <= Number(item.minimum_stock)
  );
  const outOfStockItems = criticalItems.filter(
    (item) => Number(item.quantity) === 0
  );
  const lowStockItems = criticalItems.filter(
    (item) => Number(item.quantity) > 0
  );
  const outOfStockCount = outOfStockItems.length;
  const healthyCount = totalItems - criticalItems.length;

  const detalleAlertas = criticalItems
    .slice(0, 4)
    .map(
      (item) =>
        `${getItemName(item)} (${item.quantity}${item.unit ? ` ${item.unit}` : ''})`
    )
    .join(', ');

  const alertasExtras =
    criticalItems.length > 4 ? ` y ${criticalItems.length - 4} más` : '';

  const filteredInventory = inventory.filter((item) => {
    const itemName = String(getItemName(item)).toLowerCase();
    const matchesSearch = itemName.includes(String(searchTerm ?? '').toLowerCase());
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

    const currentStock = Number(selectedItem.quantity ?? 0);
    if (adjustmentType !== 'IN' && numericQty > currentStock) {
      setFeedback({
        type: 'error',
        text: `No puedes descontar ${numericQty} ${selectedItem.unit ?? ''} porque la existencia actual es ${currentStock}.`,
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    const payload = {
      branch_id: Number(branchId),
      ingredient_id: Number(selectedItem.ingredient_id),
      movement_type: adjustmentType === 'IN' ? 'IN' : 'OUT',
      quantity: numericQty,
      reason:
        adjustmentType === 'ADJUSTMENT'
          ? `Merma / vencimiento: ${adjustmentReason.trim()}`
          : adjustmentReason.trim(),
    };

    try {
      await createInventoryAdjustment(payload);
      await onRefresh();
      setFeedback({
        type: 'success',
        text: 'Ajuste registrado correctamente en el servidor y en la bitácora.',
      });
      handleCloseAdjustment();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message ?? 'Error al registrar el ajuste en el servidor.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="inv-section">
      {/* Tarjetas KPI */}
      <div className="inv-kpi-grid">
        <article className="inv-kpi-card">
          <div className="inv-kpi-card__icon inv-kpi-card__icon--blue">
            <IconBox />
          </div>
          <div className="inv-kpi-card__body">
            <span className="inv-kpi-card__label">Total de insumos</span>
            <strong className="inv-kpi-card__value">{totalItems}</strong>
            <span className="inv-kpi-card__hint">Insumos registrados</span>
          </div>
        </article>

        <article className="inv-kpi-card">
          <div className="inv-kpi-card__icon inv-kpi-card__icon--green">
            <IconCheckCircle />
          </div>
          <div className="inv-kpi-card__body">
            <span className="inv-kpi-card__label">Stock óptimo</span>
            <strong className="inv-kpi-card__value">{healthyCount}</strong>
            <span className="inv-kpi-card__hint">Nivel de existencia normal</span>
          </div>
        </article>

        <article className="inv-kpi-card">
          <div className="inv-kpi-card__icon inv-kpi-card__icon--gold">
            <IconAlertTriangle />
          </div>
          <div className="inv-kpi-card__body">
            <span className="inv-kpi-card__label">Stock mínimo</span>
            <strong className="inv-kpi-card__value">{criticalItems.length}</strong>
            <span className="inv-kpi-card__hint">Requieren reabastecimiento</span>
          </div>
        </article>

        <article className="inv-kpi-card">
          <div className="inv-kpi-card__icon inv-kpi-card__icon--red">
            <IconClockAlert />
          </div>
          <div className="inv-kpi-card__body">
            <span className="inv-kpi-card__label">Agotados</span>
            <strong className="inv-kpi-card__value">{outOfStockCount}</strong>
            <span className="inv-kpi-card__hint">Existencia en cero</span>
          </div>
        </article>
      </div>

      {criticalItems.length > 0 && (
        <div
          className={`inv-stock-alert ${outOfStockCount > 0 ? 'inv-stock-alert--critical' : ''}`}
          role="alert"
        >
          <IconAlertTriangle />
          <div>
            <strong>
              {outOfStockCount > 0
                ? `${outOfStockCount} insumo(s) agotado(s)`
                : `${lowStockItems.length} insumo(s) en stock mínimo`}
              {outOfStockCount > 0 && lowStockItems.length > 0
                ? ` y ${lowStockItems.length} en stock mínimo`
                : ''}
            </strong>
            <span>
              Reabastece: {detalleAlertas}{alertasExtras}.
            </span>
          </div>
        </div>
      )}

      {feedback && (
        <div className={`inv-toast inv-toast--${feedback.type}`}>{feedback.text}</div>
      )}

      {/* Tarjeta principal contenedora de tabla */}
      <div className="inv-panel-card">
        <div className="inv-panel-card__header">
          <div>
            <h2 className="inv-panel-card__title">Existencias de la sucursal</h2>
            <p className="inv-panel-card__subtitle">
              Inventario detallado de materias primas, empaques y reventa.
            </p>
          </div>

          <div className="inv-panel-card__actions">
            <input
              type="text"
              placeholder="Buscar insumo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inv-input inv-input--sm"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="inv-select inv-select--sm"
              aria-label="Filtrar por categoría"
            >
              <option value="ALL">Todas las categorías</option>
              <option value="RAW_MATERIAL">Materia Prima</option>
              <option value="PACKAGING">Empaque y Servicio</option>
              <option value="RESALE">Producto Reventa</option>
            </select>

            <button
              type="button"
              className={`inv-pill-filter ${onlyAlerts ? 'is-active' : ''}`}
              onClick={() => setOnlyAlerts((prev) => !prev)}
            >
              {onlyAlerts ? `Críticos (${criticalItems.length})` : `${filteredInventory.length} registros`}
            </button>
          </div>
        </div>

        <div className="inv-table-scroll">
          <table className="inv-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Existencia actual</th>
                <th>Stock mínimo</th>
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
                    <tr key={item.ingredient_id}>
                      <td>
                        <div className="inv-table__name">{getItemName(item)}</div>
                        <div className="inv-table__sub">Unidad: {item.unit}</div>
                      </td>
                      <td>{TYPE_LABELS[item.ingredient_type] || item.ingredient_type}</td>
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
                          <span className="inv-status inv-status--warning">Stock mínimo</span>
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
                          Ajustar
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Ajuste Manual */}
      {selectedItem && (
        <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
          <div className="inv-modal">
            <div className="inv-modal__header">
              <h3>Ajuste de Inventario: {getItemName(selectedItem)}</h3>
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