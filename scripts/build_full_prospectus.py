#!/usr/bin/env python3
import json
import re
import sys

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

# Units
UNITS = [
    {"id": "conas", "name": "College of Natural and Applied Sciences", "shortName": "CoNAS", "abbreviation": "CoNAS", "type": "College"},
    {"id": "coict", "name": "College of Information and Communication Technologies", "shortName": "CoICT", "abbreviation": "CoICT", "type": "College"},
    {"id": "coet", "name": "College of Engineering and Technology", "shortName": "CoET", "abbreviation": "CoET", "type": "College"},
    {"id": "coss", "name": "College of Social Sciences", "shortName": "CoSS", "abbreviation": "CoSS", "type": "College"},
    {"id": "cohu", "name": "College of Humanities", "shortName": "CoHU", "abbreviation": "CoHU", "type": "College"},
    {"id": "coaf", "name": "College of Agricultural Sciences and Food Technology", "shortName": "CoAF", "abbreviation": "CoAF", "type": "College"},
    {"id": "mchas", "name": "University of Dar es Salaam Mbeya College of Health and Allied Sciences", "shortName": "UDSM-MCHAS", "abbreviation": "UDSM-MCHAS", "type": "College"},

    {"id": "udbs", "name": "University of Dar es Salaam Business School", "shortName": "UDBS", "abbreviation": "UDBS", "type": "School"},
    {"id": "udsol", "name": "University of Dar es Salaam School of Law", "shortName": "UDSoL", "abbreviation": "UDSoL", "type": "School"},
    {"id": "soed", "name": "School of Education", "shortName": "SoED", "abbreviation": "SoED", "type": "School"},
    {"id": "udse", "name": "University of Dar es Salaam School of Economics", "shortName": "UDSE", "abbreviation": "UDSE", "type": "School"},
    {"id": "sjmc", "name": "School of Journalism and Mass Communication", "shortName": "SJMC", "abbreviation": "SJMC", "type": "School"},
    {"id": "somg", "name": "School of Mines and Geosciences", "shortName": "SoMG", "abbreviation": "SoMG", "type": "School"},
    {"id": "soaf", "name": "School of Aquatic Sciences and Fisheries Technology", "shortName": "SoAF", "abbreviation": "SoAF", "type": "School"},

    {"id": "ids", "name": "Institute of Development Studies", "shortName": "IDS", "abbreviation": "IDS", "type": "Institute"},
    {"id": "iks", "name": "Institute of Kiswahili Studies", "shortName": "IKS", "abbreviation": "IKS", "type": "Institute"},
    {"id": "ims", "name": "Institute of Marine Sciences", "shortName": "IMS", "abbreviation": "IMS", "type": "Institute"},
    {"id": "ci", "name": "Confucius Institute at the University of Dar es Salaam", "shortName": "CI", "abbreviation": "CI", "type": "Institute"},
    {"id": "igs", "name": "Institute of Gender Studies", "shortName": "IGS", "abbreviation": "IGS", "type": "Institute"},
    {"id": "ira", "name": "Institute of Resource Assessment", "shortName": "IRA", "abbreviation": "IRA", "type": "Institute"},
    {"id": "udsm-mri", "name": "University of Dar es Salaam Mineral Resources Institute", "shortName": "UDSM-MRI", "abbreviation": "UDSM-MRI", "type": "Institute"},

    {"id": "duce", "name": "Dar es Salaam University College of Education", "shortName": "DUCE", "abbreviation": "DUCE", "type": "Constituent College"},
    {"id": "muce", "name": "Mkwawa University College of Education", "shortName": "MUCE", "abbreviation": "MUCE", "type": "Constituent College"},
]

for u in UNITS:
    u["universityId"] = "udsm"
    u["verified"] = True
    u["source"] = CITATION
    u["sourceType"] = "official_prospectus"
    u["academicYear"] = "2025/2026"

DEPARTMENTS = [
    # CoSS
    {"id": "dept-stats", "academicUnitId": "coss", "name": "Department of Statistics"},
    {"id": "dept-sociology", "academicUnitId": "coss", "name": "Department of Sociology and Anthropology"},
    {"id": "dept-pspa", "academicUnitId": "coss", "name": "Department of Political Science and Public Administration"},
    {"id": "dept-geography", "academicUnitId": "coss", "name": "Department of Geography"},
    {"id": "dept-psychology", "academicUnitId": "coss", "name": "Department of Psychology"},
    {"id": "dept-info-studies", "academicUnitId": "coss", "name": "Information Studies Unit"},
    {"id": "dept-coss-ed", "academicUnitId": "coss", "name": "Office of Coordinator of Undergraduate Studies (CoSS)"},

    # CoNAS
    {"id": "dept-math", "academicUnitId": "conas", "name": "Department of Mathematics"},
    {"id": "dept-phys", "academicUnitId": "conas", "name": "Department of Physics"},
    {"id": "dept-chem", "academicUnitId": "conas", "name": "Department of Chemistry"},
    {"id": "dept-biotech", "academicUnitId": "conas", "name": "Department of Molecular Biology and Biotechnology"},
    {"id": "dept-zoology", "academicUnitId": "conas", "name": "Department of Zoology and Wildlife Conservation"},
    {"id": "dept-botany", "academicUnitId": "conas", "name": "Department of Botany"},

    # UDSE
    {"id": "dept-economics", "academicUnitId": "udse", "name": "Department of Economics"},
    {"id": "dept-applied-economics", "academicUnitId": "udse", "name": "Department of Applied Economics"},

    # CoICT
    {"id": "dept-cse", "academicUnitId": "coict", "name": "Department of Computer Science and Engineering"},
    {"id": "dept-ete", "academicUnitId": "coict", "name": "Department of Electronics and Telecommunication Engineering"},

    # CoET
    {"id": "dept-cpe", "academicUnitId": "coet", "name": "Department of Chemical and Process Engineering"},
    {"id": "dept-ee", "academicUnitId": "coet", "name": "Department of Electrical Engineering"},
    {"id": "dept-mie", "academicUnitId": "coet", "name": "Department of Mechanical and Industrial Engineering"},
    {"id": "dept-sce", "academicUnitId": "coet", "name": "Department of Structural and Construction Engineering"},
    {"id": "dept-tge", "academicUnitId": "coet", "name": "Department of Transportation and Geotechnical Engineering"},
    {"id": "dept-wre", "academicUnitId": "coet", "name": "Department of Water Resources Engineering"},

    # CoAF
    {"id": "dept-coaf-aeb", "academicUnitId": "coaf", "name": "Department of Agricultural Economics and Business"},
    {"id": "dept-coaf-ae", "academicUnitId": "coaf", "name": "Department of Agricultural Engineering"},
    {"id": "dept-coaf-csbt", "academicUnitId": "coaf", "name": "Department of Crop Sciences and Beekeeping Technology"},
    {"id": "dept-coaf-fst", "academicUnitId": "coaf", "name": "Department of Food Science and Technology"},

    # CoHU
    {"id": "dept-archaeology", "academicUnitId": "cohu", "name": "Department of Archaeology and Heritage Studies"},
    {"id": "dept-creative-arts", "academicUnitId": "cohu", "name": "Department of Creative Arts"},
    {"id": "dept-foreign-languages", "academicUnitId": "cohu", "name": "Department of Foreign Languages and Linguistics"},
    {"id": "dept-history", "academicUnitId": "cohu", "name": "Department of History"},
    {"id": "dept-literature", "academicUnitId": "cohu", "name": "Department of Literature, Communication and Publishing"},
    {"id": "dept-philosophy", "academicUnitId": "cohu", "name": "Department of Philosophy and Religious Studies"},
    {"id": "dept-ccs", "academicUnitId": "cohu", "name": "Centre for Communication Studies"},
    {"id": "dept-cohu-ed", "academicUnitId": "cohu", "name": "Undergraduate Education Unit (CoHU)"},

    # UDBS
    {"id": "dept-accounting", "academicUnitId": "udbs", "name": "Department of Accounting"},
    {"id": "dept-finance", "academicUnitId": "udbs", "name": "Department of Finance"},
    {"id": "dept-marketing", "academicUnitId": "udbs", "name": "Department of Marketing"},
    {"id": "dept-management", "academicUnitId": "udbs", "name": "Department of General Management"},

    # UDSoL
    {"id": "dept-public-law", "academicUnitId": "udsol", "name": "Department of Public Law"},
    {"id": "dept-economic-law", "academicUnitId": "udsol", "name": "Department of Economic Law"},
    {"id": "dept-private-law", "academicUnitId": "udsol", "name": "Department of Private Law"},

    # SoED
    {"id": "dept-epcs", "academicUnitId": "soed", "name": "Department of Educational Psychology and Curriculum Studies"},
    {"id": "dept-efmll", "academicUnitId": "soed", "name": "Department of Educational Foundations, Management and Lifelong Learning"},
    {"id": "dept-pess", "academicUnitId": "soed", "name": "Department of Physical Education and Sport Sciences"},

    # SoAF
    {"id": "dept-dasft", "academicUnitId": "soaf", "name": "Department of Aquatic Sciences and Fisheries Technology"},
    {"id": "dept-dat", "academicUnitId": "soaf", "name": "Department of Aquaculture Technology"},

    # SJMC
    {"id": "dept-journalism", "academicUnitId": "sjmc", "name": "Department of Journalism"},
    {"id": "dept-mass-comm", "academicUnitId": "sjmc", "name": "Department of Mass Communication"},
    {"id": "dept-public-relations", "academicUnitId": "sjmc", "name": "Department of Public Relations and Advertising"},

    # IDS
    {"id": "dept-dev-studies", "academicUnitId": "ids", "name": "Department of Development Studies"},

    # IKS
    {"id": "dept-iks-literature", "academicUnitId": "iks", "name": "Department of Kiswahili Literature, Communication and Publishing"},
    {"id": "dept-iks-linguistics", "academicUnitId": "iks", "name": "Department of Kiswahili Language and Linguistics"},

    # IMS
    {"id": "dept-ims-mcrm", "academicUnitId": "ims", "name": "Marine and Coastal Resources Management Section"},
    {"id": "dept-ims-mti", "academicUnitId": "ims", "name": "Marine Technology and Innovation Section"},
    {"id": "dept-ims-goi", "academicUnitId": "ims", "name": "Geosciences, Oceanography and Informatics Section"},

    # SoMG
    {"id": "dept-geosciences", "academicUnitId": "somg", "name": "Department of Geosciences"},
    {"id": "dept-mining", "academicUnitId": "somg", "name": "Department of Mining and Mineral Processing Engineering"},
    {"id": "dept-petroleum-eng", "academicUnitId": "somg", "name": "Department of Petroleum Science and Engineering"},

    # UDSM-MCHAS
    {"id": "dept-mchas-anatomy", "academicUnitId": "mchas", "name": "Department of Anatomy, Physiology and Pathology"},
    {"id": "dept-mchas-biochem", "academicUnitId": "mchas", "name": "Department of Biochemistry and Pharmacology"},
    {"id": "dept-mchas-micro", "academicUnitId": "mchas", "name": "Department of Microbiology/Immunology and Parasitology/Entomology"},
    {"id": "dept-mchas-internal-med", "academicUnitId": "mchas", "name": "Department of Internal Medicine"},
    {"id": "dept-mchas-surgery", "academicUnitId": "mchas", "name": "Department of Surgery"},
    {"id": "dept-mchas-obgyn", "academicUnitId": "mchas", "name": "Department of Obstetrics and Gynaecology"},
    {"id": "dept-mchas-pediatrics", "academicUnitId": "mchas", "name": "Department of Paediatrics and Child Health"},

    # CI
    {"id": "dept-ci", "academicUnitId": "ci", "name": "Confucius Institute Academic Section"},

    # UDSM-MRI
    {"id": "dept-mri-mining", "academicUnitId": "udsm-mri", "name": "Department of Mining Engineering"},
    {"id": "dept-mri-geology", "academicUnitId": "udsm-mri", "name": "Department of Geology and Mineral Exploration"},

    # DUCE
    {"id": "dept-duce-foe", "academicUnitId": "duce", "name": "Faculty of Education (DUCE)"},
    {"id": "dept-duce-fohss", "academicUnitId": "duce", "name": "Faculty of Humanities and Social Sciences (DUCE)"},
    {"id": "dept-duce-fos", "academicUnitId": "duce", "name": "Faculty of Science (DUCE)"},

    # MUCE
    {"id": "dept-muce-foed", "academicUnitId": "muce", "name": "Faculty of Education (MUCE)"},
    {"id": "dept-muce-fohss", "academicUnitId": "muce", "name": "Faculty of Humanities and Social Sciences (MUCE)"},
    {"id": "dept-muce-fosc", "academicUnitId": "muce", "name": "Faculty of Science (MUCE)"},
]

for d in DEPARTMENTS:
    d["universityId"] = "udsm"
    d["verified"] = True
    d["source"] = CITATION

PROGRAMMES = [
    # CoSS
    {"id": "bsc-stats", "academicUnitId": "coss", "departmentId": "dept-stats", "name": "Bachelor of Science in Statistics", "shortName": "BSc Stats", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-geography", "academicUnitId": "coss", "departmentId": "dept-geography", "name": "Bachelor of Arts in Geography and Environmental Studies", "shortName": "BA Geography", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-pspa", "academicUnitId": "coss", "departmentId": "dept-pspa", "name": "Bachelor of Arts in Political Science and Public Administration", "shortName": "BA PSPA", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-sociology", "academicUnitId": "coss", "departmentId": "dept-sociology", "name": "Bachelor of Arts in Sociology", "shortName": "BA Sociology", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-anthropology", "academicUnitId": "coss", "departmentId": "dept-sociology", "name": "Bachelor of Arts in Anthropology", "shortName": "BA Anthropology", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsw", "academicUnitId": "coss", "departmentId": "dept-sociology", "name": "Bachelor of Social Work", "shortName": "BSW", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-psychology", "academicUnitId": "coss", "departmentId": "dept-psychology", "name": "Bachelor of Arts in Psychology", "shortName": "BA Psychology", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-library", "academicUnitId": "coss", "departmentId": "dept-info-studies", "name": "Bachelor of Arts in Library and Information Studies", "shortName": "BA LIS", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-ed-coss", "academicUnitId": "coss", "departmentId": "dept-coss-ed", "name": "Bachelor of Arts with Education (CoSS)", "shortName": "BA Ed (CoSS)", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # UDSE
    {"id": "ba-economics", "academicUnitId": "udse", "departmentId": "dept-economics", "name": "Bachelor of Arts in Economics", "shortName": "BA Economics", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-econ-stats", "academicUnitId": "udse", "departmentId": "dept-economics", "name": "Bachelor of Arts in Economics and Statistics", "shortName": "BA Econ & Stats", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # CoNAS
    {"id": "math-stats", "academicUnitId": "conas", "departmentId": "dept-math", "name": "Bachelor of Science in Mathematics and Statistics", "shortName": "BSc Math & Stats", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-ed", "academicUnitId": "conas", "departmentId": "dept-math", "name": "Bachelor of Science with Education", "shortName": "BSc Ed", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-math", "academicUnitId": "conas", "departmentId": "dept-math", "name": "Bachelor of Science in Mathematics", "shortName": "BSc Math", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-actuarial", "academicUnitId": "conas", "departmentId": "dept-math", "name": "Bachelor of Science in Actuarial Science", "shortName": "BSc Actuarial", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-chem", "academicUnitId": "conas", "departmentId": "dept-chem", "name": "Bachelor of Science in Chemistry", "shortName": "BSc Chem", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-pet-chem", "academicUnitId": "conas", "departmentId": "dept-chem", "name": "Bachelor of Science in Petroleum Chemistry", "shortName": "BSc Pet Chem", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-app-micr-chem", "academicUnitId": "conas", "departmentId": "dept-chem", "name": "Bachelor of Science in Applied Microbiology and Chemistry", "shortName": "BSc App Micr & Chem", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-mol-bio", "academicUnitId": "conas", "departmentId": "dept-biotech", "name": "Bachelor of Science in Molecular Biology and Biotechnology", "shortName": "BSc Mol Bio & Biotech", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-phys", "academicUnitId": "conas", "departmentId": "dept-phys", "name": "Bachelor of Science in Physics", "shortName": "BSc Physics", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-met", "academicUnitId": "conas", "departmentId": "dept-phys", "name": "Bachelor of Science in Meteorology", "shortName": "BSc Met", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-pmp", "academicUnitId": "conas", "departmentId": "dept-phys", "name": "Bachelor of Science in Physics with Medical Physics", "shortName": "BSc Phys & Med Phys", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-botany", "academicUnitId": "conas", "departmentId": "dept-botany", "name": "Bachelor of Science in Botanical Sciences", "shortName": "BSc Botany", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-app-zoo", "academicUnitId": "conas", "departmentId": "dept-zoology", "name": "Bachelor of Science in Applied Zoology", "shortName": "BSc App Zoology", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-wildlife", "academicUnitId": "conas", "departmentId": "dept-zoology", "name": "Bachelor of Science in Wildlife Science and Conservation", "shortName": "BSc Wildlife", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # CoICT
    {"id": "bsc-cs", "academicUnitId": "coict", "departmentId": "dept-cse", "name": "Bachelor of Science in Computer Science", "shortName": "BSc CS", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-bit", "academicUnitId": "coict", "departmentId": "dept-cse", "name": "Bachelor of Science in Business Information Technology", "shortName": "BSc BIT", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-ceit", "academicUnitId": "coict", "departmentId": "dept-cse", "name": "Bachelor of Science in Computer Engineering and Information Technology", "shortName": "BSc CEIT", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-esc", "academicUnitId": "coict", "departmentId": "dept-ete", "name": "Bachelor of Science in Electronic Science and Communication", "shortName": "BSc ESC", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-telecom", "academicUnitId": "coict", "departmentId": "dept-ete", "name": "Bachelor of Science in Telecommunications Engineering", "shortName": "BSc Telecom", "awardLevel": "Bachelor Degree", "durationYears": 4},

    # CoET
    {"id": "bsc-civil", "academicUnitId": "coet", "departmentId": "dept-sce", "name": "Bachelor of Science in Civil Engineering", "shortName": "BSc Civil", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-mech", "academicUnitId": "coet", "departmentId": "dept-mie", "name": "Bachelor of Science in Mechanical Engineering", "shortName": "BSc Mech", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-elec-eng", "academicUnitId": "coet", "departmentId": "dept-ee", "name": "Bachelor of Science in Electrical Engineering", "shortName": "BSc Elec Eng", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-cpe", "academicUnitId": "coet", "departmentId": "dept-cpe", "name": "Bachelor of Science in Chemical and Process Engineering", "shortName": "BSc CPE", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-ie", "academicUnitId": "coet", "departmentId": "dept-mie", "name": "Bachelor of Science in Industrial Engineering", "shortName": "BSc IE", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-geom", "academicUnitId": "coet", "departmentId": "dept-tge", "name": "Bachelor of Science in Geomatics", "shortName": "BSc Geom", "awardLevel": "Bachelor Degree", "durationYears": 4},

    # UDBS
    {"id": "bcom-accounting", "academicUnitId": "udbs", "departmentId": "dept-accounting", "name": "Bachelor of Commerce in Accounting", "shortName": "BCom Accounting", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-finance", "academicUnitId": "udbs", "departmentId": "dept-finance", "name": "Bachelor of Commerce in Finance", "shortName": "BCom Finance", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-banking", "academicUnitId": "udbs", "departmentId": "dept-finance", "name": "Bachelor of Commerce in Banking and Financial Services", "shortName": "BCom Banking", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-marketing", "academicUnitId": "udbs", "departmentId": "dept-marketing", "name": "Bachelor of Commerce in Marketing", "shortName": "BCom Marketing", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-tourism", "academicUnitId": "udbs", "departmentId": "dept-marketing", "name": "Bachelor of Commerce in Tourism Management", "shortName": "BCom Tourism", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-hrm", "academicUnitId": "udbs", "departmentId": "dept-management", "name": "Bachelor of Commerce in Human Resources Management", "shortName": "BCom HRM", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bcom-pscm", "academicUnitId": "udbs", "departmentId": "dept-management", "name": "Bachelor of Commerce in Procurement and Supply Chain Management", "shortName": "BCom PSCM", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bba", "academicUnitId": "udbs", "departmentId": "dept-management", "name": "Bachelor of Business Administration", "shortName": "BBA", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # UDSoL
    {"id": "llb", "academicUnitId": "udsol", "departmentId": "dept-private-law", "name": "Bachelor of Laws", "shortName": "LL.B", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "ba-law-enforcement", "academicUnitId": "udsol", "departmentId": "dept-public-law", "name": "Bachelor of Arts in Law Enforcement", "shortName": "BA Law Enf", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # CoAF
    {"id": "bsc-aneb", "academicUnitId": "coaf", "departmentId": "dept-coaf-aeb", "name": "Bachelor of Science in Agricultural and Natural Resources Economics and Business", "shortName": "BSc Ag Econ & Bus", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-aem", "academicUnitId": "coaf", "departmentId": "dept-coaf-ae", "name": "Bachelor of Science in Agricultural Engineering and Mechanization", "shortName": "BSc Ag Eng", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-bst", "academicUnitId": "coaf", "departmentId": "dept-coaf-csbt", "name": "Bachelor of Science in Beekeeping Science and Technology", "shortName": "BSc Beekeeping", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-cst", "academicUnitId": "coaf", "departmentId": "dept-coaf-csbt", "name": "Bachelor of Science in Crop Science and Technology", "shortName": "BSc Crop Sci", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bsc-fst", "academicUnitId": "coaf", "departmentId": "dept-coaf-fst", "name": "Bachelor of Science in Food Science and Technology", "shortName": "BSc Food Sci", "awardLevel": "Bachelor Degree", "durationYears": 4},

    # SoMG
    {"id": "bsc-geology", "academicUnitId": "somg", "departmentId": "dept-geosciences", "name": "Bachelor of Science in Geology", "shortName": "BSc Geology", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-eng-geology", "academicUnitId": "somg", "departmentId": "dept-geosciences", "name": "Bachelor of Science in Engineering Geology", "shortName": "BSc Eng Geology", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-geophysics", "academicUnitId": "somg", "departmentId": "dept-geosciences", "name": "Bachelor of Science in Geophysics", "shortName": "BSc Geophysics", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-mining-eng", "academicUnitId": "somg", "departmentId": "dept-mining", "name": "Bachelor of Science in Mining Engineering", "shortName": "BSc Mining Eng", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-mineral-processing", "academicUnitId": "somg", "departmentId": "dept-mining", "name": "Bachelor of Science in Metallurgy and Mineral Processing Engineering", "shortName": "BSc Metallurgy", "awardLevel": "Bachelor Degree", "durationYears": 4},
    {"id": "bsc-petroleum-eng", "academicUnitId": "somg", "departmentId": "dept-petroleum-eng", "name": "Bachelor of Science in Petroleum Engineering", "shortName": "BSc Petroleum Eng", "awardLevel": "Bachelor Degree", "durationYears": 4},

    # SoED
    {"id": "bed-arts", "academicUnitId": "soed", "departmentId": "dept-efmll", "name": "Bachelor of Education in Arts", "shortName": "BEd Arts", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bed-sc", "academicUnitId": "soed", "departmentId": "dept-epcs", "name": "Bachelor of Education in Science", "shortName": "BEd Sc", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bed-psych", "academicUnitId": "soed", "departmentId": "dept-epcs", "name": "Bachelor of Education in Psychology", "shortName": "BEd Psych", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bed-ece", "academicUnitId": "soed", "departmentId": "dept-epcs", "name": "Bachelor of Education in Early Childhood Education", "shortName": "BEd ECE", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "bed-comm", "academicUnitId": "soed", "departmentId": "dept-efmll", "name": "Bachelor of Education in Commerce", "shortName": "BEd Comm", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # CoHU
    {"id": "ba-archaeology", "academicUnitId": "cohu", "departmentId": "dept-archaeology", "name": "Bachelor of Arts in Archaeology", "shortName": "BA Archaeology", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-heritage", "academicUnitId": "cohu", "departmentId": "dept-archaeology", "name": "Bachelor of Arts in Heritage Management", "shortName": "BA Heritage", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-history", "academicUnitId": "cohu", "departmentId": "dept-history", "name": "Bachelor of Arts in History", "shortName": "BA History", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-literature", "academicUnitId": "cohu", "departmentId": "dept-literature", "name": "Bachelor of Arts in Literature", "shortName": "BA Literature", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-philosophy", "academicUnitId": "cohu", "departmentId": "dept-philosophy", "name": "Bachelor of Arts in Philosophy and Ethics", "shortName": "BA Philosophy", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-music", "academicUnitId": "cohu", "departmentId": "dept-creative-arts", "name": "Bachelor of Arts in Music", "shortName": "BA Music", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-theatre", "academicUnitId": "cohu", "departmentId": "dept-creative-arts", "name": "Bachelor of Arts in Theatre Arts", "shortName": "BA Theatre", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-art-design", "academicUnitId": "cohu", "departmentId": "dept-creative-arts", "name": "Bachelor of Arts in Art and Design", "shortName": "BA Art & Design", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # SJMC
    {"id": "ba-journalism", "academicUnitId": "sjmc", "departmentId": "dept-journalism", "name": "Bachelor of Arts in Journalism", "shortName": "BA Journalism", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-mass-comm", "academicUnitId": "sjmc", "departmentId": "dept-mass-comm", "name": "Bachelor of Arts in Mass Communication", "shortName": "BA Mass Comm", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "ba-pr", "academicUnitId": "sjmc", "departmentId": "dept-public-relations", "name": "Bachelor of Arts in Public Relations and Advertising", "shortName": "BA PR", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # SoAF
    {"id": "bsc-asf", "academicUnitId": "soaf", "departmentId": "dept-dasft", "name": "Bachelor of Science in Aquatic Sciences and Fisheries", "shortName": "BSc ASF", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # IDS
    {"id": "ba-dev-studies", "academicUnitId": "ids", "departmentId": "dept-dev-studies", "name": "Bachelor of Arts in Development Studies", "shortName": "BA Dev Studies", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # IKS
    {"id": "ba-kiswahili", "academicUnitId": "iks", "departmentId": "dept-iks-literature", "name": "Bachelor of Arts in Kiswahili", "shortName": "BA Kiswahili", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # IMS
    {"id": "bsc-marine", "academicUnitId": "ims", "departmentId": "dept-ims-mcrm", "name": "Bachelor of Science in Marine Sciences", "shortName": "BSc Marine Sc", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # UDSM-MCHAS
    {"id": "doctor-medicine", "academicUnitId": "mchas", "departmentId": "dept-mchas-internal-med", "name": "Doctor of Medicine (MD)", "shortName": "MD", "awardLevel": "Bachelor Degree", "durationYears": 5},
    {"id": "doctor-dental", "academicUnitId": "mchas", "departmentId": "dept-mchas-surgery", "name": "Doctor of Dental Surgery (DDS)", "shortName": "DDS", "awardLevel": "Bachelor Degree", "durationYears": 5},

    # CI
    {"id": "ba-ed-chinese", "academicUnitId": "ci", "departmentId": "dept-ci", "name": "Bachelor of Arts with Education (Chinese and English)", "shortName": "BA Ed (Chinese)", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # DUCE
    {"id": "duce-bed-arts", "academicUnitId": "duce", "departmentId": "dept-duce-foe", "name": "Bachelor of Education in Arts (DUCE)", "shortName": "BEd Arts (DUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "duce-bed-sc", "academicUnitId": "duce", "departmentId": "dept-duce-foe", "name": "Bachelor of Education in Science (DUCE)", "shortName": "BEd Sc (DUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "duce-ba-ed", "academicUnitId": "duce", "departmentId": "dept-duce-fohss", "name": "Bachelor of Arts with Education (DUCE)", "shortName": "BA Ed (DUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "duce-bsc-ed", "academicUnitId": "duce", "departmentId": "dept-duce-fos", "name": "Bachelor of Science with Education (DUCE)", "shortName": "BSc Ed (DUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # MUCE
    {"id": "muce-ba-ed", "academicUnitId": "muce", "departmentId": "dept-muce-foed", "name": "Bachelor of Arts with Education (MUCE)", "shortName": "BA Ed (MUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "muce-bsc-ed", "academicUnitId": "muce", "departmentId": "dept-muce-foed", "name": "Bachelor of Science with Education (MUCE)", "shortName": "BSc Ed (MUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},
    {"id": "muce-bsc-chem", "academicUnitId": "muce", "departmentId": "dept-muce-fosc", "name": "Bachelor of Science in Chemistry (MUCE)", "shortName": "BSc Chem (MUCE)", "awardLevel": "Bachelor Degree", "durationYears": 3},

    # UDSM-MRI
    {"id": "dip-mri-geology", "academicUnitId": "udsm-mri", "departmentId": "dept-mri-geology", "name": "Ordinary Diploma in Geology and Mineral Exploration", "shortName": "Dip Geology (MRI)", "awardLevel": "Ordinary Diploma", "durationYears": 3},
    {"id": "dip-mri-mining", "academicUnitId": "udsm-mri", "departmentId": "dept-mri-mining", "name": "Ordinary Diploma in Mining Engineering", "shortName": "Dip Mining (MRI)", "awardLevel": "Ordinary Diploma", "durationYears": 3},
]

for p in PROGRAMMES:
    p["universityId"] = "udsm"
    p["studyMode"] = "Full-Time"
    p["academicYear"] = "2025/2026"
    p["verified"] = True
    p["source"] = CITATION

print(f"Loaded {len(UNITS)} Units, {len(DEPARTMENTS)} Departments, {len(PROGRAMMES)} Programmes.")
