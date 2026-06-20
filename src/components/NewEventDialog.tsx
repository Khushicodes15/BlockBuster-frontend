'use client';

import { useState } from 'react';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { useCorridors, useCreateEvent } from '@/lib/queries';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogClose,
  Button,
  Input,
} from './ui';

const EVENT_TYPES = ['roadwork', 'vip', 'event', 'maintenance', 'protest'];

function localPlusHours(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  // datetime-local wants YYYY-MM-DDTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewEventDialog() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [eventType, setEventType] = useState('roadwork');
  const [start, setStart] = useState(() => localPlusHours(2));
  const [end, setEnd] = useState(() => localPlusHours(6));
  const [capacityPct, setCapacityPct] = useState(50);
  const [corridorsSel, setCorridorsSel] = useState<string[]>([]);

  const corridorsQ = useCorridors();
  const corridors = corridorsQ.data?.corridors ?? [];
  const create = useCreateEvent();

  const toggle = (c: string) =>
    setCorridorsSel((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const submit = () => {
    if (!label.trim() || corridorsSel.length === 0) return;
    create.mutate(
      {
        label: label.trim(),
        event_type: eventType,
        affected_corridors: corridorsSel,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        capacity_remaining_pct: capacityPct / 100,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setLabel('');
          setCorridorsSel([]);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarPlus className="w-4 h-4" /> New event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule event</DialogTitle>
          <DialogDescription>Plan a roadwork, VIP movement or disruption and preview its impact.</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted">Label</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Roadwork — Outer Ring Road" className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-muted">Type</label>
              <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="mt-1 w-full bg-card-bg border border-border-strong text-foreground text-sm rounded-lg px-2 h-10 outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted">Capacity remaining: {capacityPct}%</label>
              <input type="range" min={0} max={100} value={capacityPct} onChange={(e) => setCapacityPct(Number(e.target.value))} className="w-full accent-accent-olive mt-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-muted">Start</label>
              <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted">End</label>
              <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted">
              Affected corridors {corridorsSel.length > 0 && `(${corridorsSel.length})`}
            </label>
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border-light divide-y divide-border-light">
              {corridors.map((c) => (
                <label key={c} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-surface-muted">
                  <input type="checkbox" checked={corridorsSel.includes(c)} onChange={() => toggle(c)} className="accent-accent-olive" />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>
            <Button onClick={submit} disabled={create.isPending || !label.trim() || corridorsSel.length === 0}>
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
              Schedule
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
