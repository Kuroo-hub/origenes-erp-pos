import { Link } from 'react-router-dom';
import BrandMark from './BrandMark';

export default function Brand({
  size = 'md',
  withTagline = true,
  home = true,
  variant = 'dark',
}) {
  const content = (
    <>
      <BrandMark />

      <span className="brand__text">
        <span className="brand__line">
          <span className="brand__name">orígenes</span>
          <span className="brand__badge">SV</span>
        </span>
        {withTagline && <span className="brand__tagline">Raíces que conectan</span>}
      </span>
    </>
  );

  const className = `brand brand--${size} brand--${variant}`;

  if (!home) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link to="/" className={className} aria-label="Orígenes SV — ir al inicio">
      {content}
    </Link>
  );
}
