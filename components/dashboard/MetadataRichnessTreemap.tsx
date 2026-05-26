'use client';

import { Treemap, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export type MetadataTreemapDatum = {
  name: string;
  value: number;
  fill: string;
  slug: string;
  rawKey: string;
  isRemaining?: boolean;
};

type TreemapContentProps = MetadataTreemapDatum & {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
};

function snapRect(x: number, y: number, width: number, height: number) {
  const ix = Math.round(x);
  const iy = Math.round(y);
  const iw = Math.max(1, Math.round(width));
  const ih = Math.max(1, Math.round(height));
  return { ix, iy, iw, ih };
}

function TreemapCellLabel({
  name,
  width,
  height,
  isRemaining,
}: {
  name: string;
  width: number;
  height: number;
  isRemaining?: boolean;
}) {
  const showLabel = width >= 36 && height >= 20;
  if (!showLabel) return null;

  const textClass = isRemaining ? 'text-zinc-100' : 'text-white';

  return (
    <div
      xmlns="http://www.w3.org/1999/xhtml"
      className={cn(
        'box-border flex h-full w-full flex-col items-start justify-start px-2 pt-2 pb-1 text-left pointer-events-none select-none antialiased',
        textClass,
      )}
      style={{ fontFamily: 'inherit' }}
    >
      <span className="block w-full truncate text-[11px] font-semibold leading-tight">
        {name}
      </span>
    </div>
  );
}

function TreemapCell(props: TreemapContentProps) {
  const { x, y, width, height, name, fill, isRemaining } = props;
  if (width < 2 || height < 2) return null;

  const { ix, iy, iw, ih } = snapRect(x, y, width, height);
  const stroke = isRemaining ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)';
  const showOverlay = iw >= 36 && ih >= 20;

  return (
    <g>
      <rect
        x={ix}
        y={iy}
        width={iw}
        height={ih}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        rx={4}
        ry={4}
      />
      {showOverlay ? (
        <foreignObject x={ix} y={iy} width={iw} height={ih} className="overflow-hidden">
          <TreemapCellLabel
            name={name}
            width={iw}
            height={ih}
            isRemaining={isRemaining}
          />
        </foreignObject>
      ) : null}
    </g>
  );
}

type Props = {
  data: MetadataTreemapDatum[];
  isDark: boolean;
  className?: string;
};

export function MetadataRichnessTreemap({ data, isDark, className }: Props) {
  if (data.length === 0) return null;

  return (
    <div
      className={cn(
        'h-full min-h-[11rem] w-full min-w-0 flex-1 [&_svg]:shape-rendering-geometricPrecision',
        className,
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="value"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke={isDark ? '#27272a' : '#fafafa'}
          isAnimationActive={false}
          isUpdateAnimationActive={false}
          content={(nodeProps) => (
            <TreemapCell {...(nodeProps as TreemapContentProps)} />
          )}
        />
      </ResponsiveContainer>
    </div>
  );
}

export const METADATA_REMAINING_SLUG = '__remaining__';
export const METADATA_REMAINING_RAW_KEY = 'remaining';
