import json
import re

CITATION = "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)"

def clean_code(c):
    return " ".join(c.strip().split())

def canonical_id(code):
    return re.sub(r'[^a-z0-9]+', '_', clean_code(code).lower()).strip('_')

def prog_course_id(prog_id, code):
    return f"{prog_id}_{canonical_id(code)}"

def course_record_id(prog_id, code):
    norm = re.sub(r'[^a-z0-9]+', '-', clean_code(code).lower()).strip('-')
    return f"udsm_{prog_id}_{norm}"

# Run script to populate
print("Catalogue generator imported.")
