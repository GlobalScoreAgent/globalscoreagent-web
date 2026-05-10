'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function StackedDistributionBar({
  title,
  rowKeys,
  row,
  colors,
  labelForKey,
  isDark,
}: {
  title: string;
  rowKeys: string[];
  row: Record<string, number | string>;
  colors: (k: string) => string;
  labelForKey: (k: string) => string;
  isDark: boolean;
}) {
  const axisStroke = isDark ? '#52525b' : '#d4d4d8';
  const tickFill = isDark ? '#a1a1aa' : '#71717a';

  if (rowKeys.length === 0) return null;

  const total = rowKeys.reduce((s, k) => s + (Number(row[k]) || 0), 0);
  if (total <= 0) return null;

  return (
    <div className="space-y-1">
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
        {title}
      </p>
      <div className="h-14 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={[row]}
            margin={{ top: 2, right: 64, left: 4, bottom: 2 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} horizontal={false} />
            <XAxis type="number" stroke={axisStroke} tick={{ fill: tickFill, fontSize: 10 }} />
            <YAxis type="category" dataKey="name" width={1} hide />
            <Tooltip
              allowEscapeViewBox={{ x: true, y: true }}
              animationDuration={0}
              wrapperStyle={{ zIndex: 50 }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                return (
                  <div
                    className={`max-w-[min(100vw-2rem,22rem)] rounded-lg border px-2 py-1.5 text-xs shadow-md ${
                      isDark ? 'border-zinc-600 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
                    }`}
                  >
                    {payload.map((p) => (
                      <div key={String(p.dataKey)} className="tabular-nums break-words">
                        <span className="opacity-80">{labelForKey(String(p.dataKey))}: </span>
                        <span className="font-semibold">{Number(p.value).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                );
              }}
            />
            {rowKeys.map((k) => (
              <Bar key={k} dataKey={k} stackId="stack" fill={colors(k)} radius={[0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
