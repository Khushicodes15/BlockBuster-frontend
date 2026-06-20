import { useState, useCallback } from 'react';
import type { LogEvent, Playbook } from './types';

export type { LogEvent };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend';

export interface PlaybookStreamPayload {
  blocked_corridors?: string[];
  hour: number;
  origin: string;
  destination: string;
  capacity_remaining_pct: number;
  red_threshold: number;
  n_officers: number;
}

export function usePlaybookStream() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [playbookResult, setPlaybookResult] = useState<Playbook | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback((payload: PlaybookStreamPayload) => {
    // Reset state
    setLogs([]);
    setPlaybookResult(null);
    setError(null);
    setIsRunning(true);

    // Native EventSource only supports GET, but /playbook-stream is a POST,
    // so we parse the SSE stream manually from a fetch ReadableStream.
    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/playbook-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Failed to start stream: ${response.statusText}`);
        }
        if (!response.body) {
          throw new Error('ReadableStream not supported in this browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let completed = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsRunning(false);
            if (!completed) setError('Stream closed unexpectedly before completion.');
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // keep the last partial chunk

          for (const part of parts) {
            if (!part.startsWith('data: ')) continue;
            const dataStr = part.substring(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'log') {
                const logWithTime: LogEvent = {
                  ...data,
                  timestamp: new Date().toLocaleTimeString([], { hour12: false }),
                };
                setLogs((prev) => [...prev, logWithTime]);
              } else if (data.type === 'done') {
                completed = true;
                setPlaybookResult(data.data as Playbook);
                setIsRunning(false);
              }
            } catch {
              console.error('Failed to parse SSE data', dataStr);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Stream error');
        setIsRunning(false);
      }
    };

    run();
  }, []);

  return { logs, isRunning, playbookResult, error, startStream };
}
