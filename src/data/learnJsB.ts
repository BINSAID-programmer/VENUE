import type { LearnLesson } from './learnLessons';
import { J } from './learnJsA';

/** Chapters 3–4: arrays, objects, strings and functions. */
export const JS_B: LearnLesson[] = [
  J('arrays', 'Arrays: lists of values', 'Array ni orodha ya thamani. map, filter na reduce hubadilisha na kuchuja orodha.',
    'Compute the average of a list of marks using reduce.',
    [
      { h: 'Creating and reading arrays', p: [
        'An array stores many values in one variable, in order. Write it in square brackets with commas. Each item has a position called an index, and counting starts at 0, so the first item is at index 0. The length property tells you how many items there are.'],
        code: `const marks = [55, 72, 40, 88];\nconsole.log(marks[0]);\nconsole.log(marks[3]);\nconsole.log(marks.length);\nconsole.log(marks[marks.length - 1]);\nconsole.log(marks[10]);`,
        explain: ['marks[0] is 55, the first item, and marks[3] is 88, the last.', 'marks.length is 4, so the last index is length - 1.', 'An index that does not exist gives undefined, not an error.'] },
      { h: 'Adding, removing and changing', p: [
        'push adds an item at the end and pop removes the last one. unshift and shift do the same at the start. You can also replace an item by assigning to its index. A const array can still change its contents; const only stops you from replacing the whole array.'],
        code: `const fruits = ["mango", "banana"];\nfruits.push("orange");\nfruits.unshift("apple");\nconsole.log(fruits);\nfruits.pop();\nfruits[1] = "pawpaw";\nconsole.log(fruits);\nconsole.log(fruits.includes("apple"));\nconsole.log(fruits.indexOf("banana"));`,
        explain: ['After the pushes the list is apple, mango, banana, orange.', 'pop removes orange and we replace mango (index 1) with pawpaw.', 'includes answers true or false; indexOf gives the position, or -1 when the item is not there.'] },
      { h: 'map, filter and reduce', p: [
        'These three methods are the heart of modern JavaScript. Each takes a small function. map makes a new array by changing every item. filter keeps only the items that pass a test. reduce combines all items into one value. None of them changes the original array.'],
        code: `const marks = [55, 72, 40, 88];\nconst plus5 = marks.map(m => m + 5);\nconst passed = marks.filter(m => m >= 50);\nconst total = marks.reduce((sum, m) => sum + m, 0);\nconsole.log(plus5);\nconsole.log(passed);\nconsole.log(total, total / marks.length);`,
        explain: ['map gives [60, 77, 45, 93], one new value for each old one.', 'filter keeps 55, 72 and 88 because they are at least 50.', 'reduce starts with sum = 0 and adds each mark: 55 + 72 + 40 + 88 = 255. The average is 63.75.'] },
      { h: 'Sorting and joining', p: [
        'sort puts items in order, but by default it compares them as text, so numbers need a compare function: (a, b) => a - b for smallest first. join turns an array into one string with a separator of your choice.'],
        code: `const n = [10, 9, 100, 1];\nconsole.log([...n].sort());\nconsole.log([...n].sort((a, b) => a - b));\nconsole.log(["Asha", "Juma", "Neema"].join(", "));`,
        explain: ['The default sort gives 1, 10, 100, 9 because it compares text.', 'With (a, b) => a - b the order is correct: 1, 9, 10, 100.', '[...n] makes a copy first, because sort changes the array it is called on.'] },
    ], {
      mistakes: ['Counting from 1: the first item is index 0.', 'Using the last index as length instead of length - 1.', 'Forgetting that sort() on numbers sorts as text.', 'Forgetting the starting value 0 in reduce, or forgetting to return in the function.'],
      exercises: [
        { q: 'Create an array of three names and print the second one.', a: 'const names = ["Asha", "Juma", "Neema"];\nconsole.log(names[1]);' },
        { q: 'Double every number in [1, 2, 3, 4] using map.', a: 'const doubled = [1, 2, 3, 4].map(x => x * 2);\nconsole.log(doubled);' },
        { q: 'Keep only the even numbers of [1, 2, 3, 4, 5, 6] using filter.', a: 'const evens = [1, 2, 3, 4, 5, 6].filter(x => x % 2 === 0);\nconsole.log(evens);' },
      ],
      quiz: [
        { q: 'What is the index of the first item?', options: ['1', '0', '-1', 'It depends'], answer: 1, why: 'Arrays are numbered from 0.' },
        { q: 'Which method keeps only items that pass a test?', options: ['map', 'reduce', 'filter', 'push'], answer: 2, why: 'filter returns the items for which the test is true.' },
        { q: 'What does [3, 1, 2].length give?', options: ['2', '3', '6', 'undefined'], answer: 1, why: 'length counts the items.' },
      ],
      challenge: {
        prompt: 'Write a function average(list) that returns the average of an array of numbers using reduce. Return 0 for an empty array.',
        starter: 'function average(list) {\n  // use reduce, then divide by the length\n}\n',
        check: 'assert(typeof average === "function", "Define a function called average.");\nassert(average([10, 20, 30]) === 20, "average([10, 20, 30]) should be 20.");\nassert(average([55, 72, 40, 88]) === 63.75, "average([55, 72, 40, 88]) should be 63.75.");\nassert(average([]) === 0, "average([]) should be 0.");\nassert(/reduce/.test(CODE), "Use reduce.");',
        hint: 'if (list.length === 0) return 0;\nreturn list.reduce((s, x) => s + x, 0) / list.length;',
        solution: 'function average(list) {\n  if (list.length === 0) return 0;\n  return list.reduce((s, x) => s + x, 0) / list.length;\n}\n',
      },
    }),

  J('objects', 'Objects: grouping related data', 'Object huhifadhi data zinazohusiana kwa majina: key na value.',
    'Make an array of student objects and print the names of those who passed.',
    [
      { h: 'What is an object?', p: [
        'An array stores a list in order. An object stores related facts with names. Each fact is a property: a key (the name), a colon, and a value. Objects are written in curly brackets. Use an object to describe one thing: a student, a course, a product.'],
        code: `const student = {\n  name: "Asha",\n  year: 1,\n  course: "Statistics",\n  passed: true\n};\nconsole.log(student.name);\nconsole.log(student["course"]);\nstudent.year = 2;\nstudent.age = 19;\nconsole.log(student);`,
        explain: ['student.name reads a property with a dot. student["course"] does the same with brackets, useful when the key is in a variable.', 'You can change a value (year) or add a new property (age) at any time.', 'Printing the object shows all its properties.'] },
      { h: 'Objects inside arrays', p: [
        'Real data is usually a list of objects, like the rows of a table. You can use map and filter on it exactly as before, reading the properties inside the function.'],
        code: `const students = [\n  { name: "Asha", mark: 82 },\n  { name: "Juma", mark: 45 },\n  { name: "Neema", mark: 67 }\n];\nconst passed = students.filter(s => s.mark >= 50);\nconsole.log(passed.map(s => s.name));\nconst best = students.reduce((a, b) => (b.mark > a.mark ? b : a));\nconsole.log(best.name, best.mark);`,
        explain: ['filter keeps the objects with mark 50 or more, and map then picks out only their names.', 'The reduce compares two students at a time and keeps the better one, giving Asha with 82.'] },
      { h: 'Looping over an object, destructuring and JSON', p: [
        'Object.keys, Object.values and Object.entries turn an object into arrays you can loop over. Destructuring pulls properties out into variables in one line. JSON is a text format that looks like an object; JSON.stringify turns an object into text (to save or send), and JSON.parse turns it back.'],
        code: `const car = { brand: "Toyota", year: 2018 };\nfor (const [key, value] of Object.entries(car)) {\n  console.log(key + ": " + value);\n}\nconst { brand, year } = car;\nconsole.log(brand, year);\nconst text = JSON.stringify(car);\nconsole.log(text);\nconsole.log(JSON.parse(text).year);`,
        explain: ['Object.entries gives pairs like ["brand", "Toyota"], which the loop splits into key and value.', 'const { brand, year } = car creates two variables from two properties.', 'JSON.stringify gives the text {"brand":"Toyota","year":2018}; JSON.parse makes an object again.'] },
    ], {
      mistakes: ['Misspelling a key: student.nmae gives undefined without an error.', 'Using a dot with a key stored in a variable (use brackets).', 'Putting a comma after the last property in JSON text (not allowed).', 'Thinking const makes the properties unchangeable.'],
      exercises: [
        { q: 'Create an object book with title and pages, and print the title.', a: 'const book = { title: "Statistics", pages: 320 };\nconsole.log(book.title);' },
        { q: 'Add a property price: 15000 to the book object and print the object.', a: 'const book = { title: "Statistics", pages: 320 };\nbook.price = 15000;\nconsole.log(book);' },
        { q: 'From [{n:"a",v:1},{n:"b",v:5}] print the values using map.', a: 'const items = [{ n: "a", v: 1 }, { n: "b", v: 5 }];\nconsole.log(items.map(i => i.v));' },
      ],
      quiz: [
        { q: 'How do you read the property age of object p?', options: ['p(age)', 'p.age', 'p->age', 'p:age'], answer: 1, why: 'Use dot notation: p.age.' },
        { q: 'What does JSON.stringify do?', options: ['Object to text', 'Text to object', 'Sorts an object', 'Deletes an object'], answer: 0, why: 'It converts a value into JSON text.' },
        { q: 'What does a missing property return?', options: ['An error', 'null', 'undefined', '0'], answer: 2, why: 'Reading a property that does not exist gives undefined.' },
      ],
      challenge: {
        prompt: 'Write a function passedNames(students) that takes an array of {name, mark} objects and returns an array with only the names of students whose mark is 50 or more.',
        starter: 'function passedNames(students) {\n  // filter, then map\n}\n',
        check: 'assert(typeof passedNames === "function", "Define a function called passedNames.");\nconst data = [{ name: "Asha", mark: 82 }, { name: "Juma", mark: 45 }, { name: "Neema", mark: 50 }];\nconst r = passedNames(data);\nassert(Array.isArray(r), "Return an array.");\nassert(JSON.stringify(r) === JSON.stringify(["Asha", "Neema"]), "Expected [\\"Asha\\",\\"Neema\\"] but got " + JSON.stringify(r));',
        hint: 'return students.filter(s => s.mark >= 50).map(s => s.name);',
        solution: 'function passedNames(students) {\n  return students.filter(s => s.mark >= 50).map(s => s.name);\n}\n',
      },
    }),

  J('strings', 'Working with text (strings)', 'Strings zina methods nyingi: length, slice, split, includes, toUpperCase na zaidi.',
    'Write a function that checks whether a word is a palindrome.',
    [
      { h: 'Length and characters', p: [
        'A string is a sequence of characters, a little like an array. length gives the number of characters (spaces included), and you read one character with its index, starting at 0. Strings are immutable: methods never change the original, they return a new string.'],
        code: `const word = "Statistics";\nconsole.log(word.length);\nconsole.log(word[0]);\nconsole.log(word[word.length - 1]);\nconsole.log(word.toUpperCase());\nconsole.log(word.toLowerCase());`,
        explain: ['"Statistics" has 10 characters; the first is S and the last is s.', 'toUpperCase and toLowerCase return new strings; word itself is unchanged.'] },
      { h: 'Searching and cutting', p: [
        'includes tells whether a piece of text is present; indexOf gives its position (or -1). slice(start, end) cuts out part of a string, where end is not included. trim removes spaces at both ends, and replace swaps one piece of text for another.'],
        code: `const s = "  University of Dar es Salaam  ";\nconst t = s.trim();\nconsole.log(t.includes("Dar"));\nconsole.log(t.indexOf("of"));\nconsole.log(t.slice(0, 10));\nconsole.log(t.replace("Dar es Salaam", "Dodoma"));`,
        explain: ['trim removes the spaces at the start and end.', 'slice(0, 10) takes characters 0 to 9: University.', 'replace gives a new text; t is not changed.'] },
      { h: 'split and join', p: [
        'split cuts a string into an array at a separator, and join does the opposite. Together they let you reverse words, count words, or clean up lists typed by users. Strings have no reverse, but arrays do: split("") makes an array of letters, reverse() flips it, join("") glues it back.'],
        code: `const csv = "Asha,Juma,Neema";\nconst names = csv.split(",");\nconsole.log(names);\nconsole.log(names.length);\nconsole.log("hello".split("").reverse().join(""));\nconsole.log("I love code".split(" ").length);`,
        explain: ['split(",") gives three names; length is 3.', 'The reverse trick prints olleh.', 'Splitting a sentence at spaces and taking the length counts the words: 3.'] },
    ], {
      mistakes: ['Expecting a string method to change the original string.', 'Forgetting that slice does not include the end index.', 'Comparing text without thinking about capital letters: "A" and "a" are different.', 'Calling length as a method: use word.length, not word.length().'],
      exercises: [
        { q: 'Print the first three letters of "Mathematics".', a: 'console.log("Mathematics".slice(0, 3));' },
        { q: 'Count the words in "learning to code is fun".', a: 'console.log("learning to code is fun".split(" ").length);' },
        { q: 'Print "hello world" with every letter in capitals.', a: 'console.log("hello world".toUpperCase());' },
      ],
      quiz: [
        { q: 'What is "Hello".slice(1, 3)?', options: ['"He"', '"el"', '"ell"', '"llo"'], answer: 1, why: 'Characters at index 1 and 2: e and l.' },
        { q: 'Which method cuts a string into an array?', options: ['join', 'split', 'slice', 'trim'], answer: 1, why: 'split divides at a separator.' },
        { q: 'Does toUpperCase change the original string?', options: ['Yes', 'No, it returns a new one', 'Only for const', 'Only for let'], answer: 1, why: 'Strings are immutable.' },
      ],
      challenge: {
        prompt: 'Write a function isPalindrome(word) that returns true when the word reads the same backwards (ignore capital letters). Example: "Level" is a palindrome.',
        starter: 'function isPalindrome(word) {\n  // compare the word with its reverse\n}\n',
        check: 'assert(typeof isPalindrome === "function", "Define a function called isPalindrome.");\nassert(isPalindrome("level") === true, "level is a palindrome.");\nassert(isPalindrome("Level") === true, "Ignore capital letters: Level is a palindrome.");\nassert(isPalindrome("radar") === true, "radar is a palindrome.");\nassert(isPalindrome("hello") === false, "hello is not a palindrome.");\nassert(isPalindrome("a") === true, "a single letter is a palindrome.");',
        hint: 'const w = word.toLowerCase();\nreturn w === w.split("").reverse().join("");',
        solution: 'function isPalindrome(word) {\n  const w = word.toLowerCase();\n  return w === w.split("").reverse().join("");\n}\n',
      },
    }),

  J('func', 'Functions: reusable code', 'Function ni kipande cha code kinachotumika tena. Ina parameters na return.',
    'Write a function that converts degrees Celsius to Fahrenheit.',
    [
      { h: 'Why functions?', p: [
        'A function is a named block of code you can run many times. It saves repeating yourself, gives a clear name to an idea, and makes a program easier to fix: change the function once and every place that uses it improves.'],
        code: `function greet(name) {\n  return "Hello, " + name + "!";\n}\nconsole.log(greet("Asha"));\nconsole.log(greet("Juma"));`,
        explain: ['function starts the definition; greet is its name; name is a parameter, a placeholder for the value you pass in.', 'return sends a value back to where the function was called.', 'Calling greet("Asha") runs the code with name set to "Asha".'] },
      { h: 'Parameters, return values and defaults', p: [
        'A function can take any number of parameters, separated by commas. The values you pass when calling are the arguments. A function without return gives back undefined. A default value is used when no argument is given. Code after a return never runs, because return ends the function.'],
        code: `function area(width, height = 1) {\n  return width * height;\n}\nconsole.log(area(4, 5));\nconsole.log(area(4));\nfunction noReturn() {\n  const x = 5;\n}\nconsole.log(noReturn());`,
        explain: ['area(4, 5) is 20. area(4) uses the default height 1, giving 4.', 'noReturn does its work but gives nothing back, so printing it shows undefined.'] },
      { h: 'Arrow functions', p: [
        'An arrow function is a shorter way to write a function, popular for small ones such as those passed to map and filter. With one expression you can skip the curly brackets and the return word.'],
        code: `const square = (x) => x * x;\nconst add = (a, b) => a + b;\nconst describe = (n) => {\n  if (n % 2 === 0) return "even";\n  return "odd";\n};\nconsole.log(square(6), add(2, 3), describe(7));\nconsole.log([1, 2, 3].map(square));`,
        explain: ['square(6) is 36. The value after => is returned automatically.', 'When the body has several lines you use { } and write return yourself, as in describe.'] },
      { h: 'Scope', p: [
        'A variable made inside a function (or any { } block, with let or const) exists only there: this is its scope. Code outside cannot see it. A function can read variables from outside, but it is cleaner to pass what it needs as parameters.'],
        code: `const school = "UDSM";\nfunction show() {\n  const secret = 42;\n  console.log(school, secret);\n}\nshow();\nconsole.log(typeof secret);`,
        explain: ['Inside show, both school (outside) and secret (inside) are visible.', 'Outside the function, secret does not exist, so typeof secret is "undefined".'] },
    ], {
      mistakes: ['Writing console.log inside the function when you need a return value.', 'Forgetting the brackets when calling: greet without () is the function itself, not its result.', 'Code written after return never runs.', 'Using a variable that was created inside another function.'],
      exercises: [
        { q: 'Write a function double(n) that returns n times 2 and print double(21).', a: 'function double(n) {\n  return n * 2;\n}\nconsole.log(double(21));' },
        { q: 'Write an arrow function isAdult(age) returning true when age is 18 or more.', a: 'const isAdult = (age) => age >= 18;\nconsole.log(isAdult(20), isAdult(15));' },
        { q: 'Write a function max2(a, b) that returns the bigger number.', a: 'function max2(a, b) {\n  return a > b ? a : b;\n}\nconsole.log(max2(3, 9));' },
      ],
      quiz: [
        { q: 'What does a function without return give back?', options: ['0', 'null', 'undefined', 'An error'], answer: 2, why: 'It returns undefined.' },
        { q: 'Which is an arrow function?', options: ['function f(x) {}', 'f = x -> x', 'const f = (x) => x', 'def f(x):'], answer: 2, why: 'Arrow functions use =>.' },
        { q: 'A variable created inside a function can be used...', options: ['Anywhere', 'Only inside that function', 'In every function', 'After the program ends'], answer: 1, why: 'It has function scope.' },
      ],
      challenge: {
        prompt: 'Write a function toFahrenheit(c) that converts Celsius to Fahrenheit using F = C × 9/5 + 32. Example: 100 gives 212.',
        starter: 'function toFahrenheit(c) {\n  // return the Fahrenheit value\n}\n',
        check: 'assert(typeof toFahrenheit === "function", "Define a function called toFahrenheit.");\nassert(toFahrenheit(0) === 32, "toFahrenheit(0) should be 32.");\nassert(toFahrenheit(100) === 212, "toFahrenheit(100) should be 212.");\nassert(toFahrenheit(-40) === -40, "toFahrenheit(-40) should be -40.");\nassert(Math.abs(toFahrenheit(37) - 98.6) < 0.001, "toFahrenheit(37) should be 98.6.");',
        hint: 'return c * 9 / 5 + 32;',
        solution: 'function toFahrenheit(c) {\n  return c * 9 / 5 + 32;\n}\n',
      },
    }),
];
