import { useCallback, useState } from 'react';

const KEY = 'venue_learn_stats_v1';

export interface LearnStats {
  xp: number;
  streak: number;
  lastDay: string; // YYYY-MM-DD
  quiz: Record<string, boolean>; // `${lessonId}:${i}` answered correctly
  challenges: Record<string, boolean>;
  bookmarks: string[]; // `${trackId}:${lessonId}`
}

const EMPTY: LearnStats = { xp: 0, streak: 0, lastDay: '', quiz: {}, challenges: {}, bookmarks: [] };

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function load(): LearnStats {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && typeof v === 'object') return { ...EMPTY, ...v };
  } catch {
    /* ignore */
  }
  return { ...EMPTY };
}
function save(s: LearnStats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

/** Level n needs 100·n·(n-1)/2 XP: 0, 100, 300, 600, ... */
export function levelOf(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  while (xp >= (100 * level * (level + 1)) / 2) level++;
  const base = (100 * (level - 1) * level) / 2;
  return { level, into: xp - base, need: level * 100 };
}

export function useLearnStats() {
  const [stats, setStats] = useState<LearnStats>(load);

  const update = useCallback((fn: (s: LearnStats) => LearnStats) => {
    setStats((prev) => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, []);

  /** Adds XP and keeps the daily streak up to date. */
  const award = useCallback(
    (xp: number) =>
      update((s) => {
        const t = today();
        let streak = s.streak;
        if (s.lastDay !== t) streak = s.lastDay === yesterday() ? s.streak + 1 : 1;
        return { ...s, xp: s.xp + xp, streak, lastDay: t };
      }),
    [update]
  );

  const markQuiz = useCallback(
    (key: string) =>
      update((s) => {
        if (s.quiz[key]) return s;
        const t = today();
        const streak = s.lastDay === t ? s.streak : s.lastDay === yesterday() ? s.streak + 1 : 1;
        return { ...s, xp: s.xp + 5, streak, lastDay: t, quiz: { ...s.quiz, [key]: true } };
      }),
    [update]
  );

  const markChallenge = useCallback(
    (key: string) =>
      update((s) => {
        if (s.challenges[key]) return s;
        const t = today();
        const streak = s.lastDay === t ? s.streak : s.lastDay === yesterday() ? s.streak + 1 : 1;
        return { ...s, xp: s.xp + 20, streak, lastDay: t, challenges: { ...s.challenges, [key]: true } };
      }),
    [update]
  );

  const toggleBookmark = useCallback(
    (key: string) =>
      update((s) => ({
        ...s,
        bookmarks: s.bookmarks.includes(key) ? s.bookmarks.filter((b) => b !== key) : [...s.bookmarks, key],
      })),
    [update]
  );

  // A streak that was not continued yesterday or today is shown as 0.
  const liveStreak = stats.lastDay === today() || stats.lastDay === yesterday() ? stats.streak : 0;

  return { stats, liveStreak, award, markQuiz, markChallenge, toggleBookmark };
}
