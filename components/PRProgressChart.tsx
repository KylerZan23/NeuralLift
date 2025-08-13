'use client';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type HistoryRow = { created_at: string; bench: number | null; squat: number | null; deadlift: number | null };

export default function PRProgressChart() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: auth } = await supabase.auth.getUser();
        const userId = auth.user?.id;
        if (!userId) {
          setRows([]);
          setLoading(false);
          return;
        }
        const { data, error: err } = await supabase
          .from('pr_history')
          .select('created_at, bench, squat, deadlift')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });
        if (err) throw new Error(err.message);
        setRows((data as any[]) as HistoryRow[]);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const series = useMemo(() => {
    const timestamps = rows.map(r => new Date(r.created_at).getTime());
    const bench = rows.map(r => (r.bench ?? 0) as number).filter(v => v > 0);
    const squat = rows.map(r => (r.squat ?? 0) as number).filter(v => v > 0);
    const deadlift = rows.map(r => (r.deadlift ?? 0) as number).filter(v => v > 0);
    const allVals = rows.flatMap(r => [r.bench ?? 0, r.squat ?? 0, r.deadlift ?? 0]).filter(v => v > 0) as number[];
    const minX = timestamps.length ? Math.min(...timestamps) : 0;
    const maxX = timestamps.length ? Math.max(...timestamps) : 1;
    const minY = allVals.length ? Math.min(...allVals) : 0;
    const maxY = allVals.length ? Math.max(...allVals) : 1;
    return { timestamps, bench, squat, deadlift, minX, maxX, minY, maxY };
  }, [rows]);

  const width = 720;
  const height = 260;
  const padding = { top: 10, right: 12, bottom: 24, left: 36 };

  const scaleX = (t: number) => {
    if (series.maxX === series.minX) return padding.left + (width - padding.left - padding.right) / 2;
    return padding.left + ((t - series.minX) / (series.maxX - series.minX)) * (width - padding.left - padding.right);
  };
  const scaleY = (v: number) => {
    if (series.maxY === series.minY) return height - padding.bottom - (height - padding.top - padding.bottom) / 2;
    return height - padding.bottom - ((v - series.minY) / (series.maxY - series.minY)) * (height - padding.top - padding.bottom);
  };

  const buildPath = (key: 'bench' | 'squat' | 'deadlift', color: string) => {
    const pts: Array<[number, number]> = rows
      .map((r) => ({ t: new Date(r.created_at).getTime(), v: Number((r as any)[key] || 0) }))
      .filter(p => p.v > 0)
      .map(p => [scaleX(p.t), scaleY(p.v)]);
    if (pts.length === 0) return null;
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
    return <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">PR Progress</h3>
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: '#5B8CFF' }} /> Bench</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: '#10B981' }} /> Squat</span>
          <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: '#F59E0B' }} /> Deadlift</span>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <div className="h-[260px] grid place-items-center text-gray-500">Loading…</div>
        ) : error ? (
          <div className="h-[260px] grid place-items-center text-gray-500">{error}</div>
        ) : rows.length === 0 ? (
          <div className="h-[260px] grid place-items-center text-gray-500">No PR history yet</div>
        ) : (
          <svg width={width} height={height} role="img" aria-label="PR progress chart">
            {/* axes */}
            <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" />
            <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e5e7eb" />
            {/* gridlines y */}
            {Array.from({ length: 4 }, (_, i) => {
              const y = padding.top + ((i + 1) / 5) * (height - padding.top - padding.bottom);
              return <line key={i} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#f3f4f6" />;
            })}
            {/* paths */}
            {buildPath('bench', '#5B8CFF')}
            {buildPath('squat', '#10B981')}
            {buildPath('deadlift', '#F59E0B')}
          </svg>
        )}
      </div>
    </div>
  );
}


