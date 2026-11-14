import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

type Sec = NonNullable<LearnLesson['sections']>[number];

/** Extra sections appended to existing lessons so that every subtopic of chapters 1–7 is covered. */
export const EXTRA_SECTIONS: Record<string, Sec[]> = {
  setup: [
    { h: 'What really happens when you run a program', p: [
      'When you press Run, Python does not look at your whole file at once. The interpreter reads it line by line, translates each line into low-level instructions the computer understands, and carries them out before it moves on.',
      'Before running, Python checks that every line is written in a form it can understand. If it finds something like a missing bracket, it stops and shows a SyntaxError that points at the line. This is why a program with one broken line at the bottom may still run the lines above it before failing.',
      'A good editor colours the words of your code (this is called syntax highlighting). Keywords such as for and if get one colour, text in quotes another, numbers another. The colours help you spot mistakes such as a missing closing quote, because the rest of the line suddenly turns the colour of a string.'],
      code: `print("Step 1: this line runs")\nprint("Step 2: and then this one")\nprint(10 / 0)\nprint("Step 4: never reached")`,
      explain: ['Python runs the first two lines and shows their text.', '10 / 0 is impossible, so Python stops and reports ZeroDivisionError.', 'The last line never runs, because the program ended at the error. Lines before an error still produce output.'] },
  ],
  strings1: [
    { h: 'Avoiding syntax errors with strings', p: [
      'A string starts and ends with the same kind of quote. If the text itself contains that quote, Python thinks the string ends there and gets confused. The apostrophe in a word such as “don\'t” is the usual cause.',
      'There are three easy fixes: use double quotes outside, use single quotes outside when the text contains double quotes, or put a backslash before the quote inside the text so Python reads it as an ordinary character.'],
      code: `# Wrong: the apostrophe ends the string too early\nmessage = 'One of Python's strengths is its diverse community.'\nprint(message)`,
      explain: ['Python reads “One of Python” as a finished string, because the apostrophe looks like a closing quote. The leftover text makes no sense, so it reports a SyntaxError (the exact wording depends on the Python version).', 'The error message appears at the first place Python could no longer understand, which may be a little after the real mistake.'] },
    { h: 'The three fixes', p: ['Run this version to see all three methods working.'],
      code: `print("One of Python's strengths is its diverse community.")\nprint('She said "welcome" to everyone.')\nprint('One of Python\\'s strengths is its diverse community.')`,
      explain: ['Double quotes outside let the apostrophe live inside.', 'Single quotes outside let double quotes live inside.', 'A backslash (escape character) before the apostrophe tells Python “this one is just a character”. The backslash is not printed.'] },
  ],
  numbers: [
    { h: 'Avoiding type errors with the str() function', p: [
      'Sometimes you want to put a number in a message. If you write "Happy " + age + " Birthday", Python raises TypeError, because it does not know whether you want to add numbers or join text. Convert the number to text first with str(), or let an f-string do it for you.'],
      code: `age = 23\n# Wrong: cannot join text and a number with +\nmessage = "Happy " + age + "rd Birthday!"\nprint(message)`,
      explain: ['"Happy " is text and age is a number, and + does not mix them.', 'Python stops with TypeError: can only concatenate str (not "int") to str.'] },
    { h: 'The fix', p: ['str() turns any value into text. An f-string does the conversion for you and is usually the nicest choice.'],
      code: `age = 23\nprint("Happy " + str(age) + "rd Birthday!")\nprint(f"Happy {age}rd Birthday!")`,
      explain: ['str(age) gives "23", so now both sides of + are text.', 'In the f-string, the value in { } is converted automatically.'] },
    { h: 'Number types at a glance', p: [
      'Use int for counts and whole numbers (students, years), float for measured quantities (heights, prices, averages). Mixing them in arithmetic gives a float. Decimal numbers can be written in scientific notation, which is convenient for very big and very small values.'],
      code: `print(type(5), type(5.0), type(5 + 5.0))\nprint(1e3, 2.5e-3)\nprint(0.1 * 3)\nprint(round(0.1 * 3, 2))\nprint(4 / 2, type(4 / 2))`,
      explain: ['5 is an int and 5.0 is a float. Adding them gives a float.', '1e3 means 1 × 10³ = 1000.0 and 2.5e-3 means 0.0025.', 'The tiny error in 0.1 * 3 is explained in the Floats section. Rounding hides it for display.', '4 / 2 is 2.0 (a float), because / always returns a float.'] },
  ],
  ranges: [
    { h: 'A million numbers', p: [
      'Python is fast and range() does not build the whole list in memory, so you can work with very big sequences easily. Use min(), max() and sum() to explore them.'],
      code: `numbers = range(1, 1_000_001)\nprint(min(numbers))\nprint(max(numbers))\nprint(sum(numbers))\nprint(len(numbers))`,
      explain: ['range(1, 1_000_001) stands for the numbers 1 to 1,000,000 without storing them one by one.', 'min and max look at the ends; sum adds all a million numbers in a fraction of a second.', 'The sum equals n(n+1)/2 = 500000500000, a formula you may know from mathematics.'] },
  ],
  if2: [
    { h: 'Using multiple elif blocks', p: [
      'You can use as many elif blocks as you need. A typical use is a price list with several age groups. Each condition is tested in order and only the first true one runs.'],
      code: `age = 12\nif age < 4:\n    price = 0\nelif age < 18:\n    price = 25\nelif age < 65:\n    price = 40\nelse:\n    price = 20\nprint(f"Your admission cost is \${price}.")`,
      explain: ['12 is not below 4, but it is below 18, so price is set to 25.', 'The remaining conditions are never tested. The final else catches everyone aged 65 or more.', 'Storing the price in a variable and printing once at the end is cleaner than repeating print in every branch.'] },
    { h: 'Omitting the else block', p: [
      'else is optional. When you have a clear final condition, finish with an elif instead. This is clearer, because every branch says exactly who it is for, and it avoids a catch-all that could accept wrong data.'],
      code: `age = 70\nif age < 4:\n    price = 0\nelif age < 18:\n    price = 25\nelif age < 65:\n    price = 40\nelif age >= 65:\n    price = 20\nprint(price)`,
      explain: ['The last elif states its condition clearly (65 or older).', 'If you ever make a mistake in the earlier ranges, the code will not silently give a price to the wrong group.'] },
    { h: 'Testing multiple conditions', p: [
      'The if-elif-else chain stops at the first true branch. That is perfect when only one thing can happen. When several things can be true at the same time, use separate if statements, so that each test runs.'],
      code: `requested = ["mushrooms", "extra cheese"]\nif "mushrooms" in requested:\n    print("Adding mushrooms.")\nif "pepperoni" in requested:\n    print("Adding pepperoni.")\nif "extra cheese" in requested:\n    print("Adding extra cheese.")\nprint("Finished making your pizza!")`,
      explain: ['Each if is checked independently.', 'Two of the three conditions are true, so two toppings are added. If we had used elif, only the first topping would be added.', 'Rule of thumb: one outcome only → if/elif/else. Several outcomes possible → separate ifs.'] },
    { h: 'Styling your if statements', p: [
      'In comparisons put one space on each side of the operator: age < 4 is easier to read than age<4. Do not put spaces inside brackets, and do not write extra brackets that are not needed: if age >= 18: not if (age >= 18):.'],
      code: `age = 17\n# Hard to read\nif(age>=18):\n    print("adult")\n# Tidy\nif age >= 18:\n    print("adult")\nelse:\n    print("minor")`,
      explain: ['Both versions work, but the second follows the standard style.', 'Here age is 17, so only the else branch of the tidy version prints “minor”.'] },
  ],
  while1: [
    { h: 'Letting the user choose when to quit', p: [
      'A very common design: keep asking until the user types a special word, called a sentinel value, such as "quit". The prompt tells the user how to leave the loop.'],
      code: `prompt = "Tell me something and I will repeat it (type 'quit' to stop): "\nmessage = ""\nwhile message != "quit":\n    message = input(prompt)\n    if message != "quit":\n        print(message)`,
      explain: ['message starts as an empty string so the first test works.', 'Each round reads a line; if it is not “quit” it is printed back.', 'When the user types quit, the test message != "quit" becomes False and the loop ends. We repeat the check inside so that the word quit itself is not echoed.', 'When you press Run, a box will pop up on each round.'] },
    { h: 'Using a flag', p: [
      'When a loop has many reasons to stop, testing them all in the while line becomes messy. Use a flag: a variable that is True while the program should keep running. Anything in the loop can set it to False. The while line then only checks one thing.'],
      code: `active = True\ncount = 0\nwhile active:\n    count += 1\n    print("round", count)\n    if count == 3:\n        active = False\nprint("stopped after", count, "rounds")`,
      explain: ['active is the flag. While it is True the loop goes on.', 'In round 3 the if sets active to False, but the loop body finishes first.', 'The next time Python checks the while line the flag is False, so the loop ends.'] },
    { h: 'Avoiding infinite loops', p: [
      'Every while loop needs a way to stop. Before you run a loop ask yourself: what changes inside the loop that will make the condition False? If nothing does, the program runs forever.',
      'If your program freezes, close the editor window or stop the run. On a computer, press Ctrl + C in the terminal. In the examples below, the first loop is safe; the second is the classic infinite loop, shown only as text so that it does not run.'],
      code: `x = 1\nwhile x <= 5:\n    print(x)\n    x += 1   # this line makes the loop finish\nprint("done")`,
      explain: ['x grows by 1 each round, so sooner or later x <= 5 is False.', 'If the line x += 1 were missing, x would stay 1 forever and the loop would never end. Always double-check the update line.'] },
  ],
  dicts1: [
    { h: 'A dictionary of similar objects', p: [
      'A dictionary can store one kind of information about many things, not just many details about one thing. For example, favourite languages for several people, with the person as the key and the language as the value. Long dictionaries are written over several lines with a trailing comma after the last pair, which makes it easy to add the next one.'],
      code: `favorite_languages = {\n    "jen": "python",\n    "sarah": "c",\n    "edward": "rust",\n    "phil": "python",\n}\nlanguage = favorite_languages["sarah"].title()\nprint(f"Sarah's favorite language is {language}.")`,
      explain: ['Each name is a key and each language is the value.', 'favorite_languages["sarah"] returns "c" and .title() capitalises it.', 'The trailing comma after the last pair is allowed and recommended.'] },
    { h: 'Starting with an empty dictionary', p: [
      'Sometimes it is easier to start with {} and add pairs as data arrives, for example when reading answers from users or lines from a file.'],
      code: `alien = {}\nalien["color"] = "green"\nalien["points"] = 5\nprint(alien)\nprint(len(alien))`,
      explain: ['{} creates an empty dictionary.', 'Each assignment to a new key adds a pair.', 'len shows the number of pairs: 2.'] },
  ],
  dicts2: [
    { h: 'Looping through all values, without repeats', p: [
      'Looping over values() gives every value, including repeats. To see each different value only once, pass the values to set().'],
      code: `favorite_languages = {"jen": "python", "sarah": "c", "edward": "rust", "phil": "python"}\nprint("These languages were mentioned:")\nfor language in set(favorite_languages.values()):\n    print(language.title())\nprint(len(set(favorite_languages.values())))`,
      explain: ['values() would give python twice. set() keeps one of each.', 'Because sets have no order, the printed order may differ from yours.', 'There are 3 different languages.'] },
    { h: 'A list in a dictionary', p: [
      'When one key needs several values, store a list as the value. The pizza example: the dictionary holds the crust and a list of toppings.'],
      code: `pizza = {"crust": "thick", "toppings": ["mushrooms", "extra cheese"]}\nprint(f"You ordered a {pizza['crust']}-crust pizza with the following toppings:")\nfor topping in pizza["toppings"]:\n    print("\\t" + topping)\n\nfavorite_languages = {"jen": ["python", "ruby"], "sarah": ["c"], "phil": ["python", "haskell"]}\nfor name, languages in favorite_languages.items():\n    print(f"{name.title()}'s favorite languages are:", ", ".join(languages))`,
      explain: ['pizza["toppings"] is a list, so we can loop over it as usual.', 'Inside an f-string we use single quotes for the key because the string itself uses double quotes.', 'In the second example every person has a list of languages. join() turns each list into a readable sentence.'] },
  ],
};

/** Own lessons added on top of the standard course outline. */
export const OWN_LESSONS: Record<string, LearnLesson> = {
  install: L('install', 'Installing Python and choosing an editor', 'Weka Python kwenye kompyuta, chagua editor, na ujue mahali pa kupata msaada.',
    'Write down the steps you would follow to install Python and run hello.py on your own computer.',
    [
      { h: 'Do I need to install anything?', p: [
        'Not to learn with VENUE: every example on this page runs inside your phone’s browser. But real programs, files and projects run on a computer, so it is worth setting Python up when you get the chance.'] },
      { h: 'Installing Python', p: [
        'Windows: go to python.org, download the latest Python 3 installer and run it. On the first screen tick “Add Python to PATH” before you click Install, otherwise your terminal will not find python.',
        'macOS: download the installer from python.org (or install with Homebrew: brew install python).',
        'Linux: Python is usually already installed. Check with python3 --version. If it is missing, install it with your package manager, for example sudo apt install python3 on Ubuntu or Debian.',
        'Check the result: open a terminal (Command Prompt or PowerShell on Windows, Terminal on Mac and Linux) and type python --version (or python3 --version). You should see a number such as Python 3.12.'] },
      { h: 'Running a program from the terminal', p: [
        'Save your code in a file that ends with .py, for example hello.py. Open the terminal, move to the folder that holds the file with cd, and run it.'],
        code: `# hello.py\nprint("Hello, Python world!")\n\n# In the terminal you would type:\n#   cd Documents/python\n#   python hello.py`,
        explain: ['The lines starting with # are comments; they show the commands to type in a terminal and are ignored by Python.', 'The only real line is the print. The terminal command python hello.py reads the file and runs it.'] },
      { h: 'Text editors and IDEs', p: [
        'A text editor made for code gives you colours, auto-indent, quick search and error hints. Good free choices: VS Code (the most popular), Thonny (made for beginners, includes Python), PyCharm Community (a full IDE) and IDLE (installed together with Python).',
        'On a phone you can write Python in apps such as Pydroid 3, but the Learn section of VENUE is usually enough for practising the basics.'] },
      { h: 'Getting help', p: [
        'Read the error message from the bottom up: the last line says what went wrong. Search for that exact line together with the word Python. The official documentation at docs.python.org explains every function. Stack Overflow and the Python community forums have answers to nearly every beginner question.',
        'When you ask a question, include your code, the full error text and what you expected to happen. A clear question gets a quick answer.',
        'You can also use the AI Tutor in VENUE to ask about a lesson.'] },
    ],
    {
      quiz: [
        { q: 'On Windows, which box must you tick when installing Python?', options: ['Install for all users', 'Add Python to PATH', 'Create a desktop shortcut', 'Install Git'], answer: 1, why: 'Without it, the terminal cannot find the python command.' },
        { q: 'Which command runs the file hello.py from a terminal?', options: ['run hello.py', 'python hello.py', 'hello.py python', 'open hello.py'], answer: 1, why: 'python followed by the file name runs the program.' },
      ],
    }),

  debug: L('debug', 'Debugging: finding and fixing mistakes', 'Soma kosa kutoka chini, chapisha thamani kuona kinachoendelea, na jaribu kidogo kidogo.',
    'Find and fix the three mistakes in the broken program.',
    [
      { h: 'A bug is normal', p: [
        'A bug is a mistake in a program. Every programmer, beginner or expert, spends a large part of their time finding and fixing bugs. The skill is not writing perfect code the first time; it is finding the problem calmly and quickly.',
        'There are three kinds of errors. Syntax errors break the rules of the language and stop the program before it starts. Runtime errors happen while the program runs, for example dividing by zero. Logic errors let the program run but give wrong answers: the hardest kind, because no error message appears.'] },
      { h: 'Read the traceback', p: [
        'When Python stops it prints a traceback. Read it from the bottom. The last line names the error type and explains it. The line above shows the code and the line number where it happened.'],
        code: `scores = [70, 85, 90]\ntotal = 0\nfor s in scores:\n    total += s\naverage = total / len(score)\nprint(average)`,
        explain: ['The loop works. The error is in the line with average: the list is called scores, not score.', 'Python reports NameError: name \'score\' is not defined, and often adds a helpful “Did you mean: scores?”. The message gives the exact name that it could not find. Fix the spelling and the program works.'] },
      { h: 'Print debugging', p: [
        'When the program runs but the answer is wrong, add print() lines to see the real values at each step. Compare what you see with what you expected; the first place where they differ is the bug.'],
        code: `marks = [40, 55, 70]\ntotal = 0\nfor m in marks:\n    total = m          # bug: should be total += m\n    print("m =", m, "total =", total)\nprint("Average:", total / len(marks))`,
        explain: ['The printed lines show that total always equals the latest m instead of growing.', 'That tells us the line total = m replaces the total each time. The fix is total += m.', 'Without the print lines you would only see a wrong average and no clue why.'] },
      { h: 'A method that works', p: [
        'Test small pieces separately. Write a little, run it, write a little more. Change one thing at a time. If you are stuck, explain the problem aloud, line by line, to a friend or even to a rubber duck: you will often find the mistake while talking.',
        'Take a break. A fresh mind finds in two minutes what a tired mind could not find in an hour.',
        'Keep a note of the errors you meet and what caused them. After a few weeks you will recognise most of them instantly.'] },
    ],
    {
      mistakes: ['Changing many things at once, so you do not know which change fixed (or broke) the program.', 'Ignoring the error message and guessing.', 'Fixing the symptom (the wrong printed number) instead of the cause.'],
      quiz: [
        { q: 'Which kind of error produces wrong results without any error message?', options: ['Syntax error', 'Runtime error', 'Logic error', 'Name error'], answer: 2, why: 'Logic errors run fine but do the wrong thing; print debugging helps find them.' },
        { q: 'Where should you start reading a traceback?', options: ['The first line', 'The last line', 'The middle', 'You should not read it'], answer: 1, why: 'The last line names the error type and the message.' },
      ],
      challenge: {
        prompt: 'The function average(numbers) below has a bug. Fix it so that it returns the correct mean.',
        starter: 'def average(numbers):\n    total = 0\n    for n in numbers:\n        total = n\n    return total / len(numbers)\n',
        check: 'assert average([2, 4, 6]) == 4, "average([2, 4, 6]) should be 4, got " + str(average([2, 4, 6]))\nassert average([10]) == 10, "average([10]) should be 10"',
        hint: 'The line total = n replaces the total; it should add: total += n',
        solution: 'def average(numbers):\n    total = 0\n    for n in numbers:\n        total += n\n    return total / len(numbers)\n\nprint(average([2, 4, 6]))',
      },
    }),
};
