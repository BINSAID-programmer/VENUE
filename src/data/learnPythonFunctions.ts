import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Chapter 8: Functions — one main topic, subtopics in teaching order. */
export const PYTHON_FUNCTIONS: LearnLesson[] = [
  L('fdef', 'Defining a function', 'Function ni kipande cha code chenye jina unachoweza kukiita tena na tena.',
    'Write a function welcome(name) that prints a welcome message for a student, then call it for three students.',
    [
      { h: 'Why functions?', p: [
        'Imagine you must print the same three lines of a report header in ten places of a program. You could copy and paste them, but if you later want to change one word, you must find and edit all ten copies, and you might miss one.',
        'A function solves this. You write the instructions once, give them a name, and then use the name whenever you need them. This is the idea behind almost every program: break a big job into small named jobs, each easy to understand and test.',
        'You have already used functions that Python provides: print(), len(), range(), sum(). Now you will write your own.'] },
      { h: 'Your first function', p: [
        'A function definition has four parts. The keyword def tells Python you are defining a function. Then comes the function name, then a pair of brackets, then a colon. Every line of the body is indented below it.',
        'Defining a function does not run it. It only teaches Python the instructions. The code runs when you call the function by writing its name followed by brackets.'],
        code: `def greet_student():\n    """Display a simple greeting."""\n    print("Karibu, student!")\n\ngreet_student()\ngreet_student()`,
        explain: ['def greet_student(): starts the definition. The brackets are empty because this function needs no information, and the colon tells Python an indented body follows.', 'The text in triple quotes is a docstring: a comment that describes what the function does. It is good practice to add one.', 'print(...) is the body: the work the function does.', 'The two calls greet_student() at the bottom each run the body once, so the greeting appears twice. Remove them and nothing would be printed, because a definition alone does nothing.'] },
      { h: 'Passing information to a function', p: [
        'Most functions need some input to do their job. You tell the function what information it expects by writing a name between the brackets. That name behaves like a variable that exists only inside the function.',
        'The name in the definition is called a parameter. The actual value you give when you call the function is called an argument. This is one of the most confused pairs of words in programming: parameter = the box, argument = what you put in the box.'],
        code: `def greet_student(name):\n    """Display a personal greeting."""\n    print(f"Karibu, {name.title()}!")\n\ngreet_student("asha")\ngreet_student("juma")\ngreet_student("neema")`,
        explain: ['name is the parameter. Inside the function it holds whatever value was passed in.', 'Each call passes a different argument: "asha", then "juma", then "neema".', 'name.title() capitalises the first letter, so the output is tidy even though we typed the names in small letters.', 'We wrote the print logic once and used it three times. If you change the greeting, you change one line.'] },
      { h: 'What happens when a function is called', p: [
        'Python reads the call, jumps to the definition, creates the parameter variables from the arguments, runs the body line by line and, when the body ends, jumps back to the line after the call. The parameter variables disappear when the function finishes.',
        'Because of this, a function can use the same parameter name as a variable outside it without any conflict. They are different variables that happen to share a name.'],
        code: `def show(n):\n    print("inside:", n)\n    n = n * 10\n    print("inside after change:", n)\n\nn = 5\nshow(n)\nprint("outside:", n)`,
        explain: ['The outside variable n is 5. When we call show(n), the value 5 is copied into the parameter n.', 'Inside, the parameter changes to 50. This does not touch the outside n.', 'After the call, the outside n is still 5. Inside and outside are separate worlds, which keeps functions safe to reuse.'] },
      { h: 'Functions that call other functions', p: [
        'A function body can call other functions. This lets you build bigger tasks from small ones.'],
        code: `def line():\n    print("-" * 20)\n\ndef title(text):\n    line()\n    print(text.upper())\n    line()\n\ntitle("student report")\ntitle("exam results")`,
        explain: ['line() prints a row of 20 dashes. "-" * 20 repeats the text 20 times.', 'title() calls line() twice, once above and once below the text.', 'Each call to title() therefore draws a framed heading. Notice that we defined line() before using it: a function must be defined before the line that calls it runs.'] },
    ],
    {
      mistakes: [
        'Forgetting the brackets when calling: greet_student does nothing; greet_student() runs it.',
        'Calling a function before it is defined (NameError). Put the definition above the first call.',
        'Forgetting the colon or the indent of the body.',
        'Mixing up parameter and argument. The parameter is in the def line; the argument is in the call.',
        'Calling a function with the wrong number of arguments (TypeError).',
      ],
      exercises: [
        { q: 'Write display_message() that prints one sentence about what you are learning, then call it.', a: `def display_message():\n    """Say what I am learning."""\n    print("I am learning Python functions in VENUE.")\n\ndisplay_message()` },
        { q: 'Write favorite_book(title) that prints “One of my favorite books is <title>.” Call it with two different titles.', a: `def favorite_book(title):\n    print(f"One of my favorite books is {title}.")\n\nfavorite_book("Alice in Wonderland")\nfavorite_book("Things Fall Apart")` },
        { q: 'Write stars(n) that prints a line of n stars, and use it to draw a triangle of 4 rows.', a: `def stars(n):\n    print("*" * n)\n\nfor row in range(1, 5):\n    stars(row)` },
      ],
      quiz: [
        { q: 'In def greet(name): ... greet("Asha"), what is "Asha"?', options: ['A parameter', 'An argument', 'A function', 'A module'], answer: 1, why: 'The value passed in the call is the argument. name is the parameter.' },
        { q: 'What does defining a function (def …) do by itself?', options: ['Runs the function', 'Prints its name', 'Only stores the instructions', 'Raises an error'], answer: 2, why: 'The body runs only when the function is called.' },
        { q: 'Which line correctly calls a function named show?', options: ['def show()', 'show', 'show()', 'call show'], answer: 2, why: 'A call is the name followed by brackets.' },
      ],
      challenge: {
        prompt: 'Write the function box(text) that prints the text between two lines of 10 equals signs (==========), one line above and one below.',
        starter: 'def box(text):\n    pass\n',
        check: 'import io, contextlib\nbuf = io.StringIO()\nwith contextlib.redirect_stdout(buf):\n    box("hello")\nassert buf.getvalue() == "==========\\nhello\\n==========\\n", "box(\\"hello\\") should print three lines: ==========, hello, =========="',
        hint: 'print("=" * 10), then print(text), then print("=" * 10)',
        solution: 'def box(text):\n    print("=" * 10)\n    print(text)\n    print("=" * 10)\n\nbox("hello")',
      },
    }),

  L('fargs', 'Passing arguments', 'Arguments za nafasi, za majina, na thamani chaguomsingi; jinsi ya kuepuka makosa ya arguments.',
    'Write describe_course(code, title, credits=12) and call it using positional, keyword and default arguments.',
    [
      { h: 'Many parameters, many ways to pass', p: [
        'A function can have several parameters, so a call must supply a matching number of arguments. Python gives you three ways to pass them: by position, by keyword, and by relying on default values. You can also mix them with some rules.'] },
      { h: 'Positional arguments', p: [
        'When you call a function, Python must match each argument to a parameter. The simplest way is by order: the first argument goes to the first parameter, the second to the second, and so on. These are called positional arguments.',
        'Order matters. If you swap the arguments you swap the meaning, and Python will not warn you.'],
        code: `def describe_pet(animal, name):\n    print(f"I have a {animal} named {name.title()}.")\n\ndescribe_pet("hamster", "harry")\ndescribe_pet("dog", "willie")\ndescribe_pet("harry", "hamster")   # swapped by mistake`,
        explain: ['In the first two calls the first argument goes to animal and the second to name, so the sentences are correct.', 'The third call has the same two values in the wrong order. Python obeys and prints a silly sentence without any error.', 'You can call the function as many times as you like. Each call is independent.'] },
      { h: 'Keyword arguments', p: [
        'A keyword argument is written as name=value in the call. Python matches it by name, so the order no longer matters. This also makes calls easier to read: describe_pet(animal="hamster", name="harry") tells you what each value is.'],
        code: `def describe_pet(animal, name):\n    print(f"I have a {animal} named {name.title()}.")\n\ndescribe_pet(animal="hamster", name="harry")\ndescribe_pet(name="harry", animal="hamster")`,
        explain: ['Both calls produce exactly the same sentence even though the arguments are in different order, because each value is attached to a parameter name.', 'Use the exact parameter names from the definition. Writing pet_name= would raise a TypeError.'] },
      { h: 'Default values', p: [
        'You can give a parameter a default value in the definition: animal="dog". If the call does not supply that argument, Python uses the default. If it does, the new value wins.',
        'Parameters with defaults must come after parameters without defaults in the definition. That is why the order of parameters is often: required first, optional last.'],
        code: `def describe_pet(name, animal="dog"):\n    print(f"I have a {animal} named {name.title()}.")\n\ndescribe_pet("willie")\ndescribe_pet(name="willie")\ndescribe_pet("harry", "hamster")\ndescribe_pet(name="harry", animal="hamster")`,
        explain: ['The first two calls give only the name, so animal takes its default value, "dog".', 'The last two calls override the default and say hamster.', 'We moved name to the front because it is required, while animal is the optional one with a default.'] },
      { h: 'Equivalent function calls', p: [
        'Because positional arguments, keyword arguments and defaults can be mixed, there are many ways to write calls that mean the same thing. Choose the clearest one. Do not worry about which style is “correct”; they all work. Just be consistent and readable.'],
        code: `def describe_pet(name, animal="dog"):\n    return f"{name.title()} the {animal}"\n\nprint(describe_pet("willie"))\nprint(describe_pet(name="willie"))\nprint(describe_pet("willie", "dog"))\nprint(describe_pet(name="willie", animal="dog"))\nprint(describe_pet(animal="dog", name="willie"))`,
        explain: ['All five calls end up with name="willie" and animal="dog", so they print the same text five times.', 'The first call is the shortest because it uses the default. When defaults match what you want, leave them out.'] },
      { h: 'Avoiding argument errors', p: [
        'When you give too few or too many arguments, Python raises a TypeError and tells you exactly what is wrong. Read the message: it names the function and the missing parameter.'],
        code: `def describe_pet(animal, name):\n    print(f"I have a {animal} named {name}.")\n\ndescribe_pet()`,
        explain: ['The function needs two arguments and we gave none.', 'Python reports TypeError: describe_pet() missing 2 required positional arguments: \'animal\' and \'name\'. The message even lists the names of the missing parameters, so the fix is easy.', 'Giving too many arguments gives a similar error that says how many were expected.'] },
    ],
    {
      mistakes: [
        'Swapping positional arguments: the code runs but gives wrong results.',
        'Putting a parameter with a default before one without (SyntaxError).',
        'Using the wrong keyword name in a call.',
        'Using a changeable default such as items=[]: the same list is shared between calls. Use None instead and create a new list inside.',
      ],
      exercises: [
        { q: 'Write make_shirt(size, message) and call it positionally and with keywords.', a: `def make_shirt(size, message):\n    print(f"The shirt is size {size} and says: {message}")\n\nmake_shirt("L", "I love Python")\nmake_shirt(message="I love Python", size="M")` },
        { q: 'Change make_shirt so that size defaults to "L" and message to "I love Python". Call it with defaults and with a different message.', a: `def make_shirt(size="L", message="I love Python"):\n    print(f"The shirt is size {size} and says: {message}")\n\nmake_shirt()\nmake_shirt(message="Statistics rocks")\nmake_shirt("S", "Hello")` },
        { q: 'Write describe_city(city, country="Tanzania") and call it for three cities.', a: `def describe_city(city, country="Tanzania"):\n    print(f"{city} is in {country}.")\n\ndescribe_city("Dar es Salaam")\ndescribe_city("Dodoma")\ndescribe_city("Nairobi", "Kenya")` },
      ],
      quiz: [
        { q: 'Which call passes by keyword?', options: ['f("a", "b")', 'f(x="a", y="b")', 'f()', 'f(a, b)'], answer: 1, why: 'name=value is a keyword argument.' },
        { q: 'def f(a, b=2). Which call is valid?', options: ['f()', 'f(1)', 'f(b=3)', 'f(1, 2, 3)'], answer: 1, why: 'a is required; b has a default.' },
        { q: 'Why must parameters with defaults come last?', options: ['Style only', 'Python cannot match positional arguments otherwise', 'They run last', 'They are private'], answer: 1, why: 'A required parameter after an optional one makes the call ambiguous, so Python forbids it.' },
      ],
      challenge: {
        prompt: 'Write the function power(base, exponent=2) that returns base raised to exponent. power(5) must be 25 and power(2, 10) must be 1024.',
        starter: 'def power(base, exponent=2):\n    pass\n',
        check: 'assert power(5) == 25, "power(5) should be 25"\nassert power(2, 10) == 1024, "power(2, 10) should be 1024"\nassert power(base=3, exponent=3) == 27, "keyword call power(base=3, exponent=3) should be 27"',
        hint: 'return base ** exponent',
        solution: 'def power(base, exponent=2):\n    return base ** exponent\n\nprint(power(5), power(2, 10))',
      },
    }),

  L('freturn', 'Return values', 'return hurudisha matokeo kwa aliyeita function ili autumie kwingine.',
    'Write a function that returns a full name, and one that returns a dictionary describing a student.',
    [
      { h: 'Printing vs returning', p: [
        'So far our functions printed their result. That is fine for a message, but a function that only prints is hard to reuse: you cannot store the answer, compare it or use it in a calculation.',
        'A function can instead hand a value back to the code that called it using the return statement. The call then behaves like a value: you can store it in a variable, print it, add it to something or pass it to another function.',
        'As soon as Python runs a return, the function ends immediately and sends the value back. Lines after the return are never reached.'] },
      { h: 'Returning a simple value', p: [
        'Here the function builds a neat full name and returns it. The caller decides what to do with the result.'],
        code: `def get_formatted_name(first_name, last_name):\n    """Return a neatly formatted full name."""\n    full_name = f"{first_name} {last_name}"\n    return full_name.title()\n\nmusician = get_formatted_name("jimi", "hendrix")\nprint(musician)\nprint(get_formatted_name("ada", "lovelace"))\nprint(len(musician))`,
        explain: ['The function builds the text, makes it title case and returns it. It does not print anything itself.', 'The first call stores the result in musician, and we print it afterwards.', 'The second call uses the returned text directly inside print.', 'Because the call returns a real string, we can even use it in len(musician), which would be impossible if the function had only printed.'] },
      { h: 'What a function returns if you forget return', p: [
        'A function without a return statement returns the special value None, which means “nothing”. This is the cause of many beginner bugs: you assign the result and later find it is None.'],
        code: `def double_print(n):\n    print(n * 2)\n\nresult = double_print(5)\nprint(result)\n\ndef double_return(n):\n    return n * 2\n\nresult = double_return(5)\nprint(result + 1)`,
        explain: ['double_print prints 10 but returns nothing, so result is None.', 'double_return gives back the number, so we can add 1 to it and get 11.', 'If you ever see None where you expected a value, check whether the function really has a return.'] },
      { h: 'Making an argument optional', p: [
        'Sometimes a parameter is not needed every time, such as a middle name. Give it the default value of an empty string and test it inside the function. An empty string is falsy, so if middle_name: is True only when a middle name was supplied.'],
        code: `def get_formatted_name(first_name, last_name, middle_name=""):\n    if middle_name:\n        full_name = f"{first_name} {middle_name} {last_name}"\n    else:\n        full_name = f"{first_name} {last_name}"\n    return full_name.title()\n\nprint(get_formatted_name("jimi", "hendrix"))\nprint(get_formatted_name("john", "hooker", "lee"))`,
        explain: ['The first call gives no middle name, so the default "" is used and the else branch runs.', 'The second call supplies "lee", which is truthy, so the first branch runs.', 'The same function now handles both situations.'] },
      { h: 'Returning a dictionary', p: [
        'A function can return any kind of value: a list, a dictionary, a tuple. Returning a dictionary is a clean way to package several related details.'],
        code: `def build_student(name, programme, age=None):\n    """Return a dictionary of information about a student."""\n    student = {"name": name.title(), "programme": programme}\n    if age:\n        student["age"] = age\n    return student\n\nprint(build_student("asha", "Statistics"))\nprint(build_student("juma", "Mathematics", age=20))`,
        explain: ['We build a dictionary with two pairs and return it.', 'The age is optional. The default is None, which is falsy, so the extra pair is only added when an age is given.', 'Notice the output of the second call has three pairs.'] },
      { h: 'Returning several values', p: [
        'Python lets you return several values separated by commas. They come back as a tuple, and you can unpack them straight into variables. This is handy for functions that compute more than one thing.'],
        code: `def min_max(numbers):\n    return min(numbers), max(numbers)\n\nlow, high = min_max([4, 9, 2, 7])\nprint(low, high)\nprint(min_max([4, 9, 2, 7]))`,
        explain: ['return min(numbers), max(numbers) returns the pair (2, 9).', 'low, high = ... unpacks that pair into two variables.', 'Printing the call directly shows the tuple (2, 9).'] },
      { h: 'Using a function with a while loop', p: [
        'Functions combine nicely with loops. A loop can keep calling a function until the user decides to stop.'],
        code: `def get_formatted_name(first_name, last_name):\n    return f"{first_name} {last_name}".title()\n\nwhile True:\n    print("Please tell me your name (enter 'q' to quit):")\n    f_name = input("First name: ")\n    if f_name == "q":\n        break\n    l_name = input("Last name: ")\n    if l_name == "q":\n        break\n    print("Hello,", get_formatted_name(f_name, l_name) + "!")`,
        explain: ['The loop runs forever with while True, and break is the exit.', 'Each round asks for both names; typing q at either prompt ends the loop.', 'The formatting itself is done by the function, so the loop only has to handle the conversation. Press Run and boxes will ask for your input.'] },
    ],
    {
      mistakes: [
        'Printing inside a function and then expecting to use the answer.',
        'Writing code after the return line: it never runs.',
        'Assigning the result of a function that has no return: you get None.',
        'Returning inside a loop on the first round when you meant to return after the loop finishes.',
      ],
      exercises: [
        { q: 'Write city_country(city, country) that returns “Dodoma, Tanzania”.', a: `def city_country(city, country):\n    return f"{city.title()}, {country.title()}"\n\nprint(city_country("dodoma", "tanzania"))` },
        { q: 'Write make_album(artist, title, tracks=None) that returns a dictionary; add the number of tracks only if given.', a: `def make_album(artist, title, tracks=None):\n    album = {"artist": artist, "title": title}\n    if tracks:\n        album["tracks"] = tracks\n    return album\n\nprint(make_album("Diamond Platnumz", "A Boy From Tandale"))\nprint(make_album("Harmonize", "Afro East", 20))` },
        { q: 'Write average(numbers) that returns the mean, and use it in an f-string with two decimals.', a: `def average(numbers):\n    return sum(numbers) / len(numbers)\n\nmarks = [56, 71, 84, 63]\nprint(f"Average: {average(marks):.2f}")` },
        { q: 'Write stats(numbers) that returns the minimum, maximum and mean as three values.', a: `def stats(numbers):\n    return min(numbers), max(numbers), sum(numbers) / len(numbers)\n\nlow, high, mean = stats([3, 8, 5, 10])\nprint(low, high, mean)` },
      ],
      quiz: [
        { q: 'What does a function return if it has no return statement?', options: ['0', '""', 'None', 'An error'], answer: 2, why: 'None means “no value”.' },
        { q: 'What happens to lines after a return?', options: ['They run', 'They never run', 'They run twice', 'Error'], answer: 1, why: 'return ends the function immediately.' },
        { q: 'What does return a, b give?', options: ['Only a', 'A tuple (a, b)', 'A list', 'An error'], answer: 1, why: 'Several values are returned as a tuple.' },
      ],
      challenge: {
        prompt: 'Write is_even(n) that returns True for even numbers and False for odd numbers. Do not use print.',
        starter: 'def is_even(n):\n    pass\n',
        check: 'assert is_even(4) is True, "is_even(4) should be True"\nassert is_even(7) is False, "is_even(7) should be False"\nassert is_even(0) is True, "is_even(0) should be True"',
        hint: 'return n % 2 == 0',
        solution: 'def is_even(n):\n    return n % 2 == 0\n\nprint(is_even(4), is_even(7))',
      },
    }),

  L('flists', 'Passing a list to a function', 'Function inaweza kupokea list; ikiibadilisha, list ya asili inabadilika.',
    'Write a function that prints a greeting for each name in a list, and one that sorts a copy without changing the original.',
    [
      { h: 'A list as an argument', p: [
        'You can pass any value to a function, including a list. Inside the function you can loop over it, count it or search it, exactly as outside. This is how a function can process a whole collection of data in one call.'],
        code: `def greet_users(names):\n    """Print a simple greeting to each user in the list."""\n    for name in names:\n        print(f"Hello, {name.title()}!")\n\nusernames = ["hannah", "ty", "margot"]\ngreet_users(usernames)`,
        explain: ['The parameter names receives the whole list.', 'The loop inside the function visits each item and prints a greeting.', 'We could call greet_users with any other list and it would work, with no change to the function.'] },
      { h: 'Modifying a list in a function', p: [
        'When you pass a list to a function, the function receives the list itself, not a private copy. If the function changes it (append, remove, sort), the original list outside the function is changed too, permanently.',
        'This is powerful: a function can do real work on your data. It is also a trap if you did not intend the change.'],
        code: `def print_models(unprinted, completed):\n    """Move each design from unprinted to completed, printing as we go."""\n    while unprinted:\n        current = unprinted.pop()\n        print("Printing model:", current)\n        completed.append(current)\n\ndef show_completed(completed):\n    print("The following models have been printed:")\n    for model in completed:\n        print(model)\n\nunprinted_designs = ["phone case", "robot pendant", "dodecahedron"]\ncompleted_models = []\nprint_models(unprinted_designs, completed_models)\nshow_completed(completed_models)\nprint(unprinted_designs)`,
        explain: ['print_models empties the first list and fills the second one. It works on the original lists we passed, so after the call unprinted_designs is empty and completed_models has three items.', 'The final print shows [] to prove that the outside list was changed.', 'Each function has one clear job: one moves items, the other displays them. Small focused functions are easier to understand and to fix.'] },
      { h: 'Preventing a function from modifying a list', p: [
        'If the function should not change your list, pass a copy. A slice of the whole list, my_list[:], makes a copy. The function can then change the copy freely and the original stays safe.',
        'Unless there is a good reason, it is more efficient to let a function work on the original list, because copying a very large list takes time and memory. Copy only when you need the original later.'],
        code: `def print_models(unprinted, completed):\n    while unprinted:\n        current = unprinted.pop()\n        completed.append(current)\n\ndesigns = ["case", "pendant", "cube"]\ndone = []\nprint_models(designs[:], done)   # pass a copy\nprint(designs)\nprint(done)`,
        explain: ['designs[:] is a new list with the same items.', 'The function empties that copy, so designs outside is untouched.', 'done is the real list we passed, so it receives the items.'] },
      { h: 'A function that returns a changed copy', p: [
        'A cleaner way to avoid surprises is to write functions that do not change their input but return a new list. The caller can then decide whether to keep the old or the new one.'],
        code: `def sorted_marks(marks):\n    result = marks.copy()\n    result.sort(reverse=True)\n    return result\n\noriginal = [55, 72, 40, 88]\nranked = sorted_marks(original)\nprint(original)\nprint(ranked)`,
        explain: ['marks.copy() makes an independent list inside the function.', 'Sorting the copy leaves the input alone.', 'We return the sorted copy. original keeps its order; ranked has the new order.'] },
    ],
    {
      mistakes: [
        'Forgetting that a function changes the list you pass in.',
        'Using the same list as default argument: def f(items=[]) reuses one list across calls. Use None and create a list inside.',
        'Copying with b = a, which is not a copy.',
      ],
      exercises: [
        { q: 'Write show_messages(messages) that prints each message in a list.', a: `def show_messages(messages):\n    for m in messages:\n        print(m)\n\nshow_messages(["Hi", "How are you?", "Bye"])` },
        { q: 'Write send_messages(messages, sent) that moves each message to the sent list, then call it with a copy so the original stays intact.', a: `def send_messages(messages, sent):\n    while messages:\n        m = messages.pop(0)\n        print("Sending:", m)\n        sent.append(m)\n\nmsgs = ["Hi", "Hello", "Bye"]\nsent = []\nsend_messages(msgs[:], sent)\nprint(msgs, sent)` },
        { q: 'Write add_tax(prices, rate) that returns a new list with the tax added to every price and leaves the original unchanged.', a: `def add_tax(prices, rate):\n    return [round(p * (1 + rate), 2) for p in prices]\n\nprices = [1000, 2500, 400]\nprint(add_tax(prices, 0.18))\nprint(prices)` },
      ],
      quiz: [
        { q: 'A function appends an item to the list it received. What happens to the original list?', options: ['Nothing', 'It also gets the item', 'It is deleted', 'Error'], answer: 1, why: 'The function works on the same list, not a copy.' },
        { q: 'How do you pass a copy of items to a function?', options: ['f(items)', 'f(items[:])', 'f(items.copy)', 'f(copy)'], answer: 1, why: 'items[:] (or items.copy()) makes a copy.' },
      ],
      challenge: {
        prompt: 'Write remove_negatives(numbers) that returns a new list without the negative numbers. The original list must not change.',
        starter: 'def remove_negatives(numbers):\n    pass\n',
        check: 'data = [3, -1, 4, -5, 0]\nassert remove_negatives(data) == [3, 4, 0], "should return [3, 4, 0]"\nassert data == [3, -1, 4, -5, 0], "the original list must not change"',
        hint: '[n for n in numbers if n >= 0]',
        solution: 'def remove_negatives(numbers):\n    return [n for n in numbers if n >= 0]\n\nprint(remove_negatives([3, -1, 4, -5, 0]))',
      },
    }),

  L('farbitrary', 'Arbitrary numbers of arguments', '*args hukusanya arguments zozote kwenye tuple; **kwargs hukusanya zenye majina kwenye dictionary.',
    'Write a function that adds any number of marks and one that builds a profile from any keyword details.',
    [
      { h: 'When you do not know how many arguments', p: [
        'Sometimes you cannot know in advance how many values a caller will give. A pizza shop does not know how many toppings a customer will order; a calculator might need to add two numbers or twenty. Python has two special notations that collect extra arguments for you.'] },
      { h: '*args: any number of positional arguments', p: [
        'A parameter name with a single star in front, such as *toppings, tells Python to collect all the positional arguments into one tuple with that name. The call can pass zero, one or fifty arguments.',
        'By tradition the name is args, but any name works. What matters is the star.'],
        code: `def make_pizza(*toppings):\n    print("Making a pizza with:")\n    for topping in toppings:\n        print("-", topping)\n\nmake_pizza("pepperoni")\nmake_pizza("mushrooms", "green peppers", "extra cheese")\nmake_pizza()`,
        explain: ['toppings becomes a tuple holding whatever was passed: ("pepperoni",), then three items, then an empty tuple ().', 'The loop works for any length, including zero, so the last call prints just the heading.', 'Remember: inside the function *toppings is an ordinary tuple.'] },
      { h: 'Mixing positional and arbitrary arguments', p: [
        'If a function has normal parameters as well, put the *args parameter last. Python first fills the normal parameters and gives everything left over to *args.'],
        code: `def make_pizza(size, *toppings):\n    print(f"Making a {size}-inch pizza with:")\n    for t in toppings:\n        print("-", t)\n\nmake_pizza(16, "pepperoni")\nmake_pizza(12, "mushrooms", "green peppers", "extra cheese")`,
        explain: ['The first argument always goes to size.', 'All remaining arguments are collected into the tuple toppings.', 'That is why *toppings must come after size in the definition.'] },
      { h: '**kwargs: any number of keyword arguments', p: [
        'Two stars collect all extra keyword arguments into a dictionary. The names become the keys and the values become the values. This is ideal for “profiles” where you do not know which details will be given.'],
        code: `def build_profile(first, last, **user_info):\n    """Build a dictionary containing everything we know about a user."""\n    user_info["first_name"] = first\n    user_info["last_name"] = last\n    return user_info\n\nprofile = build_profile("albert", "einstein", location="princeton", field="physics")\nprint(profile)\nfor key, value in profile.items():\n    print(f"{key}: {value}")`,
        explain: ['first and last are normal parameters.', 'location="princeton" and field="physics" do not match any parameter, so they are gathered into the dictionary user_info.', 'We add the two normal values to the same dictionary and return it. The caller can supply any extra details without us changing the function.'] },
      { h: 'Unpacking when calling', p: [
        'The stars also work the other way round when you call a function: *list spreads a list into separate positional arguments, and **dictionary spreads a dictionary into keyword arguments.'],
        code: `def add(a, b, c):\n    return a + b + c\n\nnumbers = [1, 2, 3]\nprint(add(*numbers))\n\ndetails = {"a": 10, "b": 20, "c": 30}\nprint(add(**details))\n\nprint(max(*[4, 9, 2]))`,
        explain: ['add(*numbers) means add(1, 2, 3).', 'add(**details) means add(a=10, b=20, c=30).', 'The same trick works with built-in functions such as max.'] },
    ],
    {
      mistakes: [
        'Putting *args before normal parameters.',
        'Forgetting that args is a tuple (cannot be changed) and kwargs is a dictionary.',
        'Using the same keyword twice in a call.',
      ],
      exercises: [
        { q: 'Write total(*numbers) that returns the sum of all its arguments. Call it with 2 and with 5 numbers.', a: `def total(*numbers):\n    return sum(numbers)\n\nprint(total(1, 2))\nprint(total(1, 2, 3, 4, 5))` },
        { q: 'Write make_car(manufacturer, model, **options) that returns a dictionary of everything.', a: `def make_car(manufacturer, model, **options):\n    car = {"manufacturer": manufacturer, "model": model}\n    car.update(options)\n    return car\n\nprint(make_car("subaru", "outback", color="blue", tow_package=True))` },
        { q: 'Write largest(first, *rest) that returns the biggest of all its numbers.', a: `def largest(first, *rest):\n    return max((first, *rest))\n\nprint(largest(3, 9, 4))\nprint(largest(7))` },
      ],
      quiz: [
        { q: 'What type is args inside def f(*args)?', options: ['list', 'tuple', 'dict', 'set'], answer: 1, why: 'Positional extras are collected in a tuple.' },
        { q: 'What type is kwargs inside def f(**kwargs)?', options: ['list', 'tuple', 'dict', 'set'], answer: 2, why: 'Keyword extras are collected in a dictionary.' },
      ],
      challenge: {
        prompt: 'Write mean(*numbers) that returns the average of any number of values. mean(2, 4, 6) must be 4.',
        starter: 'def mean(*numbers):\n    pass\n',
        check: 'assert mean(2, 4, 6) == 4, "mean(2, 4, 6) should be 4"\nassert mean(10) == 10, "mean(10) should be 10"\nassert mean(1, 2) == 1.5, "mean(1, 2) should be 1.5"',
        hint: 'sum(numbers) / len(numbers)',
        solution: 'def mean(*numbers):\n    return sum(numbers) / len(numbers)\n\nprint(mean(2, 4, 6))',
      },
    }),

  L('fmodules', 'Storing functions in modules', 'Module ni faili la functions; unaliingiza kwa import.',
    'Use the statistics and math modules to compute the mean, median and square root of some data.',
    [
      { h: 'Why modules?', p: [
        'As your programs grow, putting everything in one file becomes hard to read. A module is simply a .py file that holds functions (and later classes). Your main program imports the module and uses what is inside. This keeps each file short, lets you reuse code in many programs and lets teams share work.',
        'Python itself ships with a large standard library of modules. You have already used some: math, random, datetime, json, statistics.'] },
      { h: 'Importing an entire module', p: [
        'The simplest form is import module_name. Python makes all the module’s functions available, and you reach them with the dot: module_name.function_name(). The module name in front shows the reader where the function comes from.'],
        code: `import math\nimport statistics\n\nprint(math.sqrt(144))\nprint(math.pi)\ndata = [12, 15, 9, 20, 14]\nprint(statistics.mean(data))\nprint(statistics.median(data))`,
        explain: ['import math loads the module once. We call math.sqrt() with the module name and a dot.', 'math.pi is not a function but a value stored in the module; it is read the same way.', 'statistics.mean and statistics.median compute the average and the middle value of the list.'] },
      { h: 'Importing specific functions', p: [
        'If you need only a few functions, import them by name: from module import function. You can then call them without the module prefix. Separate several names with commas.'],
        code: `from math import sqrt, floor, ceil\nfrom statistics import mean, median\n\nprint(sqrt(81))\nprint(floor(2.7), ceil(2.1))\nprint(mean([1, 2, 3, 4]), median([1, 2, 3, 4]))`,
        explain: ['After the from … import line, sqrt, floor and ceil are available as if you had defined them yourself.', 'This makes the calls shorter, but the reader can no longer see which module a name came from, so use it for a few well-known names.'] },
      { h: 'Giving names an alias with as', p: [
        'Use as to give a function or a module a shorter or clearer name. This is very common in data science: import numpy as np, import pandas as pd. The alias is only used in your file.'],
        code: `import statistics as st\nfrom math import sqrt as square_root\n\nprint(st.stdev([2, 4, 4, 4, 5, 5, 7, 9]))\nprint(square_root(49))`,
        explain: ['statistics is now called st, so the code is shorter to type.', 'sqrt is imported under the new name square_root. Use aliases when a name is very long or clashes with one of your own names.'] },
      { h: 'Importing all functions (and why to avoid it)', p: [
        'from module import * brings every function of the module into your file without the prefix. It saves typing but is risky: you may not know which names it added, and they can overwrite your own variables. Most style guides tell you to avoid it, and professional code almost never uses it.'],
        code: `from math import *\nprint(sqrt(16), pi)`,
        explain: ['This works, but if your program also had a variable called pi it would be silently replaced.', 'The recommended habit is the plain import math or a short list of names.'] },
      { h: 'Writing your own module', p: [
        'Any file of yours can be a module. Suppose you save these functions in a file called grades.py:'],
        code: `# grades.py  (a file you create)\ndef letter(mark):\n    if mark >= 70:\n        return "A"\n    if mark >= 60:\n        return "B"\n    return "C or below"\n\n# main.py  (another file in the same folder)\n#   import grades\n#   print(grades.letter(75))\n\n# Here we call the function directly:\nprint(letter(75))`,
        explain: ['The first part is the module: it only defines a function.', 'The commented lines show how a second file in the same folder would use it: import grades, then grades.letter(75).', 'Inside this single page we cannot create a second file, so we call letter directly. On your computer, put the two files in the same folder and run main.py.'] },
    ],
    {
      mistakes: [
        'Naming your own file the same as a standard module (for example random.py or math.py): Python imports your file instead of the real module.',
        'Forgetting the module name before the dot when you used plain import.',
        'Using from module import * in real programs.',
        'Importing in the middle of the file. Put imports at the top.',
      ],
      exercises: [
        { q: 'Use random to pick a random student from a list (seed it so the answer is repeatable).', a: `import random\nrandom.seed(7)\nstudents = ["Asha", "Juma", "Neema", "Baraka"]\nprint(random.choice(students))` },
        { q: 'Import only floor and ceil from math and use them on 7.3.', a: `from math import floor, ceil\nprint(floor(7.3), ceil(7.3))` },
        { q: 'Import statistics as st and print the mean and standard deviation of [5, 7, 9, 11].', a: `import statistics as st\ndata = [5, 7, 9, 11]\nprint(st.mean(data))\nprint(round(st.stdev(data), 3))` },
      ],
      quiz: [
        { q: 'Which line imports only the sqrt function?', options: ['import sqrt', 'from math import sqrt', 'import math.sqrt as', 'math import sqrt'], answer: 1, why: 'from module import name.' },
        { q: 'What does import statistics as st do?', options: ['Renames the file', 'Lets you write st.mean(...)', 'Deletes the module', 'Installs it'], answer: 1, why: 'as creates a short alias for the module.' },
      ],
      challenge: {
        prompt: 'Use the math module to set hyp to the hypotenuse of a right triangle with sides 3 and 4 (use math.sqrt).',
        starter: 'import math\nhyp = ',
        check: 'assert hyp == 5.0, "hyp should be 5.0"',
        hint: 'math.sqrt(3 ** 2 + 4 ** 2)',
        solution: 'import math\nhyp = math.sqrt(3 ** 2 + 4 ** 2)\nprint(hyp)',
      },
    }),

  L('fstyle', 'Styling functions', 'Majina yenye maana, docstring, nafasi, na function moja kazi moja.',
    'Improve the badly styled function so it follows the rules.',
    [
      { h: 'Rules that make functions pleasant', p: [
        'Give functions descriptive names written in lower case with underscores: get_formatted_name, not gfn or GetName. A good name says what the function does, so a reader understands a call without opening the definition.',
        'Write a short docstring right under the def line. It should say what the function does and what it returns. Tools and editors show it when someone uses your function.',
        'Put no spaces around the = sign for default values and keyword arguments: def greet(name="friend") and greet(name="Asha").',
        'Leave two blank lines between one function and the next. Keep the line length under about 79 characters; if a definition has many parameters, put each on its own line.',
        'Put all import statements at the top of the file, before any function.',
        'Let each function do one job. A function that reads data, calculates, formats and prints is hard to test. Split it into small functions.'],
        code: `# Hard to read\ndef f(a,b = 2):\n  return a*b\n\n# Good\ndef multiply(number, factor=2):\n    """Return number multiplied by factor."""\n    return number * factor\n\n\nprint(multiply(5))\nprint(multiply(5, factor=3))`,
        explain: ['The first function works, but its name and parameters say nothing, the spacing is uneven and it has no docstring.', 'The second one has a clear name, clear parameter names, a docstring and standard spacing.', 'Both give the same answer, but only the second is something you would want to read in six months.'] },
      { h: 'One job per function', p: [
        'Compare these two designs. The first function does everything. The second splits the job into three small functions that you can reuse and test separately.'],
        code: `def clean(text):\n    return text.strip().lower()\n\n\ndef count_words(text):\n    return len(clean(text).split())\n\n\ndef report(text):\n    print(f"Words: {count_words(text)}")\n\n\nreport("   The Quick brown fox  ")`,
        explain: ['clean() only cleans, count_words() only counts and report() only prints.', 'count_words reuses clean, which is exactly why small functions are valuable: they become building blocks.', 'If you later want the count without printing, you can call count_words directly.'] },
    ],
    {
      mistakes: ['Very long functions that do many unrelated things.', 'Names such as data1, temp, func.', 'No docstring or an outdated docstring.', 'Spaces around = in defaults.'],
      quiz: [
        { q: 'Which function name follows Python style?', options: ['GetName', 'getName', 'get_name', 'GET-NAME'], answer: 2, why: 'Functions use lower case words joined by underscores.' },
        { q: 'Where do import statements go?', options: ['Inside functions', 'At the top of the file', 'At the end', 'Anywhere'], answer: 1, why: 'The convention is to import at the top.' },
      ],
    }),

  L('scope', 'Scope: local and global names', 'Variable ndani ya function ni ya ndani tu; unaweza kusoma za nje, lakini kuzibadilisha kunahitaji global.',
    'Explain why changing a variable inside a function does not change the one outside it.',
    [
      { h: 'Where a name lives', p: [
        'Every variable has a scope: the part of the program where it exists. A variable created inside a function is local to that function. It appears when the function starts and disappears when it ends. Code outside cannot see it.',
        'A variable created outside all functions is global. It can be read from anywhere, including from inside functions.'],
        code: `school = "UDSM"          # global\n\ndef show():\n    year = 2026          # local\n    print(school, year)\n\nshow()\nprint(school)\nprint(year)`,
        explain: ['school is global, so show() can read it.', 'year is created inside show(), so it exists only there.', 'The last line fails with NameError: name \'year\' is not defined, because the local variable no longer exists outside the function.'] },
      { h: 'Same name, different variables', p: [
        'If a function assigns to a name, Python creates a new local variable, even when a global variable with the same name exists. The global one is left untouched.'],
        code: `count = 10\n\ndef change():\n    count = 99\n    print("inside:", count)\n\nchange()\nprint("outside:", count)`,
        explain: ['Inside change(), count = 99 creates a brand new local variable.', 'The global count is still 10 after the call.', 'This protects your program: a function cannot accidentally ruin variables elsewhere.'] },
      { h: 'Changing a global on purpose', p: [
        'If you really need a function to change a global variable, declare it with the keyword global first. Use this rarely: functions that depend on and change outside variables are hard to understand and test. Prefer to pass values in and return results.'],
        code: `total = 0\n\ndef add(n):\n    global total\n    total += n\n\nadd(5)\nadd(7)\nprint(total)\n\n# Cleaner: no global needed\ndef add_pure(current, n):\n    return current + n\n\nprint(add_pure(add_pure(0, 5), 7))`,
        explain: ['global total tells Python that total in this function means the outside variable.', 'Both calls change it, so total ends at 12.', 'The second version gets the same result by passing values in and returning the answer, which is safer.'] },
      { h: 'Recursion: a function that calls itself', p: [
        'A function may call itself. This is called recursion. It needs a base case that stops the chain; otherwise it never ends. Recursion fits problems that repeat in a smaller form, such as factorial: n! = n × (n−1)!.'],
        code: `def factorial(n):\n    if n <= 1:           # base case\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))\nprint(factorial(10))`,
        explain: ['factorial(5) is 5 × factorial(4), which is 5 × 4 × factorial(3), and so on until factorial(1), which returns 1.', 'The answers then multiply back up: 120.', 'Without the base case the function would call itself without end and Python would stop with RecursionError.'] },
    ],
    {
      mistakes: ['Expecting a local variable to exist after the function ends.', 'Using global everywhere instead of parameters and return.', 'Recursion without a base case.'],
      exercises: [
        { q: 'Write a recursive function sum_to(n) that returns 1 + 2 + … + n.', a: `def sum_to(n):\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)\n\nprint(sum_to(10))` },
        { q: 'Write countdown(n) that prints n, n-1, … 1 and then “Go!” using recursion.', a: `def countdown(n):\n    if n == 0:\n        print("Go!")\n        return\n    print(n)\n    countdown(n - 1)\n\ncountdown(3)` },
      ],
      quiz: [
        { q: 'A variable created inside a function is…', options: ['Global', 'Local', 'Constant', 'A parameter only'], answer: 1, why: 'It exists only while the function runs.' },
        { q: 'What must every recursive function have?', options: ['A loop', 'A base case', 'A global variable', 'A docstring'], answer: 1, why: 'The base case stops the chain of calls.' },
      ],
      challenge: {
        prompt: 'Write fib(n) that returns the n-th Fibonacci number using recursion: fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2).',
        starter: 'def fib(n):\n    pass\n',
        check: 'assert [fib(i) for i in range(8)] == [0, 1, 1, 2, 3, 5, 8, 13], "fib(0..7) should be 0 1 1 2 3 5 8 13"',
        hint: 'if n < 2: return n\nreturn fib(n - 1) + fib(n - 2)',
        solution: 'def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint([fib(i) for i in range(10)])',
      },
    }),

  L('flambda', 'Lambda and functions as values', 'Function ni thamani kama nyingine: unaweza kuihifadhi, kuipitisha, na kuandika ndogo kwa lambda.',
    'Sort a list of students by their marks using a lambda.',
    [
      { h: 'Functions are values', p: [
        'In Python a function is an object, just like a number or a list. You can store it in a variable, put it in a list or a dictionary, pass it to another function and return it. This idea is the foundation of many powerful tools.',
        'Notice the difference: square is the function itself; square(4) is the result of calling it.'],
        code: `def square(n):\n    return n * n\n\nf = square              # no brackets: the function itself\nprint(f(6))\n\noperations = {"square": square, "double": lambda n: n * 2}\nfor name, op in operations.items():\n    print(name, op(7))`,
        explain: ['f = square gives the function a second name. f(6) then calls it.', 'The dictionary stores two functions under text keys. Looping over it, op(7) calls each one.', 'lambda n: n * 2 is a tiny nameless function; the next section explains it.'] },
      { h: 'lambda: a one-line function', p: [
        'A lambda is a small anonymous function written on one line: lambda parameters: expression. The value of the expression is returned automatically. It is handy when you need a short function once, for example as a sorting rule.'],
        code: `add = lambda a, b: a + b\nprint(add(3, 4))\n\nstudents = [("Asha", 78), ("Juma", 64), ("Neema", 91)]\nstudents.sort(key=lambda s: s[1], reverse=True)\nprint(students)`,
        explain: ['lambda a, b: a + b is the same as def add(a, b): return a + b.', 'sort(key=...) asks the function for each item’s “sorting value”. The lambda picks the mark (index 1) of each pair, so the list is sorted by mark, highest first.', 'Use def when the function is long or used in many places; use lambda for tiny one-off rules.'] },
      { h: 'map, filter and sorted with functions', p: [
        'Several built-in functions take another function as an argument. map applies a function to every item, filter keeps the items for which a function returns True, sorted and max can take a key function. In everyday Python, list comprehensions often replace map and filter, but you will meet both in other people’s code.'],
        code: `numbers = [1, 2, 3, 4, 5, 6]\nsquares = list(map(lambda n: n ** 2, numbers))\nevens = list(filter(lambda n: n % 2 == 0, numbers))\nprint(squares)\nprint(evens)\nwords = ["kiwi", "banana", "fig"]\nprint(max(words, key=len))\nprint(sorted(words, key=len))`,
        explain: ['map builds the squares; filter keeps the even numbers. list(...) turns the results into lists we can print.', 'max(words, key=len) finds the longest word by length: banana.', 'sorted(words, key=len) orders by length: fig, kiwi, banana.'] },
      { h: 'Functions that return functions', p: [
        'A function can create and return another function. This is how you make families of related tools, such as “a multiplier by 3” and “a multiplier by 10”.'],
        code: `def make_multiplier(factor):\n    def multiply(n):\n        return n * factor\n    return multiply\n\ntriple = make_multiplier(3)\nten_times = make_multiplier(10)\nprint(triple(5))\nprint(ten_times(5))`,
        explain: ['make_multiplier defines a small function inside itself and returns it, without calling it.', 'The inner function remembers factor from the place where it was created, so triple always multiplies by 3 and ten_times by 10.', 'Each call to make_multiplier builds a new, independent function.'] },
    ],
    {
      mistakes: ['Writing f = square() when you wanted the function itself (it calls it).', 'Putting several statements in a lambda; it can contain only one expression.', 'Overusing lambda for long logic that deserves a named function.'],
      exercises: [
        { q: 'Sort ["pear","fig","banana","kiwi"] by the last letter of each word.', a: `words = ["pear", "fig", "banana", "kiwi"]\nprint(sorted(words, key=lambda w: w[-1]))` },
        { q: 'Use filter and lambda to keep marks of 50 or more.', a: `marks = [35, 72, 48, 90, 50]\nprint(list(filter(lambda m: m >= 50, marks)))` },
        { q: 'Write make_adder(n) that returns a function adding n to its argument.', a: `def make_adder(n):\n    return lambda x: x + n\n\nadd5 = make_adder(5)\nprint(add5(10))` },
      ],
      quiz: [
        { q: 'What does square (without brackets) refer to?', options: ['The result', 'The function object', 'An error', 'None'], answer: 1, why: 'Without brackets you refer to the function itself.' },
        { q: 'What is lambda x: x + 1 ?', options: ['A variable', 'A small anonymous function', 'A loop', 'A module'], answer: 1, why: 'It is a one-expression function without a name.' },
      ],
      challenge: {
        prompt: 'Using sorted() and a lambda, set by_length to the words sorted from longest to shortest.',
        starter: 'words = ["data", "science", "ai", "python"]\nby_length = ',
        check: 'assert by_length == ["science", "python", "data", "ai"], "expected [science, python, data, ai], got " + str(by_length)',
        hint: 'sorted(words, key=lambda w: len(w), reverse=True)',
        solution: 'words = ["data", "science", "ai", "python"]\nby_length = sorted(words, key=lambda w: len(w), reverse=True)\nprint(by_length)',
      },
    }),
];
