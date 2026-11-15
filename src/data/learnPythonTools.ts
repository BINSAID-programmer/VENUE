import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Chapter 12: More tools — operators, text patterns, dates, statistics, simulation, packages. */
export const PYTHON_TOOLS: LearnLesson[] = [
  L('operators', 'Operators in depth', 'Operators za hesabu, kulinganisha, mantiki, bitwise, membership na identity; na mpangilio wake (precedence).',
    'Use //, % and ** to split 3725 seconds into hours, minutes and seconds, and to compute 2 to the power 10.',
    [
      { h: 'Arithmetic operators', p: [
        'An operator is a symbol that does something with values, called operands. You already know + - * /. Python has three more that are very useful: // is floor division (divide and drop the fraction), % is the remainder after division (called modulo), and ** is the power.',
        'Division with / always gives a float, even when the answer is whole: 8 / 2 is 4.0. Use // when you want a whole-number answer.'],
        code: `print(17 / 5)\nprint(17 // 5)\nprint(17 % 5)\nprint(2 ** 10)\nprint(-17 // 5)\nprint(-17 % 5)\nprint(divmod(17, 5))`,
        explain: ['17 / 5 is 3.4: normal division always returns a float.', '17 // 5 is 3: how many whole times 5 fits into 17.', '17 % 5 is 2: what is left over (17 = 3 × 5 + 2).', '2 ** 10 is 1024.', 'With negative numbers floor division rounds down, towards minus infinity, so -17 // 5 is -4 (not -3), and the remainder -17 % 5 is 3 so that -4 × 5 + 3 = -17 still holds.', 'divmod(17, 5) gives both answers at once as the pair (3, 2).'] },
      { h: 'Practical uses of // and %', p: [
        'Floor division and remainder together solve many everyday problems: converting seconds to minutes, splitting money into notes and coins, finding even and odd numbers (n % 2), and making values wrap around (days of the week, a clock).'],
        code: `total = 3725\nhours = total // 3600\nrest = total % 3600\nminutes = rest // 60\nseconds = rest % 60\nprint(hours, minutes, seconds)\n\nfor n in [4, 7, 10]:\n    print(n, "even" if n % 2 == 0 else "odd")\n\nday = 5          # Friday as number 5\nprint((day + 4) % 7)   # four days later`,
        explain: ['3725 seconds is 1 hour (3600) with 125 seconds left; 125 seconds is 2 minutes and 5 seconds. So the first line is 1 2 5.', 'n % 2 is 0 for even numbers and 1 for odd numbers.', 'Adding 4 to day 5 gives 9, and 9 % 7 is 2, so the day wraps around the week. The remainder operator is how we make values cycle.'] },
      { h: 'Assignment operators', p: [
        'x += 3 is a short way to write x = x + 3. The same shortcut exists for -=, *=, /=, //=, %= and **=. They make code shorter and show clearly that you are updating a variable.'],
        code: `score = 10\nscore += 5\nscore *= 2\nscore -= 4\nscore //= 3\nscore **= 2\nprint(score)\n\nname = "Asha"\nname += " Juma"\nprint(name)\n\nitems = [1, 2]\nitems += [3, 4]\nprint(items)`,
        explain: ['The score changes step by step: 10, then 15, then 30, then 26, then 8 (26 // 3), then 64 (8 squared).', 'The same += works for strings (joining) and for lists (extending).', 'These shortcuts are simply operators applied to the old value and the result is stored back in the same name.'] },
      { h: 'Comparison and logical operators', p: [
        'Comparison operators give True or False: == != < > <= >=. Python lets you chain them: 0 <= mark <= 100 means both comparisons are true.',
        'The logical operators are and, or and not. and needs both sides true; or needs at least one; not flips the result. Python stops as soon as the answer is known (this is called short-circuiting), so in a or b, b is not even looked at when a is true.'],
        code: `mark = 68\nprint(0 <= mark <= 100)\nprint(mark >= 50 and mark < 70)\nprint(mark < 40 or mark > 90)\nprint(not mark > 90)\n\ndef noisy(label):\n    print("checking", label)\n    return True\n\nprint(noisy("first") or noisy("second"))\nprint(False and noisy("never"))`,
        explain: ['0 <= mark <= 100 is a chained comparison and is True.', 'mark is between 50 and 69, so the and expression is True.', 'Neither condition of the or is true: False. not (mark > 90) is True.', 'noisy("first") is true, so or does not need the second call; only "checking first" is printed before True.', 'False and anything is False, so noisy("never") is not called at all.'] },
      { h: 'Membership and identity', p: [
        'in and not in test whether a value is inside a list, string, tuple, set or dictionary (keys). is and is not test whether two names point to the same object in memory, which is different from == (same value).',
        'Use is mainly with None: if value is None. For everything else compare with ==.'],
        code: `print("py" in "python")\nprint(3 not in [1, 2, 3])\nprint("name" in {"name": "Asha"})\n\na = [1, 2]\nb = [1, 2]\nc = a\nprint(a == b)\nprint(a is b)\nprint(a is c)\nresult = None\nprint(result is None)`,
        explain: ['"py" is inside "python"; 3 is in the list so "not in" is False; in works on dictionary keys.', 'a and b hold equal values, so a == b is True, but they are two different lists, so a is b is False.', 'c is just another name for the same list as a, so a is c is True.', 'None is a single object, so result is None is the correct test.'] },
      { h: 'Order of operations', p: [
        'When an expression has several operators Python follows a fixed order, from strongest to weakest: brackets, **, unary minus, * / // %, + -, comparisons, not, and, or. When in doubt add brackets. They cost nothing and make the code easier to read.'],
        code: `print(2 + 3 * 4)\nprint((2 + 3) * 4)\nprint(2 ** 3 ** 2)\nprint(-3 ** 2)\nprint((-3) ** 2)\nprint(True or False and False)\nprint((True or False) and False)`,
        explain: ['Multiplication comes before addition: 2 + 12 = 14. With brackets (2 + 3) * 4 = 20.', '** is evaluated right to left: 3 ** 2 = 9, then 2 ** 9 = 512.', '-3 ** 2 means -(3 ** 2) = -9, because ** binds more strongly than the minus sign. (-3) ** 2 is 9.', 'and is stronger than or, so True or (False and False) is True; with brackets the result changes to False.'] },
      { h: 'Bitwise operators (a first look)', p: [
        'Numbers are stored as binary digits. The bitwise operators & (and), | (or), ^ (xor), ~ (not), << and >> (shift) work on those bits. They are used in low-level programming, permissions and fast tricks. You will rarely need them now, but they are good to recognise.'],
        code: `a = 12      # 1100 in binary\nb = 10      # 1010 in binary\nprint(a & b)\nprint(a | b)\nprint(a ^ b)\nprint(1 << 4)\nprint(bin(a), bin(b))\nprint(a << 1, a >> 2)`,
        explain: ['12 is 1100 and 10 is 1010. & keeps bits that are 1 in both: 1000 = 8. | keeps bits that are 1 in either: 1110 = 14. ^ keeps bits that differ: 0110 = 6.', '1 << 4 moves the 1 four places left: 16. Each left shift multiplies by 2; each right shift divides by 2 (dropping the fraction).', 'bin() shows the binary text: 0b1100 and 0b1010. 12 << 1 is 24 and 12 >> 2 is 3.'] },
    ],
    {
      mistakes: [
        'Using = (assignment) where == (comparison) is needed.',
        'Writing if x == 1 or 2 which is always true. Write if x == 1 or x == 2, or if x in (1, 2).',
        'Comparing with is instead of == for numbers and strings.',
        'Forgetting that / always returns a float, then using the result as a list index.',
        'Relying on memory of precedence instead of adding brackets.',
      ],
      exercises: [
        { q: 'Convert 500 minutes into hours and minutes using // and %.', a: `total = 500\nprint(total // 60, "hours", total % 60, "minutes")` },
        { q: 'Print the last digit and the number without its last digit for 4827.', a: `n = 4827\nprint(n % 10)\nprint(n // 10)` },
        { q: 'Check whether a year is a leap year: divisible by 4, but not by 100 unless also by 400. Test 1900 and 2024.', a: `def leap(y):\n    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)\n\nprint(leap(1900), leap(2024))` },
      ],
      quiz: [
        { q: 'What is 17 % 5?', options: ['3', '2', '3.4', '85'], answer: 1, why: '17 = 3 × 5 + 2, so the remainder is 2.' },
        { q: 'What is the value of -3 ** 2?', options: ['9', '-9', '6', 'Error'], answer: 1, why: '** is stronger than the minus sign: -(3 ** 2) = -9.' },
        { q: 'Which test is right for None?', options: ['x == None only', 'x is None', 'x = None', 'x in None'], answer: 1, why: 'None is a single object, so use is None.' },
      ],
      challenge: {
        prompt: 'Set hours, minutes and seconds from total_seconds = 7384 using // and %.',
        starter: 'total_seconds = 7384\nhours = 0\nminutes = 0\nseconds = 0\n',
        check: 'assert hours == 2, "7384 seconds contains 2 whole hours, got " + str(hours)\nassert minutes == 3, "then 3 whole minutes, got " + str(minutes)\nassert seconds == 4, "then 4 seconds, got " + str(seconds)',
        hint: 'hours = total_seconds // 3600; rest = total_seconds % 3600; minutes = rest // 60; seconds = rest % 60',
        solution: 'total_seconds = 7384\nhours = total_seconds // 3600\nrest = total_seconds % 3600\nminutes = rest // 60\nseconds = rest % 60\nprint(hours, minutes, seconds)',
      },
    }),

  L('regex', 'Regular expressions (RegEx)', 'RegEx ni lugha ya kuelezea mifumo ya maandishi; tunaitumia kutafuta, kuthibitisha na kubadilisha.',
    'Find all the numbers in the text "Room 12, Floor 3, Seat 45" and print them as integers.',
    [
      { h: 'What is a regular expression?', p: [
        'A regular expression (RegEx) is a small pattern language for describing text. Instead of searching for one exact word, you describe a shape: "four digits", "a word followed by @ and a domain", "a date like 12/05/2026". It is used for validating emails and phone numbers, finding data in long text, and cleaning messy text.',
        'Python provides it in the re module. Patterns are written as raw strings, with an r in front (r"\\d+"), so Python does not treat the backslash as an escape.'] },
      { h: 'Searching: search, match, findall', p: [
        're.search(pattern, text) finds the first place where the pattern occurs and returns a match object, or None when there is no match. re.match checks only the start of the text. re.findall returns a list of every match.',
        'The match object has .group() for the matched text and .start(), .end() for the position.'],
        code: `import re\n\ntext = "Room 12, Floor 3, Seat 45"\nm = re.search(r"\\d+", text)\nprint(m.group(), m.start())\nprint(re.findall(r"\\d+", text))\nprint(re.match(r"Room", text) is not None)\nprint(re.match(r"Floor", text))\nprint(re.search(r"Gate", text))`,
        explain: ['\\d matches one digit and + means "one or more", so \\d+ finds a whole number. The first number is 12, starting at position 5.', 'findall returns all matches, as text: ["12", "3", "45"]. Convert them with int() when you need numbers.', 'match works only at the start: "Room" matches, "Floor" does not, so match returns None.', 'search for "Gate" finds nothing and also returns None. Always check for None before calling .group().'] },
      { h: 'The pattern alphabet', p: [
        'The most useful pieces: . any character except newline; \\d a digit; \\w a letter, digit or underscore; \\s a space or tab; [abc] any one of a, b or c; [a-z] any lowercase letter; [^0-9] anything except a digit.',
        'Quantifiers say how many: * zero or more; + one or more; ? zero or one; {3} exactly three; {2,4} two to four. Anchors: ^ start of the text, $ end of the text, \\b a word boundary.'],
        code: `import re\n\nprint(re.findall(r"\\d{4}", "Call 0762 574 073 or 0754 123 456"))\nprint(re.findall(r"[A-Z][a-z]+", "Asha met Juma and Neema in Dar"))\nprint(re.findall(r"\\bcat\\b", "cat concatenate cat catalog"))\nprint(bool(re.match(r"^\\d{10}$", "0762574073")))\nprint(bool(re.match(r"^\\d{10}$", "076257407")))`,
        explain: ['\\d{4} finds every group of exactly four digits in the phone numbers.', '[A-Z][a-z]+ means a capital letter followed by lower-case letters: it finds capitalised words, here the names and Dar.', '\\bcat\\b matches cat only as a whole word, so concatenate and catalog are skipped: the list has two cats.', '^\\d{10}$ requires exactly ten digits from start to end. The nine-digit text fails.'] },
      { h: 'Groups: picking out parts', p: [
        'Brackets create groups. A group lets you extract part of a match. match.group(1) is the first bracket, group(2) the second, and so on. Named groups (?P<name>...) are even clearer.'],
        code: `import re\n\nm = re.search(r"(\\d{2})/(\\d{2})/(\\d{4})", "Exam on 18/12/2026 at 9am")\nprint(m.groups())\nday, month, year = m.groups()\nprint(f"{year}-{month}-{day}")\n\nn = re.search(r"(?P<user>\\w+)@(?P<site>[\\w.]+)", "write to asha@udsm.ac.tz today")\nprint(n.group("user"), n.group("site"))`,
        explain: ['The pattern has three groups: day, month and year. groups() returns them as a tuple of strings.', 'We unpack the tuple and rebuild the date in year-month-day order: 2026-12-18.', 'The named groups make the second example readable: user is asha and site is udsm.ac.tz.'] },
      { h: 'Replacing and splitting', p: [
        're.sub(pattern, replacement, text) replaces every match. re.split(pattern, text) splits text where the pattern matches, which is more flexible than str.split.',
        'You can compile a pattern once with re.compile and reuse it, which is cleaner and a bit faster when you use the same pattern many times.'],
        code: `import re\n\nprint(re.sub(r"\\d", "#", "PIN 4827 and 1930"))\nprint(re.sub(r"\\s+", " ", "too    many     spaces here"))\nprint(re.split(r"[,;] *", "a, b;c,  d"))\n\nphone = re.compile(r"^(\\+255|0)\\d{9}$")\nfor number in ["0762574073", "+255762574073", "12345"]:\n    print(number, bool(phone.match(number)))`,
        explain: ['Every digit becomes #, so the numbers are hidden.', '\\s+ means one or more whitespace characters, so runs of spaces collapse into a single space.', 'split cuts at a comma or semicolon followed by optional spaces and gives four clean items.', 'The compiled phone pattern accepts +255 or 0 followed by nine digits. The first two numbers match and 12345 does not.'] },
      { h: 'Greedy or lazy', p: [
        'By default quantifiers are greedy: they take as much text as possible. Adding a question mark after them makes them lazy: they take as little as possible. This matters when you capture text between two markers.'],
        code: `import re\n\nhtml = "<b>bold</b> and <i>italic</i>"\nprint(re.findall(r"<.+>", html))\nprint(re.findall(r"<.+?>", html))\nprint(re.findall(r"<(.+?)>", html))`,
        explain: ['The greedy <.+> grabs from the first < to the very last >, so it returns one long match.', 'The lazy <.+?> stops at the first > it finds and returns each tag separately.', 'With brackets around the lazy part, findall returns only the text inside the tags: b, /b, i, /i.'] },
    ],
    {
      mistakes: [
        'Forgetting the r before the pattern string, so \\d or \\b is misread.',
        'Calling .group() on None when there was no match. Check the result first.',
        'Using . to mean a dot. A literal dot must be written \\. in the pattern.',
        'Writing patterns that are too clever. If it is hard to read, split the job into steps.',
        'Using RegEx for tasks that str methods do better, such as replace or startswith.',
      ],
      exercises: [
        { q: 'Extract all the words that start with a capital letter from "Asha and Juma studied in Dar es Salaam".', a: `import re\n\nprint(re.findall(r"\\b[A-Z][a-z]*", "Asha and Juma studied in Dar es Salaam"))` },
        { q: 'Check whether each text is a valid course code like MS 101 (two capital letters, a space and three digits).', a: `import re\n\nfor code in ["MS 101", "ms 101", "MS101", "CS 2020"]:\n    print(code, bool(re.fullmatch(r"[A-Z]{2} \\d{3}", code)))` },
        { q: 'Replace all vowels in "statistics" with a star.', a: `import re\n\nprint(re.sub(r"[aeiou]", "*", "statistics"))` },
      ],
      quiz: [
        { q: 'What does \\d+ match?', options: ['One letter', 'One or more digits', 'Any text', 'A space'], answer: 1, why: '\\d is a digit and + means one or more.' },
        { q: 'What does re.findall return?', options: ['The first match', 'A list of all matches', 'True or False', 'The pattern'], answer: 1, why: 'findall gives a list of every non-overlapping match.' },
        { q: 'What does the ? do in <.+?>', options: ['Makes the match lazy', 'Makes it optional', 'Asks the user', 'Nothing'], answer: 0, why: 'A ? after a quantifier makes it lazy: it matches as little as possible.' },
      ],
      challenge: {
        prompt: 'Using the re module, set numbers to the list of all integers (as int values) found in the text.',
        starter: 'import re\n\ntext = "Room 12, Floor 3, Seat 45"\nnumbers = []\n',
        check: 'assert numbers == [12, 3, 45], "numbers should be [12, 3, 45], got " + str(numbers)',
        hint: 'numbers = [int(n) for n in re.findall(r"\\d+", text)]',
        solution: 'import re\n\ntext = "Room 12, Floor 3, Seat 45"\nnumbers = [int(n) for n in re.findall(r"\\d+", text)]\nprint(numbers)',
      },
    }),

  L('dates', 'Dates, times and the math module', 'datetime inashughulikia tarehe na saa; math ina hesabu za juu (sqrt, log, sin na kadhalika).',
    'Compute how many days remain between today’s example date 14 November 2026 and 18 December 2026.',
    [
      { h: 'Dates and times with datetime', p: [
        'The datetime module has classes for dates (date), times (time), both together (datetime) and differences (timedelta). Dates are real objects, so you can compare them and do arithmetic: subtract two dates and you get a timedelta.',
        'datetime.now() and date.today() give the current moment from the clock of the computer. In the examples we use fixed dates so the answers never change.'],
        code: `from datetime import date, datetime, timedelta\n\nstart = date(2026, 11, 14)\nexam = date(2026, 12, 18)\nprint((exam - start).days)\nprint(start + timedelta(days=30))\nprint(start < exam)\nprint(start.weekday(), start.strftime("%A"))\n\nmoment = datetime(2026, 11, 14, 8, 30)\nprint(moment + timedelta(hours=5, minutes=45))\nprint(moment.strftime("%d %B %Y, %H:%M"))`,
        explain: ['Subtracting two dates gives a timedelta; its .days attribute is 34.', 'Adding timedelta(days=30) moves the date forward to 2026-12-14.', 'Dates compare naturally: start < exam is True.', 'weekday() returns 0 for Monday to 6 for Sunday; 14 November 2026 is a Saturday, so 5 and Saturday.', 'A datetime holds time too. Adding 5 hours 45 minutes to 08:30 gives 14:15 on the same day.', 'strftime formats it as text: 14 November 2026, 08:30.'] },
      { h: 'Format codes and parsing text', p: [
        'strftime turns a date into text using codes: %Y four-digit year, %m month number, %d day, %B month name, %A weekday name, %H hour (24h), %M minutes. strptime does the opposite: it parses text into a date, and you tell it the format.'],
        code: `from datetime import datetime\n\nd = datetime.strptime("18/12/2026", "%d/%m/%Y")\nprint(d.year, d.month, d.day)\nprint(d.strftime("%A, %d %B %Y"))\nprint(d.strftime("%Y-%m-%d"))\n\ntry:\n    datetime.strptime("31/02/2026", "%d/%m/%Y")\nexcept ValueError as e:\n    print("Invalid date:", e)`,
        explain: ['The format "%d/%m/%Y" tells Python that the text is day/month/year.', 'Once parsed we can read the parts or format it again in any style; 18 December 2026 is a Friday.', 'The date 31/02/2026 does not exist. strptime raises ValueError, which we catch.', 'Always parse dates from users inside try, because people type unexpected things.'] },
      { h: 'Counting down and working with ranges of dates', p: [
        'Combining dates with loops and conditions gives useful tools: a countdown to an exam, a list of all Mondays in a month, an age calculator.'],
        code: `from datetime import date, timedelta\n\nbirth = date(2005, 3, 20)\ntoday = date(2026, 11, 14)\nage = today.year - birth.year - ((today.month, today.day) < (birth.month, birth.day))\nprint("Age:", age)\n\nday = date(2026, 12, 1)\nmondays = []\nwhile day.month == 12:\n    if day.weekday() == 0:\n        mondays.append(day.day)\n    day += timedelta(days=1)\nprint("Mondays in December 2026:", mondays)`,
        explain: ['The age is the difference of years, minus 1 if the birthday has not yet happened this year. Comparing the (month, day) tuples does that check neatly. Here the birthday has passed, so the age is 21.', 'The loop starts on 1 December and moves one day at a time until the month changes.', 'weekday() == 0 selects Mondays; the list is 7, 14, 21 and 28 because 1 December 2026 is a Tuesday.'] },
      { h: 'The math module', p: [
        'The math module has the mathematical functions that are not built into the language: sqrt, floor and ceil, log, exp, trigonometric functions, factorial and the constants pi and e. Angles are in radians.'],
        code: `import math\n\nprint(math.sqrt(144))\nprint(math.floor(3.7), math.ceil(3.2))\nprint(round(math.pi, 5), round(math.e, 5))\nprint(math.factorial(6))\nprint(round(math.log(100, 10), 2), round(math.log(math.e), 2))\nprint(round(math.sin(math.pi / 2), 2))\nprint(math.degrees(math.pi), math.hypot(3, 4))\nprint(math.comb(5, 2), math.gcd(12, 18))`,
        explain: ['sqrt(144) is 12.0. floor rounds down (3) and ceil rounds up (4).', 'pi and e are constants; we round them for a tidy display.', 'factorial(6) is 6 × 5 × 4 × 3 × 2 × 1 = 720.', 'log(100, 10) is 2.0 and the natural logarithm of e is 1.0. sin(pi / 2) is 1.0.', 'degrees converts radians to degrees: 180.0. hypot(3, 4) is the length of the hypotenuse, 5.0.', 'comb(5, 2) = 10 is the number of ways to choose 2 from 5, and gcd(12, 18) = 6 is the greatest common divisor. These are very useful in statistics and probability.'] },
    ],
    {
      mistakes: [
        'Mixing up %m (month) and %M (minutes) in format codes.',
        'Forgetting that weekday() counts Monday as 0.',
        'Using trigonometric functions with degrees instead of radians.',
        'Trying to add a date and an integer. Use timedelta(days=n).',
        'Parsing a date with the wrong format string (ValueError).',
      ],
      exercises: [
        { q: 'How many days are there from 1 January 2026 to 31 December 2026?', a: `from datetime import date\n\nprint((date(2026, 12, 31) - date(2026, 1, 1)).days)` },
        { q: 'Print the date 100 days after 1 September 2026 as 12 December 2026 style text.', a: `from datetime import date, timedelta\n\nprint((date(2026, 9, 1) + timedelta(days=100)).strftime("%d %B %Y"))` },
        { q: 'Find the distance between points (1, 2) and (4, 6) using math.hypot.', a: `import math\n\nprint(math.hypot(4 - 1, 6 - 2))` },
      ],
      quiz: [
        { q: 'What do you get from subtracting two date objects?', options: ['An int', 'A timedelta', 'A string', 'A date'], answer: 1, why: 'The difference of two dates is a timedelta object with a .days attribute.' },
        { q: 'Which format code gives the month name (November)?', options: ['%m', '%M', '%B', '%b'], answer: 2, why: '%B is the full month name; %m is the month number.' },
        { q: 'What does math.ceil(3.2) return?', options: ['3', '4', '3.2', '3.5'], answer: 1, why: 'ceil rounds up to the next whole number.' },
      ],
      challenge: {
        prompt: 'Using the datetime module, set days_left to the number of days from start = date(2026, 11, 14) to exam = date(2026, 12, 18).',
        starter: 'from datetime import date\n\nstart = date(2026, 11, 14)\nexam = date(2026, 12, 18)\ndays_left = 0\n',
        check: 'assert days_left == 34, "days_left should be 34, got " + str(days_left)',
        hint: 'Subtract the dates and read .days: (exam - start).days',
        solution: 'from datetime import date\n\nstart = date(2026, 11, 14)\nexam = date(2026, 12, 18)\ndays_left = (exam - start).days\nprint(days_left)',
      },
    }),

  L('stats', 'Statistics with Python', 'Wastani, kati (median), mode, tofauti na mkengeuko wa kawaida; population dhidi ya sample; quantiles na correlation.',
    'Compute the mean, median and sample standard deviation of 8 marks of your own.',
    [
      { h: 'Why Python for statistics?', p: [
        'Statistics is about summarising data and drawing conclusions from it. Python can do the calculations in a line or two, and it never makes arithmetic mistakes. The statistics module, included with every Python, covers the standard summaries. Later you can move to NumPy, pandas and SciPy for big data, but the ideas are the same.',
        'As a student of statistics you should know what each number means, not only how to compute it. In this lesson each function is explained with its formula.'] },
      { h: 'Measures of centre: mean, median, mode', p: [
        'The mean is the sum divided by the number of values. The median is the middle value after sorting (the average of the two middle values when the count is even). The mode is the most frequent value.',
        'The mean is sensitive to extreme values, the median is not. That is why the median is often used for incomes or house prices.'],
        code: `import statistics as st\n\nmarks = [45, 52, 58, 61, 64, 67, 70, 95]\nprint("mean  ", st.mean(marks))\nprint("median", st.median(marks))\nprint("mode  ", st.mode([2, 3, 3, 5, 3, 7, 5]))\nprint("multimode", st.multimode([1, 1, 2, 2, 3]))\n\nwith_outlier = marks + [300]\nprint("mean with outlier  ", round(st.mean(with_outlier), 2))\nprint("median with outlier", st.median(with_outlier))`,
        explain: ['The eight marks sum to 512, so the mean is 512 / 8 = 64. The sorted list has an even number of values, so the median is the average of the two middle ones: (61 + 64) / 2 = 62.5.', 'mode finds the most common value: 3 appears three times. multimode returns all values that tie for most frequent: [1, 2].', 'One extreme mark of 300 pulls the mean up to about 90.22, while the median only moves to 64. The median resists outliers.'] },
      { h: 'Measures of spread', p: [
        'Spread tells you how far values are from the centre. The variance is the average squared distance from the mean, and the standard deviation is its square root, which has the same units as the data.',
        'Two versions exist. Use pvariance and pstdev when your data is the whole population (divide by n). Use variance and stdev when your data is a sample from a larger group (divide by n − 1). In practice you almost always have a sample.'],
        code: `import statistics as st\n\ndata = [2, 4, 4, 4, 5, 5, 7, 9]\nprint("mean      ", st.mean(data))\nprint("pvariance ", st.pvariance(data))\nprint("pstdev    ", st.pstdev(data))\nprint("variance  ", round(st.variance(data), 4))\nprint("stdev     ", round(st.stdev(data), 4))\nprint("range     ", max(data) - min(data))`,
        explain: ['The mean is 5. The squared distances from 5 are 9, 1, 1, 1, 0, 0, 4, 16; they sum to 32.', 'Population variance is 32 / 8 = 4, and pstdev is its square root, 2.0.', 'Sample variance divides by 7 instead: 32 / 7 = 4.5714, so stdev is 2.1381. The sample version is a little larger, correcting for the fact that a sample tends to underestimate the spread.', 'The range, the largest minus the smallest value, is 7.'] },
      { h: 'Quartiles and the five-number summary', p: [
        'Quantiles cut sorted data into equal parts. The quartiles split it into four: Q1 (25%), Q2 (the median) and Q3 (75%). The interquartile range IQR = Q3 − Q1 measures the spread of the middle half of the data and is used to find outliers.',
        'statistics.quantiles(data, n=4) returns the three quartile cut points. Software uses several methods for quartiles, so different tools may give slightly different numbers.'],
        code: `import statistics as st\n\ndata = [12, 15, 17, 18, 20, 22, 25, 27, 30, 41]\nq1, q2, q3 = st.quantiles(data, n=4)\nprint(q1, q2, q3)\niqr = q3 - q1\nprint("IQR", iqr)\nlow = q1 - 1.5 * iqr\nhigh = q3 + 1.5 * iqr\nprint("fences", low, high)\nprint("outliers", [x for x in data if x < low or x > high])\nprint(min(data), q1, q2, q3, max(data))`,
        explain: ['quantiles returns three numbers: the first and third quartiles with the median between them.', 'The common rule says a value is an outlier if it lies more than 1.5 × IQR below Q1 or above Q3. These limits are called fences.', 'With these data no value falls outside the fences, so the outlier list is empty. The last line is the five-number summary: minimum, Q1, median, Q3, maximum.'] },
      { h: 'Correlation and covariance', p: [
        'When you have two variables for the same people, you ask whether they move together. The correlation coefficient r runs from −1 (perfect opposite relationship) through 0 (no linear relationship) to +1 (perfect same-direction relationship). Covariance is the unscaled version.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6]\nscore = [48, 55, 59, 66, 72, 80]\nprint("correlation", round(st.correlation(hours, score), 4))\nprint("covariance ", round(st.covariance(hours, score), 4))\nprint("opposite    ", round(st.correlation(hours, [90, 80, 70, 60, 50, 40]), 2))`,
        explain: ['The marks rise with hours of study, and the correlation is close to +1.', 'Covariance is positive, which agrees with the direction. Its size depends on the units, so use correlation to compare relationships.', 'When one variable falls exactly as the other rises the correlation is −1.0. Remember that correlation is not causation: two things can move together without one causing the other.'] },
      { h: 'Summary table of a dataset', p: [
        'A helper that prints all the usual summaries is a good first step in any analysis. We build one as a function that returns a dictionary, using everything from this lesson.'],
        code: `import statistics as st\n\ndef summary(data):\n    q1, q2, q3 = st.quantiles(data, n=4)\n    return {\n        "n": len(data),\n        "mean": round(st.mean(data), 2),\n        "median": st.median(data),\n        "stdev": round(st.stdev(data), 2),\n        "min": min(data),\n        "q1": q1,\n        "q3": q3,\n        "max": max(data),\n    }\n\nresult = summary([56, 61, 63, 64, 66, 70, 72, 78, 85])\nfor key, value in result.items():\n    print(f"{key:>6}: {value}")`,
        explain: ['The function collects each measure in a dictionary with readable names.', 'f"{key:>6}" right-aligns the names in a column of width 6, so the numbers line up.', 'You can reuse summary() on any list of numbers, which is the point of writing functions.'] },
    ],
    {
      mistakes: [
        'Using stdev when the data is the full population, or pstdev for a sample. Decide which you have.',
        'Taking the mean of a list that contains text or None values.',
        'Reporting the mean of skewed data without also checking the median.',
        'Confusing correlation with causation.',
        'Forgetting that statistics.mode raises an error on empty data; check the list first.',
      ],
      exercises: [
        { q: 'Compute the mean and sample standard deviation of [10, 12, 23, 23, 16, 23, 21, 16] to 2 decimals.', a: `import statistics as st\n\ndata = [10, 12, 23, 23, 16, 23, 21, 16]\nprint(round(st.mean(data), 2), round(st.stdev(data), 2))` },
        { q: 'Find the outliers of [3, 5, 6, 7, 8, 9, 10, 40] using the 1.5 × IQR rule.', a: `import statistics as st\n\ndata = [3, 5, 6, 7, 8, 9, 10, 40]\nq1, q2, q3 = st.quantiles(data, n=4)\niqr = q3 - q1\nprint([x for x in data if x < q1 - 1.5 * iqr or x > q3 + 1.5 * iqr])` },
        { q: 'Standardise the marks [50, 60, 70] into z-scores: (x - mean) / stdev.', a: `import statistics as st\n\nmarks = [50, 60, 70]\nm = st.mean(marks)\ns = st.stdev(marks)\nprint([round((x - m) / s, 2) for x in marks])` },
      ],
      quiz: [
        { q: 'Which measure is least affected by extreme values?', options: ['Mean', 'Median', 'Range', 'Variance'], answer: 1, why: 'The median depends only on the middle position, not on how extreme the ends are.' },
        { q: 'For a sample you normally use…', options: ['pstdev', 'stdev', 'mode', 'range'], answer: 1, why: 'stdev divides by n − 1, the right choice for a sample.' },
        { q: 'A correlation of −1 means…', options: ['No relationship', 'A perfect opposite linear relationship', 'A perfect same-direction relationship', 'A mistake in the data'], answer: 1, why: 'When one variable rises exactly as the other falls, r = −1.' },
      ],
      challenge: {
        prompt: 'Using the statistics module, set mean_mark, median_mark and sd to the mean, median and sample standard deviation of marks (do not round).',
        starter: 'import statistics as st\n\nmarks = [45, 52, 58, 61, 64, 67, 70, 95]\nmean_mark = 0\nmedian_mark = 0\nsd = 0\n',
        check: 'import statistics\nassert mean_mark == 64, "mean_mark should be 64"\nassert median_mark == 62.5, "median_mark should be 62.5"\nassert abs(sd - statistics.stdev(marks)) < 1e-9, "sd should be the sample standard deviation (stdev)"',
        hint: 'st.mean(marks), st.median(marks), st.stdev(marks)',
        solution: 'import statistics as st\n\nmarks = [45, 52, 58, 61, 64, 67, 70, 95]\nmean_mark = st.mean(marks)\nmedian_mark = st.median(marks)\nsd = st.stdev(marks)\nprint(mean_mark, median_mark, round(sd, 2))',
      },
    }),

  L('linreg', 'Simple linear regression', 'Regression hupata mstari y = a + b·x unaoelezea uhusiano; tunahesabu mteremko, makutano, utabiri na R².',
    'Use the fitted line to predict the exam mark for 7 hours of study, and say what the slope means.',
    [
      { h: 'The idea', p: [
        'Simple linear regression describes the relationship between one input variable x (the predictor, for example hours of study) and one output y (the response, for example exam mark) with a straight line: y = a + b·x.',
        'The slope b says how much y changes when x increases by 1. The intercept a is the predicted y when x is 0. The line is chosen by the method of least squares: out of all possible lines it is the one that makes the sum of the squared vertical distances to the points (the residuals) as small as possible.',
        'The formulas are b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)² and a = ȳ − b·x̄. Python can compute them for you, and we also compute them by hand to see that nothing is magic.'] },
      { h: 'Fitting the line', p: [
        'statistics.linear_regression(x, y) returns an object with the slope and intercept. It needs Python 3.10 or newer.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6]\nmarks = [48, 55, 59, 66, 72, 80]\nfit = st.linear_regression(hours, marks)\nprint("slope    ", round(fit.slope, 4))\nprint("intercept", round(fit.intercept, 4))\n\ndef predict(x):\n    return fit.intercept + fit.slope * x\n\nprint("7 hours ->", round(predict(7), 1))\nprint("0 hours ->", round(predict(0), 1))`,
        explain: ['The slope is about 6.23: each extra hour of study is associated with about 6.2 more marks.', 'The intercept is about 41.5: the line says someone who studies 0 hours scores around 41.', 'predict(7) uses the formula a + b·x and gives about 85.1. This is an extrapolation beyond the data (we only saw 1 to 6 hours), so be careful: the further outside the data, the less trustworthy.'] },
      { h: 'Computing it by hand', p: [
        'Doing the calculation yourself once helps you trust the result. We use the formulas for slope and intercept from the first section.'],
        code: `hours = [1, 2, 3, 4, 5, 6]\nmarks = [48, 55, 59, 66, 72, 80]\nn = len(hours)\nx_bar = sum(hours) / n\ny_bar = sum(marks) / n\n\nsxy = sum((x - x_bar) * (y - y_bar) for x, y in zip(hours, marks))\nsxx = sum((x - x_bar) ** 2 for x in hours)\n\nb = sxy / sxx\na = y_bar - b * x_bar\nprint(x_bar, y_bar)\nprint(round(b, 4), round(a, 4))`,
        explain: ['The means are 3.5 hours and about 63.33 marks.', 'sxy adds up the products of the deviations of x and y; sxx adds up the squared deviations of x.', 'Dividing gives the same slope and intercept as linear_regression, which confirms that the library function applies exactly these formulas.', 'zip pairs up each hour with its mark so we can loop over both lists together.'] },
      { h: 'How good is the line? Residuals and R²', p: [
        'A residual is the difference between an actual y and the predicted y. The coefficient of determination R² says what fraction of the variation in y is explained by x. It runs from 0 (the line explains nothing) to 1 (a perfect fit). For simple regression it equals the square of the correlation r.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6]\nmarks = [48, 55, 59, 66, 72, 80]\nfit = st.linear_regression(hours, marks)\n\nresiduals = [y - (fit.intercept + fit.slope * x) for x, y in zip(hours, marks)]\nprint([round(r, 2) for r in residuals])\nprint("sum of residuals", round(sum(residuals), 6))\n\nss_res = sum(r ** 2 for r in residuals)\nmean_y = st.mean(marks)\nss_tot = sum((y - mean_y) ** 2 for y in marks)\nr2 = 1 - ss_res / ss_tot\nprint("R squared", round(r2, 4))\nprint("r squared", round(st.correlation(hours, marks) ** 2, 4))`,
        explain: ['Each residual is small, a mark or two above or below the line.', 'The residuals of a least-squares line with an intercept always add up to zero (apart from rounding): 0.0.', 'R² = 1 − SSres/SStot compares the leftover variation with the total variation. A value near 0.99 means the line explains nearly all the differences in marks.', 'The last line shows that R² equals the square of the correlation coefficient for simple regression.'] },
      { h: 'Interpretation and cautions', p: [
        'A regression line describes association, not proof of cause. Study hours and marks move together, but other things (ability, sleep, teaching quality) may matter too.',
        'Check that a straight line is appropriate: plot the data or examine the residuals for patterns. Beware of outliers, which can pull the line, and do not predict far outside the range of x you observed.',
        'Multiple regression, with many predictors, is the next step. Libraries such as NumPy, scikit-learn and statsmodels extend what you learned here.'] },
    ],
    {
      mistakes: [
        'Interpreting the intercept literally when x = 0 is outside the data.',
        'Extrapolating far beyond the observed range of x.',
        'Believing a high R² proves causation.',
        'Swapping x and y: the regression of y on x is not the same line as x on y.',
        'Ignoring outliers that change the slope.',
      ],
      exercises: [
        { q: 'Fit a line to x = [1, 2, 3, 4] and y = [3, 5, 7, 9] and print the slope and intercept.', a: `import statistics as st\n\nfit = st.linear_regression([1, 2, 3, 4], [3, 5, 7, 9])\nprint(fit.slope, fit.intercept)` },
        { q: 'Predict y for x = 10 using the line from the previous exercise.', a: `import statistics as st\n\nfit = st.linear_regression([1, 2, 3, 4], [3, 5, 7, 9])\nprint(fit.intercept + fit.slope * 10)` },
        { q: 'Compute R squared for perfectly linear data. What do you expect?', a: `import statistics as st\n\nx = [1, 2, 3, 4, 5]\ny = [2, 4, 6, 8, 10]\nprint(round(st.correlation(x, y) ** 2, 4))` },
      ],
      quiz: [
        { q: 'What does the slope b mean?', options: ['The value of y when x = 0', 'The change in y for a one-unit increase in x', 'The mean of y', 'The number of points'], answer: 1, why: 'The slope is the average change in y per unit of x.' },
        { q: 'What does the least squares method minimise?', options: ['The sum of residuals', 'The sum of squared residuals', 'The number of points', 'The slope'], answer: 1, why: 'It chooses the line with the smallest sum of squared residuals.' },
        { q: 'An R² of 0.95 means…', options: ['x causes 95% of y', '95% of the variation in y is explained by the line', 'The slope is 0.95', 'There are 95 points'], answer: 1, why: 'R² is the proportion of variation explained, not proof of causation.' },
      ],
      challenge: {
        prompt: 'Using statistics.linear_regression on hours and marks, set slope and intercept, and set pred to the predicted mark for 7 hours.',
        starter: 'import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6]\nmarks = [48, 55, 59, 66, 72, 80]\nslope = 0\nintercept = 0\npred = 0\n',
        check: 'import statistics\nf = statistics.linear_regression(hours, marks)\nassert abs(slope - f.slope) < 1e-9, "slope is wrong"\nassert abs(intercept - f.intercept) < 1e-9, "intercept is wrong"\nassert abs(pred - (f.intercept + f.slope * 7)) < 1e-9, "pred should be intercept + slope * 7"',
        hint: 'fit = st.linear_regression(hours, marks); slope = fit.slope; intercept = fit.intercept; pred = intercept + slope * 7',
        solution: 'import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6]\nmarks = [48, 55, 59, 66, 72, 80]\nfit = st.linear_regression(hours, marks)\nslope = fit.slope\nintercept = fit.intercept\npred = intercept + slope * 7\nprint(round(slope, 2), round(intercept, 2), round(pred, 1))',
      },
    }),

  L('montecarlo', 'Randomness and simulation', 'Tumia random kutengeneza data ya majaribio na kukadiria uwezekano kwa kurudia jaribio mara nyingi.',
    'Simulate rolling two dice 10 000 times and estimate the probability that the total is 7.',
    [
      { h: 'Random numbers', p: [
        'The random module generates pseudo-random numbers: they look random but come from a formula starting at a number called the seed. If you set the same seed, you get the same sequence again. Seeds make experiments repeatable, which is important in science and for testing.',
        'The main functions: random() gives a float from 0 to 1, randint(a, b) a whole number from a to b inclusive, choice(list) one item, sample(list, k) k different items, shuffle(list) mixes a list in place.'],
        code: `import random\n\nrandom.seed(42)\nfirst = [random.randint(1, 6) for _ in range(5)]\nrandom.seed(42)\nsecond = [random.randint(1, 6) for _ in range(5)]\nprint(first == second)\n\nnames = ["Asha", "Juma", "Neema", "Salum", "Rehema"]\nteam = random.sample(names, 3)\nprint(len(team), len(set(team)), all(n in names for n in team))\n\ndeck = list(range(1, 6))\nrandom.shuffle(deck)\nprint(sorted(deck))`,
        explain: ['Resetting the seed to 42 reproduces exactly the same five numbers, so the comparison is True.', 'sample picks 3 different names: the team has 3 members and none repeats. We print checks instead of the names because the names change with the seed and the Python version.', 'shuffle mixes the list but keeps the same items, so the sorted list is always 1 to 5.'] },
      { h: 'Simulating a coin', p: [
        'Probability says that a fair coin lands heads half the time, but a few flips can look very different. The law of large numbers says that as the number of trials grows, the observed fraction gets close to the true probability. A simulation lets you see this.'],
        code: `import random\n\nrandom.seed(1)\nfor flips in [10, 100, 1000, 100000]:\n    heads = sum(random.random() < 0.5 for _ in range(flips))\n    fraction = heads / flips\n    print(f"{flips:>6} flips: fraction of heads = {fraction:.4f}, gap from 0.5 = {abs(fraction - 0.5):.4f}")`,
        explain: ['random.random() < 0.5 is True about half the time, and sum() counts the True values as 1.', 'We run bigger and bigger experiments and print the fraction of heads and its gap from 0.5.', 'The gaps tend to shrink as the number of flips grows (a small experiment can still be lucky or unlucky). This is the law of large numbers in action.'] },
      { h: 'Monte Carlo: estimating probabilities', p: [
        'A Monte Carlo simulation estimates a probability by repeating a random experiment many times and counting. It is used when the exact calculation is hard. We can check it on a simple case where we also know the exact answer.',
        'For two dice there are 36 equally likely outcomes, and 6 of them add to 7, so the exact probability is 6/36 = 0.1667.'],
        code: `import random\n\nrandom.seed(2026)\ntrials = 100000\nsevens = 0\nfor _ in range(trials):\n    if random.randint(1, 6) + random.randint(1, 6) == 7:\n        sevens += 1\n\nestimate = sevens / trials\nprint("exact    ", round(6 / 36, 4))\nprint("close?   ", abs(estimate - 6 / 36) < 0.01)`,
        explain: ['Each trial rolls two dice and adds them. We count how many trials give 7.', 'The estimate is the count divided by the number of trials. With 100 000 trials it is very close to 0.1667.', 'We print whether the estimate is within 0.01 of the exact answer, which is True. The exact digits of the estimate depend on the seed, but the closeness does not.'] },
      { h: 'Estimating π', p: [
        'A famous example: throw random points into a square of side 2 centred at the origin. The fraction that land inside the inscribed circle of radius 1 is the ratio of areas, π/4. Multiply by 4 and you get an estimate of π.'],
        code: `import random\n\nrandom.seed(7)\nn = 200000\ninside = 0\nfor _ in range(n):\n    x = random.uniform(-1, 1)\n    y = random.uniform(-1, 1)\n    if x * x + y * y <= 1:\n        inside += 1\n\npi_estimate = 4 * inside / n\nprint(abs(pi_estimate - 3.14159) < 0.02)`,
        explain: ['Each point (x, y) is random in the square. The point is inside the circle when x² + y² ≤ 1.', 'The ratio of points inside to all points approaches the ratio of areas, π × 1² divided by 2 × 2, which is π/4.', 'So 4 × inside / n estimates π. The error shrinks slowly, roughly like 1/√n, which is typical for Monte Carlo methods. We check that the estimate is within 0.02 of the true value: True.'] },
      { h: 'Where simulation is used', p: [
        'Banks estimate risk, engineers test designs, doctors model the spread of a disease, and statisticians use the bootstrap (resampling the data many times) to find confidence intervals. All of these are variations of the same idea: repeat a random experiment many times and look at the results.'],
        code: `import random\nimport statistics as st\n\nrandom.seed(5)\nmarks = [48, 55, 59, 66, 72, 80, 61, 58]\n\nmeans = []\nfor _ in range(2000):\n    resample = random.choices(marks, k=len(marks))\n    means.append(st.mean(resample))\n\nmeans.sort()\nlow, high = means[50], means[1949]\nprint(low < st.mean(marks) < high)\nprint(round(st.mean(marks), 2))`,
        explain: ['This is the bootstrap. choices draws 8 marks with replacement from the original 8 marks, and we compute the mean of each resample, 2000 times.', 'Sorting the 2000 means and taking the 51st smallest and the 51st largest gives an approximate 95% confidence interval for the mean (it cuts 2.5% from each end).', 'The interval contains the sample mean (True), and the sample mean itself is 62.38.'] },
    ],
    {
      mistakes: [
        'Expecting the same results on each run without setting a seed.',
        'Using too few trials and trusting the result.',
        'Using randint(1, 6) when you meant to exclude the end point. randint includes both ends.',
        'Forgetting that random numbers from a formula are pseudo-random, not suitable for passwords. Use the secrets module for security.',
        'Comparing floating point estimates with == instead of using a tolerance.',
      ],
      exercises: [
        { q: 'Simulate 100 000 coin flips with a seed and show that the fraction of heads is within 0.01 of 0.5.', a: `import random\n\nrandom.seed(3)\nn = 100000\nheads = sum(random.random() < 0.5 for _ in range(n))\nprint(abs(heads / n - 0.5) < 0.01)` },
        { q: 'Estimate the probability that three coin flips give exactly two heads (exact answer 0.375).', a: `import random\n\nrandom.seed(11)\nn = 50000\ncount = 0\nfor _ in range(n):\n    if sum(random.random() < 0.5 for _ in range(3)) == 2:\n        count += 1\nprint(abs(count / n - 0.375) < 0.02)` },
      ],
      quiz: [
        { q: 'What does random.seed(42) do?', options: ['Makes numbers truly random', 'Makes the sequence repeatable', 'Deletes numbers', 'Slows the program'], answer: 1, why: 'The same seed always produces the same sequence of pseudo-random numbers.' },
        { q: 'What does the law of large numbers say?', options: ['Large numbers are random', 'With more trials the fraction approaches the true probability', 'Averages always equal 0', 'Dice are fair'], answer: 1, why: 'As the number of trials grows, observed frequencies approach the true probability.' },
        { q: 'randint(1, 6) can return…', options: ['1 to 5', '1 to 6, including 6', '0 to 6', '2 to 6'], answer: 1, why: 'randint includes both end points.' },
      ],
      challenge: {
        prompt: 'Simulate 100 000 rolls of two dice with random.seed(1). Set estimate to the fraction of rolls whose total is 7.',
        starter: 'import random\n\nrandom.seed(1)\ntrials = 100000\nestimate = 0\n',
        check: 'assert abs(estimate - 6 / 36) < 0.01, "estimate should be close to 1/6 (0.1667), got " + str(estimate)',
        hint: 'Count the trials where random.randint(1, 6) + random.randint(1, 6) == 7, then divide by trials.',
        solution: 'import random\n\nrandom.seed(1)\ntrials = 100000\nsevens = 0\nfor _ in range(trials):\n    if random.randint(1, 6) + random.randint(1, 6) == 7:\n        sevens += 1\nestimate = sevens / trials\nprint(round(estimate, 3))',
      },
    }),

  L('pip', 'Packages, pip and virtual environments', 'pip inaweka maktaba za ziada; venv hutenganisha miradi; jinsi ya kusoma maelezo ya package.',
    'Write the terminal commands to create a virtual environment called venue-env, activate it and install numpy and pandas.',
    [
      { h: 'Modules, packages and the standard library', p: [
        'A module is a single Python file you can import. A package is a folder of modules. Python comes with the standard library: math, random, json, csv, datetime, statistics and hundreds more. These are always available.',
        'Other people have written thousands of extra packages for everything: data analysis (NumPy, pandas), plots (matplotlib), web (Django, Flask), AI (PyTorch, scikit-learn). These are stored in an online collection called PyPI (the Python Package Index), and you install them with pip.'],
        code: `import sys\nimport importlib.util\n\nprint(sys.version_info >= (3, 9))\nprint(importlib.util.find_spec("json") is not None)\nprint(importlib.util.find_spec("a_package_that_does_not_exist") is None)\n\ntry:\n    import a_package_that_does_not_exist\nexcept ModuleNotFoundError as e:\n    print("ModuleNotFoundError:", e)`,
        explain: ['sys.version_info tells you which Python you are running. Many packages need a minimum version.', 'find_spec checks whether a module can be imported without importing it: json exists, the made-up name does not.', 'Importing a package that is not installed raises ModuleNotFoundError. The usual fix is to install it with pip.'] },
      { h: 'Installing with pip', p: [
        'pip is the package installer. You use it in the terminal (the command line), not inside a Python program. The most common commands:',
        'pip install numpy   installs a package.',
        'pip install pandas==2.2.0   installs an exact version.',
        'pip install --upgrade numpy   updates it.',
        'pip uninstall numpy   removes it.',
        'pip list   shows what is installed.',
        'pip show numpy   shows details of one package.',
        'pip freeze > requirements.txt   saves the list of installed packages and versions into a file, and pip install -r requirements.txt installs them all again on another computer. Sharing a requirements.txt is how teams make sure everyone has the same tools.',
        'On some systems you must write python -m pip install numpy or pip3 install numpy. On Android with Termux the commands are the same once Python is installed.'] },
      { h: 'Virtual environments', p: [
        'Imagine project A needs version 1 of a package and project B needs version 2. If you install everything globally they fight. A virtual environment is a private folder with its own Python and its own packages, so every project has exactly what it needs and nothing else.',
        'The steps in a terminal, inside your project folder:',
        'python -m venv venue-env   creates the environment in a folder called venue-env.',
        'source venue-env/bin/activate   activates it on Linux, macOS and Termux. On Windows use venue-env\\Scripts\\activate.',
        'pip install numpy pandas   now installs only into this environment.',
        'deactivate   leaves the environment.',
        'Keep the environment folder out of Git (add it to .gitignore) and commit requirements.txt instead.'],
        code: `import sys\n\n# Inside a virtual environment, sys.prefix and sys.base_prefix are different.\n# Outside one, they are equal. This tells you whether a venv is active.\nin_venv = sys.prefix != sys.base_prefix\nprint(isinstance(in_venv, bool))`,
        explain: ['Python records where it is installed in sys.base_prefix and where the active environment lives in sys.prefix.', 'When the two differ you are inside a virtual environment. In the VENUE editor and on most plain installs they are the same, so the answer is False, but the check itself always returns a True or False value.', 'Programs and tools use this check to warn you when you are about to install packages globally.'] },
      { h: 'Reading package information and good habits', p: [
        'Before installing a package check that it is popular and maintained: look at its page on pypi.org, its documentation and its recent releases. Install only what you need; every package is code from someone else running on your computer.',
        'Pin versions in requirements.txt for projects you share. Update packages one at a time, run your tests after each update (see the Testing chapter) and read the release notes. If something breaks, you will know which update caused it.',
        'In VENUE the Python editor runs in your browser. The standard library is available; some popular packages such as NumPy and pandas can be loaded in the browser too, which is covered in the data lessons.'] },
    ],
    {
      mistakes: [
        'Typing pip install inside the Python editor or the Python prompt. It is a terminal command.',
        'Installing everything globally and later finding that projects conflict.',
        'Forgetting to activate the environment, so packages go to the wrong place.',
        'Naming your own file after a package (numpy.py or random.py) which breaks imports.',
        'Committing the venv folder to Git instead of requirements.txt.',
      ],
      exercises: [
        { q: 'Write a function has_module(name) that returns True when a module can be imported.', a: `import importlib.util\n\ndef has_module(name):\n    return importlib.util.find_spec(name) is not None\n\nprint(has_module("json"), has_module("not_a_real_module"))` },
        { q: 'Catch ModuleNotFoundError when importing a package that is missing and print a helpful message.', a: `try:\n    import some_missing_package\nexcept ModuleNotFoundError:\n    print("Install it first: pip install some_missing_package")` },
      ],
      quiz: [
        { q: 'Where do you run pip install?', options: ['Inside a Python file', 'In the terminal', 'In the print function', 'In a browser tab'], answer: 1, why: 'pip is a command-line tool, used in the terminal.' },
        { q: 'Why use a virtual environment?', options: ['To make Python faster', 'To keep each project’s packages separate', 'To hide your code', 'To use less memory'], answer: 1, why: 'Each project gets its own packages and versions, so projects do not conflict.' },
        { q: 'What does pip freeze > requirements.txt do?', options: ['Stops Python', 'Saves the installed package list to a file', 'Deletes packages', 'Updates Python'], answer: 1, why: 'It writes the names and versions of installed packages into requirements.txt.' },
      ],
      challenge: {
        prompt: 'Write the function has_module(name) that returns True when a module can be imported (use importlib.util.find_spec) and False otherwise.',
        starter: 'import importlib.util\n\ndef has_module(name):\n    pass\n',
        check: 'assert has_module("json") is True, "json is part of the standard library"\nassert has_module("not_a_real_module_xyz") is False, "this module does not exist"\nassert has_module("math") is True, "math exists"',
        hint: 'return importlib.util.find_spec(name) is not None',
        solution: 'import importlib.util\n\ndef has_module(name):\n    return importlib.util.find_spec(name) is not None\n\nprint(has_module("json"), has_module("nope_xyz"))',
      },
    }),
];
