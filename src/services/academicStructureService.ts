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
import { ProgrammeRecord, DegreeLevel, CountryRecord } from '../types';
import { degreeProgrammeService, normalizeProgrammeRecord } from './degreeProgrammeService';
export type { ProgrammeRecord, DegreeLevel, CountryRecord };

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
  countryId?: string;
  flag?: string;
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

// Global Supported Countries
export const GLOBAL_COUNTRIES: CountryRecord[] = [
  {
    id: 'tz',
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    dialCode: '+255',
    currency: 'TZS',
    status: 'active',
  },
  {
    id: 'ke',
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    dialCode: '+254',
    currency: 'KES',
    status: 'active',
  },
  {
    id: 'ug',
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    dialCode: '+256',
    currency: 'UGX',
    status: 'active',
  },
  {
    id: 'rw',
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    dialCode: '+250',
    currency: 'RWF',
    status: 'active',
  },
  {
    id: 'ng',
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    dialCode: '+234',
    currency: 'NGN',
    status: 'active',
  },
  {
    id: 'gh',
    code: 'GH',
    name: 'Ghana',
    flag: '🇬🇭',
    dialCode: '+233',
    currency: 'GHS',
    status: 'active',
  },
  {
    id: 'za',
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    dialCode: '+27',
    currency: 'ZAR',
    status: 'active',
  },
  {
    id: 'gb',
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    dialCode: '+44',
    currency: 'GBP',
    status: 'active',
  },
  {
    id: 'us',
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    dialCode: '+1',
    currency: 'USD',
    status: 'active',
  },
  {
    id: 'ca',
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    dialCode: '+1',
    currency: 'CAD',
    status: 'active',
  },
  {
    id: 'other',
    code: 'OTHER',
    name: 'Other International',
    flag: '🌐',
    dialCode: '+',
    currency: 'USD',
    status: 'active',
  },
];

// Default Universities List (Global University-Agnostic Catalogue)
export const DEFAULT_UNIVERSITIES: UniversityRecord[] = [
  // Tanzania
  {
    id: 'udsm',
    name: 'University of Dar es Salaam',
    shortName: 'UDSM',
    country: 'Tanzania',
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
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
    countryId: 'tz',
    flag: '🇹🇿',
    status: 'active',
    campus: 'Upanga, Dar es Salaam',
    established: '2007',
    badge: 'Available',
    verified: true,
  },
  // Kenya
  {
    id: 'uon',
    name: 'University of Nairobi',
    shortName: 'UoN',
    country: 'Kenya',
    countryId: 'ke',
    flag: '🇰🇪',
    status: 'active',
    campus: 'Main Campus, Nairobi',
    established: '1970',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'ku',
    name: 'Kenyatta University',
    shortName: 'KU',
    country: 'Kenya',
    countryId: 'ke',
    flag: '🇰🇪',
    status: 'active',
    campus: 'Main Campus, Kahawa',
    established: '1985',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'strath',
    name: 'Strathmore University',
    shortName: 'Strathmore',
    country: 'Kenya',
    countryId: 'ke',
    flag: '🇰🇪',
    status: 'active',
    campus: 'Madaraka Estate, Nairobi',
    established: '1961',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'jkuat',
    name: 'Jomo Kenyatta University of Agriculture and Technology',
    shortName: 'JKUAT',
    country: 'Kenya',
    countryId: 'ke',
    flag: '🇰🇪',
    status: 'active',
    campus: 'Juja Main Campus',
    established: '1994',
    badge: 'Available',
    verified: true,
  },
  // Uganda
  {
    id: 'mak',
    name: 'Makerere University',
    shortName: 'MAK',
    country: 'Uganda',
    countryId: 'ug',
    flag: '🇺🇬',
    status: 'active',
    campus: 'Makerere Hill, Kampala',
    established: '1922',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'kyu',
    name: 'Kyambogo University',
    shortName: 'KYU',
    country: 'Uganda',
    countryId: 'ug',
    flag: '🇺🇬',
    status: 'active',
    campus: 'Kyambogo Hill, Kampala',
    established: '2003',
    badge: 'Available',
    verified: true,
  },
  // Rwanda
  {
    id: 'ur',
    name: 'University of Rwanda',
    shortName: 'UR',
    country: 'Rwanda',
    countryId: 'rw',
    flag: '🇷🇼',
    status: 'active',
    campus: 'Gikondo Campus, Kigali',
    established: '2013',
    badge: 'Available',
    verified: true,
  },
  // Nigeria
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    country: 'Nigeria',
    countryId: 'ng',
    flag: '🇳🇬',
    status: 'active',
    campus: 'Akoka, Lagos',
    established: '1962',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    country: 'Nigeria',
    countryId: 'ng',
    flag: '🇳🇬',
    status: 'active',
    campus: 'Ibadan Main Campus',
    established: '1948',
    badge: 'Available',
    verified: true,
  },
  // Ghana
  {
    id: 'ug-gh',
    name: 'University of Ghana',
    shortName: 'UG',
    country: 'Ghana',
    countryId: 'gh',
    flag: '🇬🇭',
    status: 'active',
    campus: 'Legon Campus, Accra',
    established: '1948',
    badge: 'Available',
    verified: true,
  },
  // South Africa
  {
    id: 'uct',
    name: 'University of Cape Town',
    shortName: 'UCT',
    country: 'South Africa',
    countryId: 'za',
    flag: '🇿🇦',
    status: 'active',
    campus: 'Rondebosch, Cape Town',
    established: '1829',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'wits',
    name: 'University of the Witwatersrand',
    shortName: 'Wits',
    country: 'South Africa',
    countryId: 'za',
    flag: '🇿🇦',
    status: 'active',
    campus: 'Braamfontein, Johannesburg',
    established: '1922',
    badge: 'Available',
    verified: true,
  },
  // United Kingdom
  {
    id: 'oxford',
    name: 'University of Oxford',
    shortName: 'Oxford',
    country: 'United Kingdom',
    countryId: 'gb',
    flag: '🇬🇧',
    status: 'active',
    campus: 'Oxford, England',
    established: '1096',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'cambridge',
    name: 'University of Cambridge',
    shortName: 'Cambridge',
    country: 'United Kingdom',
    countryId: 'gb',
    flag: '🇬🇧',
    status: 'active',
    campus: 'Cambridge, England',
    established: '1209',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'imperial',
    name: 'Imperial College London',
    shortName: 'Imperial',
    country: 'United Kingdom',
    countryId: 'gb',
    flag: '🇬🇧',
    status: 'active',
    campus: 'South Kensington, London',
    established: '1907',
    badge: 'Available',
    verified: true,
  },
  // United States
  {
    id: 'harvard',
    name: 'Harvard University',
    shortName: 'Harvard',
    country: 'United States',
    countryId: 'us',
    flag: '🇺🇸',
    status: 'active',
    campus: 'Cambridge, Massachusetts',
    established: '1636',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    shortName: 'MIT',
    country: 'United States',
    countryId: 'us',
    flag: '🇺🇸',
    status: 'active',
    campus: 'Cambridge, Massachusetts',
    established: '1861',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    shortName: 'Stanford',
    country: 'United States',
    countryId: 'us',
    flag: '🇺🇸',
    status: 'active',
    campus: 'Stanford, California',
    established: '1885',
    badge: 'Available',
    verified: true,
  },
  // Canada
  {
    id: 'utoronto',
    name: 'University of Toronto',
    shortName: 'U of T',
    country: 'Canada',
    countryId: 'ca',
    flag: '🇨🇦',
    status: 'active',
    campus: 'Toronto, Ontario',
    established: '1827',
    badge: 'Available',
    verified: true,
  },
  {
    id: 'ubc',
    name: 'University of British Columbia',
    shortName: 'UBC',
    country: 'Canada',
    countryId: 'ca',
    flag: '🇨🇦',
    status: 'active',
    campus: 'Vancouver, British Columbia',
    established: '1908',
    badge: 'Available',
    verified: true,
  },
  // Other International
  {
    id: 'other-uni',
    name: 'Other Academic Institution',
    shortName: 'Other',
    country: 'Other International',
    countryId: 'other',
    flag: '🌐',
    status: 'active',
    campus: 'General Campus',
    established: 'Global',
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
  // UoN (Kenya)
  {
    id: 'uon-fst',
    universityId: 'uon',
    name: 'Faculty of Science and Technology',
    shortName: 'FST',
    abbreviation: 'FST',
    type: 'School',
    campus: 'Chiromo Campus, Nairobi',
    status: 'active',
    verified: true,
  },
  {
    id: 'uon-fbms',
    universityId: 'uon',
    name: 'Faculty of Business and Management Sciences',
    shortName: 'FBMS',
    abbreviation: 'FBMS',
    type: 'School',
    campus: 'Lower Kabete Campus, Nairobi',
    status: 'active',
    verified: true,
  },
  // KU (Kenya)
  {
    id: 'ku-spas',
    universityId: 'ku',
    name: 'School of Pure and Applied Sciences',
    shortName: 'SPAS',
    abbreviation: 'SPAS',
    type: 'School',
    campus: 'Main Campus, Kahawa',
    status: 'active',
    verified: true,
  },
  // Strathmore (Kenya)
  {
    id: 'strath-scit',
    universityId: 'strath',
    name: 'School of Computing and Informatics',
    shortName: 'SCIT',
    abbreviation: 'SCIT',
    type: 'School',
    campus: 'Madaraka Estate, Nairobi',
    status: 'active',
    verified: true,
  },
  // Makerere (Uganda)
  {
    id: 'mak-cocis',
    universityId: 'mak',
    name: 'College of Computing and Information Sciences',
    shortName: 'CoCIS',
    abbreviation: 'CoCIS',
    type: 'College',
    campus: 'Makerere Main Campus, Kampala',
    status: 'active',
    verified: true,
  },
  {
    id: 'mak-cobams',
    universityId: 'mak',
    name: 'College of Business and Management Sciences',
    shortName: 'CoBAMS',
    abbreviation: 'CoBAMS',
    type: 'College',
    campus: 'Makerere Main Campus, Kampala',
    status: 'active',
    verified: true,
  },
  // University of Rwanda (Rwanda)
  {
    id: 'ur-cst',
    universityId: 'ur',
    name: 'College of Science and Technology',
    shortName: 'CST',
    abbreviation: 'CST',
    type: 'College',
    campus: 'Nyarugenge Campus, Kigali',
    status: 'active',
    verified: true,
  },
  // University of Lagos (Nigeria)
  {
    id: 'unilag-science',
    universityId: 'unilag',
    name: 'Faculty of Science',
    shortName: 'Science',
    abbreviation: 'Science',
    type: 'School',
    campus: 'Akoka Campus, Lagos',
    status: 'active',
    verified: true,
  },
  // University of Cape Town (South Africa)
  {
    id: 'uct-science',
    universityId: 'uct',
    name: 'Faculty of Science',
    shortName: 'Science',
    abbreviation: 'Science',
    type: 'School',
    campus: 'Upper Campus, Cape Town',
    status: 'active',
    verified: true,
  },
  // University of Oxford (UK)
  {
    id: 'oxford-mpls',
    universityId: 'oxford',
    name: 'Mathematical, Physical and Life Sciences Division',
    shortName: 'MPLS',
    abbreviation: 'MPLS',
    type: 'School',
    campus: 'Oxford City Campus',
    status: 'active',
    verified: true,
  },
  // Harvard University (US)
  {
    id: 'harvard-seas',
    universityId: 'harvard',
    name: 'John A. Paulson School of Engineering and Applied Sciences',
    shortName: 'SEAS',
    abbreviation: 'SEAS',
    type: 'School',
    campus: 'Cambridge, Massachusetts',
    status: 'active',
    verified: true,
  },
  // Other International
  {
    id: 'other-general-unit',
    universityId: 'other-uni',
    name: 'General Faculty of Arts & Sciences',
    shortName: 'FAS',
    abbreviation: 'FAS',
    type: 'School',
    campus: 'Global Campus',
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
  // UoN FST
  {
    id: 'uon-dept-cs',
    academicUnitId: 'uon-fst',
    universityId: 'uon',
    name: 'Department of Computing & Informatics',
    verified: true,
  },
  {
    id: 'uon-dept-math',
    academicUnitId: 'uon-fst',
    universityId: 'uon',
    name: 'Department of Mathematics',
    verified: true,
  },
  // UoN FBMS
  {
    id: 'uon-dept-finance',
    academicUnitId: 'uon-fbms',
    universityId: 'uon',
    name: 'Department of Finance and Accounting',
    verified: true,
  },
  // KU SPAS
  {
    id: 'ku-dept-cs',
    academicUnitId: 'ku-spas',
    universityId: 'ku',
    name: 'Department of Computing and Information Technology',
    verified: true,
  },
  // Strathmore SCIT
  {
    id: 'strath-dept-is',
    academicUnitId: 'strath-scit',
    universityId: 'strath',
    name: 'Department of Information Systems & Technology',
    verified: true,
  },
  // Makerere CoCIS
  {
    id: 'mak-dept-cs',
    academicUnitId: 'mak-cocis',
    universityId: 'mak',
    name: 'Department of Computer Science',
    verified: true,
  },
  // Makerere CoBAMS
  {
    id: 'mak-dept-econ',
    academicUnitId: 'mak-cobams',
    universityId: 'mak',
    name: 'Department of Economic Theory & Policy',
    verified: true,
  },
  // UR CST
  {
    id: 'ur-dept-cs',
    academicUnitId: 'ur-cst',
    universityId: 'ur',
    name: 'Department of Computer Science',
    verified: true,
  },
  // UNILAG Science
  {
    id: 'unilag-dept-cs',
    academicUnitId: 'unilag-science',
    universityId: 'unilag',
    name: 'Department of Computer Sciences',
    verified: true,
  },
  // UCT Science
  {
    id: 'uct-dept-cs',
    academicUnitId: 'uct-science',
    universityId: 'uct',
    name: 'Department of Computer Science',
    verified: true,
  },
  // Oxford MPLS
  {
    id: 'oxford-dept-cs',
    academicUnitId: 'oxford-mpls',
    universityId: 'oxford',
    name: 'Department of Computer Science',
    verified: true,
  },
  // Harvard SEAS
  {
    id: 'harvard-dept-cs',
    academicUnitId: 'harvard-seas',
    universityId: 'harvard',
    name: 'Computer Science Area',
    verified: true,
  },
  // Other International
  {
    id: 'other-dept-general',
    academicUnitId: 'other-general-unit',
    universityId: 'other-uni',
    name: 'General Academic Department',
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
  // UoN
  {
    id: 'uon-bsc-cs',
    departmentId: 'uon-dept-cs',
    academicUnitId: 'uon-fst',
    universityId: 'uon',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'uon-bsc-actuarial',
    departmentId: 'uon-dept-math',
    academicUnitId: 'uon-fst',
    universityId: 'uon',
    name: 'Bachelor of Science in Actuarial Science',
    shortName: 'BSc Actuarial',
    durationYears: 4,
    verified: true,
  },
  {
    id: 'uon-bcom',
    departmentId: 'uon-dept-finance',
    academicUnitId: 'uon-fbms',
    universityId: 'uon',
    name: 'Bachelor of Commerce',
    shortName: 'BCom',
    durationYears: 4,
    verified: true,
  },
  // KU
  {
    id: 'ku-bsc-it',
    departmentId: 'ku-dept-cs',
    academicUnitId: 'ku-spas',
    universityId: 'ku',
    name: 'Bachelor of Science in Information Technology',
    shortName: 'BSc IT',
    durationYears: 4,
    verified: true,
  },
  // Strathmore
  {
    id: 'strath-bbit',
    departmentId: 'strath-dept-is',
    academicUnitId: 'strath-scit',
    universityId: 'strath',
    name: 'Bachelor of Business Information Technology',
    shortName: 'BBIT',
    durationYears: 4,
    verified: true,
  },
  // Makerere
  {
    id: 'mak-bsc-cs',
    departmentId: 'mak-dept-cs',
    academicUnitId: 'mak-cocis',
    universityId: 'mak',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'mak-bcom',
    departmentId: 'mak-dept-econ',
    academicUnitId: 'mak-cobams',
    universityId: 'mak',
    name: 'Bachelor of Commerce',
    shortName: 'BCom',
    durationYears: 3,
    verified: true,
  },
  // UR
  {
    id: 'ur-bsc-cs',
    departmentId: 'ur-dept-cs',
    academicUnitId: 'ur-cst',
    universityId: 'ur',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 4,
    verified: true,
  },
  // UNILAG
  {
    id: 'unilag-bsc-cs',
    departmentId: 'unilag-dept-cs',
    academicUnitId: 'unilag-science',
    universityId: 'unilag',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 4,
    verified: true,
  },
  // UCT
  {
    id: 'uct-bsc-cs',
    departmentId: 'uct-dept-cs',
    academicUnitId: 'uct-science',
    universityId: 'uct',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 3,
    verified: true,
  },
  // Oxford
  {
    id: 'oxford-ba-cs',
    departmentId: 'oxford-dept-cs',
    academicUnitId: 'oxford-mpls',
    universityId: 'oxford',
    name: 'Bachelor of Arts in Computer Science',
    shortName: 'BA CS',
    durationYears: 3,
    verified: true,
  },
  // Harvard
  {
    id: 'harvard-ab-cs',
    departmentId: 'harvard-dept-cs',
    academicUnitId: 'harvard-seas',
    universityId: 'harvard',
    name: 'Bachelor of Arts in Computer Science',
    shortName: 'AB CS',
    durationYears: 4,
    verified: true,
  },
  // Other International
  {
    id: 'other-bsc-cs',
    departmentId: 'other-dept-general',
    academicUnitId: 'other-general-unit',
    universityId: 'other-uni',
    name: 'Bachelor of Science in Computer Science',
    shortName: 'BSc CS',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'other-bba',
    departmentId: 'other-dept-general',
    academicUnitId: 'other-general-unit',
    universityId: 'other-uni',
    name: 'Bachelor of Business Administration',
    shortName: 'BBA',
    durationYears: 3,
    verified: true,
  },
  {
    id: 'other-ba-general',
    departmentId: 'other-dept-general',
    academicUnitId: 'other-general-unit',
    universityId: 'other-uni',
    name: 'Bachelor of Arts',
    shortName: 'BA',
    durationYears: 3,
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
    ].map(normalizeProgrammeRecord);

    // Register all global programmes with degreeProgrammeService
    degreeProgrammeService.registerProgrammes(this.allProgrammesInMemory);
  }

  /**
   * 0. Get all supported Countries
   */
  async getCountries(): Promise<CountryRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'countries'));
      if (!snap.empty) {
        const fetched: CountryRecord[] = [];
        snap.forEach((docSnap) => {
          fetched.push(docSnap.data() as CountryRecord);
        });
        if (fetched.length > 0) {
          return fetched;
        }
      }
    } catch (err) {
      // offline fallback
    }
    return GLOBAL_COUNTRIES;
  }

  /**
   * 1. Get all supported Universities
   * Returns list and supports optional filtering by country ID or name
   */
  async getUniversities(countryFilter?: string): Promise<UniversityRecord[]> {
    let list: UniversityRecord[] = [];

    if (this.universitiesCache && this.universitiesCache.length > 0) {
      list = this.universitiesCache;
    } else {
      try {
        const snap = await getDocs(collection(db, 'universities'));
        if (!snap.empty) {
          const fetched: UniversityRecord[] = [];
          snap.forEach((docSnap) => {
            fetched.push(docSnap.data() as UniversityRecord);
          });
          if (fetched.length > 0) {
            this.universitiesCache = fetched;
            list = fetched;
          }
        }
      } catch (err) {
        console.warn('AcademicStructureService: Firestore universities read note (using verified defaults):', err);
      }

      if (list.length === 0) {
        this.universitiesCache = DEFAULT_UNIVERSITIES;
        list = DEFAULT_UNIVERSITIES;
      }
    }

    if (countryFilter && countryFilter.trim()) {
      const cleanFilter = countryFilter.toLowerCase().trim();
      return list.filter((u) => {
        const cId = (u.countryId || '').toLowerCase().trim();
        const cName = (u.country || '').toLowerCase().trim();
        return cId === cleanFilter || cName === cleanFilter || cName.includes(cleanFilter);
      });
    }

    return list;
  }

  /**
   * 2. Get Academic Units (Colleges, Schools, Institutes, Centres, Campuses) for a University
   * Queries Firestore with index: universityId == id
   */
  async getInstitutions(universityId: string): Promise<AcademicUnitRecord[]> {
    const cleanId = (universityId || '').toLowerCase().trim();
    if (!cleanId) return [];

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
  async getDepartments(academicUnitId: string, universityId?: string): Promise<DepartmentRecord[]> {
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
   * Strictly verifies that programmes belong to the given department.
   */
  async getProgrammes(
    departmentId: string,
    academicUnitId?: string,
    universityId?: string
  ): Promise<ProgrammeRecord[]> {
    const cleanDeptId = (departmentId || '').toLowerCase().trim();
    if (!cleanDeptId) return [];
    return degreeProgrammeService.getProgrammesByDepartment(cleanDeptId, academicUnitId, universityId);
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
    universityId?: string;
    college?: string;
    institutionId?: string;
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
    // 1. Resolve University dynamically
    let uniId = (profile.universityId || '').toLowerCase().trim();
    if (!uniId && profile.university) {
      const rawUni = (profile.university || '').toLowerCase().trim();
      const matchedUni = DEFAULT_UNIVERSITIES.find((u) => {
        const uId = u.id.toLowerCase();
        const uShort = u.shortName.toLowerCase();
        const uName = u.name.toLowerCase();
        return rawUni === uId || rawUni === uShort || rawUni.includes(uShort) || rawUni.includes(uName) || uName.includes(rawUni);
      });
      if (matchedUni) {
        uniId = matchedUni.id;
      } else {
        uniId = rawUni.replace(/\s+/g, '-');
      }
    }
    if (!uniId) {
      uniId = 'udsm';
    }

    // 2. Resolve Academic Unit
    let unitId: string | undefined = profile.institutionId;
    const rawCollege = (profile.college || '').toLowerCase();
    const matchedUnit = this.allUnitsInMemory.find((u) => {
      if (u.universityId !== uniId) return false;
      const uName = u.name.toLowerCase();
      const uShort = (u.shortName || '').toLowerCase();
      const uAbbr = (u.abbreviation || '').toLowerCase();
      return (
        rawCollege === u.id ||
        rawCollege.includes(u.id) ||
        (uShort && rawCollege.includes(uShort)) ||
        (uAbbr && rawCollege.includes(uAbbr)) ||
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

    // If programmeId is already provided, verify and resolve directly by ID
    if (programmeId) {
      const cleanProgId = programmeId.toLowerCase().trim();
      const foundById = this.allProgrammesInMemory.find(
        (p) => p.id.toLowerCase() === cleanProgId
      );
      if (foundById) {
        programmeId = foundById.id;
        durationYears = foundById.durationYears || 3;
        if (!departmentId) departmentId = foundById.departmentId;
        if (!unitId) unitId = foundById.academicUnitId;
        return {
          universityId: uniId,
          unitId,
          departmentId,
          programmeId,
          durationYears,
        };
      }
    }

    // Resolve by Department first to prevent cross-department contamination
    if (rawProg) {
      let matchedProg: ProgrammeRecord | undefined;

      // 1st Priority: Match strictly WITHIN the user's specific department
      if (departmentId) {
        const cleanDept = departmentId.toLowerCase().trim();
        matchedProg = this.allProgrammesInMemory.find((p) => {
          if (p.departmentId.toLowerCase() !== cleanDept) return false;
          const pName = p.name.toLowerCase();
          const pShort = (p.shortName || '').toLowerCase();
          return (
            rawProg === p.id.toLowerCase() ||
            rawProg === pName ||
            (pShort && rawProg === pShort) ||
            pName.includes(rawProg) ||
            rawProg.includes(pName)
          );
        });
      }

      // 2nd Priority: If no department filter provided, match within unit
      if (!matchedProg && !departmentId && unitId) {
        const cleanUnit = unitId.toLowerCase().trim();
        matchedProg = this.allProgrammesInMemory.find((p) => {
          if (p.academicUnitId.toLowerCase() !== cleanUnit) return false;
          const pName = p.name.toLowerCase();
          const pShort = (p.shortName || '').toLowerCase();
          return (
            rawProg === p.id.toLowerCase() ||
            rawProg === pName ||
            (pShort && rawProg === pShort) ||
            pName.includes(rawProg) ||
            rawProg.includes(pName)
          );
        });
      }

      // 3rd Priority: Only if no department and no unit, search global list
      if (!matchedProg && !departmentId && !unitId) {
        matchedProg = this.allProgrammesInMemory.find((p) => {
          const pName = p.name.toLowerCase();
          const pShort = (p.shortName || '').toLowerCase();
          return (
            rawProg === p.id.toLowerCase() ||
            rawProg === pName ||
            (pShort && rawProg === pShort) ||
            pName.includes(rawProg) ||
            rawProg.includes(pName)
          );
        });
      }

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

    // 0. Sync Countries
    for (const country of GLOBAL_COUNTRIES) {
      try {
        await setDoc(doc(db, 'countries', country.id), country, { merge: true });
      } catch (err) {
        console.error(`Failed to sync country ${country.id}:`, err);
      }
    }

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
