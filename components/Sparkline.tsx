'use client';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/integrations/supabase';

type Props = {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  userId?: string | null;
  metric?: 'bench' | 'squat' | 'deadlift';
};

export default function Sparkline({ values, width = 160, height = 40, stroke = '#5B8CFF', strokeWidth = 2, fill = 'none', userId, metric }: Props) {
  const [history, setHistory] = useState<number[] | null>(null);

  useEffect(() => {
    if (!userId || !metric) return;
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from('pr_history')
          .select(metric)
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        if (Array.isArray(data)) {
          setHistory(data.map((row: Record<string, unknown>) => Number(row[metric] || 0)).filter(Boolean));
        }
      } catch {
        setHistory(null);
      }
    })();
  }, [userId, metric]);

  const series = useMemo(() => {
    const arr = history ?? values;
    return Array.isArray(arr) && arr.length > 0 ? arr : [];
  }, [history, values]);

  if (!series || series.length === 0) return <svg width={width} height={height} />;

  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const stepX = width / Math.max(1, series.length - 1);
  const points = series
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


