import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  query,
  where
} from "firebase/firestore";
import * as fs from "fs";

interface CourseInput {
  code: string;
  title: string;
  credits: number;
  status: 'Core' | 'Elective';
  year: number;
  semester: 1 | 2;
  stream?: string;
  track?: string;
  notes?: string;
  electiveRule?: string;
  departmentId?: string;
  offeringDepartmentName?: string;
}

const ESC_COURSES: CourseInput[] = [
  // Year 1 Semester 1
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, status: 'Core', year: 1, semester: 1, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'ES 102', title: 'Practicals in Electronics', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 110', title: 'Analogue Electronics I', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 115', title: 'Electromagnetics and Optics', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'MT 100', title: 'Foundation of Analysis', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-math' },
  { code: 'MT 127', title: 'Linear Algebra I', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-math' },
  { code: 'SC 215', title: 'Science Methods', credits: 8, status: 'Elective', year: 1, semester: 1, notes: 'Common Elective Course for All Science Students', departmentId: 'dept-math' },
  { code: 'BM 100', title: 'Principles of Management and Administration', credits: 12, status: 'Elective', year: 1, semester: 1, departmentId: 'dept-management' },

  // Year 1 Semester 2
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, status: 'Core', year: 1, semester: 2, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'IS 136', title: 'Programming in C', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'ES 101', title: 'Technical Drawing, Laboratory and Workshop Administration', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 105', title: 'Fundamentals of Computer Architecture', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 120', title: 'Digital Electronics I', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'MT 120', title: 'Analysis I: Functions of a Single Variable', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-math' },
  { code: 'ES 240', title: 'Industrial Training', credits: 8, status: 'Core', year: 1, semester: 2, notes: 'Industrial Training', departmentId: 'dept-ete' },
  { code: 'DS 211', title: 'Entrepreneurship', credits: 8, status: 'Elective', year: 1, semester: 2, notes: 'Common Elective Course for All Science Students', departmentId: 'dept-dev-studies' },
  { code: 'CL 107', title: 'Communication Skills for Scientist', credits: 8, status: 'Elective', year: 1, semester: 2, departmentId: 'dept-ccs' },
  { code: 'IS 138', title: 'Social-Culture Implication of Information Technology', credits: 8, status: 'Elective', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'IS 137', title: 'Data Structure and Algorithms', credits: 12, status: 'Elective', year: 1, semester: 2, departmentId: 'dept-cse' },

  // Year 2 Semester 1
  { code: 'ES 211', title: 'Analogue Electronics II', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 212', title: 'Analogue Electronics Practical', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'EV 200', title: 'Environmental Sciences', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-chemistry' },
  { code: 'PH 201', title: 'Mathematical Methods I', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-phys' },
  { code: 'MT 233', title: 'Mathematical Statistics I', credits: 12, status: 'Core', year: 2, semester: 1, departmentId: 'dept-math' },
  { code: 'IS 245', title: 'Operating Systems I', credits: 12, status: 'Elective', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 262', title: 'Compiler Technology', credits: 8, status: 'Elective', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 271', title: 'Computer Networks', credits: 12, status: 'Elective', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 263', title: 'Database Concepts', credits: 12, status: 'Elective', year: 2, semester: 1, departmentId: 'dept-cse' },

  // Year 2 Semester 2
  { code: 'ES 202', title: 'Quantum Electronics', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 221', title: 'Digital Electronics II', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 222', title: 'Digital Electronics Practicals', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'IS 292', title: 'Object-Oriented Programming Concepts', credits: 12, status: 'Core', year: 2, semester: 2, departmentId: 'dept-cse' },
  { code: 'ES 340', title: 'Industrial Training II', credits: 8, status: 'Core', year: 2, semester: 2, notes: 'Industrial Training II', departmentId: 'dept-ete' },
  { code: 'IS 281', title: 'Network Design and Administration', credits: 12, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-cse' },
  { code: 'ES 300', title: 'Computer Aided Design and Analysis', credits: 8, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'PH 202', title: 'Mathematical Methods II', credits: 8, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-phys' },
  { code: 'PH 213', title: 'Electromagnetism II', credits: 8, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-phys' },
  { code: 'MT 274', title: 'Numerical Analysis I', credits: 12, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-math' },
  { code: 'MT 227', title: 'Linear Algebra II', credits: 12, status: 'Elective', year: 2, semester: 2, departmentId: 'dept-math' },

  // Year 3 Common Courses
  { code: 'ES 310', title: 'Electronics Instrumentation I', credits: 8, status: 'Core', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 334', title: 'Signal Processing I', credits: 8, status: 'Core', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 399', title: 'Projects in Electronics I', credits: 8, status: 'Core', year: 3, semester: 1, notes: 'Final Year Project I', departmentId: 'dept-ete' },
  { code: 'ES 318', title: 'Electronics Control', credits: 12, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 399', title: 'Projects in Electronics II', credits: 8, status: 'Core', year: 3, semester: 2, notes: 'Final Year Project II', departmentId: 'dept-ete' },

  // Year 3 Electronics Stream
  { code: 'ES 300', title: 'Computer Aided Design and Analysis', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Electronics Stream', departmentId: 'dept-ete' },
  { code: 'ES 304', title: 'Microelectronics', credits: 8, status: 'Core', year: 3, semester: 2, stream: 'Electronics Stream', departmentId: 'dept-ete' },
  { code: 'ES 311', title: 'Electronics Instrumentation II', credits: 8, status: 'Core', year: 3, semester: 2, stream: 'Electronics Stream', departmentId: 'dept-ete' },
  { code: 'ES 322', title: 'Industrial Electronics', credits: 8, status: 'Core', year: 3, semester: 2, stream: 'Electronics Stream', departmentId: 'dept-ete' },
  { code: 'ES 316', title: 'PC Interfacing Techniques', credits: 8, status: 'Core', year: 3, semester: 2, stream: 'Electronics Stream', departmentId: 'dept-ete' },

  // Year 3 Communication Stream
  { code: 'ES 330', title: 'Telecommunication I', credits: 8, status: 'Core', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'TE 411', title: 'Microwave Communications', credits: 16, status: 'Core', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 314', title: 'Microprocessor Theory and Practices', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 320', title: 'Nuclear Electronics', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 322', title: 'Industrial Electronics', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 337', title: 'High Frequency Communication System Design', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'EV 300', title: 'Environmental Science II', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-chemistry' },
  { code: 'IS 383', title: 'Internet Applications and Programming', credits: 8, status: 'Elective', year: 3, semester: 1, stream: 'Communication Stream', departmentId: 'dept-cse' },

  { code: 'TE 412', title: 'Introduction to Wireless Communications', credits: 12, status: 'Core', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 335', title: 'Signal Processing II', credits: 12, status: 'Core', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 332', title: 'Opto-Electronics', credits: 8, status: 'Core', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 306', title: 'VLSI Circuit Design', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 319', title: 'Communication Systems Design', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 339', title: 'Ultra-Fast Electronics Techniques', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 341', title: 'Communication Digital Signal Processing', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'ES 343', title: 'Emerging Electronics and Communication Technologies', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-ete' },
  { code: 'IS 364', title: 'IT Security', credits: 8, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-cse' },
  { code: 'TM 400', title: 'Engineering Ethics and Professional Conduct', credits: 4, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-mie' },
  { code: 'MG 445', title: 'Entrepreneurship for Engineers', credits: 12, status: 'Elective', year: 3, semester: 2, stream: 'Communication Stream', departmentId: 'dept-mie' }
];

const TELECOM_COURSES: CourseInput[] = [
  // Year 1 Semester 1
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, status: 'Core', year: 1, semester: 1, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ccs' },
  { code: 'CS 174', title: 'Programming in C', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-cse' },
  { code: 'ES 171', title: 'Computer Aided Drafting and Design (CADD)', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 173', title: 'Introduction to Electrical Circuits', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'ME 101', title: 'Engineering Drawing', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-mie' },
  { code: 'MT 161', title: 'Matrices and Basic Calculus for Non Major', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-math' },

  // Year 1 Semester 2
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, status: 'Core', year: 1, semester: 2, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'CS 175', title: 'Programming in Java', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'ES 110', title: 'Analogue Electronics I', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 120', title: 'Digital Electronics I', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'IS 171', title: 'Introduction to Computer Networks', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'MT 171', title: 'One Variable Calculus & Diff. Eq. for Non Major', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-math' },
  { code: 'TE 101', title: 'Introduction to Telecommunication', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 172', title: 'Workshop Training', credits: 8, status: 'Core', year: 1, semester: 2, notes: 'Workshop Training', departmentId: 'dept-ete' },

  // Year 2 Semester 1
  { code: 'ES 213', title: 'Electronics Measurements and Instrumentation I', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'IS 274', title: 'Object Oriented Analysis and Design', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 158', title: 'Computer Hardware and System Maintenance', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'CS 243', title: 'Computer Network Design and Administration', credits: 12, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'EE 253', title: 'Engineering Electromagnetics I', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ee' },
  { code: 'MT 261', title: 'Several Variable Calculus for Non-majors', credits: 12, status: 'Core', year: 2, semester: 1, departmentId: 'dept-math' },
  { code: 'ES 211', title: 'Analogue Electronics II', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 212', title: 'Analogue Electronics Practical', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },

  // Year 2 Semester 2
  { code: 'CS 234', title: 'Object Oriented Programming in Java', credits: 12, status: 'Core', year: 2, semester: 2, departmentId: 'dept-cse' },
  { code: 'MT 271', title: 'Statistics for Non-majors', credits: 12, status: 'Core', year: 2, semester: 2, departmentId: 'dept-math' },
  { code: 'ES 221', title: 'Digital Electronics II', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 222', title: 'Digital Electronics Practical', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 231', title: 'Fundamentals of Signals and Systems', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'EE 254', title: 'Engineering Electromagnetics II', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ee' },

  // Year 3 Semester 1
  { code: 'CS 323', title: 'Control Systems Engineering', credits: 12, status: 'Core', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'TE 331', title: 'Principles of Analogue Telecommunications', credits: 12, status: 'Core', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 380', title: 'Digital Signal Processing (DSP)', credits: 12, status: 'Core', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'CS 348', title: 'Network Switching and Routing', credits: 12, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-cse' },
  { code: 'EE 313', title: 'Power Electronics I', credits: 8, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ee' },
  { code: 'ES 313', title: 'Analogue Electronics III', credits: 12, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'TE 336', title: 'Satellite Communications', credits: 8, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'TE 337', title: 'Tele-traffic Engineering', credits: 8, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'IE 354', title: 'Engineering Project Management', credits: 12, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-mie' },
  { code: 'CS 353', title: 'Micro Computer Systems I', credits: 12, status: 'Elective', year: 3, semester: 1, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-cse' },

  // Year 3 Semester 2
  { code: 'TE 332', title: 'Principles of Digital Telecommunications', credits: 12, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 339', title: 'Telecommunication Switching and Transmission', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 334', title: 'Information Theory', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 371', title: 'Introduction to Research Methods', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 324', title: 'System Design and Implementation', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 312', title: 'Digital Electronics III', credits: 12, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'CS 441', title: 'High Speed Network Technologies', credits: 8, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-cse' },
  { code: 'IS 238', title: 'Mobile Applications Development', credits: 12, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-cse' },
  { code: 'EE 314', title: 'Power Electronics II', credits: 8, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ee' },
  { code: 'CS 342', title: 'LAN Switching', credits: 8, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-cse' },
  { code: 'ES 326', title: 'Microelectronics I', credits: 8, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'TE 335', title: 'Introduction to Analogue Filters', credits: 8, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },
  { code: 'TE 338', title: 'Mobile Web Communication Services', credits: 12, status: 'Elective', year: 3, semester: 2, electiveRule: 'Minimum elective credits: 24.0', departmentId: 'dept-ete' },

  // Year 4 Semester 1
  { code: 'DP 471', title: 'Electrical Safety & Maintenance', credits: 8, status: 'Core', year: 4, semester: 1, departmentId: 'dept-ee' },
  { code: 'TE 411', title: 'Microwave Communication', credits: 16, status: 'Core', year: 4, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 413', title: 'Introduction to Telecommunications Networks', credits: 8, status: 'Core', year: 4, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 441', title: 'Analogue Electronics for Engineers III', credits: 16, status: 'Core', year: 4, semester: 1, departmentId: 'dept-ete' },
  { code: 'CS 421', title: 'Control Systems Engineering III', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-cse' },
  { code: 'CS 441', title: 'Wide Area Networks', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-cse' },
  { code: 'DP 421', title: 'Electrical Insulating Materials', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-ee' },
  { code: 'MG 440', title: 'Engineering Economics', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-mie' },
  { code: 'MG 441', title: 'Human Resources Management', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-mie' },
  { code: 'TE 480', title: 'Digital Signal Processing (DSP)', credits: 8, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-ete' },
  { code: 'TE 471', title: 'Introduction to VLSI', credits: 12, status: 'Elective', year: 4, semester: 1, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-ete' },

  // Year 4 Semester 2
  { code: 'TM 400', title: 'Engineering Ethics and Professional Conduct', credits: 4, status: 'Core', year: 4, semester: 2, departmentId: 'dept-mie' },
  { code: 'TM 330', title: 'General Engineering Procedures', credits: 8, status: 'Core', year: 4, semester: 2, departmentId: 'dept-mie' },
  { code: 'MG 445', title: 'Entrepreneurship for Engineers', credits: 12, status: 'Core', year: 4, semester: 2, departmentId: 'dept-mie' },
  { code: 'TE 412', title: 'Introduction to Wireless Communication', credits: 12, status: 'Core', year: 4, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 442', title: 'Digital Electronics for Engineers III', credits: 16, status: 'Core', year: 4, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 499', title: 'Final Project', credits: 24, status: 'Core', year: 4, semester: 2, notes: 'Final Project (Capstone)', departmentId: 'dept-ete' },
  { code: 'CS 452', title: 'Microcomputer Systems III', credits: 8, status: 'Elective', year: 4, semester: 2, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-cse' },
  { code: 'TE 481', title: 'Television Engineering', credits: 8, status: 'Elective', year: 4, semester: 2, electiveRule: 'Minimum elective credits: 28.0', departmentId: 'dept-ete' }
];

const ELEC_COURSES: CourseInput[] = [
  // Year 1 Semester 1
  { code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ccs' },
  { code: 'CS 174', title: 'Programming in C', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-cse' },
  { code: 'DS 112', title: 'Development Perspectives I', credits: 12, status: 'Core', year: 1, semester: 1, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Major', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-math' },
  { code: 'ME 101', title: 'Engineering Drawing', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-mie' },
  { code: 'ES 173', title: 'Introduction to Electrical Circuits', credits: 12, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 171', title: 'Computer Aided Drafting and Design (CADD)', credits: 8, status: 'Core', year: 1, semester: 1, departmentId: 'dept-ete' },

  // Year 1 Semester 2
  { code: 'DS 113', title: 'Development Perspectives II', credits: 12, status: 'Core', year: 1, semester: 2, notes: 'Common Core Course for All Students', departmentId: 'dept-dev-studies' },
  { code: 'IS 171', title: 'Introduction to Computer Networks', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'CS 175', title: 'Programming in Java', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-cse' },
  { code: 'MT 171', title: 'One Variable Calculus & Diff. Eq. for Non-Major', credits: 12, status: 'Core', year: 1, semester: 2, departmentId: 'dept-math' },
  { code: 'TE 172', title: 'Workshop Training', credits: 8, status: 'Core', year: 1, semester: 2, notes: 'Workshop Training', departmentId: 'dept-ete' },
  { code: 'ES 110', title: 'Analogue Electronics I', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 120', title: 'Digital Electronics I', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 101', title: 'Introduction to Telecommunication', credits: 8, status: 'Core', year: 1, semester: 2, departmentId: 'dept-ete' },

  // Year 2 Semester 1
  { code: 'ES 213', title: 'Electronics Measurements and Instrumentation I', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'IS 274', title: 'Object Oriented Analysis and Design', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 158', title: 'Computer Hardware and System Maintenance', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'CS 243', title: 'Computer Network Design and Administration', credits: 12, status: 'Core', year: 2, semester: 1, departmentId: 'dept-cse' },
  { code: 'EE 253', title: 'Engineering Electromagnetics I', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ee' },
  { code: 'MT 261', title: 'Several Variable Calculus for Non-majors', credits: 12, status: 'Core', year: 2, semester: 1, departmentId: 'dept-math' },
  { code: 'ES 211', title: 'Analogue Electronics II', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 212', title: 'Analogue Electronics Practical', credits: 8, status: 'Core', year: 2, semester: 1, departmentId: 'dept-ete' },

  // Year 2 Semester 2
  { code: 'CS 234', title: 'Object Oriented Programming in Java', credits: 12, status: 'Core', year: 2, semester: 2, departmentId: 'dept-cse' },
  { code: 'EE 254', title: 'Engineering Electromagnetics II', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ee' },
  { code: 'MT 271', title: 'Statistics for Non-majors', credits: 12, status: 'Core', year: 2, semester: 2, departmentId: 'dept-math' },
  { code: 'ES 221', title: 'Digital Electronics II', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 222', title: 'Digital Electronics Practical', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 231', title: 'Fundamentals of Signals and Systems', credits: 8, status: 'Core', year: 2, semester: 2, departmentId: 'dept-ete' },

  // Year 3 Semester 1
  { code: 'CS 323', title: 'Control Systems Engineering', credits: 12, status: 'Core', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'CS 353', title: 'Micro Computer Systems I', credits: 12, status: 'Core', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'ES 213', title: 'Analogue Electronics III', credits: 12, status: 'Core', year: 3, semester: 1, notes: 'Conflict: ES 213 used for Analogue Electronics III (12 cr)', departmentId: 'dept-ete' },
  { code: 'ES 326', title: 'Microelectronics I', credits: 8, status: 'Core', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'CS 348', title: 'Network Switching and Routing', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 344', title: 'Human Computer Interaction', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'IS 264', title: 'Principals of Database Systems', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-cse' },
  { code: 'EE 313', title: 'Power Electronics I', credits: 8, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ee' },
  { code: 'TE 335', title: 'Introduction to Analogue Filters', credits: 8, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 336', title: 'Satellite Communications', credits: 8, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 337', title: 'Tele-traffic Engineering', credits: 8, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 331', title: 'Principles of Analogue Telecommunications', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'TE 380', title: 'Digital Signal Processing (DSP)', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'ES 315', title: 'Automation and Industrial Electronics', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-ete' },
  { code: 'IE 354', title: 'Engineering Project Management', credits: 12, status: 'Elective', year: 3, semester: 1, departmentId: 'dept-mie' },

  // Year 3 Semester 2
  { code: 'ES 319', title: 'Hardware Interfacing Techniques', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 311', title: 'Electronics Measurements and Instrumentation II', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 312', title: 'Digital Electronics III', credits: 12, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'ES 324', title: 'System Design and Implementation', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 371', title: 'Introduction to Research Methods', credits: 8, status: 'Core', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'IS 365', title: 'Artificial Intelligence', credits: 8, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-cse' },
  { code: 'EE 314', title: 'Power Electronics II', credits: 8, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-ee' },
  { code: 'ES 314', title: 'Quantum Electronics', credits: 8, status: 'Elective', year: 3, semester: 2, notes: 'Conflict: ES 314 used for Quantum Electronics', departmentId: 'dept-ete' },
  { code: 'TE 338', title: 'Mobile Web Communication Services', credits: 8, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 339', title: 'Telecommunication Switching and Transmission', credits: 8, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 334', title: 'Information Theory', credits: 8, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-ete' },
  { code: 'TE 332', title: 'Principles of Digital Telecommunications', credits: 12, status: 'Elective', year: 3, semester: 2, departmentId: 'dept-ete' },

  // Year 4 Common Core
  { code: 'IE 443', title: 'Industrial Safety and Maintenance', credits: 8, status: 'Core', year: 4, semester: 1, departmentId: 'dept-mie' },
  { code: 'ES 411', title: 'Analogue Electronics III', credits: 12, status: 'Core', year: 4, semester: 1, departmentId: 'dept-ete' },
  { code: 'SC 430', title: 'General Engineering Procedures and Ethics', credits: 12, status: 'Core', year: 4, semester: 2, departmentId: 'dept-mie' },
  { code: 'IE 445', title: 'Entrepreneurship for Engineers', credits: 12, status: 'Core', year: 4, semester: 2, departmentId: 'dept-mie' },
  { code: 'ES 499', title: 'Final Project', credits: 24, status: 'Core', year: 4, semester: 2, notes: 'Final Project (Capstone)', departmentId: 'dept-ete' },

  // Year 4 Embedded Electronics Track
  { code: 'ES 412', title: 'Introduction to Robotics', credits: 12, status: 'Core', year: 4, semester: 1, track: 'Embedded Electronics Track', departmentId: 'dept-ete' },
  { code: 'ES 413', title: 'High Frequency Communication System Design', credits: 8, status: 'Core', year: 4, semester: 1, track: 'Embedded Electronics Track', departmentId: 'dept-ete' },
  { code: 'CS 354', title: 'Micro Computer Systems II', credits: 8, status: 'Core', year: 4, semester: 1, track: 'Embedded Electronics Track', departmentId: 'dept-cse' },
  { code: 'CS 356', title: 'Embedded Systems', credits: 8, status: 'Core', year: 4, semester: 2, track: 'Embedded Electronics Track', departmentId: 'dept-cse' },

  // Year 4 Electronics Science Track
  { code: 'ES 415', title: 'Optoelectronic Devices', credits: 8, status: 'Core', year: 4, semester: 1, track: 'Electronics Science Track', departmentId: 'dept-ete' },
  { code: 'ES 416', title: 'Microelectronics II', credits: 12, status: 'Core', year: 4, semester: 1, track: 'Electronics Science Track', departmentId: 'dept-ete' },
  { code: 'ES 414', title: 'Solid State Electronics', credits: 8, status: 'Core', year: 4, semester: 1, track: 'Electronics Science Track', departmentId: 'dept-ete' },
  { code: 'ES 417', title: 'Ultra-fast Electronics Technologies', credits: 8, status: 'Core', year: 4, semester: 2, track: 'Electronics Science Track', departmentId: 'dept-ete' },

  // Year 4 Shared Track Electives
  { code: 'CS 421', title: 'Modern Control Systems Engineering', credits: 8, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-cse' },
  { code: 'IE 440', title: 'Engineering Economics', credits: 8, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-mie' },
  { code: 'IE 441', title: 'Human Resources Management', credits: 8, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-mie' },
  { code: 'TE 443', title: 'Digital Broadcasting Technologies', credits: 8, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-ete' },
  { code: 'TE 411', title: 'Microwave Communication', credits: 12, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-ete' },
  { code: 'TE 447', title: 'Wireless Technologies', credits: 8, status: 'Elective', year: 4, semester: 1, track: 'Shared (Both Tracks)', departmentId: 'dept-ete' },
  { code: 'CS 441', title: 'High Speed Network Technologies', credits: 8, status: 'Elective', year: 4, semester: 2, track: 'Shared (Both Tracks)', departmentId: 'dept-cse' },
  { code: 'TE 412', title: 'Mobile Communication', credits: 8, status: 'Elective', year: 4, semester: 2, track: 'Shared (Both Tracks)', departmentId: 'dept-ete' },
  { code: 'ES 418', title: 'Nuclear Electronics', credits: 8, status: 'Elective', year: 4, semester: 2, track: 'Shared (Both Tracks)', departmentId: 'dept-ete' }
];

async function main() {
  const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
  const app = initializeApp(config);
  const dbNamed = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);
  const dbDefault = initializeFirestore(app, { experimentalForceLongPolling: true });

  console.log("=== STEP 1: VERIFY ACADEMIC UNIT & DEPARTMENT ===");
  const coictDoc = await getDoc(doc(dbNamed, "academic_units", "coict"));
  console.log("CoICT found:", coictDoc.exists(), coictDoc.data()?.name);

  const deptDoc = await getDoc(doc(dbNamed, "departments", "dept-ete"));
  console.log("dept-ete found:", deptDoc.exists(), deptDoc.data()?.name);

  console.log("\n=== STEP 2: VERIFY / REUSE / CREATE PROGRAMMES ===");
  // bsc-esc
  const escProg = await getDoc(doc(dbNamed, "programmes", "bsc-esc"));
  console.log("bsc-esc found:", escProg.exists());

  // bsc-telecom
  const telecomProg = await getDoc(doc(dbNamed, "programmes", "bsc-telecom"));
  console.log("bsc-telecom found:", telecomProg.exists());

  // bsc-elec
  const elecProgData = {
    id: "bsc-elec",
    universityId: "udsm",
    academicUnitId: "coict",
    departmentId: "dept-ete",
    name: "Bachelor of Science in Electronics Engineering",
    shortName: "BSc ELE",
    awardLevel: "Bachelor Degree",
    durationYears: 4,
    studyMode: "Full-Time",
    academicYear: "2025/2026",
    verified: true,
    source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
  };
  await setDoc(doc(dbNamed, "programmes", "bsc-elec"), elecProgData, { merge: true });
  await setDoc(doc(dbDefault, "programmes", "bsc-elec"), elecProgData, { merge: true });
  console.log("bsc-elec created/verified in both databases!");

  console.log("\n=== STEP 3: AUDIT & RECONCILE CANONICAL COURSES ===");
  const canonSnap = await getDocs(collection(dbNamed, "canonical_courses"));
  const existingCanonMap = new Map<string, any>();
  canonSnap.forEach(d => {
    const data = d.data();
    if (data.code) existingCanonMap.set(data.code.trim().toUpperCase(), { id: d.id, ...data });
  });

  const allSupplied = [...ESC_COURSES, ...TELECOM_COURSES, ...ELEC_COURSES];
  const uniqueSuppliedCodes = [...new Set(allSupplied.map(c => c.code.trim().toUpperCase()))];

  const conflictsDetected: any[] = [];
  let canonicalReusedCount = 0;
  let canonicalCreatedCount = 0;

  const newCanonToCreate = new Map<string, any>();

  for (const code of uniqueSuppliedCodes) {
    const occurrences = allSupplied.filter(c => c.code.trim().toUpperCase() === code);
    const firstOccur = occurrences[0];

    // Check if multiple occurrences have conflicting titles or credits among supplied data
    const distinctSuppliedTitles = [...new Set(occurrences.map(o => o.title.trim()))];
    const distinctSuppliedCredits = [...new Set(occurrences.map(o => o.credits))];

    if (existingCanonMap.has(code)) {
      canonicalReusedCount++;
      const existing = existingCanonMap.get(code);

      // Check for discrepancies with existing canonical
      occurrences.forEach(occ => {
        const titleDiff = existing.title && existing.title.trim().toLowerCase() !== occ.title.trim().toLowerCase();
        const creditsDiff = existing.credits !== undefined && existing.credits !== null && existing.credits !== occ.credits;

        if (titleDiff || creditsDiff) {
          conflictsDetected.push({
            courseCode: code,
            existingTitle: existing.title,
            suppliedTitle: occ.title,
            existingCredits: existing.credits,
            suppliedCredits: occ.credits,
            affectedProgramme: occ === occurrences[0] ? "CoICT Programme" : "Cross-reference",
            affectedYearSemester: `Y${occ.year}S${occ.semester}`,
            actionTaken: "Existing canonical course preserved untouched without overwriting; curriculum relationship records supplied title and credits."
          });
        }
      });
    } else {
      // New canonical course
      if (distinctSuppliedTitles.length > 1 || distinctSuppliedCredits.length > 1) {
        conflictsDetected.push({
          courseCode: code,
          existingTitle: "None (new canonical course)",
          suppliedTitle: distinctSuppliedTitles.join(" / "),
          existingCredits: "None",
          suppliedCredits: distinctSuppliedCredits.join(" / "),
          affectedProgramme: "Department of Electronics and Telecommunications Engineering",
          affectedYearSemester: occurrences.map(o => `Y${o.year}S${o.semester}`).join(", "),
          actionTaken: `Canonical course created with primary prospectus title '${firstOccur.title}' (${firstOccur.credits} credits); curriculum relationships preserve variant titles and credits.`
        });
      }

      if (!newCanonToCreate.has(code)) {
        // canonical title: normalize minor plurals if applicable, e.g. "Microwave Communication"
        let normTitle = firstOccur.title;
        if (code === "TE 411") normTitle = "Microwave Communication";
        if (code === "TE 412") normTitle = "Introduction to Wireless Communication";
        if (code === "ES 213") normTitle = "Electronics Measurements and Instrumentation I";
        if (code === "ES 314") normTitle = "Microprocessor Theory and Practices";
        if (code === "CS 421") normTitle = "Control Systems Engineering III";

        const docId = `canon_${code.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        newCanonToCreate.set(code, {
          id: docId,
          code: code,
          title: normTitle,
          credits: firstOccur.credits,
          departmentId: firstOccur.departmentId || "dept-ete",
          offeringDepartmentName: getDeptName(firstOccur.departmentId || "dept-ete"),
          universityId: "udsm",
          verified: true,
          academicYear: "2025/2026",
          source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
          sourceType: "official_prospectus",
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  console.log(`Canonical reused count: ${canonicalReusedCount}`);
  console.log(`Canonical to create count: ${newCanonToCreate.size}`);
  console.log(`Conflicts recorded: ${conflictsDetected.length}`);

  // Create new canonical courses in both DBs
  const canonEntries = Array.from(newCanonToCreate.values());
  for (let i = 0; i < canonEntries.length; i += 200) {
    const chunk = canonEntries.slice(i, i + 200);
    const bNamed = writeBatch(dbNamed);
    const bDef = writeBatch(dbDefault);
    for (const c of chunk) {
      bNamed.set(doc(dbNamed, "canonical_courses", c.id), c, { merge: true });
      bDef.set(doc(dbDefault, "canonical_courses", c.id), c, { merge: true });
      canonicalCreatedCount++;
    }
    await bNamed.commit();
    await bDef.commit();
  }
  console.log(`Successfully committed ${canonicalCreatedCount} canonical courses!`);

  console.log("\n=== STEP 4: CLEAN UP OBSOLETE PLACEHOLDER CURRICULUM RELATIONSHIPS ===");
  for (const pid of ["bsc-esc", "bsc-telecom", "bsc-elec"]) {
    const q1 = query(collection(dbNamed, "programme_courses"), where("programmeId", "==", pid));
    const snap1 = await getDocs(q1);
    if (snap1.size > 0) {
      const b1 = writeBatch(dbNamed);
      const b2 = writeBatch(dbDefault);
      snap1.docs.forEach(d => {
        b1.delete(doc(dbNamed, "programme_courses", d.id));
        b2.delete(doc(dbDefault, "programme_courses", d.id));
      });
      await b1.commit();
      await b2.commit();
      console.log(`Purged ${snap1.size} obsolete programme_courses for ${pid}`);
    }

    const q2 = query(collection(dbNamed, "catalogue_courses"), where("programmeId", "==", pid));
    const snap2 = await getDocs(q2);
    if (snap2.size > 0) {
      const b3 = writeBatch(dbNamed);
      const b4 = writeBatch(dbDefault);
      snap2.docs.forEach(d => {
        b3.delete(doc(dbNamed, "catalogue_courses", d.id));
        b4.delete(doc(dbDefault, "catalogue_courses", d.id));
      });
      await b3.commit();
      await b4.commit();
      console.log(`Purged ${snap2.size} obsolete catalogue_courses for ${pid}`);
    }
  }

  console.log("\n=== STEP 5: WRITE CURRICULUM RELATIONSHIPS ===");
  const programmeSets = [
    { pid: "bsc-esc", name: "Bachelor of Science in Electronic Science and Communication", courses: ESC_COURSES },
    { pid: "bsc-telecom", name: "Bachelor of Science in Telecommunications Engineering", courses: TELECOM_COURSES },
    { pid: "bsc-elec", name: "Bachelor of Science in Electronics Engineering", courses: ELEC_COURSES }
  ];

  let totalRelationshipsCreated = 0;

  for (const p of programmeSets) {
    const relations: any[] = [];
    p.courses.forEach((c, idx) => {
      const codeSlug = c.code.toLowerCase().replace(/[^a-z0-9]/g, "_");
      // Add track / stream / semester to ID to avoid collisions (e.g. ES 399 in S1 and S2)
      let suffix = `_y${c.year}s${c.semester}`;
      if (c.stream) suffix += `_${c.stream.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      if (c.track) suffix += `_${c.track.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const relId = `${p.pid}_${codeSlug}${suffix}`;

      const relData = {
        id: relId,
        programmeId: p.pid,
        programmeName: p.name,
        academicUnitId: "coict",
        departmentId: "dept-ete",
        offeringDepartmentId: c.departmentId || "dept-ete",
        offeringDepartmentName: getDeptName(c.departmentId || "dept-ete"),
        universityId: "udsm",
        code: c.code,
        courseCode: c.code,
        title: c.title,
        courseTitle: c.title,
        credits: c.credits,
        yearOfStudy: c.year,
        year: c.year,
        semester: c.semester,
        status: c.status,
        courseType: c.status,
        stream: c.stream || null,
        track: c.track || null,
        notes: c.notes || null,
        electiveRule: c.electiveRule || null,
        electiveChoiceRule: c.electiveRule || null,
        verified: true,
        academicYear: "2025/2026",
        source: "UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)",
        sourceType: "official_prospectus",
        createdAt: new Date().toISOString()
      };
      relations.push(relData);
    });

    console.log(`Writing ${relations.length} relationships for ${p.pid}...`);

    for (let i = 0; i < relations.length; i += 200) {
      const chunk = relations.slice(i, i + 200);
      const bNamed = writeBatch(dbNamed);
      const bDef = writeBatch(dbDefault);
      for (const r of chunk) {
        bNamed.set(doc(dbNamed, "programme_courses", r.id), r);
        bNamed.set(doc(dbNamed, "catalogue_courses", r.id), r);
        bDef.set(doc(dbDefault, "programme_courses", r.id), r);
        bDef.set(doc(dbDefault, "catalogue_courses", r.id), r);
        totalRelationshipsCreated++;
      }
      await bNamed.commit();
      await bDef.commit();
    }
  }

  console.log(`Total relationships written: ${totalRelationshipsCreated}`);

  // Save report artifact
  const auditReport = {
    college: { id: "coict", name: "College of Information and Communication Technologies", status: "reused" },
    department: { id: "dept-ete", name: "Department of Electronics and Telecommunications Engineering", status: "reused" },
    programmes: [
      { id: "bsc-esc", name: "Bachelor of Science in Electronic Science and Communication", status: "reused", coursesCount: ESC_COURSES.length },
      { id: "bsc-telecom", name: "Bachelor of Science in Telecommunications Engineering", status: "reused", coursesCount: TELECOM_COURSES.length },
      { id: "bsc-elec", name: "Bachelor of Science in Electronics Engineering", status: "created", coursesCount: ELEC_COURSES.length }
    ],
    tracksAndStreams: [
      "B.Sc. ESC: Electronics Stream",
      "B.Sc. ESC: Communication Stream",
      "B.Sc. ELE: Embedded Electronics Track",
      "B.Sc. ELE: Electronics Science Track",
      "B.Sc. ELE: Shared (Both Tracks)"
    ],
    canonicalCoursesReused: canonicalReusedCount,
    canonicalCoursesCreated: canonicalCreatedCount,
    curriculumRelationshipsCreated: totalRelationshipsCreated,
    conflictsDetected
  };

  fs.writeFileSync("./scripts/coict_ete_audit_report.json", JSON.stringify(auditReport, null, 2));
  console.log("Saved audit report to ./scripts/coict_ete_audit_report.json");

  process.exit(0);
}

function getDeptName(deptId: string): string {
  switch (deptId) {
    case 'dept-ete': return 'Department of Electronics and Telecommunications Engineering';
    case 'dept-cse': return 'Department of Computer Science and Engineering';
    case 'dept-ee': return 'Department of Electrical Engineering';
    case 'dept-mie': return 'Department of Mechanical and Industrial Engineering';
    case 'dept-math': return 'Department of Mathematics';
    case 'dept-phys': return 'Department of Physics';
    case 'dept-chemistry': return 'Department of Chemistry';
    case 'dept-dev-studies': return 'Department of Development Studies';
    case 'dept-ccs': return 'Centre for Communication Studies';
    case 'dept-management': return 'Department of General Management';
    default: return 'College of Information and Communication Technologies';
  }
}

main().catch(err => {
  console.error("Error in main:", err);
  process.exit(1);
});
