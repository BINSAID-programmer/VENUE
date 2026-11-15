import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Chapter 9: Classes — one main topic, subtopics in teaching order. */
export const PYTHON_CLASSES: LearnLesson[] = [
  L('cclass', 'Creating and using a class', 'Class ni mchoro; object ni kitu halisi kilichotengenezwa kutoka kwenye mchoro huo.',
    'Create a class Book with title and pages, and a method describe() that prints a sentence about the book. Make two books.',
    [
      { h: 'The idea: blueprint and objects', p: [
        'So far your programs used separate variables and functions. Imagine a program about students. Each student has a name, a year and marks, and each student can do things such as show their report. If you keep a separate set of variables for every student, the program becomes a mess.',
        'Object-oriented programming solves this by bundling the data and the actions that belong together into one unit. The plan for that unit is called a class. Think of a class as the architect\'s drawing of a house. The drawing is not a house, but you can build many houses from it.',
        'A real thing built from the class is called an object, or an instance of the class. Every object has its own data, even though all objects follow the same plan. In Python almost everything you have used is already an object: a string, a list, a dictionary.'] },
      { h: 'Your first class', p: [
        'A class is defined with the keyword class, then its name, then a colon. By convention class names use CapitalizedWords with no underscores. Inside the class we define functions; a function inside a class is called a method.',
        'The most important method is __init__ (two underscores before and after). Python runs it automatically every time a new object is created. Its job is to set up the starting data of the object.'],
        code: `class Student:\n    """A simple model of a student."""\n\n    def __init__(self, name, year):\n        self.name = name\n        self.year = year\n\n    def introduce(self):\n        print(f"Hi, I am {self.name}, year {self.year}.")\n\nasha = Student("Asha", 1)\nasha.introduce()\nprint(asha.name)`,
        explain: ['class Student: starts the plan. The docstring below it describes the class.', '__init__(self, name, year) is the setup method. It receives the values we give when we create a student.', 'self.name = name stores the value inside the object. A variable attached to an object like this is called an attribute.', 'Student("Asha", 1) creates a new object. Python calls __init__ for us and passes the new object as self, then "Asha" as name and 1 as year. We do not write self when we call; Python adds it.', 'asha.introduce() runs the method on that object, and asha.name reads its attribute with a dot.'] },
      { h: 'What is self?', p: [
        'Every method of a class has self as its first parameter. self means "the object this method is working on right now". When you write asha.introduce(), Python passes asha as self. That is how the method knows whose name to print.',
        'Without self, a method would have no way to reach the data of its own object. Any variable that you want to remember between method calls must be stored as self.something.'],
        code: `class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def add(self):\n        self.value += 1\n\na = Counter()\nb = Counter()\na.add()\na.add()\nb.add()\nprint(a.value, b.value)`,
        explain: ['Each Counter object starts with its own value of 0 stored in self.value.', 'a.add() runs add with self being a, so only a.value grows.', 'a was added twice and b once, so the output is 2 1. Two objects from one class keep separate data.'] },
      { h: 'Making many objects', p: [
        'A class can produce as many objects as you like. Each is created by calling the class like a function. Store them in variables or in a list. Objects in a list can be looped over exactly like numbers or strings.'],
        code: `class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n\n    def describe(self):\n        print(f"{self.title} has {self.pages} pages.")\n\nshelf = [Book("Python Basics", 320), Book("Statistics 1", 450), Book("Calculus", 520)]\nfor book in shelf:\n    book.describe()`,
        explain: ['Three Book objects are created and placed in the list shelf.', 'The loop takes each object in turn and calls describe() on it.', 'The same method prints different text because each object has different title and pages.'] },
    ],
    {
      mistakes: [
        'Forgetting self in the method definition: def describe(): causes TypeError because Python still passes the object.',
        'Writing name = name instead of self.name = name. The value is then lost when __init__ ends.',
        'Writing _init_ or init with the wrong number of underscores. It must be __init__ with two on each side.',
        'Calling the class without brackets: Student does not make an object, Student("Asha", 1) does.',
        'Passing self yourself when creating an object: Student(self, "Asha", 1) is wrong.',
      ],
      exercises: [
        { q: 'Create a class Dog with name and age, and a method sit() that prints "<name> is now sitting." Make one dog and call sit().', a: `class Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def sit(self):\n        print(f"{self.name} is now sitting.")\n\nrex = Dog("Rex", 3)\nrex.sit()` },
        { q: 'Create a class Rectangle with width and height and a method area() that returns the area. Print the area of a 4 by 6 rectangle.', a: `class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\nr = Rectangle(4, 6)\nprint(r.area())` },
        { q: 'Make a class Course with code and credits. Create two courses and print the total credits.', a: `class Course:\n    def __init__(self, code, credits):\n        self.code = code\n        self.credits = credits\n\nc1 = Course("MS 101", 12)\nc2 = Course("CS 102", 9)\nprint(c1.credits + c2.credits)` },
      ],
      quiz: [
        { q: 'What is an object?', options: ['The plan of a class', 'A real thing built from a class', 'A kind of loop', 'A Python module'], answer: 1, why: 'The class is the plan; an object (instance) is built from it.' },
        { q: 'When does Python run __init__?', options: ['When the class is defined', 'When an object is created', 'When the program ends', 'Only when you call it by name'], answer: 1, why: 'Creating an object, for example Student("Asha", 1), runs __init__ automatically.' },
        { q: 'What does self refer to inside a method?', options: ['The class itself', 'The current object', 'The Python interpreter', 'The last argument'], answer: 1, why: 'self is the object the method is working on.' },
      ],
      challenge: {
        prompt: 'Write a class Book. Its __init__ takes title and pages. Add a method describe() that returns the text "<title> has <pages> pages." (return it, do not print it).',
        starter: 'class Book:\n    pass\n',
        check: 'b = Book("Calculus", 520)\nassert b.title == "Calculus", "b.title should be the title you passed in"\nassert b.pages == 520, "b.pages should be the pages you passed in"\nassert b.describe() == "Calculus has 520 pages.", "describe() should return: Calculus has 520 pages."\nc = Book("Algebra", 300)\nassert c.describe() == "Algebra has 300 pages.", "Each book must keep its own data"',
        hint: 'def __init__(self, title, pages): self.title = title ... and def describe(self): return f"{self.title} has {self.pages} pages."',
        solution: 'class Book:\n    def __init__(self, title, pages):\n        self.title = title\n        self.pages = pages\n\n    def describe(self):\n        return f"{self.title} has {self.pages} pages."\n\nprint(Book("Calculus", 520).describe())',
      },
    }),

  L('cwork', 'Working with classes and instances', 'Thamani chaguomsingi, kubadilisha attributes, na methods zinazoshughulikia data ya object.',
    'Write a class Wallet with a balance starting at 0, and methods deposit(amount) and withdraw(amount).',
    [
      { h: 'A class with default values', p: [
        'Not every attribute has to come from an argument. Some start with a fixed value that the object sets up itself. For example, a new car has driven 0 kilometres, whatever its make or model.',
        'Attributes you do not pass in are created inside __init__ in the same way: self.name = value.'],
        code: `class Car:\n    def __init__(self, make, model, year):\n        self.make = make\n        self.model = model\n        self.year = year\n        self.odometer = 0\n\n    def full_name(self):\n        return f"{self.year} {self.make} {self.model}".title()\n\n    def read_odometer(self):\n        print(f"This car has {self.odometer} km on it.")\n\nmy_car = Car("toyota", "corolla", 2021)\nprint(my_car.full_name())\nmy_car.read_odometer()`,
        explain: ['make, model and year come from the arguments. odometer is not an argument: every new Car starts with 0.', 'full_name() builds a text from three attributes and returns it with .title() so the words start with capital letters.', 'read_odometer() prints the current value of self.odometer.', 'The result shows the full name followed by a car that has driven 0 km.'] },
      { h: 'Three ways to change an attribute', p: [
        'You can change an attribute directly through the object, you can change it with a method, or you can increase it with a method. Using methods is usually better because the method can check that the new value makes sense before saving it.'],
        code: `class Car:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n        self.odometer = 0\n\n    def update_odometer(self, km):\n        if km >= self.odometer:\n            self.odometer = km\n        else:\n            print("You cannot roll back an odometer!")\n\n    def add_km(self, km):\n        self.odometer += km\n\ncar = Car("honda", "fit")\ncar.odometer = 20          # 1. direct change\nprint(car.odometer)\ncar.update_odometer(50)    # 2. through a method, with a check\nprint(car.odometer)\ncar.update_odometer(10)    # refused by the check\ncar.add_km(25)             # 3. increase by an amount\nprint(car.odometer)`,
        explain: ['First we change car.odometer directly. It works, but nothing stops us from writing a silly value.', 'update_odometer(50) replaces the value, but only if the new number is not smaller than the current one.', 'update_odometer(10) is refused because 10 is smaller than 50, so the method prints a warning and leaves the odometer unchanged.', 'add_km(25) adds to the current value, 50 becomes 75. The final line prints 75.'] },
      { h: 'Methods that change and return', p: [
        'Methods are ordinary functions that can use the object\'s attributes. They may change attributes, return a value, or both. A good rule: a method that only asks a question returns an answer, and a method that performs an action changes the attributes.'],
        code: `class Wallet:\n    def __init__(self, owner):\n        self.owner = owner\n        self.balance = 0\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            return False\n        self.balance -= amount\n        return True\n\nw = Wallet("Juma")\nw.deposit(5000)\nprint(w.withdraw(2000), w.balance)\nprint(w.withdraw(9000), w.balance)`,
        explain: ['A new wallet has balance 0. deposit(5000) raises it to 5000.', 'withdraw(2000) is allowed, the balance becomes 3000, and the method returns True. The first print shows True 3000.', 'withdraw(9000) is more than the balance, so the method returns False without changing anything. The second print shows False 3000.', 'Returning True or False lets the calling code decide what to tell the user.'] },
      { h: 'Class attributes versus instance attributes', p: [
        'An attribute created with self.name inside __init__ belongs to one object. An attribute written directly in the class body belongs to the class and is shared by every object of that class.',
        'Class attributes are good for values that are the same for all objects, such as the name of a university or a rate.'],
        code: `class Student:\n    university = "UDSM"\n    count = 0\n\n    def __init__(self, name):\n        self.name = name\n        Student.count += 1\n\na = Student("Asha")\nb = Student("Juma")\nprint(a.university, b.university)\nprint(Student.count)`,
        explain: ['university is written in the class body, so both students share it.', 'count is also a class attribute. Each time an object is created, __init__ adds 1 to Student.count.', 'After two students the shared counter equals 2.', 'Notice that we change it with Student.count, using the class name, so every object sees the same counter.'] },
    ],
    {
      mistakes: [
        'Forgetting self. before an attribute inside a method: balance += amount fails; use self.balance += amount.',
        'Changing a class attribute through an object (a.count = 5) creates a new instance attribute instead of changing the shared one.',
        'Setting a mutable default such as a list in the class body when each object needs its own list. Create it in __init__.',
        'Not returning a value from a method and then wondering why the result is None.',
      ],
      exercises: [
        { q: 'Add a method increment_age() to a Person class that adds 1 to age. Call it twice and print the age.', a: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def increment_age(self):\n        self.age += 1\n\np = Person("Neema", 19)\np.increment_age()\np.increment_age()\nprint(p.age)` },
        { q: 'Write a class Counter with methods up(), down() and show(). It must never go below 0.', a: `class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def up(self):\n        self.value += 1\n\n    def down(self):\n        if self.value > 0:\n            self.value -= 1\n\n    def show(self):\n        print(self.value)\n\nc = Counter()\nc.up()\nc.up()\nc.down()\nc.down()\nc.down()\nc.show()` },
        { q: 'Make a class Light with an attribute on that starts as False and a method toggle() that flips it. Toggle twice and print on.', a: `class Light:\n    def __init__(self):\n        self.on = False\n\n    def toggle(self):\n        self.on = not self.on\n\nl = Light()\nl.toggle()\nl.toggle()\nprint(l.on)` },
      ],
      quiz: [
        { q: 'Where is an instance attribute normally created?', options: ['Outside the class', 'In __init__ using self', 'In a for loop', 'In the docstring'], answer: 1, why: 'self.name = value inside __init__ gives each object its own attribute.' },
        { q: 'Why change an attribute through a method instead of directly?', options: ['It is faster', 'The method can check the new value first', 'Python forbids direct changes', 'Direct changes need import'], answer: 1, why: 'A method can validate the value, for example refuse an odometer that goes backwards.' },
        { q: 'What is a class attribute?', options: ['One that belongs to one object', 'One shared by all objects of the class', 'One that cannot be read', 'A method name'], answer: 1, why: 'Written in the class body, it is shared by every instance.' },
      ],
      challenge: {
        prompt: 'Write a class Wallet. A new wallet has balance 0. deposit(amount) adds money. withdraw(amount) removes money and returns True, but if the amount is more than the balance it changes nothing and returns False.',
        starter: 'class Wallet:\n    pass\n',
        check: 'w = Wallet()\nassert w.balance == 0, "A new wallet should start with balance 0"\nw.deposit(1000)\nassert w.balance == 1000, "After deposit(1000) the balance should be 1000"\nassert w.withdraw(400) is True, "withdraw(400) should return True"\nassert w.balance == 600, "After withdrawing 400 the balance should be 600"\nassert w.withdraw(5000) is False, "withdraw(5000) should return False"\nassert w.balance == 600, "A refused withdrawal must not change the balance"',
        hint: 'In withdraw: if amount > self.balance: return False. Otherwise subtract and return True.',
        solution: 'class Wallet:\n    def __init__(self):\n        self.balance = 0\n\n    def deposit(self, amount):\n        self.balance += amount\n\n    def withdraw(self, amount):\n        if amount > self.balance:\n            return False\n        self.balance -= amount\n        return True\n\nw = Wallet()\nw.deposit(1000)\nprint(w.withdraw(400), w.balance)',
      },
    }),

  L('cinherit', 'Inheritance', 'Class mpya inaweza kurithi attributes na methods za class nyingine, na kuongeza au kubadilisha vyake.',
    'Create a class Lecturer that inherits from Person and adds a department attribute and a method that introduces the lecturer.',
    [
      { h: 'Why inheritance?', p: [
        'Sometimes the thing you want to model is a special kind of something that already exists. An electric car is a car; a lecturer is a person. You do not want to rewrite everything the first class already does.',
        'Inheritance lets a new class, the child (also called subclass), take all the attributes and methods of an existing class, the parent (superclass), and then add or change what it needs.'] },
      { h: 'A child class and super()', p: [
        'To make a child class, put the parent\'s name in brackets after the child\'s name. The child\'s __init__ must first let the parent set up its part. The function super() gives access to the parent class for this purpose.'],
        code: `class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def introduce(self):\n        print(f"I am {self.name}, {self.age} years old.")\n\nclass Lecturer(Person):\n    def __init__(self, name, age, department):\n        super().__init__(name, age)\n        self.department = department\n\n    def show_department(self):\n        print(f"{self.name} teaches in {self.department}.")\n\nl = Lecturer("Dr. Mwanga", 45, "Statistics")\nl.introduce()\nl.show_department()`,
        explain: ['class Lecturer(Person) says Lecturer inherits from Person, so it already has introduce().', 'super().__init__(name, age) runs the parent\'s __init__ to set name and age. We do not repeat that code.', 'Then the child adds its own attribute department.', 'l.introduce() is a method we never wrote in Lecturer; it comes from Person. show_department() exists only in Lecturer.'] },
      { h: 'Overriding methods', p: [
        'A child can replace a method of the parent by defining a method with the same name. This is called overriding. Python always looks in the child class first, and only if it does not find the method there does it look in the parent.',
        'Use overriding when the child must behave a little differently from the parent.'],
        code: `class Person:\n    def __init__(self, name):\n        self.name = name\n\n    def introduce(self):\n        print(f"Hello, I am {self.name}.")\n\nclass Lecturer(Person):\n    def introduce(self):\n        print(f"Good morning, I am Dr. {self.name}.")\n\nPerson("Asha").introduce()\nLecturer("Mwanga").introduce()`,
        explain: ['Lecturer has no __init__, so it uses the one from Person automatically.', 'Lecturer defines its own introduce(), which hides the parent version for lecturers.', 'The same call introduce() gives different text depending on the kind of object. This is the power of overriding.'] },
      { h: 'Checking the family tree', p: [
        'isinstance(obj, Class) tells you whether an object belongs to a class or to a class that inherits from it. issubclass(Child, Parent) checks the relationship between two classes.'],
        code: `class Person:\n    pass\n\nclass Lecturer(Person):\n    pass\n\nl = Lecturer()\nprint(isinstance(l, Lecturer))\nprint(isinstance(l, Person))\nprint(isinstance(Person(), Lecturer))\nprint(issubclass(Lecturer, Person))`,
        explain: ['A Lecturer object is a Lecturer, so the first answer is True.', 'It is also a Person because Lecturer inherits from Person, so the second answer is True.', 'A plain Person is not a Lecturer, so the third answer is False. Inheritance goes only one way.', 'issubclass confirms that Lecturer is a child of Person: True.'] },
    ],
    {
      mistakes: [
        'Forgetting super().__init__(...) in the child. The parent attributes are then never created and you get AttributeError.',
        'Writing super.__init__ without the brackets after super.',
        'Inheriting when the relationship is not "is a". A car has an engine, it is not an engine; use an attribute instead (next lesson).',
        'Overriding a method but changing the number of parameters, so code that calls it breaks.',
      ],
      exercises: [
        { q: 'Make Animal with name and a method speak() that prints "..." . Make Dog(Animal) that overrides speak() to print "Woof!".', a: `class Animal:\n    def __init__(self, name):\n        self.name = name\n\n    def speak(self):\n        print("...")\n\nclass Dog(Animal):\n    def speak(self):\n        print("Woof!")\n\nAnimal("Thing").speak()\nDog("Rex").speak()` },
        { q: 'Create Vehicle with wheels, and Bicycle(Vehicle) whose __init__ sets wheels to 2 using super().', a: `class Vehicle:\n    def __init__(self, wheels):\n        self.wheels = wheels\n\nclass Bicycle(Vehicle):\n    def __init__(self):\n        super().__init__(2)\n\nprint(Bicycle().wheels)` },
        { q: 'Make Student(Person) with an extra attribute course and show that isinstance(student, Person) is True.', a: `class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, course):\n        super().__init__(name)\n        self.course = course\n\ns = Student("Asha", "BSc Statistics")\nprint(isinstance(s, Person))` },
      ],
      quiz: [
        { q: 'What does super().__init__(...) do in a child class?', options: ['Deletes the parent', 'Runs the parent\'s setup', 'Creates a new module', 'Prints the parent name'], answer: 1, why: 'It lets the parent class set the attributes it is responsible for.' },
        { q: 'If both parent and child define show(), which runs for a child object?', options: ['The parent version', 'The child version', 'Both', 'Neither'], answer: 1, why: 'Python looks in the child first, so the child version overrides the parent.' },
        { q: 'Which relationship suits inheritance?', options: ['A car has an engine', 'A lecturer is a person', 'A book has pages', 'A list has items'], answer: 1, why: 'Inheritance models "is a"; "has a" is modelled with attributes.' },
      ],
      challenge: {
        prompt: 'Person (given) has name and age. Write Lecturer that inherits Person, takes name, age and department, and has a method title() that returns "Dr. <name> (<department>)".',
        starter: 'class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nclass Lecturer(Person):\n    pass\n',
        check: 'l = Lecturer("Mwanga", 45, "Statistics")\nassert l.name == "Mwanga" and l.age == 45, "Lecturer must keep name and age from Person"\nassert l.department == "Statistics", "Lecturer must store department"\nassert l.title() == "Dr. Mwanga (Statistics)", "title() should return: Dr. Mwanga (Statistics)"\nassert isinstance(l, Person), "Lecturer must inherit from Person"',
        hint: 'def __init__(self, name, age, department): super().__init__(name, age); self.department = department',
        solution: 'class Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\nclass Lecturer(Person):\n    def __init__(self, name, age, department):\n        super().__init__(name, age)\n        self.department = department\n\n    def title(self):\n        return f"Dr. {self.name} ({self.department})"\n\nprint(Lecturer("Mwanga", 45, "Statistics").title())',
      },
    }),

  L('ccompose', 'Instances as attributes', 'Object inaweza kuwa na object nyingine ndani yake: "has a" badala ya "is a".',
    'Create a Course class that holds a list of Student objects and a method that returns the average mark.',
    [
      { h: 'Splitting a big class into parts', p: [
        'When a class grows too large, look for a group of attributes and methods that belong together. Move them into their own class, then give the first class an object of the new class as an attribute. This is called composition, and it models a "has a" relationship: a car has a battery, a course has students.',
        'The benefit is the same as with functions: small classes are easier to understand, test and reuse.'] },
      { h: 'A car with a battery', p: [
        'A battery has its own data (its size) and actions (describe itself, report its range). Instead of putting all of these inside ElectricCar we write a Battery class and let each ElectricCar keep one Battery object.'],
        code: `class Battery:\n    def __init__(self, size=75):\n        self.size = size\n\n    def describe(self):\n        print(f"This car has a {self.size}-kWh battery.")\n\n    def get_range(self):\n        return 4 * self.size\n\nclass ElectricCar:\n    def __init__(self, make, model):\n        self.make = make\n        self.model = model\n        self.battery = Battery()\n\ncar = ElectricCar("tesla", "model s")\ncar.battery.describe()\nprint(car.battery.get_range(), "km")\ncar.battery.size = 100\nprint(car.battery.get_range(), "km")`,
        explain: ['Battery is a complete small class. Its size has a default value of 75.', 'Inside ElectricCar.__init__, self.battery = Battery() creates a battery object and stores it as an attribute.', 'car.battery.describe() has two dots: first reach the battery inside the car, then call its method.', 'get_range() multiplies the size by 4 (a simple model), so 75 gives 300 and after we change the size to 100 it gives 400.'] },
      { h: 'A course that has students', p: [
        'Composition is natural for real-world data. A course has many students, and each student has marks. Here the course keeps a list of Student objects and uses their data to compute statistics.'],
        code: `class Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\nclass Course:\n    def __init__(self, code):\n        self.code = code\n        self.students = []\n\n    def enrol(self, student):\n        self.students.append(student)\n\n    def average(self):\n        total = 0\n        for s in self.students:\n            total += s.mark\n        return total / len(self.students)\n\n    def top(self):\n        best = self.students[0]\n        for s in self.students:\n            if s.mark > best.mark:\n                best = s\n        return best.name\n\nms101 = Course("MS 101")\nms101.enrol(Student("Asha", 78))\nms101.enrol(Student("Juma", 64))\nms101.enrol(Student("Neema", 91))\nprint(ms101.average())\nprint(ms101.top())`,
        explain: ['The course starts with an empty list of students. Each enrol() call appends a Student object.', 'average() adds up s.mark for every student and divides by how many there are: (78 + 64 + 91) / 3 = 77.666...', 'top() keeps the best student seen so far and replaces it whenever a higher mark appears. Neema has the highest mark, 91.', 'The Course never copies the data; it just holds the Student objects and asks them for their marks.'] },
      { h: 'Is it "is a" or "has a"?', p: [
        'Ask yourself the sentence test. "A lecturer is a person" is true, so use inheritance. "A course is a student" is false, but "a course has students" is true, so use composition.',
        'If you are unsure, prefer composition. It is more flexible, because the parts can change without touching the whole.'] },
    ],
    {
      mistakes: [
        'Using inheritance where composition fits (making Course inherit from Student).',
        'Forgetting to create the inner object in __init__, then getting AttributeError when you use car.battery.',
        'Sharing one list between all objects by writing students = [] in the class body instead of self.students = [] in __init__.',
        'Dividing by len(self.students) when the list is empty, which causes ZeroDivisionError.',
      ],
      exercises: [
        { q: 'Make an Engine class with a method start() that prints "Engine on". Give Car an engine and call car.engine.start().', a: `class Engine:\n    def start(self):\n        print("Engine on")\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()\n\ncar = Car()\ncar.engine.start()` },
        { q: 'Make a Library class holding a list of book titles, with add(title) and count().', a: `class Library:\n    def __init__(self):\n        self.books = []\n\n    def add(self, title):\n        self.books.append(title)\n\n    def count(self):\n        return len(self.books)\n\nlib = Library()\nlib.add("Python")\nlib.add("Statistics")\nprint(lib.count())` },
        { q: 'In the Course example add a method names() that returns a list of student names.', a: `class Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\nclass Course:\n    def __init__(self):\n        self.students = []\n\n    def enrol(self, s):\n        self.students.append(s)\n\n    def names(self):\n        return [s.name for s in self.students]\n\nc = Course()\nc.enrol(Student("Asha", 70))\nc.enrol(Student("Juma", 60))\nprint(c.names())` },
      ],
      quiz: [
        { q: 'What is composition?', options: ['A class holding objects of other classes', 'Writing music in Python', 'Inheriting from two parents', 'Deleting a class'], answer: 0, why: 'One object keeps other objects as attributes: a "has a" relationship.' },
        { q: 'How do you call describe() of the battery inside car?', options: ['car.describe()', 'car.battery.describe()', 'battery.car.describe()', 'describe(car)'], answer: 1, why: 'Reach the battery attribute first, then call its method.' },
        { q: 'Which pair is best modelled with composition?', options: ['Lecturer and Person', 'Course and its students', 'Dog and Animal', 'Bicycle and Vehicle'], answer: 1, why: 'A course has students; the other pairs are "is a" relationships.' },
      ],
      challenge: {
        prompt: 'Student (given) has name and mark. Write Course with a list students, a method enrol(student), and a method average() that returns the mean mark.',
        starter: 'class Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\nclass Course:\n    pass\n',
        check: 'c = Course()\nc.enrol(Student("A", 70))\nc.enrol(Student("B", 80))\nc.enrol(Student("C", 90))\nassert len(c.students) == 3, "students should hold the three enrolled students"\nassert c.average() == 80, "average() should be 80 for marks 70, 80, 90"\nd = Course()\nassert d.students == [], "A new course must start with its own empty list"',
        hint: 'In __init__ set self.students = []. In average, add up s.mark for each student and divide by len(self.students).',
        solution: 'class Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\nclass Course:\n    def __init__(self):\n        self.students = []\n\n    def enrol(self, student):\n        self.students.append(student)\n\n    def average(self):\n        return sum(s.mark for s in self.students) / len(self.students)\n\nc = Course()\nc.enrol(Student("A", 70))\nc.enrol(Student("B", 90))\nprint(c.average())',
      },
    }),

  L('cspecial', 'Special methods and properties', 'Methods za pekee (__str__, __len__, __eq__) na @property hufanya objects zako zifanye kazi kama vitu vya kawaida vya Python.',
    'Add a __str__ method to your Student class so that print(student) shows a friendly text.',
    [
      { h: 'Printing an object', p: [
        'If you print an object of your own class, Python shows something ugly like <__main__.Student object at 0x7f...>, because it does not know how you want the object described. You teach it by writing the special method __str__ that returns a string.',
        'Special methods (also called dunder methods, from "double underscore") are methods Python calls by itself in certain situations. You never call them by name; you use them through normal syntax such as print(x) or len(x).'],
        code: `class Student:\n    def __init__(self, name, mark):\n        self.name = name\n        self.mark = mark\n\n    def __str__(self):\n        return f"{self.name} ({self.mark}%)"\n\ns = Student("Asha", 78)\nprint(s)\nprint(f"Top student: {s}")\nprint(str(s))`,
        explain: ['__str__ must return a string, not print one.', 'print(s) asks Python to convert s to text, and Python calls __str__ for us.', 'The same happens inside an f-string and with str(s). All three lines show Asha (78%).'] },
      { h: 'Making objects work with len, == and <', p: [
        'Other special methods let your objects work with built-in functions and operators. __len__ powers len(). __eq__ powers ==. __lt__ powers < and also makes sorted() possible.'],
        code: `class Course:\n    def __init__(self, code, students):\n        self.code = code\n        self.students = students\n\n    def __len__(self):\n        return len(self.students)\n\nclass Mark:\n    def __init__(self, value):\n        self.value = value\n\n    def __eq__(self, other):\n        return self.value == other.value\n\n    def __lt__(self, other):\n        return self.value < other.value\n\nc = Course("MS 101", ["Asha", "Juma", "Neema"])\nprint(len(c))\nprint(Mark(70) == Mark(70))\nprint(Mark(60) < Mark(80))\nbest = sorted([Mark(65), Mark(90), Mark(72)])\nprint([m.value for m in best])`,
        explain: ['len(c) calls __len__, which returns the number of students: 3.', 'Mark(70) == Mark(70) calls __eq__ on the left object with the right one as other. The values match, so the answer is True.', 'Mark(60) < Mark(80) calls __lt__ and gives True.', 'sorted() only needs __lt__ to put the marks in order, so the values come out as [65, 72, 90].'] },
      { h: 'Properties: computed attributes', p: [
        'Sometimes an attribute should be calculated from other attributes instead of stored. A property lets you write a method but use it like an attribute, without brackets. Put @property on the line above the method.'],
        code: `class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    @property\n    def area(self):\n        return self.width * self.height\n\nr = Rectangle(3, 5)\nprint(r.area)\nr.width = 10\nprint(r.area)`,
        explain: ['area is declared as a method, but @property lets us write r.area with no brackets.', 'It is computed fresh every time, so after we change width to 10 the next answer is 50, not the old value.', 'Because it is always calculated, the area can never become out of date, which is the main reason to use a property.'] },
      { h: 'Naming conventions and privacy', p: [
        'Python has no strict private attributes. By convention, a name that starts with one underscore, such as self._balance, means "internal: please do not touch this from outside". Programmers respect this agreement.',
        'Class names use CapitalizedWords; methods and attributes use lowercase_with_underscores. Put a blank line between methods and two blank lines between classes. Write a docstring for each class that says what it models.'],
        code: `class Account:\n    """A bank account that protects its balance."""\n\n    def __init__(self):\n        self._balance = 0\n\n    def deposit(self, amount):\n        if amount > 0:\n            self._balance += amount\n\n    @property\n    def balance(self):\n        return self._balance\n\nacc = Account()\nacc.deposit(500)\nacc.deposit(-100)\nprint(acc.balance)`,
        explain: ['The balance is stored in _balance, signalling that outside code should not change it directly.', 'deposit() refuses a negative amount, so the -100 deposit is ignored.', 'The property balance offers a read-only way to look at the value, so the final output is 500.'] },
    ],
    {
      mistakes: [
        'Printing inside __str__ instead of returning a string. print(obj) then shows None.',
        'Writing __str__ without the double underscores on both sides.',
        'Putting brackets after a property: r.area() fails because r.area is already a number.',
        'Comparing objects with == without defining __eq__. Python then compares identity, so two equal-looking objects are different.',
      ],
      exercises: [
        { q: 'Add __str__ to a Book class so print(book) shows "Title by Author".', a: `class Book:\n    def __init__(self, title, author):\n        self.title = title\n        self.author = author\n\n    def __str__(self):\n        return f"{self.title} by {self.author}"\n\nprint(Book("Weep Not, Child", "Ngugi wa Thiong'o"))` },
        { q: 'Write a Circle class with radius and a property diameter.', a: `class Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def diameter(self):\n        return 2 * self.radius\n\nprint(Circle(4).diameter)` },
        { q: 'Write a Playlist class with a list songs and __len__ so len(playlist) works.', a: `class Playlist:\n    def __init__(self, songs):\n        self.songs = songs\n\n    def __len__(self):\n        return len(self.songs)\n\nprint(len(Playlist(["a", "b", "c", "d"])))` },
      ],
      quiz: [
        { q: 'Which special method controls what print(obj) shows?', options: ['__init__', '__str__', '__len__', '__eq__'], answer: 1, why: '__str__ returns the text used by print() and str().' },
        { q: 'How do you read a property named area?', options: ['r.area()', 'r.area', 'area(r)', 'r[area]'], answer: 1, why: 'A property is used like an attribute, without brackets.' },
        { q: 'What does a leading underscore in _balance mean?', options: ['Python blocks access', 'It is for internal use by convention', 'It is a constant', 'It is a method'], answer: 1, why: 'It is a convention; Python does not enforce it.' },
      ],
      challenge: {
        prompt: 'Write a class Temperature with celsius. Add a property fahrenheit that returns celsius * 9 / 5 + 32, and a __str__ that returns "<celsius>°C".',
        starter: 'class Temperature:\n    pass\n',
        check: 't = Temperature(100)\nassert t.celsius == 100, "celsius should be stored"\nassert t.fahrenheit == 212, "fahrenheit for 100 C should be 212"\nassert str(t) == "100°C", "str(t) should be 100°C"\nt.celsius = 0\nassert t.fahrenheit == 32, "fahrenheit must follow celsius (0 C is 32 F)"',
        hint: 'Use @property above def fahrenheit(self). In __str__ return f"{self.celsius}°C".',
        solution: 'class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius\n\n    @property\n    def fahrenheit(self):\n        return self.celsius * 9 / 5 + 32\n\n    def __str__(self):\n        return f"{self.celsius}°C"\n\nprint(Temperature(100), Temperature(100).fahrenheit)',
      },
    }),

  L('cmodules', 'Importing classes and the standard library', 'Weka classes kwenye faili zao, kisha uziingize; tumia classes zilizo tayari za Python.',
    'Use datetime.date to print how many days remain from today\'s example date to an exam date of your choice.',
    [
      { h: 'Why separate files?', p: [
        'As programs grow, keeping every class in one file becomes hard to read. The usual practice is to put each class, or a group of related classes, in its own file called a module, and import what you need.',
        'Suppose a file student.py contains the class Student and another file main.py wants to use it. In main.py you write one of these lines at the top:',
        'from student import Student   (import one class)',
        'from student import Student, Course   (import several)',
        'import student   (import the whole module, then write student.Student)',
        'from student import *   (import everything; avoid it, because you can no longer tell where names come from)',
        'Python looks for student.py in the same folder as main.py. Keep both files in one folder while learning. The editor in VENUE runs a single file, so in this lesson we practise with ready-made modules of Python itself.'] },
      { h: 'Classes from the standard library', p: [
        'Python ships with hundreds of modules, called the standard library. Many provide classes you can use right away. The date class from datetime stores a calendar date and can do arithmetic with dates.'],
        code: `from datetime import date\n\nstart = date(2026, 10, 5)\nend = date(2026, 12, 18)\ndelta = end - start\nprint(delta.days)\nprint(start.strftime("%d %B %Y"))\nprint(end.year, end.month, end.day)`,
        explain: ['date(2026, 10, 5) creates a date object. date is a class and we made an instance of it, exactly like Student("Asha", 1).', 'Subtracting two dates gives a timedelta object. Its attribute days holds the number of days between them: 74.', 'strftime formats the date as text: 05 October 2026.', 'year, month and day are attributes of the date object.'] },
      { h: 'Counter and defaultdict', p: [
        'The collections module has handy classes. Counter counts how many times each item appears. defaultdict is a dictionary that creates a missing key automatically.'],
        code: `from collections import Counter, defaultdict\n\nwords = ["data", "code", "data", "stats", "code", "data"]\ncounts = Counter(words)\nprint(counts)\nprint(counts.most_common(1))\n\nby_letter = defaultdict(list)\nfor w in words:\n    by_letter[w[0]].append(w)\nprint(dict(by_letter))`,
        explain: ['Counter(words) counts every word: data three times, code twice, stats once.', 'most_common(1) returns a list with the most frequent pair: [("data", 3)].', 'defaultdict(list) creates an empty list the first time a new key is used, so we can append without checking whether the key exists.', 'The words are grouped by first letter: d for data, c for code, s for stats.'] },
      { h: 'Random numbers', p: [
        'The random module gives you random choices. With random.seed(number) the sequence becomes repeatable, which is useful for testing. Without a seed the numbers are different on every run.'],
        code: `import random\n\nrandom.seed(7)\nrolls = [random.randint(1, 6) for _ in range(5)]\nprint(len(rolls), all(1 <= r <= 6 for r in rolls))\nprint(random.choice(["Asha", "Juma", "Neema"]) in ["Asha", "Juma", "Neema"])`,
        explain: ['randint(1, 6) picks a whole number from 1 to 6, like a die. We roll five times with a list comprehension.', 'We do not print the numbers themselves, because the exact values depend on the Python version. We check instead that there are five of them and that all are between 1 and 6: 5 True.', 'random.choice picks one item from a list. The final line checks that the pick is one of the three names: True.'] },
      { h: 'Finding help and good style', p: [
        'Use help(date) or the official Python documentation to see every method of a class. You can also use dir(obj) to list the attributes and methods of any object.',
        'Style for imports: put all import lines at the top of the file, standard library first, then other libraries, then your own modules, with a blank line between groups.'] },
    ],
    {
      mistakes: [
        'Naming your own file the same as a standard module (random.py), which hides the real one and breaks imports.',
        'Forgetting that the file must be in the same folder when importing your own module.',
        'Using from module import * and then not knowing where a name came from.',
        'Putting imports in the middle of the file instead of at the top.',
      ],
      exercises: [
        { q: 'Use date to find how many days are between 1 January 2026 and 1 March 2026.', a: `from datetime import date\n\nprint((date(2026, 3, 1) - date(2026, 1, 1)).days)` },
        { q: 'Use Counter to find which letter appears most often in the text "mississippi".', a: `from collections import Counter\n\nprint(Counter("mississippi").most_common(1))` },
        { q: 'Use random.choice with a seed to pick one of three courses and print that the pick is in the list.', a: `import random\n\ncourses = ["Statistics", "Calculus", "Algebra"]\nrandom.seed(1)\npick = random.choice(courses)\nprint(pick in courses)` },
      ],
      quiz: [
        { q: 'What does from student import Student do?', options: ['Creates student.py', 'Makes the Student class from student.py available', 'Deletes the module', 'Runs only the first line'], answer: 1, why: 'It loads the module and lets you use the class by name.' },
        { q: 'Where should import lines go?', options: ['At the end', 'In the middle', 'At the top of the file', 'Inside every function'], answer: 2, why: 'By convention imports come first so readers see the dependencies at once.' },
        { q: 'What does Counter(["a","b","a"]) tell you?', options: ['The length of the list', 'How many times each item appears', 'A random item', 'The sorted list'], answer: 1, why: 'Counter counts occurrences of each item.' },
      ],
      challenge: {
        prompt: 'Using Counter from collections, set most_common_word to the word that occurs most often in the list words.',
        starter: 'from collections import Counter\n\nwords = ["data", "code", "data", "stats", "code", "data"]\nmost_common_word = ""\n',
        check: 'assert most_common_word == "data", "most_common_word should be data (it appears 3 times), got " + repr(most_common_word)',
        hint: 'Counter(words).most_common(1) returns [("data", 3)], so take [0][0].',
        solution: 'from collections import Counter\n\nwords = ["data", "code", "data", "stats", "code", "data"]\nmost_common_word = Counter(words).most_common(1)[0][0]\nprint(most_common_word)',
      },
    }),

  L('cproject', 'Mini project: student records system', 'Tunaunganisha kila kitu cha sura hii: classes, inheritance, composition na special methods.',
    'Extend the project: add a method to Gradebook that returns the names of students who failed (mark below 40).',
    [
      { h: 'What we are building', p: [
        'In this project we build a small system that a lecturer could use: students with marks, a gradebook that keeps all students, and reports. It uses everything from this chapter: a class with __init__ and methods, a child class with super(), composition (the gradebook has students), __str__ and a property.',
        'Read each part, run it, then change it. A programmer learns most by modifying working code.'] },
      { h: 'Step 1: the Student class', p: [
        'A student has a name and a dictionary of marks per course. The method average() works out the mean of all marks, and a property grade converts it to a letter.'],
        code: `class Student:\n    def __init__(self, name):\n        self.name = name\n        self.marks = {}\n\n    def add_mark(self, course, mark):\n        self.marks[course] = mark\n\n    def average(self):\n        if not self.marks:\n            return 0\n        return sum(self.marks.values()) / len(self.marks)\n\n    @property\n    def grade(self):\n        avg = self.average()\n        if avg >= 70:\n            return "A"\n        elif avg >= 60:\n            return "B"\n        elif avg >= 50:\n            return "C"\n        elif avg >= 40:\n            return "D"\n        return "F"\n\n    def __str__(self):\n        return f"{self.name}: average {self.average():.1f}, grade {self.grade}"\n\nasha = Student("Asha")\nasha.add_mark("Calculus", 72)\nasha.add_mark("Statistics", 85)\nprint(asha)`,
        explain: ['marks is a dictionary created in __init__, so each student has their own.', 'average() returns 0 for a student with no marks, which avoids dividing by zero.', 'The property grade uses an if-elif chain on the average. 72 and 85 give 78.5, which is an A.', '__str__ formats the average with one decimal and shows the grade, so print(asha) displays one tidy line.'] },
      { h: 'Step 2: a special kind of student', p: [
        'A postgraduate student is a student, but has a supervisor and a higher pass mark. We inherit from Student and override grade.'],
        code: `class Student:\n    def __init__(self, name):\n        self.name = name\n        self.marks = {}\n\n    def average(self):\n        return sum(self.marks.values()) / len(self.marks) if self.marks else 0\n\n    @property\n    def grade(self):\n        return "Pass" if self.average() >= 40 else "Fail"\n\nclass Postgraduate(Student):\n    def __init__(self, name, supervisor):\n        super().__init__(name)\n        self.supervisor = supervisor\n\n    @property\n    def grade(self):\n        return "Pass" if self.average() >= 50 else "Fail"\n\nu = Student("Juma")\np = Postgraduate("Neema", "Dr. Mwanga")\nu.marks["Stats"] = 45\np.marks["Stats"] = 45\nprint(u.grade, p.grade)\nprint(p.supervisor)`,
        explain: ['Postgraduate calls super().__init__(name) to create the name and marks, then adds supervisor.', 'It overrides the grade property to use a higher pass mark, 50 instead of 40.', 'With the same mark of 45, the undergraduate passes and the postgraduate fails: Pass Fail.', 'The dictionary style marks["Stats"] = 45 works because marks is a normal dictionary.'] },
      { h: 'Step 3: the Gradebook that has students', p: [
        'The gradebook holds students and answers questions about the whole class. This is composition: it does not inherit from Student, it keeps Student objects in a list.'],
        code: `class Student:\n    def __init__(self, name, *marks):\n        self.name = name\n        self.marks = list(marks)\n\n    def average(self):\n        return sum(self.marks) / len(self.marks)\n\nclass Gradebook:\n    def __init__(self):\n        self.students = []\n\n    def add(self, student):\n        self.students.append(student)\n\n    def best(self):\n        return max(self.students, key=lambda s: s.average())\n\n    def failed(self, pass_mark=40):\n        return [s.name for s in self.students if s.average() < pass_mark]\n\n    def class_average(self):\n        return sum(s.average() for s in self.students) / len(self.students)\n\nbook = Gradebook()\nbook.add(Student("Asha", 72, 85, 90))\nbook.add(Student("Juma", 35, 42, 30))\nbook.add(Student("Neema", 60, 55, 70))\nprint(book.best().name)\nprint(book.failed())\nprint(round(book.class_average(), 1))`,
        explain: ['Student(name, *marks) uses *args from the Functions chapter, so we can give any number of marks.', 'best() uses max with a key function: the student whose average is the greatest. Asha has an average of 82.3.', 'failed() returns a list of names with an average below the pass mark. Juma averages 35.7, so the list is ["Juma"].', 'class_average() is the mean of the three averages. We round it to one decimal place to keep the line short: 59.9.'] },
      { h: 'Where to go from here', p: [
        'Improve the project on your own: add a Course class and give each student a list of courses; add a method that prints a table of all students sorted by average; save the gradebook to a file (you will learn how in the next chapter).',
        'These ideas are exactly what real systems do, including the app you are using now: objects that hold data, objects that contain other objects, and methods that answer questions.'] },
    ],
    {
      mistakes: [
        'Making the Gradebook inherit from Student. A gradebook is not a student; it has students.',
        'Dividing by zero in average() when a student has no marks. Always check for an empty list.',
        'Changing too much at once. Add one feature, run, and fix before adding the next.',
      ],
      exercises: [
        { q: 'Add a method names_sorted() to Gradebook that returns the student names in alphabetical order.', a: `class Student:\n    def __init__(self, name):\n        self.name = name\n\nclass Gradebook:\n    def __init__(self):\n        self.students = []\n\n    def add(self, s):\n        self.students.append(s)\n\n    def names_sorted(self):\n        return sorted(s.name for s in self.students)\n\nbook = Gradebook()\nbook.add(Student("Neema"))\nbook.add(Student("Asha"))\nbook.add(Student("Juma"))\nprint(book.names_sorted())` },
        { q: 'Add a method highest() to a Student class that returns the highest mark from self.marks (a list).', a: `class Student:\n    def __init__(self, name, *marks):\n        self.name = name\n        self.marks = list(marks)\n\n    def highest(self):\n        return max(self.marks)\n\nprint(Student("Asha", 72, 85, 90).highest())` },
      ],
      quiz: [
        { q: 'Why does Gradebook not inherit from Student?', options: ['Python forbids it', 'A gradebook has students; it is not a student', 'It would be slower', 'Classes can only inherit once'], answer: 1, why: 'Use composition when the relationship is "has a".' },
        { q: 'What does max(self.students, key=lambda s: s.average()) return?', options: ['The highest average number', 'The student with the highest average', 'The first student', 'A sorted list'], answer: 1, why: 'max with key returns the item whose key value is greatest.' },
      ],
      challenge: {
        prompt: 'Write class Gradebook with a list students, an add(student) method and a method failed(pass_mark=40) that returns the list of names whose average mark is below pass_mark. Each student has name and a list marks.',
        starter: 'class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def average(self):\n        return sum(self.marks) / len(self.marks)\n\nclass Gradebook:\n    pass\n',
        check: 'g = Gradebook()\ng.add(Student("Asha", [80, 90]))\ng.add(Student("Juma", [30, 40]))\ng.add(Student("Neema", [50, 45]))\nassert g.failed() == ["Juma"], "failed() should be [\'Juma\'], got " + str(g.failed())\nassert g.failed(60) == ["Juma", "Neema"], "failed(60) should include Juma and Neema"',
        hint: 'return [s.name for s in self.students if s.average() < pass_mark]',
        solution: 'class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def average(self):\n        return sum(self.marks) / len(self.marks)\n\nclass Gradebook:\n    def __init__(self):\n        self.students = []\n\n    def add(self, student):\n        self.students.append(student)\n\n    def failed(self, pass_mark=40):\n        return [s.name for s in self.students if s.average() < pass_mark]\n\ng = Gradebook()\ng.add(Student("Juma", [30, 40]))\nprint(g.failed())',
      },
    }),
];
