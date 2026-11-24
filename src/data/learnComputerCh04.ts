import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 4: Software and operating systems (from Digital Foundations by Binsaid). */
export const CB_CH4: LearnLesson[] = [
  T('sw-types', 'What is software? Three types', 'Software ni maelekezo yanayoiambia kompyuta cha kufanya, na huwa za aina tatu: mfumo, programu za kazi, na zana za matengenezo.',
    'Open your phone or laptop and list five apps or programs. Next to each, write whether it is system, application or utility software.',
    [
      { h: 'Software and hardware', p: [
        'Software is a collection of programs and instructions that tell a computer what to do. You cannot touch software; you can only see its results. Think of a cook and a recipe: the kitchen, stove and pots are hardware, and the recipe is software.',
        'A computer needs both. Hardware provides the physical equipment, and software provides the instructions and tools. A laptop with no software is like a bicycle without a rider.'],
        tip: 'A simple test: "Can I drop it on my foot?" If yes, it is hardware. If not, it is software.' },
      { h: 'System software', p: [
        'System software manages the computer and provides a platform on which other programs run. The most important example is the operating system, such as Windows.',
        'It also includes device drivers, small programs that let the operating system talk to a particular printer, keyboard or graphics card, and firmware, the built-in instructions that start a device when you switch it on.'] },
      { h: 'Application and utility software', p: [
        'Application software (or "apps") helps you complete a particular task. Word processors, web browsers, spreadsheet programs, media players, calculators, games and messaging apps are all applications.',
        'Utility software helps maintain, protect or manage a computer. Backup tools, antivirus tools, disk clean-up tools and file-compression tools are utilities. They do not help you write an essay, but they keep your computer healthy.'] },
      { h: 'The three categories side by side', p: [
        'Use this table to classify any program you meet by asking what it is mainly for.'],
        table: { head: ['Category', 'Meaning', 'Examples'], rows: [
          ['System software', 'Manages the computer and provides a platform for applications.', 'Windows, Linux, device drivers, firmware'],
          ['Application software', 'Helps a user complete a particular task.', 'Word processors, browsers, media players, calculators'],
          ['Utility software', 'Helps maintain, protect or manage a computer.', 'Backup tools, antivirus, disk clean-up, zip tools'],
        ] } },
    ],
    {
      mistakes: [
        'Thinking that software can be touched. Only its results can be seen.',
        'Calling every program "the operating system". Browsers and word processors are applications.',
        'Putting antivirus in the application category. It protects the computer, so it is a utility.',
        'Believing a computer is useful without software. Hardware alone cannot do anything.',
      ],
      exercises: [
        { q: 'Explain the difference between hardware and software with two examples of each.', a: 'Hardware is physical equipment, such as a keyboard and a screen. Software is instructions you cannot touch, such as Windows and a word processor.' },
        { q: 'Describe the three categories of software and give two examples of each.', a: 'System software manages the computer (Windows, drivers). Application software helps with tasks (browser, calculator). Utility software maintains and protects (antivirus, backup tool).' },
        { q: 'What are a device driver and firmware?', a: 'A driver is a small program that lets the operating system talk to a device such as a printer. Firmware is the built-in instruction set that starts a device when you switch it on.' },
      ],
      quiz: [
        { q: 'Which statement best describes software?', options: ['Physical parts inside a computer', 'Programs and instructions that tell a computer what to do', 'The cables that join devices', 'The screen and keyboard'], answer: 1, why: 'Software is the set of programs and instructions; you cannot touch it.' },
        { q: 'A backup tool is an example of which category?', options: ['Application software', 'Hardware', 'Utility software', 'Firmware only'], answer: 2, why: 'Backup tools help maintain and protect a computer, which is the job of utility software.' },
        { q: 'Which of these is an application?', options: ['A device driver', 'A web browser', 'Firmware', 'The operating system'], answer: 1, why: 'A browser helps you complete a task (browsing), so it is application software.' },
        { q: 'What is the "drop it on my foot" test used for?', options: ['Testing if a laptop is strong', 'Telling hardware from software', 'Finding the operating system', 'Checking a licence'], answer: 1, why: 'If you can drop it on your foot it is hardware; if not, it is software.' },
        { q: 'What does a driver let the operating system do?', options: ['Charge the battery', 'Talk to a particular device', 'Connect to Wi-Fi only', 'Delete old files'], answer: 1, why: 'A driver is a small program that lets the operating system communicate with a particular printer, keyboard or graphics card.' },
      ],
    }),

  T('sw-os', 'The operating system', 'Mfumo endeshi ni programu kuu inayoanza kwanza, ikiwa kati ya programu na vifaa, na kazi zake tano ni faili, kumbukumbu, vifaa, programu na watumiaji.',
    'Plug in a flash drive (or press Alt + Tab with two programs open) and notice which operating system job you just saw in action.',
    [
      { h: 'What the operating system is', p: [
        'An operating system (OS) is the main system software that manages computer hardware and provides services for applications. It is the first software to start when you switch on the computer and the last to stop when you shut down. Every other program depends on it.',
        'When you press "Save" in a word processor, the application does not talk directly to the storage drive. It asks the operating system, and the operating system handles the drive.',
        'This arrangement means that programmers do not have to rewrite their software for every possible keyboard, screen or drive. It also means that one program cannot easily damage another.'] },
      { h: 'The five main jobs', p: [
        'The operating system does five main jobs. You notice each of them in everyday use.'],
        table: { head: ['Job', 'What it means', 'Example you will notice'], rows: [
          ['Manages files', 'Stores, finds, names and organises data on the drive.', 'You open File Explorer and see your folders.'],
          ['Manages memory', 'Shares RAM between the programs that are running.', 'You open a browser and a document at the same time.'],
          ['Controls devices', 'Communicates with the keyboard, screen, printer and USB drives.', 'You plug in a flash drive and it appears in File Explorer.'],
          ['Runs programs', 'Starts, switches between and closes applications.', 'You press Alt + Tab to change windows.'],
          ['Handles users and security', 'Controls accounts, passwords and permissions.', 'You sign in with a password or PIN.'],
        ] } },
      { h: 'Popular operating systems', p: [
        'Different devices use different operating systems. This book uses Windows for practical demonstrations because it is the most common system on student laptops.',
        'The ideas you learn, such as files, folders, windows and shortcuts, apply to the other systems with only small differences.'],
        table: { head: ['Operating system', 'Made by', 'Commonly found on'], rows: [
          ['Microsoft Windows', 'Microsoft', 'Most laptops and desktop computers'],
          ['macOS', 'Apple', 'Apple Mac computers'],
          ['Linux', 'An open community (many versions)', 'Servers, some desktops, many technical devices'],
          ['Android', 'Google', 'Most smartphones and many tablets'],
          ['iOS / iPadOS', 'Apple', 'iPhones and iPads'],
        ] } },
    ],
    {
      mistakes: [
        'Thinking an application talks directly to the drive. It always asks the operating system.',
        'Confusing the operating system with a particular app. Windows is not Microsoft Word.',
        'Believing Linux is made by one company. It is made by an open community, in many versions.',
        'Assuming that skills from Windows are useless on other systems. Files, folders and windows work in similar ways.',
      ],
      exercises: [
        { q: 'What are the five main jobs of an operating system?', a: 'It manages files, manages memory, controls devices, runs programs, and handles users and security.' },
        { q: 'Match each to a company or maker: Windows, macOS, Android, iOS.', a: 'Windows is made by Microsoft, macOS and iOS by Apple, and Android by Google.' },
        { q: 'Why does the OS sit between applications and hardware?', a: 'So programmers do not have to rewrite software for every keyboard, screen or drive, and so one program cannot easily damage another.' },
      ],
      quiz: [
        { q: 'Which is the first software to start when you switch on a computer?', options: ['A word processor', 'The browser', 'The operating system', 'An antivirus'], answer: 2, why: 'The operating system starts first and stops last; all other programs depend on it.' },
        { q: 'You open a browser and a document at the same time. Which OS job is this?', options: ['Managing memory', 'Handling security', 'Zipping files', 'Printing'], answer: 0, why: 'The OS shares RAM between running programs.' },
        { q: 'Which operating system runs most smartphones and many tablets?', options: ['macOS', 'Android', 'Windows only', 'Linux only'], answer: 1, why: 'Android, made by Google, is found on most smartphones and many tablets.' },
        { q: 'Signing in with a password or PIN is an example of which job?', options: ['Manages files', 'Controls devices', 'Handles users and security', 'Manages memory'], answer: 2, why: 'The OS controls accounts, passwords and permissions.' },
        { q: 'Pressing Alt + Tab to change windows shows which job?', options: ['Runs programs', 'Manages files', 'Handles users', 'Controls the printer'], answer: 0, why: 'Starting, switching between and closing applications is the "runs programs" job.' },
      ],
    }),

  T('sw-together', 'Hardware and software together', 'Kuandika na kuhifadhi aya kunahusisha vifaa na programu pamoja: kibodi, mfumo endeshi, programu ya maandishi, RAM, skrini na diski.',
    'Type one sentence in Notepad and save it. Then write the five steps of what happened, naming each piece of hardware and software involved.',
    [
      { h: 'Following one ordinary task', p: [
        'To see how everything fits together, follow a very ordinary task: typing a paragraph and saving it. Many parts take turns, and you usually never notice.'] },
      { h: 'Typing and saving, step by step', p: [
        'Each step uses either hardware or software, and often both are needed for the same moment.'],
        steps: [
          'You press keys. The keyboard (hardware) sends signals to the computer.',
          'The operating system (software) receives the signals and passes them to the word processor (software) that is open.',
          'The word processor adds each letter to the document held in RAM (hardware).',
          'The screen (hardware) shows the letters, driven by the graphics software and the processor.',
          'You press Ctrl + S. The word processor asks the operating system to save. The operating system writes the file to the storage drive (hardware).',
        ] },
      { h: 'More examples of teamwork', p: [
        'The same idea applies to everything you do on a computer. Hardware does the physical work, and software decides what the hardware should do.'],
        table: { head: ['Situation', 'Hardware involved', 'Software involved'], rows: [
          ['Typing an assignment', 'Keyboard, screen, storage drive', 'Operating system and word processor'],
          ['Listening to a lesson', 'Speakers or headphones', 'Media player or browser'],
          ['Joining a video call', 'Webcam, microphone, screen', 'Video-call application and operating system'],
          ['Printing a report', 'Printer and computer', 'Document application and printer driver'],
        ] },
        tip: 'When something goes wrong, ask: is it a hardware problem (a part is broken) or a software problem (the instructions are wrong)? This question helps you find the cause faster.' },
    ],
    {
      mistakes: [
        'Believing the keyboard sends letters directly to the document. The operating system passes them on.',
        'Forgetting that the document is held in RAM until you save it to the drive.',
        'Thinking only hardware matters in a task. Without the software the hardware has no instructions.',
        'Skipping the save step. Unsaved work in RAM is lost if the power goes off.',
      ],
      exercises: [
        { q: 'Explain what happens, step by step, when you type a word and save it.', a: 'The keyboard sends signals, the OS passes them to the word processor, which puts the letters in RAM and shows them on the screen. On Ctrl + S the word processor asks the OS, which writes the file to the storage drive.' },
        { q: 'Name the hardware and software used when printing a report.', a: 'Hardware: the printer and the computer. Software: the document application and the printer driver.' },
        { q: 'Which hardware and software are used when joining a video call?', a: 'Webcam, microphone and screen, with a video-call application and the operating system.' },
      ],
      quiz: [
        { q: 'Where is the document held while you are typing it, before saving?', options: ['In the storage drive', 'In RAM', 'In the keyboard', 'In the printer'], answer: 1, why: 'The word processor adds each letter to the document held in RAM.' },
        { q: 'Who actually writes the file to the storage drive?', options: ['The keyboard', 'The screen', 'The operating system', 'The microphone'], answer: 2, why: 'The word processor asks the OS to save, and the OS writes the file to the drive.' },
        { q: 'What does the printer driver do?', options: ['Prints on paper by itself', 'Lets the system talk to the printer', 'Saves the file', 'Speeds up the internet'], answer: 1, why: 'A driver lets the operating system communicate with a particular device such as a printer.' },
        { q: 'Which pair is correctly matched?', options: ['Speakers: software', 'Browser: hardware', 'Webcam: hardware', 'Operating system: hardware'], answer: 2, why: 'A webcam is physical, so it is hardware; browser and OS are software.' },
      ],
    }),

  T('sw-install', 'Install, update and remove software', 'Weka programu kutoka vyanzo vya kuaminika tu, ziondoe kupitia Settings, na zisasishe mara kwa mara ili kuziba mianya ya usalama.',
    'Do the practical lab: list ten programs from Settings, Apps, Installed apps with their category, then check Windows Update and note the date of the last update.',
    [
      { h: 'Why care when installing', p: [
        'Sooner or later you will want to add a program or remove one. Doing this carelessly is one of the most common ways computers become slow or infected, so follow a safe routine.'] },
      { h: 'Installing a program safely', p: [
        'Every program uses space and may slow the computer, so install only what you need.'],
        steps: [
          'Decide you need it. Ask whether a program you already have can do the job.',
          'Use a trustworthy source. Prefer the Microsoft Store or the official website of the software maker. Type the address yourself or use a link from a site you trust.',
          'Check the file name and size. A real installer is rarely tiny or oddly named, and a program that claims to be a "free full version" of an expensive product is a warning sign.',
          'Download and open the installer. Windows may ask "Do you want to allow this app to make changes?". Read the name of the publisher before clicking Yes.',
          'Read each screen. Installers sometimes offer extra programs. Untick any that you do not want, and choose the Custom or Advanced option if available.',
          'Finish and test. Open the program, check that it works, and then delete the installer file from Downloads if you no longer need it.',
        ] },
      { h: 'Removing a program', p: [
        'Warning: never delete a program\'s folder by hand. Dragging a program\'s folder to the Recycle Bin does not remove it properly and can leave the computer unstable. Always use the uninstall option.'],
        steps: [
          'Open Settings (Windows + I) and choose Apps, then Installed apps.',
          'Find the program in the list and click the three dots beside it.',
          'Choose Uninstall and confirm. Follow any instructions.',
          'Restart the computer if the program asks you to.',
        ] },
      { h: 'Why updates matter', p: [
        'Software makers regularly release updates that fix errors and close security weaknesses. Criminals look for weaknesses in out-of-date software, so keeping the system and your apps updated is one of the most effective protections you have.'],
        steps: [
          'Open Settings and choose Windows Update.',
          'Click Check for updates.',
          'Let Windows download and install what it finds. Keep the laptop plugged in for large updates.',
          'Restart when asked, preferably when you are not in the middle of work.',
        ],
        tip: 'Do not uninstall anything you do not understand. Search its name first; it may be a driver your laptop needs.' },
    ],
    {
      mistakes: [
        'Downloading installers from random websites instead of the Microsoft Store or the maker\'s official site.',
        'Clicking Next on every installer screen and accepting extra programs you did not want.',
        'Deleting a program\'s folder instead of using Uninstall.',
        'Postponing updates for months, which leaves security weaknesses open.',
      ],
      exercises: [
        { q: 'List the steps for installing a program safely.', a: 'Decide you need it, use a trustworthy source, check the file name and size, read the publisher name at the permission prompt, read each screen and untick extras, then finish, test and delete the installer.' },
        { q: 'How do you remove a program properly on Windows?', a: 'Open Settings, then Apps, then Installed apps, click the three dots beside the program, choose Uninstall, confirm, and restart if asked.' },
        { q: 'Why are updates important?', a: 'They fix errors and close security weaknesses that criminals look for in out-of-date software.' },
        { q: 'Why is a "free full version" of an expensive program a warning sign?', a: 'It is probably pirated or fake, and such files are a common hiding place for malware.' },
      ],
      quiz: [
        { q: 'Which is the best place to get a program?', options: ['A link in a random message', 'The Microsoft Store or the maker\'s official website', 'Any site offering "free full version"', 'A friend\'s unknown file'], answer: 1, why: 'Trustworthy sources reduce the risk of malware and fake installers.' },
        { q: 'What should you do if a program is no longer needed?', options: ['Drag its folder to the Recycle Bin', 'Uninstall it from Settings', 'Rename the folder', 'Ignore it forever'], answer: 1, why: 'Deleting the folder by hand can leave the computer unstable; use the uninstall option.' },
        { q: 'What is the keyboard shortcut for opening Settings?', options: ['Windows + I', 'Ctrl + S', 'Alt + Tab', 'Ctrl + Z'], answer: 0, why: 'Windows + I opens Settings.' },
        { q: 'The installer offers extra programs you did not ask for. What should you do?', options: ['Accept all of them', 'Untick those you do not want', 'Cancel and reboot', 'Delete Windows'], answer: 1, why: 'Installers sometimes offer extra programs; untick the ones you do not want, or use Custom or Advanced.' },
        { q: 'Why keep the laptop plugged in during large updates?', options: ['Updates only work with a charger', 'To avoid running out of power mid-update', 'To make it download faster', 'It is a legal rule'], answer: 1, why: 'A large update running out of power could cause problems, so keep the laptop plugged in.' },
      ],
    }),

  T('sw-licences', 'Software licences and web apps', 'Leseni ni makubaliano ya kisheria ya jinsi ya kutumia programu; epuka programu za kuibiwa kwa sababu ni haramu na zina virusi.',
    'Look at one program on your computer and decide which licence type it is: paid, free, open source, trial or subscription. Find one free alternative to a paid program.',
    [
      { h: 'What is a licence?', p: [
        'When you install software you accept a licence, a legal agreement that says how you may use it. Different programs use different kinds of licences.'],
        table: { head: ['Type', 'Meaning', 'Example idea'], rows: [
          ['Paid (commercial)', 'You pay to use it, often with a licence key.', 'Many office suites and design programs'],
          ['Free (freeware)', 'Free to use, but the maker keeps the rights.', 'Many mobile apps and utilities'],
          ['Open source', 'The code is public and may be shared and changed under stated rules.', 'Linux, LibreOffice'],
          ['Trial (shareware)', 'Free for a limited time or with limited features.', 'A 30-day trial of a program'],
          ['Subscription', 'You pay regularly for ongoing access.', 'Cloud-based office suites'],
        ] } },
      { h: 'Pirated software is risky', p: [
        'Warning: cracked or "free full version" copies of paid programs are illegal to use in many places, and they are a favourite hiding place for malware.',
        'If you cannot afford a paid program, use a free alternative such as LibreOffice or a web-based tool, or ask your school about licences available to students.'] },
      { h: 'Web apps and the cloud', p: [
        'Many programs now run in your web browser instead of being installed. A web app such as an online document editor stores your work on servers on the internet (the "cloud"), which means you can reach it from any device.',
        'The advantages are easy sharing and no installation. The disadvantages are that you usually need a connection and must protect your account carefully (Chapter 12).'] },
      { h: 'Practical lab: software survey', p: [
        'Goal: learn what is installed on your laptop and make sure it is up to date. You have succeeded when you have a table of at least ten programs correctly classified and you know whether Windows is up to date.'],
        steps: [
          'Open Settings, Apps, Installed apps. Scroll through the list.',
          'Copy at least ten programs into a three-column table: Program, Category (system, application or utility), What I use it for.',
          'Mark any program you do not recognise or no longer use. Search its name before deciding anything; do not uninstall anything you do not understand.',
          'Open Windows Update, click Check for updates, and write down the date of the last update.',
          'Identify two pieces of software on your computer that run in the browser rather than being installed.',
        ] },
    ],
    {
      mistakes: [
        'Clicking "I agree" without knowing a licence is a legal agreement.',
        'Using cracked copies because they are free. They are illegal in many places and often carry malware.',
        'Thinking open source means no rules. It is shared and changed under stated rules.',
        'Forgetting that web apps need a connection and a well protected account.',
      ],
      exercises: [
        { q: 'Name the five licence types and give an example idea for each.', a: 'Paid (office suites), free or freeware (many mobile apps), open source (Linux, LibreOffice), trial or shareware (30-day trial), and subscription (cloud office suites).' },
        { q: 'Why should you avoid pirated software?', a: 'It is illegal in many places, a favourite hiding place for malware, and unnecessary because free alternatives and student licences exist.' },
        { q: 'Give one advantage and one disadvantage of a web app.', a: 'Advantage: easy sharing and no installation. Disadvantage: it usually needs an internet connection and careful account protection.' },
      ],
      quiz: [
        { q: 'What is a software licence?', options: ['A type of hardware', 'A legal agreement on how software may be used', 'A kind of virus', 'A backup file'], answer: 1, why: 'A licence is a legal agreement that sets out how software may be used.' },
        { q: 'Which is an example of open source software?', options: ['A pirated copy of an office suite', 'LibreOffice', 'A 30-day trial', 'A cracked game'], answer: 1, why: 'LibreOffice and Linux are open source: the code is public and may be shared and changed under stated rules.' },
        { q: 'A 30-day trial of a program is which licence type?', options: ['Open source', 'Subscription', 'Trial (shareware)', 'Freeware'], answer: 2, why: 'Trial software is free for a limited time or with limited features.' },
        { q: 'If you cannot afford a paid program, what is a good choice?', options: ['Download a cracked copy', 'Use a free alternative or ask your school about student licences', 'Share someone else\'s licence key', 'Stop using computers'], answer: 1, why: 'Free alternatives such as LibreOffice and student licences are legal and safer.' },
        { q: 'Where is the work of a web app stored?', options: ['Only on your desk', 'On servers on the internet (the cloud)', 'Inside the keyboard', 'Nowhere'], answer: 1, why: 'Web apps store your work online, so you can reach it from any device.' },
      ],
    }),
];
