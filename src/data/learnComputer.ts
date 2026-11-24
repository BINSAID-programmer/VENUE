import type { LearnLesson } from './learnLessons';
import { CB_CH1 } from './learnComputerCh1';
import { CB_CH2 } from './learnComputerCh02';
import { CB_CH3 } from './learnComputerCh03';
import { CB_CH4 } from './learnComputerCh04';
import { CB_CH5 } from './learnComputerCh05';
import { CB_CH6 } from './learnComputerCh06';
import { CB_CH7 } from './learnComputerCh07';
import { CB_CH8 } from './learnComputerCh08';
import { CB_CH9 } from './learnComputerCh09';
import { CB_CH10 } from './learnComputerCh10';
import { CB_CH11 } from './learnComputerCh11';
import { CB_CH12 } from './learnComputerCh12';
import { CB_CH13 } from './learnComputerCh13';
import { CB_CH14 } from './learnComputerCh14';
import { CB_CH15 } from './learnComputerCh15';
import { CB_APP } from './learnComputerApp';

const CHAPTERS: Array<{ title: string; lessons: LearnLesson[] }> = [
  { title: '1. Technology All Around Us', lessons: CB_CH1 },
  { title: '2. Data, Information and How a Computer Works', lessons: CB_CH2 },
  { title: '3. Hardware: The Parts You Can Touch', lessons: CB_CH3 },
  { title: '4. Software and the Operating System', lessons: CB_CH4 },
  { title: '5. Getting Started with Windows', lessons: CB_CH5 },
  { title: '6. Files, Folders and File Explorer', lessons: CB_CH6 },
  { title: '7. Managing Your Files', lessons: CB_CH7 },
  { title: '8. Keyboard Skills and Shortcuts', lessons: CB_CH8 },
  { title: '9. Networks, the Internet and the Web', lessons: CB_CH9 },
  { title: '10. Searching the Internet Effectively', lessons: CB_CH10 },
  { title: '11. Judging Sources and Academic Honesty', lessons: CB_CH11 },
  { title: '12. Passwords and Account Security', lessons: CB_CH12 },
  { title: '13. Phishing, Scams and Malware', lessons: CB_CH13 },
  { title: '14. Privacy, Netiquette and Digital Well-being', lessons: CB_CH14 },
  { title: '15. Your Capstone Project and the Road Ahead', lessons: CB_CH15 },
  { title: 'Appendices: Cheat Sheets, Glossary and Final Assessment', lessons: CB_APP },
];

/** Computer Basics: no code, but drawings, tables, hands-on steps and videos. */
export const COMPUTER_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) => c.lessons.map((l) => ({ ...l, chapter: c.title })));
