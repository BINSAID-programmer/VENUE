import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Chapter 10: Searching the internet effectively (from Digital Foundations by Binsaid). */
export const CB_CH10: LearnLesson[] = [
  T('srch-engine', 'How a search engine works', 'Injini ya utafutaji hupata kurasa kwa hatua tatu: kutambaa, kuorodhesha na kupanga; na si sawa na kivinjari.',
    'Type a question into your browser address bar and press Enter. Say which search engine answered, and which results were marked Ad or Sponsored.',
    [
      { h: 'What is a search engine?', p: [
        'A search engine is an online service that helps people find web pages and other information. You type search terms, and the search engine returns a list of results ranked in order of likely usefulness. Examples include Google Search, Bing and DuckDuckGo.',
        'A browser and a search engine are not the same thing. The browser is the program you use to view the web. The search engine is a website (or service) you use within the browser to find pages. Many browsers set a default search engine, so when you type words in the address bar, the browser sends them to that search engine.'] },
      { h: 'Crawling, indexing and ranking', p: [
        'There are far too many pages on the web for a person to read, so search engines work in three automatic stages.',
        'Crawling: programs called crawlers visit web pages and follow links from page to page, discovering new and changed content. Indexing: the search engine stores information about each page in a huge database called an index, like the index at the back of a book.',
        'Ranking: when you search, the engine looks in its index for pages that match your words and uses many signals (how well the page matches, how recent it is, how trusted it seems, and more) to put the most useful at the top.'] },
      { h: 'Top of the page does not mean true', p: [
        'Warning: ranking measures how well a page matches your search and many other signals. It is not a guarantee that a page is correct, honest or suitable for your level.',
        'Some results at the top are paid advertisements. You must judge the results yourself, as you will learn in the next chapter.'],
        tip: 'Think of the index as a library catalogue. It tells you where books are, but it does not promise every book is good.' },
    ],
    {
      mistakes: [
        'Saying Chrome is a search engine. Chrome is a browser; Google Search is a search engine.',
        'Assuming the first result is the most correct one.',
        'Thinking a person reads every page. Crawlers and indexes do it automatically.',
        'Forgetting that some top results are paid advertisements.',
      ],
      exercises: [
        { q: 'What is the difference between a browser and a search engine?', a: 'A browser is the program you use to view the web; a search engine is a service you use within it to find pages.' },
        { q: 'Describe how a search engine finds and ranks pages.', a: 'Crawlers visit pages and follow links, the engine stores page information in an index, and when you search it ranks matching pages using signals such as match, recency and trust.' },
        { q: 'Why is the first result not always the best?', a: 'Ranking is not a guarantee of truth, and some top results are paid advertisements. You must judge sources yourself.' },
      ],
      quiz: [
        { q: 'A search engine helps users to...', options: ['Find web pages and information', 'Repair a laptop physically', 'Increase RAM', 'Print a document'], answer: 0, why: 'A search engine is an online service for finding pages and information.' },
        { q: 'What do crawlers do?', options: ['Rank results by price', 'Visit pages and follow links to discover content', 'Delete old pages', 'Print results'], answer: 1, why: 'Crawlers discover new and changed content by following links from page to page.' },
        { q: 'What is an index?', options: ['A type of browser', 'A huge database of page information', 'A paid advert', 'A keyboard shortcut'], answer: 1, why: 'The index stores information about each page, like the index at the back of a book.' },
        { q: 'What does a high ranking guarantee?', options: ['That the page is true', 'That the page is suitable for your level', 'Nothing about truth; it only reflects match and other signals', 'That it is free of ads'], answer: 2, why: 'Ranking is not a guarantee of correctness or honesty.' },
      ],
    }),

  T('srch-keywords', 'From question to keywords', 'Anza na swali wazi, ondoa maneno madogo, na chagua maneno mahususi badala ya neno moja lisilo wazi.',
    'Pick three vague words (for example math, Excel, phone slow) and rewrite each as a better search with a subject, a level and the kind of help you want.',
    [
      { h: 'Be specific', p: [
        'Searching well is a skill. The biggest improvement you can make is to begin with a clear question and choose specific keywords, instead of typing one vague word.'],
        table: { head: ['Weak search', 'Improved search', 'Why it is better'], rows: [
          ['computer', 'basic parts of a computer and their functions', 'States exactly what information is needed.'],
          ['math', 'introductory statistics lecture notes PDF university', 'Adds subject, level and resource type.'],
          ['internet', 'difference between internet and World Wide Web', 'Asks a precise question.'],
          ['Excel', 'beginner spreadsheet formulas SUM AVERAGE examples', 'Names a skill and the kind of help wanted.'],
          ['research', 'how to evaluate reliability of academic sources', 'Focuses on source evaluation.'],
          ['phone slow', 'why is my Android phone slow after update fix', 'Adds the device, the problem and the wish for a solution.'],
        ] } },
      { h: 'Turn a question into keywords', p: [
        'Use this routine every time. Work through it with the question "What is the difference between RAM and storage in a laptop?"'],
        steps: [
          'Write the question in a full sentence: "What is the difference between RAM and storage in a laptop?"',
          'Underline the main ideas: RAM, storage, difference, laptop.',
          'Remove small words such as "what", "is", "the", "in", "a".',
          'Add helpful words: "beginners", "explained", "examples", or a year if the subject changes quickly.',
          'Think of alternative words you might use later: "memory", "disk", "SSD".',
        ] },
      { h: 'The result', p: [
        'After these steps the search becomes: RAM vs storage difference explained for beginners. This is shorter than the original question, but it is far more useful to a search engine than a single word.'],
        tip: 'Keep your list of alternative words. If the first search fails, swap in "memory" or "disk" and try again.' },
    ],
    {
      mistakes: [
        'Typing a single vague word such as "math" or "Excel".',
        'Keeping small words like "what" and "is" that add nothing.',
        'Not saying what kind of help you want (tutorial, examples, PDF).',
        'Forgetting alternative words for the same idea.',
      ],
      exercises: [
        { q: 'Turn this question into keywords: "How can I make my laptop battery last longer?"', a: 'For example: laptop battery life tips improve Windows. Underline the main ideas, drop small words, and add tips or examples.' },
        { q: 'Improve the weak search "math".', a: 'introductory statistics lecture notes PDF university, which adds subject, level and resource type.' },
        { q: 'List the five steps for turning a question into keywords.', a: 'Write the question, underline the main ideas, remove small words, add helpful words, and think of alternative words.' },
      ],
      quiz: [
        { q: 'Which search is the best improvement on "math"?', options: ['math', 'math math math', 'introductory statistics lecture notes PDF university', 'mathematics?'], answer: 2, why: 'It adds subject, level and resource type, so the engine knows exactly what you need.' },
        { q: 'Which words would you remove from "what is the difference between RAM and storage"?', options: ['RAM and storage', 'difference', 'what, is, the', 'laptop'], answer: 2, why: 'Small words add nothing; keep the main ideas.' },
        { q: 'Why add words like "beginners" or "examples"?', options: ['They are required by law', 'They show the kind of help you want', 'They make the page load faster', 'They hide ads'], answer: 1, why: 'Helpful words tell the engine the level and type of resource you want.' },
        { q: 'Why think of alternative words such as memory, disk, SSD?', options: ['To use later if the first search fails', 'To make the search longer', 'To remove results', 'To change browsers'], answer: 0, why: 'Alternative words give you another try with the same meaning.' },
      ],
    }),

  T('srch-method', 'The search method', 'Watafutaji wazuri hutafuta kwa mzunguko: uliza, tafuta, kagua na boresha; na matokeo yakiwa mabaya, badilisha maneno badala ya kurudia yale yale.',
    'Do the worked example yourself with the question "What is the difference between RAM and storage?" and write a short note in your own words with two sources.',
    [
      { h: 'Searching is a loop', p: [
        'Experts search in a loop rather than in one try: ask, search, check and improve. If the first results are not helpful, they adjust the words and try again.'] },
      { h: 'Worked example: RAM and storage', p: [
        'Follow the same eight steps on any research question.'],
        steps: [
          'Question: What is the difference between RAM and storage?',
          'Keywords: RAM vs storage explained for beginners.',
          'Search. Type the keywords in the address bar and press Enter.',
          'Scan the results. Look at the titles, the website names and the short descriptions. Ignore advertisements. Prefer educational sites, official documentation or textbooks.',
          'Open two or three results in separate tabs (right-click a link and choose "Open link in new tab", or hold Ctrl while clicking).',
          'Compare. Do the explanations agree? Do they separate temporary working memory from long-term file storage? Is one clearer or better supported?',
          'Evaluate the sources with the CRAAP test (next chapter).',
          'Write a short explanation in your own words and record the title, author or organisation, date and web address of each source.',
        ] },
      { h: 'A sample note', p: [
        'Example note, written in your own words: "RAM is the computer\'s short-term working space where programs and files in use are held so the processor can reach them quickly; it is cleared when power is lost. Storage, such as an SSD, keeps files and programs permanently, even when the computer is off. A helpful picture is a desk (RAM) versus a cupboard (storage)."',
        'Then list the sources: title, publisher, date and web address for each.'] },
      { h: 'When the results are poor', p: [
        'If your first search gives poor results, change something rather than repeating the same words. Use more specific words, or fewer words if the results are too narrow. Use a different word with the same meaning, for example "laptop" instead of "notebook".',
        'Add the type of resource you want: "tutorial", "examples", "PDF", "video", "lecture notes". Search a question form, as in "how to..." or "why does...". Check your spelling; the search engine may suggest corrections.'] },
    ],
    {
      mistakes: [
        'Repeating the same words when the results are poor.',
        'Reading only the first result and stopping.',
        'Copying an explanation instead of writing it in your own words.',
        'Not recording the title, author, date and address of each source.',
      ],
      exercises: [
        { q: 'List the stages of the search loop.', a: 'Ask, search, scan or check the results, and improve the search words, then repeat if needed.' },
        { q: 'What should you do when a search gives poor results?', a: 'Change something: more specific or fewer words, a synonym, a resource type such as tutorial or PDF, a question form, or fix spelling.' },
        { q: 'What details should you record for each source?', a: 'The title, the author or organisation, the date if available, and the web address.' },
      ],
      quiz: [
        { q: 'How do experts usually search?', options: ['In one try only', 'In a loop, adjusting words and trying again', 'By clicking only ads', 'By typing one word'], answer: 1, why: 'Searching is a loop: ask, search, check and improve.' },
        { q: 'How can you open a result in a new tab?', options: ['Right-click and choose Open link in new tab, or hold Ctrl while clicking', 'Press Delete', 'Close the browser', 'Press Ctrl + P'], answer: 0, why: 'Opening results in separate tabs lets you compare them.' },
        { q: 'In the RAM example, what is storage compared to?', options: ['A desk', 'A cupboard', 'A bicycle', 'A recipe'], answer: 1, why: 'RAM is the desk (short-term working space) and storage is the cupboard (long-term).' },
        { q: 'Which is a good fix for a search with too few useful results?', options: ['Type the same words again', 'Add the resource type, like "tutorial" or "lecture notes"', 'Remove all words', 'Click every ad'], answer: 1, why: 'Changing the words, such as adding a resource type, improves results.' },
        { q: 'What comes before writing your note in your own words?', options: ['Compare sources and evaluate them', 'Delete the history', 'Install an extension', 'Print the page'], answer: 0, why: 'You compare explanations and evaluate sources before you write.' },
      ],
    }),

  T('srch-results', 'Results pages and search operators', 'Jifunze kutofautisha matangazo, matokeo mazuri na vichwa vya kuvutia bure, na tumia alama kama nukuu, minus, site: na filetype: kupunguza utafutaji.',
    'Search for a topic and mark which results are sponsored and which web addresses look trustworthy. Then try "information processing cycle" in quotation marks.',
    [
      { h: 'Reading a results page', p: [
        'A page of search results contains several different kinds of items. Learning to tell them apart prevents you clicking the wrong one.'],
        table: { head: ['Item', 'What to notice'], rows: [
          ['Search box', 'You can edit your words here at any time.'],
          ['Sponsored result', 'Marked "Ad" or "Sponsored". Someone paid for it to appear. It may be useful, but it is advertising, not a ranking of quality.'],
          ['Title', 'A clue to the content, not proof of quality.'],
          ['Web address', 'Check who publishes the page. A known organisation or university is a good sign; a strange address is a warning.'],
          ['Snippet', 'A short preview. Read it to see whether the page answers your question before you click.'],
          ['Clickbait', 'Shocking titles, many exclamation marks, and little real information. Avoid.'],
        ] },
        tip: 'Sponsored does not mean best. Look for the words "Sponsored" or "Ad" before you click, especially when searching for software downloads, because criminals sometimes pay for adverts that lead to harmful copies.' },
      { h: 'Search operators', p: [
        'Search engines understand some special symbols that give you more control. They are optional, but they can save a lot of time.'],
        table: { head: ['Operator', 'Example', 'What it does'], rows: [
          ['Quotation marks', '"information processing cycle"', 'Finds pages that contain those words exactly, in that order.'],
          ['Minus sign', 'jaguar -car', 'Excludes pages with the word after the minus sign (when supported).'],
          ['site:', 'site:khanacademy.org fractions', 'Searches only within one website.'],
          ['filetype:', 'filetype:pdf statistics notes', 'Finds a specific type of file. Always check who published a PDF.'],
          ['OR', 'laptop OR notebook battery tips', 'Finds pages with either word.'],
        ] } },
      { h: 'Other useful tools', p: [
        'Date filters: after searching, look for Tools and choose a time range such as "Past year". Use this when information changes quickly, such as prices, laws and software versions. Image, video and news tabs under the search box switch the type of result.',
        'Google Scholar (scholar.google.com) searches academic papers, theses and books; use it for research and always check the publication details. On a long page, press Ctrl + F and type a word to jump to every place it appears.',
        'When you need official instructions or policies, search for the official organisation\'s name plus the subject, and check the domain.'] },
    ],
    {
      mistakes: [
        'Clicking the first result without checking whether it is marked Sponsored or Ad.',
        'Trusting a result because the title sounds exciting.',
        'Forgetting to check who published a PDF found with filetype:.',
        'Never using date filters for information that changes quickly.',
      ],
      exercises: [
        { q: 'Give the purpose of quotation marks, a minus sign, site: and filetype:.', a: 'Quotation marks find an exact phrase, a minus sign excludes a word, site: searches within one website, and filetype: finds a specific file type such as PDF.' },
        { q: 'How can you recognise a sponsored result and why does it matter?', a: 'It is marked "Ad" or "Sponsored". It matters because someone paid for it to appear, so it is advertising, not a ranking of quality, and may even lead to harmful software.' },
        { q: 'Write a search for PDF statistics notes only on a university site you trust.', a: 'For example: statistics notes filetype:pdf site: followed by the university domain.' },
      ],
      quiz: [
        { q: 'Quotation marks around a phrase...', options: ['Find the exact phrase', 'Delete the phrase', 'Translate it', 'Print it'], answer: 0, why: 'Quotation marks find pages with those words exactly, in that order.' },
        { q: 'A result marked "Sponsored" is...', options: ['An advertisement', 'Always the most accurate page', 'A virus', 'A bookmark'], answer: 0, why: 'Someone paid for it to appear, so it is advertising.' },
        { q: 'Which operator searches only within one website?', options: ['filetype:', 'site:', 'OR', 'minus sign'], answer: 1, why: 'site: limits the search to one website, for example site:khanacademy.org fractions.' },
        { q: 'What does jaguar -car do?', options: ['Finds only cars', 'Excludes pages with the word car', 'Finds PDF files', 'Searches images only'], answer: 1, why: 'The minus sign excludes pages containing the word after it, when supported.' },
        { q: 'What does Ctrl + F do on a long page?', options: ['Opens a new tab', 'Jumps to every place a word appears', 'Saves the page', 'Prints it'], answer: 1, why: 'Find on a page lets you type a word and jump to each place it appears.' },
      ],
    }),

  T('srch-ai', 'Using AI assistants carefully', 'Wasaidizi wa AI wana manufaa lakini wanaweza kukosea; tumia kama mahali pa kuanzia, thibitisha kwa vyanzo viwili, na kuwa mkweli kuhusu matumizi yake.',
    'Do the practical lab: research the difference between the internet and the web with the full search method, and save a five-sentence note as Internet_vs_Web.',
    [
      { h: 'Good uses and risks', p: [
        'Today many people use AI assistants (chatbots) to ask questions in everyday language. They can explain ideas, suggest examples and help you plan. They are powerful learning aids, but they have important limits, and you must use them honestly and carefully.'],
        table: { head: ['Good uses', 'Risks to avoid'], rows: [
          ['Explaining a difficult idea in simpler words.', 'Believing every answer. AI can sound confident while being wrong or inventing facts and sources.'],
          ['Suggesting keywords or a study plan.', 'Copying the answer into your assignment and presenting it as your own work.'],
          ['Checking your understanding by asking you questions.', 'Sharing personal information, passwords or private documents.'],
          ['Giving examples to practise with.', 'Skipping the learning: you must still understand the material yourself.'],
        ] } },
      { h: 'Five rules for AI use', p: [
        'Follow these rules each time you use an assistant for study.'],
        steps: [
          'Treat an AI answer as a starting point, not as a source.',
          'Verify important facts with at least two reliable sources.',
          'Ask for sources, then open them yourself and check that they exist and say what is claimed.',
          'Follow your school\'s rules on AI use, and say clearly when you used it.',
          'Never put passwords, ID numbers or other private information into any online tool.',
        ] },
      { h: 'Practical lab: search and compare', p: [
        'Goal: practise the full search method on a real question: "What is the difference between the internet and the World Wide Web?" You have succeeded when you have a five-sentence explanation in your own words and two recorded sources with all details.'],
        steps: [
          'Before searching, write three sets of search words.',
          'Search using one set. Note whether the first results are advertisements.',
          'Open two relevant sources in separate tabs.',
          'For each source, record the title, author or organisation, date (if available) and web address.',
          'Compare the explanations. Do they agree? Is one clearer or better supported by evidence?',
          'Write a five-sentence explanation in your own words. Save it as Internet_vs_Web in 03_Research.',
          'Try two operators: search "World Wide Web" in quotation marks, and internet web difference with site: and a university or educational site you trust.',
        ] },
    ],
    {
      mistakes: [
        'Believing every AI answer because it sounds confident.',
        'Copying an AI answer into an assignment and presenting it as your own work.',
        'Typing passwords, ID numbers or private documents into an online tool.',
        'Skipping the learning and relying on the tool instead of understanding the material.',
      ],
      exercises: [
        { q: 'List two good uses and two risks of AI assistants.', a: 'Good: explaining ideas simply and suggesting keywords or study plans. Risks: believing wrong answers that sound confident, and copying answers as your own work.' },
        { q: 'Why must you open the sources an AI gives you?', a: 'AI can invent facts and sources, so you must check that they exist and say what is claimed.' },
        { q: 'How should an AI answer be treated in your research?', a: 'As a starting point, not a source. Verify important facts with at least two reliable sources and say when you used AI.' },
      ],
      quiz: [
        { q: 'An AI answer should be treated as...', options: ['A final source', 'A starting point to verify', 'Always correct', 'A password'], answer: 1, why: 'AI can be wrong, so treat answers as starting points and verify them.' },
        { q: 'How many reliable sources should you use to verify important facts?', options: ['None', 'At least two', 'Exactly one', 'Only the AI'], answer: 1, why: 'Verify important facts with at least two reliable sources.' },
        { q: 'What should you never put into an online tool?', options: ['A study question', 'Passwords, ID numbers or private information', 'A keyword list', 'A topic name'], answer: 1, why: 'Private information should never be entered into any online tool.' },
        { q: 'Which is a good use of an AI assistant?', options: ['Explaining a difficult idea in simpler words', 'Doing the assignment and submitting it as yours', 'Sharing your password', 'Replacing all learning'], answer: 0, why: 'Explaining ideas is a good use, as long as you still learn and are honest about it.' },
      ],
    }),
];
