'use client';

import { useMemo, useState } from 'react';
import { BarChart2, Target, TrendingUp, Database, Gauge } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from 'recharts';
import { useAnalyticsSummary, useCorridorHistory } from '@/lib/queries';
import {
  PageHeader,
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  ErrorState,
} from '@/components/ui';

export default function AnalyticsPage() {
  const summaryQ = useAnalyticsSummary();
  const summary = summaryQ.data;

  const freq = summary?.corridors_by_historical_frequency ?? [];
  const topFreq = freq.slice(0, 10).map((f) => ({ corridor: f.corridor, events: f.total_historical_events }));

  const [corridor, setCorridor] = useState<string | null>(null);
  const activeCorridor = corridor ?? freq[0]?.corridor ?? null;
  const historyQ = useCorridorHistory(activeCorridor);

  // Weekly aggregation keeps the 1200+ raw 3-hourly bins readable.
  const weekly = useMemo(() => {
    const bins = historyQ.data?.history ?? [];
    const map = new Map<string, number>();
    for (const b of bins) {
      const d = new Date(b.bin_start);
      if (Number.isNaN(d.getTime())) continue;
      const key = format(startOfWeek(d), 'yyyy-MM-dd');
      map.set(key, (map.get(key) ?? 0) + b.event_count);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ week: format(new Date(k), 'dd MMM'), events: v }));
  }, [historyQ.data]);

  const m = summary?.model_metrics;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Analytics"
        description="Validated model performance and historical incident patterns."
        icon={<BarChart2 className="w-5 h-5" />}
        className="mb-5"
      />

      {summaryQ.isError ? (
        <Card><ErrorState onRetry={() => summaryQ.refetch()} /></Card>
      ) : (
        <>
          {/* Validated model metrics — the honest pitch numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-5">
            <StatCard label="AUC-ROC" value={m ? m.auc_roc.toFixed(3) : '—'} tone="success" icon={<Target className="w-5 h-5" />} loading={summaryQ.isLoading} hint="Ranking quality" />
            <StatCard label="PR-AUC" value={m ? m.pr_auc.toFixed(3) : '—'} icon={<Gauge className="w-5 h-5" />} loading={summaryQ.isLoading} hint={m ? `baseline ${m.random_baseline_pr_auc.toFixed(3)}` : undefined} />
            <StatCard label="Lift over baseline" value={m ? `${m.lift_over_baseline.toFixed(2)}×` : '—'} tone="success" icon={<TrendingUp className="w-5 h-5" />} loading={summaryQ.isLoading} hint="vs random" />
            <StatCard label="Training rows" value={summary ? summary.historical_data_range.total_rows.toLocaleString() : '—'} icon={<Database className="w-5 h-5" />} loading={summaryQ.isLoading} hint={summary ? `${summary.historical_data_range.start.slice(0, 10)} → ${summary.historical_data_range.end.slice(0, 10)}` : undefined} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {/* Historical frequency */}
            <Card>
              <CardHeader>
                <CardTitle>Corridors by historical incident frequency</CardTitle>
              </CardHeader>
              <CardContent>
                {summaryQ.isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={288}>
                    <BarChart layout="vertical" data={topFreq} margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis type="category" dataKey="corridor" width={120} tick={{ fontSize: 10, fill: '#6B7280' }} />
                      <RTooltip />
                      <Bar dataKey="events" fill="#727038" radius={[0, 4, 4, 0]} name="Historical events" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Per-corridor trend */}
            <Card>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle>Incident trend</CardTitle>
                <select
                  value={activeCorridor ?? ''}
                  onChange={(e) => setCorridor(e.target.value)}
                  className="appearance-none bg-card-bg border border-border-strong text-foreground text-xs font-semibold rounded-lg px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring max-w-[160px]"
                >
                  {freq.map((f) => (
                    <option key={f.corridor} value={f.corridor}>{f.corridor}</option>
                  ))}
                </select>
              </CardHeader>
              <CardContent>
                {summaryQ.isLoading || historyQ.isLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : historyQ.isError ? (
                  <ErrorState onRetry={() => historyQ.refetch()} />
                ) : (
                  <ResponsiveContainer width="100%" height={288}>
                    <LineChart data={weekly} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6B7280' }} interval="preserveStartEnd" minTickGap={24} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <RTooltip />
                      <Line type="monotone" dataKey="events" stroke="#727038" strokeWidth={2} dot={false} name="Events/week" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <p className="text-[11px] text-text-subtle mt-4">
            Metrics are validated on held-out historical data
            {summary ? ` (${summary.historical_data_range.total_rows.toLocaleString()} rows)` : ''}.
            Forecasts beyond the training window collapse to a seasonal baseline.
          </p>
        </>
      )}
    </div>
  );
}
