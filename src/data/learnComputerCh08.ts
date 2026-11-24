import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Digital Foundations, chapter 8: Keyboard skills and shortcuts. */
export const CB_CH8: LearnLesson[] = [
  T('kb-keys', 'Getting to know the keyboard and sitting well', 'Kibodi ina makundi ya vitufe vyenye kazi tofauti, na kukaa vizuri hulinda afya yako.',
    'Find one key from each group on your keyboard (letter, function, modifier, editing, navigation, special) and say what it does. Then check your posture against the list.',
    [
      { h: 'The regions of the keyboard', p: [
        'The keyboard is your main tool for telling the computer what to do. It looks complicated but is divided into regions with different jobs. The keys follow the QWERTY layout, named after the first six letters on the top row, which is used in English-speaking countries and most of the world.',
      ], table: { head: ['Region', 'Keys', 'What they do'], rows: [
        ['Letter keys', 'A-Z', 'Type letters; hold Shift for capitals'],
        ['Number row', '1-0 and symbols', 'Type numbers; with Shift, symbols such as ! @ # $ %'],
        ['Function keys', 'F1-F12', 'Special actions that change by program: F2 renames a file, F5 refreshes a page, F1 often opens help'],
        ['Modifier keys', 'Ctrl, Alt, Shift, Windows', 'Change the meaning of other keys; you hold them while pressing another key'],
        ['Editing keys', 'Backspace, Delete, Enter, Tab, Space', 'Backspace erases to the left, Delete to the right, Enter starts a new line or confirms, Tab jumps, Space adds a space'],
        ['Navigation keys', 'Arrow keys, Home, End, Page Up, Page Down', 'Move the cursor or page without the mouse'],
        ['Numeric keypad', 'Number block on the right (some laptops)', 'Quick entry of many numbers, for example in spreadsheets'],
        ['Special keys', 'Esc, Caps Lock, Print Screen', 'Esc cancels, Caps Lock makes all letters capital, Print Screen captures the screen'],
      ] }, tip: 'The pointer is the arrow you move with the mouse. The cursor (insertion point) is the blinking vertical line that shows where the next letter will appear. They are different things.' },
      { h: 'Why posture matters', p: [
        'Long hours at a computer can cause neck, shoulder, back and wrist pain, and tired eyes. Good posture takes no extra time and protects your health for years.',
      ], fig: 'kb-posture' },
      { h: 'A healthy position', p: [
        'Use this checklist each time you sit down to work. If you use a laptop, raise it on a stand or a stack of books and use a separate keyboard if possible.',
      ], steps: [
        'Back: sit well back in the chair so your lower back is supported.',
        'Eyes: the top of the screen is roughly at eye level, about an arm\'s length away.',
        'Arms: keep elbows at about 90 degrees and close to your body.',
        'Wrists: keep them straight and relaxed, not bent up or down, and do not rest them hard on the desk edge.',
        'Feet: place them flat on the floor or a footrest.',
        'Breaks: every 20 minutes look at something about 20 feet (six metres) away for 20 seconds. Stand up and stretch every hour.',
      ] },
    ],
    {
      mistakes: [
        'Confusing the cursor (blinking line in a document) with the pointer (mouse arrow).',
        'Typing for hours without breaks.',
        'Working with a laptop low on the desk so the neck bends down for hours.',
        'Resting the wrists hard on the edge of the desk while typing.',
      ],
      exercises: [
        { q: 'List five regions of the keyboard and what each is used for.', a: 'For example: letter keys type letters; number row types numbers and symbols; function keys do special actions such as F2 rename; modifier keys change other keys; navigation keys move the cursor.' },
        { q: 'Describe a healthy sitting position at a computer.', a: 'Back supported, screen top at eye level an arm\'s length away, elbows about 90 degrees, wrists straight, feet flat, with a look-away break every 20 minutes and a stretch every hour.' },
        { q: 'What is the difference between the cursor and the pointer?', a: 'The pointer is the mouse arrow. The cursor is the blinking line showing where typing will appear.' },
      ],
      quiz: [
        { q: 'Which key erases to the left of the cursor?', options: ['Delete', 'Backspace', 'Tab', 'Esc'], answer: 1, why: 'Backspace erases to the left; Delete erases to the right.' },
        { q: 'QWERTY is named after:', options: ['Its inventor', 'The first six letters on the top row', 'The number row', 'A country'], answer: 1, why: 'The top row begins Q W E R T Y.' },
        { q: 'Which are modifier keys?', options: ['Ctrl, Alt, Shift, Windows', 'F1 to F12', 'Home, End', 'A, S, D, F'], answer: 0, why: 'Modifiers change the meaning of another key pressed with them.' },
        { q: 'Where should the top of the screen be?', options: ['Far above your head', 'Roughly at eye level, about an arm\'s length away', 'Below your elbows', 'Touching your nose'], answer: 1, why: 'This keeps the neck straight and reduces strain.' },
        { q: 'What is the 20-20-20 style break in the book?', options: ['Every 20 minutes look about 20 feet away for 20 seconds', 'Type 20 words in 20 seconds', 'Press Esc 20 times', 'Sleep 20 hours'], answer: 0, why: 'It rests tired eyes.' },
      ],
    }),

  T('kb-touch', 'Touch typing and typing speed', 'Kuandika bila kuangalia vitufe huanza na safu ya nyumbani ASDF JKL;; zingatia usahihi kwanza.',
    'Type "a sad lad had a salad; ask dad all fall." three times slowly without looking at the keyboard.',
    [
      { h: 'What is touch typing?', p: [
        'Touch typing means typing without looking at the keys, using all your fingers. It is one of the best investments of your time as a student, because you will type for years.',
        'Typing with two fingers is slow and tiring; typing with ten fingers is fast and relaxed.',
      ] },
      { h: 'The home row', p: [
        'Rest your fingers on the home row: A S D F for the left hand and J K L ; for the right hand. Your thumbs rest on the Space bar. Small raised bumps on F and J help you find the home row without looking.',
        'Each finger is responsible for the keys directly above and below its home key.',
      ], fig: 'kb-homerow', table: { head: ['Finger', 'Left hand', 'Right hand'], rows: [
        ['Little finger', 'Q A Z', 'P ; /'],
        ['Ring finger', 'W S X', 'O L .'],
        ['Middle finger', 'E D C', 'I K ,'],
        ['Index finger', 'R F V T G B', 'Y H N U J M'],
        ['Thumbs', 'Space bar', 'Space bar'],
      ] } },
      { h: 'How to learn', p: [
        'Speed will come on its own if you are patient. Accuracy first, speed later.',
      ], steps: [
        'Set up your posture as in the last lesson.',
        'Place your fingers on the home row and feel the bumps on F and J.',
        'Learn the home row first. Type slowly: asdf jkl; and look at the screen, not the keyboard. Return to the home row after each key.',
        'Add one row at a time: first the top row (qwerty uiop), then the bottom row (zxcvb nm).',
        'Focus on accuracy before speed. If you make many mistakes, slow down.',
        'Practise 10 to 15 minutes daily; that beats two hours once a week.',
        'Use a free, well-known typing-practice website and avoid sites that ask for personal details.',
        'Do not look at the keys. If you must, cover your hands with a thin cloth or a sheet of paper.',
      ] },
      { h: 'Measuring speed and accuracy', p: [
        'Typing speed is measured in words per minute (WPM). In typing tests a word is counted as five characters, including spaces. So 300 characters in one minute is 300 / 5 = 60 WPM. In short: WPM = (characters / 5) / minutes.',
        'Example: a learner types for 3 minutes and produces 450 characters with 6 mistakes. Gross speed = (450 / 5) / 3 = 90 / 3 = 30 WPM. Accuracy = (450 - 6) / 450 x 100, about 98.7 percent. This is a good start; the aim is 30 to 40 WPM with high accuracy, improving gradually.',
      ] },
    ],
    {
      mistakes: [
        'Chasing speed before accuracy, which builds bad habits.',
        'Peeking at the keys instead of covering them.',
        'Practising two hours once a week rather than a little each day.',
        'Using typing sites that ask for personal details.',
      ],
      exercises: [
        { q: 'What is the home row and why is it important?', a: 'It is ASDF for the left hand and JKL; for the right hand. Fingers rest there so each finger knows its keys and you can type without looking.' },
        { q: 'Calculate the WPM of a learner who types 600 characters in 4 minutes.', a: '(600 / 5) / 4 = 120 / 4 = 30 WPM.' },
        { q: 'A learner types 450 characters in 3 minutes with 6 mistakes. What is the accuracy?', a: '(450 - 6) / 450 x 100 is about 98.7 percent.' },
      ],
      quiz: [
        { q: 'The home row for the left hand is:', options: ['QWER', 'ASDF', 'ZXCV', '1234'], answer: 1, why: 'The left hand rests on A S D F.' },
        { q: 'A person types 400 characters in 2 minutes. Their speed is:', options: ['20 WPM', '40 WPM', '80 WPM', '200 WPM'], answer: 1, why: '(400 / 5) / 2 = 40 WPM.' },
        { q: 'Which keys have small raised bumps?', options: ['A and ;', 'F and J', 'Q and P', 'Z and M'], answer: 1, why: 'The bumps on F and J help you find the home row.' },
        { q: 'What should come first when learning to touch type?', options: ['Speed', 'Accuracy', 'Looking at the keys', 'Typing in capitals'], answer: 1, why: 'Speed follows accuracy.' },
        { q: 'How many characters count as one word in typing tests?', options: ['Three', 'Four', 'Five', 'Ten'], answer: 2, why: 'A word is five characters, including spaces.' },
      ],
    }),

  T('kb-shortcuts', 'Keyboard shortcuts', 'Njia za mkato hutumia kitufe cha modifier pamoja na kingine; jifunze moja kila siku.',
    'Open a blank document and try Ctrl + A, Ctrl + C, Ctrl + V, Ctrl + Z and Ctrl + Y, writing down what each did.',
    [
      { h: 'What is a shortcut?', p: [
        'A keyboard shortcut is a combination of keys that performs an action quickly, without searching through menus. Most use a modifier key (Ctrl, Alt, Shift or Windows) held down together with another key.',
        'To use a shortcut, hold down the modifier, tap the letter, then release both. For example, to copy: hold Ctrl, tap C, release. Do not hold the letter down.',
      ], fig: 'kb-modifier' },
      { h: 'Essential editing shortcuts', p: [
        'These work in almost every program. Ctrl + Z and Ctrl + S together can protect hours of work.',
      ], table: { head: ['Shortcut', 'Action'], rows: [
        ['Ctrl + C', 'Copy the selected item'],
        ['Ctrl + X', 'Cut the selected item (prepare to move)'],
        ['Ctrl + V', 'Paste what you copied or cut'],
        ['Ctrl + Z', 'Undo the last action'],
        ['Ctrl + Y', 'Redo what you just undid'],
        ['Ctrl + S', 'Save; use often'],
        ['Ctrl + A', 'Select all text or files'],
        ['Ctrl + F', 'Find text on a page or in a document'],
        ['Ctrl + P', 'Print, or save as PDF'],
        ['Ctrl + B / I / U', 'Bold / italic / underline'],
      ] } },
      { h: 'Windows shortcuts', p: [
        'These help you move around the system. Use Windows + L whenever you step away so nobody else can use your device.',
      ], table: { head: ['Shortcut', 'Action'], rows: [
        ['Windows + E', 'Open File Explorer'],
        ['Windows + D', 'Show the desktop'],
        ['Windows + L', 'Lock the computer'],
        ['Windows + I', 'Open Settings'],
        ['Windows + Arrow keys', 'Snap a window left, right or full screen'],
        ['Alt + Tab', 'Switch between open applications'],
        ['Alt + F4', 'Close the active window (save first)'],
        ['Ctrl + Shift + Esc', 'Open Task Manager to end a program that is not responding'],
        ['Windows + Shift + S', 'Capture part of the screen as a picture'],
        ['F2 / F5', 'Rename the selected file / refresh a window or page'],
      ] } },
      { h: 'Browser shortcuts', p: [
        'In a web browser, Ctrl + T opens a new tab, Ctrl + W closes the current tab and Ctrl + Shift + T reopens the one you just closed. Ctrl + L jumps to the address bar, Ctrl + D bookmarks the page, Ctrl + Tab moves to the next tab, and Ctrl + plus or Ctrl + minus zooms in or out.',
      ] },
      { h: 'Learn them one at a time', p: [
        'Do not try to learn them all at once. Case study: Juma accidentally deleted two paragraphs of a long assignment and panicked. His classmate pressed Ctrl + Z several times and the paragraphs came back. Now Juma presses Ctrl + S every few minutes so he rarely loses more than a sentence.',
      ], steps: [
        'Choose one new shortcut each day.',
        'Write it on a small card or sticky note by your screen.',
        'Use it every time the situation arises, even if the mouse feels easier. After about a week it becomes automatic.',
        'When you have mastered five, add five more.',
      ] },
    ],
    {
      mistakes: [
        'Holding the letter key down instead of tapping it while holding the modifier.',
        'Using Alt + F4 before saving the work.',
        'Trying to learn every shortcut in one day.',
        'Forgetting Ctrl + S until the program crashes.',
      ],
      exercises: [
        { q: 'List the shortcuts for copy, cut, paste, undo and save.', a: 'Copy Ctrl + C, cut Ctrl + X, paste Ctrl + V, undo Ctrl + Z, save Ctrl + S.' },
        { q: 'What do Windows + L and Ctrl + Shift + Esc do?', a: 'Windows + L locks the computer. Ctrl + Shift + Esc opens Task Manager, used to end a program that is not responding.' },
        { q: 'Explain how to use a shortcut correctly.', a: 'Hold the modifier key, tap the other key once, then release both. Do not hold the letter down.' },
      ],
      quiz: [
        { q: 'What does Ctrl + C normally do?', options: ['Copy', 'Delete', 'Rename', 'Shut down'], answer: 0, why: 'Ctrl + C copies the selected item.' },
        { q: 'Which shortcut switches between open applications?', options: ['Ctrl + Tab', 'Windows + D', 'Alt + Tab', 'Alt + F4'], answer: 2, why: 'Alt + Tab switches applications; Ctrl + Tab switches browser tabs.' },
        { q: 'Which shortcut reopens a tab you just closed?', options: ['Ctrl + T', 'Ctrl + W', 'Ctrl + Shift + T', 'Ctrl + D'], answer: 2, why: 'Ctrl + Shift + T reopens the last closed tab.' },
        { q: 'Which shortcut opens File Explorer?', options: ['Windows + E', 'Windows + I', 'Ctrl + E', 'F5'], answer: 0, why: 'Windows + E opens File Explorer; Windows + I opens Settings.' },
        { q: 'You deleted text by accident. Which shortcut helps?', options: ['Ctrl + P', 'Ctrl + Z', 'Ctrl + F', 'Ctrl + S'], answer: 1, why: 'Ctrl + Z undoes the last action.' },
      ],
    }),

  T('kb-access', 'Accessibility and the typing practical lab', 'Windows ina Sticky Keys, kibodi ya skrini na kuandika kwa sauti; fanya mazoezi ya kuandika na njia za mkato.',
    'Turn on voice typing with Windows + H in a text box and dictate one sentence, then turn it off again.',
    [
      { h: 'Accessibility features', p: [
        'Windows includes features that make the computer easier to use for people with different needs. Everyone can benefit from knowing about them.',
      ], table: { head: ['Feature', 'What it does', 'How to start it'], rows: [
        ['Sticky Keys', 'Press shortcut keys one after another instead of together', 'Press Shift five times quickly, or Settings, Accessibility, Keyboard'],
        ['On-screen keyboard', 'A keyboard on the screen you click or touch', 'Settings, Accessibility, Keyboard'],
        ['Voice typing', 'Speak instead of typing', 'Click in a text box and press Windows + H'],
        ['Text size and Magnifier', 'Make text and parts of the screen larger', 'Settings, Accessibility, Text size; Windows + plus for Magnifier'],
      ] } },
      { h: 'Practical lab: typing and shortcut practice', p: [
        'Goal: build a baseline and learn your first ten shortcuts. You have succeeded when you have saved your first typing test result and used at least seven shortcuts correctly.',
      ], steps: [
        'Open a blank document, sit properly and place your fingers on the home row.',
        'Type this sentence three times, slowly, without looking at the keyboard: a sad lad had a salad; ask dad all fall.',
        'Do a one-minute test: type any text for one minute, count the characters (the status bar shows word count), calculate WPM and accuracy, and write the result at the top.',
        'Type three sentences about your day. Use Ctrl + A to select all, Ctrl + C to copy, move to a new line and press Ctrl + V twice.',
        'Press Ctrl + Z twice and observe what happens. Then press Ctrl + Y once.',
        'Press Ctrl + S and save the file as Typing_Practice in 01_Computer_Basics.',
        'Try each of these and write what happened: Ctrl + S, Ctrl + A, Ctrl + C and Ctrl + V, Ctrl + Z, Windows + E, Alt + Tab, F2.',
      ], tip: 'Record your WPM today. Test again in two weeks to see your progress.' },
      { h: 'Key points to remember', p: [
        'The keyboard has letter, number, function, modifier, editing, navigation and special keys. Sit with a supported back, eyes at screen level, relaxed wrists and feet flat, and take regular breaks.',
        'Touch typing starts on the home row (ASDF JKL;); build accuracy first and speed later. WPM = (characters / 5) / minutes. Shortcuts use a modifier key held with another key; learn one a day.',
      ] },
    ],
    {
      mistakes: [
        'Thinking accessibility tools are only for a few people; many users find them handy.',
        'Skipping the baseline test, so you cannot see your progress later.',
        'Looking at the keyboard during the practice sentences.',
        'Reading the shortcut table without actually trying each shortcut.',
      ],
      exercises: [
        { q: 'Name two accessibility features in Windows and say who might benefit.', a: 'Sticky Keys helps people who find pressing keys together difficult. Voice typing helps people who find typing hard or tiring. The Magnifier helps people with weak eyesight.' },
        { q: 'How do you turn on Sticky Keys quickly?', a: 'Press Shift five times quickly, or go to Settings, Accessibility, Keyboard.' },
        { q: 'In the lab, what do Ctrl + Z twice and then Ctrl + Y once do?', a: 'Ctrl + Z twice undoes the last two actions; Ctrl + Y then redoes one of them.' },
      ],
      quiz: [
        { q: 'Which shortcut starts voice typing?', options: ['Windows + H', 'Windows + L', 'Ctrl + H', 'Alt + V'], answer: 0, why: 'Click in a text box and press Windows + H.' },
        { q: 'What does Sticky Keys do?', options: ['Glues keys to the keyboard', 'Lets you press shortcut keys one after another', 'Locks the screen', 'Makes text bigger'], answer: 1, why: 'It removes the need to hold keys together.' },
        { q: 'How do you start the Magnifier?', options: ['Windows + plus', 'Ctrl + Shift + Esc', 'Alt + Tab', 'F5'], answer: 0, why: 'Windows + plus starts the Magnifier.' },
        { q: 'Where is the on-screen keyboard found?', options: ['Settings, Accessibility, Keyboard', 'Recycle Bin', 'Task Manager', 'Downloads'], answer: 0, why: 'It is in the keyboard accessibility settings.' },
        { q: 'You press Ctrl + Z twice and then Ctrl + Y once. Net effect?', options: ['Both undos stay', 'One action is redone', 'The file is deleted', 'Nothing changes'], answer: 1, why: 'Two undos, one redo leaves one action undone.' },
      ],
    }),
];
