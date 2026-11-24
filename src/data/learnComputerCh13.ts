import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 13: Scams, phishing and malware (from Digital Foundations by Binsaid). */
export const CB_CH13: LearnLesson[] = [
  T('scam-toolbox', 'The scammer\'s toolbox', 'Wadanganyifu hutumia hisia kama hofu, haraka na tamaa ili ufanye kitu bila kufikiri, kwa hiyo ukihisi presha, simama kwanza.',
    'Look at the last three messages you received that asked you to do something. For each, write which emotion (fear, urgency, greed, trust, kindness or curiosity) it tried to use.',
    [
      { h: 'Scams persuade people', p: [
        'A scam is a trick to take your money, your information or your access. Most scams do not work by breaking into computers; they work by persuading people. This is called social engineering.',
        'A scammer does not need to be clever with technology. They only need to make you feel something strongly enough that you stop thinking.'] },
      { h: 'The six emotions scammers use', p: [
        'Almost every scam uses the same few emotions. Learn to recognise them and you will notice scams in any form, however new.'],
        table: { head: ['Emotion', 'How the scammer uses it', 'Example message'], rows: [
          ['Fear', 'Threatens a problem or punishment if you do not act.', 'Your account will be closed in 24 hours.'],
          ['Urgency', 'Gives a short deadline so you cannot check.', 'Reply within 10 minutes.'],
          ['Greed', 'Promises easy money, a prize or a bargain.', 'You have won 5,000,000. Pay a small fee to receive it.'],
          ['Trust', 'Pretends to be a bank, employer, teacher or friend.', 'Hi, it is Mom. I changed my number.'],
          ['Kindness', 'Asks for help for an emergency or a sick relative.', 'Please send money for hospital fees.'],
          ['Curiosity', 'Offers a strange link or a shocking video.', 'Is this you in this video?'],
        ] } },
      { h: 'The pattern to remember', p: [
        'Real organisations rarely demand secret information, immediate payment or instant action by message. When a message makes you feel strongly and asks you to act quickly, slow down.',
        'That feeling is the warning. The scammer wants you to feel first and think later.'],
        tip: 'A strong feeling plus a request to act fast is the pattern of almost every scam.' },
    ],
    {
      mistakes: [
        'Thinking scammers must be computer experts. Most simply persuade people.',
        'Believing that a message is real because it sounds official or urgent.',
        'Acting first and checking later when a message makes you afraid or excited.',
      ],
      exercises: [
        { q: 'What is social engineering? Give an example.', a: 'It is tricking people into doing something unsafe. Example: a message saying your account will close in 24 hours unless you send your PIN.' },
        { q: 'Name four emotions scammers use and give a message for each.', a: 'Fear: your account will be closed. Urgency: reply within 10 minutes. Greed: you won 5,000,000. Kindness: send money for hospital fees.' },
        { q: 'Why does a short deadline help the scammer?', a: 'It stops you from checking. Without time to think or verify, you are more likely to obey.' },
      ],
      quiz: [
        { q: 'Most scams work by:', options: ['Breaking into computers with clever code', 'Persuading people', 'Damaging hardware', 'Slowing the internet'], answer: 1, why: 'Social engineering means persuading people, not breaking machines.' },
        { q: 'A message demands that you act within 10 minutes. This is:', options: ['A friendly reminder', 'A good offer', 'Urgency used by scammers', 'A normal bank notice'], answer: 2, why: 'A short deadline stops you from checking, which is a scammer technique.' },
        { q: 'Which emotion does "Is this you in this video?" use?', options: ['Fear', 'Curiosity', 'Kindness', 'Greed'], answer: 1, why: 'It offers a strange link to make you curious enough to click.' },
        { q: 'You win a prize you never entered and must pay a fee. Which emotion is used?', options: ['Greed', 'Fear', 'Trust', 'Kindness'], answer: 0, why: 'Promising easy money or a prize plays on greed.' },
      ],
    }),

  T('scam-phishing', 'Phishing emails and reading links', 'Phishing ni ujumbe wa uongo unaojifanya kutoka kwa chanzo cha kuaminika, na unaweza kuuona kwa kuangalia mtumaji, kiungo na kile unachoombwa.',
    'Hover over (do not click) three links in a safe email or web page. Write down the real domain of each, reading it from the right.',
    [
      { h: 'What is phishing?', p: [
        'Phishing is a message that pretends to come from a trusted sender in order to steal passwords, money or personal details. The word comes from fishing: the scammer throws out bait and waits to see who bites.',
        'Phishing most often arrives by email, but it also comes by text message, social media, messaging apps and phone calls.'] },
      { h: 'Warning signs in an email', p: [
        'Check each of these signs. One sign is a reason to be careful; several signs mean you should not trust the message.'],
        steps: [
          'The sender address looks slightly wrong. The display name may say University Support, but the real address ends in an unrelated domain. Always look at the full address.',
          'A generic greeting such as Dear customer or Dear user instead of your name.',
          'Urgency or threats, such as Act now or your account will be deleted.',
          'Spelling and grammar errors, odd wording, or an unprofessional design.',
          'A link that does not match: the text shows one address but the link goes elsewhere.',
          'An unexpected attachment, especially a compressed file or a document that asks you to enable macros or enable editing.',
          'A request for secret information: passwords, verification codes, PINs or full card details.',
          'A reward that is too good to be true.',
        ] },
      { h: 'Spear phishing', p: [
        'A spear-phishing message is aimed at one person and uses real details found online: your name, your course, your friends. Because it feels personal, it is more convincing.',
        'The same tests apply: check the sender, the link and the request.'] },
      { h: 'Check a link before you click', p: [
        'A link has a visible text and a real destination, and the two may differ. Reading the web address lets you see the destination before you click. The domain is the part just before the first single slash, and you read it from the right.'],
        steps: [
          'Hover the mouse pointer over the link (do not click). The real address appears at the bottom of the browser or email window. On a phone, press and hold the link to preview it.',
          'Find the part of the address just before the first single slash. This is the domain, and it decides who owns the page.',
          'Read the domain from the right. In login.mybank.com.verify-account.xyz, the real domain is verify-account.xyz, not mybank.com.',
          'Look for small tricks: a letter swapped for a similar one (rn for m, a zero for the letter O), an extra word (mybank-secure.com), or a different ending (.xyz instead of .com).',
          'If you are not sure, do not click. Open a new tab and type the official address yourself, or use the official app.',
          'Treat shortened links with caution; they hide the destination.',
        ] },
      { h: 'Examples and the padlock', p: [
        'In https://example-bank.com.secure-login.net/ the real owner is secure-login.net, so it is not safe: the bank name is only decoration. In https://examp1e-bank.com the digit 1 replaces the letter l, a look-alike name.',
        'The padlock symbol and https only mean that the connection is encrypted. Scammers can have padlocks too, so it does not prove that the website is honest. Always check the domain.'],
        tip: 'Real domain = the part before the first single slash, read from the right.' },
    ],
    {
      mistakes: [
        'Trusting the display name of the sender instead of looking at the full address.',
        'Reading a web address from the left and being fooled by a familiar bank name at the start.',
        'Thinking that a padlock means a site is honest. It only means the connection is encrypted.',
        'Clicking a link to check whether it is real. Hover or type the address yourself instead.',
      ],
      exercises: [
        { q: 'List five warning signs of a phishing email.', a: 'Wrong sender address, generic greeting, urgency or threats, spelling errors, a link that does not match, an unexpected attachment, or a request for secret information.' },
        { q: 'In https://mybank.com.verify-login.net, which is the real domain? Explain how you decided.', a: 'verify-login.net. The domain is the part before the first single slash, read from the right, so mybank.com is only decoration.' },
        { q: 'Why is the padlock not proof that a website is honest?', a: 'The padlock only shows that the connection is encrypted. Scammers can also get padlocks, so you must still check the domain.' },
        { q: 'How do you see where a link really goes on a computer and on a phone?', a: 'On a computer, hover over it and read the address at the bottom. On a phone, press and hold the link to preview it.' },
      ],
      quiz: [
        { q: 'Phishing is:', options: ['A program that locks your files', 'A message pretending to be from a trusted sender to steal information', 'A way to speed up the internet', 'A type of firewall'], answer: 1, why: 'Phishing is bait sent by a fake trusted sender.' },
        { q: 'In https://shop.example.com.pay-now.xyz/, the real domain is:', options: ['shop.example.com', 'example.com', 'https', 'pay-now.xyz'], answer: 3, why: 'Read from the right before the first single slash: pay-now.xyz.' },
        { q: 'Which action is safest if an email claims to be from your bank?', options: ['Click the link', 'Call the number in the email', 'Open the bank\'s official site or app yourself', 'Forward it to all friends'], answer: 2, why: 'Use a route you find yourself, not the contact details in the message.' },
        { q: 'A message aimed at one person using their real name and course is called:', options: ['Spear phishing', 'Adware', 'A worm', 'A cookie'], answer: 0, why: 'Spear phishing uses real personal details to look convincing.' },
        { q: 'Which address is a look-alike trick?', options: ['example-bank.com', 'examp1e-bank.com', 'www.example-bank.com', 'example-bank.com/login'], answer: 1, why: 'The digit 1 replaces the letter l.' },
      ],
    }),

  T('scam-phone', 'Phone and message scams', 'Utapeli wa SMS, WhatsApp na simu unaomba pesa, PIN au ada, na jibu ni kuthibitisha kupitia njia rasmi unayoitafuta mwenyewe.',
    'Pick one scam from the table and write what you would do if you received it today, using the "What to do" column in your own words.',
    [
      { h: 'Why phone scams hurt', p: [
        'In many countries, the most damaging scams reach people on their phones, through SMS, WhatsApp and calls. People trust their phone and often act quickly on it.',
        'Mobile-money fraud is especially common, so learn the patterns below.'] },
      { h: 'Common phone and message scams', p: [
        'Each scam in the table follows the emotions you met earlier. The right response is always to check through a route you trust.'],
        table: { head: ['Scam', 'How it works', 'What to do'], rows: [
          ['Wrong transfer or "send it back"', 'A message says money was sent by mistake and asks you to return it. The first message is fake.', 'Check your real balance through your official app or by dialling the official code. Do not trust the message.'],
          ['Fake agent or customer service', 'A caller claims to be from your mobile or bank service and asks for your PIN or a code.', 'Hang up. Official staff never ask for your PIN. Call the official number from your card or website.'],
          ['Prize or lottery', 'You won a competition you never entered; you must pay a fee to receive it.', 'Ignore. Real prizes do not ask you to pay first.'],
          ['Fake job or scholarship', 'An offer asks for a registration or processing fee, or your documents and bank details.', 'Verify on the official website; real employers and scholarships do not charge fees to apply.'],
          ['Emergency from a "relative"', 'A new number claims to be a family member in trouble who needs money now.', 'Call the person on their known number first.'],
          ['Romance or investment', 'A friendly stranger builds trust, then asks for money or promises large returns.', 'Never send money to someone you have not met and cannot verify.'],
        ] } },
      { h: 'Case study: the scholarship fee', p: [
        'Juma received a message on a messaging app: Congratulations! You have been selected for a full overseas scholarship. Send a registration fee to secure your place and send a photo of your ID. He was excited and nearly paid.',
        'Instead, he searched for the scholarship on the donor organisation\'s official website. It listed no such programme and warned about the scam. The lesson: verify through an official route that you find, not through the contact details in the message.'] },
    ],
    {
      mistakes: [
        'Calling the number given in a suspicious message to check it.',
        'Paying a fee to receive a prize, job or scholarship.',
        'Giving a PIN or code to a caller who says they are from the bank or mobile service.',
        'Sending money to a new number without calling the relative on their known number.',
      ],
      exercises: [
        { q: 'A message says money was sent to you by mistake and asks you to send it back. What do you do?', a: 'Do not trust the message. Check your real balance in the official app or by dialling the official code before doing anything.' },
        { q: 'A caller says they are from your mobile-money service and asks for your PIN. What do you do?', a: 'Hang up. Official staff never ask for your PIN. Call the official number on your card or the website.' },
        { q: 'Why should a real job or scholarship never ask you to pay a fee to apply?', a: 'Real employers and scholarships do not charge fees to apply, so a fee request is a sign of a scam.' },
      ],
      quiz: [
        { q: 'A new number says it is your cousin and needs money now. First, you should:', options: ['Send the money quickly', 'Call the person on their known number', 'Reply asking for more details', 'Forward the message to friends'], answer: 1, why: 'Verify through the number you already know.' },
        { q: 'Which statement about prizes is correct?', options: ['You can pay a small fee to receive them', 'Real prizes do not ask you to pay first', 'You must send your PIN', 'They are always real if sent by SMS'], answer: 1, why: 'Having to pay first is a sign of a scam.' },
        { q: 'Official mobile or bank staff will:', options: ['Often ask for your PIN', 'Never ask for your PIN', 'Ask for your password by SMS', 'Ask for a code to fix your account'], answer: 1, why: 'A real service never asks for your PIN.' },
        { q: 'In the scholarship case, Juma was safe because he:', options: ['Paid half the fee', 'Replied to the sender', 'Checked the official website of the donor', 'Sent his ID first'], answer: 2, why: 'He verified through a route he found himself.' },
      ],
    }),

  T('scam-stv', 'Stop, Think, Verify', 'Tabia moja ya "Simama, Fikiri, Thibitisha" inakuwezesha kushinda karibu utapeli wote, hata ule mpya.',
    'Write the five steps of Stop, Think, Verify on a card in your own words and keep it near your computer or phone.',
    [
      { h: 'One habit against many scams', p: [
        'You cannot memorise every scam. New ones appear every month. But you can learn one habit that works against nearly all of them.',
        'A pause costs you nothing and removes the scammer\'s main weapon, time pressure.'] },
      { h: 'Use the habit', p: [
        'Follow these steps whenever a message asks you to click, reply, pay or share.'],
        steps: [
          'Stop. Do not click, reply, pay or share.',
          'Think. Ask: Was I expecting this? Who is it from? What do they want me to do? Does something feel urgent or too good to be true?',
          'Verify. Contact the organisation or person using a method you already trust: the official website you type yourself, the number on your card, or a call to the person on their known number.',
          'Decide. If it cannot be verified, ignore it, delete it, or report it.',
          'Report. Tell the real organisation, your school\'s IT office, or the platform. Warn friends and family.',
        ],
        tip: 'Verify using a route YOU choose, never the phone number or link inside the suspicious message.' },
      { h: 'Spot the scam: practice', p: [
        'Try these. 1: SMS saying your account is suspended, click http://mybank-verify.xyz within 2 hours. Scam: urgent threat and suspicious domain.',
        '2: An expected email from your lecturer\'s university address with lab notes. Probably safe, though stay careful with unexpected attachments. 3: You won a phone and must pay a delivery fee. Scam, because you must pay to receive a prize.',
        '4: A friend writes from an unfamiliar number asking for 100,000. Scam until verified: call the friend on the number you know. 5: Your usual app asks if you just signed in from a new device and you did not. This warns that someone else may have your password: tap No, change the password and turn on two-step verification. 6: A job you never applied for asks for your passport and bank details. Scam.'] },
    ],
    {
      mistakes: [
        'Skipping the Stop step because the message says there is no time.',
        'Verifying through the link or number inside the message itself.',
        'Ignoring a suspicious message but not reporting it, so others fall for it.',
      ],
      exercises: [
        { q: 'Explain the three steps of Stop, Think, Verify.', a: 'Stop: do not click, reply, pay or share. Think: ask who it is from and what they want. Verify: confirm through a trusted route such as the official site you type yourself.' },
        { q: 'A friend writes from an unfamiliar number asking for money. What do you do?', a: 'Treat it as a scam until verified. Call the friend on the number you already know.' },
        { q: 'Your usual app asks if you just signed in from a new device and you did not. What should you do?', a: 'Tap No, change your password and turn on two-step verification, because someone else may have your password.' },
      ],
      quiz: [
        { q: 'What is the first step of the habit?', options: ['Verify', 'Report', 'Stop', 'Reply'], answer: 2, why: 'You first pause so the time pressure disappears.' },
        { q: 'Which verification is best?', options: ['Click the link in the message', 'Call the number in the message', 'Use the number on your card or the official site you type', 'Ask the sender if they are real'], answer: 2, why: 'Use a method you already trust, not the scammer\'s details.' },
        { q: 'An email you expected from your lecturer\'s university address is:', options: ['Always a scam', 'Probably safe', 'Proof of malware', 'Never safe to open'], answer: 1, why: 'It is expected and from a known sender, though attachments still need care.' },
        { q: 'If a message cannot be verified, you should:', options: ['Act anyway', 'Ignore, delete or report it', 'Forward to everyone', 'Reply with your details'], answer: 1, why: 'Step 4 is to decide: ignore, delete or report.' },
      ],
    }),

  T('scam-malware', 'Malware and if you have clicked', 'Programu hasidi hufika hasa kwa hila kama programu za kuiba, viambatisho vya ajabu na madirisha ya uongo, kwa hiyo weka Windows Security na masasisho vimewashwa na uwe na nakala rudufu.',
    'Open Windows Security (search for it in the Start menu), click Virus & threat protection and run a Quick scan. Note the result.',
    [
      { h: 'What is malware?', p: [
        'Malware (malicious software) is any program designed to harm your computer or steal from you. It usually arrives because someone was tricked into running it, not because of a mysterious attack.',
        'Understanding the types helps you avoid them.'],
        table: { head: ['Type', 'What it does'], rows: [
          ['Virus', 'Attaches itself to a program or file and spreads when that file is opened or shared.'],
          ['Worm', 'Spreads by itself across networks without needing you to open anything.'],
          ['Trojan', 'Pretends to be a useful program (a free game or crack) but hides harmful actions.'],
          ['Spyware', 'Secretly records what you type or do and sends it away.'],
          ['Ransomware', 'Locks or encrypts your files and demands payment to unlock them.'],
          ['Adware', 'Shows unwanted adverts and may redirect your browser.'],
          ['Keylogger', 'Records every key you press, including passwords.'],
        ] } },
      { h: 'How malware reaches you and how to protect yourself', p: [
        'Common routes are free cracked software, games or movies from unofficial websites; attachments or links in phishing messages; fake pop-ups claiming Your computer is infected; infected flash drives from other people; and outdated software with known weaknesses.',
        'Protect yourself: keep Windows Security switched on and updated, install updates, download software only from official websites and stores, avoid pirated or cracked software, scan flash drives from other people, never open an unexpected attachment or enable macros from an unknown sender, and back up your files so ransomware cannot take everything.',
        'Warning: if a web page suddenly shows a loud alarm and a phone number because your computer is infected, it is always a scam. Close the tab or restart the browser; do not call the number or download the fix.'] },
      { h: 'Run a scan with Windows Security', p: [
        'A scan checks your files for known threats.'],
        steps: [
          'Click Start and type Windows Security. Open it.',
          'Click Virus & threat protection.',
          'Click Quick scan and wait for the result.',
          'If threats are found, click Start actions to remove or quarantine them.',
          'For a deeper check, click Scan options, choose Full scan and click Scan now. This may take an hour or more.',
          'Restart the computer if asked.',
        ] },
      { h: 'If you have already clicked', p: [
        'Everybody makes mistakes. The first step is not shame; it is speed. The faster you act, the smaller the damage.'],
        table: { head: ['What happened', 'What to do now'], rows: [
          ['I clicked a link but entered nothing', 'Close the page. Run a quick scan. Be careful with further messages from that sender.'],
          ['I typed my password on a fake page', 'Change it at once on the real site, then anywhere else you used it. Turn on two-step verification. Sign out of all devices.'],
          ['I gave a code or PIN to a caller', 'Contact the real bank or service immediately to block the account. Change PINs and passwords.'],
          ['I sent money', 'Call your bank or mobile-money provider at once, report fraud and give all details. Report to the police.'],
          ['I downloaded and opened a strange file', 'Disconnect from the internet, run a full scan, change important passwords from another safe device, and ask for technical help.'],
        ] } },
    ],
    {
      mistakes: [
        'Installing cracked or pirated software to save money. It is a common way malware arrives.',
        'Calling the phone number on a fake infection pop-up.',
        'Delaying after being tricked. Speed reduces the damage.',
        'Having no backup, so ransomware can cost you all your files.',
      ],
      exercises: [
        { q: 'What is ransomware, and how does a backup help against it?', a: 'Ransomware locks or encrypts your files and demands payment. With a backup you can restore your files without paying.' },
        { q: 'What should you do if you typed your password on a fake page?', a: 'Change that password at once on the real site and anywhere else you used it, turn on two-step verification and sign out of all devices.' },
        { q: 'Give three ways to protect yourself from malware.', a: 'Keep Windows Security and updates on, download only from official sources, never open unexpected attachments, and keep backups.' },
        { q: 'What is the difference between a virus and a worm?', a: 'A virus attaches to a file and spreads when it is opened or shared. A worm spreads by itself across networks without you opening anything.' },
      ],
      quiz: [
        { q: 'Which is malware that locks your files and asks for payment?', options: ['Adware', 'A browser', 'Ransomware', 'A firewall'], answer: 2, why: 'Ransomware encrypts files and demands payment.' },
        { q: 'A trojan is:', options: ['A program that spreads by itself', 'Harmful software disguised as something useful', 'An advert program', 'A scan tool'], answer: 1, why: 'A trojan pretends to be useful, like a free game or crack.' },
        { q: 'A page shows a loud alarm and a phone number saying you are infected. You should:', options: ['Call the number', 'Download the fix', 'Close the tab or restart the browser', 'Pay immediately'], answer: 2, why: 'Such pages are always scams; your real antivirus never shows them in a browser.' },
        { q: 'Where do you run a quick scan?', options: ['Windows Security, Virus & threat protection', 'Recycle Bin', 'Notepad', 'File Explorer address bar'], answer: 0, why: 'Windows Security has Virus & threat protection with Quick scan.' },
        { q: 'You sent money to a scammer. First you should:', options: ['Wait a week', 'Call your bank or mobile-money provider at once', 'Delete the messages', 'Send more to get it back'], answer: 1, why: 'Speed matters; report the fraud immediately.' },
      ],
    }),
];
