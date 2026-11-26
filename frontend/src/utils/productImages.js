
const PRODUCT_IMAGES = {
  'pollo a la plancha': 'pollo-a-la-plancha.jpg',
  'hamburguesa clasica': 'hamburguesa-clasica.jpg',
  'carne asada con papas': 'carne-asada-con-papas.jpg',
  'tacos de carne': 'tacos-carne.jpg',
  'camaron al ajillo': 'camaron-al-ajillo.jpg',
  'desayuno tipico salvadoreno': 'desayuno-tipico.jpg',
  'omelette': 'omelette.jpg',
  'lomo de cerdo': 'lomo-cerdo-con-papas.jpg',
  'limonada': 'limonada.jpg',
  'jugo naranja': 'jugo-de-naranja.jpg',
  'horchata salvadorena': 'horchata-salvadorena.jpg',
  'batido de fresa': 'batido-de-fresa.jpg',
  'pastel de chocolate': 'pastel-chocolate.jpg',
  'flan': 'flan.jpg',
  'cheesecake fresa': 'cheesecake-de-fresa.jpg',
};

function normalizarNombre(nombre) {
  return String(nombre ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getProductImage(productName) {
  const filename = PRODUCT_IMAGES[normalizarNombre(productName)];

  return filename
    ? `/images/products/${filename}`
    : null;
}
