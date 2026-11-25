import { useEffect, useState } from 'react';
import { ROLES_RRHH, etiquetaRolRRHH } from '../../utils/rrhh.js';

const FORMULARIO_INICIAL = {
  fullName: '',
  email: '',
  password: '',
  branchId: '',
  baseSalary: '',
  role: ROLES_RRHH[0].id,
};

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function HrHiring({
  empleados = [],
  sucursales = [],
  roles = ROLES_RRHH,
  onContratar,
  puedeContratar = false,
}) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!formulario.branchId && sucursales.length > 0) {
      setFormulario((previo) => ({
        ...previo,
        branchId: String(sucursales[0].branch_id ?? sucursales[0].id),
      }));
    }
  }, [formulario.branchId, sucursales]);

  const actualizarCampo = (campo) => (evento) => {
    setFormulario((previo) => ({
      ...previo,
      [campo]: evento.target.value,
    }));
    setMensaje(null);
  };

  const validarFormulario = () => {
    const nombre = formulario.fullName.trim();
    const correo = formulario.email.trim().toLowerCase();
    const salario = Number(formulario.baseSalary);

    if (nombre.length < 3 || !/[a-záéíóúñ]/i.test(nombre)) {
      return 'Escribe el nombre completo del empleado.';
    }
    if (!PATRON_CORREO.test(correo)) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (!/[a-z0-9]/i.test(correo.split('@')[0])) {
      return 'El correo debe contener letras o números antes del @.';
    }
    if (empleados.some((empleado) => (empleado.email ?? '').toLowerCase() === correo)) {
      return 'Ya existe un empleado registrado con ese correo.';
    }
    if (!sucursales.some((sucursal) => String(sucursal.branch_id ?? sucursal.id) === formulario.branchId)) {
      return 'Selecciona una sucursal válida.';
    }
    if (!Number.isFinite(salario) || salario <= 0) {
      return 'El salario mensual debe ser un número mayor a cero.';
    }
    const passwordBytes = new TextEncoder().encode(formulario.password).length;
    if (formulario.password.length < 8 || passwordBytes > 72) {
      return 'La contraseña debe tener entre 8 y 72 bytes.';
    }
    return null;
  };

  const enviarFormulario = async (evento) => {
    evento.preventDefault();

    const error = validarFormulario();
    if (error) {
      setMensaje({ tipo: 'error', texto: error });
      return;
    }

    setEnviando(true);
    setMensaje(null);

    try {
      const credenciales = await onContratar({
        fullName: formulario.fullName.trim(),
        email: formulario.email.trim().toLowerCase(),
        password: formulario.password,
        jobTitle: etiquetaRolRRHH(formulario.role),
        hireDate: new Date().toISOString().slice(0, 10),
        branchId: Number(formulario.branchId),
        baseSalary: Number(formulario.baseSalary),
        role: formulario.role,
      });

      setMensaje({
        tipo: 'success',
        texto: `${credenciales.usuario} contratado. Podrá iniciar sesión con ${credenciales.username}.`,
      });
      setFormulario(FORMULARIO_INICIAL);
    } catch (caughtError) {
      setMensaje({ tipo: 'error', texto: caughtError.message ?? 'No se pudo completar la contratación.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="hr-hiring">
      <header className="hr-section-header">
        <div>
          <h1>Contratación</h1>
          <p>Registra personal nuevo y crea su cuenta de acceso al sistema.</p>
        </div>
      </header>

      <div className="hr-hiring__layout">
        <form
          className="hr-hiring__form"
          onSubmit={enviarFormulario}
          noValidate
        >
          <h2>Datos del empleado</h2>

          {mensaje && (
            <div
              className={`hr-hiring__alert hr-hiring__alert--${mensaje.tipo}`}
              role="status"
            >
              <i
                className={`bi ${
                  mensaje.tipo === 'error'
                    ? 'bi-exclamation-circle'
                    : 'bi-check-circle'
                }`}
                aria-hidden="true"
              />
              <span>{mensaje.texto}</span>
            </div>
          )}

          <div className="hr-hiring__grid">
            <label className="hr-hiring__field">
              <span>Nombre completo</span>
              <input
                type="text"
                value={formulario.fullName}
                onChange={actualizarCampo('fullName')}
                placeholder="Ej. Andrea Nicole Pérez"
                maxLength={80}
              />
            </label>

            <label className="hr-hiring__field">
              <span>Correo electrónico</span>
              <input
                type="email"
                value={formulario.email}
                onChange={actualizarCampo('email')}
                placeholder="nombre@origenes.com"
                maxLength={100}
              />
            </label>

            <label className="hr-hiring__field">
              <span>Contraseña inicial</span>
              <input
                type="password"
                value={formulario.password}
                onChange={actualizarCampo('password')}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                maxLength={72}
              />
            </label>

            <label className="hr-hiring__field">
              <span>Sucursal</span>
              <select
                value={formulario.branchId}
                onChange={actualizarCampo('branchId')}
              >
  {sucursales.map((sucursal) => (
    <option key={sucursal.branch_id ?? sucursal.id} value={sucursal.branch_id ?? sucursal.id}>
      {sucursal.name ?? sucursal.nombre}
    </option>
  ))}
              </select>
            </label>

            <label className="hr-hiring__field">
              <span>Salario mensual (USD)</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={formulario.baseSalary}
                onChange={actualizarCampo('baseSalary')}
                placeholder="Ej. 550"
              />
            </label>

            <label className="hr-hiring__field">
              <span>Rol del sistema</span>
              <select
                value={formulario.role}
                onChange={actualizarCampo('role')}
              >
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.etiqueta}
                  </option>
                ))}
              </select>
              <small>El cargo se define automáticamente con el rol.</small>
            </label>
          </div>

          <button
            type="submit"
            className="hr-hiring__submit"
            disabled={enviando || !puedeContratar}
          >
            <i className="bi bi-person-plus" aria-hidden="true" />
            {enviando ? 'Contratando...' : 'Contratar y crear cuenta'}
          </button>
        </form>

        <aside className="hr-hiring__aside">
          <span className="hr-hiring__aside-icon">
            <i className="bi bi-person-badge" aria-hidden="true" />
          </span>
          <h2>Cuenta de acceso</h2>
          <p>
            La cuenta se crea en el servidor con el correo y la contraseña
            indicados. El empleado aparece de inmediato en la lista de
            Empleados y en Planillas.
          </p>
          <ul>
            <li>
              <i className="bi bi-check2" aria-hidden="true" />
              Acceso con correo electrónico
            </li>
            <li>
              <i className="bi bi-check2" aria-hidden="true" />
              Contraseña definida por el administrador
            </li>
            <li>
              <i className="bi bi-check2" aria-hidden="true" />
              Cargo asignado automáticamente según el rol
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
