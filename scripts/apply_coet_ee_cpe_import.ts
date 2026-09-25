import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

interface CourseInput {
  progId: string;
  year: number;
  semester: number;
  code: string;
  title: string;
  credits: number;
  rawCredits?: string;
  status: 'Core' | 'Elective';
  note?: string;
}

const EE_COURSES: CourseInput[] = [
  // Y1S1
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'DS 114', title: 'Development Perspectives I', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'TW 107', title: 'Building, Setting Out, Formwork & Brick Work Skills', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'TW 125', title: 'Practical Electronics Engineering', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'TW 113', title: 'Carpentry and Joinery', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'TW 133', title: 'Electrical Machines and Installation Practice', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'EE 171', title: 'Principles of Computer Programming', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 1, code: 'SC 121', title: 'Statics', credits: 12, rawCredits: '12', status: 'Core' },

  // Y1S2
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'DS 115', title: 'Development Perspectives II', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'TW 107', title: 'Building, Setting Out, Formwork & Brick Work Skills', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'TW 125', title: 'Practical Electronics Engineering', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'TW 113', title: 'Carpentry and Joinery', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'TW 133', title: 'Electrical Machines and Installation Practice', credits: 6, rawCredits: '6', status: 'Core', note: 'A student shall take only two TW courses per semester.' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'EE 131', title: 'Fundamentals of Electronics', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'EE 151', title: 'Fundamentals of Electrical Engineering', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'EE 153', title: 'Computer Aided Drafting for Electrical and Electronics Engineers', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'EE 172', title: 'Modelling and Simulations for Engineers', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 1, semester: 2, code: 'MT 171', title: 'One Variable Calculus and Differential Equations for Non-Majors', credits: 12, rawCredits: '12', status: 'Core' },

  // Y2S1
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 221', title: 'High Voltage Engineering', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 231', title: 'Electronics for Engineers I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 241', title: 'Measurements and Instrumentation Engineering I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 251', title: 'Electrical Network Analysis I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 253', title: 'Engineering Electromagnetics I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'ME 213', title: 'Electrical and Electronic Materials', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'MT 261', title: 'Several Variable Calculus for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 1, code: 'EE 222', title: 'Electrical Power Transmission and Distribution', credits: 12, rawCredits: '12E', status: 'Core' },

  // Y2S2
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'EE 242', title: 'Measurements and Instrumentation Engineering II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'EE 252', title: 'Electrical Network Analysis II', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'EE 254', title: 'Engineering Electromagnetics II', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'ME 207', title: 'Mechanics of Machines', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'MT 271', title: 'Statistics for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 2, semester: 2, code: 'EE 100', title: 'Practical Training I', credits: 8, rawCredits: '8', status: 'Core' },

  // Y3S1
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 311', title: 'Electrical Machines I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 313', title: 'Power Electronics I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 321', title: 'Electrical Power System Analysis I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 331', title: 'Electronics for Engineers II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 341', title: 'Control Systems Engineering I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'EE 324', title: 'HVDC Transmission', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'TE 311', title: 'Introduction to Analogue Telecommunication I', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 3, semester: 1, code: 'CS 353', title: 'Microcomputer Systems I', credits: 10, rawCredits: '10E', status: 'Elective' },

  // Y3S2
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 312', title: 'Electrical Machines II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 314', title: 'Power Electronics II', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 322', title: 'Electrical Power System Analysis II', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 323', title: 'Electrical Power Utilization', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 342', title: 'Control Systems Engineering II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'EE 200', title: 'Practical Training II', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'ME 322', title: 'Renewable Energy Technologies', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'TE 312', title: 'Introduction to Analogue Telecommunication II', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 3, semester: 2, code: 'CS 354', title: 'Microcomputer Systems II', credits: 10, rawCredits: '10E', status: 'Elective' },

  // Y4S1
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'EE 411', title: 'Electrical Machines III', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'EE 421', title: 'Electrical Power Plants', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'EE 422', title: 'Power System Operation & Control', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'IE 443', title: 'Industrial Safety and Maintenance', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'EE 498', title: 'Final Project I', credits: 8, rawCredits: '8.0', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'IE 440', title: 'Engineering Economics', credits: 8, rawCredits: '8E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'IE 441', title: 'Human Resources Management for Engineers', credits: 8, rawCredits: '8E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 4, semester: 1, code: 'CS 452', title: 'Microcomputer Systems III', credits: 8, rawCredits: '8E', status: 'Elective' },

  // Y4S2
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'SC 430', title: 'General Engineering Procedures and Ethics', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 423', title: 'Switchgear and Protection Engineering', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'IE 445', title: 'Entrepreneurship for Engineers', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 499', title: 'Final Project II', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 300', title: 'Practical Training III', credits: 8, rawCredits: '8.0', status: 'Core' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 415', title: 'Variable Speed Drives', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 416', title: 'Solid State Applications in Power Systems', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-elec-eng', year: 4, semester: 2, code: 'EE 414', title: 'Special Electrical Machines', credits: 12, rawCredits: '12E', status: 'Elective' },
];

const CPE_COURSES: CourseInput[] = [
  // Y1S1
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'MT 161', title: 'Matrices and Basic Calculus for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'CP 111', title: 'Workshop Training I', credits: 4, rawCredits: '4', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'CL 111', title: 'Communication Skills for Engineers', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'EE 151', title: 'Fundamentals of Electrical Engineering I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'DS 112', title: 'Development Perspectives I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'ME 101', title: 'Engineering Drawing', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'SC 121', title: 'Statics', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 1, code: 'EE 171', title: 'Introduction to Computers and Programming for Engineers', credits: 8, rawCredits: '8E', status: 'Core' },

  // Y1S2
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'CP 102', title: 'Fundamentals of Chemical and Biochemical Engineering', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'EE 172', title: 'Computer Programming for Engineers', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'CP 105', title: 'Materials and Energy Balance', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'DS 113', title: 'Development Perspectives II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'CP 112', title: 'Workshop Training II', credits: 4, rawCredits: '4', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'ME 106', title: 'Strength of Materials I', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'MT 171', title: 'One Variable Calculus & Diff. Equations for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 1, semester: 2, code: 'ME 103', title: 'Computer Aided Drafting', credits: 8, rawCredits: '8.0', status: 'Core' },

  // Y2S1
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'CH 240', title: 'Physical Chemistry', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'ME 201', title: 'Design Methodology', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'ME 206', title: 'Strength of Materials II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'CP 203', title: 'Engineering Thermodynamics', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'CP 211', title: 'Chemical Engineering Fluid Mechanics', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 1, code: 'MT 261', title: 'Several Variable Calculus for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },

  // Y2S2
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CH 117', title: 'Organic Chemistry', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CH 219', title: 'Systematic Inorganic Chemistry', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CH 270', title: 'Chemical Engineering Laboratory I', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CP 209', title: 'Biochemical Engineering', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CP 260', title: 'Computer Application in Chemical Engineering', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'MT 271', title: 'Statistics for Non-Majors', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 2, semester: 2, code: 'CP 100', title: 'Practical Training I', credits: 8, rawCredits: '8.0', status: 'Core' },

  // Y3S1
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'CP 330', title: 'Unit Operations I', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'IE 340', title: 'Engineering Operations Management', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'CP 320', title: 'Quality Control in Chemical and Food Industries', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'CP 350', title: 'Chemical Engineering Laboratory II', credits: 8, rawCredits: '8.0E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'IE 440', title: 'Engineering Economics', credits: 8, rawCredits: '8.0E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'CP 371', title: 'Plastic Technology', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-cpe', year: 3, semester: 1, code: 'CP 379', title: 'Fermentation Technology and its Applications', credits: 12, rawCredits: '12E', status: 'Elective' },

  // Y3S2
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 340', title: 'Heat and Mass Transfer', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 325', title: 'Process Plant Equipment', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 327', title: 'Reaction Engineering', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 310', title: 'Elements of Environmental Engineering', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 200', title: 'Practical Training II', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 374', title: 'Design of Experiments', credits: 12, rawCredits: '12', status: 'Elective' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 375', title: 'Process Plant Technologies', credits: 12, rawCredits: '12', status: 'Elective' },
  { progId: 'bsc-cpe', year: 3, semester: 2, code: 'CP 376', title: 'Pulp and Paper Technology', credits: 12, rawCredits: '12', status: 'Elective' },

  // Y4S1
  { progId: 'bsc-cpe', year: 4, semester: 1, code: 'CP 432', title: 'Unit Operations II', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 1, code: 'CP 425', title: 'Plant Design and Economics', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 1, code: 'CP 498', title: 'Final Project I', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 1, code: 'IE 443', title: 'Industrial Safety and Maintenance', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 1, code: 'CP 426', title: 'Process Dynamics and Control', credits: 12, rawCredits: '12E', status: 'Core' },

  // Y4S2
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 435', title: 'Gas and Petroleum Processing', credits: 8, rawCredits: '8E', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 450', title: 'Chemical Engineering Laboratory III', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 499', title: 'Final Project II', credits: 12, rawCredits: '12', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'SC 430', title: 'General Engineering Procedures and Ethics', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'IE 445', title: 'Entrepreneurship for Engineers', credits: 12, rawCredits: '12E', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 300', title: 'Practical Training III', credits: 8, rawCredits: '8', status: 'Core' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 472', title: 'Introduction to Industrial Ecology', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 473', title: 'Risk Assessment and Management', credits: 12, rawCredits: '12E', status: 'Elective' },
  { progId: 'bsc-cpe', year: 4, semester: 2, code: 'CP 479', title: 'Engineering Properties of Foods and Packaging Materials', credits: 12, rawCredits: '12E', status: 'Elective' },
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const knownEquivalents: { [code: string]: string[] } = {
  CL111: [
    'communicationskillsforengineers',
    'communicationsskillsforengineers',
    'communicationskillsforengineering',
    'communicationskillsforengineersi',
    'communicationsskillsforengineersi',
  ],
  EE171: [
    'principlesofcomputerprogramming',
    'introductiontocomputersandprogrammingforengineers',
    'computerprogrammingforengineers',
  ],
  MT161: ['matricesandbasiccalculusfornonmajors'],
  MT171: [
    'onevariablecalculusanddifferentialequationsfornonmajors',
    'onevariablecalculusdiffequationsfornonmajors',
  ],
  MT261: ['severalvariablecalculusfornonmajors'],
  MT271: [
    'statisticsfornonmajors',
    'statisticsformathematicsnonmajors',
  ],
  TW151: ['weldingandfabrication', 'weldingandfabricationpractice'],
  SC121: ['statics'],
  SC430: ['generalengineeringproceduresandethics'],
  IE440: ['engineeringeconomics'],
  IE441: ['humanresourcesmanagementforengineers', 'humanresourcemanagementforengineers'],
  IE443: ['industrialsafetyandmaintenance'],
  IE445: ['entrepreneurshipforengineers'],
  IE340: ['engineeringoperationsmanagement'],
  CP379: ['fermentationtechnologyanditsapplications'],
};

function resolveDepartmentForCourse(code: string, progId: string): { deptId: string; auId: string } {
  const prefix = code.split(' ')[0].toUpperCase();
  if (prefix === 'EE') return { deptId: 'dept-ee', auId: 'coet' };
  if (prefix === 'CP') return { deptId: 'dept-cpe', auId: 'coet' };
  if (prefix === 'TW') {
    if (code === 'TW 133' || code === 'TW 125') return { deptId: 'dept-ee', auId: 'coet' };
    return { deptId: 'dept-sce', auId: 'coet' };
  }
  if (prefix === 'CH') return { deptId: 'dept-chem', auId: 'conas' };
  if (prefix === 'CS') return { deptId: 'dept-cse', auId: 'coict' };
  if (prefix === 'TE') return { deptId: 'dept-ete', auId: 'coict' };
  if (prefix === 'ME' || prefix === 'IE') return { deptId: 'dept-mie', auId: 'coet' };
  if (prefix === 'MT') return { deptId: 'dept-math', auId: 'conas' };
  if (prefix === 'SC') return { deptId: 'dept-sce', auId: 'coet' };
  if (prefix === 'CL') return { deptId: 'dept-foreign-languages', auId: 'cohu' };
  if (prefix === 'DS') return { deptId: 'dept-dev-studies', auId: 'ids' };

  if (progId === 'bsc-elec-eng') return { deptId: 'dept-ee', auId: 'coet' };
  return { deptId: 'dept-cpe', auId: 'coet' };
}

async function run() {
  console.log('=== VENUE CoET Import: EE and CPE ===\n');

  // 1. Verify Academic Unit
  const auDoc = await getDoc(doc(db, 'academic_units', 'coet'));
  if (!auDoc.exists()) {
    console.error('CRITICAL: Academic Unit "coet" not found! Aborting.');
    process.exit(1);
  }
  console.log(`[PASS] Academic Unit verified & reused: "${auDoc.data()?.name}" (ID: coet)`);

  // 2. Verify Departments
  const eeDeptDoc = await getDoc(doc(db, 'departments', 'dept-ee'));
  if (!eeDeptDoc.exists()) {
    console.error('CRITICAL: Department "dept-ee" not found! Aborting.');
    process.exit(1);
  }
  console.log(`[PASS] Department of Electrical Engineering verified & reused: "${eeDeptDoc.data()?.name}" (ID: dept-ee)`);

  const cpeDeptDoc = await getDoc(doc(db, 'departments', 'dept-cpe'));
  if (!cpeDeptDoc.exists()) {
    console.error('CRITICAL: Department "dept-cpe" not found! Aborting.');
    process.exit(1);
  }
  console.log(`[PASS] Department of Chemical and Process Engineering verified & reused: "${cpeDeptDoc.data()?.name}" (ID: dept-cpe)`);

  // 3. Verify Programmes
  const eeProgDoc = await getDoc(doc(db, 'programmes', 'bsc-elec-eng'));
  console.log(`[PASS] Programme verified: "${eeProgDoc.data()?.name}" (ID: bsc-elec-eng)`);

  const cpeProgDoc = await getDoc(doc(db, 'programmes', 'bsc-cpe'));
  console.log(`[PASS] Programme verified: "${cpeProgDoc.data()?.name}" (ID: bsc-cpe)`);

  // Update programme metadata with TW note for Electrical Engineering if supported
  const batchProg = writeBatch(db);
  batchProg.update(doc(db, 'programmes', 'bsc-elec-eng'), {
    twNote: 'A student shall take only two TW courses per semester.',
    updatedAt: new Date().toISOString(),
  });
  await batchProg.commit();
  console.log('[PASS] Updated bsc-elec-eng with TW rule note metadata.');

  // 4. Load all existing canonical courses
  const canonSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonMap = new Map<string, any>();
  canonSnap.docs.forEach((d) => {
    const data = d.data();
    const codeKey = (data.code || d.id).replace(/\s+/g, '').toUpperCase();
    canonMap.set(codeKey, { id: d.id, ...data });
  });
  console.log(`[INFO] Loaded ${canonMap.size} existing canonical courses.`);

  const allCourses = [...EE_COURSES, ...CPE_COURSES];
  const conflicts: any[] = [];
  const toCreateCanonical: Map<string, any> = new Map();
  const validRelationships: {
    course: CourseInput;
    canonicalId: string;
    canonicalTitle: string;
    isNewCanonical: boolean;
  }[] = [];

  let reusedCanonicalCount = 0;
  let newCanonicalCount = 0;

  for (const c of allCourses) {
    const codeKey = c.code.replace(/\s+/g, '').toUpperCase();
    const existing = canonMap.get(codeKey);

    if (existing) {
      const exCredits = existing.defaultCredits ?? existing.credits;
      const normSupplied = normalize(c.title);
      const normExisting = normalize(existing.title || '');
      const equivalents = knownEquivalents[codeKey] || [];

      const titleMatches =
        normSupplied === normExisting ||
        normSupplied.includes(normExisting) ||
        normExisting.includes(normSupplied) ||
        equivalents.includes(normSupplied);

      const creditsMatch = exCredits === c.credits;

      if (titleMatches && creditsMatch) {
        // Consistent! Reuse existing canonical course
        validRelationships.push({
          course: c,
          canonicalId: existing.id,
          canonicalTitle: existing.title,
          isNewCanonical: false,
        });
      } else {
        // Inconsistent! STOP individual course import, preserve existing, record conflict
        const actionTaken =
          'STOPPED individual course import. Preserved existing canonical course untouched. Flagged for manual review.';
        conflicts.push({
          progId: c.progId,
          code: c.code,
          suppliedTitle: c.title,
          existingTitle: existing.title,
          suppliedCredits: c.credits,
          existingCredits: exCredits,
          actionTaken,
        });
        console.warn(
          `[CONFLICT] ${c.code} in ${c.progId}: Supplied "${c.title}" (${c.credits} cr) vs Existing "${existing.title}" (${exCredits} cr)`
        );
      }
    } else {
      // Course not in canonical_courses yet.
      const canonDocId = c.code.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!toCreateCanonical.has(canonDocId)) {
        const { deptId, auId } = resolveDepartmentForCourse(c.code, c.progId);
        toCreateCanonical.set(canonDocId, {
          id: canonDocId,
          code: c.code,
          title: c.title,
          defaultCredits: c.credits,
          departmentId: deptId,
          academicUnitId: auId,
          universityId: 'udsm',
          academicYear: '2025/2026',
          sourceType: 'official_prospectus',
          source: 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)',
          verified: true,
          createdAt: new Date().toISOString(),
        });
      }

      validRelationships.push({
        course: c,
        canonicalId: canonDocId,
        canonicalTitle: c.title,
        isNewCanonical: true,
      });
    }
  }

  // Count unique reused canonical courses
  const reusedCanonicalIds = new Set<string>();
  validRelationships.forEach((r) => {
    if (!r.isNewCanonical) {
      reusedCanonicalIds.add(r.canonicalId);
    }
  });
  reusedCanonicalCount = reusedCanonicalIds.size;
  newCanonicalCount = toCreateCanonical.size;

  console.log(`\nImport Summary Plan:`);
  console.log(`- New Canonical Courses to create: ${newCanonicalCount}`);
  console.log(`- Existing Canonical Courses reused: ${reusedCanonicalCount}`);
  console.log(`- Programme-Course relationships to create: ${validRelationships.length}`);
  console.log(`- Conflicts skipped: ${conflicts.length}`);

  // 5. Batch write new canonical courses
  if (toCreateCanonical.size > 0) {
    console.log(`Writing ${toCreateCanonical.size} new canonical courses in chunks...`);
    const canonEntries = Array.from(toCreateCanonical.values());
    for (let i = 0; i < canonEntries.length; i += 300) {
      const chunk = canonEntries.slice(i, i + 300);
      const batch = writeBatch(db);
      for (const item of chunk) {
        batch.set(doc(db, 'canonical_courses', item.id), item, { merge: true });
      }
      await batch.commit();
      console.log(`  Committed chunk ${i + 1} to ${Math.min(i + 300, canonEntries.length)}`);
    }
  }

  // 6. Fetch existing relationships for these programmes to handle duplicates cleanly
  const existingCatalogueCourses = new Map<string, any>();
  const existingProgrammeCourses = new Map<string, any>();

  for (const pid of ['bsc-elec-eng', 'bsc-cpe']) {
    const ccSnap = await getDocs(collection(db, 'catalogue_courses'));
    ccSnap.docs
      .filter((d) => d.data().programmeId === pid)
      .forEach((d) => {
        const data = d.data();
        const key = `${pid}_${(data.code || '').replace(/\s+/g, '').toUpperCase()}_y${data.yearOfStudy}s${data.semester}`;
        existingCatalogueCourses.set(key, { id: d.id, ...data });
      });

    const pcSnap = await getDocs(collection(db, 'programme_courses'));
    pcSnap.docs
      .filter((d) => d.data().programmeId === pid)
      .forEach((d) => {
        const data = d.data();
        const key = `${pid}_${(data.code || '').replace(/\s+/g, '').toUpperCase()}_y${data.yearOfStudy}s${data.semester}`;
        existingProgrammeCourses.set(key, { id: d.id, ...data });
      });
  }

  console.log(
    `Indexed existing relationships: ${existingCatalogueCourses.size} in catalogue_courses, ${existingProgrammeCourses.size} in programme_courses`
  );

  // 7. Write Programme-Course relationships
  let relationshipsCreated = 0;
  let relationshipsUpdated = 0;

  // We write in chunks of 200 operations (each course has 2 writes: catalogue_courses and programme_courses)
  const chunkSize = 150;
  for (let i = 0; i < validRelationships.length; i += chunkSize) {
    const chunk = validRelationships.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const c = item.course;
      const key = `${c.progId}_${c.code.replace(/\s+/g, '').toUpperCase()}_y${c.year}s${c.semester}`;

      const existingCat = existingCatalogueCourses.get(key);
      const catDocId =
        existingCat?.id ||
        `udsm_${c.progId}_${c.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}_y${c.year}s${c.semester}`;

      const existingProg = existingProgrammeCourses.get(key);
      const relDocId =
        existingProg?.id ||
        `${c.progId}_${c.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_y${c.year}s${c.semester}`;

      if (existingCat || existingProg) {
        relationshipsUpdated++;
      } else {
        relationshipsCreated++;
      }

      const { deptId, auId } = resolveDepartmentForCourse(c.code, c.progId);

      const catCourseData: any = {
        id: catDocId,
        programmeId: c.progId,
        canonicalCourseId: item.canonicalId,
        code: c.code,
        title: item.canonicalTitle || c.title,
        credits: c.credits,
        rawCredits: c.rawCredits || `${c.credits}`,
        status: c.status,
        courseType: c.status,
        yearOfStudy: c.year,
        semester: c.semester,
        academicUnitId: 'coet',
        departmentId: c.progId === 'bsc-elec-eng' ? 'dept-ee' : 'dept-cpe',
        offeringDepartmentId: deptId,
        offeringAcademicUnitId: auId,
        universityId: 'udsm',
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
        source: 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)',
        verified: true,
        active: true,
        updatedAt: new Date().toISOString(),
      };

      if (c.note) {
        catCourseData.note = c.note;
      }

      const progCourseData: any = {
        id: relDocId,
        programmeId: c.progId,
        courseId: item.canonicalId,
        canonicalCourseId: item.canonicalId,
        code: c.code,
        title: item.canonicalTitle || c.title,
        credits: c.credits,
        rawCredits: c.rawCredits || `${c.credits}`,
        status: c.status,
        yearOfStudy: c.year,
        semester: c.semester,
        academicUnitId: 'coet',
        departmentId: c.progId === 'bsc-elec-eng' ? 'dept-ee' : 'dept-cpe',
        offeringDepartmentId: deptId,
        universityId: 'udsm',
        academicYear: '2025/2026',
        sourceType: 'official_prospectus',
        source: 'UDSM Undergraduate Prospectus 2025/2026 (Official Source of Truth)',
        verified: true,
        updatedAt: new Date().toISOString(),
      };

      if (c.note) {
        progCourseData.note = c.note;
      }

      batch.set(doc(db, 'catalogue_courses', catDocId), catCourseData, { merge: true });
      batch.set(doc(db, 'programme_courses', relDocId), progCourseData, { merge: true });
    }

    await batch.commit();
    console.log(`Committed relationship batch ${i + 1} to ${Math.min(i + chunkSize, validRelationships.length)}`);
  }

  console.log(`\nImport Process Completed.`);
  console.log(`Relationships Created: ${relationshipsCreated}`);
  console.log(`Relationships Reused/Updated: ${relationshipsUpdated}`);

  // Write summary to json
  const resultData = {
    academicUnit: 'College of Engineering and Technology (CoET)',
    departments: ['Department of Electrical Engineering', 'Department of Chemical and Process Engineering'],
    programmes: [
      { id: 'bsc-elec-eng', name: 'Bachelor of Science in Electrical Engineering' },
      { id: 'bsc-cpe', name: 'Bachelor of Science in Chemical and Process Engineering' },
    ],
    relationshipsCreatedCount: relationshipsCreated,
    relationshipsUpdatedCount: relationshipsUpdated,
    totalValidRelationships: validRelationships.length,
    canonicalCreatedCount: newCanonicalCount,
    canonicalReusedCount: reusedCanonicalCount,
    conflictsSkippedCount: conflicts.length,
    conflicts,
  };

  fs.writeFileSync('scripts/ee_cpe_import_result.json', JSON.stringify(resultData, null, 2), 'utf8');
  console.log('Saved summary data to scripts/ee_cpe_import_result.json');

  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal import error:', err);
  process.exit(1);
});
