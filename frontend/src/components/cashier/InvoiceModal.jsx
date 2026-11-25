import { formatearMonedaCajero } from '../../utils/formatters.js';

export default function InvoiceModal({ factura, onClose }) {
  if (!factura?.invoice) return null;

  const { invoice, details = [], payment } = factura;

  return (
    <div className="cashier-orders__modal-backdrop" onMouseDown={(evento) => {
      if (evento.target === evento.currentTarget) onClose();
    }}>
      <section className="cashier-orders__modal" role="dialog" aria-modal="true" aria-labelledby="invoice-title">
        <header className="cashier-orders__modal-header">
          <div>
            <h2 id="invoice-title">Comprobante fiscal</h2>
            <p>{invoice.control_number}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar comprobante">
            <i className="bi bi-x-lg" />
          </button>
        </header>

        <div className="cashier-orders__modal-body">
          <div className="cashier-orders__detail-grid">
            <div>
              <span>Comprobante</span>
              <strong>{invoice.control_number}</strong>
            </div>
            <div>
              <span>Consecutivo</span>
              <strong>{invoice.consecutive_number}</strong>
            </div>
            <div>
              <span>Fecha</span>
              <strong>{new Date(invoice.issue_date).toLocaleString('es-SV')}</strong>
            </div>
            <div>
              <span>Sucursal</span>
              <strong>{invoice.branch_id}</strong>
            </div>
            <div>
              <span>Cliente</span>
              <strong>{invoice.customer_id ? `Cliente #${invoice.customer_id}` : 'Cliente presencial'}</strong>
            </div>
            <div>
              <span>Estado</span>
              <strong>{invoice.status}</strong>
            </div>
          </div>

          {invoice.is_delivery && (
            <div className="cashier-orders__detail-grid">
              <div>
                <span>Entrega</span>
                <strong>{invoice.delivery_status}</strong>
              </div>
              <div>
                <span>Dirección</span>
                <strong>{invoice.delivery_address}</strong>
              </div>
              <div>
                <span>Teléfono</span>
                <strong>{invoice.delivery_phone}</strong>
              </div>
            </div>
          )}

          <table className="cashier-orders__table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail) => (
                <tr key={detail.invoice_detail_id}>
                  <td>{detail.productName ?? detail.product_id}</td>
                  <td>{detail.quantity}</td>
                  <td>{formatearMonedaCajero(Number(detail.unit_price))}</td>
                  <td>{formatearMonedaCajero(Number(detail.subtotal))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cashier-orders__detail-grid">
            <div>
              <span>Subtotal</span>
              <strong>{formatearMonedaCajero(Number(invoice.subtotal))}</strong>
            </div>
            <div>
              <span>IVA</span>
              <strong>{formatearMonedaCajero(Number(invoice.vat))}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>{formatearMonedaCajero(Number(invoice.total))}</strong>
            </div>
            <div>
              <span>Pago</span>
              <strong>{payment?.payment_method ?? 'CASH'}</strong>
            </div>
          </div>
        </div>

        <footer className="cashier-orders__modal-footer">
          <button type="button" className="cashier-orders__secondary-button" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </section>
    </div>
  );
}