import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import {
  aiVoiceTutorService,
  AIVoiceInputState,
  AIVoiceOutputState,
  AIVoiceSpeechRate,
  AIVoiceTranscriptionResult,
} from '../services/aiVoiceTutorService';

// ============================================================================
// 1. VOICE INPUT COMPOSER CONTROL + STATUS BANNER
// ============================================================================

interface AIVoiceMicButtonProps {
  languagePreference?: string;
  disabled?: boolean;
  currentText: string;
  onUpdateText: (newText: string) => void;
  onFocusInput?: () => void;
  onVoiceStatusUpdate?: (status: {
    state: AIVoiceInputState;
    interimText: string;
    notice: string | null;
    isError: boolean;
  }) => void;
}

export const AIVoiceMicButton: React.FC<AIVoiceMicButtonProps> = ({
  languagePreference = 'auto',
  disabled = false,
  currentText,
  onUpdateText,
  onFocusInput,
  onVoiceStatusUpdate,
}) => {
  const [voiceState, setVoiceState] = useState<AIVoiceInputState>('ready');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    setIsSupported(aiVoiceTutorService.isSpeechRecognitionSupported());
    return () => {
      aiVoiceTutorService.stopListening();
    };
  }, []);

  const updateStatus = (
    state: AIVoiceInputState,
    interimText: string,
    notice: string | null,
    isError = false
  ) => {
    setVoiceState(state);
    onVoiceStatusUpdate?.({ state, interimText, notice, isError });
  };

  const handleToggleListening = () => {
    if (disabled) return;

    if (!isSupported) {
      updateStatus(
        'unsupported',
        '',
        "Voice input isn't available in this browser. You can type your question instead.",
        true
      );
      return;
    }

    if (voiceState === 'listening') {
      aiVoiceTutorService.stopListening();
      updateStatus('ready', '', null, false);
      return;
    }

    const basePrefix = currentText.trim() ? `${currentText.trim()} ` : '';

    aiVoiceTutorService.startListening({
      languagePreference,
      onStateChange: (nextState) => {
        setVoiceState(nextState);
        if (nextState === 'listening') {
          onVoiceStatusUpdate?.({
            state: 'listening',
            interimText: '',
            notice: 'Listening... Speak your question clearly. Tap Stop when done.',
            isError: false,
          });
        } else if (nextState === 'processing') {
          onVoiceStatusUpdate?.({
            state: 'processing',
            interimText: '',
            notice: 'Processing speech...',
            isError: false,
          });
        }
      },
      onInterimResult: (interimText) => {
        onUpdateText(`${basePrefix}${interimText}`);
        onVoiceStatusUpdate?.({
          state: 'listening',
          interimText,
          notice: 'Listening... Tap Stop when finished speaking.',
          isError: false,
        });
      },
      onFinalResult: (result: AIVoiceTranscriptionResult) => {
        const finalCombined = `${basePrefix}${result.transcript}`.trim();
        onUpdateText(finalCombined);
        onFocusInput?.();

        const reviewNote =
          result.ambiguityNote ||
          'Transcription ready — review or edit your question below before sending.';

        onVoiceStatusUpdate?.({
          state: 'transcription_ready',
          interimText: '',
          notice: reviewNote,
          isError: false,
        });
      },
      onError: (friendlyMessage) => {
        onVoiceStatusUpdate?.({
          state: 'error',
          interimText: '',
          notice: friendlyMessage,
          isError: true,
        });
      },
    });
  };

  const isListening = voiceState === 'listening';
  const isProcessing = voiceState === 'processing';

  return (
    <button
      type="button"
      onClick={handleToggleListening}
      disabled={disabled || isProcessing}
      aria-label={
        isListening
          ? 'Stop voice recording'
          : isProcessing
          ? 'Processing voice input'
          : 'Speak question using microphone'
      }
      aria-pressed={isListening}
      title={
        isListening
          ? 'Stop listening'
          : isProcessing
          ? 'Processing speech...'
          : 'Voice Input (Speak your question)'
      }
      className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px] ${
        isListening
          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs ring-2 ring-red-200'
          : isProcessing
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 disabled:opacity-40'
      }`}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isListening ? (
        <Square className="w-3.5 h-3.5 fill-current" />
      ) : !isSupported ? (
        <MicOff className="w-4 h-4 text-slate-400" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
};

// ============================================================================
// 2. SUBTLE VOICE INPUT STATUS BAR (ABOVE COMPOSER)
// ============================================================================

interface AIVoiceStatusBannerProps {
  state: AIVoiceInputState;
  notice: string | null;
  isError: boolean;
  onStopListening: () => void;
  onDismiss: () => void;
}

export const AIVoiceStatusBanner: React.FC<AIVoiceStatusBannerProps> = ({
  state,
  notice,
  isError,
  onStopListening,
  onDismiss,
}) => {
  if (state === 'ready' && !notice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-2 px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
        state === 'listening'
          ? 'bg-red-50/90 border-red-200 text-red-900'
          : isError || state === 'error' || state === 'unsupported'
          ? 'bg-amber-50/90 border-amber-200 text-amber-900'
          : state === 'transcription_ready'
          ? 'bg-blue-50/80 border-blue-200 text-slate-800'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        {state === 'listening' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-red-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Listening...</span>
          </span>
        )}
        {state === 'processing' && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-blue-700 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </span>
        )}
        {state === 'transcription_ready' && (
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        )}
        {(isError || state === 'error' || state === 'unsupported') && (
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <span className="truncate sm:whitespace-normal">{notice}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {state === 'listening' ? (
          <button
            type="button"
            onClick={onStopListening}
            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Dismiss voice status"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 3. AI RESPONSE READ ALOUD / VOICE OUTPUT CONTROLS
// ============================================================================

interface AIReadAloudControlProps {
  messageId: string;
  text: string;
  formula?: string;
  steps?: string[];
  languagePreference?: string;
}

const SPEECH_RATES: AIVoiceSpeechRate[] = [0.85, 1.0, 1.15, 1.25];

export const AIReadAloudControl: React.FC<AIReadAloudControlProps> = ({
  messageId,
  text,
  formula,
  steps,
  languagePreference = 'auto',
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [outputState, setOutputState] = useState<AIVoiceOutputState>('idle');
  const [activeMsgId, setActiveMsgId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<AIVoiceSpeechRate>(() =>
    aiVoiceTutorService.getVoicePreferences().speechRate
  );

  useEffect(() => {
    setIsSupported(aiVoiceTutorService.isSpeechSynthesisSupported());
    const unsub = aiVoiceTutorService.subscribeOutputState((st, id) => {
      setOutputState(st);
      setActiveMsgId(id);
    });
    return unsub;
  }, []);

  if (!isSupported) {
    return null;
  }

  const isThisMessageActive = activeMsgId === messageId && outputState !== 'idle';
  const isSpeaking = isThisMessageActive && outputState === 'speaking';
  const isPaused = isThisMessageActive && outputState === 'paused';

  const handleStartOrReplay = () => {
    aiVoiceTutorService.speakResponse({
      messageId,
      text,
      formula,
      steps,
      languagePreference,
      rateOverride: speechRate,
    });
  };

  const handleCycleSpeed = () => {
    const idx = SPEECH_RATES.indexOf(speechRate);
    const nextRate = SPEECH_RATES[(idx + 1) % SPEECH_RATES.length];
    setSpeechRate(nextRate);
    aiVoiceTutorService.saveVoicePreferences({ speechRate: nextRate });
    if (isThisMessageActive) {
      aiVoiceTutorService.speakResponse({
        messageId,
        text,
        formula,
        steps,
        languagePreference,
        rateOverride: nextRate,
      });
    }
  };

  if (!isThisMessageActive) {
    return (
      <button
        type="button"
        onClick={handleStartOrReplay}
        className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer py-1"
        title="Read response aloud"
        aria-label="Read response aloud"
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span>Read aloud</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Voice playback controls"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50/90 border border-blue-200/90 text-blue-800 text-xs"
    >
      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-blue-700">
        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
        <span>{isPaused ? 'Paused' : 'Speaking'}</span>
      </span>

      {isSpeaking ? (
        <button
          type="button"
          onClick={() => aiVoiceTutorService.pauseSpeaking()}
          className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
          title="Pause reading"
          aria-label="Pause reading"
        >
          <Pause className="w-3 h-3" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => aiVoiceTutorService.resumeSpeaking()}
          className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
          title="Resume reading"
          aria-label="Resume reading"
        >
          <Play className="w-3 h-3" />
        </button>
      )}

      <button
        type="button"
        onClick={() => aiVoiceTutorService.stopSpeaking()}
        className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
        title="Stop reading"
        aria-label="Stop reading"
      >
        <Square className="w-3 h-3 fill-current" />
      </button>

      <button
        type="button"
        onClick={handleStartOrReplay}
        className="p-1 rounded hover:bg-blue-100 text-blue-700 cursor-pointer"
        title="Replay from beginning"
        aria-label="Replay response"
      >
        <RotateCcw className="w-3 h-3" />
      </button>

      <button
        type="button"
        onClick={handleCycleSpeed}
        className="px-1.5 py-0.5 rounded bg-white/80 hover:bg-white text-[10px] font-bold text-blue-800 border border-blue-200 cursor-pointer"
        title="Change speech speed"
        aria-label={`Speech speed ${speechRate}x`}
      >
        {speechRate}x
      </button>
    </div>
  );
};
