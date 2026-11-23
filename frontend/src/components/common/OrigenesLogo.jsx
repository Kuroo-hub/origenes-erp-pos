import React from 'react';

const OrigenesLogo = ({ size = 38 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '10px',
        backgroundColor: '#eff6ff',
        border: '1px solid #dbeafe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        flexShrink: 0,
      }}
    >
      <img
        src="/logo-origenes.svg"
        alt="Logo Restaurante Orígenes SV"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default OrigenesLogo;