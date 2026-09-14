/**
 * Academic Structure Service
 * 
 * Provides database-driven hierarchy for Tanzanian Universities:
 * University → College / School / Institute / Centre / Campus → Department → Programme → Year of Study → Semester
 *
 * Implements:
 * 1. Single source of truth from Official UDSM Undergraduate Prospectus 2025/2026
 * 2. Multi-university extensible architecture (UDSM, UDOM, SUA, MUST, ARU, SUZA, MUHAS)
 * 3. On-demand, indexed Firestore querying without loading unnecessary records
 * 4. Fast in-memory cache to prevent repeated database requests
 * 5. Robust offline and error fallback mechanisms
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  AUDITED_ACADEMIC_UNITS,
  AUDITED_DEPARTMENTS,
  AUDITED_PROGRAMMES,
  OFFICIAL_UDSM_UNIVERSITY,
} from '../data/udsmAuditedCatalogue2025';

export type AcademicUnitType =
  | 'College'
  | 'School'
  | 'Institute'
  | 'Centre'
  | 'Campus'
  | 'Constituent College';

export interface UniversityRecord {
  id: string;
  name: string;
  shortName: string;
  country: string;
  status: 'active' | 'coming_soon';
  campus?: string;
  established?: string;
  badge?: string;
  verified?: boolean;
}

export interface AcademicUnitRecord {
  id: string;
  universityId: string;
  name: string;
  shortName?: string;
  abbreviation?: string;
  type: AcademicUnitType;
  campus?: string;
  established?: string;
  status?: 'active' | 'coming_soon';
  verified?: boolean;
  source?: string;
  academicYear?: string;
}

export interface DepartmentRecord {
  id: string;
  academicUnitId: string;
  universityId: string;
  name: string;
  shortName?: string;
  verified?: boolean;
  source?: string;
}

export interface ProgrammeRecord {
  id: string;
  departmentId: string;
  academicUnitId: string;
  universityId: string;
  name: string;
  shortName?: string;
  durationYears: number;
  awardLevel?: string;
  studyMode?: string;
  academicYear?: string;
  verified?: boolean;
  source?: string;
}

// Default Universities List
export const DEFAULT_UNIVERSITIES: UniversityRecord[] = [
  {
    id: 'udsm',
    name: 'University of Dar es Salaam',
    shortName: 'UDSM',
    country: 'Tanzania',
    status: 'active',
    campus: 'Mlimani Main Campus',
    established: '1961',
    badge: 'Official Prospectus 2025/2026',
    verified: true,
  },
  {
    id: 'udom',
    name: 'University of Dodoma',
    shortName: 'UDOM',
    country: 'Tanzania',
    status: 'active',
    campus: 'Dodoma Campus',
    established: '2007',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'sua',
    name: 'Sokoine University of Agriculture',
    shortName: 'SUA',
    country: 'Tanzania',
    status: 'active',
    campus: 'Morogoro Main Campus',
    established: '1984',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'must',
    name: 'Mbeya University of Science & Tech',
    shortName: 'MUST',
    country: 'Tanzania',
    status: 'active',
    campus: 'Mbeya Campus',
    established: '2012',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'aru',
    name: 'Ardhi University',
    shortName: 'ARU',
    country: 'Tanzania',
    status: 'active',
    campus: 'Observation Hill, Dar es Salaam',
    established: '2007',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'suza',
    name: 'State University of Zanzibar',
    shortName: 'SUZA',
    country: 'Tanzania',
    status: 'active',
    campus: 'Tunguu Campus, Zanzibar',
    established: '2001',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'muhas',
    name: 'Muhimbili University of Health & Allied Sciences',
    shortName: 'MUHAS',
    country: 'Tanzania',
    status: 'active',
    campus: 'Upanga, Dar es Salaam',
    established: '2007',
    badge: 'Available',
    verified: true,
  },
];

// Additional universities data for national multi-institution support
const OTHER_UNIVERSITIES_UNITS: AcademicUnitRecord[] = [
  // UDOM
  {
    id: 'udom-cive',
    universityId: 'udom',
    name: 'College of Informatics and Virtual Education',
    shortName: 'CIVE',
    abbreviation: 'CIVE',
    type: 'College',
    campus: 'UDOM Dodoma',
    status: 'active',
    verified: true,
  },
  {
    id: 'udom-cnms',
    universityId: 'udom',
    name: 'College of Natural and Mathematical Sciences',
    shortName: 'CNMS',
    abbreviation: 'CNMS',
    type: 'College',
    campus: 'UDOM Dodoma',
    status: 'active',
    verified: true,
  },
  {
    id: 'udom-chss',
    universityId: 'udom',
    name: 'College of Humanities and Social Sciences',
    shortName: 'CHSS',
    abbreviation: 'CHSS',
    type: 'College',
    campus: 'UDOM Dodoma',
    status: 'active',
    verified: true,
  },
  // SUA
  {
    id: 'sua-coa',
    universityId: 'sua',
    name: 'College of Agriculture',
    shortName: 'CoA',
    abbreviation: 'CoA',
    type: 'College',
    campus: 'SUA Main Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'sua-cfwt',
    universityId: 'sua',
    name: 'College of Forestry, Wildlife and Tourism',
    shortName: 'CFWT',
    abbreviation: 'CFWT',
    type: 'College',
    campus: 'SUA Main Campus',
    status: 'active',
    verified: true,
  },
  // MUST
  {
    id: 'must-cet',
    universityId: 'must',
    name: 'College of Engineering and Technology',
    shortName: 'CET',
    abbreviation: 'CET',
    type: 'College',
    campus: 'MUST Mbeya',
    status: 'active',
    verified: true,
  },
  {
    id: 'must-coict',
    universityId: 'must',
    name: 'College of Information and Communication Technology',
    shortName: 'CoICT',
    abbreviation: 'CoICT',
    type: 'College',
    campus: 'MUST Mbeya',
    status: 'active',
    verified: true,
  },
  // ARU
  {
    id: 'aru-sacem',
    universityId: 'aru',
    name: 'School of Architecture, Construction Economics and Management',
    shortName: 'SACEM',
    abbreviation: 'SACEM',
    type: 'School',
    campus: 'ARU Main Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'aru-serbi',
    universityId: 'aru',
    name: 'School of Earth Sciences, Real Estate, Business and Informatics',
    shortName: 'SERBI',
    abbreviation: 'SERBI',
    type: 'School',
    campus: 'ARU Main Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'aru-ssp',
    universityId: 'aru',
    name: 'School of Spatial Planning and Social Sciences',
    shortName: 'SSP',
    abbreviation: 'SSP',
    type: 'School',
    campus: 'ARU Main Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'aru-sees',
    universityId: 'aru',
    name: 'School of Environmental Science and Technology',
    shortName: 'SEES',
    abbreviation: 'SEES',
    type: 'School',
    campus: 'ARU Main Campus',
    status: 'active',
    verified: true,
  },
  // SUZA
  {
    id: 'suza-sccms',
    universityId: 'suza',
    name: 'School of Computing, Communication and Media Studies',
    shortName: 'SCCMS',
    abbreviation: 'SCCMS',
    type: 'School',
    campus: 'Tunguu Main Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'suza-shms',
    universityId: 'suza',
    name: 'School of Health and Medical Sciences',
    shortName: 'SHMS',
    abbreviation: 'SHMS',
    type: 'School',
    campus: 'Vuga Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'suza-soed',
    universityId: 'suza',
    name: 'School of Education',
    shortName: 'SoED',
    abbreviation: 'SoED',
    type: 'School',
    campus: 'Chwaka Campus',
    status: 'active',
    verified: true,
  },
  {
    id: 'suza-sbls',
    universityId: 'suza',
    name: 'School of Business and Law Studies',
    shortName: 'SBLS',
    abbreviation: 'SBLS',
    type: 'School',
    campus: 'Chwaka Campus',
    status: 'active',
    verified: true,
  },
  // UDOM CoED
  {
    id: 'udom-coed',
    universityId: 'udom',
    name: 'College of Education',
    shortName: 'CoED',
    abbreviation: 'CoED',
    type: 'College',
    campus: 'Dodoma Campus',
    status: 'active',
    verified: true,
  },
  // MUHAS
  {
    id: 'muhas-som',
    universityId: 'muhas',
    name: 'School of Medicine',
    shortName: 'SoM',
    abbreviation: 'SoM',
    type: 'School',
    campus: 'MUHAS Upanga',
    status: 'active',
    verified: true,
  },
];

const OTHER_UNIVERSITIES_DEPTS: DepartmentRecord[] = [
  // UDOM CIVE
  {
    id: 'udom-dept-cs',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Department of Computer Science',
    verified: true,
  },
  {
    id: 'udom-dept-is',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Department of Information Systems',
    verified: true,
  },
  {
    id: 'udom-dept-te',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Department of Telecommunications Engineering',
    verified: true,
  },
  // UDOM CNMS
  {
    id: 'udom-dept-math-stats',
    academicUnitId: 'udom-cnms',
    universityId: 'udom',
    name: 'Department of Mathematics and Statistics',
    verified: true,
  },
  {
    id: 'udom-dept-phys',
    academicUnitId: 'udom-cnms',
    universityId: 'udom',
    name: 'Department of Physics',
    verified: true,
  },
  // UDOM CHSS
  {
    id: 'udom-dept-pspa',
    academicUnitId: 'udom-chss',
    universityId: 'udom',
    name: 'Department of Political Science and Public Administration',
    verified: true,
  },
  {
    id: 'udom-dept-dev',
    academicUnitId: 'udom-chss',
    universityId: 'udom',
    name: 'Department of Development Studies',
    verified: true,
  },
  // ARU SACEM
  {
    id: 'aru-dept-arch',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Department of Architecture',
    verified: true,
  },
  {
    id: 'aru-dept-cem',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Department of Building Economics',
    verified: true,
  },
  {
    id: 'aru-dept-interior',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Department of Interior Design',
    verified: true,
  },
  // ARU SERBI
  {
    id: 'aru-dept-lmv',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Department of Land Management and Valuation',
    verified: true,
  },
  {
    id: 'aru-dept-geomatics',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Department of Geospatial Sciences and Technology',
    verified: true,
  },
  {
    id: 'aru-dept-csm',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Department of Computer Systems and Mathematics',
    verified: true,
  },
  // ARU SSP
  {
    id: 'aru-dept-urp',
    academicUnitId: 'aru-ssp',
    universityId: 'aru',
    name: 'Department of Urban and Regional Planning',
    verified: true,
  },
  // ARU SEES
  {
    id: 'aru-dept-env-eng',
    academicUnitId: 'aru-sees',
    universityId: 'aru',
    name: 'Department of Environmental Engineering',
    verified: true,
  },
  // SUZA SCCMS
  {
    id: 'suza-dept-csit',
    academicUnitId: 'suza-sccms',
    universityId: 'suza',
    name: 'Department of Computer Science and Information Technology',
    verified: true,
  },
  // SUZA SHMS
  {
    id: 'suza-dept-clinical',
    academicUnitId: 'suza-shms',
    universityId: 'suza',
    name: 'Department of Clinical Medicine',
    verified: true,
  },
  // SUZA SoED
  {
    id: 'suza-dept-sme',
    academicUnitId: 'suza-soed',
    universityId: 'suza',
    name: 'Department of Science and Mathematics Education',
    verified: true,
  },
  // SUZA SBLS
  {
    id: 'suza-dept-business',
    academicUnitId: 'suza-sbls',
    universityId: 'suza',
    name: 'Department of Business Administration',
    verified: true,
  },
  // SUA CoA
  {
    id: 'sua-dept-crop-science',
    academicUnitId: 'sua-coa',
    universityId: 'sua',
    name: 'Department of Crop Science and Horticulture',
    verified: true,
  },
  {
    id: 'sua-dept-animal-science',
    academicUnitId: 'sua-coa',
    universityId: 'sua',
    name: 'Department of Animal, Aquaculture and Range Sciences',
    verified: true,
  },
  // MUST CET
  {
    id: 'must-dept-civil',
    academicUnitId: 'must-cet',
    universityId: 'must',
    name: 'Department of Civil Engineering',
    verified: true,
  },
  {
    id: 'must-dept-electrical',
    academicUnitId: 'must-cet',
    universityId: 'must',
    name: 'Department of Electrical and Power Engineering',
    verified: true,
  },
  // MUHAS SoM
  {
    id: 'muhas-dept-internal-med',
    academicUnitId: 'muhas-som',
    universityId: 'muhas',
    name: 'Department of Internal Medicine',
    verified: true,
  },
  {
    id: 'muhas-dept-surgery',
    academicUnitId: 'muhas-som',
    universityId: 'muhas',
    name: 'Department of Surgery',
    verified: true,
  },
];

const OTHER_UNIVERSITIES_PROGRAMMES: ProgrammeRecord[] = [
  // UDOM CIVE
  {
    id: 'udom-bsc-cs',
    departmentId: 'udom-dept-cs',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'udom-bsc-se',
    departmentId: 'udom-dept-cs',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Bachelor of Science in Software Engineering',
    shortName: 'BSc SE',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'udom-bsc-is',
    departmentId: 'udom-dept-is',
    academicUnitId: 'udom-cive',
    universityId: 'udom',
    name: 'Bachelor of Science in Information Systems',
    shortName: 'BSc IS',
    durationYears: 3,
    verified: true,
  },
  // UDOM CNMS
  {
    id: 'udom-bsc-stats',
    departmentId: 'udom-dept-math-stats',
    academicUnitId: 'udom-cnms',
    universityId: 'udom',
    name: 'Bachelor of Science in Statistics',
    shortName: 'BSc Stats',
    durationYears: 3,
    verified: true,
  },
  // UDOM CHSS
  {
    id: 'udom-ba-pspa',
    departmentId: 'udom-dept-pspa',
    academicUnitId: 'udom-chss',
    universityId: 'udom',
    name: 'Bachelor of Arts in Political Science and Public Administration',
    shortName: 'BA PSPA',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'udom-ba-dev',
    departmentId: 'udom-dept-dev',
    academicUnitId: 'udom-chss',
    universityId: 'udom',
    name: 'Bachelor of Arts in Development Studies',
    shortName: 'BA DS',
    durationYears: 3,
    verified: true,
  },
  // ARU
  {
    id: 'aru-b-arch',
    departmentId: 'aru-dept-arch',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Bachelor of Architecture',
    shortName: 'B.Arch',
    durationYears: 5,
    verified: true,
  },
  {
    id: 'aru-bsc-be',
    departmentId: 'aru-dept-cem',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Bachelor of Science in Building Economics',
    shortName: 'BSc BE',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'aru-bsc-id',
    departmentId: 'aru-dept-interior',
    academicUnitId: 'aru-sacem',
    universityId: 'aru',
    name: 'Bachelor of Science in Interior Design',
    shortName: 'BSc ID',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'aru-bsc-lmv',
    departmentId: 'aru-dept-lmv',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Bachelor of Science in Land Management and Valuation',
    shortName: 'BSc LMV',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'aru-bsc-geomatics',
    departmentId: 'aru-dept-geomatics',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Bachelor of Science in Geomatics',
    shortName: 'BSc Geomatics',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'aru-bsc-ism',
    departmentId: 'aru-dept-csm',
    academicUnitId: 'aru-serbi',
    universityId: 'aru',
    name: 'Bachelor of Science in Information Systems Management',
    shortName: 'BSc ISM',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'aru-bsc-urp',
    departmentId: 'aru-dept-urp',
    academicUnitId: 'aru-ssp',
    universityId: 'aru',
    name: 'Bachelor of Science in Urban and Regional Planning',
    shortName: 'BSc URP',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'aru-bsc-env-eng',
    departmentId: 'aru-dept-env-eng',
    academicUnitId: 'aru-sees',
    universityId: 'aru',
    name: 'Bachelor of Science in Environmental Engineering',
    shortName: 'BSc Env Eng',
    durationYears: 4,
    verified: true,
  },
  // SUZA
  {
    id: 'suza-bsc-cs',
    departmentId: 'suza-dept-csit',
    academicUnitId: 'suza-sccms',
    universityId: 'suza',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'suza-bit',
    departmentId: 'suza-dept-csit',
    academicUnitId: 'suza-sccms',
    universityId: 'suza',
    name: 'Bachelor of Information Technology',
    shortName: 'BIT',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'suza-md',
    departmentId: 'suza-dept-clinical',
    academicUnitId: 'suza-shms',
    universityId: 'suza',
    name: 'Doctor of Medicine',
    shortName: 'MD',
    durationYears: 5,
    verified: true,
  },
  {
    id: 'suza-bsc-ed',
    departmentId: 'suza-dept-sme',
    academicUnitId: 'suza-soed',
    universityId: 'suza',
    name: 'Bachelor of Science with Education',
    shortName: 'BSc Ed',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'suza-bba',
    departmentId: 'suza-dept-business',
    academicUnitId: 'suza-sbls',
    universityId: 'suza',
    name: 'Bachelor of Business Administration',
    shortName: 'BBA',
    durationYears: 3,
    verified: true,
  },
  // SUA CoA
  {
    id: 'sua-bsc-agric-gen',
    departmentId: 'sua-dept-crop-science',
    academicUnitId: 'sua-coa',
    universityId: 'sua',
    name: 'Bachelor of Science in Agriculture General',
    shortName: 'BSc Agric',
    durationYears: 3,
    verified: true,
  },
  // MUST CET
  {
    id: 'must-beng-civil',
    departmentId: 'must-dept-civil',
    academicUnitId: 'must-cet',
    universityId: 'must',
    name: 'Bachelor of Civil Engineering',
    shortName: 'BEng Civil',
    durationYears: 4,
    verified: true,
  },
  // MUHAS SoM
  {
    id: 'muhas-md',
    departmentId: 'muhas-dept-internal-med',
    academicUnitId: 'muhas-som',
    universityId: 'muhas',
    name: 'Doctor of Medicine',
    shortName: 'MD',
    durationYears: 5,
    verified: true,
  },
];

class AcademicStructureService {
  // In-memory caching
  private universitiesCache: UniversityRecord[] | null = null;
  private unitsByUniversityCache = new Map<string, AcademicUnitRecord[]>();
  private departmentsByUnitCache = new Map<string, DepartmentRecord[]>();
  private programmesByDeptCache = new Map<string, ProgrammeRecord[]>();

  private allUnitsInMemory: AcademicUnitRecord[] = [];
  private allDeptsInMemory: DepartmentRecord[] = [];
  private allProgrammesInMemory: ProgrammeRecord[] = [];

  constructor() {
    this.initializeMemoryStore();
  }

  private initializeMemoryStore() {
    // Combine official audited UDSM records with other university structures
    this.allUnitsInMemory = [
      ...AUDITED_ACADEMIC_UNITS,
      ...OTHER_UNIVERSITIES_UNITS,
    ];

    this.allDeptsInMemory = [
      ...AUDITED_DEPARTMENTS,
      ...OTHER_UNIVERSITIES_DEPTS,
    ];

    this.allProgrammesInMemory = [
      ...AUDITED_PROGRAMMES,
      ...OTHER_UNIVERSITIES_PROGRAMMES,
    ];
  }

  /**
   * 1. Get all supported Universities
   * Returns list with UDSM as verified primary
   */
  async getUniversities(): Promise<UniversityRecord[]> {
    if (this.universitiesCache && this.universitiesCache.length > 0) {
      return this.universitiesCache;
    }

    try {
      const snap = await getDocs(collection(db, 'universities'));
      if (!snap.empty) {
        const fetched: UniversityRecord[] = [];
        snap.forEach((docSnap) => {
          fetched.push(docSnap.data() as UniversityRecord);
        });
        if (fetched.length > 0) {
          // Ensure UDSM is first
          fetched.sort((a, b) => (a.id === 'udsm' ? -1 : b.id === 'udsm' ? 1 : a.name.localeCompare(b.name)));
          this.universitiesCache = fetched;
          return fetched;
        }
      }
    } catch (err) {
      console.warn('AcademicStructureService: Firestore universities read note (using verified defaults):', err);
    }

    this.universitiesCache = DEFAULT_UNIVERSITIES;
    return DEFAULT_UNIVERSITIES;
  }

  /**
   * 2. Get Academic Units (Colleges, Schools, Institutes, Centres, Campuses) for a University
   * Queries Firestore with index: universityId == id
   */
  async getInstitutions(universityId: string): Promise<AcademicUnitRecord[]> {
    const cleanId = (universityId || 'udsm').toLowerCase().trim();

    if (this.unitsByUniversityCache.has(cleanId)) {
      return this.unitsByUniversityCache.get(cleanId)!;
    }

    try {
      const q = query(
        collection(db, 'academic_units'),
        where('universityId', '==', cleanId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const units: AcademicUnitRecord[] = [];
        snap.forEach((d) => {
          units.push(d.data() as AcademicUnitRecord);
        });

        // Type hierarchy order: College > Constituent College > School > Institute > Centre > Campus
        const typePriority: Record<AcademicUnitType, number> = {
          'College': 1,
          'Constituent College': 2,
          'School': 3,
          'Institute': 4,
          'Centre': 5,
          'Campus': 6,
        };

        units.sort((a, b) => {
          const pA = typePriority[a.type] || 99;
          const pB = typePriority[b.type] || 99;
          if (pA !== pB) return pA - pB;
          return a.name.localeCompare(b.name);
        });

        this.unitsByUniversityCache.set(cleanId, units);
        return units;
      }
    } catch (err) {
      console.warn(`AcademicStructureService: Firestore academic_units read error for ${cleanId}:`, err);
    }

    // Memory fallback
    const fallbackUnits = this.allUnitsInMemory.filter(
      (u) => u.universityId.toLowerCase() === cleanId
    );

    const typePriority: Record<AcademicUnitType, number> = {
      'College': 1,
      'Constituent College': 2,
      'School': 3,
      'Institute': 4,
      'Centre': 5,
      'Campus': 6,
    };

    fallbackUnits.sort((a, b) => {
      const pA = typePriority[a.type] || 99;
      const pB = typePriority[b.type] || 99;
      if (pA !== pB) return pA - pB;
      return a.name.localeCompare(b.name);
    });

    this.unitsByUniversityCache.set(cleanId, fallbackUnits);
    return fallbackUnits;
  }

  /**
   * 3. Get Departments under a specific Academic Unit
   * Queries Firestore with index: academicUnitId == id
   */
  async getDepartments(academicUnitId: string, universityId = 'udsm'): Promise<DepartmentRecord[]> {
    const cleanUnitId = (academicUnitId || '').toLowerCase().trim();

    if (!cleanUnitId) return [];

    if (this.departmentsByUnitCache.has(cleanUnitId)) {
      return this.departmentsByUnitCache.get(cleanUnitId)!;
    }

    try {
      const q = query(
        collection(db, 'departments'),
        where('academicUnitId', '==', cleanUnitId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const depts: DepartmentRecord[] = [];
        snap.forEach((d) => {
          depts.push(d.data() as DepartmentRecord);
        });

        depts.sort((a, b) => a.name.localeCompare(b.name));
        this.departmentsByUnitCache.set(cleanUnitId, depts);
        return depts;
      }
    } catch (err) {
      console.warn(`AcademicStructureService: Firestore departments read error for ${cleanUnitId}:`, err);
    }

    // Memory fallback
    const fallbackDepts = this.allDeptsInMemory.filter(
      (d) => d.academicUnitId.toLowerCase() === cleanUnitId
    );

    fallbackDepts.sort((a, b) => a.name.localeCompare(b.name));
    this.departmentsByUnitCache.set(cleanUnitId, fallbackDepts);
    return fallbackDepts;
  }

  /**
   * 4. Get Programmes under a specific Department
   * Queries Firestore with index: departmentId == id
   */
  async getProgrammes(
    departmentId: string,
    academicUnitId?: string,
    universityId = 'udsm'
  ): Promise<ProgrammeRecord[]> {
    const cleanDeptId = (departmentId || '').toLowerCase().trim();

    if (!cleanDeptId) return [];

    if (this.programmesByDeptCache.has(cleanDeptId)) {
      return this.programmesByDeptCache.get(cleanDeptId)!;
    }

    try {
      const q = query(
        collection(db, 'programmes'),
        where('departmentId', '==', cleanDeptId)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const progs: ProgrammeRecord[] = [];
        snap.forEach((d) => {
          progs.push(d.data() as ProgrammeRecord);
        });

        progs.sort((a, b) => a.name.localeCompare(b.name));
        this.programmesByDeptCache.set(cleanDeptId, progs);
        return progs;
      }
    } catch (err) {
      console.warn(`AcademicStructureService: Firestore programmes read error for ${cleanDeptId}:`, err);
    }

    // Memory fallback
    let fallbackProgs = this.allProgrammesInMemory.filter(
      (p) => p.departmentId.toLowerCase() === cleanDeptId
    );

    // If not found by dept directly but unit provided, look up by unit as gentle fallback
    if (fallbackProgs.length === 0 && academicUnitId) {
      fallbackProgs = this.allProgrammesInMemory.filter(
        (p) => p.academicUnitId.toLowerCase() === academicUnitId.toLowerCase()
      );
    }

    fallbackProgs.sort((a, b) => a.name.localeCompare(b.name));
    this.programmesByDeptCache.set(cleanDeptId, fallbackProgs);
    return fallbackProgs;
  }

  /**
   * 5. Get Years of Study options based on Programme duration
   * e.g. 3 years -> ['Year 1', 'Year 2', 'Year 3']
   */
  getYearsOfStudy(durationYears = 3): string[] {
    const years: string[] = [];
    const max = Math.max(1, Math.min(6, durationYears || 3));
    for (let i = 1; i <= max; i++) {
      years.push(`Year ${i}`);
    }
    return years;
  }

  /**
   * 6. Get Semester options
   */
  getSemesters(): string[] {
    return ['Semester 1', 'Semester 2'];
  }

  /**
   * 7. Intelligently map existing profile string values to matched hierarchy objects
   * Ensures existing profiles continue working seamlessly without corruption!
   */
  resolveProfileContext(profile: {
    university?: string;
    college?: string;
    department?: string;
    departmentId?: string;
    programme?: string;
    programmeId?: string;
    yearOfStudy?: string;
    semester?: string;
  }): {
    universityId: string;
    unitId?: string;
    departmentId?: string;
    programmeId?: string;
    durationYears: number;
  } {
    // 1. Resolve University
    let uniId = 'udsm';
    const rawUni = (profile.university || '').toLowerCase();
    if (rawUni.includes('dodoma') || rawUni === 'udom') uniId = 'udom';
    else if (rawUni.includes('sokoine') || rawUni === 'sua') uniId = 'sua';
    else if (rawUni.includes('mbeya') || rawUni === 'must') uniId = 'must';
    else if (rawUni.includes('ardhi') || rawUni === 'aru') uniId = 'aru';
    else if (rawUni.includes('zanzibar') || rawUni === 'suza') uniId = 'suza';
    else if (rawUni.includes('muhimbili') || rawUni === 'muhas') uniId = 'muhas';

    // 2. Resolve Academic Unit
    let unitId: string | undefined;
    const rawCollege = (profile.college || '').toLowerCase();
    const matchedUnit = this.allUnitsInMemory.find((u) => {
      if (u.universityId !== uniId) return false;
      const uName = u.name.toLowerCase();
      const uShort = u.shortName.toLowerCase();
      const uAbbr = (u.abbreviation || '').toLowerCase();
      return (
        rawCollege === u.id ||
        rawCollege.includes(u.id) ||
        rawCollege.includes(uShort) ||
        rawCollege.includes(uAbbr) ||
        uName.includes(rawCollege) ||
        rawCollege.includes(uName)
      );
    });
    if (matchedUnit) {
      unitId = matchedUnit.id;
    }

    // 3. Resolve Department
    let departmentId: string | undefined = profile.departmentId;
    if (!departmentId && profile.department) {
      const rawDept = profile.department.toLowerCase();
      const matchedDept = this.allDeptsInMemory.find((d) => {
        if (unitId && d.academicUnitId !== unitId) return false;
        const dName = d.name.toLowerCase();
        return rawDept === d.id || rawDept.includes(dName) || dName.includes(rawDept);
      });
      if (matchedDept) {
        departmentId = matchedDept.id;
      }
    }

    // 4. Resolve Programme
    let programmeId: string | undefined = profile.programmeId;
    let durationYears = 3;
    const rawProg = (profile.programme || '').toLowerCase();

    const matchedProg = this.allProgrammesInMemory.find((p) => {
      if (unitId && p.academicUnitId !== unitId) return false;
      const pName = p.name.toLowerCase();
      const pShort = (p.shortName || '').toLowerCase();
      return (
        rawProg === p.id ||
        rawProg.includes(p.id) ||
        (pShort && rawProg.includes(pShort)) ||
        pName.includes(rawProg) ||
        rawProg.includes(pName)
      );
    });

    if (matchedProg) {
      programmeId = matchedProg.id;
      durationYears = matchedProg.durationYears || 3;
      if (!departmentId) {
        departmentId = matchedProg.departmentId;
      }
      if (!unitId) {
        unitId = matchedProg.academicUnitId;
      }
    }

    return {
      universityId: uniId,
      unitId,
      departmentId,
      programmeId,
      durationYears,
    };
  }

  /**
   * 8. Validate complete academic hierarchy before profile persistence
   * Validates:
   * - University exists
   * - Academic Unit / College belongs to University
   * - Department belongs to Academic Unit
   * - Programme belongs to Department
   * - Year of Study is valid for degree duration
   * - Semester is valid (Semester 1 or Semester 2)
   */
  async validateAcademicProfile(profile: {
    universityId?: string;
    institutionId?: string;
    departmentId?: string;
    programmeId?: string;
    yearOfStudy?: string;
    semester?: string;
  }): Promise<{
    valid: boolean;
    error?: string;
    field?: 'university' | 'institution' | 'department' | 'programme' | 'yearOfStudy' | 'semester';
  }> {
    // 1. University validation
    const uniId = (profile.universityId || '').toLowerCase().trim();
    if (!uniId) {
      return { valid: false, error: 'Please select a University.', field: 'university' };
    }
    const universities = await this.getUniversities();
    const matchedUni = universities.find((u) => u.id.toLowerCase() === uniId);
    if (!matchedUni) {
      return { valid: false, error: 'The selected University is invalid or not recognized.', field: 'university' };
    }

    // 2. Institution / Academic Unit validation
    const instId = (profile.institutionId || '').toLowerCase().trim();
    if (!instId) {
      return {
        valid: false,
        error: 'Please select a College, School, or Institute.',
        field: 'institution',
      };
    }
    const institutions = await this.getInstitutions(matchedUni.id);
    const matchedInst = institutions.find((inst) => inst.id.toLowerCase() === instId);
    if (!matchedInst) {
      return {
        valid: false,
        error: `The selected Academic Unit does not belong to ${matchedUni.name}.`,
        field: 'institution',
      };
    }

    // 3. Department validation
    const deptId = (profile.departmentId || '').toLowerCase().trim();
    if (!deptId) {
      return {
        valid: false,
        error: 'Please select an Academic Department.',
        field: 'department',
      };
    }
    const departments = await this.getDepartments(matchedInst.id, matchedUni.id);
    const matchedDept = departments.find((dept) => dept.id.toLowerCase() === deptId);
    if (!matchedDept) {
      return {
        valid: false,
        error: `The selected Department does not belong to ${matchedInst.name}.`,
        field: 'department',
      };
    }

    // 4. Programme validation
    const progId = (profile.programmeId || '').toLowerCase().trim();
    if (!progId) {
      return {
        valid: false,
        error: 'Please select a Degree Programme.',
        field: 'programme',
      };
    }
    const programmes = await this.getProgrammes(matchedDept.id, matchedInst.id, matchedUni.id);
    const matchedProg = programmes.find((prog) => prog.id.toLowerCase() === progId);
    if (!matchedProg) {
      return {
        valid: false,
        error: `The selected Degree Programme does not belong to ${matchedDept.name}.`,
        field: 'programme',
      };
    }

    // 5. Year of Study validation
    const yos = (profile.yearOfStudy || '').trim();
    if (!yos) {
      return { valid: false, error: 'Please select your Year of Study.', field: 'yearOfStudy' };
    }
    const validYears = this.getYearsOfStudy(matchedProg.durationYears || 3);
    if (!validYears.includes(yos)) {
      return {
        valid: false,
        error: `Invalid Year of Study. ${matchedProg.name} has a duration of ${matchedProg.durationYears || 3} years (${validYears.join(', ')}).`,
        field: 'yearOfStudy',
      };
    }

    // 6. Semester validation
    const sem = (profile.semester || '').trim();
    if (!sem) {
      return { valid: false, error: 'Please select your current Semester.', field: 'semester' };
    }
    const validSemesters = this.getSemesters();
    if (!validSemesters.includes(sem)) {
      return {
        valid: false,
        error: 'Invalid Semester. Please select Semester 1 or Semester 2.',
        field: 'semester',
      };
    }

    return { valid: true };
  }

  /**
   * 9. Synchronize the complete official 2025/2026 Academic Structure into Firestore
   * Ensures that universities, academic_units, departments, and programmes exist in Firestore
   * with stable IDs and correct parent-child relationships.
   */
  async syncOfficialStructureToFirestore(): Promise<{
    universitiesCount: number;
    unitsCount: number;
    departmentsCount: number;
    programmesCount: number;
  }> {
    let universitiesCount = 0;
    let unitsCount = 0;
    let departmentsCount = 0;
    let programmesCount = 0;

    // 1. Sync Universities
    for (const uni of DEFAULT_UNIVERSITIES) {
      try {
        await setDoc(doc(db, 'universities', uni.id), uni, { merge: true });
        universitiesCount++;
      } catch (err) {
        console.error(`Failed to sync university ${uni.id}:`, err);
      }
    }

    // 2. Sync Academic Units
    for (const unit of this.allUnitsInMemory) {
      try {
        await setDoc(doc(db, 'academic_units', unit.id), unit, { merge: true });
        unitsCount++;
      } catch (err) {
        console.error(`Failed to sync academic unit ${unit.id}:`, err);
      }
    }

    // 3. Sync Departments
    for (const dept of this.allDeptsInMemory) {
      try {
        await setDoc(doc(db, 'departments', dept.id), dept, { merge: true });
        departmentsCount++;
      } catch (err) {
        console.error(`Failed to sync department ${dept.id}:`, err);
      }
    }

    // 4. Sync Programmes
    for (const prog of this.allProgrammesInMemory) {
      try {
        await setDoc(doc(db, 'programmes', prog.id), prog, { merge: true });
        programmesCount++;
      } catch (err) {
        console.error(`Failed to sync programme ${prog.id}:`, err);
      }
    }

    // Invalidate caches
    this.universitiesCache = null;
    this.unitsByUniversityCache.clear();
    this.departmentsByUnitCache.clear();
    this.programmesByDeptCache.clear();

    return {
      universitiesCount,
      unitsCount,
      departmentsCount,
      programmesCount,
    };
  }
}

export const academicStructureService = new AcademicStructureService();
