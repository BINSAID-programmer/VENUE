import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** "Automate the boring stuff" style lessons: tasks you would otherwise do by hand. All run in the browser. */
export const PYTHON_AUTOMATE: LearnLesson[] = [
  L('abstext', 'Automate: cleaning and reshaping text', 'Safisha maandishi yenye fujo: nafasi, herufi kubwa/ndogo, orodha za majina.',
    'Write clean_name(raw) that fixes spaces and capital letters in a name.',
    [
      { h: 'Why text cleaning?', p: [
        'Most boring office work is text: names typed with extra spaces, lists copied from a PDF, columns in the wrong order. Python string methods fix these in seconds, for ten rows or ten thousand. The rule of the section: strings never change, every method returns a new string.'],
        code: `raw = "   jUMA   sAID   "\nprint(repr(raw.strip()))\nprint(raw.strip().title())\nprint(" ".join(raw.split()))\nprint(" ".join(raw.split()).title())\nprint("a,b,,c".split(","))\nprint("-".join(["2026", "11", "22"]))`,
        explain: ['strip removes spaces at both ends but not in the middle.', 'split() with no argument splits on any run of spaces and drops empty pieces, so " ".join(raw.split()) collapses many spaces into one.', 'title() capitalises each word. join glues a list of strings with a separator.'] },
      { h: 'Searching and replacing', p: [
        'startswith, endswith and in test text. replace swaps one piece for another. partition cuts a string at the first separator into three parts: before, the separator, after. justify methods (ljust, rjust, center) pad text to a width, handy for simple tables.'],
        code: `email = "asha.juma@udsm.ac.tz"\nprint(email.endswith(".ac.tz"))\nuser, at, domain = email.partition("@")\nprint(user, "|", domain)\nprint(email.replace(".", "_"))\nprint("udsm" in email)\nprint("Name".ljust(8) + "|", "Mark".rjust(6) + "|")\nprint("TOTAL".center(11, "="))`,
        explain: ['partition("@") returns ("asha.juma", "@", "udsm.ac.tz"), which we unpack into three names.', 'replace changes every dot, not just the first.', 'center(11, "=") fills the extra space with = characters.'] },
      { h: 'Working with many lines', p: [
        'splitlines() turns multi-line text into a list of lines. A list comprehension can then clean every line at once. Sorting and removing duplicates (with a set) finish the job. This is the pattern behind most text automation: split, clean each piece, filter, join.'],
        code: `text = """  asha juma\nJUMA said\n  asha juma\nneema  mushi  \n"""\nnames = [" ".join(line.split()).title() for line in text.splitlines()]\nprint(names)\nunique = sorted(set(names))\nprint(unique)\nprint("\\n".join(f"{i}. {n}" for i, n in enumerate(unique, 1)))`,
        explain: ['Each line is cleaned with the same split/join/title trick.', 'set removes the duplicate "Asha Juma"; sorted puts the names in order.', 'The last line builds a numbered list as one string.'] },
    ], {
      mistakes: ['Forgetting that strip() alone does not remove spaces inside the text.', 'Calling a string method without storing the result: name.strip() does not change name.', 'Using replace when you needed a pattern (use re for patterns).', 'Splitting on a single space and getting empty strings when there are double spaces.'],
      exercises: [
        { q: 'Remove the spaces around "  hello  " and print it in capitals.', a: 'print("  hello  ".strip().upper())' },
        { q: 'Print the number of words in "learn   python   with   venue".', a: 'print(len("learn   python   with   venue".split()))' },
        { q: 'Replace every space in "a b c" with a dash and print it.', a: 'print("a b c".replace(" ", "-"))' },
      ],
      quiz: [
        { q: 'What does "  a  b ".split() return?', options: ['["a", "b"]', '["", "a", "", "b", ""]', '"a b"', 'Error'], answer: 0, why: 'split() with no argument ignores runs of whitespace.' },
        { q: 'What does "x".center(5, "*") give?', options: ['"**x**"', '"x****"', '"*x***"', '"*****"'], answer: 0, why: 'The text is centred and the rest is filled with the chosen character.' },
        { q: 'Does name.upper() change name?', options: ['Yes', 'No, it returns a new string', 'Only for lists', 'Only with print'], answer: 1, why: 'Strings are immutable.' },
      ],
      challenge: {
        prompt: 'Write clean_name(raw) that removes spaces at both ends, replaces repeated spaces between words with one space, and makes every word start with a capital letter and continue in small letters. Example: "  juma   SAID " becomes "Juma Said".',
        starter: 'def clean_name(raw):\n    # return the cleaned name\n    return raw\n',
        check: 'assert clean_name("  juma   SAID ") == "Juma Said", "Got " + repr(clean_name("  juma   SAID "))\nassert clean_name("asha") == "Asha", "A single word should become Asha"\nassert clean_name("  neema   mushi   kasimu ") == "Neema Mushi Kasimu", "Three words should be cleaned too"\nassert clean_name("   ") == "", "Only spaces should give an empty string"',
        hint: 'Split the text into words, join them with one space and then use title().',
        solution: 'def clean_name(raw):\n    return " ".join(raw.split()).title()\n',
      },
    }),

  L('absregex', 'Automate: finding patterns with regular expressions', 'Pata namba za simu, barua pepe na tarehe ndani ya maandishi marefu kwa RegEx.',
    'Write find_emails(text) that returns every email address in the text.',
    [
      { h: 'Groups: picking out the parts', p: [
        'You already know that re.findall finds all matches. Round brackets ( ) make groups: the part of the match you want to keep. With groups, findall returns the group contents, and match.group(1) reads the first group. Named groups (?P<name>...) are easier to read.'],
        code: `import re\n\ntext = "Contact: Asha (0762 574 073), Juma (0754 123 456)"\nprint(re.findall(r"(\\w+) \\((\\d{4}) (\\d{3}) (\\d{3})\\)", text))\nm = re.search(r"(?P<name>\\w+) \\((?P<number>[\\d ]+)\\)", text)\nprint(m.group("name"), m.group("number"))\nprint(m.groupdict())`,
        explain: ['\\d{4} means exactly four digits and \\w+ means one or more letters or digits.', 'The brackets in the pattern are special, so a real bracket is written \\( and \\).', 'groupdict() gives all named groups as a dictionary.'] },
      { h: 'Typical patterns: emails, phones and dates', p: [
        'Here are three patterns you can reuse. An email: letters, dots or + in front, an @, then a domain with dots. A Tanzanian phone number: starts with 0 or +255 followed by 9 digits. A date such as 22/11/2026: day, month and year separated by slashes. No pattern is perfect for all cases, but these work for everyday data.'],
        code: `import re\n\nmessage = "Write to asha.juma@udsm.ac.tz or info@venue.app. Call +255 762 574 073 before 22/11/2026 or 05/12/2026."\nemails = re.findall(r"[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+", message)\nprint(emails)\nphones = re.findall(r"(?:\\+255|0)[ ]?\\d{3}[ ]?\\d{3}[ ]?\\d{3}", message)\nprint(phones)\ndates = re.findall(r"\\b\\d{1,2}/\\d{1,2}/\\d{4}\\b", message)\nprint(dates)`,
        explain: ['(?:...) is a group that is not captured, so findall still returns the whole match.', '[ ]? allows one optional space between the digit groups.', '\\b marks a word boundary so the date is not part of a longer number.'] },
      { h: 'Cleaning and rewriting with sub', p: [
        're.sub(pattern, replacement, text) replaces every match. In the replacement, \\1 means the first group. You can rewrite dates from day/month/year to year-month-day, or hide phone numbers. Compile a pattern with re.compile when you use it many times.'],
        code: `import re\n\ntext = "Exam on 22/11/2026, results on 05/12/2026."\nprint(re.sub(r"(\\d{2})/(\\d{2})/(\\d{4})", r"\\3-\\2-\\1", text))\nprint(re.sub(r"\\d{4} \\d{3} \\d{3}", "XXXX XXX XXX", "Call 0762 574 073"))\nphone = re.compile(r"\\d{4} \\d{3} \\d{3}")\nprint(bool(phone.fullmatch("0762 574 073")), bool(phone.fullmatch("076")))`,
        explain: ['\\3-\\2-\\1 puts the year first, then the month, then the day.', 'fullmatch is true only when the whole text matches the pattern.', 'This is how you validate input: fullmatch for the whole value, search for a part of it.'] },
    ], {
      mistakes: ['Forgetting the r before the pattern string, so \\d turns into a strange character.', 'Greedy matching: .* grabs too much; use .*? to match as little as possible.', 'Forgetting to escape special characters: a dot . matches any character, \\. matches a real dot.', 'Expecting findall to return whole matches when the pattern has groups.'],
      exercises: [
        { q: 'Find all 3-digit numbers in "a 123 b 45 c 678" and print them.', a: 'import re\nprint(re.findall(r"\\b\\d{3}\\b", "a 123 b 45 c 678"))' },
        { q: 'Replace every digit in "ID 4521" with #.', a: 'import re\nprint(re.sub(r"\\d", "#", "ID 4521"))' },
        { q: 'Check with fullmatch whether "2026" is exactly four digits and print the result.', a: 'import re\nprint(bool(re.fullmatch(r"\\d{4}", "2026")))' },
      ],
      quiz: [
        { q: 'What does re.sub do?', options: ['Finds the first match', 'Replaces every match', 'Splits text', 'Counts matches'], answer: 1, why: 'sub substitutes every match with the replacement.' },
        { q: 'Why write patterns as r"..."?', options: ['It is faster', 'Backslashes stay as typed', 'It is required for digits', 'It makes patterns case-insensitive'], answer: 1, why: 'A raw string does not process backslash escapes.' },
        { q: 'What does ? after a quantifier (like .*?) do?', options: ['Makes it optional', 'Makes it match as little as possible', 'Repeats it', 'Nothing'], answer: 1, why: 'It makes the match lazy.' },
      ],
      challenge: {
        prompt: 'Write find_emails(text) that returns a list of all email addresses found in the text (use re.findall).',
        starter: 'import re\n\ndef find_emails(text):\n    # return a list of email addresses\n    return []\n',
        check: 'assert find_emails("Write to asha.juma@udsm.ac.tz or info@venue.app today") == ["asha.juma@udsm.ac.tz", "info@venue.app"], "Two emails expected"\nassert find_emails("no email here") == [], "No email gives an empty list"\nassert find_emails("a_b+c@mail.com.") == ["a_b+c@mail.com"], "The final dot of the sentence is not part of the address"',
        hint: 'A pattern like r"[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+" matches the whole address (note the (?:...) non-capturing group).',
        solution: 'import re\n\ndef find_emails(text):\n    return re.findall(r"[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+", text)\n',
      },
    }),

  L('abspaths', 'Automate: files and folders with pathlib', 'pathlib hutengeneza, kusoma na kutafuta faili kwa njia rahisi na salama.',
    'Write count_by_extension(names) that counts how many files have each extension.',
    [
      { h: 'Paths as objects', p: [
        'A Path object represents a file or folder location. The / operator joins parts, so you never worry about slashes. It has handy attributes: name (with extension), stem (without), suffix (the extension) and parent (the folder). Path code works on Windows, Mac, Linux and phones.',
        'In these examples we create a temporary folder so your real files are never touched. On your computer you would simply write Path("notes") or Path.home() / "Documents".'],
        code: `from pathlib import Path\n\nfile = Path("study") / "stats" / "notes_week1.pdf"\nprint(file)\nprint(file.name, "|", file.stem, "|", file.suffix, "|", file.parent)\nprint(file.with_suffix(".txt"))\nprint(file.with_name("summary.pdf"))`,
        explain: ['The / operator joins the parts with the right separator.', 'name is "notes_week1.pdf", stem "notes_week1" and suffix ".pdf".', 'with_suffix and with_name make a new path; the original is unchanged.'] },
      { h: 'Making, writing and listing', p: [
        'mkdir(parents=True, exist_ok=True) creates a folder and any missing parents without complaining if it already exists. write_text and read_text save and load text. glob("*.txt") finds matching files, and iterdir() lists everything in a folder. Sort the results because the order is not guaranteed.'],
        code: `import tempfile\nfrom pathlib import Path\n\nbase = Path(tempfile.mkdtemp())\nnotes = base / "notes"\nnotes.mkdir(parents=True, exist_ok=True)\nfor n in ("week1", "week2", "week3"):\n    (notes / (n + ".txt")).write_text("Notes for " + n + "\\n")\n(notes / "image.png").write_bytes(b"fake")\nprint(sorted(p.name for p in notes.glob("*.txt")))\nprint(sorted(p.name for p in notes.iterdir()))\nprint((notes / "week2.txt").read_text().strip())\nprint((notes / "week2.txt").exists(), (notes / "week9.txt").exists())`,
        explain: ['Three text files and one fake image are created in a new temporary folder.', 'glob("*.txt") returns only the text files; iterdir() returns all four.', 'exists() answers True or False without raising an error.'] },
      { h: 'Walking through folders', p: [
        'rglob("*") searches inside subfolders too. Each path knows whether it is a file (is_file) or a folder (is_dir), and stat().st_size gives the size in bytes. With these you can find all PDF files, add up sizes, or spot huge files taking space on a phone.'],
        code: `import tempfile\nfrom pathlib import Path\n\nbase = Path(tempfile.mkdtemp())\n(base / "a").mkdir()\n(base / "a" / "b").mkdir()\n(base / "x.txt").write_text("hello")\n(base / "a" / "y.txt").write_text("hello world")\n(base / "a" / "b" / "z.pdf").write_text("pdf")\nfor p in sorted(base.rglob("*")):\n    kind = "dir " if p.is_dir() else "file"\n    print(kind, p.relative_to(base))\ntotal = sum(p.stat().st_size for p in base.rglob("*") if p.is_file())\nprint("Total bytes:", total)`,
        explain: ['relative_to(base) prints the path from the starting folder instead of the long temporary path.', 'The sum adds the sizes of files only: 5 + 11 + 3 = 19 bytes.', 'rglob walks down through a/ and a/b/ automatically.'] },
    ], {
      mistakes: ['Building paths by joining strings with "/" or "\\\\": use the / operator of Path.', 'Forgetting exist_ok=True and getting FileExistsError the second time.', 'Assuming iterdir or glob return files in alphabetical order (sort them).', 'Deleting or overwriting real files while experimenting: test on a copy or temporary folder first.'],
      exercises: [
        { q: 'Print the extension of "report.final.pdf" using Path.', a: 'from pathlib import Path\nprint(Path("report.final.pdf").suffix)' },
        { q: 'Print the file name without its extension for "notes/week1.txt".', a: 'from pathlib import Path\nprint(Path("notes/week1.txt").stem)' },
        { q: 'Print the folder part (parent) of "a/b/c.txt".', a: 'from pathlib import Path\nprint(Path("a/b/c.txt").parent)' },
      ],
      quiz: [
        { q: 'What does Path("a") / "b" produce?', options: ['A string "ab"', 'The path a/b', 'An error', 'A list'], answer: 1, why: 'The / operator joins path parts.' },
        { q: 'What does exist_ok=True do in mkdir?', options: ['Deletes the folder', 'Does not fail if the folder exists', 'Checks permissions', 'Renames it'], answer: 1, why: 'It stops FileExistsError.' },
        { q: 'Which finds files in subfolders too?', options: ['glob("*")', 'iterdir()', 'rglob("*")', 'exists()'], answer: 2, why: 'rglob searches recursively.' },
      ],
      challenge: {
        prompt: 'Write count_by_extension(names) that takes a list of file names and returns a dictionary {extension: how many files}. Use lower-case extensions including the dot, and ignore names without an extension. Example: ["a.PDF", "b.pdf", "c.txt", "README"] gives {".pdf": 2, ".txt": 1}.',
        starter: 'from pathlib import Path\n\ndef count_by_extension(names):\n    # return {".pdf": 2, ...}\n    return {}\n',
        check: 'assert count_by_extension(["a.PDF", "b.pdf", "c.txt", "README"]) == {".pdf": 2, ".txt": 1}, "Got " + str(count_by_extension(["a.PDF", "b.pdf", "c.txt", "README"]))\nassert count_by_extension([]) == {}, "An empty list gives {}"\nassert count_by_extension(["x.tar.gz", "y.gz"]) == {".gz": 2}, "Only the last suffix counts"',
        hint: 'Use Path(name).suffix.lower() and skip empty suffixes; count with a dictionary.get(ext, 0) + 1.',
        solution: 'from pathlib import Path\n\ndef count_by_extension(names):\n    counts = {}\n    for name in names:\n        ext = Path(name).suffix.lower()\n        if ext:\n            counts[ext] = counts.get(ext, 0) + 1\n    return counts\n',
      },
    }),

  L('absorganize', 'Automate: organising files automatically', 'Panga faili zilizo ovyo kuwa folda kwa aina yake kwa programu moja.',
    'Write plan_moves(names) that decides which folder each file should go to.',
    [
      { h: 'The problem', p: [
        'A phone or laptop Downloads folder fills with PDFs, images and documents. Sorting by hand is boring, so we automate it: look at each file, decide the folder from its extension, create the folder if needed, and move the file. The safest method has two stages: first make a plan (a pure function that only decides), then carry it out.'],
        code: `from pathlib import Path\n\nFOLDERS = {".pdf": "Documents", ".docx": "Documents", ".png": "Images", ".jpg": "Images", ".mp4": "Videos"}\n\ndef folder_for(name):\n    return FOLDERS.get(Path(name).suffix.lower(), "Other")\n\nfor name in ["notes.PDF", "photo.jpg", "movie.mp4", "readme", "data.csv"]:\n    print(name, "->", folder_for(name))`,
        explain: ['A dictionary maps each extension to a folder name; .get gives "Other" when the extension is unknown.', 'lower() makes notes.PDF and notes.pdf behave the same.', 'Because folder_for only decides, it is easy to test with no real files.'] },
      { h: 'Carrying out the plan', p: [
        'Now do the work with shutil.move. For every file, create the destination folder with mkdir(exist_ok=True) and move the file into it. We build a small sample folder first so you can watch what happens, then list the result.'],
        code: `import shutil, tempfile\nfrom pathlib import Path\n\nFOLDERS = {".pdf": "Documents", ".png": "Images", ".mp4": "Videos"}\nbase = Path(tempfile.mkdtemp())\nfor name in ["a.pdf", "b.png", "c.pdf", "d.txt", "e.mp4"]:\n    (base / name).write_text("x")\n\nfor item in sorted(base.iterdir()):\n    if item.is_file():\n        target = base / FOLDERS.get(item.suffix.lower(), "Other")\n        target.mkdir(exist_ok=True)\n        shutil.move(str(item), str(target / item.name))\n\nfor p in sorted(base.rglob("*")):\n    if p.is_file():\n        print(p.relative_to(base))`,
        explain: ['sorted(base.iterdir()) makes a fixed list first, because we change the folder while looping.', 'shutil.move takes strings (or paths) for the source and the destination.', 'The result shows every file inside its new folder: Documents/a.pdf, Images/b.png and so on.'] },
      { h: 'Safety first', p: [
        'Automation can damage things quickly, so build in safety. Do a dry run that only prints what it would do. Never overwrite: if the target name already exists, add a number. Keep the original names. Test on a copy of your files before the real ones. A short log of every move lets you undo a mistake.'],
        code: `from pathlib import Path\n\ndef unique_name(existing, name):\n    p = Path(name)\n    candidate = name\n    n = 1\n    while candidate in existing:\n        candidate = f"{p.stem}_{n}{p.suffix}"\n        n += 1\n    return candidate\n\nexisting = {"report.pdf", "report_1.pdf"}\nprint(unique_name(existing, "report.pdf"))\nprint(unique_name(existing, "notes.pdf"))\nDRY_RUN = True\nfor name in ["a.pdf", "b.png"]:\n    action = "would move" if DRY_RUN else "moved"\n    print(action, name)`,
        explain: ['unique_name keeps adding _1, _2 ... until the name is free, so nothing is overwritten.', 'DRY_RUN = True prints the plan without touching any file.', 'Set DRY_RUN = False only after the plan looks right.'] },
    ], {
      mistakes: ['Moving files while looping over the same folder without making a list first.', 'Overwriting a file that already has the same name in the target folder.', 'Running the automation on real data before testing it on a copy.', 'Forgetting to convert Path objects to strings in very old code that needs str.'],
      exercises: [
        { q: 'Use a dictionary and .get to print "Images" for ".png" and "Other" for ".zip".', a: 'F = {".png": "Images"}\nprint(F.get(".png", "Other"), F.get(".zip", "Other"))' },
        { q: 'Print "would move a.pdf" when DRY_RUN is True.', a: 'DRY_RUN = True\nprint("would move a.pdf" if DRY_RUN else "moved a.pdf")' },
        { q: 'Print the new name report_1.pdf built from stem "report", number 1 and suffix ".pdf".', a: 'print(f"{\'report\'}_{1}{\'.pdf\'}")' },
      ],
      quiz: [
        { q: 'Why make a plan before moving files?', options: ['It is shorter', 'You can check and test it safely first', 'Python requires it', 'It uses less memory'], answer: 1, why: 'A plan lets you test and dry-run before any file changes.' },
        { q: 'What does a dry run do?', options: ['Deletes files', 'Prints what would happen without doing it', 'Compresses files', 'Runs twice'], answer: 1, why: 'It shows the actions without changing anything.' },
        { q: 'What does shutil.move do?', options: ['Copies a file', 'Moves a file to a new place', 'Deletes a file', 'Reads a file'], answer: 1, why: 'It moves the file or folder to the destination.' },
      ],
      challenge: {
        prompt: 'Write plan_moves(names) that returns a dictionary {file name: folder}. Use Documents for .pdf and .docx, Images for .png and .jpg, Videos for .mp4 and Other for everything else (case does not matter).',
        starter: 'from pathlib import Path\n\ndef plan_moves(names):\n    # return {"a.pdf": "Documents", ...}\n    return {}\n',
        check: 'r = plan_moves(["a.PDF", "b.jpg", "c.mp4", "d.txt", "e"])\nassert r == {"a.PDF": "Documents", "b.jpg": "Images", "c.mp4": "Videos", "d.txt": "Other", "e": "Other"}, "Got " + str(r)\nassert plan_moves([]) == {}, "An empty list gives {}"\nassert plan_moves(["x.DOCX"]) == {"x.DOCX": "Documents"}, ".DOCX counts as Documents"',
        hint: 'Make a FOLDERS dictionary of extensions and use FOLDERS.get(Path(name).suffix.lower(), "Other").',
        solution: 'from pathlib import Path\n\nFOLDERS = {".pdf": "Documents", ".docx": "Documents", ".png": "Images", ".jpg": "Images", ".mp4": "Videos"}\n\ndef plan_moves(names):\n    return {n: FOLDERS.get(Path(n).suffix.lower(), "Other") for n in names}\n',
      },
    }),

  L('absdates', 'Automate: dates, deadlines and reminders', 'Hesabu siku zilizobaki, panga tarehe na utengeneze ratiba kwa datetime.',
    'Write days_until(today, target) from two dates written as text.',
    [
      { h: 'Parsing and formatting dates', p: [
        'Dates arrive as text in many styles: "2026-11-22", "22/11/2026", "22 Nov 2026". strptime converts text to a datetime using a format code, and strftime converts a date back to text. The common codes are %d (day), %m (month number), %Y (4-digit year), %b (short month name) and %A (weekday name).'],
        code: `from datetime import datetime\n\nd = datetime.strptime("22/11/2026", "%d/%m/%Y")\nprint(d.year, d.month, d.day)\nprint(d.strftime("%A, %d %B %Y"))\nprint(d.strftime("%Y-%m-%d"))\nprint(datetime.strptime("5 Dec 2026", "%d %b %Y").date())`,
        explain: ['The format string describes the layout of the text: it must match exactly, including the slashes.', 'strftime("%A, %d %B %Y") prints Sunday, 22 November 2026.', '.date() drops the time and keeps only the date.'] },
      { h: 'Calculating with dates', p: [
        'Subtract two dates and you get a timedelta; its .days is the number of whole days between them. Add a timedelta to move forward or back. weekday() gives 0 for Monday up to 6 for Sunday, which helps to skip weekends.'],
        code: `from datetime import date, timedelta\n\ntoday = date(2026, 11, 22)\nexam = date(2026, 12, 18)\nprint((exam - today).days, "days left")\nprint(today + timedelta(weeks=2))\nprint(today - timedelta(days=100))\nprint(today.weekday(), exam.weekday())\ndef next_workday(d):\n    d += timedelta(days=1)\n    while d.weekday() >= 5:\n        d += timedelta(days=1)\n    return d\nprint(next_workday(date(2026, 11, 27)))`,
        explain: ['Dec 18 is 26 days after Nov 22.', 'weekday() is 6 for Sunday (Nov 22) and 4 for Friday (Dec 18).', 'next_workday from Friday Nov 27 skips Saturday and Sunday and returns Monday Nov 30.'] },
      { h: 'A reminder schedule', p: [
        'Combine these ideas to build a study schedule: from an exam date, count back to get revision days. Loop through a list of offsets and print a line for each. The same code could send a message or save a calendar file, which is where real automation begins.'],
        code: `from datetime import date, timedelta\n\nexam = date(2026, 12, 18)\nplan = [(14, "Finish notes"), (7, "Past papers"), (3, "Revise weak topics"), (1, "Sleep early")]\nfor days_before, task in plan:\n    when = exam - timedelta(days=days_before)\n    print(f"{when:%a %d %b}: {task}")\nprint("Exam:", f"{exam:%A %d %B}")`,
        explain: ['An f-string can format a date directly: {when:%a %d %b} gives Fri 04 Dec.', 'Each offset counts days before the exam, so the plan is always correct if the exam date changes.', 'Change one line (exam =) and the whole schedule updates: that is the power of automation.'] },
    ], {
      mistakes: ['Writing the format code wrongly: %m is the month, %M is the minutes.', 'Subtracting dates stored as text instead of date objects.', 'Forgetting that a timedelta .days ignores the time of day.', 'Mixing day/month order: 05/12/2026 is 5 December in Tanzania but May 12 in the US. Always state the format.'],
      exercises: [
        { q: 'Print the date 2026-12-18 written as 18/12/2026 using strftime.', a: 'from datetime import date\nprint(date(2026, 12, 18).strftime("%d/%m/%Y"))' },
        { q: 'Print the date that is 30 days after 2026-11-22.', a: 'from datetime import date, timedelta\nprint(date(2026, 11, 22) + timedelta(days=30))' },
        { q: 'Print the number of days between 2026-01-01 and 2026-03-01.', a: 'from datetime import date\nprint((date(2026, 3, 1) - date(2026, 1, 1)).days)' },
      ],
      quiz: [
        { q: 'What does strptime do?', options: ['Date to text', 'Text to date', 'Adds days', 'Prints the time'], answer: 1, why: 'strptime parses text into a datetime (p for parse).' },
        { q: 'What is date(2026, 3, 1) - date(2026, 1, 1)?', options: ['A number', 'A timedelta of 59 days', 'A string', 'An error'], answer: 1, why: 'Subtracting dates gives a timedelta; January and February 2026 have 59 days.' },
        { q: 'What does weekday() return for Monday?', options: ['1', '0', '7', '6'], answer: 1, why: 'Monday is 0 and Sunday is 6.' },
      ],
      challenge: {
        prompt: 'Write days_until(today, target) where both dates are text in the form "YYYY-MM-DD". Return the number of days from today to target as an int (negative if the target is in the past).',
        starter: 'from datetime import datetime\n\ndef days_until(today, target):\n    # return the number of days\n    return 0\n',
        check: 'assert days_until("2026-11-22", "2026-12-18") == 26, "Nov 22 to Dec 18 is 26 days"\nassert days_until("2026-12-18", "2026-12-18") == 0, "Same day gives 0"\nassert days_until("2026-12-18", "2026-11-22") == -26, "A past date gives a negative number"\nassert days_until("2026-02-27", "2026-03-02") == 3, "Feb 27 to Mar 2 is 3 days in 2026"',
        hint: 'Parse both texts with datetime.strptime(text, "%Y-%m-%d") and subtract; read .days.',
        solution: 'from datetime import datetime\n\ndef days_until(today, target):\n    a = datetime.strptime(today, "%Y-%m-%d")\n    b = datetime.strptime(target, "%Y-%m-%d")\n    return (b - a).days\n',
      },
    }),

  L('abslog', 'Automate: errors, logging and safe scripts', 'Programu ya kiotomatiki lazima ishughulikie makosa na iache kumbukumbu (log).',
    'Write safe_int(value, default=0) that never crashes.',
    [
      { h: 'Scripts that survive bad data', p: [
        'Real data is messy: empty cells, text where numbers should be, missing files. A script that crashes on the first bad row wastes your time. Decide what should happen with bad data: skip it, use a default, or stop with a clear message. try/except lets you choose.'],
        code: `values = ["12", "7.5", "", "abc", None, "30"]\ntotal = 0\nbad = []\nfor v in values:\n    try:\n        total += float(v)\n    except (ValueError, TypeError):\n        bad.append(v)\nprint("Total:", total)\nprint("Skipped:", bad)`,
        explain: ['float("") and float("abc") raise ValueError; float(None) raises TypeError, so we catch both.', 'The script keeps going and remembers the bad values for a report.', 'Catch only the errors you expect; a bare except hides real bugs.'] },
      { h: 'Logging', p: [
        'print is fine for small scripts, but the logging module is better for automation: every message has a level (DEBUG, INFO, WARNING, ERROR) and a format, and you can send it to a file. When a script runs alone at night, the log is how you find out what happened.'],
        code: `import logging, sys\n\nlogging.basicConfig(stream=sys.stdout, level=logging.INFO, format="%(levelname)s: %(message)s", force=True)\nlogging.debug("not shown, level too low")\nlogging.info("Starting the job")\nlogging.warning("Row 3 is empty, skipped")\ntry:\n    10 / 0\nexcept ZeroDivisionError:\n    logging.error("Division failed", exc_info=False)\nlogging.info("Finished")`,
        explain: ['The level=logging.INFO setting hides DEBUG messages.', 'The format puts the level name before each message.', 'In a real script use filename="job.log" instead of stream=sys.stdout to save the log in a file.'] },
      { h: 'Checks, raising errors and retrying', p: [
        'assert checks something you believe is true and stops with a message if not. raise lets you stop with your own error when the input is unacceptable. For things that fail for a moment (like a network request) you can retry a few times before giving up.'],
        code: `def percent(part, whole):\n    if whole == 0:\n        raise ValueError("whole must not be zero")\n    return part / whole * 100\n\ntry:\n    print(percent(30, 120))\n    print(percent(5, 0))\nexcept ValueError as e:\n    print("Problem:", e)\n\nattempts = 0\ndef flaky():\n    global attempts\n    attempts += 1\n    if attempts < 3:\n        raise ConnectionError("temporary")\n    return "ok after " + str(attempts)\nfor _ in range(5):\n    try:\n        print(flaky())\n        break\n    except ConnectionError:\n        print("retrying")`,
        explain: ['raise ValueError gives a clear message instead of a confusing ZeroDivisionError.', 'The retry loop calls flaky until it works; break leaves the loop after success.', 'Always limit the number of retries so a broken script cannot run forever.'] },
    ], {
      mistakes: ['Using a bare except: it hides every error, including your typos.', 'Using print everywhere and then having no record of what an overnight script did.', 'Retrying forever with no limit.', 'Catching an error and doing nothing (pass): you lose all information about the failure.'],
      exercises: [
        { q: 'Use try/except to print "bad" when int("x") fails.', a: 'try:\n    int("x")\nexcept ValueError:\n    print("bad")' },
        { q: 'Raise a ValueError with the message "negative" when n is below 0, and catch it to print the message. Try n = -1.', a: 'n = -1\ntry:\n    if n < 0:\n        raise ValueError("negative")\nexcept ValueError as e:\n    print(e)' },
        { q: 'Print "done" in a finally block after a try that works.', a: 'try:\n    x = 1\nfinally:\n    print("done")' },
      ],
      quiz: [
        { q: 'Which error does int("abc") raise?', options: ['TypeError', 'ValueError', 'KeyError', 'NameError'], answer: 1, why: 'The type is right (text) but the value cannot be converted.' },
        { q: 'Why use logging instead of print for automation?', options: ['It is faster', 'Levels, formats and files for later review', 'It colours text', 'print is deprecated'], answer: 1, why: 'Logs record what happened, even when you are not watching.' },
        { q: 'What is wrong with a bare except?', options: ['Nothing', 'It hides unexpected errors', 'It is slow', 'It cannot be used with try'], answer: 1, why: 'It catches everything, so real bugs stay hidden.' },
      ],
      challenge: {
        prompt: 'Write safe_int(value, default=0) that returns int(value) when it works, and the default when the value is empty, text that is not a whole number, or None.',
        starter: 'def safe_int(value, default=0):\n    # never crash\n    return default\n',
        check: 'assert safe_int("42") == 42, "safe_int(\'42\') should be 42"\nassert safe_int("abc") == 0, "Invalid text gives the default"\nassert safe_int("", default=-1) == -1, "Empty text gives the given default"\nassert safe_int(None, 5) == 5, "None gives the default"\nassert safe_int("7.5") == 0, "A decimal text is not a whole number"\nassert safe_int(9) == 9, "An int stays an int"',
        hint: 'try: return int(value) and except (ValueError, TypeError): return default',
        solution: 'def safe_int(value, default=0):\n    try:\n        return int(value)\n    except (ValueError, TypeError):\n        return default\n',
      },
    }),

  L('absscript', 'Project: an automatic daily marks report', 'Unganisha kila kitu: soma data chafu, ikague, tengeneza ripoti na uihifadhi.',
    'Write process(lines) that returns the valid rows, the invalid lines and the average.',
    [
      { h: 'The job', p: [
        'Our project: a lecturer pastes marks as lines of text, "name,mark". Some lines are wrong: a missing mark, text instead of a number, a mark above 100. The script must read all lines, keep the good ones, remember the bad ones, and produce a clean report with the average. It combines everything from this part: cleaning text, safe conversion, logging and file saving.'],
        code: `LINES = [\n    "Asha,82",\n    "  juma , 64 ",\n    "Neema,abc",\n    "Baraka,",\n    "Zawadi,105",\n    "Omari,58",\n]\nfor line in LINES:\n    print(repr(line))`,
        explain: ['Line 2 has extra spaces and a lower-case name that we must clean.', 'Lines 3, 4 and 5 are invalid: not a number, empty, and above 100.', 'Looking at the raw data first (repr shows the hidden spaces) is the first step of any automation.'] },
      { h: 'Parsing one line at a time', p: [
        'Write a function that handles one line and either returns a cleaned (name, mark) pair or raises ValueError with the reason. Keeping one line in one function makes the code easy to test. The main loop then calls it inside try/except and sorts the lines into good and bad.'],
        code: `def parse_line(line):\n    parts = line.split(",")\n    if len(parts) != 2:\n        raise ValueError("needs exactly one comma")\n    name = " ".join(parts[0].split()).title()\n    if not name:\n        raise ValueError("name is empty")\n    try:\n        mark = float(parts[1])\n    except ValueError:\n        raise ValueError("mark is not a number")\n    if not 0 <= mark <= 100:\n        raise ValueError("mark must be between 0 and 100")\n    return name, mark\n\nfor line in ["Asha,82", "  juma , 64 ", "Neema,abc", "Baraka,", "Zawadi,105"]:\n    try:\n        print("OK ", parse_line(line))\n    except ValueError as e:\n        print("BAD", repr(line), "-", e)`,
        explain: ['Each rule has its own check and a clear message, so the lecturer knows exactly what to fix.', 'float(" 64 ") works because float ignores surrounding spaces.', '0 <= mark <= 100 is a chained comparison and checks both limits.'] },
      { h: 'Putting it together', p: [
        'The last step collects the results, calculates the average, builds the report text and saves it. To run this every day with no clicking, schedule it: Task Scheduler on Windows, cron on Linux and Mac, or a scheduled task in a cloud service. The script itself does not change.'],
        code: `import tempfile\nfrom pathlib import Path\nfrom statistics import mean\n\ndef parse_line(line):\n    parts = line.split(",")\n    if len(parts) != 2:\n        raise ValueError("needs exactly one comma")\n    name = " ".join(parts[0].split()).title()\n    try:\n        mark = float(parts[1])\n    except ValueError:\n        raise ValueError("mark is not a number")\n    if not 0 <= mark <= 100:\n        raise ValueError("mark must be between 0 and 100")\n    return name, mark\n\ndef process(lines):\n    good, bad = [], []\n    for line in lines:\n        try:\n            good.append(parse_line(line))\n        except ValueError as e:\n            bad.append((line, str(e)))\n    return good, bad\n\ngood, bad = process(["Asha,82", "  juma , 64 ", "Neema,abc", "Omari,58"])\nreport = [f"{n:<8}{m:>6.1f}" for n, m in good]\nreport.append("-" * 14)\nreport.append(f"Average {mean(m for _, m in good):>6.1f}")\nreport.append(f"Skipped lines: {len(bad)}")\nfile = Path(tempfile.mkdtemp()) / "report.txt"\nfile.write_text("\\n".join(report) + "\\n")\nprint(file.read_text())`,
        explain: ['process returns two lists, so the caller can report both the good rows and the problems.', 'The report is built as a list of lines and written once.', 'Save the script, test it with a few bad lines like these, then schedule it: you have automated a boring job.'] },
    ], {
      mistakes: ['Stopping the whole script on the first bad line instead of collecting the problems.', 'Not telling the user why a line was rejected.', 'Mixing parsing, calculation and saving in one huge function.', 'Forgetting to test with deliberately wrong data.'],
      exercises: [
        { q: 'Split "Asha,82" and print the name and the mark as a float.', a: 'name, mark = "Asha,82".split(",")\nprint(name, float(mark))' },
        { q: 'Print True when the number 105 is not between 0 and 100.', a: 'print(not 0 <= 105 <= 100)' },
        { q: 'Print the average of [82.0, 64.0, 58.0] rounded to 1 decimal.', a: 'from statistics import mean\nprint(round(mean([82.0, 64.0, 58.0]), 1))' },
      ],
      quiz: [
        { q: 'Why keep one line in one function?', options: ['It is required', 'It is easier to test and reuse', 'It is faster', 'It saves memory'], answer: 1, why: 'Small functions are easy to test with good and bad examples.' },
        { q: 'What should a script do with a bad line?', options: ['Crash', 'Skip it and report why', 'Ignore it silently', 'Change the mark'], answer: 1, why: 'Collect the problem and tell the user what to fix.' },
        { q: 'How do you run a script every day automatically?', options: ['Click it daily', 'Use Task Scheduler or cron', 'Use print', 'It is impossible'], answer: 1, why: 'Schedulers start a program at set times.' },
      ],
      challenge: {
        prompt: 'Write process(lines) for lines like "Asha,82". Return a tuple (good, bad, average): good is a list of (Name, mark) with the name cleaned (title case, extra spaces removed) and the mark as a float; bad is the list of original lines that are invalid (wrong number of commas, mark not a number, or outside 0 to 100); average is the mean of the good marks rounded to 1 decimal (0 when there are no good rows).',
        starter: 'def process(lines):\n    good = []\n    bad = []\n    average = 0\n    return good, bad, average\n',
        check: 'lines = ["Asha,82", "  juma , 64 ", "Neema,abc", "Baraka,", "Zawadi,105", "Omari,58", "a,b,c"]\ngood, bad, average = process(lines)\nassert good == [("Asha", 82.0), ("Juma", 64.0), ("Omari", 58.0)], "good rows wrong: " + str(good)\nassert bad == ["Neema,abc", "Baraka,", "Zawadi,105", "a,b,c"], "bad lines wrong: " + str(bad)\nassert average == 68.0, "average should be 68.0, got " + str(average)\nassert process([]) == ([], [], 0), "An empty input gives ([], [], 0)"\nassert process(["x,200"]) == ([], ["x,200"], 0), "Only bad lines give average 0"',
        hint: 'Loop over lines and use try/except ValueError. Split on ",", check len(parts) == 2, clean the name with " ".join(...split()).title(), convert float(parts[1]) and check 0 <= mark <= 100.',
        solution: 'def process(lines):\n    good = []\n    bad = []\n    for line in lines:\n        parts = line.split(",")\n        if len(parts) != 2:\n            bad.append(line)\n            continue\n        try:\n            mark = float(parts[1])\n        except ValueError:\n            bad.append(line)\n            continue\n        if not 0 <= mark <= 100:\n            bad.append(line)\n            continue\n        good.append((" ".join(parts[0].split()).title(), mark))\n    average = round(sum(m for _, m in good) / len(good), 1) if good else 0\n    return good, bad, average\n',
      },
    }),
];
