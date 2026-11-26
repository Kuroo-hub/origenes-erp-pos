import { useEffect, useMemo, useState } from 'react';
import CashMovementTable from '../shared/CashMovementTable.jsx';
import { getCashSessionSummary } from '../../services/cashFlowApi.js';
import { formatearMonedaCajero } from '../../utils/formatters.js';

const formatearHora = (timestamp) =>
  timestamp
    ? new Date(timestamp).toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '—';

const parseMonto = (value) => {
  const text = String(value ?? '').trim().replace(',', '.');

  if (!/^\d{1,10}(\.\d{1,2})?$/.test(text)) return null;

  const amount = Number(text);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

export default function ManagerCashRegister({
  sucursal,
  caja,
  onAbrir,
  onCerrar,
}) {
  const abierta = caja?.abierta ?? false;
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinal, setMontoFinal] = useState('');
  const [error, setError] = useState('');
  const [resumen, setResumen] = useState(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    setMontoInicial(
      caja?.montoInicial != null ? String(caja.montoInicial) : ''
    );
    setMontoFinal(
      caja?.montoFinal != null ? String(caja.montoFinal) : ''
    );
    setError('');
  }, [
    sucursal,
    abierta,
    caja?.abiertaDesde,
    caja?.montoInicial,
    caja?.montoFinal,
  ]);

  useEffect(() => {
    let activo = true;
    setResumen(null);

    if (abierta && caja?.sessionId) {
      getCashSessionSummary(caja.sessionId)
        .then((respuesta) => {
          if (activo) setResumen(respuesta?.data ?? null);
        })
        .catch((caughtError) => {
          if (activo) setError(caughtError?.message ?? 'No se pudo consultar la caja.');
        });
    }

    return () => {
      activo = false;
    };
  }, [abierta, caja?.sessionId, revision]);

  const esperado = resumen ? Number(resumen.montoEfectivoEsperado) : null;
  const contado = parseMonto(montoFinal);
  const diferencia = esperado !== null && contado !== null
    ? Math.round((contado - esperado) * 100) / 100
    : null;

  const handleAbrir = () => {
    const monto = parseMonto(montoInicial);

    if (monto === null) {
      setError('Ingresa un monto inicial válido para abrir la caja.');
      return;
    }

    setError('');
    onAbrir(monto);
  };

  const handleCerrar = () => {
    if (contado === null) {
      setError('Ingresa un monto final válido para cerrar la caja.');
      return;
    }

    if (esperado === null) {
      setError('No se pudo consultar el efectivo esperado.');
      return;
    }

    setError('');
    onCerrar(contado);
  };

  return (
    <section className="cashier-summary">
      <header className="cashier-section-header">
        <div>
          <h1>Apertura y cierre de caja</h1>
          <p>
            Controla la caja de {sucursal}. La venta permanece bloqueada
            mientras esté cerrada.
          </p>
        </div>
      </header>

      <div className="manager-caja-grid">
        <article className="cashier-activity">
          <div className="cashier-activity__header">
            <div>
              <h2>Estado de la caja</h2>
              <p>
                {abierta
                  ? 'El cajero puede registrar ventas.'
                  : 'El cajero no puede registrar ventas.'}
              </p>
            </div>

            <span
              className={`manager-caja-status ${
                abierta ? 'is-open' : 'is-closed'
              }`}
            >
              <i
                className={`bi ${abierta ? 'bi-unlock-fill' : 'bi-lock-fill'}`}
                aria-hidden="true"
              />
              {abierta ? 'Abierta' : 'Cerrada'}
            </span>
          </div>

          <div className="manager-caja-details">
            <div>
              <span>Sucursal</span>
              <strong>{sucursal}</strong>
            </div>

            <div>
              <span>Dinero inicial del día</span>
              <strong>
                {caja?.montoInicial != null
                  ? formatearMonedaCajero(caja.montoInicial)
                  : '—'}
              </strong>
            </div>

            <div>
              <span>Dinero final del día</span>
              <strong>
                {caja?.montoFinal != null
                  ? formatearMonedaCajero(caja.montoFinal)
                  : '—'}
              </strong>
            </div>

            <div>
              <span>Abierta desde</span>
              <strong>{formatearHora(caja?.abiertaDesde)}</strong>
            </div>

            <div>
              <span>Cerrada a las</span>
              <strong>{formatearHora(caja?.cerradaDesde)}</strong>
            </div>

          </div>

          <div className="manager-caja-amounts">
            <label>
              <span>Monto inicial</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={montoInicial}
                disabled={abierta}
                placeholder="0.00"
                onChange={(evento) => { setMontoInicial(evento.target.value); setError(''); }}
                aria-label="Monto inicial de la caja"
              />
            </label>

            <label>
              <span>Monto final</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={montoFinal}
                disabled={!abierta}
                placeholder="0.00"
                onChange={(evento) => { setMontoFinal(evento.target.value); setError(''); }}
                aria-label="Monto final de la caja"
              />
            </label>
          </div>

          {abierta && (
            <div className="cashflow-reconciliation">
              <div>
                Efectivo esperado:{' '}
                <span>
                  {esperado === null
                    ? 'Cargando...'
                    : formatearMonedaCajero(esperado)}
                </span>
              </div>
              <div>
                Ventas en efectivo:{' '}
                {resumen
                  ? formatearMonedaCajero(
                      (resumen.payments ?? [])
                        .filter((pago) => pago.metodo === 'CASH')
                        .reduce((suma, pago) => suma + Number(pago.total ?? 0), 0)
                    )
                  : '—'}
              </div>
              <div>
                Ingresos:{' '}
                {formatearMonedaCajero(
                  Number(resumen?.movements?.total_ingresos ?? 0)
                )}{' '}
                | Egresos:{' '}
                {formatearMonedaCajero(
                  Number(resumen?.movements?.total_egresos ?? 0)
                )}
              </div>
              <div>
                Diferencia:{' '}
                <span>
                  {diferencia === null
                    ? 'Ingresá el monto contado'
                    : `${formatearMonedaCajero(Math.abs(diferencia))} (${
                        diferencia === 0
                          ? 'Cuadrada'
                          : diferencia > 0
                            ? 'Sobrante'
                            : 'Faltante'
                      })`}
                </span>
              </div>
              <button
                type="button"
                className="cashflow-button is-secondary"
                onClick={() => setRevision((valor) => valor + 1)}
              >
                <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                Actualizar resumen
              </button>
            </div>
          )}

          {resumen?.movementDetails && (
            <CashMovementTable movements={resumen.movementDetails} />
          )}

          {error && (
            <p className="manager-caja-error" role="alert">
              <i className="bi bi-exclamation-circle" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="manager-caja-actions">
            <button
              type="button"
              className="manager-caja-button is-open"
              onClick={handleAbrir}
              disabled={abierta}
            >
              <i className="bi bi-unlock-fill" aria-hidden="true" />
              Abrir caja
            </button>

            <button
              type="button"
              className="manager-caja-button is-closed"
              onClick={handleCerrar}
              disabled={!abierta}
            >
              <i className="bi bi-lock-fill" aria-hidden="true" />
              Cerrar caja
            </button>
          </div>
        </article>

        <article className="cashier-activity manager-caja-note">
          <div className="cashier-activity__header">
            <div>
              <h2>Impacto en el cajero</h2>
              <p>El cambio se aplica de inmediato al POS.</p>
            </div>
          </div>

          <ul>
            <li>
              <i
                className={
                  abierta ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'
                }
                aria-hidden="true"
              />
              Registro de ventas {abierta ? 'habilitado' : 'bloqueado'}.
            </li>
            <li>
              <i className="bi bi-clipboard-check" aria-hidden="true" />
              Las órdenes siguen disponibles para consulta.
            </li>
            <li>
              <i className="bi bi-cash-coin" aria-hidden="true" />
              Montos inicial y final quedan guardados por sucursal.
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
}
