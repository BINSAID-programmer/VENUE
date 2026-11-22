import type { LearnLesson } from './learnLessons';
import { J } from './learnJsA';

/** Chapter 7: modern JavaScript, classes and asynchronous code. */
export const JS_D: LearnLesson[] = [
  J('modern', 'Modern JavaScript: spread, destructuring, Set and Map', 'Spread (...), destructuring, ?. na ?? hufanya code fupi na salama zaidi.',
    'Remove duplicates from a list and count how many times each word appears.',
    [
      { h: 'Spread and rest (...)', p: [
        'Three dots have two jobs. Spread (...list) opens an array or object into separate items, which is perfect for copying or merging without changing the original. Rest (...others) does the opposite in a function parameter or a destructuring: it gathers the remaining items into one array.'],
        code: `const a = [1, 2, 3];\nconst b = [...a, 4, 5];\nconsole.log(b);\nconst base = { name: "Asha", year: 1 };\nconst updated = { ...base, year: 2, city: "Dar" };\nconsole.log(updated);\nfunction total(...nums) {\n  return nums.reduce((s, n) => s + n, 0);\n}\nconsole.log(total(1, 2, 3, 4));`,
        explain: ['[...a, 4, 5] makes a new array; a is not changed.', '{ ...base, year: 2 } copies the object and then replaces year. Later values win.', 'In total(...nums) the rest parameter collects any number of arguments into an array.'] },
      { h: 'Destructuring', p: [
        'Destructuring pulls values out of arrays and objects into variables in one line. For arrays the position matters; for objects the name matters. You can give a default value, and rename with a colon.'],
        code: `const [first, second] = ["Asha", "Juma", "Neema"];\nconsole.log(first, second);\nconst student = { name: "Neema", mark: 81, city: "Arusha" };\nconst { name, mark, grade = "?" } = student;\nconsole.log(name, mark, grade);\nconst { city: town } = student;\nconsole.log(town);\nfunction show({ name, mark }) {\n  return name + ": " + mark;\n}\nconsole.log(show(student));`,
        explain: ['first and second take the first two array items.', 'grade is not in the object, so its default "?" is used.', 'city: town renames the variable to town.', 'A function can destructure its parameter directly, which is neat for objects.'] },
      { h: 'Safer access: ?. and ??', p: [
        'Reading a property of undefined crashes the program. The optional chaining operator ?. stops and gives undefined instead of crashing. The nullish operator ?? gives a fallback only when the left side is null or undefined. Unlike ||, it keeps 0 and empty text.'],
        code: `const user = { profile: { city: "Dodoma" } };\nconsole.log(user.profile?.city);\nconsole.log(user.address?.street);\nconst count = 0;\nconsole.log(count || 10);\nconsole.log(count ?? 10);\nconst nick = null;\nconsole.log(nick ?? "no nickname");`,
        explain: ['user.address is undefined, so ?. returns undefined instead of an error.', 'count || 10 gives 10 because 0 is falsy, which is often a bug.', 'count ?? 10 keeps the real 0. Use ?? when 0 or "" are valid values.'] },
      { h: 'Set and Map', p: [
        'A Set stores unique values only: adding the same value twice keeps one. A Map stores key-value pairs like an object, but keys can be any type and it remembers insertion order. Together with spread they solve common jobs very quickly.'],
        code: `const marks = [50, 70, 50, 90, 70];\nconst unique = [...new Set(marks)];\nconsole.log(unique);\nconst counts = new Map();\nfor (const w of ["a", "b", "a", "c", "a"]) {\n  counts.set(w, (counts.get(w) || 0) + 1);\n}\nconsole.log(counts.get("a"), counts.size);\nconsole.log([...counts.entries()]);`,
        explain: ['new Set(marks) drops the duplicates, and [...set] turns it back into an array.', 'counts.get(w) is undefined the first time, so || 0 starts the count at zero.', 'This is the standard "count how many times" pattern.'] },
    ], {
      mistakes: ['Thinking spread makes a deep copy: nested objects are still shared.', 'Using || when 0 or empty text is a valid value (use ??).', 'Destructuring an undefined value, which crashes; give a default or use ?.', 'Using an object as a Map key and expecting two equal-looking objects to match.'],
      exercises: [
        { q: 'Merge [1, 2] and [3, 4] into one new array using spread and print it.', a: 'console.log([...[1, 2], ...[3, 4]]);' },
        { q: 'From the object { a: 1, b: 2 } take a and b with destructuring and print their sum.', a: 'const { a, b } = { a: 1, b: 2 };\nconsole.log(a + b);' },
        { q: 'Print the length of the list with duplicates removed: [1, 1, 2, 3, 3].', a: 'console.log(new Set([1, 1, 2, 3, 3]).size);' },
      ],
      quiz: [
        { q: 'What does [...new Set([1, 1, 2])] give?', options: ['[1, 1, 2]', '[1, 2]', '[2]', 'Error'], answer: 1, why: 'A Set keeps unique values.' },
        { q: 'What is 0 ?? 5?', options: ['5', '0', 'null', 'undefined'], answer: 1, why: '?? only replaces null and undefined.' },
        { q: 'What does user?.address?.street do when address is missing?', options: ['Crashes', 'Returns undefined', 'Returns null', 'Returns ""'], answer: 1, why: 'Optional chaining stops safely.' },
      ],
      challenge: {
        prompt: 'Write a function wordCount(words) that takes an array of words and returns an object with how many times each word appears. Example: ["a","b","a"] gives { a: 2, b: 1 }.',
        starter: 'function wordCount(words) {\n  // return an object like { a: 2, b: 1 }\n}\n',
        check: 'assert(typeof wordCount === "function", "Define a function called wordCount.");\nconst r = wordCount(["a", "b", "a", "c", "a"]);\nassert(r && typeof r === "object", "Return an object.");\nassert(r.a === 3 && r.b === 1 && r.c === 1, "Expected { a: 3, b: 1, c: 1 } but got " + JSON.stringify(r));\nassert(JSON.stringify(wordCount([])) === "{}", "An empty list should give {}.");',
        hint: 'const counts = {};\nfor (const w of words) counts[w] = (counts[w] || 0) + 1;\nreturn counts;',
        solution: 'function wordCount(words) {\n  const counts = {};\n  for (const w of words) counts[w] = (counts[w] || 0) + 1;\n  return counts;\n}\n',
      },
    }),

  J('classes', 'Classes: blueprints for objects', 'Class ni mchoro wa kutengeneza object nyingi zenye data na methods zinazofanana.',
    'Build a BankAccount class with deposit, withdraw and a balance that never goes negative.',
    [
      { h: 'Why classes?', p: [
        'Sometimes you need many objects of the same kind: many students, many accounts, many products. A class is a blueprint. It says what data each object holds and what actions (methods) it can do. Each object made from the class is called an instance, and you create one with the new keyword.'],
        code: `class Student {\n  constructor(name, mark) {\n    this.name = name;\n    this.mark = mark;\n  }\n  passed() {\n    return this.mark >= 50;\n  }\n  describe() {\n    return this.name + " scored " + this.mark;\n  }\n}\nconst s1 = new Student("Asha", 82);\nconst s2 = new Student("Juma", 41);\nconsole.log(s1.describe(), s1.passed());\nconsole.log(s2.describe(), s2.passed());`,
        explain: ['constructor runs once when you write new Student(...) and sets up the data.', 'this means "the object being worked on", so this.mark is that student\'s mark.', 'Methods are written without the word function, and every instance can use them.'] },
      { h: 'Changing state safely', p: [
        'A method can change the data of its own object. Put the rules inside the class so nobody can break them by accident: for example a balance that never goes below zero. Methods that return this can be chained.'],
        code: `class Counter {\n  constructor() {\n    this.value = 0;\n  }\n  add(n = 1) {\n    this.value += n;\n    return this;\n  }\n  reset() {\n    this.value = 0;\n    return this;\n  }\n}\nconst c = new Counter();\nc.add().add(5).add();\nconsole.log(c.value);\nc.reset();\nconsole.log(c.value);`,
        explain: ['Each method returns this, so calls can be chained: c.add().add(5).add().', '1 + 5 + 1 = 7. reset sets the value back to 0.'] },
      { h: 'Inheritance', p: [
        'A class can extend another class to reuse its code and add or change behaviour. The child calls super(...) to run the parent constructor. Use this when one thing really is a kind of another thing, such as a GraduateStudent being a Student.'],
        code: `class Person {\n  constructor(name) {\n    this.name = name;\n  }\n  hello() {\n    return "Hi, I am " + this.name;\n  }\n}\nclass Lecturer extends Person {\n  constructor(name, course) {\n    super(name);\n    this.course = course;\n  }\n  hello() {\n    return super.hello() + " and I teach " + this.course;\n  }\n}\nconsole.log(new Person("Asha").hello());\nconsole.log(new Lecturer("Dr. Juma", "Statistics").hello());`,
        explain: ['Lecturer gets everything from Person and adds a course.', 'super(name) runs the Person constructor; super.hello() calls the parent version of the method.'] },
    ], {
      mistakes: ['Forgetting new when creating an object.', 'Forgetting this. inside a method: name alone is not this.name.', 'Using super before calling super(...) in a child constructor.', 'Putting commas between methods in a class (they are not allowed).'],
      exercises: [
        { q: 'Create a class Rectangle with width and height and a method area(). Print the area of a 3 by 4 rectangle.', a: 'class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  area() {\n    return this.width * this.height;\n  }\n}\nconsole.log(new Rectangle(3, 4).area());' },
        { q: 'Add a method perimeter() to Rectangle and print it for 3 by 4.', a: 'class Rectangle {\n  constructor(width, height) {\n    this.width = width;\n    this.height = height;\n  }\n  perimeter() {\n    return 2 * (this.width + this.height);\n  }\n}\nconsole.log(new Rectangle(3, 4).perimeter());' },
        { q: 'Make class Dog extend class Animal and print the name of a Dog.', a: 'class Animal {\n  constructor(name) {\n    this.name = name;\n  }\n}\nclass Dog extends Animal {}\nconsole.log(new Dog("Rex").name);' },
      ],
      quiz: [
        { q: 'What does the constructor do?', options: ['Deletes an object', 'Sets up a new object', 'Prints text', 'Imports a file'], answer: 1, why: 'It runs when you create an instance with new.' },
        { q: 'What does this mean inside a method?', options: ['The class', 'The current object', 'The window', 'Nothing'], answer: 1, why: 'this is the object the method is called on.' },
        { q: 'Which keyword makes a class inherit from another?', options: ['inherits', 'extends', 'from', 'super'], answer: 1, why: 'class B extends A.' },
      ],
      challenge: {
        prompt: 'Create a class BankAccount. It starts with balance 0. deposit(n) adds money, withdraw(n) removes money only if there is enough (otherwise it leaves the balance unchanged and returns false; on success returns true).',
        starter: 'class BankAccount {\n  // constructor, deposit(n), withdraw(n)\n}\n',
        check: 'assert(typeof BankAccount === "function", "Define a class called BankAccount.");\nconst a = new BankAccount();\nassert(a.balance === 0, "A new account must start with balance 0.");\na.deposit(100);\nassert(a.balance === 100, "After deposit(100) the balance should be 100.");\nassert(a.withdraw(30) === true && a.balance === 70, "withdraw(30) should return true and leave 70.");\nassert(a.withdraw(500) === false && a.balance === 70, "withdraw(500) should return false and not change the balance.");\nconst b = new BankAccount();\nassert(b.balance === 0, "Each account has its own balance.");',
        hint: 'constructor() { this.balance = 0; }\nwithdraw(n) { if (n > this.balance) return false; this.balance -= n; return true; }',
        solution: 'class BankAccount {\n  constructor() {\n    this.balance = 0;\n  }\n  deposit(n) {\n    this.balance += n;\n  }\n  withdraw(n) {\n    if (n > this.balance) return false;\n    this.balance -= n;\n    return true;\n  }\n}\n',
      },
    }),

  J('async', 'Asynchronous JavaScript: timers, promises and async/await', 'Baadhi ya kazi huchukua muda (mtandao, timer). Promise na async/await huzisimamia bila kusimamisha ukurasa.',
    'Write an async function that waits and then returns a value.',
    [
      { h: 'Why asynchronous?', p: [
        'Some work takes time: loading data from the internet, reading a file, waiting for a timer. If JavaScript stopped and waited, the whole page would freeze. Instead it starts the work, carries on with the rest of the code, and comes back when the result is ready. This is called asynchronous code.'],
        code: `console.log("1. start");\nsetTimeout(() => {\n  console.log("3. after 100 ms");\n}, 100);\nconsole.log("2. end of the code");`,
        explain: ['setTimeout runs its function later, after the delay, and does not block.', 'So the order is 1, 2, 3 even though the timer was written in the middle.'] },
      { h: 'Promises', p: [
        'A promise is an object that stands for a value that is not ready yet. It is pending at first, then either fulfilled with a value or rejected with an error. You attach what to do next with .then(), and handle errors with .catch().'],
        code: `function wait(ms, value) {\n  return new Promise((resolve) => {\n    setTimeout(() => resolve(value), ms);\n  });\n}\nwait(50, "first").then((v) => {\n  console.log(v);\n  return wait(50, "second");\n}).then((v) => {\n  console.log(v);\n}).catch((e) => console.log("error", e));`,
        explain: ['new Promise gets a resolve function; calling it fulfils the promise with a value.', 'Each .then runs when the previous step finishes, and returning another promise makes the chain wait for it.', '.catch at the end handles an error from any step.'] },
      { h: 'async and await', p: [
        'async/await lets you write promise code that looks like normal top-to-bottom code. An async function always returns a promise. Inside it, await pauses that function (not the page) until a promise is ready and gives you its value. Wrap awaits in try/catch to handle errors.'],
        code: `function wait(ms, value) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms));\n}\nasync function run() {\n  const a = await wait(30, 10);\n  const b = await wait(30, 20);\n  console.log("sum", a + b);\n}\nrun();\nasync function risky() {\n  try {\n    throw new Error("network down");\n  } catch (e) {\n    console.log("caught:", e.message);\n  }\n}\nrisky();`,
        explain: ['await wait(30, 10) gives the number 10 after 30 ms, so a is 10, not a promise.', 'The code reads in order but never blocks the page.', 'try/catch catches errors thrown inside the async function.'] },
      { h: 'Doing many things at once', p: [
        'Awaiting one after another is slow when the tasks do not depend on each other. Promise.all starts them together and waits until all are done, giving an array of results in the same order. With fetch, the same ideas load data from a server: const res = await fetch(url); const data = await res.json(). (Your editor here has no internet access, so we practise with timers.)'],
        code: `function wait(ms, value) {\n  return new Promise((resolve) => setTimeout(() => resolve(value), ms));\n}\nasync function main() {\n  const results = await Promise.all([\n    wait(60, "A"),\n    wait(20, "B"),\n    wait(40, "C")\n  ]);\n  console.log(results);\n}\nmain();`,
        explain: ['The three timers run at the same time, so the total wait is about 60 ms, not 120.', 'The results keep the original order [A, B, C], not the order they finished.'] },
    ], {
      mistakes: ['Forgetting await: you get a pending promise instead of the value.', 'Using await in a normal function: it must be inside an async function.', 'Not handling errors: a rejected promise with no catch fails silently or crashes.', 'Awaiting independent tasks one by one when Promise.all would be faster.'],
      exercises: [
        { q: 'Print "later" after 50 milliseconds using setTimeout.', a: 'setTimeout(() => console.log("later"), 50);' },
        { q: 'Create a promise that resolves with 42 and print the value with then.', a: 'new Promise((resolve) => resolve(42)).then((v) => console.log(v));' },
        { q: 'Write an async function that awaits Promise.resolve(7) and prints it, then call it.', a: 'async function show() {\n  const v = await Promise.resolve(7);\n  console.log(v);\n}\nshow();' },
      ],
      quiz: [
        { q: 'What does an async function always return?', options: ['undefined', 'A promise', 'A string', 'An array'], answer: 1, why: 'Its result is wrapped in a promise.' },
        { q: 'What does await do?', options: ['Freezes the whole page', 'Pauses only that async function until the promise is ready', 'Deletes the promise', 'Runs code twice'], answer: 1, why: 'The rest of the page keeps running.' },
        { q: 'When is Promise.all useful?', options: ['To run tasks one by one', 'To run independent tasks together', 'To cancel a promise', 'To sort an array'], answer: 1, why: 'It waits for all of them in parallel.' },
      ],
      challenge: {
        prompt: 'Write an async function slowDouble(n) that waits about 20 milliseconds (use setTimeout inside a Promise) and then returns n * 2.',
        starter: 'async function slowDouble(n) {\n  // wait ~20 ms, then return n * 2\n}\n',
        check: 'assert(typeof slowDouble === "function", "Define an async function called slowDouble.");\nconst t0 = Date.now();\nconst p = slowDouble(21);\nassert(p && typeof p.then === "function", "slowDouble must return a promise (use the async keyword).");\nconst r = await p;\nassert(r === 42, "slowDouble(21) should give 42 but gave " + r);\nassert(Date.now() - t0 >= 15, "Wait about 20 ms before returning (use setTimeout in a promise).");\nassert((await slowDouble(5)) === 10, "slowDouble(5) should give 10.");',
        hint: 'await new Promise((resolve) => setTimeout(resolve, 20));\nreturn n * 2;',
        solution: 'async function slowDouble(n) {\n  await new Promise((resolve) => setTimeout(resolve, 20));\n  return n * 2;\n}\n',
      },
    }),
];
