import ProductImage from './ProductImage';
import { formatearMoneda } from '../../clientMock.js';

export default function ProductCard({ producto, onAgregar }) {
  return (
    <article className="client-product-card">
      <div className="client-product-card__image">
        <ProductImage
          variant={producto.variant}
          color={producto.color}
          nombre={producto.nombre}
        />
        <span
          className={`client-product-card__badge ${
            producto.disponible ? 'is-available' : 'is-out'
          }`}
        >
          {producto.disponible ? 'Disponible' : 'Agotado'}
        </span>
      </div>

      <div className="client-product-card__body">
        <span className="client-product-card__category">{producto.categoria}</span>
        <h3 className="client-product-card__name">{producto.nombre}</h3>
        <p className="client-product-card__description">{producto.descripcion}</p>

        <div className="client-product-card__bottom">
          <strong className="client-product-card__price">
            {formatearMoneda(producto.precio)}
          </strong>
          <button
            type="button"
            className="client-add-button"
            onClick={() => onAgregar(producto)}
            disabled={!producto.disponible}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            <i className="bi bi-plus-lg" aria-hidden="true" />
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
