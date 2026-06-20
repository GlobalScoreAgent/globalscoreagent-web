'use client';

import type { Translations } from '@/app/(dashboard)/dashboard/components/LanguageContext';
import {
  DistributionCarouselPanel,
  type DistributionCarouselSlide,
} from '@/components/dashboard/DistributionCarouselPanel';
import { cn } from '@/lib/utils';

export type ChainDistributionSlide = DistributionCarouselSlide & {
  id: 'humi' | 'meta' | 'wami';
};

type Props = {
  slides: ChainDistributionSlide[];
  chainKey: string;
  isDark: boolean;
  t: Translations;
  layout?: 'rail' | 'bottomCard';
  className?: string;
};

export function ChainDistributionPanel({ slides, chainKey, isDark, t, layout = 'bottomCard', className }: Props) {
  const isRail = layout === 'rail';

  return (
    <DistributionCarouselPanel
      slides={slides}
      resetKey={chainKey}
      panelTitle={t.chainSectionDistribution}
      prevLabel={t.chainDistributionPrev}
      nextLabel={t.chainDistributionNext}
      isDark={isDark}
      legendPlacement="bottom"
      stackedBarOrientation="vertical"
      className={cn(
        isRail
          ? 'lg:min-h-0 lg:w-[13rem] lg:self-stretch xl:w-[14rem]'
          : 'min-h-[260px] lg:min-h-0 lg:w-full lg:self-stretch',
        className,
      )}
    />
  );
}
