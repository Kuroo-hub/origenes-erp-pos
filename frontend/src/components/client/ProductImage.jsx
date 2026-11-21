export default function ProductImage({ variant = 'cafe', color = '#4096FF', nombre = '' }) {
  const formas = {
    cafe: (
      <>
        <path d="M27 36h35v20a17.5 17.5 0 0 1-35 0V36Z" fill="#141414" />
        <path d="M62 41h5a9 9 0 0 1 0 18h-5" fill="none" stroke="#141414" strokeWidth="5" />
        <path d="M26 72h38" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
        <path
          d="M38 30c0-4 5-5 5-9M50 30c0-4 5-5 5-9"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.9"
        />
      </>
    ),
    pastel: (
      <>
        <path d="M20 63 48 25l28 38H20Z" fill="#141414" />
        <path d="M27 63h42" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        <circle cx="48" cy="46" r="5" fill={color} />
        <circle cx="37" cy="55" r="3" fill={color} opacity="0.65" />
        <circle cx="59" cy="55" r="3" fill={color} opacity="0.65" />
      </>
    ),
    pan: (
      <>
        <path d="M18 61c9-19 51-19 60 0-9 11-51 11-60 0Z" fill="#141414" />
        <path
          d="M34 52c4 7 4 11 0 16M48 49c5 9 5 14 0 19M62 52c-4 7-4 11 0 16"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M22 64h52" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </>
    ),
    frio: (
      <>
        <path d="M32 24h32l-5 48H37l-5-48Z" fill="#141414" />
        <path d="M36 44h24" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <path d="M48 24V14" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
        <path d="M42 76h12" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
        <circle cx="57" cy="34" r="3" fill="#FFFFFF" opacity="0.7" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={nombre || 'Imagen del producto'}>
      <circle cx="48" cy="48" r="42" fill={color} opacity="0.16" />
      {formas[variant] ?? formas.cafe}
    </svg>
  );
}
