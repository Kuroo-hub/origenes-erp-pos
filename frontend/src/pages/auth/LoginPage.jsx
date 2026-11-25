import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Form,
  Input,
  Spinner,
} from 'reactstrap';
import Brand from '../../components/auth/Brand.jsx';

const ESPERA_DEMO = 700;

const MODULOS = [
  { ruta: '/cajero', etiqueta: 'Cajero', icono: 'bi-cash-coin', detalle: 'Punto de venta' },
  {
    ruta: '/chef',
    etiqueta: 'Panel de cocina',
    icono: 'bi-fire',
    detalle: 'Pedidos para preparar',
  },
  {
    ruta: '/rrhh',
    etiqueta: 'Recursos humanos',
    icono: 'bi-people',
    detalle: 'Empleados y planillas',
  },
  {
    ruta: '/inventario',
    etiqueta: 'Inventario',
    icono: 'bi-box-seam',
    detalle: 'Stock y compras',
  },
  { ruta: '/repartidor', etiqueta: 'Repartidor', icono: 'bi-truck', detalle: 'Entregas' },
  {
    ruta: '/manager',
    etiqueta: 'Manager',
    icono: 'bi-cash-coin',
    detalle: 'Resumen, caja y flujo',
  },
  {
    ruta: '/gerencia',
    etiqueta: 'Owner',
    icono: 'bi-bar-chart-line',
    detalle: 'Reportes y finanzas',
  },
];

export default function LoginPage() {
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' });
  const [verContrasena, setVerContrasena] = useState(false);
  const [estado, setEstado] = useState('inicial');
  const [mensaje, setMensaje] = useState('');

  const cargando = estado === 'cargando';

  const actualizarCampo = (campo) => (evento) => {
    setCredenciales((previas) => ({ ...previas, [campo]: evento.target.value }));
    if (estado === 'error') {
      setEstado('inicial');
      setMensaje('');
    }
  };

  const enviarFormulario = (evento) => {
    evento.preventDefault();

    if (!credenciales.usuario.trim() || !credenciales.contrasena.trim()) {
      setEstado('error');
      setMensaje('Completa usuario y contraseña para continuar.');
      return;
    }

    setEstado('cargando');
    setMensaje('');

    window.setTimeout(() => {
      setEstado('exito');
      setMensaje(`Bienvenido, ${credenciales.usuario.trim()}. El acceso es una simulación local.`);
    }, ESPERA_DEMO);
  };

  return (
    <main className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <Brand size="lg" variant="light" />
        </div>

        <div className="auth-panels">
          <section className="auth-card auth-card--login" aria-labelledby="login-title">
            <header className="auth-card__header">
              <h1 id="login-title" className="auth-card__title">
                Iniciar sesión
              </h1>
              <p className="auth-card__subtitle">Ingresa a tu cuenta de Orígenes SV.</p>
            </header>

            <Form onSubmit={enviarFormulario} noValidate>
              {mensaje && (
                <Alert
                  className={`auth-alert auth-alert--${estado === 'error' ? 'error' : 'success'}`}
                  fade={false}
                >
                  <i
                    className={`bi ${estado === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2`}
                    aria-hidden="true"
                  />
                  {mensaje}
                </Alert>
              )}

              <div className="auth-fields">
                <div className="auth-field">
                  <label className="visually-hidden" htmlFor="login-usuario">
                    Usuario
                  </label>
                  <i className="bi bi-person auth-field__icon" aria-hidden="true" />
                  <Input
                    id="login-usuario"
                    className="auth-input"
                    name="usuario"
                    placeholder="USUARIO"
                    autoComplete="username"
                    value={credenciales.usuario}
                    onChange={actualizarCampo('usuario')}
                    disabled={cargando}
                  />
                </div>

                <div className="auth-field auth-secret">
                  <label className="visually-hidden" htmlFor="login-contrasena">
                    Contraseña
                  </label>
                  <i className="bi bi-lock auth-field__icon" aria-hidden="true" />
                  <Input
                    id="login-contrasena"
                    className="auth-input"
                    name="contrasena"
                    type={verContrasena ? 'text' : 'password'}
                    placeholder="CONTRASEÑA"
                    autoComplete="current-password"
                    value={credenciales.contrasena}
                    onChange={actualizarCampo('contrasena')}
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    className="auth-secret__toggle"
                    onClick={() => setVerContrasena((valor) => !valor)}
                    aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={verContrasena}
                  >
                    <i
                      className={`bi ${verContrasena ? 'bi-eye-slash' : 'bi-eye'}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              <Button type="submit" className="btn-auth" disabled={cargando}>
                {cargando ? (
                  <>
                    <Spinner size="sm" aria-hidden="true" />
                    Entrando
                  </>
                ) : (
                  <>
                    Entrar
                    <i className="bi bi-arrow-right" aria-hidden="true" />
                  </>
                )}
              </Button>
            </Form>

            <p className="auth-card__foot">
              © {new Date().getFullYear()} Orígenes SV
            </p>
          </section>
        </div>

        <nav className="auth-modules" aria-label="Módulos de Orígenes SV">
          <div className="auth-modules__header">
            <h2 className="auth-modules__title">Módulos del sistema</h2>
            <p className="auth-modules__subtitle">Explora cada área con un clic.</p>
          </div>

          <div className="auth-modules__grid">
            {MODULOS.map(({ ruta, etiqueta, icono, detalle }) => (
              <Link key={ruta} to={ruta} className="auth-module-card">
                <i className={`bi ${icono} auth-module-card__icon`} aria-hidden="true" />
                <span className="auth-module-card__text">
                  <strong>{etiqueta}</strong>
                  <small>{detalle}</small>
                </span>
                <i className="bi bi-arrow-up-right auth-module-card__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
