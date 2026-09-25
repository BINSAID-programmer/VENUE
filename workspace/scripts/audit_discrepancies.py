import json
from collections import Counter

with open("firestore_dump_audit.json") as f:
    dump = json.load(f)

with open("expected_batches_dump.json") as f:
    batches = json.load(f)

expected_by_prog = {}
for pid, courses in batches["coaf"].items():
    expected_by_prog[pid] = courses

for c in batches["coict"]["cse_raw"]:
    expected_by_prog.setdefault(c["programmeId"], []).append(c)
expected_by_prog["bsc-esc"] = batches["coict"]["bsc-esc"]
expected_by_prog["bsc-telecom"] = batches["coict"]["bsc-telecom"]
expected_by_prog["bsc-elec"] = batches["coict"]["bsc-elec"]

for pid in ["math-stats", "bsc-actuarial", "bsc-botany", "bsc-chem", "bsc-pet-chem", "bsc-chem-phys"]:
    expected_by_prog[pid] = batches["conas"][pid]

expected_by_prog["bsc-ed"] = (
    batches["conas"]["math_bsc_ed"] + 
    batches["conas"]["bot_bsc_ed"] + 
    batches["conas"]["chem_bsc_ed"]
)

for c in batches["cohu"]["history_raw"]:
    expected_by_prog.setdefault(c["programmeId"], []).append(c)
for c in batches["cohu"]["arch_raw"]:
    expected_by_prog.setdefault(c["programmeId"], []).append(c)
for c in batches["cohu"]["lit_phil_raw"]:
    if c["programmeId"] in ["ba-literature", "ba-philosophy"]:
        expected_by_prog.setdefault(c["programmeId"], []).append(c)

discrepancies = []

for pid, exp_courses in sorted(expected_by_prog.items()):
    fs_courses = [c for c in dump["programme_courses"] if c.get("programmeId") == pid]
    fs_by_code_ys = {}
    for fc in fs_courses:
        code = (fc.get("code") or fc.get("courseCode") or "").strip().upper()
        y = fc.get("yearOfStudy")
        s = fc.get("semester")
        fs_by_code_ys.setdefault((code, y, s), []).append(fc)

    exp_by_code_ys = {}
    for ec in exp_courses:
        code = ec["code"].strip().upper()
        y = ec.get("year") or ec.get("yearOfStudy")
        s = ec.get("semester") or ec.get("sem")
        exp_by_code_ys.setdefault((code, y, s), []).append(ec)

    # 1. Missing courses (in expected but not in FS)
    for (code, y, s), ecs in exp_by_code_ys.items():
        if (code, y, s) not in fs_by_code_ys:
            ec = ecs[0]
            anywhere = [fc for fc in fs_courses if (fc.get("code") or fc.get("courseCode") or "").strip().upper() == code]
            if anywhere:
                for fc in anywhere:
                    act_y = fc.get("yearOfStudy")
                    act_s = fc.get("semester")
                    discrepancies.append({
                        "programmeId": pid, "code": code, "error": "WRONG_YEAR_SEMESTER",
                        "expected": f"Y{y}S{s}", "actual": f"Y{act_y}S{act_s}",
                        "title": ec.get("title"), "docId": fc.get("id")
                    })
            else:
                discrepancies.append({
                    "programmeId": pid, "code": code, "error": "MISSING_COURSE",
                    "expected": f"Y{y}S{s} {ec.get('title')} ({ec.get('credits')} cr, {ec.get('status')})",
                    "actual": "NOT_FOUND", "docId": None
                })

    # 2. Unexpected courses (in FS but not in expected)
    for (code, y, s), fcs in fs_by_code_ys.items():
        if (code, y, s) not in exp_by_code_ys:
            anywhere = [ec for ec in exp_courses if ec["code"].strip().upper() == code]
            if not anywhere:
                for fc in fcs:
                    t = fc.get("title") or fc.get("courseName")
                    cr = fc.get("credits")
                    st = fc.get("status")
                    discrepancies.append({
                        "programmeId": pid, "code": code, "error": "UNEXPECTED_COURSE",
                        "expected": "NONE",
                        "actual": f"Y{y}S{s} {t} ({cr} cr, {st})",
                        "docId": fc.get("id")
                    })

    # 3. Field mismatches for matching courses
    for (code, y, s), ecs in exp_by_code_ys.items():
        if (code, y, s) in fs_by_code_ys:
            ec = ecs[0]
            fc = fs_by_code_ys[(code, y, s)][0]
            etitle = (ec.get("title") or ec.get("courseName") or "").strip()
            ftitle = (fc.get("title") or fc.get("courseName") or "").strip()
            if etitle != ftitle:
                discrepancies.append({
                    "programmeId": pid, "code": code, "error": "TITLE_MISMATCH",
                    "expected": etitle, "actual": ftitle, "docId": fc.get("id"),
                    "y_s": f"Y{y}S{s}"
                })
            ecredits = ec.get("credits")
            fcredits = fc.get("credits")
            if ecredits != fcredits:
                discrepancies.append({
                    "programmeId": pid, "code": code, "error": "CREDITS_MISMATCH",
                    "expected": ecredits, "actual": fcredits, "docId": fc.get("id"),
                    "y_s": f"Y{y}S{s}"
                })
            estatus = ec.get("status")
            fstatus = fc.get("status")
            if estatus != fstatus:
                discrepancies.append({
                    "programmeId": pid, "code": code, "error": "STATUS_MISMATCH",
                    "expected": estatus, "actual": fstatus, "docId": fc.get("id"),
                    "y_s": f"Y{y}S{s}"
                })

print(f"Total field-by-field discrepancies detected across 27 programmes: {len(discrepancies)}")
print("Breakdown by error type:", Counter(d["error"] for d in discrepancies))
with open("discrepancies_27_progs.json", "w") as f:
    json.dump(discrepancies, f, indent=2)

for d in discrepancies:
    print(f"  [{d['programmeId']}] {d['code']} -> {d['error']}: Expected={d['expected']} | Actual={d['actual']} (doc: {d.get('docId')})")
