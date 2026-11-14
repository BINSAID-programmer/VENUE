#!/bin/sh
# Regenerates src/data/learnOutputs.json (needs bun and python3).
set -e
bun -e "
import {LEARN_TRACKS} from './src/data/learnLessons.ts';
const codes = new Set();
for (const t of LEARN_TRACKS) if (t.lang === 'python') for (const l of t.lessons) {
  for (const s of (l.sections||[])) if (s.code) codes.add(s.code);
  for (const e of (l.exercises||[])) codes.add(e.a);
}
await Bun.write('/tmp/learn-codes.json', JSON.stringify([...codes]));
"
python3 scripts/gen-learn-outputs.py /tmp/learn-codes.json src/data/learnOutputs.json
