export const formatearMonedaCajero = (cantidad) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cantidad);
