import { AIChartData } from '../types';

/**
 * Safe Mathematical Expression Evaluator (NO eval() or Function() used)
 * Evaluates functions of single variable `x` over a defined interval.
 */
export function evaluateMathFunction(expr: string, x: number): number | null {
  try {
    const cleanExpr = expr
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/y\s*=\s*/g, '')
      .replace(/f\(x\)\s*=\s*/g, '');

    // Common standard functions
    if (cleanExpr === 'x^2' || cleanExpr === 'x**2' || cleanExpr === 'x*x') {
      return x * x;
    }
    if (cleanExpr === 'x^3' || cleanExpr === 'x**3') {
      return Math.pow(x, 3);
    }
    if (cleanExpr === 'sin(x)' || cleanExpr === 'sin x') {
      return Math.sin(x);
    }
    if (cleanExpr === 'cos(x)' || cleanExpr === 'cos x') {
      return Math.cos(x);
    }
    if (cleanExpr === 'tan(x)' || cleanExpr === 'tan x') {
      const val = Math.tan(x);
      return Math.abs(val) > 15 ? null : val;
    }
    if (cleanExpr === 'e^x' || cleanExpr === 'exp(x)' || cleanExpr === 'e**x') {
      return Math.exp(x);
    }
    if (cleanExpr === 'log(x)' || cleanExpr === 'ln(x)') {
      return x <= 0 ? null : Math.log(x);
    }
    if (cleanExpr === 'sqrt(x)') {
      return x < 0 ? null : Math.sqrt(x);
    }
    if (cleanExpr === '1/x') {
      return Math.abs(x) < 0.001 ? null : 1 / x;
    }
    if (cleanExpr === 'abs(x)' || cleanExpr === '|x|') {
      return Math.abs(x);
    }

    // Standard Normal Distribution PDF: (1 / sqrt(2*pi)) * e^(-x^2 / 2)
    if (cleanExpr.includes('normal') || cleanExpr.includes('gaussian') || cleanExpr === 'bell_curve') {
      return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
    }

    // Simple polynomial handler: a*x^2 + b*x + c
    const polyMatch = cleanExpr.match(/^([+-]?\d*\.?\d*)x\^2([+-]\d*\.?\d*)x([+-]\d*\.?\d*)$/);
    if (polyMatch) {
      const a = polyMatch[1] === '' || polyMatch[1] === '+' ? 1 : polyMatch[1] === '-' ? -1 : parseFloat(polyMatch[1]);
      const b = polyMatch[2] === '+' ? 1 : polyMatch[2] === '-' ? -1 : parseFloat(polyMatch[2]);
      const c = parseFloat(polyMatch[3]);
      return a * x * x + b * x + c;
    }

    // Fallback: Safe token-based evaluation
    return safeTokenEval(cleanExpr, x);
  } catch {
    return null;
  }
}

/**
 * Safe token-based evaluator without eval
 */
function safeTokenEval(expr: string, x: number): number | null {
  // Replace constants and variable x
  let parsed = expr
    .replace(/\bpi\b/g, Math.PI.toString())
    .replace(/\be\b/g, Math.E.toString())
    .replace(/x/g, `(${x})`);

  // Simple safe arithmetic: basic sums/products
  // Prevent any dangerous JS characters
  if (/[^0-9+\-*/().^eE\s]/.test(parsed)) {
    return null;
  }

  // Handle power operator ^
  parsed = parsed.replace(/\^/g, '**');

  // Simple recursive descent parser for basic math
  return computeArithmetic(parsed);
}

/**
 * Basic recursive arithmetic parser (Strictly numbers + - * /)
 */
function computeArithmetic(str: string): number | null {
  let s = str.replace(/\s+/g, '');
  // Safe validation check
  if (!/^[0-9+\-*/().]*$/.test(s)) return null;

  try {
    // Use Math evaluation safely via structured decomposition
    let index = 0;

    function parsePrimary(): number {
      if (s[index] === '(') {
        index++;
        const val = parseExpr();
        if (s[index] === ')') index++;
        return val;
      }
      if (s[index] === '-') {
        index++;
        return -parsePrimary();
      }
      if (s[index] === '+') {
        index++;
        return parsePrimary();
      }
      let numStr = '';
      while (index < s.length && /[0-9.]/.test(s[index])) {
        numStr += s[index];
        index++;
      }
      return parseFloat(numStr) || 0;
    }

    function parseFactor(): number {
      let left = parsePrimary();
      while (index < s.length && (s[index] === '*' || s[index] === '/')) {
        const op = s[index];
        index++;
        const right = parsePrimary();
        if (op === '*') left *= right;
        else if (op === '/') left = right === 0 ? 0 : left / right;
      }
      return left;
    }

    function parseExpr(): number {
      let left = parseFactor();
      while (index < s.length && (s[index] === '+' || s[index] === '-')) {
        const op = s[index];
        index++;
        const right = parseFactor();
        if (op === '+') left += right;
        else if (op === '-') left -= right;
      }
      return left;
    }

    const res = parseExpr();
    return isFinite(res) ? res : null;
  } catch {
    return null;
  }
}

export interface GraphSpecOptions {
  title?: string;
  description?: string;
  xMin?: number;
  xMax?: number;
  samples?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
}

/**
 * Generates an AIChartData object from a mathematical formula
 */
export function generateFunctionGraph(
  formula: string,
  options: GraphSpecOptions = {}
): AIChartData | null {
  const clean = formula.trim();
  const xMin = options.xMin ?? (clean.includes('log') || clean.includes('ln') || clean.includes('sqrt') ? 0.1 : -5);
  const xMax = options.xMax ?? 5;
  const samples = options.samples ?? 50;
  const step = (xMax - xMin) / (samples - 1);

  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i < samples; i++) {
    const x = parseFloat((xMin + i * step).toFixed(2));
    const y = evaluateMathFunction(clean, x);
    if (y !== null && isFinite(y)) {
      points.push({
        x,
        y: parseFloat(y.toFixed(4)),
      });
    }
  }

  if (points.length < 5) return null;

  return {
    type: 'line',
    title: options.title || `Graph of ${formula}`,
    description: options.description || `Real-time mathematical plot calculated across interval [${xMin}, ${xMax}]`,
    xAxisLabel: options.xAxisLabel || 'x',
    yAxisLabel: options.yAxisLabel || 'y = f(x)',
    data: points,
    series: [
      {
        dataKey: 'y',
        name: formula,
        color: options.color || '#38bdf8',
      },
    ],
  };
}

/**
 * Standard preset mathematical curves for instant access and study
 */
export const POPULAR_MATH_CURVES = [
  { id: 'quadratic', label: 'y = x²', formula: 'x^2', desc: 'Quadratic parabola with vertex at (0, 0)' },
  { id: 'sine', label: 'y = sin(x)', formula: 'sin(x)', desc: 'Periodic trigonometric wave, amplitude 1' },
  { id: 'exp', label: 'y = eˣ', formula: 'e^x', desc: 'Natural exponential growth curve' },
  { id: 'ln', label: 'y = ln(x)', formula: 'ln(x)', desc: 'Natural logarithm defined for x > 0' },
  { id: 'normal', label: 'Normal N(0, 1)', formula: 'normal', desc: 'Gaussian bell curve distribution' },
  { id: 'cubic', label: 'y = x³ - 3x', formula: 'x^3 - 3*x', desc: 'Cubic polynomial with local extrema' },
];

/**
 * Detects if a text query explicitly asks for a graph or plot
 */
export function isGraphPlotRequest(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('plot') ||
    q.includes('graph') ||
    q.includes('curve') ||
    q.includes('draw y =') ||
    q.includes('sketch') ||
    q.includes('chart') ||
    q.includes('distribution') ||
    q.includes('histogram') ||
    q.includes('scatter')
  );
}
