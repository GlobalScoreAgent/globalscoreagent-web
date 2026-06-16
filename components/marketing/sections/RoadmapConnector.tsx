'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

type RoadmapConnectorProps = {
  orientation: 'horizontal' | 'vertical';
};

export default function RoadmapConnector({ orientation }: RoadmapConnectorProps) {
  if (orientation === 'vertical') {
    return (
      <div className="flex justify-center py-2 lg:hidden" aria-hidden>
        <ChevronDown className="h-6 w-6 text-gold/50" />
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 items-center px-2 lg:flex" aria-hidden>
      <div className="h-px w-8 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <ChevronRight className="h-5 w-5 text-gold/60" />
      <div className="h-px w-8 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
