import type { SportSourceMeta } from '../lib/types';
import { formatInTimeZone } from 'date-fns-tz';
import { DISPLAY_TZ } from '../lib/dates';
import { sv } from 'date-fns/locale';

interface Props {
  sources: SportSourceMeta[];
  generatedAt: string;
}

export function SourceBanner({ sources, generatedAt }: Props) {
  const updated = formatInTimeZone(generatedAt, DISPLAY_TZ, "d MMM yyyy HH:mm", { locale: sv });
  return (
    <aside className="source-banner">
      <p className="tiny muted">
        Data hämtad {updated} ({DISPLAY_TZ}). Källor:{' '}
        {sources.map((s) => s.source).join(' · ')}
      </p>
      <ul className="source-banner__notes">
        {sources.flatMap((s) =>
          [...s.limitations, ...(s.note ? [s.note] : [])].map((note) => (
            <li key={`${s.sport}-${note}`}>
              <strong>{s.sport.toUpperCase()}:</strong> {note}
            </li>
          )),
        )}
      </ul>
    </aside>
  );
}
