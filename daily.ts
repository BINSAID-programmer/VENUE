/**
 * Daily Challenge: 5 quick questions per day, XP and a streak.
 * Challenges are generated once per course per day and shared (so AI usage stays small).
 * Scoring and streaks are computed on the server so they cannot be faked from the client.
 */
import fs from 'fs';
import path from 'path';
import { saveStoreFile } from './persistence';

export interface DailyQuestion {
  q: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface StoredChallenge {
  date: string;
  courseKey: string;
  courseCode: string;
  courseName: string;
  questions: DailyQuestion[];
}

export interface GameState {
  xp: number;
  streak: number;
  best: number;
  lastDay: string;
  lastScore: number;
  lastCourse: string;
  totalChallenges: number;
}

let dir = '';
const challengesFile = () => path.join(dir, 'daily_challenges.json');
const gameFile = () => path.join(dir, 'gamification.json');

export function initDaily(storageDir: string) {
  dir = storageDir;
}

function read<T>(file: string): Record<string, T> {
  try {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, 'utf-8')) || {};
  } catch {
    return {};
  }
}

/** Today's date in Tanzania time (UTC+3). */
export const dayKey = (offsetDays = 0) => new Date(Date.now() + 3 * 3600_000 + offsetDays * 86_400_000).toISOString().slice(0, 10);

const courseKeyOf = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, '');

export const XP_PER_CORRECT = 10;
export const XP_COMPLETION_BONUS = 20;
export const levelOf = (xp: number) => Math.floor(xp / 200) + 1;

const emptyState = (): GameState => ({ xp: 0, streak: 0, best: 0, lastDay: '', lastScore: 0, lastCourse: '', totalChallenges: 0 });

export function getState(uid: string) {
  const s = read<GameState>(gameFile())[uid] || emptyState();
  const today = dayKey();
  const alive = s.lastDay === today || s.lastDay === dayKey(-1);
  return {
    xp: s.xp,
    level: levelOf(s.xp),
    xpToNext: 200 - (s.xp % 200),
    streak: alive ? s.streak : 0,
    best: s.best,
    doneToday: s.lastDay === today,
    todayScore: s.lastDay === today ? s.lastScore : null,
    totalChallenges: s.totalChallenges,
  };
}

let generatedToday = { day: '', count: 0 };
const MAX_GENERATIONS_PER_DAY = 80;

export type Generator = (courseCode: string, courseName: string) => Promise<DailyQuestion[]>;

export async function getChallenge(
  courseCode: string,
  courseName: string,
  generate: Generator
): Promise<{ ok: true; questions: Omit<DailyQuestion, 'correctIndex' | 'explanation'>[] } | { ok: false; error: string }> {
  const code = String(courseCode || '').trim().slice(0, 30);
  const name = String(courseName || '').trim().slice(0, 120);
  if (code.length < 2) return { ok: false, error: 'Choose a course first.' };
  const key = `${dayKey()}_${courseKeyOf(code)}`;
  const all = read<StoredChallenge>(challengesFile());
  let c = all[key];
  if (!c) {
    const today = dayKey();
    if (generatedToday.day !== today) generatedToday = { day: today, count: 0 };
    if (generatedToday.count >= MAX_GENERATIONS_PER_DAY) {
      return { ok: false, error: 'Today\'s challenges are very busy. Please try again later.' };
    }
    generatedToday.count++;
    let questions: DailyQuestion[];
    try {
      questions = await generate(code, name);
    } catch (e: any) {
      generatedToday.count--;
      return { ok: false, error: 'Could not prepare today\'s challenge. Please try again.' };
    }
    c = { date: today, courseKey: courseKeyOf(code), courseCode: code, courseName: name, questions };
    const fresh = read<StoredChallenge>(challengesFile());
    fresh[key] = c;
    // keep only the last 3 days
    const keep = new Set([dayKey(), dayKey(-1), dayKey(-2)]);
    for (const k of Object.keys(fresh)) if (!keep.has(fresh[k].date)) delete fresh[k];
    saveStoreFile(challengesFile(), fresh);
  }
  return { ok: true, questions: c.questions.map(({ q, options }) => ({ q, options })) };
}

export function submit(uid: string, courseCode: string, answers: unknown) {
  const key = `${dayKey()}_${courseKeyOf(String(courseCode || ''))}`;
  const c = read<StoredChallenge>(challengesFile())[key];
  if (!c) return { ok: false as const, error: 'This challenge has expired. Open it again.' };
  if (!Array.isArray(answers) || answers.length !== c.questions.length) {
    return { ok: false as const, error: 'Answer every question first.' };
  }
  const games = read<GameState>(gameFile());
  const s = games[uid] || emptyState();
  const today = dayKey();
  const results = c.questions.map((q, i) => ({
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    correct: Number(answers[i]) === q.correctIndex,
  }));
  const score = results.filter((r) => r.correct).length;

  let xpGained = 0;
  const firstToday = s.lastDay !== today;
  if (firstToday) {
    xpGained = score * XP_PER_CORRECT + XP_COMPLETION_BONUS;
    s.streak = s.lastDay === dayKey(-1) ? s.streak + 1 : 1;
    s.best = Math.max(s.best, s.streak);
    s.xp += xpGained;
    s.lastDay = today;
    s.lastScore = score;
    s.lastCourse = c.courseCode;
    s.totalChallenges += 1;
    games[uid] = s;
    saveStoreFile(gameFile(), games);
  }
  return { ok: true as const, score, total: results.length, results, xpGained, state: getState(uid) };
}
