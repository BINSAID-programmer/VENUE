import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 11: Research skills and judging information (from Digital Foundations by Binsaid). */
export const CB_CH11: LearnLesson[] = [
  T('rs-judge', 'Why we must judge information', 'Mtandao una taarifa nzuri na mbaya zinazofanana; matokeo ya juu kwenye utafutaji si lazima yawe ya kuaminika, kwa hiyo lazima uyahakiki.',
    'Open a search engine, search any topic, and look at the top three results. For each one, write one reason you might trust it and one reason you might not.',
    [
      { h: 'Good and bad information look alike', p: [
        'The internet contains excellent information and terrible information, and they often look equally professional. Anyone can publish a page, a video or a post in minutes. Some people make honest mistakes, while others deliberately spread false stories to make money, win arguments or cause fear.',
        'A student who believes everything will make poor decisions and write poor assignments.'] },
      { h: 'A search result is not automatically reliable', p: [
        'Academic research means finding, evaluating and using information to answer a question. The word evaluating is the heart of it.',
        'A result is not reliable just because it appears near the top of the page, because it is well designed, or because many people shared it.'] },
      { h: 'Kinds of false or misleading information', p: [
        'Knowing the common kinds helps you spot them. Not all of them are lies; some are simply old or one-sided.'],
        table: { head: ['Kind', 'What it is', 'Example'], rows: [
          ['Mistake', 'An honest error by the author.', 'A wrong date in an article.'],
          ['Out-of-date information', 'Was true once, but things have changed.', 'An old page about software that has been updated.'],
          ['Misleading headline', 'A true story with an exaggerated or false title.', '"Scientists say computers will end school!"'],
          ['Rumour and hoax', 'A false story that spreads quickly.', 'A forwarded message about a made-up danger.'],
          ['Biased content', 'True facts presented in a one-sided way to persuade.', 'A company page claiming its product is the only choice.'],
          ['Fake or manipulated media', 'Edited pictures, videos or documents.', 'A photograph from another event shared as new.'],
        ] } },
    ],
    {
      mistakes: [
        'Trusting a result because it is first on the page.',
        'Believing a page because it looks professional or well designed.',
        'Trusting a post because many people shared it.',
        'Treating all wrong information as lies; many errors are honest mistakes or old facts.',
      ],
      exercises: [
        { q: 'Why is a search result not automatically reliable?', a: 'Anyone can publish anything. Being near the top, well designed or widely shared does not prove that it is true.' },
        { q: 'What does "evaluating" mean in academic research?', a: 'Judging whether information is good enough to use, instead of simply accepting it.' },
        { q: 'Name three kinds of false or misleading information and give an example of one.', a: 'For example a mistake, out-of-date information and a misleading headline. A misleading headline is a true story with an exaggerated title.' },
      ],
      quiz: [
        { q: 'Which is the best reason NOT to trust a result automatically?', options: ['It is in English', 'Anyone can publish a page in minutes', 'It has pictures', 'It loads slowly'], answer: 1, why: 'Because publishing is easy, good and bad information both appear online.' },
        { q: 'A page about software that has since been updated is an example of what?', options: ['Rumour', 'Biased content', 'Out-of-date information', 'Fake media'], answer: 2, why: 'It was true once, but things have changed.' },
        { q: 'A photograph from another event shared as if it were new is called what?', options: ['Fake or manipulated media', 'An honest mistake', 'A primary source', 'A reference'], answer: 0, why: 'It presents real or edited media in a misleading way.' },
        { q: 'A company page that says its product is the only choice is mainly what?', options: ['A typing error', 'Biased content', 'A peer-reviewed article', 'An old page'], answer: 1, why: 'Biased content uses true facts in a one-sided way to persuade.' },
        { q: 'What is the heart of academic research?', options: ['Copying', 'Evaluating information', 'Sharing quickly', 'Finding the longest page'], answer: 1, why: 'Research is finding, evaluating and using information, and evaluating is the heart of it.' },
      ],
    }),

  T('rs-craap', 'The CRAAP test', 'Jaribio la CRAAP linakagua chanzo kwa mambo matano: Currency, Relevance, Authority, Accuracy na Purpose.',
    'Pick one web page you used recently and answer the five CRAAP questions for it. Decide: use, use with care, or reject.',
    [
      { h: 'A checklist for judging a source', p: [
        'Librarians and teachers use a simple checklist to judge a source. The name is an acronym of five checks: Currency, Relevance, Authority, Accuracy and Purpose. Use it on every source you plan to rely on.'],
        table: { head: ['Check', 'Questions to ask'], rows: [
          ['Currency', 'When was it published or updated? Is it current enough for this topic? (A computer-history page can be old; a page about the latest software cannot.)'],
          ['Relevance', 'Does it answer your question? Is it suitable for your level, neither too simple nor too advanced?'],
          ['Authority', 'Who wrote it? What are the author\'s qualifications? Which organisation published it? Can you contact them?'],
          ['Accuracy', 'Are the claims supported by evidence? Are there references? Can you confirm the facts in other sources? Are there spelling and grammar mistakes?'],
          ['Purpose', 'Is the page trying to inform, teach, sell, entertain or persuade? Is there advertising? Is the author biased?'],
        ] } },
      { h: 'Step by step: test a source', p: [
        'Work through these steps in order. They turn the five checks into actions you can do in a few minutes.'],
        steps: [
          'Look at the web address. Does the domain belong to a known organisation? Is it an official site, for example a university or a government?',
          'Find the "About" page or the author\'s name. Search for the author or organisation separately.',
          'Find the date, at the top or bottom of the page. No date at all is a warning.',
          'Read a few claims carefully. Are numbers and facts given with references?',
          'Check the purpose. Are there adverts, a shop, or a strong demand to buy, share or donate?',
          'Search for the same facts elsewhere. Do other reliable sources agree?',
          'Decide: use the source, use it with care, or reject it. Record your reasons.',
        ] },
      { h: 'Worked example: testing two sources', p: [
        'You need to explain what RAM is. Source A is a page on a university computing department site, written by a named lecturer, last updated this year, with diagrams and references. Source B is an anonymous blog with advertisements, no date and a title "Secrets computer shops don\'t want you to know!!!".',
        'Source A scores well on authority, currency and purpose; Source B scores poorly on all three. You would use A, and perhaps cross-check with a textbook. You would not rely on B, although it may still point you towards ideas worth checking.'] },
    ],
    {
      mistakes: [
        'Skipping the date. A page with no date at all is a warning sign.',
        'Judging only by how the page looks instead of who wrote it and what evidence it gives.',
        'Not asking whether the page is trying to sell or persuade.',
        'Making a decision without recording the reasons.',
      ],
      exercises: [
        { q: 'What does each letter of CRAAP stand for?', a: 'Currency, Relevance, Authority, Accuracy and Purpose.' },
        { q: 'Give one question for each of Currency, Authority and Purpose.', a: 'Currency: when was it published or updated? Authority: who wrote it and which organisation published it? Purpose: is it trying to inform, sell or persuade?' },
        { q: 'Why did Source A beat Source B in the RAM example?', a: 'A has a named lecturer, a university site, a recent update and references. B is anonymous, undated and full of adverts with a sensational title.' },
        { q: 'List the three possible decisions at the end of testing a source.', a: 'Use the source, use it with care, or reject it, and write down the reasons.' },
      ],
      quiz: [
        { q: 'What does the "A" for Authority ask?', options: ['Is it attractive?', 'Who wrote it and who published it?', 'Is it long?', 'Is it free?'], answer: 1, why: 'Authority is about the author\'s qualifications and the publishing organisation.' },
        { q: 'Which check asks "Is the page trying to inform, teach, sell or persuade?"', options: ['Currency', 'Relevance', 'Accuracy', 'Purpose'], answer: 3, why: 'Purpose looks at why the page exists, including advertising and bias.' },
        { q: 'A page has no date anywhere. What does the book say?', options: ['It is perfect', 'It is a warning sign', 'It is always old', 'Dates do not matter'], answer: 1, why: 'No date is a warning, because you cannot judge currency.' },
        { q: 'Which check asks whether the facts can be confirmed in other sources?', options: ['Accuracy', 'Currency', 'Purpose', 'Relevance'], answer: 0, why: 'Accuracy checks evidence, references and agreement with other sources.' },
        { q: 'A computer-history page can be old, but a page about the latest software cannot. Which check is this?', options: ['Authority', 'Currency', 'Purpose', 'Relevance'], answer: 1, why: 'Currency asks whether the date suits the topic.' },
      ],
    }),

  T('rs-sources', 'Types of source and cross-checking', 'Vyanzo tofauti vina viwango tofauti vya kuaminika, na ukweli muhimu uuhakiki katika vyanzo viwili au vitatu huru (triangulation).',
    'Pick one fact you recently read online. Find it in two other independent sources and note whether they agree.',
    [
      { h: 'Types of source', p: [
        'Different kinds of source carry different levels of reliability. No type is perfect, and a good source of one type can beat a poor source of another, but this guide helps you decide how much checking is needed.'],
        table: { head: ['Source type', 'Possible strength', 'What to check'], rows: [
          ['Official university or government website', 'Best for official programmes, notices and rules.', 'Confirm the domain and the date.'],
          ['Peer-reviewed journal article', 'Reviewed by experts; gives methods and evidence.', 'Check the journal, authors and study limits.'],
          ['Recognised textbook', 'Structured, reliable explanations.', 'Check the edition and relevance.'],
          ['Educational website', 'Can explain beginner ideas clearly.', 'Check the author, references and update date.'],
          ['News article', 'Reports recent events.', 'Check the publisher and whether others report the same.'],
          ['Social media post', 'May point you to discussions or resources.', 'Do not accept unsupported claims as facts.'],
          ['Anonymous blog or forum', 'May contain personal experience or opinion.', 'Check evidence and compare with stronger sources.'],
        ] } },
      { h: 'Primary and secondary sources', p: [
        'A primary source is original material: a diary, an interview, a photograph taken at the time, a set of experiment results. A secondary source discusses or explains primary sources: a textbook, a review, a documentary.',
        'Both are useful, but they answer different questions. When possible, find out where a claim originally came from.'] },
      { h: 'Using Google Scholar', p: [
        'Google Scholar searches scholarly writing such as articles and papers. It is a good place to find stronger sources for a beginner topic.'],
        steps: [
          'Open your browser and go to scholar.google.com.',
          'Type your topic in the search box, for example information processing cycle computer. Press Enter.',
          'Look at each result\'s title, authors, journal or publisher, and year. Click "Cited by" to see how many later works used it.',
          'If a link on the right says [PDF], click it to try to read the full text. Some articles are free; others are behind a payment, which your school library may be able to open for you.',
          'Record the details in your notes, and then check the paper\'s credibility with CRAAP.',
        ] },
      { h: 'Cross-checking: do not trust one source', p: [
        'Even a good source may contain a mistake. A strong habit is triangulation: check an important fact in at least two or three independent sources. If they agree, you can be more confident. If one disagrees, investigate why.'],
        tip: 'Read laterally: instead of staying on a suspicious page, open a new tab and search for the name of the site or author to see what others say about them.' },
      { h: 'Fact-checking tricks', p: [
        'Check the date of images and videos. Right-click a picture and look for "Search image with..." in your browser to see where else it has appeared.',
        'Beware strong emotions: posts designed to make you very angry or frightened are often exaggerations, so pause before you share. Ask who benefits, meaning whether the author makes money if you believe this. And look for the original: if a post says "a study shows...", find the study.'] },
    ],
    {
      mistakes: [
        'Relying on one source for an important fact.',
        'Accepting unsupported social media claims as facts.',
        'Staying on a suspicious page instead of searching for what others say about it.',
        'Sharing an angry or frightening post before checking it.',
      ],
      exercises: [
        { q: 'Explain the difference between a primary and a secondary source with an example of each.', a: 'A primary source is original material, such as a diary or experiment results. A secondary source explains or discusses primary sources, such as a textbook or documentary.' },
        { q: 'What is triangulation and why is it useful?', a: 'It means checking an important fact in two or three independent sources. If they agree you can be more confident; if not, you investigate why.' },
        { q: 'Why check a peer-reviewed article\'s journal, authors and study limits?', a: 'Peer review helps, but no type of source is perfect, so you still check where it came from and what the study can and cannot show.' },
        { q: 'A post says "a study shows..." What should you do?', a: 'Look for the original study instead of trusting the post.' },
      ],
      quiz: [
        { q: 'Which is a primary source?', options: ['A textbook', 'A documentary', 'A diary written at the time', 'A review article'], answer: 2, why: 'Primary sources are original material such as diaries, interviews and experiment results.' },
        { q: 'What is triangulation?', options: ['Drawing a triangle', 'Checking a fact in several independent sources', 'Copying a source', 'Using only one source'], answer: 1, why: 'Confidence grows when independent sources agree.' },
        { q: 'What does reading laterally mean?', options: ['Reading from right to left', 'Opening a new tab to search what others say about the site or author', 'Reading very fast', 'Reading only the headline'], answer: 1, why: 'You leave the suspicious page and check the site or author elsewhere.' },
        { q: 'How should you treat a social media post?', options: ['As a final fact', 'As a pointer to check, not an unsupported fact', 'As a primary source always', 'As a textbook'], answer: 1, why: 'It may point you to discussions or resources, but unsupported claims are not facts.' },
        { q: 'What does the "Cited by" link in Google Scholar show?', options: ['The price', 'How many later works used it', 'The author\'s age', 'The page colour'], answer: 1, why: 'It shows how many later works used the paper.' },
      ],
    }),

  T('rs-notes', 'Taking notes in your own words', 'Soma, funga chanzo, andika wazo kwa maneno yako, kisha rekodi chanzo mara moja; hivyo hutachanganya maneno yako na ya wengine.',
    'Take a short paragraph from any page, then write its main idea in your own words without looking, and record the source details.',
    [
      { h: 'Why notes matter', p: [
        'Good notes are the bridge between reading and writing honestly. Copying and pasting passages into your notes makes it easy to forget which words are yours and which are not.'] },
      { h: 'Step by step: take notes without copying', p: [
        'The idea is simple: understand first, then write from memory.'],
        steps: [
          'Read the whole passage until you understand it.',
          'Close or look away from the source.',
          'Write the main idea from memory, in your own words and sentence structure.',
          'Check against the original that your note is correct, and add important numbers or names.',
          'Record the source immediately: title, author or organisation, date, web address and the date you accessed it.',
          'If you want the exact words, copy them, put them in quotation marks, and note where they came from.',
        ] },
      { h: 'Paraphrasing: a worked example', p: [
        'Original: "RAM is volatile memory that temporarily stores the data and instructions the processor needs while programs are running. Its contents are lost when the power is switched off."',
        'Poor (almost copied): "RAM is volatile memory that temporarily stores the data and instructions the processor needs while programs run. Its contents are lost when power is off." This only swaps a few words.',
        'Good (own words): "RAM is the computer\'s short-term workspace. It keeps whatever the processor is using at the moment, so everything in it disappears once the computer loses power. (RAM article, Example University, 2026)". It expresses the same idea in a new way and gives the source in brackets.'] },
    ],
    {
      mistakes: [
        'Copying and pasting passages into notes, so you forget which words are yours.',
        'Changing only a few words and calling it a paraphrase.',
        'Recording the source later, when you may have forgotten it.',
        'Copying exact words without quotation marks.',
      ],
      exercises: [
        { q: 'Write the six steps for taking notes without copying.', a: 'Read the passage, look away, write the main idea from memory in your own words, check it against the original, record the source at once, and put any exact words in quotation marks with their source.' },
        { q: 'Paraphrase: "A web browser is an application that lets a user open websites and view pages."', a: 'For example: A browser is the program you use to visit and look at websites. (Any correct idea in new words and sentence structure, with the source credited.)' },
        { q: 'Why is a near-copy with a few swapped words a poor paraphrase?', a: 'It keeps the original wording and structure, so the words are not really yours.' },
        { q: 'Which details should you record about a source?', a: 'Title, author or organisation, date, web address and the date you accessed it.' },
      ],
      quiz: [
        { q: 'What should you do right after reading a passage you want to note?', options: ['Paste it', 'Look away and write the idea from memory', 'Delete it', 'Change one word'], answer: 1, why: 'Writing from memory forces you to use your own words.' },
        { q: 'When should you record the source?', options: ['At the end of the semester', 'Immediately', 'Never', 'Only for exact quotes'], answer: 1, why: 'Recording it at once means you will not lose it.' },
        { q: 'Which is a good paraphrase habit?', options: ['Swap a few words', 'Same structure, new words', 'New words and new sentence structure, plus the source', 'Copy with no notice'], answer: 2, why: 'A good paraphrase expresses the idea in a new way and gives credit.' },
        { q: 'You want the exact words of a source. What do you do?', options: ['Copy them in quotation marks and note the source', 'Copy them without marks', 'Rewrite one word', 'Skip the source'], answer: 0, why: 'Exact words need quotation marks and a note of where they came from.' },
        { q: 'Why check your note against the original?', options: ['To make it longer', 'To be sure it is correct and add key numbers or names', 'To copy it', 'To delete it'], answer: 1, why: 'Writing from memory can miss details, so you verify it.' },
      ],
    }),

  T('rs-honesty', 'Academic honesty, plagiarism and copyright', 'Uaminifu wa kitaaluma ni kukiri vyanzo; wizi wa kazi (plagiarism) ni kutumia maneno au mawazo ya mtu bila kumtaja, na hakimiliki inalinda kazi za waumbaji.',
    'Do the practical lab: compare two sources with the CRAAP table, write a 100-word comparison in your own words, and add a reference entry for each.',
    [
      { h: 'What is plagiarism?', p: [
        'Academic honesty means presenting work truthfully, acknowledging sources and not claiming another person\'s ideas or writing as your own. Plagiarism is using someone else\'s words, ideas, images or work without giving credit, and presenting it as your own.'],
        table: { head: ['Kind of plagiarism', 'Example'], rows: [
          ['Copying text', 'Pasting an article, or part of it, into your essay without quotation marks or credit.'],
          ['Close paraphrase', 'Changing a few words in someone\'s sentence and not crediting them.'],
          ['Using ideas without credit', 'Presenting another person\'s argument or findings as your own.'],
          ['Buying or borrowing work', 'Submitting an essay written by someone else.'],
          ['Misusing images and data', 'Using a picture, chart or data from the web without permission or credit.'],
          ['Undeclared AI-generated text', 'Submitting AI-written text as your own work when it is not allowed.'],
        ] } },
      { h: 'Why it matters and how to avoid it', p: [
        'Plagiarism is dishonest to the author and to your teacher. It can lead to serious penalties, from a zero mark to expulsion. It also stops you learning, because the purpose of an assignment is your own understanding, and it damages your reputation, which is very hard to rebuild.',
        'To avoid it: take notes in your own words and record sources as you go; use quotation marks for any words copied exactly and name the source; give credit for ideas, data, pictures and figures even if you rewrote them; include a reference list at the end of your work. If you are unsure, ask your teacher, or cite the source to be safe.'] },
      { h: 'A simple way to record a source', p: [
        'Your school will tell you which citation style to use, such as Harvard or APA. A simple, complete record has: author or organisation, year, title of page or article, publisher or website name, web address, and the date accessed.',
        'Example: Example University Computing Department. (2026). How computer memory works. Example University. https://www.example.edu/computing/memory. Accessed: 20 November 2026.'] },
      { h: 'Copyright and licences', p: [
        'Most things created by people, such as text, music, photographs and software, are protected by copyright. This means the creator decides how it may be used, and you may not copy and share it freely unless you have permission.',
        'Some creators grant permission in advance using a licence. Creative Commons licences are a well-known example: they state exactly what you may do, for example share and adapt the work if you give credit. Look for a licence statement, and when in doubt, ask or choose material marked as free to use.'] },
      { h: 'Practical lab: evaluate two sources', p: [
        'Goal: apply the CRAAP test and write an honest comparison. You have succeeded when you have two complete tables, a comparison paragraph in your own words, and two references.'],
        steps: [
          'Choose a beginner computer topic, for example "what is an operating system" or "how does Wi-Fi work".',
          'Search for it and open two different sources, ideally of different types, for example an educational website and a blog.',
          'Make a table with rows Currency, Relevance, Authority, Accuracy, Purpose and Decision (use / use with care / reject), and columns Source 1 and Source 2. Complete it for each source.',
          'Write a paragraph of about 100 words comparing the sources and saying which you trust more, and why. Use your own words.',
          'Create a reference entry for each source using the format in this lesson.',
          'Save the work as Source_Evaluation in 03_Research.',
        ] },
    ],
    {
      mistakes: [
        'Thinking that changing a few words of a sentence is not plagiarism.',
        'Using pictures, charts or data from the web without credit or permission.',
        'Giving credit only for quoted words and forgetting ideas.',
        'Assuming anything on the internet is free to copy.',
      ],
      exercises: [
        { q: 'Define plagiarism and give three examples.', a: 'Using someone else\'s words, ideas, images or work without credit and presenting it as your own. Examples: pasting text without quotation marks, close paraphrase, submitting bought or borrowed work.' },
        { q: 'Why does plagiarism matter?', a: 'It is dishonest, can lead to penalties from a zero mark to expulsion, stops you learning, and damages your reputation.' },
        { q: 'What details go in a simple source record?', a: 'Author or organisation, year, title, publisher or website name, web address and the date accessed.' },
        { q: 'What does a Creative Commons licence allow?', a: 'It states exactly what you may do with a work, for example share and adapt it if you give credit.' },
      ],
      quiz: [
        { q: 'What is academic honesty?', options: ['Copy without citing', 'Claim another person\'s work', 'Acknowledge sources and present work truthfully', 'Avoid all research'], answer: 2, why: 'It means being truthful and crediting your sources.' },
        { q: 'Which is the best way to use exact words from a source?', options: ['Paste them without notice', 'Change one word', 'Delete the source', 'Use quotation marks and name the source'], answer: 3, why: 'Exact words need quotation marks and credit.' },
        { q: 'Changing a few words in someone\'s sentence without credit is called what?', options: ['Close paraphrase plagiarism', 'Good paraphrasing', 'Copyright', 'Triangulation'], answer: 0, why: 'It is still using their words and ideas without credit.' },
        { q: 'What does copyright mean?', options: ['Anyone may copy a work', 'The creator decides how the work may be used', 'Only old works are protected', 'Only books are protected'], answer: 1, why: 'Copyright gives the creator control, unless they grant permission by a licence.' },
        { q: 'You are unsure whether something needs credit. What should you do?', options: ['Say nothing', 'Ask your teacher, or cite the source to be safe', 'Delete the reference list', 'Rewrite it once'], answer: 1, why: 'The book advises asking or citing to be safe.' },
      ],
    }),
];
