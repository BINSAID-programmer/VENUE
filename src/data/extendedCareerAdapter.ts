import {
  CareerPathProfile,
  CareerDisciplineCluster,
} from '../types';
import { EXTENDED_CAREER_PROFILES_PART1 } from './extendedCareerProfiles';
import { EXTENDED_CAREER_PROFILES_PART2 } from './extendedCareerProfilesPart2';

function inferDisciplineCluster(raw: any): {
  primary: CareerDisciplineCluster;
  secondary: CareerDisciplineCluster[];
} {
  const prog = (raw.programmeKeywords || []).join(' ').toLowerCase();
  const cat = (raw.category || '').toLowerCase();

  const clusters: CareerDisciplineCluster[] = [];

  if (
    prog.includes('mathematics') ||
    prog.includes('statistics') ||
    prog.includes('actuarial') ||
    prog.includes('quantitative') ||
    cat.includes('data science')
  ) {
    clusters.push('math_statistics_quantitative');
  }
  if (
    prog.includes('computer') ||
    prog.includes('software') ||
    prog.includes('information') ||
    prog.includes('cyber') ||
    prog.includes('telecommunications') ||
    cat.includes('software')
  ) {
    clusters.push('computing_software_ict');
  }
  if (
    prog.includes('civil') ||
    prog.includes('mechanical') ||
    prog.includes('electrical') ||
    prog.includes('chemical') ||
    prog.includes('mining') ||
    prog.includes('architecture') ||
    prog.includes('quantity survey') ||
    prog.includes('geomatics') ||
    prog.includes('water') ||
    cat.includes('engineering')
  ) {
    clusters.push('engineering_construction_geoscience');
  }
  if (
    prog.includes('accounting') ||
    prog.includes('finance') ||
    prog.includes('business') ||
    prog.includes('commerce') ||
    prog.includes('banking') ||
    prog.includes('marketing') ||
    prog.includes('procurement') ||
    prog.includes('human resource') ||
    cat.includes('finance') ||
    cat.includes('business')
  ) {
    clusters.push('business_finance_economics');
  }
  if (
    prog.includes('education') ||
    prog.includes('law') ||
    prog.includes('sociology') ||
    prog.includes('political') ||
    prog.includes('public administration') ||
    prog.includes('journalism') ||
    prog.includes('linguistics') ||
    prog.includes('development studies') ||
    cat.includes('education')
  ) {
    clusters.push('education_humanities_social_law');
  }
  if (
    prog.includes('medicine') ||
    prog.includes('public health') ||
    prog.includes('biology') ||
    prog.includes('chemistry') ||
    prog.includes('agriculture') ||
    prog.includes('environmental') ||
    prog.includes('forestry') ||
    prog.includes('wildlife') ||
    cat.includes('healthcare')
  ) {
    clusters.push('natural_health_agriculture');
  }

  if (clusters.length === 0) {
    clusters.push('general_interdisciplinary');
  }

  return {
    primary: clusters[0],
    secondary: clusters.slice(1),
  };
}

function adaptRawProfile(raw: any): CareerPathProfile {
  const { primary, secondary } = inferDisciplineCluster(raw);
  const skills: string[] = Array.isArray(raw.requiredSkills)
    ? raw.requiredSkills.map((s: any) => s.name)
    : [];

  const courseMappingRules = Array.isArray(raw.requiredSkills)
    ? raw.requiredSkills.map((s: any) => ({
        keywords: (s.relatedCourseKeywords || []).map((k: string) => k.toLowerCase()),
        codePrefixes: (raw.courseCodeKeywords || []).slice(0, 4),
        whyItMatters: s.description || `Builds foundational mastery in ${s.name} for ${raw.title}.`,
        skillsDeveloped: [s.name],
        careersSupported: [raw.title],
      }))
    : [];

  if (Array.isArray(raw.courseTitleKeywords) && raw.courseTitleKeywords.length > 0) {
    courseMappingRules.push({
      keywords: raw.courseTitleKeywords.map((k: string) => k.toLowerCase()),
      codePrefixes: raw.courseCodeKeywords || [],
      whyItMatters: `Directly connects core degree coursework to practical responsibilities in ${raw.title}.`,
      skillsDeveloped: skills.slice(0, 3),
      careersSupported: [raw.title],
    });
  }

  const certifications = Array.isArray(raw.recommendedCertifications)
    ? raw.recommendedCertifications.map((c: any, idx: number) => ({
        id: `${raw.id}-cert-${idx + 1}`,
        name: c.name,
        issuingBody: c.provider,
        relevanceNote: c.whyItMatters,
        requirementStatus:
          c.level === 'Professional'
            ? ('Industry-recognized certification' as const)
            : ('Optional technical credential' as const),
        officialUrl: null,
        dataStatus: 'Curated' as const,
      }))
    : [];

  const careerProgression = Array.isArray(raw.careerProgression)
    ? raw.careerProgression.map((roleTitle: string, idx: number) => ({
        stepIndex: idx + 1,
        stageLabel:
          idx === 0
            ? 'Entry / Graduate Level'
            : idx === 1
            ? 'Mid-Level Specialist'
            : idx === 2
            ? 'Senior / Lead'
            : 'Executive / Principal',
        roleTitle,
        typicalFocus:
          idx === 0
            ? `Build hands-on execution in ${skills.slice(0, 2).join(' and ') || 'core domain tools'} under senior mentorship.`
            : idx === 1
            ? `Own end-to-end workstreams, analytical models, and stakeholder deliverables in ${raw.title}.`
            : `Lead technical strategy, quality standards, and cross-functional teams.`,
      }))
    : [];

  const projectRecommendations = Array.isArray(raw.recommendedProjects)
    ? raw.recommendedProjects.map((p: any, idx: number) => ({
        id: `${raw.id}-proj-${idx + 1}`,
        title: p.title,
        academicLevel:
          p.difficulty === 'Beginner'
            ? ('Year 1 / Foundational' as const)
            : p.difficulty === 'Intermediate'
            ? ('Year 2 / Intermediate' as const)
            : ('Year 3+ / Capstone' as const),
        minYearOfStudy: p.difficulty === 'Beginner' ? 1 : p.difficulty === 'Intermediate' ? 2 : 3,
        description: p.description,
        skillsPracticed: p.skillsPracticed || skills.slice(0, 3),
      }))
    : [];

  return {
    id: raw.id,
    title: raw.title,
    disciplineCluster: primary,
    secondaryClusters: secondary,
    programmeKeywords: (raw.programmeKeywords || []).map((k: string) => k.toLowerCase()),
    departmentKeywords: (raw.departmentKeywords || []).map((k: string) => k.toLowerCase()),
    shortDescription: raw.summary,
    aboutCareer: `${raw.summary} (${raw.subtitle})`,
    typicalResponsibilities: raw.responsibilities || [],
    topSkillsRequired: skills,
    recommendedAdditionalSkills: (raw.workModes || []).map((w: string) => `${w} Collaboration`),
    courseMappingRules,
    certifications,
    compensation: {
      tanzaniaRange: null,
      regionalAfricaRange: null,
      internationalRemoteRange: null,
      lastUpdated: null,
      source: null,
      dataStatus: 'Data unavailable',
      unavailableReason:
        'Live verified salary data unavailable for this role/location. Connect a verified labour-market feed for live compensation bands.',
    },
    demandLevel: 'Unknown',
    demandNote:
      'Live demand ranking unavailable (verified labour-market telemetry not connected).',
    demandDataStatus: 'Data unavailable',
    typicalIndustries: raw.industries || [],
    careerProgression,
    entryRequirements: [
      `Bachelor's degree in a relevant discipline (${(raw.programmeKeywords || []).slice(0, 4).join(', ')})`,
      `Demonstrated competency in ${skills.slice(0, 3).join(', ')}`,
      'Practical portfolio project, fieldwork, or industrial training experience',
    ],
    furtherStudyOptions: [
      `Master's degree or Postgraduate Diploma specializing in ${raw.subtitle || raw.title}`,
      ...(certifications.slice(0, 2).map((c: any) => c.name)),
    ],
    projectRecommendations,
    source: 'VENUE Curated Academic-to-Career Framework',
    lastUpdated: '2026-04-01',
    region: 'Tanzania / East Africa / Global',
    dataStatus: 'Curated',
  };
}

export const ADAPTED_EXTENDED_CAREER_PROFILES: CareerPathProfile[] = [
  ...(EXTENDED_CAREER_PROFILES_PART1 as any[]).map(adaptRawProfile),
  ...(EXTENDED_CAREER_PROFILES_PART2 as any[]).map(adaptRawProfile),
];
