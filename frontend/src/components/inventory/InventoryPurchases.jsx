import React, { useEffect, useState } from 'react';
import {
  createSupplierPurchase,
  getSuppliers,
  registerSupplierPayment,
} from '../../services/inventoryApi';

const STATUS_LABELS = {
  PAID: 'Pagada',
  PENDING: 'Pendiente',
  PARTIAL: 'Abono Parcial',
  CANCELLED: 'Anulada',
};

const getIngredientName = (item) =>
  item?.name ?? item?.ingredient_name ?? item?.nombre ?? 'Insumo';

const InventoryPurchases = ({
  branchId,
  inventory = [],
  purchases = [],
  setPurchases,
  setInventory,
  onRefresh,
}) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [supplierError, setSupplierError] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ ingredient_id: '', quantity: '', unit_cost: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let activo = true;

    getSuppliers()
      .then((respuesta) => {
        if (!activo) return;

        const filas = Array.isArray(respuesta) ? respuesta : respuesta?.data ?? [];
        setSuppliers(filas);
        setSupplierId((actual) => {
          const existe = filas.some(
            (proveedor) =>
              Number(proveedor.supplierId ?? proveedor.supplier_id) === Number(actual)
          );
          return existe ? actual : String(filas[0]?.supplierId ?? filas[0]?.supplier_id ?? '');
        });
        setSupplierError('');
      })
      .catch((caughtError) => {
        if (activo) {
          setSupplierError(caughtError?.message ?? 'No se pudieron cargar los proveedores.');
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // Estado para registrar abono a factura pendiente
  const [payingPurchase, setPayingPurchase] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER');
  const [paymentRef, setPaymentRef] = useState('');

  // Cálculos dinámicos de la factura (Subtotal + 13% IVA = Total)
  const subtotal = items.reduce((acc, row) => {
    const qty = Number(row.quantity) || 0;
    const cost = Number(row.unit_cost) || 0;
    return acc + qty * cost;
  }, 0);

  const vat = Number((subtotal * 0.13).toFixed(2));
  const total = Number((subtotal + vat).toFixed(2));

  const handleAddRow = () => {
    setItems((prev) => [...prev, { ingredient_id: '', quantity: '', unit_cost: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
    );
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    setFeedback(null);

    const validDetails = items
      .filter((row) => row.ingredient_id && Number(row.quantity) > 0 && Number(row.unit_cost) >= 0)
      .map((row) => {
        const qty = Number(row.quantity);
        const cost = Number(row.unit_cost);
        const ing = inventory.find(
          (i) => Number(i.ingredient_id) === Number(row.ingredient_id)
        );
        return {
          ingredient_id: Number(row.ingredient_id),
          ingredient_name: getIngredientName(ing),
          quantity: qty,
          unit_cost: cost,
          subtotal: Number((qty * cost).toFixed(2)),
        };
      });

    if (!supplierId) {
      setFeedback({ type: 'error', text: 'Selecciona un proveedor válido.' });
      return;
    }

    if (!invoiceNumber.trim()) {
      setFeedback({ type: 'error', text: 'Ingresa el número de factura del proveedor.' });
      return;
    }

    if (validDetails.length === 0) {
      setFeedback({
        type: 'error',
        text: 'Agrega al menos un insumo con cantidad y costo unitario válidos.',
      });
      return;
    }

    setSubmitting(true);

    const payload = {
      supplier_id: Number(supplierId),
      branch_id: branchId,
      invoice_number: invoiceNumber.trim(),
      subtotal: Number(subtotal.toFixed(2)),
      vat,
      total,
      status: paymentStatus,
      due_date: dueDate || null,
      details: validDetails,
    };

    try {
      await createSupplierPurchase(payload);
      await onRefresh();
      setShowNewForm(false);
      setInvoiceNumber('');
      setDueDate('');
      setItems([{ ingredient_id: '', quantity: '', unit_cost: '' }]);
    } catch (error) {
      setFeedback({ type: 'error', text: error?.message ?? 'No se pudo registrar la compra.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenPayModal = (purchase) => {
    setPayingPurchase(purchase);
    setPaymentAmount(String(purchase.outstanding_amount || purchase.total));
    setPaymentMethod('TRANSFER');
    setPaymentRef('');
  };

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    const pending = Number(payingPurchase.outstanding_amount ?? payingPurchase.total);

    if (!amount || amount <= 0 || amount > pending) {
      setFeedback({
        type: 'error',
        text: `El abono debe ser mayor a $0.00 y no exceder el saldo pendiente ($${pending.toFixed(2)}).`,
      });
      return;
    }

    setSubmitting(true);
    try {
      await registerSupplierPayment(payingPurchase.payable_id, {
        amount,
        payment_method: paymentMethod,
        reference: paymentRef.trim() || null,
      });
      await onRefresh();
      setFeedback({ type: 'success', text: 'Abono registrado exitosamente.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error?.message ?? 'No se pudo registrar el abono.' });
    } finally {
      setSubmitting(false);
      setPayingPurchase(null);
    }
  };

  const totalPendingDebt = purchases.reduce(
    (acc, p) => acc + Number(p.status !== 'PAID' ? p.outstanding_amount ?? p.total : 0),
    0
  );

  return (
    <section className="inv-section">
      <div className="inv-purchases-header">
        <div className="inv-debt-summary">
          <span className="inv-debt-summary__label">Cuentas por pagar vigentes (Sucursal):</span>
          <strong className="inv-debt-summary__amount">${totalPendingDebt.toFixed(2)} USD</strong>
        </div>

        <button
          type="button"
          className="inv-btn inv-btn--primary"
          onClick={() => setShowNewForm((prev) => !prev)}
        >
          {showNewForm ? 'Cerrar formulario' : 'Registrar factura de compra'}
        </button>
      </div>

      {feedback && (
        <div className={`inv-toast inv-toast--${feedback.type}`}>{feedback.text}</div>
      )}

      {supplierError && (
        <div className="inv-toast inv-toast--error">{supplierError}</div>
      )}

      {/* Formulario de Nueva Compra a Proveedor */}
      {showNewForm && (
        <form onSubmit={handleCreatePurchase} className="inv-card inv-purchase-form">
          <h3 className="inv-card__title">Nueva Factura de Abastecimiento</h3>

          <div className="inv-form-grid">
            <div className="inv-form__group">
              <label htmlFor="pur-supplier">Proveedor</label>
              <select
                id="pur-supplier"
                className="inv-select"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                {suppliers.length === 0 && (
                  <option value="">No hay proveedores disponibles</option>
                )}

                {suppliers.map((proveedor) => {
                  const id = proveedor.supplierId ?? proveedor.supplier_id;
                  return (
                    <option key={id} value={id}>
                      {proveedor.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="inv-form__group">
              <label htmlFor="pur-invoice">Número de Factura</label>
              <input
                id="pur-invoice"
                type="text"
                className="inv-input"
                placeholder="Ej. FAC-004"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            <div className="inv-form__group">
              <label htmlFor="pur-status">Condición de pago</label>
              <select
                id="pur-status"
                className="inv-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="PENDING">Crédito (Cuenta por pagar)</option>
                <option value="PAID">Contado (Pagada)</option>
              </select>
            </div>

            {paymentStatus === 'PENDING' && (
              <div className="inv-form__group">
                <label htmlFor="pur-due">Fecha de vencimiento</label>
                <input
                  id="pur-due"
                  type="date"
                  className="inv-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="inv-purchase-lines">
            <div className="inv-purchase-lines__header">
              <h4>Detalle de insumos adquiridos</h4>
              <button type="button" className="inv-btn inv-btn--sm" onClick={handleAddRow}>
                Agregar línea
              </button>
            </div>

            {items.map((row, idx) => (
              <div key={idx} className="inv-line-row">
                <select
                  className="inv-select"
                  value={row.ingredient_id}
                  onChange={(e) => handleItemChange(idx, 'ingredient_id', e.target.value)}
                  required
                >
                  <option value="">Seleccionar insumo...</option>
                  {inventory.map((ing) => (
                    <option key={ing.ingredient_id} value={ing.ingredient_id}>
                      {getIngredientName(ing)} ({ing.unit ?? ''})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="inv-input"
                  placeholder="Cantidad"
                  value={row.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                  required
                />

                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  className="inv-input"
                  placeholder="Costo unitario ($)"
                  value={row.unit_cost}
                  onChange={(e) => handleItemChange(idx, 'unit_cost', e.target.value)}
                  required
                />

                <span className="inv-line-row__subtotal">
                  ${((Number(row.quantity) || 0) * (Number(row.unit_cost) || 0)).toFixed(2)}
                </span>

                <button
                  type="button"
                  className="inv-btn inv-btn--danger-ghost"
                  onClick={() => handleRemoveRow(idx)}
                  disabled={items.length === 1}
                  title="Eliminar línea"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="inv-purchase-totals">
            <div>
              <span>Subtotal:</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span>IVA (13%):</span>
              <strong>${vat.toFixed(2)}</strong>
            </div>
            <div className="inv-purchase-totals__grand">
              <span>Total Factura:</span>
              <strong>${total.toFixed(2)} USD</strong>
            </div>
          </div>

          <div className="inv-modal__actions">
            <button
              type="button"
              className="inv-btn inv-btn--secondary"
              onClick={() => setShowNewForm(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="inv-btn inv-btn--primary" disabled={submitting}>
              {submitting ? 'Procesando...' : 'Guardar factura y sumar stock'}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Facturas y Cuentas por Pagar */}
      <div className="inv-table-wrapper">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Factura</th>
              <th>Proveedor</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Saldo Pendiente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="7" className="inv-table__empty">
                  No hay compras registradas en esta sucursal.
                </td>
              </tr>
            ) : (
              purchases.map((pur) => {
                const pending = Number(pur.outstanding_amount ?? 0);
                const isPaid = pur.status === 'PAID' || pending === 0;

                return (
                  <tr key={pur.purchase_id}>
                    <td className="inv-table__name">{pur.invoice_number}</td>
                    <td>{pur.supplier_name}</td>
                    <td>{pur.purchase_date}</td>
                    <td className="inv-table__num">${Number(pur.total).toFixed(2)}</td>
                    <td className="inv-table__num">
                      <strong>${pending.toFixed(2)}</strong>
                    </td>
                    <td>
                      <span
                        className={`inv-status inv-status--${
                          isPaid ? 'success' : pur.status === 'PARTIAL' ? 'warning' : 'danger'
                        }`}
                      >
                        {STATUS_LABELS[pur.status] || pur.status}
                      </span>
                    </td>
                    <td>
                      {!isPaid ? (
                        <button
                          type="button"
                          className="inv-btn inv-btn--sm inv-btn--primary"
                          onClick={() => handleOpenPayModal(pur)}
                        >
                          Registrar abono
                        </button>
                      ) : (
                        <span className="inv-muted">Liquidada</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Abono a Proveedor */}
      {payingPurchase && (
        <div className="inv-modal-backdrop" role="dialog" aria-modal="true">
          <div className="inv-modal">
            <div className="inv-modal__header">
              <h3>Abono a Factura {payingPurchase.invoice_number}</h3>
              <button
                type="button"
                className="inv-modal__close"
                onClick={() => setPayingPurchase(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="inv-form">
              <p className="inv-form__meta">
                Proveedor: <strong>{payingPurchase.supplier_name}</strong> — Saldo pendiente:{' '}
                <strong>
                  ${Number(payingPurchase.outstanding_amount ?? payingPurchase.total).toFixed(2)}
                </strong>
              </p>

              <div className="inv-form__group">
                <label htmlFor="pay-amount">Monto a abonar (USD)</label>
                <input
                  id="pay-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="inv-input"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              <div className="inv-form__group">
                <label htmlFor="pay-method">Método de pago</label>
                <select
                  id="pay-method"
                  className="inv-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="TRANSFER">Transferencia Bancaria</option>
                  <option value="CASH">Efectivo</option>
                  <option value="CHECK">Cheque</option>
                </select>
              </div>

              <div className="inv-form__group">
                <label htmlFor="pay-ref">Referencia o comprobante</label>
                <input
                  id="pay-ref"
                  type="text"
                  className="inv-input"
                  placeholder="Ej. TRX-1005"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>

              <div className="inv-modal__actions">
                <button
                  type="button"
                  className="inv-btn inv-btn--secondary"
                  onClick={() => setPayingPurchase(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="inv-btn inv-btn--primary" disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Aplicar pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default InventoryPurchases;