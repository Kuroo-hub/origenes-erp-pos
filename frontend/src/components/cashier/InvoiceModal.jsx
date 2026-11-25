import logoOrigenes from '../../public/origenes-logo.svg';
import { formatearMonedaCajero } from '../../utils/formatters.js';

const TIPOS_DOCUMENTO = {
  CREDIT_TAX: 'Comprobante de crédito fiscal',
  FINAL_CONSUMER: 'Factura de consumidor final',
};

const METODOS_PAGO = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  BITCOIN: 'Bitcoin',
  CHIVO: 'Chivo Wallet',
};

const ESTADOS = {
  PAID: 'Pagada',
  CANCELLED: 'Anulada',
  PENDING: 'Pendiente',
};

export default function InvoiceModal({ factura, onClose }) {
  if (!factura?.invoice) return null;

  const { invoice, details = [], payment } = factura;

  const tipoDocumento =
    TIPOS_DOCUMENTO[invoice.document_type] ??
    invoice.document_type ??
    'Comprobante fiscal';

  const prefijo = invoice.document_type === 'CREDIT_TAX' ? 'CCF' : 'FAC';
  const numeroFactura = `${prefijo}-${String(invoice.consecutive_number ?? '').padStart(6, '0')}`;

  const fecha = invoice.issue_date ? new Date(invoice.issue_date) : null;
  const fechaTexto =
    fecha && !Number.isNaN(fecha.getTime())
      ? fecha.toLocaleString('es-SV', { dateStyle: 'medium', timeStyle: 'short' })
      : '—';

  const estado = String(invoice.status ?? '').toUpperCase();
  const estadoTexto = ESTADOS[estado] ?? estado ?? 'Registrada';
  const estadoClase =
    estado === 'PAID' ? 'is-success' : estado === 'CANCELLED' ? 'is-danger' : 'is-warning';

  const metodoPago = payment?.payment_method ?? 'CASH';
  const metodoPagoTexto =
    METODOS_PAGO[metodoPago] ?? metodoPago.replaceAll('_', ' ');
  const referenciaPago = payment?.reference
    ? `${metodoPagoTexto} · ${payment.reference}`
    : metodoPagoTexto;

  return (
    <div
      className="invoice-backdrop"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onClose();
      }}
    >
      <article
        className="invoice-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-title"
      >
        <header className="invoice-sheet__header">
          <div className="invoice-sheet__brand">
            <span className="invoice-sheet__brand-mark">
              <img src={logoOrigenes} alt="Orígenes SV" />
            </span>
            <div>
              <strong>Orígenes SV</strong>
              <span>Comprobante fiscal electrónico</span>
            </div>
          </div>

          <div className="invoice-sheet__header-actions">
            <span className={`invoice-sheet__status ${estadoClase}`}>
              <i className="bi bi-check2-circle" aria-hidden="true" />
              {estadoTexto}
            </span>
            <button
              type="button"
              className="invoice-sheet__close"
              onClick={onClose}
              aria-label="Cerrar comprobante"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </header>

        <div className="invoice-sheet__body">
          <section className="invoice-sheet__hero">
            <div>
              <span className="invoice-sheet__eyebrow">{tipoDocumento}</span>
              <h2 id="invoice-title">{numeroFactura}</h2>
              <p className="invoice-sheet__control">{invoice.control_number}</p>
            </div>
            <div className="invoice-sheet__issued">
              <span>Fecha de emisión</span>
              <strong>{fechaTexto}</strong>
            </div>
          </section>

          <section className="invoice-sheet__info" aria-label="Datos de la venta">
            <div>
              <span>Sucursal</span>
              <strong>Sucursal #{invoice.branch_id}</strong>
            </div>
            <div>
              <span>Cliente</span>
              <strong>
                {invoice.customer_id
                  ? `Cliente #${invoice.customer_id}`
                  : 'Cliente presencial'}
              </strong>
            </div>
            <div>
              <span>Atendió</span>
              <strong>
                {invoice.employee_id
                  ? `Empleado #${invoice.employee_id}`
                  : 'No registrado'}
              </strong>
            </div>
            <div>
              <span>Método de pago</span>
              <strong>{referenciaPago}</strong>
            </div>
          </section>

          {invoice.is_delivery && (
            <section className="invoice-sheet__delivery" aria-label="Datos de entrega">
              <div className="invoice-sheet__section-title">
                <h3>
                  <i className="bi bi-truck" aria-hidden="true" />
                  Entrega a domicilio
                </h3>
                <span>{invoice.delivery_status ?? 'PENDIENTE'}</span>
              </div>
              <div className="invoice-sheet__delivery-grid">
                <div>
                  <span>Dirección</span>
                  <strong>{invoice.delivery_address ?? '—'}</strong>
                </div>
                <div>
                  <span>Teléfono</span>
                  <strong>{invoice.delivery_phone ?? '—'}</strong>
                </div>
              </div>
            </section>
          )}

          <section className="invoice-sheet__section">
            <div className="invoice-sheet__section-title">
              <h3>Detalle de productos</h3>
              <span>{details.length} ítem(s)</span>
            </div>

            <div className="invoice-sheet__table-wrapper">
              <table className="invoice-sheet__table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>P. unitario</th>
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
            </div>
          </section>

          <section className="invoice-sheet__bottom">
            <div className="invoice-sheet__codes">
              <div>
                <span>Código de generación</span>
                <strong>{invoice.generation_code ?? '—'}</strong>
              </div>
              <div>
                <span>Sello de recepción</span>
                <strong>{invoice.reception_stamp ?? '—'}</strong>
              </div>
            </div>

            <div className="invoice-sheet__totals">
              <div>
                <span>Subtotal</span>
                <strong>{formatearMonedaCajero(Number(invoice.subtotal))}</strong>
              </div>
              <div>
                <span>IVA</span>
                <strong>{formatearMonedaCajero(Number(invoice.vat))}</strong>
              </div>
              <div className="invoice-sheet__total">
                <span>Total</span>
                <strong>{formatearMonedaCajero(Number(invoice.total))}</strong>
              </div>
            </div>
          </section>
        </div>

        <footer className="invoice-sheet__footer">
          <span>Comprobante generado por Orígenes ERP/POS</span>
          <button type="button" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </article>
    </div>
  );
}
