'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useCorridors, useCreateIncident } from '@/lib/queries';
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

export function NewIncidentDialog() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [hour, setHour] = useState(() => new Date().getHours());
  const [blocked, setBlocked] = useState<string[]>([]);

  const corridorsQ = useCorridors();
  const corridors = corridorsQ.data?.corridors ?? [];
  const create = useCreateIncident();

  const toggle = (c: string) =>
    setBlocked((b) => (b.includes(c) ? b.filter((x) => x !== c) : [...b, c]));

  const submit = () => {
    if (blocked.length === 0 || !label.trim()) return;
    create.mutate(
      { blocked_corridors: blocked, hour, label: label.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          setLabel('');
          setBlocked([]);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4" /> New incident
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create incident</DialogTitle>
          <DialogDescription>
            Report blocked corridors. A stress-tested response playbook is generated automatically.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted">Label</label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Road collapse — Mysore Road"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted">
              Hour of day: {String(hour).padStart(2, '0')}:00
            </label>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="w-full accent-accent-olive mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted">
              Blocked corridors {blocked.length > 0 && `(${blocked.length})`}
            </label>
            <div className="mt-1 max-h-44 overflow-y-auto rounded-lg border border-border-light divide-y divide-border-light">
              {corridors.map((c) => (
                <label key={c} className="flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer hover:bg-surface-muted">
                  <input type="checkbox" checked={blocked.includes(c)} onChange={() => toggle(c)} className="accent-accent-olive" />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={submit} disabled={create.isPending || blocked.length === 0 || !label.trim()}>
              {create.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </Button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
