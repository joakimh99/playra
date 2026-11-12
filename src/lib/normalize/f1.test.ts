import { describe, expect, it } from 'vitest';
import { meetingLabel, normalizeF1Sessions } from './f1';

describe('normalizeF1Sessions', () => {
  it('skapar händelser och hoppar över inställda', () => {
    const events = normalizeF1Sessions([
      {
        session_key: 1,
        session_type: 'Qualifying',
        session_name: 'Qualifying',
        date_start: '2026-03-15T13:00:00+00:00',
        circuit_short_name: 'Melbourne',
        location: 'Melbourne',
        country_name: 'Australia',
        is_cancelled: false,
      },
      {
        session_key: 2,
        session_type: 'Race',
        session_name: 'Race',
        date_start: '2026-03-16T04:00:00+00:00',
        is_cancelled: true,
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].sport).toBe('f1');
    expect(events[0].title).toBe('Kval');
    expect(events[0].subtitle).toContain('Melbourne');
  });

  it('meetingLabel använder bana och plats', () => {
    expect(
      meetingLabel({
        session_key: 0,
        session_type: 'Practice',
        session_name: 'Practice 1',
        date_start: '',
        circuit_short_name: 'Monza',
        location: 'Monza',
        country_name: 'Italy',
      }),
    ).toBe('Monza – Monza, Italy');
  });
});
