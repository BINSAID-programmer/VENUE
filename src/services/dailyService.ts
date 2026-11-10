import { authenticatedFetch } from './apiClient';

export interface DailyState {
  xp: number;
  level: number;
  xpToNext: number;
  streak: number;
  best: number;
  doneToday: boolean;
  todayScore: number | null;
  totalChallenges: number;
}

export interface DailyQuestionPublic {
  q: string;
  options: string[];
}

export interface DailyResult {
  score: number;
  total: number;
  xpGained: number;
  results: { correct: boolean; correctIndex: number; explanation: string }[];
  state: DailyState;
}

const CHANGED = 'venue:daily-changed';

async function json(res: Response) {
  return res.json().catch(() => ({}));
}

export const dailyService = {
  onChange(cb: () => void) {
    window.addEventListener(CHANGED, cb);
    return () => window.removeEventListener(CHANGED, cb);
  },

  async getState(): Promise<DailyState | null> {
    try {
      const res = await authenticatedFetch('/api/daily/state', { cache: 'no-store' });
      if (!res.ok) return null;
      return await json(res);
    } catch {
      return null;
    }
  },

  async start(courseCode: string, courseName: string): Promise<{ alreadyDone: boolean; questions: DailyQuestionPublic[] }> {
    const res = await authenticatedFetch('/api/daily/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseCode, courseName }),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not load today\'s challenge.');
    return { alreadyDone: Boolean(data.alreadyDone), questions: data.questions || [] };
  },

  async submit(courseCode: string, answers: number[]): Promise<DailyResult> {
    const res = await authenticatedFetch('/api/daily/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseCode, answers }),
    });
    const data = await json(res);
    if (!res.ok) throw new Error(data?.message || 'Could not save your answers.');
    window.dispatchEvent(new Event(CHANGED));
    return data as DailyResult;
  },
};
