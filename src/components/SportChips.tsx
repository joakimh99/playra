import { ALL_SPORTS, toggleSport } from '../lib/filters';
import { SPORT_THEME } from '../lib/sportTheme';
import type { FilterState, Sport } from '../lib/types';

const SHORT_LABEL: Record<Sport, string> = {
  f1: 'F1',
  motogp: 'MotoGP',
  nhl: 'NHL',
};

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

export function SportChips({ filters, onChange }: Props) {
  return (
    <div className="sport-chips" role="group" aria-label="Sporter">
      {ALL_SPORTS.map((sport) => {
        const active = filters.sports.has(sport);
        const theme = SPORT_THEME[sport];
        return (
          <button
            key={sport}
            type="button"
            className={`sport-chip ${active ? 'sport-chip--on' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(toggleSport(filters, sport))}
          >
            <span
              className="sport-chip__dot"
              style={{
                background: active ? theme.border : 'transparent',
                boxShadow: active ? undefined : `inset 0 0 0 1.5px ${theme.border}`,
              }}
              aria-hidden
            />
            <span className="sport-chip__label sport-chip__label--full">{theme.label}</span>
            <span className="sport-chip__label sport-chip__label--short">{SHORT_LABEL[sport]}</span>
          </button>
        );
      })}
    </div>
  );
}
