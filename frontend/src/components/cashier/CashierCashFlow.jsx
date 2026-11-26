import { useCallback, useEffect, useState } from 'react';
import { useOrders } from '../../context/OrderContext.jsx';
import { addCashMovement, getCashSessionSummary } from '../../services/cashFlowApi.js';
import { formatearMonedaCajero } from '../../utils/formatters.js';

const METODOS_PAGO = {
  CASH: {
    titulo: 'Ingresos en efectivo',
    icono: 'bi-cash-coin',
    etiqueta: 'Efectivo',
  },
  CARD: {
    titulo: 'Ingresos con tarjeta',
    icono: 'bi-credit-card',
    etiqueta: 'Tarjeta',
  },
  BITCOIN: {
    titulo: 'Ingresos con Bitcoin',
    icono: 'bi-currency-bitcoin',
    etiqueta: 'Bitcoin',
  },
  CHIVO: {
    titulo: 'Ingresos con Chivo Wallet',
    icono: 'bi-wallet2',
    etiqueta: 'Chivo Wallet',
  },
};

const METODOS = Object.keys(METODOS_PAGO);

export default function CashierCashFlow({ sucursal }) {
  const { caja } = useOrders();
  const sessionId = caja?.sessionId;

  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(Boolean(sessionId));
  const [error, setError] = useState('');
  const [tipo, setTipo] = useState('INGRESO');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const cargarResumen = useCallback(async () => {
    if (!sessionId) {
      setResumen(null);
      setError('');
      setCargando(false);
      return;
    }

    setCargando(true);
    setError('');

    try {
      const respuesta = await getCashSessionSummary(sessionId);
      setResumen(respuesta?.data ?? respuesta ?? null);
    } catch (caughtError) {
      setResumen(null);
      setError(caughtError?.message ?? 'No se pudo cargar el resumen de la caja.');
    } finally {
      setCargando(false);
    }
  }, [sessionId]);

  useEffect(() => {
    cargarResumen();
  }, [cargarResumen]);

  useEffect(() => {
    setMonto('');
    setConcepto('');
    setFeedback(null);
  }, [sessionId]);

  const handleRegistrar = async (evento) => {
    evento.preventDefault();

    if (!sessionId) return;

    const montoNormalizado = monto.trim();

    if (!/^\d+(\.\d{1,2})?$/.test(montoNormalizado)) {
      setFeedback({
        type: 'error',
        text: 'Ingresa un monto válido con hasta dos decimales.',
      });
      return;
    }

    const montoNumerico = Number(montoNormalizado);

    if (!Number.isFinite(montoNumerico) || montoNumerico <= 0) {
      setFeedback({
        type: 'error',
        text: 'El monto del movimiento debe ser mayor a cero.',
      });
      return;
    }

    const conceptoNormalizado = concepto.trim();

    if (!conceptoNormalizado || conceptoNormalizado.length > 150) {
      setFeedback({
        type: 'error',
        text: 'El concepto es obligatorio y no puede superar 150 caracteres.',
      });
      return;
    }

    setGuardando(true);
    setFeedback(null);

    try {
      await addCashMovement(sessionId, {
        type: tipo,
        amount: montoNumerico.toFixed(2),
        concept: conceptoNormalizado,
      });
      setMonto('');
      setConcepto('');
      await cargarResumen();
      setFeedback({
        type: 'success',
        text: 'Movimiento registrado correctamente.',
      });
    } catch (caughtError) {
      setFeedback({
        type: 'error',
        text: caughtError?.message ?? 'No se pudo registrar el movimiento.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const pagos = Array.isArray(resumen?.payments) ? resumen.payments : [];
  const totalVentas = pagos.reduce(
    (total, pago) => total + Number(pago.total ?? 0),
    0
  );
  const pagosPorMetodo = Object.fromEntries(
    pagos.map((pago) => [pago.metodo, Number(pago.total ?? 0)])
  );
  const ingresosManuales = Number(resumen?.movements?.total_ingresos ?? 0);
  const egresosManuales = Number(resumen?.movements?.total_egresos ?? 0);
  const efectivoEsperado = Number(resumen?.montoEfectivoEsperado ?? 0);
  const montoInicial = Number(resumen?.session?.monto_inicial ?? 0);

  return (
    <section className="cashier-cashflow">
      <header className="cashier-section-header">
        <div>
          <h1>Flujo de caja</h1>
          <p>
            Consulta el resumen real de la sesión activa en {sucursal}.
          </p>
        </div>
      </header>

      {!sessionId ? (
        <div className="cashier-pos__empty">
          <i className="bi bi-cash-stack" aria-hidden="true" />
          <strong>Sin sesión de caja abierta</strong>
          <span>
            No hay datos de caja para mostrar hasta que se abra una sesión.
          </span>
        </div>
      ) : cargando ? (
        <div className="cashier-pos__empty">
          <strong>Cargando resumen de la caja...</strong>
        </div>
      ) : error ? (
        <div className="cashier-caja-banner" role="alert">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
          <div>
            <strong>Error al consultar la caja</strong>
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <>
          <div className="cashier-cashflow__summary">
            <article className="cashier-cashflow__card">
              <span>Total de ventas</span>
              <strong>{formatearMonedaCajero(totalVentas)}</strong>
              <small>Pagos registrados en la sesión</small>
            </article>

            {METODOS.map((metodo) => (
              <article
                className="cashier-cashflow__card"
                key={metodo}
              >
                <span>{METODOS_PAGO[metodo].titulo}</span>
                <strong>
                  {formatearMonedaCajero(pagosPorMetodo[metodo] ?? 0)}
                </strong>
                <small>
                  <i
                    className={`bi ${METODOS_PAGO[metodo].icono}`}
                    aria-hidden="true"
                  />{' '}
                  {METODOS_PAGO[metodo].etiqueta}
                </small>
              </article>
            ))}
          </div>

          {feedback && (
            <div className="cashier-caja-banner" role="alert">
              <i
                className={`bi ${
                  feedback.type === 'success'
                    ? 'bi-check-circle-fill'
                    : 'bi-exclamation-triangle-fill'
                }`}
                aria-hidden="true"
              />
              <div>
                <strong>{feedback.text}</strong>
              </div>
            </div>
          )}

          <section className="cashier-cashflow__movements">
            <div className="cashier-cashflow__heading">
              <div>
                <h2>Detalle de la sesión</h2>
                <p>
                  Montos reales reportados por el backend para esta caja.
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>Caja</td>
                    <td className="text-end">
                      <strong>{resumen?.session?.nombreCaja ?? '—'}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Monto inicial</td>
                    <td className="text-end">
                      <strong>{formatearMonedaCajero(montoInicial)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Efectivo esperado</td>
                    <td className="text-end">
                      <strong>{formatearMonedaCajero(efectivoEsperado)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Ingresos manuales</td>
                    <td className="text-end">
                      <strong>{formatearMonedaCajero(ingresosManuales)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Egresos manuales</td>
                    <td className="text-end">
                      <strong>{formatearMonedaCajero(egresosManuales)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="cashier-cashflow__movements">
            <div className="cashier-cashflow__heading">
              <div>
                <h2>Registrar movimiento</h2>
                <p>
                  El movimiento se asocia a la sesión abierta de la caja.
                </p>
              </div>
            </div>

            <form
              className="manager-caja-amounts cashier-cart__customer"
              onSubmit={handleRegistrar}
            >
              <label>
                <span>Tipo</span>
                <select
                  value={tipo}
                  onChange={(evento) => setTipo(evento.target.value)}
                  aria-label="Tipo de movimiento"
                >
                  <option value="INGRESO">Ingreso</option>
                  <option value="EGRESO">Egreso</option>
                </select>
              </label>

              <label>
                <span>Monto</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={monto}
                  onChange={(evento) => setMonto(evento.target.value)}
                  placeholder="0.00"
                  maxLength={12}
                  aria-label="Monto del movimiento"
                />
              </label>

              <label>
                <span>Concepto</span>
                <input
                  type="text"
                  value={concepto}
                  onChange={(evento) => setConcepto(evento.target.value)}
                  placeholder="Concepto del movimiento"
                  maxLength={150}
                  aria-label="Concepto del movimiento"
                />
              </label>

              <button
                type="submit"
                className="manager-caja-button is-open"
                disabled={guardando}
              >
                <i className="bi bi-plus-circle" aria-hidden="true" />
                {guardando ? 'Registrando...' : 'Registrar movimiento'}
              </button>
            </form>
          </section>
        </>
      )}
    </section>
  );
}
