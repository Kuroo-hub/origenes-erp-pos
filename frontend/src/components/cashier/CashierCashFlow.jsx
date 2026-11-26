import { useCallback, useEffect, useState } from 'react';
import CashMovementTable from '../shared/CashMovementTable.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import { getCashSessionSummary, addCashMovement, getCashSessionHistory } from '../../services/cashFlowApi.js';
import { formatearMonedaCajero as dinero } from '../../utils/formatters.js';

const amount = (value) => Number(value ?? 0);
const validMoney = (value, allowZero = false) => /^\d{1,10}(\.\d{1,2})?$/.test(value) && (allowZero || amount(value) > 0);

export default function CashierCashFlow({ sucursal }) {
  const { caja, recargarDatos, sucursalId } = useOrders();
  const [resumen, setResumen] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tipo, setTipo] = useState('INGRESO');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [contado, setContado] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [r, h] = await Promise.all([
        caja.sessionId ? getCashSessionSummary(caja.sessionId) : Promise.resolve(null),
        getCashSessionHistory()
      ]);
      setResumen(r?.data ?? null);
      setHistorial(h?.data ?? []);
    } catch (e) { setError(e.message); setResumen(null); }
    finally { setCargando(false); }
  }, [caja.sessionId]);
  useEffect(() => { cargar(); }, [cargar]);

  const registrar = async (event) => {
    event.preventDefault();
    if (!validMoney(monto) || !concepto.trim()) { setError('Ingresá un monto positivo y un concepto.'); return; }
    setOcupado(true); setError('');
    try {
      await addCashMovement(caja.sessionId, { type: tipo, amount: monto, concept: concepto.trim() });
      setMonto(''); setConcepto('');
      await cargar(); await recargarDatos(sucursalId);
    } catch (e) { setError(e.message); }
    finally { setOcupado(false); }
  };
  const pagos = resumen?.payments ?? [];
  const efectivo = amount(resumen?.montoEfectivoEsperado);
  const diferencia = validMoney(contado, true) ? Math.round((amount(contado) - efectivo) * 100) / 100 : null;
  return (
    <section className="cashier-cashflow">
      <header className="cashier-section-header"><div><h1>Flujo y cuadre de caja</h1><p>Control de efectivo de {sucursal}.</p></div>
        <button className="cashflow-button is-secondary" onClick={cargar} disabled={cargando}>Actualizar</button></header>
      {error && <p className="alert alert-danger" role="alert">{error}</p>}
      {cargando && <p>Consultando caja...</p>}
      {resumen ? <>
        <div className="cashier-cashflow__summary">
          {[['Fondo inicial', resumen.session.monto_inicial], ['Ventas en efectivo', pagos.filter(p => p.metodo === 'CASH').reduce((sum, p) => sum + amount(p.total), 0)], ['Ingresos manuales', resumen.movements.total_ingresos], ['Egresos manuales', resumen.movements.total_egresos], ['Efectivo esperado', efectivo]].map(([nombre, valor]) => (
            <article className="cashier-cashflow__card" key={nombre}><span>{nombre}</span><span className="cashflow-value">{dinero(amount(valor))}</span></article>
          ))}
        </div>
        <section className="cashier-cashflow__movements"><div className="cashier-cashflow__heading"><h2>Ventas por método de pago</h2></div>
          <table className="cashier-activity__table"><thead><tr><th>Método</th><th>Total</th></tr></thead><tbody>
            {pagos.map((p) => <tr key={p.metodo}><td>{({ CASH: 'Efectivo', CARD: 'Tarjeta', BITCOIN: 'Bitcoin', CHIVO: 'Chivo Wallet' })[p.metodo] ?? p.metodo}</td><td>{dinero(amount(p.total))}</td></tr>)}
          </tbody></table>
        </section>
        <section className="cashier-cashflow__movements"><div className="cashier-cashflow__heading"><h2>Registrar movimiento</h2></div>
          <form onSubmit={registrar} className="cashflow-form">
            <label>Tipo<select  value={tipo} onChange={e => setTipo(e.target.value)}><option value="INGRESO">Ingreso</option><option value="EGRESO">Egreso</option></select></label>
            <label>Monto ($)<input  type="number" min="0.01" step="0.01" required value={monto} onChange={e => setMonto(e.target.value)} /></label>
            <label>Concepto<input  maxLength={150} required value={concepto} onChange={e => setConcepto(e.target.value)} /></label>
            <button className="cashflow-button" disabled={ocupado}>Registrar movimiento</button>
          </form>
        </section>
        <CashMovementTable movements={resumen.movementDetails} />
        <section className="cashier-cashflow__movements"><div className="cashier-cashflow__heading"><h2>Arqueo de caja</h2></div>
          <p className="cashflow-note">Efectivo esperado: {dinero(efectivo)}</p>
          <div className="cashflow-form">
          <label>Efectivo contado ($)<input  type="number" min="0" step="0.01" value={contado} onChange={e => setContado(e.target.value)} /></label>
          <p className="cashflow-result">Diferencia: <span>{diferencia === null ? 'Ingresá el efectivo contado' : `${dinero(Math.abs(diferencia))} — ${diferencia === 0 ? 'Caja cuadrada' : diferencia > 0 ? 'Sobrante' : 'Faltante'}`}</span></p></div>
          <p className="cashflow-note">El cierre definitivo se realiza en Apertura y cierre de caja.</p>
        </section>
      </> : !cargando && !error && <p>No hay sesión abierta. Abrí una caja para registrar movimientos y calcular el cuadre.</p>}
      <section className="cashier-cashflow__movements"><div className="cashier-cashflow__heading"><h2>Historial de sesiones</h2></div>
        <div className="table-responsive"><table className="cashier-activity__table"><thead><tr><th>Caja</th><th>Apertura</th><th>Estado</th><th>Inicial</th><th>Esperado</th><th>Contado al cierre</th><th>Diferencia</th></tr></thead><tbody>
          {historial.map(h => <tr key={h.id}><td>{h.nombreCaja}</td><td>{new Date(h.fechaApertura).toLocaleString('es-SV')}</td><td>{h.estado}</td><td>{dinero(amount(h.montoInicial))}</td><td>{dinero(amount(h.efectivoEsperado))}</td><td>{h.montoFinalReal == null ? '—' : dinero(amount(h.montoFinalReal))}</td><td>{h.diferencia == null ? '—' : `${dinero(Math.abs(amount(h.diferencia)))} (${amount(h.diferencia) === 0 ? 'Cuadrada' : amount(h.diferencia) > 0 ? 'Sobrante' : 'Faltante'})`}</td></tr>)}
        </tbody></table></div>
      </section>
    </section>
  );
}
