import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Computer Basics, chapter 3: Hardware. Simplified from "Digital Foundations" by Binsaid. */
export const CB_CH3: LearnLesson[] = [
  T('hw-input-output', 'What is hardware? Input and output devices',
    'Hardware ni sehemu za kompyuta unazoweza kuzigusa, na zinagawanywa katika vifaa vya kuingiza, kutoa, kuchakata na kuhifadhi.',
    'Look at your laptop or phone and name one input device and one output device on it. Is the touchscreen or touchpad input, output, or both?',
    [
      { h: 'Hardware: if you can touch it', p: [
        'Hardware means the physical components of a computer. The screen, keyboard, touchpad, mouse, charger, memory chips and storage drive are all hardware.',
        'Hardware is useless on its own because it needs instructions to tell it what to do. Those instructions are called software, which you study in Chapter 4.'] },
      { h: 'Four groups of hardware', p: [
        'It helps to sort hardware into four groups that match the information-processing cycle from Chapter 2: input, output, processing and storage.'],
        table: { head: ['Group', 'Job', 'Examples'], rows: [
          ['Input devices', 'Send data or instructions to the computer', 'Keyboard, mouse, touchpad, microphone, webcam, scanner'],
          ['Output devices', 'Present information from the computer to the user', 'Monitor, printer, speakers, headphones, projector'],
          ['Processing components', 'Carry out instructions and calculations', 'CPU, GPU, RAM, motherboard'],
          ['Storage devices', 'Keep files and programs even when the power is off', 'SSD, hard disk, flash drive, memory card']] } },
      { h: 'Input devices', p: [
        'Input devices let a person send data or instructions to the computer. Without them the computer would have no way of knowing what you want.',
        'Some devices have more than one role. A touchscreen is both an input device (you tap it) and an output device (it shows the picture).'],
        table: { head: ['Device', 'Function', 'Example of use'], rows: [
          ['Keyboard', 'Enters letters, numbers and commands', 'Typing a report'],
          ['Mouse', 'Moves the pointer and selects items', 'Clicking a folder'],
          ['Touchpad', 'Gives mouse-like control on a laptop', 'Selecting an icon with your finger'],
          ['Touchscreen', 'Lets you touch the screen directly', 'Tapping an app on a phone'],
          ['Microphone', 'Captures sound', 'Joining a call'],
          ['Webcam', 'Captures images or video', 'Joining an online class'],
          ['Scanner', 'Converts paper documents into digital form', 'Scanning a certificate'],
          ['Fingerprint reader', 'Reads a fingerprint to confirm who you are', 'Signing in to a laptop']] } },
      { h: 'What happens when you press a key?', p: [
        'Even a single key press follows the input, processing, output idea. All of it happens in a tiny fraction of a second.'],
        steps: ['You press the letter A. The key closes a tiny electrical contact beneath it.', 'The keyboard sends a code for that key to the computer.', 'The operating system receives the code and passes it to the program you are using, for example a word processor.', 'The program decides what to do. In a document it adds the letter to the page.', 'The screen shows the letter A.'] },
      { h: 'Output devices', p: [
        'Output devices present information from the computer to the user. You see output on screens, hear it from speakers and hold it on printed pages.'],
        fig: 'devices',
        table: { head: ['Device', 'Function', 'Example of use'], rows: [
          ['Monitor / screen', 'Displays text, pictures and video', 'Viewing a document'],
          ['Printer', 'Produces a paper copy', 'Printing an assignment'],
          ['Speakers', 'Produce sound for a room', 'Listening to a recorded lecture'],
          ['Headphones', 'Deliver sound privately to the listener', 'Attending an online lesson quietly'],
          ['Projector', 'Shows the computer image on a large surface', 'Presenting slides to a class']] } },
    ],
    {
      mistakes: [
        'Thinking software can be hardware too. If you cannot touch it, it is software.',
        'Forgetting that a touchscreen is both an input and an output device.',
        'Putting RAM in the storage group. RAM is a processing component; storage keeps files when the power is off.',
      ],
      exercises: [
        { q: 'Name three input devices and say what each does.', a: 'Keyboard enters letters and commands, mouse moves the pointer and selects items, microphone captures sound.' },
        { q: 'Name three output devices and say what each does.', a: 'Monitor displays text and video, printer produces paper copies, speakers produce sound.' },
        { q: 'Why is a touchscreen both input and output?', a: 'You send data to the computer by touching it (input) and it also shows the results on the same surface (output).' },
        { q: 'Trace what happens, in order, when you press the key A in a word processor.', a: 'The key sends a code to the computer, the operating system passes it to the word processor, the program adds the letter, and the screen shows it.' },
      ],
      quiz: [
        { q: 'Which is an input device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], answer: 2, why: 'The keyboard sends data and commands into the computer.' },
        { q: 'Which statement about hardware is true?', options: ['It is the set of instructions for a computer', 'It is the physical parts you can touch', 'It only means the screen', 'It cannot work with software'], answer: 1, why: 'Hardware is physical; software provides the instructions that make it work.' },
        { q: 'A scanner is used to...', options: ['Print a document', 'Turn paper documents into digital form', 'Play sound', 'Cool the laptop'], answer: 1, why: 'A scanner is an input device that converts paper into digital form.' },
        { q: 'Which device is both input and output?', options: ['Touchscreen', 'Projector', 'Mouse', 'Headphones'], answer: 0, why: 'You tap it to send input and it also displays output.' },
        { q: 'Which device delivers sound privately to one listener?', options: ['Speakers', 'Headphones', 'Projector', 'Scanner'], answer: 1, why: 'Headphones are output devices that deliver sound privately.' },
      ],
    }),

  T('hw-inside', 'Inside the computer: CPU, motherboard, GPU, RAM',
    'CPU hufanya kazi, ubao mama huunganisha sehemu zote, GPU hushughulikia picha, na RAM ni dawati la muda la kufanyia kazi.',
    'Open Task Manager (Ctrl + Shift + Esc), click Performance, and look at the CPU and Memory graphs while you open a few apps.',
    [
      { h: 'The parts that do the real work', p: [
        'Under the keyboard and behind the screen are the parts that do the real work. You cannot see them unless you open the case, which you should not do, but you should know what each one does.'],
        fig: 'hw-inside' },
      { h: 'CPU, motherboard and GPU', p: [
        'The CPU (Central Processing Unit), often called the processor, executes program instructions and performs calculations. It is the worker of the computer. Its speed is measured in gigahertz (GHz), and modern processors have several cores, which are like several workers handling different tasks at the same time. More cores and a higher speed generally finish demanding tasks faster, though many other factors matter too.',
        'The motherboard is the main circuit board. Every other component connects to it, directly or through cables, so they can communicate. If the CPU is the worker, the motherboard is the road network that links all the departments.',
        'The GPU (Graphics Processing Unit) processes graphics such as the images on your screen, video playback and games. It can also speed up certain other heavy calculations. Many laptops have a basic GPU built into the main processor, while powerful machines for design or gaming have a separate graphics card.'] },
      { h: 'RAM: the working desk', p: [
        'RAM (Random Access Memory) is the temporary working memory that programs use while they run. When you open a document, the computer loads it from storage into RAM so the processor can reach it very quickly. RAM is fast, but its contents are normally lost when the power is switched off.'] },
      { h: 'Storage: the cupboard', p: [
        'Storage keeps files and installed programs even when the computer is switched off. Think of it as a cupboard where books are kept. You take a book out of the cupboard (load it into RAM), put it on your desk, work with it, and return it to the cupboard when you are done (save it).'],
        fig: 'hw-ramdesk',
        table: { head: ['Component', 'Purpose', 'Simple comparison'], rows: [
          ['RAM', 'Temporary working space for active tasks', 'The desk you are working on right now'],
          ['Storage drive', 'Keeps files and programs for future use', 'A cupboard where books are stored'],
          ['CPU', 'Executes instructions and performs operations', 'The worker carrying out the steps']] },
        tip: 'Save often. Until you save, your work is held only in RAM and is lost if the laptop switches off.' },
      { h: 'Do not confuse RAM with storage', p: [
        'Warning: a laptop may have 8 GB of RAM and 256 GB of storage. These numbers describe different things. RAM is working memory; storage is where your files and installed programs live. If you save a document, it is the storage that keeps it, not the RAM.'] },
    ],
    {
      mistakes: [
        'Mixing up RAM and storage. 8 GB of RAM is working memory, not space for your files.',
        'Thinking unsaved work is safe in RAM. It disappears if the power goes off.',
        'Believing only the clock speed matters. Cores and many other factors matter too.',
        'Opening the laptop case to look inside. You do not need to, and you may damage it.',
      ],
      exercises: [
        { q: 'What does the CPU do and why does the number of cores matter?', a: 'The CPU executes instructions and performs calculations. More cores are like more workers, so it can handle more tasks at the same time.' },
        { q: 'Explain the difference between RAM and storage using the desk and cupboard comparison.', a: 'RAM is the desk where you work on things right now and it is cleared when power goes off. Storage is the cupboard that keeps files for the long term.' },
        { q: 'What is the motherboard?', a: 'The main circuit board that every other component connects to so that they can communicate.' },
        { q: 'A laptop has 8 GB RAM and 256 GB storage. Which one holds your saved photos?', a: 'The 256 GB storage drive. RAM holds only the programs and files in active use.' },
      ],
      quiz: [
        { q: 'Which statement about RAM is correct?', options: ['It is a printer', 'It stores all files permanently', 'It is temporary working memory', 'It is an operating system'], answer: 2, why: 'RAM holds active tasks and is normally cleared when the power is off.' },
        { q: 'Which part is the main circuit board that connects everything?', options: ['GPU', 'Motherboard', 'SSD', 'Webcam'], answer: 1, why: 'Every other component connects to the motherboard.' },
        { q: 'Which part mainly processes graphics and video?', options: ['GPU', 'Keyboard', 'Charger', 'Flash drive'], answer: 0, why: 'The Graphics Processing Unit handles images, video and games.' },
        { q: 'CPU speed is measured in...', options: ['Pixels', 'Gigahertz (GHz)', 'Hours', 'Inches'], answer: 1, why: 'GHz measures how fast the processor works.' },
        { q: 'You wrote an essay but did not save it and the power failed. Where was it?', options: ['Safely in storage', 'Only in RAM, so it is lost', 'On the motherboard forever', 'In the charger'], answer: 1, why: 'Unsaved work lives only in RAM, which is cleared when power is lost.' },
      ],
    }),

  T('hw-storage', 'Storage: HDD, SSD, units and removable drives',
    'Hifadhi huweka mafaili; SSD ni ya haraka na haina sehemu zinazozunguka, na kipimo huanzia byte hadi terabyte, kila hatua ni takriban mara 1,000.',
    'Work out how many 5 MB PDFs fit on an 8 GB flash drive (use 1 GB = 1,000 MB).',
    [
      { h: 'HDD and SSD', p: [
        'There are two main kinds of internal storage drive. A Hard Disk Drive (HDD) stores data on rapidly spinning magnetic disks. A Solid-State Drive (SSD) stores data electronically in memory chips, with no moving parts.',
        'SSDs are generally faster, quieter, use less power and are more resistant to knocks, which is why most modern laptops use them. HDDs are usually cheaper for very large amounts of storage.'],
        table: { head: ['Feature', 'HDD', 'SSD'], rows: [
          ['Technology', 'Spinning magnetic disks', 'Electronic memory chips'],
          ['Speed', 'Slower start-up and file opening', 'Much faster for everyday tasks'],
          ['Noise and shocks', 'Can make noise; sensitive to drops', 'Silent; handles movement better'],
          ['Cost per gigabyte', 'Usually lower', 'Usually higher']] } },
      { h: 'Measuring storage', p: [
        'Storage is measured in bytes. One byte holds just one character, so we use larger units for real files. Each step in the table is roughly one thousand times larger than the one before.'],
        fig: 'hw-units',
        table: { head: ['Unit', 'Approximate size', 'What it could hold'], rows: [
          ['Kilobyte (KB)', '1,000 bytes', 'A short text note'],
          ['Megabyte (MB)', '1,000 KB', 'A photograph or a song'],
          ['Gigabyte (GB)', '1,000 MB', 'Hundreds of photos or a film'],
          ['Terabyte (TB)', '1,000 GB', 'Thousands of films or a lifetime of documents']] } },
      { h: 'Worked example: will it fit?', p: [
        'A 16 GB flash drive is about 16,000 MB. If each of your lecture PDFs is about 5 MB, then 16,000 divided by 5 gives 3,200 PDFs. If each phone video is about 200 MB, then 16,000 divided by 200 gives 80 videos.',
        'Working out sizes like this helps you choose the right storage before you buy or copy files.'] },
      { h: 'Removable storage', p: [
        'A USB flash drive, an external hard drive and a memory card are portable storage devices. They are useful for moving files between computers and for making backups.',
        'Because they are small and easy to lose, never keep your only copy of an important file on a flash drive.'],
        tip: 'Keep important files in at least two places, for example the laptop and an external drive.' },
    ],
    {
      mistakes: [
        'Treating a flash drive as the only home for an important file. It is easy to lose.',
        'Mixing up units: 1 GB is about 1,000 MB, not 100 MB.',
        'Thinking an SSD is a type of RAM. It is storage; it keeps files when the power is off.',
      ],
      exercises: [
        { q: 'Why is an SSD usually better than an HDD in a laptop?', a: 'An SSD has no moving parts, so it is faster, quieter, uses less power and handles knocks better.' },
        { q: 'How many 5 MB PDFs fit on a 16 GB flash drive?', a: '16 GB is about 16,000 MB, and 16,000 divided by 5 is 3,200 PDFs.' },
        { q: 'Put these in order from smallest to largest: GB, KB, TB, MB.', a: 'KB, MB, GB, TB. Each is about 1,000 times the one before.' },
        { q: 'When might you still choose an HDD?', a: 'When you need very large storage at a lower cost per gigabyte.' },
      ],
      quiz: [
        { q: 'Which unit is largest?', options: ['Megabyte', 'Kilobyte', 'Terabyte', 'Gigabyte'], answer: 2, why: 'A terabyte is 1,000 GB.' },
        { q: 'A key advantage of an SSD over an HDD is...', options: ['It has spinning disks', 'It is usually faster with no moving parts', 'It is a type of RAM', 'It is only for printers'], answer: 1, why: 'SSDs use memory chips with no moving parts.' },
        { q: 'One byte holds about...', options: ['One character', 'One photograph', 'One song', 'One film'], answer: 0, why: 'A byte holds a single character, which is why larger units are needed.' },
        { q: 'About how many MB are in 1 GB?', options: ['10', '100', '1,000', '1,000,000'], answer: 2, why: 'Each step up is roughly one thousand times larger.' },
        { q: 'Which is removable storage?', options: ['Motherboard', 'USB flash drive', 'CPU', 'GPU'], answer: 1, why: 'Flash drives, external hard drives and memory cards are portable storage.' },
      ],
    }),

  T('hw-ports-care', 'Ports, power and caring for your laptop',
    'Port ni tundu la kuunganisha kifaa; tumia chaja sahihi, linda betri dhidi ya joto, na shika laptop kwa uangalifu ili idumu.',
    'Take a safe tour of your laptop: find the USB ports, charger port, power button, vents and speaker grilles. Do not open any cover.',
    [
      { h: 'A safe tour of your laptop', p: [
        'A laptop combines all four hardware groups in one portable device. Locations vary between brands, so use a picture as a guide and then examine your own laptop. For each part, ask whether it is input, output, storage, a connection or something else.'],
        steps: ['Place the laptop on a flat, steady table with clean, dry hands. Do not remove covers and do not force a connector into a port.', 'Look at the screen. Above it find the webcam lens and the tiny microphone openings.', 'Find the keyboard and touchpad, your main input devices.', 'Find the power button. Do not press it yet.', 'On the left and right edges find the USB ports, the charger port and, if present, the audio jack and memory-card slot.', 'Find the ventilation openings. They let hot air escape, so never block them.', 'Find the speaker grilles, usually on the sides or under the front edge.'] },
      { h: 'Ports and wireless connections', p: [
        'A port is a socket where you connect another device. Knowing the common ones helps you choose the right cable and avoid damaging your laptop.',
        'Not every connection needs a cable. Wi-Fi connects your device to a local network and the internet. Bluetooth connects nearby devices such as wireless headphones or a speaker. Both use radio signals, so they work only over short distances.'] },
      { h: 'Battery and charger', p: [
        'A battery makes a laptop portable, but batteries wear out. Good habits can extend its life for years.'],
        steps: ['Use the charger that came with the laptop, or a quality replacement of the correct specification. A cheap, unsuitable charger can damage the battery or the laptop.', 'Do not let the battery run to 0% again and again. Recharge when it falls to about 20%.', 'Keep the laptop cool. Heat is the battery\'s greatest enemy. Do not leave it in a hot car or on a soft bed where the vents are covered.', 'When working at a desk for many hours, you can leave the charger connected; most modern laptops manage charging safely.', 'Switch off power strips during thunderstorms and use a surge protector where electricity is unstable.'] },
      { h: 'Caring for your laptop', p: [
        'Small daily habits protect your laptop. The table shows what to do and what to avoid.'],
        table: { head: ['Do', 'Do not'], rows: [
          ['Carry it closed, in a padded bag', 'Carry it by the screen or walk with it open'],
          ['Clean the screen with a soft, dry or slightly damp microfibre cloth', 'Spray liquid on the screen or use rough tissue'],
          ['Keep drinks and food away from it', 'Place a cup of tea or juice next to the keyboard'],
          ['Shut down properly and restart now and then', 'Switch off by holding the power button, unless it is frozen'],
          ['Keep the vents clear and work on a flat surface', 'Use it on a pillow or blanket that blocks the air'],
          ['Insert plugs gently, the right way round', 'Force a cable into a port']] },
        tip: 'Heat is the enemy. Keep the vents clear and the laptop away from hot places.' },
    ],
    {
      mistakes: [
        'Blocking the vents by using the laptop on a bed or a pillow.',
        'Forcing a plug into a port instead of checking it is the right way round.',
        'Using a cheap charger of the wrong specification.',
        'Holding the power button to switch off when the laptop is not frozen.',
      ],
      exercises: [
        { q: 'What is a port, and what is the difference between a port and Wi-Fi?', a: 'A port is a socket for connecting a device with a cable. Wi-Fi connects devices using radio signals instead of a cable.' },
        { q: 'List four ways to care for a laptop battery.', a: 'Use the correct charger, recharge at about 20% instead of running to 0%, keep the laptop cool, and use a surge protector where electricity is unstable.' },
        { q: 'Why must you never block the ventilation openings?', a: 'They let hot air escape. Heat is the battery\'s greatest enemy and can harm the laptop.' },
        { q: 'Why should you carry a laptop closed, in a padded bag?', a: 'Carrying it by the screen or open can damage it; a closed, padded bag protects it from knocks.' },
      ],
      quiz: [
        { q: 'Which connection uses radio signals over short distances?', options: ['USB cable', 'Bluetooth', 'Power cable', 'Audio jack'], answer: 1, why: 'Wi-Fi and Bluetooth both use radio signals and work over short distances.' },
        { q: 'At about what level should you recharge a laptop battery?', options: ['0%', '20%', '100%', 'Only when it switches off'], answer: 1, why: 'Avoid running to 0% again and again; recharge at about 20%.' },
        { q: 'What is the battery\'s greatest enemy?', options: ['Heat', 'Light', 'Silence', 'Keyboards'], answer: 0, why: 'Hot cars and blocked vents shorten battery life.' },
        { q: 'What do the ventilation openings do?', options: ['Play sound', 'Let hot air escape', 'Charge the battery', 'Hold the webcam'], answer: 1, why: 'They let hot air leave the laptop.' },
        { q: 'The safest way to clean the screen is...', options: ['Spray liquid directly on it', 'Use rough tissue', 'Use a soft microfibre cloth', 'Use a hard brush'], answer: 2, why: 'A soft, dry or slightly damp microfibre cloth will not scratch it.' },
      ],
    }),

  T('hw-specs', 'Reading a computer specification',
    'Specification ni orodha ya sifa za kompyuta, na kila mstari unajibu swali rahisi kama kichakataji, RAM na hifadhi.',
    'Find your own laptop\'s processor, installed RAM and storage size, and write them down.',
    [
      { h: 'What is a specification?', p: [
        'When you buy or compare computers you will see a list of technical details called a specification, or spec. It looks complicated at first, but each line answers a simple question.'],
        table: { head: ['Spec line', 'What it means', 'What a student should look for'], rows: [
          ['Processor: Intel Core i5, 4 cores', 'The CPU model and number of cores', 'A recent mid-range processor is enough for study and office tasks'],
          ['RAM: 8 GB', 'The size of the working memory', '8 GB is a sensible minimum today; 16 GB gives more comfort'],
          ['Storage: 256 GB SSD', 'The size and type of the storage drive', 'Choose an SSD. 256 GB is a minimum; 512 GB gives more room'],
          ['Screen: 14-inch, Full HD', 'Screen size and sharpness', '14 to 15 inch is comfortable for most work'],
          ['Battery: up to 8 hours', 'Maker\'s estimate of battery life', 'Real life is usually shorter than the claim'],
          ['Operating system: Windows 11', 'The system software installed', 'Check that it is genuinely licensed']] } },
      { h: 'Find your own computer\'s specification', p: [
        'You do not need to open the laptop to know what is inside. Windows will tell you.'],
        steps: ['Click the Start button and open Settings (the gear icon). A faster way is to press Windows + I.', 'Choose System, scroll down and click About.', 'Under Device specifications, read the Processor and Installed RAM lines. Write them down.', 'Go back and choose Storage. You will see how much space is used and free on drive C:.', 'Press Ctrl + Shift + Esc to open Task Manager, click the Performance tab and select CPU, Memory and Disk in turn to see live use.'],
        tip: 'Windows menus change between versions. If you cannot find an option, type its name, for example About, in the search box at the top of Settings.' },
      { h: 'Practical lab: hardware inventory', p: [
        'Make a table with the rows Screen, Keyboard, Touchpad or mouse, Webcam, Microphone, Speakers, USB port, Charger port, Power button and Storage capacity. Tick Yes only for parts you have actually located and write each part\'s purpose.',
        'Next, record the processor, installed RAM and storage size using the steps above. Then calculate how many 5 MB PDF files would fit in your free storage space and show your working. If you can, find out whether your laptop uses an SSD or an HDD by searching its model name. You have succeeded when every row has an entry and your specification sheet is complete.'] },
      { h: 'Worked example: Core i5, 8 GB, 512 GB SSD', p: [
        'Suppose a laptop is advertised as Core i5, 8 GB RAM, 512 GB SSD. Core i5 is the processor (the CPU, the worker). 8 GB RAM is the working memory for programs that are running. 512 GB SSD is the fast storage drive where files and programs are kept.'] },
    ],
    {
      mistakes: [
        'Trusting the battery claim. Real battery life is usually shorter than the maker\'s estimate.',
        'Reading the RAM number as the storage size, or the other way round.',
        'Buying a laptop with an HDD when an SSD is available at a similar price.',
      ],
      exercises: [
        { q: 'A laptop is advertised as Core i5, 8 GB RAM, 512 GB SSD. Explain each of the three parts.', a: 'Core i5 is the processor (CPU), 8 GB RAM is the working memory, and 512 GB SSD is the fast storage drive for files and programs.' },
        { q: 'How do you open the About page in Windows to see your specification?', a: 'Press Windows + I to open Settings, choose System, scroll down and click About.' },
        { q: 'How can you see live use of CPU, memory and disk?', a: 'Press Ctrl + Shift + Esc to open Task Manager, click the Performance tab and select CPU, Memory and Disk.' },
        { q: 'What minimum would you look for in RAM and storage for study?', a: 'At least 8 GB RAM and a 256 GB SSD, with 16 GB RAM and 512 GB giving more comfort.' },
      ],
      quiz: [
        { q: 'Which shortcut opens Windows Settings?', options: ['Windows + I', 'Ctrl + P', 'Alt + F4', 'Windows + L'], answer: 0, why: 'Windows + I opens Settings directly.' },
        { q: 'Which shortcut opens Task Manager?', options: ['Ctrl + C', 'Ctrl + Shift + Esc', 'Alt + Tab', 'Ctrl + Z'], answer: 1, why: 'Ctrl + Shift + Esc opens Task Manager, where the Performance tab shows live use.' },
        { q: 'In the spec "RAM: 8 GB", the 8 GB describes...', options: ['Storage for files', 'The size of the working memory', 'The screen size', 'The battery life'], answer: 1, why: 'RAM is working memory, different from storage.' },
        { q: 'What type of storage drive does the book advise students to choose?', options: ['SSD', 'HDD', 'Floppy disk', 'None'], answer: 0, why: 'An SSD is faster and more robust; 256 GB is a minimum.' },
        { q: 'A "Battery: up to 8 hours" claim means...', options: ['It always lasts exactly 8 hours', 'It is the maker\'s estimate and real life is usually shorter', 'It lasts 8 days', 'It never needs charging'], answer: 1, why: 'The claim is an estimate; real use is usually shorter.' },
      ],
    }),
];
