import type { LearnLesson } from './learnLessons';

type Sec = { h: string; p: string[]; code?: string; note?: string };
const L = (id: string, title: string, sw: string, task: string, sections: Sec[]): LearnLesson => ({
  id: `py-${id}`,
  title,
  sw,
  task,
  sections,
  body: sections[0].p,
  code: sections.find((s) => s.code)?.code || '',
});

export const PYTHON_LESSONS: LearnLesson[] = [
  L('intro', 'Introduction', 'Python ni lugha rahisi, inatumika kila mahali: data, AI, wavuti.', 'Print a sentence about why you want to learn Python.', [
    { h: 'What is Python?', p: ['Python is a programming language created by Guido van Rossum in 1991. It reads almost like English, which is why beginners love it.', 'It is used for data analysis, statistics, artificial intelligence, websites, automation and much more.'] },
    { h: 'Your first program', p: ['A program is a list of instructions. The computer follows them one by one, from top to bottom.'], code: `print("Hello, VENUE!")`, note: 'Press “Try it Yourself” to run this right here on your phone.' },
  ]),
  L('syntax', 'Syntax and indentation', 'Python inatumia nafasi (indentation) kuonyesha code iliyo ndani ya kitu.', 'Fix the indentation so both lines print.', [
    { h: 'Indentation matters', p: ['Python uses spaces at the start of a line to group code. Lines that belong together must be indented by the same amount (4 spaces is the usual choice).', 'Wrong indentation gives an IndentationError.'], code: `if 5 > 2:\n    print("Five is greater than two")\n    print("Still inside the if")\nprint("Outside the if")` },
    { h: 'Comments', p: ['Everything after # on a line is ignored by Python. Use comments to explain your code to humans.'], code: `# This line is a comment\nprint("Comments are ignored")  # even at the end of a line` },
  ]),
  L('variables', 'Variables', 'Variable ni jina linalohifadhi thamani.', 'Create variables for your name, year of study and GPA, then print them in one sentence.', [
    { h: 'Creating variables', p: ['A variable is a name that points to a value. You create it by assigning with =. There is no need to declare a type first.', 'Names may contain letters, digits and underscores, cannot start with a digit, and are case-sensitive: age and Age are different.'], code: `name = "Asha"\nyear = 2\ngpa = 4.1\nprint(name, year, gpa)` },
    { h: 'Many at once', p: ['You can assign several variables in one line, or give the same value to several names.'], code: `a, b, c = 1, 2, 3\nx = y = z = 0\nprint(a, b, c, x, y, z)` },
  ]),
  L('types', 'Data types', 'Aina kuu: int, float, str, bool, list, dict.', 'Use type() on five different values and print the results.', [
    { h: 'Built-in types', p: ['Every value has a type. The most common are int (whole numbers), float (decimals), str (text), bool (True/False), list, tuple, set and dict.', 'type() tells you the type of a value.'], code: `print(type(10))\nprint(type(3.14))\nprint(type("hi"))\nprint(type(True))\nprint(type([1, 2]))\nprint(type({"a": 1}))` },
  ]),
  L('numbers', 'Numbers and maths', 'Python inaweza kufanya hesabu zote za kawaida.', 'Compute the area of a circle with radius 7 using math.pi.', [
    { h: 'Arithmetic', p: ['+ add, - subtract, * multiply, / divide (always gives a float), // floor division, % remainder, ** power.'], code: `print(7 + 3, 7 - 3, 7 * 3)\nprint(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(2 ** 10)` },
    { h: 'The math module', p: ['import brings in extra tools. The math module has sqrt, pi, sin, cos, log and more.'], code: `import math\nprint(math.sqrt(144))\nprint(math.pi)\nprint(math.factorial(5))\nprint(round(3.14159, 2))` },
  ]),
  L('casting', 'Casting (changing type)', 'int(), float(), str() hubadilisha aina ya thamani.', 'Convert the string "42" to a number and add 8.', [
    { h: 'Converting types', p: ['Use int(), float() and str() to convert between types. This is important when you read text and need to calculate with it.'], code: `a = int("42")\nb = float("3.5")\nc = str(100)\nprint(a + 8, b * 2, c + " marks")` },
  ]),
  L('strings', 'Strings (text)', 'String ni maandishi; ina njia nyingi: upper, replace, split.', 'Take "  data science  " and print it clean, in capital letters.', [
    { h: 'Basics', p: ['Text goes in single or double quotes. Triple quotes allow several lines. len() gives the length.'], code: `s = "Statistics"\nprint(len(s))\nprint(s[0], s[-1])\nprint(s[0:4])\nprint("stat" in s.lower())` },
    { h: 'Useful methods', p: ['Strings have methods: upper(), lower(), strip(), replace(), split(), join(), find(), startswith().', 'Strings never change in place; methods return a new string.'], code: `t = "  Hello, World  "\nprint(t.strip())\nprint(t.upper())\nprint(t.replace("World", "VENUE"))\nprint("a,b,c".split(","))\nprint("-".join(["x", "y", "z"]))` },
  ]),
  L('booleans', 'Booleans and comparisons', 'True/False ndiyo msingi wa maamuzi.', 'Check whether 15 is between 10 and 20 using and.', [
    { h: 'True and False', p: ['A comparison such as 5 > 3 gives a bool. Combine with and, or, not.', 'Empty things (0, "", [], None) count as False; most other values count as True.'], code: `print(5 > 3, 5 == 3, 5 != 3)\nprint(5 > 3 and 2 > 1)\nprint(not True)\nprint(bool(0), bool("hello"), bool([]))` },
  ]),
  L('operators', 'Operators', 'Operator zinafanya kazi kwenye thamani: hesabu, kulinganisha, mantiki.', 'Use += to add 5 to a variable three times.', [
    { h: 'Assignment shortcuts', p: ['x += 3 means x = x + 3. The same works for -=, *=, /=.', 'Membership: in and not in. Identity: is checks whether two names point to the very same object.'], code: `x = 10\nx += 3\nx *= 2\nprint(x)\nprint(3 in [1, 2, 3])\nprint("z" not in "abc")` },
  ]),
  L('lists', 'Lists', 'List ni mkusanyiko wa vitu unaoweza kubadilishwa.', 'Make a list of 5 marks, sort it and print the highest.', [
    { h: 'Creating and indexing', p: ['A list keeps items in order and can be changed. Index starts at 0; negative indexes count from the end.'], code: `marks = [55, 72, 40, 88]\nprint(marks[0], marks[-1])\nprint(marks[1:3])\nmarks.append(91)\nmarks.remove(40)\nprint(marks, len(marks))` },
    { h: 'Sorting and comprehension', p: ['sort() sorts in place; sorted() returns a new list. A list comprehension builds a list in one line.'], code: `nums = [5, 2, 9, 1]\nprint(sorted(nums))\nprint(sorted(nums, reverse=True))\nsquares = [n ** 2 for n in nums]\nprint(squares)\nprint([n for n in nums if n > 2])` },
  ]),
  L('tuples', 'Tuples', 'Tuple ni kama list lakini haibadiliki.', 'Unpack a tuple (x, y) into two variables and print their sum.', [
    { h: 'Fixed collections', p: ['A tuple uses round brackets and cannot be changed after creation. Good for things that should stay fixed, like coordinates.'], code: `point = (3, 4)\nx, y = point\nprint(x, y)\nprint(point[0])\nprint((x ** 2 + y ** 2) ** 0.5)` },
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
  L('for', 'For loops', 'for inapitia kila kitu kwenye mkusanyiko.', 'Print the multiplication table of 7 up to 7 × 10.', [
    { h: 'Loop over items', p: ['for visits every item of a list, string, tuple, dictionary or range.'], code: `for fruit in ["mango", "banana", "pawpaw"]:\n    print(fruit)\nfor ch in "VENUE":\n    print(ch, end=" ")` },
    { h: 'range()', p: ['range(n) counts from 0 to n-1. range(a, b) starts at a; range(a, b, step) jumps by step.', 'enumerate() gives both position and item.'], code: `for i in range(1, 6):\n    print(i, i ** 2)\nfor pos, name in enumerate(["Asha", "Juma"], start=1):\n    print(pos, name)` },
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
