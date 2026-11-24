import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 12: Passwords and account security (from Digital Foundations by Binsaid). */
export const CB_CH12: LearnLesson[] = [
  T('sec-why', 'Why accounts need protection and how passwords are broken', 'Akaunti ni nafasi binafsi na nenosiri ni ufunguo wake; washambuliaji hutumia programu kujaribu nywila nyingi, hivyo hata mwanafunzi wa kawaida yuko hatarini.',
    'List five accounts you use. For each, write one thing an attacker could do if they got in.',
    [
      { h: 'Accounts and keys', p: [
        'Almost everything you do online happens inside an account: your email, social media, university portal, mobile-money service or cloud storage. An account is simply a private space on someone else\'s computer, and a password is the key that proves the space is yours. If another person learns your key, the system cannot tell the difference between you and them.'] },
      { h: 'Why would anyone attack a student?', p: [
        'Many beginners believe nobody would want to attack an ordinary student. This is a mistake. Attackers rarely choose people one by one; they use programs that try millions of stolen or guessed passwords against millions of accounts, and they take whatever opens.',
        'Your account is valuable to them: they can send scam messages to your friends pretending to be you, read your private messages, steal your photos or documents, reset the passwords of your other accounts, or ask your contacts for money.'] },
      { h: 'Case study: the hijacked account', p: [
        'Amina used the same password, her phone number followed by her name, for her email, social media and student portal. A small online shop she once bought from was hacked, and her email address and password were leaked. Within hours, attackers tried the same pair on popular websites and opened her email.',
        'From her email they reset her other passwords and sent messages to her friends: "I am stuck abroad, please send money." One friend sent money before Amina regained control. The lesson: the weakest website that knows your password decides how safe all your accounts are, so use a different password for every important account.'] },
      { h: 'How passwords are broken', p: [
        'To choose good passwords, it helps to know how bad ones are defeated. The most important defence against brute force is length, not complicated symbols: each extra character multiplies the number of combinations an attacker must try. A long password made of ordinary words can be much stronger, and far easier to remember, than a short one full of symbols.'],
        table: { head: ['Method', 'How it works', 'What defeats it'], rows: [
          ['Guessing', 'The attacker tries obvious choices: 123456, password, your name, your birth year, your favourite team.', 'Do not use personal or common words.'],
          ['Dictionary attack', 'A program tries every word in a dictionary, plus common changes such as Password1 or p@ssword.', 'Avoid single words and simple tricks.'],
          ['Brute force', 'A program tries every possible combination of letters and numbers. Short passwords fall in seconds.', 'Make the password long.'],
          ['Credential stuffing', 'Passwords leaked from one website are tried on many other websites.', 'Use a different password for every account.'],
          ['Tricking you (phishing)', 'A fake page or message persuades you to type the password yourself.', 'Learn to spot scams (Chapter 13) and use two-step verification.'],
        ] } },
    ],
    {
      mistakes: [
        'Believing nobody would attack an ordinary student.',
        'Using the same password on several accounts, so one leak opens them all.',
        'Thinking that adding a few symbols to a short password makes it strong.',
        'Typing a password into a page you reached from a message without checking it.',
      ],
      exercises: [
        { q: 'Why might an attacker want the account of an ordinary student?', a: 'They use programs against millions of accounts and take whatever opens. A student account can be used to scam friends, read messages, steal files, reset other passwords or ask contacts for money.' },
        { q: 'Explain credential stuffing and how to defend against it.', a: 'Passwords leaked from one website are tried on many other websites. The defence is a different password for every account.' },
        { q: 'What is the most important defence against brute force?', a: 'Length. Each extra character multiplies the combinations an attacker must try.' },
        { q: 'In the case study, what rule did Amina break?', a: 'She reused one password across email, social media and the student portal, so a leak from a small shop opened her email.' },
      ],
      quiz: [
        { q: 'What is credential stuffing?', options: ['Trying every combination', 'Trying passwords leaked from one site on many other sites', 'Guessing your name', 'Sending a fake page'], answer: 1, why: 'Leaked passwords are reused against other websites.' },
        { q: 'What mainly defeats brute force?', options: ['Making the password long', 'Using your birth year', 'Using one symbol', 'Using your name'], answer: 0, why: 'Length multiplies the combinations an attacker must try.' },
        { q: 'Why can one leaked password harm many accounts?', options: ['Websites share all data', 'People reuse the same password', 'Passwords expire', 'Emails are slow'], answer: 1, why: 'Attackers try the leaked pair on popular websites and any reuse opens.' },
        { q: 'Which attack tries every word in a dictionary plus tricks like p@ssword?', options: ['Brute force', 'Credential stuffing', 'Dictionary attack', 'Phishing'], answer: 2, why: 'Dictionary attacks use word lists and common changes.' },
        { q: 'In Amina\'s case, how did attackers reset her other passwords?', options: ['From her opened email', 'By guessing her PIN', 'By stealing her phone', 'By using the shop'], answer: 0, why: 'Email can reset other accounts, so once they opened it they could reset the rest.' },
      ],
    }),

  T('sec-passwords', 'Creating a strong password', 'Nenosiri imara ni refu, lisilotabirika, la kipekee kwa kila akaunti na la siri; njia ya passphrase hutumia maneno manne au matano yasiyohusiana.',
    'Create your own passphrase from four or five unrelated words using the steps, and type it five times without looking. Do not write it down or share it.',
    [
      { h: 'The rules', p: [
        'Make it long: at least 12 characters, and 16 or more for important accounts. Make it unpredictable: not a name, a birthday, a phone number, a football team or a keyboard pattern such as qwerty.',
        'Make it unique: every important account has its own password. Keep it secret: never share it with a friend, a teacher, or a person who says they are "technical support". Change it only when needed, such as after a leak or if you suspect someone else knows it.'] },
      { h: 'The passphrase method', p: [
        'A passphrase is a password made of several unrelated words. It is long, so it is strong, but it is still easy for a human to remember because you can picture it as a story.'],
        steps: [
          'Choose four or five unrelated words that you can picture together, for example a colour, an animal, an object and a place.',
          'Put them in a sequence that makes a strange picture: purple elephant bicycle lake.',
          'Join them with symbols or numbers that you choose: Purple-Elephant-Bicycle-Lake.',
          'Add a number and a symbol in a spot only you know: Purple-Elephant-7-Bicycle-Lake!',
          'Type it five times without looking, so that your fingers remember it.',
          'Do not use the example above. Create your own.',
        ],
        tip: 'Never use a password that appears in a book, a website or a screenshot, including these examples. Anything that has been published is on an attacker\'s list.' },
      { h: 'Weak and strong examples', p: [
        'Compare these passwords. Notice that a short password can look complex and still be weak.'],
        table: { head: ['Password', 'Why it is weak or strong'], rows: [
          ['amina1998', 'Weak. Name and birth year are easy to guess.'],
          ['P@ssw0rd', 'Weak. It is on every attacker\'s list; the symbol tricks are well known.'],
          ['Kenya2024!', 'Weak. A word and a year, a common pattern.'],
          ['qwertyuiop', 'Weak. A keyboard pattern.'],
          ['T7$k', 'Weak. Too short even though it looks complex.'],
          ['Blue-Zebra-Drums-Over-9-Hills', 'Strong. Long, unrelated words, and easy to picture.'],
        ] } },
    ],
    {
      mistakes: [
        'Using a name, birth year, phone number, team or keyboard pattern.',
        'Relying on well-known symbol tricks such as P@ssw0rd.',
        'Using a password printed in a book or website, including the examples here.',
        'Sharing a password with a friend or with someone claiming to be technical support.',
      ],
      exercises: [
        { q: 'List the five rules for a good password.', a: 'Long (at least 12 characters, 16 or more for important accounts), unpredictable, unique for each account, secret, and changed only when needed.' },
        { q: 'Why is a long passphrase usually stronger than a short complicated password?', a: 'Length multiplies the combinations an attacker must try, and a passphrase of unrelated words is also easy to remember as a picture.' },
        { q: 'Create (but do not write down) a four-word passphrase and describe the picture you use to remember it.', a: 'Any four unrelated words pictured as one strange scene, for example a colour, an animal, an object and a place. Do not use the book example.' },
        { q: 'Why is Kenya2024! weak?', a: 'It is a word plus a year, a very common pattern that attackers expect.' },
      ],
      quiz: [
        { q: 'Which password is the strongest?', options: ['amina1998', 'Password1!', '12345678', 'Blue-Zebra-Drums-Over-9-Hills'], answer: 3, why: 'It is long, made of unrelated words and easy to picture.' },
        { q: 'What is a passphrase?', options: ['A long password made from several unrelated words', 'A very short password', 'A phone number', 'A fingerprint'], answer: 0, why: 'It is long and strong but easy to remember.' },
        { q: 'What is the minimum length for a good password in this chapter?', options: ['4', '6', '12', '40'], answer: 2, why: 'At least 12 characters, and 16 or more for important accounts.' },
        { q: 'Why should you not use the example passphrase from a book?', options: ['It is too long', 'Published passwords are on attacker lists', 'It has symbols', 'It has numbers'], answer: 1, why: 'Anything that has been published is on an attacker\'s list.' },
        { q: 'T7$k looks complex. Why is it weak?', options: ['It has a symbol', 'It is too short', 'It has a number', 'It uses a capital'], answer: 1, why: 'Even complex-looking passwords fall quickly when they are short.' },
      ],
    }),

  T('sec-manager', 'Password managers', 'Kidhibiti cha nywila huhifadhi nywila zako zote kwenye sefu iliyosimbwa, inayofunguliwa kwa nenosiri kuu moja imara.',
    'Start a password manager (your browser\'s built-in one is fine) and save the password of one account. Then check that it fills it in the next time.',
    [
      { h: 'Why you need a manager', p: [
        'If you must have a different long password for every account, you will soon have dozens, and nobody can memorise them all. The solution is a password manager: a program that stores all your passwords in an encrypted vault, locked by one strong master password. It can also create random passwords and fill them in automatically.'] },
      { h: 'How it works', p: [
        'You remember one very strong master passphrase. The manager creates and stores a unique random password for each website.',
        'When you visit a website, the manager fills in the password only on the correct website address, which also helps protect you from fake pages. The vault is encrypted, so even if the company\'s servers are attacked, the attacker sees only scrambled data.'] },
      { h: 'Step by step: start using a password manager', p: [
        'Go gradually. You do not have to change every password on the first day.'],
        steps: [
          'Choose a well-known manager. Your browser\'s built-in manager is a simple start; free options from reputable providers also exist.',
          'Create the account and choose a long master passphrase using the method in the previous lesson. Write it on paper and keep the paper somewhere safe at home until you have memorised it.',
          'Install the browser extension or phone app.',
          'Log in to one of your accounts. When the manager offers to save the password, accept.',
          'Next time you log in, let the manager fill in the details.',
          'Gradually change your most important passwords (email first) to long random ones created by the manager.',
        ],
        tip: 'Start with your email. It can reset the passwords of almost everything else, so give it the strongest, most private password and protect it with two-step verification.' },
      { h: 'No manager yet?', p: [
        'If you cannot use a manager, a notebook kept at home in a safe place is better than reusing one password everywhere. Do not keep the paper in your wallet, or write which website each password belongs to in an obvious way.',
        'Never store passwords in an unprotected file named passwords.txt.'] },
    ],
    {
      mistakes: [
        'Reusing one password because remembering many is hard.',
        'Choosing a weak master password; it protects the whole vault.',
        'Keeping passwords in an unprotected file named passwords.txt.',
        'Carrying the paper with passwords in your wallet.',
      ],
      exercises: [
        { q: 'What are the main benefits of a password manager?', a: 'It stores unique passwords in an encrypted vault, creates random ones, fills them in only on the correct website, and needs you to remember just one master passphrase.' },
        { q: 'How does a manager help protect you from fake pages?', a: 'It fills in the password only on the correct website address, so a fake page does not get it.' },
        { q: 'Which account should you secure first, and why?', a: 'Your email, because it can reset the passwords of almost everything else.' },
        { q: 'If you have no manager, what is the safer alternative to reuse?', a: 'A notebook kept in a safe place at home, not in your wallet, and not labelled in an obvious way.' },
      ],
      quiz: [
        { q: 'What does a password manager use to lock its vault?', options: ['Your phone number', 'One strong master password', 'Your name', 'Nothing'], answer: 1, why: 'You remember one master passphrase and the vault holds the rest.' },
        { q: 'Which account should you protect first because it can reset others?', options: ['A game account', 'A photo-editing app', 'A news website', 'Your email'], answer: 3, why: 'Email can reset the passwords of almost everything else.' },
        { q: 'Why is the vault safe if the company\'s servers are attacked?', options: ['It is encrypted, so the attacker sees scrambled data', 'It is deleted', 'It is public', 'It uses short passwords'], answer: 0, why: 'Encryption means stolen data is unreadable.' },
        { q: 'Which is worse than a home notebook?', options: ['A manager', 'A file called passwords.txt with no protection', 'A passphrase', 'Two-step verification'], answer: 1, why: 'An unprotected file is easy to find and read.' },
        { q: 'Where may the manager fill in a password?', options: ['On any page', 'Only on the correct website address', 'Only on email', 'Only on paper'], answer: 1, why: 'This also helps against fake pages.' },
      ],
    }),

  T('sec-2fa', 'Two-step verification and layers of protection', 'Uthibitisho wa hatua mbili huongeza uthibitisho wa pili, kwa kawaida simu yako, ili hata nenosiri likiibiwa mshambuliaji azuiwe; usimpe mtu yeyote msimbo wa uthibitisho.',
    'Switch on two-step verification for your email account and save the backup codes somewhere safe at home.',
    [
      { h: 'A second proof', p: [
        'A password is something you know, and anyone who learns it can use it. Two-step verification, also called two-factor authentication (2FA) or multi-factor authentication (MFA), adds a second proof, usually something you have, such as your phone. Even if an attacker steals your password, they are stopped at the second door.'] },
      { h: 'Common second steps', p: [
        'There are several ways to do the second step. Any of them is much better than none.'],
        table: { head: ['Method', 'How it works', 'Strength'], rows: [
          ['Authenticator app', 'An app on your phone shows a code that changes every 30 seconds.', 'Very good. Works without network.'],
          ['Security key', 'A small physical device that you plug in or tap.', 'Excellent, used for high-value accounts.'],
          ['Text message (SMS) code', 'A code is sent to your phone number.', 'Good, and much better than nothing, but a scammer who steals your SIM can receive it.'],
          ['Prompt on your phone', 'You tap "Yes, it was me" in an app.', 'Good. Deny any prompt you did not start.'],
          ['Backup codes', 'A list of one-time codes for emergencies.', 'Print and keep safely; they are your spare key.'],
        ] } },
      { h: 'Step by step: switch on 2-step verification (Google example)', p: [
        'Other services, such as Microsoft, social networks and mobile-money apps, have a similar option in their Security or Privacy settings. The menu names differ, but the idea is the same.'],
        steps: [
          'Open your browser and sign in at myaccount.google.com.',
          'In the left menu, click Security.',
          'Under "How you sign in to Google", click 2-Step Verification and then Get started.',
          'Follow the prompts to confirm your phone number or to add an authenticator app.',
          'When you are shown backup codes, save or print them and keep them somewhere safe.',
          'Finish by clicking Turn on. Next time you sign in on a new device you will be asked for the second step.',
        ],
        tip: 'Never share a verification code. A real company, bank or friend will never ask you to read it out. If someone does, it is a scam: they are logging in as you at that very moment.' },
      { h: 'Layers of protection', p: [
        'Security experts speak of defence in depth: instead of relying on one strong lock, use several layers so that if one fails, the others still protect you.'],
        table: { head: ['Layer', 'What to do'], rows: [
          ['Passwords', 'Long, unique, stored in a manager.'],
          ['Two-step verification', 'On for email, social media, cloud storage and money services.'],
          ['Updates', 'Install system and app updates promptly; they fix known weaknesses.'],
          ['Device lock', 'Use a PIN, pattern, fingerprint or password on your phone and laptop.'],
          ['Antivirus and firewall', 'Keep Windows Security turned on and up to date.'],
          ['Backups', 'Keep copies of important files (Chapter 7).'],
          ['Careful clicking', 'Pause before clicking links or opening attachments (Chapter 13).'],
        ] } },
    ],
    {
      mistakes: [
        'Reading out a verification code to a caller, even one who says they are from your bank.',
        'Approving a phone prompt that you did not start.',
        'Not saving the backup codes, then being locked out.',
        'Relying on one strong lock instead of several layers.',
      ],
      exercises: [
        { q: 'What are the three kinds of proof used to log in, and which does two-step verification add?', a: 'Something you know, something you have and something you are. Two-step verification usually adds something you have, such as your phone, to the password you know.' },
        { q: 'Why must you never tell anyone a verification code?', a: 'The code is for you only. If someone asks for it, they are probably logging in as you at that moment.' },
        { q: 'Why is an SMS code weaker than an authenticator app?', a: 'A scammer who steals your SIM can receive the SMS. An authenticator app shows a code that changes every 30 seconds on your phone, even without network.' },
        { q: 'What is defence in depth?', a: 'Using several layers of protection so that if one fails, the others still protect you.' },
      ],
      quiz: [
        { q: 'A caller says they are from your bank and asks you to read out the code you just received. What do you do?', options: ['Read it out', 'Send it by text', 'Refuse; a real bank never asks for it', 'Ask a friend to read it'], answer: 2, why: 'A real bank never asks, and the caller is logging in as you.' },
        { q: 'What does two-step verification add?', options: ['A longer password', 'A second proof, usually something you have', 'A faster login', 'A new email'], answer: 1, why: 'Even a stolen password is stopped at the second door.' },
        { q: 'How often does an authenticator app code change?', options: ['Every 30 seconds', 'Every day', 'Never', 'Every week'], answer: 0, why: 'It shows a code that changes every 30 seconds and works without network.' },
        { q: 'What should you do with backup codes?', options: ['Post them online', 'Print or save them and keep them safe', 'Delete them', 'Share with friends'], answer: 1, why: 'They are your spare key for emergencies.' },
        { q: 'What does defence in depth mean?', options: ['One very strong lock', 'Several layers of protection', 'No updates', 'A deep password'], answer: 1, why: 'If one layer fails, others still protect you.' },
      ],
    }),

  T('sec-devices', 'Securing your phone, Wi-Fi and recovering an account', 'Linda simu, Wi-Fi ya nyumbani na kompyuta za umma, na ukidukuliwa chukua hatua haraka: weka nenosiri jipya, toka kwenye vifaa vyote na waonye marafiki.',
    'Do the practical lab: build a short personal security plan, change your email password first, switch on two-step verification, and write down what you changed.',
    [
      { h: 'Your phone', p: [
        'Set a screen lock and keep the automatic lock time short. Install apps only from the official store, and check what permissions they ask for.',
        'Switch on Find my device so you can locate or erase a lost phone. Protect your SIM card with a PIN, and tell your mobile network immediately if you lose the phone.'] },
      { h: 'Home Wi-Fi', p: [
        'A router comes with default details that many people never change. Changing them takes a few minutes and protects everyone on the network.'],
        steps: [
          'Find the router\'s sticker; it shows the default network name and password. Many routers also show a settings address and the administrator login.',
          'Open a browser and enter the settings address printed on the router. Sign in with the administrator details.',
          'Change the administrator password from the factory default to a long one of your own.',
          'Rename the network if you wish, and set a strong Wi-Fi password. Choose WPA2 or WPA3 security; never leave the network open.',
          'Save the settings. All devices will need the new Wi-Fi password.',
        ] },
      { h: 'Public and shared computers', p: [
        'Avoid logging in to important accounts on a cyber-cafe or library computer. If you must, use a private (incognito) window, never tick "Remember me" or let the browser save the password, and log out completely and close the browser before you leave.',
        'Do not open banking or money services on public Wi-Fi unless you trust the network; use your mobile data instead.'] },
      { h: 'Step by step: recover a hacked account', p: [
        'Even careful people can be caught. What matters is acting quickly if you think someone else has accessed your account.'],
        steps: [
          'Stay calm and go to a safe device, such as your own phone or a friend\'s trusted computer.',
          'Use the website\'s "Forgot password" or "Account recovery" option to reset the password. Choose a new strong, unique password.',
          'If you can still log in, change the password at once and look for "Sign out of all devices" in the security settings.',
          'Check recovery details: make sure the recovery email and phone number are yours, not the attacker\'s.',
          'Turn on two-step verification.',
          'Review recent activity and forwarding rules; delete anything you did not create.',
          'Change the password of any other account that used the same or a similar password.',
          'Tell your friends that your account was hacked, so they ignore strange messages.',
          'If money or identity documents are involved, contact your bank, mobile network or the police.',
        ] },
      { h: 'Practical lab: build your personal security plan', p: [
        'Goal: make your most important accounts safer today. You have succeeded when your email has a new strong password and two-step verification, and your list shows which other accounts still need work.'],
        steps: [
          'Make a list of your five most important accounts, for example email, social media, university portal, cloud storage and mobile money. Write only the names, not the passwords.',
          'For each account, check whether the password is unique. If you have reused a password, mark the account for change.',
          'Create a passphrase using the method in this chapter and change the password for your email account first.',
          'Switch on two-step verification for your email account.',
          'Print or write down the backup codes and keep them in a safe place at home.',
          'Check that your phone has a screen lock and that the lock time is short.',
          'Change the default administrator and Wi-Fi password on your home router, or help a family member do so.',
          'Write a short paragraph in Security_Plan (saved in 03_Research or your documents folder) explaining what you changed and what you still plan to do.',
        ] },
    ],
    {
      mistakes: [
        'Leaving the router\'s factory administrator and Wi-Fi password unchanged.',
        'Ticking "Remember me" on a public or shared computer.',
        'Resetting only one password after a hack and ignoring other accounts that used the same one.',
        'Forgetting to warn your friends that your account was hacked.',
      ],
      exercises: [
        { q: 'List four steps you should take if your account is hacked.', a: 'For example: reset the password to a new strong unique one, sign out of all devices, check the recovery email and phone, turn on two-step verification, and warn your contacts.' },
        { q: 'Why change the router\'s administrator password as well as the Wi-Fi password?', a: 'The factory login is a default that others may know. A long password of your own protects the router settings, and WPA2 or WPA3 with a strong Wi-Fi password protects the network.' },
        { q: 'What precautions should you take on a cyber-cafe computer?', a: 'Avoid important accounts if you can; otherwise use a private window, do not tick "Remember me", and log out and close the browser when you leave.' },
        { q: 'Name three ways to secure your phone.', a: 'Use a screen lock with a short lock time, install apps only from the official store and check permissions, and switch on Find my device and set a SIM PIN.' },
      ],
      quiz: [
        { q: 'Which Wi-Fi security should you choose on your router?', options: ['Open (no security)', 'WPA2 or WPA3', 'Whatever the neighbour uses', 'None, to save time'], answer: 1, why: 'Never leave the network open; choose WPA2 or WPA3.' },
        { q: 'After a hack, which step helps remove the attacker\'s other sessions?', options: ['Sign out of all devices', 'Rename the account', 'Close the browser', 'Wait a week'], answer: 0, why: 'Signing out of all devices ends sessions the attacker may still hold.' },
        { q: 'What should you do on a shared computer?', options: ['Tick "Remember me"', 'Log out completely and close the browser', 'Leave the page open', 'Save the password'], answer: 1, why: 'Logging out and closing the browser stops the next person from entering your account.' },
        { q: 'Where should you install phone apps from?', options: ['Any link', 'The official store', 'A message', 'A friend\'s file'], answer: 1, why: 'Use the official store and check what permissions an app asks for.' },
        { q: 'Why check the recovery email and phone number after a hack?', options: ['They might have been changed to the attacker\'s', 'They are not important', 'They make the password longer', 'They speed up login'], answer: 0, why: 'If the attacker changed them, they could take the account back.' },
      ],
    }),
];
