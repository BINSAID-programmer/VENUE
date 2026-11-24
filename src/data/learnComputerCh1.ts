import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Digital Foundations, chapter 1: Understanding computers and technology. */
export const CB_CH1: LearnLesson[] = [
  T('tech-what', 'What is technology?',
    'Teknolojia ni matumizi ya maarifa, zana na mbinu kutatua matatizo au kurahisisha kazi; haihusu kompyuta peke yake.',
    'Write down every technology you used since you woke up this morning. Next to each, say what problem it solved.',
    [
      { h: 'Technology is wider than computers', p: [
        'Every day you use technology, usually without noticing it. When you switch on a light, boil water on a stove, ride a bus or write with a pen, you use tools that people designed to solve a problem or make a task easier. Technology is the practical use of knowledge, tools and methods to solve problems or make tasks easier.',
        'Many learners think technology means only computers and phones. In fact it began thousands of years ago, when people shaped stones into cutting tools, learned to make fire and invented the wheel. A water pump, a bicycle, a calculator, a washing machine, a camera and a traffic-light system are all technology. What they share is a purpose: each was built to help a person do something faster, more safely, more accurately or with less effort.'] },
      { h: 'Three parts of any technology', p: [
        'It helps to notice three parts in any piece of technology. First there is a problem or need: people needed to travel farther, wash clothes, keep records or talk across long distances. Second there is knowledge: someone understood how materials, electricity, mathematics or information behave. Third there is a tool or method: the knowledge was turned into a machine, a system, a procedure or a program.'],
        table: { head: ['Technology', 'Problem or need', 'Knowledge used', 'Tool or method'], rows: [['Bicycle', 'Travel farther with less effort', 'How wheels, gears and balance work', 'The machine itself'], ['Washing machine', 'Wash clothes without hard work', 'Motors, water and timing', 'The machine and its programmes'], ['Mobile money', 'Pay and send money safely', 'Information and security', 'A phone app and payment system']] } },
      { h: 'Example: one ordinary morning', p: [
        'Amina wakes to an alarm on her phone, boils water on a gas stove, takes a minibus to campus, pays the fare with mobile money and checks her timetable on a university website. Count the technologies: phone, stove, vehicle, payment system and website. Only some of them are computers, but all of them are technology.'],
        tip: 'Look for the problem behind any tool. If you can say what problem it solves, you understand why it exists.' },
      { h: 'Old and new technology', p: [
        'New technology rarely replaces old technology completely; it usually builds on it. The printing press made books common, and today an e-book reader lets you carry a whole library. The telegraph carried short messages by wire, and today a video call carries your face and voice across the world in a moment.',
        'When you study digital technology, you are studying the latest chapter of a very long story.'] },
    ],
    {
      mistakes: [
        'Thinking technology means only computers and phones. A pen, a bicycle and a water pump are technology too.',
        'Looking only at the device and forgetting the problem it was built to solve.',
        'Believing new technology always replaces the old completely. It usually builds on it.',
      ],
      exercises: [
        { q: 'In your own words, what is technology? Give three examples that are not computers.', a: 'Technology is the practical use of knowledge, tools and methods to solve problems or make tasks easier. Examples: a bicycle, a water pump, a pair of scissors.' },
        { q: 'Name the three parts you can notice in any piece of technology.', a: 'A problem or need, the knowledge to solve it, and a tool or method that turns the knowledge into something people can use.' },
        { q: 'Take a bus. What problem does it solve and what knowledge does it use?', a: 'It solves the problem of carrying many people over a distance. It uses knowledge of engines or motors, materials and road transport.' },
      ],
      quiz: [
        { q: 'Which best defines technology?', options: ['The practical use of knowledge, tools and methods to solve problems', 'Only electronic devices', 'Only the internet', 'Only things invented in the last 50 years'], answer: 0, why: 'Technology is wider than computers: it is any practical use of knowledge and tools to solve problems.' },
        { q: 'Which of these is NOT one of the three parts of a technology?', options: ['A brand name', 'A problem or need', 'Knowledge', 'A tool or method'], answer: 0, why: 'The three parts are a problem or need, knowledge, and a tool or method.' },
        { q: 'When did technology begin?', options: ['Thousands of years ago, with tools and fire', 'With the first smartphone', 'With the internet', 'In the 1990s'], answer: 0, why: 'People made stone tools and fire long before electronics.' },
        { q: 'An e-book reader builds on which older technology?', options: ['Printed books', 'The telegraph', 'The bicycle', 'The stove'], answer: 0, why: 'The printing press made books common; an e-book reader lets you carry a whole library.' },
      ],
    }),

  T('digital-vs', 'Digital technology and why it is different',
    'Teknolojia ya kidijiti huhifadhi na kushughulikia taarifa kama namba (0 na 1), hivyo ni rahisi kunakili, kutafuta na kutuma.',
    'Name one analogue and one digital way to record your voice or write a letter, and say which is easier to copy.',
    [
      { h: 'What is digital technology?', p: [
        'Digital technology means electronic tools and systems that create, store, process or communicate information in digital form. Computers, smartphones, digital cameras, online learning platforms and mobile-money systems are all examples.',
        'Digital technology touches almost every part of daily life. Think about your own week: which areas do you already use every day, and which do you rarely use? The goal of this course is to make you confident in all of them.'] },
      { h: 'Analogue and digital', p: [
        'What does "digital form" mean? Imagine two ways of recording your voice. An old cassette recorder stores the sound as a continuously varying magnetic pattern; this is called analogue. A phone voice recorder measures the sound thousands of times every second and stores each measurement as a number; this is digital.',
        'Because digital information is simply numbers, it can be copied perfectly, stored in tiny spaces, searched in a moment and sent across the world without losing quality.'],
        table: { head: ['Feature', 'Analogue', 'Digital'], rows: [['How information is stored', 'As a continuous physical pattern (grooves, magnetism, ink)', 'As numbers, using only the digits 0 and 1'], ['Copying', 'Each copy loses a little quality', 'Copies can be exact'], ['Searching', 'Slow: you must look through the pages or tape', 'Fast: a computer can search millions of items in a moment'], ['Sending', 'Usually physical: post, delivery, travel', 'Instant: email, messages and downloads'], ['Example', 'Paper letter, vinyl record, wall clock with hands', 'Email, music file, digital clock']] } },
      { h: 'Why this matters to you', p: [
        'Each row of the table is a reason why digital tools have spread so quickly. A photocopy of a photocopy gets worse, but a file you copy ten times is exactly the same as the first. A lecturer can search ten thousand pages for one word in a second. A message that once travelled for days by post now arrives instantly.'],
        tip: 'Digital means numbers. Whenever you meet a digital file (a photo, a song, a document), remember it is a long list of numbers underneath.' },
    ],
    {
      mistakes: [
        'Thinking "digital" just means "modern" or "has a screen". It means information stored as numbers.',
        'Believing that every digital copy loses quality. Digital copies can be exact; analogue copies lose a little each time.',
        'Calling a clock with hands digital. It is analogue; a clock showing numbers is digital.',
      ],
      exercises: [
        { q: 'Explain the difference between analogue and digital information with an example.', a: 'Analogue stores information as a continuous physical pattern, such as the magnetism on a cassette tape. Digital measures the information and stores it as numbers, such as a voice recording on a phone.' },
        { q: 'Give two reasons why a digital copy can be better than an analogue copy.', a: 'A digital copy can be exact, while each analogue copy loses a little quality. Digital files can also be searched fast and sent instantly.' },
        { q: 'Classify as analogue or digital: vinyl record, music file, wall clock with hands, email.', a: 'Vinyl record: analogue. Music file: digital. Wall clock with hands: analogue. Email: digital.' },
      ],
      quiz: [
        { q: 'Digital information is stored as...', options: ['Numbers made of 0s and 1s', 'Only pictures', 'Only paper pages', 'Sound waves on tape'], answer: 0, why: 'Digital information is simply numbers, using the digits 0 and 1.' },
        { q: 'Which is an example of analogue storage?', options: ['A cassette tape', 'An email', 'A music file', 'A digital clock'], answer: 0, why: 'A cassette stores sound as a continuously varying magnetic pattern.' },
        { q: 'Which is a benefit of digital information?', options: ['Copies can be exact', 'Every copy loses quality', 'It can only be sent by post', 'It cannot be searched'], answer: 0, why: 'Because it is just numbers, a digital copy can be identical to the original.' },
        { q: 'A phone voice recorder measures the sound thousands of times a second. This is...', options: ['Digital recording', 'Analogue recording', 'A printing method', 'Cooling'], answer: 0, why: 'Each measurement is stored as a number, which is digital.' },
      ],
    }),

  T('comp-def', 'What is a computer?',
    'Kompyuta ni kifaa cha kielektroniki kinachopokea data, kuichakata kwa maagizo, kuihifadhi na kutoa matokeo; hakifikiri kama binadamu.',
    'Type the marks 60, 70 and 80 into a calculator and find the average. Then try 600, 70 and 80 and compare.',
    [
      { h: 'A definition with four verbs', p: [
        'A computer is an electronic device that receives data, follows instructions to process that data, can store data and results, and produces output. Notice the four verbs: receives, processes, stores and produces. They are the key to understanding every computer, from the smallest phone to the largest data centre.',
        'A computer can calculate, organise information, display documents, play sound and video, communicate with other devices and run applications. It can do these things because it follows instructions written by people, called programs.'] },
      { h: 'A computer does not think like a person', p: [
        'This is one of the most important ideas in the whole course. A computer is extremely fast and extremely obedient, but it has no understanding of its own. It does exactly what its instructions and its input data tell it to do. If either is wrong, the result can be wrong, and the computer will present the wrong result with complete confidence.'] },
      { h: 'Example: a calculator, a mistake and a lesson', p: [
        'You enter the marks 60, 70 and 80 into a calculator and ask for the average. The calculator adds them (210), divides by three and shows 70. That is correct.',
        'Now suppose you slip and type 600 instead of 60. The calculator adds 600 + 70 + 80 = 750, divides by three and proudly shows 250. The calculator did not make an error; you did. The machine calculated perfectly from incorrect input. This is why a person must always check the data and think about whether the answer makes sense.'],
        tip: 'Before you trust any answer, ask: does this result make sense?' },
      { h: 'What computers do well, and what they cannot do', p: [
        'Knowing the strengths and the limits helps you use computers wisely. They are excellent at repeating exact steps, but they cannot judge meaning or truth.'],
        table: { head: ['Computers are very good at...', 'Computers cannot...'], rows: [['Doing calculations quickly and accurately', 'Understand meaning the way people do'], ['Storing and finding huge amounts of information', 'Decide what is fair, kind or wise'], ['Repeating the same task without getting tired', 'Know whether the information given to them is true'], ['Connecting people and devices across the world', 'Fix a wrong instruction by themselves'], ['Following exact, step-by-step instructions', 'Replace careful human checking']] } },
    ],
    {
      mistakes: [
        'Thinking a computer "knows" or understands things. It only follows instructions and data that people supplied.',
        'Blaming the computer for a wrong average when the user typed a wrong number.',
        'Trusting a result just because it came from a computer.',
        'Thinking a computer is only a laptop or desktop.',
      ],
      exercises: [
        { q: 'Why can a computer give a wrong answer even when it is working perfectly?', a: 'Because it follows its instructions and input exactly. If the instructions or the data are wrong, the result will be wrong, and the computer will show it with confidence.' },
        { q: 'You type 600 instead of 60 and the average of 600, 70 and 80 is shown. What is the answer and who made the error?', a: 'The average is 250 (750 divided by 3). The user made the error by typing the wrong input; the calculator calculated correctly.' },
        { q: 'Name three things computers are good at and two things they cannot do.', a: 'Good at: fast calculation, storing huge amounts of information, repeating tasks without tiredness. Cannot: understand meaning like people, know whether information is true.' },
      ],
      quiz: [
        { q: 'Which best defines a computer?', options: ['An electronic device that receives, processes, stores and produces information', 'A device used only for typing', 'A device that always knows the truth', 'A machine that works without instructions'], answer: 0, why: 'A computer receives data, processes it by following instructions, can store results and produces output.' },
        { q: 'A computer calculates a wrong average because you typed a wrong mark. Who made the error?', options: ['The user who typed the wrong input', 'The computer', 'The keyboard', 'Nobody'], answer: 0, why: 'The machine calculated perfectly from incorrect input.' },
        { q: 'The set of instructions a computer follows is called a...', options: ['Program', 'Cable', 'Screen', 'Pixel'], answer: 0, why: 'Programs are instructions written by people that the computer follows.' },
        { q: 'Which task can a computer NOT do by itself?', options: ['Decide what is fair, kind or wise', 'Calculate quickly', 'Store large amounts of information', 'Repeat a task without getting tired'], answer: 0, why: 'Computers have no understanding of their own; judgement stays with people.' },
        { q: 'The average of 600, 70 and 80 is...', options: ['250', '70', '750', '60'], answer: 0, why: '600 + 70 + 80 = 750; 750 divided by 3 is 250.' },
      ],
    }),

  T('ctype-hist', 'Types of computers and a short history',
    'Kuna desktop, laptop, tablet, simu janja, seva na kompyuta zilizofichwa (embedded); historia ni kutoka abacus hadi simu mfukoni.',
    'List five computers you used this week, including hidden (embedded) ones, and give the type of each.',
    [
      { h: 'Computers come in many shapes', p: [
        'When you hear the word computer, you may imagine a laptop. But computers come in many shapes and sizes, and you probably use several every day. They differ in size, power and purpose, but they all follow the same basic cycle of input, processing, output and storage.'],
        fig: 'types' },
      { h: 'Five common types', p: [
        'Use the table to match each type with what it is usually used for.'],
        table: { head: ['Type', 'Description', 'Common use'], rows: [['Desktop', 'Stays in one place; screen, keyboard and system unit are usually separate', 'Offices, computer laboratories, homes, internet cafes'], ['Laptop', 'Portable; screen, keyboard, touchpad and battery built in', 'University study, office work and travel'], ['Tablet', 'Thin, portable touchscreen device, often without a physical keyboard', 'Reading, taking notes, watching video, drawing'], ['Smartphone', 'A handheld computer that can also make calls and use mobile networks', 'Messaging, browsing, mobile money, photos, learning apps'], ['Server', 'A powerful computer that provides services or resources to other devices', 'Hosting websites, email, databases and shared files']] } },
      { h: 'Computers you may not notice', p: [
        'Many everyday machines contain a small computer inside them, called an embedded computer. A modern washing machine, a microwave oven, a car, a digital television, a bank ATM and a card reader at a shop all contain one. You do not use a keyboard or a mouse with them, but they still receive input (the button you press), process it and produce output (a spinning drum or a printed receipt).',
        'This is why computer knowledge is useful everywhere: the same ideas explain how the machines in your home, your school and your city work.'] },
      { h: 'A short history of computing', p: [
        'You do not need to memorise dates, but a quick tour shows how quickly things have changed. The first electronic computers were as large as a room and could do far less than a modern phone. Computing power that once needed a building now fits in your hand.',
        'This pace of change is the reason that learning how to learn about technology matters more than memorising any single device.'],
        table: { head: ['Period', 'What happened', 'Why it matters'], rows: [['Long ago', 'People used counting tools such as tally marks and the abacus', 'Humans have always built tools to help with calculation'], ['1830s-1840s', 'Charles Babbage designed a mechanical Analytical Engine; Ada Lovelace wrote notes on how it could be given instructions', 'The idea of a programmable machine was born'], ['1940s', 'Large electronic computers such as ENIAC filled whole rooms; the transistor was invented in 1947', 'Electronic computers became possible; transistors later made them small'], ['1970s-1980s', 'The microprocessor and the personal computer arrived', 'Computers moved from laboratories into homes and offices'], ['1990s', 'The World Wide Web became public and the internet spread widely', 'Computers began to connect people everywhere'], ['2000s to today', 'Smartphones, cloud services and online learning became normal', 'A powerful computer now fits in your pocket']] },
        video: { id: 'O5nskjZ_GoI', title: 'Early Computing: Crash Course Computer Science #1', by: 'CrashCourse' } },
    ],
    {
      mistakes: [
        'Thinking only a laptop or desktop is a computer. Phones, tablets and servers are computers too.',
        'Forgetting hidden computers: an ATM, a microwave or a car also contains an embedded computer.',
        'Thinking a server is a special kind of magic. It is a computer that provides services to other devices.',
        'Memorising dates instead of understanding the trend: computers got smaller, cheaper and more connected.',
      ],
      exercises: [
        { q: 'List five types of computer and one use for each.', a: 'Desktop: offices and labs. Laptop: university study. Tablet: reading and notes. Smartphone: messaging and mobile money. Server: hosting websites or databases.' },
        { q: 'What is an embedded computer? Name two you have used this week.', a: 'It is a small computer built inside another machine. Examples: a washing machine, a microwave oven, a car, an ATM or a card reader.' },
        { q: 'Why did computers move from laboratories into homes and offices in the 1970s and 1980s?', a: 'Because the microprocessor and the personal computer arrived, making computers small and cheap enough for ordinary use.' },
      ],
      quiz: [
        { q: 'A washing machine with an electronic controller contains...', options: ['An embedded computer', 'A server', 'A web browser', 'No computer at all'], answer: 0, why: 'An embedded computer is a small computer built inside another machine.' },
        { q: 'A computer that provides websites, email or shared files to other devices is a...', options: ['Server', 'Tablet', 'Laptop', 'Mouse'], answer: 0, why: 'A server provides services or resources to other devices.' },
        { q: 'Who designed the mechanical Analytical Engine in the 1830s?', options: ['Charles Babbage', 'Ada Lovelace', 'Alan Turing', 'ENIAC'], answer: 0, why: 'Babbage designed it; Ada Lovelace wrote notes describing how it could be given instructions.' },
        { q: 'What made computers small after the 1940s?', options: ['The transistor and later the microprocessor', 'The abacus', 'The telegraph', 'The printing press'], answer: 0, why: 'Transistors (invented 1947) later made computers small, and the microprocessor brought the personal computer.' },
        { q: 'A portable computer with the screen, keyboard, touchpad and battery built in is a...', options: ['Laptop', 'Desktop', 'Server', 'Embedded computer'], answer: 0, why: 'That description matches a laptop.' },
      ],
    }),

  T('lit-audit', 'Digital literacy and your technology audit',
    'Ujuzi wa kidijiti ni uwezo wa kutumia teknolojia kwa kujiamini, salama na kwa busara; anza kwa kuorodhesha vifaa unavyotumia.',
    'Do the technology audit below and keep the page; you will use it again at the end of the course.',
    [
      { h: 'What is digital literacy?', p: [
        'Digital literacy is the ability to use digital technology confidently, safely and sensibly to find information, create work, communicate and solve problems. Just as reading and writing are basic skills for education, digital literacy is now a basic skill for study, work and citizenship.',
        'Digital literacy is not one skill; it is a collection of related abilities that are best learned in a deliberate order, from the ground up.'],
        table: { head: ['Skill area', 'What it means'], rows: [['Understanding devices', 'Knowing what the parts of a computer do and how software controls them'], ['Using the computer', 'Operating Windows, managing files and folders, and typing efficiently'], ['Finding and judging information', 'Searching effectively and deciding which sources can be trusted'], ['Staying safe', 'Protecting accounts, recognising scams and respecting privacy'], ['Creating and showing your skills', 'Producing organised work and a small portfolio']] } },
      { h: 'Case study: Baraka\'s first week', p: [
        'Baraka is excellent at mathematics, but on the first day of a computing course he could not find a file he had saved the day before. He had saved it on the Desktop, then on a USB drive, then in Downloads, and he could not remember which. He lost nearly an hour and almost missed a submission deadline.',
        'A classmate showed him one habit: always save into a named folder, and always check where you are saving. After a week of practice, Baraka could find any file in seconds. His intelligence had not changed; only his digital skills had. Small habits, learned early, save enormous time later.'],
        tip: 'Before you click Save, read the folder name. A few seconds of checking can save an hour of searching.' },
      { h: 'Practical lab: your personal technology audit', p: [
        'Goal: notice how much technology you already use, and where you want to improve. You have succeeded when you have a list of at least eight devices, a confidence score for each and three personal learning goals.'],
        steps: ['Take a sheet of paper or open a blank document. Make three columns: Device, What I use it for, How confident I feel (1-5).', 'Write down every device you used or touched in the last 24 hours. Include phone, laptop, television, radio, ATM, card reader and even a microwave or a remote control.', 'For each device, write what you used it for. Be specific, for example "watching lectures" rather than "internet".', 'Circle any device you scored 1 or 2 for confidence. These are your learning priorities.', 'Write three sentences beginning: "After this course, I want to be able to...". Keep this page; you will return to it at the end.'] },
    ],
    {
      mistakes: [
        'Thinking digital literacy is only about typing or using social media. It also covers finding information, staying safe and creating work.',
        'Skipping the foundations and jumping to advanced tools. The skills build in order from the ground up.',
        'Saving files without checking the folder, then losing time searching for them.',
      ],
      exercises: [
        { q: 'Explain why digital literacy is important for a university student.', a: 'Study, assignments, communication and research all happen with digital tools, so students must use them confidently, safely and sensibly to find information, create work and solve problems.' },
        { q: 'Name three of the five skill areas of digital literacy.', a: 'For example: understanding devices, using the computer, finding and judging information (the others are staying safe, and creating and showing your skills).' },
        { q: 'What one habit helped Baraka find his files quickly?', a: 'Always saving into a named folder and always checking where he is saving.' },
      ],
      quiz: [
        { q: 'Digital literacy is best described as...', options: ['Using digital technology confidently, safely and sensibly', 'Owning the newest phone', 'Typing very fast only', 'Knowing how to repair a computer'], answer: 0, why: 'It is the ability to use digital technology to find information, create work, communicate and solve problems.' },
        { q: 'Which skill area covers recognising scams and protecting accounts?', options: ['Staying safe', 'Using the computer', 'Understanding devices', 'Creating a portfolio'], answer: 0, why: 'Staying safe covers protecting accounts, recognising scams and respecting privacy.' },
        { q: 'Why did Baraka lose nearly an hour?', options: ['He did not know where he had saved his file', 'His computer was broken', 'He was weak in mathematics', 'The file was too large'], answer: 0, why: 'He saved in several places and could not remember which; the problem was a missing habit, not intelligence.' },
        { q: 'In the technology audit, which devices become your learning priorities?', options: ['Those you scored 1 or 2 for confidence', 'Those you scored 5', 'The newest devices', 'Only your phone'], answer: 0, why: 'Low confidence scores show where you most need to improve.' },
      ],
    }),
];
