import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Computer Basics, chapter 1: Understanding computers. Original text, built from the Week 1 mentorship outline plus extra material. */
export const CB_CH1: LearnLesson[] = [
  T('tech', 'What is technology? What is a computer?', 'Teknolojia ni kutumia maarifa na zana kutatua matatizo; kompyuta ni kifaa cha kielektroniki kinachopokea data, kuichakata kwa maagizo, kuihifadhi na kutoa matokeo.',
    'Name five pieces of technology in your home or on campus. For each, say whether it is also a computer.',
    [
      { h: 'Technology is everywhere', p: [
        'Technology means using knowledge, tools and methods to solve problems or make a job easier. It is much older than computers: a plough, a bicycle and a water pump are all technology.',
        'Look around you and you will find examples that are not computers at all: a pair of scissors, a clock, a lamp. When technology works with electronics and information, we call it digital technology. Digital technology creates, stores, processes or sends information in digital form. Smartphones, digital cameras, online classrooms and the machine that prints your exam timetable are all examples.'],
        table: { head: ['Technology', 'Is it digital?', 'Why'], rows: [['Pen and paper', 'No', 'Nothing electronic; it records information, but not digitally'], ['Calculator', 'Yes', 'It takes numbers in, calculates and shows a result'], ['Smartphone', 'Yes', 'A small computer with a phone, camera and many apps'], ['Traffic-light controller', 'Yes', 'A small computer decides when the lights change'], ['Washing machine', 'Often', 'Modern ones have a small computer inside to control the programmes']] } },
      { h: 'What is a computer?', p: [
        'A computer is an electronic device that does four things: it receives data, follows instructions to process that data, can store the data and the results, and produces output for the user.',
        'With those four abilities a computer can calculate, organise information, show documents, play sound and video, talk to other devices and run applications such as a browser or a word processor.',
        'Notice the words "follows instructions". A computer does not think the way a person does. It does exactly what its programs and its user tell it to do, nothing more. This leads to a very important rule that you will meet again and again: if the instructions or the input data are wrong, the result will be wrong too.'],
        fig: 'types' },
      { h: 'A calculator example', p: [
        'Imagine you type the marks 60, 70 and 80 into a calculator to find the average. The marks are the input. The calculator adds them (210) and divides by three. The result, 70, is the output.',
        'Now imagine you accidentally type 600 instead of 60. The calculator will still calculate perfectly, but the answer will be wrong, because the input was wrong. The computer is accurate; it is not able to know what you meant. A person must always check the data.'],
        tip: 'Remember "garbage in, garbage out": wrong input gives wrong output, however powerful the computer is.' },
      { h: 'A short history in one video', p: [
        'People built machines to help with counting for thousands of years: the abacus, mechanical calculators, and then electronic computers that filled whole rooms. Today the same ideas fit in your pocket. This short, friendly video tells the story of early computing.'],
        video: { id: 'O5nskjZ_GoI', title: 'Early Computing: Crash Course Computer Science #1', by: 'CrashCourse' } },
    ],
    {
      mistakes: [
        'Thinking that a computer "knows" things by itself. It only follows instructions and data that people supplied.',
        'Thinking that only a laptop or desktop is a computer. Phones, tablets and servers are computers too.',
        'Trusting a result because it came from a computer. Always check the input and ask if the answer makes sense.',
      ],
      exercises: [
        { q: 'In your own words, what is a computer?', a: 'A computer is an electronic device that receives data, processes it by following instructions, can store data and results, and produces output.' },
        { q: 'A calculator shows 8 when you add 3 + 4 by mistake. Is the calculator broken? Explain.', a: 'No. If you typed a wrong number (for example 4 + 4 or 3 + 5), the calculator calculated correctly from wrong input. This is garbage in, garbage out.' },
        { q: 'Give two examples of technology that are not digital and two that are.', a: 'Not digital: a pair of scissors, a bicycle. Digital: a smartphone, a digital camera.' },
      ],
      quiz: [
        { q: 'Which list names the four things a computer does?', options: ['Input, processing, storage, output', 'Typing, printing, clicking, scrolling', 'Hardware, software, network, power', 'Read, write, copy, delete'], answer: 0, why: 'A computer receives input, processes it, can store data and results, and produces output.' },
        { q: 'A computer gives a wrong answer because you typed a wrong number. What is this called?', options: ['Garbage in, garbage out', 'A virus', 'Overheating', 'Automation'], answer: 0, why: 'The computer processed the wrong input correctly; the problem was the data.' },
        { q: 'Which of these is a computer?', options: ['A smartphone', 'A pen', 'A paper map', 'A wooden desk'], answer: 0, why: 'A smartphone is a small computer. The others have no electronic processing.' },
        { q: 'What does "digital technology" mean?', options: ['Electronic tools that create, store, process or send information in digital form', 'Technology that uses only water', 'Anything made of metal', 'Only the internet'], answer: 0, why: 'Digital technology handles information in digital (electronic) form.' },
      ],
    }),

  T('data', 'Data and information', 'Data ni ukweli ghafi; taarifa (information) ni data iliyochakatwa na kuwa na maana kwa mtumiaji.',
    'Collect five numbers from your life (for example your last five test marks). Turn them into information: give the average and the highest.',
    [
      { h: 'Two words that are not the same', p: [
        'In everyday speech people use the words data and information as if they meant the same thing. In computing they are different, and the difference matters.',
        'Data are raw facts, measurements or observations: numbers, words, dates, pictures, sounds, symbols. On their own they may not tell you much. Information is data that has been processed, organised or interpreted so that it becomes useful.'],
        fig: 'datainfo' },
      { h: 'Examples', p: [
        'The table shows how raw data become information. In every row the computer (or you) did something to the raw facts: added, counted, compared or filtered them.'],
        table: { head: ['Raw data', 'Processed information', 'Why it is useful'], rows: [['Marks: 45, 60, 75, 80', 'Average mark: 65', 'Summarises four marks in one number'], ['Daily sales: 10, 12, 8, 20', 'Total sales: 50', 'Shows the total for the whole period'], ['Names and attendance marks', 'List of students absent today', 'Tells the lecturer who to follow up'], ['Temperatures: 28, 30, 31', 'Highest temperature: 31', 'Finds the maximum observation']] } },
      { h: 'Context gives meaning', p: [
        'A number such as 75 means nothing by itself. It could be a mark out of 100, a price in thousands of shillings, a percentage or a temperature. Always ask two questions about any value: what does it represent, and in which unit is it measured?',
        'This is why spreadsheets and databases have column names ("Mark", "Price (TZS)") and why a good report always states units. When you later study statistics and data science, almost every mistake starts with someone forgetting what the numbers mean.'],
        tip: 'Before you use any number, write down its meaning and its unit next to it.' },
      { h: 'Kinds of data', p: [
        'Data come in many forms. Computers store all of them as numbers inside, but we think about them by type: numbers (age, price), text (names, messages), dates and times, images (photos), sound (voice notes, music) and video. You will see in a later lesson how every one of these becomes a pattern of 0s and 1s.'] },
    ],
    {
      mistakes: [
        'Calling any list of numbers "information". It becomes information only when it is organised or interpreted to answer a question.',
        'Reading a number without its unit (is 75 a mark, a price or a temperature?).',
      ],
      exercises: [
        { q: 'Marks of 4 students are 50, 62, 71 and 85. Write the data, then one piece of information you can get from them.', a: 'Data: 50, 62, 71, 85. Information: the average is (50 + 62 + 71 + 85) / 4 = 67, or the highest mark is 85.' },
        { q: 'Why is the number 30 not enough to tell a story?', a: 'Without context we do not know what it is: 30 marks, 30 degrees, 30 shillings or 30 students. Meaning and unit are needed.' },
      ],
      quiz: [
        { q: 'Which is information, not just data?', options: ['Average mark: 65', '45, 60, 75, 80', 'A list of random numbers', 'The digits 0 and 1'], answer: 0, why: 'The average is the result of processing the marks and has meaning.' },
        { q: 'Data are…', options: ['Raw facts or measurements', 'Only pictures', 'Always correct', 'Only numbers on a screen'], answer: 0, why: 'Data are raw facts, measurements or observations.' },
        { q: 'Why should a number always have a unit?', options: ['So we know what it measures', 'To make it bigger', 'Computers need it to start', 'It is a rule of Windows'], answer: 0, why: 'A unit and context tell us what the value means.' },
      ],
    }),

  T('cycle', 'The information-processing cycle', 'Kompyuta hufanya hatua nne: Input (ingiza), Processing (chakata), Output (toa matokeo), Storage (hifadhi).',
    'Pick a task you did on a phone today (for example sending a message). Describe it as input, processing, output and storage.',
    [
      { h: 'Four stages', p: [
        'A very useful way to understand any computer is to follow data through four stages. Together they are called the information-processing cycle: input, processing, output and storage.',
        'Look at the picture and watch the yellow dot. Data enter from the left (input), the computer works on them in the middle (processing), results leave on the right (output), and anything worth keeping is saved (storage), so it can be loaded again later.'],
        fig: 'cycle' },
      { h: 'What each stage means', p: ['Use the table to see each stage in a computer and in a kitchen. The kitchen comparison is not silly: both are processes that take ingredients, follow a recipe and produce something.'],
        table: { head: ['Stage', 'Meaning', 'Computer example', 'Everyday comparison'], rows: [['Input', 'Data or instructions enter the system', 'Typing marks on a keyboard', 'Giving ingredients to a cook'], ['Processing', 'The system does operations on the input', 'Adding the marks and calculating an average', 'Mixing the ingredients following a recipe'], ['Output', 'The result is shown to the user', 'The average appears on the screen', 'The cooked meal is served'], ['Storage', 'Data or results are saved for later', 'Saving the marks in a file', 'Writing the recipe in a notebook']] } },
      { h: 'Worked example: a student’s average', p: [
        'A learner has three test marks: 65, 72 and 83. Here is exactly what happens in each stage.'],
        table: { head: ['Stage', 'What happens'], rows: [['Input', 'The marks 65, 72 and 83 are typed in'], ['Processing', 'The computer adds 65 + 72 + 83 = 220 and divides by 3'], ['Output', 'The screen shows 73.33 (to two decimals)'], ['Storage', 'The result is saved in a file or spreadsheet for future use']] } },
      { h: 'The same cycle on a phone', p: [
        'The cycle is not only for office work. When you send a voice note on WhatsApp, your voice is the input (microphone). The phone processes the sound, compresses it and sends it. The other person’s phone produces output (sound from the speaker). A copy is stored in the chat on both phones.',
        'Once you can see these four stages in any device, you can understand almost any computer task, from paying with mobile money to printing a result slip.'],
        tip: 'When you meet a new device or app, ask: what goes in? what happens to it? what comes out? what is saved?' },
    ],
    {
      mistakes: [
        'Forgetting storage. Without saving, the result disappears when the app closes or the power goes off.',
        'Thinking the screen does the processing. The screen only shows the output; the CPU and software process.',
      ],
      exercises: [
        { q: 'Describe taking a photo and sharing it, using the four stages.', a: 'Input: the camera captures the light. Processing: the phone turns it into a picture file and may improve it. Output: the photo appears on the screen. Storage: the photo is saved in the gallery; sharing sends a copy.' },
        { q: 'Which stage is "saving the file"?', a: 'Storage.' },
        { q: 'A teacher types five marks, the computer shows the total. Name input and output.', a: 'Input: the five typed marks. Output: the total displayed on the screen.' },
      ],
      quiz: [
        { q: 'In the cycle, what is the job of processing?', options: ['Do operations on the input', 'Show the result', 'Save the file', 'Switch the power on'], answer: 0, why: 'Processing is where the computer calculates, sorts or changes the data.' },
        { q: 'Typing marks on a keyboard is…', options: ['Input', 'Output', 'Storage', 'Printing'], answer: 0, why: 'Data entering the system is input.' },
        { q: 'Which stage keeps results for later?', options: ['Storage', 'Input', 'Output', 'Scrolling'], answer: 0, why: 'Storage saves data and results so they can be used again.' },
        { q: 'The average appears on the screen. This is…', options: ['Output', 'Input', 'Storage', 'Software'], answer: 0, why: 'Showing the result to the user is output.' },
      ],
    }),

  T('traits', 'What computers are good at, and kinds of computers', 'Kompyuta ina kasi, usahihi, hifadhi kubwa, uthabiti, automation na uwezo wa kufanya kazi nyingi; aina zake ni desktop, laptop, tablet, simu na server.',
    'List the computers you used this week (including your phone). Which type is each one?',
    [
      { h: 'Six characteristics', p: [
        'Why do we use computers instead of doing everything by hand? Because they are very good at certain things. Here are six main characteristics.'],
        table: { head: ['Characteristic', 'Meaning', 'Example'], rows: [['Speed', 'Does many operations very quickly', 'Adding thousands of numbers in a moment'], ['Accuracy', 'Calculates precisely when data and instructions are correct', 'A formula gives the same correct answer every time'], ['Storage capacity', 'Keeps large amounts of data', 'Thousands of documents, photos and videos'], ['Consistency', 'Repeats an operation exactly the same way', 'Applying one calculation to every student record'], ['Automation', 'Runs tasks by itself after being instructed', 'A scheduled backup at midnight'], ['Versatility', 'Can be used for many different jobs', 'Study, communication, research and design']] } },
      { h: 'An important limitation', p: [
        'A computer does not guarantee that information is true. It can process inaccurate data, follow poor instructions or display misleading results. A beautiful chart can still be based on wrong numbers.',
        'Human judgement remains important: you must check sources, think about whether an answer is reasonable, and understand what the computer was asked to do.'] },
      { h: 'Types of computers', p: [
        'Computers come in many shapes. The differences are mostly about size, portability and purpose, not about a different basic idea.'],
        fig: 'types' },
      { h: 'Comparing the types', p: ['Use this table to choose the right computer for a job.'],
        table: { head: ['Type', 'Description', 'Common use'], rows: [['Desktop', 'Stays in one place; separate screen, keyboard and system unit', 'Offices, computer labs and homes'], ['Laptop', 'Portable; screen, keyboard and battery in one body', 'University study and travel'], ['Tablet', 'Portable touchscreen device', 'Reading, note-taking, media'], ['Smartphone', 'Handheld computer with communication features', 'Messaging, browsing, mobile apps and payments'], ['Server', 'Powerful computer that provides services to other devices', 'Websites, databases, shared files']] },
        note: 'A server is usually not used directly by one person. When you open a website, a server somewhere answers your request.' },
    ],
    {
      mistakes: [
        'Believing that speed and accuracy mean a computer is always right. It is accurate only when data and instructions are correct.',
        'Calling every computer a "CPU". The CPU is only the processor inside the computer.',
      ],
      exercises: [
        { q: 'Give an example of automation on a computer or phone.', a: 'Examples: an automatic backup at night, an alarm that rings every day, automatic software updates, or an out-of-office reply.' },
        { q: 'Which type of computer would a university use to store student results for everyone?', a: 'A server, because it provides services and shared data to many other devices.' },
        { q: 'Why can a computer apply the same formula to 5,000 student records without getting tired?', a: 'Because of consistency and speed: it repeats the same operation in the same way, very quickly.' },
      ],
      quiz: [
        { q: 'Which characteristic means a computer repeats an operation in exactly the same way?', options: ['Consistency', 'Versatility', 'Portability', 'Colour'], answer: 0, why: 'Consistency is repeating the same operation in the same way.' },
        { q: 'A computer that provides websites or shared files to other devices is a…', options: ['Server', 'Tablet', 'Scanner', 'Mouse'], answer: 0, why: 'A server provides services or resources to other devices.' },
        { q: 'A scheduled backup is an example of…', options: ['Automation', 'Input', 'A virus', 'Output only'], answer: 0, why: 'Automation means the task runs by itself after being set up.' },
        { q: 'Can a computer guarantee that its information is true?', options: ['No, it can process wrong data', 'Yes, always', 'Yes, if it is a laptop', 'Only if it is new'], answer: 0, why: 'The result is only as good as the data and instructions.' },
      ],
    }),

  T('devices', 'Hardware: input and output devices', 'Hardware ni sehemu halisi unazoweza kuzigusa. Input devices huingiza data; output devices hutoa matokeo.',
    'Look at your laptop or phone and list every input and output device you can find on it.',
    [
      { h: 'What is hardware?', p: [
        'Hardware is every physical part of a computer. If you can touch it, it is hardware: the screen, keyboard, touchpad, mouse, charger, memory chips and the storage drive.',
        'Hardware has two big groups that you can see from outside: input devices and output devices. A third group, processing and storage, sits inside the case and is the topic of the next lesson.'],
        fig: 'setup' },
      { h: 'Input devices', p: [
        'An input device lets a person send data or instructions to the computer. The mouse points, the keyboard types, the microphone listens and the camera sees.'],
        table: { head: ['Device', 'Function', 'Example'], rows: [['Keyboard', 'Enters letters, numbers and commands', 'Typing a report'], ['Mouse', 'Moves the pointer and selects items', 'Clicking a folder'], ['Touchpad', 'Mouse-like control on a laptop', 'Selecting an icon'], ['Microphone', 'Captures sound', 'Recording a voice note'], ['Webcam', 'Captures pictures or video', 'Joining an online class'], ['Scanner', 'Turns paper into a digital file', 'Scanning a certificate']] } },
      { h: 'Output devices', p: [
        'An output device presents information from the computer to the user, as pictures, sound or paper.'],
        table: { head: ['Device', 'Function', 'Example'], rows: [['Monitor', 'Shows text, pictures and video', 'Reading a document'], ['Printer', 'Makes a paper copy', 'Printing an assignment'], ['Speakers', 'Play sound', 'Listening to a lecture'], ['Headphones', 'Deliver sound privately', 'Attending an online lesson'], ['Projector', 'Shows the screen on a large surface', 'Presenting slides in a class']] } },
      { h: 'The picture of input and output', p: [
        'A useful habit is to ask the direction of the data. If data travel from you into the computer, it is an input device. If they travel from the computer to you, it is an output device.'],
        fig: 'devices',
        note: 'Some devices do both. A touchscreen is an input device (you tap) and an output device (it shows the picture). A headset has a microphone (input) and headphones (output).' },
      { h: 'Practical: find the parts on a laptop', p: [
        'On a laptop everything is in one body. Do the activity below carefully. Do not force any connector and do not open any cover.'],
        steps: ['Find the screen and the webcam above it.', 'Find the keyboard and the touchpad.', 'Find the power button and the charger port.', 'Find the USB ports and the audio port (if present).', 'Look for tiny holes near the top or the front: these are the microphone openings.', 'Find the speakers (often under the keyboard or on the sides) and the ventilation openings that let hot air out.', 'Write each part in a table with two columns: the part, and whether it is input, output or neither.'] },
    ],
    {
      mistakes: [
        'Confusing a scanner (input: paper to computer) with a printer (output: computer to paper).',
        'Covering the ventilation openings while the laptop is working. It can overheat.',
        'Pulling cables or forcing a connector. Plugs fit only one way.',
      ],
      exercises: [
        { q: 'Classify these as input, output or both: microphone, projector, touchscreen, scanner, speakers.', a: 'Microphone: input. Projector: output. Touchscreen: both. Scanner: input. Speakers: output.' },
        { q: 'Which device would you use to turn a paper certificate into a PDF?', a: 'A scanner (or the phone camera with a scanning app).' },
        { q: 'Why does a laptop have ventilation openings?', a: 'To let hot air out so the processor and other parts do not overheat.' },
      ],
      quiz: [
        { q: 'Which of these is an output device?', options: ['Printer', 'Keyboard', 'Microphone', 'Scanner'], answer: 0, why: 'A printer sends information out of the computer onto paper.' },
        { q: 'A webcam is…', options: ['An input device', 'An output device', 'A storage drive', 'Software'], answer: 0, why: 'It captures pictures and video and sends them into the computer.' },
        { q: 'Which device is both input and output?', options: ['Touchscreen', 'Speaker', 'Mouse', 'Projector'], answer: 0, why: 'A touchscreen accepts taps and shows the picture.' },
        { q: 'Hardware is…', options: ['The physical parts you can touch', 'Only programs', 'Only the internet', 'Only the battery'], answer: 0, why: 'Hardware means the physical components.' },
      ],
    }),

  T('inside', 'Inside the computer: CPU, RAM, storage', 'CPU hufanya kazi, RAM ni meza ya kazi ya muda, storage ni kabati la kuhifadhi; usichanganye RAM na storage.',
    'Look at the specifications of your laptop or phone. Write down its RAM and its storage size, and explain the difference in one sentence.',
    [
      { h: 'The three most important internal parts', p: [
        'Inside the case of a computer there are three parts you must understand: the CPU, the RAM and the storage. Most computer questions (why is my laptop slow? why did I lose my work? why is my phone full?) are answered by knowing how these three work together.'],
        fig: 'inside' },
      { h: 'CPU: the worker', p: [
        'The CPU (Central Processing Unit), also called the processor, executes the instructions of programs and does the calculations. Every click, every letter you type and every video frame passes through it.',
        'The CPU works in a repeating cycle: fetch an instruction from memory, decode it (work out what it means), and execute it. A modern CPU repeats this billions of times every second. Speed is measured in gigahertz (GHz); many CPUs also have several cores, which means several workers inside one processor.'],
        fig: 'fde' },
      { h: 'RAM: the desk', p: [
        'RAM (Random Access Memory) is the temporary working memory. When you open a program or a document, the computer copies it from storage into RAM, because RAM is much faster. While you work, everything you are using sits in RAM.',
        'RAM is volatile: when power goes off, its contents disappear. That is why work that has not been saved is lost if the laptop suddenly shuts down. More RAM lets you keep more programs and browser tabs open at the same time.'],
        video: { id: 'fpnE6UAfbtU', title: 'Registers and RAM: Crash Course Computer Science #6', by: 'CrashCourse' } },
      { h: 'Storage: the cupboard', p: [
        'Storage keeps your files and installed programs even when the computer is switched off. There are two main kinds. A hard disk drive (HDD) stores data on spinning magnetic disks: it is cheaper per gigabyte but slower. A solid-state drive (SSD) stores data electronically with no moving parts: it is faster, quieter and more shock-resistant.',
        'Flash drives, memory cards and phone storage are also storage: they use the same flash technology as an SSD.'],
        fig: 'deskcup' },
      { h: 'Do not confuse RAM with storage', p: [
        'A laptop may be described as "8 GB RAM, 256 GB storage". These are two different numbers for two different things. RAM (8 GB) is the working memory. Storage (256 GB) is where your files and programs live.',
        'If your phone says "storage full", deleting files or apps will help. Adding storage does not make a slow computer faster, but adding RAM can help when too many things are open.'],
        table: { head: ['Part', 'Purpose', 'Simple comparison', 'Survives power off?'], rows: [['CPU', 'Executes instructions and calculates', 'The worker', 'Not applicable'], ['RAM', 'Temporary working space for what is running now', 'The desk you are working on', 'No'], ['Storage (SSD/HDD)', 'Keeps files and programs for later', 'The cupboard where books are kept', 'Yes']] } },
      { h: 'More parts', p: [
        'The motherboard is the main circuit board: every part plugs into it or talks through it. The GPU (Graphics Processing Unit) draws pictures and video and is also used for games and some kinds of heavy calculation, including artificial intelligence. The power supply or battery gives everything electricity.',
        'Why do computers use a pyramid of memories? Because fast memory is expensive and small, and big memory is cheap and slow. So computers keep the most-used data in the fastest places.'],
        fig: 'hier' },
      { h: 'The processor in one video', p: ['If you like to see how a CPU really works, this is the best short explanation. It is optional but very good.'],
        video: { id: 'FZGugFqdr60', title: 'The Central Processing Unit (CPU): Crash Course Computer Science #7', by: 'CrashCourse' } },
    ],
    {
      mistakes: [
        'Thinking that 256 GB of storage means 256 GB of RAM. They are different things.',
        'Expecting unsaved work to survive a power cut. It lives in RAM.',
        'Believing that more storage makes the computer faster.',
        'Opening dozens of programs and browser tabs on a computer with little RAM, then blaming the CPU.',
      ],
      exercises: [
        { q: 'A laptop has 8 GB RAM and 512 GB SSD. What does each number tell you?', a: '8 GB is the working memory for programs that are running now; 512 GB is the space for keeping files and installed programs.' },
        { q: 'Why do you lose an unsaved document when the power fails?', a: 'It is in RAM, which is volatile. Only saving writes it to storage, which keeps data without power.' },
        { q: 'Which is faster for everyday tasks, an HDD or an SSD, and why?', a: 'An SSD, because it stores data electronically without moving parts, while an HDD has to spin and move a read head.' },
      ],
      quiz: [
        { q: 'Which part is the "desk" where active tasks happen?', options: ['RAM', 'SSD', 'Printer', 'Monitor'], answer: 0, why: 'RAM is temporary working space for running programs.' },
        { q: 'What happens to the contents of RAM when the power is switched off?', options: ['They are lost', 'They are saved forever', 'They move to the screen', 'They double'], answer: 0, why: 'RAM is volatile; it forgets everything without power.' },
        { q: 'Which part executes program instructions?', options: ['CPU', 'Speaker', 'Charger', 'Scanner'], answer: 0, why: 'The CPU executes instructions and performs calculations.' },
        { q: 'Where are files kept when the computer is off?', options: ['Storage drive', 'RAM', 'CPU', 'Webcam'], answer: 0, why: 'Storage keeps data without power.' },
        { q: 'What does the CPU repeat billions of times each second?', options: ['Fetch, decode, execute', 'Print, scan, copy', 'Save, close, delete', 'Type, click, scroll'], answer: 0, why: 'This is the instruction cycle.' },
      ],
    }),

  T('software', 'Software and the operating system', 'Software ni maagizo yanayoiambia hardware ifanye nini. Operating system (Windows, Android) ndiyo software kuu inayosimamia kompyuta.',
    'List five apps on your phone and say whether each one is application software or system software.',
    [
      { h: 'What is software?', p: [
        'Software is a set of programs and instructions that tell the computer what to do. You cannot touch it. A computer needs both: hardware gives the physical equipment, software gives the instructions and tools.',
        'A good comparison is a music player and a song. The player (hardware) can do nothing useful without the music (software).'] },
      { h: 'Three categories', p: [
        'Software is usually grouped into three kinds, according to its job.'],
        table: { head: ['Category', 'Meaning', 'Examples'], rows: [['System software', 'Manages the computer and gives other software a platform to run on', 'Windows, Android, Linux, device drivers'], ['Application software', 'Helps the user do a task', 'Word processor, browser, media player, calculator'], ['Utility software', 'Maintains, protects or manages the computer', 'Backup tools, antivirus, disk clean-up']] } },
      { h: 'The operating system', p: [
        'An operating system (OS) is the main system software. It manages the hardware and provides services to applications. Among other things it manages files, memory, connected devices, user accounts and running programs.',
        'Examples are Microsoft Windows, macOS, Linux, Android and iOS. A phone and a laptop are both computers: the phone runs Android or iOS and the laptop runs Windows, macOS or Linux. In this course the practical lessons use Windows.',
        'The picture shows why the OS is so important: you use applications; applications ask the OS for help; and the OS controls the hardware. Without an OS every program would have to know how to control every kind of keyboard, screen and printer by itself.'],
        fig: 'layers' },
      { h: 'Hardware and software together', p: [
        'Follow one ordinary action: typing an assignment and saving it.'],
        fig: 'typing' },
      { h: 'More examples of teamwork', p: ['Every task needs both. Match the hardware and software in the table.'],
        table: { head: ['Situation', 'Hardware involved', 'Software involved'], rows: [['Typing an assignment', 'Keyboard, screen, storage drive', 'Operating system and a word processor'], ['Listening to a lesson', 'Speakers or headphones', 'Media player or browser'], ['Joining a video call', 'Webcam, microphone, screen', 'Video-call app and operating system'], ['Printing a report', 'Printer and computer', 'Document application and printer driver']] },
        note: 'A driver is a small program that lets the operating system talk to a particular device, like a printer.' },
      { h: 'Free and paid software, and updates', p: [
        'Some software is free, some is paid for, and some is open source, which means anyone can read and improve its code (Linux and LibreOffice are examples). Do not assume every laptop has a paid copy of Microsoft Office. Free alternatives such as LibreOffice Writer or Google Docs are fine for study.',
        'Software needs updates. Updates add features and fix security problems. Keep Windows and your apps updated, and only download software from trusted sources.'] },
    ],
    {
      mistakes: [
        'Believing that "Windows" and "Word" are the same kind of software. Windows is the operating system; Word is an application that runs on it.',
        'Installing pirated or unknown software. It can contain viruses.',
        'Never updating the computer, which leaves known security holes open.',
      ],
      exercises: [
        { q: 'Is a web browser system, application or utility software?', a: 'Application software, because it helps the user do a task (view websites).' },
        { q: 'Which is hardware and which is software: SSD, Windows, keyboard, Chrome?', a: 'Hardware: SSD, keyboard. Software: Windows and Chrome.' },
        { q: 'What does the operating system do when you save a file?', a: 'It receives the request from the application, finds space on the storage drive, writes the data and records the file name and place.' },
      ],
      quiz: [
        { q: 'Which is an operating system?', options: ['Android', 'Word processor', 'Antivirus', 'Printer'], answer: 0, why: 'Android is an operating system for phones and tablets.' },
        { q: 'Software is…', options: ['Instructions that tell the computer what to do', 'The physical screen', 'The charger', 'The keyboard'], answer: 0, why: 'Software is programs and instructions, which cannot be touched.' },
        { q: 'An antivirus is…', options: ['Utility software', 'Hardware', 'An input device', 'A storage drive'], answer: 0, why: 'Utility software protects, maintains or manages the computer.' },
        { q: 'What is a driver?', options: ['A program that lets the OS talk to a device', 'A person who delivers computers', 'A cable', 'A kind of RAM'], answer: 0, why: 'Drivers connect the operating system to specific hardware.' },
      ],
    }),

  T('binary', 'How computers store everything as 0s and 1s', 'Kompyuta huhifadhi kila kitu kama 0 na 1 (bits). Biti 8 ni byte moja; KB, MB, GB na TB ni vipimo vya kuhifadhi.',
    'A photo is 3 MB. About how many photos fit in 3 GB? (Use 1 GB = 1,000 MB.)',
    [
      { h: 'Why only two digits?', p: [
        'Inside a computer, parts are tiny electronic switches that are either off or on. Off is written 0 and on is written 1. A single 0 or 1 is called a bit (binary digit). Using only two states makes the machine reliable and cheap to build: it is easy to tell "off" from "on" even when there is a little electrical noise.',
        'Everything the computer holds (numbers, letters, pictures, songs, programs) is turned into long patterns of bits.'] },
      { h: 'Counting in binary', p: [
        'In everyday counting (decimal) each place is ten times bigger than the one on its right: ones, tens, hundreds. In binary each place is two times bigger: 1, 2, 4, 8, 16, 32, 64, 128. A group of 8 bits is called a byte.',
        'To read a binary number, add up the values of the places that contain a 1. In the picture, the bits 00001101 have 1s in the places worth 8, 4 and 1, so the value is 8 + 4 + 1 = 13.'],
        fig: 'bits' },
      { h: 'Try it by hand', p: ['Convert the number 22 to binary using the places 128, 64, 32, 16, 8, 4, 2, 1.'],
        steps: ['Start with 22. The biggest place that fits is 16. Write 1 under 16 and subtract: 22 − 16 = 6.', 'Does 8 fit into 6? No, so write 0 under 8.', 'Does 4 fit into 6? Yes. Write 1 under 4. 6 − 4 = 2.', 'Does 2 fit into 2? Yes. Write 1 under 2. 2 − 2 = 0.', 'Write 0 under 1, and 0 under all places bigger than 16.', 'Read the row: 00010110. Check: 16 + 4 + 2 = 22.'],
        tip: 'You can see the binary form of a number in Python with bin(22). You will meet Python in the programming course.' },
      { h: 'Letters, pictures and sound', p: [
        'Letters are stored by giving each character a number. In the ASCII and Unicode tables, capital A is 65, B is 66, and a is 97. The computer stores the number 65 in binary, 01000001, and the screen shows the letter A. Unicode extends this idea to thousands of characters from all languages, including Swahili letters, Arabic, Chinese and emoji.',
        'A picture is a grid of tiny coloured squares called pixels. Each pixel’s colour is a number (for example, how much red, green and blue). A sound is measured thousands of times a second and each measurement is a number. A video is a quick series of pictures plus sound. So everything is numbers, and numbers are bits.'] },
      { h: 'Units of storage', p: [
        'Bits are too small to talk about files, so we use bigger units. A byte is 8 bits and stores one letter. Then each unit is about a thousand times bigger than the last.'],
        fig: 'units' },
      { h: 'Reading storage sizes', p: ['This table shows rough sizes. Real files vary.'],
        table: { head: ['Unit', 'Size', 'Roughly holds'], rows: [['Byte (B)', '8 bits', 'One letter or digit'], ['Kilobyte (KB)', '1,000 bytes (1,024 in computing)', 'A short text note'], ['Megabyte (MB)', '1,000 KB', 'A photo or a song (a few MB)'], ['Gigabyte (GB)', '1,000 MB', 'A film, a large app, or your mobile data bundle'], ['Terabyte (TB)', '1,000 GB', 'A very large collection: thousands of photos and films']] },
        note: 'Computers count in 1,024 because it is a power of two (2 to the power 10); drive makers and phone bundles often use 1,000. This is why a "256 GB" drive shows slightly less space in Windows.' },
    ],
    {
      mistakes: [
        'Confusing bits and bytes. A byte is 8 bits. Internet speed is usually measured in bits per second; file sizes in bytes.',
        'Writing binary numbers in the wrong order. The biggest place is on the left.',
        'Expecting a "256 GB" drive to show exactly 256 GB of free space.',
      ],
      exercises: [
        { q: 'What is the decimal value of 00001010?', a: '8 + 2 = 10.' },
        { q: 'Write 9 in binary using 8 bits.', a: '00001001 (8 + 1).' },
        { q: 'A song is 4 MB. How many songs fit in 2 GB (1 GB = 1,000 MB)?', a: '2,000 MB / 4 MB = 500 songs.' },
        { q: 'Why does a laptop show less than the advertised storage?', a: 'Because makers count 1 GB as 1,000 MB while the computer counts in powers of two, and the operating system and system files also take some space.' },
      ],
      quiz: [
        { q: 'How many bits are in a byte?', options: ['8', '2', '10', '1,000'], answer: 0, why: 'A byte is a group of 8 bits.' },
        { q: 'What is the binary number 00000101 in decimal?', options: ['5', '101', '3', '50'], answer: 0, why: '4 + 1 = 5.' },
        { q: 'Which unit is the biggest?', options: ['Gigabyte', 'Kilobyte', 'Megabyte', 'Byte'], answer: 0, why: 'Order from small to big: byte, KB, MB, GB, TB.' },
        { q: 'How does a computer store a photo?', options: ['As a grid of pixels, each stored as numbers in bits', 'As real paper', 'As a drawing in RAM only', 'It cannot store photos'], answer: 0, why: 'All data, including pictures, become numbers and then bits.' },
        { q: 'Why do computers use binary?', options: ['Electronic parts are easiest to build with two states: off and on', 'Because decimal is illegal', 'Because it is shorter', 'It was a mistake'], answer: 0, why: 'Two clear states are reliable and cheap to build.' },
      ],
    }),

  T('boot', 'What happens when you press the power button', 'Ukiwasha kompyuta: umeme, jaribio la vifaa, kutafuta OS, kupakia Windows kwenye RAM, kisha kuingia (sign in).',
    'Press the power button on a laptop and write down everything you see until you can use the desktop. Match it with the five steps.',
    [
      { h: 'From a dead machine to a desktop', p: [
        'A switched-off computer has nothing in RAM and no running software. Yet a few seconds after you press the power button you are working. What happens in between is called booting (from "pulling yourself up by your bootstraps").',
        'Knowing the steps helps you understand error messages, slow starts and why a computer can fail to start.'],
        fig: 'boot' },
      { h: 'The five steps in detail', p: ['Read each step slowly. Everything happens automatically in a few seconds.'],
        steps: ['Power on. Electricity from the battery or the charger reaches the motherboard and the CPU starts.', 'Self-test. A small program stored on the motherboard (the firmware, called BIOS or UEFI) checks that the CPU, RAM, keyboard and drives are present and working. If something is badly wrong you hear beeps or see an error.', 'Find the operating system. The firmware looks for a boot loader on the storage drive. This tiny program knows where the operating system is stored.', 'Load the operating system. The boot loader copies the key system files from the storage drive into RAM (the desk), and Windows starts running. You may see the Windows logo and a spinning circle.', 'Sign in. Windows shows the sign-in screen. After you enter your authorised account details you see the desktop and can open programs.'] },
      { h: 'Why booting takes time, and why SSDs are quicker', p: [
        'Loading the operating system means copying a lot of data from storage into RAM. An SSD does that much faster than an HDD, which is why replacing an old hard disk with an SSD makes a computer start in seconds. Many laptops also have fast start, sleep and hibernate modes, which save the state so the computer can resume quickly.'],
        table: { head: ['Mode', 'What it does', 'Use it when'], rows: [['Shut down', 'Closes everything and turns off', 'You will not use the computer for a long time'], ['Sleep', 'Keeps your work in RAM with very low power', 'You will be back in a short time'], ['Hibernate', 'Saves your work to storage and turns off', 'You want to continue later but save battery'], ['Restart', 'Shuts down and boots again', 'After updates or when something is stuck']] } },
      { h: 'Safe start and shutdown', p: [
        'To start, make sure the laptop has power, open the lid if necessary, press the power button and wait for Windows to load. Sign in only with the account you are authorised to use. Never try to bypass someone else’s password.',
        'To shut down properly, save your work, close the applications, open the Start menu, choose Power and then Shut down. Avoid switching off by holding the power button unless the computer is frozen and normal options do not work. A sudden power-off can lose unsaved work and, rarely, damage files.'] },
    ],
    {
      mistakes: [
        'Holding the power button to switch off a computer that is working normally.',
        'Closing the lid and unplugging while the laptop is still saving or updating.',
        'Trying to log in to someone else’s account without permission.',
      ],
      exercises: [
        { q: 'Put these in order: sign in, power on, load Windows into RAM, self-test, find the operating system.', a: 'Power on, self-test, find the operating system, load Windows into RAM, sign in.' },
        { q: 'Why does an SSD make a computer start faster than an HDD?', a: 'The operating system files must be copied from storage to RAM, and an SSD reads data much faster than an HDD.' },
        { q: 'What is the difference between sleep and shut down?', a: 'Sleep keeps your work in RAM using a little power so you can continue quickly. Shut down closes everything and turns the computer off completely.' },
      ],
      quiz: [
        { q: 'Where is the operating system kept when the computer is off?', options: ['On the storage drive', 'In RAM', 'In the monitor', 'In the keyboard'], answer: 0, why: 'It is stored on the drive and copied to RAM when you boot.' },
        { q: 'What does the self-test check?', options: ['That essential hardware is present and working', 'Your homework', 'The internet speed only', 'The date of the next exam'], answer: 0, why: 'The firmware checks the CPU, RAM and drives.' },
        { q: 'Which is the safest way to turn the laptop off?', options: ['Save, close apps, then Start > Power > Shut down', 'Hold the power button every time', 'Close the lid and wait', 'Unplug the charger'], answer: 0, why: 'Saving and shutting down properly protects your work and files.' },
        { q: 'Which mode saves your work to storage and turns off?', options: ['Hibernate', 'Sleep', 'Restart', 'Lock'], answer: 0, why: 'Hibernate writes the session to storage and powers off.' },
      ],
    }),
];
