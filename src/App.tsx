import { useMemo, useState } from 'react';
import { FilterBar } from './components/FilterBar';
import { MonthView } from './components/MonthView';
import { SourceBanner } from './components/SourceBanner';
import { WeekView } from './components/WeekView';
import { useSchedule } from './hooks/useSchedule';
import { formatRangeLabel, shiftAnchor, zonedNow } from './lib/dates';
import { createDefaultFilters, filterEvents } from './lib/filters';
import { loadTeamPreferences, saveTeamPreferences } from './lib/storage';
import type { CalendarView, FilterState, TeamPreferences } from './lib/types';

function App() {
  const { data, loading, error } = useSchedule();
  const [view, setView] = useState<CalendarView>('week');
  const [anchor, setAnchor] = useState(() => zonedNow());
  const [filters, setFilters] = useState<FilterState>(() => createDefaultFilters());
  const [prefs, setPrefs] = useState<TeamPreferences>(() => loadTeamPreferences());

  const highlightTeams = useMemo(() => {
    const s = new Set(prefs.interesting);
    if (prefs.favorite) s.add(prefs.favorite);
    return s;
  }, [prefs]);

  const filteredEvents = useMemo(() => {
    if (!data) return [];
    const withHighlight = { ...filters, highlightTeams };
    return filterEvents(data.events, withHighlight);
  }, [data, filters, highlightTeams]);

  const rangeLabel = formatRangeLabel(anchor, anchor, view);

  const handlePrefs = (p: TeamPreferences) => {
    setPrefs(p);
    saveTeamPreferences(p);
  };

  if (loading) {
    return (
      <div className="app app--center">
        <p>Laddar schema …</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="app app--center">
        <p className="error">Kunde inte ladda data: {error ?? 'saknas'}</p>
        <p className="muted">Kör <code>npm run fetch-data</code> och starta om.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Playra</h1>
          <p className="tagline">MotoGP · F1 · NHL</p>
        </div>
        <div className="nav-controls">
          <div className="view-toggle" role="tablist" aria-label="Vy">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'week'}
              className={view === 'week' ? 'active' : ''}
              onClick={() => setView('week')}
            >
              Vecka
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'month'}
              className={view === 'month' ? 'active' : ''}
              onClick={() => setView('month')}
            >
              Månad
            </button>
          </div>
          <div className="date-nav">
            <button type="button" aria-label="Föregående" onClick={() => setAnchor((a) => shiftAnchor(a, view, -1))}>
              ←
            </button>
            <span className="date-nav__label">{rangeLabel}</span>
            <button type="button" aria-label="Nästa" onClick={() => setAnchor((a) => shiftAnchor(a, view, 1))}>
              →
            </button>
            <button type="button" className="today-btn" onClick={() => setAnchor(zonedNow())}>
              Idag
            </button>
          </div>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            teams={data.nhlTeams}
            prefs={prefs}
            onPrefsChange={handlePrefs}
          />
          <SourceBanner sources={data.sources} generatedAt={data.generatedAt} />
        </aside>
        <section className="calendar-panel" aria-label="Kalender">
          {view === 'week' ? (
            <WeekView anchor={anchor} events={filteredEvents} highlightTeams={highlightTeams} />
          ) : (
            <MonthView anchor={anchor} events={filteredEvents} highlightTeams={highlightTeams} />
          )}
          <p className="foot">
            {filteredEvents.length} händelser · Europe/Stockholm
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
