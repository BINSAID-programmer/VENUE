import type { LearnLesson } from './learnLessons';
import { H } from './learnHtmlA';

/** Chapters 4–7: lists, tables, forms, structure, and a final project. */
export const HTML_B: LearnLesson[] = [
  H('lists', 'Lists', 'Orodha: <ul> (vitone), <ol> (namba), <dl> (maelezo) na orodha ndani ya orodha.',
    'Make a nested list: three courses, and under one of them its topics.',
    [
      { h: 'Bulleted and numbered lists', p: [
        'An unordered list <ul> shows items with bullets, and is used when the order does not matter. An ordered list <ol> numbers the items, and is used for steps and rankings. Each item is an <li> (list item) inside the list. Only <li> elements should be direct children of <ul> or <ol>.'],
        code: `<h3>Courses this semester</h3>\n<ul>\n  <li>Calculus</li>\n  <li>Statistics</li>\n  <li>Programming</li>\n</ul>\n<h3>How to register</h3>\n<ol>\n  <li>Log in</li>\n  <li>Choose your courses</li>\n  <li>Pay the fees</li>\n</ol>`,
        explain: ['The first list uses bullets because the courses have no order.', 'The second is numbered, because the steps must be followed in order.', 'Every list item is wrapped in its own <li> element.'] },
      { h: 'Changing the numbering', p: [
        'The ol element has attributes to change the numbering: start="5" begins at 5, reversed counts down, and type="A" or type="a" or type="I" changes the style to letters or roman numerals. For bullets you use CSS (list-style-type).'],
        code: `<ol type="A">\n  <li>First option</li>\n  <li>Second option</li>\n</ol>\n<ol start="5">\n  <li>Starts at five</li>\n  <li>Then six</li>\n</ol>\n<ol reversed>\n  <li>Third</li>\n  <li>Second</li>\n  <li>First</li>\n</ol>`,
        explain: ['type="A" numbers the first list A, B.', 'start="5" begins the second list at 5.', 'reversed counts down, which suits a top-three ranking.'] },
      { h: 'Nested lists', p: [
        'A list can contain another list. The inner list must be placed inside an <li> of the outer list, not directly inside the <ul>. Indent the inner list so the structure is easy to read.'],
        code: `<ul>\n  <li>Mathematics\n    <ul>\n      <li>Calculus</li>\n      <li>Linear algebra</li>\n    </ul>\n  </li>\n  <li>Statistics</li>\n</ul>`,
        explain: ['The second ul sits inside the first li, so the topics belong to Mathematics.', 'The browser indents the inner list and uses a different bullet shape to show the level.'] },
      { h: 'Description lists', p: [
        'A description list <dl> holds terms and their definitions. Each term is a <dt> and each description is a <dd>. It is ideal for glossaries and for questions and answers.'],
        code: `<dl>\n  <dt>HTML</dt>\n  <dd>The language that gives a web page its structure.</dd>\n  <dt>CSS</dt>\n  <dd>The language that styles a web page.</dd>\n</dl>`,
        explain: ['dt is the term; dd is its description.', 'The browser indents the descriptions under the terms.', 'This is the right element for a glossary like the one at the end of a textbook.'] },
      { h: 'Lists as menus', p: [
        'Websites build navigation menus from lists, because a menu is a list of links. Put each link in an <li>, inside a <ul>, inside a <nav>. With CSS later you will turn the vertical list into a horizontal bar.'],
        code: `<nav>\n  <ul>\n    <li><a href="#home">Home</a></li>\n    <li><a href="#courses">Courses</a></li>\n    <li><a href="#contact">Contact</a></li>\n  </ul>\n</nav>`,
        explain: ['nav tells browsers that this block is a navigation menu.', 'Every menu item is a list item holding a link.'] },
    ],
    {
      mistakes: [
        'Putting text directly inside <ul> without <li>.',
        'Placing a nested list outside any <li>.',
        'Using a list only to indent text. Use CSS for indentation.',
        'Using <br> instead of list items to make a list.',
      ],
      exercises: [
        { q: 'Write an ordered list of the steps to make tea.', a: `<ol>\n  <li>Boil water</li>\n  <li>Add tea leaves</li>\n  <li>Wait three minutes</li>\n  <li>Pour and serve</li>\n</ol>` },
        { q: 'Write a glossary with two terms using a description list.', a: `<dl>\n  <dt>Mean</dt>\n  <dd>The sum divided by the count.</dd>\n  <dt>Median</dt>\n  <dd>The middle value.</dd>\n</dl>` },
      ],
      quiz: [
        { q: 'Which element makes a numbered list?', options: ['<ul>', '<ol>', '<dl>', '<li>'], answer: 1, why: '<ol> is an ordered list.' },
        { q: 'Where must a nested list go?', options: ['Directly inside <ul>', 'Inside an <li>', 'Inside <head>', 'Outside the page'], answer: 1, why: 'A nested list belongs inside a list item.' },
        { q: 'Which elements make a glossary?', options: ['ul and li', 'ol and li', 'dl, dt and dd', 'table and tr'], answer: 2, why: 'A description list holds terms (dt) and descriptions (dd).' },
      ],
      challenge: {
        prompt: 'Build a nested list: a <ul> with at least three <li> items, where one item contains its own <ul> with at least two items.',
        starter: '<ul>\n  <!-- your items here -->\n</ul>\n',
        check: 'ul > li >= 3 => The outer list needs at least three <li> items.\nli ul => Put a second <ul> inside one of the <li> items.\nli ul li >= 2 => The inner list needs at least two items.',
        hint: '<li>Mathematics<ul><li>Calculus</li><li>Algebra</li></ul></li>',
        solution: '<ul>\n  <li>Mathematics\n    <ul>\n      <li>Calculus</li>\n      <li>Algebra</li>\n    </ul>\n  </li>\n  <li>Statistics</li>\n  <li>Computer science</li>\n</ul>',
      },
    }),

  H('tables', 'Tables', 'Jedwali: <table>, <tr>, <th>, <td>, <thead>, <tbody>, colspan na rowspan.',
    'Make a table of 3 students with name, course and mark, with a header row.',
    [
      { h: 'The basic table', p: [
        'A table organises data in rows and columns. The <table> element holds everything. Each row is a <tr> (table row). Inside a row, a header cell is <th> (bold and centred by default) and a data cell is <td>. Tables are for data, never for page layout.',
        'The border attribute is old; use CSS for borders. In these examples a small style is added so that you can see the cell edges.'],
        code: `<table border="1" cellpadding="6" style="border-collapse:collapse">\n  <tr>\n    <th>Student</th>\n    <th>Course</th>\n    <th>Mark</th>\n  </tr>\n  <tr>\n    <td>Asha</td>\n    <td>Statistics</td>\n    <td>78</td>\n  </tr>\n  <tr>\n    <td>Juma</td>\n    <td>Calculus</td>\n    <td>64</td>\n  </tr>\n</table>`,
        explain: ['The first tr holds header cells (th), so the column names are bold.', 'Each following tr is one student, with one td per column.', 'Every row must have the same number of cells, otherwise the table looks broken.'] },
      { h: 'Table structure: caption, head, body and foot', p: [
        'Real tables are divided into parts: <caption> gives the table a title, <thead> holds the header row, <tbody> holds the main rows and <tfoot> holds totals. This structure helps screen readers, and lets CSS style each part. The scope="col" attribute on a th tells assistive technology that the header is for a column.'],
        code: `<table border="1" cellpadding="6" style="border-collapse:collapse">\n  <caption>Marks, Statistics 1</caption>\n  <thead>\n    <tr><th scope="col">Name</th><th scope="col">Mark</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Asha</td><td>78</td></tr>\n    <tr><td>Juma</td><td>64</td></tr>\n  </tbody>\n  <tfoot>\n    <tr><td>Average</td><td>71</td></tr>\n  </tfoot>\n</table>`,
        explain: ['The caption is shown above the table and names it.', 'thead, tbody and tfoot group the rows by their role.', 'The average (78 + 64) / 2 = 71 is placed in the footer.'] },
      { h: 'Joining cells: colspan and rowspan', p: [
        'colspan makes a cell stretch across several columns, and rowspan across several rows. When a cell spans, you write fewer cells in that row (or in the rows below). Timetables use both.'],
        code: `<table border="1" cellpadding="6" style="border-collapse:collapse;text-align:center">\n  <tr><th>Time</th><th colspan="2">Monday</th></tr>\n  <tr><td>8:00</td><td>Maths</td><td>Stats</td></tr>\n  <tr><td rowspan="2">10:00</td><td>Lab</td><td>Lab</td></tr>\n  <tr><td colspan="2">Free</td></tr>\n</table>`,
        explain: ['The Monday header has colspan="2", so it covers the two columns below.', 'The 10:00 cell has rowspan="2", so it covers two rows; the next row therefore starts with a different cell.', 'The last row has one cell that spans both columns.'] },
      { h: 'Tables on small screens', p: [
        'Wide tables do not fit on a phone. A simple solution is to put the table in a div that scrolls sideways. You will do this with CSS (overflow-x: auto) in the next track. Keep tables simple: few columns, short text.',
        'For accessibility: always use th for headers, add a caption, and never use tables for layout.'],
        code: `<div style="overflow-x:auto">\n  <table border="1" cellpadding="6" style="border-collapse:collapse;min-width:420px">\n    <tr><th>Course</th><th>Code</th><th>Credits</th><th>Lecturer</th></tr>\n    <tr><td>Statistics 1</td><td>MS 101</td><td>12</td><td>Dr. Mwanga</td></tr>\n  </table>\n</div>`,
        explain: ['The table is wider than the preview, so the surrounding div lets you scroll sideways instead of breaking the page.', 'This pattern works well on phones.'] },
    ],
    {
      mistakes: [
        'Rows with different numbers of cells.',
        'Using td for headers instead of th.',
        'Using tables to place things on the page. Use CSS layout.',
        'Forgetting that colspan and rowspan change how many cells the other rows need.',
      ],
      exercises: [
        { q: 'Make a table of three courses and their credits, with a header row.', a: `<table border="1" cellpadding="6">\n  <tr><th>Course</th><th>Credits</th></tr>\n  <tr><td>Calculus</td><td>12</td></tr>\n  <tr><td>Statistics</td><td>12</td></tr>\n  <tr><td>Programming</td><td>9</td></tr>\n</table>` },
      ],
      quiz: [
        { q: 'Which element is a header cell?', options: ['<td>', '<th>', '<tr>', '<thead>'], answer: 1, why: '<th> is a header cell; <td> is a data cell.' },
        { q: 'What does colspan="2" do?', options: ['Makes two tables', 'Makes a cell cover two columns', 'Adds two rows', 'Colours the cell'], answer: 1, why: 'The cell stretches across two columns.' },
        { q: 'Tables should be used for…', options: ['Page layout', 'Tabular data', 'Menus only', 'Pictures'], answer: 1, why: 'Use tables for data; use CSS for layout.' },
      ],
      challenge: {
        prompt: 'Create a table with a <caption>, a header row with at least 3 <th>, and at least 2 data rows.',
        starter: '<table border="1" cellpadding="6">\n  <!-- your table -->\n</table>\n',
        check: 'table caption => Add a <caption> to the table.\ntr th >= 3 => The header row needs at least three <th> cells.\ntr td >= 6 => Add at least two data rows with three <td> cells each.',
        hint: '<caption>Marks</caption><tr><th>Name</th><th>Course</th><th>Mark</th></tr> then <tr><td>..</td><td>..</td><td>..</td></tr> twice.',
        solution: '<table border="1" cellpadding="6">\n  <caption>Marks</caption>\n  <tr><th>Name</th><th>Course</th><th>Mark</th></tr>\n  <tr><td>Asha</td><td>Stats</td><td>78</td></tr>\n  <tr><td>Juma</td><td>Calculus</td><td>64</td></tr>\n</table>',
      },
    }),

  H('forms1', 'Forms: collecting input', 'Form ni njia ya kukusanya taarifa: input types, label, button na jinsi data inavyotumwa.',
    'Make a registration form with name, email and password fields, each with a label.',
    [
      { h: 'What is a form?', p: [
        'A form lets visitors send information: sign-up, login, search, feedback, payment. The <form> element wraps the controls. Its action attribute is the address that receives the data, and method says how: get puts the data in the address (good for search), post sends it hidden in the request (use it for passwords and private data).',
        'The form itself only collects and sends. A server (a program that runs on a computer on the internet) must receive the data and do something with it. In this course the preview does not send anything, so you can safely practise.'] },
      { h: 'Text boxes and labels', p: [
        'The <input> element is the most common control. Its type attribute decides what it is: text, email, password, number, date, tel, url, search, and more. A phone shows the right keyboard for each type, for example the number pad for tel.',
        'Every control needs a <label>. Connect them with for="id" on the label and id="id" on the input. Then clicking the label focuses the field, and screen readers read the label. Never use placeholder as a replacement for a label; it disappears when you type.'],
        code: `<form>\n  <p><label for="n">Full name</label><br>\n     <input type="text" id="n" name="fullname" placeholder="Asha Juma"></p>\n  <p><label for="e">Email</label><br>\n     <input type="email" id="e" name="email"></p>\n  <p><label for="p">Password</label><br>\n     <input type="password" id="p" name="password"></p>\n  <p><button type="submit">Create account</button></p>\n</form>`,
        explain: ['Each label points to its input through for and id, so clicking the label places the cursor in the box.', 'The name attribute is the key under which the value is sent to the server. Without a name, nothing is sent.', 'type="email" checks the format when submitting, and type="password" hides the typed characters.', 'The button with type="submit" sends the form.'] },
      { h: 'More input types', p: [
        'Number inputs accept numbers (use min, max and step). Date inputs show a calendar. Range shows a slider. Color shows a colour picker. Search is a search box. Checking happens in the browser, but never trust it alone: a server must check the data again.'],
        code: `<form>\n  <p><label>Age <input type="number" name="age" min="16" max="60" value="20"></label></p>\n  <p><label>Date of birth <input type="date" name="dob"></label></p>\n  <p><label>Mark <input type="range" name="mark" min="0" max="100" value="60"></label></p>\n  <p><label>Favourite colour <input type="color" name="c" value="#2563eb"></label></p>\n  <p><label>Phone <input type="tel" name="tel" placeholder="0762 000 000"></label></p>\n</form>`,
        explain: ['Wrapping the input inside the label is another way to connect them and needs no id.', 'min, max and value set the allowed range and the starting value.', 'On a phone, type="tel" opens the number pad and type="date" shows a date picker.'] },
      { h: 'Buttons', p: [
        'The <button> element makes a button. type="submit" sends the form, type="reset" clears it and type="button" does nothing by itself (JavaScript gives it a job). If you forget the type inside a form, the button submits. You can put text, an icon or an image inside <button>, which is more flexible than <input type="submit">.'],
        code: `<form>\n  <p><label>Name <input name="who" value="Asha"></label></p>\n  <button type="submit">Send</button>\n  <button type="reset">Clear</button>\n  <button type="button" onclick="document.getElementById('msg').textContent='Hello!'">Say hello</button>\n</form>\n<p id="msg"></p>`,
        explain: ['Send submits (nothing is sent in the preview).', 'Clear resets the field to its original value Asha.', 'The third button uses a little JavaScript: onclick runs code when clicked, here writing Hello! into the paragraph below. You will learn it in the JavaScript track.'] },
    ],
    {
      mistakes: [
        'Missing name attributes, so nothing is sent.',
        'Using placeholder instead of a label.',
        'Using GET for passwords.',
        'Using id twice or a label that does not match an id.',
        'Trusting only the browser to validate. Servers must validate too.',
      ],
      exercises: [
        { q: 'Make a login form with email, password and a button.', a: `<form>\n  <p><label for="e">Email</label><br><input type="email" id="e" name="email" required></p>\n  <p><label for="p">Password</label><br><input type="password" id="p" name="password" required></p>\n  <button type="submit">Log in</button>\n</form>` },
      ],
      quiz: [
        { q: 'Which attribute decides which keyboard a phone shows?', options: ['name', 'type', 'id', 'value'], answer: 1, why: 'The type attribute (tel, email, number...) selects the control and keyboard.' },
        { q: 'Why is name important on an input?', options: ['It styles the input', 'It is the key used when the data is sent', 'It connects the label', 'It hides the input'], answer: 1, why: 'Data is sent as name=value pairs; no name means nothing is sent.' },
        { q: 'Which method should a login form use?', options: ['get', 'post', 'put', 'none'], answer: 1, why: 'post keeps the data out of the address bar.' },
      ],
      challenge: {
        prompt: 'Make a form with a text input for name, an email input and a password input. Each input needs a label connected with for/id (or wrapped in the label) and a name. Add a submit button.',
        starter: '<form>\n  <!-- your form controls here -->\n</form>\n',
        check: 'form input[type="text"][name] => Add a text input with a name attribute.\nform input[type="email"][name] => Add an email input with a name attribute.\nform input[type="password"][name] => Add a password input with a name attribute.\nform label >= 3 => Every input needs a <label> (at least three labels).\nform button[type="submit"], form input[type="submit"] => Add a submit button.',
        hint: '<label for="n">Name</label> <input type="text" id="n" name="name"> ... <button type="submit">Send</button>',
        solution: '<form>\n  <p><label for="n">Name</label><br><input type="text" id="n" name="name"></p>\n  <p><label for="e">Email</label><br><input type="email" id="e" name="email"></p>\n  <p><label for="p">Password</label><br><input type="password" id="p" name="password"></p>\n  <button type="submit">Register</button>\n</form>',
      },
    }),

  H('forms2', 'Forms: choices, validation and structure', 'Radio, checkbox, select, textarea, fieldset na uthibitishaji (required, pattern, min, max).',
    'Make a feedback form with a rating (radio buttons), a topic (select) and a comment (textarea).',
    [
      { h: 'Radio buttons and checkboxes', p: [
        'Radio buttons let the visitor choose exactly one option from a group. Give all buttons in a group the same name; the value is what gets sent. Checkboxes let the visitor pick several options, or tick one yes/no option. Use the checked attribute to tick something by default.'],
        code: `<form>\n  <p>Year of study:</p>\n  <label><input type="radio" name="year" value="1" checked> First</label>\n  <label><input type="radio" name="year" value="2"> Second</label>\n  <label><input type="radio" name="year" value="3"> Third</label>\n  <p>Interests:</p>\n  <label><input type="checkbox" name="int" value="stats"> Statistics</label>\n  <label><input type="checkbox" name="int" value="code" checked> Coding</label>\n</form>`,
        explain: ['All three radios share name="year", so choosing one clears the others.', 'The checkboxes can be ticked independently; Coding starts ticked.', 'Each control is inside a label, so tapping the words also selects it, which helps on phones.'] },
      { h: 'Drop-down lists and text areas', p: [
        '<select> shows a drop-down list of <option> elements. The value attribute of the chosen option is sent. Use <optgroup> to group options. For longer text use <textarea>, with rows and cols (or CSS) for its size; its starting text goes between the tags.'],
        code: `<form>\n  <p><label>Topic<br>\n    <select name="topic">\n      <option value="">-- choose --</option>\n      <option value="app">The app</option>\n      <option value="notes">Study notes</option>\n      <option value="other">Other</option>\n    </select></label></p>\n  <p><label>Comment<br>\n    <textarea name="comment" rows="3" cols="30">Write here...</textarea></label></p>\n</form>`,
        explain: ['The first option has an empty value, a common way to make the visitor choose actively.', 'The textarea is three lines high, and its starting text is placed between the tags.'] },
      { h: 'Validation in the browser', p: [
        'Browsers can check a form before sending it. required makes a field compulsory. minlength and maxlength limit text length. min and max limit numbers and dates. pattern holds a regular expression, with a title that explains the rule. type="email" and type="url" check the format.',
        'This checking helps visitors correct mistakes immediately. Remember that it can be bypassed, so the server must repeat the checks.'],
        code: `<form onsubmit="event.preventDefault(); document.getElementById('ok').textContent='Valid! Form accepted.'">\n  <p><label>Reg. number<br>\n    <input name="reg" required pattern="[0-9]{4}-[0-9]{5}" title="Format: 2026-12345"></label></p>\n  <p><label>Age<br>\n    <input type="number" name="age" min="16" max="60" required></label></p>\n  <p><label>Password (8+ characters)<br>\n    <input type="password" name="pw" minlength="8" required></label></p>\n  <button type="submit">Check</button>\n</form>\n<p id="ok"></p>`,
        explain: ['Press Check with empty fields: the browser stops you and points to the first problem.', 'The pattern [0-9]{4}-[0-9]{5} accepts four digits, a hyphen and five digits, like 2026-12345.', 'When everything is valid, the small script writes the Valid message under the form instead of sending data.'] },
      { h: 'Grouping with fieldset and legend', p: [
        'A <fieldset> draws a box around related controls, and its <legend> names the group. This is important for radio and checkbox groups: a screen reader reads the legend before each option. Use <datalist> to offer suggestions in a text box, and <output> to show a result.'],
        code: `<form>\n  <fieldset>\n    <legend>Payment method</legend>\n    <label><input type="radio" name="pay" value="mobile" checked> Mobile money</label><br>\n    <label><input type="radio" name="pay" value="card"> Card</label>\n  </fieldset>\n  <p><label>Course <input list="courses" name="course"></label></p>\n  <datalist id="courses">\n    <option value="Statistics">\n    <option value="Calculus">\n    <option value="Programming">\n  </datalist>\n</form>`,
        explain: ['The fieldset boxes the payment choices and the legend names them.', 'The text box with list="courses" offers suggestions from the datalist while you type, but still accepts other text.'] },
    ],
    {
      mistakes: [
        'Giving radio buttons different names, so several can be chosen.',
        'Giving the options of a select no value, so the visible text is sent.',
        'Using required without telling the user what is expected (use a label and a title).',
        'Relying only on browser validation.',
        'Forgetting the legend for a group of radios.',
      ],
      exercises: [
        { q: 'Make a select for the semester (1 or 2) with a placeholder option.', a: `<label>Semester\n  <select name="sem" required>\n    <option value="">-- choose --</option>\n    <option value="1">Semester 1</option>\n    <option value="2">Semester 2</option>\n  </select>\n</label>` },
      ],
      quiz: [
        { q: 'How do you make several radio buttons a group?', options: ['The same id', 'The same name', 'The same value', 'The same class'], answer: 1, why: 'Radios with the same name form one group.' },
        { q: 'Which attribute makes a field compulsory?', options: ['must', 'needed', 'required', 'validate'], answer: 2, why: 'required blocks submission while the field is empty.' },
        { q: 'What does <legend> do?', options: ['Names a fieldset', 'Makes a legend of the table', 'Adds a link', 'Hides the form'], answer: 0, why: '<legend> is the title of a <fieldset>.' },
      ],
      challenge: {
        prompt: 'Build a feedback form with: at least two radio buttons with the same name, a <select> with at least 2 <option>, a <textarea>, and a required field.',
        starter: '<form>\n  <!-- your controls here -->\n</form>\n',
        check: 'input[type="radio"][name] >= 2 => Add at least two radio buttons that share a name.\nselect option >= 2 => Add a <select> with at least two <option> elements.\ntextarea => Add a <textarea>.\n[required] => Make at least one field required.',
        hint: '<input type="radio" name="rating" value="1"> ... <select><option>..</option><option>..</option></select> <textarea></textarea> <input required>',
        solution: '<form>\n  <label><input type="radio" name="rating" value="good" required> Good</label>\n  <label><input type="radio" name="rating" value="bad"> Bad</label>\n  <p><select name="topic"><option>App</option><option>Notes</option></select></p>\n  <p><textarea name="comment" rows="3"></textarea></p>\n  <button type="submit">Send</button>\n</form>',
      },
    }),

  H('semantic', 'Page structure: semantic elements, div and span', 'header, nav, main, section, article, aside, footer — kupanga ukurasa wenye maana.',
    'Structure a page with header, nav, main (with one article and one aside) and footer.',
    [
      { h: 'Why structure matters', p: [
        'You could build a whole page from <div> elements, which are anonymous boxes. But then the browser, a search engine and a screen reader cannot tell the menu from the article. Semantic elements have meaning in their names, and give every part of the page its role. This is better for accessibility, for search ranking, and for you when you read your own code later.'] },
      { h: 'The main page landmarks', p: [
        '<header> holds the introduction or the logo and title. <nav> holds the main navigation links. <main> holds the unique content of the page (only one per page). <section> is a thematic group of content with a heading. <article> is a self-contained piece that makes sense by itself, such as a news story or a blog post. <aside> holds related side content, such as a tip box or related links. <footer> holds copyright, contacts and small links.'],
        code: `<header>\n  <h1>VENUE News</h1>\n  <nav><a href="#a">Latest</a> | <a href="#b">Archive</a></nav>\n</header>\n<main>\n  <article>\n    <h2>Exams begin on Monday</h2>\n    <p>Check your timetable on the notice board.</p>\n  </article>\n  <aside>\n    <h3>Tip</h3>\n    <p>Revise a little every day.</p>\n  </aside>\n</main>\n<footer>&copy; 2026 VENUE</footer>`,
        explain: ['header holds the site title and the menu.', 'main contains the article, which could stand alone, and an aside with a related tip.', 'footer closes the page with the copyright line.', 'With CSS later you can arrange these blocks into columns; the HTML already tells every tool what each block is.'] },
      { h: 'div and span', p: [
        '<div> is a generic block container and <span> is a generic inline container. They have no meaning, so use them only when no semantic element fits, usually to give CSS something to style. A block element starts on a new line and uses the full width (div, p, h1, section). An inline element stays inside the line of text (span, a, strong, em, img).'],
        code: `<div style="background:#e0f2fe;padding:8px">\n  This is a <span style="color:crimson">red word</span> inside a block.\n</div>\n<div style="background:#dcfce7;padding:8px;margin-top:6px">A second block starts on a new line.</div>`,
        explain: ['The blue div is a block: it takes the full width.', 'The span only affects its own words and does not break the line.', 'The second div starts on a new line because it is also a block.'] },
      { h: 'Section versus article versus div', p: [
        'Ask: does it have a heading and form a theme? Use section. Could I copy it to another site and it still makes sense? Use article. Is it only a wrapper for styling? Use div.',
        'Each section and article should normally start with a heading (h2, h3...). Nesting is allowed: an article can contain sections.'],
        code: `<article>\n  <h2>Study tips</h2>\n  <section>\n    <h3>Before class</h3>\n    <p>Read the notes.</p>\n  </section>\n  <section>\n    <h3>After class</h3>\n    <p>Do the exercises.</p>\n  </section>\n</article>`,
        explain: ['The article is a self-contained piece of content.', 'Inside it two sections group the advice by theme, each with its own heading.'] },
    ],
    {
      mistakes: [
        'Using div for everything.',
        'Several <main> elements on one page.',
        'Using section as a styling box without a heading.',
        'Putting block elements inside inline elements, such as a div inside a span.',
      ],
      exercises: [
        { q: 'Put the elements header, nav, main, footer in the correct order for a simple page.', a: `<header>...</header>\n<nav>...</nav>\n<main>...</main>\n<footer>...</footer>` },
      ],
      quiz: [
        { q: 'Which element holds the unique main content?', options: ['<section>', '<main>', '<aside>', '<div>'], answer: 1, why: '<main> holds the primary content; one per page.' },
        { q: 'Which is an inline element?', options: ['<div>', '<p>', '<span>', '<h1>'], answer: 2, why: '<span> stays in the line; the others are block elements.' },
        { q: 'What is <article> for?', options: ['Styling', 'A self-contained piece of content', 'A table', 'A form'], answer: 1, why: 'An article makes sense on its own.' },
      ],
      challenge: {
        prompt: 'Structure a page with a <header> (with an h1), a <nav>, a <main> with one <article> and one <aside>, and a <footer>.',
        starter: '<!-- Write your page structure here -->\n',
        check: 'header h1 => Add a <header> that contains an <h1>.\nnav => Add a <nav>.\nmain article => Put an <article> inside <main>.\nmain aside => Put an <aside> inside <main>.\nfooter => Add a <footer>.',
        hint: '<header><h1>..</h1></header> <nav>..</nav> <main><article>..</article><aside>..</aside></main> <footer>..</footer>',
        solution: '<header><h1>My page</h1></header>\n<nav><a href="#">Home</a></nav>\n<main>\n  <article><h2>News</h2><p>Hello.</p></article>\n  <aside><p>Related links</p></aside>\n</main>\n<footer>&copy; 2026</footer>',
      },
    }),

  H('attrs', 'Attributes, ids and classes', 'Global attributes (id, class, title, style, lang, data-*), na jinsi ya kupanga majina.',
    'Give three elements the same class, and one element an id, then add a title attribute to a link.',
    [
      { h: 'Global attributes', p: [
        'Some attributes work on every element. id gives a unique name to one element (used for jump links, CSS and JavaScript). class gives a shared name to many elements, so one CSS rule can style them all. title adds a tooltip. lang says which language the text is in. hidden hides an element. style adds CSS directly. tabindex controls keyboard focus.',
        'The difference between id and class matters: an id appears once in a page, a class can appear many times, and an element can have several classes separated by spaces.'],
        code: `<p id="intro" class="note big">First paragraph (id intro, classes note and big).</p>\n<p class="note">Second paragraph (class note).</p>\n<p lang="sw">Karibu VENUE (this text is declared as Swahili).</p>\n<p title="This text has a tooltip">Hover or long-press me.</p>\n<p hidden>You cannot see me.</p>`,
        explain: ['The first paragraph has one id and two classes, written with a space between them.', 'lang="sw" tells tools that this paragraph is in Swahili, which improves speech and translation.', 'The hidden paragraph is not displayed at all.'] },
      { h: 'Inline style versus classes', p: [
        'The style attribute applies CSS to a single element: style="color: red". It is handy for tests but hard to maintain. In real pages you write CSS rules in a style sheet, and use classes to connect them. The CSS track shows how.'],
        code: `<style>\n  .alert { background: #fee2e2; color: #991b1b; padding: 8px; border-radius: 8px; }\n  #special { font-weight: bold; }\n</style>\n<p class="alert">An alert box.</p>\n<p class="alert" id="special">Another alert, in bold.</p>\n<p style="color: teal">One-off inline style.</p>`,
        explain: ['The style block defines the rule .alert once, and both paragraphs use it.', '#special targets only the element with that id.', 'The inline style affects only the last paragraph.'] },
      { h: 'data-* attributes', p: [
        'Your own information can be stored in attributes whose names start with data-. They are invisible, and JavaScript can read them. For example <li data-code="MS101">Statistics</li>. They are useful for connecting HTML with scripts.'],
        code: `<ul>\n  <li data-code="MS101" data-credits="12">Statistics</li>\n  <li data-code="MS102" data-credits="12">Calculus</li>\n</ul>\n<script>\n  document.querySelectorAll('li').forEach(li => {\n    li.title = li.dataset.code + ' (' + li.dataset.credits + ' credits)';\n  });\n</script>\n<p>Hover each course to see its code.</p>`,
        explain: ['Each li stores its code and credits in data attributes.', 'The script reads them through dataset and sets a tooltip. You will learn this in the JavaScript track.'] },
      { h: 'Naming rules', p: [
        'Choose names that describe the purpose, not the look: class="warning" is better than class="red". Use lowercase letters, digits and hyphens: course-list. Names are case-sensitive. An id must start with a letter and contain no spaces.'],
        code: `<p class="course-title">Good name: describes purpose</p>\n<p class="red-bold-text">Poor name: if you later change the colour, the name lies</p>`,
        explain: ['A purpose-based name remains true when the design changes.', 'Hyphens make multi-word names easy to read.'] },
    ],
    {
      mistakes: [
        'Using the same id twice.',
        'Putting spaces in an id.',
        'Naming classes by colour or position instead of purpose.',
        'Overusing the style attribute.',
      ],
      exercises: [
        { q: 'Give two paragraphs the class tip and one of them also the id first.', a: `<p class="tip" id="first">One</p>\n<p class="tip">Two</p>` },
      ],
      quiz: [
        { q: 'How many elements can share one class?', options: ['One', 'Two', 'As many as you like', 'None'], answer: 2, why: 'Classes are for groups; ids are unique.' },
        { q: 'Which attribute gives a tooltip?', options: ['tip', 'title', 'hint', 'info'], answer: 1, why: 'The title attribute shows a tooltip.' },
        { q: 'Which attribute name is valid for your own data?', options: ['custom-code', 'data-code', 'my:code', '_code'], answer: 1, why: 'Custom data attributes start with data-.' },
      ],
      challenge: {
        prompt: 'Add at least three elements with class="card", exactly one element with id="main-title", and a link with a title attribute.',
        starter: '<h1>Heading</h1>\n<!-- your elements -->\n',
        check: '.card >= 3 => Give at least three elements the class card.\n#main-title => Add an element with id="main-title".\na[title] => Add a link <a> with a title attribute.',
        hint: '<h1 id="main-title">..</h1> <div class="card">..</div> x3 <a href="#" title="...">..</a>',
        solution: '<h1 id="main-title">Courses</h1>\n<div class="card">Statistics</div>\n<div class="card">Calculus</div>\n<div class="card">Programming</div>\n<a href="#" title="Go to the top">Top</a>',
      },
    }),

  H('seo', 'Meta tags, accessibility and good practice', 'Meta tags, title, viewport, alt text, mpangilio wa vichwa, rangi na kuthibitisha msimbo wako.',
    'Add a meta description and a viewport meta tag to a page, and fix the heading order.',
    [
      { h: 'Meta tags in the head', p: [
        'Information about your page, not shown inside it, goes in the <head>. <meta charset="UTF-8"> sets the character encoding. <meta name="viewport" content="width=device-width, initial-scale=1"> makes the page fit phone screens: without it, phones draw a tiny zoomed-out desktop page. <meta name="description" content="..."> is the short text search engines often show under your title. <title> should be unique and descriptive, about 50 to 60 characters.',
        'Open Graph tags such as og:title and og:image control how your page looks when its link is shared on WhatsApp or Facebook.'],
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="Free study notes for UDSM students.">\n  <meta property="og:title" content="VENUE: study notes">\n  <title>VENUE - Free study notes</title>\n</head>\n<body>\n  <h1>Study notes</h1>\n  <p>The meta tags above are in the head and are not shown here.</p>\n</body>\n</html>`,
        explain: ['The viewport tag is essential for mobile-friendly pages.', 'The description is what a search result may show under the title.', 'og:title controls the title shown in link previews.', 'Only the h1 and the paragraph are visible; everything in the head works behind the scenes.'] },
      { h: 'Accessibility basics', p: [
        'Accessibility means that everyone can use your page, including people who are blind, deaf, have limited movement, or use a slow phone. Most of it is simply good HTML. Use real headings in order. Give every image an alt text. Connect every form control to a label. Make link text meaningful. Write the page language in <html lang>. Make sure the page can be used with the keyboard only: Tab moves between links and buttons.',
        'Do not use colour alone to show meaning (red text for errors only), and keep enough contrast between text and background. A good rule is that the text should be easy to read in bright sunlight on a phone.'],
        code: `<h1>Accessible page</h1>\n<h2>Good example</h2>\n<img src="https://placehold.co/200x80/2563eb/ffffff?text=Logo" alt="VENUE logo" width="200" height="80">\n<p><a href="#">Read the exam timetable</a></p>\n<label for="q">Search notes</label>\n<input id="q" type="search">\n<button>Search</button>`,
        explain: ['Headings follow the order h1 then h2.', 'The image has an alt text, the link says where it goes, and the search box has a real label.', 'A visitor using only a keyboard can Tab to the link, the search box and the button.'] },
      { h: 'Page speed and data', p: [
        'Many visitors in Tanzania use mobile data and slower networks, so a small page is a kind page. Compress images, give them width and height, use loading="lazy", avoid large videos that start by themselves, and keep scripts few. A page under 1 MB loads quickly even on a weak connection.'],
        code: `<img src="https://placehold.co/320x120/0f766e/ffffff?text=Small+file" width="320" height="120" alt="Small teal banner" loading="lazy">\n<p>Small images, with width and height, load fast and do not move the page.</p>`,
        explain: ['The picture is small in size, has its dimensions, and loads lazily.', 'Reserving the space with width and height stops the page from jumping while it loads.'] },
      { h: 'Check your HTML', p: [
        'The W3C Markup Validator (validator.w3.org) checks your HTML and lists mistakes: unclosed tags, wrong nesting, missing attributes. You can paste your code there. Browsers also show a page outline and errors in their developer tools (press F12 on a computer).',
        'A short checklist before you publish: a title, a description and a viewport tag; one h1; headings in order; alt text on images; labels on form fields; a lang attribute; all tags closed; links that work.'] },
    ],
    {
      mistakes: [
        'Leaving out the viewport meta tag, so the page looks tiny on phones.',
        'The same title on every page.',
        'Skipping heading levels for visual size.',
        'Images without alt text.',
        'Text with too little contrast.',
      ],
      exercises: [
        { q: 'Write the three meta tags every page needs: charset, viewport and description.', a: `<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="A short description of the page.">` },
      ],
      quiz: [
        { q: 'What does the viewport meta tag do?', options: ['Sets the page language', 'Makes the page fit phone screens', 'Adds a title', 'Loads images'], answer: 1, why: 'It tells mobile browsers to use the device width instead of a zoomed-out desktop view.' },
        { q: 'What is the purpose of alt text?', options: ['Decoration', 'Describing a picture to those who cannot see it', 'Speeding up the page', 'Hiding the picture'], answer: 1, why: 'alt text makes images accessible and useful when they do not load.' },
        { q: 'Where is <title> placed?', options: ['In <body>', 'In <head>', 'In <footer>', 'Anywhere'], answer: 1, why: '<title> belongs in <head>.' },
      ],
      challenge: {
        prompt: 'Make this page ready for mobile and search: add a viewport meta tag, a meta description, set lang on <html> and give the image an alt text.',
        starter: '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title>My site</title>\n</head>\n<body>\n  <h1>My site</h1>\n  <img src="https://placehold.co/200x80" width="200" height="80">\n</body>\n</html>',
        check: 'html[lang] => Add a lang attribute to the <html> tag, for example lang="en".\nmeta[name="viewport"] => Add the viewport meta tag.\nmeta[name="description"][content] => Add a meta description with content.\nimg[alt]:not([alt=""]) => Give the image a meaningful alt text.',
        hint: '<html lang="en"> ... <meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="description" content="..."> <img ... alt="...">',
        solution: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <meta name="description" content="My personal website.">\n  <title>My site</title>\n</head>\n<body>\n  <h1>My site</h1>\n  <img src="https://placehold.co/200x80" width="200" height="80" alt="Grey placeholder banner">\n</body>\n</html>',
      },
    }),

  H('project', 'Project: your personal profile page', 'Mradi: tengeneza ukurasa wako wa wasifu ukitumia kila ulichojifunza.',
    'Build the page step by step, then add your own details and a second section.',
    [
      { h: 'What we will build', p: [
        'In this project you create a one-page personal profile for a student: a header with a photo and name, a short About section, a table of courses, a list of skills, a contact form and a footer. It uses every part of this chapter: structure, text, images, lists, tables, links and forms.',
        'Work in four steps. Read each step, run it, then change the text to your own information. At the end, put all the steps together in one page and try it in the editor.'] },
      { h: 'Step 1: the skeleton and header', p: [
        'Start with the page skeleton. The header holds the photo, name and a menu of jump links. Notice the meta tags and the semantic elements.'],
        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Asha Juma - Profile</title>\n</head>\n<body>\n  <header>\n    <img src="https://placehold.co/90x90/2563eb/ffffff?text=AJ" width="90" height="90" alt="Photo of Asha Juma">\n    <h1>Asha Juma</h1>\n    <p>BSc Statistics student, University of Dar es Salaam</p>\n    <nav>\n      <a href="#about">About</a> |\n      <a href="#courses">Courses</a> |\n      <a href="#contact">Contact</a>\n    </nav>\n  </header>\n</body>\n</html>`,
        explain: ['The page skeleton has the doctype, language, charset, viewport and title.', 'The header has a picture with alt text, the main heading, a one-line summary and a jump menu.', 'The links point to ids we will create in the next steps: about, courses and contact.'] },
      { h: 'Step 2: About, skills and courses', p: [
        'Now the main content. The About section is a paragraph, the skills are a list, and the courses are a table with a caption.'],
        code: `<main>\n  <section id="about">\n    <h2>About me</h2>\n    <p>I am a first-year student who loves <strong>data</strong> and <em>problem solving</em>.</p>\n    <h3>Skills</h3>\n    <ul>\n      <li>Python basics</li>\n      <li>HTML and CSS</li>\n      <li>Statistics</li>\n    </ul>\n  </section>\n  <section id="courses">\n    <h2>My courses</h2>\n    <table border="1" cellpadding="6" style="border-collapse:collapse">\n      <caption>Semester 1</caption>\n      <tr><th>Code</th><th>Course</th><th>Credits</th></tr>\n      <tr><td>MS 101</td><td>Statistics 1</td><td>12</td></tr>\n      <tr><td>MT 101</td><td>Calculus</td><td>12</td></tr>\n    </table>\n  </section>\n</main>`,
        explain: ['Each section has an id that matches a menu link from Step 1, so the jump links work.', 'strong and em give meaning to the important words.', 'The table has a caption, a header row of th cells and data rows with the same number of cells.'] },
      { h: 'Step 3: contact form and footer', p: [
        'The last part is a contact form (with labels, name attributes and required fields) and the footer.'],
        code: `<section id="contact">\n  <h2>Contact me</h2>\n  <form>\n    <p><label for="nm">Your name</label><br><input id="nm" name="name" required></p>\n    <p><label for="em">Your email</label><br><input id="em" name="email" type="email" required></p>\n    <p><label for="ms">Message</label><br><textarea id="ms" name="message" rows="3"></textarea></p>\n    <button type="submit">Send</button>\n  </form>\n</section>\n<footer>\n  <p>&copy; 2026 Asha Juma. Built with HTML.</p>\n</footer>`,
        explain: ['Every control has a label connected through for and id, and a name for the data.', 'The name and email fields are required, and the email field checks the format.', 'The footer holds the copyright line with the &copy; entity.'] },
      { h: 'Step 4: make it yours', p: [
        'Combine the three steps in one page in the editor: put Step 2 and Step 3 inside the body after the header of Step 1. Then personalise it.',
        'Ideas to extend it: add a description list of your goals; embed a map of your university; add an ordered list of your study plan; add a second page profile.html and link the two pages with relative links; add a download link for your CV.',
        'In the next track (CSS) you will give this page colours, a layout and a mobile-friendly design, using the same HTML.'] },
    ],
    {
      mistakes: [
        'Menu links that do not match any id.',
        'Forgetting the closing tags when combining the steps.',
        'Leaving the sample name and text unchanged.',
      ],
      exercises: [
        { q: 'Add a description list "Goals" to the About section with two goals and their reasons.', a: `<dl>\n  <dt>Learn Python</dt>\n  <dd>To analyse data.</dd>\n  <dt>Graduate with honours</dt>\n  <dd>To qualify for a scholarship.</dd>\n</dl>` },
      ],
      quiz: [
        { q: 'Why do the menu links use #about and #courses?', options: ['They open new pages', 'They jump to elements with those ids', 'They download files', 'They are comments'], answer: 1, why: 'Fragment links scroll to the element with the matching id.' },
        { q: 'Why does the page use <header>, <main> and <footer>?', options: ['They are required by browsers', 'They give the page a meaningful structure', 'They make the page faster', 'They colour the page'], answer: 1, why: 'Semantic elements describe the role of each part.' },
      ],
      challenge: {
        prompt: 'Build a mini profile: a <header> with an h1, a <main> with an h2 and a list (at least 2 items), a link to your email (mailto:), and a <footer>.',
        starter: '<!-- Write your mini profile here -->\n',
        check: 'header h1 => Add a <header> with an <h1> (your name).\nmain h2 => Add an <h2> inside <main>.\nmain li >= 2 => Add a list with at least two items inside <main>.\na[href^="mailto:"] => Add an email link (mailto:).\nfooter => Add a <footer>.',
        hint: '<header><h1>Name</h1></header><main><h2>Skills</h2><ul><li>..</li><li>..</li></ul><a href="mailto:me@example.com">Email me</a></main><footer>..</footer>',
        solution: '<header><h1>Asha Juma</h1></header>\n<main>\n  <h2>Skills</h2>\n  <ul><li>HTML</li><li>Statistics</li></ul>\n  <p><a href="mailto:asha@example.com">Email me</a></p>\n</main>\n<footer>&copy; 2026</footer>',
      },
    }),
];
