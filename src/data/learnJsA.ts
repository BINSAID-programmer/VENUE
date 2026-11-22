import type { LearnLesson } from './learnLessons';

type Sec = NonNullable<LearnLesson['sections']>[number];
type Extra = Pick<LearnLesson, 'mistakes' | 'exercises' | 'quiz' | 'challenge'>;

/** JavaScript lesson builder (ids look like js-<id>). Challenge `check` is JS: it can use `out` (console lines) and assert(ok, msg). */
export const J = (id: string, title: string, sw: string, task: string, sections: Sec[], extra: Extra = {}): LearnLesson => ({
  ...extra,
  id: `js-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: sections.find((s) => s.code)?.code || '',
});

/** Chapters 1–2: first steps, variables, operators, decisions and loops. */
export const JS_A: LearnLesson[] = [
  J('intro', 'What is JavaScript? Your first program', 'JavaScript ni lugha inayofanya tovuti kuwa hai. console.log() huonyesha matokeo.',
    'Print your name and your course with two console.log lines.',
    [
      { h: 'What is JavaScript?', p: [
        'JavaScript is the programming language of the web. HTML builds the structure of a page, CSS styles it, and JavaScript makes it do things: react to a click, check a form, update numbers without reloading, load new data. Every web browser has a JavaScript engine built in, so you need nothing to install.',
        'JavaScript is also used outside the browser (for servers, mobile apps and tools), but the language is the same. What you learn here works everywhere.'] },
      { h: 'Your first program: console.log', p: [
        'A program is a list of instructions that run from top to bottom. The simplest instruction prints something. console.log(...) writes a value to the console, the place where programmers see messages. Text must be inside quotation marks; we call it a string.'],
        code: `console.log("Hello, VENUE!");\nconsole.log("I am learning JavaScript");\nconsole.log(2026);`,
        explain: ['Each console.log(...) prints one line, in the order written.', 'The first two print text, so they have quotation marks. The third prints a number, which needs none.', 'Every instruction ends with a semicolon ;. JavaScript can often guess it, but writing it is a good habit.'] },
      { h: 'Comments', p: [
        'A comment is a note for humans; JavaScript ignores it. // starts a comment that lasts to the end of the line. /* ... */ can cover many lines. Use comments to explain why you wrote something, not to repeat the code.'],
        code: `// This line is ignored\nconsole.log("visible"); // this part is ignored too\n/* console.log("this is switched off"); */\nconsole.log("done");`,
        explain: ['Only "visible" and "done" are printed.', 'The line inside /* */ is switched off, a quick way to test without deleting code.'] },
      { h: 'Errors are normal', p: [
        'Everyone gets errors, even experts. When JavaScript cannot understand a line it stops and reports the problem. Read the message: it usually names the problem and the line. Typical first errors are a missing quotation mark, a missing bracket, or a misspelled word. Fix one error at a time and run again.'],
        code: `console.log("This works");\nconsole.log(Hello);\nconsole.log("never reached");`,
        explain: ['The second line fails: Hello without quotes is treated as a name, and no such name exists, so you get "Hello is not defined".', 'The third line never runs, because the program stops at the first error.'] },
    ], {
      mistakes: ['Forgetting the quotation marks around text: console.log(Hello) is an error.', 'Mixing quote types: "text\' will not work. Start and end with the same kind.', 'Writing Console.log or console.Log. JavaScript is case sensitive; it must be console.log.', 'Forgetting a closing bracket ) at the end of a line.'],
      exercises: [
        { q: 'Print the text Habari ya asubuhi.', a: 'console.log("Habari ya asubuhi");' },
        { q: 'Print your age as a number and then a line of text, using two console.log instructions.', a: 'console.log(19);\nconsole.log("years old");' },
        { q: 'Add a comment above a console.log that says what it prints.', a: '// prints a greeting\nconsole.log("Karibu");' },
      ],
      quiz: [
        { q: 'What does console.log() do?', options: ['Saves a file', 'Prints a value to the console', 'Opens a website', 'Deletes the code'], answer: 1, why: 'console.log writes a value to the console.' },
        { q: 'Which line is a comment?', options: ['# note', '// note', '<!-- note -->', '-- note'], answer: 1, why: '// starts a one-line comment in JavaScript.' },
        { q: 'Why does console.log(Hello) fail?', options: ['Hello is too long', 'Text needs quotation marks', 'log must be capital', 'It needs two arguments'], answer: 1, why: 'Without quotes JavaScript looks for a name called Hello.' },
      ],
      challenge: {
        prompt: 'Print your name on one line and the word JavaScript on the next line. Use two console.log instructions (any name is fine).',
        starter: '// write your code here\n',
        check: 'assert(out.length >= 2, "Print two lines with console.log.");\nassert(out[0].trim().length > 0, "The first line should be your name.");\nassert(out[1].trim() === "JavaScript", "The second line must be exactly: JavaScript");',
        hint: 'console.log("Asha");\nconsole.log("JavaScript");',
        solution: 'console.log("Asha");\nconsole.log("JavaScript");\n',
      },
    }),

  J('vars', 'Variables and data types', 'Variable huhifadhi thamani. Tumia const kwa isiyobadilika na let kwa inayobadilika.',
    'Store a price and a quantity in variables and print the total.',
    [
      { h: 'What is a variable?', p: [
        'A variable is a named box that stores a value so you can use it later. You make one with a keyword, a name, and a value. Use const when the value will not change and let when it will. (You may see old code using var; avoid it in new code.)'],
        code: `const course = "Statistics 1";\nlet marks = 60;\nmarks = marks + 15;\nconsole.log(course);\nconsole.log(marks);`,
        explain: ['course is a constant: if we tried to give it a new value, JavaScript would stop with an error.', 'marks is a let variable, so it can change. marks + 15 is calculated first (75) and then stored back.', 'The = sign means "store the value on the right in the name on the left". It is not the equals of mathematics.'] },
      { h: 'The main data types', p: [
        'Every value has a type. A string is text in quotes. A number is any number, whole or decimal. A boolean is true or false. undefined means "no value yet", and null means "intentionally empty". The typeof operator tells you the type of a value.'],
        code: `console.log(typeof "hello");\nconsole.log(typeof 42);\nconsole.log(typeof 3.14);\nconsole.log(typeof true);\nconsole.log(typeof undefined);\nlet x;\nconsole.log(x);`,
        explain: ['"hello" is a string; 42 and 3.14 are both just number.', 'A variable declared without a value, like x, holds undefined.'] },
      { h: 'Naming rules and style', p: [
        'Names can contain letters, digits, _ and $, but cannot start with a digit and cannot be a reserved word such as let or if. Names are case sensitive: Total and total are different. The common style is camelCase: start lower case and capitalise each new word, like totalPrice or studentName.',
        'Choose names that say what the value means. price is better than p.'],
        code: `const unitPrice = 2500;\nconst quantity = 4;\nconst totalPrice = unitPrice * quantity;\nconsole.log(totalPrice);`,
        explain: ['Three clear names make the calculation readable without a comment.', 'The result is 10000.'] },
    ], {
      mistakes: ['Trying to change a const: "Assignment to constant variable".', 'Using a variable before declaring it.', 'Mixing the case: myName and myname are two different names.', 'Putting a number in quotes: "5" is a string, not a number.'],
      exercises: [
        { q: 'Create a const called city with the value "Dar es Salaam" and print it.', a: 'const city = "Dar es Salaam";\nconsole.log(city);' },
        { q: 'Make a let variable score = 10, add 5 to it and print it.', a: 'let score = 10;\nscore = score + 5;\nconsole.log(score);' },
        { q: 'Print the type of the value true.', a: 'console.log(typeof true);' },
      ],
      quiz: [
        { q: 'Which keyword makes a variable that cannot be reassigned?', options: ['let', 'const', 'var', 'set'], answer: 1, why: 'const creates a constant.' },
        { q: 'What does typeof 3.14 give?', options: ['"decimal"', '"float"', '"number"', '"string"'], answer: 2, why: 'JavaScript has one number type for whole and decimal numbers.' },
        { q: 'Which name is correct camelCase?', options: ['total_price', 'TotalPrice', 'totalPrice', 'total-price'], answer: 2, why: 'camelCase starts lower case and capitalises later words.' },
      ],
      challenge: {
        prompt: 'Create two constants: price = 1500 and quantity = 3. Then create a constant total (price multiplied by quantity) and print it.',
        starter: '// create price, quantity and total, then print total\n',
        check: 'assert(typeof price !== "undefined" && price === 1500, "Create const price = 1500.");\nassert(typeof quantity !== "undefined" && quantity === 3, "Create const quantity = 3.");\nassert(typeof total !== "undefined" && total === 4500, "total must be price * quantity.");\nassert(out.length >= 1 && out[out.length - 1].trim() === "4500", "Print total with console.log(total).");',
        hint: 'const total = price * quantity;\nconsole.log(total);',
        solution: 'const price = 1500;\nconst quantity = 3;\nconst total = price * quantity;\nconsole.log(total);\n',
      },
    }),

  J('ops', 'Operators, strings and template literals', 'Operator hufanya hesabu na kulinganisha. Template literal huunganisha maandishi na thamani.',
    'Build a sentence from a name and a mark using a template literal.',
    [
      { h: 'Arithmetic', p: [
        'JavaScript has the usual operators: + - * / and % (remainder after division) and ** (power). Brackets change the order, and multiplication and division happen before addition and subtraction, as in mathematics.'],
        code: `console.log(7 + 3);\nconsole.log(7 - 3);\nconsole.log(7 * 3);\nconsole.log(7 / 2);\nconsole.log(7 % 2);\nconsole.log(2 ** 5);\nconsole.log(2 + 3 * 4);\nconsole.log((2 + 3) * 4);`,
        explain: ['7 / 2 gives 3.5: JavaScript does not cut decimals.', '7 % 2 is 1 because 7 = 3 × 2 + 1. A remainder of 0 tells you a number is even.', '2 + 3 * 4 is 14 but (2 + 3) * 4 is 20: brackets first.'] },
      { h: 'Shortcuts and increments', p: [
        'Updating a variable is so common that there are shortcuts: x += 5 means x = x + 5, and the same works for -=, *= and /=. x++ adds one and x-- subtracts one.'],
        code: `let points = 10;\npoints += 5;\npoints *= 2;\npoints++;\nconsole.log(points);`,
        explain: ['10 → 15 → 30 → 31, so it prints 31.'] },
      { h: 'Joining text', p: [
        'The + operator joins strings. A template literal is easier and cleaner: write the text between backticks and put any expression inside \${ }. The value is inserted into the text.',
        'Careful: "5" + 3 gives "53" (text), but 5 + 3 gives 8. When a string is involved, + joins instead of adding.'],
        code: `const name = "Asha";\nconst mark = 82;\nconsole.log("Hello " + name + ", you got " + mark);\nconsole.log(\`Hello \${name}, you got \${mark}\`);\nconsole.log(\`Next year: \${mark + 5}\`);\nconsole.log("5" + 3);\nconsole.log(5 + 3);`,
        explain: ['The first two lines print the same sentence, but the template literal is shorter and easier to read.', 'Anything inside ${ } is calculated, so ${mark + 5} inserts 87.', '"5" + 3 is "53": text wins.'] },
      { h: 'Comparing values', p: [
        'Comparison operators give true or false: > < >= <= and ===, which means "equal in value and type". !== means not equal. Always use === and !==; the shorter == converts types and gives surprising results (for example "5" == 5 is true).',
        'Logical operators combine booleans: && means and, || means or, ! means not.'],
        code: `console.log(5 > 3);\nconsole.log(5 === "5");\nconsole.log(5 == "5");\nconsole.log(5 !== 4);\nconsole.log(5 > 3 && 2 > 10);\nconsole.log(5 > 3 || 2 > 10);\nconsole.log(!true);`,
        explain: ['5 === "5" is false because a number is not a string. The loose == says true, which is why we avoid it.', '&& needs both sides true, || needs only one, and ! flips the value.'] },
    ], {
      mistakes: ['Using = (store) when you mean === (compare).', 'Using == instead of ===.', 'Adding a number to a string by accident: "10" + 5 is "105".', 'Using normal quotes instead of backticks with ${ }: it prints the symbols instead of the value.'],
      exercises: [
        { q: 'Print the remainder of 17 divided by 5.', a: 'console.log(17 % 5);' },
        { q: 'Print the sentence "Total: 4500" using a template literal and a variable total = 4500.', a: 'const total = 4500;\nconsole.log(\`Total: \${total}\`);' },
        { q: 'Print whether 10 is greater than 3 and less than 20.', a: 'console.log(10 > 3 && 10 < 20);' },
      ],
      quiz: [
        { q: 'What is "5" + 3?', options: ['8', '"53"', 'Error', 'NaN'], answer: 1, why: 'With a string, + joins text.' },
        { q: 'Which operator should you use to check equality?', options: ['=', '==', '===', '=>'], answer: 2, why: '=== compares value and type.' },
        { q: 'What is 9 % 4?', options: ['2', '1', '2.25', '5'], answer: 1, why: '9 = 2 × 4 + 1.' },
      ],
      challenge: {
        prompt: 'Given const name = "Juma" and const mark = 74, print exactly: Juma scored 74 (use a template literal).',
        starter: 'const name = "Juma";\nconst mark = 74;\n// print: Juma scored 74\n',
        check: 'assert(out.length >= 1, "Print the sentence with console.log.");\nassert(out[out.length - 1] === "Juma scored 74", "The line must be exactly: Juma scored 74");\nassert(/`[^`]*\\$\\{[^}]+\\}[^`]*`/.test(CODE), "Use a template literal with backticks and ${ }.");',
        hint: 'console.log(`${name} scored ${mark}`);',
        solution: 'const name = "Juma";\nconst mark = 74;\nconsole.log(`${name} scored ${mark}`);\n',
      },
    }),

  J('cond', 'Making decisions: if, else and switch', 'if/else hufanya programu ichague njia kulingana na sharti.',
    'Write grade rules: A from 70, B from 60, C from 50, otherwise F.',
    [
      { h: 'if and else', p: [
        'A program often has to choose. The if statement runs a block of code only when a condition is true. Add else for the other case. The block is written between curly brackets { }.'],
        code: `const mark = 55;\nif (mark >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Fail");\n}`,
        explain: ['The condition mark >= 50 is true, so the first block runs and prints Pass.', 'Only one of the two blocks runs, never both.'] },
      { h: 'else if: many choices', p: [
        'Use else if to test several conditions in order. JavaScript checks from the top and runs the first block whose condition is true, then skips the rest. So put the strictest condition first.'],
        code: `const mark = 64;\nif (mark >= 70) {\n  console.log("A");\n} else if (mark >= 60) {\n  console.log("B");\n} else if (mark >= 50) {\n  console.log("C");\n} else {\n  console.log("F");\n}`,
        explain: ['64 is not >= 70, but it is >= 60, so it prints B and the remaining tests are skipped.', 'If you wrote mark >= 50 first, every mark of 50 or more would print C: order matters.'] },
      { h: 'Truthy and falsy', p: [
        'In an if, JavaScript treats some values as false: false, 0, "" (empty text), null, undefined and NaN. Everything else counts as true, including "0" and []. This is handy for checking whether a value exists.'],
        code: `const name = "";\nif (name) {\n  console.log("Hello " + name);\n} else {\n  console.log("Please enter a name");\n}`,
        explain: ['An empty string is falsy, so the else block runs.', 'If name were "Asha", the first block would run.'] },
      { h: 'switch and the ternary', p: [
        'When you compare one value against many exact choices, switch is tidy. Each case ends with break, otherwise the code falls through into the next case. The ternary operator condition ? a : b is a short if/else that gives a value.'],
        code: `const day = "Sat";\nswitch (day) {\n  case "Sat":\n  case "Sun":\n    console.log("Weekend");\n    break;\n  default:\n    console.log("Weekday");\n}\nconst age = 20;\nconsole.log(age >= 18 ? "adult" : "minor");`,
        explain: ['Sat and Sun share one block because the first case has no break.', 'The ternary prints adult because 20 >= 18.'] },
    ], {
      mistakes: ['Writing = instead of === inside the if: if (x = 5) assigns instead of comparing.', 'Putting a semicolon right after the condition: if (x > 3); runs an empty block.', 'Wrong order of else if conditions.', 'Forgetting break in a switch, so the code runs on into the next case.'],
      exercises: [
        { q: 'Print "even" or "odd" for the number 9 using if and %.', a: 'const n = 9;\nif (n % 2 === 0) {\n  console.log("even");\n} else {\n  console.log("odd");\n}' },
        { q: 'Use a ternary to print "pass" when score is at least 40, otherwise "fail". Test with 35.', a: 'const score = 35;\nconsole.log(score >= 40 ? "pass" : "fail");' },
        { q: 'Print the word "cold" if temp is below 15, "warm" if below 28, otherwise "hot". Try temp = 22.', a: 'const temp = 22;\nif (temp < 15) {\n  console.log("cold");\n} else if (temp < 28) {\n  console.log("warm");\n} else {\n  console.log("hot");\n}' },
      ],
      quiz: [
        { q: 'Which value is falsy?', options: ['"0"', '[]', '0', '"false"'], answer: 2, why: 'The number 0 is falsy; the string "0" and an empty array are truthy.' },
        { q: 'What happens if you leave out break in a case?', options: ['Syntax error', 'The next case also runs', 'Nothing', 'The program stops'], answer: 1, why: 'Execution falls through into the next case.' },
        { q: 'In an else if chain, how many blocks run?', options: ['All true ones', 'Only the first true one', 'The last one', 'Always two'], answer: 1, why: 'After the first true condition the rest are skipped.' },
      ],
      challenge: {
        prompt: 'Write a function grade(mark) that returns "A" for 70 and above, "B" for 60 and above, "C" for 50 and above, otherwise "F".',
        starter: 'function grade(mark) {\n  // return the grade letter\n}\n',
        check: 'assert(typeof grade === "function", "Define a function called grade.");\nconst t = [[95,"A"],[70,"A"],[69,"B"],[60,"B"],[59,"C"],[50,"C"],[49,"F"],[0,"F"]];\nfor (const [m, g] of t) assert(grade(m) === g, "grade(" + m + ") should return " + g + " but returned " + grade(m));',
        hint: 'if (mark >= 70) return "A";\nif (mark >= 60) return "B"; ... then return "F" at the end.',
        solution: 'function grade(mark) {\n  if (mark >= 70) return "A";\n  if (mark >= 60) return "B";\n  if (mark >= 50) return "C";\n  return "F";\n}\n',
      },
    }),

  J('loops', 'Loops: repeating work', 'Loop hurudia kazi: for, while na for...of.',
    'Print the multiplication table of 7 from 1 to 10.',
    [
      { h: 'Why loops?', p: [
        'Computers are good at repetition. Instead of writing console.log ten times you write it once inside a loop. JavaScript has several loops; the most common are for, while and for...of.'] },
      { h: 'The for loop', p: [
        'A for loop has three parts in brackets: where to start, when to continue, and how to step. for (let i = 0; i < 5; i++) means: start i at 0, keep going while i is less than 5, and add 1 after every round.'],
        code: `for (let i = 1; i <= 5; i++) {\n  console.log("Round " + i);\n}\nlet total = 0;\nfor (let n = 1; n <= 10; n++) {\n  total += n;\n}\nconsole.log("Sum 1 to 10 =", total);`,
        explain: ['The first loop prints Round 1 to Round 5; it stops when i becomes 6.', 'The second loop adds the numbers 1 to 10 into total, giving 55.', 'A variable like total, created before the loop, keeps its value from round to round.'] },
      { h: 'while and do...while', p: [
        'A while loop repeats as long as its condition is true. Use it when you do not know in advance how many rounds are needed. Be careful: if the condition never becomes false the loop never ends and the page freezes.'],
        code: `let money = 100;\nlet days = 0;\nwhile (money > 20) {\n  money -= 30;\n  days++;\n}\nconsole.log(days, money);`,
        explain: ['100 → 70 → 40 → 10. After the third round money is 10, which is not above 20, so the loop stops.', 'It prints 3 10.'] },
      { h: 'for...of, break and continue', p: [
        'for...of visits each item of a list directly. break leaves the loop at once; continue skips the rest of the current round and goes to the next.'],
        code: `const marks = [45, 78, 62, 30, 90];\nfor (const m of marks) {\n  if (m < 40) continue;\n  if (m > 85) break;\n  console.log(m);\n}`,
        explain: ['45, 78 and 62 are printed.', '30 is skipped by continue.', '90 triggers break, so the loop ends.'] },
    ], {
      mistakes: ['Off-by-one errors: i < 5 runs 5 times from 0; i <= 5 runs 6 times.', 'Forgetting to change the variable in a while loop, creating an endless loop.', 'Declaring the loop variable with const in a classic for loop (it must change, so use let).', 'Putting a semicolon after the for(...) brackets.'],
      exercises: [
        { q: 'Print the numbers 1 to 5, each on its own line.', a: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}' },
        { q: 'Add up all even numbers from 2 to 20 and print the total.', a: 'let sum = 0;\nfor (let i = 2; i <= 20; i += 2) {\n  sum += i;\n}\nconsole.log(sum);' },
        { q: 'Loop over ["a", "b", "c"] with for...of and print each letter.', a: 'for (const letter of ["a", "b", "c"]) {\n  console.log(letter);\n}' },
      ],
      quiz: [
        { q: 'How many times does for (let i = 0; i < 4; i++) run?', options: ['3', '4', '5', 'Forever'], answer: 1, why: 'i takes the values 0, 1, 2 and 3.' },
        { q: 'What does continue do?', options: ['Stops the loop', 'Skips to the next round', 'Restarts the program', 'Nothing'], answer: 1, why: 'continue skips the rest of this round only.' },
        { q: 'Which loop suits an unknown number of rounds?', options: ['while', 'switch', 'if', 'const'], answer: 0, why: 'while repeats until its condition becomes false.' },
      ],
      challenge: {
        prompt: 'Print the multiplication table of 7: 7 x 1 = 7, then 7 x 2 = 14, up to 7 x 10 = 70, each on its own line.',
        starter: '// use a loop and console.log\n',
        check: 'assert(out.length === 10, "Print exactly 10 lines.");\nfor (let i = 1; i <= 10; i++) assert(out[i - 1].replace(/\\s+/g, " ").trim() === "7 x " + i + " = " + 7 * i, "Line " + i + " should be: 7 x " + i + " = " + 7 * i);\nassert(/for|while/.test(CODE), "Use a loop.");',
        hint: 'for (let i = 1; i <= 10; i++) { console.log(`7 x ${i} = ${7 * i}`); }',
        solution: 'for (let i = 1; i <= 10; i++) {\n  console.log(`7 x ${i} = ${7 * i}`);\n}\n',
      },
    }),
];
