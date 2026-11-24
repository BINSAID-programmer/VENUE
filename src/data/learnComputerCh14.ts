import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 14: Privacy, netiquette and digital well-being (from Digital Foundations by Binsaid). */
export const CB_CH14: LearnLesson[] = [
  T('priv-footprint', 'Your digital footprint', 'Kila unachofanya mtandaoni huacha alama zinazoitwa nyayo za kidijitali, na zinaweza kudumu miaka mingi hata ukifuta chapisho.',
    'Search your own name in quotation marks in a search engine. Write down what you find, or note that there is nothing.',
    [
      { h: 'Traces you leave', p: [
        'Every time you use the internet you leave traces. You post a photo, search for a word, like a video, sign up for a website, or even simply visit a page. Together these traces form your digital footprint: the trail of data that shows who you are, what you do and what you like.'] },
      { h: 'Two kinds of footprint', p: [
        'Some of your footprint you create on purpose, and some is collected without you typing anything.'],
        table: { head: ['Kind', 'Meaning', 'Examples'], rows: [
          ['Active footprint', 'Information you deliberately share.', 'Posts, comments, photos, emails, forms, uploaded videos.'],
          ['Passive footprint', 'Information collected about you without you typing it.', 'Websites you visit, searches, location data, device details, adverts you click.'],
        ] } },
      { h: 'Why your footprint matters', p: [
        'It lasts. Something posted just for fun can be copied, saved and shared by others even after you delete it. It is searchable: teachers, scholarship committees and employers often search for candidates online.',
        'It can be used by criminals, because details such as your birthday, school, home area and travel plans help scammers and thieves. It also builds your reputation: positive content, such as a good project or a helpful answer, can help you.'],
        tip: 'Once in a while, search your own name in quotation marks. That is what a stranger would see. If you find something you do not want public, ask the site or person to remove it, or tighten your privacy settings.' },
    ],
    {
      mistakes: [
        'Believing that deleting a post removes every copy of it.',
        'Thinking only what you type counts. Visits, searches and location are collected too.',
        'Never checking what a stranger can find about you.',
      ],
      exercises: [
        { q: 'What is a digital footprint? Give two examples each of active and passive footprint.', a: 'It is the trail of data created by your online activity. Active: posts and emails. Passive: websites you visit and location data.' },
        { q: 'Why can a post you delete still cause problems later?', a: 'Others may already have copied, saved or shared it, so it can last after you delete it.' },
        { q: 'Why does your footprint matter for scholarships and jobs?', a: 'Teachers, scholarship committees and employers often search candidates online, so what they find affects your reputation.' },
      ],
      quiz: [
        { q: 'Which is part of your passive digital footprint?', options: ['A photo you post', 'A comment you write', 'The websites you visit being recorded', 'An email you send'], answer: 2, why: 'Passive data is collected without you typing it.' },
        { q: 'An active footprint is:', options: ['Data collected secretly', 'Information you deliberately share', 'Only your passwords', 'Your device details'], answer: 1, why: 'Posts, comments and forms are shared on purpose.' },
        { q: 'Why search your own name?', options: ['To speed up the internet', 'To see what a stranger would see', 'To delete your account', 'To find passwords'], answer: 1, why: 'It shows how others see you online.' },
        { q: 'Which detail helps scammers and thieves?', options: ['A school project', 'Your birthday, school and travel plans', 'A favourite book', 'A study tip'], answer: 1, why: 'Personal details and travel plans can be misused.' },
      ],
    }),

  T('priv-share', 'What to share and what to keep private', 'Panga taarifa katika vikundi vitatu (siri, kikomo, wazi) na usishiriki nywila, PIN, namba ya kitambulisho wala anwani ya nyumbani hadharani.',
    'Write ten pieces of information about yourself and put each in the Private, Limited or Public group.',
    [
      { h: 'Privacy means choosing', p: [
        'Privacy does not mean hiding everything. It means choosing carefully what you share, with whom, and for what reason. A simple way to decide is to sort information into three groups.'],
        table: { head: ['Group', 'Examples', 'Rule'], rows: [
          ['Private: do not share online', 'Passwords, PINs, verification codes, ID numbers, bank and card details, photographs of documents, home address with maps, private photos.', 'Keep it to yourself, or share only with a trusted official organisation after verifying it.'],
          ['Limited: share only with people you trust', 'Phone number, date of birth, school or workplace, daily routine, travel plans, family details.', 'Share only with selected friends, not in public posts.'],
          ['Public: safe to share', 'Learning projects, general opinions expressed respectfully, achievements you are happy for anyone to see.', 'Still think before you post.'],
        ] } },
      { h: 'Using the three groups', p: [
        'Before you post or fill in a form, ask which group the information belongs to. If it is private, do not share it online. If it is limited, share it only with people you trust, such as selected friends, and not in a public post.',
        'Public information is safe, but it still deserves a moment of thought, because it becomes part of your digital footprint.'] },
      { h: 'Do not announce when you are away', p: [
        'Warning: posting Our whole family is travelling for two weeks tells thieves that your home is empty. Share holiday pictures after you return, and not in real time.'] },
    ],
    {
      mistakes: [
        'Posting a photo of an ID card, ticket or bank card.',
        'Sharing travel plans in real time on public posts.',
        'Putting your phone number and home area in a public profile.',
      ],
      exercises: [
        { q: 'Give three examples of information you should keep private.', a: 'Passwords, PINs and verification codes, ID numbers, bank and card details, or photographs of documents.' },
        { q: 'Which group is a daily routine in, and what is the rule for it?', a: 'Limited. Share it only with selected friends, not in public posts.' },
        { q: 'Why should you share holiday pictures after you return?', a: 'Posting in real time tells thieves your home is empty.' },
      ],
      quiz: [
        { q: 'Which information should you never share in a public post?', options: ['A favourite book', 'Your ID number and home address', 'A study tip', 'A finished school project'], answer: 1, why: 'ID numbers and home addresses are private.' },
        { q: 'A travel plan belongs in which group?', options: ['Private', 'Limited', 'Public', 'None'], answer: 1, why: 'Limited: only for trusted people, not public posts.' },
        { q: 'A respectful opinion or a finished project is generally:', options: ['Private', 'Limited', 'Public, but think before you post', 'Illegal to share'], answer: 2, why: 'Public information is safe, but you should still think first.' },
        { q: 'Privacy means:', options: ['Hiding everything', 'Choosing carefully what to share and with whom', 'Sharing everything', 'Deleting your accounts'], answer: 1, why: 'It is about choices, not hiding all.' },
      ],
    }),

  T('priv-settings', 'Taking control of privacy settings', 'Programu nyingi huanza na mipangilio inayopendelea kushiriki, kwa hiyo pitia mipangilio ya faragha na ruhusa za programu mara kwa mara.',
    'Open the privacy settings of one account and your phone\'s permission manager. Remove at least one unnecessary permission.',
    [
      { h: 'Defaults favour sharing', p: [
        'Websites and apps usually start with settings that favour sharing. You can change them. The exact menus differ, but the following checklists apply almost everywhere.'] },
      { h: 'Review a social media account', p: [
        'Do this for each account you use, and repeat it from time to time.'],
        steps: [
          'Open the app or website and find Settings (often under your profile picture or a menu icon).',
          'Open Privacy (sometimes called Privacy and safety).',
          'Set your account or posts to friends only or private, if offered.',
          'Check who can find you by phone number or email, and who can message you, and restrict them.',
          'Turn off location sharing for photos and posts.',
          'Review tagging: choose to approve tags before they appear on your profile.',
          'Open Security and Apps and websites; remove apps you no longer use.',
          'Review your friends or followers list and remove people you do not know.',
          'Check your profile as a stranger would see it, using View as or the preview option if offered.',
        ] },
      { h: 'Check app permissions on your phone', p: [
        'A permission is access an app has to your camera, location, contacts and so on. A torch app does not need your contacts.'],
        steps: [
          'Open Settings on your phone and find Privacy or Apps.',
          'Tap Permission manager (the wording may differ).',
          'Look at sensitive permissions: Camera, Microphone, Location, Contacts, Photos.',
          'For each, see which apps have access. Remove permission from apps that do not need it.',
          'For location choose Allow only while using the app whenever possible.',
        ] },
      { h: 'In your browser', p: [
        'Delete cookies and history from time to time. Use a private window on shared computers; it does not save history on that device.',
        'Be careful with Allow notifications and Allow location pop-ups; click Block unless you want them. Before accepting terms and conditions for important services, at least look for what data they collect and why.'] },
    ],
    {
      mistakes: [
        'Keeping the default settings, which usually favour sharing.',
        'Giving every app access to camera, microphone, location and contacts.',
        'Clicking Allow on every pop-up without reading it.',
        'Leaving old apps connected to your account.',
      ],
      exercises: [
        { q: 'Describe the steps for checking the permissions of apps on your phone.', a: 'Open Settings, go to Privacy or Apps, open the permission manager, look at Camera, Microphone, Location, Contacts and Photos, and remove permission from apps that do not need it.' },
        { q: 'Which location setting is best for most apps?', a: 'Allow only while using the app.' },
        { q: 'Why use a private window on a shared computer?', a: 'It does not save your history on that device.' },
      ],
      quiz: [
        { q: 'A torch app asks for your contacts. You should:', options: ['Allow it', 'Remove or refuse the permission', 'Share your PIN', 'Ignore it'], answer: 1, why: 'A torch app does not need contacts.' },
        { q: 'A good setting for tags on your profile is:', options: ['Show all tags automatically', 'Approve tags before they appear', 'Allow everyone to tag', 'Turn off passwords'], answer: 1, why: 'Approving tags gives you control.' },
        { q: 'Websites and apps usually start with settings that:', options: ['Favour privacy', 'Favour sharing', 'Block everything', 'Delete your data'], answer: 1, why: 'You often have to tighten settings yourself.' },
        { q: 'A notification or location pop-up you do not need should be:', options: ['Allowed', 'Blocked', 'Shared', 'Saved'], answer: 1, why: 'Click Block unless you want them.' },
      ],
    }),

  T('priv-netiquette', 'Think before you post and netiquette', 'Kabla ya kuchapisha jiulize ni kweli, ni ya wema, ni ya lazima na ni ya faragha, na andika barua pepe rasmi kwa heshima na uwazi.',
    'Write a short email to a real or imaginary lecturer using the professional format and save it as Practice_Email.',
    [
      { h: 'The pause questions', p: [
        'Once something is online, you lose control of it. A photo can be copied and sent to thousands of people in minutes. A rude comment can be screenshotted. The best protection is a short pause before you post.'],
        steps: [
          'Is it true? Do I know this is correct, or am I just repeating a rumour?',
          'Is it kind? Would I say it to the person\'s face?',
          'Is it necessary? Does it help or add something, or am I reacting in anger?',
          'Is it private? Does it reveal my details, or someone else\'s, that were not mine to share?',
          'Would I be happy if my teacher, my family or a future employer saw it?',
          'Do I have permission? Did the people in the picture agree?',
        ],
        tip: 'The 24-hour rule: if you are angry, write your reply but wait before you send it.' },
      { h: 'Netiquette: good manners online', p: [
        'Netiquette is a mixture of network and etiquette. Text on a screen has no tone of voice, face or gesture, so it is easy to be misunderstood.'],
        table: { head: ['Rule', 'Explanation'], rows: [
          ['Be respectful', 'Treat others as you wish to be treated. Disagree with ideas, not people.'],
          ['Do not write in ALL CAPITALS', 'It looks like shouting.'],
          ['Be clear and brief', 'Use plain words; avoid confusing abbreviations in formal messages.'],
          ['Check before you send', 'Read the message, check the recipient and watch Reply all.'],
          ['Respect privacy', 'Do not forward private messages or photos without permission.'],
          ['Give credit', 'Name the author or source when you share another person\'s work.'],
          ['Think about tone', 'A joke can look rude without a smile.'],
          ['Use the right channel', 'Formal matters go by email, not casual chat with emoji.'],
        ] } },
      { h: 'Write a professional email', p: [
        'Example: Subject: Request for extension - Assignment 2. Dear Dr Mwangi, I am a first-year student in your Introduction to Computing class (Group B). I write to ask for a two-day extension for Assignment 2. I was ill from Monday to Wednesday and have a medical note, attached. Thank you for considering my request. Kind regards, Amina Hassan, BSc Mathematics and Statistics, Reg. No. 2026/1234.'],
        steps: [
          'Subject line: short and specific.',
          'Greeting: use the person\'s title and name, such as Dear Dr Mwangi.',
          'Opening sentence: say who you are and why you write.',
          'Body: details in one or two short paragraphs, polite and clear about what you ask.',
          'Closing: thank them and say what you hope for.',
          'Sign-off: Kind regards, then your full name, course and registration number.',
          'Check: read it aloud, check spelling and attach any files you mention.',
        ],
        tip: 'In study groups, agree on simple rules: who posts what, no private pictures without permission, no insults, and quiet hours at night. Mute a distracting group rather than leaving without a word.' },
    ],
    {
      mistakes: [
        'Replying in anger and sending at once.',
        'Forwarding private messages or photos without permission.',
        'Using casual chat language and emoji for a formal request to a lecturer.',
        'Pressing Reply all without checking who will receive it.',
      ],
      exercises: [
        { q: 'Explain the think-before-you-post questions in your own words.', a: 'Ask whether it is true, kind, necessary and private, whether you would be happy if a teacher or employer saw it, and whether you have permission to share it.' },
        { q: 'List five rules of netiquette.', a: 'Be respectful, avoid ALL CAPITALS, be clear and brief, check before you send, respect privacy, give credit.' },
        { q: 'What goes in a good subject line?', a: 'A short, specific summary, for example Request for extension - Assignment 2, Group B.' },
      ],
      quiz: [
        { q: 'Writing a message in ALL CAPITALS usually looks like:', options: ['Politeness', 'A formal style', 'A secret code', 'Shouting'], answer: 3, why: 'Capitals read as shouting.' },
        { q: 'The 24-hour rule says to:', options: ['Reply instantly', 'Wait before sending an angry reply', 'Delete all posts daily', 'Post every day'], answer: 1, why: 'Feelings change; waiting prevents regret.' },
        { q: 'A request to a lecturer should usually go by:', options: ['A chat message with emoji', 'A professional email', 'A public post', 'A voice note only'], answer: 1, why: 'Formal matters use email.' },
        { q: 'Netiquette combines:', options: ['Network and etiquette', 'Net and equity', 'Network and quiz', 'Internet and tickets'], answer: 0, why: 'It means good manners online.' },
        { q: 'You want to share a friend\'s photo. First you should:', options: ['Post it', 'Ask permission', 'Tag everyone', 'Edit it'], answer: 1, why: 'Do you have permission? is one of the pause questions.' },
      ],
    }),

  T('priv-wellbeing', 'Cyberbullying and digital well-being', 'Ukionewa mtandaoni usijibu, hifadhi ushahidi, mzuie, ripoti na mwambie mtu unayemwamini; na tumia teknolojia kwa makusudi ili isikutawale.',
    'Check your screen-time report for the last week. Write the three apps that used most time and decide on one change.',
    [
      { h: 'What is cyberbullying?', p: [
        'Cyberbullying is the use of digital tools to hurt, threaten, embarrass or exclude someone repeatedly. It can happen through messages, comments, group chats, fake accounts, shared photos or spreading rumours. It can feel worse than bullying in person, because it can follow you home and a large audience may see it.',
        'Examples include threatening or insulting messages, posting an embarrassing photo or video without permission, creating a fake profile to mock someone, excluding a person on purpose, and sharing private information (doxxing).'] },
      { h: 'If it happens to you', p: [
        'Being a victim is never your fault.'],
        steps: [
          'Do not reply or retaliate. It often makes things worse.',
          'Save the evidence: screenshots with dates, names and web addresses.',
          'Block the person and report them to the platform.',
          'Tell someone you trust: a family member, teacher, counsellor or friend.',
          'Tighten your privacy settings and change passwords if your accounts were targeted.',
          'If there are threats, blackmail or sharing of private images, report it to the school and the police.',
        ],
        tip: 'If you see it happening to someone else: do not share, like or laugh. Support the person privately and report the content. Never forward or save private images of another person, especially under 18; in many places this is a serious crime.' },
      { h: 'Digital well-being', p: [
        'Phones, games and social media are made to keep your attention. That is not always bad, but it can crowd out sleep, study, exercise and real conversations. Digital well-being means using technology so that it serves you, rather than controlling you.',
        'Warning signs: you feel anxious or irritable without your phone, stay awake at night scrolling, your work suffers, you compare your life with polished pictures of others, or you spend less time with people in person.'] },
      { h: 'Healthy habits', p: [
        'The goal is not to avoid technology but to use it deliberately. Ask yourself: Is this helping me do what I want to do, or is it just taking my time?'],
        table: { head: ['Habit', 'How to do it'], rows: [
          ['Set limits', 'Use screen-time or digital-well-being tools to see where your time goes and set app limits.'],
          ['Protect your sleep', 'Stop using screens 30 to 60 minutes before bed and keep the phone out of reach while you sleep.'],
          ['Silence notifications', 'Turn off unimportant alerts and choose when to check.'],
          ['Take breaks', 'For every 20 minutes at the screen, look at something distant for 20 seconds, and stand up each hour.'],
          ['Study with focus', 'Put the phone in another room or use Do not disturb.'],
          ['Be active and social', 'Make time for exercise, outdoor activity and face-to-face friendship.'],
          ['Curate your feed', 'Unfollow accounts that make you feel bad; follow those that teach and inspire.'],
        ] } },
    ],
    {
      mistakes: [
        'Replying angrily to a bullying message.',
        'Deleting evidence before saving screenshots.',
        'Facing bullying alone instead of telling someone you trust.',
        'Using the phone in bed late at night.',
      ],
      exercises: [
        { q: 'What should you do if someone is bullying you online?', a: 'Do not reply. Save evidence, block and report the person, tell someone you trust, and tighten privacy settings.' },
        { q: 'Suggest four habits that protect your well-being around technology.', a: 'Set app limits, stop screens before bed, silence unimportant notifications, take breaks, study with the phone away, stay active.' },
        { q: 'What is the 20-20 break habit?', a: 'For every 20 minutes at the screen, look at something distant for 20 seconds, and stand up each hour.' },
      ],
      quiz: [
        { q: 'A good first reaction to a bullying message is:', options: ['Reply angrily', 'Forward it to all friends', 'Save evidence, block and report', 'Delete your account without telling anybody'], answer: 2, why: 'Evidence, blocking and reporting protect you.' },
        { q: 'Cyberbullying is:', options: ['One friendly joke', 'Using digital tools to repeatedly hurt or embarrass someone', 'A computer virus', 'A privacy setting'], answer: 1, why: 'It is repeated harm through digital tools.' },
        { q: 'How long before bed should you stop using screens?', options: ['5 minutes', '30 to 60 minutes', '3 hours', 'Never'], answer: 1, why: 'The book recommends 30 to 60 minutes.' },
        { q: 'Forwarding a private image of a person under 18 is:', options: ['Harmless', 'In many places a serious crime', 'Required', 'A privacy setting'], answer: 1, why: 'Even if you did not take the picture.' },
      ],
    }),
];
