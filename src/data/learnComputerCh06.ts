import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 6: Files, folders and File Explorer (from Digital Foundations by Binsaid). */
export const CB_CH6: LearnLesson[] = [
  T('fl-files', 'What is a file? Names and extensions', 'Faili ni mkusanyiko wenye jina wa taarifa uliohifadhiwa; kiendelezi (extension) baada ya nukta ya mwisho kinaonyesha aina ya faili.',
    'Look at five files on your computer or phone. For each, write the extension and say what kind of file it is.',
    [
      { h: 'A file is stored information with a name', p: [
        'A file is a named collection of information stored on a computer or another storage device. A file may contain text, numbers, a photograph, audio, video or the instructions of a program. Your essay is a file. A photo from your phone is a file. A song, a PDF of lecture notes and a spreadsheet of marks are all files.',
        'Every file has properties that Windows records automatically: its name, its type, its size, the date it was created and the date it was last changed, and its location. You will use these every time you search for or organise files.'] },
      { h: 'File names and extensions', p: [
        'Many file names end in a dot followed by a few letters. This ending is the file extension. It tells Windows and your programs what kind of file it is and which program should open it.'],
        fig: 'fl-filename',
        table: { head: ['Extension', 'Type', 'Example'], rows: [
          ['.docx', 'Word document', 'My_Assignment.docx'],
          ['.xlsx', 'Excel workbook (spreadsheet)', 'Student_Marks.xlsx'],
          ['.pptx', 'PowerPoint presentation', 'Computer_Basics.pptx'],
          ['.pdf', 'PDF document (fixed layout)', 'Lecture_Notes.pdf'],
          ['.jpg / .png', 'Image', 'Diagram.png'],
          ['.mp3', 'Audio', 'Recorded_Lesson.mp3'],
          ['.mp4', 'Video', 'Tutorial.mp4'],
          ['.txt', 'Plain text', 'Study_Notes.txt'],
          ['.zip', 'Compressed archive (several files packed together)', 'Course_Materials.zip'],
          ['.exe', 'Program (an application you can run)', 'setup.exe'],
        ] } },
      { h: 'Changing a name is not changing a type', p: [
        'Warning: renaming Notes.docx to Notes.pdf does not turn a Word document into a PDF. It only confuses Windows, and the file may no longer open. Do not delete or change the extension unless you understand why.',
        'To change the type properly, open the file and use Save As or Export.'] },
      { h: 'Show file extensions in File Explorer', p: [
        'By default, Windows may hide the extensions of common file types. Showing them helps you avoid mistakes and spot suspicious files, such as a program pretending to be a picture (for example photo.jpg.exe).'],
        steps: [
          'Open File Explorer by pressing Windows + E.',
          'In the top menu bar, click View.',
          'Move to Show (on Windows 11, click Show near the end of the menu).',
          'Tick File name extensions.',
          'Look at any file in the window. You should now see its extension, such as .docx.',
        ],
        tip: 'On older Windows versions the View tab has a tick-box called File name extensions on the ribbon itself. If you cannot find it, search the web for "show file extensions Windows" and check Microsoft\'s own support page.' },
    ],
    {
      mistakes: [
        'Renaming Notes.docx to Notes.pdf and expecting it to become a PDF. Use Save As or Export instead.',
        'Deleting the extension while renaming a file, so it no longer opens properly.',
        'Leaving extensions hidden, so a file such as photo.jpg.exe looks like a picture.',
        'Thinking a file name and file type are the same thing. The extension shows the type.',
      ],
      exercises: [
        { q: 'What is a file? Give two examples of different kinds.', a: 'A file is a named collection of stored information. Examples: an essay (.docx) and a photograph (.jpg).' },
        { q: 'What does a file extension tell us? Give four examples.', a: 'It tells Windows and programs what kind of file it is and which program should open it. Examples: .docx, .pdf, .mp3, .xlsx.' },
        { q: 'Why might changing .docx to .pdf in the name not work?', a: 'Changing the name does not change the content. The file is still a Word document, so Windows may be confused and the file may not open. Use Save As or Export to convert it.' },
        { q: 'Describe how to show file extensions.', a: 'Open File Explorer (Windows + E), click View, go to Show and tick File name extensions.' },
      ],
      quiz: [
        { q: 'Which extension is commonly used for PDF documents?', options: ['.mp3', '.xlsx', '.jpg', '.pdf'], answer: 3, why: 'PDF documents end in .pdf.' },
        { q: 'Which extension usually means an Excel spreadsheet?', options: ['.xlsx', '.docx', '.pptx', '.txt'], answer: 0, why: '.xlsx is the Excel workbook type.' },
        { q: 'What is the correct way to turn a Word document into a PDF?', options: ['Rename the extension to .pdf', 'Delete the extension', 'Open it and use Save As or Export', 'Change the file size'], answer: 2, why: 'Renaming does not convert a file; Save As or Export does.' },
        { q: 'Why is it useful to show file extensions?', options: ['It makes the computer faster', 'It helps you avoid mistakes and spot suspicious files', 'It frees storage', 'It changes file types'], answer: 1, why: 'Visible extensions help you notice things such as photo.jpg.exe.' },
        { q: 'Which keys open File Explorer?', options: ['Windows + E', 'Windows + L', 'Ctrl + P', 'Alt + F4'], answer: 0, why: 'Windows + E opens File Explorer.' },
      ],
    }),

  T('fl-folders', 'Folders and a good folder structure', 'Folda ni chombo cha kupangia mafaili na folda nyingine; muundo mzuri wa folda hurahisisha kutafuta kazi na kuhifadhi nakala.',
    'On paper, sketch a folder structure for your courses and projects with five or six main folders, using numbers to set the order.',
    [
      { h: 'What is a folder?', p: [
        'A folder is a container used to organise files and other folders. Think of a cupboard with drawers. You would not throw every piece of paper into one drawer; you would use separate drawers for school, family and bills. Folders let you do the same with digital files.',
        'A folder inside another folder is called a subfolder. Folders can be nested many levels deep. A good structure makes your work easier to find, keeps unrelated material apart, and makes backups simple.'],
        fig: 'fl-tree' },
      { h: 'Principles of a good folder structure', p: [
        'The six principles below keep your computer tidy. They are simple, but most students who lose files broke at least one of them.'],
        table: { head: ['Principle', 'Why / example'], rows: [
          ['Start with a few main folders', 'Five or six on day one, such as courses, projects, portfolio. Not thirty.'],
          ['Use numbers to control order', 'Folders sort alphabetically; 01_, 02_, 03_ keep your order.'],
          ['Keep names short and clear', '03_Research is clear; "stuff for later maybe" is not.'],
          ['Do not nest too deeply', 'Three or four levels are usually enough. Six clicks to reach a file is too many.'],
          ['Put similar things together', 'Everything about one subject or project lives in one place.'],
          ['Do not store important work on the Desktop', 'It is easy to clutter and not the best place for work you want to keep.'],
        ] } },
      { h: 'Lab: build your Digital Foundations folder structure', p: [
        'Create a clear structure for the work you will do in this course. You have succeeded when you can open Digital_Foundations from Documents, see all five subfolders in order, and read the path aloud.'],
        steps: [
          'Press Windows + E to open File Explorer.',
          'Click Documents in the navigation pane.',
          'Right-click on an empty area of the file list, choose New, then Folder.',
          'Type Digital_Foundations as the name and press Enter.',
          'Double-click the new folder to open it.',
          'Create five subfolders in the same way: 01_Computer_Basics, 02_Windows_Practice, 03_Research, 04_Safety_Notes and 05_Portfolio.',
          'Click in the address bar and write down the full path of 05_Portfolio in your notebook.',
          'Turn on File name extensions using the steps from the previous lesson.',
        ] },
    ],
    {
      mistakes: [
        'Creating thirty folders on day one. Start with five or six.',
        'Nesting folders six or seven levels deep so files are hard to reach.',
        'Keeping important work on the Desktop where it gets cluttered.',
        'Using vague folder names such as "stuff" or "new folder 2".',
      ],
      exercises: [
        { q: 'What is the difference between a file and a folder?', a: 'A file is a named collection of stored information. A folder is a container that organises files and other folders.' },
        { q: 'Why add numbers like 01_ and 02_ to folder names?', a: 'Folders appear in alphabetical order, so numbers keep them in the order you want.' },
        { q: 'Give three rules for a good folder structure.', a: 'For example: start with a few main folders, keep names short and clear, and do not nest too deeply (three or four levels is usually enough).' },
      ],
      quiz: [
        { q: 'A folder is used to...', options: ['Increase screen brightness', 'Replace RAM', 'Connect to Wi-Fi', 'Organise files and folders'], answer: 3, why: 'A folder is a container for files and other folders.' },
        { q: 'What is a folder inside another folder called?', options: ['A subfolder', 'A shortcut', 'An extension', 'A drive'], answer: 0, why: 'A nested folder is a subfolder.' },
        { q: 'Why use 01_, 02_, 03_ at the start of folder names?', options: ['To make files smaller', 'To control the order they appear in', 'To hide the folders', 'To change the file type'], answer: 1, why: 'Folders sort alphabetically; numbers set your own order.' },
        { q: 'How many levels of folders are usually enough?', options: ['One', 'Three or four', 'Ten', 'As many as possible'], answer: 1, why: 'Too many levels make files hard to reach.' },
        { q: 'Where should you avoid storing important work?', options: ['Documents', 'The Desktop', 'A subfolder of Documents', 'A named project folder'], answer: 1, why: 'The desktop is easy to clutter and is not the best place for work you want to keep.' },
      ],
    }),

  T('fl-explorer', 'Meet File Explorer', 'File Explorer ni programu ya Windows ya kuona na kusimamia mafaili, folda na hifadhi; inafunguliwa kwa Windows + E.',
    'Open File Explorer, go to Documents, switch to Details view and sort the files by Date modified so the newest is first.',
    [
      { h: 'What File Explorer does', p: [
        'File Explorer is the Windows application used to view and manage files, folders and storage locations. It helps you find documents, organise learning materials, copy files, rename items and manage USB drives.',
        'Open it by pressing Windows + E. You can also click the yellow folder icon on the taskbar or search for it in the Start menu.'] },
      { h: 'The parts of the window', p: [
        'Learn the names of the parts so that guides and teachers are easy to follow.'],
        table: { head: ['Part', 'Purpose'], rows: [
          ['Navigation pane', 'On the left. Shortcuts to Home, Desktop, Documents, Downloads, Pictures and This PC.'],
          ['Address bar', 'At the top. Shows the current folder location; click a name to jump to a higher folder.'],
          ['Search box', 'At the top right. Searches the current folder and its subfolders.'],
          ['Command bar or toolbar', 'Actions such as New, Copy, Rename and Delete. Wording varies by Windows version.'],
          ['File list', 'The large area listing the files and folders in the selected location.'],
          ['View options', 'Change how files are shown, for example large icons or a detailed list.'],
          ['Status bar', 'At the bottom. Shows how many items are in the folder and how many are selected.'],
        ] } },
      { h: 'Explore your computer', p: [
        'Try this tour. Notice how the address bar changes as you move.'],
        steps: [
          'Press Windows + E to open File Explorer.',
          'In the navigation pane, click Documents. Notice the list of files and folders and the path in the address bar.',
          'Double-click any folder to open it. The address bar changes to show where you are.',
          'Click the back arrow at the top left to go back, and the up arrow to go to the parent folder.',
          'Click View, then Details. You can now see each file\'s date modified, type and size.',
          'Click the heading Date modified to sort with the newest first. Click it again to reverse the order.',
          'Click Downloads in the navigation pane to see files you have downloaded.',
        ] },
      { h: 'Drives and common locations', p: [
        'A drive is a storage location recognised by the operating system. The main internal storage usually appears as Local Disk (C:). A USB flash drive or external drive appears with another letter, such as D: or E:. The letter can vary from one computer to another.'],
        table: { head: ['Location', 'Typical purpose'], rows: [
          ['Desktop', 'Items placed on the visible desktop'],
          ['Documents', 'Your personal documents; the best place to keep your work'],
          ['Downloads', 'Files downloaded from the internet or received through applications'],
          ['Pictures', 'Photographs and image files'],
          ['This PC', 'A view of the available drives and common folders'],
          ['Recycle Bin', 'Temporarily holds many deleted files until restored or permanently removed'],
        ] } },
      { h: 'Using a USB flash drive safely', p: [
        'Warning: pulling out a drive too early can corrupt files, because Windows may still be writing data. Always eject first. And never keep the only copy of important work on a USB flash drive, because they are easily lost.'],
        steps: [
          'Plug the flash drive into a USB port. Do not force it; USB plugs fit only one way.',
          'Open File Explorer. Under This PC, the drive appears with a letter, for example USB Drive (E:).',
          'Double-click it to see its contents. Copy files to or from it as with any folder.',
          'When you finish, click the "Safely remove hardware" icon in the notification area (you may need to click the ^ arrow), choose your drive, and wait for the message that it is safe to remove. Or right-click the drive in File Explorer and choose Eject.',
          'Unplug the drive.',
        ] },
    ],
    {
      mistakes: [
        'Pulling out a USB drive without ejecting it, which can corrupt files.',
        'Keeping the only copy of important work on a flash drive.',
        'Assuming the flash drive is always E:. The drive letter can vary between computers.',
        'Saving files in Downloads and then forgetting to move them to a proper folder.',
      ],
      exercises: [
        { q: 'Name five parts of a File Explorer window and their purposes.', a: 'Navigation pane (shortcuts to locations), address bar (current location), search box (searches the folder), command bar (actions like Copy and Rename), file list (shows files and folders). Status bar and view options are also correct.' },
        { q: 'What does Local Disk (C:) usually mean?', a: 'It is the main internal storage drive. A USB or external drive gets another letter such as D: or E:.' },
        { q: 'Why should you eject a USB drive before removing it?', a: 'Windows may still be writing data, and removing the drive too early can corrupt files.' },
      ],
      quiz: [
        { q: 'Which shortcut opens File Explorer on most Windows systems?', options: ['Ctrl + P', 'Alt + F4', 'Ctrl + Z', 'Windows + E'], answer: 3, why: 'Windows + E opens File Explorer.' },
        { q: 'Which part of File Explorer shows the current folder location?', options: ['Address bar', 'Status bar', 'Search box', 'Recycle Bin'], answer: 0, why: 'The address bar at the top shows where you are.' },
        { q: 'Where does a USB flash drive appear in File Explorer?', options: ['Under Pictures', 'Under This PC with a drive letter', 'Only on the desktop', 'In the Recycle Bin'], answer: 1, why: 'Drives appear under This PC, for example USB Drive (E:).' },
        { q: 'What is the best place to keep your personal documents?', options: ['Desktop', 'Recycle Bin', 'Documents', 'Status bar'], answer: 2, why: 'Documents is the best place to keep your work.' },
        { q: 'What does the status bar show?', options: ['Number of items and how many are selected', 'The Wi-Fi password', 'The drive letter of the Recycle Bin', 'Deleted files'], answer: 0, why: 'It says how many items are in the folder and how many you selected.' },
      ],
    }),

  T('fl-paths', 'File paths and good file names', 'Njia ya faili (path) inaonyesha mahali faili lilipo kupitia folda moja baada ya nyingine; majina mazuri ya faili yanaeleza yaliyomo na hayatumii herufi zilizokatazwa.',
    'Write the full path of one document on your computer, then give it a better name using the rules in this lesson.',
    [
      { h: 'Reading a file path', p: [
        'A file path describes the location of a file or folder. It lists the route through the folders that you would follow to reach it. On Windows the names are separated by backslashes (\\).',
        'Read a path from left to right, like directions. Each part is a folder inside the previous one, and the last part is the file itself.'],
        fig: 'fl-path' },
      { h: 'A worked example', p: [
        'Consider this path: C:\\Users\\Neema\\Documents\\Digital_Foundations\\01_Computer_Basics\\My_Learning_Goals.docx.',
        'C: is the main drive. Users is the folder where Windows keeps all accounts. Neema is the user\'s own folder. Documents is a folder inside Neema\'s folder. Digital_Foundations is a folder you created inside Documents. 01_Computer_Basics is a subfolder inside that, and My_Learning_Goals.docx is the file itself.',
        'You can write a shorter path starting from a known place, for example Documents\\Digital_Foundations\\01_Computer_Basics\\My_Learning_Goals.docx. Both describe the same file.'] },
      { h: 'See or copy a path', p: [
        'File Explorer can show a path as text, which you can paste into a document to check.'],
        steps: [
          'In File Explorer, open the folder that contains the file.',
          'Click once in the address bar. The full path of the folder appears as text. Copy it with Ctrl + C.',
          'To copy the path of a file, click the file once to select it and press Ctrl + Shift + C. Paste it into a document with Ctrl + V to check.',
        ] },
      { h: 'Choosing good file names', p: [
        'A good file name tells you what is inside before you open it. Imagine searching for one document among five hundred; the right name can save you many minutes.'],
        table: { head: ['Rule', 'Example'], rows: [
          ['Be descriptive', 'Computer_Basics_Summary.docx, not doc1.docx'],
          ['Use underscores or hyphens instead of spaces', 'My_Learning_Goals'],
          ['Avoid characters Windows does not allow', '\\ / : * ? " < > |'],
          ['Put the date first when order matters (year-month-day)', '2026-11-18_Notes.docx'],
          ['Add a version number to drafts', 'Report_v1, Report_v2, Report_Final'],
          ['Be consistent', 'Choose one style and stay with it'],
        ] },
        tip: 'Avoid names like newnewfinal2reallyfinal. A version number is clearer.' },
      { h: 'File properties and a path lab', p: [
        'To see details about a file, right-click it and choose Properties (or select it and press Alt + Enter). The window shows the file\'s type, the program that opens it, its location, size and the dates it was created and modified. This is a quick way to find out how big a file is before you send it by email.',
        'Now practise. Write the path from Documents to a file called Computer_Terms.docx stored in 01_Computer_Basics. A friend says her file is in D:\\Lectures\\Maths\\Week3.pdf: which drive is it on? Answer check: Documents\\Digital_Foundations\\01_Computer_Basics\\Computer_Terms.docx; D: is another drive, often a flash drive or a second partition.'] },
    ],
    {
      mistakes: [
        'Using names like doc1 or newnewfinal2reallyfinal that say nothing about the content.',
        'Using forbidden characters such as ? or : in a file name. Windows does not allow them.',
        'Confusing the slash direction. Windows paths use backslashes (\\).',
        'Naming files with the date in day-month-year order and then wondering why they do not sort by creation order.',
      ],
      exercises: [
        { q: 'Explain every part of this path: C:\\Users\\Neema\\Documents\\Notes\\Week3.docx.', a: 'C: is the main drive, Users holds all accounts, Neema is the user\'s own folder, Documents is a folder inside it, Notes is a subfolder, and Week3.docx is the file.' },
        { q: 'Give four rules for choosing good file names.', a: 'Be descriptive, use underscores instead of spaces, avoid forbidden characters, put the date first as year-month-day, add version numbers to drafts, and stay consistent (any four).' },
        { q: 'A file is at D:\\Lectures\\Maths\\Week3.pdf. Which drive is it on, and what kind of drive might it be?', a: 'It is on drive D:, which is another drive, often a flash drive or a second partition.' },
        { q: 'How do you copy the path of a selected file?', a: 'Click the file once and press Ctrl + Shift + C, then paste with Ctrl + V to check.' },
      ],
      quiz: [
        { q: 'Which is a good file name?', options: ['newnewfinal2reallyfinal.docx', 'x1.docx', '?????.docx', 'Computer_Basics_Summary.docx'], answer: 3, why: 'It is descriptive and contains no forbidden characters.' },
        { q: 'In C:\\Users\\Neema\\Documents, what is Users?', options: ['The folder where Windows keeps all accounts', 'The file', 'A flash drive', 'A website'], answer: 0, why: 'Users holds the folders of all accounts on the computer.' },
        { q: 'Which character is NOT allowed in a Windows file name?', options: ['Underscore', 'Hyphen', 'Question mark', 'A number'], answer: 2, why: 'Windows does not allow \\ / : * ? " < > | in file names.' },
        { q: 'Which date style helps files sort in the order they were created?', options: ['Day-month-year', 'Year-month-day', 'Month names only', 'No date at all'], answer: 1, why: 'Year-month-day at the start sorts naturally, for example 2026-11-18_Notes.docx.' },
        { q: 'Which shortcut shows a file\'s Properties?', options: ['Alt + Enter', 'Ctrl + P', 'Windows + L', 'Alt + Tab'], answer: 0, why: 'Alt + Enter opens Properties for the selected file.' },
      ],
    }),
];
