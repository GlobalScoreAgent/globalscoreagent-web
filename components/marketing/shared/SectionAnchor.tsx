import { ReactNode } from 'react';

type SectionAnchorProps = {
  id: string;
  children: ReactNode;
  className?: string;
};

export default function SectionAnchor({ id, children, className = '' }: SectionAnchorProps) {
  return (
    <section id={id} className={`scroll-mt-24 ${className}`}>
      {children}
    </section>
  );
}


