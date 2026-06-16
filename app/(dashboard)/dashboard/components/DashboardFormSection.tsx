'use client';

import type { ReactNode } from 'react';
import {
  AgentDetailCard,
  type AgentDetailCardVariant,
} from '@/components/dashboard/AgentDetailCard';
import { cn } from '@/lib/utils';
import { accentBadgeClasses } from './dashboard-ui';

type DashboardFormSectionProps = {
  isDark: boolean;
  title: string;
  variant: AgentDetailCardVariant;
  accentHex: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerAction?: ReactNode;
};

export default function DashboardFormSection({
  isDark,
  title,
  variant,
  accentHex,
  children,
  className,
  contentClassName,
  headerAction,
}: DashboardFormSectionProps) {
  return (
    <AgentDetailCard
      isDark={isDark}
      variant={variant}
      accentHex={accentHex}
      className={cn('w-full', className)}
      contentClassName={cn(
        'flex flex-col gap-4 p-4 pt-14 sm:p-5 sm:pt-14',
        headerAction ? 'sm:pr-36' : '',
        contentClassName,
      )}
    >
      <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)]">
        <div className={accentBadgeClasses(isDark, accentHex)}>{title}</div>
      </div>
      {headerAction ? (
        <div className="absolute right-4 top-4 z-10">{headerAction}</div>
      ) : null}
      {children}
    </AgentDetailCard>
  );
}
