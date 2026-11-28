import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** SQL with Python's sqlite3 (runs in the browser). Every example builds its own small in-memory database. */
const SETUP = `import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, course TEXT, year INTEGER)")
db.execute("CREATE TABLE results (student_id INTEGER, unit TEXT, mark INTEGER)")
db.executemany("INSERT INTO students VALUES (?, ?, ?, ?)", [
    (1, "Asha", "Statistics", 1),
    (2, "Juma", "Mathematics", 2),
    (3, "Neema", "Statistics", 2),
    (4, "Baraka", "Computer Science", 1),
    (5, "Zuhura", "Mathematics", 1),
])
db.executemany("INSERT INTO results VALUES (?, ?, ?)", [
    (1, "MAT101", 72), (1, "STA101", 81),
    (2, "MAT101", 58), (2, "STA101", 64),
    (3, "MAT101", 90), (3, "STA101", 77),
    (4, "MAT101", 45),
    (5, "STA101", 68), (5, "MAT101", 70),
])
`;

const show = (q: string) => `for row in db.execute(${JSON.stringify(q)}):\n    print(row)`;

export const PYTHON_SQL: LearnLesson[] = [
  L('sqlselect', 'SQL: tables and SELECT', 'Database ni majedwali yenye safu na nguzo; SELECT inasoma data.',
    'Select only the names of all students.',
    [
      { h: 'What is a database?', p: [
        'A database stores data in tables. A table is like a spreadsheet: each column has a name and a type, and each row is one record. Universities, banks and shops keep their data this way because many people can read and change it safely at the same time. SQL (Structured Query Language) is the language you use to ask a database questions.',
        'SQLite is a tiny database that lives in a single file or even in memory, and Python has it built in as the module sqlite3. Everything in this chapter runs right here in the browser.'],
        code: `import sqlite3\n\ndb = sqlite3.connect(":memory:")   # a database that lives in memory\ndb.execute("CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT NOT NULL, course TEXT, year INTEGER)")\ndb.execute("INSERT INTO students VALUES (1, 'Asha', 'Statistics', 1)")\ndb.execute("INSERT INTO students VALUES (2, 'Juma', 'Mathematics', 2)")\nprint(db.execute("SELECT * FROM students").fetchall())`,
        explain: ['connect(":memory:") makes an empty database that disappears when the program ends.', 'CREATE TABLE defines the columns and their types. PRIMARY KEY means each id is unique.', 'SELECT * FROM students asks for every column of every row; fetchall() returns the rows as a list of tuples.'] },
      { h: 'SELECT: choosing columns', p: [
        'SELECT lists the columns you want, FROM names the table. Asking only for the columns you need is clearer and faster than using *. You can also give a column a nicer name with AS, and limit the number of rows with LIMIT. SQL keywords are not case sensitive, but writing them in capitals makes queries easier to read.',
        'The examples below start from a small student database with two tables, students and results. The setup code is shown once; each later example begins with the same setup.'],
        code: SETUP + `\n` + show('SELECT name, course FROM students') + `\nprint("---")\n` + show('SELECT name AS student, year FROM students LIMIT 3'),
        explain: ['The first query returns two columns for all five students.', 'AS renames a column in the result only; the table is not changed.', 'LIMIT 3 stops after three rows. Each row arrives as a tuple, which is why we print it.'] },
      { h: 'Reading the result in Python', p: [
        'execute returns a cursor. You can loop over it, call fetchone() for the next row, or fetchall() for all of them. Setting db.row_factory = sqlite3.Row lets you read a column by its name, like row["name"], which makes code easier to understand than counting positions.',
        'When you need one value (for example a count) you can write db.execute(...).fetchone()[0].'],
        code: SETUP + `\ndb.row_factory = sqlite3.Row\nfor row in db.execute("SELECT name, course FROM students WHERE year = 1"):\n    print(row["name"], "studies", row["course"])\n\ntotal = db.execute("SELECT COUNT(*) FROM students").fetchone()[0]\nprint("Number of students:", total)`,
        explain: ['row["name"] reads the column by name once row_factory is sqlite3.Row.', 'WHERE year = 1 keeps only first-year students (the next lesson explains WHERE).', 'COUNT(*) counts rows; fetchone()[0] takes the single value out of the result.'] },
    ], {
      mistakes: ['Writing SELECT without FROM.', 'Forgetting that execute returns a cursor: you must loop or call fetchall() to see the rows.', 'Using * everywhere instead of naming the columns you need.', 'Putting quotes around column names that should be plain, or forgetting quotes around text values.'],
      exercises: [
        { q: 'Using the setup code, print the names and years of all students.', a: SETUP + 'for row in db.execute("SELECT name, year FROM students"):\n    print(row)' },
        { q: 'Print the number of rows in the results table.', a: SETUP + 'print(db.execute("SELECT COUNT(*) FROM results").fetchone()[0])' },
        { q: 'Print only the first two students (use LIMIT).', a: SETUP + 'print(db.execute("SELECT name FROM students LIMIT 2").fetchall())' },
      ],
      quiz: [
        { q: 'What does SELECT name, course FROM students return?', options: ['All columns', 'Only the name and course columns', 'Only the first row', 'The table definition'], answer: 1, why: 'SELECT lists the columns you want.' },
        { q: 'Which module gives Python a built-in SQL database?', options: ['sqlite3', 'statistics', 'random', 'json'], answer: 0, why: 'sqlite3 ships with Python.' },
        { q: 'What does PRIMARY KEY guarantee?', options: ['Values are text', 'Each value in that column is unique', 'The column is hidden', 'The column is sorted'], answer: 1, why: 'A primary key identifies one row, so no two rows share it.' },
      ],
      challenge: {
        prompt: 'Write all_names(db) that returns a list of the names of all students (just the strings, in the order of the table). Use the students table: id, name, course, year.',
        starter: 'def all_names(db):\n    # run a SELECT and return a list of names\n    return []\n',
        check: SETUP + 'assert all_names(db) == ["Asha", "Juma", "Neema", "Baraka", "Zuhura"], "Got " + str(all_names(db))',
        hint: 'rows = db.execute("SELECT name FROM students").fetchall() gives tuples such as ("Asha",). Take row[0] from each.',
        solution: 'def all_names(db):\n    rows = db.execute("SELECT name FROM students").fetchall()\n    return [row[0] for row in rows]\n',
      },
    }),

  L('sqlfilter', 'SQL: WHERE, ORDER BY and patterns', 'Chuja safu kwa sharti, panga matokeo na tafuta kwa muundo wa maandishi.',
    'List the students of Mathematics, ordered by name.',
    [
      { h: 'WHERE: keep only matching rows', p: [
        'WHERE adds a condition. Only the rows for which it is true stay in the result. Use =, <>, <, >, <=, >= to compare, and AND, OR, NOT to combine conditions. Text values go in single quotes. BETWEEN a AND b includes both ends, and IN (...) tests membership in a list.',
        'Notice that SQL uses a single = to compare, not ==.'],
        code: SETUP + `\n` + show("SELECT student_id, unit, mark FROM results WHERE mark >= 70") + `\nprint("---")\n` + show("SELECT name FROM students WHERE course = 'Statistics' AND year = 2") + `\nprint("---")\n` + show("SELECT unit, mark FROM results WHERE mark BETWEEN 60 AND 75 AND unit IN ('MAT101')"),
        explain: ['The first query keeps results of 70 or more.', 'AND needs both conditions true, so only Neema matches in the second query.', 'BETWEEN includes 60 and 75, and IN lists the allowed units.'] },
      { h: 'ORDER BY and LIKE', p: [
        'ORDER BY sorts the result: ASC (smallest first, the default) or DESC (largest first). You can sort by several columns, separated by commas. LIKE searches text with two wildcards: % means any number of characters and _ means exactly one.',
        'Combine them with LIMIT to get a "top 3".'],
        code: SETUP + `\n` + show("SELECT name FROM students WHERE name LIKE '%ma' ORDER BY name") + `\nprint("---")\n` + show("SELECT student_id, mark FROM results WHERE unit = 'STA101' ORDER BY mark DESC LIMIT 3") + `\nprint("---")\n` + show("SELECT name, year FROM students ORDER BY year DESC, name"),
        explain: ["LIKE '%ma' matches names that end with the letters ma (Juma and Neema).", 'DESC with LIMIT 3 gives the three highest STA101 marks.', 'Sorting by year first and then by name breaks ties alphabetically.'] },
      { h: 'NULL: missing values', p: [
        'NULL means the value is unknown or missing. It is not zero and not an empty string. Comparisons with NULL are never true, not even NULL = NULL, so you must write IS NULL or IS NOT NULL. Counting functions treat NULL specially, which you will see in the next lesson.',
        'Real data always has gaps, so remember to check for them.'],
        code: SETUP + `\ndb.execute("INSERT INTO students VALUES (6, 'Omari', NULL, 1)")\nprint(db.execute("SELECT name FROM students WHERE course = NULL").fetchall())\nprint(db.execute("SELECT name FROM students WHERE course IS NULL").fetchall())\nprint(db.execute("SELECT COUNT(*), COUNT(course) FROM students").fetchone())`,
        explain: ['course = NULL finds nothing, because the comparison is never true.', 'course IS NULL finds Omari, whose course is missing.', 'COUNT(*) counts all rows (6) while COUNT(course) skips the NULL (5).'] },
    ], {
      mistakes: ['Writing == instead of = in SQL.', 'Forgetting quotes around text values: WHERE course = Statistics.', 'Using = NULL instead of IS NULL.', 'Putting ORDER BY before WHERE; the order is SELECT, FROM, WHERE, ORDER BY, LIMIT.'],
      exercises: [
        { q: 'Print the names of students in year 2.', a: SETUP + 'print(db.execute("SELECT name FROM students WHERE year = 2").fetchall())' },
        { q: 'Print the marks of MAT101 from highest to lowest.', a: SETUP + 'print(db.execute("SELECT mark FROM results WHERE unit = \'MAT101\' ORDER BY mark DESC").fetchall())' },
        { q: 'Print the names that start with the letter J or Z using OR and LIKE.', a: SETUP + 'print(db.execute("SELECT name FROM students WHERE name LIKE \'J%\' OR name LIKE \'Z%\'").fetchall())' },
      ],
      quiz: [
        { q: 'How do you test for a missing value?', options: ['= NULL', '== NULL', 'IS NULL', 'EQUALS NULL'], answer: 2, why: 'Comparisons with = NULL are never true; use IS NULL.' },
        { q: "What does LIKE 'A%' match?", options: ['Text that ends with A', 'Text that starts with A', 'Text that contains only A', 'Numbers'], answer: 1, why: '% stands for any number of characters after the A.' },
        { q: 'Which keyword sorts from largest to smallest?', options: ['ASC', 'DESC', 'TOP', 'MAX'], answer: 1, why: 'DESC means descending order.' },
      ],
      challenge: {
        prompt: 'Write good_marks(db, unit, minimum) that returns a list of the marks (numbers only) of that unit that are at least minimum, from the highest to the lowest. Use a WHERE condition and ORDER BY.',
        starter: 'def good_marks(db, unit, minimum):\n    # SELECT marks of the unit that are >= minimum, highest first\n    return []\n',
        check: SETUP + 'assert good_marks(db, "MAT101", 60) == [90, 72, 70], "Got " + str(good_marks(db, "MAT101", 60))\nassert good_marks(db, "STA101", 80) == [81], "Got " + str(good_marks(db, "STA101", 80))\nassert good_marks(db, "STA101", 99) == [], "No marks should match 99"',
        hint: 'Use placeholders: db.execute("SELECT mark FROM results WHERE unit = ? AND mark >= ? ORDER BY mark DESC", (unit, minimum)).',
        solution: 'def good_marks(db, unit, minimum):\n    rows = db.execute("SELECT mark FROM results WHERE unit = ? AND mark >= ? ORDER BY mark DESC", (unit, minimum)).fetchall()\n    return [r[0] for r in rows]\n',
      },
    }),

  L('sqlgroup', 'SQL: counting, averages and GROUP BY', 'Jumlisha data: COUNT, AVG, MAX, na kupanga kwa makundi na GROUP BY.',
    'Find the average mark of each unit.',
    [
      { h: 'Aggregate functions', p: [
        'Aggregate functions turn many rows into one value: COUNT, SUM, AVG, MIN and MAX. They are the SQL version of the statistics you learned earlier. ROUND(value, 1) tidies a long decimal.',
        'COUNT(*) counts rows, while COUNT(column) counts only the rows where that column is not NULL.'],
        code: SETUP + `\n` + show("SELECT COUNT(*), MIN(mark), MAX(mark), ROUND(AVG(mark), 1) FROM results"),
        explain: ['One row comes back: the number of results, the lowest mark, the highest mark and the average.', 'ROUND(AVG(mark), 1) rounds the average to one decimal place.', 'Without GROUP BY, the aggregate covers the whole table.'] },
      { h: 'GROUP BY: one answer per group', p: [
        'GROUP BY splits the rows into groups that share a value and applies the aggregate to each group. For example, the average mark per unit, or the number of students per course. Every column in SELECT must either be in GROUP BY or inside an aggregate function.',
        'Add ORDER BY to rank the groups.'],
        code: SETUP + `\n` + show("SELECT unit, COUNT(*) AS n, ROUND(AVG(mark), 1) AS average FROM results GROUP BY unit") + `\nprint("---")\n` + show("SELECT course, COUNT(*) FROM students GROUP BY course ORDER BY COUNT(*) DESC, course"),
        explain: ['Each unit gets one line with its number of results and its average.', 'The second query counts students per course and puts the biggest course first.', 'AS gives the computed columns readable names.'] },
      { h: 'HAVING: filtering the groups', p: [
        'WHERE filters rows before grouping. HAVING filters the groups after they are formed, so it is the place to use aggregate values, for example "students whose average is above 70". The full order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.',
        'A good habit is to read a query in the order the database does: first FROM, then WHERE, then GROUP BY, then HAVING, and SELECT last.'],
        code: SETUP + `\n` + show("SELECT student_id, ROUND(AVG(mark), 1) AS average FROM results GROUP BY student_id HAVING AVG(mark) >= 70 ORDER BY average DESC"),
        explain: ['Results are grouped by student and the average of each student is computed.', 'HAVING keeps only the students whose average is at least 70.', 'The students are then listed from the highest average to the lowest.'] },
    ], {
      mistakes: ['Putting an aggregate in WHERE; use HAVING for conditions on aggregates.', 'Selecting a column that is neither in GROUP BY nor inside an aggregate.', 'Forgetting that AVG ignores NULL values.', 'Using COUNT(column) when you meant COUNT(*).'],
      exercises: [
        { q: 'Print the highest mark in the results table.', a: SETUP + 'print(db.execute("SELECT MAX(mark) FROM results").fetchone()[0])' },
        { q: 'Print the number of students in each year, as (year, count) rows.', a: SETUP + 'print(db.execute("SELECT year, COUNT(*) FROM students GROUP BY year ORDER BY year").fetchall())' },
        { q: 'Print the average mark of the unit STA101 rounded to 1 decimal.', a: SETUP + 'print(db.execute("SELECT ROUND(AVG(mark), 1) FROM results WHERE unit = \'STA101\'").fetchone()[0])' },
      ],
      quiz: [
        { q: 'Which clause filters groups after GROUP BY?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1, why: 'HAVING works on groups and can use aggregates; WHERE works on single rows.' },
        { q: 'What does COUNT(*) count?', options: ['Only non-NULL values of one column', 'All rows', 'Distinct values only', 'Columns'], answer: 1, why: 'COUNT(*) counts rows, whatever their values.' },
        { q: 'What does GROUP BY unit do?', options: ['Sorts by unit', 'Makes one result per unit', 'Deletes duplicates in the table', 'Joins two tables'], answer: 1, why: 'The rows are put into groups, one per distinct unit.' },
      ],
      challenge: {
        prompt: 'Write unit_averages(db) that returns a dictionary mapping each unit to its average mark rounded to 1 decimal, for example {"MAT101": 67.0}. Use GROUP BY in SQL.',
        starter: 'def unit_averages(db):\n    # SELECT unit and the average, grouped by unit\n    return {}\n',
        check: SETUP + 'r = unit_averages(db)\nassert r == {"MAT101": 67.0, "STA101": 72.5}, "Got " + str(r)',
        hint: 'rows = db.execute("SELECT unit, ROUND(AVG(mark), 1) FROM results GROUP BY unit").fetchall(); then dict(rows).',
        solution: 'def unit_averages(db):\n    rows = db.execute("SELECT unit, ROUND(AVG(mark), 1) FROM results GROUP BY unit").fetchall()\n    return dict(rows)\n',
      },
    }),

  L('sqljoin', 'SQL: joining tables', 'Unganisha majedwali mawili kwa nguzo inayofanana ili kupata picha kamili.',
    'List each student name next to their marks.',
    [
      { h: 'Why several tables?', p: [
        'Good databases do not repeat information. The student name is stored once in students, and results refer to the student by id. This avoids mistakes: if a name changes, you change one row. The link between tables is a foreign key: results.student_id points to students.id.',
        'To see names and marks together you JOIN the tables.'],
        code: SETUP + `\n` + show("SELECT students.name, results.unit, results.mark FROM students JOIN results ON results.student_id = students.id ORDER BY students.name, results.unit"),
        explain: ['JOIN ... ON matches each result to the student with the same id.', 'Writing students.name tells SQL which table a column comes from.', 'Baraka appears once, because he has only one result.'] },
      { h: 'Aliases and LEFT JOIN', p: [
        'Long table names make queries heavy to read, so give them short aliases: FROM students s JOIN results r. A normal JOIN (inner join) keeps only the rows that have a match on both sides. A LEFT JOIN keeps every row of the left table, even without a match, and fills the missing side with NULL. It answers questions like "who has no result yet?".',
        'Let us add a new student who has no results.'],
        code: SETUP + `\ndb.execute("INSERT INTO students VALUES (6, 'Omari', 'Statistics', 1)")\nprint(db.execute("SELECT s.name, r.mark FROM students s LEFT JOIN results r ON r.student_id = s.id WHERE s.id >= 5 ORDER BY s.name, r.mark").fetchall())\nprint(db.execute("SELECT s.name FROM students s LEFT JOIN results r ON r.student_id = s.id WHERE r.mark IS NULL").fetchall())`,
        explain: ['The first query shows Omari with the mark None (NULL), because he has no results.', 'The second query finds students without any result: the rows where the right side is NULL.', 'Aliases s and r keep the query short.'] },
      { h: 'Join and group together', p: [
        'Joins and aggregates combine well. To find the average mark of every student with the name visible, join first and then group. You can also group by course to compare departments.',
        'Think in two steps: first make the wide table you need with JOIN, then summarise it with GROUP BY.'],
        code: SETUP + `\n` + show("SELECT s.name, ROUND(AVG(r.mark), 1) AS average FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.id ORDER BY average DESC") + `\nprint("---")\n` + show("SELECT s.course, ROUND(AVG(r.mark), 1) FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.course ORDER BY s.course"),
        explain: ['The join gives one row per result with the name next to it; GROUP BY then makes one row per student.', 'Neema has the highest average, and Baraka the lowest.', 'Grouping by course compares the average of each department.'] },
    ], {
      mistakes: ['Forgetting the ON condition, which pairs every row with every row (a cross join).', 'Writing an ambiguous column name like id when both tables have it.', 'Using JOIN when you needed LEFT JOIN, so rows without a match disappear.', 'Grouping by name instead of id when two people share a name.'],
      exercises: [
        { q: 'Print (name, mark) for all MAT101 results, ordered by mark descending.', a: SETUP + 'print(db.execute("SELECT s.name, r.mark FROM students s JOIN results r ON r.student_id = s.id WHERE r.unit = \'MAT101\' ORDER BY r.mark DESC").fetchall())' },
        { q: 'Print how many results each student name has, as (name, count).', a: SETUP + 'print(db.execute("SELECT s.name, COUNT(*) FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.id ORDER BY s.name").fetchall())' },
        { q: 'Print the names of the students who got at least 80 in any unit.', a: SETUP + 'print(db.execute("SELECT DISTINCT s.name FROM students s JOIN results r ON r.student_id = s.id WHERE r.mark >= 80 ORDER BY s.name").fetchall())' },
      ],
      quiz: [
        { q: 'What is a foreign key?', options: ['A column that links to the primary key of another table', 'A secret password', 'The first column', 'A sorted column'], answer: 0, why: 'A foreign key refers to a row in another table.' },
        { q: 'Which join keeps rows even if there is no match on the right?', options: ['JOIN', 'INNER JOIN', 'LEFT JOIN', 'GROUP BY'], answer: 2, why: 'LEFT JOIN keeps all rows of the left table and fills the missing side with NULL.' },
        { q: 'What happens if you forget the ON condition?', options: ['An error always', 'Every row is paired with every row', 'Nothing is returned', 'Only the first row is used'], answer: 1, why: 'Without a condition the tables are combined in every possible way.' },
      ],
      challenge: {
        prompt: 'Write best_in_unit(db, unit) that returns the name of the student with the highest mark in that unit (a string). Join students and results.',
        starter: 'def best_in_unit(db, unit):\n    # join students and results, order by mark, take the first\n    return ""\n',
        check: SETUP + 'assert best_in_unit(db, "MAT101") == "Neema", "Got " + str(best_in_unit(db, "MAT101"))\nassert best_in_unit(db, "STA101") == "Asha", "Got " + str(best_in_unit(db, "STA101"))',
        hint: 'SELECT s.name FROM students s JOIN results r ON r.student_id = s.id WHERE r.unit = ? ORDER BY r.mark DESC LIMIT 1',
        solution: 'def best_in_unit(db, unit):\n    row = db.execute("SELECT s.name FROM students s JOIN results r ON r.student_id = s.id WHERE r.unit = ? ORDER BY r.mark DESC LIMIT 1", (unit,)).fetchone()\n    return row[0] if row else ""\n',
      },
    }),

  L('sqlchange', 'SQL: INSERT, UPDATE, DELETE and safe queries', 'Badilisha data kwa usalama: INSERT, UPDATE, DELETE, commit na alama ya ? dhidi ya SQL injection.',
    'Insert a new student and then update their year.',
    [
      { h: 'Adding, changing and removing rows', p: [
        'INSERT INTO adds a row, UPDATE changes existing rows and DELETE removes rows. UPDATE and DELETE should almost always have a WHERE condition: without it they affect every row in the table. A good habit is to run the same WHERE with SELECT first, to see which rows would be affected.',
        'cursor.rowcount tells you how many rows were changed.'],
        code: SETUP + `\ndb.execute("INSERT INTO students (id, name, course, year) VALUES (6, 'Omari', 'Statistics', 1)")\ncur = db.execute("UPDATE students SET year = 2 WHERE name = 'Omari'")\nprint("updated rows:", cur.rowcount)\ncur = db.execute("DELETE FROM results WHERE mark < 50")\nprint("deleted rows:", cur.rowcount)\nprint(db.execute("SELECT name, year FROM students WHERE id = 6").fetchall())`,
        explain: ['INSERT can name the columns, which is safer than relying on their order.', 'UPDATE ... SET year = 2 WHERE ... changes only Omari.', 'rowcount shows that one result below 50 (Baraka\'s 45) was deleted.'] },
      { h: 'Placeholders: never build SQL from user text', p: [
        'Never put user input directly into an SQL string with + or f-strings. Someone could type text that changes your query, which is called SQL injection and is one of the most common ways websites are broken into. Use placeholders: write ? in the query and pass the values as a tuple. The database then treats them as plain data, never as SQL.',
        'This is also easier: you do not have to add quotes around text.'],
        code: SETUP + `\nname = "x'; DROP TABLE students; --"\n# unsafe would be: "SELECT * FROM students WHERE name = '" + name + "'"\nprint(db.execute("SELECT * FROM students WHERE name = ?", (name,)).fetchall())\nprint(db.execute("SELECT COUNT(*) FROM students").fetchone()[0], "students are still there")\n\nnew = [(7, "Fatma", "Statistics", 1), (8, "Hassan", "Mathematics", 1)]\ndb.executemany("INSERT INTO students VALUES (?, ?, ?, ?)", new)\nprint(db.execute("SELECT COUNT(*) FROM students").fetchone()[0])`,
        explain: ['The harmful-looking text is treated as an ordinary name, so nothing matches and nothing is dropped.', 'executemany runs one query with many sets of values.', 'The count shows the table is intact and now has the two new students.'] },
      { h: 'Transactions: commit and rollback, and constraints', p: [
        'Changes are grouped in a transaction. db.commit() makes them permanent in a file database; db.rollback() cancels everything since the last commit. This is how a bank moves money: either both steps happen or neither does. Constraints such as NOT NULL, UNIQUE and PRIMARY KEY make the database refuse bad data, raising sqlite3.IntegrityError.',
        'Catch the error with try/except and give the user a clear message.'],
        code: SETUP + `\ndb.commit()\ndb.execute("DELETE FROM results")\nprint("after delete:", db.execute("SELECT COUNT(*) FROM results").fetchone()[0])\ndb.rollback()\nprint("after rollback:", db.execute("SELECT COUNT(*) FROM results").fetchone()[0])\n\ntry:\n    db.execute("INSERT INTO students VALUES (1, 'Copy', 'Statistics', 1)")\nexcept sqlite3.IntegrityError as error:\n    print("Refused:", error)`,
        explain: ['rollback() undid the DELETE, so the nine results are back.', 'The second INSERT breaks the PRIMARY KEY rule because id 1 already exists.', 'IntegrityError is raised, and the except block shows the reason instead of crashing the program.'] },
    ], {
      mistakes: ['Running UPDATE or DELETE without WHERE and changing every row.', 'Building SQL text with + or f-strings from user input (SQL injection).', 'Forgetting db.commit() on a file database, so changes are lost.', 'Ignoring IntegrityError instead of handling it.'],
      exercises: [
        { q: 'Insert a student (6, "Rehema", "Statistics", 1) with placeholders and print the student count.', a: SETUP + 'db.execute("INSERT INTO students VALUES (?, ?, ?, ?)", (6, "Rehema", "Statistics", 1))\nprint(db.execute("SELECT COUNT(*) FROM students").fetchone()[0])' },
        { q: 'Raise every MAT101 mark by 5 and print the new MAT101 marks in order.', a: SETUP + 'db.execute("UPDATE results SET mark = mark + 5 WHERE unit = \'MAT101\'")\nprint(db.execute("SELECT mark FROM results WHERE unit = \'MAT101\' ORDER BY mark").fetchall())' },
        { q: 'Delete the student with id 5 and print how many students are left.', a: SETUP + 'db.execute("DELETE FROM students WHERE id = 5")\nprint(db.execute("SELECT COUNT(*) FROM students").fetchone()[0])' },
      ],
      quiz: [
        { q: 'What happens with UPDATE students SET year = 1 (no WHERE)?', options: ['Nothing', 'Every row is changed', 'Only the first row changes', 'An error is raised'], answer: 1, why: 'Without WHERE the change applies to all rows.' },
        { q: 'Why use ? placeholders?', options: ['They are faster to type', 'They stop user input from being run as SQL', 'They sort the data', 'They are required for SELECT *'], answer: 1, why: 'Values passed separately cannot change the structure of the query.' },
        { q: 'What does rollback() do?', options: ['Saves changes', 'Cancels changes since the last commit', 'Deletes the table', 'Closes the program'], answer: 1, why: 'A rollback returns the database to the state of the last commit.' },
      ],
      challenge: {
        prompt: 'Write add_result(db, student_id, unit, mark) that inserts a row into results using placeholders and returns True. If the mark is not between 0 and 100, do not insert anything and return False.',
        starter: 'def add_result(db, student_id, unit, mark):\n    # validate the mark, then INSERT with placeholders\n    return False\n',
        check: SETUP + 'assert add_result(db, 4, "STA101", 55) is True, "A valid mark should return True"\nassert db.execute("SELECT mark FROM results WHERE student_id = 4 AND unit = \'STA101\'").fetchall() == [(55,)], "The row was not inserted"\nassert add_result(db, 4, "PHY101", 120) is False, "120 is not a valid mark"\nassert db.execute("SELECT COUNT(*) FROM results WHERE unit = \'PHY101\'").fetchone()[0] == 0, "An invalid mark must not be inserted"',
        hint: 'if not 0 <= mark <= 100: return False. Then db.execute("INSERT INTO results VALUES (?, ?, ?)", (student_id, unit, mark)) and return True.',
        solution: 'def add_result(db, student_id, unit, mark):\n    if not 0 <= mark <= 100:\n        return False\n    db.execute("INSERT INTO results VALUES (?, ?, ?)", (student_id, unit, mark))\n    return True\n',
      },
    }),

  L('sqlproject', 'SQL project: a results report', 'Mradi mdogo: ripoti ya matokeo ya wanafunzi kwa SQL na Python pamoja.',
    'Print a ranked report of students by average mark.',
    [
      { h: 'The plan', p: [
        'A department wants a report: each student with their average mark and a grade, ranked from best to worst, plus the pass rate per unit. The data is in two tables, so we will join them; the summaries need GROUP BY; and Python formats the final text. This is the typical way SQL and Python work together: SQL selects and summarises, Python decides how to present.',
        'Grade rule used here: 70 and above is A, 60 and above is B, 50 and above is C, below 50 is F.'],
        code: SETUP + `\ndef grade(avg):\n    if avg >= 70:\n        return "A"\n    if avg >= 60:\n        return "B"\n    if avg >= 50:\n        return "C"\n    return "F"\n\nprint(grade(72), grade(65.5), grade(49))`,
        explain: ['The grade function is plain Python and has nothing to do with SQL.', 'Keeping rules like this in Python makes them easy to change and to test.', 'The setup code creates the same students and results tables as before.'] },
      { h: 'Ranked student report', p: [
        'First the SQL gives one row per student with the average. Then Python loops over the rows, adds the rank and the grade, and prints aligned text with f-string formatting. ljust and the format specifier :>5.1f line the columns up.',
        'Because the heavy work is done by the database, the Python part stays short.'],
        code: SETUP + `\ndef grade(avg):\n    return "A" if avg >= 70 else "B" if avg >= 60 else "C" if avg >= 50 else "F"\n\nrows = db.execute("SELECT s.name, AVG(r.mark) AS average FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.id ORDER BY average DESC, s.name").fetchall()\nprint("Rank  Name      Average  Grade")\nfor rank, (name, average) in enumerate(rows, start=1):\n    print(f"{rank:<5} {name:<9} {average:>7.1f}  {grade(average)}")`,
        explain: ['The SQL joins, groups by student and sorts by average from best to worst.', 'enumerate(rows, start=1) gives the rank, and the tuple (name, average) is unpacked in the for line.', 'The f-string codes align the columns: < is left, > is right, .1f is one decimal.'] },
      { h: 'Pass rate per unit', p: [
        'A second summary: for each unit, how many students sat it and what percentage passed (mark of 50 or more). In SQL a condition such as mark >= 50 is 1 when true and 0 when false, so SUM(mark >= 50) counts the passes. Dividing by COUNT(*) gives the pass rate.',
        'Always think about what a number means: with only a handful of students these rates are not reliable, so treat them as an illustration of the technique.'],
        code: SETUP + `\nquery = """\nSELECT unit,\n       COUNT(*) AS sat,\n       SUM(mark >= 50) AS passed,\n       ROUND(100.0 * SUM(mark >= 50) / COUNT(*), 1) AS pass_rate\nFROM results\nGROUP BY unit\nORDER BY unit\n"""\nfor unit, sat, passed, rate in db.execute(query):\n    print(unit, "sat:", sat, "passed:", passed, "pass rate:", rate, "%")`,
        explain: ['SUM(mark >= 50) adds 1 for every pass.', 'Multiplying by 100.0 (a decimal) avoids whole-number division.', 'A triple-quoted string lets you write a long query over several lines.'] },
    ], {
      mistakes: ['Dividing two whole numbers in SQL and getting 0: use 100.0 to force decimals.', 'Doing in Python what one SQL query can do, such as sorting thousands of rows by hand.', 'Mixing the presentation (format) into the SQL; keep SQL for data and Python for display.', 'Drawing strong conclusions from tiny tables.'],
      exercises: [
        { q: 'Print the name of the student with the highest single mark in any unit.', a: SETUP + 'print(db.execute("SELECT s.name FROM students s JOIN results r ON r.student_id = s.id ORDER BY r.mark DESC LIMIT 1").fetchone()[0])' },
        { q: 'Print how many marks are 70 or above using SUM(mark >= 70).', a: SETUP + 'print(db.execute("SELECT SUM(mark >= 70) FROM results").fetchone()[0])' },
        { q: 'Print each course with the number of results of its students, as (course, results).', a: SETUP + 'print(db.execute("SELECT s.course, COUNT(*) FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.course ORDER BY s.course").fetchall())' },
      ],
      quiz: [
        { q: 'Why multiply by 100.0 instead of 100 in the pass-rate query?', options: ['To make the query faster', 'To avoid whole-number division', 'Because 100 is not allowed', 'To sort the result'], answer: 1, why: 'Dividing whole numbers in SQLite gives a whole number, which would round the rate down.' },
        { q: 'What does SUM(mark >= 50) count?', options: ['The sum of the marks', 'The number of rows where the condition is true', 'The number of units', 'The average'], answer: 1, why: 'The condition is 1 for true and 0 for false, so the sum counts the true cases.' },
        { q: 'Where should the grade rules live?', options: ['Only inside the SQL text', 'In a Python function that is easy to test', 'In the table definition', 'Nowhere'], answer: 1, why: 'Keeping rules in a function makes them easy to read, change and test.' },
      ],
      challenge: {
        prompt: 'Write top_students(db, n) that returns a list of the names of the n students with the highest average mark, from the best to the worst. Use one SQL query with a JOIN, GROUP BY, ORDER BY and LIMIT.',
        starter: 'def top_students(db, n):\n    # return the names of the n best students by average mark\n    return []\n',
        check: SETUP + 'assert top_students(db, 2) == ["Neema", "Asha"], "Got " + str(top_students(db, 2))\nassert top_students(db, 1) == ["Neema"], "Got " + str(top_students(db, 1))\nassert top_students(db, 10)[-1] == "Baraka", "The lowest average is Baraka"',
        hint: 'SELECT s.name FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.id ORDER BY AVG(r.mark) DESC LIMIT ?',
        solution: 'def top_students(db, n):\n    rows = db.execute("SELECT s.name FROM students s JOIN results r ON r.student_id = s.id GROUP BY s.id ORDER BY AVG(r.mark) DESC LIMIT ?", (n,)).fetchall()\n    return [r[0] for r in rows]\n',
      },
    }),
];
