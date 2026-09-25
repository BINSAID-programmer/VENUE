import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

const EE_COURSES = [
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

const CPE_COURSES = [
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

async function inspectAll() {
  const canonSnap = await getDocs(collection(db, 'canonical_courses'));
  const canonByCode = new Map<string, any>();
  canonSnap.docs.forEach((d) => {
    const data = d.data();
    const code = (data.code || d.id).replace(/\s+/g, '').toUpperCase();
    canonByCode.set(code, { id: d.id, ...data });
  });

  const all = [...EE_COURSES, ...CPE_COURSES];
  console.log(`Total courses to process: ${all.length} (${EE_COURSES.length} EE, ${CPE_COURSES.length} CPE)`);

  for (const c of all) {
    const codeKey = c.code.replace(/\s+/g, '').toUpperCase();
    const existing = canonByCode.get(codeKey);
    if (existing) {
      const exCredits = existing.defaultCredits ?? existing.credits;
      const titleEqual = c.title.toLowerCase().trim() === (existing.title || '').toLowerCase().trim();
      const creditsEqual = c.credits === exCredits;
      console.log(`[EXISTING] ${c.code} (${c.progId}) | Supplied: "${c.title}" (${c.credits}cr) | Canonical [${existing.id}]: "${existing.title}" (${exCredits}cr) | TitleMatch=${titleEqual}, CrMatch=${creditsEqual}`);
    } else {
      console.log(`[NEW] ${c.code} (${c.progId}) | "${c.title}" (${c.credits}cr)`);
    }
  }

  process.exit(0);
}

inspectAll().catch(console.error);
