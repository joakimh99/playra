import { useEffect, useState } from 'react';
import type { PlayraDataset } from '../lib/types';

const BASE = import.meta.env.BASE_URL;

export function useSchedule(): {
  data: PlayraDataset | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<PlayraDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${BASE}data/schedule.json`);
        if (!res.ok) throw new Error(`Kunde inte ladda schema (${res.status})`);
        const json = (await res.json()) as PlayraDataset;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Okänt fel');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
