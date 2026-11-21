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
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REGISTRO_INICIAL = {
  usuario: '',
  correo: '',
  direccion: '',
  contrasena: '',
};

export default function LoginPage() {
  const [credenciales, setCredenciales] = useState({ usuario: '', contrasena: '' });
  const [verContrasena, setVerContrasena] = useState(false);
  const [estado, setEstado] = useState('inicial');
  const [mensaje, setMensaje] = useState('');

  const [registroAbierto, setRegistroAbierto] = useState(false);

  const [registro, setRegistro] = useState(REGISTRO_INICIAL);
  const [verRegistroContrasena, setVerRegistroContrasena] = useState(false);
  const [registroEstado, setRegistroEstado] = useState('inicial');
  const [registroMensaje, setRegistroMensaje] = useState('');

  const cargando = estado === 'cargando';
  const registrando = registroEstado === 'cargando';

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

  const actualizarRegistro = (campo) => (evento) => {
    setRegistro((previos) => ({ ...previos, [campo]: evento.target.value }));
    if (registroEstado === 'error') {
      setRegistroEstado('inicial');
      setRegistroMensaje('');
    }
  };

  const obtenerErrorRegistro = () => {
    if (registro.usuario.trim().length < 3) return 'El usuario debe tener al menos 3 caracteres.';
    if (!PATRON_CORREO.test(registro.correo.trim())) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (registro.direccion.trim().length < 5) return 'Ingresa tu dirección residencial.';
    if (registro.contrasena.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    return null;
  };

  const enviarRegistro = (evento) => {
    evento.preventDefault();
    const error = obtenerErrorRegistro();

    if (error) {
      setRegistroEstado('error');
      setRegistroMensaje(error);
      return;
    }

    setRegistroEstado('cargando');
    setRegistroMensaje('');

    window.setTimeout(() => {
      setRegistroEstado('exito');
      setRegistroMensaje(
        `Cuenta creada para ${registro.usuario.trim()}. El registro es una simulación local.`
      );
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

            <div className="auth-divider">
              <span>o</span>
            </div>

            <button
              type="button"
              className="auth-expand"
              onClick={() => setRegistroAbierto((abierto) => !abierto)}
              aria-expanded={registroAbierto}
              aria-controls="panel-registro"
            >
              <span className="auth-expand__text">
                <small>{registroAbierto ? '¿Ya terminaste?' : '¿Aún no tienes cuenta?'}</small>
                <strong>{registroAbierto ? 'Cerrar formulario' : 'Crear una cuenta'}</strong>
              </span>
              <i
                className={`bi bi-chevron-down auth-expand__chevron${registroAbierto ? ' is-open' : ''}`}
                aria-hidden="true"
              />
            </button>

            <p className="auth-card__foot">
              © {new Date().getFullYear()} Orígenes SV
              <Link to="/cliente" className="auth-card__client-link">
                Módulo cliente
              </Link>
            </p>
          </section>

          {registroAbierto && (
            <section
              className="auth-card auth-card--register"
              id="panel-registro"
              aria-labelledby="registro-title"
            >
              <header className="auth-card__header">
                <h2 id="registro-title" className="auth-card__title">
                  Crear cuenta
                </h2>
                <p className="auth-card__subtitle">Solo lo esencial para empezar.</p>
              </header>

              <Form onSubmit={enviarRegistro} noValidate>
                {registroMensaje && (
                  <Alert
                    className={`auth-alert auth-alert--${registroEstado === 'error' ? 'error' : 'success'}`}
                    fade={false}
                  >
                    <i
                      className={`bi ${registroEstado === 'error' ? 'bi-exclamation-circle' : 'bi-check-circle'} me-2`}
                      aria-hidden="true"
                    />
                    {registroMensaje}
                  </Alert>
                )}

                <div className="auth-fields">
                  <div className="auth-field">
                    <label className="visually-hidden" htmlFor="registro-usuario">
                      Usuario
                    </label>
                    <i className="bi bi-person auth-field__icon" aria-hidden="true" />
                    <Input
                      id="registro-usuario"
                      className="auth-input"
                      name="usuario"
                      placeholder="USUARIO"
                      autoComplete="username"
                      value={registro.usuario}
                      onChange={actualizarRegistro('usuario')}
                      disabled={registrando}
                    />
                  </div>

                  <div className="auth-field">
                    <label className="visually-hidden" htmlFor="registro-correo">
                      Correo electrónico
                    </label>
                    <i className="bi bi-envelope auth-field__icon" aria-hidden="true" />
                    <Input
                      id="registro-correo"
                      className="auth-input"
                      name="correo"
                      type="email"
                      placeholder="CORREO"
                      autoComplete="email"
                      value={registro.correo}
                      onChange={actualizarRegistro('correo')}
                      disabled={registrando}
                    />
                  </div>

                  <div className="auth-field">
                    <label className="visually-hidden" htmlFor="registro-direccion">
                      Dirección residencial
                    </label>
                    <i className="bi bi-geo-alt auth-field__icon" aria-hidden="true" />
                    <Input
                      id="registro-direccion"
                      className="auth-input"
                      name="direccion"
                      placeholder="DIRECCIÓN RESIDENCIAL"
                      autoComplete="street-address"
                      value={registro.direccion}
                      onChange={actualizarRegistro('direccion')}
                      disabled={registrando}
                    />
                  </div>

                  <div className="auth-field auth-secret">
                    <label className="visually-hidden" htmlFor="registro-contrasena">
                      Contraseña
                    </label>
                    <i className="bi bi-lock auth-field__icon" aria-hidden="true" />
                    <Input
                      id="registro-contrasena"
                      className="auth-input"
                      name="contrasena"
                      type={verRegistroContrasena ? 'text' : 'password'}
                      placeholder="CONTRASEÑA"
                      autoComplete="new-password"
                      value={registro.contrasena}
                      onChange={actualizarRegistro('contrasena')}
                      disabled={registrando}
                    />
                    <button
                      type="button"
                      className="auth-secret__toggle"
                      onClick={() => setVerRegistroContrasena((valor) => !valor)}
                      aria-label={
                        verRegistroContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                      aria-pressed={verRegistroContrasena}
                      disabled={registrando}
                    >
                      <i
                        className={`bi ${verRegistroContrasena ? 'bi-eye-slash' : 'bi-eye'}`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                <Button type="submit" className="btn-auth" disabled={registrando}>
                  {registrando ? (
                    <>
                      <Spinner size="sm" aria-hidden="true" />
                      Creando
                    </>
                  ) : (
                    <>
                      Crear cuenta
                      <i className="bi bi-arrow-right" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </Form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
