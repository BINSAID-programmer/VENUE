// Data definitions for the 3 programmes
export interface AuthoritativeCourseItem {
  code: string;
  title: string;
  credits: number;
  yearOfStudy: number;
  semester: number;
  status: 'Core' | 'Elective';
  offeringDepartmentId?: string;
  offeringDepartmentName?: string;
  electiveRule?: string;
  choiceConstraint?: string;
  note?: string;
}

export const PROGRAMME_1_COURSES: AuthoritativeCourseItem[] = [
  // COMMON COURSES
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'EV 200', title: 'Environmental Science I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'SC 215', title: 'Scientific Methods', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },

  // FIRST YEAR — SEMESTER 1
  { code: 'CH 118', title: 'Basic Analytical and Physical Chemistry', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 100', title: 'Fundamentals of Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 130', title: 'Methods and Safety in Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 131', title: 'Eukaryotic Microorganisms', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 111', title: 'Introductory Cell Biology and Genetics', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MT 111', title: 'Mathematics for Biological and Chemical Sciences', credits: 8, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },

  // FIRST YEAR — SEMESTER 2
  { code: 'BN 130', title: 'Molecular Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 131', title: 'Biochemistry I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 112', title: 'Immunology I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 132', title: 'Practicals in Eukaryotic Microorganisms', credits: 8, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'PH 103', title: 'Applied Physics in Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-phys', offeringDepartmentName: 'Department of Physics' },
  { code: 'CH 117', title: 'Organic Chemistry I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },

  // SECOND YEAR — SEMESTER 1
  { code: 'BN 230', title: 'Methods in Molecular Biology I', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 231', title: 'Bioinformatics I', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 235', title: 'Practicals in Molecular Biology I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 238', title: 'Biochemistry II', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 234', title: 'Medical Bacteriology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 232', title: 'Food Microbiology and Processing', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 232', title: 'Food Biotechnology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // SECOND YEAR — SEMESTER 2
  { code: 'BN 234', title: 'Molecular Virology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 237', title: 'Immunology II', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 234', title: 'Biostatistics I', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'BN 236', title: 'Practicals in Molecular Biology II', credits: 8, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 240', title: 'Practicals in Biochemistry', credits: 8, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 236', title: 'Medical Mycology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 238', title: 'Practicals in Microbiology II', credits: 8, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 233', title: 'Environmental Microbiology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 233', title: 'Forensic DNA Typing', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 239', title: 'Molecular Developmental Biology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BT 218', title: 'Metabolic Physiology and Plant Growth', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'BT 217', title: 'Plant Genetics and Evolution', credits: 8, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },

  // THIRD YEAR — SEMESTER 1
  { code: 'BN 335', title: 'Bioinformatics II', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 390', title: 'Research Project', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'BN 342', title: 'Methods in Molecular Biology II', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 340', title: 'Practical Training', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 330', title: 'Environmental Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 331', title: 'Agricultural Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 337', title: 'Practicals in Microbial Technology', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 339', title: 'Biochemistry III', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 330', title: 'Entrepreneurship Microorganisms', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 332', title: 'Agricultural Microbiology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'ZL 336', title: 'Entomology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'BN 333', title: 'Down Stream Processing', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // THIRD YEAR — SEMESTER 2
  { code: 'BL 314', title: 'Biostatistics II', credits: 8, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'BN 338', title: 'Biosafety, Biopolicy and Bioethics', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 341', title: 'Immunology III', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 332', title: 'Industrial Biotechnology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 336', title: 'Practicals in Biotechnology', credits: 8, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 334', title: 'Molecular Cell Biology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 343', title: 'Pharmaceutical Biotechnology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 333', title: 'Applied Mycology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 334', title: 'Medical Virology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BT 333', title: 'Plant Pathology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'BT 337', title: 'Plant Tissue Culture', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'ZL 302', title: 'Evolution', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'ZL 338', title: 'Parasitology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
];

export const PROGRAMME_2_COURSES: AuthoritativeCourseItem[] = [
  // COMMON COURSES
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'SC 215', title: 'Scientific Methods', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },
  { code: 'EV 200', title: 'Environmental Science I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },

  // FIRST YEAR — SEMESTER 1
  { code: 'MC 130', title: 'Methods and Safety in Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 111', title: 'Introduction to Cell Biology and Genetics', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MC 100', title: 'Fundamentals of Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 131', title: 'Eukaryotic Microorganisms', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 118', title: 'Basic Analytical and Physical Chemistry', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MT 111', title: 'Mathematics for Biological & Chemical Sciences', credits: 8, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },

  // FIRST YEAR — SEMESTER 2
  { code: 'BN 130', title: 'Molecular Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 112', title: 'Immunology I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 132', title: 'Practicals in Eukaryotic Microorganisms', credits: 8, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 117', title: 'Organic Chemistry I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'PH 103', title: 'Applied Physics in Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-phys', offeringDepartmentName: 'Department of Physics' },
  { code: 'ZL 121', title: 'Invertebrate Zoology', credits: 8, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'BL 113', title: 'Ecology I', credits: 8, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },

  // SECOND YEAR — SEMESTER 1
  { code: 'MC 231', title: 'Microbial Nutrition and Metabolism', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 232', title: 'Food Microbiology and Processing', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 231', title: 'Bioinformatics I', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 234', title: 'Medical Bacteriology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 232', title: 'Food Biotechnology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 235', title: 'Practicals in Molecular Biology I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // SECOND YEAR — SEMESTER 2
  { code: 'MC 230', title: 'Microbial Taxonomy', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 235', title: 'Microbial Ecology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 234', title: 'Biostatistics I', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MC 233', title: 'Environmental Microbiology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 237', title: 'Practicals in Microbiology I', credits: 8, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 238', title: 'Practicals in Microbiology II', credits: 8, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'ZL 236', title: 'Introductory Entomology and Parasitology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'MC 236', title: 'Medical Mycology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 237', title: 'Immunology II', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // THIRD YEAR — SEMESTER 1
  { code: 'BL 390', title: 'Research Projects', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MC 330', title: 'Entrepreneurship Microorganisms', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 331', title: 'Microbial Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 332', title: 'Agricultural Microbiology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 340', title: 'Practical Training', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 331', title: 'Agricultural Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 330', title: 'Environmental Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 337', title: 'Practicals in Microbial Technology', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BT 337', title: 'Plant Tissue Culture', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'ZL 336', title: 'Entomology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },

  // THIRD YEAR — SEMESTER 2
  { code: 'BL 314', title: 'Biostatistics II', credits: 8, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MC 333', title: 'Applied Mycology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 338', title: 'Biosafety, Biopolicy and Bioethics', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 335', title: 'Practicals in Microbiology III', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 334', title: 'Medical Virology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 341', title: 'Immunology III', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 333', title: 'Downstream Processing', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'ZL 338', title: 'Parasitology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'EV 300', title: 'Environmental Science II', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'BT 333', title: 'Plant Pathology', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
];

export const PROGRAMME_3_COURSES: AuthoritativeCourseItem[] = [
  // COMMON COURSES
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'EV 200', title: 'Environmental Science I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'SC 215', title: 'Scientific Methods', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },

  // FIRST YEAR — SEMESTER 1
  { code: 'CH 118', title: 'Basic Analytical and Physical Chemistry', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 100', title: 'Fundamentals of Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 130', title: 'Methods and Safety in Microbiology', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 121', title: 'Chemistry Practicals I', credits: 8, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 172', title: 'Chemical Separation', credits: 12, yearOfStudy: 1, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'IS 131', title: 'Introduction to Informatics and Microcomputers', credits: 8, yearOfStudy: 1, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-cse', offeringDepartmentName: 'Department of Computer Science and Engineering' },
  { code: 'ZL 121', title: 'Invertebrate Zoology', credits: 8, yearOfStudy: 1, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'MC 131', title: 'Eukaryotic Microorganisms', credits: 12, yearOfStudy: 1, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // FIRST YEAR — SEMESTER 2
  { code: 'MT 111', title: 'Mathematics for Biological and Chemical Sciences', credits: 8, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-math', offeringDepartmentName: 'Department of Mathematics' },
  { code: 'CH 117', title: 'Organic Chemistry I', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 173', title: 'Introduction to Electronic Structure and Spectroscopy', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'BN 131', title: 'Introduction to Molecular Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'PH 103', title: 'Applied Physics in Biology', credits: 12, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-phys', offeringDepartmentName: 'Department of Physics' },
  { code: 'MC 132', title: 'Practicals in Eukaryotic Microorganisms', credits: 8, yearOfStudy: 1, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // SECOND YEAR — SEMESTER 1
  { code: 'CH 243', title: 'Organic Chemistry II', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 231', title: 'Microbial Nutrition and Metabolism', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 232', title: 'Food Microbiology and Processing', credits: 12, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 299', title: 'Practical Training', credits: 8, yearOfStudy: 2, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 262', title: 'Analytical and Environmental Chemistry', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'BN 232', title: 'Food Biotechnology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 235', title: 'Practical in Molecular Biology', credits: 8, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 234', title: 'Medical Bacteriology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 234', title: 'Biostatistics I', credits: 8, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'MC 235', title: 'Microbial Ecology', credits: 12, yearOfStudy: 2, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },

  // SECOND YEAR — SEMESTER 2
  { code: 'CH 241', title: 'Chemistry Practicals III', credits: 8, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 219', title: 'Systematic Inorganic Chemistry', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 230', title: 'Microbial Taxonomy', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 237', title: 'Practicals in Microbiology I', credits: 8, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BL 210', title: 'Immunology for Life Science', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 290', title: 'Chemical Kinetics and Electrochemistry', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 233', title: 'Environmental Microbiology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 280', title: 'Organic Structure, Reactions and Mechanisms', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'DS 211', title: 'Entrepreneurship, Small Business and Development', credits: 8, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'ids', offeringDepartmentName: 'Institute of Development Studies' },
  { code: 'MC 238', title: 'Practicals in Microbiology II', credits: 8, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 236', title: 'Medical Mycology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'ZL 236', title: 'Introductory Entomology and Parasitology', credits: 12, yearOfStudy: 2, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },

  // THIRD YEAR — SEMESTER 1
  { code: 'CH 248', title: 'Instrumental Methods in Analytical Chemistry', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 201', title: 'Chemical Thermodynamics', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 323', title: 'Organic Spectroscopy', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 341', title: 'Chemistry Practicals VI', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  {
    code: 'CH 314',
    title: 'Project Work',
    credits: 12,
    yearOfStudy: 3,
    semester: 1,
    status: 'Core',
    offeringDepartmentId: 'dept-chem',
    offeringDepartmentName: 'Chemistry Department',
    electiveRule: 'EITHER_OR_CHOICE_GROUP',
    choiceConstraint: 'Students take either CH 314 (Semester 1) or BL 390 (Semester 2)',
    note: 'Students take either CH 314 or BL 390. This is a curriculum choice constraint; do not treat both as simultaneously compulsory.',
  },
  { code: 'MC 330', title: 'Entrepreneurship Microbiology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 340', title: 'Practical Training', credits: 8, yearOfStudy: 3, semester: 1, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 331', title: 'Microbial Biotechnology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 332', title: 'Agriculture Microbiology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BT 337', title: 'Plant Tissue Culture', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-botany', offeringDepartmentName: 'Department of Botany' },
  { code: 'ZL 356', title: 'Entomology', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'CH 303', title: 'Organic Synthesis', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 308', title: 'Polymer Chemistry', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 363', title: 'Chemical Waste Management', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 318', title: 'Medicinal Chemistry', credits: 8, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 377', title: 'Industrial Chemistry', credits: 12, yearOfStudy: 3, semester: 1, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },

  // THIRD YEAR — SEMESTER 2
  { code: 'CH 364', title: 'Coordination Chemistry', credits: 8, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 333', title: 'Applied Mycology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 338', title: 'Biosafety, Bio-policy and Bioethics', credits: 12, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'CH 353', title: 'Biochemistry', credits: 8, yearOfStudy: 3, semester: 2, status: 'Core', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  {
    code: 'BL 390',
    title: 'Research Project',
    credits: 12,
    yearOfStudy: 3,
    semester: 2,
    status: 'Core',
    offeringDepartmentId: 'dept-botany',
    offeringDepartmentName: 'Department of Botany',
    electiveRule: 'EITHER_OR_CHOICE_GROUP',
    choiceConstraint: 'Students take either CH 314 (Semester 1) or BL 390 (Semester 2)',
    note: 'Students take either CH 314 or BL 390. This is a curriculum choice constraint; do not treat both as simultaneously compulsory.',
  },
  { code: 'CH 305', title: 'Chemistry of Natural Products', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 335', title: 'Chemistry of Biofuels', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 351', title: 'Forensic Chemistry', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 374', title: 'Bio-Inorganic Chemistry', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 379', title: 'Organometallic Chemistry', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 381', title: 'Physical Organic Chemistry', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'CH 371', title: 'Quality Control and Assurance', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
  { code: 'MC 335', title: 'Practicals in Microbiology III', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'MC 334', title: 'Medical Virology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'BN 332', title: 'Industrial Biotechnology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-biotech', offeringDepartmentName: 'Department of Molecular Biology and Biotechnology' },
  { code: 'ZL 338', title: 'Parasitology', credits: 12, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-zoology', offeringDepartmentName: 'Department of Zoology and Wildlife Conservation' },
  { code: 'EV 300', title: 'Environmental Science II', credits: 8, yearOfStudy: 3, semester: 2, status: 'Elective', offeringDepartmentId: 'dept-chem', offeringDepartmentName: 'Chemistry Department' },
];
