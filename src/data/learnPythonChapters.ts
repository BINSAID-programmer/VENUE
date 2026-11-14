import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Remaining subtopics that complete chapters 1–7, following the order of a standard beginner course. */
export const PYTHON_CHAPTER_EXTRAS: Record<string, LearnLesson> = {
  setup: L('setup', 'Getting started and your first program', 'Programu ni maelekezo; unaweza kuiendesha kwenye simu hapa hapa au kwenye kompyuta.',
    'Print a welcome message with your name and your programme.',
    [
      { h: 'What is a program?', p: [
        'A program is a text file that holds instructions for the computer. You write the instructions in a language the computer can be taught, and a tool called the interpreter reads them one line at a time, from top to bottom, and carries them out.',
        'Python is such a language. Its instructions look close to English, which is why it is a favourite first language and also a professional tool used in data science, statistics, artificial intelligence, web development and automation.'] },
      { h: 'Hello, world!', p: [
        'The traditional first program prints a greeting. print() is a function: a ready-made tool that takes whatever you put between the brackets and shows it on the screen. Text must be written inside quotation marks.'],
        code: `print("Hello, world!")`,
        explain: ['print is the name of the function. The brackets after it are where you hand it the thing to show.', 'The text is inside double quotes. The quotes tell Python “this is text”, and they are not shown in the output.', 'Press Try it Yourself, change the message and run it again. You cannot break anything.'] },
      { h: 'Where you can run Python', p: [
        'In VENUE you can run Python right here, in your phone’s browser, with nothing to install: use the Try it Yourself button.',
        'On a computer you install Python from python.org, write your code in a text editor, save the file with the ending .py and run it from a terminal with: python hello.py. You can also use an editor such as VS Code or IDLE, which comes with Python.',
        'There is also an interactive mode: type python in the terminal and you get a prompt (>>>) where every line runs as soon as you press Enter. It is perfect for testing small ideas quickly.'],
        code: `# Every line runs in order, from top to bottom\nprint("Line 1")\nprint("Line 2")\nprint("Line 3")`,
        explain: ['The first line starts with # so Python ignores it. It is a comment for humans.', 'The three print calls run in the order they are written, so the output is in the same order.'] },
      { h: 'Errors are normal', p: [
        'Every programmer makes mistakes all the time. When Python cannot understand a line it stops and prints an error message called a traceback. Read it from the bottom: the last line names the kind of error and the line above shows where it happened.',
        'The most common beginner errors are a misspelled word, a missing closing quote or bracket, and wrong indentation. Try the example below: it has a typo, so you will see an error on purpose.'],
        code: `print("This line works")\nprnit("This line has a typo")`,
        explain: ['The first line runs normally.', 'prnit is not a known name, so Python stops with NameError: name \'prnit\' is not defined.', 'Fix the spelling to print and run again. Learning to read error messages is one of the most useful skills you will build.'] },
    ],
    {
      mistakes: ['Forgetting the quotes around text: print(Hello) looks for a variable called Hello.', 'Using curly “smart” quotes copied from a document instead of straight quotes ".', 'Writing Print or PRINT: Python is case-sensitive, so only print works.', 'Forgetting a closing bracket at the end of the line.'],
      exercises: [
        { q: 'Print two lines: your name and the course you study.', a: `print("Mussa")\nprint("Mathematics and Statistics")` },
        { q: 'Print the result of 12 * 12 (no quotes around the calculation).', a: `print(12 * 12)` },
      ],
      quiz: [
        { q: 'Which line prints the word Hello?', options: ['print(Hello)', 'print("Hello")', 'Print("Hello")', 'print "Hello"'], answer: 1, why: 'Text needs quotes, and print must be written in small letters with brackets.' },
        { q: 'In what order does Python run the lines of a program?', options: ['Bottom to top', 'Alphabetical order', 'Top to bottom', 'Random'], answer: 2, why: 'The interpreter reads and runs one line at a time from the top.' },
      ],
      challenge: {
        prompt: 'Make the variable message hold the text "Karibu VENUE" and then print it.',
        starter: 'message = \n',
        check: 'assert message == "Karibu VENUE", "message must be exactly: Karibu VENUE"',
        hint: 'message = "Karibu VENUE"\nprint(message)',
        solution: 'message = "Karibu VENUE"\nprint(message)',
      },
    }),

  comments: L('comments', 'Comments', 'Comment ni maelezo kwa binadamu; Python haisomi chochote baada ya #.',
    'Add a comment above each line of a small program explaining what it does.',
    [
      { h: 'How do you write comments?', p: [
        'In Python a comment starts with the hash sign #. Python ignores everything from # to the end of the line. Comments are written for people: for you in the future and for anyone who reads your code.',
        'You can put a comment on its own line or at the end of a line of code.'],
        code: `# Say hello to the class\nprint("Hello, class!")\nprint(2 + 2)   # a comment can also follow code`,
        explain: ['The first line is only a comment, so it produces no output.', 'The second line prints the greeting.', 'In the third line, everything after # is ignored, so only 4 is printed.'] },
      { h: 'What kind of comments should you write?', p: [
        'Good comments explain why you do something, or what a tricky part is for. They do not repeat what the code already says. A comment such as “add 1 to x” beside x = x + 1 adds nothing.',
        'Keep comments up to date: a wrong comment is worse than none. If the code changes, change the comment too.',
        'You can also comment out a line temporarily to test your program without it. Put a # in front and remove it later.'],
        code: `PASS_MARK = 40   # set by the university regulations\nmark = 38\n\n# Students with exactly the pass mark are allowed to pass\nprint(mark >= PASS_MARK)\n# print("this line is switched off")`,
        explain: ['The first comment gives a reason for the number 40, which the code alone does not reveal.', 'The second comment explains a rule behind the comparison.', 'The last print is commented out, so Python skips it.'] },
      { h: 'Docstrings: comments for functions', p: [
        'A string written as the first line inside a function is a docstring. It describes what the function does and is shown by the help() tool. You will use it when you write your own functions.'],
        code: `def area(width, height):\n    """Return the area of a rectangle."""\n    return width * height\n\nprint(area(4, 5))\nprint(area.__doc__)`,
        explain: ['The text between triple quotes right under def is the docstring.', 'area(4, 5) returns 20.', 'area.__doc__ shows the docstring text.'] },
    ],
    {
      mistakes: ['Writing comments that only repeat the code.', 'Leaving old comments that no longer match the code.', 'Forgetting the space after # (it still works, but style guides recommend one space).'],
      exercises: [
        { q: 'Add a helpful comment to this: rate = 0.18', a: `rate = 0.18   # VAT rate used by the shop\nprint(rate)` },
      ],
      quiz: [
        { q: 'What does Python do with a line that starts with #?', options: ['Runs it', 'Ignores it', 'Prints it', 'Raises an error'], answer: 1, why: 'Everything after # on a line is a comment.' },
      ],
    }),

  zen: L('zen', 'The Zen of Python', 'Python ina kanuni za mtindo: rahisi ni bora kuliko ngumu, wazi ni bora kuliko fiche.',
    'Choose the three aphorisms you like most and write what each means in your own words.',
    [
      { h: 'A philosophy for writing code', p: [
        'Python has a small collection of guiding ideas called the Zen of Python, written by Tim Peters. Python itself will print them for you: just run the line import this.',
        'They are advice about taste: how to write code that other people (and the future you) can read and trust.'],
        code: `import this`,
        explain: ['import this loads a special module. When it loads it prints the Zen of Python as a side effect.', 'You can run this in any Python on any computer; it is a small “Easter egg” built in on purpose.'] },
      { h: 'The ideas that matter most for a beginner', p: [
        'Beautiful is better than ugly: choose clear names and tidy layout.',
        'Simple is better than complex: if a short, plain solution works, use it.',
        'Readability counts: code is read far more often than it is written.',
        'Errors should never pass silently: if something goes wrong, make it visible instead of hiding it.',
        'If the implementation is hard to explain, it is a bad idea. If it is easy to explain, it may be a good idea.',
        'In the face of ambiguity, refuse the temptation to guess: ask, test or print the value and look.'] },
    ],
    {
      quiz: [
        { q: 'Which statement is from the Zen of Python?', options: ['Clever is better than clear', 'Readability counts', 'Shorter is always better', 'Never write comments'], answer: 1, why: 'Readability counts is one of the core principles.' },
      ],
    }),

  indexerr: L('indexerr', 'Avoiding index errors with lists', 'IndexError hutokea unapoomba nafasi isiyokuwepo; kumbuka mwisho ni len - 1.',
    'Write code that safely prints the last item of a list, even when the list is empty.',
    [
      { h: 'Why index errors happen', p: [
        'A list with 4 items has valid indexes 0, 1, 2 and 3. Asking for index 4 (or more) raises IndexError: list index out of range. It is the most common mistake with lists, and it usually comes from an off-by-one thought: the last index is len(list) - 1, not len(list).'],
        code: `courses = ["MT 100", "ST 113", "MT 114", "FN 100"]\nprint(len(courses))\nprint(courses[3])\nprint(courses[len(courses) - 1])\nprint(courses[4])`,
        explain: ['len(courses) is 4, so the valid indexes are 0 to 3.', 'courses[3] is the last item, and courses[len(courses) - 1] is another way to write the same index.', 'courses[4] does not exist, so Python stops with IndexError. Read the message: it tells you exactly what went wrong.'] },
      { h: 'The negative index trick', p: [
        'courses[-1] always gives the last item, whatever the length is. That is why it is the usual way to get it. The only time it fails is when the list is empty, because there is no last item.'],
        code: `courses = ["MT 100", "ST 113"]\nprint(courses[-1])\nempty = []\nprint(empty[-1])`,
        explain: ['The first print shows “ST 113”.', 'An empty list has no items at all, so empty[-1] raises IndexError too.'] },
      { h: 'Protecting your code', p: [
        'Before you take an item, check that the list is not empty, or that the index is within the length. A non-empty list counts as True, so a simple if is enough.',
        'If you are not sure, print the list and its length while you debug: seeing the real values is the quickest way to find the mistake.'],
        code: `def last_item(items):\n    if items:\n        return items[-1]\n    return None\n\nprint(last_item(["a", "b", "c"]))\nprint(last_item([]))\n\nindex = 7\nitems = ["x", "y"]\nif 0 <= index < len(items):\n    print(items[index])\nelse:\n    print("index", index, "is outside the list")`,
        explain: ['last_item returns the final item when the list has something in it, otherwise None.', 'The last block checks 0 <= index < len(items) before using the index, so the program never crashes.'] },
    ],
    {
      mistakes: ['Using len(list) as an index. The last index is len(list) - 1.', 'Taking items[-1] from a list that may be empty.', 'Looping with range(len(items) + 1).'],
      exercises: [
        { q: 'Print the first and last items of ["a", "b", "c", "d"] and the item before the last.', a: `x = ["a", "b", "c", "d"]\nprint(x[0], x[-1], x[-2])` },
      ],
      quiz: [
        { q: 'A list has 5 items. What is the largest valid index?', options: ['5', '4', '6', '0'], answer: 1, why: 'Indexes run from 0 to len - 1.' },
        { q: 'What does [][-1] do?', options: ['Returns None', 'Returns 0', 'Raises IndexError', 'Returns []'], answer: 2, why: 'An empty list has no last item.' },
      ],
      challenge: {
        prompt: 'Write the function safe_last(items) that returns the last item, or "empty" when the list has no items.',
        starter: 'def safe_last(items):\n    pass\n',
        check: 'assert safe_last([1, 2, 3]) == 3, "safe_last([1, 2, 3]) should be 3"\nassert safe_last([]) == "empty", "safe_last([]) should be empty"',
        hint: 'if items: return items[-1]',
        solution: 'def safe_last(items):\n    if items:\n        return items[-1]\n    return "empty"\n\nprint(safe_last([1, 2, 3]), safe_last([]))',
      },
    }),

  indenterr: L('indenterr', 'Avoiding indentation errors', 'Indentation ndiyo inayoonyesha code ipi ni ya loop; kosa dogo huleta IndentationError.',
    'Fix the four broken snippets so each one runs correctly.',
    [
      { h: 'Indentation is part of the language', p: [
        'In many languages braces { } group code. Python uses indentation instead: the spaces at the start of a line. Lines indented the same amount form a block, and a block belongs to the line above it that ends with a colon.',
        'The common style is four spaces for each level. Be consistent: do not mix tabs and spaces in the same file.'],
        code: `for n in [1, 2]:\n    print("inside the loop", n)\n    print("still inside", n)\nprint("outside, runs once")`,
        explain: ['The two indented lines belong to the loop, so each runs twice.', 'The last line has no indent, so it is not part of the loop.'] },
      { h: 'Forgetting to indent', p: [
        'After a line that ends with a colon (for, if, while, def, …) Python expects an indented block. If you forget, you get IndentationError: expected an indented block.'],
        code: `# Wrong: the body is not indented\nmagicians = ["Alice", "David"]\nfor m in magicians:\nprint(m)`,
        explain: ['The for line ends with a colon, so Python expects an indented body.', 'print(m) starts at the left edge, so Python reports IndentationError.', 'Fix: put four spaces before print.'] },
      { h: 'Indenting too much, or at the wrong place', p: [
        'An extra indent where none is expected gives IndentationError: unexpected indent. A more dangerous mistake is a program that runs but behaves wrongly, because a line is inside a loop when it should be after it (or the other way round).'],
        code: `# Runs, but prints the thank-you message three times\nnames = ["Asha", "Juma", "Neema"]\nfor n in names:\n    print("Hello", n)\n    print("Thank you, everyone!")`,
        explain: ['The thank-you line is indented, so it is part of the loop and repeats for every name.', 'Remove the indent from that last line and it will run only once, after the loop.', 'This kind of logic error gives no error message, so always check the output.'] },
      { h: 'Forgetting the colon', p: [
        'A for, if, while or def line must end with a colon. Without it you get SyntaxError: expected \':\'.'],
        code: `# Wrong: no colon at the end of the for line\nfor n in range(3)\n    print(n)`,
        explain: ['Python finds the end of the line without a colon and stops with a SyntaxError that points at the problem.', 'Add the colon and the program works.'] },
    ],
    {
      mistakes: ['Mixing tabs and spaces. Configure your editor to insert four spaces when you press Tab.', 'Indenting a line that should be outside the loop.', 'Forgetting the colon at the end of for, if, while and def lines.'],
      exercises: [
        { q: 'Fix this so “Done” prints once: for n in range(3): print(n); print("Done") (with wrong indents).', a: `for n in range(3):\n    print(n)\nprint("Done")` },
      ],
      quiz: [
        { q: 'What must the line before an indented block end with?', options: ['A semicolon', 'A colon', 'A bracket', 'Nothing'], answer: 1, why: 'for, if, while and def lines all end with a colon.' },
        { q: 'A message you wanted once appears three times in a loop. What is the likely cause?', options: ['A typo', 'The line is indented inside the loop', 'A missing colon', 'A missing quote'], answer: 1, why: 'Indented lines belong to the loop and run on every round.' },
      ],
    }),

  style: L('style', 'Styling your code (PEP 8)', 'Mtindo mzuri: nafasi 4, mistari mifupi, majina yenye maana.',
    'Rewrite a messy snippet so it follows the style rules.',
    [
      { h: 'Why style matters', p: [
        'Code runs the same whether it is tidy or messy, but tidy code is far easier to read, share and fix. Python programmers follow a style guide called PEP 8. You do not need to memorise it; follow a few simple rules and your code will look professional.'] },
      { h: 'The rules you will use every day', p: [
        'Indent with four spaces per level.',
        'Keep lines to about 79 characters; break long lines inside brackets.',
        'Use two blank lines between top-level functions and classes, one blank line inside them to separate steps.',
        'Names: snake_case for variables and functions (total_marks), CapitalWords for classes (StudentRecord), ALL_CAPS for constants (PASS_MARK).',
        'Put spaces around operators and after commas: total = a + b, not total=a+b.',
        'Add a space after # in comments, and write at most a couple of sentences.'],
        code: `# Messy\nx=[1,2,3]\nfor i in x :\n print(i*2)\n\n# Tidy\nnumbers = [1, 2, 3]\nfor number in numbers:\n    print(number * 2)`,
        explain: ['The messy version works, but spacing is uneven, the name x says nothing and the indent is one space.', 'The tidy version uses a descriptive name, spaces around operators, no space before the colon and four spaces of indent.', 'Both produce the same result; only the second is pleasant to read.'] },
      { h: 'Good names', p: [
        'Choose names that describe the content: students, total_marks, is_registered. Avoid single letters except in short loops (i, n) and avoid names that look alike (l and 1, O and 0).'],
        code: `# Hard to read\nd = 7\nt = 6.5\nprint(d * t)\n\n# Clear\ndays_worked = 7\nhours_per_day = 6.5\nprint(days_worked * hours_per_day)`,
        explain: ['In the first part you must guess what d and t mean.', 'In the second part the names tell the story, so no comment is needed.'] },
    ],
    {
      mistakes: ['Using very long lines.', 'Mixing naming styles (totalMarks and total_marks) in one program.', 'Skipping spaces around operators.'],
      quiz: [
        { q: 'Which name follows the Python style for a variable?', options: ['TotalMarks', 'totalMarks', 'total_marks', 'TOTAL-MARKS'], answer: 2, why: 'Variables use lower-case words joined by underscores.' },
        { q: 'How many spaces are used for one level of indentation?', options: ['1', '2', '4', '8'], answer: 2, why: 'PEP 8 recommends four spaces.' },
      ],
    }),

  iflists: L('iflists', 'Using if statements with lists', 'Unganisha if na list: tafuta vitu maalum, hakikisha list si tupu.',
    'Print each requested topping only if the shop has it, and report the ones that are missing.',
    [
      { h: 'Checking for special items', p: [
        'Inside a for loop you can test each item and treat some of them differently. The if is indented under the for, and its block is indented once more.'],
        code: `toppings = ["mushrooms", "onions", "green peppers", "cheese"]\nfor t in toppings:\n    if t == "green peppers":\n        print("Sorry, we are out of green peppers right now.")\n    else:\n        print("Adding", t + ".")\nprint("Your pizza is ready!")`,
        explain: ['The loop takes each topping in turn.', 'For “green peppers” the if is True and the apology is printed; for all others the else adds the topping.', 'The last line is not indented, so it runs once after the loop.'] },
      { h: 'Checking that a list is not empty', p: [
        'Before you process a list, make sure it has something in it. An empty list counts as False, so you can write if requests: directly.'],
        code: `requests = []\nif requests:\n    for r in requests:\n        print("Making", r)\n    print("Done")\nelse:\n    print("Are you sure you want a plain pizza?")`,
        explain: ['requests is empty, so the condition is False and the else branch runs.', 'If you add items to requests, the loop runs instead.'] },
      { h: 'Using multiple lists', p: [
        'Combine a list of what is wanted with a list of what is available, and use in to compare.'],
        code: `available = ["mushrooms", "olives", "green peppers", "pepperoni", "pineapple", "extra cheese"]\nrequested = ["mushrooms", "french fries", "extra cheese"]\nfor item in requested:\n    if item in available:\n        print("Adding", item + ".")\n    else:\n        print("Sorry, we don't have", item + ".")\nprint("Finished making your pizza!")`,
        explain: ['For each requested item the program asks whether it is in the available list.', 'mushrooms and extra cheese are available; french fries is not, so the else branch reports it.'] },
    ],
    {
      mistakes: ['Putting the final message inside the loop by indenting it.', 'Comparing with == against a list instead of using in.', 'Forgetting to handle the empty-list case.'],
      exercises: [
        { q: 'From [3, 8, 12, 5, 20], print only the numbers greater than 7.', a: `for n in [3, 8, 12, 5, 20]:\n    if n > 7:\n        print(n)` },
        { q: 'Print “Sorry” if the list guests is empty, otherwise print each guest.', a: `guests = []\nif guests:\n    for g in guests:\n        print(g)\nelse:\n    print("Sorry, no guests")` },
      ],
      quiz: [
        { q: 'Which test is True when the list items has at least one element?', options: ['if items == True:', 'if items:', 'if len(items) == 0:', 'if items is None:'], answer: 1, why: 'A non-empty list is truthy.' },
      ],
      challenge: {
        prompt: 'Build missing: a list of the requested items that are not in available (keep the order of requested).',
        starter: 'available = ["tea", "coffee", "milk"]\nrequested = ["tea", "juice", "milk", "soda"]\nmissing = []\n',
        check: 'assert missing == ["juice", "soda"], "missing should be [juice, soda], got " + str(missing)',
        hint: 'Loop over requested and append when item not in available.',
        solution: 'available = ["tea", "coffee", "milk"]\nrequested = ["tea", "juice", "milk", "soda"]\nmissing = []\nfor item in requested:\n    if item not in available:\n        missing.append(item)\nprint(missing)',
      },
    }),

  input: L('input', 'User input with input()', 'input() husoma maandishi kutoka kwa mtumiaji; hurudisha string kila mara.',
    'Ask for a name and a year of birth, then print the age.',
    [
      { h: 'How input() works', p: [
        'The input() function pauses the program, shows a message called a prompt, waits for the user to type something and press Enter, and then returns what was typed as a string.',
        'In VENUE the browser will pop up a small box asking for the value. Type your answer and confirm.'],
        code: `name = input("What is your name? ")\nprint("Hello, " + name + "!")`,
        explain: ['The text inside input(...) is the prompt the user sees.', 'Whatever is typed is stored in name as text.', 'We then join it to a greeting. When you press Run, a box will appear asking for your name.'] },
      { h: 'Writing clear prompts', p: [
        'Tell the user exactly what to enter and in which form: “Enter your year of birth (for example 2004): ”. A good prompt prevents wrong answers. Leave a space at the end so the typed answer does not touch the message.',
        'For a long prompt, build it in a variable first and pass the variable to input().'],
        code: `prompt = "If you tell us who you are, we can personalize the messages you see."\nprompt += "\\nWhat is your first name? "\nname = input(prompt)\nprint("Hello, " + name + "!")`,
        explain: ['prompt holds the first sentence.', '+= adds a second part to the same variable, starting with \\n which means “new line”.', 'The finished prompt is passed to input().'] },
      { h: 'Using int() to accept numerical input', p: [
        'input() always returns text, even when the user types digits. To calculate, convert with int() (whole numbers) or float() (decimals).',
        'If the user types something that is not a number, int() raises ValueError. You will learn how to handle that in the Exceptions chapter.'],
        code: `year = input("Year of birth? ")\nprint(type(year))\nage = 2026 - int(year)\nprint("You are about", age)`,
        explain: ['type(year) shows <class \'str\'>: the answer is text.', 'int(year) converts it to a number so we can subtract.', 'Try typing 2005 when asked: the program prints 21.'] },
      { h: 'The modulo operator, used with input', p: [
        'The % operator gives the remainder of a division. It is a quick way to test even or odd, or whether a number divides evenly into another.'],
        code: `number = int(input("Enter a number: "))\nif number % 2 == 0:\n    print(number, "is even")\nelse:\n    print(number, "is odd")`,
        explain: ['The text typed is converted with int() immediately.', 'number % 2 is 0 for even numbers and 1 for odd numbers.', 'The if/else prints the right word.'] },
    ],
    {
      mistakes: ['Forgetting that input() returns text, then trying to add or compare it as a number.', 'Writing int(input) without brackets after input.', 'Not telling the user what to type.'],
      exercises: [
        { q: 'Ask for two numbers and print their sum.', a: `a = float(input("First number: "))\nb = float(input("Second number: "))\nprint("Sum:", a + b)` },
        { q: 'Ask for a mark and say whether the student passes (40 or more).', a: `mark = int(input("Mark: "))\nif mark >= 40:\n    print("Pass")\nelse:\n    print("Fail")` },
      ],
      quiz: [
        { q: 'What type does input() always return?', options: ['int', 'float', 'str', 'bool'], answer: 2, why: 'It returns text; convert it with int() or float() when you need a number.' },
        { q: 'What does 17 % 5 give?', options: ['3', '2', '3.4', '5'], answer: 1, why: '17 = 3 × 5 + 2, so the remainder is 2.' },
      ],
    }),

  whilelists: L('whilelists', 'while loops with lists and dictionaries', 'Tumia while kuhamisha vitu kati ya lists, kuondoa kila nakala, na kujaza dictionary.',
    'Move every item from an unconfirmed list to a confirmed list.',
    [
      { h: 'Moving items from one list to another', p: [
        'A for loop is not the best tool when you want to change a list while you work through it. A while loop is: keep going as long as the list still has items, and take one off each time.',
        'pop() removes the last item and returns it, so you can store it elsewhere.'],
        code: `unconfirmed = ["alice", "brian", "candace"]\nconfirmed = []\nwhile unconfirmed:\n    user = unconfirmed.pop()\n    print("Verifying user:", user.title())\n    confirmed.append(user)\nprint("The following users have been confirmed:")\nfor user in confirmed:\n    print(user.title())`,
        explain: ['while unconfirmed: is True as long as the list has at least one item.', 'Each round removes the last item and moves it to confirmed.', 'When the list is empty the loop stops. Notice that the users arrive in reverse order because pop() takes from the end.'] },
      { h: 'Removing all instances of a value', p: [
        'remove() deletes only the first match. To delete every copy, repeat while the value is still in the list.'],
        code: `pets = ["dog", "cat", "dog", "goldfish", "cat", "rabbit", "cat"]\nprint(pets)\nwhile "cat" in pets:\n    pets.remove("cat")\nprint(pets)`,
        explain: ['The test "cat" in pets is True while at least one cat remains.', 'Each round removes one cat. After three rounds none remain and the loop ends.'] },
      { h: 'Filling a dictionary with user input', p: [
        'A while loop can collect answers until the user says stop. A flag variable (a True/False switch) decides when to end.'],
        code: `responses = {}\npolling_active = True\nwhile polling_active:\n    name = input("What is your name? ")\n    answer = input("Which mountain would you like to climb? ")\n    responses[name] = answer\n    repeat = input("Would another person like to respond? (yes/no) ")\n    if repeat == "no":\n        polling_active = False\nprint("--- Poll results ---")\nfor name, answer in responses.items():\n    print(name, "would like to climb", answer + ".")`,
        explain: ['responses starts as an empty dictionary and polling_active is the flag.', 'Each round asks two questions and stores the pair name → answer.', 'When the user types “no”, the flag becomes False and the loop ends. The results are then printed with items().'] },
    ],
    {
      mistakes: ['Looping with for while removing items from the same list.', 'Forgetting that pop() removes the last item, so the order reverses.', 'Writing while "cat" in pets without anything that removes cats: an infinite loop.'],
      exercises: [
        { q: 'Remove every 0 from [0, 3, 0, 5, 0].', a: `n = [0, 3, 0, 5, 0]\nwhile 0 in n:\n    n.remove(0)\nprint(n)` },
      ],
      quiz: [
        { q: 'Why is while items: used to empty a list?', options: ['It copies the list', 'An empty list is False, so the loop stops', 'It sorts the list', 'It is faster than for'], answer: 1, why: 'A non-empty list is True; when it empties, the loop ends.' },
      ],
      challenge: {
        prompt: 'Using a while loop, move all numbers from todo to done, one at a time, using pop(). Afterwards todo must be empty and done must hold 3 items.',
        starter: 'todo = [1, 2, 3]\ndone = []\n',
        check: 'assert todo == [], "todo should be empty"\nassert sorted(done) == [1, 2, 3], "done should contain 1, 2, 3"',
        hint: 'while todo: done.append(todo.pop())',
        solution: 'todo = [1, 2, 3]\ndone = []\nwhile todo:\n    done.append(todo.pop())\nprint(todo, done)',
      },
    }),
};
