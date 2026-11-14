import type { LearnLesson } from './learnLessons';

type Extra = Pick<LearnLesson, 'quiz' | 'challenge'>;

/** Quiz questions and auto-checked challenges, keyed by lesson id. */
export const PYTHON_QUIZ: Record<string, Extra> = {
  'py-variables': {
    quiz: [
      { q: 'Which name is a valid Python variable name?', options: ['2nd_year', 'my score', 'total_marks', 'class'], answer: 2, why: 'Names cannot start with a digit (2nd_year), contain spaces (my score) or be keywords (class).' },
      { q: 'What does this print?\n\nx, y = 1, 2\nx, y = y, x\nprint(x, y)', options: ['1 2', '2 1', '2 2', '1 1'], answer: 1, why: 'The swap exchanges the two values, so x becomes 2 and y becomes 1.' },
      { q: 'What does a single = do in Python?', options: ['Compares two values', 'Stores a value in a name', 'Adds two numbers', 'Prints a value'], answer: 1, why: '= is assignment. To compare you will use ==.' },
    ],
    challenge: {
      prompt: 'Create variables name (text) and year (number) for yourself, then create a variable sentence that holds the text "<name> is in year <year>". Use your own values.',
      starter: 'name = \nyear = \nsentence = ',
      check: 'assert isinstance(name, str) and name, "name must be some text"\nassert isinstance(year, int), "year must be a whole number"\nassert sentence == f"{name} is in year {year}", "sentence must be exactly: name is in year number"',
      hint: 'Use an f-string: sentence = f"{name} is in year {year}"',
      solution: 'name = "Mussa"\nyear = 1\nsentence = f"{name} is in year {year}"\nprint(sentence)',
    },
  },
  'py-strings1': {
    quiz: [
      { q: 'What is "python".title()?', options: ['"python"', '"PYTHON"', '"Python"', '"pYTHON"'], answer: 2, why: 'title() makes the first letter of each word a capital.' },
      { q: 'If word = "Python", what is word[-1]?', options: ['"P"', '"n"', '"o"', 'An error'], answer: 1, why: 'Index -1 is the last character.' },
      { q: 'Why does "Age: " + 20 fail?', options: ['Strings cannot have a colon', 'You cannot add a string and a number', '20 is too big', 'Quotes are wrong'], answer: 1, why: 'Python will not mix text and numbers with +. Use str(20) or an f-string.' },
    ],
    challenge: {
      prompt: 'Given the text in variable raw, create clean: the text with no spaces at both ends, written in Title Case.',
      starter: 'raw = "   dar es salaam  "\nclean = ',
      check: 'assert clean == "Dar Es Salaam", "clean should be exactly: Dar Es Salaam"',
      hint: 'Chain two methods: raw.strip().title()',
      solution: 'raw = "   dar es salaam  "\nclean = raw.strip().title()\nprint(clean)',
    },
  },
  'py-strings2': {
    quiz: [
      { q: 'What does f"{3 * 4}" give?', options: ['"3 * 4"', '"12"', '"34"', 'An error'], answer: 1, why: 'Anything inside { } is calculated, so you get 12.' },
      { q: 'Which format shows 1234.5 as 1,234.50?', options: ['{n:.2f}', '{n:,.2f}', '{n:,}', '{n:2f}'], answer: 1, why: ':,.2f means thousands separator plus two decimals.' },
      { q: 'What does "  yes ".strip() == "yes" give?', options: ['False', 'True', 'An error', 'None'], answer: 1, why: 'strip() removes the spaces at both ends.' },
    ],
    challenge: {
      prompt: 'Variables name = "Asha" and mark = 78.456 are given. Build the variable line so that it equals exactly: Asha scored 78.46',
      starter: 'name = "Asha"\nmark = 78.456\nline = ',
      check: 'assert line == "Asha scored 78.46", "line should be exactly: Asha scored 78.46 (got: " + str(line) + ")"',
      hint: 'f"{name} scored {mark:.2f}"',
      solution: 'name = "Asha"\nmark = 78.456\nline = f"{name} scored {mark:.2f}"\nprint(line)',
    },
  },
  'py-numbers': {
    quiz: [
      { q: 'What is 17 // 5?', options: ['3.4', '3', '2', '4'], answer: 1, why: '// gives the whole number of times 5 fits in 17.' },
      { q: 'What is 2 + 3 * 4 ?', options: ['20', '14', '24', '9'], answer: 1, why: 'Multiplication is done before addition.' },
      { q: 'What does int(3.99) give?', options: ['4', '3', '3.99', '3.0'], answer: 1, why: 'int() cuts the decimals; it does not round.' },
      { q: 'Which test is True for every even number n?', options: ['n / 2 == 0', 'n % 2 == 0', 'n // 2 == 0', 'n ** 2 == 0'], answer: 1, why: 'An even number leaves remainder 0 when divided by 2.' },
    ],
    challenge: {
      prompt: 'Variables total_seconds = 3725 is given. Create hours, minutes and seconds so that they represent the same time (3725 s = 1 h 2 min 5 s). Use // and %.',
      starter: 'total_seconds = 3725\nhours = \nminutes = \nseconds = ',
      check: 'assert (hours, minutes, seconds) == (1, 2, 5), "expected 1 hour, 2 minutes, 5 seconds"',
      hint: 'hours = total_seconds // 3600; then work with the remainder: rest = total_seconds % 3600',
      solution: 'total_seconds = 3725\nhours = total_seconds // 3600\nrest = total_seconds % 3600\nminutes = rest // 60\nseconds = rest % 60\nprint(hours, minutes, seconds)',
    },
  },
  'py-lists1': {
    quiz: [
      { q: 'What is the index of the first item in a list?', options: ['1', '0', '-1', 'It depends'], answer: 1, why: 'Python counts from zero.' },
      { q: 'x = [1, 2, 3]; y = x.append(4). What is y?', options: ['[1, 2, 3, 4]', '4', 'None', 'An error'], answer: 2, why: 'append changes the list and returns None.' },
      { q: 'Which removes the item with the value "b"?', options: ['del items["b"]', 'items.pop("b")', 'items.remove("b")', 'items.delete("b")'], answer: 2, why: 'remove(value) removes the first match.' },
    ],
    challenge: {
      prompt: 'Start with fruits = ["mango", "banana", "pawpaw"]. Add "orange" at the end, insert "apple" at the start, then remove "banana".',
      starter: 'fruits = ["mango", "banana", "pawpaw"]\n',
      check: 'assert fruits == ["apple", "mango", "pawpaw", "orange"], "fruits should be [apple, mango, pawpaw, orange], got " + str(fruits)',
      hint: 'Use append(), insert(0, ...) and remove().',
      solution: 'fruits = ["mango", "banana", "pawpaw"]\nfruits.append("orange")\nfruits.insert(0, "apple")\nfruits.remove("banana")\nprint(fruits)',
    },
  },
  'py-lists2': {
    quiz: [
      { q: 'Which keeps the original list unchanged?', options: ['marks.sort()', 'sorted(marks)', 'marks.reverse()', 'del marks[0]'], answer: 1, why: 'sorted() returns a new list; sort() changes the list itself.' },
      { q: 'What does sorted([3, 1, 2], reverse=True) return?', options: ['[1, 2, 3]', '[3, 2, 1]', '[2, 1, 3]', 'None'], answer: 1, why: 'reverse=True sorts from largest to smallest.' },
    ],
    challenge: {
      prompt: 'marks is given. Create top3: the three highest marks, from highest to lowest. Do not change marks.',
      starter: 'marks = [55, 72, 40, 88, 63, 91]\ntop3 = ',
      check: 'assert top3 == [91, 88, 72], "top3 should be [91, 88, 72], got " + str(top3)\nassert marks == [55, 72, 40, 88, 63, 91], "do not change marks"',
      hint: 'sorted(marks, reverse=True)[:3]',
      solution: 'marks = [55, 72, 40, 88, 63, 91]\ntop3 = sorted(marks, reverse=True)[:3]\nprint(top3)',
    },
  },
  'py-loops': {
    quiz: [
      { q: 'What ends the first line of a for loop?', options: ['A semicolon ;', 'A colon :', 'A full stop .', 'Nothing'], answer: 1, why: 'for ...: needs a colon, then an indented body.' },
      { q: 'Which line runs only ONCE?\n\nfor n in [1, 2, 3]:\n    print(n)\nprint("done")', options: ['print(n)', 'print("done")', 'Both', 'Neither'], answer: 1, why: 'print("done") is not indented, so it is outside the loop.' },
    ],
    challenge: {
      prompt: 'Using a for loop, compute total: the sum of all numbers in marks, and passed: how many marks are 50 or more.',
      starter: 'marks = [55, 72, 40, 88, 35]\ntotal = 0\npassed = 0\n',
      check: 'assert total == 290, "total should be 290, got " + str(total)\nassert passed == 3, "passed should be 3, got " + str(passed)',
      hint: 'Inside the loop: total += m, and if m >= 50: passed += 1',
      solution: 'marks = [55, 72, 40, 88, 35]\ntotal = 0\npassed = 0\nfor m in marks:\n    total += m\n    if m >= 50:\n        passed += 1\nprint(total, passed)',
    },
  },
  'py-ranges': {
    quiz: [
      { q: 'What does list(range(2, 8)) give?', options: ['[2, 3, 4, 5, 6, 7, 8]', '[2, 3, 4, 5, 6, 7]', '[3, 4, 5, 6, 7]', '[2, 8]'], answer: 1, why: 'The stop value (8) is not included.' },
      { q: 'What does range(10, 0, -3) produce?', options: ['10, 7, 4, 1', '10, 7, 4, 1, 0', '0, 3, 6, 9', '10, 9, 8'], answer: 0, why: 'It steps by -3 and stops before 0.' },
    ],
    challenge: {
      prompt: 'Create odd_squares: a list of the squares of the odd numbers from 1 to 15. Use a list comprehension.',
      starter: 'odd_squares = ',
      check: 'assert odd_squares == [1, 9, 25, 49, 81, 121, 169, 225], "expected [1, 9, 25, 49, 81, 121, 169, 225], got " + str(odd_squares)',
      hint: '[n ** 2 for n in range(1, 16) if n % 2 == 1]',
      solution: 'odd_squares = [n ** 2 for n in range(1, 16) if n % 2 == 1]\nprint(odd_squares)',
    },
  },
  'py-slices': {
    quiz: [
      { q: 'What is [10, 20, 30, 40, 50][1:4]?', options: ['[10, 20, 30]', '[20, 30, 40]', '[20, 30, 40, 50]', '[30, 40]'], answer: 1, why: 'Index 1 to 3: 20, 30, 40.' },
      { q: 'After b = a and b.append(9), what happens to a?', options: ['Nothing', 'It also gets 9', 'It becomes empty', 'Error'], answer: 1, why: 'b = a gives the same list another name. Use a.copy() for a real copy.' },
    ],
    challenge: {
      prompt: 'Create backup as a real copy of data, then append 99 to backup only. data must stay [1, 2, 3].',
      starter: 'data = [1, 2, 3]\nbackup = ',
      check: 'assert data == [1, 2, 3], "data must not change"\nassert backup == [1, 2, 3, 99], "backup should be [1, 2, 3, 99]"',
      hint: 'backup = data.copy() and then backup.append(99)',
      solution: 'data = [1, 2, 3]\nbackup = data.copy()\nbackup.append(99)\nprint(data, backup)',
    },
  },
  'py-tuples': {
    quiz: [
      { q: 'Which creates a tuple with ONE item?', options: ['(5)', '(5,)', '[5]', '{5}'], answer: 1, why: 'The comma makes the tuple; (5) is just the number 5.' },
      { q: 'What happens with t = (1, 2); t[0] = 9 ?', options: ['t becomes (9, 2)', 'TypeError', 'Nothing', 'SyntaxError'], answer: 1, why: 'Tuples cannot be changed.' },
    ],
    challenge: {
      prompt: 'Unpack the tuple point into x and y, then create dist: the distance from (0, 0), which is (x² + y²) ** 0.5.',
      starter: 'point = (6, 8)\n',
      check: 'assert (x, y) == (6, 8), "unpack point into x and y"\nassert dist == 10.0, "dist should be 10.0"',
      hint: 'x, y = point',
      solution: 'point = (6, 8)\nx, y = point\ndist = (x ** 2 + y ** 2) ** 0.5\nprint(dist)',
    },
  },
};
