import { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Label } from 'reactstrap';
import { METODOS_PAGO, detalleMetodoPago } from '../../clientMock.js';

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SettingsPanel({
  perfil,
  metodoPago,
  onGuardar,
  onGuardarMetodoPago,
  onCambiarContrasena,
  onCerrarSesion,
}) {
  const [formulario, setFormulario] = useState(perfil);
  const [claves, setClaves] = useState({ actual: '', nueva: '', confirmar: '' });
  const [pago, setPago] = useState({
    tipo: metodoPago?.tipo ?? 'tarjeta',
    numero: '',
    titular: metodoPago?.titular ?? perfil.nombre,
    vencimiento: metodoPago?.vencimiento ?? '',
    identificador: metodoPago?.identificador ?? '',
    cvv: '',
  });
  const [errorPerfil, setErrorPerfil] = useState('');
  const [errorPago, setErrorPago] = useState('');
  const [errorClaves, setErrorClaves] = useState('');
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [guardandoClaves, setGuardandoClaves] = useState(false);
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    setFormulario(perfil);
    setPago((previo) => ({ ...previo, titular: previo.titular || perfil.nombre }));
  }, [perfil]);

  const actualizarCampo = (campo) => (evento) => {
    setFormulario((previo) => ({ ...previo, [campo]: evento.target.value }));
    setErrorPerfil('');
  };

  const actualizarClave = (campo) => (evento) => {
    setClaves((previo) => ({ ...previo, [campo]: evento.target.value }));
    setErrorClaves('');
  };

  const actualizarPago = (campo) => (evento) => {
    setPago((previo) => ({ ...previo, [campo]: evento.target.value }));
    setErrorPago('');
  };

  const enviarPago = async (evento) => {
    evento.preventDefault();

    let datos;

    if (pago.tipo === 'tarjeta') {
      const numero = pago.numero.replace(/\D/g, '');
      const cvv = pago.cvv.replace(/\D/g, '');

      if (numero.length < 13 || numero.length > 19) {
        setErrorPago('Ingresa un número de Visa válido (13 a 19 dígitos).');
        return;
      }

      if (!pago.titular.trim()) {
        setErrorPago('Ingresa el nombre del titular.');
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(pago.vencimiento.trim())) {
        setErrorPago('Usa el formato MM/AA para el vencimiento.');
        return;
      }

      if (cvv.length < 3 || cvv.length > 4) {
        setErrorPago('Ingresa un CVV válido (3 o 4 dígitos).');
        return;
      }

      datos = {
        tipo: 'tarjeta',
        numero,
        titular: pago.titular,
        vencimiento: pago.vencimiento,
      };
    } else if (pago.tipo === 'bitcoin' || pago.tipo === 'chivo') {
      if (!pago.identificador.trim()) {
        setErrorPago(
          pago.tipo === 'bitcoin'
            ? 'Ingresa una dirección o etiqueta Bitcoin.'
            : 'Ingresa el número o alias de Chivo Wallet.'
        );
        return;
      }

      datos = { tipo: pago.tipo, identificador: pago.identificador };
    } else {
      datos = { tipo: 'efectivo' };
    }

    setGuardandoPago(true);
    setErrorPago('');

    try {
      await onGuardarMetodoPago(datos);
      setPago((previo) => ({ ...previo, numero: '', cvv: '' }));
    } catch (error) {
      setErrorPago(error.message ?? 'No se pudo guardar el método de pago.');
    } finally {
      setGuardandoPago(false);
    }
  };

  const enviarPerfil = async (evento) => {
    evento.preventDefault();

    if (
      !formulario.nombre.trim() ||
      !formulario.correo.trim() ||
      !formulario.telefono.trim() ||
      !formulario.direccion.trim()
    ) {
      setErrorPerfil('Completa todos los datos del perfil.');
      return;
    }

    if (!PATRON_CORREO.test(formulario.correo.trim())) {
      setErrorPerfil('Ingresa un correo electrónico válido.');
      return;
    }

    setGuardandoPerfil(true);
    setErrorPerfil('');

    try {
      await onGuardar({
        nombre: formulario.nombre.trim(),
        correo: formulario.correo.trim(),
        telefono: formulario.telefono.trim(),
        direccion: formulario.direccion.trim(),
      });
    } catch (error) {
      setErrorPerfil(error.message ?? 'No se pudo guardar el perfil.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const enviarClaves = async (evento) => {
    evento.preventDefault();

    if (!claves.actual || !claves.nueva || !claves.confirmar) {
      setErrorClaves('Completa los tres campos de contraseña.');
      return;
    }

    if (claves.nueva.length < 6) {
      setErrorClaves('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (claves.nueva !== claves.confirmar) {
      setErrorClaves('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setGuardandoClaves(true);
    setErrorClaves('');

    try {
      await onCambiarContrasena(claves);
      setClaves({ actual: '', nueva: '', confirmar: '' });
    } catch (error) {
      setErrorClaves(error.message ?? 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardandoClaves(false);
    }
  };

  const cerrarSesion = async () => {
    setCerrando(true);
    try {
      await onCerrarSesion();
    } finally {
      setCerrando(false);
    }
  };

  return (
    <div className="client-settings">
      <section className="client-settings__card">
        <header>
          <span className="client-settings__icon">
            <i className="bi bi-person-lines-fill" aria-hidden="true" />
          </span>
          <div>
            <h2>Datos personales</h2>
            <p>Actualiza la información de tu cuenta.</p>
          </div>
        </header>

        {errorPerfil && (
          <Alert color="danger" className="client-alert" fade={false}>
            <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
            {errorPerfil}
          </Alert>
        )}

        <Form onSubmit={enviarPerfil}>
          <div className="client-form-grid">
            <div>
              <Label for="cliente-nombre">Nombre completo</Label>
              <Input
                id="cliente-nombre"
                value={formulario.nombre}
                onChange={actualizarCampo('nombre')}
                autoComplete="name"
              />
            </div>
            <div>
              <Label for="cliente-correo">Correo electrónico</Label>
              <Input
                id="cliente-correo"
                type="email"
                value={formulario.correo}
                onChange={actualizarCampo('correo')}
                autoComplete="email"
              />
            </div>
            <div>
              <Label for="cliente-telefono">Teléfono</Label>
              <Input
                id="cliente-telefono"
                value={formulario.telefono}
                onChange={actualizarCampo('telefono')}
                autoComplete="tel"
              />
            </div>
            <div>
              <Label for="cliente-direccion">Dirección residencial</Label>
              <Input
                id="cliente-direccion"
                value={formulario.direccion}
                onChange={actualizarCampo('direccion')}
                autoComplete="street-address"
              />
            </div>
          </div>

          <Button type="submit" color="primary" disabled={guardandoPerfil}>
            {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </Form>
      </section>

      <section className="client-settings__card">
        <header>
          <span className="client-settings__icon client-settings__icon--blue">
            <i className="bi bi-credit-card-2-front" aria-hidden="true" />
          </span>
          <div>
            <h2>Método de pago</h2>
            <p>Guarda tu método preferido para agilizar tus próximos pedidos.</p>
          </div>
        </header>

        {metodoPago ? (
          <div className="client-payment-summary">
            <span className="client-payment-summary__brand">
              <i
                className={`bi ${detalleMetodoPago(metodoPago.tipo).icono}`}
                aria-hidden="true"
              />
              {detalleMetodoPago(metodoPago.tipo).etiqueta}
            </span>
            {metodoPago.tipo === 'tarjeta' ? (
              <>
                <strong>Visa •••• {metodoPago.ultimos4}</strong>
                <span>{metodoPago.titular}</span>
                <span>Vence {metodoPago.vencimiento}</span>
              </>
            ) : metodoPago.tipo === 'efectivo' ? (
              <strong>Pago al recibir</strong>
            ) : (
              <strong>{metodoPago.identificador}</strong>
            )}
          </div>
        ) : (
          <p className="client-payment-empty">Aún no tienes un método de pago guardado.</p>
        )}

        {errorPago && (
          <Alert color="danger" className="client-alert" fade={false}>
            <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
            {errorPago}
          </Alert>
        )}

        <Form onSubmit={enviarPago}>
          <div className="client-form-grid">
            <div>
              <Label for="pago-tipo">Método</Label>
              <Input
                id="pago-tipo"
                type="select"
                value={pago.tipo}
                onChange={actualizarPago('tipo')}
              >
                {METODOS_PAGO.map((metodo) => (
                  <option key={metodo.id} value={metodo.id}>
                    {metodo.etiqueta}
                  </option>
                ))}
              </Input>
            </div>

            {pago.tipo === 'tarjeta' && (
              <>
                <div>
                  <Label>Marca</Label>
                  <div className="client-payment-brand">
                    <i className="bi bi-credit-card-2-front" aria-hidden="true" />
                    Visa
                  </div>
                </div>
                <div>
                  <Label for="pago-numero">Número de Visa</Label>
                  <Input
                    id="pago-numero"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    maxLength={23}
                    value={pago.numero}
                    onChange={actualizarPago('numero')}
                  />
                </div>
                <div>
                  <Label for="pago-titular">Titular</Label>
                  <Input
                    id="pago-titular"
                    autoComplete="cc-name"
                    value={pago.titular}
                    onChange={actualizarPago('titular')}
                  />
                </div>
                <div>
                  <Label for="pago-vencimiento">Vencimiento</Label>
                  <Input
                    id="pago-vencimiento"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={pago.vencimiento}
                    onChange={actualizarPago('vencimiento')}
                  />
                </div>
                <div>
                  <Label for="pago-cvv">CVV</Label>
                  <Input
                    id="pago-cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength={4}
                    value={pago.cvv}
                    onChange={actualizarPago('cvv')}
                  />
                </div>
              </>
            )}

            {(pago.tipo === 'bitcoin' || pago.tipo === 'chivo') && (
              <div>
                <Label for="pago-identificador">
                  {pago.tipo === 'bitcoin'
                    ? 'Dirección o etiqueta Bitcoin'
                    : 'Número o alias Chivo Wallet'}
                </Label>
                <Input
                  id="pago-identificador"
                  placeholder={pago.tipo === 'bitcoin' ? 'bc1q...' : '+503 7000 1234'}
                  value={pago.identificador}
                  onChange={actualizarPago('identificador')}
                />
              </div>
            )}
          </div>

          {pago.tipo === 'efectivo' && (
            <p className="client-payment-note">
              El pago se realiza en efectivo al recibir el pedido.
            </p>
          )}

          <p className="client-payment-note">
            Solo se guardan los datos necesarios del método elegido. El CVV nunca se almacena.
          </p>

          <Button type="submit" color="primary" outline disabled={guardandoPago}>
            {guardandoPago ? 'Guardando…' : 'Guardar método de pago'}
          </Button>
        </Form>
      </section>

      <section className="client-settings__card">
        <header>
          <span className="client-settings__icon client-settings__icon--gold">
            <i className="bi bi-shield-lock" aria-hidden="true" />
          </span>
          <div>
            <h2>Cambiar contraseña</h2>
            <p>Usa una contraseña segura y diferente a las anteriores.</p>
          </div>
        </header>

        {errorClaves && (
          <Alert color="danger" className="client-alert" fade={false}>
            <i className="bi bi-exclamation-circle me-2" aria-hidden="true" />
            {errorClaves}
          </Alert>
        )}

        <Form onSubmit={enviarClaves}>
          <div className="client-form-grid">
            <div>
              <Label for="clave-actual">Contraseña actual</Label>
              <Input
                id="clave-actual"
                type="password"
                value={claves.actual}
                onChange={actualizarClave('actual')}
                autoComplete="current-password"
              />
            </div>
            <div>
              <Label for="clave-nueva">Nueva contraseña</Label>
              <Input
                id="clave-nueva"
                type="password"
                value={claves.nueva}
                onChange={actualizarClave('nueva')}
                autoComplete="new-password"
              />
            </div>
            <div>
              <Label for="clave-confirmar">Confirmar contraseña</Label>
              <Input
                id="clave-confirmar"
                type="password"
                value={claves.confirmar}
                onChange={actualizarClave('confirmar')}
                autoComplete="new-password"
              />
            </div>
          </div>

          <Button type="submit" color="primary" outline disabled={guardandoClaves}>
            {guardandoClaves ? 'Actualizando…' : 'Actualizar contraseña'}
          </Button>
        </Form>
      </section>

      <section className="client-settings__card client-settings__card--danger">
        <header>
          <span className="client-settings__icon client-settings__icon--red">
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
          </span>
          <div>
            <h2>Cerrar sesión</h2>
            <p>Finaliza la sesión actual en este dispositivo.</p>
          </div>
        </header>

        {confirmandoSalida ? (
          <div className="client-settings__confirm">
            <p>¿Seguro que deseas cerrar sesión?</p>
            <div>
              <Button
                type="button"
                color="secondary"
                outline
                onClick={() => setConfirmandoSalida(false)}
                disabled={cerrando}
              >
                Cancelar
              </Button>
              <Button type="button" color="danger" onClick={cerrarSesion} disabled={cerrando}>
                {cerrando ? 'Cerrando…' : 'Sí, cerrar sesión'}
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" color="danger" outline onClick={() => setConfirmandoSalida(true)}>
            Cerrar sesión
          </Button>
        )}
      </section>
    </div>
  );
}
