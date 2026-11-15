import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Chapter 11: Testing your code. The tiny run() helper keeps results short and the same in the VENUE editor and on a computer. */
const RUN = `import io, unittest\n\ndef run(*cases):\n    """Helper for the VENUE editor: run test classes and print a short summary."""\n    suite = unittest.TestSuite(unittest.defaultTestLoader.loadTestsFromTestCase(c) for c in cases)\n    r = unittest.TextTestRunner(stream=io.StringIO()).run(suite)\n    print(f"ran {r.testsRun}, passed {r.testsRun - len(r.failures) - len(r.errors)}, failed {len(r.failures)}, errors {len(r.errors)}")\n    for _, tb in r.failures + r.errors:\n        print(tb.strip().splitlines()[-1])\n`;

export const PYTHON_TESTING: LearnLesson[] = [
  L('tunit', 'Why test, and your first unit test', 'Test ni code inayothibitisha kuwa code yako inafanya kazi; unittest ni zana ya Python ya kuandika majaribio.',
    'Write a function double(n) and a test class with two tests for it.',
    [
      { h: 'Why do programmers write tests?', p: [
        'When you write a function you check it by running it once and looking at the result. That works for a small program, but a real program has hundreds of functions and you change them often. Each change might break something that worked yesterday, and checking everything by hand is slow and unreliable.',
        'A test is a small piece of code that calls your function with known inputs and checks that the answer is what you expect. You write it once, and from then on the computer can run all your tests in a second. When all tests pass you can change code with confidence. When one fails, it tells you exactly which behaviour broke.',
        'Professional teams treat tests as part of the program. Learning to write them early makes you a better programmer, because you also start to think about edge cases: empty lists, zero, negative numbers, wrong types.'] },
      { h: 'The simplest test: assert', p: [
        'The assert statement checks that a condition is true. If it is false, Python raises AssertionError. You can add a message after a comma. Silence means success; an error means the test failed.'],
        code: `def double(n):\n    return n * 2\n\nassert double(4) == 8\nassert double(0) == 0\nassert double(-3) == -6, "negative numbers must work"\nprint("all assertions passed")`,
        explain: ['Each assert line states one fact about the function. If a statement were false Python would stop right there with AssertionError.', 'The third assert has a message. If double(-3) were wrong, the message would appear in the error.', 'All three facts are true, so the program reaches the last line and prints the success message.'] },
      { h: 'A test class with unittest', p: [
        'The standard library has a testing framework called unittest. You create a class that inherits from unittest.TestCase. Every method whose name starts with test_ is one test. Inside it you call assertion methods such as self.assertEqual(actual, expected).',
        'In a real project you put the tests in a file named test_something.py and run them with python -m unittest, or end the file with unittest.main(). In the VENUE editor we use a small helper called run() that is shown at the top of each example; you can ignore its inside.'],
        code: `${RUN}\ndef double(n):\n    return n * 2\n\nclass TestDouble(unittest.TestCase):\n    def test_positive(self):\n        self.assertEqual(double(4), 8)\n\n    def test_zero(self):\n        self.assertEqual(double(0), 0)\n\n    def test_negative(self):\n        self.assertEqual(double(-3), -6)\n\nrun(TestDouble)`,
        explain: ['TestDouble inherits from unittest.TestCase, so unittest knows these methods are tests.', 'Each test_ method checks one situation. Good tests are small and have names that say what they check.', 'assertEqual(a, b) passes when a equals b.', 'run(TestDouble) runs all three tests. They all pass, so the summary says ran 3, passed 3, failed 0, errors 0.'] },
      { h: 'What a failing test looks like', p: [
        'The real value of tests appears when something is wrong. Here the function has a bug: it adds 2 instead of multiplying. The tests catch it, and the failure message shows both values.'],
        code: `${RUN}\ndef double(n):\n    return n + 2          # bug!\n\nclass TestDouble(unittest.TestCase):\n    def test_four(self):\n        self.assertEqual(double(4), 8)\n\n    def test_two(self):\n        self.assertEqual(double(2), 4)\n\nrun(TestDouble)`,
        explain: ['double(4) returns 6 instead of 8, so test_four fails and reports AssertionError: 6 != 8.', 'double(2) happens to return 4 (2 + 2 equals 2 * 2), so this test passes by luck. That is why one example is never enough: choose inputs that can expose a bug.', 'The summary shows 1 passed and 1 failed. Read the failure line from left to right: the first number is the actual result, the second is the expected value.'] },
    ],
    {
      mistakes: [
        'Naming a test method without the test_ prefix. unittest silently ignores it.',
        'Testing with one example only. Use ordinary, edge and wrong inputs.',
        'Swapping actual and expected values in assertEqual, which makes the failure message confusing.',
        'Writing tests that depend on each other. Each test should work alone.',
        'Changing the test to make it pass when the real function is wrong.',
      ],
      exercises: [
        { q: 'Write a function is_even(n) and three assert statements: 4, 7 and 0.', a: `def is_even(n):\n    return n % 2 == 0\n\nassert is_even(4)\nassert not is_even(7)\nassert is_even(0)\nprint("ok")` },
        { q: 'Write square(n) and a TestCase with two tests, then run it with the helper.', a: `${RUN}\ndef square(n):\n    return n * n\n\nclass TestSquare(unittest.TestCase):\n    def test_positive(self):\n        self.assertEqual(square(5), 25)\n\n    def test_negative(self):\n        self.assertEqual(square(-5), 25)\n\nrun(TestSquare)` },
      ],
      quiz: [
        { q: 'What happens when an assert condition is false?', options: ['Nothing', 'AssertionError is raised', 'The program prints False', 'The function returns None'], answer: 1, why: 'assert raises AssertionError when its condition is false.' },
        { q: 'Which method name will unittest run as a test?', options: ['check_add', 'add_test', 'test_add', 'TestAdd'], answer: 2, why: 'Test methods must start with test_.' },
        { q: 'Why is one passing example not enough?', options: ['Python demands three', 'A buggy function can pass by luck', 'unittest needs two', 'It is too fast'], answer: 1, why: 'Different inputs expose different bugs; choose edge cases too.' },
      ],
      challenge: {
        prompt: 'The function triple(n) below has a bug. Fix it so that it returns n times three.',
        starter: 'def triple(n):\n    return n + 3\n',
        check: 'assert triple(2) == 6, "triple(2) should be 6"\nassert triple(0) == 0, "triple(0) should be 0"\nassert triple(-4) == -12, "triple(-4) should be -12"',
        hint: 'Use multiplication: n * 3',
        solution: 'def triple(n):\n    return n * 3\n\nprint(triple(2), triple(-4))',
      },
    }),

  L('tassert', 'Assertion methods and what to test', 'Njia mbalimbali za kuthibitisha: assertEqual, assertTrue, assertIn, assertRaises na kuchagua test cases nzuri.',
    'Write tests for a function clamp(x, low, high) that limits x to the range low..high.',
    [
      { h: 'The assertion methods', p: [
        'TestCase has many assert methods. Choose the one that says exactly what you mean, because it also produces the clearest failure message.',
        'assertEqual(a, b) and assertNotEqual(a, b) compare values. assertTrue(x) and assertFalse(x) check truth. assertIn(item, container) checks membership. assertIsNone(x) checks for None. assertAlmostEqual(a, b, places=2) compares decimal numbers that may have tiny rounding differences. assertRaises(ErrorType) checks that an exception is raised.'],
        code: `${RUN}\nclass TestMethods(unittest.TestCase):\n    def test_equal(self):\n        self.assertEqual("py".upper(), "PY")\n\n    def test_true_false(self):\n        self.assertTrue(5 > 3)\n        self.assertFalse("a" in "xyz")\n\n    def test_in(self):\n        self.assertIn("Asha", ["Asha", "Juma"])\n\n    def test_none(self):\n        self.assertIsNone({}.get("missing"))\n\n    def test_almost(self):\n        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=7)\n\nrun(TestMethods)`,
        explain: ['Each test uses a different assert method; all five tests pass.', 'assertAlmostEqual is needed because 0.1 + 0.2 equals 0.30000000000000004 in floating point. Comparing with == would fail.', 'dict.get returns None for a missing key, which assertIsNone confirms.'] },
      { h: 'Testing that errors happen', p: [
        'Sometimes the correct behaviour is to raise an exception. Use assertRaises as a context manager with a with block: the test passes only if the code inside raises the named error.'],
        code: `${RUN}\ndef set_mark(mark):\n    if not 0 <= mark <= 100:\n        raise ValueError("mark must be between 0 and 100")\n    return mark\n\nclass TestSetMark(unittest.TestCase):\n    def test_valid(self):\n        self.assertEqual(set_mark(75), 75)\n\n    def test_too_high(self):\n        with self.assertRaises(ValueError):\n            set_mark(150)\n\n    def test_negative(self):\n        with self.assertRaises(ValueError):\n            set_mark(-1)\n\n    def test_edges(self):\n        self.assertEqual(set_mark(0), 0)\n        self.assertEqual(set_mark(100), 100)\n\nrun(TestSetMark)`,
        explain: ['test_too_high passes because set_mark(150) really raises ValueError inside the with block.', 'If no error were raised, the test would fail with a message that the exception was not raised.', 'test_edges checks the boundary values 0 and 100. Boundaries are where bugs like < versus <= hide.'] },
      { h: 'What to test', p: [
        'Choose inputs from three groups. Normal cases are typical inputs. Edge cases are the boundaries: zero, the smallest and largest allowed values, an empty list, one item. Error cases are inputs that must be rejected.',
        'Test one idea per test method and give each a name that tells the story, such as test_empty_list_returns_zero. When it fails, the name alone tells you what broke.'],
        code: `${RUN}\ndef average(numbers):\n    if not numbers:\n        return 0\n    return sum(numbers) / len(numbers)\n\nclass TestAverage(unittest.TestCase):\n    def test_normal(self):\n        self.assertEqual(average([2, 4, 6]), 4)\n\n    def test_single_item(self):\n        self.assertEqual(average([10]), 10)\n\n    def test_empty_list_returns_zero(self):\n        self.assertEqual(average([]), 0)\n\n    def test_negative_numbers(self):\n        self.assertEqual(average([-2, 2]), 0)\n\n    def test_decimals(self):\n        self.assertAlmostEqual(average([0.1, 0.2]), 0.15)\n\nrun(TestAverage)`,
        explain: ['The five tests cover a normal list, one item, an empty list, negatives that cancel out, and decimals.', 'Without the empty-list test we might never notice that dividing by len([]) crashes; the function guards against it.', 'All five pass, so the summary reports 5 passed.'] },
      { h: 'Several inputs with subTest', p: [
        'When you want to check many input and output pairs, a loop with self.subTest keeps the test short. If one pair fails, the report tells you which one, and the other pairs still run.'],
        code: `${RUN}\ndef grade(mark):\n    if mark >= 70: return "A"\n    if mark >= 60: return "B"\n    if mark >= 50: return "C"\n    if mark >= 40: return "D"\n    return "F"\n\nclass TestGrade(unittest.TestCase):\n    def test_table(self):\n        cases = [(100, "A"), (70, "A"), (69, "B"), (60, "B"), (59, "C"), (50, "C"), (49, "D"), (40, "D"), (39, "F"), (0, "F")]\n        for mark, expected in cases:\n            with self.subTest(mark=mark):\n                self.assertEqual(grade(mark), expected)\n\nrun(TestGrade)`,
        explain: ['The list of pairs holds the boundary marks on both sides of every cut-off: 70 and 69, 60 and 59, and so on.', 'subTest labels each pair, so a failure would name the exact mark that went wrong.', 'The boundary pairs prove that >= was used correctly. All ten pairs pass; the summary counts the whole table as one test.'] },
    ],
    {
      mistakes: [
        'Using assertEqual for decimals instead of assertAlmostEqual.',
        'Forgetting the with in with self.assertRaises(...): the error is then raised outside and the test crashes.',
        'Testing only the happy path and ignoring empty input and boundaries.',
        'Several unrelated checks in one test, so you cannot tell what failed.',
      ],
      exercises: [
        { q: 'Write tests for is_palindrome(text) with a palindrome, a non-palindrome and an empty string.', a: `${RUN}\ndef is_palindrome(text):\n    return text == text[::-1]\n\nclass TestPal(unittest.TestCase):\n    def test_yes(self):\n        self.assertTrue(is_palindrome("level"))\n\n    def test_no(self):\n        self.assertFalse(is_palindrome("python"))\n\n    def test_empty(self):\n        self.assertTrue(is_palindrome(""))\n\nrun(TestPal)` },
        { q: 'Test that int("abc") raises ValueError.', a: `${RUN}\nclass TestInt(unittest.TestCase):\n    def test_bad(self):\n        with self.assertRaises(ValueError):\n            int("abc")\n\nrun(TestInt)` },
      ],
      quiz: [
        { q: 'Which assert is best for 0.1 + 0.2 versus 0.3?', options: ['assertEqual', 'assertAlmostEqual', 'assertTrue', 'assertIn'], answer: 1, why: 'Floating point numbers can differ by tiny amounts; assertAlmostEqual allows that.' },
        { q: 'How do you check that a function raises ValueError?', options: ['assertEqual(f(), ValueError)', 'with self.assertRaises(ValueError):', 'try only', 'assertNone'], answer: 1, why: 'assertRaises used in a with block passes only when the exception occurs.' },
        { q: 'What are edge cases?', options: ['Typical values', 'Boundary or extreme values', 'Spelling mistakes', 'Comments'], answer: 1, why: 'Edge cases are at the limits: zero, empty, first, last, maximum.' },
      ],
      challenge: {
        prompt: 'Write the function clamp(x, low, high) that returns low when x is below low, high when x is above high, and x otherwise.',
        starter: 'def clamp(x, low, high):\n    pass\n',
        check: 'assert clamp(5, 0, 10) == 5, "inside the range returns x"\nassert clamp(-3, 0, 10) == 0, "below the range returns low"\nassert clamp(99, 0, 10) == 10, "above the range returns high"\nassert clamp(0, 0, 10) == 0 and clamp(10, 0, 10) == 10, "the edges are allowed"',
        hint: 'return max(low, min(x, high))',
        solution: 'def clamp(x, low, high):\n    return max(low, min(x, high))\n\nprint(clamp(5, 0, 10), clamp(-3, 0, 10), clamp(99, 0, 10))',
      },
    }),

  L('tclass', 'Testing classes with setUp', 'Jaribu class: setUp hutengeneza object mpya kabla ya kila test.',
    'Test a Counter class: it starts at 0, increases with up() and never goes below 0 with down().',
    [
      { h: 'Testing a class', p: [
        'Testing a class means creating an object and checking its attributes and methods. The same ideas apply: normal use, edge cases and errors. The only new problem is that most tests need the same starting object.',
        'unittest solves this with the special method setUp. It runs before each test method and creates a fresh object, so tests never disturb each other.'],
        code: `${RUN}\nclass Wallet:\n    def __init__(self):\n        self.balance = 0\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("amount must be positive")\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            return False\n        self.balance -= amount\n        return True\n\nclass TestWallet(unittest.TestCase):\n    def setUp(self):\n        self.wallet = Wallet()\n\n    def test_starts_empty(self):\n        self.assertEqual(self.wallet.balance, 0)\n\n    def test_deposit(self):\n        self.wallet.deposit(500)\n        self.assertEqual(self.wallet.balance, 500)\n\n    def test_withdraw_ok(self):\n        self.wallet.deposit(500)\n        self.assertTrue(self.wallet.withdraw(200))\n        self.assertEqual(self.wallet.balance, 300)\n\n    def test_withdraw_too_much(self):\n        self.wallet.deposit(100)\n        self.assertFalse(self.wallet.withdraw(500))\n        self.assertEqual(self.wallet.balance, 100)\n\n    def test_bad_deposit(self):\n        with self.assertRaises(ValueError):\n            self.wallet.deposit(-5)\n\nrun(TestWallet)`,
        explain: ['setUp runs before every test method, so each test gets its own new Wallet with balance 0.', 'Because of that, test_deposit adding 500 cannot affect test_starts_empty, whatever order the tests run in.', 'test_withdraw_too_much checks two things that belong together: the method returns False and the balance did not change.', 'test_bad_deposit confirms the error case. All five tests pass.'] },
      { h: 'A failing class test: finding a real bug', p: [
        'Here a Counter class has a subtle bug: down() can go below zero. The test written for the rule "never below 0" reveals it. This is exactly the kind of bug that people miss when they only try the program by hand.'],
        code: `${RUN}\nclass Counter:\n    def __init__(self):\n        self.value = 0\n\n    def up(self):\n        self.value += 1\n\n    def down(self):\n        self.value -= 1      # bug: no check for zero\n\nclass TestCounter(unittest.TestCase):\n    def setUp(self):\n        self.c = Counter()\n\n    def test_up(self):\n        self.c.up()\n        self.c.up()\n        self.assertEqual(self.c.value, 2)\n\n    def test_never_below_zero(self):\n        self.c.down()\n        self.assertEqual(self.c.value, 0)\n\nrun(TestCounter)`,
        explain: ['test_up passes: two calls to up() give 2.', 'test_never_below_zero fails: the first down() makes the value -1 instead of 0. The message AssertionError: -1 != 0 says exactly that.', 'The fix is a single check inside down(): only subtract when value is greater than 0. After the fix both tests pass.'] },
      { h: 'tearDown and where tests live', p: [
        'tearDown runs after each test and is used to clean up, for example to delete a temporary file. Related helpers are setUpClass and tearDownClass, which run once for the whole class.',
        'In a real project you keep code and tests in separate files: calculator.py holds the code, and test_calculator.py starts with from calculator import add and holds the tests. You run all tests in a folder with the command python -m unittest in the terminal. The VENUE editor runs a single file, which is why the examples put everything in one place.'],
        code: `${RUN}\nimport os\n\nclass TestFile(unittest.TestCase):\n    def setUp(self):\n        with open("temp.txt", "w") as f:\n            f.write("hello")\n\n    def tearDown(self):\n        os.remove("temp.txt")\n\n    def test_content(self):\n        with open("temp.txt") as f:\n            self.assertEqual(f.read(), "hello")\n\n    def test_exists(self):\n        self.assertTrue(os.path.exists("temp.txt"))\n\nrun(TestFile)\nprint(os.path.exists("temp.txt"))`,
        explain: ['setUp creates a file before each test, and tearDown deletes it afterwards, so every test starts with a clean situation.', 'Both tests pass because the file exists while each test runs.', 'The last line proves the clean-up worked: after the tests the file is gone, so it prints False.'] },
    ],
    {
      mistakes: [
        'Creating the object once at the top of the file and sharing it between tests, so tests affect each other.',
        'Forgetting self. before wallet inside tests when the object is created in setUp.',
        'Writing setup instead of setUp (the capital U matters).',
        'Not testing that a failed action leaves the object unchanged.',
      ],
      exercises: [
        { q: 'Write a TestCase for a Stack class (push, pop, size) using setUp.', a: `${RUN}\nclass Stack:\n    def __init__(self):\n        self.items = []\n\n    def push(self, x):\n        self.items.append(x)\n\n    def pop(self):\n        return self.items.pop()\n\n    def size(self):\n        return len(self.items)\n\nclass TestStack(unittest.TestCase):\n    def setUp(self):\n        self.s = Stack()\n\n    def test_push(self):\n        self.s.push(1)\n        self.assertEqual(self.s.size(), 1)\n\n    def test_pop_order(self):\n        self.s.push(1)\n        self.s.push(2)\n        self.assertEqual(self.s.pop(), 2)\n\nrun(TestStack)` },
      ],
      quiz: [
        { q: 'When does setUp run?', options: ['Once at the start', 'Before every test method', 'After every test', 'Only on failure'], answer: 1, why: 'setUp runs before each test so every test has a fresh start.' },
        { q: 'What is tearDown for?', options: ['Starting tests', 'Cleaning up after each test', 'Printing results', 'Deleting the class'], answer: 1, why: 'tearDown removes temporary things the test created.' },
        { q: 'Which command runs all tests in a folder?', options: ['python test', 'python -m unittest', 'run tests', 'python --check'], answer: 1, why: 'python -m unittest discovers and runs test files.' },
      ],
      challenge: {
        prompt: 'The class Counter has a bug: down() lets the value go below zero. Fix down() so the value never becomes negative.',
        starter: 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def up(self):\n        self.value += 1\n\n    def down(self):\n        self.value -= 1\n',
        check: 'c = Counter()\nc.up(); c.up(); c.down()\nassert c.value == 1, "after up, up, down the value should be 1"\nc.down(); c.down(); c.down()\nassert c.value == 0, "the value must not go below 0, got " + str(c.value)',
        hint: 'Only subtract when self.value > 0.',
        solution: 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def up(self):\n        self.value += 1\n\n    def down(self):\n        if self.value > 0:\n            self.value -= 1\n\nc = Counter()\nc.down()\nprint(c.value)',
      },
    }),

  L('ttdd', 'Test-driven development and doctest', 'Andika test kwanza, kisha code; doctest huweka majaribio ndani ya docstring.',
    'Use test-first thinking: list five tests for a function password_ok(text) before writing it.',
    [
      { h: 'Test-driven development', p: [
        'Test-driven development (TDD) reverses the usual order. You write a test first, watch it fail, then write just enough code to make it pass, and then clean the code up. This cycle is called red, green, refactor.',
        'The benefits are real: you think clearly about what the function must do before writing it, you never forget to write tests, and every line of code exists for a reason. Many professional teams work this way.'] },
      { h: 'A TDD walk-through', p: [
        'We build password_ok(text), which must be at least 8 characters long and contain a digit. Step 1: write the tests that describe these rules. Step 2: write the function. Here the finished tests and function are shown together; in practice you would write the tests first and see them fail.'],
        code: `${RUN}\nclass TestPassword(unittest.TestCase):\n    def test_too_short(self):\n        self.assertFalse(password_ok("ab1"))\n\n    def test_no_digit(self):\n        self.assertFalse(password_ok("longpassword"))\n\n    def test_good(self):\n        self.assertTrue(password_ok("python2026"))\n\n    def test_exact_eight(self):\n        self.assertTrue(password_ok("abcdefg1"))\n\n    def test_empty(self):\n        self.assertFalse(password_ok(""))\n\ndef password_ok(text):\n    has_digit = any(ch.isdigit() for ch in text)\n    return len(text) >= 8 and has_digit\n\nrun(TestPassword)`,
        explain: ['The five tests describe the rules before the code: too short, no digit, a good password, exactly eight characters, and empty text.', 'any(ch.isdigit() for ch in text) is True when at least one character is a digit.', 'The function combines the two rules with and. All five tests pass, so the summary shows ran 5, passed 5.', 'If you later change the rules (say, require 10 characters) the tests tell you which behaviours changed.'] },
      { h: 'doctest: examples inside the docstring', p: [
        'The doctest module finds examples in docstrings that look like an interactive Python session (lines starting with >>>) and checks that the output matches. It documents the function and tests it at the same time.'],
        code: `import doctest\n\ndef add(a, b):\n    """Return the sum of a and b.\n\n    >>> add(2, 3)\n    5\n    >>> add(-1, 1)\n    0\n    """\n    return a + b\n\nresult = doctest.testmod()\nprint(result)`,
        explain: ['The two lines starting with >>> are examples; the line below each is the expected output.', 'doctest.testmod() runs every example in the module and compares the results.', 'The result shows TestResults(failed=0, attempted=2): two examples were tried and none failed.'] },
      { h: 'Habits of good testing', p: [
        'Run your tests after every small change. Keep tests fast and independent. Test behaviour, not implementation details, so you can rewrite the inside of a function without rewriting its tests.',
        'When you find a bug, first write a test that fails because of it, and then fix it. That test protects you from the same bug coming back. This is called a regression test.',
        'Larger projects often use pytest, a popular third-party tool where tests are plain functions with assert statements. Everything you learned here carries over directly.'] },
    ],
    {
      mistakes: [
        'Writing tests only after everything is finished and then adjusting them to match the code.',
        'Tests that are slow or depend on the internet, so nobody runs them.',
        'Forgetting the blank line and exact spacing in doctest output; it compares text exactly.',
        'Fixing a bug without adding a test for it.',
      ],
      exercises: [
        { q: 'Add a doctest to a function shout(text) that returns the text in capitals with an exclamation mark.', a: `import doctest\n\ndef shout(text):\n    """Return text in capitals with !\n\n    >>> shout("hello")\n    'HELLO!'\n    """\n    return text.upper() + "!"\n\nprint(doctest.testmod())` },
      ],
      quiz: [
        { q: 'What does TDD stand for?', options: ['Test-driven development', 'Type-defined data', 'Total debug design', 'Tiny dictionary data'], answer: 0, why: 'In TDD you write the test first, then the code.' },
        { q: 'What is the red-green-refactor order?', options: ['Fix, run, delete', 'Failing test, passing code, clean up', 'Code, comment, commit', 'Plan, sleep, ship'], answer: 1, why: 'Write a failing test (red), make it pass (green), then improve the code (refactor).' },
        { q: 'What is a regression test?', options: ['A test that guards against an old bug returning', 'A test for slow code', 'A test of the screen', 'A test written by a teacher'], answer: 0, why: 'You add it after fixing a bug so it cannot silently come back.' },
      ],
      challenge: {
        prompt: 'Write password_ok(text): it must return True only when the text has at least 8 characters and contains at least one digit.',
        starter: 'def password_ok(text):\n    pass\n',
        check: 'assert password_ok("python2026") is True, "python2026 is a good password"\nassert password_ok("ab1") is False, "too short"\nassert password_ok("longpassword") is False, "no digit"\nassert password_ok("abcdefg1") is True, "exactly 8 characters with a digit is fine"\nassert password_ok("") is False, "empty is not ok"',
        hint: 'return len(text) >= 8 and any(ch.isdigit() for ch in text)',
        solution: 'def password_ok(text):\n    return len(text) >= 8 and any(ch.isdigit() for ch in text)\n\nprint(password_ok("python2026"), password_ok("ab1"))',
      },
    }),
];
