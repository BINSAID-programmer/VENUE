"""Runs every Python example in the Learn lessons and stores its output in src/data/learnOutputs.json.
Usage (from repo root): bun -e "import {LEARN_TRACKS} from './src/data/learnLessons.ts'; ..." is wrapped by gen-learn-outputs.sh
"""
import json, subprocess, sys, tempfile
codes = json.load(open(sys.argv[1]))
out = {}
for c in codes:
    if 'input(' in c:
        continue
    r = subprocess.run([sys.executable, '-I', '-c', c], capture_output=True, text=True, timeout=30, cwd=tempfile.mkdtemp())
    if r.returncode:
        # Some lessons show an error on purpose; those snippets are marked.
        expected = any(m in c for m in ('prnit(', 'courses[4]', 'empty[-1]', '# Wrong'))
        if not expected:
            print('FAILED:', c[:80], r.stderr[-200:], file=sys.stderr)
            sys.exit(1)
        last = r.stderr.strip().split('\n')[-1]
        out[c] = (r.stdout.rstrip('\n') + '\n' if r.stdout.strip() else '') + last
    else:
        out[c] = r.stdout.rstrip('\n')
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=0)
print(len(out), 'outputs written')
