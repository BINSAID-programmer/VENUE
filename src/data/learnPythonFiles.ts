import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Chapter 10: Files, Exceptions and JSON — one main topic, subtopics in teaching order. */
export const PYTHON_FILES: LearnLesson[] = [
  L('fread', 'Reading from a file', 'Fungua faili kwa with open(), soma yote au mstari kwa mstari, na usafishe maandishi.',
    'Write a file notes.txt with three lines, then read it back and print each line without extra blank lines.',
    [
      { h: 'Why files?', p: [
        'Everything in your variables disappears when the program ends. A file is how a program remembers things: marks, settings, messages, the results of a long calculation. Reading data from files also lets your program work with information it did not create, such as a list of students prepared in a text editor.',
        'In this lesson you learn to read a text file. In the VENUE editor each run has its own small private file area, so the examples first write a file and then read it. On your own computer the file would already exist in a folder, and you would only use the reading part.'] },
      { h: 'Opening a file with with', p: [
        'The function open() connects your program to a file. The best way to use it is with a with block. When the block ends, Python closes the file for you, even if an error happens. A file that stays open can lose data or lock the file, so always prefer with.',
        'The method read() returns the whole content of the file as one string.'],
        code: `# Prepare a small file to read\nwith open("poem.txt", "w") as f:\n    f.write("Learning is a journey\\n")\n    f.write("one step at a time\\n")\n    f.write("keep going\\n")\n\n# Now read it\nwith open("poem.txt") as f:\n    text = f.read()\nprint(text)\nprint(len(text))`,
        explain: ['The first block creates poem.txt. "w" means write mode; it makes the file, or empties it if it already exists. \\n inside the text is a new line.', 'The second block opens the same file for reading (the default mode) and stores everything in the variable text.', 'print(text) shows three lines and then an empty line, because the text itself ends with a newline and print adds another one.', 'len(text) counts every character including the invisible newline characters: 22 + 19 + 11 = 52.'] },
      { h: 'Reading line by line', p: [
        'Large files should not be loaded all at once. A file object can be used directly in a for loop, and Python gives you one line each time. Every line still ends with the invisible newline \\n, so use .strip() or .rstrip() to remove it and the spaces around.'],
        code: `with open("poem.txt", "w") as f:\n    f.write("Learning is a journey\\none step at a time\\nkeep going\\n")\n\nwith open("poem.txt") as f:\n    for number, line in enumerate(f, start=1):\n        print(number, line.strip())`,
        explain: ['The loop variable line holds one line of the file at a time, including its newline.', 'enumerate(f, start=1) gives each line a number starting at 1, so we can print numbered lines.', 'line.strip() removes the newline, so print does not leave a blank line between the lines.', 'Memory use stays small however big the file is, because only one line is held at a time.'] },
      { h: 'readlines and processing the data', p: [
        'The method readlines() returns a list of all lines. This is convenient when you need to work with the lines after the file is closed. Remember that the file contents are always text. If the file holds numbers, convert them with int() or float().'],
        code: `with open("marks.txt", "w") as f:\n    f.write("72\\n85\\n64\\n90\\n")\n\nwith open("marks.txt") as f:\n    lines = f.readlines()\nprint(lines)\n\nmarks = [int(line) for line in lines]\nprint(marks)\nprint(sum(marks) / len(marks))`,
        explain: ['readlines() gives a list of strings, each still ending with \\n.', 'int(line) ignores the surrounding whitespace, so the list comprehension turns every line into a whole number.', 'The numbers can now be used in calculations: the average is (72 + 85 + 64 + 90) / 4 = 77.75.'] },
      { h: 'File paths', p: [
        'A file name like "poem.txt" is a relative path: Python looks for it in the folder where the program runs. To open a file somewhere else give a longer path, for example "data/marks.txt" (a folder called data) or the full path on your computer.',
        'On Windows write a path with forward slashes ("data/marks.txt") or with a raw string r"C:\\\\Users\\\\you\\\\marks.txt". The pathlib module makes paths easier and works on every system.'],
        code: `from pathlib import Path\n\nfolder = Path("reports")\nfolder.mkdir(exist_ok=True)\nfile = folder / "week1.txt"\nfile.write_text("All students present\\n")\nprint(file)\nprint(file.exists())\nprint(file.read_text().strip())`,
        explain: ['Path("reports") represents a folder. mkdir(exist_ok=True) creates it, and does not complain if it already exists.', 'The slash operator joins parts of a path: folder / "week1.txt" is the file inside the folder.', 'write_text and read_text are shortcuts that open, write or read, and close the file in one step.', 'exists() answers True when the file is really there.'] },
    ],
    {
      mistakes: [
        'Forgetting that every line from a file ends with \\n, and then getting blank lines in the output.',
        'Using open() without with and never closing the file.',
        'Treating numbers from a file as numbers. They arrive as text; convert them.',
        'Opening a file that is not in the current folder (FileNotFoundError). Check the name and the path.',
        'Reading a file twice with the same file object. After read() the position is at the end; open it again.',
      ],
      exercises: [
        { q: 'Write three names to names.txt (one per line), then read the file and print how many lines it has.', a: `with open("names.txt", "w") as f:\n    f.write("Asha\\nJuma\\nNeema\\n")\n\nwith open("names.txt") as f:\n    lines = f.readlines()\nprint(len(lines))` },
        { q: 'Read marks from a file and print the highest.', a: `with open("m.txt", "w") as f:\n    f.write("55\\n91\\n70\\n")\n\nwith open("m.txt") as f:\n    marks = [int(line) for line in f]\nprint(max(marks))` },
        { q: 'Count the words in a text file.', a: `with open("t.txt", "w") as f:\n    f.write("python is fun\\nand useful for data\\n")\n\nwith open("t.txt") as f:\n    words = f.read().split()\nprint(len(words))` },
      ],
      quiz: [
        { q: 'Why use with open(...) as f?', options: ['It is faster', 'The file is closed automatically', 'It creates a backup', 'It encrypts the file'], answer: 1, why: 'The with block closes the file for you, even after an error.' },
        { q: 'What does line.strip() remove?', options: ['All letters', 'Whitespace and the newline at both ends', 'The first word', 'Digits'], answer: 1, why: 'strip() removes spaces, tabs and newlines from the start and end.' },
        { q: 'What type of data do you get from f.read()?', options: ['int', 'list', 'A string', 'A dictionary'], answer: 2, why: 'Reading a text file always gives strings; convert them if you need numbers.' },
      ],
      challenge: {
        prompt: 'The file scores.txt exists and holds one number per line. Read it and set total to the sum of the numbers (as integers).',
        starter: 'with open("scores.txt", "w") as f:\n    f.write("10\\n20\\n30\\n")\n\ntotal = 0\n# read scores.txt below and set total\n',
        check: 'assert total == 60, "total should be 60 (10 + 20 + 30), got " + str(total)',
        hint: 'with open("scores.txt") as f: then loop over f and add int(line) to total.',
        solution: 'with open("scores.txt", "w") as f:\n    f.write("10\\n20\\n30\\n")\n\ntotal = 0\nwith open("scores.txt") as f:\n    for line in f:\n        total += int(line)\nprint(total)',
      },
    }),

  L('fwrite', 'Writing to a file', 'Njia za w (andika upya), a (ongeza mwisho) na jinsi ya kuhifadhi data.',
    'Write a program that appends a new line "Visited: <your name>" to visitors.txt each time you run it, then prints the whole file.',
    [
      { h: 'Write mode', p: [
        'open("file.txt", "w") opens a file for writing. If the file does not exist Python creates it. If it already exists, its old content is erased immediately, before you write anything. Use write mode only when you really want to start from an empty file.',
        'f.write(text) writes a string. Unlike print, it does not add a newline, so you must add \\n yourself where you want a new line. It also accepts only strings, so convert numbers with str() or an f-string.'],
        code: `with open("report.txt", "w") as f:\n    f.write("Class report\\n")\n    f.write("Students: " + str(42) + "\\n")\n    f.write(f"Average mark: {68.5}\\n")\n\nwith open("report.txt") as f:\n    print(f.read())`,
        explain: ['The first write adds a title followed by a newline.', 'The number 42 is turned into text with str(), because write() cannot take a number.', 'The f-string builds the third line in one step.', 'Reading the file back shows the three lines exactly as written, so the report was saved correctly.'] },
      { h: 'Append mode', p: [
        'Mode "a" appends. New text goes at the end and the old content is kept. This is what you want for logs, visitor lists and any data that grows over time.'],
        code: `with open("log.txt", "w") as f:\n    f.write("start\\n")\n\nfor event in ["login", "view marks", "logout"]:\n    with open("log.txt", "a") as f:\n        f.write(event + "\\n")\n\nwith open("log.txt") as f:\n    print(f.read().split())`,
        explain: ['We first create the file with "w" so the example always starts clean.', 'Each pass of the loop opens the file in append mode and adds one event. Nothing is erased.', 'split() on the whole text cuts at spaces and newlines, so "view marks" becomes two words in the list.', 'The printed list shows that all events were saved after the first line.'] },
      { h: 'Writing many lines', p: [
        'The method writelines() writes every string of a list, but it does not add newlines for you. A tidy way is to build the lines first, then join them with "\\n".',
        'You can also send print() output into a file with the file argument. This is handy because print adds the newline and can format several values.'],
        code: `students = ["Asha", "Juma", "Neema"]\n\nwith open("class.txt", "w") as f:\n    f.write("\\n".join(students) + "\\n")\n\nwith open("class.txt", "a") as f:\n    print("Total:", len(students), file=f)\n\nwith open("class.txt") as f:\n    print(f.read())`,
        explain: ['"\\n".join(students) glues the names with a newline between them, and we add a final newline.', 'print(..., file=f) writes the text and a newline into the file instead of the screen.', 'Reading the file shows the three names followed by the Total line.'] },
      { h: 'Read and write: the other modes', p: [
        'Mode "r" is reading (the default). Mode "r+" lets you both read and write. Mode "x" creates a file and fails if it already exists, which protects you from overwriting. Add "b" (as in "rb") for binary files such as images.',
        'Always choose the safest mode for the job: "r" if you only read, "a" if you only add, "w" only when starting fresh.'],
        code: `try:\n    with open("once.txt", "x") as f:\n        f.write("first time\\n")\n    print("created")\nexcept FileExistsError:\n    print("already there")\n\ntry:\n    with open("once.txt", "x") as f:\n        f.write("second time\\n")\n    print("created")\nexcept FileExistsError:\n    print("already there")`,
        explain: ['The first attempt creates once.txt, so it prints created.', 'The second attempt uses the same name. Mode "x" refuses, Python raises FileExistsError and the except block prints already there.', 'This is a safe way to avoid erasing a file by accident. The try and except words are explained fully in the next lesson.'] },
    ],
    {
      mistakes: [
        'Using "w" when you meant "a" and erasing all old data.',
        'Forgetting \\n, so all text ends up on one line.',
        'Passing a number to write() without converting it (TypeError).',
        'Expecting the file to change on disk before it is closed. Use with so it is saved properly.',
      ],
      exercises: [
        { q: 'Write the numbers 1 to 5, one per line, into numbers.txt and read them back as a list of ints.', a: `with open("numbers.txt", "w") as f:\n    for n in range(1, 6):\n        f.write(f"{n}\\n")\n\nwith open("numbers.txt") as f:\n    print([int(line) for line in f])` },
        { q: 'Append the line "done" to a file twice and show the number of lines.', a: `open("d.txt", "w").close()\nfor _ in range(2):\n    with open("d.txt", "a") as f:\n        f.write("done\\n")\n\nwith open("d.txt") as f:\n    print(len(f.readlines()))` },
        { q: 'Save the squares of 1 to 4 into squares.txt using print(..., file=f), then print the file.', a: `with open("squares.txt", "w") as f:\n    for n in range(1, 5):\n        print(n, n * n, file=f)\n\nwith open("squares.txt") as f:\n    print(f.read())` },
      ],
      quiz: [
        { q: 'What does mode "w" do to an existing file?', options: ['Appends to it', 'Erases it and starts empty', 'Opens it read-only', 'Raises an error'], answer: 1, why: 'Write mode truncates the file the moment it is opened.' },
        { q: 'Which mode adds to the end without losing old content?', options: ['"r"', '"w"', '"a"', '"x"'], answer: 2, why: 'Append mode keeps the old content and writes at the end.' },
        { q: 'Why does f.write(42) fail?', options: ['The file is closed', 'write() needs a string', 'Numbers are too big', 'The mode is wrong'], answer: 1, why: 'write() accepts only strings; use str(42) or an f-string.' },
      ],
      challenge: {
        prompt: 'Write the list names to the file names.txt, one name per line. Then read the file back and set count to the number of lines.',
        starter: 'names = ["Asha", "Juma", "Neema", "Salum"]\ncount = 0\n',
        check: 'with open("names.txt") as f:\n    lines = f.read().split("\\n")\nlines = [l for l in lines if l]\nassert lines == ["Asha", "Juma", "Neema", "Salum"], "names.txt should hold the four names, one per line"\nassert count == 4, "count should be 4, got " + str(count)',
        hint: 'Open with "w", write name + "\\n" for each name. Then open again and count the lines.',
        solution: 'names = ["Asha", "Juma", "Neema", "Salum"]\nwith open("names.txt", "w") as f:\n    for name in names:\n        f.write(name + "\\n")\n\nwith open("names.txt") as f:\n    count = len(f.readlines())\nprint(count)',
      },
    }),

  L('exceptions', 'Exceptions: try, except, else, finally', 'Exception ni kosa linalotokea wakati programu inaendeshwa; try/except huzuia programu isianguke.',
    'Ask for a number safely: keep asking (use a function that receives the text) until the text can be converted to int, and return the number.',
    [
      { h: 'What is an exception?', p: [
        'When Python meets something it cannot do, such as dividing by zero or opening a file that does not exist, it creates an exception object and stops the program with a traceback. Each kind of problem has its own exception type: ZeroDivisionError, FileNotFoundError, ValueError, KeyError, IndexError, TypeError and many more.',
        'You cannot prevent every problem, but you can prepare for it. A program that handles errors politely is far more useful than one that crashes in front of the user.'],
        code: `print("before")\nprint(10 / 0)\nprint("after")`,
        explain: ['The first line runs normally and prints before.', 'The division by zero raises ZeroDivisionError. Python stops and prints a traceback whose last line names the error: ZeroDivisionError: division by zero.', 'The last line never runs. This is exactly what try and except will let us avoid.'] },
      { h: 'try and except', p: [
        'Put the risky code in a try block. If an exception occurs, Python jumps to the matching except block instead of crashing. If there is no error, the except block is skipped.',
        'Always name the exception type you expect. A bare except: catches everything, even your own typing mistakes, and hides real bugs.'],
        code: `def divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        print("You cannot divide by zero.")\n        return None\n\nprint(divide(10, 2))\nprint(divide(5, 0))\nprint("the program is still running")`,
        explain: ['divide(10, 2) works. The try block returns 5.0 and the except is skipped.', 'divide(5, 0) raises ZeroDivisionError inside the try block. Python jumps to except, prints the message, and the function returns None.', 'Because we handled the error, the program continues and the last line is printed.'] },
      { h: 'else and finally', p: [
        'An else block after the except blocks runs only when the try block succeeded. Put the code that depends on success there, so the try block stays short.',
        'A finally block runs every time, whether or not an error happened. Use it for clean-up, such as closing a connection or printing a final message.'],
        code: `def read_number(text):\n    try:\n        n = int(text)\n    except ValueError:\n        print(f"'{text}' is not a whole number")\n    else:\n        print(f"Got {n}, double is {n * 2}")\n    finally:\n        print("-- checked --")\n\nread_number("21")\nread_number("abc")`,
        explain: ['int("21") works, so else runs and prints the doubled number; finally prints the line of dashes.', 'int("abc") raises ValueError. The except block prints a message, else is skipped, and finally still runs.', 'The order is always try, then except, then else, then finally.'] },
      { h: 'Several exceptions and the error message', p: [
        'One try block can have several except blocks for different problems, or one block for a tuple of types. Use as e to get the exception object, whose text explains what happened.'],
        code: `data = {"asha": 72}\n\ndef lookup(name, items, index):\n    try:\n        mark = data[name]\n        item = items[index]\n        return mark, item\n    except KeyError as e:\n        print("No such student:", e)\n    except (IndexError, TypeError) as e:\n        print("Bad item request:", e)\n\nprint(lookup("asha", ["a", "b"], 1))\nlookup("juma", ["a"], 0)\nlookup("asha", ["a"], 5)`,
        explain: ['The first call works and returns the pair (72, "b").', 'For "juma" the dictionary lookup raises KeyError; the message shows the missing key.', 'Index 5 does not exist in a list of one item, so IndexError is raised. The second except handles IndexError and TypeError together.', 'Only the first matching except block runs.'] },
      { h: 'Handling missing files', p: [
        'A very common use is opening a file that may not exist. Catch FileNotFoundError and tell the user clearly instead of crashing.'],
        code: `def count_lines(name):\n    try:\n        with open(name) as f:\n            return len(f.readlines())\n    except FileNotFoundError:\n        print(f"Sorry, {name} does not exist.")\n        return 0\n\nwith open("real.txt", "w") as f:\n    f.write("a\\nb\\nc\\n")\n\nprint(count_lines("real.txt"))\nprint(count_lines("ghost.txt"))`,
        explain: ['real.txt was created first and has three lines, so the first call returns 3.', 'ghost.txt does not exist. open raises FileNotFoundError, the message is printed, and the function returns 0.', 'The same function now works safely for files that exist and files that do not.'] },
      { h: 'Raising your own exceptions', p: [
        'You can create an exception yourself with raise when a value is not acceptable. This stops bad data early, close to where it was introduced.'],
        code: `def set_mark(mark):\n    if not 0 <= mark <= 100:\n        raise ValueError("mark must be between 0 and 100")\n    return mark\n\nprint(set_mark(75))\ntry:\n    set_mark(150)\nexcept ValueError as e:\n    print("Rejected:", e)`,
        explain: ['A mark of 75 passes the check and is returned.', 'A mark of 150 triggers raise ValueError with our own message.', 'The calling code catches it and shows Rejected: followed by the message.'] },
      { h: 'Failing silently and good habits', p: [
        'Sometimes you want the program to carry on without a message. The statement pass does nothing and can be used in an except block. Use it rarely and only when ignoring the problem is really correct.',
        'Good habits: keep try blocks small, catch specific exceptions, never hide errors you do not understand, and give the user a helpful message that says what to do next.'],
        code: `words = ["12", "x", "7", "", "30"]\nnumbers = []\nfor w in words:\n    try:\n        numbers.append(int(w))\n    except ValueError:\n        pass\nprint(numbers)\nprint(sum(numbers))`,
        explain: ['The loop tries to convert each word. Bad ones raise ValueError and are ignored by pass.', 'Only the valid numbers 12, 7 and 30 are kept.', 'The sum of the valid numbers is 49. Here ignoring bad input is a deliberate choice that we documented in the code.'] },
    ],
    {
      mistakes: [
        'Writing a bare except: that hides every error, including mistakes in your own code.',
        'Putting too much code in the try block so you do not know which line failed.',
        'Using the wrong exception type, so the error is not caught.',
        'Catching an error and then doing nothing useful, leaving the user confused.',
        'Using exceptions for normal decisions where a simple if would be clearer.',
      ],
      exercises: [
        { q: 'Write a function to_int(text) that returns the integer or None when the text is not a number.', a: `def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(to_int("42"), to_int("forty"))` },
        { q: 'Divide two numbers given as text and print a friendly message for both a bad number and a zero divisor.', a: `def safe_divide(a, b):\n    try:\n        return int(a) / int(b)\n    except ValueError:\n        print("Please give numbers.")\n    except ZeroDivisionError:\n        print("The divisor cannot be zero.")\n\nprint(safe_divide("8", "2"))\nsafe_divide("a", "2")\nsafe_divide("8", "0")` },
        { q: 'Write a function that raises ValueError for a negative age and returns the age otherwise. Catch it and print the message.', a: `def check_age(age):\n    if age < 0:\n        raise ValueError("age cannot be negative")\n    return age\n\ntry:\n    check_age(-3)\nexcept ValueError as e:\n    print(e)` },
      ],
      quiz: [
        { q: 'When does the else block of a try statement run?', options: ['Always', 'Only if an exception happened', 'Only if no exception happened', 'Never'], answer: 2, why: 'else runs when the try block finished without an exception.' },
        { q: 'When does finally run?', options: ['Only after errors', 'Only after success', 'Always', 'Only with raise'], answer: 2, why: 'finally runs whether or not an exception occurred.' },
        { q: 'Which is the better way to write the except line?', options: ['except:', 'except ValueError:', 'except Everything:', 'except pass:'], answer: 1, why: 'Name the specific exception you expect so real bugs are not hidden.' },
      ],
      challenge: {
        prompt: 'Write the function to_int(text) that returns int(text), or returns None when the text is not a valid whole number.',
        starter: 'def to_int(text):\n    pass\n',
        check: 'assert to_int("42") == 42, "to_int(\'42\') should be 42"\nassert to_int("abc") is None, "to_int(\'abc\') should be None"\nassert to_int("") is None, "to_int(\'\') should be None"\nassert to_int("-7") == -7, "to_int(\'-7\') should be -7"',
        hint: 'try: return int(text) except ValueError: return None',
        solution: 'def to_int(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(to_int("42"), to_int("abc"))',
      },
    }),

  L('fjson', 'Storing data with JSON', 'JSON ni muundo wa kawaida wa kuhifadhi na kubadilishana data; json.dump na json.load.',
    'Save a dictionary of your details to profile.json and load it back.',
    [
      { h: 'What is JSON?', p: [
        'JSON (JavaScript Object Notation) is a text format for data. It looks almost exactly like Python dictionaries and lists, so it is easy to read. Almost every web service, mobile app and website exchanges data as JSON, which makes it one of the most important formats you will meet.',
        'Python\'s json module converts between Python values (dict, list, str, int, float, bool, None) and JSON text. Writing to JSON is called serialising or dumping; reading from JSON is parsing or loading.'] },
      { h: 'Converting to and from text', p: [
        'json.dumps(value) returns a JSON string. json.loads(text) turns a JSON string back into Python. The letter s stands for string. The option indent=2 makes the text easy to read.'],
        code: `import json\n\nstudent = {"name": "Asha", "year": 2, "courses": ["Calculus", "Statistics"], "passed": True, "advisor": None}\ntext = json.dumps(student)\nprint(text)\nprint(type(text))\n\nback = json.loads(text)\nprint(back["courses"][1])\nprint(type(back))`,
        explain: ['JSON uses double quotes, true and false in lower case, and null instead of None. dumps does this conversion for us.', 'The result is a plain string, so type(text) is str.', 'loads rebuilds a real dictionary. back["courses"][1] reads the second course.', 'The conversion keeps the structure: lists stay lists, True stays True.'] },
      { h: 'Saving to and loading from a file', p: [
        'json.dump(value, file) writes JSON directly into an open file, and json.load(file) reads it. These are the commands you will use most to save the state of a program between runs.'],
        code: `import json\n\ncourses = [{"code": "MS 101", "credits": 12}, {"code": "CS 102", "credits": 9}]\n\nwith open("courses.json", "w") as f:\n    json.dump(courses, f, indent=2)\n\nwith open("courses.json") as f:\n    loaded = json.load(f)\n\nprint(loaded == courses)\nprint(sum(c["credits"] for c in loaded))\nwith open("courses.json") as f:\n    print(f.read())`,
        explain: ['indent=2 makes the file readable, with one item per line.', 'json.load returns a list of dictionaries equal to the original, so the comparison prints True.', 'The credits add up to 12 + 9 = 21.', 'The last block shows the actual text stored in the file.'] },
      { h: 'Remembering the user', p: [
        'A classic pattern: the program looks for a saved value, and if it is missing, asks the user and saves it. Next time it remembers. We combine json, files and exceptions here.'],
        code: `import json\nfrom pathlib import Path\n\nfile = Path("user.json")\n\ndef get_user(name_if_new):\n    try:\n        return json.loads(file.read_text())["name"]\n    except (FileNotFoundError, KeyError):\n        file.write_text(json.dumps({"name": name_if_new}))\n        return name_if_new\n\nprint(get_user("Asha"))\nprint(get_user("somebody else"))`,
        explain: ['The first call finds no file, so FileNotFoundError is raised. The except block saves the name and returns it.', 'The second call finds the saved file and returns the stored name Asha, ignoring the new value.', 'This is exactly how apps remember settings between visits.'] },
      { h: 'What JSON cannot hold', p: [
        'JSON handles dictionaries with text keys, lists, strings, numbers, true/false and null. It cannot store everything. Sets, tuples (they become lists), dates and your own class objects need to be converted first.',
        'A helpful trick is to turn the object into a dictionary before saving. json.dumps(obj.__dict__) works for simple objects.'],
        code: `import json\n\nclass Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\ns = Student("Juma", 64)\nprint(json.dumps(s.__dict__))\n\nprint(json.dumps({"point": (3, 4)}))\n\ntry:\n    json.dumps({"tags": {"a", "b"}})\nexcept TypeError as e:\n    print("TypeError:", e)`,
        explain: ['__dict__ holds the attributes of an object as a dictionary, so it can be saved as JSON.', 'A tuple is written as a JSON list: [3, 4].', 'A set has no JSON form, so json raises TypeError. Convert it with list(...) before saving.'] },
    ],
    {
      mistakes: [
        'Using json.load with a string. Use json.loads for strings and json.load for files.',
        'Forgetting to open the file with "w" before json.dump.',
        'Expecting a tuple to come back as a tuple. It returns as a list.',
        'Using single quotes in hand-written JSON. JSON requires double quotes.',
        'Trying to save a set or a custom object directly.',
      ],
      exercises: [
        { q: 'Convert the dictionary {"a": 1, "b": [1, 2]} to JSON text with indent=2 and print it.', a: `import json\n\nprint(json.dumps({"a": 1, "b": [1, 2]}, indent=2))` },
        { q: 'Save a list of three marks to marks.json and read it back; print the average.', a: `import json\n\nwith open("marks.json", "w") as f:\n    json.dump([60, 70, 80], f)\n\nwith open("marks.json") as f:\n    marks = json.load(f)\nprint(sum(marks) / len(marks))` },
        { q: 'Turn the JSON text \'{"city": "Dar es Salaam", "temp": 31}\' into a dictionary and print the city.', a: `import json\n\ndata = json.loads('{"city": "Dar es Salaam", "temp": 31}')\nprint(data["city"])` },
      ],
      quiz: [
        { q: 'Which function turns a JSON string into a Python object?', options: ['json.dumps', 'json.loads', 'json.dump', 'json.save'], answer: 1, why: 'loads means load from a string; dumps goes the other way.' },
        { q: 'How does Python None appear in JSON?', options: ['none', 'None', 'null', '0'], answer: 2, why: 'JSON writes the empty value as null.' },
        { q: 'What happens to a tuple saved in JSON?', options: ['It becomes a list', 'It becomes a set', 'It causes an error', 'It becomes a string'], answer: 0, why: 'JSON has no tuples; they are stored as lists.' },
      ],
      challenge: {
        prompt: 'Save the dictionary profile to the file profile.json using the json module, then load it back and set loaded to the loaded dictionary.',
        starter: 'import json\n\nprofile = {"name": "Asha", "year": 2, "courses": ["Calculus", "Statistics"]}\nloaded = None\n',
        check: 'import json as _j\nwith open("profile.json") as _f:\n    _data = _j.load(_f)\nassert _data == profile, "profile.json should contain the profile dictionary"\nassert loaded == profile, "loaded should equal profile"',
        hint: 'json.dump(profile, f) with a file opened in "w" mode, then json.load(f) from the same file opened for reading.',
        solution: 'import json\n\nprofile = {"name": "Asha", "year": 2, "courses": ["Calculus", "Statistics"]}\nwith open("profile.json", "w") as f:\n    json.dump(profile, f)\n\nwith open("profile.json") as f:\n    loaded = json.load(f)\nprint(loaded)',
      },
    }),

  L('fcsv', 'CSV files', 'CSV ni jedwali la maandishi (Excel-style); module ya csv inasoma na kuandika safu na nguzo.',
    'Write a CSV of three students with name and mark, then read it with DictReader and print the average mark.',
    [
      { h: 'What is a CSV?', p: [
        'CSV means comma-separated values. It is the simplest way to store a table as text: each line is a row and the values in the row are separated by commas. Spreadsheet programs such as Excel and Google Sheets can open and save CSV files, so it is the common bridge between your Python code and a spreadsheet.',
        'Do not split lines by hand with split(","). Some values contain commas inside quotes, and the csv module handles those cases correctly.'] },
      { h: 'Writing a CSV', p: [
        'csv.writer(file) gives an object with writerow() for one row and writerows() for many. Always open the file with newline="" so Python does not add extra blank lines on some systems.'],
        code: `import csv\n\nrows = [\n    ["name", "course", "mark"],\n    ["Asha", "Statistics", 78],\n    ["Juma", "Calculus", 64],\n    ["Neema", "Statistics", 91],\n]\n\nwith open("marks.csv", "w", newline="") as f:\n    writer = csv.writer(f)\n    writer.writerows(rows)\n\nwith open("marks.csv") as f:\n    print(f.read())`,
        explain: ['The first row holds the column names (the header). The others hold the data.', 'writerows writes every row; numbers are converted to text automatically.', 'Reading the raw file shows plain lines with commas, which is exactly what a spreadsheet would open.'] },
      { h: 'Reading a CSV', p: [
        'csv.reader returns each row as a list of strings. Everything is text, so convert numbers yourself. The next(reader) call takes the header row out of the way.'],
        code: `import csv\n\nwith open("m.csv", "w", newline="") as f:\n    csv.writer(f).writerows([["name", "mark"], ["Asha", 78], ["Juma", 64]])\n\nwith open("m.csv", newline="") as f:\n    reader = csv.reader(f)\n    header = next(reader)\n    print(header)\n    for row in reader:\n        print(row[0], int(row[1]) + 5)`,
        explain: ['next(reader) returns the first row, the header, and moves past it.', 'Each later row is a list such as ["Asha", "78"]. The mark is text, so int() converts it before we add 5.', 'The loop therefore prints Asha 83 and Juma 69.'] },
      { h: 'DictReader and DictWriter', p: [
        'DictReader reads each row as a dictionary whose keys are the header names. The code becomes easier to read because you write row["mark"] instead of row[1]. DictWriter does the opposite.'],
        code: `import csv\n\nwith open("class.csv", "w", newline="") as f:\n    w = csv.DictWriter(f, fieldnames=["name", "course", "mark"])\n    w.writeheader()\n    w.writerow({"name": "Asha", "course": "Statistics", "mark": 78})\n    w.writerow({"name": "Juma", "course": "Calculus", "mark": 64})\n    w.writerow({"name": "Neema", "course": "Statistics", "mark": 91})\n\nwith open("class.csv", newline="") as f:\n    students = list(csv.DictReader(f))\n\nprint(students[0])\nmarks = [int(s["mark"]) for s in students]\nprint(sum(marks) / len(marks))\nstats = [s["name"] for s in students if s["course"] == "Statistics"]\nprint(stats)`,
        explain: ['DictWriter needs the list of column names in fieldnames, and writeheader() writes them as the first line.', 'DictReader gives one dictionary per row. All values are strings, even the marks.', 'We convert the marks to int to get the average (78 + 64 + 91) / 3 = 77.666...', 'A list comprehension with a condition selects the names of the students taking Statistics.'] },
      { h: 'Grouping data from a CSV', p: [
        'Once data is in dictionaries you can analyse it with everything you learned. Here we compute the average mark per course with a dictionary of lists.'],
        code: `import csv\n\ntext = "name,course,mark\\nAsha,Statistics,78\\nJuma,Calculus,64\\nNeema,Statistics,91\\nSalum,Calculus,70\\n"\nwith open("all.csv", "w") as f:\n    f.write(text)\n\ngroups = {}\nwith open("all.csv", newline="") as f:\n    for row in csv.DictReader(f):\n        groups.setdefault(row["course"], []).append(int(row["mark"]))\n\nfor course, marks in groups.items():\n    print(course, sum(marks) / len(marks))`,
        explain: ['setdefault creates an empty list the first time a course appears, then we append the mark.', 'The dictionary ends up as {"Statistics": [78, 91], "Calculus": [64, 70]}.', 'The averages are (78 + 91) / 2 = 84.5 for Statistics and (64 + 70) / 2 = 67.0 for Calculus.'] },
    ],
    {
      mistakes: [
        'Splitting CSV lines with split(",") and breaking on values that contain commas.',
        'Forgetting newline="" and getting blank lines between rows.',
        'Doing arithmetic on strings from the file instead of converting to int or float.',
        'Forgetting that the header row is also a row and trying to convert it to a number.',
      ],
      exercises: [
        { q: 'Write a CSV of three products (name, price) and print the total price using DictReader.', a: `import csv\n\nwith open("p.csv", "w", newline="") as f:\n    w = csv.writer(f)\n    w.writerows([["name", "price"], ["Pen", 500], ["Book", 3500], ["Bag", 15000]])\n\nwith open("p.csv", newline="") as f:\n    print(sum(int(r["price"]) for r in csv.DictReader(f)))` },
        { q: 'From a CSV of names and marks, print the name with the highest mark.', a: `import csv\n\nwith open("x.csv", "w", newline="") as f:\n    csv.writer(f).writerows([["name", "mark"], ["Asha", 70], ["Juma", 88], ["Neema", 65]])\n\nwith open("x.csv", newline="") as f:\n    best = max(csv.DictReader(f), key=lambda r: int(r["mark"]))\nprint(best["name"])` },
      ],
      quiz: [
        { q: 'What type do values read by csv.reader have?', options: ['int', 'float', 'str', 'They depend on the file'], answer: 2, why: 'Everything read from a CSV is text; convert numbers yourself.' },
        { q: 'What does DictReader use as dictionary keys?', options: ['Row numbers', 'The header row names', 'Random keys', 'The first value of each row'], answer: 1, why: 'The first line of the file supplies the keys.' },
        { q: 'Why open CSV files with newline=""?', options: ['For speed', 'To avoid extra blank lines', 'To encrypt them', 'It is required for reading only'], answer: 1, why: 'It stops Python from translating newlines twice on some systems.' },
      ],
      challenge: {
        prompt: 'The file grades.csv is created for you with columns name and mark. Read it with csv.DictReader and set average to the mean of the marks.',
        starter: 'import csv\n\nwith open("grades.csv", "w", newline="") as f:\n    csv.writer(f).writerows([["name", "mark"], ["Asha", 70], ["Juma", 80], ["Neema", 90]])\n\naverage = 0\n',
        check: 'assert average == 80, "average should be 80, got " + str(average)',
        hint: 'with open("grades.csv", newline="") as f: marks = [int(r["mark"]) for r in csv.DictReader(f)]',
        solution: 'import csv\n\nwith open("grades.csv", "w", newline="") as f:\n    csv.writer(f).writerows([["name", "mark"], ["Asha", 70], ["Juma", 80], ["Neema", 90]])\n\nwith open("grades.csv", newline="") as f:\n    marks = [int(r["mark"]) for r in csv.DictReader(f)]\naverage = sum(marks) / len(marks)\nprint(average)',
      },
    }),

  L('fproject', 'Mini project: marks tracker that remembers', 'Programu inayohifadhi alama kwenye faili la JSON, inazipakia ikianza tena, na inashughulikia makosa.',
    'Add a function remove_student(data, name) that deletes a student and saves the file.',
    [
      { h: 'What we are building', p: [
        'In this project we build the core of a marks tracker: it keeps a dictionary of student marks, saves it to a JSON file, loads it again when the program starts, and handles missing or damaged files without crashing. Each step uses an idea from this chapter.',
        'In the VENUE editor the file area is cleared between runs, so we run the whole story in one program: save, then load. On your own computer the file stays on disk, so closing and reopening the program would show the same data.'] },
      { h: 'Step 1: load and save functions', p: [
        'We write two small functions. load_marks reads the file, and returns an empty dictionary if the file is missing or contains broken JSON. save_marks writes the dictionary. Keeping the file work in two functions keeps the rest of the program simple.'],
        code: `import json\n\nFILE = "tracker.json"\n\ndef load_marks():\n    try:\n        with open(FILE) as f:\n            return json.load(f)\n    except (FileNotFoundError, json.JSONDecodeError):\n        return {}\n\ndef save_marks(data):\n    with open(FILE, "w") as f:\n        json.dump(data, f, indent=2)\n\nprint(load_marks())\nsave_marks({"Asha": [72, 85]})\nprint(load_marks())`,
        explain: ['FILE is a constant written in capitals, so the file name lives in one place.', 'The first load_marks() finds no file and returns {} because FileNotFoundError is caught.', 'save_marks creates the file. The second load_marks() reads it back and returns the saved dictionary.', 'json.JSONDecodeError is the exception for damaged JSON, so a broken file does not crash the program either.'] },
      { h: 'Step 2: adding marks and reports', p: [
        'Now the features. add_mark stores a mark for a student, validating it with raise. report builds a text summary. Notice how each function does one job.'],
        code: `import json\n\nFILE = "tracker.json"\n\ndef load_marks():\n    try:\n        with open(FILE) as f:\n            return json.load(f)\n    except (FileNotFoundError, json.JSONDecodeError):\n        return {}\n\ndef save_marks(data):\n    with open(FILE, "w") as f:\n        json.dump(data, f, indent=2)\n\ndef add_mark(data, name, mark):\n    if not 0 <= mark <= 100:\n        raise ValueError("mark must be between 0 and 100")\n    data.setdefault(name, []).append(mark)\n    save_marks(data)\n\ndef report(data):\n    lines = []\n    for name in sorted(data):\n        marks = data[name]\n        lines.append(f"{name}: {len(marks)} mark(s), average {sum(marks) / len(marks):.1f}")\n    return "\\n".join(lines)\n\ndata = load_marks()\nadd_mark(data, "Asha", 72)\nadd_mark(data, "Asha", 85)\nadd_mark(data, "Juma", 64)\ntry:\n    add_mark(data, "Juma", 140)\nexcept ValueError as e:\n    print("Rejected:", e)\n\nprint(report(data))\nprint(load_marks() == data)`,
        explain: ['add_mark checks the range first. A bad mark raises ValueError before anything is stored.', 'setdefault(name, []) creates a list for a new student, and append adds the mark. The file is saved after every change.', 'The mark 140 is rejected and the message is printed, but the program continues.', 'report sorts the names and formats each line with one decimal: Asha has 2 mark(s) averaging 78.5 and Juma has 1 mark(s) averaging 64.0.', 'The last line proves the file matches what is in memory: True.'] },
      { h: 'Step 3: make it your own', p: [
        'The tracker is a skeleton. Try to extend it: add remove_student, add a function that returns the student with the best average, export the report to a CSV file, or add a menu using input() in a loop (you wrote loops with input in chapter 7).',
        'This is how every application grows: a few small, tested functions, data saved safely, and errors handled politely.'] },
    ],
    {
      mistakes: [
        'Saving only at the end of the program. If it crashes, all changes are lost. Save after each change.',
        'Not handling a missing file the first time the program runs.',
        'Mixing file code with the rest of the logic. Keep load and save in their own functions.',
      ],
      exercises: [
        { q: 'Add best_student(data) that returns the name with the highest average.', a: `def best_student(data):\n    return max(data, key=lambda n: sum(data[n]) / len(data[n]))\n\nprint(best_student({"Asha": [70, 80], "Juma": [60, 65], "Neema": [90, 50]}))` },
        { q: 'Write remove_student(data, name) that deletes the name if it exists and returns True, or returns False.', a: `def remove_student(data, name):\n    if name in data:\n        del data[name]\n        return True\n    return False\n\nd = {"Asha": [70]}\nprint(remove_student(d, "Asha"), remove_student(d, "Asha"), d)` },
      ],
      quiz: [
        { q: 'Why does load_marks return {} when the file is missing?', options: ['To crash safely', 'So the program starts with no data instead of failing', 'To delete the file', 'Python requires it'], answer: 1, why: 'On the first run there is no file; an empty dictionary lets the program begin normally.' },
        { q: 'Which exception means the JSON file is damaged?', options: ['ValueError only', 'json.JSONDecodeError', 'KeyError', 'IndexError'], answer: 1, why: 'json.JSONDecodeError (a kind of ValueError) is raised when the text is not valid JSON.' },
      ],
      challenge: {
        prompt: 'Write remove_student(data, name): if name is a key of the dictionary data, delete it and return True; otherwise return False.',
        starter: 'def remove_student(data, name):\n    pass\n',
        check: 'd = {"Asha": [70], "Juma": [60]}\nassert remove_student(d, "Asha") is True, "Removing an existing student should return True"\nassert "Asha" not in d, "Asha should be gone from the dictionary"\nassert remove_student(d, "Ghost") is False, "Removing a missing student should return False"\nassert "Juma" in d, "Other students must stay"',
        hint: 'if name in data: del data[name]; return True. After the if, return False.',
        solution: 'def remove_student(data, name):\n    if name in data:\n        del data[name]\n        return True\n    return False\n\nd = {"Asha": [70]}\nprint(remove_student(d, "Asha"), d)',
      },
    }),
];
