import type { LearnLesson } from './learnLessons';
import { J } from './learnJsA';

/** Chapters 5–6: the browser (DOM and events) and a project. */
export const JS_C: LearnLesson[] = [
  J('dom', 'The DOM: changing the page', 'DOM ni muundo wa ukurasa. JavaScript huchagua elementi na kubadilisha maandishi, rangi na mwonekano.',
    'Create a heading with JavaScript and add it to the page.',
    [
      { h: 'What is the DOM?', p: [
        'When a browser loads HTML it builds a tree of objects in memory called the DOM (Document Object Model). Every tag becomes an object you can read and change with JavaScript. Change the object and the page updates at once, with no reload. This is how all interactive sites work.'] },
      { h: 'Selecting elements', p: [
        'First find the element. document.querySelector("css selector") returns the first match, using the same selectors you know from CSS (#id, .class, tag). querySelectorAll returns all matches. Put your script after the HTML it uses, or the elements will not exist yet.'],
        code: `<h1 id="title">Hello</h1>\n<p class="note">First note</p>\n<p class="note">Second note</p>\n<script>\n  const title = document.querySelector("#title");\n  const notes = document.querySelectorAll(".note");\n  console.log(title.textContent);\n  console.log(notes.length);\n</script>`,
        explain: ['#title finds the heading by its id; .note finds both paragraphs.', 'textContent is the text inside an element. The script is placed below the HTML so the elements already exist.'] },
      { h: 'Changing text, style and classes', p: [
        'Set textContent to change text, use the style property to change CSS one property at a time (in camelCase, like backgroundColor), and classList to add, remove or toggle classes. Prefer classes: keep the look in CSS and let JavaScript only switch the class.'],
        code: `<h1 id="title">Hello</h1>\n<p id="msg">Original text</p>\n<style>.big { font-size: 28px; color: teal; }</style>\n<script>\n  const msg = document.querySelector("#msg");\n  msg.textContent = "Changed by JavaScript";\n  msg.style.backgroundColor = "gold";\n  document.querySelector("#title").classList.add("big");\n</script>`,
        explain: ['The paragraph text is replaced and gets a gold background.', 'classList.add("big") applies the .big rule from the style block to the heading.'] },
      { h: 'Creating and adding elements', p: [
        'You can build new elements: createElement makes one, you set its text, and appendChild (or append) puts it into the page. This is how a list grows when the user adds an item.'],
        code: `<ul id="list"></ul>\n<script>\n  const list = document.querySelector("#list");\n  for (const name of ["Asha", "Juma", "Neema"]) {\n    const li = document.createElement("li");\n    li.textContent = name;\n    list.appendChild(li);\n  }\n</script>`,
        explain: ['The loop creates one <li> for each name and appends it to the empty list.', 'Use textContent for plain text; it is the safe choice when the text comes from a user.'] },
    ], {
      mistakes: ['Running the script before the element exists, so querySelector returns null.', 'Forgetting # for ids or . for classes in the selector.', 'Writing style.background-color: in JavaScript it is style.backgroundColor.', 'Using innerHTML with text typed by a user; this can run harmful code. Use textContent.'],
      exercises: [
        { q: 'Create a paragraph with the text "Hi" and add it to the body.', a: 'const p = document.createElement("p");\np.textContent = "Hi";\ndocument.body.appendChild(p);' },
        { q: 'Select the first <p> on the page and make its text red.', a: 'const p = document.querySelector("p");\nif (p) p.style.color = "red";' },
        { q: 'Add a class "active" to the element with id "menu".', a: 'const menu = document.querySelector("#menu");\nif (menu) menu.classList.add("active");' },
      ],
      quiz: [
        { q: 'What does document.querySelector("#a") do?', options: ['Finds all elements', 'Finds the first element with id a', 'Creates an element', 'Deletes an element'], answer: 1, why: '#a is the id selector.' },
        { q: 'How do you write background-color in JavaScript?', options: ['style.background-color', 'style.backgroundColor', 'style["background color"]', 'style.bg'], answer: 1, why: 'CSS names become camelCase.' },
        { q: 'Which is safest for showing user text?', options: ['innerHTML', 'textContent', 'outerHTML', 'write'], answer: 1, why: 'textContent never runs HTML.' },
      ],
      challenge: {
        prompt: 'Using JavaScript, create an <h1> with the text "Welcome to VENUE" and the id "title", add it to document.body, and make its color teal.',
        starter: '// create the heading, set its text, id and color, then add it to the page\n',
        check: 'const h = document.getElementById("title");\nassert(h, "Create an element with id \\"title\\" and add it to document.body.");\nassert(h.tagName === "H1", "The element must be an <h1>.");\nassert(h.textContent.trim() === "Welcome to VENUE", "The text must be: Welcome to VENUE");\nassert(h.style.color === "teal", "Set h.style.color = \\"teal\\".");\nassert(document.body.contains(h), "Add the heading to the page with document.body.appendChild(h).");',
        hint: 'const h = document.createElement("h1");\nh.id = "title";\nh.textContent = "Welcome to VENUE";\nh.style.color = "teal";\ndocument.body.appendChild(h);',
        solution: 'const h = document.createElement("h1");\nh.id = "title";\nh.textContent = "Welcome to VENUE";\nh.style.color = "teal";\ndocument.body.appendChild(h);\n',
      },
    }),

  J('events', 'Events: reacting to the user', 'Event ni kitu kinachotokea (click, kuandika). addEventListener huendesha function.',
    'Make a button that adds one to a counter every time it is clicked.',
    [
      { h: 'What is an event?', p: [
        'An event is something that happens on the page: a click, a key press, typing in a box, submitting a form. You tell the browser which function to run when it happens with addEventListener(eventName, function). The function is called a handler. Your program now waits for the user instead of running once from top to bottom.'],
        code: `<button id="b">Count: 0</button>\n<script>\n  let n = 0;\n  const b = document.querySelector("#b");\n  b.addEventListener("click", () => {\n    n++;\n    b.textContent = "Count: " + n;\n  });\n</script>`,
        explain: ['The handler runs every time the button is clicked, not before.', 'n lives outside the handler, so it remembers its value between clicks.'] },
      { h: 'Reading what the user typed', p: [
        'An input element has a value property with the text typed in it. It is always a string, so convert with Number() when you need a number. The input event fires on every key press; the click event of a button is the usual moment to read the final value.'],
        code: `<input id="age" type="number" placeholder="Your age">\n<button id="go">Check</button>\n<p id="out"></p>\n<script>\n  document.querySelector("#go").addEventListener("click", () => {\n    const age = Number(document.querySelector("#age").value);\n    document.querySelector("#out").textContent =\n      age >= 18 ? "Adult" : "Minor";\n  });\n</script>`,
        explain: ['Number(...) turns the typed text into a number before we compare.', 'The result is written into the empty paragraph.'] },
      { h: 'The event object and forms', p: [
        'The handler receives an event object with details, such as which key was pressed. A form reloads the page when submitted; call event.preventDefault() to stop that and handle the data yourself.'],
        code: `<form id="f">\n  <input id="name" placeholder="Name">\n  <button>Greet</button>\n</form>\n<p id="hello"></p>\n<script>\n  document.querySelector("#f").addEventListener("submit", (e) => {\n    e.preventDefault();\n    const name = document.querySelector("#name").value.trim();\n    document.querySelector("#hello").textContent = name ? "Hello, " + name : "Type your name";\n  });\n</script>`,
        explain: ['Without preventDefault the page would reload and the greeting would vanish.', 'trim removes spaces, and the ternary shows a message when the box is empty.'] },
    ], {
      mistakes: ['Calling the function instead of passing it: addEventListener("click", go()) runs it immediately. Pass go.', 'Forgetting that input.value is a string: "5" + 1 is "51".', 'Attaching the listener before the element exists.', 'Forgetting e.preventDefault() on a form.'],
      exercises: [
        { q: 'When #btn is clicked, change the text of #msg to "Clicked".', a: 'const btn = document.querySelector("#btn");\nconst msg = document.querySelector("#msg");\nif (btn && msg) {\n  btn.addEventListener("click", () => {\n    msg.textContent = "Clicked";\n  });\n}' },
        { q: 'Read the value of the input #name when a button is clicked and print it.', a: 'const go = document.querySelector("#go");\nif (go) {\n  go.addEventListener("click", () => {\n    console.log(document.querySelector("#name").value);\n  });\n}' },
        { q: 'Toggle the class "dark" on the body each time #theme is clicked.', a: 'const t = document.querySelector("#theme");\nif (t) {\n  t.addEventListener("click", () => document.body.classList.toggle("dark"));\n}' },
      ],
      quiz: [
        { q: 'Which method attaches a click handler?', options: ['onClick()', 'addEventListener', 'attachEvent()', 'listen()'], answer: 1, why: 'element.addEventListener("click", handler).' },
        { q: 'What type is input.value?', options: ['number', 'boolean', 'string', 'object'], answer: 2, why: 'It is always text; convert with Number().' },
        { q: 'What does e.preventDefault() do on a form submit?', options: ['Deletes the form', 'Stops the page reloading', 'Submits twice', 'Clears the input'], answer: 1, why: 'It cancels the browser default behaviour.' },
      ],
      challenge: {
        prompt: 'The page already has a button with id "add" and a paragraph with id "count" showing 0. Write code so that every click on the button adds one to the number in the paragraph.',
        starter: 'document.body.innerHTML = \'<button id="add">Add one</button><p id="count">0</p>\';\n\n// your code: listen for clicks on #add and update #count\n',
        check: 'const b = document.getElementById("add");\nconst p = document.getElementById("count");\nassert(b && p, "Keep the button #add and the paragraph #count.");\nb.click(); b.click(); b.click();\nassert(p.textContent.trim() === "3", "After 3 clicks #count should show 3 but shows \\"" + p.textContent + "\\".");',
        hint: 'let n = 0;\ndocument.getElementById("add").addEventListener("click", () => {\n  n++;\n  document.getElementById("count").textContent = n;\n});',
        solution: 'document.body.innerHTML = \'<button id="add">Add one</button><p id="count">0</p>\';\n\nlet n = 0;\ndocument.getElementById("add").addEventListener("click", () => {\n  n++;\n  document.getElementById("count").textContent = n;\n});\n',
      },
    }),

  J('project', 'Project: marks and grade calculator', 'Mradi: tumia functions, DOM na events kutengeneza kikokotoo cha alama na grade.',
    'Finish the calculator, then add a colour for each grade.',
    [
      { h: 'What we will build', p: [
        'You will join everything you learned: a function that turns a mark into a grade, a page with an input and a button, and an event handler that shows the result. Keep the logic (the grade function) separate from the page code (the handler). This makes each part easy to test and reuse.'] },
      { h: 'Step 1: the logic', p: [
        'Start with a pure function: it takes a mark and returns a grade, and does not touch the page. We also check that the mark is a valid number between 0 and 100.'],
        code: `function grade(mark) {\n  if (mark >= 70) return "A";\n  if (mark >= 60) return "B";\n  if (mark >= 50) return "C";\n  if (mark >= 40) return "D";\n  return "F";\n}\nfunction isValid(mark) {\n  return Number.isFinite(mark) && mark >= 0 && mark <= 100;\n}\nconsole.log(grade(72), grade(45), isValid(120), isValid(80));`,
        explain: ['The checks go from the highest grade down, so the first true one wins.', 'Number.isFinite is false for NaN, which is what Number("abc") gives.', 'This prints A D false true.'] },
      { h: 'Step 2: the page and the handler', p: [
        'Now connect the function to the page. Read the input, convert to a number, validate, then write a message. Always handle the bad input case so the user gets help instead of silence.'],
        code: `<input id="mark" type="number" placeholder="Mark (0-100)">\n<button id="go">Get grade</button>\n<p id="result"></p>\n<script>\n  function grade(m) { return m >= 70 ? "A" : m >= 60 ? "B" : m >= 50 ? "C" : m >= 40 ? "D" : "F"; }\n  document.querySelector("#go").addEventListener("click", () => {\n    const m = Number(document.querySelector("#mark").value);\n    const out = document.querySelector("#result");\n    if (document.querySelector("#mark").value === "" || m < 0 || m > 100) {\n      out.textContent = "Enter a mark from 0 to 100";\n      return;\n    }\n    out.textContent = "Grade: " + grade(m);\n  });\n</script>`,
        explain: ['An empty box gives value "" which Number turns into 0, so we test for "" first.', 'return inside the handler stops it after showing the error message.'] },
      { h: 'Ideas to extend', p: [
        'Add a colour for each grade with classList. Keep a list of all marks entered and show the average with reduce. Save the list with localStorage so it survives a refresh. Each of these uses a lesson from this course.'] },
    ], {
      mistakes: ['Mixing logic and page code in one big function: harder to test.', 'Not handling an empty or invalid input.', 'Forgetting that input.value is text.', 'Checking grades from the lowest first, so everyone gets the same grade.'],
      exercises: [
        { q: 'Add grade "E" for marks 30 to 39 to the grade function.', a: 'function grade(mark) {\n  if (mark >= 70) return "A";\n  if (mark >= 60) return "B";\n  if (mark >= 50) return "C";\n  if (mark >= 40) return "D";\n  if (mark >= 30) return "E";\n  return "F";\n}\nconsole.log(grade(35));' },
        { q: 'Write a function average(marks) using reduce and print the average of [60, 70, 80].', a: 'const average = (marks) => marks.reduce((s, m) => s + m, 0) / marks.length;\nconsole.log(average([60, 70, 80]));' },
        { q: 'Print how many marks in [35, 72, 48, 90] are passes (50 or more).', a: 'console.log([35, 72, 48, 90].filter(m => m >= 50).length);' },
      ],
      quiz: [
        { q: 'Why keep the grade function separate from the page code?', options: ['It runs faster', 'It is easier to test and reuse', 'JavaScript requires it', 'It uses less memory'], answer: 1, why: 'Pure logic can be tested on its own.' },
        { q: 'What does Number("abc") give?', options: ['0', 'null', 'NaN', 'Error'], answer: 2, why: 'Text that is not a number becomes NaN.' },
        { q: 'Which stores data that survives a page refresh?', options: ['A let variable', 'localStorage', 'console.log', 'a function'], answer: 1, why: 'localStorage keeps data in the browser.' },
      ],
      challenge: {
        prompt: 'The page has input #mark, button #go and paragraph #result. When #go is clicked, show "Grade: A" (or B, C, D, F) in #result: A from 70, B from 60, C from 50, D from 40, otherwise F.',
        starter: 'document.body.innerHTML = \'<input id="mark" type="number"><button id="go">Get grade</button><p id="result"></p>\';\n\n// your code: grade function + click handler\n',
        check: 'const i = document.getElementById("mark"), b = document.getElementById("go"), r = document.getElementById("result");\nassert(i && b && r, "Keep #mark, #go and #result.");\nconst t = [[95,"A"],[70,"A"],[65,"B"],[50,"C"],[45,"D"],[39,"F"],[0,"F"]];\nfor (const [m, g] of t) { i.value = String(m); b.click(); assert(r.textContent.trim() === "Grade: " + g, "For mark " + m + " expected \\"Grade: " + g + "\\" but got \\"" + r.textContent + "\\"."); }',
        hint: 'Write grade(m) with if statements, then in the click handler: const m = Number(mark.value); result.textContent = "Grade: " + grade(m);',
        solution: 'document.body.innerHTML = \'<input id="mark" type="number"><button id="go">Get grade</button><p id="result"></p>\';\n\nfunction grade(m) {\n  if (m >= 70) return "A";\n  if (m >= 60) return "B";\n  if (m >= 50) return "C";\n  if (m >= 40) return "D";\n  return "F";\n}\ndocument.getElementById("go").addEventListener("click", () => {\n  const m = Number(document.getElementById("mark").value);\n  document.getElementById("result").textContent = "Grade: " + grade(m);\n});\n',
      },
    }),
];
