import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://blockbuster-615636980270.europe-west1.run.app';

export interface LogEvent {
  type: 'log';
  stage: string;
  message: string;
  timestamp: string;
}

export function usePlaybookStream() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [playbookResult, setPlaybookResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const startStream = useCallback((payload: any) => {
    // Reset state
    setLogs([]);
    setPlaybookResult(null);
    setError(null);
    setIsRunning(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // We have to use a POST with EventSource?
    // Wait, native EventSource only supports GET.
    // If the backend requires POST for /playbook-stream, we cannot use native EventSource directly with a body.
    // Let me check the backend spec. It says `POST /playbook-stream`.
    // We can use fetch-based SSE parser. Let's write one using standard fetch and ReadableStream.
    
    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/playbook-stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify(payload)
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsRunning(false);
            setPlaybookResult((prev: any) => {
              if (!prev) {
                setError('Stream closed unexpectedly before completion.');
              }
              return prev;
            });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // keep the last partial chunk

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const dataStr = part.substring(6);
              try {
                const data = JSON.parse(dataStr);
                if (data.type === 'log') {
                  const logWithTime = {
                    ...data,
                    timestamp: new Date().toLocaleTimeString([], { hour12: false })
                  };
                  setLogs((prev) => [...prev, logWithTime]);
                } else if (data.type === 'done') {
                  setPlaybookResult(data.data);
                  setIsRunning(false);
                }
              } catch (e) {
                console.error('Failed to parse SSE data', dataStr);
              }
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
        setIsRunning(false);
      }
    };
    
    run();
    
  }, []);

  return { logs, isRunning, playbookResult, error, startStream };
}
