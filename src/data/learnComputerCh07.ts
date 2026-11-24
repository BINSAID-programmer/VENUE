import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Digital Foundations, chapter 7: File management in practice. */
export const CB_CH7: LearnLesson[] = [
  T('fm-create', 'Creating folders, saving and renaming', 'Tengeneza folda, hifadhi hati mahali sahihi, na ubadilishe majina kwa F2.',
    'In Documents, create a folder called Practice_Files, make a small document, save it inside that folder, then rename it with F2.',
    [
      { h: 'Three ways to create a folder', p: [
        'A folder keeps related files together. There are several ways to make one, and it is worth knowing the first two well and using the third as a time-saver.',
        'Warning: when you practise copying, moving and deleting, use files you made for the purpose. Never practise with important assignments, family photographs or personal documents.',
      ], steps: [
        'Method 1 (right-click): open File Explorer and go to the place, for example Documents. Right-click an empty area, choose New, then Folder.',
        'Type the name, for example Technology_Notes, and press Enter.',
        'Method 2 (toolbar): in File Explorer click New at the top, then Folder. Type the name and press Enter.',
        'Method 3 (keyboard): open the location and press Ctrl + Shift + N. Type a name and press Enter.',
      ], tip: 'If you clicked away before naming the folder, it is called New folder. Select it, press F2 and type the right name.' },
      { h: 'Creating and saving a document', p: [
        'Saving a document in the right place is the most important file skill you will learn. Many beginners lose work because they never decided where to save it.',
        'Use Microsoft Word if it is available. If not, LibreOffice Writer or Google Docs in a browser is fine. You do not need a paid licence.',
      ], steps: [
        'Open your word processor and choose Blank document.',
        'Type the title My Technology Learning Goals, press Enter, and write five sentences about what you want to learn.',
        'Choose File, then Save As (Ctrl + S on a new document opens the same window). On some versions click Browse first.',
        'Move to Documents, then Digital_Foundations, then 01_Computer_Basics by double-clicking each folder in turn.',
        'In the File name box type My_Learning_Goals and check that Save as type is Word Document (.docx).',
        'Click Save. The title bar now shows the new name.',
        'Close the document, then reopen it from File Explorer to confirm it was saved in the right place.',
      ] },
      { h: 'Save versus Save As', p: [
        'Save keeps your changes in the same file, in the same place, under the same name. Save As lets you choose a new name, location or file type and creates a separate copy.',
        'Warning: always look at where you are saving. Programs often suggest the last folder you used, a cloud folder or Downloads. Read the path at the top of the Save As window before you click Save. If you do not know where a file went, you cannot use it.',
      ], table: { head: ['Command', 'What it does', 'When to use it'], rows: [
        ['Save (Ctrl + S)', 'Saves changes to the same file, place and name', 'Every few minutes while you work'],
        ['Save As', 'Choose a new name, location or type; makes a separate copy', 'The first time you save, or for a second version or a PDF'],
      ] } },
      { h: 'Opening and renaming', p: [
        'To open a file, double-click it in File Explorer. Windows opens it in its associated program. To use another program, right-click, choose Open with and pick one. If a file will not open, check its extension; the right program may not be installed.',
        'To rename, select the file or folder once, press F2 (or right-click and choose Rename), type the new name such as Learning_Goals_Final, and press Enter. Usually only the part before the dot is highlighted; do not delete the extension unless you mean to.',
        'You cannot rename an open file. If Windows says the file is in use, close the program that has it open and try again.',
      ] },
    ],
    {
      mistakes: [
        'Clicking Save without reading the folder path, then not knowing where the file went.',
        'Deleting the extension (such as .docx) while renaming a file.',
        'Practising file operations on important assignments or family photos instead of test files.',
        'Trying to rename a file while it is still open in a program.',
      ],
      exercises: [
        { q: 'Describe how to create a folder and save a document inside it.', a: 'Create the folder with right-click, New, Folder (or Ctrl + Shift + N) and name it. In the program choose File, Save As, open that folder, type a file name, check the type and click Save.' },
        { q: 'What is the difference between Save and Save As?', a: 'Save updates the same file in the same place under the same name. Save As lets you choose a new name, location or type and makes a separate copy.' },
        { q: 'You created a folder and it is called New folder. How do you fix the name?', a: 'Select it, press F2, type the right name and press Enter.' },
      ],
      quiz: [
        { q: 'Which shortcut creates a new folder in File Explorer?', options: ['Ctrl + N', 'Ctrl + Shift + N', 'Ctrl + F', 'Alt + F4'], answer: 1, why: 'Ctrl + Shift + N creates a new folder in the current location.' },
        { q: 'Which key renames a selected file?', options: ['F1', 'F5', 'F2', 'F12'], answer: 2, why: 'F2 makes the name editable.' },
        { q: 'What should you do before clicking Save in the Save As window?', options: ['Close File Explorer', 'Read the path at the top to see where it will be saved', 'Turn off the computer', 'Delete the extension'], answer: 1, why: 'Programs may suggest Downloads or a cloud folder, so always check the path.' },
        { q: 'When is Save As most useful?', options: ['Every few seconds', 'The first time you save or when you want a separate copy or PDF', 'Only when closing Windows', 'Never'], answer: 1, why: 'Save As creates a new file with a chosen name, place or type.' },
        { q: 'Windows says a file is in use when you rename it. What now?', options: ['Restart Windows', 'Close the program that has it open and try again', 'Delete it', 'Ignore it'], answer: 1, why: 'An open file cannot be renamed.' },
      ],
    }),

  T('fm-copymove', 'Copying and moving files', 'Nakili huacha asili mahali pake; kuhamisha huitoa asili na kuiweka mahali papya.',
    'Create a test file, copy it into another folder and check the original is still there. Then move it and check it is gone from the first folder.',
    [
      { h: 'Copy versus move', p: [
        'Copying and moving are the two most common file operations, and they are easy to confuse. Copy leaves the original in place and makes a second version in the destination. Move takes the file out of the original location and puts it in the destination.',
        'When you press Ctrl + C or Ctrl + X, Windows remembers your choice in the clipboard, a temporary place where copied or cut items wait until they are pasted. That is why nothing seems to happen at first.',
      ], fig: 'fm-copymove', table: { head: ['Operation', 'Shortcut', 'Result'], rows: [
        ['Copy', 'Ctrl + C, then Ctrl + V', 'A second version appears in the destination; the original stays'],
        ['Move', 'Ctrl + X, then Ctrl + V', 'The file leaves the original location and appears in the destination'],
      ] } },
      { h: 'Step by step', p: [
        'Always check the result. After copying, go back and confirm the original is still there. After moving, confirm it has gone from the old folder.',
      ], steps: [
        'Copy: select the file with one click and press Ctrl + C.',
        'Open the destination folder, for example 05_Portfolio, and press Ctrl + V. A copy appears.',
        'Go back to the original folder and check that the original is still there.',
        'Move: select the file and press Ctrl + X. The icon may become faint.',
        'Open the destination folder and press Ctrl + V. The file appears here and disappears from the old folder.',
      ], tip: 'If you move, rename or delete the wrong file, press Ctrl + Z straight away. It undoes the last file operation in File Explorer.' },
      { h: 'Using the mouse and selecting many files', p: [
        'With the mouse, drag and drop a file onto a folder on the same drive to move it. Hold Ctrl while dragging to copy it instead. Dragging to a different drive, such as a USB flash drive, copies by default.',
        'To work with many files at once, press Ctrl + A to select all. To select neighbours, click the first, hold Shift and click the last. To select files that are not next to each other, hold Ctrl and click each one. Then copy, move or delete them all in one action.',
      ] },
    ],
    {
      mistakes: [
        'Using Cut and Paste when you wanted a backup copy, so only one copy exists.',
        'Forgetting to check that the file really arrived in the destination.',
        'Dragging a file to another drive and expecting it to move; it is copied by default.',
        'Practising on important files instead of test files.',
      ],
      exercises: [
        { q: 'Explain the difference between copying and moving a file, with the shortcut for each.', a: 'Copy (Ctrl + C then Ctrl + V) leaves the original and makes a second version. Move (Ctrl + X then Ctrl + V) removes it from the old place and puts it in the new one.' },
        { q: 'How do you select five files that are not next to each other?', a: 'Click the first, hold Ctrl and click each of the others.' },
        { q: 'You moved the wrong file. What is the fastest fix?', a: 'Press Ctrl + Z immediately to undo the last file operation.' },
      ],
      quiz: [
        { q: 'Which pair of shortcuts moves a file?', options: ['Ctrl + C, Ctrl + V', 'Ctrl + X, Ctrl + V', 'Ctrl + Z, Ctrl + Y', 'Ctrl + A, Ctrl + S'], answer: 1, why: 'Cut (Ctrl + X) then paste (Ctrl + V) moves a file.' },
        { q: 'After copying a file, what is true?', options: ['The original is deleted', 'Both the original and the copy exist', 'Only the copy exists', 'The file turns into a ZIP'], answer: 1, why: 'Copy leaves the original in place.' },
        { q: 'What does holding Ctrl while dragging a file onto a folder do?', options: ['Deletes it', 'Copies it', 'Renames it', 'Locks it'], answer: 1, why: 'Ctrl + drag copies instead of moving.' },
        { q: 'What is the clipboard?', options: ['A temporary place holding copied or cut items', 'A folder on the desktop', 'A kind of USB drive', 'A virus scanner'], answer: 0, why: 'Items wait in the clipboard until you paste.' },
        { q: 'Which keys select all files in a folder?', options: ['Ctrl + S', 'Ctrl + A', 'Ctrl + P', 'Ctrl + T'], answer: 1, why: 'Ctrl + A selects everything in the current folder.' },
      ],
    }),

  T('fm-delete-find', 'Deleting, restoring and finding files', 'Faili zilizofutwa kwa kawaida huenda Recycle Bin ambako zinaweza kurudishwa; tafuta faili kwa utaratibu.',
    'Create a file called Test_Delete, delete it, restore it from the Recycle Bin, then find it with the search box.',
    [
      { h: 'The Recycle Bin', p: [
        'When you delete a file in the normal way, Windows usually does not erase it at once. It moves the file to the Recycle Bin, where it can be restored. This safety net has saved many assignments.',
        'Warning: not everything goes to the Recycle Bin. Files deleted from a USB drive or an external drive, and files deleted with Shift + Delete, are usually removed permanently. Emptying the Recycle Bin also removes its contents for good.',
      ], fig: 'fm-recycle', steps: [
        'Create a harmless test file, for example a text document called Test_Delete.',
        'Select it and press Delete. Confirm if Windows asks.',
        'Open the Recycle Bin on the desktop (or type Recycle Bin in the Start menu).',
        'Find your test file, right-click it and choose Restore.',
        'Go back to the original folder and check that the file has returned.',
      ] },
      { h: 'Finding a lost file', p: [
        'Everyone loses a file sometimes. Instead of panicking, use a calm, systematic search.',
      ], steps: [
        'Open File Explorer. In the navigation pane click the largest likely location, such as This PC or Documents.',
        'Click the search box at the top right and type part of the file name, for example goals. Press Enter.',
        'Wait for results; large searches take a little time. Windows searches all subfolders.',
        'Click Date modified or Type in the column headings to sort the results.',
        'When you find the file, right-click it and choose Open file location, then move it to the right place.',
      ] },
      { h: 'Searching for a kind of file', p: [
        'You can narrow a search by typing special words into the search box. The star in *.docx means anything, so it finds every file ending in .docx.',
        'If you still cannot find the file, check the Recycle Bin, the Downloads folder and any cloud folders such as OneDrive. Think about where the program usually saves and when you last used the file.',
      ], table: { head: ['Type this', 'To find'], rows: [
        ['*.docx', 'All Word documents'],
        ['*.pdf', 'All PDF files'],
        ['kind:=picture', 'All pictures'],
        ['datemodified:today', 'Files changed today'],
        ['size:>10MB', 'Files larger than 10 megabytes (useful for clearing space)'],
      ] } },
    ],
    {
      mistakes: [
        'Assuming files deleted from a USB drive can be restored from the Recycle Bin.',
        'Using Shift + Delete casually; it usually deletes permanently.',
        'Emptying the Recycle Bin without checking what is inside.',
        'Panicking and saving the file again instead of searching systematically.',
      ],
      exercises: [
        { q: 'How can you recover a file you deleted by mistake? When might that not be possible?', a: 'Open the Recycle Bin, right-click the file and choose Restore. It may not be possible for files deleted from a USB or external drive, deleted with Shift + Delete, or after the Recycle Bin was emptied.' },
        { q: 'Describe your method for finding a lost file.', a: 'Open File Explorer, choose a broad location such as This PC, type part of the name in the search box, sort by date or type, then use Open file location. If not found, check the Recycle Bin, Downloads and cloud folders.' },
        { q: 'What would you type in the search box to find every PDF?', a: 'Type *.pdf.' },
      ],
      quiz: [
        { q: 'Where does a normally deleted file on your laptop go?', options: ['Straight into space', 'The Recycle Bin', 'The Start menu', 'The clipboard'], answer: 1, why: 'Windows usually moves it to the Recycle Bin first.' },
        { q: 'Which deleted files are usually gone permanently?', options: ['Files on the Desktop', 'Files deleted from a USB drive or with Shift + Delete', 'Word documents', 'Pictures'], answer: 1, why: 'These skip the Recycle Bin.' },
        { q: 'What does *.docx find?', options: ['All Word documents', 'All pictures', 'Files changed today', 'Files over 10 MB'], answer: 0, why: 'The star means anything, so it matches any name ending in .docx.' },
        { q: 'Which search finds files larger than 10 megabytes?', options: ['kind:=picture', 'datemodified:today', 'size:>10MB', '*.pdf'], answer: 2, why: 'size:>10MB filters by size, useful for clearing space.' },
        { q: 'After finding a file in search, how do you see which folder it is in?', options: ['Right-click, Open file location', 'Press F5', 'Press Ctrl + Z', 'Shut down'], answer: 0, why: 'Open file location opens the folder that holds the file.' },
      ],
    }),

  T('fm-zip-tidy', 'ZIP files and keeping organised', 'ZIP hufunga faili nyingi kuwa moja; weka Downloads safi kwa utaratibu wa kila wiki.',
    'Compress your Practice_Files folder into a ZIP, extract it into a new folder, then do a ten-minute clean-up of Downloads.',
    [
      { h: 'ZIP files', p: [
        'A ZIP file packs one or more files into a single smaller file. ZIP files are useful for emailing many files together and for downloading course materials.',
        'Warning: be careful with ZIP files from unknown senders. They can hide harmful programs. Extract only archives that you expected from a source you trust.',
      ], steps: [
        'To create: select the files or folder you want to pack (Ctrl + A for all).',
        'Right-click the selection and choose Compress to ZIP file.',
        'Type a name for the ZIP file and press Enter.',
        'To extract: right-click the ZIP file and choose Extract All.',
        'Choose a folder for the files and click Extract.',
        'Open the new folder to see the files. Do not work inside the ZIP window itself; extract first.',
      ] },
      { h: 'Why organisation matters', p: [
        'A tidy computer is not a luxury; it is a time-saving tool. The most common problem is a crowded Downloads folder, because everything lands there by default.',
        'The fix is a habit, not a big project. Spend ten minutes each week sorting new files into named folders so that you always know where your work is.',
      ], fig: 'fm-downloads' },
      { h: 'A weekly ten-minute clean-up', p: [
        'Follow the same short routine every week. After a few weeks it feels automatic and the Downloads folder stays small.',
      ], steps: [
        'Open Downloads and sort by Date modified.',
        'Move files you want to keep into the right folder in Digital_Foundations or your other main folders.',
        'Rename files that have unclear names such as document (2).pdf.',
        'Delete installers and duplicates you no longer need.',
        'Empty the Recycle Bin only when you are sure.',
        'Check that new work is saved in a named folder, not on the Desktop.',
      ] },
    ],
    {
      mistakes: [
        'Working inside a ZIP window instead of extracting it first.',
        'Extracting a ZIP file from a stranger without thinking.',
        'Leaving everything in Downloads or on the Desktop.',
        'Keeping files named document (2).pdf so nobody knows what they are.',
      ],
      exercises: [
        { q: 'What is a ZIP file and when is it useful?', a: 'A ZIP file is a compressed archive that packs files together. It is useful for emailing many files at once and for downloading course materials.' },
        { q: 'Why is the Downloads folder easily cluttered, and how can you keep it tidy?', a: 'Everything downloaded lands there by default. Keep it tidy with a weekly clean-up: sort by date, move keepers to named folders, rename unclear files and delete installers and duplicates.' },
        { q: 'Write the steps to extract a ZIP file.', a: 'Right-click the ZIP, choose Extract All, pick a destination folder, click Extract, then open the new folder.' },
      ],
      quiz: [
        { q: 'What does a ZIP file do?', options: ['Packs files into one compressed file', 'Deletes files', 'Speeds up the screen', 'Connects to Wi-Fi'], answer: 0, why: 'A ZIP is a compressed archive.' },
        { q: 'You receive an unexpected ZIP from an unknown sender. What is wise?', options: ['Extract it at once', 'Do not extract it unless you trust the source', 'Forward it to friends', 'Rename it'], answer: 1, why: 'ZIP files can hide harmful programs.' },
        { q: 'Which menu choice creates a ZIP in Windows?', options: ['Compress to ZIP file', 'Restore', 'Open with', 'Properties only'], answer: 0, why: 'Right-click the selection and choose Compress to ZIP file.' },
        { q: 'Why is Downloads usually messy?', options: ['It is broken', 'Downloaded files land there by default', 'Windows hides it', 'It only holds pictures'], answer: 1, why: 'Without sorting, files pile up.' },
        { q: 'Which is part of the weekly clean-up?', options: ['Delete the operating system', 'Delete installers and duplicates you no longer need', 'Rename the C drive', 'Unplug the keyboard'], answer: 1, why: 'Removing installers and duplicates keeps Downloads small.' },
      ],
    }),

  T('fm-backup', 'Backups and the file-management challenge', 'Nakala rudufu ya faili muhimu (3-2-1) hukuokoa kompyuta ikipotea au kuharibika.',
    'Copy your Digital_Foundations folder to a USB drive, open a few files from the drive to check them, then eject it safely.',
    [
      { h: 'Why back up?', p: [
        'Computers fail. Laptops are lost, stolen, dropped or infected, and storage drives wear out. A backup is a separate copy of important files kept so that you can recover them if the original is lost or damaged.',
        'Many people learn about backups only after losing something precious. You can learn now.',
      ] },
      { h: 'The 3-2-1 rule', p: [
        'A simple rule to remember is 3-2-1: keep three copies of important data, on two different kinds of storage, with one copy stored somewhere else (off-site or in the cloud).',
        'For example: the original on your laptop, a second copy on a USB drive, and a third copy in cloud storage.',
      ], fig: 'fm-321' },
      { h: 'Manual backup to a USB drive', p: [
        'A manual backup is simple and works without internet. Repeat it every week, or after finishing important work.',
      ], steps: [
        'Plug in the USB drive and wait for it to appear in File Explorer.',
        'In Documents, right-click your Digital_Foundations folder and choose Copy.',
        'Open the USB drive, click an empty area and press Ctrl + V.',
        'Wait until the copy finishes. Open the folder on the drive and check a few files.',
        'Eject the drive safely and store it in a safe place away from the laptop.',
        'Repeat every week, or after finishing important work.',
      ] },
      { h: 'Cloud backup', p: [
        'Cloud storage services such as OneDrive and Google Drive keep copies of your files on servers on the internet. They are convenient because you can reach your files from any device, and they protect you if your laptop is lost.',
        'But the cloud is only as safe as your account, so protect it with a strong password and multi-factor authentication (Chapter 12).',
      ] },
      { h: 'Practical lab: the file-management challenge', p: [
        'Goal: put every file skill together without step-by-step help. You have succeeded when every task is done without looking at the steps and you can explain the difference between copy and move.',
      ], steps: [
        'Open File Explorer using a keyboard shortcut.',
        'Inside 01_Computer_Basics create a folder named Practice_Files.',
        'Create a harmless text document named Sample_Notes, write three sentences about what you have learned so far, save and close it.',
        'Rename it to Study_Notes_Final.',
        'Copy it into 05_Portfolio. Return to Practice_Files and confirm the original still exists.',
        'Create another test file, delete it and restore it from the Recycle Bin.',
        'Use the search box to find Study_Notes_Final and open its location.',
        'Compress Practice_Files into a ZIP file, then extract it into a new folder.',
        'Explain aloud, to a friend or yourself, how you completed each task.',
      ] },
    ],
    {
      mistakes: [
        'Keeping only one copy of important work, with no backup at all.',
        'Keeping the USB backup in the same bag as the laptop, so one theft loses both.',
        'Backing up once and never repeating it.',
        'Trusting cloud storage with a weak password and no multi-factor authentication.',
      ],
      exercises: [
        { q: 'Explain the 3-2-1 backup rule.', a: 'Keep three copies of important data, on two different kinds of storage, with one copy stored somewhere else such as off-site or in the cloud.' },
        { q: 'Why back up important files?', a: 'So you can recover them if the originals are lost, stolen, damaged or if the drive fails.' },
        { q: 'Name one advantage and one risk of cloud backup.', a: 'Advantage: you can reach files from any device and are protected if the laptop is lost. Risk: it is only as safe as your account, so you need a strong password and multi-factor authentication.' },
      ],
      quiz: [
        { q: 'What is a backup?', options: ['A separate copy of important files for recovery', 'A faster keyboard', 'A kind of virus', 'A folder name'], answer: 0, why: 'A backup lets you recover files if the original is lost or damaged.' },
        { q: 'In 3-2-1, what does the 2 stand for?', options: ['Two folders', 'Two different kinds of storage', 'Two passwords', 'Two laptops'], answer: 1, why: 'Three copies, on two kinds of storage, one off-site.' },
        { q: 'Where should the 1 off-site copy be?', options: ['On the same desk', 'Somewhere else, such as the cloud or another place', 'In the Recycle Bin', 'On the Desktop'], answer: 1, why: 'The off-site copy survives if the laptop is lost or stolen.' },
        { q: 'After copying files to a USB drive, what should you do?', options: ['Pull it out at once', 'Check a few files, then eject it safely', 'Format it', 'Delete the originals'], answer: 1, why: 'Checking confirms the backup works; safe ejecting avoids damage.' },
        { q: 'How can you protect a cloud account?', options: ['Strong password and multi-factor authentication', 'Share the password', 'Use 1234', 'Turn off the screen'], answer: 0, why: 'The cloud is only as safe as your account.' },
      ],
    }),
];
