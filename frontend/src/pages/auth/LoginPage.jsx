import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Input, Spinner } from 'reactstrap';
import Brand from '../../components/auth/Brand.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { rutaPorRol } from '../../auth/roles.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credenciales, setCredenciales] = useState({ email: '', password: '' });
  const [verContrasena, setVerContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const actualizarCampo = (campo) => (evento) => {
    setCredenciales((previas) => ({ ...previas, [campo]: evento.target.value }));
    setMensaje('');
  };

  const enviarFormulario = async (evento) => {
    evento.preventDefault();

    if (!credenciales.email.trim() || !credenciales.password.trim()) {
      setMensaje('Completa el correo electrónico y la contraseña para continuar.');
      return;
    }

    setCargando(true);
    setMensaje('');

    try {
      const usuario = await login(
        credenciales.email.trim().toLowerCase(),
        credenciales.password
      );
      navigate(rutaPorRol(usuario?.role), { replace: true });
    } catch (error) {
      setMensaje(error.message ?? 'No se pudo iniciar sesión.');
    } finally {
      setCargando(false);
    }
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
                <Alert className="auth-alert auth-alert--error" fade={false}>
                  <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
                  {mensaje}
                </Alert>
              )}

              <div className="auth-fields">
                <div className="auth-field">
                  <label className="visually-hidden" htmlFor="login-usuario">
                    Correo electrónico
                  </label>
                  <i className="bi bi-person auth-field__icon" aria-hidden="true" />
                  <Input
                    id="login-usuario"
                    className="auth-input"
                    name="email"
                    placeholder="CORREO ELECTRÓNICO"
                    autoComplete="username"
                    type="email"
                    value={credenciales.email}
                    onChange={actualizarCampo('email')}
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
                    name="password"
                    type={verContrasena ? 'text' : 'password'}
                    placeholder="CONTRASEÑA"
                    autoComplete="current-password"
                    value={credenciales.password}
                    onChange={actualizarCampo('password')}
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
      </div>
    </main>
  );
}
