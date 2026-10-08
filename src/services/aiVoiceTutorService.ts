/**
 * VENUE — Stage 10N: AI Voice Tutor Service
 *
 * Provides a clean, privacy-safe, scalable Speech-to-Text (STT) and Text-to-Speech (TTS)
 * input/output layer on top of the existing VENUE AI Tutor architecture.
 *
 * Key guarantees:
 * - Uses browser/device SpeechRecognition / webkitSpeechRecognition and window.speechSynthesis.
 * - Never records or uploads raw microphone audio to Firebase Storage or Firestore.
 * - Never auto-sends voice input; always places recognized text into the editable composer
 *   with confidence/ambiguity guidance so the student can verify or edit before sending.
 * - Converts mathematical & scientific LaTeX expressions into natural spoken academic phrasing
 *   when reading AI responses aloud while keeping the visual KaTeX rendering untouched.
 * - Supports Barge-In / Interruption: starting microphone listening immediately stops active TTS playback.
 */

export type AIVoiceInputState =
  | 'ready'
  | 'listening'
  | 'processing'
  | 'transcription_ready'
  | 'error'
  | 'unsupported';

export type AIVoiceOutputState = 'idle' | 'speaking' | 'paused' | 'error' | 'unsupported';

export type AIMicPermissionState =
  | 'not_requested'
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable';

export type AIVoiceSpeechRate = 0.85 | 1.0 | 1.15 | 1.25;

export interface AIVoicePreferences {
  autoReadResponses: boolean;
  speechRate: AIVoiceSpeechRate;
  preferredVoiceURI?: string;
}

export interface AIVoiceTranscriptionResult {
  transcript: string;
  confidence: number; // 0 to 1
  isLowConfidence: boolean;
  hasAmbiguousMath: boolean;
  ambiguityNote?: string;
  languageUsed: string;
}

const VOICE_PREFS_STORAGE_KEY = 'venue_ai_voice_preferences_v1';

class AIVoiceTutorService {
  private recognitionInstance: any = null;
  private isListeningInternal = false;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private activeMessageId: string | null = null;
  private outputStateListeners = new Set<
    (state: AIVoiceOutputState, activeMsgId: string | null) => void
  >();
  private currentOutputState: AIVoiceOutputState = 'idle';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Pre-warm voices list gently when browser supports speechSynthesis
      try {
        window.speechSynthesis.getVoices();
      } catch {}
    }
  }

  /**
   * Checks if browser/device supports SpeechRecognition (STT)
   */
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Checks if browser/device supports SpeechSynthesis (TTS)
   */
  public isSpeechSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
  }

  /**
   * Loads student's local voice output preferences (no Firestore writes needed)
   */
  public getVoicePreferences(): AIVoicePreferences {
    try {
      const raw = localStorage.getItem(VOICE_PREFS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          autoReadResponses: Boolean(parsed.autoReadResponses),
          speechRate:
            parsed.speechRate === 0.85 ||
            parsed.speechRate === 1.0 ||
            parsed.speechRate === 1.15 ||
            parsed.speechRate === 1.25
              ? parsed.speechRate
              : 1.0,
          preferredVoiceURI:
            typeof parsed.preferredVoiceURI === 'string' ? parsed.preferredVoiceURI : undefined,
        };
      }
    } catch {}
    return {
      autoReadResponses: false,
      speechRate: 1.0,
    };
  }

  public saveVoicePreferences(updates: Partial<AIVoicePreferences>): AIVoicePreferences {
    const current = this.getVoicePreferences();
    const next: AIVoicePreferences = {
      ...current,
      ...updates,
    };
    try {
      localStorage.setItem(VOICE_PREFS_STORAGE_KEY, JSON.stringify(next));
    } catch {}
    return next;
  }

  /**
   * Queries microphone permission state without triggering a prompt unless requested
   */
  public async checkMicrophonePermission(): Promise<AIMicPermissionState> {
    if (typeof window === 'undefined' || !navigator?.mediaDevices) {
      return 'unavailable';
    }
    try {
      if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        const status = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        if (status.state === 'granted') return 'granted';
        if (status.state === 'denied') return 'denied';
        return 'not_requested';
      }
    } catch {
      // Fallback for browsers where permissions.query('microphone') is not supported
    }
    return 'not_requested';
  }

  /**
   * Maps AI Tutor language preference to BCP-47 speech recognition / synthesis locale
   */
  public resolveSpeechLocale(languagePreference?: string, textSample?: string): string {
    const pref = (languagePreference || 'auto').trim().toLowerCase();
    if (pref === 'kiswahili' || pref === 'sw') return 'sw-TZ';
    if (pref === 'french' || pref === 'fr') return 'fr-FR';
    if (pref === 'spanish' || pref === 'es') return 'es-ES';
    if (pref === 'arabic' || pref === 'ar') return 'ar-SA';
    if (pref === 'german' || pref === 'de') return 'de-DE';
    if (pref === 'hindi' || pref === 'hi') return 'hi-IN';
    if (pref === 'chinese' || pref === 'zh') return 'zh-CN';
    if (pref === 'english' || pref === 'en') return 'en-US';

    // Auto-detect from textSample when speaking aloud
    if (textSample) {
      const sampleLower = textSample.toLowerCase();
      const swahiliMarkers = [
        'nini',
        'kwa',
        'katika',
        'uwezekano',
        'kokotoa',
        'tofauti',
        'kanuni',
        'hatua',
        'mfano',
        'swali',
        'jibu',
        'eleza',
        'tafadhali',
        'kutoka',
      ];
      let swHits = 0;
      for (const marker of swahiliMarkers) {
        if (new RegExp(`\\b${marker}\\b`, 'i').test(sampleLower)) {
          swHits++;
        }
      }
      if (swHits >= 2) {
        return 'sw-TZ';
      }
    }

    return 'en-US';
  }

  /**
   * Cleans & normalizes spoken mathematical and academic phrases while preserving exact meaning.
   * Also detects whether the recognized math expression is potentially ambiguous so the UI can
   * prompt the student to verify before sending.
   */
  public analyzeAndFormatSpokenAcademicTranscript(
    rawTranscript: string,
    confidence: number
  ): AIVoiceTranscriptionResult {
    let text = (rawTranscript || '').trim();

    // Preserve mathematical words accurately while normalizing common spacing/symbol artifacts
    text = text
      .replace(/\bx\s+squared\b/gi, 'x^2')
      .replace(/\by\s+squared\b/gi, 'y^2')
      .replace(/\bz\s+squared\b/gi, 'z^2')
      .replace(/\bx\s+cubed\b/gi, 'x^3')
      .replace(/\by\s+cubed\b/gi, 'y^3')
      .replace(/\bsigma\s+squared\b/gi, 'σ^2')
      .replace(/\bx\s+bar\b/gi, 'x̄')
      .replace(/\bp\s+hat\b/gi, 'p̂')
      .replace(/\bgreater\s+than\s+or\s+equal\s+to\b/gi, '≥')
      .replace(/\bless\s+than\s+or\s+equal\s+to\b/gi, '≤')
      .replace(/\bnot\s+equal\s+to\b/gi, '≠')
      .replace(/\bapproaches\s+infinity\b/gi, '→ ∞');

    // Capitalize first letter if it's a normal sentence
    if (text.length > 1 && /^[a-z]/.test(text)) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    // Check for ambiguous spoken math expressions (e.g., nested fractions/integrals/powers without clear grouping)
    const lower = text.toLowerCase();
    const hasAmbiguousMath =
      /\b(over|divided by)\b.*\b(plus|minus|over|divided by)\b/i.test(lower) ||
      /\b(to the power of|raised to)\b.*\b(plus|minus|times)\b/i.test(lower) ||
      /\b(integral|derivative|limit|matrix|determinant|summation)\b/i.test(lower);

    const effectiveConfidence =
      typeof confidence === 'number' && confidence > 0 ? confidence : 0.88;
    const isLowConfidence = effectiveConfidence < 0.72;

    let ambiguityNote: string | undefined;
    if (isLowConfidence) {
      ambiguityNote =
        'Voice recognition confidence was low. Please review and edit your question before sending.';
    } else if (hasAmbiguousMath) {
      ambiguityNote =
        'Mathematical expression detected — please verify the symbols/terms in the box below before sending.';
    }

    return {
      transcript: text,
      confidence: effectiveConfidence,
      isLowConfidence,
      hasAmbiguousMath,
      ambiguityNote,
      languageUsed: 'auto',
    };
  }

  /**
   * Starts speech-to-text listening using the browser's SpeechRecognition API.
   * Automatically interrupts any active TTS speech output (barge-in).
   */
  public startListening(callbacks: {
    languagePreference?: string;
    onStateChange: (state: AIVoiceInputState) => void;
    onInterimResult: (interimText: string) => void;
    onFinalResult: (result: AIVoiceTranscriptionResult) => void;
    onError: (friendlyMessage: string, permissionState?: AIMicPermissionState) => void;
  }): void {
    // Barge-in: immediately stop any AI voice playback when student starts speaking
    this.stopSpeaking();

    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onStateChange('unsupported');
      callbacks.onError(
        "Voice input isn't supported in this browser. You can type your question instead.",
        'unavailable'
      );
      return;
    }

    // Stop any previous recognition instance cleanly
    this.stopListening();

    try {
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionCtor();
      this.recognitionInstance = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = this.resolveSpeechLocale(callbacks.languagePreference);

      let accumulatedFinal = '';
      let latestInterim = '';
      let bestConfidence = 0.9;
      let hasCompleted = false;

      recognition.onstart = () => {
        this.isListeningInternal = true;
        callbacks.onStateChange('listening');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const transcriptChunk = res[0]?.transcript || '';
          const chunkConf = typeof res[0]?.confidence === 'number' ? res[0].confidence : 0.9;
          if (res.isFinal) {
            accumulatedFinal += ` ${transcriptChunk}`;
            if (chunkConf > 0) {
              bestConfidence = chunkConf;
            }
          } else {
            interim += transcriptChunk;
          }
        }
        latestInterim = interim;
        const preview = `${accumulatedFinal} ${interim}`.trim();
        if (preview) {
          callbacks.onInterimResult(preview);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListeningInternal = false;
        hasCompleted = true;
        const errCode = String(event?.error || '').toLowerCase();

        if (errCode === 'aborted') {
          callbacks.onStateChange('ready');
          return;
        }

        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          callbacks.onStateChange('error');
          callbacks.onError(
            'Microphone access is disabled. You can enable it in your device/browser settings or continue using text.',
            'denied'
          );
          return;
        }

        if (errCode === 'audio-capture') {
          callbacks.onStateChange('error');
          callbacks.onError(
            'No working microphone was detected on your device. You can continue typing your question.',
            'unavailable'
          );
          return;
        }

        if (errCode === 'no-speech') {
          callbacks.onStateChange('error');
          callbacks.onError(
            'No speech was detected. Tap the microphone to try again, or type your question below.'
          );
          return;
        }

        if (errCode === 'network') {
          callbacks.onStateChange('error');
          callbacks.onError(
            'Network connection interrupted during voice recognition. Please try again or type your question.'
          );
          return;
        }

        callbacks.onStateChange('error');
        callbacks.onError(
          "Voice input isn't available right now. You can type your question instead."
        );
      };

      recognition.onend = () => {
        this.isListeningInternal = false;
        this.recognitionInstance = null;
        if (hasCompleted) return;
        hasCompleted = true;

        const finalRaw = (accumulatedFinal || latestInterim).trim();
        if (!finalRaw) {
          callbacks.onStateChange('ready');
          return;
        }

        callbacks.onStateChange('processing');
        const processed = this.analyzeAndFormatSpokenAcademicTranscript(
          finalRaw,
          bestConfidence
        );
        callbacks.onStateChange('transcription_ready');
        callbacks.onFinalResult(processed);
      };

      recognition.start();
    } catch (err) {
      this.isListeningInternal = false;
      this.recognitionInstance = null;
      callbacks.onStateChange('error');
      callbacks.onError(
        "Voice input isn't available right now. You can type your question instead."
      );
    }
  }

  /**
   * Stops active microphone listening immediately
   */
  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch {
        try {
          this.recognitionInstance.abort();
        } catch {}
      }
      this.recognitionInstance = null;
    }
    this.isListeningInternal = false;
  }

  public isCurrentlyListening(): boolean {
    return this.isListeningInternal;
  }

  // ==========================================================================
  // AI VOICE OUTPUT (TEXT-TO-SPEECH)
  // ==========================================================================

  public subscribeOutputState(
    listener: (state: AIVoiceOutputState, activeMsgId: string | null) => void
  ): () => void {
    this.outputStateListeners.add(listener);
    listener(this.currentOutputState, this.activeMessageId);
    return () => {
      this.outputStateListeners.delete(listener);
    };
  }

  private notifyOutputState(state: AIVoiceOutputState, msgId: string | null) {
    this.currentOutputState = state;
    this.activeMessageId = msgId;
    this.outputStateListeners.forEach((cb) => {
      try {
        cb(state, msgId);
      } catch {}
    });
  }

  /**
   * Converts Markdown + LaTeX mathematical notation into natural, clear spoken academic text
   * so the synthesizer reads formulas intelligibly rather than saying "dollar sign backslash frac".
   */
  public convertAcademicResponseToSpokenText(
    markdownText: string,
    formula?: string,
    steps?: string[]
  ): string {
    let full = markdownText || '';
    if (formula && !full.includes(formula)) {
      full += `. Key formula: ${formula}.`;
    }
    if (Array.isArray(steps) && steps.length > 0) {
      full += `. Step-by-step breakdown: ${steps
        .map((s, idx) => `Step ${idx + 1}: ${s}`)
        .join('. ')}`;
    }

    const latexToSpeech = (latex: string): string => {
      return latex
        .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1) over ($2)')
        .replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, 'the $1 root of $2')
        .replace(/\\sqrt\{([^{}]+)\}/g, 'the square root of $1')
        .replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, 'the integral from $1 to $2 of ')
        .replace(/\\int_([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, 'the integral from $1 to $2 of ')
        .replace(/\\int/g, 'the integral of ')
        .replace(/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, 'the sum from $1 to $2 of ')
        .replace(/\\sum/g, 'the summation of ')
        .replace(/\\lim_\{([^{}]+)\\to([^{}]+)\}/g, 'the limit as $1 approaches $2 of ')
        .replace(/\\to/g, ' approaches ')
        .replace(/\\infty/g, ' infinity ')
        .replace(/\\pi/g, ' pi ')
        .replace(/\\mu/g, ' mu ')
        .replace(/\\sigma\^2/g, ' sigma squared ')
        .replace(/\\sigma/g, ' sigma ')
        .replace(/\\alpha/g, ' alpha ')
        .replace(/\\beta/g, ' beta ')
        .replace(/\\theta/g, ' theta ')
        .replace(/\\lambda/g, ' lambda ')
        .replace(/\\Delta/g, ' delta ')
        .replace(/\\mid/g, ' given ')
        .replace(/\\cap/g, ' intersection ')
        .replace(/\\cup/g, ' union ')
        .replace(/\\leq|\\le/g, ' is less than or equal to ')
        .replace(/\\geq|\\ge/g, ' is greater than or equal to ')
        .replace(/\\neq|\\ne/g, ' is not equal to ')
        .replace(/\\approx/g, ' is approximately equal to ')
        .replace(/\\times|\\cdot/g, ' times ')
        .replace(/\\pm/g, ' plus or minus ')
        .replace(/\^2\b/g, ' squared')
        .replace(/\^3\b/g, ' cubed')
        .replace(/\^\{([^{}]+)\}/g, ' to the power of $1')
        .replace(/_\{([^{}]+)\}/g, ' sub $1')
        .replace(/\\left|\\right|\\Big|\\big/g, '')
        .replace(/\\[a-zA-Z]+/g, ' ')
        .replace(/[{}]/g, ' ');
    };

    // Replace display and inline LaTeX blocks with spoken equivalents
    let spoken = full
      .replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => ` ${latexToSpeech(math)} `)
      .replace(/\$([^$\n]+)\$/g, (_, math) => ` ${latexToSpeech(math)} `)
      .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => ` ${latexToSpeech(math)} `)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => ` ${latexToSpeech(math)} `);

    // Strip code blocks, SVG markup, and Markdown formatting characters
    spoken = spoken
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/```[\s\S]*?```/g, ' (refer to the code block on screen) ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\s*[-*+]\s+/gm, '. ')
      .replace(/\|/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return spoken.slice(0, 3800);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSynthesisSupported()) return [];
    try {
      return window.speechSynthesis.getVoices() || [];
    } catch {
      return [];
    }
  }

  /**
   * Speaks the given AI message aloud using SpeechSynthesis
   */
  public speakResponse(params: {
    messageId: string;
    text: string;
    formula?: string;
    steps?: string[];
    languagePreference?: string;
    rateOverride?: AIVoiceSpeechRate;
  }): void {
    if (!this.isSpeechSynthesisSupported()) {
      this.notifyOutputState('unsupported', null);
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {}

    const spokenText = this.convertAcademicResponseToSpokenText(
      params.text,
      params.formula,
      params.steps
    );

    if (!spokenText) {
      this.notifyOutputState('idle', null);
      return;
    }

    const prefs = this.getVoicePreferences();
    const utterance = new SpeechSynthesisUtterance(spokenText);
    const targetLocale = this.resolveSpeechLocale(params.languagePreference, params.text);
    utterance.lang = targetLocale;
    utterance.rate = params.rateOverride || prefs.speechRate || 1.0;

    const voices = this.getAvailableVoices();
    if (voices.length > 0) {
      const langPrefix = targetLocale.split('-')[0].toLowerCase();
      const matchedVoice =
        (prefs.preferredVoiceURI &&
          voices.find((v) => v.voiceURI === prefs.preferredVoiceURI)) ||
        voices.find((v) => v.lang.toLowerCase() === targetLocale.toLowerCase()) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      this.notifyOutputState('speaking', params.messageId);
    };

    utterance.onpause = () => {
      this.notifyOutputState('paused', params.messageId);
    };

    utterance.onresume = () => {
      this.notifyOutputState('speaking', params.messageId);
    };

    utterance.onend = () => {
      if (this.activeUtterance === utterance) {
        this.activeUtterance = null;
        this.notifyOutputState('idle', null);
      }
    };

    utterance.onerror = (ev: any) => {
      const errType = String(ev?.error || '').toLowerCase();
      if (errType === 'canceled' || errType === 'interrupted') {
        this.notifyOutputState('idle', null);
        return;
      }
      this.activeUtterance = null;
      this.notifyOutputState('error', params.messageId);
    };

    this.activeUtterance = utterance;
    this.notifyOutputState('speaking', params.messageId);
    window.speechSynthesis.speak(utterance);
  }

  public pauseSpeaking(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        this.notifyOutputState('paused', this.activeMessageId);
      }
    } catch {}
  }

  public resumeSpeaking(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.notifyOutputState('speaking', this.activeMessageId);
      }
    } catch {}
  }

  public stopSpeaking(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    this.activeUtterance = null;
    this.notifyOutputState('idle', null);
  }
}

export const aiVoiceTutorService = new AIVoiceTutorService();
