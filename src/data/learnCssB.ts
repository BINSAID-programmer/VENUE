import type { LearnLesson } from './learnLessons';
import { C } from './learnCssA';

/** Chapters 3–5: layout, responsive design, effects and a project. */
export const CSS_B: LearnLesson[] = [
  C('flex', 'Flexbox: rows and columns', 'Flexbox hupanga vitu kwa mstari au safu, na kuvigawanya nafasi kwa urahisi.',
    'Put three boxes in a row with space between them and centred vertically.',
    [
      { h: 'Turn a container into a flex container', p: [
        'Flexbox is a layout system for one direction at a time. Put display: flex on the parent (the container) and its direct children (the items) line up in a row. The container controls the layout; the items just come along.',
        'gap adds space between the items, which is much cleaner than margins.'],
        code: `<style>\n  .row { display: flex; gap: 10px; }\n  .row div { background: #bfdbfe; padding: 14px; }\n</style>\n<div class="row"><div>One</div><div>Two</div><div>Three</div></div>`,
        explain: ['Without display: flex the three divs would stack, one per line. With it they sit side by side.', 'gap: 10px puts 10px between neighbours but not at the outer edges.'] },
      { h: 'Main axis and cross axis', p: [
        'A flex container has a main axis (the direction of the row, left to right) and a cross axis (the other way). justify-content spreads items along the main axis: flex-start, center, flex-end, space-between, space-around. align-items positions them on the cross axis: stretch, center, flex-start, flex-end.',
        'flex-direction: column turns the main axis to vertical; then the two properties swap roles.'],
        code: `<style>\n  .bar { display: flex; justify-content: space-between; align-items: center; height: 90px; background: #0f172a; padding: 0 14px; }\n  .bar span { color: white; }\n  .bar b { background: #38bdf8; padding: 8px 12px; border-radius: 8px; }\n</style>\n<div class="bar"><span>VENUE</span><span>Learn</span><b>Login</b></div>`,
        explain: ['space-between pushes the first item to the left, the last to the right and spaces the rest equally: this is how most navigation bars are built.', 'align-items: center keeps every item in the vertical middle of the 90px bar.'] },
      { h: 'Growing, shrinking and wrapping', p: [
        'flex: 1 on an item tells it to take its share of the free space. Two items with flex: 1 share the space equally; give one flex: 2 and it gets twice as much. flex-wrap: wrap lets items move to the next line when they do not fit, which is vital on phones.'],
        code: `<style>\n  .cols { display: flex; gap: 8px; }\n  .cols div { flex: 1; background: #bbf7d0; padding: 10px; text-align: center; }\n  .cols .wide { flex: 2; background: #fde68a; }\n  .wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }\n  .wrap span { background: #e9d5ff; padding: 8px 14px; border-radius: 20px; }\n</style>\n<div class="cols"><div>1</div><div class="wide">2 (double)</div><div>3</div></div>\n<div class="wrap"><span>Algebra</span><span>Calculus</span><span>Statistics</span><span>Probability</span><span>Python</span></div>`,
        explain: ['The yellow box is twice as wide as each green one because its flex value is 2.', 'The tags below fill a line and then wrap onto the next one instead of overflowing the screen.'] },
      { h: 'Perfect centring', p: ['Centring something both ways, once the hardest job in CSS, takes three lines with flexbox.'],
        code: `<style>\n  .stage { display: flex; justify-content: center; align-items: center; height: 140px; background: #1e293b; }\n  .stage p { color: white; background: #2563eb; padding: 12px 20px; border-radius: 10px; }\n</style>\n<div class="stage"><p>Centred!</p></div>`,
        explain: ['justify-content centres horizontally, align-items centres vertically. The container must have a height, otherwise there is no extra room to centre in.'] },
    ], {
      mistakes: ['Putting display: flex on the item instead of the parent.', 'Forgetting that flex only affects direct children, not grandchildren.', 'Expecting align-items to work when the container has no height.', 'Forgetting flex-wrap, so items squeeze or overflow on small screens.'],
      exercises: [
        { q: 'Build a navigation bar with the brand on the left and two links on the right.', a: '<style>\n  nav { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #0f172a; color: white; }\n  .links { display: flex; gap: 12px; }\n</style>\n<nav><b>VENUE</b><div class="links"><span>Learn</span><span>Prospectus</span></div></nav>' },
        { q: 'Make a column of three buttons with 8px between them.', a: '<style>\n  .col { display: flex; flex-direction: column; gap: 8px; width: 160px; }\n  .col button { padding: 10px; }\n</style>\n<div class="col"><button>One</button><button>Two</button><button>Three</button></div>' },
        { q: 'Make four cards of equal width in one row.', a: '<style>\n  .cards { display: flex; gap: 6px; }\n  .cards div { flex: 1; background: #fecaca; padding: 14px; text-align: center; }\n</style>\n<div class="cards"><div>A</div><div>B</div><div>C</div><div>D</div></div>' },
      ],
      quiz: [
        { q: 'Where do you write display: flex?', options: ['On every item', 'On the parent container', 'On the body only', 'On the image'], answer: 1, why: 'The container turns its direct children into flex items.' },
        { q: 'Which property spreads items along the main axis?', options: ['align-items', 'justify-content', 'text-align', 'gap'], answer: 1, why: 'justify-content works along the main axis; align-items works across it.' },
        { q: 'What does flex: 1 do on an item?', options: ['Makes it 1px wide', 'Lets it share the free space', 'Hides it', 'Adds a border'], answer: 1, why: 'The item grows to take its share of free space.' },
      ],
      challenge: {
        prompt: 'Make .row a flex container with space-between spacing and items vertically centred (align-items: center).',
        starter: '<style>\n  .row {\n    background: #e2e8f0;\n    height: 80px;\n    /* make it a flex row */\n  }\n  .row div { background: #60a5fa; padding: 10px; }\n</style>\n<div class="row"><div>A</div><div>B</div><div>C</div></div>\n',
        check: 're /\\.row\\s*\\{[^}]*display\\s*:\\s*flex/i => Add display: flex; to .row\nre /\\.row\\s*\\{[^}]*justify-content\\s*:\\s*space-between/i => Add justify-content: space-between;\nre /\\.row\\s*\\{[^}]*align-items\\s*:\\s*center/i => Add align-items: center;',
        hint: 'display: flex; justify-content: space-between; align-items: center;',
        solution: '<style>\n  .row {\n    background: #e2e8f0;\n    height: 80px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  }\n  .row div { background: #60a5fa; padding: 10px; }\n</style>\n<div class="row"><div>A</div><div>B</div><div>C</div></div>\n',
      },
    }),

  C('grid', 'CSS Grid: rows and columns together', 'Grid hupanga kwa safu na mistari kwa wakati mmoja: nzuri kwa gallery na dashboards.',
    'Build a grid with three equal columns and a 10px gap.',
    [
      { h: 'Columns with grid-template-columns', p: [
        'Where flexbox works in one direction, Grid works in two: rows and columns together. Put display: grid on the container and describe the columns with grid-template-columns. The items fill the cells automatically, left to right, then onto the next row.',
        'The unit fr means “a fraction of the free space”. 1fr 1fr 1fr gives three equal columns; 2fr 1fr gives the first column twice as wide as the second.'],
        code: `<style>\n  .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }\n  .grid div { background: #a7f3d0; padding: 16px; text-align: center; }\n</style>\n<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>`,
        explain: ['Six items fill two rows of three cells each, with 10px between all cells.', 'Change the columns to 2fr 1fr 1fr to make the first column twice as wide.'] },
      { h: 'repeat and responsive grids', p: [
        'repeat(3, 1fr) is a short way to write 1fr 1fr 1fr. The most useful pattern in modern CSS is repeat(auto-fit, minmax(140px, 1fr)): make as many columns as fit, each at least 140px wide, and share the leftover space. The number of columns adapts to the screen with no media query.'],
        code: `<style>\n  .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }\n  .gallery div { background: #fbcfe8; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }\n</style>\n<div class="gallery"><div>A</div><div>B</div><div>C</div><div>D</div><div>E</div><div>F</div></div>`,
        explain: ['On a wide screen you see many columns in a row; on a narrow phone the same code shows two or three.', 'This is the standard way to build card lists and photo galleries.'] },
      { h: 'Spanning cells', p: [
        'An item can cover several columns or rows with grid-column: span 2 or grid-row: span 2. This lets you build layouts such as a page with a header across the top, a sidebar and a main area.'],
        code: `<style>\n  .page { display: grid; grid-template-columns: 1fr 2fr; gap: 6px; }\n  .page > * { padding: 12px; border-radius: 6px; }\n  .top { grid-column: span 2; background: #fde68a; }\n  .side { background: #bfdbfe; }\n  .main { background: #bbf7d0; }\n</style>\n<div class="page"><div class="top">Header</div><div class="side">Sidebar</div><div class="main">Main content</div></div>`,
        explain: ['The header spans both columns, so it fills the whole first row.', 'The sidebar and main area share the second row in the proportion 1 to 2.'] },
    ], {
      mistakes: ['Writing grid-template-columns on the items instead of the container.', 'Mixing up fr and %: percentages ignore the gap, so 3 × 33% plus gaps overflows; fr does not.', 'Fixed pixel columns that break on a small phone; prefer minmax and auto-fit.', 'Using grid for a simple single row where flexbox is easier.'],
      exercises: [
        { q: 'Make a grid with 2 columns, the first one twice as wide as the second.', a: '<style>\n  .g { display: grid; grid-template-columns: 2fr 1fr; gap: 8px; }\n  .g div { background: #ddd6fe; padding: 14px; }\n</style>\n<div class="g"><div>Wide</div><div>Narrow</div></div>' },
        { q: 'Build a responsive card grid with auto-fit and minmax.', a: '<style>\n  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }\n  .cards div { background: #fed7aa; padding: 20px; text-align: center; }\n</style>\n<div class="cards"><div>1</div><div>2</div><div>3</div><div>4</div></div>' },
        { q: 'Make the first item span two columns.', a: '<style>\n  .g { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }\n  .g div { background: #99f6e4; padding: 14px; }\n  .g .big { grid-column: span 2; }\n</style>\n<div class="g"><div class="big">Spans 2</div><div>2</div><div>3</div><div>4</div></div>' },
      ],
      quiz: [
        { q: 'What does 1fr mean?', options: ['1 pixel', 'One fraction of the free space', '1 frame', 'One row'], answer: 1, why: 'fr divides the free space into fractions.' },
        { q: 'Which is a grid with three equal columns?', options: ['grid-columns: 3', 'grid-template-columns: repeat(3, 1fr)', 'columns: 3fr', 'display: 3'], answer: 1, why: 'repeat(3, 1fr) means 1fr three times.' },
        { q: 'Flexbox or Grid for a page with rows and columns together?', options: ['Flexbox', 'Grid', 'float', 'table-cell only'], answer: 1, why: 'Grid is made for two-dimensional layouts.' },
      ],
      challenge: {
        prompt: 'Make .grid a grid with three equal columns (use repeat(3, 1fr) or 1fr 1fr 1fr) and a gap of 10px.',
        starter: '<style>\n  .grid {\n    /* your grid */\n  }\n  .grid div { background: #a5b4fc; padding: 14px; text-align: center; }\n</style>\n<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>\n',
        check: 're /\\.grid\\s*\\{[^}]*display\\s*:\\s*grid/i => Add display: grid; to .grid\nre /grid-template-columns\\s*:\\s*(repeat\\(\\s*3\\s*,\\s*1fr\\s*\\)|1fr\\s+1fr\\s+1fr)/i => Use three equal columns: repeat(3, 1fr)\nre /\\.grid\\s*\\{[^}]*gap\\s*:\\s*10px/i => Add gap: 10px;',
        hint: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;',
        solution: '<style>\n  .grid {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 10px;\n  }\n  .grid div { background: #a5b4fc; padding: 14px; text-align: center; }\n</style>\n<div class="grid"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>\n',
      },
    }),

  C('position', 'Position, layers and sticky bars', 'position: relative, absolute, fixed na sticky; z-index kuweka vitu juu ya vingine.',
    'Put a red badge in the top-right corner of the card using absolute positioning.',
    [
      { h: 'The normal flow and position', p: [
        'Normally boxes follow the normal flow: block elements stack down the page. The position property lets you take a box out of that flow. static is the default. relative moves a box from its normal place (with top, left, right, bottom) while keeping its space. absolute removes it from the flow and places it relative to the nearest ancestor that is positioned.'],
        code: `<style>\n  .card { position: relative; width: 220px; padding: 24px 12px 12px; background: #f1f5f9; border: 2px solid #94a3b8; border-radius: 10px; }\n  .badge { position: absolute; top: -10px; right: -10px; background: #dc2626; color: white; padding: 4px 10px; border-radius: 20px; font-size: 13px; }\n</style>\n<div class="card">Statistics notes<span class="badge">NEW</span></div>`,
        explain: ['The card is position: relative, so it becomes the reference for its absolute children.', 'The badge sits 10px above and 10px outside the top-right corner of the card, whatever its size.', 'If the card were not positioned, the badge would attach to the page corner instead: a common surprise.'] },
      { h: 'Fixed and sticky', p: [
        'fixed places the box relative to the screen and it stays there when you scroll, which is used for floating buttons and top bars. sticky is a mix: the box scrolls normally until it reaches the offset you gave (such as top: 0) and then sticks.'],
        code: `<style>\n  .scrollbox { height: 120px; overflow: auto; border: 2px solid #64748b; }\n  .head { position: sticky; top: 0; background: #0f172a; color: white; padding: 8px; }\n  .scrollbox p { margin: 0; padding: 10px; }\n</style>\n<div class="scrollbox"><div class="head">Sticky header</div><p>Row 1</p><p>Row 2</p><p>Row 3</p><p>Row 4</p><p>Row 5</p><p>Row 6</p></div>`,
        explain: ['Scroll inside the box: the dark header stays at the top while the rows move under it.', 'Sticky headers are common for tables and top navigation bars.'] },
      { h: 'Layers with z-index', p: [
        'When positioned boxes overlap, z-index decides which is on top; a larger number wins. It only works on positioned elements (and flex or grid items).'],
        code: `<style>\n  .stack { position: relative; height: 110px; }\n  .stack div { position: absolute; width: 90px; height: 70px; color: white; padding: 8px; }\n  .one { background: #2563eb; left: 0; top: 0; z-index: 1; }\n  .two { background: #dc2626; left: 50px; top: 25px; z-index: 2; }\n  .three { background: #16a34a; left: 100px; top: 0; z-index: 1; }\n</style>\n<div class="stack"><div class="one">1</div><div class="two">2 (on top)</div><div class="three">3</div></div>`,
        explain: ['Box 2 has z-index: 2, so it is drawn over the other two even though it comes second in the HTML.'] },
    ], {
      mistakes: ['Using absolute without a positioned parent, so the box jumps to a corner of the page.', 'Forgetting that absolute boxes do not take space, so the next elements move up under them.', 'Putting z-index on a static element, where it has no effect.', 'Using fixed bars that cover content; add padding to the page to make room.'],
      exercises: [
        { q: 'Place a small “x” close symbol in the top-right corner inside a box.', a: '<style>\n  .box { position: relative; width: 200px; padding: 20px; background: #e2e8f0; }\n  .x { position: absolute; top: 4px; right: 8px; cursor: pointer; }\n</style>\n<div class="box">Message<span class="x">×</span></div>' },
        { q: 'Make a floating round button fixed at the bottom-right of the screen.', a: '<style>\n  .fab { position: fixed; right: 16px; bottom: 16px; width: 52px; height: 52px; border-radius: 50%; background: #2563eb; color: white; display: flex; align-items: center; justify-content: center; font-size: 26px; }\n</style>\n<div class="fab">+</div>\n<p>Page content</p>' },
        { q: 'Make a header that stays at the top while the page scrolls.', a: '<style>\n  .top { position: sticky; top: 0; background: #0f172a; color: white; padding: 10px; }\n</style>\n<div class="top">VENUE</div>\n<p style="height:300px">Scroll this page</p>' },
      ],
      quiz: [
        { q: 'An absolute box is placed relative to what?', options: ['The screen always', 'The nearest positioned ancestor', 'The previous sibling', 'The html tag only'], answer: 1, why: 'It looks for the closest ancestor with a position other than static.' },
        { q: 'Which keeps an element on screen while scrolling?', options: ['position: static', 'position: fixed', 'position: inline', 'display: sticky'], answer: 1, why: 'fixed is relative to the viewport and does not scroll away.' },
        { q: 'Which box is on top?', options: ['Lower z-index', 'Higher z-index', 'The shorter one', 'The first in HTML always'], answer: 1, why: 'A higher z-index is drawn above lower ones.' },
      ],
      challenge: {
        prompt: 'Make .card position: relative and place .badge absolutely at top: 8px and right: 8px.',
        starter: '<style>\n  .card { width: 220px; padding: 30px 12px 12px; background: #f1f5f9; border: 2px solid #94a3b8; }\n  .badge { background: #dc2626; color: white; padding: 4px 10px; border-radius: 20px; }\n</style>\n<div class="card">Notes <span class="badge">NEW</span></div>\n',
        check: 're /\\.card\\s*\\{[^}]*position\\s*:\\s*relative/i => Add position: relative; to .card\nre /\\.badge\\s*\\{[^}]*position\\s*:\\s*absolute/i => Add position: absolute; to .badge\nre /\\.badge\\s*\\{[^}]*top\\s*:\\s*8px/i => Add top: 8px; to .badge\nre /\\.badge\\s*\\{[^}]*right\\s*:\\s*8px/i => Add right: 8px; to .badge',
        hint: '.card { position: relative; }  .badge { position: absolute; top: 8px; right: 8px; }',
        solution: '<style>\n  .card { position: relative; width: 220px; padding: 30px 12px 12px; background: #f1f5f9; border: 2px solid #94a3b8; }\n  .badge { position: absolute; top: 8px; right: 8px; background: #dc2626; color: white; padding: 4px 10px; border-radius: 20px; }\n</style>\n<div class="card">Notes <span class="badge">NEW</span></div>\n',
      },
    }),

  C('responsive', 'Responsive design and media queries', 'Ukurasa unaobadilika kulingana na ukubwa wa skrini: viewport, @media na mobile-first.',
    'Make the two boxes stack on phones and sit side by side from 600px up.',
    [
      { h: 'Why responsive?', p: [
        'People open your page on phones, tablets and big monitors. A responsive page adapts to each. It needs the viewport meta tag in the head, <meta name="viewport" content="width=device-width, initial-scale=1">, otherwise a phone pretends to be a wide desktop and shrinks everything. Together with fluid widths (percentages, max-width, fr) and flexible images (max-width: 100%) this solves most cases.'],
        code: `<style>\n  img, .photo { max-width: 100%; height: auto; }\n  .photo { background: #bae6fd; padding: 40px; text-align: center; }\n</style>\n<div class="photo">An image never wider than its parent</div>`,
        explain: ['max-width: 100% lets a picture shrink to fit a small screen but not grow beyond its real size.', 'height: auto keeps the proportions.'] },
      { h: 'Media queries', p: [
        'A media query applies rules only when a condition is true, such as the screen being at least 600px wide. Write @media (min-width: 600px) { ... } and put the rules inside the brackets. Resize the browser or rotate your phone and the layout changes.',
        'The mobile-first method writes the small-screen style first and then adds min-width queries for bigger screens. It keeps the phone version simple and fast.'],
        code: `<style>\n  .row div { background: #bbf7d0; padding: 14px; margin-bottom: 8px; }\n  @media (min-width: 600px) {\n    .row { display: flex; gap: 8px; }\n    .row div { flex: 1; margin-bottom: 0; }\n  }\n</style>\n<div class="row"><div>Box one</div><div>Box two</div></div>`,
        explain: ['On a narrow screen the boxes stack in normal flow.', 'At 600px or wider the media query turns the row into a flex container and the boxes share the width. The preview below is narrow, so you will see the stacked version; try a wider window to see the other.'] },
      { h: 'Common breakpoints and other queries', p: [
        'Typical breakpoints are 600px (large phone or small tablet), 900px (tablet) and 1200px (desktop). Choose breakpoints where your design breaks, not by device names. Media queries can also check orientation, prefers-color-scheme: dark (the user’s dark mode) and prefers-reduced-motion.'],
        code: `<style>\n  body { background: white; color: #0f172a; }\n  @media (prefers-color-scheme: dark) {\n    body { background: #0f172a; color: #e2e8f0; }\n  }\n  h1 { font-size: 1.6rem; }\n  @media (min-width: 900px) { h1 { font-size: 2.4rem; } }\n</style>\n<h1>Adaptive page</h1>\n<p>Follows the device’s dark mode and grows the title on big screens.</p>`,
        explain: ['If the device uses dark mode, the first query swaps the colours automatically.', 'The title is bigger only when the screen is 900px or wider.'] },
    ], {
      mistakes: ['Forgetting the viewport meta tag, so the page looks tiny on phones.', 'Using fixed pixel widths larger than the phone screen, which causes sideways scrolling.', 'Writing max-width queries everywhere and ending up with a tangle; go mobile-first.', 'Putting the media query before the normal rule it should override: later rules win.'],
      exercises: [
        { q: 'Make a heading 20px on phones and 32px from 700px width.', a: '<style>\n  h1 { font-size: 20px; }\n  @media (min-width: 700px) { h1 { font-size: 32px; } }\n</style>\n<h1>Responsive heading</h1>' },
        { q: 'Hide a sidebar on small screens and show it from 800px.', a: '<style>\n  .side { display: none; background: #fde68a; padding: 10px; }\n  @media (min-width: 800px) { .side { display: block; } }\n</style>\n<div class="side">Sidebar (visible on wide screens)</div>\n<p>Main content</p>' },
        { q: 'Make images fit small screens.', a: '<style>\n  img { max-width: 100%; height: auto; }\n</style>\n<img src="https://placehold.co/800x300" alt="Wide picture">' },
      ],
      quiz: [
        { q: 'Which tag makes a page behave properly on phones?', options: ['<meta charset>', '<meta name="viewport" ...>', '<link rel="phone">', '<phone>'], answer: 1, why: 'The viewport meta tag sets the page width to the device width.' },
        { q: 'What is mobile-first?', options: ['Design for desktop first', 'Write phone styles first and add min-width queries', 'Only for phones', 'Use fixed widths'], answer: 1, why: 'Start with the simplest small-screen layout and enhance for larger screens.' },
        { q: '@media (min-width: 600px) applies when…', options: ['the screen is under 600px', 'the screen is 600px or wider', 'always', 'never'], answer: 1, why: 'min-width is a lower limit.' },
      ],
      challenge: {
        prompt: 'Add a media query for min-width: 600px that makes .row a flex container.',
        starter: '<style>\n  .row div { background: #bfdbfe; padding: 12px; margin-bottom: 6px; }\n  /* add your media query below */\n</style>\n<div class="row"><div>One</div><div>Two</div></div>\n',
        check: 're /@media\\s*\\(\\s*min-width\\s*:\\s*600px\\s*\\)/i => Add @media (min-width: 600px) { ... }\nre /@media[^{]*\\{[^]*\\.row\\s*\\{[^}]*display\\s*:\\s*flex/i => Inside the media query, make .row display: flex;',
        hint: '@media (min-width: 600px) { .row { display: flex; gap: 8px; } }',
        solution: '<style>\n  .row div { background: #bfdbfe; padding: 12px; margin-bottom: 6px; }\n  @media (min-width: 600px) {\n    .row { display: flex; gap: 8px; }\n  }\n</style>\n<div class="row"><div>One</div><div>Two</div></div>\n',
      },
    }),

  C('effects', 'Hover, transitions and animation', 'Mabadiliko laini: :hover, transition, transform na @keyframes.',
    'Make the button grow slightly and change colour smoothly on hover.',
    [
      { h: 'Hover and focus states', p: [
        'The :hover pseudo-class styles an element while the pointer is over it, and :active while it is pressed. :focus styles a field or button that the keyboard has selected: never remove the focus outline without giving a replacement, because keyboard users need it. On a touch phone there is no hover, so the page must still work without it.'],
        code: `<style>\n  .btn { background: #2563eb; color: white; border: 0; padding: 12px 20px; border-radius: 10px; font-size: 16px; }\n  .btn:hover { background: #1d4ed8; }\n  .btn:active { background: #1e3a8a; }\n  input:focus { outline: 3px solid #f59e0b; }\n</style>\n<button class="btn">Hover or press me</button>\n<p><input placeholder="Tap to focus"></p>`,
        explain: ['The button gets darker on hover and darker still while pressed.', 'The input gets an orange outline when it is selected.'] },
      { h: 'Transitions make changes smooth', p: [
        'Without a transition a hover change is instant. transition: property duration timing tells the browser to animate between the old and the new value. For example transition: background 0.3s ease. Put the transition on the normal state, not on :hover, so it also animates back.'],
        code: `<style>\n  .card { width: 160px; padding: 20px; background: #dbeafe; border-radius: 12px; transition: transform 0.25s ease, box-shadow 0.25s ease; }\n  .card:hover { transform: translateY(-6px); box-shadow: 0 10px 20px rgba(0,0,0,0.25); }\n</style>\n<div class="card">Hover: I lift up</div>`,
        explain: ['On hover the card moves 6px up and gets a shadow.', 'Because the transition is on .card, the change glides over a quarter of a second both ways.'] },
      { h: 'Transform and shadow', p: [
        'transform moves, scales or rotates a box without disturbing the layout: translate(x, y), scale(1.1), rotate(10deg). box-shadow adds a shadow: offset-x offset-y blur colour. Use soft shadows to make cards look raised.'],
        code: `<style>\n  .tile { display: inline-block; margin: 14px; padding: 18px; background: #fef3c7; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }\n  .r { transform: rotate(-6deg); }\n  .s { transform: scale(1.2); }\n</style>\n<div class="tile">Normal</div><div class="tile r">Rotated</div><div class="tile s">Scaled</div>`,
        explain: ['rotate(-6deg) tilts the box anticlockwise, scale(1.2) makes it 20% bigger.', 'Neighbouring boxes do not move: transforms do not change the layout.'] },
      { h: 'Keyframe animations', p: [
        'For effects that run on their own, define the steps with @keyframes and apply them with the animation property: name, duration, timing, repeat. Keep animations small and calm; offer a way to turn them off for people who are sensitive to motion.'],
        code: `<style>\n  @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }\n  .dot { width: 60px; height: 60px; border-radius: 50%; background: #16a34a; animation: pulse 1.5s ease-in-out infinite; margin: 20px; }\n  @media (prefers-reduced-motion: reduce) { .dot { animation: none; } }\n</style>\n<div class="dot"></div>`,
        explain: ['pulse grows the circle to 115% at the half-way point and shrinks it back, forever (infinite).', 'The last rule switches the animation off for users who asked their device for less motion.'] },
    ], {
      mistakes: ['Putting transition only on :hover, so the change animates in but jumps back.', 'Animating width or height (slow); prefer transform and opacity.', 'Relying on hover for important information, which phones cannot show.', 'Removing outline: none from inputs without any replacement.'],
      exercises: [
        { q: 'Make a link turn orange on hover with a smooth 0.2s change.', a: '<style>\n  a { color: #2563eb; transition: color 0.2s; }\n  a:hover { color: #ea580c; }\n</style>\n<a href="#">Hover me</a>' },
        { q: 'Make a card scale to 105% on hover.', a: '<style>\n  .card { width: 150px; padding: 18px; background: #e9d5ff; border-radius: 10px; transition: transform 0.2s; }\n  .card:hover { transform: scale(1.05); }\n</style>\n<div class="card">Zoom</div>' },
        { q: 'Spin a square forever.', a: '<style>\n  @keyframes spin { to { transform: rotate(360deg); } }\n  .sq { width: 50px; height: 50px; background: #db2777; margin: 20px; animation: spin 2s linear infinite; }\n</style>\n<div class="sq"></div>' },
      ],
      quiz: [
        { q: 'Where should a transition be written?', options: ['Only on :hover', 'On the normal state of the element', 'In the HTML', 'On the body only'], answer: 1, why: 'Then the change animates both in and out.' },
        { q: 'Which property is cheapest and smoothest to animate?', options: ['width', 'margin', 'transform', 'font-family'], answer: 2, why: 'transform and opacity do not force the page layout to be recalculated.' },
        { q: 'What does animation: spin 2s linear infinite do?', options: ['Runs spin once', 'Runs the spin keyframes over 2s forever', 'Stops animations', 'Spins the page once'], answer: 1, why: 'It names the keyframes, the duration, the timing and the repeat count.' },
      ],
      challenge: {
        prompt: 'Add a transition of 0.3s on .btn background, and make .btn:hover turn green (#16a34a or green).',
        starter: '<style>\n  .btn { background: #2563eb; color: white; border: 0; padding: 12px 22px; border-radius: 10px; font-size: 16px; }\n  /* add transition and hover */\n</style>\n<button class="btn">Save</button>\n',
        check: 're /\\.btn\\s*\\{[^}]*transition\\s*:[^;}]*0?\\.3s/i => Add transition: background 0.3s; to .btn\nre /\\.btn:hover\\s*\\{[^}]*background(-color)?\\s*:\\s*(#16a34a|green|#22c55e|#15803d|#10b981|#059669)/i => Add .btn:hover { background: #16a34a; }',
        hint: '.btn { transition: background 0.3s; }  .btn:hover { background: #16a34a; }',
        solution: '<style>\n  .btn { background: #2563eb; color: white; border: 0; padding: 12px 22px; border-radius: 10px; font-size: 16px; transition: background 0.3s; }\n  .btn:hover { background: #16a34a; }\n</style>\n<button class="btn">Save</button>\n',
      },
    }),

  C('project', 'Project: a profile card page', 'Unganisha ulichojifunza: kadi ya wasifu inayofaa simu, yenye hover na gridi ya ujuzi.',
    'Build a profile card with a name, a short bio and three skill tags, centred and styled.',
    [
      { h: 'Plan the page', p: [
        'In this project you combine everything from the course: a centred card (box model and margin auto), a header with colours (colours and text), skill tags in a row that wraps (flexbox) and a hover effect (transitions). Start with the HTML structure, then style one part at a time.',
        'Work in small steps and refresh after each. If something looks wrong, comment out the last rule and check again.'] },
      { h: 'Step 1: the HTML and the card', p: ['First the structure and the card box. Notice that the width is fluid, with a maximum.'],
        code: `<style>\n  * { box-sizing: border-box; }\n  body { font-family: system-ui, sans-serif; background: #e2e8f0; margin: 0; padding: 20px; }\n  .card { max-width: 340px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); text-align: center; }\n</style>\n<div class="card">\n  <h1>Mussa</h1>\n  <p>Mathematics and Statistics student</p>\n</div>`,
        explain: ['The card is at most 340px wide and centred with margin: 0 auto. On a smaller phone it shrinks to fit.', 'box-shadow lifts it off the grey page background.'] },
      { h: 'Step 2: avatar, text and skills', p: ['Now add a round avatar made with CSS, nicer text and the skill tags with flexbox.'],
        code: `<style>\n  * { box-sizing: border-box; }\n  body { font-family: system-ui, sans-serif; background: #e2e8f0; margin: 0; padding: 20px; }\n  .card { max-width: 340px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); text-align: center; }\n  .avatar { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 12px; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-size: 32px; display: flex; align-items: center; justify-content: center; }\n  h1 { margin: 0 0 4px; font-size: 1.5rem; color: #0f172a; }\n  p { margin: 0 0 16px; color: #475569; line-height: 1.6; }\n  .tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }\n  .tags span { background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-size: 14px; }\n</style>\n<div class="card">\n  <div class="avatar">M</div>\n  <h1>Mussa</h1>\n  <p>Mathematics and Statistics student who loves Python.</p>\n  <div class="tags"><span>Python</span><span>Statistics</span><span>AI</span></div>\n</div>`,
        explain: ['The avatar is a gradient circle with a letter centred by flexbox.', 'The tags wrap onto a second line on a very small screen.'] },
      { h: 'Step 3: polish with a hover and a media query', p: ['Finally a smooth hover lift on the card and bigger text on wide screens.'],
        code: `<style>\n  * { box-sizing: border-box; }\n  body { font-family: system-ui, sans-serif; background: #e2e8f0; margin: 0; padding: 20px; }\n  .card { max-width: 340px; margin: 0 auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.15); text-align: center; transition: transform 0.25s, box-shadow 0.25s; }\n  .card:hover { transform: translateY(-6px); box-shadow: 0 14px 30px rgba(0,0,0,0.25); }\n  h1 { margin: 0 0 4px; color: #0f172a; font-size: 1.5rem; }\n  @media (min-width: 700px) { h1 { font-size: 2rem; } .card { max-width: 420px; } }\n  p { color: #475569; }\n</style>\n<div class="card"><h1>Mussa</h1><p>Hover me on a computer.</p></div>`,
        explain: ['The transition is on .card, the lift is on .card:hover.', 'The media query enlarges the title and card from 700px wide upwards.'] },
    ], {
      mistakes: ['Writing all the CSS at once and not knowing which rule broke the page.', 'Forgetting box-sizing: border-box so the card overflows by its padding.', 'Fixed widths that do not fit a phone.', 'Poor contrast between text and background.'],
      exercises: [
        { q: 'Add a fourth skill tag to the card and a coloured top border to the card.', a: '<style>\n  .card { max-width: 300px; margin: 20px auto; padding: 20px; background: white; border-top: 6px solid #7c3aed; box-shadow: 0 4px 14px rgba(0,0,0,0.2); text-align: center; }\n  .tags { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }\n  .tags span { background: #ede9fe; padding: 4px 10px; border-radius: 16px; }\n</style>\n<div class="card"><h2>Asha</h2><div class="tags"><span>R</span><span>Python</span><span>SQL</span><span>Excel</span></div></div>' },
        { q: 'Make three cards sit in a row on wide screens and stack on phones.', a: '<style>\n  .cards { display: grid; gap: 10px; }\n  .cards div { background: #bbf7d0; padding: 16px; border-radius: 10px; }\n  @media (min-width: 600px) { .cards { grid-template-columns: repeat(3, 1fr); } }\n</style>\n<div class="cards"><div>One</div><div>Two</div><div>Three</div></div>' },
      ],
      quiz: [
        { q: 'Which lesson idea centres the card horizontally?', options: ['margin: 0 auto with a max-width', 'position: fixed', 'float', 'overflow: scroll'], answer: 0, why: 'A fixed max-width and auto side margins centre a block.' },
        { q: 'Which layout tool makes tags wrap onto new lines?', options: ['flex-wrap: wrap', 'display: none', 'z-index', 'overflow: hidden'], answer: 0, why: 'flex-wrap lets flex items continue on the next line.' },
        { q: 'Where do you put the transition for a smooth hover?', options: ['On the :hover rule only', 'On the normal element rule', 'In the media query only', 'Nowhere'], answer: 1, why: 'On the normal rule so it animates both ways.' },
      ],
      challenge: {
        prompt: 'Build a profile card: a div.card with an h1 (your name), a p (short bio) and a div.tags containing at least three span tags. Style .card with a max-width, margin: 0 auto, padding and border-radius, and make .tags display: flex with a gap.',
        starter: '<style>\n  /* style your card */\n</style>\n<!-- build your card here -->\n',
        check: 'div.card h1 => Add an <h1> with your name inside div.card.\ndiv.card p => Add a <p> bio inside div.card.\ndiv.card .tags span >= 3 => Add at least three <span> tags inside div.tags.\nre /\\.card\\s*\\{[^}]*max-width/i => Give .card a max-width.\nre /\\.card\\s*\\{[^}]*margin\\s*:\\s*[^;}]*auto/i => Centre .card with margin: 0 auto;\nre /\\.card\\s*\\{[^}]*padding/i => Give .card some padding.\nre /\\.card\\s*\\{[^}]*border-radius/i => Round the corners of .card.\nre /\\.tags\\s*\\{[^}]*display\\s*:\\s*flex/i => Make .tags display: flex;\nre /\\.tags\\s*\\{[^}]*gap/i => Add a gap to .tags.',
        hint: '<div class="card"><h1>Name</h1><p>Bio</p><div class="tags"><span>A</span><span>B</span><span>C</span></div></div>',
        solution: '<style>\n  .card { max-width: 320px; margin: 0 auto; padding: 20px; border-radius: 14px; background: #f1f5f9; text-align: center; }\n  .tags { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }\n  .tags span { background: #bfdbfe; padding: 4px 10px; border-radius: 12px; }\n</style>\n<div class="card">\n  <h1>Mussa</h1>\n  <p>Mathematics and Statistics student.</p>\n  <div class="tags"><span>Python</span><span>Statistics</span><span>AI</span></div>\n</div>\n',
      },
    }),
];
