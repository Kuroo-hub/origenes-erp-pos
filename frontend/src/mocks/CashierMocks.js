
export const CATEGORIAS_CAJERO = [
  'Todos',
  'Cafés',
  'Pastelería',
  'Panadería',
  'Bebidas frías',
];

export const PRODUCTOS_CAJERO = [
  {
    id: 1,
    nombre: 'Café Americano',
    descripcion: 'Café espresso con agua caliente.',
    precio: 2.50,
    categoria: 'Cafés',
    disponible: true,
    imagen: 'bi-cup-hot',
    stock: 25,
  },
  {
    id: 2,
    nombre: 'Capuchino',
    descripcion: 'Espresso con leche espumada.',
    precio: 3.50,
    categoria: 'Cafés',
    disponible: true,
    imagen: 'bi-cup-hot-fill',
    stock: 18,
  },
  {
    id: 3,
    nombre: 'Latte',
    descripcion: 'Café espresso con leche.',
    precio: 3.75,
    categoria: 'Cafés',
    disponible: true,
    imagen: 'bi-cup',
    stock: 16,
  },
  {
    id: 4,
    nombre: 'Croissant',
    descripcion: 'Pan de hojaldre recién horneado.',
    precio: 2.50,
    categoria: 'Pastelería',
    disponible: true,
    imagen: 'bi-egg-fried',
    stock: 30,
  },
  {
    id: 5,
    nombre: 'Cheesecake',
    descripcion: 'Porción de pastel de queso.',
    precio: 3.50,
    categoria: 'Pastelería',
    disponible: true,
    imagen: 'bi-cake2',
    stock: 12,
  },
  {
    id: 6,
    nombre: 'Pan artesanal',
    descripcion: 'Pan elaborado de forma artesanal.',
    precio: 1.75,
    categoria: 'Panadería',
    disponible: true,
    imagen: 'bi-basket',
    stock: 22,
  },
  {
    id: 7,
    nombre: 'Limonada',
    descripcion: 'Bebida natural de limón.',
    precio: 2.00,
    categoria: 'Bebidas frías',
    disponible: true,
    imagen: 'bi-cup-straw',
    stock: 20,
  },
  {
    id: 8,
    nombre: 'Té frío',
    descripcion: 'Té frío refrescante.',
    precio: 2.25,
    categoria: 'Bebidas frías',
    disponible: false,
    imagen: 'bi-cup-straw',
    stock: 0,
  },
];

export const METODOS_PAGO_CAJERO = [
  { id: 'efectivo', etiqueta: 'Efectivo' },
  { id: 'tarjeta', etiqueta: 'Tarjeta' },
  { id: 'bitcoin', etiqueta: 'Bitcoin' },
  { id: 'chivo', etiqueta: 'Chivo Wallet' },
];

export const formatearMonedaCajero = (cantidad) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cantidad);
