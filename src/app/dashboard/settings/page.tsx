'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
  Input,
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { DemoSeeder } from '@/components/DemoSeeder';

interface Prefs {
  refreshSeconds: number;
  density: 'comfortable' | 'compact';
  showStations: boolean;
  notifications: boolean;
  apiBase: string;
}

const DEFAULTS: Prefs = {
  refreshSeconds: 60,
  density: 'comfortable',
  showStations: false,
  notifications: true,
  apiBase: '',
};
const KEY = 'btmc:prefs';

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate local prefs from localStorage on mount */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt prefs */
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const update = <K extends keyof Prefs>(k: K, v: Prefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(prefs));
    toast.success('Settings saved on this device');
  };

  if (!loaded) return null;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <PageHeader
        title="Settings"
        description="Console preferences, stored locally on this device."
        icon={<SettingsIcon className="w-5 h-5" />}
        className="mb-5"
        actions={
          <Button size="sm" onClick={save}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Auto-refresh interval" hint="Seconds between live data refreshes">
              <Input
                type="number"
                min={10}
                max={600}
                value={prefs.refreshSeconds}
                onChange={(e) => update('refreshSeconds', Number(e.target.value))}
                className="w-24"
                aria-label="Auto-refresh interval in seconds"
              />
            </Row>
            <Row label="API base override" hint="Leave blank to use the built-in proxy">
              <Input
                value={prefs.apiBase}
                onChange={(e) => update('apiBase', e.target.value)}
                placeholder="/api/backend"
                className="w-full max-w-[220px]"
                aria-label="API base override"
              />
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row label="Density">
              <Select value={prefs.density} onValueChange={(v) => update('density', v as Prefs['density'])}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Show stations on map by default">
              <Switch
                checked={prefs.showStations}
                onCheckedChange={(v) => update('showStations', v)}
                aria-label="Show stations on map by default"
              />
            </Row>
            <Row label="Enable notifications">
              <Switch
                checked={prefs.notifications}
                onCheckedChange={(v) => update('notifications', v)}
                aria-label="Enable notifications"
              />
            </Row>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Demo data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-text-muted">
              Backend incidents and scheduled events are in-memory and reset on a cold start.
              Seed a reproducible scenario before a demo, or clear everything afterwards.
            </p>
            <DemoSeeder />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <div className="text-[11px] text-text-subtle">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
