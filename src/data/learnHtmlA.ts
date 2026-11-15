import type { LearnLesson } from './learnLessons';

type Sec = NonNullable<LearnLesson['sections']>[number];
type Extra = Pick<LearnLesson, 'mistakes' | 'exercises' | 'quiz' | 'challenge'>;

/** HTML lesson builder (ids look like html-<id>). */
export const H = (id: string, title: string, sw: string, task: string, sections: Sec[], extra: Extra = {}): LearnLesson => ({
  ...extra,
  id: `html-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: sections.find((s) => s.code)?.code || '',
});

/** Chapters 1–3: start, text, links and media. */
export const HTML_A: LearnLesson[] = [
  H('intro', 'What is HTML and how a page is built', 'HTML ni lugha ya muundo wa ukurasa wa wavuti: tags, elements na attributes.',
    'Change the title and the heading of the page below to your own name.',
    [
      { h: 'What is HTML?', p: [
        'HTML stands for HyperText Markup Language. It is the language that describes the structure of every web page: which part is a heading, which part is a paragraph, where a picture goes, where a link points. It is not a programming language, because it does not calculate or make decisions. It marks up content, like a teacher who underlines titles and draws boxes around parts of a text.',
        'When you open a page, the browser (Chrome, Edge, Firefox, Safari) downloads the HTML text, reads it from top to bottom and draws the page on the screen. The same HTML file shows the same structure on a phone, a laptop and a big screen.',
        'Three languages work together on every site. HTML gives the structure, CSS gives the look (colours, spacing, layout), and JavaScript gives the behaviour (things that react to clicks). In this course you learn them in that order, and this chapter is HTML.'] },
      { h: 'Tags, elements and attributes', p: [
        'HTML is written with tags in angle brackets. Most elements have an opening tag, some content, and a closing tag with a slash: <p>Hello</p>. The whole thing, from the opening tag to the closing tag, is called an element.',
        'An attribute gives extra information to an element. It sits inside the opening tag as name="value". In <a href="https://www.udsm.ac.tz">UDSM</a> the tag is a, the attribute is href and its value is the web address.',
        'Some elements have no content and so need no closing tag. They are called void elements, for example <br> (line break), <hr> (horizontal line) and <img>.'],
        code: `<h1>Welcome to VENUE</h1>\n<p>This is a <b>paragraph</b> with a <a href="https://www.udsm.ac.tz">link</a>.</p>\n<hr>\n<p>A second paragraph.</p>`,
        explain: ['<h1> ... </h1> is a heading element. Its opening tag is <h1> and its closing tag is </h1>.', '<b> makes the word bold and sits inside the paragraph. Elements can contain other elements, which is called nesting.', 'The href attribute of the a element holds the address the link opens.', '<hr> draws a horizontal line and has no closing tag.'] },
      { h: 'The skeleton of every page', p: [
        'A complete HTML document has the same skeleton every time. <!DOCTYPE html> on the first line tells the browser that this is modern HTML. The <html> element wraps everything. Inside it are two parts: <head>, which holds information about the page that is not shown in the page area (the title, the character set, links to style sheets), and <body>, which holds everything the visitor sees.',
        '<meta charset="UTF-8"> makes sure that letters like é, ñ and symbols display correctly. <meta name="viewport" ...> makes the page fit a phone screen. <title> is the text shown on the browser tab and in search results.'],
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>My first page</title>\n</head>\n<body>\n  <h1>Hello, I am Asha</h1>\n  <p>I study Statistics at UDSM.</p>\n</body>\n</html>`,
        explain: ['The text in <title> appears on the browser tab, not on the page itself.', 'lang="en" tells browsers and screen readers which language the page uses, which helps translation and speech.', 'Only the content inside <body> is drawn in the page area: the heading and the paragraph.', 'Indentation (the spaces at the start of lines) is not required, but it makes the nesting easy to see. Always indent children of an element by two spaces.'] },
      { h: 'How the browser reads HTML', p: [
        'The browser turns your text into a tree called the DOM (Document Object Model). <html> is the root, <head> and <body> are its branches, and every element inside is a smaller branch. CSS and JavaScript later use this tree to find and change parts of the page.',
        'Browsers are forgiving. If you forget a closing tag, they try to guess what you meant, and sometimes guess wrongly. That is why you should always close your tags properly and keep your code tidy.',
        'You can see the HTML of almost any website: right-click the page and choose View page source on a computer. Reading real pages is one of the best ways to learn.'] },
    ],
    {
      mistakes: [
        'Forgetting the closing tag, for example <p>Hello without </p>.',
        'Closing tags in the wrong order. <b><i>text</b></i> is wrong; close the inner element first: <b><i>text</i></b>.',
        'Writing attribute values without quotes or with curly quotes copied from a word processor. Use straight quotes: href="page.html".',
        'Putting visible content in <head>, or forgetting <body>.',
        'Calling HTML a programming language. It describes structure; it does not have logic.',
      ],
      exercises: [
        { q: 'Write a page with the title "About me", a heading with your name and one paragraph about your course.', a: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>About me</title>\n</head>\n<body>\n  <h1>Asha Juma</h1>\n  <p>I study BSc Statistics at UDSM.</p>\n</body>\n</html>` },
        { q: 'Name the tag, the attribute and the content of: <a href="https://example.com">Visit</a>', a: `<!-- tag: a, attribute: href="https://example.com", content: Visit -->\n<a href="https://example.com">Visit</a>` },
      ],
      quiz: [
        { q: 'What does HTML describe?', options: ['The behaviour of a page', 'The structure of a page', 'The colours of a page', 'The speed of a page'], answer: 1, why: 'HTML gives structure; CSS gives style and JavaScript gives behaviour.' },
        { q: 'Where does the text of <title> appear?', options: ['At the top of the page area', 'On the browser tab', 'At the bottom of the page', 'Nowhere'], answer: 1, why: 'The title shows on the tab and in search results, not inside the page.' },
        { q: 'Which of these is a void element (no closing tag)?', options: ['<p>', '<h1>', '<br>', '<title>'], answer: 2, why: '<br> has no content, so it has no closing tag.' },
      ],
      challenge: {
        prompt: 'Make a complete page: it needs a <title>, an <h1> that contains your name, and a paragraph <p>. (Replace the TODO comment.)',
        starter: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <!-- TODO: add a title -->\n</head>\n<body>\n  <!-- TODO: add an h1 with your name and a paragraph -->\n</body>\n</html>',
        check: 'title => Add a <title> element inside <head>.\nhead title => The title must be inside <head>.\nbody h1 => Add an <h1> heading inside <body>.\nbody p => Add a <p> paragraph inside <body>.',
        hint: '<title>My page</title> in the head, then <h1>Asha</h1> and <p>Hello!</p> in the body.',
        solution: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My page</title>\n</head>\n<body>\n  <h1>Asha</h1>\n  <p>Hello! I am learning HTML.</p>\n</body>\n</html>',
      },
    }),

  H('basic', 'Headings, paragraphs and line breaks', 'Headings h1–h6, paragraphs, <br>, <hr> na comments.',
    'Write a page about your course with an h1, two h2 headings and a paragraph under each.',
    [
      { h: 'Headings', p: [
        'HTML has six levels of headings, from <h1> (the most important) to <h6> (the least). Use them like the titles in a book: one h1 for the title of the page, h2 for main sections, h3 for subsections, and so on.',
        'Choose a heading by its meaning, not by its size. Browsers draw h1 big and h6 small, but you can change that later with CSS. Search engines and screen readers use the heading levels to understand your page, so do not skip levels (an h2 should not be followed directly by an h4).'],
        code: `<h1>Statistics 1</h1>\n<h2>Chapter 1: Data</h2>\n<h3>Types of data</h3>\n<h3>Collecting data</h3>\n<h2>Chapter 2: Probability</h2>\n<h6>Smallest heading</h6>`,
        explain: ['h1 is the title of the whole page; there should normally be only one.', 'Each h2 starts a main section, and the h3 headings under it are subsections.', 'h6 shows how small the last level is. In practice h4 to h6 are rarely needed.'] },
      { h: 'Paragraphs', p: [
        'The <p> element holds a paragraph. The browser adds space above and below each paragraph. Extra spaces and new lines in your HTML file are ignored: many spaces count as one, and pressing Enter in the code does not start a new line on the page. To get a new paragraph you must write a new <p>.'],
        code: `<p>This is the first paragraph. It can be\n   very long and the browser will wrap it\n         to fit the width of the screen.</p>\n<p>This is the second paragraph.</p>`,
        explain: ['The line breaks and the extra spaces inside the first paragraph are ignored; the text flows as one block.', 'The browser wraps the text to the width of the screen automatically, so the page works on a phone and on a computer.', 'The second <p> starts a new paragraph with space before it.'] },
      { h: 'Line breaks and horizontal lines', p: [
        '<br> forces a line break inside a paragraph. It is useful for addresses and poems, but do not use it to make space between paragraphs (use separate <p> elements, and CSS for spacing).',
        '<hr> draws a horizontal line that separates two parts of a page.'],
        code: `<p>University of Dar es Salaam<br>\nP.O. Box 35091<br>\nDar es Salaam</p>\n<hr>\n<p>Below the line.</p>`,
        explain: ['The three lines of the address stay in one paragraph because we used <br> instead of new paragraphs.', '<hr> draws a thin line across the page between two blocks of content.'] },
      { h: 'Comments and preformatted text', p: [
        'A comment is a note for people reading the code. The browser does not show it. It starts with <!-- and ends with -->. Comments are useful to explain a part of the code or to switch a part off temporarily.',
        'If you need to keep spaces and line breaks exactly as you typed them, such as in a poem or an ASCII picture, use <pre>. Its text is shown in a monospaced font.'],
        code: `<!-- This comment is invisible on the page -->\n<p>Visible text</p>\n<!-- <p>This paragraph is switched off</p> -->\n<pre>\nRoses are red,\n   Violets are blue,\n      HTML is fun,\n         And so are you.\n</pre>`,
        explain: ['Neither comment appears on the page. The second one hides a whole paragraph without deleting it.', 'Inside <pre> the line breaks and the indentation are kept, so the poem is shown as a staircase.'] },
    ],
    {
      mistakes: [
        'Using headings only to make text big. Use CSS for size and headings for meaning.',
        'Skipping heading levels, such as an h1 followed by an h4.',
        'Using many <br> tags to create space between paragraphs.',
        'Expecting extra spaces or Enter in the HTML code to appear on the page.',
        'Writing several h1 elements on one page.',
      ],
      exercises: [
        { q: 'Write the structure of a short article: one h1, two h2 headings and a paragraph under each.', a: `<h1>Why learn statistics?</h1>\n<h2>It is useful</h2>\n<p>Statistics helps us make decisions from data.</p>\n<h2>It is everywhere</h2>\n<p>Health, business and sport all use it.</p>` },
        { q: 'Write your address on three lines using one paragraph and <br>.', a: `<p>Asha Juma<br>\nUDSM, Hall 5<br>\nDar es Salaam</p>` },
      ],
      quiz: [
        { q: 'How many levels of headings does HTML have?', options: ['3', '4', '6', '10'], answer: 2, why: 'h1 to h6.' },
        { q: 'What happens to extra spaces in your HTML?', options: ['They are all shown', 'They are collapsed into one space', 'They cause an error', 'They are deleted from the file'], answer: 1, why: 'Browsers collapse whitespace into a single space.' },
        { q: 'Which tag keeps your spaces and line breaks exactly?', options: ['<p>', '<br>', '<pre>', '<hr>'], answer: 2, why: '<pre> shows preformatted text.' },
      ],
      challenge: {
        prompt: 'Create one h1, at least two h2 headings and at least two paragraphs.',
        starter: '<!-- Write your page here -->\n',
        check: 'h1 => Add one <h1> heading.\nh2 >= 2 => Add at least two <h2> headings.\np >= 2 => Add at least two <p> paragraphs.',
        hint: '<h1>Title</h1> <h2>Part one</h2> <p>...</p> <h2>Part two</h2> <p>...</p>',
        solution: '<h1>My course</h1>\n<h2>What I study</h2>\n<p>I study Statistics.</p>\n<h2>Why I like it</h2>\n<p>It helps me understand data.</p>',
      },
    }),

  H('text', 'Formatting text and special characters', 'Bold, italic, mark, sub/sup, code, quotes na herufi maalum (entities).',
    'Write the chemical formula H₂O with <sub>, and x squared with <sup>.',
    [
      { h: 'Text formatting elements', p: [
        'HTML has elements that give text a special meaning. <strong> marks very important text (shown bold), <em> marks emphasis (shown italic), <mark> highlights text, <small> makes side comments, <del> shows deleted text and <ins> inserted text. <sub> writes below the line (H₂O) and <sup> above it (x²).',
        'You may also meet <b> and <i>. They only make text bold or italic without adding meaning. Prefer <strong> and <em> when the meaning matters, because screen readers read them with emphasis.'],
        code: `<p>This is <strong>very important</strong>, this is <em>emphasised</em>,\nand this is <mark>highlighted</mark>.</p>\n<p>Water is H<sub>2</sub>O and the area is x<sup>2</sup>.</p>\n<p>Price: <del>20,000</del> <ins>15,000</ins> TZS</p>\n<p><small>Terms and conditions apply.</small></p>`,
        explain: ['strong is bold, em is italic and mark gives a yellow highlight.', 'sub lowers the 2 in H2O and sup raises the 2 in x2.', 'del draws a line through the old price and ins underlines the new one.', 'small makes the text smaller, which is usual for notes and legal text.'] },
      { h: 'Code, quotes and abbreviations', p: [
        '<code> shows a piece of computer code in a monospaced font. <kbd> shows a key to press. <q> is a short inline quotation (the browser adds quotation marks). <blockquote> is a longer quotation shown as an indented block. <abbr title="..."> explains an abbreviation when the mouse is over it. <cite> names the title of a work.'],
        code: `<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save, or use <code>print("hi")</code> in Python.</p>\n<p>She said: <q>Practice makes perfect.</q></p>\n<blockquote>\nThe best way to predict the future is to create it.\n</blockquote>\n<p><abbr title="University of Dar es Salaam">UDSM</abbr> is in Tanzania.</p>`,
        explain: ['kbd and code use a monospaced font so they stand out from normal text.', 'q adds the quotation marks for you, while blockquote indents the whole quotation.', 'Hold the mouse over UDSM (or long-press on a phone) and the title text appears.'] },
      { h: 'Special characters (entities)', p: [
        'Some characters have a special meaning in HTML. The characters < and > start and end tags, and & starts an entity. To show them as text you write an entity: &lt; for <, &gt; for >, &amp; for & and &quot; for ". The code &nbsp; is a space that is never collapsed or broken across lines.',
        'Entities also give symbols that are hard to type: &copy; ©, &euro; €, &hearts; ♥, &rarr; →. With <meta charset="UTF-8"> you can also type most of these symbols directly, including emojis.'],
        code: `<p>The tag &lt;p&gt; makes a paragraph.</p>\n<p>Tom &amp; Jerry</p>\n<p>Copyright &copy; 2026 VENUE</p>\n<p>5 &gt; 3 and 2 &lt; 4 &rarr; correct</p>\n<p>10&nbsp;&nbsp;&nbsp;&nbsp;spaces kept</p>\n<p>I &hearts; learning 🎓</p>`,
        explain: ['&lt; and &gt; show the angle brackets instead of starting a tag.', '&amp; shows an ampersand; typing a bare & can confuse the browser.', '&copy; and &hearts; become © and ♥. The emoji is typed directly.', 'Each &nbsp; is one space that does not collapse, so the gap in the 10 line is kept.'] },
    ],
    {
      mistakes: [
        'Typing < or & directly in text instead of using &lt; and &amp;.',
        'Using &nbsp; to build layouts. Use CSS for spacing.',
        'Choosing <b>/<i> where <strong>/<em> would give the correct meaning.',
        'Forgetting to close a formatting element, so the rest of the page stays bold or italic.',
      ],
      exercises: [
        { q: 'Write the formula x² + y² = z² using <sup>.', a: `<p>x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup></p>` },
        { q: 'Show the text <h1> on the page (not as a heading).', a: `<p>The tag &lt;h1&gt; makes a main heading.</p>` },
      ],
      quiz: [
        { q: 'Which element marks very important text?', options: ['<small>', '<strong>', '<sub>', '<mark>'], answer: 1, why: '<strong> marks strong importance (shown bold).' },
        { q: 'How do you show the symbol < on a page?', options: ['<', '&lt;', '&less;', '\\<'], answer: 1, why: '&lt; is the entity for the less-than sign.' },
        { q: 'What does <sub> do?', options: ['Writes text below the line', 'Writes text above the line', 'Deletes text', 'Highlights text'], answer: 0, why: 'sub means subscript, as in H2O.' },
      ],
      challenge: {
        prompt: 'Write the formula H2O so the 2 is a subscript, and write x squared so the 2 is a superscript. Also make one word <strong>.',
        starter: '<p>Water: H2O</p>\n<p>Square: x2</p>\n<p>Study every day.</p>\n',
        check: 'sub contains 2 => Put the 2 of H2O inside a <sub> element.\nsup contains 2 => Put the 2 of x squared inside a <sup> element.\nstrong => Make a word <strong>.',
        hint: 'H<sub>2</sub>O and x<sup>2</sup>, and <strong>every</strong>.',
        solution: '<p>Water: H<sub>2</sub>O</p>\n<p>Square: x<sup>2</sup></p>\n<p>Study <strong>every</strong> day.</p>',
      },
    }),

  H('links', 'Links', 'Kiungo (<a>): anwani kamili na za jamaa, kufungua tab mpya, email, simu na viungo ndani ya ukurasa.',
    'Make a navigation line with three links: one to a website, one email link and one that jumps to a section on the same page.',
    [
      { h: 'The anchor element', p: [
        'Links are what make the web a web. A link is created with the <a> element (a for anchor). The destination goes in the href attribute, and the text between the tags is what the visitor clicks. By default, links are blue and underlined.'],
        code: `<p>Visit <a href="https://www.udsm.ac.tz">the UDSM website</a>.</p>\n<p><a href="https://www.khanacademy.org">Khan Academy</a> has free lessons.</p>`,
        explain: ['href holds the full address (URL) of the page to open, starting with https://.', 'The words between <a> and </a> are the clickable text. Make them describe the destination, never write "click here".'] },
      { h: 'Absolute and relative addresses', p: [
        'An absolute address includes the full web address, https://www.example.com/page.html, and is used for pages on other websites. A relative address gives only the path from the current file, such as about.html or pages/contact.html or ../index.html, and is used for pages on your own site. Relative addresses keep working when you move the whole site to a new domain.',
        'The path rules: about.html is in the same folder; pages/about.html is in the folder pages; ../index.html goes up one folder first.'],
        code: `<p><a href="about.html">About (same folder)</a></p>\n<p><a href="pages/contact.html">Contact (inside folder pages)</a></p>\n<p><a href="../index.html">Home (one folder up)</a></p>\n<p><a href="https://example.com">Another website</a></p>`,
        explain: ['The first three are relative addresses that point to files in your own project. In this preview they have no real files to open, but the paths are written the way they are in a real site.', 'The last one is absolute and works from anywhere.'] },
      { h: 'Open in a new tab, and link to email or phone', p: [
        'The attribute target="_blank" opens the link in a new tab. When you use it for another website, add rel="noopener noreferrer" for safety, so the new page cannot control your page.',
        'Special schemes make links that act: mailto: opens the email app, tel: starts a phone call on a phone, and sms: starts a text message.'],
        code: `<p><a href="https://www.wikipedia.org" target="_blank" rel="noopener noreferrer">Wikipedia (new tab)</a></p>\n<p><a href="mailto:binsaid679@gmail.com?subject=Hello%20VENUE">Email us</a></p>\n<p><a href="tel:+255762574073">Call us</a></p>`,
        explain: ['target="_blank" opens a new tab; rel="noopener noreferrer" protects visitors.', 'mailto: can pre-fill the subject with ?subject=. A space is written as %20 in addresses.', 'tel: needs the full international number with +255 so it works from anywhere.'] },
      { h: 'Links inside the same page', p: [
        'Long pages are easier to use with jump links. First give an element an id, such as <h2 id="contact">. Then link to it with href="#contact". A link that only has href="#" returns to the top. The id must be unique in the page.'],
        code: `<p><a href="#part2">Jump to Part 2</a></p>\n<div style="height:120px;background:#eef">Part 1 (scroll down)</div>\n<h2 id="part2">Part 2</h2>\n<p>You jumped here.</p>\n<p><a href="#">Back to top</a></p>`,
        explain: ['href="#part2" looks for the element whose id is part2 and scrolls to it.', 'The blue block is only there to make the page long enough to scroll.', 'The last link returns to the top.'] },
      { h: 'Images as links, and good link text', p: [
        'Anything inside <a> becomes clickable, including an image. Good link text makes sense on its own: "Download the 2026 timetable (PDF)" is better than "click here". Screen reader users often list all links on a page, and a list of "click here" tells them nothing.',
        'A link to a file, such as a PDF, should say so, and may use the download attribute to save the file instead of opening it.'],
        code: `<p><a href="https://example.com/timetable.pdf" download>Download the timetable (PDF)</a></p>\n<p><a href="https://www.udsm.ac.tz"><button>Go to UDSM</button></a></p>`,
        explain: ['The download attribute asks the browser to save the file.', 'Here a button is inside the link, so clicking the button follows the link.'] },
    ],
    {
      mistakes: [
        'Writing the address without https://, so it is treated as a file in your own site.',
        'Using "click here" as the link text.',
        'Forgetting rel="noopener noreferrer" with target="_blank".',
        'Using the same id twice on a page.',
        'Writing href="www.google.com" without https:// (it is treated as a relative path).',
      ],
      exercises: [
        { q: 'Make a link to https://www.khanacademy.org that opens in a new tab.', a: `<a href="https://www.khanacademy.org" target="_blank" rel="noopener noreferrer">Khan Academy</a>` },
        { q: 'Make a Contents list where each item jumps to a heading further down.', a: `<ul>\n  <li><a href="#one">One</a></li>\n  <li><a href="#two">Two</a></li>\n</ul>\n<h2 id="one">One</h2>\n<p>...</p>\n<h2 id="two">Two</h2>\n<p>...</p>` },
      ],
      quiz: [
        { q: 'Which attribute holds the destination of a link?', options: ['src', 'href', 'link', 'url'], answer: 1, why: 'The href attribute holds the address.' },
        { q: 'How do you open an email program from a link?', options: ['href="email:me@x.com"', 'href="mailto:me@x.com"', 'href="mail=me@x.com"', 'target="mail"'], answer: 1, why: 'mailto: opens the email app.' },
        { q: 'What does href="#top" do?', options: ['Opens a new tab', 'Jumps to the element with id top', 'Downloads a file', 'Calls a number'], answer: 1, why: '#name links to the element with that id.' },
      ],
      challenge: {
        prompt: 'Add three links: (1) a link to https://www.udsm.ac.tz that opens in a new tab, (2) a mailto: link, and (3) a link with href="#end" that jumps to the heading with id="end".',
        starter: '<p>\n  <!-- your three links here -->\n</p>\n<div style="height:150px"></div>\n<h2 id="end">The end</h2>\n',
        check: 'a[href^="https://www.udsm.ac.tz"][target="_blank"] => Add a link to https://www.udsm.ac.tz with target="_blank".\na[href^="mailto:"] => Add a link whose href starts with mailto:.\na[href="#end"] => Add a link with href="#end".',
        hint: '<a href="https://www.udsm.ac.tz" target="_blank">UDSM</a> <a href="mailto:me@example.com">Email</a> <a href="#end">Jump</a>',
        solution: '<p>\n  <a href="https://www.udsm.ac.tz" target="_blank" rel="noopener noreferrer">UDSM</a> |\n  <a href="mailto:me@example.com">Email me</a> |\n  <a href="#end">Jump to the end</a>\n</p>\n<div style="height:150px"></div>\n<h2 id="end">The end</h2>',
      },
    }),

  H('images', 'Images and figures', 'Picha kwa <img>: src, alt, ukubwa, <figure> na <picture>; aina za picha.',
    'Show an image with alt text and a caption using <figure> and <figcaption>.',
    [
      { h: 'The img element', p: [
        'Pictures are added with <img>. It is a void element, so it has no closing tag. The src attribute gives the file or web address of the picture. The alt attribute gives alternative text: a short description that is read aloud by screen readers, shown when the image cannot load, and used by search engines.',
        'Always write meaningful alt text. If the picture is only decoration, use an empty alt="" so screen readers skip it.'],
        code: `<img src="https://placehold.co/300x120/2563eb/ffffff?text=VENUE" alt="Blue VENUE banner">\n<p>The image above is loaded from the internet.</p>`,
        explain: ['src is the address of the image, here a web address that creates a sample picture.', 'alt describes the picture in words. If the internet is off, the alt text is shown instead of the picture.'] },
      { h: 'Size and loading', p: [
        'The attributes width and height set the size in pixels. Always give both: the browser then saves the right amount of space before the image downloads, and the page does not jump around. To make an image fit small screens, add CSS later (max-width: 100%).',
        'loading="lazy" tells the browser to download pictures only when the visitor scrolls near them, which saves data. This matters a lot for visitors on mobile data.'],
        code: `<img src="https://placehold.co/600x300/16a34a/ffffff?text=Big" width="300" height="150" alt="Green rectangle">\n<img src="https://placehold.co/100x100/dc2626/ffffff?text=S" width="100" height="100" alt="Small red square" loading="lazy">`,
        explain: ['The first picture is 600 pixels wide but shown at 300 by 150, half the size, keeping the same proportions.', 'Always keep the width-to-height ratio of the original picture, otherwise the image looks stretched.', 'The second uses lazy loading, which waits until the image is near the screen.'] },
      { h: 'Figure and caption', p: [
        '<figure> groups a picture (or a chart, a code sample, a table) with its caption <figcaption>. It tells the browser that the caption belongs to the picture.'],
        code: `<figure>\n  <img src="https://placehold.co/300x150/7c3aed/ffffff?text=Chart" alt="A sample chart" width="300" height="150">\n  <figcaption>Figure 1: Marks of 30 students.</figcaption>\n</figure>`,
        explain: ['The figure element wraps both the image and its caption.', 'figcaption is shown below the picture by default.', 'Textbooks and reports use figures exactly like this, with numbered captions.'] },
      { h: 'Image formats and responsive pictures', p: [
        'JPEG (.jpg) is best for photographs. PNG (.png) is best for logos, screenshots and pictures with transparent areas. SVG (.svg) is a vector format that stays sharp at any size, ideal for icons and diagrams. WebP (.webp) is a modern format with small files, supported by all current browsers.',
        'Large photos make pages slow. Resize and compress pictures before you put them on a page: a 4000-pixel photo from a phone camera should be reduced to about 1200 pixels wide for the web.',
        'The <picture> element lets you offer different files, for example a modern format with a fallback. It is used for responsive design and you will see it in professional sites.'],
        code: `<picture>\n  <source srcset="https://placehold.co/400x150/0891b2/ffffff.webp" type="image/webp">\n  <img src="https://placehold.co/400x150/0891b2/ffffff.png" alt="Teal banner" width="400" height="150">\n</picture>`,
        explain: ['The browser looks at the source elements from top to bottom and uses the first format it understands.', 'The img inside is the fallback, and it is the element that carries the alt text.'] },
    ],
    {
      mistakes: [
        'Leaving out the alt attribute.',
        'Forgetting to put the image file in the right folder, so the picture does not appear.',
        'Changing only width and not height, which distorts the picture.',
        'Using huge pictures that make the page slow.',
        'Using a picture from another website without permission. Respect copyright.',
      ],
      exercises: [
        { q: 'Show an image with width 200 and a good alt text.', a: `<img src="https://placehold.co/400x200/2563eb/ffffff?text=Photo" width="200" height="100" alt="Blue sample photo">` },
        { q: 'Put an image and a caption in a figure.', a: `<figure>\n  <img src="https://placehold.co/300x150" alt="Placeholder" width="300" height="150">\n  <figcaption>A placeholder image.</figcaption>\n</figure>` },
      ],
      quiz: [
        { q: 'What is the alt attribute for?', options: ['Changing the size', 'Describing the image in words', 'Linking to another page', 'Adding a border'], answer: 1, why: 'alt text describes the picture for people who cannot see it and for search engines.' },
        { q: 'Which format is best for a logo with a transparent background?', options: ['JPEG', 'PNG', 'MP3', 'TXT'], answer: 1, why: 'PNG supports transparency; SVG is also good.' },
        { q: 'Which element ties a caption to a picture?', options: ['<caption>', '<figure> with <figcaption>', '<label>', '<legend>'], answer: 1, why: 'figure and figcaption group a picture with its caption.' },
      ],
      challenge: {
        prompt: 'Put an <img> with a src, a non-empty alt, a width and a height inside a <figure>, and add a <figcaption>.',
        starter: '<!-- Write a figure here -->\n',
        check: 'figure img[src] => Add an <img> with a src inside a <figure>.\nfigure img[alt]:not([alt=""]) => The image needs a meaningful alt text.\nimg[width] => Give the image a width.\nimg[height] => Give the image a height.\nfigure figcaption => Add a <figcaption> inside the <figure>.',
        hint: '<figure><img src="https://placehold.co/300x150" alt="..." width="300" height="150"><figcaption>...</figcaption></figure>',
        solution: '<figure>\n  <img src="https://placehold.co/300x150" alt="A grey placeholder picture" width="300" height="150">\n  <figcaption>Figure 1: A placeholder.</figcaption>\n</figure>',
      },
    }),

  H('media', 'Audio, video and embedded pages', 'Weka sauti na video kwa <audio> na <video>, na pia YouTube/ramani kwa <iframe>.',
    'Embed a video with controls, and a fallback message for old browsers.',
    [
      { h: 'Video', p: [
        'The <video> element plays video without any extra plugin. The controls attribute shows play, pause and volume buttons. width sets the size, and poster shows a picture before play. You can give several <source> files in different formats, and the browser picks the first one it can play. MP4 (H.264) is supported almost everywhere.',
        'Text between the opening and closing tags is shown only if the browser cannot play video.'],
        code: `<video controls width="300" poster="https://placehold.co/300x170/1e293b/ffffff?text=Play">\n  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">\n  Your browser does not support the video tag.\n</video>`,
        explain: ['controls adds the player buttons. Without it the video shows no way to play.', 'The source element gives the file and its type.', 'The sentence inside is a fallback for browsers that cannot play video.'] },
      { h: 'Audio', p: [
        '<audio controls> works in the same way for sound: lectures, podcasts and music. The same attributes apply: controls, source files, a fallback text. The attribute loop repeats the sound; autoplay is usually blocked by browsers unless the sound is muted, and it annoys visitors, so avoid it.'],
        code: `<p>Listen to the sample:</p>\n<audio controls>\n  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>`,
        explain: ['The audio element shows a small player.', 'The type audio/mpeg is the MIME type of an MP3 file.'] },
      { h: 'Embedding other pages with iframe', p: [
        'An <iframe> shows another web page inside your page. It is how YouTube videos, Google Maps and forms are embedded. Always add a title attribute describing the content, for accessibility. Only embed sites you trust: the visitor will interact with that content.',
        'On YouTube click Share, then Embed, and copy the iframe code. The address of the embedded page is in the src attribute.'],
        code: `<iframe\n  src="https://www.openstreetmap.org/export/embed.html?bbox=39.20,-6.80,39.25,-6.76&layer=mapnik"\n  width="100%" height="180" title="Map near Dar es Salaam"\n  style="border:1px solid #ccc"></iframe>`,
        explain: ['src is the page to embed, here a map.', 'title describes the frame for screen readers.', 'width="100%" lets the frame fill the width of the page, so it fits a phone.'] },
      { h: 'Media on mobile data', p: [
        'Video and audio use a lot of data, and many visitors pay for every megabyte. Use preload="none" so nothing is downloaded until the visitor presses play, keep videos short and compressed, and tell visitors the size of large files. Provide captions or a transcript for video so that deaf visitors and people watching without sound can follow.'],
        code: `<video controls preload="none" width="280" poster="https://placehold.co/280x160/0f172a/ffffff?text=Tap+to+load">\n  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">\n</video>\n<p>Video: 1 minute, about 1 MB.</p>`,
        explain: ['preload="none" stops the video from downloading until the visitor presses play.', 'The note under the video tells people how much data it might use.'] },
    ],
    {
      mistakes: [
        'Forgetting controls, so the visitor sees a picture with no way to play.',
        'Using autoplay with sound.',
        'Embedding an iframe without a title.',
        'Using huge video files that fail on slow connections.',
      ],
      exercises: [
        { q: 'Add an audio player with controls for a file lecture.mp3.', a: `<audio controls>\n  <source src="lecture.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>` },
      ],
      quiz: [
        { q: 'Which attribute shows the play and pause buttons?', options: ['play', 'buttons', 'controls', 'show'], answer: 2, why: 'controls adds the player interface.' },
        { q: 'What is an iframe used for?', options: ['Making a table', 'Showing another page inside your page', 'Changing fonts', 'Adding a link'], answer: 1, why: 'iframes embed other pages: maps, videos, forms.' },
        { q: 'Why add preload="none"?', options: ['To hide the video', 'To save data until the visitor presses play', 'To make it louder', 'To add subtitles'], answer: 1, why: 'The file is not downloaded until needed.' },
      ],
      challenge: {
        prompt: 'Add a <video> with the controls attribute and a <source> with a src and a type. Add some fallback text inside the video.',
        starter: '<!-- Write your video here -->\n',
        check: 'video[controls] => Add a <video> element with the controls attribute.\nvideo source[src][type] => Inside the video add a <source> with src and type.\nre /<video[\\s\\S]*>[^<]*[A-Za-z]{4,}[^<]*<\\/video>/ => Add a fallback sentence inside the video element.',
        hint: '<video controls width="300"><source src="a.mp4" type="video/mp4">Your browser does not support video.</video>',
        solution: '<video controls width="300">\n  <source src="movie.mp4" type="video/mp4">\n  Your browser does not support video.\n</video>',
      },
    }),
];
