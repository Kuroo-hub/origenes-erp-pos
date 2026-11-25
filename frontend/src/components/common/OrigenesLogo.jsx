import React from 'react';

const OrigenesLogo = ({ size = 36 }) => {
  return (
    <img
      src="/logo-origenes.png"
      alt="Logo Restaurante Orígenes SV"
      width={size}
      height={size}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: '10px',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
};

export default OrigenesLogo;