import type { LearnLesson } from './learnLessons';
import { L } from './learnHelpers';

/** Python for Statistics: descriptive statistics, probability, the normal distribution, inference and regression. Standard library only, so everything runs in the browser. */
export const PYTHON_STATS: LearnLesson[] = [
  L('psdescribe', 'Stats: describing data (centre, spread, outliers)', 'Eleza data kwa namba chache: wastani, kati, mtawanyiko na thamani zisizo za kawaida.',
    'Write five_number(data) that returns (minimum, Q1, median, Q3, maximum).',
    [
      { h: 'The centre of the data', p: [
        'A statistician first asks: what is a typical value? The mean adds everything and divides by the count. The median is the middle value after sorting, and the mode is the most frequent value. The module statistics has all three, so you do not need to write loops.',
        'The mean is pulled by extreme values; the median is not. That is why house prices and salaries are usually reported with the median.'],
        code: `import statistics as st\n\nmarks = [45, 52, 58, 61, 61, 64, 70, 73, 95]\nprint(round(st.mean(marks), 2))\nprint(st.median(marks))\nprint(st.mode(marks))\n\n# one very large value pulls the mean but not the median\nmarks2 = marks + [300]\nprint(round(st.mean(marks2), 2), st.median(marks2))`,
        explain: ['st.mean, st.median and st.mode each take a list of numbers.', 'Adding the value 300 changes the mean a lot, but the median moves only a little.', 'When the data has extreme values, compare mean and median before you decide which one is "typical".'] },
      { h: 'Spread: how different are the values?', p: [
        'Two classes can have the same mean and still be very different: in one everybody scored near 60, in the other half scored 30 and half scored 90. Spread measures this. The range is max minus min. The variance is the average squared distance from the mean, and the standard deviation is its square root, so it has the same unit as the data.',
        'There are two versions. For a whole population divide by n (pvariance, pstdev). For a sample, which is what we usually have, divide by n - 1 (variance, stdev).'],
        code: `import statistics as st\n\nclass_a = [58, 59, 60, 61, 62]\nclass_b = [30, 30, 60, 90, 90]\nfor name, data in [("A", class_a), ("B", class_b)]:\n    print(name, "mean", st.mean(data), "range", max(data) - min(data), "sd", round(st.stdev(data), 2))\n\nprint(round(st.variance(class_a), 2), round(st.pvariance(class_a), 2))`,
        explain: ['Both classes have mean 60, but class B has a far larger standard deviation.', 'variance divides by n - 1 and pvariance divides by n, so the sample value is a little larger.', 'Use stdev for sample data unless you really have the whole population.'] },
      { h: 'Quartiles and outliers', p: [
        'Quartiles cut the sorted data into four equal parts. Q1 has 25% of the values below it, Q2 is the median and Q3 has 75% below it. The interquartile range IQR = Q3 - Q1 measures the spread of the middle half. A common rule marks a value as an outlier when it is below Q1 - 1.5 x IQR or above Q3 + 1.5 x IQR.',
        'Different books use slightly different quartile methods. Python statistics.quantiles(data, n=4) uses one fixed method, so use it whenever an exercise says so.'],
        code: `import statistics as st\n\ndata = [45, 52, 58, 61, 61, 64, 70, 73, 140]\nq1, q2, q3 = st.quantiles(data, n=4)\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nprint(q1, q2, q3, iqr)\nprint("fences:", low, high)\nprint("outliers:", [x for x in data if x < low or x > high])`,
        explain: ['quantiles with n=4 returns the three cut points Q1, Q2 and Q3.', 'The fences are 1.5 IQR below Q1 and above Q3.', 'A list comprehension keeps the values outside the fences. An outlier is a reason to look again at the data, not to delete it automatically.'] },
    ], {
      mistakes: ['Using pstdev (divide by n) for a sample; use stdev for samples.', 'Reporting only the mean when the data has outliers.', 'Expecting st.mode to show every mode when several values tie: it returns only the first (use st.multimode for all of them).', 'Forgetting to import statistics, or giving it an empty list, which raises StatisticsError.'],
      exercises: [
        { q: 'Print the median of [7, 3, 9, 1, 5].', a: 'import statistics as st\nprint(st.median([7, 3, 9, 1, 5]))' },
        { q: 'Print the sample standard deviation of [2, 4, 4, 4, 5, 5, 7, 9] rounded to 2 decimals.', a: 'import statistics as st\nprint(round(st.stdev([2, 4, 4, 4, 5, 5, 7, 9]), 2))' },
        { q: 'Print the range (max minus min) of [12, 7, 30, 18].', a: 'data = [12, 7, 30, 18]\nprint(max(data) - min(data))' },
      ],
      quiz: [
        { q: 'Which measure is least affected by one extreme value?', options: ['Mean', 'Median', 'Range', 'Variance'], answer: 1, why: 'The median depends only on the middle position, not on how large the extreme value is.' },
        { q: 'Which function divides by n - 1?', options: ['pstdev', 'stdev', 'median', 'mode'], answer: 1, why: 'stdev and variance are the sample versions and divide by n - 1.' },
        { q: 'What is the IQR?', options: ['Max minus min', 'Q3 minus Q1', 'Mean minus median', 'Standard deviation squared'], answer: 1, why: 'The interquartile range is the spread of the middle 50% of the data.' },
        { q: 'Two groups have the same mean. What can still differ?', options: ['Nothing', 'Their spread', 'Their count only', 'Their units'], answer: 1, why: 'Same centre does not mean same spread.' },
      ],
      challenge: {
        prompt: 'Write five_number(data) that returns a tuple (minimum, Q1, median, Q3, maximum). Use statistics.quantiles(data, n=4) for the quartiles.',
        starter: 'import statistics\n\ndef five_number(data):\n    # return (minimum, Q1, median, Q3, maximum)\n    return ()\n',
        check: 'r = five_number([1, 2, 3, 4, 5, 6, 7, 8])\nassert r == (1, 2.25, 4.5, 6.75, 8), "Got " + str(r)\nr2 = five_number([45, 52, 58, 61, 61, 64, 70, 73, 95])\nassert r2[0] == 45 and r2[4] == 95, "Check the minimum and maximum"\nassert r2[2] == 61, "The median of this data is 61"',
        hint: 'q1, q2, q3 = statistics.quantiles(data, n=4), then return (min(data), q1, q2, q3, max(data)).',
        solution: 'import statistics\n\ndef five_number(data):\n    q1, q2, q3 = statistics.quantiles(data, n=4)\n    return (min(data), q1, q2, q3, max(data))\n',
      },
    }),

  L('psprob', 'Stats: probability, counting and simulation', 'Uwezekano kwa hesabu kamili na kwa kuiga mara nyingi kwa kompyuta.',
    'Write binom_pmf(n, k, p) for the binomial probability of exactly k successes in n trials.',
    [
      { h: 'Probability as a fraction', p: [
        'When all outcomes are equally likely, the probability of an event is (number of favourable outcomes) divided by (number of all outcomes). The module fractions keeps exact answers like 1/6 instead of 0.1666... which is useful for checking your maths.',
        'For two events: P(A or B) = P(A) + P(B) - P(A and B). For independent events P(A and B) = P(A) x P(B).'],
        code: `from fractions import Fraction\nfrom itertools import product\n\n# all outcomes of two dice\nspace = list(product(range(1, 7), repeat=2))\nsum7 = [o for o in space if sum(o) == 7]\nprint(len(space), len(sum7), Fraction(len(sum7), len(space)))\n\ndouble = [o for o in space if o[0] == o[1]]\nboth = [o for o in space if o[0] == o[1] and sum(o) >= 8]\nprint(Fraction(len(double), 36), Fraction(len(both), 36))`,
        explain: ['product(range(1, 7), repeat=2) lists all 36 pairs of two dice.', 'A list comprehension picks the favourable outcomes, and Fraction(a, b) gives the exact probability.', 'Counting outcomes by code is a good way to check an answer you worked out by hand.'] },
      { h: 'Counting: permutations and combinations', p: [
        'Choosing k things from n when order matters gives n!/(n-k)! ways (math.perm). When order does not matter it gives n!/(k!(n-k)!) ways (math.comb). For example, choosing a committee of 3 from 10 students is a combination; choosing a president, secretary and treasurer is a permutation.',
        'These numbers are the building blocks of the binomial distribution.'],
        code: `import math\n\nprint(math.factorial(5))\nprint(math.comb(10, 3))\nprint(math.perm(10, 3))\n# probability that a 5-card hand has exactly 2 aces\nprint(round(math.comb(4, 2) * math.comb(48, 3) / math.comb(52, 5), 4))`,
        explain: ['comb(10, 3) counts committees, perm(10, 3) counts ordered positions.', 'The last line multiplies the ways to choose the aces and the other cards, then divides by all possible hands.', 'Always say whether order matters before you choose comb or perm.'] },
      { h: 'The binomial distribution, exactly and by simulation', p: [
        'If you repeat an experiment n times, each time with success probability p, the number of successes X follows a binomial distribution: P(X = k) = C(n, k) p^k (1 - p)^(n - k). Example: the chance of exactly 3 correct answers when guessing 5 multiple-choice questions with 4 options each.',
        'A simulation checks the formula. random.seed makes the random numbers repeat, so you get the same result each run. The simulated answer is close to the exact one, and gets closer when you repeat more times.'],
        code: `import math\nimport random\n\nn, p, k = 5, 0.25, 3\nexact = math.comb(n, k) * p**k * (1 - p)**(n - k)\nprint("exact:", round(exact, 4))\n\nrandom.seed(7)\ntrials = 20000\nhits = 0\nfor _ in range(trials):\n    correct = sum(1 for _ in range(n) if random.random() < p)\n    if correct == k:\n        hits += 1\nprint("simulated:", round(hits / trials, 4))`,
        explain: ['The formula gives the exact probability.', 'Each trial simulates five guesses; random.random() < p is a success with probability p.', 'The two numbers are close (they differ by less than about 0.005). More trials usually means a smaller difference.'] },
    ], {
      mistakes: ['Using comb when order matters (or perm when it does not).', 'Multiplying probabilities of events that are not independent.', 'Forgetting that probabilities lie between 0 and 1; a result above 1 means a mistake.', 'Simulating with too few trials and trusting the noisy answer.'],
      exercises: [
        { q: 'Print the number of ways to choose 4 students from 12.', a: 'import math\nprint(math.comb(12, 4))' },
        { q: 'Print the exact probability of getting two heads in two fair coin tosses, as a Fraction.', a: 'from fractions import Fraction\nprint(Fraction(1, 2) * Fraction(1, 2))' },
        { q: 'Print the probability of exactly 2 successes in 4 trials with p = 0.5, rounded to 4 decimals.', a: 'import math\nprint(round(math.comb(4, 2) * 0.5**2 * 0.5**2, 4))' },
      ],
      quiz: [
        { q: 'For independent events A and B, P(A and B) equals:', options: ['P(A) + P(B)', 'P(A) x P(B)', 'P(A) - P(B)', 'P(A) / P(B)'], answer: 1, why: 'Independence means you multiply the probabilities.' },
        { q: 'Choosing a committee of 3 from 10 people uses:', options: ['math.perm(10, 3)', 'math.comb(10, 3)', 'math.factorial(3)', '10 ** 3'], answer: 1, why: 'The order in a committee does not matter, so use combinations.' },
        { q: 'What does random.seed(7) do?', options: ['Makes numbers bigger', 'Makes the random numbers repeat each run', 'Stops the program', 'Sorts the numbers'], answer: 1, why: 'A fixed seed gives the same random sequence every time.' },
      ],
      challenge: {
        prompt: 'Write binom_pmf(n, k, p) that returns the probability of exactly k successes in n trials with success probability p, using math.comb.',
        starter: 'import math\n\ndef binom_pmf(n, k, p):\n    # return C(n, k) * p**k * (1 - p)**(n - k)\n    return 0\n',
        check: 'assert abs(binom_pmf(5, 3, 0.25) - 0.0879) < 0.0001, "binom_pmf(5, 3, 0.25) should be about 0.0879"\nassert abs(binom_pmf(4, 2, 0.5) - 0.375) < 1e-9, "binom_pmf(4, 2, 0.5) should be 0.375"\nassert binom_pmf(3, 0, 0.5) == 0.125, "binom_pmf(3, 0, 0.5) should be 0.125"\nassert abs(sum(binom_pmf(6, k, 0.3) for k in range(7)) - 1) < 1e-9, "All probabilities must add to 1"',
        hint: 'The formula is math.comb(n, k) * p**k * (1 - p)**(n - k).',
        solution: 'import math\n\ndef binom_pmf(n, k, p):\n    return math.comb(n, k) * p**k * (1 - p)**(n - k)\n',
      },
    }),

  L('psnormal', 'Stats: the normal distribution and z-scores', 'Mviringo wa kengele: z-score na uwezekano kwa NormalDist.',
    'Write percent_below(x, mean, sd) that gives the percentage of values below x in a normal distribution.',
    [
      { h: 'The bell curve with NormalDist', p: [
        'Many measurements, such as heights or exam marks in a large class, follow a bell-shaped normal distribution described by its mean and standard deviation. statistics.NormalDist(mu, sigma) represents such a distribution. cdf(x) gives P(X <= x), the area under the curve to the left of x. inv_cdf(p) does the reverse: it gives the value with probability p below it.',
        'Suppose exam marks have mean 60 and standard deviation 10.'],
        code: `from statistics import NormalDist\n\nmarks = NormalDist(mu=60, sigma=10)\nprint(round(marks.cdf(70), 4))\nprint(round(1 - marks.cdf(75), 4))\nprint(round(marks.cdf(70) - marks.cdf(50), 4))\nprint(round(marks.inv_cdf(0.9), 2))`,
        explain: ['cdf(70) is the probability of a mark of 70 or less, about 84%.', '1 - cdf(75) is the probability of a mark above 75.', 'The difference of two cdf values gives the probability between two marks; inv_cdf(0.9) is the mark that 90% of students are below.'] },
      { h: 'z-scores and the 68-95-99.7 rule', p: [
        'A z-score tells how many standard deviations a value is above or below the mean: z = (x - mean) / sd. It lets you compare values from different scales, for example a mark of 72 in a test with mean 60 and sd 10 (z = 1.2) against 80 in a test with mean 70 and sd 5 (z = 2.0). The second is the stronger result.',
        'For a normal distribution about 68% of values lie within 1 sd of the mean, about 95% within 2 sd and about 99.7% within 3 sd.'],
        code: `from statistics import NormalDist\n\nz1 = (72 - 60) / 10\nz2 = (80 - 70) / 5\nprint(z1, z2)\n\nstandard = NormalDist()\nfor k in (1, 2, 3):\n    inside = standard.cdf(k) - standard.cdf(-k)\n    print(k, "sd:", round(inside * 100, 1), "%")\n\nprint(round(NormalDist(60, 10).zscore(75), 2))`,
        explain: ['NormalDist() with no arguments is the standard normal: mean 0, sd 1.', 'The three printed percentages confirm the 68-95-99.7 rule.', 'The zscore method does the same calculation as the formula.'] },
      { h: 'Checking normality and sampling from it', p: [
        'Real data is never perfectly normal, but you can compare. NormalDist.from_samples(data) estimates the mean and sd of your data, and samples(n, seed=...) draws random values from a distribution. If the proportion of real data within 1 sd is close to 68%, the normal model is reasonable.',
        'The sample values below come from a simulated class, not real students.'],
        code: `from statistics import NormalDist\n\nclass_marks = NormalDist(60, 10).samples(500, seed=11)\nfit = NormalDist.from_samples(class_marks)\nprint(round(fit.mean, 1), round(fit.stdev, 1))\nwithin = sum(1 for m in class_marks if abs(m - fit.mean) <= fit.stdev)\nprint(round(100 * within / len(class_marks)), "% within 1 sd")`,
        explain: ['samples draws 500 marks from the normal distribution; the seed makes the result repeat.', 'from_samples recovers values close to the original mean and sd.', 'About two thirds of the values lie within one standard deviation, as the rule predicts.'] },
    ], {
      mistakes: ['Giving sigma as the variance instead of the standard deviation.', 'Reading cdf as the height of the curve; it is the area to the left.', 'Forgetting that the probability of one exact value in a continuous distribution is 0, so use ranges.', 'Using the normal model on data that is clearly skewed.'],
      exercises: [
        { q: 'Marks have mean 50 and sd 8. Print the z-score of a mark of 66.', a: 'print((66 - 50) / 8)' },
        { q: 'For the standard normal distribution print cdf(0) (it should be 0.5).', a: 'from statistics import NormalDist\nprint(NormalDist().cdf(0))' },
        { q: 'For NormalDist(100, 15) print the value below which 50% of the data lie.', a: 'from statistics import NormalDist\nprint(NormalDist(100, 15).inv_cdf(0.5))' },
      ],
      quiz: [
        { q: 'A z-score of -2 means the value is:', options: ['2 sd above the mean', '2 sd below the mean', 'equal to the mean', '2 units above the mean'], answer: 1, why: 'Negative z means below the mean, measured in standard deviations.' },
        { q: 'About what percentage of a normal distribution lies within 2 sd of the mean?', options: ['68%', '95%', '99.7%', '50%'], answer: 1, why: 'The 68-95-99.7 rule gives 95% within 2 sd.' },
        { q: 'What does NormalDist.cdf(x) return?', options: ['The height of the curve at x', 'P(X <= x)', 'The standard deviation', 'A random number'], answer: 1, why: 'The cumulative distribution function is the area to the left of x.' },
      ],
      challenge: {
        prompt: 'Write percent_below(x, mean, sd) that returns the percentage (0 to 100, rounded to 1 decimal) of values below x in a normal distribution with that mean and standard deviation.',
        starter: 'from statistics import NormalDist\n\ndef percent_below(x, mean, sd):\n    # use NormalDist(mean, sd).cdf(x)\n    return 0\n',
        check: 'assert percent_below(60, 60, 10) == 50.0, "The mean has 50% below it"\nassert percent_below(70, 60, 10) == 84.1, "Got " + str(percent_below(70, 60, 10))\nassert percent_below(40, 60, 10) == 2.3, "Got " + str(percent_below(40, 60, 10))',
        hint: 'Multiply the cdf by 100 and use round(value, 1).',
        solution: 'from statistics import NormalDist\n\ndef percent_below(x, mean, sd):\n    return round(NormalDist(mean, sd).cdf(x) * 100, 1)\n',
      },
    }),

  L('psinference', 'Stats: sampling, confidence intervals and a permutation test', 'Kutoka sampuli hadi hitimisho: mipaka ya kujiamini na jaribio la permutation.',
    'Write mean_ci(data) that returns an approximate 95% confidence interval for the mean.',
    [
      { h: 'Why sample means vary', p: [
        'We rarely measure everybody, so we take a sample and use its mean to estimate the population mean. A different sample gives a different mean. The standard deviation of the sample means is called the standard error and equals sd / sqrt(n). Bigger samples give a smaller standard error, which is why more data gives a more reliable estimate.',
        'We can see this by simulation: draw many samples from a known population and look at how their means spread.'],
        code: `import random\nimport statistics as st\n\nrandom.seed(3)\npopulation = [random.gauss(50, 12) for _ in range(10000)]\nfor n in (5, 30, 200):\n    means = [st.mean(random.sample(population, n)) for _ in range(500)]\n    print(n, "spread of means:", round(st.stdev(means), 2), " theory:", round(12 / n ** 0.5, 2))`,
        explain: ['We build a population of 10000 values with mean 50 and sd 12.', 'For each sample size we compute 500 sample means and measure their spread.', 'The spread shrinks like 12 / sqrt(n), matching the theory. Notice that quadrupling n only halves the error.'] },
      { h: 'A confidence interval for the mean', p: [
        'A 95% confidence interval is a range built so that, if you repeated the study many times, about 95% of such intervals would contain the true mean. For a large enough sample the interval is mean +/- z x s / sqrt(n) with z = 1.96. For small samples (below about 30) a t value should be used; the standard library does not include it, so treat the result as approximate.',
        'Read the interval honestly: it describes the estimate, not the chance that the mean is inside this one interval.'],
        code: `import statistics as st\nfrom statistics import NormalDist\n\ndata = [62, 58, 71, 65, 49, 80, 67, 59, 73, 64, 70, 55, 68, 61, 75, 66, 60, 72, 57, 69]\nn = len(data)\nm = st.mean(data)\nse = st.stdev(data) / n ** 0.5\nz = NormalDist().inv_cdf(0.975)\nprint(round(z, 2))\nprint(round(m - z * se, 2), round(m + z * se, 2))`,
        explain: ['The standard error is the sample sd divided by the square root of n.', 'inv_cdf(0.975) gives 1.96, the value that leaves 2.5% in each tail.', 'The interval is the mean plus and minus z standard errors.'] },
      { h: 'A permutation test: is the difference real?', p: [
        'Group A studied with VENUE and group B did not. Their mean marks differ. Could this be luck? A permutation test answers this without formulas: if group labels did not matter, shuffling the labels would give differences as big as the real one fairly often. We shuffle many times and count how often a shuffled difference is at least as large as the observed one. That proportion is the p-value.',
        'A small p-value (for example below 0.05) says the difference is unlikely to be pure chance. It does not prove the cause, and it does not measure how important the difference is.'],
        code: `import random\nimport statistics as st\n\nA = [72, 68, 75, 80, 71, 77, 74, 69]\nB = [65, 70, 62, 68, 66, 71, 63, 67]\nobserved = st.mean(A) - st.mean(B)\n\nrandom.seed(5)\nall_marks = A + B\ncount = 0\nfor _ in range(5000):\n    random.shuffle(all_marks)\n    diff = st.mean(all_marks[:len(A)]) - st.mean(all_marks[len(A):])\n    if abs(diff) >= abs(observed):\n        count += 1\nprint("observed difference:", round(observed, 2))\nprint("p-value:", round(count / 5000, 4))`,
        explain: ['The observed difference is the mean of A minus the mean of B.', 'Each round shuffles all marks, splits them into two groups of the original sizes and records the difference.', 'The p-value is the fraction of shuffles whose difference is at least as large (in absolute value) as the real one.'] },
    ], {
      mistakes: ['Saying "there is a 95% chance the mean is in this interval" for one computed interval.', 'Using the z interval for a very small sample without saying it is approximate.', 'Treating a small p-value as proof of cause, or a large one as proof of no effect.', 'Forgetting to shuffle before splitting in a permutation test.'],
      exercises: [
        { q: 'Print the standard error of [10, 12, 14, 16, 18] (sample sd divided by the square root of n), rounded to 3 decimals.', a: 'import statistics as st\ndata = [10, 12, 14, 16, 18]\nprint(round(st.stdev(data) / len(data) ** 0.5, 3))' },
        { q: 'Print the z value for a 99% confidence interval, rounded to 2 decimals.', a: 'from statistics import NormalDist\nprint(round(NormalDist().inv_cdf(0.995), 2))' },
        { q: 'With seed 1, print the mean of a random sample of 3 values from list(range(1, 11)) rounded to 2 decimals. (Any correct code is fine; the idea is random.sample.)', a: 'import random\nimport statistics as st\nrandom.seed(1)\nprint(round(st.mean(random.sample(list(range(1, 11)), 3)), 2))' },
      ],
      quiz: [
        { q: 'What happens to the standard error when n becomes 4 times larger?', options: ['It doubles', 'It halves', 'It stays the same', 'It becomes 4 times smaller'], answer: 1, why: 'The standard error is sd / sqrt(n), and sqrt(4) = 2.' },
        { q: 'A p-value is the probability of:', options: ['The hypothesis being true', 'A result at least this extreme if only chance were at work', 'The sample being random', 'A mistake in the code'], answer: 1, why: 'It is computed assuming that no real effect exists.' },
        { q: 'Why do we shuffle in a permutation test?', options: ['To save time', 'To break any link between group label and value', 'To sort the data', 'To remove outliers'], answer: 1, why: 'If labels do not matter, shuffled groups show what chance alone produces.' },
      ],
      challenge: {
        prompt: 'Write mean_ci(data) that returns a tuple (low, high): the approximate 95% confidence interval for the mean, using z = 1.96 and the sample standard deviation. Round both numbers to 2 decimals.',
        starter: 'import statistics\n\ndef mean_ci(data):\n    # mean +/- 1.96 * stdev / sqrt(n)\n    return (0, 0)\n',
        check: 'data = [62, 58, 71, 65, 49, 80, 67, 59, 73, 64, 70, 55, 68, 61, 75, 66, 60, 72, 57, 69]\nlow, high = mean_ci(data)\nassert abs(low - 61.74) < 0.02 and abs(high - 68.36) < 0.02, "Got " + str((low, high))\nlow2, high2 = mean_ci([10, 10, 10, 10])\nassert low2 == 10 and high2 == 10, "No variation gives a zero-width interval"',
        hint: 'm = statistics.mean(data); se = statistics.stdev(data) / len(data) ** 0.5; return (round(m - 1.96 * se, 2), round(m + 1.96 * se, 2)).',
        solution: 'import statistics\n\ndef mean_ci(data):\n    m = statistics.mean(data)\n    se = statistics.stdev(data) / len(data) ** 0.5\n    return (round(m - 1.96 * se, 2), round(m + 1.96 * se, 2))\n',
      },
    }),

  L('psregression', 'Stats: correlation and simple regression', 'Uhusiano wa vigeu viwili: correlation, mstari wa regression na R-squared.',
    'Write predict(xs, ys, new_x) that fits a straight line and predicts y for new_x.',
    [
      { h: 'Correlation: how strongly do two variables move together?', p: [
        'Suppose xs are hours studied and ys are exam marks. The correlation coefficient r lies between -1 and 1. Near 1 means that high x goes with high y, near -1 means high x goes with low y, and near 0 means no straight-line relationship. statistics.correlation(xs, ys) calculates it.',
        'Correlation is not causation. Two things can move together because of a third cause, or by coincidence. Always look at the data before trusting r.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6, 7, 8]\nmarks = [40, 48, 52, 58, 63, 70, 74, 81]\nprint(round(st.correlation(hours, marks), 3))\n\nnoise = [50, 61, 47, 66, 52, 58, 49, 63]\nprint(round(st.correlation(hours, noise), 3))`,
        explain: ['The first value is very close to 1: a strong positive straight-line relationship.', 'The second list has no pattern, so r is near 0.', 'A single number cannot show curves or outliers, so plot the data as well.'] },
      { h: 'The regression line', p: [
        'Simple linear regression draws the line y = a + b x that is closest to the points in the least-squares sense. The slope b says how much y changes when x increases by one unit; the intercept a is the predicted y at x = 0. statistics.linear_regression(xs, ys) returns both.',
        'Use the line to predict inside the range of your data. Predicting far outside it (extrapolation) is risky, because the relationship may change.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6, 7, 8]\nmarks = [40, 48, 52, 58, 63, 70, 74, 81]\nslope, intercept = st.linear_regression(hours, marks)\nprint(round(slope, 3), round(intercept, 3))\nfor h in (2.5, 6, 10):\n    print(h, "hours ->", round(intercept + slope * h, 1))`,
        explain: ['Each extra hour of study goes with about 5.7 more marks in this data.', 'The prediction for 2.5 and 6 hours is inside the data range and is reasonable.', 'The prediction for 10 hours is extrapolation: treat it with care, since marks cannot exceed 100.'] },
      { h: 'Residuals and R-squared', p: [
        'A residual is the actual y minus the predicted y. Small residuals mean a good fit. R-squared is the share of the variation in y that the line explains: for simple regression it equals r squared. An R-squared of 0.99 means that 99% of the variation in marks is explained by hours studied in this data.',
        'Always inspect the residuals. If they show a pattern (for example all positive in the middle) a straight line is the wrong model.'],
        code: `import statistics as st\n\nhours = [1, 2, 3, 4, 5, 6, 7, 8]\nmarks = [40, 48, 52, 58, 63, 70, 74, 81]\nb, a = st.linear_regression(hours, marks)\nresiduals = [round(y - (a + b * x), 2) for x, y in zip(hours, marks)]\nprint(residuals)\nprint("sum of residuals:", round(sum(residuals), 6))\nprint("R-squared:", round(st.correlation(hours, marks) ** 2, 4))`,
        explain: ['zip pairs each x with its y; each residual is actual minus predicted.', 'For a least-squares line the residuals add up to (almost) zero.', 'R-squared is just the correlation squared, a number between 0 and 1.'] },
    ], {
      mistakes: ['Concluding that x causes y because they are correlated.', 'Extrapolating far outside the range of the data.', 'Swapping x and y: the line for y on x is not the line for x on y.', 'Trusting r without a plot; outliers and curves can fool it.'],
      exercises: [
        { q: 'Print the correlation of [1, 2, 3] and [2, 4, 6].', a: 'import statistics as st\nprint(st.correlation([1, 2, 3], [2, 4, 6]))' },
        { q: 'Print the slope of the regression line through x = [1, 2, 3, 4] and y = [3, 5, 7, 9].', a: 'import statistics as st\nprint(st.linear_regression([1, 2, 3, 4], [3, 5, 7, 9]).slope)' },
        { q: 'Print the residual at x = 2 for the line y = 1 + 2x when the actual y is 6.', a: 'print(6 - (1 + 2 * 2))' },
      ],
      quiz: [
        { q: 'A correlation of -0.9 means:', options: ['No relationship', 'A strong relationship where y falls as x rises', 'A strong relationship where y rises with x', 'A mistake in the data'], answer: 1, why: 'A negative r close to -1 is a strong downward straight-line relationship.' },
        { q: 'What does the slope of the regression line tell you?', options: ['The value of y at x = 0', 'The change in y for one unit increase in x', 'The number of points', 'The size of the residuals'], answer: 1, why: 'The slope b is the predicted change in y per unit of x.' },
        { q: 'Why is extrapolation risky?', options: ['The code fails', 'The relationship may not hold outside the observed range', 'The slope changes sign', 'It needs more memory'], answer: 1, why: 'The line was fitted only to the range of data you had.' },
      ],
      challenge: {
        prompt: 'Write predict(xs, ys, new_x) that fits a regression line with statistics.linear_regression and returns the predicted y for new_x, rounded to 2 decimals.',
        starter: 'import statistics\n\ndef predict(xs, ys, new_x):\n    # fit the line, then return intercept + slope * new_x\n    return 0\n',
        check: 'assert predict([1, 2, 3, 4], [3, 5, 7, 9], 5) == 11.0, "Got " + str(predict([1, 2, 3, 4], [3, 5, 7, 9], 5))\nassert predict([1, 2, 3, 4, 5, 6, 7, 8], [40, 48, 52, 58, 63, 70, 74, 81], 2.5) == 49.42, "Check your slope and intercept"\nassert predict([0, 10], [5, 25], 5) == 15.0, "Halfway between the points should be 15.0"',
        hint: 'slope, intercept = statistics.linear_regression(xs, ys); then use intercept + slope * new_x.',
        solution: 'import statistics\n\ndef predict(xs, ys, new_x):\n    slope, intercept = statistics.linear_regression(xs, ys)\n    return round(intercept + slope * new_x, 2)\n',
      },
    }),
];
