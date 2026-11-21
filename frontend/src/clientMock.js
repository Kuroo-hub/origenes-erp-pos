// ARCHIVO TEMPORAL: datos y servicios simulados únicamente para las pruebas del módulo cliente.
// Se eliminará cuando se conecten los endpoints reales del ERP.

export const SECCIONES = [
  { id: 'menu', etiqueta: 'MENU_COMIDA', icono: 'bi-cup-hot' },
  { id: 'historial', etiqueta: 'HISTORIAL_PEDIDOS', icono: 'bi-clock-history' },
  { id: 'configuracion', etiqueta: 'CONFIGURACION', icono: 'bi-gear' },
];

export const METODOS_PAGO = [
  { id: 'efectivo', etiqueta: 'Efectivo', icono: 'bi-cash-coin' },
  { id: 'tarjeta', etiqueta: 'Tarjeta Visa', icono: 'bi-credit-card-2-front' },
  { id: 'bitcoin', etiqueta: 'Bitcoin', icono: 'bi-currency-bitcoin' },
  { id: 'chivo', etiqueta: 'Chivo Wallet', icono: 'bi-wallet2' },
];

export function detalleMetodoPago(tipo) {
  return METODOS_PAGO.find((metodo) => metodo.id === tipo) ?? METODOS_PAGO[0];
}

export const SUCURSALES = [
  {
    id: 'centro',
    nombre: 'Centro Histórico',
    direccion: 'Av. Libertad 123, San Salvador',
    codigo: 'SUC-01',
  },
  {
    id: 'mirador',
    nombre: 'Mirador',
    direccion: 'Calle El Mirador 45, Santa Tecla',
    codigo: 'SUC-02',
  },
  {
    id: 'plaza',
    nombre: 'Plaza Verde',
    direccion: 'Plaza Verde Local 8, Antiguo Cuscatlán',
    codigo: 'SUC-03',
  },
];

export const PRODUCTOS = [
  {
    id: 'centro-americano',
    sucursalId: 'centro',
    nombre: 'Café Americano',
    descripcion: 'Café de origen con agua caliente, balancedo y aromático.',
    precio: 2.75,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#4096FF',
  },
  {
    id: 'centro-latte',
    sucursalId: 'centro',
    nombre: 'Café Latte',
    descripcion: 'Espresso suave con leche cremosa y un toque de vainilla.',
    precio: 3.5,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#0958D9',
  },
  {
    id: 'centro-capuchino',
    sucursalId: 'centro',
    nombre: 'Capuchino',
    descripcion: 'Espresso, leche texturizada y espuma de cacao.',
    precio: 3.75,
    disponible: false,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#8C8C8C',
  },
  {
    id: 'centro-croissant',
    sucursalId: 'centro',
    nombre: 'Croissant de mantequilla',
    descripcion: 'Hojaldre dorado, crujiente por fuera y tierno por dentro.',
    precio: 2.9,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#0958D9',
  },
  {
    id: 'centro-pastel-chocolate',
    sucursalId: 'centro',
    nombre: 'Pastel de chocolate',
    descripcion: 'Porción de bizcocho húmedo con ganache de chocolate 70%.',
    precio: 4.2,
    disponible: true,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#4096FF',
  },
  {
    id: 'centro-jugo-naranja',
    sucursalId: 'centro',
    nombre: 'Jugo de naranja',
    descripcion: 'Naranjas frescas exprimidas al momento, sin azúcar agregada.',
    precio: 3.1,
    disponible: true,
    categoria: 'Bebidas frías',
    variant: 'frio',
    color: '#0958D9',
  },
  {
    id: 'centro-sandwich',
    sucursalId: 'centro',
    nombre: 'Sándwich de jamón',
    descripcion: 'Pan artesanal, jamón, queso y vegetales frescos.',
    precio: 5.8,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#4096FF',
  },
  {
    id: 'centro-cookie',
    sucursalId: 'centro',
    nombre: 'Cookie de chispas',
    descripcion: 'Galleta casera con chispas de chocolate y sal marina.',
    precio: 1.95,
    disponible: true,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#8C8C8C',
  },
  {
    id: 'mirador-espresso',
    sucursalId: 'mirador',
    nombre: 'Espresso doble',
    descripcion: 'Dose doble de nuestro blend de tueste medio, corto e intenso.',
    precio: 2.5,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#4096FF',
  },
  {
    id: 'mirador-flat-white',
    sucursalId: 'mirador',
    nombre: 'Flat White',
    descripcion: 'Espresso con microespuma de leche, textura sedosa.',
    precio: 3.8,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#0958D9',
  },
  {
    id: 'mirador-frappe',
    sucursalId: 'mirador',
    nombre: 'Frappé de café',
    descripcion: 'Café frío batido con hielo, leche y crema batida.',
    precio: 4.6,
    disponible: true,
    categoria: 'Bebidas frías',
    variant: 'frio',
    color: '#8C8C8C',
  },
  {
    id: 'mirador-muffin',
    sucursalId: 'mirador',
    nombre: 'Muffin de arándanos',
    descripcion: 'Muffin esponjoso con arándanos frescos y azúcar moreno.',
    precio: 3.2,
    disponible: true,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#8C8C8C',
  },
  {
    id: 'mirador-bagel',
    sucursalId: 'mirador',
    nombre: 'Bagel de queso',
    descripcion: 'Bagel tostado con queso crema y cebollín.',
    precio: 3.4,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#0958D9',
  },
  {
    id: 'mirador-limonada',
    sucursalId: 'mirador',
    nombre: 'Limonada con menta',
    descripcion: 'Limón fresco, menta y un toque de miel.',
    precio: 2.8,
    disponible: true,
    categoria: 'Bebidas frías',
    variant: 'frio',
    color: '#4096FF',
  },
  {
    id: 'mirador-caramelo',
    sucursalId: 'mirador',
    nombre: 'Pastel de caramelo',
    descripcion: 'Bizcocho de vainilla con salsa de caramelo salado.',
    precio: 4.5,
    disponible: false,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#0958D9',
  },
  {
    id: 'mirador-panini',
    sucursalId: 'mirador',
    nombre: 'Panini de pavo',
    descripcion: 'Pavo, queso provolone y mostaza en pan prensado.',
    precio: 5.5,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#4096FF',
  },
  {
    id: 'plaza-cortado',
    sucursalId: 'plaza',
    nombre: 'Café Cortado',
    descripcion: 'Espresso con una pequeña cantidad de leche tibia.',
    precio: 2.6,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#0958D9',
  },
  {
    id: 'plaza-mocha',
    sucursalId: 'plaza',
    nombre: 'Mocha',
    descripcion: 'Espresso, chocolate oscuro y leche espumosa.',
    precio: 4.1,
    disponible: true,
    categoria: 'Bebidas calientes',
    variant: 'cafe',
    color: '#8C8C8C',
  },
  {
    id: 'plaza-te-helado',
    sucursalId: 'plaza',
    nombre: 'Té helado de durazno',
    descripcion: 'Té negro endulzado naturalmente con durazno.',
    precio: 3.9,
    disponible: true,
    categoria: 'Bebidas frías',
    variant: 'frio',
    color: '#0958D9',
  },
  {
    id: 'plaza-dona',
    sucursalId: 'plaza',
    nombre: 'Dona de canela',
    descripcion: 'Dona esponjosa con azúcar y canela.',
    precio: 2.4,
    disponible: true,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#4096FF',
  },
  {
    id: 'plaza-croissant-almendra',
    sucursalId: 'plaza',
    nombre: 'Croissant de almendra',
    descripcion: 'Hojaldre relleno de crema de almendra y almendras laminadas.',
    precio: 3.3,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#0958D9',
  },
  {
    id: 'plaza-jugo-mango',
    sucursalId: 'plaza',
    nombre: 'Jugo de mango',
    descripcion: 'Mango maduro licuado con un toque de jengibre.',
    precio: 3.25,
    disponible: true,
    categoria: 'Bebidas frías',
    variant: 'frio',
    color: '#0958D9',
  },
  {
    id: 'plaza-brownie',
    sucursalId: 'plaza',
    nombre: 'Brownie con nueces',
    descripcion: 'Brownie denso de chocolate con nueces tostadas.',
    precio: 3.6,
    disponible: false,
    categoria: 'Repostería',
    variant: 'pastel',
    color: '#8C8C8C',
  },
  {
    id: 'plaza-tostada',
    sucursalId: 'plaza',
    nombre: 'Tostada de aguacate',
    descripcion: 'Pan de masa madre, aguacate, huevo y semillas.',
    precio: 4.8,
    disponible: true,
    categoria: 'Panadería',
    variant: 'pan',
    color: '#4096FF',
  },
];

export const PEDIDOS = [
  {
    id: 'PED-0008',
    fecha: '2026-11-18T14:32:00.000Z',
    sucursal: 'Centro Histórico',
    estado: 'Entregado',
    metodoPago: 'tarjeta',
    total: 12.05,
    items: [
      { nombre: 'Café Latte', cantidad: 2, precioUnitario: 3.5, subtotal: 7 },
      { nombre: 'Cookie de chispas', cantidad: 1, precioUnitario: 1.95, subtotal: 1.95 },
      { nombre: 'Jugo de naranja', cantidad: 1, precioUnitario: 3.1, subtotal: 3.1 },
    ],
  },
  {
    id: 'PED-0007',
    fecha: '2026-11-12T09:15:00.000Z',
    sucursal: 'Mirador',
    estado: 'Entregado',
    metodoPago: 'efectivo',
    total: 10,
    items: [
      { nombre: 'Flat White', cantidad: 1, precioUnitario: 3.8, subtotal: 3.8 },
      { nombre: 'Bagel de queso', cantidad: 1, precioUnitario: 3.4, subtotal: 3.4 },
      { nombre: 'Limonada con menta', cantidad: 1, precioUnitario: 2.8, subtotal: 2.8 },
    ],
  },
  {
    id: 'PED-0005',
    fecha: '2026-10-28T11:05:00.000Z',
    sucursal: 'Centro Histórico',
    estado: 'Entregado',
    metodoPago: 'bitcoin',
    total: 15.5,
    items: [
      { nombre: 'Café Americano', cantidad: 2, precioUnitario: 2.75, subtotal: 5.5 },
      { nombre: 'Pastel de chocolate', cantidad: 1, precioUnitario: 4.2, subtotal: 4.2 },
      { nombre: 'Sándwich de jamón', cantidad: 1, precioUnitario: 5.8, subtotal: 5.8 },
    ],
  },
];

export const PERFIL = {
  nombre: 'Ana Morales',
  correo: 'ana.morales@origenes.dev',
  telefono: '+503 7000 1234',
  direccion: 'Calle Laurel 12, San Salvador',
};

export const METODO_PAGO = {
  tipo: 'tarjeta',
  marca: 'Visa',
  ultimos4: '4242',
  titular: 'Ana Morales',
  vencimiento: '09/28',
  identificador: '',
};

const RETARDO_SIMULADO = 450;
const formatoMoneda = new Intl.NumberFormat('es-SV', {
  style: 'currency',
  currency: 'USD',
});

let pedidos = [...PEDIDOS];
let perfil = { ...PERFIL };
let metodoPago = METODO_PAGO ? { ...METODO_PAGO } : null;

function responder(datos) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(datos), RETARDO_SIMULADO);
  });
}

export function formatearMoneda(valor) {
  return formatoMoneda.format(valor);
}

export function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-SV', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(fecha));
}

export function calcularTotales(items, productos) {
  const detallados = items.map((item) => {
    const producto = productos.find((entrada) => entrada.id === item.productoId);
    const precioUnitario = producto?.precio ?? 0;

    return {
      productoId: item.productoId,
      nombre: producto?.nombre ?? 'Producto no disponible',
      cantidad: item.cantidad,
      precioUnitario,
      subtotal: precioUnitario * item.cantidad,
      variant: producto?.variant ?? 'cafe',
      color: producto?.color ?? '#4096FF',
    };
  });

  const subtotal = detallados.reduce((acumulado, item) => acumulado + item.subtotal, 0);
  const cantidadTotal = detallados.reduce((acumulado, item) => acumulado + item.cantidad, 0);

  return { items: detallados, subtotal, total: subtotal, cantidadTotal };
}

export function obtenerSucursales() {
  return responder(SUCURSALES.map((sucursal) => ({ ...sucursal })));
}

export function obtenerProductos(sucursalId) {
  return responder(
    PRODUCTOS.filter((producto) => producto.sucursalId === sucursalId).map((producto) => ({
      ...producto,
    }))
  );
}

export function obtenerPedidos() {
  const confirmados = pedidos.filter((pedido) => pedido.estado !== 'Cancelado');
  return responder(confirmados.map((pedido) => ({ ...pedido, items: [...pedido.items] })));
}

export function obtenerPerfil() {
  return responder({ ...perfil });
}

export function guardarPerfil(datos) {
  perfil = { ...perfil, ...datos };
  return responder({ ...perfil });
}

export function obtenerMetodoPago() {
  return responder(metodoPago ? { ...metodoPago } : null);
}

export function guardarMetodoPago(datos) {
  const base = {
    tipo: datos.tipo,
    marca: '',
    ultimos4: '',
    titular: '',
    vencimiento: '',
    identificador: '',
  };

  if (datos.tipo === 'tarjeta') {
    const numero = datos.numero.replace(/\D/g, '');
    metodoPago = {
      ...base,
      marca: 'Visa',
      ultimos4: numero.slice(-4),
      titular: datos.titular.trim(),
      vencimiento: datos.vencimiento.trim(),
    };
  } else if (datos.tipo === 'bitcoin' || datos.tipo === 'chivo') {
    metodoPago = { ...base, identificador: datos.identificador.trim() };
  } else {
    metodoPago = base;
  }

  return responder({ ...metodoPago });
}

export function cambiarContrasena() {
  return responder({ ok: true });
}

export function confirmarPedido({ sucursal, items, total, metodoPago: metodo }) {
  const ultimoNumero = pedidos.reduce((maximo, pedido) => {
    const numero = Number(pedido.id.replace('PED-', ''));
    return Number.isNaN(numero) ? maximo : Math.max(maximo, numero);
  }, 0);

  const pedido = {
    id: `PED-${String(ultimoNumero + 1).padStart(4, '0')}`,
    fecha: new Date().toISOString(),
    sucursal,
    estado: 'En preparación',
    metodoPago: metodo ?? 'efectivo',
    total,
    items: items.map((item) => ({ ...item })),
  };

  pedidos = [pedido, ...pedidos];
  return responder({ ...pedido, items: [...pedido.items] });
}

export function cerrarSesion() {
  return responder({ ok: true });
}
