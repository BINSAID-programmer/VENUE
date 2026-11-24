import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 5: Getting started with Windows (from Digital Foundations by Binsaid). */
export const CB_CH5: LearnLesson[] = [
  T('dt-signin', 'Starting and signing in', 'Washa laptop kwa kubonyeza kitufe cha nguvu mara moja, ingia kwa akaunti yako tu, na usiwahi kujaribu kuvunja nenosiri la mtu mwingine.',
    'If you have a laptop, switch it on and sign in following the six steps. Write down which sign-in method you use: password, PIN or fingerprint.',
    [
      { h: 'Why the way you start matters', p: [
        'Everything you do on a computer begins with switching it on and signing in. This sounds simple, but doing it the right way builds habits that protect your work and your privacy.'] },
      { h: 'Starting a laptop step by step', p: [
        'Follow the same order each time. Most beginners rush at step 4 and press buttons again and again, which does not help, because the computer is already working.'],
        steps: [
          'Check the power. Make sure the battery has some charge or that the charger is connected to the laptop and to a working socket.',
          'Open the lid gently, holding the middle of the top edge. Do not force it past the point where it stops.',
          'Press the power button once and release. Do not hold it down. A light should come on and the manufacturer logo may appear.',
          'Wait for Windows to load. This may take from a few seconds to a couple of minutes. Do not press buttons repeatedly.',
          'Sign in. On the lock screen, click or press any key, then enter your password or PIN, or use your fingerprint or face if your laptop supports it. Press Enter.',
          'Wait for the desktop to appear. Windows may open a few small programs in the background as it starts.',
        ],
        tip: 'One short press of the power button is enough. Holding it down is only for emergencies.' },
      { h: 'User accounts, passwords and PINs', p: [
        'Windows uses user accounts so that several people can share one computer while keeping their files private. Your account has a name and a secret way to prove it is you.',
        'This can be a password (a long secret you type), a PIN (a shorter number or code used only on that device), or biometrics such as a fingerprint. Keep these private and never share them, not even with friends. A later chapter explains how to choose strong ones.'] },
      { h: 'Use only your own accounts', p: [
        'Warning: never try to guess, bypass or break another person\'s password, or use a device that is not yours without permission. In many places this is a crime.',
        'If you forget your own password, use the official "I forgot my password" option or ask the person responsible for the laptop.'] },
    ],
    {
      mistakes: [
        'Holding the power button down to start the laptop. One press and release is enough.',
        'Pressing keys again and again while Windows is loading. The computer is working; wait.',
        'Sharing your password or PIN with friends.',
        'Trying to guess another person\'s password or using a device without permission.',
      ],
      exercises: [
        { q: 'Write the six steps for starting a laptop in your own words.', a: 'Check power, open the lid gently, press the power button once, wait for Windows to load, sign in, and wait for the desktop to appear.' },
        { q: 'What is the difference between a password and a PIN?', a: 'A password is a long secret you type. A PIN is a shorter number or code used only on that one device.' },
        { q: 'You forgot your password. What should you do?', a: 'Use the official "I forgot my password" option or ask the person responsible for the laptop. Never try to bypass it.' },
      ],
      quiz: [
        { q: 'How should you press the power button to start a laptop?', options: ['Hold it for ten seconds', 'Press once and release', 'Press it many times quickly', 'Press it together with Esc'], answer: 1, why: 'A single short press is enough. Do not hold it down.' },
        { q: 'Why does Windows use user accounts?', options: ['So several people can share one computer and keep files private', 'To make the computer faster', 'To use less electricity', 'To remove the need for a password'], answer: 0, why: 'Each account keeps its owner\'s files separate and private.' },
        { q: 'Which is a biometric way to sign in?', options: ['A long password', 'A PIN', 'A fingerprint', 'The date'], answer: 2, why: 'Biometrics use something about your body, such as a fingerprint or face.' },
        { q: 'A classmate leaves a laptop open and you do not know its password. What is correct?', options: ['Guess the password for fun', 'Do not use it without permission', 'Reset it yourself', 'Share it with others'], answer: 1, why: 'Using a device that is not yours without permission can be a crime.' },
        { q: 'During start-up the screen stays on the logo for a while. What should you do?', options: ['Press buttons repeatedly', 'Pull out the battery', 'Wait; the computer is working', 'Close the lid hard'], answer: 2, why: 'Loading can take from seconds to a couple of minutes.' },
      ],
    }),

  T('dt-desktop', 'The desktop, mouse and touchpad', 'Dawati la Windows lina mandhari, ikoni, menyu ya Start, taskbar na eneo la arifa; panya hutumia kubofya mara moja, mara mbili, kulia, kusogeza na kuburuta.',
    'Right-click an empty part of the desktop and close the menu. Then create a folder on the desktop and drag it to another spot.',
    [
      { h: 'Parts of the Windows desktop', p: [
        'After you sign in, you see the desktop: the main workspace of Windows. Its exact look depends on your Windows version and settings, but the main elements are always the same.'],
        fig: 'dt-desktop',
        table: { head: ['Element', 'Purpose'], rows: [
          ['Desktop background', 'The picture or colour behind your icons and windows. You can change it.'],
          ['Icons and shortcuts', 'Small pictures that open files, folders or applications when double-clicked.'],
          ['Start menu', 'Gives access to applications, settings, power options and search.'],
          ['Taskbar', 'The bar along the bottom that shows pinned and currently open applications.'],
          ['Notification area', 'Small status icons such as network, sound, battery, and the date and time.'],
          ['Search', 'Helps you find applications, settings and files by typing a few letters.'],
        ] } },
      { h: 'Icons, shortcuts and the Recycle Bin', p: [
        'Some desktop icons are real files or folders. Others are shortcuts, which are small pointers to something stored elsewhere. You can recognise a shortcut by the small arrow on the corner of its icon. Deleting a shortcut removes only the pointer, not the program or file it points to.',
        'The Recycle Bin is a special folder that holds many deleted files until you restore them or empty the bin.'] },
      { h: 'The five mouse actions', p: [
        'Windows is controlled by pointing at things and selecting them, with a mouse or with the laptop touchpad. The pointer, usually a small arrow, moves in the direction you move the mouse or slide your finger.'],
        table: { head: ['Action', 'How', 'What it does'], rows: [
          ['Single-click', 'Left button once (touchpad: tap with one finger)', 'Selects an item'],
          ['Double-click', 'Left button twice, quickly', 'Opens an item'],
          ['Right-click', 'Right button once (touchpad: tap with two fingers)', 'Opens a context menu with more actions'],
          ['Scroll', 'Turn the wheel (touchpad: slide two fingers)', 'Moves the page up or down'],
          ['Drag and drop', 'Hold left button on an item, move, release', 'Moves or places an item'],
        ] } },
      { h: 'Touchpad gestures', p: [
        'Most modern laptops have a precision touchpad that understands several finger movements. The exact gestures can be changed in Settings, but common ones are: two-finger slide to scroll, two-finger tap to right-click, pinch or spread to zoom out or in, and a three-finger swipe up to show all open windows or sideways to switch between recent apps.'] },
      { h: 'Practice drills', p: [
        'Moving a pointer accurately takes practice. If double-clicking is hard, do not worry; almost everyone finds it awkward at first. If a double-click does not work, you are probably moving the pointer slightly between the two clicks.'],
        steps: [
          'Right-click on an empty area of the desktop. A menu appears. Click on an empty area again to close it.',
          'Practise double-clicking a harmless folder, such as Documents, until it opens every time.',
          'Create a new folder on the desktop, then drag it to a different spot and release.',
          'Practise scrolling in a long web page or document.',
        ],
        tip: 'Do not drag important files until you understand where they will land. If you drop a file in the wrong place, press Ctrl + Z at once to undo.' },
    ],
    {
      mistakes: [
        'Deleting a shortcut and thinking the program is gone. Only the pointer is removed.',
        'Moving the mouse between the two clicks of a double-click, so the item only gets selected.',
        'Dragging important files carelessly and dropping them in the wrong folder. Press Ctrl + Z to undo.',
        'Confusing the taskbar (bottom bar with apps) with the notification area (small status icons).',
      ],
      exercises: [
        { q: 'List four elements of the Windows desktop and the purpose of each.', a: 'For example: the taskbar shows pinned and open apps; the Start menu gives access to apps, settings and power options; the notification area shows network, sound, battery and the clock; icons open files, folders or programs.' },
        { q: 'Explain the difference between single-click, double-click and right-click.', a: 'Single-click selects an item, double-click opens it, and right-click opens a context menu with more actions.' },
        { q: 'How can you tell that a desktop icon is a shortcut?', a: 'It has a small arrow on the corner of its icon. It points to something stored elsewhere.' },
        { q: 'Which two-finger touchpad actions do you know?', a: 'Two-finger slide scrolls a page, and a two-finger tap is a right-click.' },
      ],
      quiz: [
        { q: 'A small arrow on a desktop icon shows it is a...', options: ['Virus', 'Folder', 'Setting', 'Shortcut'], answer: 3, why: 'The arrow marks a shortcut, a pointer to something stored elsewhere.' },
        { q: 'Which action usually opens an item such as a folder?', options: ['Single-click', 'Double-click', 'Scroll', 'Right-click'], answer: 1, why: 'Double-click opens; single-click only selects.' },
        { q: 'On a touchpad, how do you right-click?', options: ['Tap with two fingers', 'Tap with one finger', 'Pinch', 'Swipe with three fingers'], answer: 0, why: 'A two-finger tap acts as a right-click.' },
        { q: 'Where do the network, sound, battery and clock icons appear?', options: ['Start menu', 'Notification area', 'Recycle Bin', 'Desktop background'], answer: 1, why: 'The notification area shows small status icons.' },
        { q: 'You dropped a file in the wrong folder by mistake. What is the quickest fix?', options: ['Restart the laptop', 'Press Ctrl + Z', 'Delete the folder', 'Turn off the laptop'], answer: 1, why: 'Ctrl + Z undoes the last action.' },
      ],
    }),

  T('dt-windows', 'Working with windows', 'Kila programu hufunguka kwenye dirisha; unaweza kulipunguza, kulikuza, kulifunga, kulipanga kando kwa kando na kubadilisha kwa Alt + Tab.',
    'Open two programs (for example Calculator and Notepad), snap them side by side, then switch between them with Alt + Tab.',
    [
      { h: 'Minimise, maximise and close', p: [
        'Every program you open appears in a window. You can have many windows open at once, which is useful but can feel confusing at first. Each window has three controls in the top right corner.',
        'Minimise hides the window on the taskbar without closing the program; click its icon on the taskbar to bring it back. Maximise expands the window to fill most or all of the screen, and then the same button becomes Restore, which returns it to a smaller size. Close exits the window, so save important work first, or the computer may ask whether you want to.'],
        table: { head: ['Button', 'What it does'], rows: [
          ['Minimise', 'Hides the window on the taskbar; program keeps running'],
          ['Maximise / Restore', 'Fills the screen / returns to smaller size'],
          ['Close', 'Exits the window; save first'],
        ] } },
      { h: 'Moving, resizing and arranging windows', p: [
        'These five habits make multitasking easy.'],
        steps: [
          'Move a window: click and hold its title bar (the strip at the top) and drag it.',
          'Resize a window: place the pointer on an edge or corner until it becomes a double arrow, then drag.',
          'Snap windows side by side: press Windows + Left arrow to fix a window to the left half of the screen, then pick another window for the right half.',
          'Switch between windows: hold Alt and press Tab to cycle through open programs. Release when the one you want is highlighted.',
          'Show the desktop quickly: press Windows + D. Press it again to restore your windows.',
        ] },
      { h: 'Case study: Rehema\'s two-window trick', p: [
        'Rehema had to write a summary of an article. At first she kept clicking back and forth between the browser and her document, losing her place. A friend showed her Windows + Left arrow and Windows + Right arrow.',
        'With the article on one half of the screen and her document on the other, she finished in half the time. The lesson: knowing a small shortcut can change the way you work.'],
        tip: 'Snapping is perfect when you read from a web page and write in a document at the same time.' },
    ],
    {
      mistakes: [
        'Thinking that minimising closes a program. It only hides the window; the program keeps running.',
        'Closing a window without saving your work first.',
        'Dragging a window by its middle instead of its title bar.',
        'Clicking back and forth between windows when snapping them side by side would be faster.',
      ],
      exercises: [
        { q: 'What is the difference between minimising and closing a window?', a: 'Minimising hides the window on the taskbar and the program keeps running. Closing exits the window, so unsaved work may be lost.' },
        { q: 'Explain how to place two windows side by side.', a: 'Press Windows + Left arrow to fix one window to the left half, then choose another window for the right half (Windows + Right arrow).' },
        { q: 'Which keys cycle through open programs, and which show the desktop quickly?', a: 'Alt + Tab cycles through open programs. Windows + D shows the desktop; press it again to restore the windows.' },
      ],
      quiz: [
        { q: 'Which action hides a window on the taskbar without closing the program?', options: ['Close', 'Minimise', 'Delete', 'Restart'], answer: 1, why: 'Minimise hides the window; the program stays open.' },
        { q: 'What does the Maximise button become after a window is maximised?', options: ['Close', 'Snap', 'Restore', 'Minimise'], answer: 2, why: 'The same button turns into Restore and returns the window to a smaller size.' },
        { q: 'Which keys switch between open programs?', options: ['Ctrl + S', 'Alt + Tab', 'Ctrl + P', 'Windows + L'], answer: 1, why: 'Hold Alt and press Tab to cycle through programs.' },
        { q: 'How do you move a window?', options: ['Drag its title bar', 'Press Delete', 'Right-click the desktop', 'Double-click the taskbar clock'], answer: 0, why: 'Click and hold the title bar, then drag.' },
        { q: 'Which keys quickly show the desktop?', options: ['Windows + D', 'Windows + I', 'Alt + F4', 'Ctrl + Z'], answer: 0, why: 'Windows + D shows the desktop; pressing it again restores your windows.' },
      ],
    }),

  T('dt-settings', 'Start menu, search and Settings', 'Menyu ya Start na utafutaji hukusaidia kufungua programu haraka; Settings (Windows + I) hubadilisha mandhari, mwangaza, sauti na Wi-Fi.',
    'Open Calculator using only the Windows key and typing. Then open Settings with Windows + I and use its search box to find "brightness".',
    [
      { h: 'The Start menu and search', p: [
        'The Start menu is your gateway to everything on the computer. Click the Windows icon on the taskbar, or press the Windows key. You will see pinned apps, recommended items and a Search box.'],
        steps: [
          'Press the Windows key.',
          'Without clicking anywhere, start typing the name of the program, for example calculator.',
          'The best match appears at the top. Press Enter or click it.',
          'The program opens. You do not need to know where it is stored.',
        ] },
      { h: 'Settings: where to change things', p: [
        'Settings is where you control how Windows looks and behaves. Open it by pressing Windows + I. The table shows where to go for common changes.'],
        table: { head: ['I want to...', 'Where to go'], rows: [
          ['Change the desktop background', 'Settings > Personalisation > Background'],
          ['Change the screen brightness', 'Settings > System > Display > Brightness'],
          ['Change the volume', 'Sound icon in the notification area, or Settings > System > Sound'],
          ['Connect to Wi-Fi', 'Network icon in the notification area, choose a network, enter its password'],
          ['Turn on battery saver', 'Settings > System > Power & battery'],
          ['Check the date and time', 'Settings > Time & language > Date & time'],
          ['Make text larger', 'Settings > Accessibility > Text size'],
        ] },
        tip: 'Cannot find a setting? Use the search box at the top of Settings and type a word like "brightness" or "wallpaper". Settings sometimes move between Windows versions, but search always works.' },
      { h: 'The taskbar and pinning', p: [
        'The taskbar at the bottom of the screen shows the programs you have pinned and the ones that are running. Running programs have a small line under their icon.',
        'You can pin a favourite program so that it is always one click away: find it in the Start menu, right-click it, and choose Pin to taskbar. To remove it, right-click the icon and choose Unpin from taskbar.'] },
    ],
    {
      mistakes: [
        'Hunting through folders for a program when typing its name in search is faster.',
        'Giving up when a setting is not where a guide says. Settings move between versions; use the search box.',
        'Confusing pinning with installing. Pinning only adds a quick icon on the taskbar.',
      ],
      exercises: [
        { q: 'Describe how to open an application using search.', a: 'Press the Windows key, type the program name, then press Enter or click the best match at the top.' },
        { q: 'Which shortcut opens Settings, and how do you find a setting you cannot locate?', a: 'Windows + I opens Settings. Use the search box at the top of Settings and type a word such as brightness.' },
        { q: 'How do you pin a program to the taskbar?', a: 'Find it in the Start menu, right-click it and choose Pin to taskbar. Right-click the icon and choose Unpin to remove it.' },
      ],
      quiz: [
        { q: 'Which keys open Settings?', options: ['Windows + L', 'Windows + I', 'Windows + E', 'Windows + D'], answer: 1, why: 'Windows + I opens Settings.' },
        { q: 'Where would you go to change the desktop background?', options: ['Settings > Personalisation > Background', 'Settings > Accessibility > Text size', 'Task Manager', 'The Recycle Bin'], answer: 0, why: 'Backgrounds are under Personalisation.' },
        { q: 'What do the small lines under taskbar icons show?', options: ['The program is infected', 'The program is running', 'The program is deleted', 'The program is a shortcut'], answer: 1, why: 'A small line marks programs that are currently running.' },
        { q: 'What is the quickest way to find a program when you do not know where it is stored?', options: ['Open every folder', 'Press the Windows key and type its name', 'Restart the computer', 'Look in the Recycle Bin'], answer: 1, why: 'Search finds programs by name; you do not need to know where they are.' },
      ],
    }),

  T('dt-power', 'Lock, sleep, restart, shut down and frozen programs', 'Funga skrini kwa Windows + L ukiondoka, hifadhi kazi kabla ya kuzima, na programu ikigoma tumia Task Manager (Ctrl + Shift + Esc) badala ya kushikilia kitufe cha nguvu.',
    'Lock your computer with Windows + L and sign in again. Then open Task Manager with Ctrl + Shift + Esc and look at the list (do not end anything).',
    [
      { h: 'Four ways to stop using a computer', p: [
        'There are several ways to stop using a computer. Each has a different purpose, so it is worth knowing the difference.'],
        table: { head: ['Option', 'What it does', 'When to use it'], rows: [
          ['Lock (Windows + L)', 'Keeps everything running but hides your screen until you sign in again', 'Whenever you step away, even for a minute'],
          ['Sleep', 'Saves your session in memory, uses very little power, wakes quickly', 'Short breaks when you will return soon'],
          ['Restart', 'Closes everything and starts Windows again', 'After updates, or when the computer is slow or strange'],
          ['Shut down', 'Closes everything and turns the computer off completely', 'End of the day, or a long time without use'],
        ] } },
      { h: 'Shutting down safely', p: [
        'Always save and close before you shut down. Warning: do not routinely hold down the power button to turn the laptop off. This can damage files and system programs. Do it only if the computer is completely frozen and the normal options do not work.'],
        steps: [
          'Save your work in every open program. Press Ctrl + S.',
          'Close your programs one by one, if you can.',
          'Click the Start button, then the Power icon.',
          'Choose Shut down. Wait until the screen goes dark and the lights go off before closing the lid or unplugging.',
        ] },
      { h: 'When a program freezes', p: [
        'Sometimes a program stops responding. The window does not move, the pointer shows a spinning circle, and nothing you click works. Do not panic and do not press keys repeatedly.'],
        steps: [
          'Wait about 30 seconds. Some programs are just busy and recover by themselves.',
          'Press Ctrl + Shift + Esc to open Task Manager.',
          'In the list, find the program marked Not responding and click it.',
          'Click End task. The program closes. Unsaved work in that program may be lost.',
          'If the whole laptop is frozen and nothing responds for several minutes, hold the power button for about five seconds to switch off, wait ten seconds, and start it again.',
        ],
        tip: 'Save often. Press Ctrl + S every few minutes. Many programs have autosave, but never rely on it completely.' },
      { h: 'Lab: guided tour and personalisation', p: [
        'This lab brings the whole chapter together. You have succeeded when you completed all seven steps without help and can describe what each shortcut did.'],
        steps: [
          'Sign in and wait for the desktop. Write down the names of at least five icons you see on the taskbar or desktop.',
          'Find and name the Start button, the search box, the notification area and the clock.',
          'Open Calculator using the Start menu and typing its name. Without closing it, open Notepad the same way.',
          'Press Alt + Tab to switch between the two. Then snap Calculator to the left and Notepad to the right with Windows + Left arrow and Windows + Right arrow.',
          'Minimise both windows, then bring them back from the taskbar. Maximise one, restore it, then close both.',
          'Open Settings with Windows + I. Change the background to a plain, calm picture and set the brightness to a comfortable level.',
          'Lock the computer with Windows + L. Sign in again.',
        ] },
    ],
    {
      mistakes: [
        'Leaving the laptop unlocked when you walk away, even for a minute.',
        'Holding the power button to turn the laptop off as a normal habit; this can damage files.',
        'Pressing keys repeatedly when a program freezes instead of waiting and using Task Manager.',
        'Not saving work often, so a freeze costs you everything.',
      ],
      exercises: [
        { q: 'What is the difference between Lock, Sleep, Restart and Shut down?', a: 'Lock hides the screen until you sign in, Sleep saves the session in memory with low power, Restart closes everything and starts Windows again, Shut down turns the computer off completely.' },
        { q: 'Describe what to do when a program stops responding.', a: 'Wait about 30 seconds, open Task Manager with Ctrl + Shift + Esc, select the program marked Not responding, and click End task. Only if the whole laptop is frozen, hold the power button for about five seconds.' },
        { q: 'Why should you not hold the power button to turn off a laptop normally?', a: 'It can damage files and system programs. It is only for a completely frozen computer.' },
        { q: 'Which shortcut saves your work?', a: 'Ctrl + S. Press it every few minutes.' },
      ],
      quiz: [
        { q: 'Which keys lock the computer?', options: ['Ctrl + L', 'Alt + F4', 'Windows + L', 'Windows + E'], answer: 2, why: 'Windows + L locks the screen until you sign in again.' },
        { q: 'Which keys open Task Manager quickly?', options: ['Ctrl + P', 'Alt + Tab', 'Ctrl + S', 'Ctrl + Shift + Esc'], answer: 3, why: 'Ctrl + Shift + Esc opens Task Manager.' },
        { q: 'Which option is best for a short break when you will return soon?', options: ['Shut down', 'Restart', 'Sleep', 'Closing the lid on a running update'], answer: 2, why: 'Sleep saves the session in memory and wakes quickly.' },
        { q: 'What does End task do?', options: ['Saves the file', 'Closes the program; unsaved work may be lost', 'Restarts Windows', 'Deletes the program'], answer: 1, why: 'The program is closed and unsaved work in it may be lost.' },
        { q: 'After Windows updates, or when the computer behaves strangely, you should usually...', options: ['Lock it', 'Restart it', 'Put it to sleep', 'Unplug it'], answer: 1, why: 'Restart closes everything and starts Windows fresh.' },
      ],
    }),
];
