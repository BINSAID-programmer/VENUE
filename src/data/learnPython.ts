import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

const REST: LearnLesson[] = [
  L('intro', 'Introduction', 'Python ni lugha rahisi, inatumika kila mahali: data, AI, wavuti.', 'Print a sentence about why you want to learn Python.', [
    { h: 'What is Python?', p: ['Python is a programming language created by Guido van Rossum in 1991. It reads almost like English, which is why beginners love it.', 'It is used for data analysis, statistics, artificial intelligence, websites, automation and much more.'] },
    { h: 'Your first program', p: ['A program is a list of instructions. The computer follows them one by one, from top to bottom.'], code: `print("Hello, VENUE!")`, note: 'Press “Try it Yourself” to run this right here on your phone.' },
  ]),
  L('syntax', 'Syntax and indentation', 'Python inatumia nafasi (indentation) kuonyesha code iliyo ndani ya kitu.', 'Fix the indentation so both lines print.', [
    { h: 'Indentation matters', p: ['Python uses spaces at the start of a line to group code. Lines that belong together must be indented by the same amount (4 spaces is the usual choice).', 'Wrong indentation gives an IndentationError.'], code: `if 5 > 2:\n    print("Five is greater than two")\n    print("Still inside the if")\nprint("Outside the if")` },
    { h: 'Comments', p: ['Everything after # on a line is ignored by Python. Use comments to explain your code to humans.'], code: `# This line is a comment\nprint("Comments are ignored")  # even at the end of a line` },
  ]),
  L('booleans', 'Booleans and comparisons', 'True/False ndiyo msingi wa maamuzi.', 'Check whether 15 is between 10 and 20 using and.', [
    { h: 'True and False', p: ['A comparison such as 5 > 3 gives a bool. Combine with and, or, not.', 'Empty things (0, "", [], None) count as False; most other values count as True.'], code: `print(5 > 3, 5 == 3, 5 != 3)\nprint(5 > 3 and 2 > 1)\nprint(not True)\nprint(bool(0), bool("hello"), bool([]))` },
  ]),
  L('operators', 'Operators', 'Operator zinafanya kazi kwenye thamani: hesabu, kulinganisha, mantiki.', 'Use += to add 5 to a variable three times.', [
    { h: 'Assignment shortcuts', p: ['x += 3 means x = x + 3. The same works for -=, *=, /=.', 'Membership: in and not in. Identity: is checks whether two names point to the very same object.'], code: `x = 10\nx += 3\nx *= 2\nprint(x)\nprint(3 in [1, 2, 3])\nprint("z" not in "abc")` },
  ]),
  L('sets', 'Sets', 'Set haina vitu vilivyojirudia.', 'Remove duplicates from [1,2,2,3,3,3] using a set.', [
    { h: 'Unique items', p: ['A set stores each value only once and has no order. It is great for removing duplicates and for maths-style operations: union, intersection, difference.'], code: `a = {1, 2, 3, 4}\nb = {3, 4, 5}\nprint(a | b)\nprint(a & b)\nprint(a - b)\nprint(set([1, 2, 2, 3, 3, 3]))` },
  ]),
  L('dicts', 'Dictionaries', 'Dictionary huhifadhi jozi: ufunguo na thamani.', 'Build a dictionary of 3 courses and their credits, then print the total credits.', [
    { h: 'Key–value pairs', p: ['A dictionary maps keys to values. Look up by key, add or change by assigning, loop with .items().'], code: `student = {"name": "Juma", "year": 2, "gpa": 3.8}\nprint(student["name"])\nstudent["year"] = 3\nstudent["course"] = "Statistics"\nfor key, value in student.items():\n    print(key, "->", value)\nprint(student.get("age", "unknown"))` },
  ]),
  L('if', 'If … elif … else', 'Maamuzi: kama sharti ni kweli fanya hivi, vinginevyo vile.', 'Write grade boundaries A ≥ 70, B ≥ 60, C ≥ 50, else F.', [
    { h: 'Making decisions', p: ['if runs a block only when its condition is true. elif adds more conditions, else catches the rest.'], code: `marks = 68\nif marks >= 70:\n    grade = "A"\nelif marks >= 60:\n    grade = "B"\nelse:\n    grade = "C or below"\nprint(grade)` },
    { h: 'Short form', p: ['A conditional expression puts a simple if/else on one line.'], code: `age = 20\nstatus = "adult" if age >= 18 else "minor"\nprint(status)` },
  ]),
  L('match', 'Match', 'match inachagua njia kulingana na thamani (Python 3.10+).', 'Add a case for "Sat" and "Sun" that prints "Weekend".', [
    { h: 'Choosing between many cases', p: ['match compares one value against several patterns. The underscore _ catches everything else.'], code: `day = "Tue"\nmatch day:\n    case "Mon":\n        print("Start of week")\n    case "Fri":\n        print("Almost weekend")\n    case _:\n        print("Normal day")` },
  ]),
  L('while', 'While loops', 'while inarudia mradi sharti ni kweli.', 'Print the numbers 10 down to 1.', [
    { h: 'Repeat while true', p: ['A while loop repeats as long as its condition stays true. Make sure something inside changes the condition, or it will never stop.', 'break leaves the loop; continue skips to the next round.'], code: `n = 1\nwhile n <= 5:\n    print(n)\n    n += 1\nprint("done")` },
  ]),
  L('functions', 'Functions', 'Function ni code unayoitumia tena na tena.', 'Write a function that returns the average of a list.', [
    { h: 'Defining and calling', p: ['def creates a function. Parameters go in brackets; return sends a result back.', 'Call it by writing its name with brackets. Parameters can have default values.'], code: `def greet(name, greeting="Hello"):\n    return greeting + ", " + name + "!"\n\nprint(greet("Asha"))\nprint(greet("Juma", "Karibu"))` },
    { h: 'Many arguments', p: ['*args collects extra positional arguments; **kwargs collects extra named ones. A lambda is a tiny one-line function.'], code: `def total(*nums):\n    return sum(nums)\n\nprint(total(1, 2, 3, 4))\nsquare = lambda x: x * x\nprint(square(9))` },
  ]),
  L('scope', 'Scope and recursion', 'Variable ya ndani ya function haionekani nje.', 'Write a recursive function for n! (factorial).', [
    { h: 'Local and global', p: ['A variable created inside a function exists only there. Variables outside are global and can be read inside.'], code: `x = "global"\ndef f():\n    x = "local"\n    print(x)\nf()\nprint(x)` },
    { h: 'Recursion', p: ['A function can call itself. It needs a stopping case (base case) or it never ends.'], code: `def countdown(n):\n    if n == 0:\n        print("Go!")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)` },
  ]),
  L('input', 'Input and output', 'print inaonyesha; f-string inapanga maandishi vizuri.', 'Print a result line such as "Mean = 12.35" using an f-string with 2 decimals.', [
    { h: 'Formatting output', p: ['An f-string starts with f and puts values inside curly brackets. Add :.2f for two decimals.', 'To read what the user types you would use input(); it always returns text, so convert it with int() or float().'], code: `name = "Asha"\nmean = 12.3456\nprint(f"Student: {name}")\nprint(f"Mean = {mean:.2f}")\nprint(f"{7} squared is {7 ** 2}")`, note: 'input() waits for typing, so it is not available in the in-app runner. Try it on a computer.' },
  ]),
  L('errors', 'Errors and try…except', 'try/except inazuia programu isianguke.', 'Ask for a division and print a friendly message when dividing by zero.', [
    { h: 'Handling errors', p: ['When something goes wrong Python raises an exception. Wrap risky code in try and handle the problem in except, so your program keeps running.'], code: `try:\n    value = int("abc")\nexcept ValueError:\n    print("That is not a number")\n\ntry:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")\nfinally:\n    print("always runs")` },
  ]),
  L('modules', 'Modules and dates', 'Module ni faili la code unaloleta kwa import.', 'Print today’s year using the datetime module.', [
    { h: 'Importing', p: ['A module is a file of ready-made tools. Use import name, or from name import thing. Python ships with many: math, random, datetime, json, statistics.'], code: `import random\nrandom.seed(1)\nprint(random.randint(1, 10))\nprint(random.choice(["a", "b", "c"]))` },
    { h: 'Dates', p: ['datetime handles dates and times.'], code: `from datetime import date, timedelta\nd = date(2026, 11, 14)\nprint(d.year, d.month, d.day)\nprint(d + timedelta(days=30))\nprint(d.strftime("%d/%m/%Y"))` },
  ]),
  L('json', 'JSON', 'JSON ni muundo wa kuhifadhi na kutuma data.', 'Convert a dictionary with your details to JSON text and back.', [
    { h: 'Text ⇄ Python', p: ['JSON is a text format for data, used by almost every web service. json.dumps turns Python into JSON text; json.loads turns it back.'], code: `import json\ndata = {"name": "Asha", "marks": [70, 85]}\ntext = json.dumps(data)\nprint(text)\nback = json.loads(text)\nprint(back["marks"][1])` },
  ]),
  L('regex', 'RegEx (patterns)', 'RegEx hutafuta mifumo ndani ya maandishi.', 'Find all numbers in "Room 12, Floor 3".', [
    { h: 'Searching text', p: ['A regular expression describes a pattern. \\d means a digit, + means one or more, \\w a letter or digit.'], code: `import re\ntext = "Call 0762 574 073 or 0754 123 456"\nprint(re.findall(r"\\d{4}", text))\nprint(re.search(r"\\d+", text).group())\nprint(re.sub(r"\\d", "#", "ID 4521"))` },
  ]),
  L('files', 'Files', 'Kusoma na kuandika faili.', 'Write three lines to a file and read them back.', [
    { h: 'Read and write', p: ['open(name, mode) opens a file: "r" read, "w" write, "a" append. Use with so the file closes by itself.'], code: `with open("notes.txt", "w") as f:\n    f.write("line one\\n")\n    f.write("line two\\n")\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.strip())` },
  ]),
  L('oop', 'Classes and objects', 'Class ni mchoro; object ni kitu kilichotengenezwa kutoka kwake.', 'Add a method to Student that returns "Pass" if gpa ≥ 2.0.', [
    { h: 'Blueprint and object', p: ['A class describes what something has (attributes) and can do (methods). __init__ runs when you create an object; self is the object itself.'], code: `class Student:\n    def __init__(self, name, gpa):\n        self.name = name\n        self.gpa = gpa\n\n    def describe(self):\n        return f"{self.name} has GPA {self.gpa}"\n\na = Student("Asha", 4.2)\nprint(a.describe())` },
  ]),
  L('inherit', 'Inheritance', 'Class mpya inaweza kurithi kutoka kwa nyingine.', 'Create Lecturer that inherits Person and adds a department.', [
    { h: 'Reusing a class', p: ['A child class inherits everything from its parent and can add or replace behaviour. super() calls the parent.'], code: `class Person:\n    def __init__(self, name):\n        self.name = name\n    def hello(self):\n        return "Hi, I am " + self.name\n\nclass Student(Person):\n    def hello(self):\n        return super().hello() + " (student)"\n\nprint(Student("Juma").hello())` },
  ]),
  L('stats', 'Statistics with Python', 'Python hufanya takwimu: wastani, kati, mode, kiwango cha kusambaa.', 'Compute mean, median and standard deviation of your own 8 marks.', [
    { h: 'Mean, median, mode', p: ['The statistics module gives the common summaries. Mean is the average, median is the middle value, mode is the most frequent.'], code: `import statistics as st\ndata = [4, 8, 6, 5, 3, 8, 9, 5, 8]\nprint("mean  ", st.mean(data))\nprint("median", st.median(data))\nprint("mode  ", st.mode(data))` },
    { h: 'Spread', p: ['Variance and standard deviation measure how far values spread around the mean. Use pstdev for a whole population and stdev for a sample.'], code: `import statistics as st\ndata = [2, 4, 4, 4, 5, 5, 7, 9]\nprint("pvariance", st.pvariance(data))\nprint("pstdev   ", st.pstdev(data))\nprint("stdev    ", round(st.stdev(data), 4))\nprint("quartiles", st.quantiles(data, n=4))` },
  ]),
  L('linreg', 'Simple linear regression', 'Regression hupata mstari unaoelezea uhusiano wa x na y.', 'Predict y for x = 7 using the line.', [
    { h: 'Fitting a line', p: ['Linear regression finds the line y = a + b·x that best fits the points. statistics.linear_regression does it in one call.'], code: `import statistics as st\nx = [1, 2, 3, 4, 5]\ny = [2.1, 3.9, 6.2, 7.8, 10.1]\nfit = st.linear_regression(x, y)\nprint("slope    ", round(fit.slope, 3))\nprint("intercept", round(fit.intercept, 3))\nprint("y at x=6 ", round(fit.intercept + fit.slope * 6, 2))\nprint("corr     ", round(st.correlation(x, y), 4))` },
  ]),
  L('pip', 'PIP and virtual environments', 'pip inaweka maktaba za ziada; venv inatenganisha miradi.', 'Write the commands to create a venv called venue-env and install numpy.', [
    { h: 'Installing packages', p: ['pip is Python’s package installer. On your computer you type these in the terminal:', 'pip install numpy pandas matplotlib', 'A virtual environment keeps each project’s packages separate. Create one with: python -m venv myenv', 'Activate it with: source myenv/bin/activate (Linux/Mac) or myenv\\Scripts\\activate (Windows).'], note: 'These are terminal commands, so there is nothing to run inside the app. Practise them on a computer.' },
  ]),
];

import { PYTHON_CORE } from './learnPythonCore';
import { PYTHON_QUIZ } from './learnPythonQuiz';
import { EXTRA_SECTIONS, OWN_LESSONS } from './learnPythonExtras';

import { PYTHON_FLOW } from './learnPythonFlow';
import { PYTHON_CHAPTER_EXTRAS as X } from './learnPythonChapters';

const byId = (() => {
  const m: Record<string, LearnLesson> = {};
  for (const l of [...REST, ...PYTHON_CORE, ...PYTHON_FLOW, ...Object.values(X), ...Object.values(OWN_LESSONS)]) m[l.id.replace(/^py-/, '')] = l;
  return m;
})();

/** Main topics (chapters), each holding its subtopics in teaching order. */
const CHAPTERS: Array<{ title: string; ids: string[] }> = [
  { title: '1. Getting Started', ids: ['setup', 'install', 'intro', 'syntax', 'debug'] },
  { title: '2. Variables and Simple Data Types', ids: ['variables', 'strings1', 'strings2', 'numbers', 'comments', 'zen'] },
  { title: '3. Introducing Lists', ids: ['lists1', 'lists2', 'indexerr'] },
  { title: '4. Working with Lists', ids: ['loops', 'indenterr', 'ranges', 'slices', 'tuples', 'style'] },
  { title: '5. if Statements', ids: ['booleans', 'if1', 'if2', 'iflists', 'match'] },
  { title: '6. Dictionaries', ids: ['dicts1', 'dicts2'] },
  { title: '7. User Input and while Loops', ids: ['input', 'while1', 'whilelists'] },
  { title: '8. Functions', ids: ['functions', 'scope'] },
  { title: '9. Classes', ids: ['oop', 'inherit'] },
  { title: '10. Files, Exceptions and JSON', ids: ['files', 'errors', 'json'] },
  { title: '11. More Tools', ids: ['operators', 'sets', 'modules', 'regex', 'stats', 'linreg', 'pip'] },
];

export const PYTHON_LESSONS: LearnLesson[] = CHAPTERS.flatMap((c) =>
  c.ids.map((id) => {
    const l = byId[id];
    if (!l) throw new Error('Missing Python lesson: ' + id);
    const extra = EXTRA_SECTIONS[id] || [];
    return { ...l, chapter: c.title, sections: [...(l.sections || []), ...extra], ...(PYTHON_QUIZ[l.id] || {}) };
  })
);
