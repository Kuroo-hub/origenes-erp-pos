import { formatearMonedaCajero as dinero } from '../../utils/formatters.js';

export default function CashMovementTable({ movements }) {
  return (
    <section className="cashier-cashflow__movements">
      <div className="cashier-cashflow__heading"><h2>Movimientos del turno</h2></div>
      { !Array.isArray(movements) ? <p className="cashflow-note">Detalle no disponible.</p> : movements.length === 0 ? <p className="cashflow-note">No hay movimientos registrados.</p> : (
        <div className="cashier-activity__table-wrapper">
          <table className="cashier-activity__table">
            <thead><tr><th>Fecha y hora</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr></thead>
            <tbody>{movements.map(m => <tr key={m.cash_movement_id}>
              <td>{new Date(m.created_at).toLocaleString('es-SV')}</td>
              <td>{m.movement_type === 'INCOME' ? 'Ingreso' : 'Egreso'}</td>
              <td>{m.description || '—'}</td>
              <td>{dinero(Number(m.amount))}</td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
