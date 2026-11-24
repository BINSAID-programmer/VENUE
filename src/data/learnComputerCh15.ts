import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 15: Your capstone project and the road ahead (from Digital Foundations by Binsaid). */
export const CB_CH15: LearnLesson[] = [
  T('cap-plan', 'Why build a portfolio and plan it', 'Portfolio ni mkusanyiko wa kazi yako unaoonyesha unachoweza, na mradi huu unatumia karibu ujuzi wote wa kitabu.',
    'Create the folder Digital_Foundations in Documents with the five subfolders listed in this lesson.',
    [
      { h: 'Why a portfolio?', p: [
        'Reading a book is only the first half of learning. The second half is making something with what you have learned. A portfolio is a collection of your work that shows what you can do. Evidence of skill is more convincing than a statement of skill.',
        'You will create a Digital Portfolio: a single, well-formatted document that summarises what you have learned, stored in an organised folder, exported as a PDF and backed up. It uses nearly every skill in the book: folders, file names, typing, formatting, searching, citing sources, saving, copying and keeping things safe.'],
        tip: 'You can show the finished portfolio to a teacher, a scholarship committee or an employer.' },
      { h: 'Plan the folders', p: [
        'Good work starts with a plan. Decide where the project will live before opening any program. Inside Documents, use the folder Digital_Foundations with five subfolders.'],
        steps: [
          '01_Computer_Basics',
          '02_Windows_Practice',
          '03_Research',
          '04_Safety_Notes',
          '05_Portfolio (the finished document will be saved here)',
        ] },
      { h: 'The sections of your document', p: [
        'The portfolio has a title page and seven sections. Write in your own words and cite any source you use. A copied portfolio proves nothing.'],
        table: { head: ['Section', 'What to write', 'Length'], rows: [
          ['Title page', 'Title My Digital Foundations Portfolio, your name, course or school, and the date.', '1 page'],
          ['1. What is a computer?', 'Explain using input, processing, output and storage. Give two everyday examples.', '1/2 page'],
          ['2. How a computer works', 'Describe how data moves when you type a letter and save it. Mention the CPU, RAM and storage.', '1/2 page'],
          ['3. Hardware and software', 'List the main parts of your computer and what each does. Name the operating system and two applications.', '1 page with a table'],
          ['4. My computer skills', 'Windows tasks, file-management habits and shortcuts you can do. Include your folder structure.', '1/2 to 1 page'],
          ['5. Online research', 'One researched question, search words, and two sources judged using CRAAP, with references.', '1 page'],
          ['6. Digital safety', 'Your password and account-protection habits, and five rules for spotting scams.', '1/2 page'],
          ['7. Reflection', 'What you learned, what was difficult, and what you will practise next.', '1/2 page'],
        ] } },
    ],
    {
      mistakes: [
        'Starting to write before planning folders and sections.',
        'Copying text from the book or the internet instead of writing in your own words.',
        'Leaving out references in the research section.',
      ],
      exercises: [
        { q: 'Why is a portfolio more convincing than saying "I can use a computer"?', a: 'It is real evidence of your skill, not just a statement.' },
        { q: 'List the seven sections of the portfolio and say what you write in each.', a: 'What is a computer, how it works, hardware and software, my computer skills, online research, digital safety, and reflection.' },
        { q: 'Which folder holds the finished document?', a: '05_Portfolio, inside Digital_Foundations.' },
      ],
      quiz: [
        { q: 'A portfolio is:', options: ['A type of virus', 'A collection of your work that shows what you can do', 'A keyboard shortcut', 'A web browser'], answer: 1, why: 'It is evidence of your skills.' },
        { q: 'Where is the finished document saved?', options: ['01_Computer_Basics', '03_Research', '04_Safety_Notes', '05_Portfolio'], answer: 3, why: 'The finished portfolio goes in 05_Portfolio.' },
        { q: 'Section 5 must include:', options: ['A joke', 'Search words, two sources judged with CRAAP, and references', 'Only a title', 'Your password'], answer: 1, why: 'It shows your researched question and source judgement.' },
        { q: 'The portfolio should be written:', options: ['Copied from a friend', 'In your own words with sources cited', 'Only in tables', 'Without a title'], answer: 1, why: 'A copied portfolio proves nothing.' },
      ],
    }),

  T('cap-build', 'Build the portfolio step by step', 'Fungua hati mpya, ihifadhi mara moja, tumia mitindo ya vichwa, kagua, hamisha kuwa PDF na uhifadhi nakala kwa kanuni ya 3-2-1.',
    'Follow Parts A to E to build your portfolio, then check that you can open each backup copy.',
    [
      { h: 'Part A and B: folders and start the document', p: [
        'First set up the folders, then start the document. Save before you type: saving first protects you from losing work.'],
        steps: [
          'Open File Explorer (Windows + E), go to Documents and create Digital_Foundations with its five subfolders if you have not already.',
          'Move earlier work into the right folders and rename unclear file names.',
          'Open your word processor (Microsoft Word, LibreOffice Writer or Google Docs) and create a blank document.',
          'Save it at once as Computer_Basics_Summary in 05_Portfolio (Ctrl + S).',
          'Set the page to A4 with normal margins, and choose one clear font such as Calibri or Arial, size 11 or 12.',
          'On the first page type the title, your name, school and date. Make the title large and bold and centre the lines (Ctrl + E).',
          'Insert a page break (Ctrl + Enter) so the first section starts on a new page.',
        ] },
      { h: 'Part C: write the sections', p: [
        'Use heading styles so that all section headings look the same. Write in short paragraphs and use numbered or bulleted lists for steps. Save often with Ctrl + S.',
        'In Section 3 insert a table (Insert, Table) with two columns, Part and Job. In Section 5 write your references in the Chapter 11 format at the end of the section. In Section 7 write your honest reflection in the first person.',
        'Example for Section 2: When I press a key, the keyboard sends the signal to the computer. The processor (CPU) decides what the signal means and, with the help of RAM, the short-term working memory, shows the letter on the screen. The letter is held only in RAM until I press Save. When I click Save, the computer copies the document to the storage drive, where it stays even after the computer is turned off. Your own paragraph should be in your own words and describe your computer.'],
        tip: 'Heading styles keep headings consistent and let Word build a table of contents for you.' },
      { h: 'Part D: format and check', p: [
        'Checking turns a draft into good work.'],
        steps: [
          'Read the whole document aloud and fix any unclear sentence.',
          'Use Review, Spelling and Grammar (or F7). Do not accept every suggestion without thinking.',
          'Make sure all headings use the same style, font, size and spacing.',
          'Add page numbers: Insert, Page Number.',
          'Insert an automatic table of contents if the document is long: References, Table of Contents (it works only with heading styles).',
          'Check that your name is on the title page and that no private information (ID number, home address, phone number) is included.',
          'Save the document one more time.',
        ] },
      { h: 'Part E: export, name and back up', p: [
        'Finish by exporting a PDF and making backups. Follow the 3-2-1 backup idea: keep 3 copies, on 2 different kinds of storage, with 1 copy somewhere else.'],
        steps: [
          'Export a PDF copy. In Word choose File, Save As, set Save as type to PDF and click Save. In Google Docs choose File, Download, PDF document.',
          'Rename the final files clearly, for example Binsaid_Digital_Portfolio_2026.docx and Binsaid_Digital_Portfolio_2026.pdf.',
          'Copy the finished folder to a flash drive and upload the PDF to your cloud storage.',
          'Check that you can open each backup copy. A backup you have never opened is not yet proven.',
        ] },
    ],
    {
      mistakes: [
        'Typing for an hour before saving the new document.',
        'Formatting each heading by hand instead of using heading styles.',
        'Leaving your ID number, address or phone number in the portfolio.',
        'Making a backup but never opening it to test it.',
      ],
      exercises: [
        { q: 'Why save a new document immediately and then save it often?', a: 'Saving first protects you from losing work if the computer shuts down or the program closes.' },
        { q: 'Explain the 3-2-1 backup rule in your own words.', a: 'Keep 3 copies of your files, on 2 different kinds of storage, with 1 copy kept somewhere else, such as cloud storage.' },
        { q: 'What is the benefit of heading styles?', a: 'They make all headings consistent and allow an automatic table of contents.' },
        { q: 'How do you export a PDF in Word?', a: 'Choose File, Save As, set Save as type to PDF and click Save.' },
      ],
      quiz: [
        { q: 'What should you do immediately after creating a new document?', options: ['Print it', 'Close it', 'Email it', 'Save it with a clear name in the right folder'], answer: 3, why: 'Saving first protects your work.' },
        { q: 'Which is part of the 3-2-1 backup rule?', options: ['Keep one copy only', 'Keep copies on two different kinds of storage', 'Never test backups', 'Store all copies in one folder'], answer: 1, why: 'Three copies, two kinds of storage, one somewhere else.' },
        { q: 'Why use heading styles?', options: ['They make the file smaller', 'They stop viruses', 'They make headings consistent and can build a table of contents', 'They change your keyboard'], answer: 2, why: 'Styles give consistency and allow an automatic table of contents.' },
        { q: 'Which shortcut inserts a page break?', options: ['Ctrl + Enter', 'Ctrl + E', 'Ctrl + S', 'F7'], answer: 0, why: 'Ctrl + Enter starts a new page; Ctrl + E centres, Ctrl + S saves, F7 checks spelling.' },
        { q: 'A backup is proven when you:', options: ['Have made it', 'Have opened and checked it', 'Have deleted the original', 'Have renamed it'], answer: 1, why: 'A backup never opened is not yet proven.' },
      ],
    }),

  T('cap-progress', 'Measure your progress and keep practising', 'Jipime kwa uaminifu kwa kiwango cha 1 hadi 4 na fuata mpango wa siku 30 wa kufanya mazoezi kidogo kila siku.',
    'Score yourself 1 to 4 on each skill in the checklist, then pick the weakest one and plan 15 minutes of practice for it each day this week.',
    [
      { h: 'Measure your progress', p: [
        'A skill that is never measured is easy to overestimate. Spend ten minutes assessing yourself honestly. Use a four-point scale: 1 = I need help; 2 = I can do it with a guide; 3 = I can do it on my own most of the time; 4 = I can do it confidently and help others.',
        'The point is not to reach a 4 in everything; it is to see where you have grown and where you need more practice.'] },
      { h: 'Check your skills', p: [
        'Answer Yes or Not yet for each: I can explain what a computer is using input, processing, output and storage; name the main hardware parts and their jobs; explain RAM versus storage; describe what an operating system does; create, rename, move, copy and delete files and folders; use at least ten keyboard shortcuts without looking; describe how data travels across the internet.',
        'I can also search with good keywords and operators; judge a source using the CRAAP test; take notes in my own words and cite sources; create a strong unique password and use two-step verification; spot a phishing email or scam message; adjust privacy settings on my accounts; and write a polite, professional email.'] },
      { h: 'A 30-day practice plan', p: [
        'Skills fade if they are not used. A little practice every day, even 15 to 20 minutes, makes them permanent. Follow this plan or adapt it.'],
        table: { head: ['Days', 'Focus', 'Daily activity'], rows: [
          ['1-7', 'Files and keyboard', 'Practise five shortcuts a day. Keep folders tidy and rename any messy file.'],
          ['8-14', 'Typing', 'Practise touch typing for 15 minutes with a free typing tutor.'],
          ['15-21', 'Research', 'Research one question a day and write a three-sentence answer with a source and a CRAAP judgement.'],
          ['22-28', 'Security', 'Review one account a day: password, two-step verification, privacy settings and recovery details.'],
          ['29-30', 'Review', 'Re-score yourself. Update your portfolio and backups.'],
        ] },
        tip: 'Teach someone else. Show a family member how to create a strong password or help a friend organise folders. Teaching reveals what you really know.' },
    ],
    {
      mistakes: [
        'Scoring yourself high without testing the skill.',
        'Studying only once in a long while instead of a little every day.',
        'Practising only the skills you already like.',
      ],
      exercises: [
        { q: 'Which of your skills is strongest and which needs most practice? Why?', a: 'Answer from your own checklist, for example: file management is strongest because I use it daily; touch typing needs practice because I still look at the keys.' },
        { q: 'Describe a 30-day practice plan you will follow.', a: 'Week 1 files and shortcuts, week 2 typing, week 3 research, week 4 security, then days 29 and 30 review and update the portfolio and backups.' },
        { q: 'What do the four points on the scale mean?', a: '1 needs help, 2 can do it with a guide, 3 can do it alone most of the time, 4 confident and can help others.' },
      ],
      quiz: [
        { q: 'Which is the best way to keep your skills growing?', options: ['Study only once a year', 'Practise a little every day', 'Avoid new tools', 'Memorise without doing'], answer: 1, why: 'Small daily practice makes skills permanent.' },
        { q: 'In the 30-day plan, days 15 to 21 focus on:', options: ['Typing', 'Security', 'Research', 'Files and keyboard'], answer: 2, why: 'Research one question a day with a source and CRAAP judgement.' },
        { q: 'On the four-point scale, 4 means:', options: ['I need help', 'I can do it with a guide', 'I can do it most of the time', 'I can do it confidently and help others'], answer: 3, why: 'Level 4 is confident and able to help others.' },
        { q: 'Why is teaching someone else useful?', options: ['It reveals what you really know', 'It deletes mistakes', 'It speeds the computer', 'It replaces practice'], answer: 0, why: 'Explaining shows the gaps in your understanding.' },
      ],
    }),

  T('cap-ahead', 'The road ahead', 'Msingi wa kidijitali ni hatua ya kwanza; kutoka hapa unaweza kuendelea na hati, majedwali, programu, takwimu na mtandao au AI.',
    'Choose one next step from the table and write two sentences on why you want to learn it.',
    [
      { h: 'Foundations are a first step', p: [
        'Digital foundations are the first step, not the last. With the skills you have built, you are ready to learn more advanced tools. Each area below builds on what you already know.'] },
      { h: 'Possible next steps', p: [
        'The table shows where each path leads and how this book prepares you for it.'],
        table: { head: ['Next step', 'What you will learn', 'How this book helps'], rows: [
          ['Documents and presentations', 'Professional reports, formatting, slides and visual communication.', 'File skills, typing, and the habit of saving and backing up.'],
          ['Spreadsheets', 'Tables, formulas, charts and basic data analysis.', 'Understanding data and information; accuracy and checking.'],
          ['Programming', 'Giving instructions to a computer using a language such as Python.', 'How computers process input; working with files and folders.'],
          ['Data and statistics tools', 'Cleaning, analysing and presenting data with software.', 'Research skills, source evaluation and organised folders.'],
          ['Web and AI', 'Building websites, using machine-learning tools, and thinking critically about them.', 'How the internet works, and safe and honest use of technology.'],
        ] } },
      { h: 'Learning never stops', p: [
        'Technology changes every year. The programs you used in this book may look different in five years, but the ideas, such as how data moves, how to organise information and how to stay safe, will stay useful.',
        'You started this book as a beginner. You now understand how a computer works, how to organise your work, how to find and judge information, and how to stay safe online. Be proud of how far you have come, and keep building.'],
        tip: 'Keep curious, keep practising, and keep asking questions.' },
    ],
    {
      mistakes: [
        'Thinking you must master every tool at once. Choose one next step.',
        'Believing that learning stops when the book ends.',
        'Memorising button positions instead of the ideas, which outlast any program.',
      ],
      exercises: [
        { q: 'Choose one next step and explain why you want to learn it.', a: 'Answer in your own words, for example: programming, because I want to give instructions to a computer and solve problems with Python.' },
        { q: 'Why will the ideas in this book stay useful even if programs change?', a: 'Programs change, but how data moves, how to organise information and how to stay safe remain useful.' },
        { q: 'How do file skills help with spreadsheets or documents?', a: 'Saving, naming and backing up files carry over to every tool you use later.' },
      ],
      quiz: [
        { q: 'Which next step teaches giving instructions to a computer with a language such as Python?', options: ['Spreadsheets', 'Programming', 'Presentations', 'Typing'], answer: 1, why: 'Programming means writing instructions in a language such as Python.' },
        { q: 'Which path involves tables, formulas and charts?', options: ['Web and AI', 'Programming', 'Spreadsheets', 'Backups'], answer: 2, why: 'Spreadsheets cover tables, formulas, charts and basic analysis.' },
        { q: 'What stays useful even when programs look different?', options: ['Exact menu positions', 'The ideas such as how data moves and staying safe', 'Old icons', 'Colours of windows'], answer: 1, why: 'The ideas last longer than any particular program.' },
        { q: 'Digital foundations are:', options: ['The last step', 'The first step', 'A single program', 'A type of backup'], answer: 1, why: 'They open the way to more advanced skills.' },
      ],
    }),
];
