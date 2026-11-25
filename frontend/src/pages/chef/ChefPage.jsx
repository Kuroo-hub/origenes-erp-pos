import { useEffect, useMemo, useState } from 'react';
import ChefOrderCard from '../../components/chef/ChefOrderCard.jsx';
import { useOrders } from '../../context/OrderContext.jsx';
import '../../styles/chef.css';

const ESTADOS_ACTIVOS = ['Pendiente', 'En preparación'];
const ORDEN_URGENCIA = { critico: 0, advertencia: 1, normal: 2 };

const obtenerMinutos = (createdAt, ahora) =>
  Math.max(0, Math.floor((ahora - new Date(createdAt).getTime()) / 60000));

const formatearTiempo = (createdAt, ahora) => {
  const total = Math.max(0, Math.floor((ahora - new Date(createdAt).getTime()) / 1000));
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
};

const obtenerUrgencia = (orden, minutos) => {
  if (minutos >= orden.tiempoObjetivoMin + 10) {
    return { id: 'critico', etiqueta: 'Urgente', icono: 'bi-fire' };
  }
  if (minutos >= orden.tiempoObjetivoMin) {
    return { id: 'advertencia', etiqueta: 'Retrasada', icono: 'bi-exclamation-triangle' };
  }
  return { id: 'normal', etiqueta: 'A tiempo', icono: 'bi-check-circle' };
};

export default function ChefPage() {
  const { ordenesSucursal, sucursal } = useOrders();
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const temporizador = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(temporizador);
  }, []);

  const ordenesVisibles = useMemo(
    () =>
      ordenesSucursal
        .filter((orden) => ESTADOS_ACTIVOS.includes(orden.estado))
        .map((orden) => {
          const minutos = obtenerMinutos(orden.created_at, ahora);
          return {
            orden,
            minutos,
            tiempo: formatearTiempo(orden.created_at, ahora),
            urgencia: obtenerUrgencia(orden, minutos),
          };
        })
        .sort(
          (a, b) =>
            ORDEN_URGENCIA[a.urgencia.id] - ORDEN_URGENCIA[b.urgencia.id] ||
            new Date(a.orden.created_at).getTime() - new Date(b.orden.created_at).getTime()
        ),
    [ordenesSucursal, ahora]
  );

  const pendientes = ordenesVisibles.filter((item) => item.orden.estado === 'Pendiente').length;
  const enPreparacion = ordenesVisibles.filter(
    (item) => item.orden.estado === 'En preparación'
  ).length;
  const criticas = ordenesVisibles.filter((item) => item.urgencia.id === 'critico').length;

  const indicadores = [
    {
      id: 'activas',
      titulo: 'Órdenes activas',
      valor: ordenesVisibles.length,
      detalle: 'En cola de cocina',
      icono: 'bi-clipboard-check',
      tono: 'azul',
    },
    {
      id: 'pendientes',
      titulo: 'Pendientes',
      valor: pendientes,
      detalle: 'Esperando iniciar',
      icono: 'bi-hourglass-split',
      tono: 'ambar',
    },
    {
      id: 'preparacion',
      titulo: 'En preparación',
      valor: enPreparacion,
      detalle: 'Actualmente en cocina',
      icono: 'bi-cup-hot',
      tono: 'verde',
    },
    {
      id: 'urgentes',
      titulo: 'Urgentes',
      valor: criticas,
      detalle: 'Fuera del objetivo',
      icono: 'bi-fire',
      tono: 'rojo',
    },
  ];

  const horaActual = new Date(ahora).toLocaleTimeString('es-SV', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="chef-shell">
      <header className="chef-header">
        <div className="chef-header__identity">
          <p className="chef-header__eyebrow">
            <i className="bi bi-fire" aria-hidden="true" />
            Módulo de cocina
          </p>
          <h1 className="chef-header__title">Panel de cocina</h1>
          <p className="chef-header__subtitle">
            Sucursal {sucursal} · órdenes activas de cocina con tiempos en vivo
          </p>
        </div>
        <div className="chef-header__clock">
          <i className="bi bi-clock" aria-hidden="true" />
          <span>{horaActual}</span>
        </div>
      </header>

      <section className="chef-kpis" aria-label="Resumen de órdenes activas">
        {indicadores.map((indicador) => (
          <article key={indicador.id} className={`chef-kpi chef-kpi--${indicador.tono}`}>
            <div className="chef-kpi__top">
              <span className="chef-kpi__titulo">{indicador.titulo}</span>
              <i className={`bi ${indicador.icono}`} aria-hidden="true" />
            </div>
            <strong className="chef-kpi__valor">{indicador.valor}</strong>
            <span className="chef-kpi__detalle">{indicador.detalle}</span>
          </article>
        ))}
      </section>

      <section className="chef-orders" aria-labelledby="chef-orders-title">
        <div className="chef-orders__header">
          <div>
            <h2 id="chef-orders-title" className="chef-orders__title">
              Órdenes activas
            </h2>
            <p className="chef-orders__subtitle">
              Ordenadas por urgencia y tiempo de espera
            </p>
          </div>
          <span className="chef-orders__count">{ordenesVisibles.length} en cocina</span>
        </div>

        {ordenesVisibles.length > 0 ? (
          <div className="chef-orders__grid">
            {ordenesVisibles.map(({ orden, minutos, tiempo, urgencia }) => (
              <ChefOrderCard
                key={orden.id}
                orden={orden}
                minutos={minutos}
                tiempo={tiempo}
                urgencia={urgencia}
              />
            ))}
          </div>
        ) : (
          <div className="chef-orders__empty">
            <i className="bi bi-check2-circle" aria-hidden="true" />
            <strong>No hay órdenes activas</strong>
            <span>Las nuevas órdenes aparecerán aquí automáticamente.</span>
          </div>
        )}
      </section>
    </div>
  );
}
