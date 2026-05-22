import { ReactNode } from 'react';
import SectionAnchor from './SectionAnchor';

type SectionTone = 'dark' | 'darker' | 'gold';

type SectionSurfaceProps = {
  id: string;
  tone?: SectionTone;
  children: ReactNode;
  className?: string;
  backgroundVideo?: string;
};

const toneBase: Record<SectionTone, string> = {
  dark: 'bg-zinc-950',
  darker: 'bg-black border-t border-gold/10',
  gold: 'bg-zinc-950',
};

export default function SectionSurface({
  id,
  tone = 'dark',
  children,
  className = '',
  backgroundVideo,
}: SectionSurfaceProps) {
  return (
    <SectionAnchor id={id} className={`relative overflow-hidden py-20 ${toneBase[tone]} ${className}`}>
      {backgroundVideo && (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.22]"
            aria-hidden
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/85 via-black/75 to-black/85"
            aria-hidden
          />
        </>
      )}
      {tone === 'dark' && (
        <div
          className="marketing-section-glow pointer-events-none absolute inset-0"
          aria-hidden
        />
      )}
      {tone === 'darker' && (
        <>
          <div
            className={`pointer-events-none absolute -right-1/4 -top-1/4 h-[50%] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.05)_0%,transparent_70%)] ${backgroundVideo ? 'z-[2] opacity-60' : ''}`}
            aria-hidden
          />
          <div
            className={`marketing-grid-bg pointer-events-none absolute inset-0 ${backgroundVideo ? 'z-[2] opacity-25' : 'opacity-40'}`}
            aria-hidden
          />
        </>
      )}
      {tone === 'gold' && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gold/5 to-transparent"
          aria-hidden
        />
      )}
      <div className="relative z-10">{children}</div>
    </SectionAnchor>
  );
}
