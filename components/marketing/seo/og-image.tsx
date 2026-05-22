import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

type OgImageProps = {
  title: string;
  subtitle?: string;
};

export function buildOgImageElement({ title, subtitle }: OgImageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #09090b 0%, #1c1917 45%, #09090b 100%)',
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 26,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#d4af37',
          marginBottom: 20,
        }}
      >
        Global Score Agent · ERC-8004
      </div>
      <div
        style={{
          fontSize: 58,
          fontWeight: 700,
          color: '#fafafa',
          lineHeight: 1.15,
          maxWidth: 1000,
        }}
      >
        {title}
      </div>
      {subtitle ? (
        <div
          style={{
            fontSize: 26,
            color: '#a1a1aa',
            marginTop: 28,
            lineHeight: 1.4,
            maxWidth: 920,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
}

export default function renderOgImage(props: OgImageProps) {
  return new ImageResponse(buildOgImageElement(props), { ...ogSize });
}
