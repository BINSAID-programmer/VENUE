import { Course, StudentProfile } from '../types';

export const UDSM_BSC_MATH_STATS_COURSES: Course[] = [
  // ==========================================
  // YEAR 1 — SEMESTER 1
  // ==========================================
  {
    id: 'mt-100',
    code: 'MT 100',
    title: 'Foundations of Analysis',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer',
      office: 'Math Block Room 204',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Rigorous study of mathematical logic, proof techniques, sets, relations, functions, algebraic and order properties of real numbers, completeness axiom, infimum and supremum.',
    syllabus: [
      { week: 1, title: 'Mathematical Logic & Proof Techniques', description: 'Truth tables, quantifiers, direct and contradiction proofs.', completed: true },
      { week: 2, title: 'Set Theory & Relations', description: 'Cartesian products, equivalence relations, partitions.', completed: true },
      { week: 3, title: 'Functions & Cardinality', description: 'Injective, surjective mappings, countable and uncountable sets.', completed: true },
      { week: 4, title: 'Real Number Field Properties', description: 'Field axioms, ordered fields, completeness property.', completed: true },
    ],
    materials: [
      { id: 'm-mt100-1', title: 'MT 100 Complete Foundations Notes', type: 'notes', fileSize: '2.8 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt100-2', title: 'UDSM MT 100 Past Examination Paper', type: 'past-paper', fileSize: '750 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Principles of Mathematical Analysis', author: 'Walter Rudin', type: 'Reference Book', description: 'Standard reference for analysis foundations.' },
    ],
  },
  {
    id: 'mt-127',
    code: 'MT 127',
    title: 'Linear Algebra 1',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Lecturer in Algebra',
      office: 'Math Building 1st Floor',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Systems of linear equations, Gaussian elimination, matrices and matrix algebra, determinants, vector spaces, subspaces, linear independence, basis, and dimension.',
    syllabus: [
      { week: 1, title: 'Linear Systems & Matrices', description: 'Row echelon form, elementary row operations, Gauss-Jordan reduction.', completed: true },
      { week: 2, title: 'Determinants & Matrix Inversion', description: 'Cofactor expansion, Cramer rule, invertibility theorems.', completed: true },
      { week: 3, title: 'Vector Spaces & Subspaces', description: 'Axioms, span, linear dependence and independence.', completed: true },
      { week: 4, title: 'Basis and Dimension', description: 'Coordinates, dimension theorem, rank of a matrix.', completed: true },
    ],
    materials: [
      { id: 'm-mt127-1', title: 'MT 127 Vector Spaces & Matrix Systems Notes', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt127-2', title: 'UDSM MT 127 Past UE Papers', type: 'past-paper', fileSize: '820 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Linear Algebra and Its Applications', author: 'Gilbert Strang', type: 'Core Textbook', description: 'Essential geometric matrix foundation.' },
    ],
  },
  {
    id: 'st-113',
    code: 'ST 113',
    title: 'Basic Statistics',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'Statistics Block Room 102',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Collection, presentation and interpretation of data. Measures of central tendency and dispersion. Elementary probability concepts, index numbers, and introductory regression.',
    syllabus: [
      { week: 1, title: 'Descriptive Statistics & Data Presentation', description: 'Histograms, boxplots, stem-and-leaf, frequency tables.', completed: true },
      { week: 2, title: 'Measures of Location & Dispersion', description: 'Mean, median, mode, variance, standard deviation, skewness.', completed: true },
      { week: 3, title: 'Elementary Probability', description: 'Sample spaces, additive and multiplicative laws of probability.', completed: true },
    ],
    materials: [
      { id: 'm-st113-1', title: 'ST 113 Summary Lecture Notes', type: 'notes', fileSize: '2.2 MB', uploadDate: 'Semester 1' },
      { id: 'm-st113-2', title: 'ST 113 Past Paper Bank', type: 'past-paper', fileSize: '690 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Introductory Statistics', author: 'Prem S. Mann', type: 'Textbook', description: 'Comprehensive statistical introductory concepts.' },
    ],
  },
  {
    id: 'fn-100',
    code: 'FN 100',
    title: 'Principles of Microeconomics',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Department of Economics',
    instructor: {
      name: 'Dr. A. B. Mmari',
      title: 'Senior Lecturer in Economics',
      office: 'UDBS Annex Room 14',
    },
    progress: 100,
    gradeTarget: 'B+',
    accentColor: '#F59E0B',
    overview:
      'Foundations of microeconomic theory: scarcity, choice, opportunity cost, supply and demand, elasticity, consumer behaviour, utility maximization, theory of production and cost.',
    syllabus: [
      { week: 1, title: 'Market Mechanics: Demand and Supply', description: 'Equilibrium price, consumer and producer surplus.', completed: true },
      { week: 2, title: 'Elasticity Concepts', description: 'Price elasticity, income elasticity, cross-price elasticity.', completed: true },
      { week: 3, title: 'Consumer Behaviour & Utility Theory', description: 'Indifference curves, budget constraints, marginal rate of substitution.', completed: true },
    ],
    materials: [
      { id: 'm-fn100-1', title: 'FN 100 Microeconomics Lecture Handouts', type: 'notes', fileSize: '3.4 MB', uploadDate: 'Semester 1' },
      { id: 'm-fn100-2', title: 'FN 100 Mid-Term & UE Questions', type: 'past-paper', fileSize: '910 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Principles of Microeconomics', author: 'N. Gregory Mankiw', type: 'Core Text', description: 'Clear principles of economics and market behaviors.' },
    ],
  },
  {
    id: 'ds-112',
    code: 'DS 112',
    title: 'Development Perspectives I',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Institute of Development Studies',
    instructor: {
      name: 'Dr. E. P. Mtalo',
      title: 'Lecturer in Development Studies',
      office: 'IDS Block Room 08',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#EC4899',
    overview:
      'Interdisciplinary analysis of development concepts, theories of underdevelopment, globalization, poverty, and sustainable socio-economic development in Tanzania and Africa.',
    syllabus: [
      { week: 1, title: 'Concepts & Metrics of Development', description: 'Economic growth vs development, HDI, MDGs, SDGs.', completed: true },
      { week: 2, title: 'Theories of Development', description: 'Modernization theory, dependency theory, world-systems analysis.', completed: true },
    ],
    materials: [
      { id: 'm-ds112-1', title: 'DS 112 Comprehensive Readings Compendium', type: 'notes', fileSize: '4.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-ds112-2', title: 'DS 112 Examination Papers', type: 'past-paper', fileSize: '650 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Economic Development', author: 'Michael P. Todaro & Stephen C. Smith', type: 'Textbook', description: 'Classic perspectives on developing economies.' },
    ],
  },
  {
    id: 'mt-114',
    code: 'MT 114',
    title: 'Computer Programming',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Mr. B. E. Komba',
      title: 'Assistant Lecturer & Computing Instructor',
      office: 'CoNAS Computer Lab 2',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#2DD4BF',
    overview:
      'Introduction to algorithm design, control flow, functions, arrays, pointers, data structures, and implementation using C/C++ or Python for mathematical problem solving.',
    syllabus: [
      { week: 1, title: 'Algorithms & Flowcharts', description: 'Pseudocode, structured problem solving, computational logic.', completed: true },
      { week: 2, title: 'Control Structures & Functions', description: 'Conditional execution, loops, recursion, modular programming.', completed: true },
      { week: 3, title: 'Arrays & Numerical Computations', description: 'Matrix operations in code, numerical algorithms implementation.', completed: true },
    ],
    materials: [
      { id: 'm-mt114-1', title: 'MT 114 Programming Lab Manual & Code Examples', type: 'notes', fileSize: '3.6 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt114-2', title: 'MT 114 Practical Test Papers', type: 'past-paper', fileSize: '580 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'The C Programming Language', author: 'Brian Kernighan & Dennis Ritchie', type: 'Classic Guide', description: 'Definitive guide to foundational programming.' },
    ],
  },
  {
    id: 'cl-107',
    code: 'CL 107',
    title: 'Communication Skills for Science Students',
    credits: 12,
    year: 1,
    semester: 1,
    type: 'Elective',
    department: 'Department of Foreign Languages and Linguistics',
    instructor: {
      name: 'Ms. G. R. Mushi',
      title: 'Lecturer in Communication Studies',
      office: 'Arts Complex Room 112',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#A855F7',
    overview:
      'Academic writing and presentation skills: scientific paper structure, literature referencing, technical report writing, grammar, seminar presentations, and communication ethics.',
    syllabus: [
      { week: 1, title: 'Scientific Academic Writing', description: 'Paragraph organization, coherence, academic style conventions.', completed: true },
      { week: 2, title: 'Referencing & Citation Styles', description: 'APA, IEEE, Harvard styles, avoiding plagiarism.', completed: true },
      { week: 3, title: 'Oral Scientific Presentations', description: 'Structure, slide design, delivery techniques.', completed: true },
    ],
    materials: [
      { id: 'm-cl107-1', title: 'CL 107 Scientific Report Writing Guidelines', type: 'notes', fileSize: '1.9 MB', uploadDate: 'Semester 1' },
      { id: 'm-cl107-2', title: 'CL 107 Sample Assessment Papers', type: 'past-paper', fileSize: '480 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 3,
    recommendedResources: [
      { title: 'The Craft of Scientific Writing', author: 'Michael Alley', type: 'Guide', description: 'Essential manual for scientific clarity and style.' },
    ],
  },

  // ==========================================
  // YEAR 1 — SEMESTER 2
  // ==========================================
  {
    id: 'mt-135',
    code: 'MT 135',
    title: 'Ordinary Differential Equation I',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'First order ODEs, separable, homogeneous, exact equations, integrating factors. Linear ODEs of higher order with constant coefficients, method of undetermined coefficients, variation of parameters.',
    syllabus: [
      { week: 1, title: 'First-Order Differential Equations', description: 'Separable, exact, integrating factors, Bernoulli equations.', completed: true },
      { week: 2, title: 'Second Order Linear Equations', description: 'Homogeneous with constant coefficients, Wronskian determinant.', completed: true },
      { week: 3, title: 'Non-Homogeneous Methods', description: 'Undetermined coefficients, variation of parameters.', completed: true },
    ],
    materials: [
      { id: 'm-mt135-1', title: 'MT 135 Differential Equations Course Handout', type: 'notes', fileSize: '2.5 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt135-2', title: 'MT 135 Past Examination Bank', type: 'past-paper', fileSize: '880 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Elementary Differential Equations', author: 'Boyce & DiPrima', type: 'Core Text', description: 'Classic differential equations text.' },
    ],
  },
  {
    id: 'fn-101',
    code: 'FN 101',
    title: 'Principles of Macroeconomics',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Core',
    department: 'Department of Economics',
    instructor: {
      name: 'Dr. A. B. Mmari',
      title: 'Senior Lecturer in Economics',
      office: 'UDBS Annex Room 14',
    },
    progress: 100,
    gradeTarget: 'B+',
    accentColor: '#F59E0B',
    overview:
      'National income accounting, GDP determination, aggregate demand and aggregate supply, fiscal policy, monetary policy, inflation, unemployment, and balance of payments.',
    syllabus: [
      { week: 1, title: 'National Income Accounting', description: 'GDP, GNP, price deflators, circular flow of income.', completed: true },
      { week: 2, title: 'IS-LM Model & Aggregate Demand', description: 'Goods market and money market equilibrium interactions.', completed: true },
      { week: 3, title: 'Fiscal and Monetary Policy', description: 'Government spending, central bank instruments, inflation control.', completed: true },
    ],
    materials: [
      { id: 'm-fn101-1', title: 'FN 101 Macroeconomic Models Lecture Series', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 2' },
      { id: 'm-fn101-2', title: 'FN 101 Examination Papers', type: 'past-paper', fileSize: '720 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Macroeconomics', author: 'Olivier Blanchard', type: 'Textbook', description: 'Standard comprehensive macroeconomics reference.' },
    ],
  },
  {
    id: 'ds-113',
    code: 'DS 113',
    title: 'Development Perspectives II',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Core',
    department: 'Institute of Development Studies',
    instructor: {
      name: 'Dr. E. P. Mtalo',
      title: 'Lecturer in Development Studies',
      office: 'IDS Block Room 08',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#EC4899',
    overview:
      'Social and environmental aspects of development: industrialization, agrarian transition, environmental sustainability, climate change, governance, and gender issues in development.',
    syllabus: [
      { week: 1, title: 'Agrarian Change & Industrialization', description: 'Agricultural transformation in developing nations.', completed: true },
      { week: 2, title: 'Environmental Sustainability & Climate Change', description: 'Natural resources management and green growth.', completed: true },
    ],
    materials: [
      { id: 'm-ds113-1', title: 'DS 113 Lecture Notes & Case Studies', type: 'notes', fileSize: '3.8 MB', uploadDate: 'Semester 2' },
      { id: 'm-ds113-2', title: 'DS 113 Past Examination Collection', type: 'past-paper', fileSize: '610 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Environment and Development', author: 'Johan Holmberg', type: 'Reference', description: 'Policy perspectives on sustainable development.' },
    ],
  },
  {
    id: 'mt-120',
    code: 'MT 120',
    title: 'Analysis I: Functions of Single Variable',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer',
      office: 'Math Block Room 204',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Rigorous single variable calculus: limits, continuity, uniform continuity, differentiation, mean value theorems, Taylor series, and the Riemann integral.',
    syllabus: [
      { week: 1, title: 'Limits and Continuity', description: 'Epsilon-delta definitions, sequential criteria, intermediate value theorem.', completed: true },
      { week: 2, title: 'Differentiation & Mean Value Theorems', description: 'Rolle theorem, Cauchy MVT, L’Hopital rule, Taylor theorem.', completed: true },
      { week: 3, title: 'Riemann Integration', description: 'Partitions, Darboux sums, Fundamental Theorem of Calculus.', completed: true },
    ],
    materials: [
      { id: 'm-mt120-1', title: 'MT 120 Single Variable Analysis Lecture Manual', type: 'notes', fileSize: '3.5 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt120-2', title: 'MT 120 UDSM Examination Questions', type: 'past-paper', fileSize: '850 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Understanding Analysis', author: 'Stephen Abbott', type: 'Core Text', description: 'Intuitive and rigorous real analysis textbook.' },
    ],
  },
  {
    id: 'st-114',
    code: 'ST 114',
    title: 'Probability Theory I',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#60A5FA',
    overview:
      'Probability spaces, conditional probability, Bayes rule, independent events. Univariate discrete and continuous random variables, cumulative distribution functions, expectations, and moments.',
    syllabus: [
      { week: 1, title: 'Probability Axioms & Combinatorics', description: 'Kolmogorov axioms, conditional probability, independence.', completed: true },
      { week: 2, title: 'Univariate Random Variables', description: 'PMF, PDF, CDF, transformations of single variables.', completed: true },
      { week: 3, title: 'Expectation and Variance', description: 'Moments, Chebyshev inequality, Jensen inequality.', completed: true },
    ],
    materials: [
      { id: 'm-st114-1', title: 'ST 114 Probability Theory Lecture Notes', type: 'notes', fileSize: '2.9 MB', uploadDate: 'Semester 2' },
      { id: 'm-st114-2', title: 'ST 114 Past Papers and Solved Exercises', type: 'past-paper', fileSize: '950 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'A First Course in Probability', author: 'Sheldon Ross', type: 'Core Text', description: 'Clear coverage of elementary probability theory.' },
    ],
  },
  {
    id: 'mt-147',
    code: 'MT 147',
    title: 'Discrete Mathematics',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Elective',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Lecturer in Algebra',
      office: 'Math Building 1st Floor',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Combinatorics, pigeonhole principle, recurrence relations, generating functions, graph theory, trees, Eulerian and Hamiltonian graphs, planar graphs, and boolean algebra.',
    syllabus: [
      { week: 1, title: 'Enumerative Combinatorics', description: 'Permutations, combinations, inclusion-exclusion principle.', completed: true },
      { week: 2, title: 'Recurrence Relations & Generating Functions', description: 'Linear recurrence relations, divide-and-conquer recurrences.', completed: true },
      { week: 3, title: 'Graph Theory Foundations', description: 'Paths, cycles, connectivity, trees, vertex colorings.', completed: true },
    ],
    materials: [
      { id: 'm-mt147-1', title: 'MT 147 Discrete Math Handouts & Proofs', type: 'notes', fileSize: '3.0 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt147-2', title: 'MT 147 Examination Archive', type: 'past-paper', fileSize: '770 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', type: 'Standard Text', description: 'Definitive resource for discrete mathematics.' },
    ],
  },
  {
    id: 'st-118',
    code: 'ST 118',
    title: 'Time Series and Index Numbers',
    credits: 12,
    year: 1,
    semester: 2,
    type: 'Elective',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'Statistics Block Room 102',
    },
    progress: 100,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Components of time series: trend, seasonal, cyclical and irregular movements. Decomposition models, moving averages, exponential smoothing. Construction of price and quantity index numbers.',
    syllabus: [
      { week: 1, title: 'Time Series Components', description: 'Additive vs multiplicative models, secular trend estimation.', completed: true },
      { week: 2, title: 'Smoothing Techniques', description: 'Simple and weighted moving averages, Holt-Winters exponential smoothing.', completed: true },
      { week: 3, title: 'Index Number Theory', description: 'Laspeyres, Paasche, Fisher ideal index numbers, deflating values.', completed: true },
    ],
    materials: [
      { id: 'm-st118-1', title: 'ST 118 Time Series and Index Numbers Compendium', type: 'notes', fileSize: '2.7 MB', uploadDate: 'Semester 2' },
      { id: 'm-st118-2', title: 'ST 118 Past Paper Collection', type: 'past-paper', fileSize: '640 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Introduction to Time Series and Forecasting', author: 'Peter J. Brockwell & Richard A. Davis', type: 'Reference', description: 'Time series forecasting methods.' },
    ],
  },

  // ==========================================
  // YEAR 2 — SEMESTER 1
  // ==========================================
  {
    id: 'mt-200',
    code: 'MT 200',
    title: 'Analysis 2: Functions of Several Variables',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer, CoNAS',
      office: 'Math Block Room 204',
    },
    progress: 88,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Topology of Euclidean space R^n, limits, directional derivatives, total differential, Jacobian matrix, chain rule, Taylor theorem for multivariable functions, Inverse and Implicit Function Theorems, and multiple integrals.',
    syllabus: [
      { week: 1, title: 'Topology of R^n', description: 'Open, closed sets, limit points, compactness in Euclidean space.', completed: true },
      { week: 2, title: 'Multivariable Limits and Continuity', description: 'Directional limits, continuity properties.', completed: true },
      { week: 3, title: 'Partial Derivatives & Differentiability', description: 'Total differential, gradient vector, Jacobian matrix, chain rule.', completed: true },
      { week: 4, title: 'Inverse & Implicit Function Theorems', description: 'Local invertibility, non-linear system solutions.', completed: true },
      { week: 5, title: 'Multiple Integration', description: 'Fubini theorem, change of variables, polar/cylindrical coordinates.', completed: false },
    ],
    materials: [
      { id: 'm-mt200-1', title: 'MT 200 Functions of Several Variables Notes', type: 'notes', fileSize: '3.3 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt200-2', title: 'Inverse and Implicit Function Theorems Guide', type: 'notes', fileSize: '1.9 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt200-3', title: 'UDSM MT 200 UE Past Papers', type: 'past-paper', fileSize: '920 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Principles of Mathematical Analysis', author: 'Walter Rudin', type: 'Core Text', description: 'Foundations for multivariable real analysis.' },
      { title: 'Advanced Calculus', author: 'Gerald B. Folland', type: 'Supplementary', description: 'Excellent multivariable calculus and analysis text.' },
    ],
  },
  {
    id: 'st-210',
    code: 'ST 210',
    title: 'Probability Distributions I',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 82,
    gradeTarget: 'A',
    accentColor: '#60A5FA',
    overview:
      'Standard univariate discrete and continuous probability distributions (Binomial, Poisson, Geometric, Hypergeometric, Normal, Gamma, Exponential, Beta). Moment generating functions, probability generating functions, and distributions of functions of random variables.',
    syllabus: [
      { week: 1, title: 'Discrete Parametric Distributions', description: 'Moments, recurrence relations, MGF derivation for discrete families.', completed: true },
      { week: 2, title: 'Continuous Parametric Families', description: 'Normal, Gamma, Exponential, Beta, Weibull properties.', completed: true },
      { week: 3, title: 'Transformations of Random Variables', description: 'CDF method, Jacobian transformation method.', completed: true },
      { week: 4, title: 'Generating Functions & Applications', description: 'MGF, PGF, characteristic functions, convolutions.', completed: false },
    ],
    materials: [
      { id: 'm-st210-1', title: 'ST 210 Continuous & Discrete Distributions Notes', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-st210-2', title: 'ST 210 Moment Generating Functions Sheet', type: 'notes', fileSize: '1.4 MB', uploadDate: 'Semester 1' },
      { id: 'm-st210-3', title: 'UDSM ST 210 Past Papers Collection', type: 'past-paper', fileSize: '980 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 8,
    recommendedResources: [
      { title: 'Introduction to Mathematical Statistics', author: 'Hogg, McKean & Craig', type: 'Primary Text', description: 'Definitive mathematical statistics text.' },
    ],
  },
  {
    id: 'st-218',
    code: 'ST 218',
    title: 'Applied Statistics I',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 78,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Applied statistical methods: simple linear regression, correlation analysis, multiple regression formulation, analysis of variance (one-way and two-way ANOVA), test of hypotheses in real-world data.',
    syllabus: [
      { week: 1, title: 'Simple Linear Regression & Correlation', description: 'Ordinary least squares estimation, coefficient of determination.', completed: true },
      { week: 2, title: 'Multiple Linear Regression', description: 'Matrix formulation of OLS, hypothesis testing on coefficients.', completed: true },
      { week: 3, title: 'Analysis of Variance (ANOVA)', description: 'One-way and two-way ANOVA models, post-hoc Tukey tests.', completed: false },
    ],
    materials: [
      { id: 'm-st218-1', title: 'ST 218 Applied Linear Regression Handout', type: 'notes', fileSize: '2.9 MB', uploadDate: 'Semester 1' },
      { id: 'm-st218-2', title: 'ST 218 ANOVA and Model Diagnostics Slides', type: 'slides', fileSize: '3.2 MB', uploadDate: 'Semester 1' },
      { id: 'm-st218-3', title: 'ST 218 Past Examination Papers', type: 'past-paper', fileSize: '790 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Applied Linear Statistical Models', author: 'Kutner, Nachtsheim & Neter', type: 'Core Text', description: 'Comprehensive guide to applied regression and ANOVA.' },
    ],
  },
  {
    id: 'mt-225',
    code: 'MT 225',
    title: 'Partial Differential Equations',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 72,
    gradeTarget: 'A',
    accentColor: '#F59E0B',
    overview:
      'First order quasi-linear PDEs, method of characteristics. Classification of second order linear PDEs into elliptic, parabolic, and hyperbolic. Separation of variables, Fourier series, heat equation, wave equation, and Laplace equation.',
    syllabus: [
      { week: 1, title: 'First Order PDEs & Characteristics', description: 'Quasi-linear equations, Cauchy problems, characteristic curves.', completed: true },
      { week: 2, title: 'Classification of 2nd Order PDEs', description: 'Discriminant, canonical forms: hyperbolic, parabolic, elliptic.', completed: true },
      { week: 3, title: 'Fourier Series and Orthogonal Systems', description: 'Fourier coefficients, Dirichlet conditions, half-range expansions.', completed: true },
      { week: 4, title: 'Heat and Wave Equations', description: 'Separation of variables, initial-boundary value problems.', completed: false },
    ],
    materials: [
      { id: 'm-mt225-1', title: 'MT 225 Separation of Variables & Fourier Notes', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt225-2', title: 'MT 225 Method of Characteristics Exercises', type: 'notes', fileSize: '1.6 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt225-3', title: 'UDSM MT 225 Past UE Papers', type: 'past-paper', fileSize: '840 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Partial Differential Equations for Scientists and Engineers', author: 'Stanley J. Farlow', type: 'Textbook', description: 'Intuitive problem-oriented PDE textbook.' },
    ],
  },
  {
    id: 'st-212',
    code: 'ST 212',
    title: 'Statistical Inference I',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 75,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Point estimation: method of moments, maximum likelihood estimation (MLE), properties of estimators (unbiasedness, consistency, efficiency, sufficiency, Rao-Blackwell theorem). Confidence interval estimation.',
    syllabus: [
      { week: 1, title: 'Principles of Point Estimation', description: 'Sample statistics, finite sample properties of estimators.', completed: true },
      { week: 2, title: 'Method of Moments & Maximum Likelihood', description: 'Likelihood functions, score equations, Fisher information.', completed: true },
      { week: 3, title: 'Sufficiency & Completeness', description: 'Neyman-Fisher factorization criterion, Rao-Blackwell theorem.', completed: true },
      { week: 4, title: 'Confidence Intervals Formulation', description: 'Pivotal quantity method for normal, binomial, and Poisson parameters.', completed: false },
    ],
    materials: [
      { id: 'm-st212-1', title: 'ST 212 Point Estimation & MLE Lecture Series', type: 'notes', fileSize: '2.8 MB', uploadDate: 'Semester 1' },
      { id: 'm-st212-2', title: 'ST 212 Sufficiency and Factorization Theorem', type: 'slides', fileSize: '2.4 MB', uploadDate: 'Semester 1' },
      { id: 'm-st212-3', title: 'UDSM ST 212 Examination Collection', type: 'past-paper', fileSize: '890 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 7,
    recommendedResources: [
      { title: 'Statistical Inference', author: 'George Casella & Roger L. Berger', type: 'Primary Text', description: 'The premier mathematical statistics inference text.' },
    ],
  },
  {
    id: 'mt-265',
    code: 'MT 265',
    title: 'Mathematical Computing',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Elective',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Mr. B. E. Komba',
      title: 'Assistant Lecturer & Data Scientist',
      office: 'CoNAS Computer Lab 3',
    },
    progress: 85,
    gradeTarget: 'A+',
    accentColor: '#2DD4BF',
    overview:
      'Mathematical modeling and scientific computing using Python (NumPy, SciPy, Matplotlib) and MATLAB. Numerical solution of linear systems, root finding, numerical calculus, and ODE simulations.',
    syllabus: [
      { week: 1, title: 'Scientific Python Environment', description: 'Vectorized operations, broadcasting, floating point precision.', completed: true },
      { week: 2, title: 'Numerical Linear Algebra in Code', description: 'Matrix decompositions (LU, QR, SVD), condition numbers.', completed: true },
      { week: 3, title: 'Numerical Solution of ODEs', description: 'Euler, Runge-Kutta 4th order algorithms implementation.', completed: false },
    ],
    materials: [
      { id: 'm-mt265-1', title: 'MT 265 Python & MATLAB Computing Labs', type: 'notes', fileSize: '3.7 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt265-2', title: 'MT 265 Practical Assessment Scripts', type: 'past-paper', fileSize: '520 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Numerical Python: Scientific Computing with Python', author: 'Robert Johansson', type: 'Guide', description: 'Practical scientific computing manual.' },
    ],
  },
  {
    id: 'st-220',
    code: 'ST 220',
    title: 'Basic Demographics Methods',
    credits: 12,
    year: 2,
    semester: 1,
    type: 'Elective',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 70,
    gradeTarget: 'A',
    accentColor: '#EC4899',
    overview:
      'Demographic data sources, population censuses, vital registration. Measures of fertility, mortality, morbidity, and migration. Construction and interpretation of life tables, and population projections.',
    syllabus: [
      { week: 1, title: 'Demographic Data Sources & Evaluation', description: 'Census methodology, age-sex pyramids, Whipple index.', completed: true },
      { week: 2, title: 'Measures of Mortality & Fertility', description: 'Crude and specific rates, TFR, gross and net reproduction rates.', completed: true },
      { week: 3, title: 'Life Table Construction', description: 'Complete and abridged life tables, expectation of life.', completed: false },
    ],
    materials: [
      { id: 'm-st220-1', title: 'ST 220 Life Tables and Fertility Analysis Notes', type: 'notes', fileSize: '2.6 MB', uploadDate: 'Semester 1' },
      { id: 'm-st220-2', title: 'ST 220 Past Examination Papers', type: 'past-paper', fileSize: '680 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Demography: Measuring and Modeling Population Processes', author: 'Preston, Heuveline & Guillot', type: 'Core Text', description: 'Classic demographic methods textbook.' },
    ],
  },

  // ==========================================
  // YEAR 2 — SEMESTER 2
  // ==========================================
  {
    id: 'mt-278',
    code: 'MT 278',
    title: 'Linear Programming',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Lecturer in Optimization',
      office: 'Math Building 1st Floor',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Mathematical formulation of linear programming problems, graphical solutions, simplex algorithm, two-phase simplex method, duality theory, dual simplex method, and sensitivity analysis.',
    syllabus: [
      { week: 1, title: 'Formulation & Graphical Solution', description: 'Convex sets, extreme points, feasible regions.', completed: false },
      { week: 2, title: 'The Simplex Algorithm', description: 'Tableau implementation, pivot operations, unboundedness.', completed: false },
      { week: 3, title: 'Two-Phase & Big-M Methods', description: 'Artificial variables, infeasibility detection.', completed: false },
      { week: 4, title: 'Duality Theory & Sensitivity', description: 'Primal-dual relationships, complementary slackness, shadow prices.', completed: false },
    ],
    materials: [
      { id: 'm-mt278-1', title: 'MT 278 Simplex Method & Duality Handout', type: 'notes', fileSize: '3.2 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt278-2', title: 'MT 278 UDSM Past UE Papers', type: 'past-paper', fileSize: '810 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Linear Programming and Network Flows', author: 'Mokhtar S. Bazaraa', type: 'Core Text', description: 'Authoritative linear programming text.' },
    ],
  },
  {
    id: 'mt-274',
    code: 'MT 274',
    title: 'Numerical Analysis 1',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Error analysis, root finding of nonlinear equations (bisection, Newton-Raphson, secant), polynomial interpolation (Lagrange, Newton divided differences), numerical differentiation and numerical integration (trapezoidal, Simpson rules).',
    syllabus: [
      { week: 1, title: 'Error Analysis & Computer Arithmetic', description: 'Truncation and round-off errors, floating point arithmetic.', completed: false },
      { week: 2, title: 'Nonlinear Equation Solvers', description: 'Convergence rates of bisection, fixed-point and Newton-Raphson.', completed: false },
      { week: 3, title: 'Interpolation & Polynomial Approximation', description: 'Lagrange polynomials, error bounds in interpolation.', completed: false },
      { week: 4, title: 'Numerical Quadrature', description: 'Newton-Cotes formulas, composite Simpson rule, error estimates.', completed: false },
    ],
    materials: [
      { id: 'm-mt274-1', title: 'MT 274 Numerical Analysis Lecture Compendium', type: 'notes', fileSize: '3.4 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt274-2', title: 'MT 274 Examination Bank', type: 'past-paper', fileSize: '780 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Numerical Analysis', author: 'Richard L. Burden & J. Douglas Faires', type: 'Core Text', description: 'Standard comprehensive numerical analysis guide.' },
    ],
  },
  {
    id: 'st-211',
    code: 'ST 211',
    title: 'Probability Distributions II',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#60A5FA',
    overview:
      'Multivariate distributions: joint, marginal, and conditional distributions. Multinomial distribution, Bivariate and Multivariate Normal distributions, distributions of quadratic forms, order statistics, and limiting distributions.',
    syllabus: [
      { week: 1, title: 'Joint and Conditional Distributions', description: 'Conditional expectation, covariance matrices, independence.', completed: false },
      { week: 2, title: 'Bivariate & Multivariate Normal', description: 'Properties, marginals, conditional distributions of normals.', completed: false },
      { week: 3, title: 'Distributions of Quadratic Forms', description: 'Cochran theorem, chi-square, t, and F distributions.', completed: false },
      { week: 4, title: 'Order Statistics', description: 'Distributions of minimum, maximum, and sample quantiles.', completed: false },
    ],
    materials: [
      { id: 'm-st211-1', title: 'ST 211 Multivariate Normal & Quadratic Forms Notes', type: 'notes', fileSize: '3.0 MB', uploadDate: 'Semester 2' },
      { id: 'm-st211-2', title: 'UDSM ST 211 Past Papers Collection', type: 'past-paper', fileSize: '890 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Introduction to Mathematical Statistics', author: 'Hogg, McKean & Craig', type: 'Primary Text', description: 'Definitive mathematical statistics text.' },
    ],
  },
  {
    id: 'st-219',
    code: 'ST 219',
    title: 'Applied Statistics II',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Categorical data analysis, contingency tables, chi-square tests of independence and goodness of fit, logistic regression, non-parametric tests (Wilcoxon, Mann-Whitney, Kruskal-Wallis), and statistical quality analysis.',
    syllabus: [
      { week: 1, title: 'Contingency Tables & Chi-Square Tests', description: 'Measures of association, goodness-of-fit tests.', completed: false },
      { week: 2, title: 'Binary Logistic Regression', description: 'Odds ratios, logit link, maximum likelihood fitting.', completed: false },
      { week: 3, title: 'Non-Parametric Statistical Methods', description: 'Rank tests, sign test, Wilcoxon signed-rank test.', completed: false },
    ],
    materials: [
      { id: 'm-st219-1', title: 'ST 219 Categorical Analysis & Non-Parametric Handout', type: 'notes', fileSize: '2.8 MB', uploadDate: 'Semester 2' },
      { id: 'm-st219-2', title: 'ST 219 Examination Archive', type: 'past-paper', fileSize: '740 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'An Introduction to Categorical Data Analysis', author: 'Alan Agresti', type: 'Textbook', description: 'Authoritative categorical statistics text.' },
    ],
  },
  {
    id: 'mt-266',
    code: 'MT 266',
    title: 'Rigid Body Mechanics',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Elective',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#F59E0B',
    overview:
      'Kinematics and dynamics of particles and rigid bodies in two and three dimensions. Moments of inertia, Euler equations of motion, angular momentum, conservation laws, and Lagrangian mechanics intro.',
    syllabus: [
      { week: 1, title: 'Kinematics of Rigid Bodies', description: 'Angular velocity, Chasles theorem, rotating coordinate frames.', completed: false },
      { week: 2, title: 'Inertia Tensor & Moments of Inertia', description: 'Principal axes of inertia, parallel axis theorem.', completed: false },
      { week: 3, title: 'Euler Equations of Motion', description: 'Torque-free rotation, precession of tops and gyroscopes.', completed: false },
    ],
    materials: [
      { id: 'm-mt266-1', title: 'MT 266 Rigid Body Dynamics Lecture Notes', type: 'notes', fileSize: '3.2 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt266-2', title: 'MT 266 Past Examination Papers', type: 'past-paper', fileSize: '690 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Classical Mechanics', author: 'Herbert Goldstein', type: 'Reference', description: 'Premier classical mechanics reference.' },
    ],
  },
  {
    id: 'st-217',
    code: 'ST 217',
    title: 'Probability Theory II',
    credits: 12,
    year: 2,
    semester: 2,
    type: 'Elective',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#A855F7',
    overview:
      'Measure-theoretic foundations of probability: sigma-algebras, probability measures, Radon-Nikodym theorem, conditional expectation given a sigma-algebra, convergence of random variables, and Central Limit Theorems.',
    syllabus: [
      { week: 1, title: 'Measure-Theoretic Foundations', description: 'Probability spaces, measurable functions, integration.', completed: false },
      { week: 2, title: 'Modes of Convergence', description: 'Convergence in probability, almost surely, in mean square, in distribution.', completed: false },
      { week: 3, title: 'Laws of Large Numbers & CLT', description: 'Weak and Strong Laws of Large Numbers, Lindeberg-Feller CLT.', completed: false },
    ],
    materials: [
      { id: 'm-st217-1', title: 'ST 217 Limit Theorems & Measure Probability Notes', type: 'notes', fileSize: '3.6 MB', uploadDate: 'Semester 2' },
      { id: 'm-st217-2', title: 'ST 217 Past UE Papers', type: 'past-paper', fileSize: '830 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Probability and Measure', author: 'Patrick Billingsley', type: 'Classic Text', description: 'Standard measure-theoretic probability text.' },
    ],
  },

  // ==========================================
  // YEAR 3 — SEMESTER 1
  // ==========================================
  {
    id: 'mt-357',
    code: 'MT 357',
    title: 'Abstract Algebra',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Senior Lecturer in Pure Mathematics',
      office: 'Math Building 1st Floor',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Groups, subgroups, cyclic groups, permutation groups, cosets, Lagrange theorem, normal subgroups, quotient groups, homomorphism theorems, rings, subrings, ideals, and introductory field theory.',
    syllabus: [
      { week: 1, title: 'Group Axioms & Subgroups', description: 'Symmetric groups, dihedral groups, Lagrange theorem.', completed: false },
      { week: 2, title: 'Normal Subgroups & Quotient Groups', description: 'First, Second, and Third Isomorphism Theorems.', completed: false },
      { week: 3, title: 'Ring Theory & Ideals', description: 'Integral domains, maximal and prime ideals, polynomial rings.', completed: false },
    ],
    materials: [
      { id: 'm-mt357-1', title: 'MT 357 Abstract Algebra Lecture Notes', type: 'notes', fileSize: '3.5 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt357-2', title: 'MT 357 Past Examination Bank', type: 'past-paper', fileSize: '860 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Abstract Algebra', author: 'David S. Dummit & Richard M. Foote', type: 'Core Text', description: 'Comprehensive modern abstract algebra text.' },
    ],
  },
  {
    id: 'st-310',
    code: 'ST 310',
    title: 'Statistical Inference II',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#60A5FA',
    overview:
      'Hypothesis testing: simple and composite hypotheses, Neyman-Pearson lemma, uniformly most powerful (UMP) tests, likelihood ratio tests (LRT), interval estimation theory, and Bayesian inference fundamentals.',
    syllabus: [
      { week: 1, title: 'Neyman-Pearson Theory', description: 'Most powerful tests, randomized tests, size and power calculations.', completed: false },
      { week: 2, title: 'Uniformly Most Powerful Tests', description: 'Monotone likelihood ratio, Karlin-Rubin theorem.', completed: false },
      { week: 3, title: 'Likelihood Ratio Tests', description: 'Asymptotic null distribution, Wilks theorem, goodness-of-fit.', completed: false },
      { week: 4, title: 'Bayesian Inference Intro', description: 'Prior and posterior distributions, conjugate priors, Bayes estimators.', completed: false },
    ],
    materials: [
      { id: 'm-st310-1', title: 'ST 310 Neyman-Pearson & LRT Lecture Notes', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-st310-2', title: 'UDSM ST 310 Past UE Papers', type: 'past-paper', fileSize: '910 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Statistical Inference', author: 'Casella & Berger', type: 'Primary Text', description: 'Comprehensive theoretical inference reference.' },
    ],
  },
  {
    id: 'mt-340',
    code: 'MT 340',
    title: 'Analysis 4: Real Analysis',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer, CoNAS',
      office: 'Math Block Room 204',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Metric space topology, compactness, connectedness, completeness, Baire category theorem, sequence of functions, uniform convergence, Weierstrass approximation theorem, and Lebesgue measure on the real line.',
    syllabus: [
      { week: 1, title: 'Complete Metric Spaces', description: 'Cauchy sequences, Banach fixed-point theorem, Baire category.', completed: false },
      { week: 2, title: 'Uniform Convergence of Functions', description: 'Equicontinuity, Arzela-Ascoli theorem, Stone-Weierstrass theorem.', completed: false },
      { week: 3, title: 'Introductory Lebesgue Measure', description: 'Outer measure, measurable sets, Lebesgue integral comparison.', completed: false },
    ],
    materials: [
      { id: 'm-mt340-1', title: 'MT 340 Advanced Real Analysis Notes', type: 'notes', fileSize: '3.7 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt340-2', title: 'UDSM MT 340 Examination Papers', type: 'past-paper', fileSize: '870 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Real Analysis: Modern Techniques and Their Applications', author: 'Gerald B. Folland', type: 'Reference Text', description: 'Standard graduate and advanced undergraduate real analysis.' },
    ],
  },
  {
    id: 'mt-310',
    code: 'MT 310',
    title: 'Complex Analysis',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#2DD4BF',
    overview:
      'Complex numbers, analytic functions, Cauchy-Riemann equations, complex contour integration, Cauchy integral formula, Liouville theorem, Taylor and Laurent series, residue theorem, and evaluation of real integrals.',
    syllabus: [
      { week: 1, title: 'Analytic Functions & CR Equations', description: 'Harmonic functions, conformal mappings introduction.', completed: false },
      { week: 2, title: 'Contour Integration & Cauchy Theorem', description: 'Cauchy-Goursat theorem, Cauchy integral formula for derivatives.', completed: false },
      { week: 3, title: 'Laurent Series & Residue Calculus', description: 'Classification of singularities, residue theorem, real improper integrals.', completed: false },
    ],
    materials: [
      { id: 'm-mt310-1', title: 'MT 310 Complex Analysis & Residue Calculus Handouts', type: 'notes', fileSize: '3.4 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt310-2', title: 'MT 310 Past UE Papers', type: 'past-paper', fileSize: '830 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Complex Variables and Applications', author: 'James Ward Brown & Ruel V. Churchill', type: 'Core Text', description: 'Classic text for complex analysis with applications.' },
    ],
  },
  {
    id: 'st-316',
    code: 'ST 316',
    title: 'Statistical Quality Control',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Statistical methods for quality improvement: Shewhart control charts for variables and attributes, CUSUM charts, EWMA charts, process capability analysis, and acceptance sampling plans.',
    syllabus: [
      { week: 1, title: 'Control Charts for Variables', description: 'X-bar and R charts, X-bar and S charts, operating characteristic curves.', completed: false },
      { week: 2, title: 'Control Charts for Attributes', description: 'p-charts, np-charts, c-charts, u-charts.', completed: false },
      { week: 3, title: 'Process Capability & Acceptance Sampling', description: 'Cp, Cpk indices, single and double sampling plans.', completed: false },
    ],
    materials: [
      { id: 'm-st316-1', title: 'ST 316 Control Charts & Process Capability Notes', type: 'notes', fileSize: '2.9 MB', uploadDate: 'Semester 1' },
      { id: 'm-st316-2', title: 'ST 316 Past Examination Collection', type: 'past-paper', fileSize: '710 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Introduction to Statistical Quality Control', author: 'Douglas C. Montgomery', type: 'Core Text', description: 'Premier textbook on industrial statistical quality control.' },
    ],
  },
  {
    id: 'st-319',
    code: 'ST 319',
    title: 'Design and Analysis of Experiments',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Elective',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#F59E0B',
    overview:
      'Principles of experimental design: randomization, replication, local control. Completely Randomized Design (CRD), Randomized Complete Block Design (RCBD), Latin Square Design, factorial experiments (2^k designs), and confounding.',
    syllabus: [
      { week: 1, title: 'Basic Experimental Designs', description: 'CRD, RCBD, Latin square ANOVA models and assumptions.', completed: false },
      { week: 2, title: 'Factorial Experimentation', description: 'Main effects and interaction effects, 2^k factorial designs.', completed: false },
      { week: 3, title: 'Blocking and Confounding', description: 'Fractional factorial designs, split-plot designs.', completed: false },
    ],
    materials: [
      { id: 'm-st319-1', title: 'ST 319 Design of Experiments & Factorial ANOVA Handout', type: 'notes', fileSize: '3.1 MB', uploadDate: 'Semester 1' },
      { id: 'm-st319-2', title: 'ST 319 Past Papers Archive', type: 'past-paper', fileSize: '790 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Design and Analysis of Experiments', author: 'Douglas C. Montgomery', type: 'Core Text', description: 'Comprehensive design of experiments reference.' },
    ],
  },
  {
    id: 'mt-378',
    code: 'MT 378',
    title: 'Queuing Theory and Inventory Models',
    credits: 12,
    year: 3,
    semester: 1,
    type: 'Elective',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Lecturer in Operations Research',
      office: 'Math Building 1st Floor',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#EC4899',
    overview:
      'Birth-death queuing processes, Markovian queues (M/M/1, M/M/c, M/M/1/K), network of queues, deterministic inventory models (EOQ, EPQ, shortages permitted), and stochastic inventory control systems.',
    syllabus: [
      { week: 1, title: 'Markovian Queuing Systems', description: 'M/M/1 queue steady-state distributions, Little formula.', completed: false },
      { week: 2, title: 'Multi-Server Queues & Capacity Limits', description: 'M/M/c systems, Erlang C formula, M/M/1/K queues.', completed: false },
      { week: 3, title: 'Inventory Control Models', description: 'Economic Order Quantity with quantity discounts, safety stocks.', completed: false },
    ],
    materials: [
      { id: 'm-mt378-1', title: 'MT 378 Queuing Models & EOQ Lecture Notes', type: 'notes', fileSize: '2.8 MB', uploadDate: 'Semester 1' },
      { id: 'm-mt378-2', title: 'MT 378 UDSM Past UE Papers', type: 'past-paper', fileSize: '730 KB', uploadDate: 'Semester 1' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'Fundamentals of Queueing Theory', author: 'Donald Gross & Carl M. Harris', type: 'Standard Text', description: 'Definitive resource for queuing theory.' },
    ],
  },

  // ==========================================
  // YEAR 3 — SEMESTER 2
  // ==========================================
  {
    id: 'st-318',
    code: 'ST 318',
    title: 'Sampling Theory and Methodology',
    credits: 12,
    year: 3,
    semester: 2,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Dr. S. K. Lyimo',
      title: 'Head, Department of Statistics',
      office: 'CoNAS Deanery Annex',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#38BDF8',
    overview:
      'Theoretical foundations of survey sampling: simple random sampling, stratified sampling with optimum allocation, cluster sampling, multi-stage sampling, ratio and regression estimation, and non-sampling errors.',
    syllabus: [
      { week: 1, title: 'Advanced Stratified Sampling', description: 'Neyman allocation, cost-constrained optimal allocation.', completed: false },
      { week: 2, title: 'Cluster and Multi-Stage Sampling', description: 'Equal and unequal cluster sizes, intra-cluster correlation.', completed: false },
      { week: 3, title: 'Ratio and Regression Estimators', description: 'First order approximations of bias and mean squared error.', completed: false },
    ],
    materials: [
      { id: 'm-st318-1', title: 'ST 318 Sampling Theory & Allocation Derivations', type: 'notes', fileSize: '3.0 MB', uploadDate: 'Semester 2' },
      { id: 'm-st318-2', title: 'ST 318 Past Paper Archive', type: 'past-paper', fileSize: '810 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Sampling Techniques', author: 'William G. Cochran', type: 'Core Reference', description: 'Gold standard text on sampling theory and methodology.' },
    ],
  },
  {
    id: 'st-321',
    code: 'ST 321',
    title: 'Regression Analysis',
    credits: 12,
    year: 3,
    semester: 2,
    type: 'Core',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#60A5FA',
    overview:
      'Matrix formulation of general linear models, Gauss-Markov theorem, model diagnostics (residual analysis, multicollinearity, VIF, leverage, Cook distance), variable selection methods, and polynomial regression.',
    syllabus: [
      { week: 1, title: 'General Linear Regression in Matrix Form', description: 'Normal equations, distribution of parameter estimators.', completed: false },
      { week: 2, title: 'Regression Diagnostics', description: 'Heteroscedasticity tests, leverage points, studentized residuals.', completed: false },
      { week: 3, title: 'Multicollinearity & Variable Selection', description: 'Ridge regression, forward/backward stepwise selection, AIC/BIC.', completed: false },
    ],
    materials: [
      { id: 'm-st321-1', title: 'ST 321 Matrix Regression & Diagnostics Lecture Series', type: 'notes', fileSize: '3.3 MB', uploadDate: 'Semester 2' },
      { id: 'm-st321-2', title: 'ST 321 UDSM Past UE Papers', type: 'past-paper', fileSize: '860 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Applied Linear Regression', author: 'Sanford Weisberg', type: 'Textbook', description: 'Practical modern linear regression analysis.' },
    ],
  },
  {
    id: 'mt-398',
    code: 'MT 398',
    title: 'Practical Training',
    credits: 8,
    year: 3,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer',
      office: 'Math Block Room 204',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#34D399',
    overview:
      'Practical field placement applying mathematical modeling, statistical analysis, or quantitative software in governmental agencies, financial institutions, research bodies, or industrial companies.',
    syllabus: [
      { week: 1, title: 'Field Placement & Project Scoping', description: 'Placement onboarding, defining practical industry deliverables.', completed: false },
      { week: 2, title: 'Data Collection and Analysis in Industry', description: 'Practical execution of quantitative workflows in workplace settings.', completed: false },
      { week: 3, title: 'Technical Report & Defense', description: 'Preparation of formal internship report and industrial presentation.', completed: false },
    ],
    materials: [
      { id: 'm-mt398-1', title: 'MT 398 Practical Training Guidelines & Logbook', type: 'syllabus', fileSize: '1.2 MB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 2,
    recommendedResources: [
      { title: 'UDSM Practical Training Handbook', author: 'CoNAS Internship Directorate', type: 'Institutional Manual', description: 'Field reporting standards and assessment criteria.' },
    ],
  },
  {
    id: 'mt-389',
    code: 'MT 389',
    title: 'Project',
    credits: 8,
    year: 3,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. C. N. Kagashe',
      title: 'Senior Lecturer',
      office: 'Math Building 1st Floor',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#F59E0B',
    overview:
      'Independent research project under academic supervision in pure mathematics, applied mathematics, mathematical modeling, or applied statistics. Final dissertation and oral defense.',
    syllabus: [
      { week: 1, title: 'Proposal Formulation & Literature Review', description: 'Topic selection, problem statement, academic bibliography.', completed: false },
      { week: 2, title: 'Mathematical/Statistical Investigation', description: 'Derivations, computational experiments, empirical validations.', completed: false },
      { week: 3, title: 'Dissertation Writing & Viva Voce', description: 'Formatting thesis according to UDSM standards and defense.', completed: false },
    ],
    materials: [
      { id: 'm-mt389-1', title: 'MT 389 Project Guidelines & LaTeX Template', type: 'notes', fileSize: '2.1 MB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 2,
    recommendedResources: [
      { title: 'How to Write a Mathematical Research Paper', author: 'Nicholas J. Higham', type: 'Guide', description: 'Handbook on writing mathematics and dissertation structure.' },
    ],
  },
  {
    id: 'mt-360',
    code: 'MT 360',
    title: 'Functional Analysis',
    credits: 12,
    year: 3,
    semester: 2,
    type: 'Core',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. J. M. Mshana',
      title: 'Senior Lecturer, CoNAS',
      office: 'Math Block Room 204',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#818CF8',
    overview:
      'Normed vector spaces, Banach spaces, inner product spaces, Hilbert spaces, bounded linear operators, dual spaces, Hahn-Banach theorem, Open Mapping Theorem, and Closed Graph Theorem.',
    syllabus: [
      { week: 1, title: 'Normed & Banach Spaces', description: 'Completeness, finite dimensional normed spaces, Lp spaces.', completed: false },
      { week: 2, title: 'Hilbert Spaces & Orthogonality', description: 'Orthogonal projections, Riesz representation theorem, orthonormal bases.', completed: false },
      { week: 3, title: 'Fundamental Operator Theorems', description: 'Hahn-Banach theorem, Uniform Boundedness Principle, Open Mapping theorem.', completed: false },
    ],
    materials: [
      { id: 'm-mt360-1', title: 'MT 360 Functional Analysis Lecture Compendium', type: 'notes', fileSize: '3.6 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt360-2', title: 'MT 360 Past UE Papers', type: 'past-paper', fileSize: '840 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 5,
    recommendedResources: [
      { title: 'Introductory Functional Analysis with Applications', author: 'Erwin Kreyszig', type: 'Core Text', description: 'Standard introductory functional analysis book.' },
    ],
  },
  {
    id: 'mt-346',
    code: 'MT 346',
    title: 'Fluid Mechanics',
    credits: 12,
    year: 3,
    semester: 2,
    type: 'Elective',
    department: 'Department of Mathematics',
    instructor: {
      name: 'Dr. L. F. Shirima',
      title: 'Senior Lecturer',
      office: 'Math Department Wing A',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#2DD4BF',
    overview:
      'Continuum hypothesis, kinematics of fluids, velocity field, stream functions, vorticity. Conservation of mass, momentum (Navier-Stokes equations), energy. Inviscid flows, Euler equations, and Bernoulli equation.',
    syllabus: [
      { week: 1, title: 'Kinematics of Fluid Flow', description: 'Lagrangian and Eulerian descriptions, continuity equation.', completed: false },
      { week: 2, title: 'Navier-Stokes Equations', description: 'Stress tensor, derivation of momentum conservation equations.', completed: false },
      { week: 3, title: 'Inviscid & Potential Flows', description: 'Vorticity, stream functions, Bernoulli equation applications.', completed: false },
    ],
    materials: [
      { id: 'm-mt346-1', title: 'MT 346 Navier-Stokes & Potential Flow Notes', type: 'notes', fileSize: '3.3 MB', uploadDate: 'Semester 2' },
      { id: 'm-mt346-2', title: 'MT 346 Past Examination Papers', type: 'past-paper', fileSize: '780 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 4,
    recommendedResources: [
      { title: 'An Introduction to Fluid Dynamics', author: 'G. K. Batchelor', type: 'Classic Text', description: 'Authoritative text on fluid mechanics.' },
    ],
  },
  {
    id: 'st-312',
    code: 'ST 312',
    title: 'Stochastic Processes',
    credits: 12,
    year: 3,
    semester: 2,
    type: 'Elective',
    department: 'Department of Statistics',
    instructor: {
      name: 'Prof. K. E. Masanja',
      title: 'Associate Professor of Statistics',
      office: 'Statistics Department Wing B',
    },
    progress: 0,
    gradeTarget: 'A',
    accentColor: '#A855F7',
    overview:
      'Discrete-time Markov chains: transition probabilities, Chapman-Kolmogorov equations, classification of states, periodicity, stationary distributions. Poisson processes, continuous-time Markov chains, and introduction to Brownian motion.',
    syllabus: [
      { week: 1, title: 'Discrete-Time Markov Chains', description: 'Transition probability matrices, Chapman-Kolmogorov equations.', completed: false },
      { week: 2, title: 'Classification of States & Ergodicity', description: 'Recurrent and transient states, invariant stationary distributions.', completed: false },
      { week: 3, title: 'Poisson Processes & Brownian Motion', description: 'Inter-arrival times, birth-and-death processes, Wiener process.', completed: false },
    ],
    materials: [
      { id: 'm-st312-1', title: 'ST 312 Markov Chains & Poisson Processes Notes', type: 'notes', fileSize: '3.5 MB', uploadDate: 'Semester 2' },
      { id: 'm-st312-2', title: 'ST 312 Past UE Papers', type: 'past-paper', fileSize: '850 KB', uploadDate: 'Semester 2' },
    ],
    pastPapersCount: 6,
    recommendedResources: [
      { title: 'Introduction to Stochastic Processes', author: 'Gregory F. Lawler', type: 'Core Text', description: 'Intuitive modern stochastic processes text.' },
    ],
  },
];

/**
 * Helper to parse numeric year of study (e.g. 'Year 1' -> 1, 'Year 2' -> 2, '1' -> 1)
 */
export function parseYearNumber(yearOfStudy?: string): number | null {
  if (!yearOfStudy) return null;
  const match = yearOfStudy.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Helper to parse numeric semester (e.g. 'Semester 1' -> 1, 'Semester 2' -> 2, '1' -> 1)
 */
export function parseSemesterNumber(semester?: string): number | null {
  if (!semester) return null;
  const match = semester.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Determines whether a student's saved university is UDSM
 */
export function isVerifiedUniversity(universityId?: string, universityName?: string, universityShort?: string): boolean {
  const uid = (universityId || '').trim().toLowerCase();
  const uname = (universityName || '').trim().toLowerCase();
  const ushort = (universityShort || '').trim().toLowerCase();

  return (
    uid === 'udsm' ||
    ushort === 'udsm' ||
    uname.includes('dar es salaam')
  );
}

/**
 * Determines whether a student's saved programme is BSc Mathematics & Statistics
 */
export function isVerifiedProgramme(programmeId?: string, programmeName?: string): boolean {
  const pid = (programmeId || '').trim().toLowerCase();
  const pname = (programmeName || '').trim().toLowerCase();

  return (
    pid === 'math-stats' ||
    pid === 'bsc-math-stats' ||
    pid === 'math_stats' ||
    (pname.includes('mathematics') && pname.includes('statistics'))
  );
}

/**
 * Reads the currently authenticated student's saved academic profile
 * and returns ONLY verified courses matching:
 * university + programme + yearOfStudy + semester.
 * 
 * If the student has no verified courses for their profile, returns [].
 * Does NOT invent courses.
 */
export function getVerifiedStudentCourses(profile?: StudentProfile | null): Course[] {
  if (!profile) return [];

  const pid = (profile.programmeId || '').toLowerCase().trim();
  const deptId = (profile.departmentId || '').toLowerCase().trim();

  // ONLY return Math & Stats courses if the student's profile is explicitly Math & Stats AND Mathematics Department!
  // VENUE MUST NEVER ASSUME THAT A USER IS A MATHEMATICS & STATISTICS STUDENT.
  const isExplicitMathStats =
    (pid === 'math-stats' || pid === 'udsm-bsc-math-stats') &&
    (!deptId || deptId === 'dept-math');

  if (!isExplicitMathStats) {
    return [];
  }

  const numericYear = parseYearNumber(profile.yearOfStudy);
  const numericSemester = parseSemesterNumber(profile.semester);

  // If year or semester is not set or invalid, return no courses
  if (!numericYear || !numericSemester) {
    return [];
  }

  // Filter ONLY courses matching that student's: university + programme + yearOfStudy + semester
  return UDSM_BSC_MATH_STATS_COURSES.filter(
    (course) => course.year === numericYear && course.semester === numericSemester
  );
}
