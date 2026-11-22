import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Full-depth versions of the first Python lessons, plus challenges for lessons that had none. */
export const PYTHON_PATCH_LESSONS: LearnLesson[] = [
  L('intro', 'Introduction', 'Python ni lugha rahisi, inatumika kila mahali: data, AI, wavuti.', 'Print a sentence about why you want to learn Python.', [
    { h: 'What is Python?', p: [
      'Python is a programming language created by Guido van Rossum and first released in 1991. A programming language is a way of giving instructions to a computer in words that a person can read and the computer can follow.',
      'Python is popular because it reads almost like English and needs very little punctuation. That lets you spend your effort on solving the problem instead of fighting the language.',
      'It is used for data analysis and statistics, artificial intelligence, websites, automating boring office work, science, games and much more. For a Mathematics and Statistics student it is one of the most useful tools to learn.'] },
    { h: 'Your first program', p: [
      'A program is a list of instructions. The computer follows them one by one, from the top to the bottom. print() is a function that shows something on the screen. Text goes between quotation marks.'],
      code: `print("Hello, VENUE!")`, note: 'Press “Try it Yourself” to run this right here on your phone.',
      explain: ['print is the name of the instruction, the brackets hold what you give it, and the quotation marks tell Python that Hello, VENUE! is text and not a command.', 'Python runs the line and shows the text on its own line in the output.'] },
    { h: 'Many lines run in order', p: [
      'Each line is a separate instruction and the lines run in order. Change the order and you change the output.'],
      code: `print("First")\nprint("Second")\nprint(2 + 3)\nprint("2 + 3")`,
      explain: ['The first two lines print words.', 'print(2 + 3) has no quotation marks, so Python calculates and prints 5.', 'print("2 + 3") has quotation marks, so Python treats it as text and prints it exactly as written. This difference between numbers to calculate and text to show is one of the first ideas in programming.'] },
    { h: 'How to learn Python well', p: [
      'You learn to program by writing code, not by reading about it. Run every example, then change a value and run it again to see what happens. Breaking an example on purpose is a good way to learn what the error messages mean.',
      'Do the exercises and the challenge at the end of each lesson. The challenge checks your code automatically, so you know straight away if it works.'] },
  ], {
    mistakes: ['Forgetting the quotation marks around text: print(Hello) makes Python look for a name called Hello.', 'Using capital letters: Print("Hi") fails because Python is case sensitive and the function is print.', 'Forgetting a closing bracket or quotation mark.'],
    exercises: [
      { q: 'What does print("5 + 5") show, and what does print(5 + 5) show?', a: '# The first shows the text 5 + 5. The second calculates and shows 10.' },
      { q: 'Write a program that prints your name on one line and your course on the next line.', a: 'print("Mussa")\nprint("Mathematics and Statistics")' },
      { q: 'Why does Print("Hi") give an error?', a: '# Python is case sensitive. The function is called print with a small p.' },
    ],
    quiz: [
      { q: 'Which line prints the number 10 by calculating?', options: ['print("5 + 5")', 'print(5 + 5)', 'Print(5 + 5)', 'print 5 + 5'], answer: 1, why: 'Without quotation marks Python calculates 5 + 5 and prints 10.' },
      { q: 'In what order does Python run the lines of a simple program?', options: ['Bottom to top', 'Randomly', 'Top to bottom', 'Shortest first'], answer: 2, why: 'Instructions run one by one from the top to the bottom.' },
      { q: 'Why is Python good for beginners?', options: ['It reads almost like English', 'It cannot make errors', 'It only works on computers', 'It has no rules'], answer: 0, why: 'Simple, readable syntax lets you focus on the problem.' },
    ],
    challenge: {
      prompt: 'Store the text Hello, Python! in a variable called greeting, then print it.',
      starter: '# create the variable greeting and print it\n',
      check: 'assert greeting == "Hello, Python!", "greeting should be exactly: Hello, Python!"',
      hint: 'Write greeting = "Hello, Python!" and then print(greeting).',
      solution: 'greeting = "Hello, Python!"\nprint(greeting)\n',
    },
  }),

  L('syntax', 'Syntax and indentation', 'Python inatumia nafasi (indentation) kuonyesha code iliyo ndani ya kitu.', 'Fix the indentation so both lines print.', [
    { h: 'What is syntax?', p: [
      'Syntax is the set of grammar rules of a language. If you break a rule, Python cannot understand the line and stops with a SyntaxError before running anything. Typical causes are a missing bracket, a missing quotation mark or a missing colon.',
      'Syntax errors are friendly: Python tells you the line and usually points at the place with a ^ mark. Read the message, fix the line, and run again.'] },
    { h: 'Indentation groups code', p: [
      'Python uses spaces at the start of a line to group code into blocks. A line that ends with a colon : opens a block, and the lines inside the block are indented by the same amount. Four spaces is the standard choice.',
      'Other languages use curly brackets for this. In Python the layout is the structure, so the way your code looks is the way it works.'],
      code: `if 5 > 2:\n    print("Five is greater than two")\n    print("Still inside the if")\nprint("Outside the if")`,
      explain: ['The first two print lines are indented, so they belong to the if and run only when 5 > 2 is true. It is true, so both print.', 'The last line is not indented. It is outside the if, so it always runs.', 'Change 5 > 2 to 5 < 2 and run again: only the last line prints, because the block is skipped.'] },
    { h: 'Same block, same indentation', p: [
      'All lines of one block must be indented by exactly the same amount. Mixing 4 spaces on one line and 2 on the next gives an IndentationError. Do not mix tabs and spaces either.'],
      code: `score = 72\nif score >= 50:\n    print("You passed")\n    print("Well done")\nelse:\n    print("Try again")\nprint("Finished")`,
      explain: ['if and else each open a block with a colon. Their lines are indented four spaces.', 'Python runs either the if block or the else block, and then continues with the unindented final line.'] },
    { h: 'Comments', p: [
      'Everything after # on a line is ignored by Python. Use comments to explain your code to humans.'],
      code: `# This line is a comment\nprint("Comments are ignored")  # even at the end of a line`,
      explain: ['The first line does nothing. The second prints its text; the comment after it is ignored.'] },
  ], {
    mistakes: ['Forgetting the colon at the end of if, else, for, while or def.', 'Not indenting the line after a colon: IndentationError: expected an indented block.', 'Indenting a line that should not be indented: IndentationError: unexpected indent.', 'Mixing tabs and spaces. Configure your editor to insert 4 spaces when you press Tab.'],
    exercises: [
      { q: 'What do you get if you forget the colon after if 5 > 2?', a: '# A SyntaxError: Python expects a colon to open the block.' },
      { q: 'How many spaces is the standard indentation in Python?', a: '# Four spaces for each level.' },
      { q: 'In the first example, which line prints when the condition is false?', a: '# Only the last line, print("Outside the if"), because it is not inside the block.' },
    ],
    quiz: [
      { q: 'What does an indented line after a colon mean?', options: ['It is a comment', 'It belongs to that block', 'It is ignored', 'It runs first'], answer: 1, why: 'Indentation shows which lines belong to the block that the colon opened.' },
      { q: 'Which line is correct?', options: ['if x > 3', 'if x > 3:', 'if (x > 3) {', 'if x > 3 then'], answer: 1, why: 'Python needs a colon at the end of the if line.' },
      { q: 'What is the usual indentation size?', options: ['1 space', '2 spaces', '4 spaces', '10 spaces'], answer: 2, why: '4 spaces per level is the Python standard (PEP 8).' },
    ],
    challenge: {
      prompt: 'Fix the code so it runs. Both messages must be inside the if block and the variable passed must be True.',
      starter: 'marks = 65\npassed = False\nif marks >= 50:\nprint("Pass")\n    passed = True\n',
      check: 'assert passed is True, "passed should be True when marks are 50 or more"',
      hint: 'Indent print("Pass") with four spaces, the same as the line below it.',
      solution: 'marks = 65\npassed = False\nif marks >= 50:\n    print("Pass")\n    passed = True\n',
    },
  }),

  L('match', 'Match', 'match inachagua njia kulingana na thamani (Python 3.10+).', 'Add a case for "Sat" and "Sun" that prints "Weekend".', [
    { h: 'Choosing between many cases', p: [
      'When one value can be one of many things, a long if / elif / elif chain gets hard to read. match compares one value against several patterns, one case at a time, and runs the first case that fits. match needs Python 3.10 or newer.',
      'The underscore _ is the wildcard: it matches anything, so put it last to catch every other value.'],
      code: `day = "Tue"\nmatch day:\n    case "Mon":\n        print("Start of week")\n    case "Fri":\n        print("Almost weekend")\n    case _:\n        print("Normal day")`,
      explain: ['day is "Tue". Python checks "Mon": no. "Fri": no. Then _ matches everything, so it prints Normal day.', 'Change day to "Fri" and run again to see Almost weekend.'] },
    { h: 'Several values in one case', p: [
      'Use | (read it as “or”) to let one case handle several values. Cases can also test numbers.'],
      code: `day = "Sat"\nmatch day:\n    case "Mon" | "Tue" | "Wed" | "Thu" | "Fri":\n        print("Weekday")\n    case "Sat" | "Sun":\n        print("Weekend")\n    case _:\n        print("Not a day")`,
      explain: ['Sat matches the second case, so Weekend prints. Only the first matching case runs; the rest are skipped.', 'The final case _ is a safety net for bad input such as "Monday".'] },
    { h: 'A guard with if', p: [
      'A case can have an extra condition, called a guard, written with if. The case runs only when the pattern fits and the guard is true.'],
      code: `score = 85\nmatch score:\n    case n if n >= 70:\n        print("A")\n    case n if n >= 60:\n        print("B")\n    case _:\n        print("C or below")`,
      explain: ['n is a name that takes the value of score, here 85.', 'The first case checks n >= 70, which is true, so A prints. If you used 65 the second case would print B.', 'For ranges like this an if / elif chain is just as good; match shines when you compare exact values or shapes.'] },
  ], {
    mistakes: ['Forgetting the colon after match value or after a case.', 'Putting case _ first: it matches everything, so the cases below it never run.', 'Using match on Python older than 3.10: it is a SyntaxError there.', 'Writing case x == 3: patterns are not conditions; use a guard (case n if n == 3) or write case 3.'],
    exercises: [
      { q: 'Write a match on a variable light that prints Stop for "red", Go for "green" and Wait for anything else.', a: 'light = "green"\nmatch light:\n    case "red":\n        print("Stop")\n    case "green":\n        print("Go")\n    case _:\n        print("Wait")' },
      { q: 'What happens if no case matches and there is no case _?', a: '# Nothing runs and the program simply continues after the match block.' },
      { q: 'How do you make one case handle "Sat" and "Sun"?', a: '# case "Sat" | "Sun":' },
    ],
    quiz: [
      { q: 'What does case _ do?', options: ['Matches only empty text', 'Matches anything else', 'Ends the program', 'Is an error'], answer: 1, why: 'The underscore is a wildcard that catches every value not matched earlier.' },
      { q: 'How many cases run in one match?', options: ['All that match', 'Only the first that matches', 'Always two', 'None'], answer: 1, why: 'Python stops after the first matching case.' },
      { q: 'Which symbol joins several values in one case?', options: ['&', ',,', '|', '+'], answer: 2, why: 'case "a" | "b": runs for either value.' },
    ],
    challenge: {
      prompt: 'Complete the function weekend(day) so it returns "Weekend" for "Sat" and "Sun", and "Weekday" for anything else.',
      starter: 'def weekend(day):\n    match day:\n        case "Sat":\n            return "Weekend"\n        case _:\n            return "Weekday"\n',
      check: 'assert weekend("Sun") == "Weekend", "Sun should be Weekend"\nassert weekend("Sat") == "Weekend"\nassert weekend("Mon") == "Weekday"',
      hint: 'Change the first case to case "Sat" | "Sun":',
      solution: 'def weekend(day):\n    match day:\n        case "Sat" | "Sun":\n            return "Weekend"\n        case _:\n            return "Weekday"\n',
    },
  }),

  L('zen', 'The Zen of Python', 'Python ina kanuni za mtindo: rahisi ni bora kuliko ngumu, wazi ni bora kuliko fiche.', 'Choose the three aphorisms you like most and write what each means in your own words.', [
    { h: 'A philosophy for writing code', p: [
      'Python has a small collection of guiding ideas called the Zen of Python, written by Tim Peters. Python itself will print them for you: just run the line import this.',
      'They are advice about taste: how to write code that other people (and the future you) can read and trust.'],
      code: `import this`,
      explain: ['import this loads a built-in module whose only job is to print the Zen. You do not need to understand the import yet; it is covered in the functions chapter.'] },
    { h: 'The ideas that matter most for a beginner', p: [
      'Beautiful is better than ugly: choose clear names and tidy layout.',
      'Simple is better than complex: if a short, plain solution works, use it.',
      'Readability counts: code is read far more often than it is written.',
      'Errors should never pass silently: if something goes wrong, make it visible instead of hiding it.',
      'If the implementation is hard to explain, it is a bad idea. If it is easy to explain, it may be a good idea.',
      'In the face of ambiguity, refuse the temptation to guess: ask, test or print the value and look.'] },
    { h: 'The Zen in practice', p: [
      'Both programs below give the same result. The second follows the Zen: clear names and a plain loop.'],
      code: `# hard to read\nx = [1,2,3]\nt = 0\nfor i in x: t = t + i\nprint(t)\n\n# clear\nscores = [1, 2, 3]\ntotal = 0\nfor score in scores:\n    total = total + score\nprint(total)`,
      explain: ['Both print 6 twice. The computer does not care which one you write, but the person who reads it tomorrow does.', 'Good names (scores, total, score) explain the program without any comment. That is readability counting.'] },
  ], {
    mistakes: ['Thinking that clever, short code is better code. Clear beats clever.', 'Using one-letter names everywhere. A name should say what the value is.', 'Hiding errors with code that ignores them instead of fixing the cause.'],
    exercises: [
      { q: 'Run import this and pick the aphorism you like most. Explain it in one sentence.', a: '# Any honest answer works, for example: “Readability counts” means write code so that other people can understand it quickly.' },
      { q: 'Rewrite n = 5; a = n * 12 with clearer names for a program that counts months in 5 years.', a: 'years = 5\nmonths = years * 12' },
    ],
    quiz: [
      { q: 'How do you make Python print its Zen?', options: ['print(zen)', 'import this', 'run zen()', 'zen = True'], answer: 1, why: 'import this prints the Zen of Python.' },
      { q: 'Which idea says clear names matter?', options: ['Readability counts', 'Errors pass silently', 'Guess when unsure', 'Complex is better'], answer: 0, why: 'Code is read more often than it is written, so make it easy to read.' },
      { q: 'What should you do when a value is unclear?', options: ['Guess', 'Ignore it', 'Print it and look', 'Delete the line'], answer: 2, why: 'Refuse the temptation to guess: test or print the value.' },
    ],
    challenge: {
      prompt: 'Rewrite the code with clear names: use price and quantity, and store the result in total (price 250, quantity 4).',
      starter: 'a = 250\nb = 4\nc = a * b\n',
      check: 'assert price == 250, "create a variable called price"\nassert quantity == 4, "create a variable called quantity"\nassert total == 1000, "total should be price * quantity"',
      hint: 'price = 250, quantity = 4, total = price * quantity',
      solution: 'price = 250\nquantity = 4\ntotal = price * quantity\n',
    },
  }),
];

type Patch = Pick<LearnLesson, 'exercises' | 'challenge'>;

/** Extra exercises or challenges merged into existing lessons (only fills what is missing). */
export const PYTHON_PATCH_EXTRA: Record<string, Partial<Patch>> = {
  debug: {
    exercises: [
      { q: 'A program prints 5 where you expected 15. No error appears. Which kind of error is it, and what is your first step?', a: '# A logic error. Add print() lines to see the values at each step and find where they first differ from what you expected.' },
      { q: 'Python shows: NameError: name \'total\' is not defined. Name two likely causes.', a: '# A spelling or capital-letter difference (Total vs total), or the variable is used before the line that creates it.' },
      { q: 'Why is it better to change one thing at a time while debugging?', a: '# Because then you know which change fixed or broke the program.' },
    ],
  },
  install: {
    exercises: [
      { q: 'On Windows, which option must you tick on the first installer screen, and why?', a: '# Add Python to PATH, so the terminal can find the python command.' },
      { q: 'Which command checks the installed Python version?', a: '# python --version (or python3 --version on Mac and Linux).' },
      { q: 'You save your code as hello.py. How do you run it from the terminal?', a: '# Move to its folder with cd, then type python hello.py.' },
    ],
    challenge: {
      prompt: 'Write a function run_command(filename) that returns the terminal command to run a Python file, for example "python hello.py".',
      starter: 'def run_command(filename):\n    return filename\n',
      check: 'assert run_command("hello.py") == "python hello.py", "expected: python hello.py"\nassert run_command("app.py") == "python app.py"',
      hint: 'Join the word python, a space and the file name: "python " + filename, or an f-string.',
      solution: 'def run_command(filename):\n    return "python " + filename\n',
    },
  },
  comments: {
    challenge: {
      prompt: 'Two lines of this program are commented out by mistake. Remove the # signs so that total becomes 30.',
      starter: 'price = 10\nquantity = 3\n# total = price * quantity\n',
      check: 'assert total == 30, "total should be price * quantity = 30"',
      hint: 'Delete the # at the start of the total line. Python ignores lines that start with #.',
      solution: 'price = 10\nquantity = 3\ntotal = price * quantity\n',
    },
  },
  indenterr: {
    challenge: {
      prompt: 'Fix the indentation of the function count_even so it returns how many even numbers a list has.',
      starter: 'def count_even(numbers):\ncount = 0\nfor n in numbers:\nif n % 2 == 0:\ncount += 1\nreturn count\n',
      check: 'assert count_even([1, 2, 3, 4, 6]) == 3, "count_even([1, 2, 3, 4, 6]) should be 3"\nassert count_even([]) == 0\nassert count_even([5, 7]) == 0',
      hint: 'Indent each block one level deeper: the body of def, the body of for, the body of if. return count stays at the level of for.',
      solution: 'def count_even(numbers):\n    count = 0\n    for n in numbers:\n        if n % 2 == 0:\n            count += 1\n    return count\n',
    },
  },
  input: {
    challenge: {
      prompt: 'input() always gives text. Write a function age_next_year(text) that takes the text a user typed, such as "19", and returns the age next year as a number.',
      starter: 'def age_next_year(text):\n    return text + 1\n',
      check: 'assert age_next_year("19") == 20, "age_next_year(\\"19\\") should be 20"\nassert age_next_year("0") == 1\nassert isinstance(age_next_year("30"), int), "return a number, not text"',
      hint: 'Convert the text to a number first: int(text) + 1.',
      solution: 'def age_next_year(text):\n    return int(text) + 1\n',
    },
  },
  style: {
    exercises: [
      { q: 'Rewrite x=3+4*2 following PEP 8 spacing.', a: 'x = 3 + 4 * 2' },
      { q: 'How many characters should a line have at most, according to PEP 8?', a: '# About 79 characters.' },
      { q: 'Which name is better for a list of student marks: m, list1 or student_marks?', a: '# student_marks: it says what the list contains.' },
    ],
    challenge: {
      prompt: 'Rewrite this badly named code in PEP 8 style: variables length and width, and a variable area equal to length times width (length 8, width 5).',
      starter: 'l=8\nw=5\na=l*w\n',
      check: 'assert length == 8, "create length = 8"\nassert width == 5, "create width = 5"\nassert area == 40, "area should be length * width"',
      hint: 'Use meaningful names and spaces around =, for example length = 8.',
      solution: 'length = 8\nwidth = 5\narea = length * width\n',
    },
  },
  fstyle: {
    exercises: [
      { q: 'What is a docstring and where does it go?', a: '# A text in triple quotes as the first statement inside a function; it describes what the function does.' },
      { q: 'Why should a function name be a verb phrase such as calculate_average?', a: '# It tells the reader what the function does when they see it called.' },
      { q: 'How many blank lines separate two top-level functions in PEP 8?', a: '# Two.' },
    ],
    challenge: {
      prompt: 'Write a function rectangle_area(length, width) with a docstring (a text in triple quotes as the first line inside) that returns the area.',
      starter: 'def f(a, b):\n    return a * b\n',
      check: 'assert rectangle_area(8, 5) == 40, "rectangle_area(8, 5) should be 40"\nassert rectangle_area.__doc__ and len(rectangle_area.__doc__.strip()) > 5, "add a docstring that describes the function"',
      hint: 'Rename the function and put """Return the area of a rectangle.""" right under the def line.',
      solution: 'def rectangle_area(length, width):\n    """Return the area of a rectangle."""\n    return length * width\n',
    },
  },
};
