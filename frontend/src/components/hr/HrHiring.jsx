
import { useState } from 'react';
import {
  ROLES_RRHH,
  SUCURSALES_RRHH,
  etiquetaRolRRHH,
} from '../../mocks/HrMocks.js';

const FORMULARIO_INICIAL = {
  fullName: '',
  email: '',
  branchId: String(SUCURSALES_RRHH[0].id),
  baseSalary: '',
  role: ROLES_RRHH[0].id,
};

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function HrHiring({ empleados = [], onContratar }) {
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [mensaje, setMensaje] = useState(null);

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
    if (
      empleados.some(
        (empleado) => (empleado.email ?? '').toLowerCase() === correo
      )
    ) {
      return 'Ya existe un empleado registrado con ese correo.';
    }
    if (!SUCURSALES_RRHH.some((sucursal) => String(sucursal.id) === formulario.branchId)) {
      return 'Selecciona una sucursal válida.';
    }
    if (!Number.isFinite(salario) || salario <= 0) {
      return 'El salario mensual debe ser un número mayor a cero.';
    }
    return null;
  };

  const enviarFormulario = (evento) => {
    evento.preventDefault();

    const error = validarFormulario();
    if (error) {
      setMensaje({ tipo: 'error', texto: error });
      return;
    }

    const credenciales = onContratar({
      fullName: formulario.fullName.trim(),
      email: formulario.email.trim().toLowerCase(),
      jobTitle: etiquetaRolRRHH(formulario.role),
      branchId: Number(formulario.branchId),
      baseSalary: Number(formulario.baseSalary),
      role: formulario.role,
    });

    setMensaje({
      tipo: 'success',
      texto: `${credenciales.usuario} contratado. Usuario: ${credenciales.username} · Contraseña temporal: ${credenciales.temporaryPassword}`,
    });
    setFormulario(FORMULARIO_INICIAL);
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
              <span>Sucursal</span>
              <select
                value={formulario.branchId}
                onChange={actualizarCampo('branchId')}
              >
                {SUCURSALES_RRHH.map((sucursal) => (
                  <option key={sucursal.id} value={sucursal.id}>
                    {sucursal.nombre}
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
                {ROLES_RRHH.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.etiqueta}
                  </option>
                ))}
              </select>
              <small>El cargo se define automáticamente con el rol.</small>
            </label>
          </div>

          <button type="submit" className="hr-hiring__submit">
            <i className="bi bi-person-plus" aria-hidden="true" />
            Contratar y crear cuenta
          </button>
        </form>

        <aside className="hr-hiring__aside">
          <span className="hr-hiring__aside-icon">
            <i className="bi bi-person-badge" aria-hidden="true" />
          </span>
          <h2>Cuenta de acceso</h2>
          <p>
            Al contratar se genera un usuario y una contraseña temporal. El
            empleado aparece de inmediato en la lista de Empleados y en
            Planillas.
          </p>
          <ul>
            <li>
              <i className="bi bi-check2" aria-hidden="true" />
              Usuario basado en el correo
            </li>
            <li>
              <i className="bi bi-check2" aria-hidden="true" />
              Contraseña temporal de demostración
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
