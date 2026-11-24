import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Appendices A-G: shortcuts, troubleshooting, glossary, final assessment, rubric and progress record (from Digital Foundations by Binsaid). */
export const CB_APP: LearnLesson[] = [
  T('app-shortcuts', 'Keyboard shortcut cheat sheet', 'Njia za mkato za kibodi hukuokoa muda; hapa kuna zile muhimu za kuhariri, Windows, File Explorer na kivinjari.',
    'Pick five shortcuts from this lesson that you do not use yet and use each one three times today.',
    [
      { h: 'How to use this sheet', p: [
        'Keep this cheat sheet near your computer until the shortcuts become habits. A shortcut is a key combination that does a task faster than the mouse. You press the keys together, holding the first one while you tap the next.',
        'Shortcuts that use Ctrl are given for Windows. On a Mac, use Cmd in place of Ctrl.'],
        tip: 'Learn a few at a time. Five shortcuts used every day are worth more than fifty you only read once.' },
      { h: 'Everyday editing', p: [
        'These work in almost every program: Word, Notepad, your browser and File Explorer. If you only learn one group, learn this one.'],
        table: { head: ['Shortcut', 'What it does'], rows: [
          ['Ctrl + C', 'Copy the selected item'],
          ['Ctrl + X', 'Cut the selected item'],
          ['Ctrl + V', 'Paste what you copied or cut'],
          ['Ctrl + Z', 'Undo the last action'],
          ['Ctrl + Y', 'Redo the action you undid'],
          ['Ctrl + A', 'Select everything'],
          ['Ctrl + S', 'Save'],
          ['Ctrl + P', 'Print'],
          ['Ctrl + F', 'Find a word on the page or in the document'],
          ['Ctrl + B / I / U', 'Bold / Italic / Underline'],
        ] } },
      { h: 'Moving and selecting text', p: [
        'Moving around a long document with arrow keys alone is slow. These shortcuts jump by word, line or the whole document, and with Shift they select as they move.'],
        table: { head: ['Shortcut', 'What it does'], rows: [
          ['Home / End', 'Go to the start / end of the line'],
          ['Ctrl + Home / End', 'Go to the start / end of the document'],
          ['Ctrl + Left / Right arrow', 'Move one word left / right'],
          ['Shift + arrow keys', 'Select text one character or line at a time'],
          ['Ctrl + Shift + Left / Right arrow', 'Select one word at a time'],
          ['Shift + Home / End', 'Select to the start / end of the line'],
          ['Ctrl + Backspace', 'Delete the previous word'],
        ] } },
      { h: 'Windows', p: [
        'These control Windows itself: opening programs, switching between them, locking the screen and taking screenshots. Windows + L is a good habit whenever you leave a shared computer.'],
        table: { head: ['Shortcut', 'What it does'], rows: [
          ['Windows key', 'Open the Start menu'],
          ['Windows + E', 'Open File Explorer'],
          ['Windows + D', 'Show or hide the desktop'],
          ['Windows + L', 'Lock the computer'],
          ['Windows + I', 'Open Settings'],
          ['Windows + V', 'Open clipboard history'],
          ['Windows + Shift + S', 'Take a screenshot of part of the screen'],
          ['Windows + arrow keys', 'Snap the window to the left, right, top or bottom'],
          ['Alt + Tab', 'Switch between open programs'],
          ['Alt + F4', 'Close the current program'],
          ['Ctrl + Shift + Esc', 'Open Task Manager'],
          ['Ctrl + Alt + Delete', 'Open the security screen (lock, sign out, Task Manager)'],
          ['Print Screen', 'Capture the whole screen'],
        ] } },
      { h: 'File Explorer and the web browser', p: [
        'File Explorer shortcuts help you manage files quickly. Warning: Shift + Delete removes an item permanently, so you cannot restore it from the Recycle Bin.',
        'Browser shortcuts make research faster. Ctrl + Shift + T is useful when you close a tab by mistake.'],
        table: { head: ['Shortcut', 'What it does'], rows: [
          ['F2', 'Rename the selected file or folder'],
          ['Delete', 'Send the selected item to the Recycle Bin'],
          ['Shift + Delete', 'Delete permanently (cannot be undone from the Recycle Bin)'],
          ['Ctrl + Shift + N (File Explorer)', 'Create a new folder'],
          ['Alt + Left arrow', 'Go back to the previous folder'],
          ['Alt + Up arrow', 'Go up one level'],
          ['Ctrl + click', 'Select several items that are not next to each other'],
          ['Shift + click', 'Select a range of items'],
          ['F5', 'Refresh the view'],
          ['Ctrl + E', 'Go to the search box'],
          ['Ctrl + T', 'Open a new tab'],
          ['Ctrl + W', 'Close the current tab'],
          ['Ctrl + Shift + T', 'Reopen the tab you just closed'],
          ['Ctrl + Tab', 'Go to the next tab'],
          ['Ctrl + L or F6', 'Select the address bar'],
          ['Ctrl + D', 'Bookmark the page'],
          ['Ctrl + H', 'Open history'],
          ['Ctrl + Shift + Delete', 'Open the clear-browsing-data window'],
          ['Ctrl + Shift + N (browser)', 'Open a private (incognito) window'],
          ['F5 or Ctrl + R', 'Reload the page'],
          ['Ctrl + + / - / 0', 'Zoom in / zoom out / reset zoom'],
        ] } },
    ],
    {
      mistakes: [
        'Reading the whole list once and never practising it; shortcuts only stick with daily use.',
        'Using Shift + Delete when you meant Delete, so the file cannot be restored from the Recycle Bin.',
        'Mixing up Ctrl + Y (redo) and Ctrl + Z (undo), or Ctrl + X (cut) and Ctrl + C (copy).',
        'Forgetting that on a Mac you use Cmd instead of Ctrl.',
      ],
      exercises: [
        { q: 'Which shortcut reopens a browser tab you closed by mistake?', a: 'Ctrl + Shift + T reopens the tab you just closed.' },
        { q: 'Write the shortcuts to select a whole line of text starting from the cursor, and then delete the previous word.', a: 'Shift + End selects to the end of the line (Shift + Home to the start). Ctrl + Backspace deletes the previous word.' },
        { q: 'You leave a shared computer for a few minutes. Which shortcut should you use and why?', a: 'Windows + L locks the computer so nobody can use your account while you are away.' },
        { q: 'Name two ways to open Task Manager.', a: 'Press Ctrl + Shift + Esc directly, or press Ctrl + Alt + Delete and choose Task Manager.' },
      ],
      quiz: [
        { q: 'Which shortcut undoes the last action?', options: ['Ctrl + Y', 'Ctrl + Z', 'Ctrl + X', 'Ctrl + V'], answer: 1, why: 'Ctrl + Z is undo. Ctrl + Y is redo.' },
        { q: 'What does Shift + Delete do to a selected file?', options: ['Sends it to the Recycle Bin', 'Renames it', 'Deletes it permanently', 'Copies it'], answer: 2, why: 'Shift + Delete deletes permanently; it cannot be undone from the Recycle Bin.' },
        { q: 'Which shortcut takes a screenshot of part of the screen?', options: ['Print Screen', 'Windows + Shift + S', 'Ctrl + P', 'Alt + F4'], answer: 1, why: 'Windows + Shift + S lets you capture part of the screen. Print Screen captures the whole screen.' },
        { q: 'Which shortcut switches between open programs?', options: ['Alt + Tab', 'Ctrl + Tab', 'Windows + D', 'Ctrl + W'], answer: 0, why: 'Alt + Tab switches between programs. Ctrl + Tab moves between browser tabs.' },
        { q: 'Which key renames the selected file in File Explorer?', options: ['F5', 'F6', 'F2', 'Home'], answer: 2, why: 'F2 renames the selected file or folder. F5 refreshes the view.' },
      ],
    }),

  T('app-troubleshoot', 'Troubleshooting guide', 'Matatizo mengi ya kompyuta yana sababu rahisi; fuata hatua kwa mpangilio na jaribu badiliko moja kwa wakati.',
    'Recall one computer problem you had recently and write the steps from the general method that you would follow next time.',
    [
      { h: 'The general method', p: [
        'Computer problems feel stressful, but most have simple causes. Work through the steps in order, and always write down any error message exactly, because it helps you search for the solution.'],
        steps: [
          'Stay calm and do not click randomly. Note what you were doing when the problem began.',
          'Save your work if you still can.',
          'Read the message on the screen carefully. Note the words, not only the colour.',
          'Restart the program. Many problems disappear.',
          'Restart the computer.',
          'Search the exact message on a trusted site such as the software maker\'s support pages.',
          'Try one change at a time and test after each. If you change many things at once, you will not know which one helped.',
          'Ask for help and describe clearly what you did, what you expected, and what happened instead.',
        ] },
      { h: 'Performance and display problems', p: [
        'Slow, frozen or black-screen problems are the most common. Check the simple causes first: too many programs, a stuck program, or a loose cable.'],
        table: { head: ['Problem', 'Likely cause', 'What to try'], rows: [
          ['The computer is very slow', 'Too many programs open, low free storage, or background updates.', 'Close programs you are not using. Restart. Open Task Manager (Ctrl + Shift + Esc) and see what uses the most memory. Delete unneeded files and empty the Recycle Bin.'],
          ['A program is frozen ("Not responding")', 'The program is stuck.', 'Wait 30 seconds. If it does not recover, open Task Manager, select the program and click End task. Unsaved work in that program may be lost.'],
          ['The screen is black', 'Sleep mode, a loose cable, or low battery.', 'Move the mouse or press a key. Check the power cable and the battery. Hold the power button for ten seconds to restart if nothing responds.'],
          ['The keyboard types the wrong characters', 'Wrong keyboard layout or language.', 'Press Windows + Space to change layout. Check Settings, Time & language.'],
        ] } },
      { h: 'Network, sound and printing', p: [
        'If something outside the computer is involved, such as the router or the printer, test with another device or another website to find where the fault is.'],
        table: { head: ['Problem', 'Likely cause', 'What to try'], rows: [
          ['No sound', 'The sound is muted or the wrong output is chosen.', 'Check the volume and mute icon. Right-click the speaker icon, open Sound settings, and choose the right device.'],
          ['Wi-Fi is connected but websites do not load', 'A router problem, a DNS problem, or no internet service.', 'Try another website and another device. Restart the router (unplug for 30 seconds). Forget and reconnect the network. Contact the provider if other devices also fail.'],
          ['Cannot connect to Wi-Fi', 'Wrong password, Wi-Fi switched off, or out of range.', 'Check the Wi-Fi switch and airplane mode. Re-enter the password carefully. Move closer to the router.'],
          ['The printer does not print', 'Not connected, no paper, or a stuck job.', 'Check cables, power and paper. Check that the correct printer is selected. Open the print queue and cancel stuck jobs. Restart the printer.'],
        ] } },
      { h: 'Files, storage and security', p: [
        'File problems usually come down to where a file was saved or whether it was deleted. Safety problems, such as pop-ups or attachments you cannot open, need extra care: do not open unknown attachments.'],
        table: { head: ['Problem', 'Likely cause', 'What to try'], rows: [
          ['Cannot find a saved file', 'Saved in an unexpected folder or named differently.', 'Use the search box in File Explorer. Check Recent files. Look in Downloads and Desktop. Search by file type, e.g. *.docx.'],
          ['Deleted a file by mistake', 'The file is likely in the Recycle Bin.', 'Open the Recycle Bin, right-click the file and choose Restore. If it is gone, check your backup or cloud version history.'],
          ['"Storage is full"', 'Too many large files.', 'Check Settings, System, Storage. Delete or move large videos and old downloads. Empty the Recycle Bin. Move files to external storage.'],
          ['Pop-ups and strange adverts everywhere', 'Adware or notifications from a website.', 'Close the browser and reopen it. In browser settings, block notifications from unknown sites and remove unfamiliar extensions. Run a scan with Windows Security.'],
          ['Cannot open an attachment', 'No program for that file type, or a damaged file.', 'Check the file extension. Install the right program from an official source, or ask the sender for another format. Do not open unknown attachments.'],
          ['Forgot the password', 'Common and fixable.', 'Use Forgot password on the website. For your computer, use your Microsoft account recovery page from another device.'],
        ] },
        tip: 'Keep a backup. Most file disasters become small problems when a second copy exists.' },
    ],
    {
      mistakes: [
        'Clicking randomly when an error appears instead of reading the message.',
        'Changing many settings at once, so you cannot tell which change helped.',
        'Ending a frozen program in Task Manager without waiting, and losing unsaved work.',
        'Opening an unknown attachment you cannot open normally instead of asking the sender.',
      ],
      exercises: [
        { q: 'Your computer is very slow. List three things you could try.', a: 'Close programs you are not using, restart, check Task Manager to see what uses the most memory, or delete unneeded files and empty the Recycle Bin.' },
        { q: 'Wi-Fi shows connected but no website loads. What do you test first and what next?', a: 'Try another website and another device. If other devices also fail, restart the router and then contact the provider.' },
        { q: 'You deleted a file by mistake. How do you try to get it back?', a: 'Open the Recycle Bin, right-click the file and choose Restore. If it is not there, check your backup or cloud version history.' },
        { q: 'Why should you try one change at a time when troubleshooting?', a: 'If you change many things at once you will not know which one fixed the problem. Test after each change.' },
      ],
      quiz: [
        { q: 'A program shows "Not responding". What should you do first?', options: ['Delete the program', 'Wait 30 seconds, then use Task Manager and End task if it does not recover', 'Unplug the computer immediately', 'Click the window as fast as you can'], answer: 1, why: 'Wait first. If it does not recover, End task in Task Manager, remembering that unsaved work may be lost.' },
        { q: 'The keyboard types the wrong characters. Which shortcut can change the layout?', options: ['Windows + Space', 'Ctrl + Z', 'Alt + F4', 'Windows + D'], answer: 0, why: 'Windows + Space changes the keyboard layout. A wrong layout or language is the likely cause.' },
        { q: 'Why should you write down an error message exactly?', options: ['It makes the computer faster', 'It helps you search for the solution', 'It deletes the error', 'It is required to restart'], answer: 1, why: 'The exact words let you search a trusted support site for the solution.' },
        { q: 'Which is a sensible step for "Storage is full"?', options: ['Install more programs', 'Delete or move large videos and old downloads and empty the Recycle Bin', 'Turn off the screen', 'Rename all files'], answer: 1, why: 'Large files cause the problem, so delete or move them, empty the Recycle Bin, and use external storage.' },
        { q: 'You see pop-ups and strange adverts everywhere. What is a good action?', options: ['Click them to close them', 'Block notifications from unknown sites, remove unfamiliar extensions and scan with Windows Security', 'Ignore them forever', 'Share the page with friends'], answer: 1, why: 'The likely cause is adware or website notifications; block them, remove unfamiliar extensions and run a scan.' },
      ],
    }),

  T('app-glossary', 'Glossary of key terms', 'Faharasa hii inaeleza maneno muhimu ya kitabu kwa ufupi, kwa mpangilio wa kategoria.',
    'Choose five terms you were unsure about and write each meaning in your own words without looking.',
    [
      { h: 'How to use the glossary', p: [
        'This glossary lists the important words from the book. Here the terms are grouped by topic to make them easier to learn: computer basics, files and software, the internet, and safety and behaviour online.',
        'Do not just read the meanings. Cover the right-hand column, say the meaning aloud, then check. Saying it in your own words shows that you understand it.'] },
      { h: 'Computer basics', p: [
        'These terms describe what a computer is made of and how it handles data.'],
        table: { head: ['Term', 'Meaning'], rows: [
          ['Bit', 'The smallest unit of data: a 0 or a 1.'],
          ['Byte', 'A group of eight bits.'],
          ['Data', 'Raw facts and figures before they are processed.'],
          ['Information', 'Data that has been processed so that it has meaning.'],
          ['Hardware', 'The physical parts of a computer.'],
          ['Software', 'Programs and instructions that tell a computer what to do.'],
          ['CPU', 'The central processing unit; it carries out instructions.'],
          ['Memory (RAM)', 'Temporary working memory used while programs are running.'],
          ['Storage', 'Permanent space for keeping files, such as an SSD or hard drive.'],
          ['Input device', 'Hardware used to send data into the computer, such as a keyboard.'],
          ['Output device', 'Hardware that shows results, such as a monitor or printer.'],
          ['USB', 'A common type of port and connection for devices.'],
        ] } },
      { h: 'Software, windows and files', p: [
        'These terms are about the programs you use and how you keep your work organised.'],
        table: { head: ['Term', 'Meaning'], rows: [
          ['Operating system', 'The main software that manages the hardware and runs other programs.'],
          ['Application (app)', 'A program that helps you do a task, such as writing or browsing.'],
          ['Driver', 'Software that lets the operating system work with a hardware device.'],
          ['Desktop', 'The main screen shown after Windows starts.'],
          ['Window', 'A rectangular area on the screen that shows a program.'],
          ['File', 'A named collection of data stored on a device.'],
          ['Folder', 'A container used to organise files.'],
          ['Extension', 'The letters after the dot in a file name that show the type.'],
          ['Backup', 'A copy of files kept in case the originals are lost.'],
          ['Cloud storage', 'Storing files on internet servers so you can reach them from anywhere.'],
          ['Download', 'Copy a file from the internet to your device.'],
          ['Upload', 'Send a file from your device to the internet.'],
        ] } },
      { h: 'Networks and the web', p: [
        'These terms describe how devices connect and how you find things online.'],
        table: { head: ['Term', 'Meaning'], rows: [
          ['Network', 'Two or more devices connected to share data.'],
          ['Internet', 'The global network connecting billions of devices.'],
          ['Wi-Fi', 'Wireless technology that connects devices to a network.'],
          ['Router', 'A device that connects your network to the internet.'],
          ['IP address', 'A number that identifies a device on a network.'],
          ['Browser', 'A program used to open and view websites.'],
          ['Search engine', 'A website that finds pages related to your keywords.'],
          ['URL', 'The web address of a page.'],
          ['Domain', 'The main part of a web address that shows the website owner.'],
          ['Cookie', 'A small file that a website saves in your browser to remember you.'],
        ] } },
      { h: 'Safety, honesty and behaviour', p: [
        'These terms help you protect yourself, judge information and behave well online.'],
        table: { head: ['Term', 'Meaning'], rows: [
          ['Account', 'A private space on a service, opened with a username and password.'],
          ['Passphrase', 'A long password made of several unrelated words.'],
          ['Two-step verification', 'A second proof, besides the password, needed to sign in.'],
          ['Phishing', 'A trick message that pretends to be from a trusted sender.'],
          ['Malware', 'Software designed to harm or steal.'],
          ['Firewall', 'A security feature that controls network traffic in and out.'],
          ['CRAAP test', 'A checklist to judge sources: currency, relevance, authority, accuracy, purpose.'],
          ['Plagiarism', 'Using someone else\'s work or ideas as if they were your own.'],
          ['Digital footprint', 'The trail of data you leave by using the internet.'],
          ['Netiquette', 'Good manners in online communication.'],
          ['Cyberbullying', 'Using digital tools to repeatedly hurt or embarrass someone.'],
        ] },
        tip: 'Make flash cards for the terms you miss most often and review them for five minutes a day.' },
    ],
    {
      mistakes: [
        'Confusing data (raw facts) with information (processed, meaningful data).',
        'Mixing up memory (RAM, temporary) and storage (permanent, such as an SSD or hard drive).',
        'Treating the internet and the web as the same thing, or a browser and a search engine as the same thing.',
        'Confusing phishing (a trick message) with malware (harmful software).',
      ],
      exercises: [
        { q: 'Explain the difference between data and information with one example.', a: 'Data is raw facts, such as a list of marks. Information is data processed so it has meaning, such as the class average.' },
        { q: 'What is the difference between a browser and a search engine?', a: 'A browser is a program that opens websites. A search engine is a website that finds pages related to your keywords.' },
        { q: 'Define passphrase and say why it is useful.', a: 'A passphrase is a long password made of several unrelated words. It is long, so it is hard to guess, yet easier to remember.' },
        { q: 'In the web address https://www.example.com/news, which part is the domain and what does it show?', a: 'The domain is www.example.com. It shows the owner of the website.' },
      ],
      quiz: [
        { q: 'What is a byte?', options: ['A single 0 or 1', 'A group of eight bits', 'A type of port', 'A kind of memory chip'], answer: 1, why: 'A bit is a single 0 or 1; a byte is a group of eight bits.' },
        { q: 'Which term means a trick message that pretends to be from a trusted sender?', options: ['Malware', 'Firewall', 'Phishing', 'Cookie'], answer: 2, why: 'Phishing is a trick message pretending to be from a trusted sender. Malware is harmful software.' },
        { q: 'What does a router do?', options: ['Connects your network to the internet', 'Stores your files permanently', 'Shows results on screen', 'Judges sources'], answer: 0, why: 'A router connects your network to the internet.' },
        { q: 'What is a digital footprint?', options: ['A file extension', 'The trail of data you leave by using the internet', 'A copy of your files', 'A kind of virus'], answer: 1, why: 'Your digital footprint is the trail of data you leave by using the internet.' },
        { q: 'Which is an example of an output device?', options: ['Keyboard', 'Mouse', 'Printer', 'USB cable'], answer: 2, why: 'An output device shows results, such as a monitor or printer. A keyboard is an input device.' },
      ],
    }),

  T('app-final-1', 'Final assessment part 1: computers and files', 'Maswali 1 hadi 5 yanapima mzunguko wa taarifa, data na taarifa, CPU, RAM na mfumo endeshi.',
    'Answer questions 1 to 5 alone without notes, then check them. Then answer short-answer question 1 and compare it with the marking guide.',
    [
      { h: 'About the final assessment', p: [
        'The final assessment covers the whole book. In the book it has 20 multiple-choice questions and 8 short-answer questions, takes about 60 minutes, and is done alone without notes. Here it is split into four parts of five multiple-choice questions each.',
        'Scoring: one mark for each correct multiple-choice answer, so the multiple-choice part is out of 20. The short-answer part is out of 30, and the whole assessment is out of 50 marks.'],
        tip: 'Answer the quiz first without looking at the lesson, then read the explanations for the ones you missed.' },
      { h: 'What this part covers', p: [
        'Questions 1 to 5 test the information processing cycle, data and information, the CPU, RAM, and the operating system. Revise Chapters 2 to 4 if you miss any.'],
        table: { head: ['Question', 'Topic', 'Key idea'], rows: [
          ['1', 'Processing cycle', 'Input, processing, output, storage.'],
          ['2', 'Data and information', 'Data is raw; information is processed and meaningful.'],
          ['3', 'CPU', 'The CPU carries out instructions.'],
          ['4', 'RAM', 'RAM is volatile memory, lost when power is off.'],
          ['5', 'Operating system', 'Windows is an operating system.'],
        ] } },
      { h: 'Short-answer practice 1 and 2', p: [
        'Short-answer question 1 asks you to explain step by step what happens from pressing a key until the letter appears and is saved, mentioning at least three components. It is worth 4 marks. Question 2 asks for three differences between hardware and software with an example of each, also 4 marks.',
        'A good answer to question 1 says the key press sends a signal, the CPU interprets it, RAM holds the data while you work, the screen shows the character as output, and saving copies the data to storage (SSD or hard drive). A good answer to question 2 says hardware is physical and can be touched (for example keyboard, CPU, RAM), software is a set of instructions (for example Windows, Word, a browser), and each needs the other to be useful.'] },
    ],
    {
      mistakes: [
        'Putting the processing cycle in the wrong order; remember input, processing, output, storage.',
        'Thinking RAM keeps data permanently; it is lost when the computer is switched off.',
        'Calling Word or Chrome an operating system; those are applications.',
        'Writing a short answer without naming at least three components.',
      ],
      exercises: [
        { q: 'Short answer: explain step by step what happens from pressing a key to the letter appearing on screen and being saved. Name at least three components.', a: 'The key press sends a signal, the CPU interprets it, RAM holds the data while working, the screen shows the character (output), and saving copies the data to storage (SSD or hard drive).' },
        { q: 'Short answer: give three differences between hardware and software, with an example of each.', a: 'Hardware is physical and can be touched (keyboard, CPU, RAM); software is instructions (Windows, Word, a browser); software needs hardware to run and hardware needs software to be useful.' },
        { q: 'Why are both RAM and storage needed in a computer?', a: 'RAM is fast temporary working memory used while programs run and loses its contents when power is off. Storage keeps files permanently.' },
      ],
      quiz: [
        { q: 'Which list shows the stages of the information processing cycle in the correct order?', options: ['Output, input, storage, processing', 'Input, processing, output, storage', 'Storage, output, input, processing', 'Processing, input, storage, output'], answer: 1, why: 'Input, processing, output, storage is the cycle.' },
        { q: 'What is the difference between data and information?', options: ['There is no difference', 'Data is raw facts; information is data that has been processed to have meaning', 'Information is raw facts; data is processed', 'Data is always a number'], answer: 1, why: 'Data is raw; information is processed and meaningful.' },
        { q: 'Which component is called the "brain" of the computer?', options: ['RAM', 'Hard drive', 'CPU', 'Monitor'], answer: 2, why: 'The CPU carries out instructions.' },
        { q: 'What happens to the contents of RAM when the computer is switched off?', options: ['They are saved permanently', 'They are lost', 'They are moved to the CPU', 'They are sent to the internet'], answer: 1, why: 'RAM is volatile memory, so its contents are lost.' },
        { q: 'Which of the following is an operating system?', options: ['Microsoft Word', 'Google Chrome', 'Windows', 'A USB flash drive'], answer: 2, why: 'Windows is an operating system. Word and Chrome are applications.' },
      ],
    }),

  T('app-final-2', 'Final assessment part 2: files and shortcuts', 'Maswali 6 hadi 10 yanapima programu tumizi, viendelezi vya faili, njia za faili, nakili na hamisha, na njia za mkato.',
    'Answer questions 6 to 10 alone, then do short-answer questions 3 and 4 by creating the folders and file names on your computer.',
    [
      { h: 'What this part covers', p: [
        'Questions 6 to 10 test application software, file extensions, file paths, copy versus move, and a keyboard shortcut. Revise Chapters 4 and 6 to 8 if you miss any.'],
        table: { head: ['Question', 'Topic', 'Key idea'], rows: [
          ['6', 'Application software', 'A browser is an application.'],
          ['7', 'File extension', 'The extension shows the file type.'],
          ['8', 'File path', 'Folders are listed from the outside in.'],
          ['9', 'Copy and Move', 'Copy keeps the original; Move relocates it.'],
          ['10', 'Shortcuts', 'Ctrl + Z is undo.'],
        ] } },
      { h: 'Short-answer practice 3: create and move', p: [
        'Short-answer question 3 asks how you would create a folder called Assignments in Documents, create a subfolder inside it, and move an existing file into that subfolder. It is worth 4 marks.'],
        steps: [
          'Open File Explorer and go to Documents.',
          'Right-click, choose New, then Folder.',
          'Type Assignments and press Enter.',
          'Open Assignments and create another folder inside it.',
          'Find the file, then drag it or cut and paste it into the subfolder.',
        ] },
      { h: 'Short-answer practice 4: file names', p: [
        'Short-answer question 4 asks why you should keep file names clear and consistent, with an example of a good name and a poor name. It is worth 3 marks.',
        'Clear names are easy to find and understand. Consistent patterns sort well. Avoid spaces or symbols that cause problems. A good example is Chapter_9_Notes_2026.docx; a poor example is new doc final2 (3).docx.'] },
    ],
    {
      mistakes: [
        'Writing a file path in the wrong order; the outer folder comes first, for example Documents\\Research\\Notes.docx.',
        'Using Move when you wanted to keep the original; Copy leaves the original in place.',
        'Using Ctrl + Y (redo) when you meant Ctrl + Z (undo).',
        'Giving files names such as new doc final2 (3).docx that nobody can understand later.',
      ],
      exercises: [
        { q: 'Short answer: describe how to create a folder Assignments in Documents, a subfolder inside it, and move an existing file into the subfolder.', a: 'Open File Explorer, go to Documents, right-click, New, Folder, type Assignments and press Enter. Open it and create another folder. Then drag the file in, or cut and paste it.' },
        { q: 'Short answer: why should file names be clear and consistent? Give a good and a poor example.', a: 'They are easy to find and sort. Good: Chapter_9_Notes_2026.docx. Poor: new doc final2 (3).docx.' },
        { q: 'Write the path for a file Notes.docx inside the folder Research, which is inside Documents.', a: 'Documents\\Research\\Notes.docx. Folders are listed from the outside in.' },
      ],
      quiz: [
        { q: 'Which is an example of application software?', options: ['A web browser', 'The BIOS', 'A device driver', 'The operating system kernel'], answer: 0, why: 'A browser is an application.' },
        { q: 'In the file name Report.docx, what does .docx show?', options: ['The author', 'The file type or extension', 'The date', 'The folder'], answer: 1, why: 'The extension shows the type.' },
        { q: 'Which path shows a file named Notes.docx inside the folder Research, which is inside Documents?', options: ['Notes.docx\\Research\\Documents', 'Documents\\Research\\Notes.docx', 'Research\\Documents\\Notes.docx', 'Documents\\Notes.docx\\Research'], answer: 1, why: 'Folders are listed from the outside in, ending with the file.' },
        { q: 'What is the difference between Copy and Move?', options: ['They are the same', 'Move makes a duplicate; Copy deletes', 'Copy leaves the original in place; Move removes it from the old location', 'Copy works only on folders'], answer: 2, why: 'Copy keeps the original; Move relocates it.' },
        { q: 'Which shortcut undoes the last action?', options: ['Ctrl + Y', 'Ctrl + X', 'Ctrl + V', 'Ctrl + Z'], answer: 3, why: 'Ctrl + Z is undo.' },
      ],
    }),

  T('app-final-3', 'Final assessment part 3: internet and research', 'Maswali 11 hadi 15 yanapima intaneti na wavuti, kikoa, utafutaji, mtihani wa CRAAP na wizi wa kazi.',
    'Answer questions 11 to 15 alone, then plan your answer to short-answer questions 5 and 6 using a real web page.',
    [
      { h: 'What this part covers', p: [
        'Questions 11 to 15 test the internet and the web, web addresses, search tips, the CRAAP test and plagiarism. Revise Chapters 9 to 11 if you miss any.'],
        table: { head: ['Question', 'Topic', 'Key idea'], rows: [
          ['11', 'Internet and web', 'The web is a service on the internet.'],
          ['12', 'Domain', 'In https://www.example.com/news the domain is www.example.com.'],
          ['13', 'Search tips', 'Quotation marks search the exact phrase.'],
          ['14', 'CRAAP', 'Authority asks about the author and publisher.'],
          ['15', 'Plagiarism', 'Copying without credit is plagiarism.'],
        ] } },
      { h: 'Short-answer practice 5: reliable information', p: [
        'Short-answer question 5 asks how you would find reliable information about "how Wi-Fi works" and decide whether a page can be trusted. It is worth 4 marks.',
        'A good answer uses specific keywords or quotation marks, opens several sources, applies CRAAP (currency, relevance, authority, accuracy, purpose), checks the domain and the author, and cross-checks facts.'] },
      { h: 'Short-answer practice 6: the copied paragraph', p: [
        'Short-answer question 6 describes a friend who pastes a whole paragraph from a website into an assignment and puts a source at the end. You must explain what is wrong and how to fix it. It is worth 3 marks.',
        'Copying a paragraph without quotation marks is plagiarism even if a source is listed. The fix is to paraphrase in your own words and cite the source, or to use quotation marks and cite it.'],
        tip: 'Listing a source at the end is not enough. Words copied exactly need quotation marks.' },
    ],
    {
      mistakes: [
        'Saying the internet and the World Wide Web are exactly the same thing.',
        'Reading the whole address as the domain; the domain is only the main part, such as www.example.com.',
        'Believing that a source listed at the end makes a copied paragraph acceptable.',
        'Trusting the first search result without checking the author, date and purpose.',
      ],
      exercises: [
        { q: 'Short answer: how would you find reliable information about "how Wi-Fi works" and decide whether a page can be trusted?', a: 'Use specific keywords or quotation marks, open several sources, apply CRAAP, check the domain and author, and cross-check the facts.' },
        { q: 'Short answer: a friend pastes a paragraph from a website and lists the source at the end. What is wrong and how do you fix it?', a: 'It is plagiarism because the words are copied without quotation marks. Fix it by paraphrasing in your own words and citing, or by using quotation marks and citing.' },
        { q: 'What do the five letters of CRAAP stand for?', a: 'Currency, relevance, authority, accuracy and purpose.' },
      ],
      quiz: [
        { q: 'Which statement about the internet and the World Wide Web is correct?', options: ['They are exactly the same thing', 'The internet is the global network; the web is a service that runs on it', 'The web is the cables; the internet is websites', 'The web only exists on phones'], answer: 1, why: 'The web is a service on the internet.' },
        { q: 'In the address https://www.example.com/news, what is the domain?', options: ['https', 'www.example.com', '/news', 'https://'], answer: 1, why: 'The domain is www.example.com.' },
        { q: 'Which search tip finds an exact phrase?', options: ['Put the phrase in quotation marks', 'Write it in capitals', 'Add many extra words', 'Use only one word'], answer: 0, why: 'Quotation marks search the exact phrase.' },
        { q: 'In the CRAAP test, what does "Authority" ask?', options: ['How old is the page?', 'Who wrote it and who published it, and are they qualified?', 'Does it have pictures?', 'Is it free?'], answer: 1, why: 'Authority asks about the author and the publisher.' },
        { q: 'Which action is plagiarism?', options: ['Quoting a sentence with quotation marks and citing it', 'Paraphrasing and citing the source', 'Copying a paragraph without credit', 'Listing your references'], answer: 2, why: 'Copying without credit is plagiarism.' },
      ],
    }),

  T('app-final-4', 'Final assessment part 4: security and safety', 'Maswali 16 hadi 20 yanapima nywila, uthibitisho wa hatua mbili, ulaghai, taarifa za siri na kanuni ya 3-2-1.',
    'Answer questions 16 to 20 alone, then write your own answers to short-answer questions 7 and 8 and score them with the guide.',
    [
      { h: 'What this part covers', p: [
        'Questions 16 to 20 test strong passwords, two-step verification, handling scam messages, private information and backups. Revise Chapters 12 to 14 if you miss any.'],
        table: { head: ['Question', 'Topic', 'Key idea'], rows: [
          ['16', 'Strong passwords', 'Long, unrelated words with numbers and symbols.'],
          ['17', 'Two-step verification', 'The second step blocks attackers who have only the password.'],
          ['18', 'Scam message', 'Stop, think, verify.'],
          ['19', 'Private information', 'ID numbers and addresses are private.'],
          ['20', 'Backups', 'Three copies, two kinds of storage, one away.'],
        ] } },
      { h: 'Short-answer practice 7: protecting an account', p: [
        'Short-answer question 7 asks for four ways to protect an online account, each with a reason. It is worth 4 marks.',
        'Any four are accepted, each with a reason: strong unique passwords, a password manager, two-step verification, updates, careful clicking, a screen lock, and backups.'] },
      { h: 'Short-answer practice 8: Stop, Think, Verify', p: [
        'Short-answer question 8 asks you to describe the Stop, Think, Verify habit with an example scam message and how you would respond. It is worth 4 marks.',
        'A good answer says: pause; ask questions about the sender, the urgency and the request; verify using an official route; and report or ignore. Include a relevant example scam message.'],
        tip: 'After finishing, add your marks: multiple choice out of 20, short answers out of 30, total out of 50. Then use the next lesson to read your result.' },
    ],
    {
      mistakes: [
        'Choosing a password made from a common word or a predictable pattern such as P@ssw0rd.',
        'Replying to an urgent message or clicking its link instead of checking on the official website you open yourself.',
        'Posting private details such as an ID number or home address publicly.',
        'Keeping all backups on the same drive as the originals.',
      ],
      exercises: [
        { q: 'Short answer: list four ways to protect an online account and say why each helps.', a: 'For example: a strong unique password (hard to guess), a password manager (remembers many passwords), two-step verification (blocks attackers who have only the password), and updates (fix security holes).' },
        { q: 'Short answer: describe Stop, Think, Verify with an example scam message and your response.', a: 'Pause, question the sender, urgency and request, verify through an official route you open yourself, then report or ignore. Example: an urgent message says your account will close unless you click a link; you go to the official website yourself.' },
        { q: 'Explain the 3-2-1 backup rule.', a: 'Keep three copies of your data, on two kinds of storage, with one copy kept somewhere else.' },
      ],
      quiz: [
        { q: 'Which password is the strongest?', options: ['student2026', 'P@ssw0rd', 'Zebra-Lamp-River-Drum-83!', 'qwerty123'], answer: 2, why: 'It is long, with unrelated words plus numbers and symbols.' },
        { q: 'Why is two-step verification useful?', options: ['It makes the computer faster', 'It stops most attackers who have only your password', 'It removes viruses', 'It saves files'], answer: 1, why: 'The second step blocks attackers with the password alone.' },
        { q: 'You receive an urgent message saying your account will close unless you click a link. What is the best response?', options: ['Click quickly', 'Reply with your password', 'Forward it to everyone', 'Stop, think, and verify through the official website you open yourself'], answer: 3, why: 'Stop, think, verify.' },
        { q: 'Which is an example of private information you should not post publicly?', options: ['A favourite book', 'Your ID number and home address', 'A study tip', 'A photo of a school project'], answer: 1, why: 'ID numbers and addresses are private.' },
        { q: 'What does the 3-2-1 backup rule recommend?', options: ['3 copies, on 2 kinds of storage, with 1 somewhere else', '3 folders, 2 files, 1 drive', '1 copy only', '2 copies in the same drive'], answer: 0, why: 'Three copies, two kinds of storage, one away.' },
      ],
    }),

  T('app-rubric', 'Rubric, score meaning and progress record', 'Tumia rubriki na rekodi ya maendeleo kujipima mwenyewe na kupanga unachohitaji kuboresha.',
    'Score your own work with the rubric, fill in the My scores table on paper, and write one thing you will improve for each skill.',
    [
      { h: 'Reading your final assessment score', p: [
        'Add your multiple-choice marks (out of 20) to your short-answer marks (out of 30). The whole assessment is out of 50 marks. Use the table to see what your score means and what to do next.'],
        table: { head: ['Score out of 50', 'Meaning'], rows: [
          ['43 - 50', 'Excellent. You are ready to move on with confidence.'],
          ['35 - 42', 'Good. Review the questions you missed and practise those labs.'],
          ['25 - 34', 'Satisfactory. Revisit the chapters that were hard and repeat their labs.'],
          ['Below 25', 'More practice is needed. Study each part again slowly, and repeat the labs on your computer.'],
        ] } },
      { h: 'The practical skills rubric', p: [
        'Use this rubric to score your portfolio and practical work, or ask a teacher or friend to score it. Give 1 to 4 points for each of the eight skills, then add the points for a total out of 32.'],
        table: { head: ['Skill', '1: Needs help', '2: Developing', '3: Proficient', '4: Excellent'], rows: [
          ['Folder organisation', 'Files are scattered; no clear structure.', 'Some folders exist, but several files are in the wrong place.', 'Clear folders; most files are in the correct place.', 'Logical, consistent structure; every file easy to find.'],
          ['File naming', 'Unclear or random names.', 'Some names are clear.', 'Most names are clear and consistent.', 'All names are clear, consistent and without problem characters.'],
          ['Document formatting', 'Inconsistent; hard to read.', 'Some consistency; a few errors.', 'Consistent fonts and headings; readable.', 'Professional: styles, page numbers, tidy layout.'],
          ['Content and own words', 'Copied or very unclear.', 'Partly in own words; some errors.', 'Mostly accurate and in own words.', 'Accurate, clear and fully in own words.'],
          ['Research and citation', 'No sources.', 'Sources listed but not evaluated.', 'Sources evaluated and referenced.', 'Strong sources, evaluated well and cited correctly.'],
          ['Digital safety', 'Few safe habits shown.', 'Some safe habits shown.', 'Clear safe habits with explanations.', 'Strong habits explained with examples.'],
          ['Keyboard and efficiency', 'Needs mouse for everything.', 'Uses a few shortcuts.', 'Uses common shortcuts comfortably.', 'Fast and confident; helps others.'],
          ['Backup and saving', 'No backup.', 'One copy saved elsewhere.', 'Backup made and tested.', 'Follows 3-2-1 and has checked backups.'],
        ] } },
      { h: 'What your rubric total means', p: [
        'After scoring all eight skills, add the points. The total is out of 32. The level tells you where you are now, and the lowest-scoring skills show what to practise next.'],
        table: { head: ['Total score (out of 32)', 'Level'], rows: [
          ['28 - 32', 'Excellent'],
          ['22 - 27', 'Proficient'],
          ['15 - 21', 'Developing'],
          ['8 - 14', 'Needs help'],
        ] } },
      { h: 'Your progress record', p: [
        'The learner progress record lists every chapter of the book (1 to 15). For each chapter, tick Read when you have read it and Lab done when you have completed the practical lab. Also write your quiz score, the date, and a note about anything you need to review. Tick each box only when you are happy with your work.',
        'The record also has a space for your own learning goals. Write two or three goals, for example a typing speed you want to reach or a skill you want to use in your studies.'],
        steps: [
          'List the chapters 1 to 15 and tick Read for each one you have finished.',
          'Tick Lab done for each practical lab you completed on your computer.',
          'Write your quiz score and the date, and a short note on what to review.',
          'Write your learning goals.',
          'Do the final skills self-check below and revisit any answer that is Not yet.',
        ] },
      { h: 'Final skills self-check', p: [
        'Finish by answering Yes or Not yet to each statement honestly. Every Not yet tells you which chapter or lab to repeat. Come back to this check again after a few weeks of practice.'],
        table: { head: ['I can...', 'Your answer (Yes / Not yet)'], rows: [
          ['I can explain how a computer processes information', 'Yes / Not yet'],
          ['I can organise my files and keep backups', 'Yes / Not yet'],
          ['I can use Windows with confidence', 'Yes / Not yet'],
          ['I can find and judge reliable information online', 'Yes / Not yet'],
          ['I can protect my accounts and spot scams', 'Yes / Not yet'],
          ['I can behave kindly and wisely online', 'Yes / Not yet'],
          ['I have finished my portfolio', 'Yes / Not yet'],
        ] },
        tip: 'Be honest. A Not yet is useful: it tells you exactly what to practise next.' },
    ],
    {
      mistakes: [
        'Scoring yourself too kindly; ask a teacher or friend to score your work as well.',
        'Adding the rubric points wrongly; there are eight skills, each 1 to 4, so the total is out of 32.',
        'Mixing up the two score scales: the assessment is out of 50 and the rubric is out of 32.',
        'Ticking Lab done without actually doing the lab on your computer.',
      ],
      exercises: [
        { q: 'Your final assessment score is 38 out of 50. What does it mean and what should you do?', a: 'It is Good (35 to 42). Review the questions you missed and practise those labs.' },
        { q: 'You score 3, 2, 4, 3, 3, 4, 2, 3 on the rubric. What is your total and level?', a: 'The total is 24 out of 32, which is Proficient (22 to 27).' },
        { q: 'Which rubric skills would you improve if you scored 2 for them, and how?', a: 'Choose the lowest-scoring skills and write one action for each, for example: create a logical folder structure and rename files with a clear pattern.' },
        { q: 'What do you write in the Notes column of the progress record?', a: 'Anything you need to review, such as a lab you found difficult or a quiz question you missed.' },
      ],
      quiz: [
        { q: 'What is the total possible score on the practical skills rubric?', options: ['20', '32', '50', '100'], answer: 1, why: 'There are eight skills scored 1 to 4, so the total is out of 32.' },
        { q: 'A final assessment score of 30 out of 50 is described as which level?', options: ['Excellent', 'Good', 'Satisfactory', 'More practice is needed'], answer: 2, why: 'A score of 25 to 34 is Satisfactory: revisit the hard chapters and repeat their labs.' },
        { q: 'A rubric total of 22 to 27 means which level?', options: ['Proficient', 'Excellent', 'Developing', 'Needs help'], answer: 0, why: '28 to 32 is Excellent, 22 to 27 is Proficient, 15 to 21 is Developing and 8 to 14 is Needs help.' },
        { q: 'In the rubric, what does a score of 4 for Backup and saving show?', options: ['No backup', 'One copy saved elsewhere', 'Follows 3-2-1 and has checked backups', 'Backup made but not tested'], answer: 2, why: 'Excellent in this skill means following 3-2-1 and having checked the backups.' },
      ],
    }),
];
