import type { LearnLesson } from './learnLessons';
import { T } from './learnHelpers';

/** Digital Foundations, chapter 2: Data, information and how a computer works. */
export const CB_CH2: LearnLesson[] = [
  T('data-info', 'Data and information',
    'Data ni ukweli ghafi; taarifa ni data iliyochakatwa na kupewa maana; kila namba inahitaji lebo na kipimo.',
    'Write down your last four test marks. Turn them into information: find the average and write it with a three-part label.',
    [
      { h: 'Two words that are not the same', p: [
        'Two words appear constantly in computing: data and information. People often use them as if they meant the same thing, but in computing they are different, and understanding the difference makes everything else easier.',
        'Data consists of raw facts, measurements or observations. It can be numbers, words, dates, images, sounds or symbols. On its own, data is just material: it has not yet been organised or explained. Information is data that has been processed, organised or interpreted so that it becomes useful.'],
        fig: 'datainfo' },
      { h: 'From raw data to information', p: [
        'In every row of the table something was done to the raw facts: they were added, counted, compared or sorted.'],
        table: { head: ['Raw data', 'Processed information', 'Why it is useful'], rows: [['Marks: 45, 60, 75, 80', 'Average mark: 65', 'Summarises four marks in one number'], ['Daily sales: 10, 12, 8, 20', 'Total sales: 50', 'Shows the total for the period'], ['Names with attendance marks', 'List of students absent today', 'Tells the teacher who to follow up'], ['Temperatures: 28, 30, 31', 'Highest temperature: 31', 'Identifies the maximum observation'], ['Hundreds of exam scripts', 'Class ranking and grade distribution', 'Helps teachers and students plan improvement']] } },
      { h: 'Step by step: turning data into information', p: [
        'Follow the five steps with the marks 45, 60, 75 and 80. Notice that the last step, sharing or storing, is what lets other people use the result.'],
        steps: ['Collect the data. Write down the four marks: 45, 60, 75 and 80.', 'Decide what you want to know. You want one number that shows the typical performance.', 'Process the data. Add the marks: 45 + 60 + 75 + 80 = 260. Divide by the number of marks (4): 260 / 4 = 65.', 'Interpret the result. The average mark is 65. Because the marks are out of 100, this is a pass for most courses.', 'Share or store it. Write the average in a report or save it in a file, so others can use it.'] },
      { h: 'Why context matters', p: [
        'A number such as 75 has little meaning by itself. It could be a mark out of 100, a price in shillings, a temperature, a percentage or someone\'s age. Without a label and a unit, data can be misleading. Always ask what a value represents and which unit is being used.',
        'A good habit when recording any data is to write three things: the value, what it measures, and the unit.'],
        tip: 'Use the three-part label. Instead of "75" write "75 marks (out of 100) in Computing Test 1". Instead of "30" write "30 C, Dar es Salaam, 2 p.m.".' },
      { h: 'Kinds of data', p: [
        'Computers can handle many kinds of data, and every kind is eventually turned into numbers inside the machine.'],
        table: { head: ['Kind of data', 'Examples', 'Where you meet it'], rows: [['Numbers', 'Marks, prices, quantities, phone numbers', 'Spreadsheets, calculators, mobile-money amounts'], ['Text', 'Names, essays, messages, addresses', 'Word processors, chat apps, emails'], ['Images', 'Photographs, diagrams, scanned certificates', 'Cameras, phone galleries, ID photos'], ['Sound', 'Voice notes, music, recorded lectures', 'Phone recorders, music apps'], ['Video', 'Tutorials, video calls, films', 'Online lessons, video-sharing sites']] } },
    ],
    {
      mistakes: [
        'Calling any list of numbers "information". It becomes information only when it is processed, organised or interpreted to be useful.',
        'Writing or reading a number without its meaning and unit (is 75 a mark, a price or a temperature?).',
        'Forgetting the last step: if you do not share or store the result, nobody can use it later.',
      ],
      exercises: [
        { q: 'Explain the difference between data and information using an example of your own.', a: 'Data are raw facts, for example the marks 50, 62, 71 and 85. Information is the processed result, for example the average mark of 67 (268 divided by 4).' },
        { q: 'Turn the daily sales 10, 12, 8 and 20 into information.', a: 'Add them: 10 + 12 + 8 + 20 = 50. The total sales for the period is 50.' },
        { q: 'Rewrite the bare number "30" as a three-part label.', a: 'For example: 30 C (temperature) in Dar es Salaam at 2 p.m. It gives the value, what it measures and the unit.' },
        { q: 'Name the five kinds of data given in this lesson.', a: 'Numbers, text, images, sound and video.' },
      ],
      quiz: [
        { q: 'A list of four test marks is best described as...', options: ['Raw data', 'Information', 'Output', 'Software'], answer: 0, why: 'Until the marks are processed (for example into an average) they are raw data.' },
        { q: 'Which is information rather than raw data?', options: ['Average mark: 65', 'The marks 45, 60, 75, 80', 'The digits 0 and 1', 'A list of random numbers'], answer: 0, why: 'The average is the result of processing the marks.' },
        { q: 'The average of 45, 60, 75 and 80 is...', options: ['65', '260', '75', '60'], answer: 0, why: '45 + 60 + 75 + 80 = 260, and 260 divided by 4 is 65.' },
        { q: 'Why should a value have a label and a unit?', options: ['Without them it can be misleading', 'To make the number larger', 'Computers refuse to store it otherwise', 'It is required by Windows'], answer: 0, why: '75 could be a mark, a price, a temperature or an age; the label and unit give it meaning.' },
        { q: 'Inside the computer, every kind of data is eventually turned into...', options: ['Numbers', 'Paper', 'Sound waves', 'Ink'], answer: 0, why: 'Text, images, sound and video are all stored as numbers.' },
      ],
    }),

  T('cyc-ipo', 'The information-processing cycle',
    'Kila kompyuta hufanya hatua nne: input, processing, output na storage; tumia mzunguko huu kuelezea kazi yoyote ya kidijiti.',
    'Choose a digital task you did today. Name its input, processing, output and storage. Do it for three tasks.',
    [
      { h: 'Four stages', p: [
        'Every computer, however large or small, works in a repeating pattern of four stages: input, processing, output and storage. This is called the information-processing cycle. If you understand these four words well, you can explain what almost any digital device is doing.'],
        fig: 'cycle' },
      { h: 'What each stage means', p: [
        'Input is the data or instructions that enter the computer. It comes from you (typing, tapping, speaking, clicking), from other devices such as a scanner, a camera or a flash drive, or from other computers, like a file you download. Processing means performing operations on the input: the processor follows the instructions of a program and may add numbers, compare values, sort names, resize a picture or search for a word.',
        'Output is the result presented to the user: figures on a screen, a printed page, a sound or a message on a phone. Storage means saving data or results so they can be used again later. If you do not save your work, it disappears when the computer is switched off. Stored data can become the input for the next task, which is why the cycle repeats.'],
        table: { head: ['Stage', 'Explanation', 'Computer example', 'Everyday analogy'], rows: [['Input', 'Data or instructions enter the system', 'Typing marks on a keyboard', 'Giving ingredients to a cook'], ['Processing', 'The system performs operations on the input', 'Adding marks and calculating an average', 'Mixing the ingredients using a recipe'], ['Output', 'The result is presented to the user', 'The average appears on the screen', 'The prepared meal is served'], ['Storage', 'Data or results are saved for later', 'Saving the marks in a file', 'Writing the recipe in a notebook']] } },
      { h: 'Worked example 1: a student\'s average', p: [
        'A learner has three test marks: 65, 72 and 83. The learner types them into a calculator or spreadsheet (input). The computer adds them, 65 + 72 + 83 = 220, and divides 220 by 3 to get approximately 73.33 (processing). The result 73.33 is displayed on the screen (output).',
        'Finally the learner saves the result in a document or spreadsheet, so it can be used again for the end-of-term report (storage).'] },
      { h: 'Worked example 2: paying with mobile money', p: [
        'Mobile payments follow the same cycle, even though many computers work together behind the scenes.'],
        table: { head: ['Stage', 'What happens when you pay a shop'], rows: [['Input', 'You enter the shop\'s number, the amount and your secret PIN on your phone'], ['Processing', 'The payment system checks that your PIN is correct and your balance is enough, subtracts the amount from your account and adds it to the shop\'s account'], ['Output', 'You and the shopkeeper each receive a confirmation message'], ['Storage', 'The transaction is recorded in the provider\'s database and in your message history, so it can be checked later']] } },
      { h: 'Worked example 3: searching the web', p: [
        'You type "basic parts of a computer" into a search engine (input). The search engine compares your words with an enormous index of web pages and ranks the best matches (processing). A list of results appears on your screen (output). Your browser records the search in its history, and you may bookmark or save a page you like (storage).'],
        tip: 'Check yourself: if you can name the input, processing, output and storage of three different tasks, you understand the cycle.' },
    ],
    {
      mistakes: [
        'Forgetting storage. Without saving, your work disappears when the computer is switched off.',
        'Thinking the screen does the processing. The screen only shows the output; the processor follows the program.',
        'Mixing up input and output. Ask the direction: into the computer is input, out to the user is output.',
      ],
      exercises: [
        { q: 'Apply the cycle to sending a text message, naming each stage.', a: 'Input: you type the message. Processing: the phone prepares and sends it through the network. Output: your friend sees it on their screen. Storage: the message is kept in both chat histories.' },
        { q: 'Fill in the four stages for printing an assignment.', a: 'Input: the document and the Print command. Processing: the computer prepares the pages for the printer. Output: the printed pages. Storage: the saved document file stays on the computer.' },
        { q: 'Withdrawing cash at an ATM: what is the input and the output?', a: 'Input: your card, PIN and the amount you choose. Output: the cash, the receipt and the messages on the screen.' },
        { q: 'Which result can be both an output and, later, an input?', a: 'A saved average. It is displayed as output now, and when you open the file later it becomes input for the end-of-term report.' },
      ],
      quiz: [
        { q: 'Which stage involves performing operations on data?', options: ['Processing', 'Input', 'Output', 'Storage'], answer: 0, why: 'Processing means doing operations such as adding, comparing, sorting or searching.' },
        { q: 'The average appears on the screen. This is...', options: ['Output', 'Input', 'Storage', 'Software'], answer: 0, why: 'Presenting the result to the user is output.' },
        { q: 'Saving a file for later use is the stage called...', options: ['Storage', 'Input', 'Processing', 'Output'], answer: 0, why: 'Storage keeps data and results so they can be used again.' },
        { q: 'In a mobile-money payment, checking your PIN and balance is part of...', options: ['Processing', 'Input', 'Output', 'Storage'], answer: 0, why: 'The payment system processes the request: it checks the PIN and balance and moves the money.' },
        { q: 'Why does the cycle repeat?', options: ['Stored data can become the input for the next task', 'The screen refreshes', 'The keyboard is always on', 'Computers cannot stop'], answer: 0, why: 'What you saved today becomes input tomorrow.' },
      ],
    }),

  T('gigo-traits', 'Garbage in, garbage out and the characteristics of computers',
    'Kompyuta ni sahihi tu pale data na maagizo vikiwa sahihi (garbage in, garbage out); ina kasi, usahihi, hifadhi, uthabiti, automation na matumizi mengi, lakini haihakikishi ukweli.',
    'Pick one result you got from a computer or phone recently and check it using the five habits of this lesson.',
    [
      { h: 'Garbage in, garbage out', p: [
        'Computers are accurate only when their input and instructions are correct. Programmers have a famous saying: "Garbage in, garbage out." If you give the computer poor data, you will get poor results, no matter how powerful the computer is. The computer calculates correctly in both cases; only the input differs.',
        'Take the marks 60, 70 and 80: the average is 70. Type 600 instead of 60 and the computer happily gives 250. Nothing is wrong with the machine; the input was wrong.'],
        fig: 'cycle' },
      { h: 'Five habits for good input', p: [
        'The practical lesson is simple: before trusting an answer, check how it was produced. Professional users follow a few habits that you can start today.'],
        steps: ['Check the input before you press Enter. Re-read the numbers or the name you typed.', 'Check the result for sense. If the average of three marks between 60 and 80 comes out as 250, something is wrong.', 'Check the units. Are you adding shillings to dollars, or kilograms to grams?', 'Keep the original data. Never overwrite the only copy of your raw data with processed results.', 'Ask for a second pair of eyes on anything important, such as an application form or a bank detail.'],
        tip: 'Warning: a computer will not warn you. A spelling mistake in an email address, a missing digit in a phone number or an extra zero in an amount is accepted without complaint. Slow down on anything that cannot easily be undone.' },
      { h: 'Six characteristics of computers', p: [
        'Computers are valuable because of a set of characteristics that people alone cannot match. Each strength also comes with a limit that you should remember.'],
        table: { head: ['Characteristic', 'Meaning', 'Example'], rows: [['Speed', 'Performs a huge number of operations very quickly', 'Adding thousands of numbers in a moment'], ['Accuracy', 'Calculates precisely when data and instructions are correct', 'A formula calculates the same way every time'], ['Storage capacity', 'Keeps large amounts of data', 'Saving documents, photos and videos'], ['Consistency', 'Repeats an operation in exactly the same way', 'Applying one calculation to thousands of records'], ['Automation', 'Performs tasks automatically after instructions are given', 'A scheduled backup at midnight'], ['Versatility', 'Can be used for many different tasks', 'Study, communication, research and design']] } },
      { h: 'The important limitation', p: [
        'Warning: a computer does not guarantee that information is true. It can process inaccurate data, follow poor instructions or display misleading results. Human judgement remains essential.',
        'This is why every strength above depends on correct data and correct instructions. Speed, for example, only means a wrong answer arrives faster.'] },
    ],
    {
      mistakes: [
        'Trusting an answer because a computer produced it, without checking the input and whether the result makes sense.',
        'Overwriting the only copy of the raw data with the processed results.',
        'Thinking "accurate" means "always right". A computer is accurate only when data and instructions are correct.',
        'Ignoring units, such as adding shillings to dollars or kilograms to grams.',
      ],
      exercises: [
        { q: 'What does "garbage in, garbage out" mean? Give an example.', a: 'It means wrong input gives wrong output, however powerful the computer. Example: typing 600 instead of 60 makes the average of 600, 70 and 80 come out as 250.' },
        { q: 'Name four characteristics of computers and explain one limitation.', a: 'Speed, accuracy, storage capacity and automation (also consistency and versatility). Limitation: a computer cannot guarantee that information is true; it can process wrong data and human judgement is still needed.' },
        { q: 'The average of three marks between 60 and 80 is shown as 250. Which habit would catch this?', a: 'Checking the result for sense: an average of marks between 60 and 80 must also be between 60 and 80, so 250 signals an input error.' },
        { q: 'Give an example of automation.', a: 'A scheduled backup at midnight, or an alarm that rings every day, runs by itself after you set it up.' },
      ],
      quiz: [
        { q: 'You type 600 instead of 60 and the average is wrong. This illustrates...', options: ['Garbage in, garbage out', 'Fast processing', 'Automation', 'Storage capacity'], answer: 0, why: 'The computer calculated correctly from wrong input.' },
        { q: 'A scheduled backup at midnight is an example of...', options: ['Automation', 'Versatility', 'Input', 'A virus'], answer: 0, why: 'Automation means tasks run by themselves after instructions are given.' },
        { q: 'Which characteristic means repeating an operation in exactly the same way?', options: ['Consistency', 'Versatility', 'Storage capacity', 'Speed'], answer: 0, why: 'Consistency is applying the same calculation the same way to thousands of records.' },
        { q: 'Which is NOT a computer characteristic listed in this lesson?', options: ['Guaranteeing that information is true', 'Speed', 'Accuracy', 'Versatility'], answer: 0, why: 'Computers do not guarantee truth; that is their important limitation.' },
        { q: 'Why keep the original data?', options: ['So you never lose the raw data when you save processed results', 'To make files bigger', 'Because the computer requires it', 'To avoid using units'], answer: 0, why: 'If you overwrite the only copy of raw data with results, you cannot check or redo the work.' },
      ],
    }),

  T('bin-bits', 'Bits, bytes and binary',
    'Kompyuta huhifadhi kila kitu kama bit (0 au 1); bits nane ni byte moja; binary hutumia tarakimu mbili tu.',
    'Do the binary practice below: convert 5, 9, 12 and 20 to binary, then 110, 1001 and 10101 back to decimal.',
    [
      { h: 'Why computers use numbers made of 0 and 1', p: [
        'Inside a computer, every piece of information, whether a letter, a photograph or a song, is stored as a pattern of numbers. Why numbers? Because computers are built from millions of tiny electronic switches, and a switch has only two positions: off and on. We write these two states as 0 and 1.',
        'A single 0 or 1 is called a bit (short for binary digit). Bits are grouped in eights to make a byte. One byte can store one character, such as the letter A. A system that uses only two digits is called binary. It works just like the decimal numbers you know, except that each place is worth a power of two instead of a power of ten.'],
        fig: 'bits' },
      { h: 'Counting in binary', p: [
        'Read each binary number by its place values. In 1010, for example, there is one eight and one two, so the number is 8 + 2 = 10.'],
        table: { head: ['Decimal', 'Binary', 'How to read it'], rows: [['0', '0', 'no switches on'], ['1', '1', 'one'], ['2', '10', 'one two and no ones'], ['3', '11', 'one two and one one'], ['4', '100', 'one four'], ['5', '101', 'one four and one one'], ['8', '1000', 'one eight'], ['10', '1010', 'one eight and one two']] } },
      { h: 'Step by step: convert 13 to binary', p: [
        'The place values in binary, from right to left, are 1, 2, 4, 8, 16 and so on. Write each place value, then decide whether you need it. To check your answer, add the place values that have a 1: 8 + 4 + 1 = 13. Correct.'],
        steps: ['Find the largest place value that fits into 13. That is 8. Write 1 in the eights place. Remaining: 13 - 8 = 5.', 'Can a 4 fit into 5? Yes. Write 1 in the fours place. Remaining: 5 - 4 = 1.', 'Can a 2 fit into 1? No. Write 0 in the twos place.', 'Can a 1 fit into 1? Yes. Write 1 in the ones place. Remaining: 0.', 'Read the digits from left to right: 1101. So 13 in decimal is 1101 in binary.'] },
      { h: 'Letters, pictures and songs are numbers too', p: [
        'Computers use an agreed code to turn characters into numbers. In the widely used ASCII code, the capital letter A is the number 65, which in binary is 01000001 (one byte). B is 66, C is 67, and so on. A photograph is stored as a grid of tiny coloured dots called pixels, each described by numbers for its colour. A song is stored as thousands of numbers per second describing the sound wave.',
        'You will rarely write binary yourself. But understanding it explains why file sizes are measured in bytes, why storage is described in gigabytes, and why all digital information, whatever its type, can be copied perfectly and sent across the internet.'],
        tip: 'To convert binary to decimal, write the place values 16, 8, 4, 2, 1 above the digits and add the values that sit above a 1.' },
      { h: 'Practical lab: binary practice', p: [
        'Goal: build confidence with binary numbers. You have succeeded when you can convert at least four of the six numbers correctly without looking at the steps.'],
        steps: ['Write the place values 16, 8, 4, 2, 1 across the top of a page.', 'Convert these decimal numbers to binary using the method above: 5, 9, 12 and 20.', 'Convert these binary numbers back to decimal by adding the place values with a 1: 110, 1001 and 10101.', 'Check with the answers: 5 = 101, 9 = 1001, 12 = 1100, 20 = 10100; 110 = 6, 1001 = 9, 10101 = 21.'] },
    ],
    {
      mistakes: [
        'Reading binary place values from left to right. They grow from the right: 1, 2, 4, 8, 16.',
        'Thinking a bit and a byte are the same. A bit is one 0 or 1; a byte is eight bits.',
        'Thinking binary 101 is "one hundred and one". It is five (4 + 1).',
        'Forgetting to check a conversion by adding the place values back up.',
      ],
      exercises: [
        { q: 'What is a bit? What is a byte? Why do computers use binary?', a: 'A bit is a single binary digit, 0 or 1. A byte is a group of eight bits, enough for one character. Computers use binary because they are built from tiny electronic switches that have only two positions, off and on.' },
        { q: 'Convert 11 to binary, showing your steps.', a: 'The largest place value that fits is 8 (11 - 8 = 3). 4 does not fit into 3 (0). 2 fits (3 - 2 = 1). 1 fits (0 left). The digits are 1011, check: 8 + 2 + 1 = 11.' },
        { q: 'Convert 20 to binary and 10101 to decimal.', a: '20 = 16 + 4 = 10100. 10101 = 16 + 4 + 1 = 21.' },
        { q: 'In ASCII, what number is the letter A, and how many bytes does it use?', a: 'A is 65, which is 01000001 in binary, exactly one byte.' },
      ],
      quiz: [
        { q: 'The binary number 101 equals which decimal number?', options: ['5', '3', '4', '6'], answer: 0, why: 'One four plus one one: 4 + 1 = 5.' },
        { q: 'How many bits make a byte?', options: ['8', '2', '4', '16'], answer: 0, why: 'A byte is a group of eight bits.' },
        { q: 'Why do computers use only 0 and 1?', options: ['Their tiny electronic switches have two positions, off and on', 'Because decimal numbers are illegal', 'Because 0 and 1 are the only numbers people know', 'To save paper'], answer: 0, why: 'Computers are built from switches with only two states, written 0 and 1.' },
        { q: 'What is 13 in binary?', options: ['1101', '1011', '1110', '1001'], answer: 0, why: '8 + 4 + 1 = 13, so the digits are 1 (eight), 1 (four), 0 (two), 1 (one).' },
        { q: 'A digital photograph is stored as...', options: ['A grid of pixels described by numbers', 'Ink on paper', 'A magnetic tape pattern', 'Only text'], answer: 0, why: 'A picture is a grid of tiny coloured dots (pixels), each described by numbers for its colour.' },
      ],
    }),
];
