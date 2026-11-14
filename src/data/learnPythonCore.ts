import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/**
 * Core Python notes (variables, text, numbers, lists, loops, tuples).
 * Written from scratch with the structure of standard beginner courses as a guide.
 */
export const PYTHON_CORE: LearnLesson[] = [
  L('variables', 'Variables and names', 'Variable ni jina linaloelekeza kwenye thamani; majina yawe wazi na yafuate sheria.',
    'Create variables for a student’s name, year and GPA and print one sentence using all three.',
    [
      { h: 'What a variable really is', p: [
        'Think of a variable as a label you stick on a value. When you write message = "Hello", Python creates the text "Hello" in memory and sticks the label message on it.',
        'You can read the value any time by using the label, and you can move the label to a different value later. Python does not need you to say in advance what kind of value it will be.'],
        code: `message = "Hello, VENUE!"\nprint(message)\n\nmessage = "Welcome back"   # the label now points to new text\nprint(message)`, explain: ["Line 1: message = \"Hello, VENUE!\" creates the text and attaches the name message to it. The = sign here means “store”, not “equals”.", "Line 2: print(message) looks up the name message, finds the text and shows it on the screen.", "Line 4: assigning again does not edit the old text. It creates new text and moves the label message to it. The old text is simply forgotten.", "Line 5: print(message) now shows the new text. Anything written after # is a comment and Python ignores it."] },
      { h: 'Several variables, several types', p: [
        'A program usually keeps many pieces of information. Each gets its own variable. They can hold different kinds of values: text, whole numbers, decimals.'],
        code: `name = "Asha"\nyear = 2\ngpa = 4.2\nprint(name)\nprint(year)\nprint(gpa)\nprint(name, "is in year", year, "with GPA", gpa)`, explain: ["name = \"Asha\" stores text (a string). year = 2 stores a whole number (an int). gpa = 4.2 stores a decimal number (a float).", "Each print(...) on its own line shows one value on its own line.", "The last print gives several things separated by commas. print puts a space between them automatically, so you get one readable sentence."] },
      { h: 'Rules for naming', p: [
        'A name can contain letters, digits and underscores, but it cannot start with a digit and cannot contain spaces. first_name is fine; 1st_name and first name are not.',
        'Names are case-sensitive: score, Score and SCORE are three different variables.',
        'Do not use Python keywords such as if, for, class or True as names. Avoid names of built-in functions such as print or list, because you would hide the real function.',
        'Choose descriptive names. student_count tells the reader much more than sc, and a clear name saves you from writing a comment.'],
        code: `student_count = 120\naverage_mark = 64.5\nis_registered = True\nprint(student_count, average_mark, is_registered)`, explain: ["All three names use lower-case words joined by underscores. This style is called snake_case and is the standard in Python.", "student_count holds an int, average_mark a float and is_registered a bool (True or False). Notice that True starts with a capital letter; true would be a NameError.", "The names describe what they hold, so the code explains itself."] },
      { h: 'Assigning several at once', p: [
        'You can assign several variables in one line. The values on the right are matched with the names on the left by position. You can also give one value to many names.'],
        code: `x, y, z = 10, 20, 30\nprint(x, y, z)\n\na = b = c = 0\nprint(a, b, c)\n\n# swap two values without a helper variable\nx, y = y, x\nprint(x, y)`, explain: ["x, y, z = 10, 20, 30 pairs the names and values by position: x gets 10, y gets 20, z gets 30. The count on both sides must match.", "a = b = c = 0 gives the same value to all three names, which is handy for starting counters at zero.", "x, y = y, x swaps the two values. Python first builds the pair (y, x) from the current values and only then assigns, so nothing is overwritten too early. Before the swap x was 10 and y was 20; afterwards x is 20 and y is 10."] },
      { h: 'Constants', p: [
        'Python has no real constants, but by convention a name written in capital letters means “do not change this value”. Use it for fixed numbers such as the pass mark.'],
        code: `PASS_MARK = 40\nmarks = 52\nprint(marks >= PASS_MARK)`, explain: ["PASS_MARK is written in capitals to tell every reader “this value is fixed, do not change it”. Python will not stop you from changing it; it is only a convention.", "marks >= PASS_MARK compares two numbers and produces a bool. 52 is at least 40, so the answer is True.", "Using a named constant is better than typing 40 in many places: if the pass mark changes you edit one line."] },
    ],
    {
      mistakes: [
        'Using a variable before giving it a value gives NameError. Python reads the file from top to bottom, so assign first, use later.',
        'Typing the name differently (message vs mesage) is a NameError too. A typo is by far the most common cause.',
        'A single = means “assign”. It is not a comparison. To compare you will use == (shown in the if lesson).',
      ],
      exercises: [
        { q: 'Store your name and your programme in two variables and print “Name studies Programme”.', a: `name = "Mussa"\nprogramme = "Mathematics and Statistics"\nprint(name, "studies", programme)` },
        { q: 'Swap the values of a = 5 and b = 9 and print both.', a: `a, b = 5, 9\na, b = b, a\nprint(a, b)` },
        { q: 'Which of these are valid names: total_marks, 2nd_year, my score, _temp, class?', a: `# valid: total_marks and _temp\n# 2nd_year starts with a digit, "my score" has a space,\n# class is a Python keyword\ntotal_marks = 1\n_temp = 2\nprint(total_marks, _temp)` },
      ],
    }),

  L('strings1', 'Strings: the basics', 'String ni maandishi kwenye nukuu; unaweza kubadilisha herufi kubwa/ndogo na kuunganisha.',
    'Take the text "data science" and print it in Title Case and in upper case.',
    [
      { h: 'Text in quotes', p: [
        'Any text inside quotes is a string. You may use single quotes or double quotes; the only rule is to close with the same kind you opened with.',
        'Having both kinds lets you put one inside the other without trouble: "It\'s fine" or \'He said "hi"\'.'],
        code: `print("A string in double quotes")\nprint('A string in single quotes')\nprint("It's easy to include an apostrophe")\nprint('She said "welcome" to us')`, explain: ["Each print shows the text between the quotes, without the quotes themselves.", "Line 3 uses double quotes outside, so the apostrophe inside it does not end the string.", "Line 4 does the opposite: single quotes outside, double quotes inside. Choose whichever avoids clashes."] },
      { h: 'Changing case', p: [
        'Strings come with methods: actions attached to the value, called with a dot. title() capitalises each word, upper() makes everything capital, lower() makes everything small.',
        'A method does not change the original; it gives you a new string. If you want to keep the result, store it in a variable.',
        'lower() is very useful when you compare text typed by users, because “Yes”, “YES” and “yes” all become “yes”.'],
        code: `name = "ada lovelace"\nprint(name.title())\nprint(name.upper())\nprint("PYTHON".lower())\n\nanswer = "YES"\nprint(answer.lower() == "yes")`, explain: ["name.title() returns “Ada Lovelace”: the first letter of every word becomes capital. name itself is unchanged.", "name.upper() returns everything in capitals; \"PYTHON\".lower() returns everything in small letters. Methods can be called directly on a text value.", "answer.lower() == \"yes\" first turns “YES” into “yes”, then compares. The == sign asks a question (“are these equal?”) and the answer is True.", "This is the usual trick for accepting “Yes”, “YES” and “yes” as the same answer."] },
      { h: 'Joining strings', p: [
        'The + sign glues strings together. This is called concatenation. Remember to add spaces yourself if you want them.',
        'Using + is fine for two or three pieces. For longer messages the f-strings in the next lesson are easier to read.'],
        code: `first = "ada"\nlast = "lovelace"\nfull = first + " " + last\nprint(full.title())\nprint("Hello, " + full.title() + "!")`, explain: ["full = first + \" \" + last glues three pieces: “ada”, a space, “lovelace”. Without the middle space you would get “adalovelace”.", "full.title() capitalises each word of the result.", "The last line shows concatenation inside a print: “Hello, ” + the title-cased name + “!”. Every piece must be a string, otherwise Python raises TypeError."] },
      { h: 'Length, counting and searching', p: [
        'len() tells how many characters a string has, spaces included. count() counts how many times a piece appears. find() returns the position of the first match, or -1 if it is not there. The keyword in just answers True or False.'],
        code: `text = "statistics is fun"\nprint(len(text))\nprint(text.count("s"))\nprint(text.find("is"))\nprint(text.find("xyz"))\nprint("fun" in text)\nprint(text.startswith("stat"), text.endswith("fun"))`, explain: ["len(text) counts every character, including the spaces: “statistics is fun” has 17.", "text.count(\"s\") counts the letter s everywhere in the text. text.find(\"is\") returns the index where “is” first begins (the first match is inside “statistics”). find returns -1 when nothing matches.", "\"fun\" in text answers True or False. startswith and endswith check the beginning and the end; the comma in print shows both answers on one line."] },
      { h: 'Characters by position', p: [
        'Each character has a position, starting from 0. Use square brackets to pick one. Negative numbers count from the end, so -1 is the last character.',
        'You cannot change a character of an existing string. Strings are immutable; build a new one instead.'],
        code: `word = "Python"\nprint(word[0])\nprint(word[5])\nprint(word[-1])\nprint(word[1:4])   # characters 1, 2, 3\nprint(word[::-1])  # reversed`, explain: ["word[0] is “P”: counting starts at zero. word[5] is “n”, the sixth and last character, and word[-1] is also “n” because -1 means “the last”.", "word[1:4] is a slice: it begins at index 1 and stops before index 4, so you get indexes 1, 2 and 3: “yth”.", "word[::-1] uses a step of -1, which walks the string backwards and so reverses it."] },
    ],
    {
      mistakes: [
        'Forgetting a closing quote gives a SyntaxError and often the whole next line turns “red”. Check quotes first.',
        'Writing "Age: " + 20 fails with TypeError because you cannot add text and a number. Convert with str(20) or use an f-string.',
        'Expecting name.upper() to change name itself. It returns a new string; write name = name.upper() to keep it.',
      ],
      exercises: [
        { q: 'Print “  hello  ” without the extra spaces, in capitals.', a: `s = "  hello  "\nprint(s.strip().upper())` },
        { q: 'How many times does the letter “a” appear in “banana”, and where is the first “n”?', a: `w = "banana"\nprint(w.count("a"))\nprint(w.find("n"))` },
        { q: 'Print the first and last letters of “mathematics”.', a: `w = "mathematics"\nprint(w[0], w[-1])` },
      ],
    }),

  L('strings2', 'Strings: formatting and whitespace', 'f-string inaweka thamani ndani ya maandishi; strip() inaondoa nafasi.',
    'Print a line like “Asha scored 78.50 (B)” using an f-string with two decimals.',
    [
      { h: 'f-strings', p: [
        'Put the letter f before the opening quote and write variable names inside curly brackets. Python replaces them with the values. It is the cleanest way to build a message.',
        'You can even put small calculations inside the brackets.'],
        code: `name = "Asha"\nmarks = 78.5\nprint(f"{name} scored {marks}")\nprint(f"Double of 21 is {21 * 2}")\nprint(f"{name.upper()} passed: {marks >= 40}")`, explain: ["f\"{name} scored {marks}\": the f before the quote switches on formatting. Whatever is inside { } is evaluated and replaced by its value.", "{21 * 2} shows that a full expression can go inside the brackets. Python calculates 42 and inserts it.", "{name.upper()} calls a method inside the brackets, and {marks >= 40} inserts True or False. f-strings can hold anything that produces a value."] },
      { h: 'Controlling the format', p: [
        'After a colon inside the brackets you can say how to show the value. .2f means two decimals, , adds thousands separators, and a number sets a minimum width (useful for tables).'],
        code: `price = 1234567.891\nprint(f"{price:.2f}")\nprint(f"{price:,.2f}")\nprint(f"{0.256:.1%}")\nprint(f"|{'left':<10}|{'right':>10}|")`, explain: [":.2f means “show as a float with 2 decimals”. 1234567.891 becomes 1234567.89 (it rounds, it does not cut).", ":,.2f adds commas as thousands separators: 1,234,567.89.", ":.1% multiplies by 100 and adds a percent sign: 0.256 becomes 25.6%.", "The last line builds a mini table: :<10 pads the word to 10 characters aligned left, :>10 aligns right. The | characters just mark the edges so you can see the padding."] },
      { h: 'Tabs and new lines', p: [
        'Some characters cannot be typed directly in a string, so you write them with a backslash: \\n starts a new line and \\t inserts a tab. Triple quotes let a string run over many lines.'],
        code: `print("Languages:\\n\\tPython\\n\\tJavaScript")\nreport = """Line one\nLine two\nLine three"""\nprint(report)`, explain: ["\\n inside a string means “start a new line” and \\t means “insert a tab”. They are written with a backslash because you cannot type an invisible character directly. That is why the first print produces three lines.", "Triple quotes \"\"\" ... \"\"\" keep the string exactly as typed, including real line breaks, so you do not need \\n.", "print(report) therefore shows three lines."] },
      { h: 'Removing extra spaces', p: [
        'Spaces around text are invisible but they break comparisons: "yes " is not equal to "yes". strip() removes them from both ends; lstrip() and rstrip() work on one side only.',
        'replace() swaps one piece of text for another, and split() cuts a string into a list.'],
        code: `raw = "  yes  "\nprint(raw == "yes")\nprint(raw.strip() == "yes")\nprint("2026-11-14".replace("-", "/"))\nprint("a, b, c".split(", "))\nprint(" | ".join(["x", "y", "z"]))`, explain: ["raw has two spaces on each side. raw == \"yes\" is False because the spaces count as characters.", "raw.strip() removes spaces (and tabs/new lines) from both ends, so the comparison becomes True.", "replace(\"-\", \"/\") changes every dash into a slash. split(\", \") cuts the text wherever the separator appears and returns a list. \" | \".join(list) does the reverse: it glues the list items together using the text before .join as the glue."] },
      { h: 'Removing a prefix or suffix', p: [
        'removeprefix() and removesuffix() cut a known start or ending, but only if it is really there. They are safer than slicing by length.'],
        code: `url = "https://udsm.ac.tz"\nprint(url.removeprefix("https://"))\nfile = "report.pdf"\nprint(file.removesuffix(".pdf"))`, explain: ["url.removeprefix(\"https://\") removes that exact start, leaving “udsm.ac.tz”. If the text did not start with it, nothing would change.", "file.removesuffix(\".pdf\") removes the ending and leaves “report”.", "This is safer than slicing by a fixed length such as url[8:], which would break as soon as the prefix changes."] },
    ],
    {
      mistakes: [
        'Forgetting the f before the quote prints {name} literally instead of the value.',
        'Using the same kind of quote inside the f-string as outside it. Use the other kind for the inner text.',
        'Comparing user input without strip() and lower(), then wondering why “Yes ” is rejected.',
      ],
      exercises: [
        { q: 'Show the number 98765.4321 with thousands separators and 1 decimal.', a: `n = 98765.4321\nprint(f"{n:,.1f}")` },
        { q: 'Print a mini table: three course codes, each on its own line, indented with a tab.', a: `print("Courses:\\n\\tMT 100\\n\\tST 113\\n\\tMT 114")` },
        { q: 'Clean the string "  Dar es Salaam\\n" and print its length.', a: `s = "  Dar es Salaam\\n"\nclean = s.strip()\nprint(clean)\nprint(len(clean))` },
      ],
    }),

  L('numbers', 'Numbers and arithmetic', 'int ni namba kamili, float ni yenye nukta; ** ni nguvu, // ni mgawanyo kamili, % ni baki.',
    'Compute the average of 56, 71 and 84 and show it with one decimal.',
    [
      { h: 'Integers', p: [
        'Whole numbers are ints. The usual operators work: + - * /. Use ** for powers and brackets to control the order, exactly as in mathematics.',
        'Python follows normal precedence: powers first, then multiplication and division, then addition and subtraction.'],
        code: `print(2 + 3)\nprint(10 - 4)\nprint(6 * 7)\nprint(2 ** 8)\nprint(2 + 3 * 4)\nprint((2 + 3) * 4)`, explain: ["Each line is one calculation printed on its own. 2 ** 8 means 2 to the power 8, which is 256.", "2 + 3 * 4 is 14, not 20, because multiplication is done before addition, just as in mathematics.", "(2 + 3) * 4 is 20: brackets force the addition to happen first. When in doubt, add brackets; they never hurt."] },
      { h: 'Division and remainder', p: [
        '/ always gives a decimal (float), even when the answer is whole. // gives only the whole part (floor division). % gives the remainder, which is perfect for questions like “is this number even?”.',
        'divmod(a, b) gives both at once.'],
        code: `print(17 / 5)\nprint(17 // 5)\nprint(17 % 5)\nprint(divmod(17, 5))\nprint(10 % 2 == 0)   # even?\nprint(-7 // 2)       # floors towards minus infinity`, explain: ["17 / 5 is 3.4: the normal division always returns a float.", "17 // 5 is 3: the whole number of times 5 fits into 17. 17 % 5 is 2: what is left over (17 = 3 × 5 + 2). divmod gives both answers as a pair: (3, 2).", "10 % 2 == 0 is True for every even number, so remainder 0 is the standard even test.", "-7 // 2 is -4, not -3: floor division always rounds down towards minus infinity."] },
      { h: 'Floats and rounding', p: [
        'Any number with a decimal point is a float. Computers store floats in binary, so some answers carry a tiny error, such as 0.1 + 0.2. This is normal in every language.',
        'Use round(x, n) to round for display, and avoid comparing floats with == when exact equality matters; compare with a small tolerance instead.'],
        code: `print(0.1 + 0.2)\nprint(round(0.1 + 0.2, 2))\nprint(3.7 * 2)\nprint(abs(-5.5), round(3.14159, 3))\n\nimport math\nprint(math.isclose(0.1 + 0.2, 0.3))`, explain: ["0.1 + 0.2 prints 0.30000000000000004. Computers store decimals in binary, and 0.1 cannot be stored exactly, just like 1/3 cannot be written exactly in decimal.", "round(0.1 + 0.2, 2) gives 0.3 for display. abs() removes the sign and round(3.14159, 3) keeps three decimals.", "math.isclose(a, b) answers “are these equal apart from tiny errors?” and is the right way to compare floats."] },
      { h: 'Big numbers and readability', p: [
        'Python integers can be as large as memory allows. For long numbers you may write underscores; Python ignores them.'],
        code: `population = 63_588_334\nprint(population)\nprint(2 ** 100)`, explain: ["The underscores in 63_588_334 are ignored by Python; they only help your eyes read big numbers.", "2 ** 100 shows that Python integers never overflow. The result has 31 digits and is exact."] },
      { h: 'Converting between types', p: [
        'int(), float() and str() convert values. This matters because text read from a file or from a user is always a string, even if it looks like a number.',
        'int("3.5") fails; convert in two steps instead: int(float("3.5")).'],
        code: `a = int("42")\nb = float("3.5")\nc = str(100)\nprint(a + 8, b * 2, c + " marks")\nprint(int(3.99))       # cuts the decimals, does not round\nprint(int(float("3.5")))`, explain: ["int(\"42\") turns the text “42” into the number 42, so we can add 8 and get 50. float(\"3.5\") gives 3.5, and str(100) gives the text “100”.", "c + \" marks\" joins two strings, which is allowed. Adding the number 100 directly would be a TypeError.", "int(3.99) is 3: converting to int cuts off the decimals, it does not round. int(float(\"3.5\")) shows the two-step way to convert text with a decimal point."] },
      { h: 'Handy built-in functions', p: [
        'abs() gives the size of a number without the sign. pow(a, b) is the same as a ** b. min(), max() and sum() work on several values or a list. The math module adds sqrt, pi, floor, ceil, log and much more.'],
        code: `import math\nprint(abs(-12), pow(2, 5))\nprint(min(4, 9, 1), max(4, 9, 1))\nprint(math.sqrt(81), math.floor(2.8), math.ceil(2.1))\nprint(round(math.pi, 4), math.log10(1000))`, explain: ["abs(-12) is 12. pow(2, 5) is 32, the same as 2 ** 5.", "min(4, 9, 1) is 1 and max(...) is 9: they accept several values.", "math.sqrt(81) is 9.0 (the square root is always a float). floor rounds down, ceil rounds up.", "math.log10(1000) is 3.0 because 10 to the power 3 is 1000. round(math.pi, 4) shows pi to four decimals."] },
    ],
    {
      mistakes: [
        'Expecting 7 / 2 to be 3. It is 3.5; use 7 // 2 for the whole part.',
        'Adding a string and a number: "5" + 5 is a TypeError, while "5" * 3 gives "555". Convert first.',
        'Trusting float results to be exact. Round for display and use math.isclose for comparisons.',
      ],
      exercises: [
        { q: 'A student has 56, 71 and 84. Print the average with 1 decimal.', a: `marks = [56, 71, 84]\navg = sum(marks) / len(marks)\nprint(f"{avg:.1f}")` },
        { q: 'Convert 1234 seconds to minutes and seconds using // and %.', a: `m, s = divmod(1234, 60)\nprint(m, "min", s, "s")` },
        { q: 'Compute the area and circumference of a circle with radius 7.', a: `import math\nr = 7\nprint(round(math.pi * r ** 2, 2))\nprint(round(2 * math.pi * r, 2))` },
        { q: 'Compound interest: 500000 at 8% for 3 years, using ** .', a: `p = 500000\nrate = 0.08\nprint(round(p * (1 + rate) ** 3, 2))` },
      ],
    }),

  L('lists1', 'Lists: creating and changing', 'List ni mkusanyiko wenye mpangilio; index huanza 0; unaweza kuongeza, kubadilisha na kuondoa.',
    'Make a list of 4 courses, change the second one and add a fifth.',
    [
      { h: 'What is a list?', p: [
        'A list keeps many values in a fixed order inside square brackets. It can hold any kind of value, even a mix. Lists are the most used structure in Python.',
        'Print a list and Python shows the brackets and quotes. Print its items one by one if you only want the values.'],
        code: `courses = ["MT 100", "ST 113", "MT 114", "FN 100"]\nprint(courses)\nprint(len(courses))\nmixed = ["Asha", 21, 4.2, True]\nprint(mixed)`, explain: ["Square brackets create the list; commas separate the items. Strings inside need quotes, numbers do not.", "print(courses) shows the list exactly as Python writes it, with brackets and quotes. len(courses) is 4.", "A list may mix types. mixed holds a string, an int, a float and a bool together."] },
      { h: 'Reaching items by index', p: [
        'Each item has a position called an index. The first item is at 0, the second at 1, and so on. Negative indexes count from the end: -1 is the last item.',
        'Asking for an index that does not exist raises IndexError. The last valid index is always len(list) - 1.'],
        code: `courses = ["MT 100", "ST 113", "MT 114", "FN 100"]\nprint(courses[0])\nprint(courses[2])\nprint(courses[-1])\nprint(courses[-2])\nprint(f"First course: {courses[0]}")`, explain: ["courses[0] is the first item and courses[2] the third.", "courses[-1] is the last item and courses[-2] the one before it. Negative indexes are a shortcut so you never need len().", "The f-string at the end uses an index inside the brackets: {courses[0]} inserts the first course."] },
      { h: 'Changing and adding items', p: [
        'Assign to an index to replace an item. append() adds to the end. insert(i, x) puts an item at position i and moves the rest along. extend() adds many items at once.'],
        code: `courses = ["MT 100", "ST 113"]\ncourses[1] = "ST 114"\ncourses.append("MT 114")\ncourses.insert(0, "DS 112")\ncourses.extend(["FN 100", "FN 101"])\nprint(courses)`, explain: ["courses[1] = \"ST 114\" replaces the item at index 1, so “ST 113” disappears.", "append(\"MT 114\") adds at the end. insert(0, \"DS 112\") adds at index 0 and pushes every other item one place to the right.", "extend([...]) adds each item of another list to the end, one by one. The final print shows the whole list in its new order."] },
      { h: 'Removing items', p: [
        'Choose the tool by what you know. del list[i] removes by position. pop() removes the last item (or the one at a given index) and gives it back to you. remove(x) removes the first item equal to x. clear() empties the list.'],
        code: `items = ["a", "b", "c", "d", "e"]\ndel items[0]\nprint(items)\nlast = items.pop()\nprint(last, items)\nsecond = items.pop(1)\nprint(second, items)\nitems.remove("b")\nprint(items)`, explain: ["del items[0] deletes the item at index 0 (“a”). Nothing is returned.", "items.pop() removes the last item (“e”) and gives it back, so we can store it in last. After that the list is [\"b\", \"c\", \"d\"].", "items.pop(1) removes the item at index 1, which is now “c”, and returns it.", "items.remove(\"b\") searches for the value “b” and removes its first occurrence. Use del or pop when you know the position, remove when you know the value."] },
      { h: 'Checking before you act', p: [
        'Use in to test whether a value is in a list, and count() or index() to learn more. Check first and you avoid ValueError from remove() on a missing item.'],
        code: `tools = ["pen", "ruler", "pen", "eraser"]\nprint("ruler" in tools)\nprint(tools.count("pen"))\nprint(tools.index("eraser"))\nif "glue" in tools:\n    tools.remove("glue")\nelse:\n    print("glue was not there")`, explain: ["\"ruler\" in tools is True. tools.count(\"pen\") is 2, because “pen” appears twice. tools.index(\"eraser\") is 3, the position of the first match.", "The if test protects remove(): glue is not in the list, so the else branch runs. Without the check Python would raise ValueError."] },
    ],
    {
      mistakes: [
        'Counting from 1. The first item is index 0; the third item is index 2.',
        'Using an index that is too large: with 4 items, courses[4] is an IndexError.',
        'Writing result = my_list.append(5). append changes the list and returns None, so result is None.',
        'Calling remove() on something that is not in the list causes ValueError. Test with in first.',
      ],
      exercises: [
        { q: 'Start with ["a","b","c"], add "d" at the end and "z" at the start, then print it.', a: `letters = ["a", "b", "c"]\nletters.append("d")\nletters.insert(0, "z")\nprint(letters)` },
        { q: 'Remove the item "b" and then pop the last item. Print what you popped.', a: `letters = ["z", "a", "b", "c", "d"]\nletters.remove("b")\nprint(letters.pop())\nprint(letters)` },
        { q: 'Print the last item of a list without knowing its length.', a: `data = [4, 8, 15, 16, 23, 42]\nprint(data[-1])` },
      ],
    }),

  L('lists2', 'Lists: sorting and organising', 'sort() hupanga list yenyewe; sorted() inatoa nakala mpya; reverse() inageuza.',
    'Sort a list of marks from highest to lowest without changing the original.',
    [
      { h: 'Sorting for good: sort()', p: [
        'list.sort() puts the items in order and changes the list itself, permanently. Numbers sort by value and text sorts alphabetically. Add reverse=True for the opposite order.'],
        code: `marks = [55, 72, 40, 88, 63]\nmarks.sort()\nprint(marks)\nmarks.sort(reverse=True)\nprint(marks)\nnames = ["juma", "Asha", "baraka"]\nnames.sort()\nprint(names)`, explain: ["marks.sort() reorders the list itself from smallest to largest. There is no new list; the old order is gone.", "sort(reverse=True) orders from largest to smallest.", "names sorts alphabetically by character codes, so “Asha” (capital A) comes before “baraka” and “juma” (small letters)."] },
      { h: 'Sorting for now: sorted()', p: [
        'sorted(list) returns a new sorted list and leaves the original as it was. Use it when you still need the original order afterwards.',
        'Capital letters sort before small letters. To sort names ignoring case, give a key function: key=str.lower.'],
        code: `marks = [55, 72, 40, 88, 63]\nprint(sorted(marks))\nprint(marks)   # unchanged\nnames = ["juma", "Asha", "baraka"]\nprint(sorted(names))\nprint(sorted(names, key=str.lower))`, explain: ["sorted(marks) gives a new list and leaves marks alone, which print(marks) proves.", "Plain sorted(names) puts capital letters first. With key=str.lower Python compares the lower-case version of each name but still returns the original names, so you get Asha, baraka, juma."] },
      { h: 'Sorting by something else', p: [
        'key tells Python what to look at while sorting. Here we sort words by their length.'],
        code: `words = ["statistics", "art", "mathematics", "law"]\nprint(sorted(words, key=len))\nprint(sorted(words, key=len, reverse=True))`, explain: ["key=len tells sorted to compare the words by their length instead of alphabetically. art and law (3 letters) come first.", "Adding reverse=True shows the longest word first."] },
      { h: 'Reversing and measuring', p: [
        'reverse() flips the order in place. len() tells how many items there are. min(), max() and sum() summarise a list of numbers.'],
        code: `data = [3, 9, 4, 7]\ndata.reverse()\nprint(data)\nprint(len(data), min(data), max(data), sum(data))\nprint(sum(data) / len(data))`, explain: ["data.reverse() flips the order in place: [3, 9, 4, 7] becomes [7, 4, 9, 3].", "len, min, max and sum each summarise the list. The mean is the sum divided by the count: 23 / 4 = 5.75."] },
    ],
    {
      mistakes: [
        'Writing sorted_marks = marks.sort(). sort() returns None. Use sorted(marks) when you want a new list.',
        'Mixing numbers and text in one list and then sorting: Python cannot compare 5 with "a" and raises TypeError.',
        'Forgetting that reverse() is not the same as sorting in descending order; it only flips the current order.',
      ],
      exercises: [
        { q: 'Print the three highest marks from [55, 72, 40, 88, 63, 91].', a: `marks = [55, 72, 40, 88, 63, 91]\nprint(sorted(marks, reverse=True)[:3])` },
        { q: 'Sort ["pawpaw","Apple","mango","banana"] alphabetically ignoring case.', a: `fruit = ["pawpaw", "Apple", "mango", "banana"]\nprint(sorted(fruit, key=str.lower))` },
        { q: 'Find the range (max − min) of [12, 5, 30, 18].', a: `x = [12, 5, 30, 18]\nprint(max(x) - min(x))` },
      ],
    }),

  L('loops', 'Looping through lists', 'for inafanya kitu kwa kila item; code iliyo ndani ni ile iliyoingizwa (indent).',
    'Print each course in a list on its own line with its position number.',
    [
      { h: 'The for loop', p: [
        'A for loop takes the items of a list one at a time, puts each in a variable, and runs the indented block for it. When the items finish, the loop ends.',
        'The loop variable name is yours to choose. Pick a singular name for a plural list: for course in courses.'],
        code: `courses = ["MT 100", "ST 113", "MT 114"]\nfor course in courses:\n    print(course)`, explain: ["for course in courses: means “take the items one by one and call the current one course”.", "The colon ends the line and the indented line below is the body. It runs once for each item, so three lines are printed."] },
      { h: 'Doing more inside the loop', p: [
        'Everything indented under the for line runs on every round. A line that is not indented runs only once, after the loop.',
        'This is how indentation tells Python which lines belong to the loop.'],
        code: `students = ["Asha", "Juma", "Neema"]\nfor s in students:\n    print(f"Welcome, {s}!")\n    print("Please sit down.")\nprint("Class is full.")   # runs once`, explain: ["Both indented lines run for every student, so the pair of messages appears three times.", "print(\"Class is full.\") has no indent. It belongs to the program, not to the loop, so it runs once after the loop finishes."] },
      { h: 'Counting while you loop', p: [
        'enumerate() hands you the position and the item together, so you do not need to count by hand. start=1 begins at 1.',
        'Use it whenever you want numbered output.'],
        code: `courses = ["MT 100", "ST 113", "MT 114"]\nfor n, course in enumerate(courses, start=1):\n    print(f"{n}. {course}")`, explain: ["enumerate(courses, start=1) produces pairs (1, \"MT 100\"), (2, \"ST 113\"), ...", "for n, course in ... unpacks each pair into two variables, so you get the number and the item together without counting yourself."] },
      { h: 'Building totals', p: [
        'A very common pattern: create a variable before the loop, update it inside, use it after.'],
        code: `marks = [55, 72, 40, 88]\ntotal = 0\nfor m in marks:\n    total += m\nprint("Total:", total)\nprint("Average:", total / len(marks))\n\npassed = 0\nfor m in marks:\n    if m >= 50:\n        passed += 1\nprint("Passed:", passed)`, explain: ["total = 0 is created before the loop so it exists. Inside the loop total += m adds each mark to it: 55, then 127, then 167, then 255.", "After the loop the total is complete and we can use it: 255 / 4 = 63.75.", "passed works the same way as a counter: it goes up by one only when the if condition is true."] },
      { h: 'Looping over two lists', p: [
        'zip() pairs the items of two lists, so you can walk through them together.'],
        code: `names = ["Asha", "Juma", "Neema"]\nmarks = [78, 64, 91]\nfor name, mark in zip(names, marks):\n    print(f"{name}: {mark}")`, explain: ["zip(names, marks) pairs the first name with the first mark, the second with the second, and so on.", "for name, mark in zip(...) unpacks every pair. zip stops when the shorter list ends, so mismatched lengths do not crash."] },
    ],
    {
      mistakes: [
        'Forgetting the colon at the end of the for line (SyntaxError).',
        'Forgetting to indent the body (IndentationError), or indenting a line that should run after the loop.',
        'Changing the list (adding or removing items) while looping over it. Loop over a copy instead: for x in items[:].',
        'Using the loop variable after the loop and expecting a list: it keeps only the last item.',
      ],
      exercises: [
        { q: 'Print each number of [3, 8, 5] and its square.', a: `for n in [3, 8, 5]:\n    print(n, n ** 2)` },
        { q: 'Count how many words in a list are longer than 4 letters.', a: `words = ["data", "science", "stats", "art", "algebra"]\ncount = 0\nfor w in words:\n    if len(w) > 4:\n        count += 1\nprint(count)` },
        { q: 'Print “Asha got 78”, “Juma got 64” ... from two parallel lists.', a: `names = ["Asha", "Juma"]\nmarks = [78, 64]\nfor n, m in zip(names, marks):\n    print(n, "got", m)` },
      ],
    }),

  L('ranges', 'range() and number lists', 'range() hutengeneza namba kwa mfuatano; list comprehension inatengeneza list kwa mstari mmoja.',
    'Make a list of the first 10 even numbers using range and a comprehension.',
    [
      { h: 'range()', p: [
        'range(n) gives 0, 1, ..., n-1. range(a, b) starts at a and stops just before b. range(a, b, step) jumps by step, and a negative step counts down.',
        'The stop value is never included. Most beginners need a short while to get used to this.'],
        code: `for i in range(5):\n    print(i, end=" ")\nprint()\nfor i in range(2, 8):\n    print(i, end=" ")\nprint()\nfor i in range(0, 20, 5):\n    print(i, end=" ")\nprint()\nfor i in range(5, 0, -1):\n    print(i, end=" ")`, explain: ["range(5) gives 0, 1, 2, 3, 4. end=\" \" stops print from starting a new line, so the numbers sit on one line; the empty print() then starts a new line.", "range(2, 8) starts at 2 and stops before 8. range(0, 20, 5) moves in steps of 5. range(5, 0, -1) counts down."] },
      { h: 'Turning a range into a list', p: [
        'range() produces numbers on demand. Wrap it in list() to get a real list you can print or change.'],
        code: `nums = list(range(1, 11))\nprint(nums)\nevens = list(range(2, 21, 2))\nprint(evens)`, explain: ["list(range(1, 11)) collects the numbers 1 to 10 into a real list.", "range(2, 21, 2) steps by two, so we get the even numbers up to 20."] },
      { h: 'Building lists with a loop', p: [
        'Start with an empty list, then append inside a loop. Here we collect the squares of 1 to 10.'],
        code: `squares = []\nfor n in range(1, 11):\n    squares.append(n ** 2)\nprint(squares)`, explain: ["squares = [] creates an empty list. Each time through the loop n ** 2 is calculated and append adds it to the end.", "After ten rounds the list holds 1, 4, 9, ... 100."] },
      { h: 'List comprehensions', p: [
        'A comprehension does the same in one line: [expression for item in sequence]. You can add a condition at the end to keep only some items.',
        'Use it when it stays easy to read. If it gets long, use a normal loop.'],
        code: `squares = [n ** 2 for n in range(1, 11)]\nprint(squares)\nevens = [n for n in range(1, 21) if n % 2 == 0]\nprint(evens)\nupper = [w.upper() for w in ["a", "b", "c"]]\nprint(upper)`, explain: ["[n ** 2 for n in range(1, 11)] reads: “give me n squared for every n in 1..10”. It builds the same list as the loop in one line.", "Adding if n % 2 == 0 at the end keeps only the even numbers.", "The same shape works with any expression, for example w.upper() on every word."] },
      { h: 'Simple statistics on a list', p: [
        'min(), max() and sum() summarise a list of numbers at once. Divide by len() for the mean.'],
        code: `digits = list(range(1, 11))\nprint(min(digits), max(digits), sum(digits))\nprint(sum(digits) / len(digits))`, explain: ["min, max and sum summarise the list of 1..10: 1, 10 and 55.", "sum(digits) / len(digits) is the mean, 55 / 10 = 5.5."] },
    ],
    {
      mistakes: [
        'Expecting range(1, 5) to include 5. It stops at 4.',
        'Printing range(5) and being surprised by “range(0, 5)”. Convert with list().',
        'A negative step with a start smaller than the stop gives an empty range; swap them: range(5, 0, -1).',
      ],
      exercises: [
        { q: 'Print the numbers 1 to 20 that are divisible by 3.', a: `print([n for n in range(1, 21) if n % 3 == 0])` },
        { q: 'Sum the numbers from 1 to 100.', a: `print(sum(range(1, 101)))` },
        { q: 'Make the list of cubes of 1..8.', a: `print([n ** 3 for n in range(1, 9)])` },
        { q: 'Countdown from 10 to 1 on one line.', a: `for n in range(10, 0, -1):\n    print(n, end=" ")` },
      ],
    }),

  L('slices', 'Slicing and copying lists', 'Slice huchukua sehemu ya list; copy huhitajika ili list mbili zisiathiriane.',
    'Take the middle three items of a list of seven and make a safe copy.',
    [
      { h: 'Slices', p: [
        'A slice takes part of a list: list[start:stop]. It includes start and stops before stop, just like range. Leave out start to begin at the beginning and leave out stop to go to the end.',
        'A slice always makes a new list; the original stays untouched.'],
        code: `players = ["a", "b", "c", "d", "e", "f"]\nprint(players[1:4])\nprint(players[:3])\nprint(players[3:])\nprint(players[-2:])\nprint(players[::2])    # every second item\nprint(players[::-1])   # reversed`, explain: ["players[1:4] gives the items at indexes 1, 2, 3. players[:3] is the first three. players[3:] is everything from index 3 on. players[-2:] is the last two.", "players[::2] takes every second item (step 2) and players[::-1] reads the list backwards."] },
      { h: 'Looping through a slice', p: [
        'You can loop over a slice just like over a whole list. This is handy for “the first three” or “the last five” tasks.'],
        code: `marks = [88, 91, 72, 55, 40, 67]\nfor m in sorted(marks, reverse=True)[:3]:\n    print("Top mark:", m)`, explain: ["sorted(marks, reverse=True) makes a new list from highest to lowest. [:3] cuts the first three items, the best marks.", "The loop then prints each of these three."] },
      { h: 'Copying: a trap to know', p: [
        'Writing b = a does not copy the list. It gives the same list a second name, so a change through one name shows up in the other.',
        'To make a real copy use a[:], a.copy() or list(a).'],
        code: `a = [1, 2, 3]\nb = a            # same list, two names\nb.append(99)\nprint(a)         # a changed too!\n\nc = a.copy()     # real copy\nc.append(100)\nprint(a)\nprint(c)\nprint(a is b, a is c)`, explain: ["b = a does not copy. Both names point to the same list, so b.append(99) changes what you see through a as well.", "c = a.copy() builds a second, independent list. Adding to c leaves a alone.", "The last line uses is, which asks “are these exactly the same object?”: True for a and b, False for a and c."] },
      { h: 'Lists inside lists', p: [
        'A list can contain lists. This is how you store a table: each inner list is a row. Use two indexes to reach one cell: table[row][column].',
        'Note that copy() is shallow: inner lists are still shared. Use copy.deepcopy for a fully independent copy.'],
        code: `table = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(table[1][2])\nfor row in table:\n    print(row, sum(row))\nprint([row[0] for row in table])   # first column`, explain: ["table is a list of three lists. table[1][2] first picks the row at index 1 ([4, 5, 6]) and then the item at index 2 (6).", "Looping over table gives one row at a time, and sum(row) totals it.", "The comprehension [row[0] for row in table] picks the first item of every row, so it reads out the first column."] },
    ],
    {
      mistakes: [
        'Thinking b = a makes a copy. Use b = a.copy().',
        'Forgetting that the stop index is not included: players[1:3] has two items.',
        'Using a shallow copy on a list of lists and then changing an inner list.',
      ],
      exercises: [
        { q: 'From [10,20,30,40,50,60,70] print the middle three items.', a: `x = [10, 20, 30, 40, 50, 60, 70]\nprint(x[2:5])` },
        { q: 'Make a copy of a list, add an item to the copy and show both lists differ.', a: `a = [1, 2, 3]\nb = a.copy()\nb.append(4)\nprint(a, b)` },
        { q: 'Print the second row, third column of a 3×3 table.', a: `t = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nprint(t[1][2])` },
      ],
    }),

  L('tuples', 'Tuples', 'Tuple ni kama list lakini haibadiliki; inafaa kwa thamani zisizopaswa kubadilika.',
    'Store a point as a tuple, unpack it and compute its distance from the origin.',
    [
      { h: 'A list that cannot change', p: [
        'A tuple is written with round brackets and, once created, its items cannot be changed, added or removed. Reading works exactly like a list: indexes, slices, loops, len().',
        'Use a tuple for data that should stay fixed: coordinates, a date (year, month, day), RGB colours.'],
        code: `size = (1920, 1080)\nprint(size[0], size[1])\nprint(len(size))\nfor v in size:\n    print(v)\n# size[0] = 800   <- would raise TypeError`, explain: ["size = (1920, 1080) creates a tuple. Reading works like a list: size[0] and size[1].", "The commented line shows what would fail. Try removing the # and running it to see the TypeError."] },
      { h: 'One-item tuples and unpacking', p: [
        'A tuple with one item needs a comma: (5,). Without it, (5) is just the number 5 in brackets.',
        'Unpacking spreads the items into separate variables. It is also how Python functions return several values.'],
        code: `single = (5,)\nprint(type(single), type((5)))\n\npoint = (3, 4)\nx, y = point\nprint(x, y)\nprint((x ** 2 + y ** 2) ** 0.5)`, explain: ["(5,) is a tuple because of the comma; (5) is only the number 5. type() shows the difference.", "x, y = point unpacks the two items into two names.", "(x ** 2 + y ** 2) ** 0.5 is the Pythagoras formula, so the distance from the origin is 5.0."] },
      { h: 'Changing a tuple (by replacing it)', p: [
        'You cannot edit a tuple, but you can give the variable a whole new tuple. You can also convert between list and tuple when needed.'],
        code: `dim = (200, 50)\nprint(dim)\ndim = (400, 100)   # a new tuple\nprint(dim)\nitems = list(dim)\nitems.append(7)\nprint(tuple(items))`, explain: ["You cannot edit dim, but you can give the name dim a completely new tuple.", "list(dim) makes an editable copy, we append 7, and tuple(items) converts back. This is the standard way to “change” a tuple."] },
    ],
    {
      mistakes: [
        'Trying to assign to a tuple item: TypeError. Make a new tuple instead.',
        'Forgetting the comma in a one-item tuple.',
        'Using a tuple where you actually need to append and remove; choose a list then.',
      ],
      exercises: [
        { q: 'Unpack (2026, 11, 14) into year, month, day and print them in dd/mm/yyyy.', a: `year, month, day = (2026, 11, 14)\nprint(f"{day:02d}/{month:02d}/{year}")` },
        { q: 'Swap two variables using tuple unpacking.', a: `a, b = 1, 2\na, b = b, a\nprint(a, b)` },
      ],
    }),
];
