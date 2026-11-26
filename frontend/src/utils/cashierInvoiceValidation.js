import { METODOS_PAGO_CAJERO } from '../constants/paymentMethods.js';

export const TIEMPOS_PREPARACION = [10, 15, 20, 30];
export const TIPOS_ENTREGA_VALIDOS = ['local', 'domicilio'];

const METODOS_PAGO_VALIDOS = METODOS_PAGO_CAJERO.map((metodo) => metodo.id);

function texto(valor) {
  return String(valor ?? '').trim();
}

function esNombreValido(valor) {
  return /^[\p{L}][\p{L}\p{M}\s.'-]*$/u.test(valor);
}

function esTelefonoValido(valor) {
  const digitos = valor.replace(/\D/g, '');
  return /^[+()\d\s-]+$/.test(valor) && digitos.length >= 7 && digitos.length <= 15;
}

/**
 * Valida todos los campos visibles del formulario de facturación del cajero.
 * Devuelve un objeto de errores por campo; vacío cuando la factura se puede emitir.
 */
export function validarFacturaCajero({
  cliente,
  entrega,
  tiempoPreparacion,
  metodoPago,
  referenciaPago,
}) {
  const errores = {};

  const nombre = texto(cliente);
  if (!nombre) {
    errores.cliente = 'El nombre del cliente es obligatorio.';
  } else if (nombre.length < 3) {
    errores.cliente = 'Escribe el nombre completo del cliente (mínimo 3 caracteres).';
  } else if (!esNombreValido(nombre)) {
    errores.cliente = 'El nombre solo debe contener letras, espacios, puntos y guiones.';
  }

  const tipoEntrega = texto(entrega?.tipo);
  if (!TIPOS_ENTREGA_VALIDOS.includes(tipoEntrega)) {
    errores.tipoEntrega = 'Selecciona el tipo de orden.';
  }

  if (tipoEntrega === 'domicilio') {
    const direccion = texto(entrega?.direccion);
    if (!direccion) {
      errores.direccion = 'La dirección de entrega es obligatoria.';
    } else if (direccion.length < 5 || !/[\p{L}]/u.test(direccion)) {
      errores.direccion = 'Escribe una dirección válida (mínimo 5 caracteres).';
    }

    const numeroCasa = texto(entrega?.numeroCasa);
    if (!numeroCasa) {
      errores.numeroCasa = 'El número de casa es obligatorio.';
    } else if (!/^[A-Za-z0-9#\-.\s]{1,20}$/.test(numeroCasa)) {
      errores.numeroCasa = 'El número de casa solo admite letras, números, #, - y .';
    }

    const telefono = texto(entrega?.telefono);
    if (!telefono) {
      errores.telefono = 'El teléfono de entrega es obligatorio.';
    } else if (!esTelefonoValido(telefono)) {
      errores.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos).';
    }
  }

  if (!TIEMPOS_PREPARACION.includes(Number(tiempoPreparacion))) {
    errores.tiempoPreparacion = 'Selecciona el tiempo estimado de preparación.';
  }

  const metodo = texto(metodoPago);
  if (!METODOS_PAGO_VALIDOS.includes(metodo)) {
    errores.metodoPago = 'Selecciona un método de pago.';
  } else if (metodo !== 'efectivo') {
    const referencia = texto(referenciaPago);
    if (!referencia) {
      errores.referenciaPago = 'La referencia del pago es obligatoria para este método.';
    } else if (referencia.length < 3) {
      errores.referenciaPago = 'La referencia debe tener al menos 3 caracteres.';
    }
  }

  return errores;
}
