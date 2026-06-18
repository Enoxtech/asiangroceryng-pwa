import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #c41e3a 0%, #8B1429 55%, #1a1209 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background circles */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(0,188,212,0.15)',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }} />

        {/* Emoji row */}
        <div style={{ fontSize: 72, marginBottom: 24, display: 'flex', gap: 16 }}>
          <span>🥢</span><span>🍜</span><span>🧋</span><span>🍱</span>
        </div>

        {/* Brand */}
        <h1 style={{
          color: 'white', fontSize: 64, fontWeight: 900,
          margin: '0 0 16px', textAlign: 'center', lineHeight: 1.1,
          textShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          Asian Grocery NG
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.82)', fontSize: 26,
          margin: '0 0 36px', textAlign: 'center', maxWidth: 700,
        }}>
          Exploring Asia Through Food — Korean, Japanese, Chinese & Thai groceries delivered across Nigeria
        </p>

        {/* CTA pill */}
        <div style={{
          padding: '14px 40px',
          background: 'rgba(255,255,255,0.18)',
          borderRadius: 60,
          border: '2px solid rgba(255,255,255,0.40)',
          color: 'white',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 1,
        }}>
          Shop Now · asiangroceryng.com
        </div>
      </div>
    ),
    { ...size }
  );
}
