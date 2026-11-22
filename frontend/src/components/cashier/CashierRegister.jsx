import { useMemo, useState } from 'react';
import { Alert } from 'reactstrap';
import { formatearMonedaCajero } from '../../mocks/cashierMocks.js';

export default function CashierRegister({
  ventasTurno,
  ventasEfectivo,
  pedidosActivos,
}) {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoContado, setMontoContado] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [tipoMovimiento, setTipoMovimiento] = useState('ingreso');
  const [montoMovimiento, setMontoMovimiento] = useState('');
  const [descripcionMovimiento, setDescripcionMovimiento] = useState('');
  const [notificacion, setNotificacion] = useState('');
  const [error, setError] = useState('');
  const [resumenCierre, setResumenCierre] = useState(null);

  const totalIngresos = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.tipo === 'ingreso')
        .reduce((total, movimiento) => total + movimiento.monto, 0),
    [movimientos]
  );

  const totalEgresos = useMemo(
    () =>
      movimientos
        .filter((movimiento) => movimiento.tipo === 'egreso')
        .reduce((total, movimiento) => total + movimiento.monto, 0),
    [movimientos]
  );

  const efectivoEsperado =
    Number(montoInicial || 0) +
    ventasEfectivo +
    totalIngresos -
    totalEgresos;

  const abrirCaja = (evento) => {
    evento.preventDefault();
    setError('');
    setNotificacion('');

    const monto = Number(montoInicial);

    if (montoInicial.trim() === '' || !Number.isFinite(monto) || monto < 0) {
      setError('Ingresa un monto inicial válido.');
      return;
    }

    setCajaAbierta(true);
    setMovimientos([]);
    setMontoContado('');
    setResumenCierre(null);
    setNotificacion(
      `Caja abierta correctamente con ${formatearMonedaCajero(monto)} de fondo inicial.`
    );
  };

  const registrarMovimiento = (evento) => {
    evento.preventDefault();
    setError('');
    setNotificacion('');

    const monto = Number(montoMovimiento);

    if (
      montoMovimiento.trim() === '' ||
      !Number.isFinite(monto) ||
      monto <= 0
    ) {
      setError('Ingresa un monto mayor que cero.');
      return;
    }

    if (!descripcionMovimiento.trim()) {
      setError('Escribe una descripción para el movimiento.');
      return;
    }

    if (tipoMovimiento === 'egreso' && monto > efectivoEsperado) {
      setError('El egreso no puede superar el efectivo disponible.');
      return;
    }

    const nuevoMovimiento = {
      id: Date.now(),
      tipo: tipoMovimiento,
      monto,
      descripcion: descripcionMovimiento.trim(),
      hora: new Date().toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMovimientos((actuales) => [nuevoMovimiento, ...actuales]);
    setMontoMovimiento('');
    setDescripcionMovimiento('');
    setNotificacion('Movimiento registrado correctamente.');
  };

  const cerrarCaja = (evento) => {
    evento.preventDefault();
    setError('');
    setNotificacion('');

    if (pedidosActivos > 0) {
      setError(
        `No puedes cerrar la caja. Hay ${pedidosActivos} pedidos activos pendientes.`
      );
      return;
    }

    const contado = Number(montoContado);

    if (
      montoContado.trim() === '' ||
      !Number.isFinite(contado) ||
      contado < 0
    ) {
      setError('Ingresa un monto contado válido.');
      return;
    }

    const diferencia = contado - efectivoEsperado;

    setResumenCierre({
      inicial: Number(montoInicial),
      ventas: ventasTurno,
      ventasEfectivo,
      ingresos: totalIngresos,
      egresos: totalEgresos,
      esperado: efectivoEsperado,
      contado,
      diferencia,
    });

    setCajaAbierta(false);
    setNotificacion('El turno se ha cerrado correctamente.');
  };

  const iniciarNuevoTurno = () => {
    setMontoInicial('');
    setMontoContado('');
    setMovimientos([]);
    setResumenCierre(null);
    setNotificacion('');
    setError('');
  };

  return (
    <section className="cashier-register">
      <header className="cashier-section-header">
        <div>
          <h1>Administración de caja</h1>
          <p>Controla la apertura, los movimientos y el cierre del turno.</p>
        </div>

        <span
          className={`cashier-register__status ${
            cajaAbierta ? 'is-open' : 'is-closed'
          }`}
        >
          <span />
          {cajaAbierta ? 'Caja abierta' : 'Caja cerrada'}
        </span>
      </header>

      {notificacion && (
        <Alert
          color="success"
          fade={false}
          toggle={() => setNotificacion('')}
        >
          <i className="bi bi-check-circle me-2" />
          {notificacion}
        </Alert>
      )}

      {error && (
        <Alert color="danger" fade={false} toggle={() => setError('')}>
          <i className="bi bi-exclamation-circle me-2" />
          {error}
        </Alert>
      )}

      {!cajaAbierta && (
        <div className="cashier-register__closed">
          <div className="cashier-register__closed-icon">
            <i className="bi bi-safe2" />
          </div>

          <h2>{resumenCierre ? 'Turno finalizado' : 'La caja está cerrada'}</h2>

          <p>
            {resumenCierre
              ? 'El cierre del turno se ha registrado en esta simulación.'
              : 'Para comenzar a registrar operaciones, primero debes abrir la caja.'}
          </p>

          {resumenCierre && (
            <div className="cashier-register__closing-summary">
              <h3>Resumen del cierre</h3>

              <div>
                <span>Fondo inicial</span>
                <strong>{formatearMonedaCajero(resumenCierre.inicial)}</strong>
              </div>

              <div>
                <span>Ventas del turno</span>
                <strong>{formatearMonedaCajero(resumenCierre.ventas)}</strong>
              </div>

              <div>
                <span>Ventas pagadas en efectivo</span>
                <strong>{formatearMonedaCajero(resumenCierre.ventasEfectivo)}</strong>
              </div>

              <div>
                <span>Ingresos adicionales</span>
                <strong>{formatearMonedaCajero(resumenCierre.ingresos)}</strong>
              </div>

              <div>
                <span>Egresos</span>
                <strong>{formatearMonedaCajero(resumenCierre.egresos)}</strong>
              </div>

              <div>
                <span>Efectivo esperado</span>
                <strong>{formatearMonedaCajero(resumenCierre.esperado)}</strong>
              </div>

              <div>
                <span>Efectivo contado</span>
                <strong>{formatearMonedaCajero(resumenCierre.contado)}</strong>
              </div>

              <div className="cashier-register__difference">
                <span>Diferencia</span>
                <strong>
                  {formatearMonedaCajero(resumenCierre.diferencia)}
                </strong>
              </div>
            </div>
          )}

          <form className="cashier-register__open-form" onSubmit={abrirCaja}>
            <label htmlFor="cashier-opening-amount">
              {resumenCierre ? 'Monto inicial del nuevo turno' : 'Monto inicial'}
            </label>

            <div className="cashier-register__money-input">
              <span>$</span>
              <input
                id="cashier-opening-amount"
                type="number"
                min="0"
                step="0.01"
                value={montoInicial}
                onChange={(evento) => setMontoInicial(evento.target.value)}
                placeholder="0.00"
              />
            </div>

            <button type="submit">
              <i className="bi bi-unlock me-2" />
              Abrir caja
            </button>
          </form>

          {resumenCierre && (
            <button
              type="button"
              className="cashier-register__new-turn"
              onClick={iniciarNuevoTurno}
            >
              Preparar nuevo turno
            </button>
          )}
        </div>
      )}

      {cajaAbierta && (
        <>
          <div className="cashier-register__metrics">
            <article>
              <span>Fondo inicial</span>
              <strong>{formatearMonedaCajero(Number(montoInicial))}</strong>
              <i className="bi bi-wallet2" />
            </article>

            <article>
              <span>Ventas del turno</span>
              <strong>{formatearMonedaCajero(ventasTurno)}</strong>
              <i className="bi bi-currency-dollar" />
            </article>

            <article>
              <span>Ingresos adicionales</span>
              <strong>{formatearMonedaCajero(totalIngresos)}</strong>
              <i className="bi bi-arrow-down-circle" />
            </article>

            <article>
              <span>Egresos</span>
              <strong>{formatearMonedaCajero(totalEgresos)}</strong>
              <i className="bi bi-arrow-up-circle" />
            </article>
          </div>

          <div className="cashier-register__expected">
            <div>
              <span>Efectivo esperado en caja</span>
              <p>Fondo inicial + ventas en efectivo + ingresos - egresos</p>
            </div>
            <strong>{formatearMonedaCajero(efectivoEsperado)}</strong>
          </div>

          <div className="cashier-register__columns">
            <section className="cashier-register__panel">
              <div className="cashier-register__panel-header">
                <div>
                  <h2>Registrar movimiento</h2>
                  <p>Registra entradas o salidas de efectivo.</p>
                </div>
                <i className="bi bi-arrow-left-right" />
              </div>

              <form onSubmit={registrarMovimiento}>
                <label htmlFor="cashier-movement-type">Tipo de movimiento</label>
                <select
                  id="cashier-movement-type"
                  value={tipoMovimiento}
                  onChange={(evento) => setTipoMovimiento(evento.target.value)}
                >
                  <option value="ingreso">Ingreso de efectivo</option>
                  <option value="egreso">Egreso de efectivo</option>
                </select>

                <label htmlFor="cashier-movement-amount">Monto ($)</label>
                <input
                  id="cashier-movement-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={montoMovimiento}
                  onChange={(evento) => setMontoMovimiento(evento.target.value)}
                  placeholder="0.00"
                />

                <label htmlFor="cashier-movement-description">Descripción</label>
                <input
                  id="cashier-movement-description"
                  type="text"
                  value={descripcionMovimiento}
                  onChange={(evento) =>
                    setDescripcionMovimiento(evento.target.value)
                  }
                  placeholder="Ej. Compra de suministros"
                />

                <button type="submit">
                  <i className="bi bi-plus-lg me-2" />
                  Registrar movimiento
                </button>
              </form>
            </section>

            <section className="cashier-register__panel">
              <div className="cashier-register__panel-header">
                <div>
                  <h2>Movimientos del turno</h2>
                  <p>Historial de ingresos y egresos registrados.</p>
                </div>
                <i className="bi bi-clock-history" />
              </div>

              {movimientos.length > 0 ? (
                <div className="cashier-register__movements">
                  {movimientos.map((movimiento) => (
                    <div key={movimiento.id}>
                      <span
                        className={`cashier-register__movement-icon ${
                          movimiento.tipo === 'ingreso'
                            ? 'is-income'
                            : 'is-expense'
                        }`}
                      >
                        <i
                          className={`bi ${
                            movimiento.tipo === 'ingreso'
                              ? 'bi-arrow-down-left'
                              : 'bi-arrow-up-right'
                          }`}
                        />
                      </span>

                      <div className="cashier-register__movement-info">
                        <strong>{movimiento.descripcion}</strong>
                        <span>
                          {movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} ·{' '}
                          {movimiento.hora}
                        </span>
                      </div>

                      <strong
                        className={
                          movimiento.tipo === 'ingreso'
                            ? 'is-income-text'
                            : 'is-expense-text'
                        }
                      >
                        {movimiento.tipo === 'ingreso' ? '+' : '-'}
                        {formatearMonedaCajero(movimiento.monto)}
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="cashier-register__empty">
                  <i className="bi bi-receipt" />
                  <strong>Sin movimientos registrados</strong>
                  <span>Los movimientos aparecerán aquí.</span>
                </div>
              )}
            </section>
          </div>

          <section className="cashier-register__close-panel">
            <div>
              <h2>Cerrar turno</h2>
              <p>
                Cuenta el efectivo disponible e ingresa el monto para comparar
                contra el efectivo esperado.
              </p>
            </div>

            <form onSubmit={cerrarCaja}>
              <label htmlFor="cashier-counted-amount">
                Efectivo contado ($)
              </label>

              <div className="cashier-register__money-input">
                <span>$</span>
                <input
                  id="cashier-counted-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={montoContado}
                  onChange={(evento) => setMontoContado(evento.target.value)}
                  placeholder="0.00"
                />
              </div>

              <button type="submit" disabled={pedidosActivos > 0}>
                <i className="bi bi-lock me-2" />
                Cerrar caja
              </button>
            </form>

            {pedidosActivos > 0 && (
              <Alert color="warning" className="mt-3 mb-0">
                Hay {pedidosActivos} pedidos activos. Debes resolverlos antes
                de cerrar la caja.
              </Alert>
            )}
          </section>
        </>
      )}
    </section>
  );
}
