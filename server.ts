import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Persistent Student Profiles File Storage
const PROFILES_DIR = path.join(process.cwd(), '.storage');
const PROFILES_FILE = path.join(PROFILES_DIR, 'student_profiles.json');
const RESULTS_FILE = path.join(PROFILES_DIR, 'student_results.json');

function ensureStorageDir() {
  if (!fs.existsSync(PROFILES_DIR)) {
    fs.mkdirSync(PROFILES_DIR, { recursive: true });
  }
}

function readAllProfiles(): Record<string, any> {
  ensureStorageDir();
  if (!fs.existsSync(PROFILES_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(PROFILES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading student profiles:', err);
    return {};
  }
}

function writeAllProfiles(profiles: Record<string, any>) {
  ensureStorageDir();
  try {
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving student profiles:', err);
  }
}

function readAllResults(): Record<string, any[]> {
  ensureStorageDir();
  if (!fs.existsSync(RESULTS_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(RESULTS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading student results:', err);
    return {};
  }
}

function writeAllResults(results: Record<string, any[]>) {
  ensureStorageDir();
  try {
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving student results:', err);
  }
}

// Lazy-initialize Gemini client to prevent crashes if GEMINI_API_KEY is unset at startup
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please open Settings > Secrets in Google AI Studio and set your GEMINI_API_KEY secret.'
    );
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Student Profile Endpoints (Durable server persistence)
app.get('/api/student/profile/:uid', (req, res) => {
  const { uid } = req.params;
  if (!uid) {
    return res.status(400).json({ success: false, error: 'UID is required' });
  }
  const profiles = readAllProfiles();
  const profile = profiles[uid];
  if (!profile) {
    return res.status(404).json({ success: false, notFound: true, message: 'Profile not found' });
  }
  return res.json({ success: true, profile });
});

app.get('/api/student/profile/by-email/:email', (req, res) => {
  try {
    const rawEmail = req.params.email;
    const email = decodeURIComponent(rawEmail).toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const profiles = readAllProfiles();
    const foundKey = Object.keys(profiles).find(
      (k) => (profiles[k]?.email || '').toLowerCase().trim() === email
    );
    if (foundKey && profiles[foundKey]) {
      return res.json({ success: true, profile: profiles[foundKey] });
    }
    return res.status(404).json({ success: false, notFound: true, message: 'Profile not found' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

app.post('/api/student/profile', (req, res) => {
  try {
    const { uid, profile } = req.body;
    if (!uid || !profile) {
      return res.status(400).json({ success: false, error: 'UID and profile payload are required' });
    }
    const profiles = readAllProfiles();
    const existing = profiles[uid] || {};
    const updated = {
      ...existing,
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    };
    profiles[uid] = updated;
    writeAllProfiles(profiles);

    return res.json({ success: true, profile: updated });
  } catch (err: any) {
    console.error('Error saving profile:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to save profile' });
  }
});

// Student Course Results Endpoints (Database-backed GPA results)
app.get('/api/student/results/:uid', (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ success: false, error: 'UID is required' });
    }
    const allResults = readAllResults();
    const results = allResults[uid] || [];
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

app.post('/api/student/results', (req, res) => {
  try {
    const { uid, result } = req.body;
    if (!uid || !result || !result.courseId) {
      return res.status(400).json({ success: false, error: 'UID and valid course result are required' });
    }
    const allResults = readAllResults();
    const userResults = allResults[uid] || [];
    const existingIndex = userResults.findIndex(
      (r: any) =>
        r.id === result.id ||
        (r.courseId === result.courseId &&
          r.semester === result.semester &&
          r.academicYear === result.academicYear)
    );
    if (existingIndex >= 0) {
      userResults[existingIndex] = { ...userResults[existingIndex], ...result };
    } else {
      userResults.push(result);
    }
    allResults[uid] = userResults;
    writeAllResults(allResults);
    return res.json({ success: true, results: userResults });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to save result' });
  }
});

app.delete('/api/student/results/:uid/:resultId', (req, res) => {
  try {
    const { uid, resultId } = req.params;
    if (!uid || !resultId) {
      return res.status(400).json({ success: false, error: 'UID and resultId are required' });
    }
    const allResults = readAllResults();
    const userResults = allResults[uid] || [];
    allResults[uid] = userResults.filter((r: any) => r.id !== resultId);
    writeAllResults(allResults);
    return res.json({ success: true, results: allResults[uid] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed to delete result' });
  }
});

// AI Tutor Chat endpoint
app.post('/api/tutor/chat', async (req, res) => {
  try {
    const {
      message = '',
      image,
      history = [],
      courseContext = 'All Courses',
      studentName,
      languagePreference = 'auto',
    } = req.body;

    const trimmedMsg = typeof message === 'string' ? message.trim() : '';
    const hasImage = Boolean(image && image.data);

    if (!trimmedMsg && !hasImage) {
      return res.status(400).json({
        error: 'Please provide a text question or an image to analyze.',
      });
    }

    const ai = getGeminiClient();

    // Construct tailored system instruction
    const systemInstruction = `You are VENUE AI Tutor, a world-class, academically rigorous personal AI study assistant for university students across supported universities.
You comprehensively assist students across:
- Mathematics (Calculus, Real Analysis, Linear Algebra, Ordinary & Partial Differential Equations, Topology, Complex Analysis, Numerical Analysis, Discrete Math)
- Statistics & Probability (Probability Distributions, Mathematical Statistics, Sampling Theory, Hypothesis Testing, Regression, Time Series, Biostatistics)
- Economics (Microeconomics, Macroeconomics, Quantitative Economics, Econometrics)
- Programming & Data Science (R language, Python, Algorithms, Pandas, NumPy, Data Structures, Debugging)
- Physics, Engineering, and general academic problem solving, study guidance, exam revision, and conceptual syntheses.

Current Student Context:
- Course Focus: ${courseContext && courseContext !== 'All Courses' ? courseContext : 'General (All Courses)'}
${studentName ? `- Student Name: ${studentName}` : ''}

Key Capabilities & Strict Rules:

${
  languagePreference && languagePreference !== 'auto'
    ? `1. LANGUAGE OVERRIDE:
The student has explicitly selected their preferred response language as: "${languagePreference}".
- Formulate your entire textual explanation, steps, and suggestions in ${languagePreference}.
- Maintain standard international LaTeX notation for all mathematical formulas ($...$, $$...$$, \\frac{...}{...}).
- Do NOT switch to any other language.`
    : `1. TRUE MULTILINGUAL INTELLIGENCE:
- Automatically detect the student's language from their input query.
- Reply fluently and consistently in the EXACT SAME language used by the student (English, Kiswahili, natural mixed Swahili-English 'Swanglish', French, etc.).
- If the student mixes Kiswahili and English (e.g. "Nisaidie kusolve hii equation", "Eleza Normal Distribution kwa Kiswahili"), understand the mixed context naturally and answer with academic fluency without oscillating between languages.
- NEVER randomly switch language halfway through an answer.
- Preserve standard formal mathematical notation in LaTeX across all languages.`
}

2. MULTIMODAL ACADEMIC RECOGNITION:
When an image is provided (handwritten math, textbook snapshot, whiteboard photo, formula, graph, table, or assignment question):
a) Transcribe and read the question accurately.
b) Check readability: if the image is too blurry, poorly lit, cropped, or illegible, explicitly notify the student with helpful advice on how to retake the photo.
c) Clearly state what is given and what the question asks to solve.
d) If the student's handwritten working is visible in the photo, inspect each step, identify and explain any errors gently and accurately.
e) Provide a step-by-step rigorous solution.
f) State the final answer clearly.

3. PROFESSIONAL MATHEMATICAL RENDERING (LaTeX / KaTeX):
- Format ALL formulas, equations, limits, integrals, matrices, fractions, and symbols using standard LaTeX:
  * Fractions MUST be written vertically as \\frac{numerator}{denominator}, NEVER flat 'a/b' or '(a+b)/c' for formal mathematical expressions.
  * Inline math: use single dollar signs, e.g. $f'(x)$, $\\int_0^1 x dx$, $\\frac{a+b}{c}$.
  * Display math: use double dollar signs, e.g. $$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$.
  * Use proper notations: \\sum, \\int, \\prod, \\lim, \\sigma, \\mu, \\alpha, \\beta, \\lambda, \\partial, \\pmatrix, \\begin{aligned}...\\end{aligned}.
- In 'formula', provide the single most significant theorem or formula in LaTeX notation.
- In 'steps', provide clean derivation steps where each step uses LaTeX for math notation. Do not add repetitive boilerplate cards.

4. INTERACTIVE GRAPHS & VISUALIZATIONS:
When the student asks to plot, visualize, graph, or illustrate functions or data (or when an interactive plot is mathematically instructive, e.g. quadratic curve, normal distribution N(0, 1), binomial PMF, regression scatter + trend line, supply & demand):
- Include a structured 'chart' object with 15-30 realistic, accurately calculated data points!
- 'type': 'line' | 'bar' | 'scatter' | 'area' | 'pie'
- 'title': concise chart title
- 'xAxisLabel', 'yAxisLabel': clear descriptive labels
- 'data': array of points { x: string | number, y: number, ... }
- 'series': array of { dataKey: 'y', name: 'Series label', color: '#38bdf8' }

5. ANTI-HALLUCINATION & RIGOR:
Strictly answer what the student asks. Never return generic canned answers.`;

    // Construct conversation history
    interface ChatItem {
      role?: 'user' | 'model';
      sender?: 'user' | 'assistant';
      text?: string;
    }

    const contents: Array<{ role: 'user' | 'model'; parts: any[] }> = [];

    if (Array.isArray(history)) {
      for (const item of history as ChatItem[]) {
        const role = item.role === 'user' || item.sender === 'user' ? 'user' : 'model';
        const text = (item.text || '').trim();
        if (!text) continue;

        // Skip leading assistant messages before the first user message
        if (contents.length === 0 && role === 'model') {
          continue;
        }

        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          const lastPart = contents[contents.length - 1].parts[0];
          if (lastPart && typeof lastPart.text === 'string') {
            lastPart.text += `\n\n${text}`;
          }
        } else {
          contents.push({
            role,
            parts: [{ text }],
          });
        }
      }
    }

    // Build current user message parts
    const currentParts: any[] = [];

    if (hasImage) {
      let base64Data = image.data;
      let mimeType = image.mimeType || 'image/jpeg';
      if (base64Data.includes(';base64,')) {
        const splitArr = base64Data.split(';base64,');
        const mimeMatch = splitArr[0].match(/:(.*?)$/);
        if (mimeMatch) mimeType = mimeMatch[1];
        base64Data = splitArr[1];
      }
      currentParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    const defaultPrompt = hasImage
      ? 'Please analyze this academic image/photo thoroughly: identify the question, explain what is given and asked, solve it step-by-step with proper mathematical notation, diagnose any mistakes if student handwritten working is present, and state the final answer clearly.'
      : 'Explain clearly and solve step-by-step.';

    currentParts.push({
      text: trimmedMsg || defaultPrompt,
    });

    contents.push({
      role: 'user',
      parts: currentParts,
    });

    // Try candidate models in order: gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3.1-flash-lite, gemini-flash-latest
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];
    let lastError: any = null;
    let responseText = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description:
                    'The core academic explanation, response, or solution. Format math with standard LaTeX inline $...$ or display $$...$$ and vertical fractions \\frac{a}{b}. Include markdown formatting where appropriate.',
                },
                formula: {
                  type: Type.STRING,
                  description: 'Key mathematical, statistical, or theoretical formula/equation in LaTeX notation.',
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Sequential step-by-step derivation or calculation points in LaTeX notation.',
                },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 to 3 relevant follow-up questions in the student query language.',
                },
                detectedLanguage: {
                  type: Type.STRING,
                  description: 'Detected language (e.g. English, Kiswahili, Mixed).',
                },
                chart: {
                  type: Type.OBJECT,
                  description: 'Optional interactive chart when the query involves graphing, plotting functions, visualizing distributions, or comparing data.',
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: 'Type of chart: line, bar, scatter, area, or pie.',
                    },
                    title: { type: Type.STRING, description: 'Chart title.' },
                    description: { type: Type.STRING, description: 'Brief description of what is plotted.' },
                    xAxisLabel: { type: Type.STRING, description: 'Label for horizontal axis.' },
                    yAxisLabel: { type: Type.STRING, description: 'Label for vertical axis.' },
                    data: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          x: { type: Type.STRING, description: 'x-axis value or category label.' },
                          y: { type: Type.NUMBER, description: 'Primary numeric value.' },
                          y2: { type: Type.NUMBER, description: 'Secondary numeric value if multiple series.' },
                        },
                        required: ['x', 'y'],
                      },
                      description: 'Array of data points for the chart.',
                    },
                    series: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          dataKey: { type: Type.STRING, description: 'Field name matching data property, e.g. y or y2.' },
                          name: { type: Type.STRING, description: 'Legend label for this series.' },
                          color: { type: Type.STRING, description: 'Hex color code, e.g. #38bdf8.' },
                        },
                        required: ['dataKey', 'name'],
                      },
                    },
                  },
                  required: ['type', 'title', 'data'],
                },
                diagramSvg: {
                  type: Type.STRING,
                  description: 'Optional raw SVG string if a geometric construction or diagram is helpful.',
                },
              },
              required: ['text'],
            },
          },
        });

        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
      }
    }

    if (!responseText && lastError) {
      throw lastError;
    }

    let parsedData: {
      text: string;
      formula?: string;
      steps?: string[];
      suggestions?: string[];
      detectedLanguage?: string;
      chart?: any;
      diagramSvg?: string;
    };

    try {
      parsedData = JSON.parse(responseText);
      if (!parsedData.text) {
        parsedData.text = responseText;
      }
    } catch {
      parsedData = {
        text: responseText || 'I processed your request, but could not format the response properly. Please ask again.',
      };
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini AI Tutor Error:', error);
    const errorMessage = error?.message || 'Failed to generate response from Gemini AI.';
    const isKeyError = errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API key');
    const isQuotaError =
      errorMessage.includes('quota') ||
      errorMessage.includes('RESOURCE_EXHAUSTED') ||
      errorMessage.includes('rate-limit') ||
      errorMessage.includes('ResourceExhausted');

    return res.status(500).json({
      success: false,
      error: errorMessage,
      isConfigError: isKeyError,
      isQuotaError,
      message: isKeyError
        ? 'Gemini API key is missing or invalid. Please configure your GEMINI_API_KEY in Google AI Studio under Settings > Secrets.'
        : isQuotaError
        ? 'Gemini API request limit reached. Please wait a brief moment and retry your question.'
        : errorMessage,
    });
  }
});

// Dedicated Image Generation Endpoint with real Gemini image models
app.post('/api/tutor/generate-image', async (req, res) => {
  try {
    const { prompt = '' } = req.body;
    const cleanPrompt = typeof prompt === 'string' ? prompt.trim() : '';

    if (!cleanPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a prompt describing the image to generate.',
      });
    }

    const ai = getGeminiClient();

    // Supported image models in @google/genai SDK
    const imageCandidateModels = [
      'gemini-3.1-flash-lite-image',
      'gemini-3.1-flash-image',
    ];

    let generatedImageUrl: string | null = null;
    let lastError: any = null;
    let attemptedModel = '';

    for (const modelName of imageCandidateModels) {
      try {
        attemptedModel = modelName;
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                text: cleanPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: '1:1',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }

        if (generatedImageUrl) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Image generation with ${modelName} encountered:`, err?.message || err);
      }
    }

    if (generatedImageUrl) {
      return res.json({
        success: true,
        imageUrl: generatedImageUrl,
        prompt: cleanPrompt,
        model: attemptedModel,
      });
    }

    // Report clearly that image generation requires a key with image quota
    const errMessage = lastError?.message || '';
    const isQuotaOrPaid =
      errMessage.includes('quota') ||
      errMessage.includes('429') ||
      errMessage.includes('billing') ||
      errMessage.includes('not found') ||
      errMessage.includes('404');

    return res.json({
      success: false,
      unavailable: true,
      modelAttempted: attemptedModel,
      error: isQuotaOrPaid
        ? 'Gemini direct image generation is currently unavailable under your current API key tier. A Google AI Studio project with image model quota enabled is required.'
        : `Image generation unavailable: ${errMessage}`,
      fallbackMessage: `Image generation request received for "${cleanPrompt}". Currently, direct AI image generation is not enabled on this Gemini API key tier. However, VENUE AI Tutor can provide comprehensive mathematical formulas, step-by-step explanations, SVG diagrams, or interactive function plots for this topic.`,
    });
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to process image generation request.',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VENUE Server running on http://localhost:${PORT}`);
  });
}

startServer();
