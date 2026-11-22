import type { LearnLesson } from './learnLessons';

type Sec = NonNullable<LearnLesson['sections']>[number];
type Extra = Pick<LearnLesson, 'mistakes' | 'exercises' | 'quiz' | 'challenge'>;

/** CSS lesson builder (ids look like css-<id>). */
export const C = (id: string, title: string, sw: string, task: string, sections: Sec[], extra: Extra = {}): LearnLesson => ({
  ...extra,
  id: `css-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: sections.find((s) => s.code)?.code || '',
});

/** Chapters 1–2: first steps, selectors, colours, text and the box model. */
export const CSS_A: LearnLesson[] = [
  C('intro', 'What is CSS and how to add it', 'CSS ni lugha ya muonekano: rangi, herufi, nafasi na mpangilio wa ukurasa.',
    'Make the heading dark blue and the paragraph grey.',
    [
      { h: 'What is CSS?', p: [
        'CSS stands for Cascading Style Sheets. HTML says what each part of a page is (a heading, a paragraph, a button). CSS says how it looks: colours, fonts, sizes, spacing and layout. Without CSS every page looks like a plain document; with CSS the same HTML can become a modern app.',
        'The idea is to keep the two jobs separate. You can change the whole look of a website by editing the CSS and leave the HTML alone.'] },
      { h: 'A CSS rule', p: [
        'CSS is written as rules. A rule has a selector (which elements to style) and a block of declarations in curly brackets. Each declaration is a property, a colon, a value and a semicolon.'],
        code: `<style>\n  h1 {\n    color: teal;\n    font-size: 28px;\n  }\n</style>\n<h1>Welcome to VENUE</h1>\n<p>This paragraph is not styled.</p>`,
        explain: ['h1 is the selector: it picks every <h1> on the page.', 'color: teal; and font-size: 28px; are two declarations. color is the property and teal is its value.', 'The paragraph has no rule, so it keeps the browser’s default look.'] },
      { h: 'Three ways to add CSS', p: [
        'Inline: a style attribute on one element. Internal: a <style> block in the page (used in these lessons). External: a separate .css file linked with <link rel="stylesheet" href="style.css">. Real websites use external files because many pages can share one file.',
        'Inline style is handy for a quick test, but it is hard to maintain: you must repeat it on every element.'],
        code: `<p style="color: crimson;">Inline style: only this paragraph.</p>\n\n<style>\n  p { font-style: italic; }\n</style>\n<p>Internal style: every paragraph.</p>`,
        explain: ['Both paragraphs become italic because of the <style> rule.', 'Only the first one is also crimson, because its colour was set inline on that element.'] },
      { h: 'Comments', p: ['CSS comments look like /* this */. The browser ignores them. Use them to label sections of a long style sheet.'],
        code: `<style>\n  /* page title */\n  h1 { color: navy; }\n  /* h1 { color: red; }   <- switched off */\n</style>\n<h1>Comments in CSS</h1>`,
        explain: ['The heading is navy. The red rule is inside a comment, so it does nothing.', 'Putting a rule in a comment is a quick way to switch it off while testing.'] },
    ], {
      mistakes: ['Forgetting the semicolon between declarations: the next declaration may be ignored.', 'Using = instead of a colon (color = red).', 'Forgetting the closing curly bracket }, which breaks every rule after it.', 'Writing the American spelling wrongly: the property is color, not colour.'],
      exercises: [
        { q: 'Write a rule that makes all <h2> elements green.', a: '<style>\n  h2 { color: green; }\n</style>\n<h2>Green heading</h2>' },
        { q: 'Make every paragraph 18px with an inline style on one paragraph only.', a: '<p style="font-size: 18px;">Big paragraph</p>\n<p>Normal paragraph</p>' },
        { q: 'Add a comment above the rule that says what it does.', a: '<style>\n  /* make the title purple */\n  h1 { color: purple; }\n</style>\n<h1>Title</h1>' },
      ],
      quiz: [
        { q: 'What does CSS control?', options: ['The structure of a page', 'How a page looks', 'The database', 'The server'], answer: 1, why: 'HTML gives structure; CSS gives the visual style.' },
        { q: 'Which is a correct declaration?', options: ['color = red', 'color: red;', '{color red}', 'color; red:'], answer: 1, why: 'A declaration is property, colon, value, semicolon.' },
        { q: 'Which way is best for a whole website?', options: ['Inline styles', 'An external .css file', 'Only comments', 'Style attributes on every tag'], answer: 1, why: 'One external file can be shared by all pages.' },
      ],
      challenge: {
        prompt: 'Style the page: make h1 dark blue (navy) and p grey. Use a <style> block with two rules.',
        starter: '<style>\n  /* write your rules here */\n</style>\n<h1>My first styled page</h1>\n<p>CSS is fun.</p>\n',
        check: 'style => Add a <style> block.\nre /h1\\s*\\{[^}]*color\\s*:\\s*(navy|darkblue|#00008b|#000080)/i => Add a rule h1 { color: navy; }\nre /p\\s*\\{[^}]*color\\s*:\\s*(gray|grey|darkgray|dimgray|slategray)/i => Add a rule p { color: grey; }',
        hint: 'h1 { color: navy; }  p { color: grey; }',
        solution: '<style>\n  h1 { color: navy; }\n  p { color: grey; }\n</style>\n<h1>My first styled page</h1>\n<p>CSS is fun.</p>\n',
      },
    }),

  C('selectors', 'Selectors: choosing what to style', 'Selector huchagua elementi: kwa jina la tag, class, id au mahali ilipo.',
    'Give the class .note a yellow background and the id #title a red colour.',
    [
      { h: 'Element, class and id', p: [
        'An element selector uses the tag name (p, h1, li). A class selector starts with a dot and picks every element that has that class. An id selector starts with # and picks the one element with that id.',
        'Use classes for styles you want to reuse. An id must be unique on the page, so use it for a single special element.'],
        code: `<style>\n  p { font-size: 18px; }\n  .note { background: #fef08a; padding: 6px; }\n  #title { color: crimson; }\n</style>\n<h2 id="title">Study plan</h2>\n<p>Normal paragraph.</p>\n<p class="note">Remember: exam on Friday.</p>`,
        explain: ['Every paragraph gets 18px text from the element rule.', 'Only the paragraph with class="note" also gets the yellow background.', 'Only the element with id="title" turns crimson.'] },
      { h: 'Groups and descendants', p: [
        'Separate selectors with a comma to give them the same rule. Separate them with a space to select an element inside another (a descendant). A > means only direct children.'],
        code: `<style>\n  h1, h2 { color: teal; }\n  nav a { color: purple; }\n  ul > li { font-weight: bold; }\n</style>\n<h1>Teal</h1><h2>Teal too</h2>\n<nav><a href="#">Purple link</a></nav>\n<a href="#">Normal link</a>\n<ul><li>Bold item</li></ul>`,
        explain: ['h1, h2 styles both headings with one rule.', 'nav a only matches links that are inside a <nav>; the link outside keeps its normal colour.', 'ul > li matches list items that are direct children of a list.'] },
      { h: 'Pseudo-classes and attributes', p: [
        'A pseudo-class selects an element in a state or position, written with a colon: :hover (pointer over it), :first-child, :nth-child(2), :last-child. An attribute selector matches an attribute, such as input[type="email"].'],
        code: `<style>\n  li:first-child { color: green; }\n  li:nth-child(even) { background: #e2e8f0; }\n  a:hover { color: red; }\n</style>\n<ul><li>One</li><li>Two</li><li>Three</li><li>Four</li></ul>\n<a href="#">Hover over me</a>`,
        explain: ['The first item is green. Items 2 and 4 (even) get a light grey background.', 'The link turns red only while the pointer is over it.'] },
      { h: 'Which rule wins?', p: [
        'When two rules disagree, the more specific selector wins: an id beats a class, and a class beats an element. If they are equally specific, the rule written later wins. That is the “cascading” in CSS.'],
        code: `<style>\n  p { color: blue; }\n  .warn { color: orange; }\n  #urgent { color: red; }\n</style>\n<p class="warn" id="urgent">Which colour am I?</p>`,
        explain: ['The text is red. The id rule is more specific than the class rule, and the class rule is more specific than the element rule.'] },
    ], {
      mistakes: ['Forgetting the dot for a class (note { } selects a <note> tag, not class="note").', 'Using the same id on many elements; use a class instead.', 'Adding a space in .a .b when you meant both classes on one element: use .a.b.', 'Being confused when an old rule wins: check specificity and the order of the rules.'],
      exercises: [
        { q: 'Select all elements with class="card" and give them a light grey background.', a: '<style>\n  .card { background: #e5e7eb; padding: 8px; }\n</style>\n<div class="card">Card one</div>\n<div class="card">Card two</div>' },
        { q: 'Make only the links inside a <footer> white on a dark background.', a: '<style>\n  footer { background: #1e293b; padding: 8px; }\n  footer a { color: white; }\n</style>\n<footer><a href="#">Contact</a></footer>\n<a href="#">Outside link</a>' },
        { q: 'Make every second row of a list light grey.', a: '<style>\n  li:nth-child(2n) { background: #e2e8f0; }\n</style>\n<ul><li>A</li><li>B</li><li>C</li><li>D</li></ul>' },
      ],
      quiz: [
        { q: 'Which selector picks elements with class="tip"?', options: ['tip', '#tip', '.tip', '*tip'], answer: 2, why: 'A dot means class.' },
        { q: 'What does ul > li select?', options: ['All li anywhere', 'li that are direct children of a ul', 'Only the first li', 'The ul itself'], answer: 1, why: '> selects direct children only.' },
        { q: 'A class rule and an id rule both set the colour. Which wins?', options: ['The class', 'The id', 'The one written first', 'Neither'], answer: 1, why: 'An id is more specific than a class.' },
      ],
      challenge: {
        prompt: 'Write two rules: the class .note must have a yellow background (yellow or #fef08a style) and the id #title must have the colour red.',
        starter: '<style>\n  /* your rules */\n</style>\n<h2 id="title">Notes</h2>\n<p class="note">Bring a calculator.</p>\n',
        check: 're /\\.note\\s*\\{[^}]*background(-color)?\\s*:\\s*(yellow|#fef08a|#ff0|#ffff00|lightyellow|gold)/i => Add a rule for .note with a yellow background.\nre /#title\\s*\\{[^}]*color\\s*:\\s*(red|crimson|#f00|#ff0000)/i => Add a rule for #title with colour red.',
        hint: '.note { background: yellow; }  #title { color: red; }',
        solution: '<style>\n  .note { background: yellow; }\n  #title { color: red; }\n</style>\n<h2 id="title">Notes</h2>\n<p class="note">Bring a calculator.</p>\n',
      },
    }),

  C('colors', 'Colours, backgrounds and units', 'Rangi (jina, hex, rgb), mandharinyuma na vipimo: px, %, em, rem.',
    'Give the box a dark blue background, white text and a rounded corner.',
    [
      { h: 'Ways to write a colour', p: [
        'You can use a colour name (red, teal, tomato), a hex code (#2563eb), rgb(37, 99, 235) or hsl(221, 83%, 53%). They all describe a colour; hex is the most common in real projects.',
        'Hex is three pairs of numbers for red, green and blue, from 00 (none) to ff (full). #000000 is black, #ffffff is white, #ff0000 is pure red. Add transparency with rgba(0, 0, 0, 0.5) where the last number is opacity from 0 to 1.'],
        code: `<style>\n  .a { color: tomato; }\n  .b { color: #2563eb; }\n  .c { color: rgb(22, 163, 74); }\n  .d { color: rgba(0, 0, 0, 0.4); }\n</style>\n<p class="a">Name: tomato</p>\n<p class="b">Hex: #2563eb</p>\n<p class="c">RGB: green</p>\n<p class="d">RGBA: 40% black</p>`,
        explain: ['Each paragraph uses a different notation. The last one is black but see-through, so it looks grey.'] },
      { h: 'Text and background colour', p: [
        'color sets the text colour. background-color (or the short background) sets the background. Always check that the two have enough contrast, otherwise people cannot read the text.'],
        code: `<style>\n  .banner { background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 12px; }\n  .soft { background: linear-gradient(90deg, #38bdf8, #818cf8); color: white; padding: 16px; }\n</style>\n<div class="banner">Light text on dark background</div>\n<div class="soft">A gradient background</div>`,
        explain: ['The banner pairs very dark blue with almost white text: strong contrast.', 'A gradient is a background-image made by the browser. linear-gradient(90deg, a, b) blends from colour a on the left to colour b on the right.'] },
      { h: 'Units: px, %, em, rem', p: [
        'px is a fixed pixel. % is relative to the parent. em is relative to the font size of the element; rem is relative to the font size of the page root (usually 16px), so 2rem is 32px. Use rem for text and spacing that should grow if the user enlarges their font.',
        'vw and vh mean 1% of the screen width and height.'],
        code: `<style>\n  .box { background: #dbeafe; padding: 1rem; }\n  .half { width: 50%; background: #93c5fd; padding: 0.5rem; }\n  .big { font-size: 2rem; }\n</style>\n<div class="box">\n  <div class="half">50% of the box</div>\n  <p class="big">2rem text</p>\n</div>`,
        explain: ['.half is as wide as half of its parent .box, whatever the screen size.', '2rem is twice the root font size, so the text is about 32px.'] },
    ], {
      mistakes: ['Light grey text on a white background that nobody can read.', 'Forgetting the # in a hex colour (2563eb does nothing).', 'Writing a number without a unit (width: 20 does nothing; use 20px). The only allowed unitless value is 0.', 'Using px everywhere so the page does not respond to user font settings.'],
      exercises: [
        { q: 'Give a paragraph a background colour of light green and dark green text.', a: '<style>\n  p { background: #dcfce7; color: #166534; padding: 10px; }\n</style>\n<p>Readable text</p>' },
        { q: 'Make a box 80% of the width of its parent and centre-coloured with a gradient.', a: '<style>\n  .box { width: 80%; padding: 20px; color: white; background: linear-gradient(135deg, #f97316, #db2777); }\n</style>\n<div class="box">Gradient box</div>' },
        { q: 'Write the colour white three different ways.', a: '<style>\n  .a { background: white; }\n  .b { background: #ffffff; }\n  .c { background: rgb(255, 255, 255); }\n</style>\n<div class="a">a</div><div class="b">b</div><div class="c">c</div>' },
      ],
      quiz: [
        { q: 'What colour is #000000?', options: ['White', 'Red', 'Black', 'Blue'], answer: 2, why: 'All three channels are zero, which is black.' },
        { q: 'What is 2rem if the root font size is 16px?', options: ['2px', '16px', '32px', '18px'], answer: 2, why: '2 × 16px = 32px.' },
        { q: 'Which value is invalid?', options: ['width: 20px', 'width: 50%', 'width: 20', 'width: 2rem'], answer: 2, why: 'Non-zero numbers need a unit.' },
      ],
      challenge: {
        prompt: 'Style .box: dark blue background (use #1e3a8a or navy), white text, padding of 16px and border-radius of at least 8px.',
        starter: '<style>\n  .box {\n    /* your declarations */\n  }\n</style>\n<div class="box">VENUE</div>\n',
        check: 're /\\.box\\s*\\{[^}]*background(-color)?\\s*:\\s*(#1e3a8a|navy|#000080|darkblue|#1e40af|#172554)/i => Give .box a dark blue background.\nre /\\.box\\s*\\{[^}]*[^-]color\\s*:\\s*(white|#fff|#ffffff)/i => Make the text white.\nre /\\.box\\s*\\{[^}]*padding\\s*:\\s*16px/i => Add padding: 16px;\nre /\\.box\\s*\\{[^}]*border-radius\\s*:\\s*([89]|[1-9][0-9])px/i => Add border-radius of at least 8px.',
        hint: 'background: navy; color: white; padding: 16px; border-radius: 12px;',
        solution: '<style>\n  .box {\n    background: navy;\n    color: white;\n    padding: 16px;\n    border-radius: 12px;\n  }\n</style>\n<div class="box">VENUE</div>\n',
      },
    }),

  C('text', 'Fonts and text', 'Chagua herufi, ukubwa, unene, mpangilio na nafasi ya mistari.',
    'Centre the heading, make the paragraph 18px with line-height 1.6.',
    [
      { h: 'Font family, size and weight', p: [
        'font-family lists fonts in order of preference; end the list with a generic family (sans-serif, serif or monospace) as a fallback. font-size sets the size, font-weight sets thickness (normal, bold or 100–900) and font-style: italic slants the text.'],
        code: `<style>\n  .title { font-family: Georgia, serif; font-size: 28px; font-weight: bold; }\n  .code { font-family: monospace; font-style: italic; }\n</style>\n<p class="title">A serif title</p>\n<p class="code">Monospaced italic text</p>`,
        explain: ['If Georgia is not on the device, the browser falls back to any serif font.', 'The second line uses the device’s fixed-width font, the one used for code.'] },
      { h: 'Alignment, spacing and decoration', p: [
        'text-align moves text left, center, right or justify. line-height sets the space between lines: 1.5 to 1.7 is comfortable for reading. letter-spacing changes the gaps between letters. text-decoration adds or removes underlines. text-transform changes case.'],
        code: `<style>\n  h2 { text-align: center; text-transform: uppercase; letter-spacing: 2px; }\n  p { line-height: 1.7; }\n  a { text-decoration: none; }\n</style>\n<h2>Reading well</h2>\n<p>Generous line spacing makes long paragraphs much easier to read, especially on a small phone screen.</p>\n<a href="#">A link without underline</a>`,
        explain: ['The heading is centred, in capitals and slightly spread out.', 'line-height: 1.7 means each line is 1.7 times the font size tall.', 'text-decoration: none removes the default underline from the link.'] },
      { h: 'Web fonts', p: [
        'Fonts that are not installed on the reader’s device can be loaded from a service such as Google Fonts with a <link> tag in the head, and then used by name in font-family. Choose one or two fonts at most: too many fonts look messy and slow the page down.'],
        code: `<style>\n  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }\n  h1 { font-weight: 800; }\n</style>\n<h1>System font stack</h1>\n<p>system-ui uses the font of the user’s own device, so there is nothing to download.</p>`,
        explain: ['A font stack lists several choices. The browser uses the first one that exists on the device.', 'Using system fonts keeps the page fast and looks natural on every phone.'] },
    ], {
      mistakes: ['Quoting a font name wrongly: names with spaces need quotes ("Segoe UI").', 'Setting line-height with a unit like 20px for text of every size; a plain number scales better.', 'Justified text on a narrow phone screen creates big gaps between words.', 'Too many different fonts in one page.'],
      exercises: [
        { q: 'Centre an <h1> and make it uppercase.', a: '<style>\n  h1 { text-align: center; text-transform: uppercase; }\n</style>\n<h1>Welcome</h1>' },
        { q: 'Make a paragraph easy to read: 18px text and line-height 1.6.', a: '<style>\n  p { font-size: 18px; line-height: 1.6; }\n</style>\n<p>Long paragraphs need space between the lines so that the eyes do not get lost when moving to the next line.</p>' },
        { q: 'Remove the underline from all links and make them bold.', a: '<style>\n  a { text-decoration: none; font-weight: bold; }\n</style>\n<a href="#">Home</a> <a href="#">About</a>' },
      ],
      quiz: [
        { q: 'Why end a font-family list with sans-serif?', options: ['It is faster', 'It is a fallback if other fonts are missing', 'It makes text bold', 'It is required'], answer: 1, why: 'The generic family guarantees a similar font when the named ones are not available.' },
        { q: 'Which property changes the gap between lines?', options: ['letter-spacing', 'line-height', 'text-align', 'font-style'], answer: 1, why: 'line-height controls vertical spacing of lines.' },
        { q: 'How do you remove a link’s underline?', options: ['text-style: none', 'underline: off', 'text-decoration: none', 'font-weight: none'], answer: 2, why: 'text-decoration: none removes it.' },
      ],
      challenge: {
        prompt: 'Centre the h1 text and give the p a font-size of 18px and a line-height of 1.6.',
        starter: '<style>\n  /* your rules */\n</style>\n<h1>Reading on a phone</h1>\n<p>Good typography keeps people reading.</p>\n',
        check: 're /h1\\s*\\{[^}]*text-align\\s*:\\s*center/i => Centre the h1 with text-align: center;\nre /p\\s*\\{[^}]*font-size\\s*:\\s*18px/i => Give p a font-size of 18px.\nre /p\\s*\\{[^}]*line-height\\s*:\\s*1\\.6/i => Give p a line-height of 1.6.',
        hint: 'h1 { text-align: center; }  p { font-size: 18px; line-height: 1.6; }',
        solution: '<style>\n  h1 { text-align: center; }\n  p { font-size: 18px; line-height: 1.6; }\n</style>\n<h1>Reading on a phone</h1>\n<p>Good typography keeps people reading.</p>\n',
      },
    }),

  C('box', 'The box model: margin, border, padding', 'Kila elementi ni boksi: content, padding, border na margin.',
    'Give the card 20px padding, a 2px solid border and 16px margin.',
    [
      { h: 'Every element is a box', p: [
        'The browser draws every element as a rectangular box with four layers, from the inside out: the content (text or image), the padding (space between content and border), the border (a line around the padding) and the margin (space outside the border that pushes other boxes away).',
        'Understanding these four layers explains most spacing problems.'],
        code: `<style>\n  .card {\n    background: #e0f2fe;\n    padding: 20px;\n    border: 3px solid #0284c7;\n    margin: 24px;\n  }\n</style>\n<div class="card">Content inside padding, border and margin.</div>`,
        explain: ['The light blue area includes content and padding, because the background paints under the padding.', 'The border is the solid blue line. The margin is the empty space outside it; it has no colour.'] },
      { h: 'Shorthand for four sides', p: [
        'padding: 10px; sets all four sides. Two values (10px 20px) mean top and bottom, then left and right. Four values go clockwise from the top: top, right, bottom, left. You can also set one side: margin-top, padding-left.',
        'border has three parts: width, style and colour, for example border: 2px dashed tomato. border-radius rounds the corners; 50% makes a circle from a square.'],
        code: `<style>\n  .a { padding: 8px 24px; background: #fde68a; margin-bottom: 10px; }\n  .b { padding: 4px 8px 16px 32px; background: #bbf7d0; margin-bottom: 10px; }\n  .c { width: 80px; height: 80px; background: #fca5a5; border: 4px dashed #b91c1c; border-radius: 50%; }\n</style>\n<div class="a">8px top/bottom, 24px left/right</div>\n<div class="b">top 4, right 8, bottom 16, left 32</div>\n<div class="c"></div>`,
        explain: ['Box a has little space above and below, but wide space left and right.', 'Box b shows the clockwise order: top, right, bottom, left.', 'Box c is an 80px square with border-radius: 50%, so it becomes a circle.'] },
      { h: 'Margin tricks', p: [
        'Vertical margins between two boxes collapse: the gap is the larger of the two, not their sum. Setting margin: 0 auto on a box with a fixed width centres it horizontally. Negative margins pull things closer.'],
        code: `<style>\n  .page { width: 200px; margin: 0 auto; background: #ddd6fe; padding: 10px; text-align: center; }\n  .gap1 { margin-bottom: 30px; background: #fecaca; }\n  .gap2 { margin-top: 20px; background: #bfdbfe; }\n</style>\n<div class="page">A centred 200px box</div>\n<div class="gap1">Margin bottom 30px</div>\n<div class="gap2">Margin top 20px</div>`,
        explain: ['auto margins share the leftover space equally on both sides, which centres the box.', 'The red and blue boxes are 30px apart, not 50px, because the margins collapse to the larger value.'] },
    ], {
      mistakes: ['Confusing margin and padding: padding is inside the border, margin is outside.', 'Expecting margin to have a background colour; it is always transparent.', 'Forgetting that padding and border add to the width of a box (see the next lesson).', 'Writing four values in the wrong order. Remember clockwise from the top.'],
      exercises: [
        { q: 'Make a button-like box with 10px top and bottom, 24px left and right padding and rounded corners.', a: '<style>\n  .btn { display: inline-block; padding: 10px 24px; background: #2563eb; color: white; border-radius: 10px; }\n</style>\n<span class="btn">Register</span>' },
        { q: 'Centre a box that is 300px wide.', a: '<style>\n  .box { width: 300px; margin: 0 auto; background: #fef3c7; padding: 12px; }\n</style>\n<div class="box">I am centred</div>' },
        { q: 'Draw a perfect circle of 100px with a red border.', a: '<style>\n  .dot { width: 100px; height: 100px; border: 4px solid red; border-radius: 50%; }\n</style>\n<div class="dot"></div>' },
      ],
      quiz: [
        { q: 'Which layer is outside the border?', options: ['Padding', 'Content', 'Margin', 'Background'], answer: 2, why: 'Margin is the space around the border.' },
        { q: 'What does padding: 5px 10px 15px 20px set for the top?', options: ['5px', '10px', '15px', '20px'], answer: 0, why: 'The order is top, right, bottom, left.' },
        { q: 'How do you centre a fixed-width block horizontally?', options: ['padding: auto', 'margin: 0 auto', 'text-align: block', 'border: auto'], answer: 1, why: 'Auto left and right margins share the free space equally.' },
      ],
      challenge: {
        prompt: 'Style .card with padding of 20px, a 2px solid border and a margin of 16px.',
        starter: '<style>\n  .card {\n    background: #f1f5f9;\n    /* add padding, border and margin */\n  }\n</style>\n<div class="card">Box model practice</div>\n',
        check: 're /\\.card\\s*\\{[^}]*padding\\s*:\\s*20px/i => Add padding: 20px;\nre /\\.card\\s*\\{[^}]*border\\s*:\\s*2px\\s+solid/i => Add border: 2px solid (with a colour).\nre /\\.card\\s*\\{[^}]*margin\\s*:\\s*16px/i => Add margin: 16px;',
        hint: 'padding: 20px; border: 2px solid #334155; margin: 16px;',
        solution: '<style>\n  .card {\n    background: #f1f5f9;\n    padding: 20px;\n    border: 2px solid #334155;\n    margin: 16px;\n  }\n</style>\n<div class="card">Box model practice</div>\n',
      },
    }),

  C('sizing', 'Width, height, display and overflow', 'Ukubwa wa boksi, block dhidi ya inline, na maudhui yanayozidi.',
    'Make the image-like box fluid: width 100% with a max-width of 400px.',
    [
      { h: 'Block and inline', p: [
        'Block elements (div, p, h1, ul) start on a new line and stretch to the full width. Inline elements (span, a, strong) flow inside a line of text and ignore width and height. inline-block flows like inline but accepts width, height and vertical padding. display: none hides an element completely.'],
        code: `<style>\n  .b { background: #bfdbfe; margin-bottom: 6px; }\n  .i { background: #fde68a; }\n  .ib { display: inline-block; width: 90px; background: #bbf7d0; padding: 6px; }\n</style>\n<div class="b">Block: full width</div>\n<span class="i">inline one</span> <span class="i">inline two</span>\n<p><span class="ib">box 1</span> <span class="ib">box 2</span></p>`,
        explain: ['The blue div takes the full row. The two yellow spans sit side by side, only as wide as their text.', 'The green inline-blocks sit on one line but obey the width of 90px.'] },
      { h: 'Width, max-width and box-sizing', p: [
        'By default width sets only the content, so padding and border are added on top and the box ends up wider than you wrote. box-sizing: border-box makes width include padding and border, which is far easier to plan. Most developers add * { box-sizing: border-box; } to every project.',
        'A fluid box uses width: 100% with a max-width: it grows and shrinks with the screen but never becomes too large.'],
        code: `<style>\n  * { box-sizing: border-box; }\n  .panel { width: 100%; max-width: 360px; padding: 20px; border: 4px solid #0f766e; background: #ccfbf1; margin: 0 auto; }\n</style>\n<div class="panel">Fits any phone and never wider than 360px.</div>`,
        explain: ['With border-box the panel is exactly as wide as its parent (up to 360px) even with 20px padding and a 4px border.', 'Without border-box it would stick out of the screen by 48px.'] },
      { h: 'Overflow', p: [
        'When content is bigger than its box it overflows. overflow: hidden cuts it off, overflow: auto adds a scrollbar only when needed, and overflow: scroll always shows one. text-overflow: ellipsis with white-space: nowrap shows … for a long single line.'],
        code: `<style>\n  .scroll { height: 70px; overflow: auto; border: 2px solid #64748b; padding: 6px; }\n  .dots { width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; background: #e2e8f0; }\n</style>\n<div class="scroll">Line 1<br>Line 2<br>Line 3<br>Line 4<br>Line 5<br>Line 6</div>\n<p class="dots">This is a very long course title that does not fit</p>`,
        explain: ['The first box is only 70px tall, so the extra lines are reachable by scrolling inside it.', 'The second shows as much as fits and ends with …'] },
    ], {
      mistakes: ['Setting width on an inline element such as span: nothing changes until you use display: inline-block or block.', 'Forgetting box-sizing and getting boxes wider than the screen.', 'Using a fixed width: 600px that breaks on a 360px phone; use max-width instead.', 'Hiding content with overflow: hidden and then wondering where the text went.'],
      exercises: [
        { q: 'Make three inline-blocks, each 80px wide, sit on one line with a coloured background.', a: '<style>\n  .tile { display: inline-block; width: 80px; padding: 10px; background: #fbcfe8; text-align: center; }\n</style>\n<span class="tile">1</span> <span class="tile">2</span> <span class="tile">3</span>' },
        { q: 'Add box-sizing: border-box to every element.', a: '<style>\n  * { box-sizing: border-box; }\n  div { width: 200px; padding: 20px; border: 5px solid black; }\n</style>\n<div>This is exactly 200px wide</div>' },
        { q: 'Show a long line with an ellipsis (…) at the end.', a: '<style>\n  p { width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n</style>\n<p>A very very long sentence indeed</p>' },
      ],
      quiz: [
        { q: 'Which display value makes an element ignore width and height?', options: ['block', 'inline', 'inline-block', 'flex'], answer: 1, why: 'Inline elements flow in text and ignore width and height.' },
        { q: 'What does box-sizing: border-box change?', options: ['The colour', 'Width includes padding and border', 'It hides the border', 'It removes margins'], answer: 1, why: 'The declared width then counts padding and border too.' },
        { q: 'Which value adds a scrollbar only when needed?', options: ['overflow: hidden', 'overflow: auto', 'overflow: none', 'overflow: visible'], answer: 1, why: 'auto shows scrollbars only if content overflows.' },
      ],
      challenge: {
        prompt: 'Make .pic fluid: width 100%, a max-width of 400px and box-sizing: border-box.',
        starter: '<style>\n  .pic {\n    background: #c7d2fe;\n    padding: 20px;\n    /* make it fluid */\n  }\n</style>\n<div class="pic">A fluid box</div>\n',
        check: 're /\\.pic\\s*\\{[^}]*[^-]width\\s*:\\s*100%/i => Add width: 100%;\nre /\\.pic\\s*\\{[^}]*max-width\\s*:\\s*400px/i => Add max-width: 400px;\nre /box-sizing\\s*:\\s*border-box/i => Add box-sizing: border-box;',
        hint: 'width: 100%; max-width: 400px; box-sizing: border-box;',
        solution: '<style>\n  .pic {\n    background: #c7d2fe;\n    padding: 20px;\n    width: 100%;\n    max-width: 400px;\n    box-sizing: border-box;\n  }\n</style>\n<div class="pic">A fluid box</div>\n',
      },
    }),
];
