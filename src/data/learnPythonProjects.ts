import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Python Part II style projects (plain Python, so everything runs in the phone browser). */
export const PYTHON_PROJECTS: LearnLesson[] = [
  L('p2walk', 'Project: a random walk', 'Random walk ni njia ya hatua za bahati nasibu. Inafundisha random, loops na classes.',
    'Write walk_1d(steps, seed) that returns the final position after random steps of -1 or +1.',
    [
      { h: 'The idea', p: [
        'A random walk starts at zero and at every step moves one place left or right by chance. Scientists use it to model gas molecules, share prices and even how a drunk person wanders home. It is a perfect first project: a loop, a list and the random module.',
        'We set a seed so that the "random" numbers repeat. That makes a program easy to test: the same seed always gives the same walk.'],
        code: `import random\nrandom.seed(7)\nposition = 0\npath = [position]\nfor _ in range(10):\n    position += random.choice([-1, 1])\n    path.append(position)\nprint(path)\nprint("Final:", position, "Furthest from start:", max(abs(p) for p in path))`,
        explain: ['random.choice picks -1 or 1 at each step, and position changes by that amount.', 'path keeps every position so we can study the walk afterwards.', 'The underscore _ is a loop variable we do not use. max(abs(p) ...) finds the furthest distance from the start.'] },
      { h: 'Turning it into a class', p: [
        'A class keeps the data and the actions of the walk together. Our RandomWalk stores x and y lists and has a fill() method that keeps adding steps until the walk is long enough. Using random.Random(seed) gives each walk its own generator, so two walks do not disturb each other.'],
        code: `import random\n\nclass RandomWalk:\n    def __init__(self, steps=20, seed=None):\n        self.steps = steps\n        self.rng = random.Random(seed)\n        self.x = [0]\n        self.y = [0]\n\n    def fill(self):\n        while len(self.x) < self.steps + 1:\n            dx = self.rng.choice([-1, 0, 1])\n            dy = self.rng.choice([-1, 0, 1])\n            if dx == 0 and dy == 0:\n                continue\n            self.x.append(self.x[-1] + dx)\n            self.y.append(self.y[-1] + dy)\n\nwalk = RandomWalk(steps=8, seed=3)\nwalk.fill()\nprint(list(zip(walk.x, walk.y)))`,
        explain: ['The walk can now move in two directions (x and y), one of 8 neighbours at a time.', 'If both dx and dy are 0 the walker would stay still, so continue throws that step away and tries again.', 'zip pairs each x with its y to make (x, y) points.'] },
      { h: 'Drawing it with text', p: [
        'Charts normally need extra libraries. We can draw a simple map with text. Go through every cell of a small grid and print S for the start, E for the end, * for cells the walker visited, and . for empty cells. Using a set makes the "was this cell visited?" question very fast.'],
        code: `def draw(points, size=4):\n    visited = set(points)\n    for y in range(size, -size - 1, -1):\n        row = ""\n        for x in range(-size, size + 1):\n            if (x, y) == (0, 0):\n                row += "S"\n            elif (x, y) == points[-1]:\n                row += "E"\n            elif (x, y) in visited:\n                row += "*"\n            else:\n                row += "."\n        print(row)\n\npoints = [(0, 0), (1, 0), (2, 1), (2, 2), (1, 3), (0, 3)]\ndraw(points)`,
        explain: ['The rows go from the top (y = size) down, so the picture looks the right way up.', 'The order of the if tests matters: the start and end are checked before the ordinary visited cells.', 'Later you can replace this text map by a real chart with a plotting library on your computer.'] },
    ], {
      mistakes: ['Forgetting a seed and then being unable to reproduce a result you want to test.', 'Using random.seed() inside every function: it resets the sequence and ruins the randomness.', 'Off-by-one in the loop: steps steps means steps + 1 points (the start counts).', 'Mixing up x and y when drawing the grid (rows are y, columns are x).'],
      exercises: [
        { q: 'Make a list of 5 random integers between 1 and 6 using seed 1 and print it.', a: 'import random\nrandom.seed(1)\nprint([random.randint(1, 6) for _ in range(5)])' },
        { q: 'Walk 6 steps of +1 or -1 from 0 with seed 2 and print the final position.', a: 'import random\nrandom.seed(2)\npos = 0\nfor _ in range(6):\n    pos += random.choice([-1, 1])\nprint(pos)' },
        { q: 'Print the furthest distance from 0 in the list [0, 1, 0, -1, -2, -1].', a: 'path = [0, 1, 0, -1, -2, -1]\nprint(max(abs(p) for p in path))' },
      ],
      quiz: [
        { q: 'Why do we set a seed?', options: ['To make the program faster', 'To get the same random numbers every run', 'To make numbers more random', 'To avoid imports'], answer: 1, why: 'The same seed gives the same sequence, which makes tests repeatable.' },
        { q: 'After 10 steps, how many positions are in the path list (start included)?', options: ['10', '11', '9', '20'], answer: 1, why: 'The start plus 10 steps gives 11 positions.' },
        { q: 'Why use random.Random(seed) inside a class?', options: ['It is required', 'Each object gets its own generator', 'It is slower', 'It prints numbers'], answer: 1, why: 'Separate generators do not disturb each other.' },
      ],
      challenge: {
        prompt: 'Write walk_1d(steps, seed) that starts at 0, makes `steps` random moves of -1 or +1 (use random.Random(seed) and its choice method) and returns the final position.',
        starter: 'import random\n\ndef walk_1d(steps, seed):\n    # return the final position\n    pass\n',
        check: 'assert walk_1d(0, 1) == 0, "With 0 steps the position stays 0"\nr = walk_1d(10, 5)\nassert isinstance(r, int), "Return an int"\nassert abs(r) <= 10 and r % 2 == 0, "After 10 steps of +-1 the position is even and at most 10 away"\nassert walk_1d(25, 9) == walk_1d(25, 9), "The same seed must give the same result"\nassert walk_1d(7, 2) % 2 == 1, "After 7 steps the position is odd"',
        hint: 'rng = random.Random(seed); then add rng.choice([-1, 1]) to the position in a loop.',
        solution: 'import random\n\ndef walk_1d(steps, seed):\n    rng = random.Random(seed)\n    position = 0\n    for _ in range(steps):\n        position += rng.choice([-1, 1])\n    return position\n',
      },
    }),

  L('p2dice', 'Project: rolling dice and counting', 'Pindua dadu mara nyingi na uhesabu mara ngapi kila namba imetokea.',
    'Write frequencies(rolls, sides) that returns how many times each face appeared, including zeros.',
    [
      { h: 'A Die class', p: [
        'Rolling dice is the classic way to see probability at work. We write a small Die class with a roll method, roll it many times, and count the results. Counter from the collections module does the counting for us.'],
        code: `import random\nfrom collections import Counter\n\nrandom.seed(42)\n\nclass Die:\n    def __init__(self, sides=6):\n        self.sides = sides\n\n    def roll(self):\n        return random.randint(1, self.sides)\n\ndie = Die()\nresults = [die.roll() for _ in range(60)]\nprint(results[:12])\nfreq = Counter(results)\nprint(freq)\nprint(sum(freq.values()))`,
        explain: ['The class remembers how many sides the die has, so Die(20) gives a 20-sided die.', 'A list comprehension rolls the die 60 times.', 'Counter makes a dictionary of face -> number of times. The counts add up to 60.'] },
      { h: 'A text histogram', p: [
        'A histogram shows how often each value happens. With text we print one # for every roll of that face. We loop over all faces from 1 to sides (not just the faces in the Counter), because a face that never appeared should still show a zero.'],
        code: `import random\nfrom collections import Counter\n\nrandom.seed(42)\nresults = [random.randint(1, 6) for _ in range(60)]\nfreq = Counter(results)\nfor face in range(1, 7):\n    count = freq[face]\n    print(f"{face} | {'#' * count:<16} {count:>2}  ({count / len(results):.0%})")`,
        explain: ['freq[face] gives 0 for a face that never appeared, because Counter returns 0 for missing keys.', '{\'#\' * count:<16} pads the bars to the same width so the numbers line up.', ':.0% turns a fraction like 0.15 into 15%. With a fair die each face should be near 17%, but in only 60 rolls it varies a lot.'] },
      { h: 'Two dice and the law of large numbers', p: [
        'With two dice the sums from 2 to 12 are not equally likely: 7 can be made in six ways, but 2 only one way (1+1). The more rolls you make, the closer the results get to the true probabilities. This is the law of large numbers, and a simulation lets you check it yourself.'],
        code: `import random\nfrom collections import Counter\n\nrandom.seed(1)\nfor n in (60, 6000):\n    sums = Counter(random.randint(1, 6) + random.randint(1, 6) for _ in range(n))\n    share7 = sums[7] / n\n    print(f"{n:>5} rolls: sum 7 happened {share7:.1%} of the time")\nprint("Exact value:", f"{6 / 36:.1%}")`,
        explain: ['The generator expression inside Counter(...) rolls two dice n times and counts the sums.', 'With 6000 rolls the share of sevens is close to the exact 6/36 = 16.7%.', 'This is the idea behind Monte Carlo simulation, used in finance, physics and statistics.'] },
    ], {
      mistakes: ['Looping over the Counter keys only: faces that never appear are missing from the chart.', 'Calling random.seed inside the roll method, so every roll gives the same number.', 'Dividing by the wrong total when calculating percentages.', 'Forgetting that randint includes both ends: randint(1, 6) can return 6.'],
      exercises: [
        { q: 'Count the letters in "mississippi" with Counter and print the result.', a: 'from collections import Counter\nprint(Counter("mississippi"))' },
        { q: 'Print the most common item of ["a", "b", "a", "c", "a", "b"] using most_common(1).', a: 'from collections import Counter\nprint(Counter(["a", "b", "a", "c", "a", "b"]).most_common(1))' },
        { q: 'Print a bar of 7 # characters followed by the number 7.', a: 'print("#" * 7, 7)' },
      ],
      quiz: [
        { q: 'What does Counter return for a key that is missing?', options: ['KeyError', '0', 'None', 'An empty list'], answer: 1, why: 'Counter returns 0 for missing keys.' },
        { q: 'Which sum of two dice is the most likely?', options: ['2', '12', '7', '6'], answer: 2, why: 'Seven can be made in 6 of the 36 ways.' },
        { q: 'What does the law of large numbers say?', options: ['Dice are unfair', 'Results get closer to the true probability as rolls increase', 'Seeds do not matter', 'Small samples are exact'], answer: 1, why: 'More trials give results nearer the theoretical value.' },
      ],
      challenge: {
        prompt: 'Write frequencies(rolls, sides) that returns a dictionary {face: count} for every face from 1 to sides (faces that never appear must have the value 0).',
        starter: 'def frequencies(rolls, sides):\n    # return {1: count, 2: count, ...}\n    pass\n',
        check: 'assert frequencies([1, 1, 3], 4) == {1: 2, 2: 0, 3: 1, 4: 0}, "frequencies([1,1,3], 4) should be {1: 2, 2: 0, 3: 1, 4: 0}"\nassert frequencies([], 2) == {1: 0, 2: 0}, "An empty list gives all zeros"\nassert sum(frequencies([6, 6, 5, 1, 2, 6], 6).values()) == 6, "The counts must add up to the number of rolls"',
        hint: 'result = {face: 0 for face in range(1, sides + 1)}; then add 1 for every roll.',
        solution: 'def frequencies(rolls, sides):\n    result = {face: 0 for face in range(1, sides + 1)}\n    for r in rolls:\n        result[r] += 1\n    return result\n',
      },
    }),

  L('p2game', 'Project: a small text game', 'Mchezo wa maandishi: ramani, mchezaji, sarafu na kuta, kwa class na game loop.',
    'Add a coins_left() method to the Game class that counts the $ symbols still on the map.',
    [
      { h: 'The map and the player', p: [
        'Big games (like the Alien Invasion project in many Python books) are built from the same pieces as this small one: a map, a player, rules for moving, and a loop that repeats. We use a text map: # is a wall, @ is the player, $ is a coin and . is empty floor. The map is a list of strings, which we change to a list of lists so single cells can be edited.'],
        code: `LEVEL = [\n    "#######",\n    "#@..$.#",\n    "#.#...#",\n    "#..$#.#",\n    "#######",\n]\ngrid = [list(row) for row in LEVEL]\nfor r, row in enumerate(grid):\n    for c, ch in enumerate(row):\n        if ch == "@":\n            print("Player starts at row", r, "column", c)\nprint("\\n".join("".join(row) for row in grid))`,
        explain: ['Strings cannot be changed in place, so each row becomes a list of characters.', 'enumerate gives the row number r and the column number c together with the symbol.', '"".join(row) turns a list of characters back into text so the map can be printed.'] },
      { h: 'The Game class', p: [
        'The class holds the grid, the score and the player position. move(key) works out the target cell. A wall means the move fails. A coin adds one to the score. Then the player symbol is moved to the new cell and the old cell becomes empty floor. Always check the wall before changing anything.'],
        code: `class Game:\n    MOVES = {"U": (-1, 0), "D": (1, 0), "L": (0, -1), "R": (0, 1)}\n\n    def __init__(self, layout):\n        self.grid = [list(row) for row in layout]\n        self.score = 0\n        for r, row in enumerate(self.grid):\n            for c, ch in enumerate(row):\n                if ch == "@":\n                    self.pos = (r, c)\n\n    def move(self, key):\n        dr, dc = self.MOVES[key]\n        r, c = self.pos[0] + dr, self.pos[1] + dc\n        target = self.grid[r][c]\n        if target == "#":\n            return False\n        if target == "$":\n            self.score += 1\n        self.grid[self.pos[0]][self.pos[1]] = "."\n        self.grid[r][c] = "@"\n        self.pos = (r, c)\n        return True\n\n    def show(self):\n        print("\\n".join("".join(row) for row in self.grid))\n        print("Score:", self.score)\n\ng = Game(["#####", "#@.$#", "#####"])\ng.move("R")\ng.move("R")\ng.show()\nprint(g.move("R"))`,
        explain: ['MOVES is a dictionary that turns a letter into a change of row and column.', 'Walls surround the map, so r and c can never leave the grid.', 'The last move bumps into the wall and returns False; the score of 1 shows the coin was collected.'] },
      { h: 'The game loop', p: [
        'A game loop reads one command, updates the state, shows the result, and repeats until the game is over. On a real phone or computer commands come from the keyboard; here we feed a string of moves so the program is easy to test. Stop when no coins are left.'],
        code: `LEVEL = [\n    "#######",\n    "#@..$.#",\n    "#.#...#",\n    "#..$#.#",\n    "#######",\n]\nclass Game:\n    MOVES = {"U": (-1, 0), "D": (1, 0), "L": (0, -1), "R": (0, 1)}\n    def __init__(self, layout):\n        self.grid = [list(row) for row in layout]\n        self.score = 0\n        for r, row in enumerate(self.grid):\n            for c, ch in enumerate(row):\n                if ch == "@":\n                    self.pos = (r, c)\n    def move(self, key):\n        dr, dc = self.MOVES[key]\n        r, c = self.pos[0] + dr, self.pos[1] + dc\n        if self.grid[r][c] == "#":\n            return False\n        if self.grid[r][c] == "$":\n            self.score += 1\n        self.grid[self.pos[0]][self.pos[1]] = "."\n        self.grid[r][c] = "@"\n        self.pos = (r, c)\n        return True\n\ngame = Game(LEVEL)\nfor key in "RRRDDLLDL":\n    moved = game.move(key)\n    print(key, "ok" if moved else "wall", game.pos, "score", game.score)`,
        explain: ['Each command is tried in order. A move into a wall is ignored but the game continues.', 'The player collects the coin at the top, then walks down and left, and picks up the second coin on the way.', 'To make this a real game you would read the key with input() in a while loop and stop when the score reaches the number of coins.'] },
    ], {
      mistakes: ['Editing the grid before checking for a wall, so the player walks into walls.', 'Forgetting to turn the old player cell back to . so the player leaves a trail.', 'Mixing the order (row, column) with (x, y): row is the vertical position.', 'Changing the original LEVEL list when you should copy it into a new grid.'],
      exercises: [
        { q: 'Print the number of rows and the number of columns of the map ["###", "#@#", "###"].', a: 'level = ["###", "#@#", "###"]\nprint(len(level), len(level[0]))' },
        { q: 'Count the # characters in the map ["##", "#."] using sum and a generator.', a: 'level = ["##", "#."]\nprint(sum(row.count("#") for row in level))' },
        { q: 'Turn the row "#@.$#" into a list of characters and print it.', a: 'print(list("#@.$#"))' },
      ],
      quiz: [
        { q: 'Why turn each row string into a list?', options: ['To print faster', 'Strings cannot be changed in place', 'Lists use less memory', 'It is required for classes'], answer: 1, why: 'Strings are immutable; lists of characters can be edited.' },
        { q: 'What should move() do for a wall?', options: ['Move anyway', 'Return False and change nothing', 'Delete the wall', 'Crash'], answer: 1, why: 'Check for the wall first and leave the state unchanged.' },
        { q: 'What does a game loop do?', options: ['Draws once', 'Repeats: read command, update, show', 'Only prints the score', 'Deletes the map'], answer: 1, why: 'Games repeat input, update and display until they end.' },
      ],
      challenge: {
        prompt: 'The Game class is below. Add a method coins_left() that returns how many $ symbols are still on the grid.',
        starter: 'class Game:\n    def __init__(self, layout):\n        self.grid = [list(row) for row in layout]\n        self.score = 0\n\n    def coins_left(self):\n        # count the $ symbols in self.grid\n        return 0\n\nLEVEL = ["#####", "#$.$#", "#####"]\n',
        check: 'g = Game(LEVEL)\nassert g.coins_left() == 2, "LEVEL has 2 coins"\ng.grid[1][1] = "."\nassert g.coins_left() == 1, "After removing one coin there is 1 left"\nassert Game(["###"]).coins_left() == 0, "A map with no coins has 0"',
        hint: 'return sum(row.count("$") for row in self.grid)',
        solution: 'class Game:\n    def __init__(self, layout):\n        self.grid = [list(row) for row in layout]\n        self.score = 0\n\n    def coins_left(self):\n        return sum(row.count("$") for row in self.grid)\n\nLEVEL = ["#####", "#$.$#", "#####"]\n',
      },
    }),

  L('p2csv', 'Project: analysing a CSV table', 'CSV ni jedwali la maandishi. csv.DictReader hulisoma safu kama dictionary.',
    'Find the hottest day and the total rain from the weather table.',
    [
      { h: 'CSV in a string', p: [
        'CSV (comma separated values) is the simplest way to store a table: one row per line, columns separated by commas. Spreadsheets and many websites export CSV. Reading a file works exactly like reading text; to keep this lesson self-contained we put the data in a string and wrap it with io.StringIO, which makes a string behave like a file.',
        'csv.DictReader uses the first line as column names and gives every row as a dictionary. Everything arrives as text, so convert numbers yourself with float().'],
        code: `import csv, io\n\nDATA = """day,temp_max,temp_min,rain_mm\nMon,31,24,0\nTue,33,25,2.5\nWed,30,23,12.0\nThu,29,23,20.5\nFri,32,24,0\nSat,34,26,0\nSun,31,25,1.0\n"""\nrows = list(csv.DictReader(io.StringIO(DATA)))\nprint(len(rows), "rows")\nprint(rows[1])\nprint(rows[1]["temp_max"] + rows[1]["temp_min"])`,
        explain: ['Each row is a dictionary such as {"day": "Tue", "temp_max": "33", ...}.', 'The values are strings: adding two of them joins the text ("33" + "25" = "3325"), which is the classic beginner surprise.', 'Convert before calculating: float(row["temp_max"]).'] },
      { h: 'Summaries', p: [
        'Now we can answer questions. max with a key function finds the row with the highest value. A generator expression adds up a column. Averages come from the statistics module.'],
        code: `import csv, io, statistics\n\nDATA = """day,temp_max,temp_min,rain_mm\nMon,31,24,0\nTue,33,25,2.5\nWed,30,23,12.0\nThu,29,23,20.5\nFri,32,24,0\nSat,34,26,0\nSun,31,25,1.0\n"""\nrows = list(csv.DictReader(io.StringIO(DATA)))\nhottest = max(rows, key=lambda r: float(r["temp_max"]))\nprint("Hottest:", hottest["day"], hottest["temp_max"])\ntemps = [float(r["temp_max"]) for r in rows]\nprint("Average max:", round(statistics.mean(temps), 1))\nrainy = [r["day"] for r in rows if float(r["rain_mm"]) > 0]\nprint("Rainy days:", rainy)\nprint("Total rain:", sum(float(r["rain_mm"]) for r in rows))`,
        explain: ['key=lambda r: float(r["temp_max"]) tells max to compare rows by their temperature number.', 'The list comprehension with an if keeps only the days with rain above zero.', 'The same pattern (convert, filter, summarise) works for any CSV table.'] },
      { h: 'Chart and saving', p: [
        'A text bar chart shows the rain at a glance. To save results, use csv.writer or DictWriter: it takes care of commas and quotes inside values. In this lesson we write into memory (StringIO) so you can see the CSV text, but with a real file the code is the same except for open("file.csv", "w", newline="").'],
        code: `import csv, io\n\nDATA = """day,rain_mm\nMon,0\nTue,2.5\nWed,12.0\nThu,20.5\nFri,0\n"""\nrows = list(csv.DictReader(io.StringIO(DATA)))\nfor r in rows:\n    print(f"{r['day']} {'#' * round(float(r['rain_mm']) / 2):<12} {r['rain_mm']}")\n\nout = io.StringIO()\nwriter = csv.DictWriter(out, fieldnames=["day", "wet"])\nwriter.writeheader()\nfor r in rows:\n    writer.writerow({"day": r["day"], "wet": float(r["rain_mm"]) > 0})\nprint(out.getvalue())`,
        explain: ['Each # stands for 2 mm of rain, rounded, so the bars are short enough for a phone screen.', 'DictWriter writes the header first and then each dictionary as a line.', 'out.getvalue() returns everything written so far as text.'] },
    ], {
      mistakes: ['Forgetting that every CSV value is text and adding strings instead of numbers.', 'Splitting lines on commas by hand: values can contain commas inside quotes. Use the csv module.', 'Forgetting newline="" when opening a CSV file for writing (blank lines appear on Windows).', 'Using the wrong column name: the keys must match the header exactly, including capital letters.'],
      exercises: [
        { q: 'Read the text "a,b\\n1,2\\n3,4" with DictReader and print the list of rows.', a: 'import csv, io\nprint(list(csv.DictReader(io.StringIO("a,b\\n1,2\\n3,4"))))' },
        { q: 'From rows = [{"m": "50"}, {"m": "70"}] print the sum of the m values as numbers.', a: 'rows = [{"m": "50"}, {"m": "70"}]\nprint(sum(float(r["m"]) for r in rows))' },
        { q: 'Print the row with the biggest "m" in rows = [{"n": "a", "m": "5"}, {"n": "b", "m": "9"}].', a: 'rows = [{"n": "a", "m": "5"}, {"n": "b", "m": "9"}]\nprint(max(rows, key=lambda r: float(r["m"])))' },
      ],
      quiz: [
        { q: 'What type are values read by csv.DictReader?', options: ['int', 'float', 'str', 'bool'], answer: 2, why: 'Everything is text until you convert it.' },
        { q: 'What does io.StringIO do?', options: ['Opens a website', 'Makes a string behave like a file', 'Sorts text', 'Compresses text'], answer: 1, why: 'It lets file-reading code work on a string.' },
        { q: 'Why use the csv module instead of split(",")?', options: ['It is shorter', 'It handles quotes and commas inside values', 'It is required by Python', 'It sorts the rows'], answer: 1, why: 'Real CSV values can contain commas inside quotes.' },
      ],
      challenge: {
        prompt: 'DATA and rows are given. Set hottest_day to the day with the highest temp_max (a string) and total_rain to the sum of rain_mm as a number.',
        starter: 'import csv, io\n\nDATA = """day,temp_max,rain_mm\nMon,31,0\nTue,33,2.5\nWed,30,12.0\nThu,35,20.5\nFri,32,0\n"""\nrows = list(csv.DictReader(io.StringIO(DATA)))\nhottest_day = ""\ntotal_rain = 0\n',
        check: 'assert hottest_day == "Thu", "hottest_day should be Thu, got " + repr(hottest_day)\nassert abs(total_rain - 35.0) < 1e-9, "total_rain should be 35.0, got " + str(total_rain)',
        hint: 'hottest_day = max(rows, key=lambda r: float(r["temp_max"]))["day"]; total_rain = sum(float(r["rain_mm"]) for r in rows)',
        solution: 'import csv, io\n\nDATA = """day,temp_max,rain_mm\nMon,31,0\nTue,33,2.5\nWed,30,12.0\nThu,35,20.5\nFri,32,0\n"""\nrows = list(csv.DictReader(io.StringIO(DATA)))\nhottest_day = max(rows, key=lambda r: float(r["temp_max"]))["day"]\ntotal_rain = sum(float(r["rain_mm"]) for r in rows)\nprint(hottest_day, total_rain)\n',
      },
    }),

  L('p2json', 'Project: sorting and grouping JSON data', 'Data ya mtandaoni huja kama JSON. Tunaipanga, kuichuja na kuipanga kwa vikundi.',
    'Build a dictionary with the top student of each course.',
    [
      { h: 'From JSON text to Python', p: [
        'Websites and apps send data as JSON text. json.loads turns that text into Python lists and dictionaries, and then everything you know about lists applies: loops, filters, sorting. Here is a list of student records.'],
        code: `import json\n\ntext = '[{"name":"Asha","course":"STAT","mark":82},{"name":"Juma","course":"MATH","mark":64},{"name":"Neema","course":"STAT","mark":91},{"name":"Baraka","course":"MATH","mark":77},{"name":"Zawadi","course":"CS","mark":58}]'\nstudents = json.loads(text)\nprint(type(students), len(students))\nprint(students[0]["name"], students[0]["mark"])`,
        explain: ['JSON objects become dictionaries and JSON arrays become lists.', 'Numbers stay numbers (82 is an int here), unlike CSV where everything is text.'] },
      { h: 'Filtering, sorting and top N', p: [
        'Use a list comprehension to keep the records you want. sorted with key and reverse=True orders them. Slicing [:3] then gives the top three. Notice that sorted returns a new list and leaves the original unchanged.'],
        code: `import json\n\nstudents = json.loads('[{"name":"Asha","course":"STAT","mark":82},{"name":"Juma","course":"MATH","mark":64},{"name":"Neema","course":"STAT","mark":91},{"name":"Baraka","course":"MATH","mark":77},{"name":"Zawadi","course":"CS","mark":58}]')\nstrong = [s for s in students if s["mark"] >= 70]\nprint([s["name"] for s in strong])\nranked = sorted(students, key=lambda s: s["mark"], reverse=True)\nfor place, s in enumerate(ranked[:3], start=1):\n    print(place, s["name"], s["mark"])`,
        explain: ['The filter keeps Asha, Neema and Baraka (70 or more).', 'enumerate(..., start=1) numbers the places from 1 instead of 0.', 'ranked[:3] is the top three after sorting from highest to lowest.'] },
      { h: 'Grouping with defaultdict', p: [
        'Grouping means collecting items under a key: all students of each course. A defaultdict(list) creates an empty list automatically the first time a key is used, so you can append without checking. Once grouped, summaries per group are easy.'],
        code: `import json\nfrom collections import defaultdict\nfrom statistics import mean\n\nstudents = json.loads('[{"name":"Asha","course":"STAT","mark":82},{"name":"Juma","course":"MATH","mark":64},{"name":"Neema","course":"STAT","mark":91},{"name":"Baraka","course":"MATH","mark":77},{"name":"Zawadi","course":"CS","mark":58}]')\ngroups = defaultdict(list)\nfor s in students:\n    groups[s["course"]].append(s["mark"])\nfor course, marks in sorted(groups.items()):\n    print(f"{course:<5} n={len(marks)} mean={mean(marks):.1f}")\nprint(json.dumps(dict(groups), indent=2))`,
        explain: ['groups["STAT"] becomes [82, 91], groups["MATH"] becomes [64, 77], and so on.', 'sorted(groups.items()) prints the courses in alphabetical order.', 'json.dumps(..., indent=2) turns the result back into readable JSON text.'] },
    ], {
      mistakes: ['Forgetting that sorted() returns a new list: calling it without storing the result does nothing.', 'Sorting by the whole dictionary instead of using key= with the field you want.', 'Using a normal dict and getting KeyError the first time a group appears (use defaultdict or setdefault).', 'Using single quotes in JSON text: JSON requires double quotes around keys and strings.'],
      exercises: [
        { q: 'Parse the JSON text \'{"a": 1, "b": [2, 3]}\' and print the second item of b.', a: 'import json\nprint(json.loads(\'{"a": 1, "b": [2, 3]}\')["b"][1])' },
        { q: 'Sort the numbers [5, 2, 9, 1] from highest to lowest and print them.', a: 'print(sorted([5, 2, 9, 1], reverse=True))' },
        { q: 'Group the words ["apple", "avocado", "banana"] by first letter with defaultdict and print the dictionary.', a: 'from collections import defaultdict\ng = defaultdict(list)\nfor w in ["apple", "avocado", "banana"]:\n    g[w[0]].append(w)\nprint(dict(g))' },
      ],
      quiz: [
        { q: 'What does json.loads return for a JSON array?', options: ['A tuple', 'A list', 'A set', 'A string'], answer: 1, why: 'Arrays become lists, objects become dictionaries.' },
        { q: 'What does defaultdict(list) do for a missing key?', options: ['Raises KeyError', 'Creates an empty list', 'Returns None', 'Ignores the key'], answer: 1, why: 'It creates the default value on first use.' },
        { q: 'sorted(items, key=..., reverse=True) returns...', options: ['The same list changed', 'A new list from highest to lowest', 'None', 'A set'], answer: 1, why: 'sorted never changes the original and reverse=True flips the order.' },
      ],
      challenge: {
        prompt: 'Using the students list, set best to a dictionary that maps each course to the name of the student with the highest mark in that course.',
        starter: 'students = [\n    {"name": "Asha", "course": "STAT", "mark": 82},\n    {"name": "Juma", "course": "MATH", "mark": 64},\n    {"name": "Neema", "course": "STAT", "mark": 91},\n    {"name": "Baraka", "course": "MATH", "mark": 77},\n    {"name": "Zawadi", "course": "CS", "mark": 58},\n]\nbest = {}\n',
        check: 'assert best == {"STAT": "Neema", "MATH": "Baraka", "CS": "Zawadi"}, "best should be {STAT: Neema, MATH: Baraka, CS: Zawadi}, got " + str(best)',
        hint: 'Loop over students; if the course is not in best yet or the mark is higher than the stored one, update best[course]. Keep the best mark in a second dictionary.',
        solution: 'students = [\n    {"name": "Asha", "course": "STAT", "mark": 82},\n    {"name": "Juma", "course": "MATH", "mark": 64},\n    {"name": "Neema", "course": "STAT", "mark": 91},\n    {"name": "Baraka", "course": "MATH", "mark": 77},\n    {"name": "Zawadi", "course": "CS", "mark": 58},\n]\nbest = {}\ntop_mark = {}\nfor s in students:\n    c = s["course"]\n    if c not in top_mark or s["mark"] > top_mark[c]:\n        top_mark[c] = s["mark"]\n        best[c] = s["name"]\nprint(best)\n',
      },
    }),

  L('p2report', 'Project: a formatted marks report', 'Tengeneza ripoti nadhifu: safu zilizopangwa, grade na muhtasari.',
    'Write report_line(name, mark) that returns an aligned line with the grade.',
    [
      { h: 'Aligned columns with f-strings', p: [
        'A good report lines up its columns. In an f-string, {value:<10} pads on the right to 10 characters (left aligned), {value:>5} pads on the left (right aligned) and {value:^7} centres. Numbers can also carry a format such as .1f for one decimal place. A line of dashes makes a neat header.'],
        code: `rows = [("Asha", 82.5), ("Juma", 64), ("Neema", 91.25)]\nprint(f"{'Name':<10}{'Mark':>8}")\nprint("-" * 18)\nfor name, mark in rows:\n    print(f"{name:<10}{mark:>8.1f}")`,
        explain: ['The header uses the same widths as the rows, so the columns line up.', '{mark:>8.1f} means width 8, right aligned, one decimal place.', 'Strings work as format values too: {\'Name\':<10} pads a literal.'] },
      { h: 'Grades and a summary', p: [
        'Put the grade rule in its own function so it can be tested by itself. Then build every line, and finish with a summary: how many students, the average, the highest and lowest marks, and the pass rate.'],
        code: `from statistics import mean\n\ndef grade(mark):\n    if mark >= 70:\n        return "A"\n    if mark >= 60:\n        return "B"\n    if mark >= 50:\n        return "C"\n    return "F"\n\nrows = [("Asha", 82.5), ("Juma", 64), ("Neema", 91.25), ("Baraka", 45)]\nfor name, mark in rows:\n    print(f"{name:<10}{mark:>7.1f}  {grade(mark)}")\nmarks = [m for _, m in rows]\nprint("-" * 20)\nprint(f"Students : {len(rows)}")\nprint(f"Average  : {mean(marks):.2f}")\nprint(f"Highest  : {max(marks)}   Lowest: {min(marks)}")\nprint(f"Pass rate: {sum(m >= 50 for m in marks) / len(marks):.0%}")`,
        explain: ['The underscore in [m for _, m in rows] means "I do not need the name here".', 'sum(m >= 50 for m in marks) adds up True values: each True counts as 1.', 'Every line of the summary uses the same label width, so the colons line up.'] },
      { h: 'Saving the report', p: [
        'Build the report as a list of lines, join them with newlines, and write the text once. You can then print it, save it, or send it to someone. We use a temporary folder here so nothing is left behind; on your own computer you would use a normal file name such as report.txt.'],
        code: `import tempfile\nfrom pathlib import Path\n\nlines = ["MARKS REPORT", "============", f"{'Asha':<10}{82.5:>7.1f}", f"{'Juma':<10}{64.0:>7.1f}"]\ntext = "\\n".join(lines) + "\\n"\nfolder = Path(tempfile.mkdtemp())\nfile = folder / "report.txt"\nfile.write_text(text)\nprint(file.read_text())\nprint("Lines saved:", len(file.read_text().splitlines()))`,
        explain: ['"\\n".join(lines) puts a line break between the lines.', 'Path.write_text and Path.read_text are the shortest way to save and load a small text file.', 'splitlines() turns the saved text back into a list of lines.'] },
    ], {
      mistakes: ['Mixing tab characters and spaces to align columns: use format widths instead.', 'Forgetting that format widths count characters, so very long names break the alignment.', 'Formatting a number with :<10 when you meant :>10 (numbers look better right aligned).', 'Putting the grade rule inside the loop instead of a function you can test.'],
      exercises: [
        { q: 'Print the word "VENUE" centred in 11 characters, padded with spaces.', a: 'print(f"{\'VENUE\':^11}|")' },
        { q: 'Print 3.14159 with two decimals, right aligned in a width of 8.', a: 'print(f"{3.14159:>8.2f}")' },
        { q: 'Print the percentage 0.256 as a whole percent using an f-string.', a: 'print(f"{0.256:.0%}")' },
      ],
      quiz: [
        { q: 'What does {x:>8} do?', options: ['Left aligns in 8', 'Right aligns in a width of 8', 'Centres in 8', 'Rounds to 8'], answer: 1, why: '> means right aligned.' },
        { q: 'What does :.2f do?', options: ['Two digits in total', 'Two decimal places', 'Two spaces', 'Multiplies by two'], answer: 1, why: 'f means fixed point and .2 is the number of decimals.' },
        { q: 'What does sum(m >= 50 for m in marks) count?', options: ['The marks', 'How many marks are at least 50', 'The total of marks', 'Nothing'], answer: 1, why: 'True counts as 1, so the sum counts the passes.' },
      ],
      challenge: {
        prompt: 'Write report_line(name, mark) that returns a string: the name left aligned in 10 characters, the mark right aligned in 6 characters with one decimal, two spaces, and the grade (A from 70, B from 60, C from 50, otherwise F). Example: report_line("Asha", 82.5) gives "Asha        82.5  A".',
        starter: 'def report_line(name, mark):\n    # build the aligned line\n    return ""\n',
        check: 'assert report_line("Asha", 82.5) == "Asha        82.5  A", "Got " + repr(report_line("Asha", 82.5))\nassert report_line("Juma", 64) == "Juma        64.0  B", "Got " + repr(report_line("Juma", 64))\nassert report_line("Baraka", 45) == "Baraka      45.0  F", "Got " + repr(report_line("Baraka", 45))\nassert report_line("Neema", 50).endswith("  C"), "50 should be grade C"',
        hint: 'grade = "A" if mark >= 70 else "B" if mark >= 60 else "C" if mark >= 50 else "F"; return f"{name:<10}{mark:>6.1f}  {grade}"',
        solution: 'def report_line(name, mark):\n    if mark >= 70:\n        g = "A"\n    elif mark >= 60:\n        g = "B"\n    elif mark >= 50:\n        g = "C"\n    else:\n        g = "F"\n    return f"{name:<10}{mark:>6.1f}  {g}"\n',
      },
    }),
];
