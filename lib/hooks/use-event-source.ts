"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseEventSourceOptions {
  url: string;
  enabled?: boolean;
  onMessage?: (event: MessageEvent) => void;
}

/** Generic SSE hook for real-time server-sent events */
export function useEventSource<T>({ url, enabled = true, onMessage }: UseEventSourceOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Event | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const close = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      close();
      return;
    }

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => setIsConnected(true);

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
      } catch {
        setData(event.data as T);
      }
      onMessage?.(event);
    };

    source.onerror = (err) => {
      setError(err);
      setIsConnected(false);
    };

    return () => {
      source.close();
    };
  }, [url, enabled, onMessage, close]);

  return { data, error, isConnected, close };
}
