import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Decisions, repetition and dictionaries/sets. Every example has a line-by-line explanation. */
export const PYTHON_FLOW: LearnLesson[] = [
  L('booleans', 'Booleans and comparisons', 'Comparison hutoa True au False; and/or/not huunganisha masharti.',
    'Decide whether a student with 52 marks and 80% attendance qualifies: marks ≥ 40 and attendance ≥ 75.',
    [
      { h: 'True and False', p: [
        'Python has a special type for yes/no answers called bool. It has only two values: True and False, both written with a capital first letter.',
        'You almost never type True or False yourself. Most of the time they come out of a comparison, which is a question you ask about two values.'],
        code: `print(True)\nprint(False)\nprint(type(True))\nprint(5 > 3)\nprint(5 < 3)`,
        explain: ['print(True) and print(False) show the two values. They are not text, so there are no quotes.', 'type(True) shows <class \'bool\'>: bool is its own type.', '5 > 3 is a question: “is five greater than three?”. Python answers True. 5 < 3 is False.'] },
      { h: 'The six comparison operators', p: [
        'A comparison puts an operator between two values. == equal, != not equal, < less, > greater, <= less or equal, >= greater or equal.',
        'The sign == is two equal signs. One = stores a value; two == asks whether two values are equal. Mixing them up is the most common beginner error.'],
        code: `age = 20\nprint(age == 20)\nprint(age != 20)\nprint(age < 18)\nprint(age >= 18)\nprint("abc" == "abc")\nprint("abc" == "ABC")`,
        explain: ['age == 20 compares the value stored in age with 20: True.', 'age != 20 is the opposite question, so it is False.', 'age < 18 is False because 20 is not less than 18; age >= 18 is True.', 'Text can be compared too, but it is case-sensitive: “abc” and “ABC” are different, so the last line is False.'] },
      { h: 'Combining conditions: and, or, not', p: [
        'and is True only when both sides are True. or is True when at least one side is True. not flips True to False and False to True.',
        'You can chain a range test the way you write it in mathematics: 10 <= x <= 20.'],
        code: `marks = 52\nattendance = 80\nprint(marks >= 40 and attendance >= 75)\nprint(marks >= 40 or attendance >= 95)\nprint(not (marks >= 40))\nx = 15\nprint(10 <= x <= 20)`,
        explain: ['Both parts of the first line are True, so and gives True.', 'In the second line only the first part is True, but or needs just one, so it is True.', 'not (marks >= 40) turns True into False.', '10 <= x <= 20 checks that x is between 10 and 20 in one expression. It is True for 15.'] },
      { h: 'Truthy and falsy values', p: [
        'Any value can be used where Python expects True or False. These count as False: 0, 0.0, the empty string "", the empty list [], the empty dictionary {}, and None. Almost everything else counts as True.',
        'bool(value) shows how Python sees a value. This lets you write if my_list: instead of if len(my_list) > 0:.'],
        code: `print(bool(0), bool(7))\nprint(bool(""), bool("hi"))\nprint(bool([]), bool([0]))\nitems = []\nif items:\n    print("has items")\nelse:\n    print("list is empty")`,
        explain: ['0 is falsy and 7 is truthy.', 'An empty string is falsy; any text with at least one character is truthy.', '[] is falsy, but [0] is truthy because it contains one item, even though that item is zero.', 'items is empty, so the if test fails and the else branch runs.'] },
      { h: 'Membership and identity', p: [
        'in and not in test whether something is inside a list, string, tuple, set or dictionary. is checks whether two names point to exactly the same object; for comparing values use == instead.'],
        code: `courses = ["MT 100", "ST 113"]\nprint("MT 100" in courses)\nprint("PH 101" not in courses)\nprint("stat" in "statistics")\na = [1, 2]\nb = [1, 2]\nprint(a == b, a is b)`,
        explain: ['“MT 100” is in the list, so the first line is True; “PH 101” is not, so the second is True as well.', 'in also works for pieces of text: “stat” appears inside “statistics”.', 'a and b hold equal values, so a == b is True. They are two separate lists, so a is b is False.'] },
    ],
    {
      mistakes: ['Writing if x = 5: instead of if x == 5: gives a SyntaxError.', 'Writing true or false in small letters: Python only knows True and False.', 'Writing if x == 1 or 2: This is always true because 2 alone is truthy. Write x == 1 or x == 2, or x in (1, 2).', 'Comparing a number with text: 5 == "5" is False, and 5 < "6" raises a TypeError.'],
      exercises: [
        { q: 'Print True if a number n is even and greater than 10.', a: `n = 14\nprint(n % 2 == 0 and n > 10)` },
        { q: 'Check that the text typed is "yes" regardless of capital letters or spaces.', a: `answer = "  YES "\nprint(answer.strip().lower() == "yes")` },
        { q: 'Print whether the list [] has items, using truthiness.', a: `data = []\nprint(bool(data))` },
      ],
      quiz: [
        { q: 'What is the value of 5 == "5"?', options: ['True', 'False', 'An error', '5'], answer: 1, why: 'A number and a text are never equal, even if they look alike.' },
        { q: 'Which expression is True?', options: ['not True', 'True and False', 'False or True', 'False and True'], answer: 2, why: 'or needs just one True side.' },
        { q: 'What does bool([]) give?', options: ['True', 'False', 'None', 'Error'], answer: 1, why: 'An empty list is falsy.' },
      ],
      challenge: {
        prompt: 'Given mark and attendance, set qualifies to True only if mark is at least 40 AND attendance is at least 75.',
        starter: 'mark = 52\nattendance = 70\nqualifies = ',
        check: 'assert qualifies is False, "with attendance 70 the student should NOT qualify"\nmark, attendance = 52, 80\nassert (mark >= 40 and attendance >= 75) is True',
        hint: 'qualifies = mark >= 40 and attendance >= 75',
        solution: 'mark = 52\nattendance = 70\nqualifies = mark >= 40 and attendance >= 75\nprint(qualifies)',
      },
    }),

  L('if1', 'if statements', 'if inaendesha code tu pale sharti linapokuwa kweli.',
    'Print “Adult” if age is 18 or more, and also print “Senior” if age is 60 or more.',
    [
      { h: 'The simplest if', p: [
        'An if statement runs a block of code only when its condition is True. The condition is followed by a colon, and the block that belongs to it is indented.',
        'When the condition is False Python skips the whole indented block and carries on with the next unindented line.'],
        code: `age = 19\nif age >= 18:\n    print("You are old enough to vote.")\nprint("Program finished.")`,
        explain: ['age >= 18 is True, so Python enters the indented block and prints the first message.', 'print("Program finished.") is not indented, so it belongs to the main program and always runs.', 'Change age to 15 and run again: the first message disappears but the last one stays.'] },
      { h: 'if … else', p: [
        'else gives the program something to do when the condition is False. Exactly one of the two blocks always runs, never both and never neither.'],
        code: `mark = 38\nif mark >= 40:\n    print("Pass")\nelse:\n    print("Fail")\nprint("Mark checked:", mark)`,
        explain: ['38 >= 40 is False, so the if block is skipped and the else block runs.', 'else has no condition of its own; it simply means “in every other case”.', 'The last line again runs once, whatever the answer was.'] },
      { h: 'Several independent checks', p: [
        'Separate if statements are independent: each one is tested on its own, so several of them can run. This is different from elif, which you will meet next, where only the first true branch runs.'],
        code: `age = 65\nif age >= 18:\n    print("Adult")\nif age >= 60:\n    print("Senior")\nif age >= 100:\n    print("Centenarian")`,
        explain: ['The first test is True, so “Adult” is printed.', 'The second is also True, so “Senior” is printed as well, because it is a separate if.', 'The third is False and prints nothing.'] },
      { h: 'Nested if', p: [
        'You can put an if inside another if. The inner test is reached only if the outer test passed. Keep the indentation tidy: each level moves four spaces to the right.',
        'Very deep nesting is hard to read. Often a single test with and is clearer.'],
        code: `logged_in = True\nis_admin = False\nif logged_in:\n    print("Welcome")\n    if is_admin:\n        print("Admin tools")\n    else:\n        print("Student tools")`,
        explain: ['logged_in is True, so “Welcome” is printed and Python goes on to the inner if.', 'is_admin is False, so the inner else runs and prints “Student tools”.', 'If logged_in were False, nothing inside would run, not even the inner test.'] },
      { h: 'Testing a list', p: [
        'if works nicely with lists. Test whether a value is in the list, or whether the list has any items at all.'],
        code: `registered = ["Asha", "Juma", "Neema"]\nname = "Juma"\nif name in registered:\n    print(name, "is registered")\nelse:\n    print(name, "is not registered")\n\nrequests = []\nif requests:\n    print("There are requests")\nelse:\n    print("No requests yet")`,
        explain: ['“Juma” is found in the list, so the first message is printed.', 'The second block uses truthiness: an empty list counts as False, so the else branch runs.'] },
    ],
    {
      mistakes: ['Forgetting the colon after the condition.', 'Forgetting to indent the block, or indenting by different amounts inside one block (IndentationError).', 'Writing a condition such as if name = "Juma". Use ==.', 'Putting an else after a test you did not mean to be exclusive; use separate ifs when several things can be true together.'],
      exercises: [
        { q: 'Print “Even” or “Odd” for a number.', a: `n = 7\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")` },
        { q: 'Give a discount message if total is over 100000.', a: `total = 125000\nif total > 100000:\n    print("You get a 10% discount")\nelse:\n    print("No discount")` },
        { q: 'Print the largest of two numbers using if/else.', a: `a, b = 12, 30\nif a > b:\n    print(a)\nelse:\n    print(b)` },
      ],
      quiz: [
        { q: 'Which line starts an if block correctly?', options: ['if x > 5', 'if x > 5:', 'if (x > 5);', 'if x > 5 then'], answer: 1, why: 'A colon ends the line; the block is then indented.' },
        { q: 'age = 65 with three separate ifs: >=18, >=60, >=100. How many messages print?', options: ['1', '2', '3', '0'], answer: 1, why: 'The first two conditions are true, the third is not.' },
      ],
      challenge: {
        prompt: 'Complete the function pass_or_fail(mark): return "Pass" when mark is 40 or more, otherwise "Fail".',
        starter: 'def pass_or_fail(mark):\n    pass\n',
        check: 'assert pass_or_fail(40) == "Pass", "40 should give Pass"\nassert pass_or_fail(39) == "Fail", "39 should give Fail"\nassert pass_or_fail(95) == "Pass", "95 should give Pass"',
        hint: 'if mark >= 40:\n    return "Pass"\nreturn "Fail"',
        solution: 'def pass_or_fail(mark):\n    if mark >= 40:\n        return "Pass"\n    return "Fail"\n\nprint(pass_or_fail(36), pass_or_fail(70))',
      },
    }),

  L('if2', 'elif chains and patterns', 'elif inaruhusu njia nyingi; njia ya kwanza yenye ukweli ndiyo inayoendeshwa.',
    'Write a function that returns a grade letter for a mark using elif.',
    [
      { h: 'elif: many choices', p: [
        'elif means “else if”. Python tests the conditions from top to bottom and runs the block of the first one that is True. After that it ignores the rest of the chain, even if later conditions would also be true.',
        'Because of this, put the strictest condition first.'],
        code: `mark = 68\nif mark >= 70:\n    grade = "A"\nelif mark >= 60:\n    grade = "B"\nelif mark >= 50:\n    grade = "C"\nelif mark >= 40:\n    grade = "D"\nelse:\n    grade = "F"\nprint(grade)`,
        explain: ['68 >= 70 is False, so Python moves on.', '68 >= 60 is True, so grade becomes “B” and the remaining tests are skipped.', 'If you reordered the tests and put mark >= 40 first, every passing mark would become “D”. Order matters.'] },
      { h: 'A tiered price example', p: [
        'The same idea works for prices, tax brackets, discounts or any set of ranges.'],
        code: `quantity = 120\nif quantity >= 200:\n    price = 800\nelif quantity >= 100:\n    price = 900\nelif quantity >= 50:\n    price = 1000\nelse:\n    price = 1200\nprint(f"Price per item: {price}")\nprint(f"Total: {price * quantity:,}")`,
        explain: ['120 is not at least 200, but it is at least 100, so the price is 900.', 'The f-string then multiplies price by quantity and formats with thousands separators: 108,000.'] },
      { h: 'The conditional expression', p: [
        'When an if/else only chooses between two values, you can write it on one line: value_if_true if condition else value_if_false.',
        'Use it for short, clear choices. Use the full if for anything longer.'],
        code: `age = 20\nstatus = "adult" if age >= 18 else "minor"\nprint(status)\nn = -4\nprint(n if n >= 0 else -n)   # absolute value`,
        explain: ['The condition age >= 18 is True, so status receives “adult”.', 'The second example chooses n when it is non-negative, otherwise -n: it reproduces abs().'] },
      { h: 'Checking several values with in', p: [
        'Instead of a long chain of or tests, ask whether the value is in a list, tuple or set.'],
        code: `day = "Sat"\nif day in ("Sat", "Sun"):\n    print("Weekend")\nelse:\n    print("Weekday")`,
        explain: ['The tuple holds both weekend days. day in (...) is True when day equals either one.', 'This is shorter and easier to extend than day == "Sat" or day == "Sun".'] },
      { h: 'Putting it in a function', p: [
        'Because you will use this logic again and again, wrap it in a function. The function returns a result instead of printing, so other code can use it.'],
        code: `def grade_for(mark):\n    if mark >= 70:\n        return "A"\n    elif mark >= 60:\n        return "B"\n    elif mark >= 50:\n        return "C"\n    elif mark >= 40:\n        return "D"\n    return "F"\n\nfor m in [85, 63, 41, 12]:\n    print(m, grade_for(m))`,
        explain: ['The function receives a mark and returns a letter. As soon as a return runs, the function ends, so no else is needed after it.', 'The final return "F" runs only if none of the earlier conditions matched.', 'The loop calls the function for four marks and prints each pair.'] },
    ],
    {
      mistakes: ['Writing separate ifs when you meant an elif chain: a mark of 75 would then get several grades.', 'Putting the weaker condition first, so the stronger ones never run.', 'Forgetting that else has no condition and no condition may be written after it.', 'Writing elif without a previous if.'],
      exercises: [
        { q: 'Classify a temperature: below 10 cold, 10-25 mild, above 25 hot.', a: `t = 18\nif t < 10:\n    print("cold")\nelif t <= 25:\n    print("mild")\nelse:\n    print("hot")` },
        { q: 'FizzBuzz for one number: print Fizz if divisible by 3, Buzz if by 5, FizzBuzz if both, else the number.', a: `n = 15\nif n % 15 == 0:\n    print("FizzBuzz")\nelif n % 3 == 0:\n    print("Fizz")\nelif n % 5 == 0:\n    print("Buzz")\nelse:\n    print(n)` },
        { q: 'Write days_in(month) for months 2 (28), 4, 6, 9, 11 (30), others 31.', a: `def days_in(month):\n    if month == 2:\n        return 28\n    if month in (4, 6, 9, 11):\n        return 30\n    return 31\n\nprint(days_in(2), days_in(4), days_in(12))` },
      ],
      quiz: [
        { q: 'mark = 85, chain: >=50 → "C", >=70 → "B", >=80 → "A". What is the grade?', options: ['A', 'B', 'C', 'None'], answer: 2, why: 'The first true condition wins, and 85 >= 50 comes first.' },
        { q: 'What does "adult" if age >= 18 else "minor" produce for age = 12?', options: ['"adult"', '"minor"', 'True', 'Error'], answer: 1, why: 'The condition is False, so the value after else is used.' },
      ],
      challenge: {
        prompt: 'Complete the function bracket(income) which returns "low" below 500000, "middle" from 500000 up to 1500000 (not including), and "high" otherwise.',
        starter: 'def bracket(income):\n    pass\n',
        check: 'assert bracket(100000) == "low", "bracket(100000) should be low"\nassert bracket(500000) == "middle", "bracket(500000) should be middle"\nassert bracket(1499999) == "middle", "bracket(1499999) should be middle"\nassert bracket(1500000) == "high", "bracket(1500000) should be high"',
        hint: 'Use if income < 500000: ... elif income < 1500000: ... else: ...',
        solution: 'def bracket(income):\n    if income < 500000:\n        return "low"\n    elif income < 1500000:\n        return "middle"\n    return "high"\n\nprint(bracket(100000), bracket(900000), bracket(2000000))',
      },
    }),

  L('while1', 'while loops', 'while inarudia mradi sharti ni kweli; hakikisha kuna kinachobadilisha sharti.',
    'Use a while loop to keep doubling a number until it passes 1000 and count the steps.',
    [
      { h: 'How a while loop works', p: [
        'A for loop walks through a collection. A while loop repeats for as long as a condition stays True. Python checks the condition before every round. When it becomes False, the loop ends and the program continues after it.',
        'Something inside the loop must eventually make the condition False. If nothing does, the loop never stops (an infinite loop).'],
        code: `count = 1\nwhile count <= 5:\n    print(count)\n    count += 1\nprint("Finished, count is", count)`,
        explain: ['count starts at 1. The test count <= 5 is True, so the body runs: it prints 1 and adds 1.', 'This repeats for 2, 3, 4 and 5. After printing 5, count becomes 6.', 'Now 6 <= 5 is False, so the loop ends and the last line shows 6.'] },
      { h: 'Accumulating until a target is reached', p: [
        'while is the right tool when you do not know in advance how many rounds you need.'],
        code: `balance = 1000\nrate = 0.10\nyears = 0\nwhile balance < 2000:\n    balance = balance * (1 + rate)\n    years += 1\nprint(years, "years")\nprint(round(balance, 2))`,
        explain: ['Each round the balance grows by 10% and years counts the rounds.', 'We cannot say beforehand how many years it takes, so a while loop fits better than for.', 'It stops as soon as the balance is 2000 or more. The answer is 8 years.'] },
      { h: 'break: leave early', p: [
        'break ends the loop immediately, whatever the condition says. A common pattern is while True: with a break inside, used when the exit test is easier to write in the middle of the loop.'],
        code: `n = 1\nwhile True:\n    if n * n > 200:\n        break\n    n += 1\nprint("First n whose square exceeds 200:", n)`,
        explain: ['while True never stops by itself, so the break is our only exit.', 'Each round tests n squared. When 15 * 15 = 225 is above 200 the break runs.', 'Python jumps to the first line after the loop and prints 15.'] },
      { h: 'continue: skip this round', p: [
        'continue jumps straight to the next round, skipping the rest of the body. It is useful for ignoring items you do not want without nesting everything in an if.'],
        code: `n = 0\nwhile n < 10:\n    n += 1\n    if n % 2 == 0:\n        continue\n    print(n, end=" ")`,
        explain: ['n is increased first. If n is even, continue skips the print and goes back to the test.', 'Only odd numbers reach the print, so you see 1 3 5 7 9.', 'Increase n before continue; if you forget, the loop gets stuck on the same n.'] },
      { h: 'Moving items between lists', p: [
        'A while loop is also handy for processing a list while you change it. A non-empty list counts as True, so while items: runs until the list is empty.'],
        code: `queue = ["Asha", "Juma", "Neema"]\nserved = []\nwhile queue:\n    person = queue.pop(0)\n    print("Serving", person)\n    served.append(person)\nprint(served)\nprint(queue)`,
        explain: ['pop(0) removes and returns the first item, so people are served in the order they arrived.', 'Each person is added to served.', 'When the last person leaves, queue is empty, which is falsy, and the loop ends.'] },
    ],
    {
      mistakes: ['Forgetting to change the variable in the condition, which creates an infinite loop. If a run never ends, close the editor and fix the update.', 'Updating in the wrong place, so the loop runs one time too many or too few.', 'Using continue before the line that updates the counter.', 'Using a for loop when you only need to repeat until a condition: use while.'],
      exercises: [
        { q: 'Print the numbers from 10 down to 1 with a while loop.', a: `n = 10\nwhile n >= 1:\n    print(n, end=" ")\n    n -= 1` },
        { q: 'Find the first power of 2 greater than 1000.', a: `p = 1\nwhile p <= 1000:\n    p *= 2\nprint(p)` },
        { q: 'Sum 1, 2, 3 ... until the total passes 100. How many numbers were needed?', a: `total = 0\nn = 0\nwhile total <= 100:\n    n += 1\n    total += n\nprint(n, total)` },
      ],
      quiz: [
        { q: 'What does this print?\n\nn = 3\nwhile n > 0:\n    n -= 1\nprint(n)', options: ['3', '1', '0', '-1'], answer: 2, why: 'The loop stops when n is 0, and then 0 is printed.' },
        { q: 'What does break do?', options: ['Skips one round', 'Ends the loop immediately', 'Ends the program', 'Restarts the loop'], answer: 1, why: 'break leaves the loop; continue skips one round.' },
      ],
      challenge: {
        prompt: 'Starting with n = 1, keep doubling n while it is below 1000. Afterwards, steps must hold how many doublings were needed and n the final value.',
        starter: 'n = 1\nsteps = 0\n',
        check: 'assert steps == 10, "steps should be 10, got " + str(steps)\nassert n == 1024, "n should be 1024, got " + str(n)',
        hint: 'while n < 1000:\n    n *= 2\n    steps += 1',
        solution: 'n = 1\nsteps = 0\nwhile n < 1000:\n    n *= 2\n    steps += 1\nprint(steps, n)',
      },
    }),

  L('dicts1', 'Dictionaries: the basics', 'Dictionary ni jozi za ufunguo na thamani; unaitafuta kwa ufunguo, si kwa nafasi.',
    'Store a student’s name, year and GPA in a dictionary, then add the programme.',
    [
      { h: 'Key–value pairs', p: [
        'A list finds items by position. A dictionary finds them by a name called a key. Each key is paired with a value, like a word and its meaning in a real dictionary, or a course code and its title.',
        'You write it with curly brackets: {key: value, key: value}. Keys are usually strings or numbers and must be unique. Values can be anything, including lists and other dictionaries.'],
        code: `student = {"name": "Asha", "year": 2, "gpa": 4.1}\nprint(student)\nprint(student["name"])\nprint(student["gpa"])\nprint(len(student))\nprint(type(student))`,
        explain: ['Each pair has a text key, a colon and a value. Pairs are separated by commas.', 'student["name"] looks up the value that belongs to the key “name”.', 'len counts the pairs: 3. type shows that this is a dict.'] },
      { h: 'Adding and changing', p: [
        'Assigning to a key that exists replaces its value; assigning to a new key adds a pair. You do not need a special method for adding.'],
        code: `student = {"name": "Asha", "year": 2}\nstudent["year"] = 3\nstudent["programme"] = "Statistics"\nstudent["gpa"] = 4.1\nprint(student)`,
        explain: ['“year” already exists, so its value changes from 2 to 3.', '“programme” and “gpa” are new keys, so they are added at the end.', 'Python keeps the order in which keys were first added.'] },
      { h: 'Reading safely with get()', p: [
        'Asking for a key that does not exist with square brackets raises KeyError. get(key) returns None instead, and get(key, default) lets you choose the fallback value.'],
        code: `student = {"name": "Asha", "year": 2}\nprint(student.get("name"))\nprint(student.get("gpa"))\nprint(student.get("gpa", "not recorded"))\nprint("year" in student)\nprint("gpa" in student)`,
        explain: ['An existing key behaves exactly as with brackets.', 'student.get("gpa") finds nothing and returns None; no error.', 'With a second argument, that value is returned when the key is missing.', 'in tests keys, not values: “year” is a key, “gpa” is not.'] },
      { h: 'Removing pairs', p: [
        'del dict[key] deletes a pair. pop(key) deletes it and hands the value back to you. clear() empties the dictionary.'],
        code: `phone = {"Asha": "0712", "Juma": "0754", "Neema": "0620"}\ndel phone["Asha"]\nprint(phone)\nnumber = phone.pop("Juma")\nprint(number)\nprint(phone)`,
        explain: ['del removes “Asha” and its number.', 'pop("Juma") removes the pair and returns the value, which we stored in number.', 'Only Neema is left.'] },
      { h: 'Counting with a dictionary', p: [
        'A dictionary is perfect for counting. The key is the thing being counted; the value is how many times it appeared. This is the same idea as a frequency table in statistics.'],
        code: `votes = ["a", "b", "a", "c", "a", "b"]\ncount = {}\nfor v in votes:\n    count[v] = count.get(v, 0) + 1\nprint(count)`,
        explain: ['count starts empty.', 'For each vote, count.get(v, 0) returns the current tally or 0 if the key is new. Adding 1 and storing it back updates the tally.', 'The result is {"a": 3, "b": 2, "c": 1}.'] },
    ],
    {
      mistakes: ['Using a missing key with brackets (KeyError). Use get() or test with in first.', 'Using a list as a key: keys must be unchangeable (strings, numbers, tuples).', 'Thinking in tests values: "Asha" in phone checks the keys.', 'Repeating a key in one dictionary: the later value silently replaces the earlier one.'],
      exercises: [
        { q: 'Make a dictionary of three course codes and their credits, then print the credits of one code.', a: `credits = {"MT 100": 12, "ST 113": 12, "FN 100": 12}\nprint(credits["ST 113"])` },
        { q: 'Count how many times each letter appears in "banana".', a: `count = {}\nfor ch in "banana":\n    count[ch] = count.get(ch, 0) + 1\nprint(count)` },
        { q: 'Print "unknown" for a missing key without causing an error.', a: `d = {"a": 1}\nprint(d.get("z", "unknown"))` },
      ],
      quiz: [
        { q: 'd = {"a": 1}; what does d["b"] do?', options: ['Returns None', 'Returns 0', 'Raises KeyError', 'Adds the key b'], answer: 2, why: 'Reading a missing key with brackets raises KeyError. get() is the safe way.' },
        { q: 'What does "name" in student test?', options: ['Whether a value equals name', 'Whether a key is name', 'Whether it is a list', 'The length'], answer: 1, why: 'in checks the keys of a dictionary.' },
      ],
      challenge: {
        prompt: 'Using a loop and a dictionary, build counts: how many times each word appears in the list words.',
        starter: 'words = ["data", "stat", "data", "math", "stat", "data"]\ncounts = {}\n',
        check: 'assert counts == {"data": 3, "stat": 2, "math": 1}, "counts should be {data: 3, stat: 2, math: 1}, got " + str(counts)',
        hint: 'for w in words: counts[w] = counts.get(w, 0) + 1',
        solution: 'words = ["data", "stat", "data", "math", "stat", "data"]\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts)',
      },
    }),

  L('dicts2', 'Dictionaries: looping and nesting', 'Pitia keys, values au items; weka list au dictionary ndani ya dictionary.',
    'Loop through a dictionary of marks and print each name with its grade.',
    [
      { h: 'Looping over pairs', p: [
        'items() gives each key together with its value. keys() gives only the keys and values() only the values. A plain for loop over a dictionary gives the keys.'],
        code: `marks = {"Asha": 78, "Juma": 64, "Neema": 91}\nfor name, mark in marks.items():\n    print(f"{name}: {mark}")\nprint(list(marks.keys()))\nprint(list(marks.values()))\nprint(sum(marks.values()) / len(marks))`,
        explain: ['for name, mark in marks.items() unpacks each pair into two variables.', 'keys() and values() are views; list(...) turns them into ordinary lists so they print nicely.', 'The mean of the marks is the sum of the values divided by the number of pairs: about 77.67.'] },
      { h: 'Sorted output', p: [
        'Dictionaries keep insertion order. To show them in another order, sort the keys, or sort the items with a key function.'],
        code: `marks = {"Asha": 78, "Juma": 64, "Neema": 91}\nfor name in sorted(marks):\n    print(name, marks[name])\nprint()\nfor name, mark in sorted(marks.items(), key=lambda p: p[1], reverse=True):\n    print(name, mark)`,
        explain: ['sorted(marks) sorts the keys alphabetically; we then look each value up.', 'In the second loop each item is a pair p; p[1] is the mark. Sorting by it with reverse=True gives the best student first.'] },
      { h: 'A list of dictionaries', p: [
        'Real data often looks like a table: each row is a dictionary with the same keys, and the rows live in a list. This is exactly the shape of JSON data from the web.'],
        code: `students = [\n    {"name": "Asha", "gpa": 4.2},\n    {"name": "Juma", "gpa": 3.1},\n    {"name": "Neema", "gpa": 4.6},\n]\nfor s in students:\n    print(s["name"], s["gpa"])\nbest = max(students, key=lambda s: s["gpa"])\nprint("Best:", best["name"])\nprint([s["name"] for s in students if s["gpa"] > 4])`,
        explain: ['Each item of the list is a small dictionary; s["name"] reads one field.', 'max(..., key=...) finds the dictionary with the largest gpa.', 'The last line is a comprehension that keeps only names with gpa above 4.'] },
      { h: 'Dictionaries inside dictionaries', p: [
        'A value can itself be a dictionary or a list. Reach inside by using one pair of brackets after another.'],
        code: `course = {\n    "code": "ST 113",\n    "title": "Basic Statistics",\n    "lecturer": {"name": "Dr. Mushi", "office": "Room 12"},\n    "topics": ["Mean", "Median", "Variance"],\n}\nprint(course["lecturer"]["name"])\nprint(course["topics"][1])\ncourse["topics"].append("Correlation")\nprint(len(course["topics"]))`,
        explain: ['course["lecturer"] gives the inner dictionary; ["name"] then reads a value from it.', 'course["topics"][1] first gets the list, then picks index 1: “Median”.', 'The list inside the dictionary can be changed with normal list methods.'] },
      { h: 'Merging and building dictionaries', p: [
        'update() copies pairs from one dictionary into another. The operator | creates a merged copy. A dictionary comprehension builds one from a loop in a single line.'],
        code: `a = {"x": 1, "y": 2}\nb = {"y": 20, "z": 30}\nprint(a | b)\na.update(b)\nprint(a)\nsquares = {n: n ** 2 for n in range(1, 6)}\nprint(squares)`,
        explain: ['When both dictionaries have the key y, the right-hand value (20) wins.', 'update changes a in place, while | builds a new dictionary and leaves both originals alone.', 'The comprehension {n: n ** 2 for n in ...} makes each number the key and its square the value.'] },
    ],
    {
      mistakes: ['Changing the size of a dictionary while looping over it (RuntimeError). Loop over list(d) instead.', 'Expecting sorted(d) to sort by value; it sorts keys.', 'Forgetting that nested access needs one bracket pair per level.', 'Using d.keys()[0]: views cannot be indexed; use list(d)[0].'],
      exercises: [
        { q: 'Given prices {"bread": 1500, "milk": 1800}, print the total of all values.', a: `prices = {"bread": 1500, "milk": 1800}\nprint(sum(prices.values()))` },
        { q: 'Find the name with the highest mark.', a: `marks = {"Asha": 78, "Juma": 64, "Neema": 91}\nprint(max(marks, key=marks.get))` },
        { q: 'Build a dictionary mapping each word to its length.', a: `words = ["data", "science", "ai"]\nprint({w: len(w) for w in words})` },
      ],
      quiz: [
        { q: 'What does a plain for loop over a dictionary give?', options: ['Values', 'Keys', 'Pairs', 'Indexes'], answer: 1, why: 'Use items() for pairs and values() for values.' },
        { q: 'course = {"lecturer": {"name": "Dr. Mushi"}}. How do you read the name?', options: ['course["name"]', 'course["lecturer"]["name"]', 'course.lecturer.name', 'course[0][0]'], answer: 1, why: 'One bracket per level.' },
      ],
      challenge: {
        prompt: 'From the dictionary marks, build passed: a list of the names with a mark of 50 or more, in the same order as the dictionary.',
        starter: 'marks = {"Asha": 78, "Juma": 45, "Neema": 91, "Baraka": 50}\npassed = ',
        check: 'assert passed == ["Asha", "Neema", "Baraka"], "passed should be [Asha, Neema, Baraka], got " + str(passed)',
        hint: '[name for name, m in marks.items() if m >= 50]',
        solution: 'marks = {"Asha": 78, "Juma": 45, "Neema": 91, "Baraka": 50}\npassed = [name for name, m in marks.items() if m >= 50]\nprint(passed)',
      },
    }),

  L('sets', 'Sets', 'Set haina vitu vinavojirudia na haina mpangilio; ni nzuri kwa union, intersection na kuondoa duplicates.',
    'Find which students attend both Maths and Statistics using a set operation.',
    [
      { h: 'Unique items', p: [
        'A set is an unordered collection of unique values written with curly brackets. If you add a value that is already there, nothing changes. Sets have no index because they have no order.',
        'Turn a list into a set to remove duplicates at once. Note that an empty set is written set(), because {} makes an empty dictionary.'],
        code: `nums = {3, 1, 2, 3, 1}\nprint(nums)\nprint(len(nums))\nprint(set([1, 2, 2, 3, 3, 3]))\nprint(2 in nums)\nprint(type({}), type(set()))`,
        explain: ['Duplicates disappear: 3 and 1 appear only once, so the set has three items.', 'set([...]) removes duplicates from a list.', 'in is very fast on a set, much faster than on a long list.', '{} is a dictionary; set() is the empty set.'] },
      { h: 'Adding and removing', p: [
        'add() inserts one item, update() adds many. remove() deletes an item but raises KeyError if it is missing, while discard() never complains.'],
        code: `s = {"a", "b"}\ns.add("c")\ns.add("a")\ns.update(["d", "e"])\nprint(sorted(s))\ns.remove("e")\ns.discard("zzz")\nprint(sorted(s))`,
        explain: ['Adding “a” again changes nothing. update adds both d and e.', 'We print sorted(s) because the order of a set is not guaranteed.', 'discard of a missing item is silently ignored; remove would raise an error.'] },
      { h: 'Set operations from mathematics', p: [
        'Sets support the operations you know from mathematics: union (everything in either set), intersection (only what is in both), difference (in the first but not the second) and symmetric difference (in exactly one).'],
        code: `maths = {"Asha", "Juma", "Neema", "Baraka"}\nstats = {"Juma", "Neema", "Zawadi"}\nprint(sorted(maths | stats))\nprint(sorted(maths & stats))\nprint(sorted(maths - stats))\nprint(sorted(maths ^ stats))`,
        explain: ['maths | stats is the union: all five different names.', 'maths & stats is the intersection: Juma and Neema attend both.', 'maths - stats keeps those only in maths: Asha and Baraka.', 'maths ^ stats keeps names that are in exactly one set: Asha, Baraka and Zawadi.'] },
      { h: 'Subsets and checking', p: [
        'issubset, issuperset and isdisjoint answer yes/no questions about how two sets relate.'],
        code: `a = {1, 2}\nb = {1, 2, 3, 4}\nprint(a.issubset(b))\nprint(b.issuperset(a))\nprint(a.isdisjoint({7, 8}))\nprint(a <= b)`,
        explain: ['Every item of a is in b, so a is a subset of b.', 'b contains all of a, so it is a superset.', 'a and {7, 8} share nothing, so they are disjoint.', 'a <= b is the operator form of issubset.'] },
    ],
    {
      mistakes: ['Writing {} for an empty set (it is an empty dictionary).', 'Trying to read set[0]: sets have no order and no index.', 'Putting a list inside a set: only unchangeable values (numbers, strings, tuples) are allowed.', 'Relying on the printed order of a set.'],
      exercises: [
        { q: 'Remove the duplicates from [5, 3, 5, 1, 3] and print them in order.', a: `print(sorted(set([5, 3, 5, 1, 3])))` },
        { q: 'Two groups: which letters appear in both words “statistics” and “mathematics”?', a: `print(sorted(set("statistics") & set("mathematics")))` },
        { q: 'How many different words are in the sentence "to be or not to be"?', a: `print(len(set("to be or not to be".split())))` },
      ],
      quiz: [
        { q: 'What is {1, 2, 3} & {2, 3, 4}?', options: ['{1, 2, 3, 4}', '{2, 3}', '{1, 4}', '{}'], answer: 1, why: '& is the intersection: what both sets share.' },
        { q: 'Which creates an empty set?', options: ['{}', '[]', 'set()', '()'], answer: 2, why: '{} makes an empty dictionary.' },
      ],
      challenge: {
        prompt: 'Create only_a: the names that are in group_a but not in group_b, as a sorted list.',
        starter: 'group_a = {"Asha", "Juma", "Neema"}\ngroup_b = {"Neema", "Baraka"}\nonly_a = ',
        check: 'assert only_a == ["Asha", "Juma"], "only_a should be [Asha, Juma], got " + str(only_a)',
        hint: 'sorted(group_a - group_b)',
        solution: 'group_a = {"Asha", "Juma", "Neema"}\ngroup_b = {"Neema", "Baraka"}\nonly_a = sorted(group_a - group_b)\nprint(only_a)',
      },
    }),
];
