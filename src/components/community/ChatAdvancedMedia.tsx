import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Play,
  Pause,
  Mic,
  Square,
  Trash2,
  Send,
  X,
  ZoomIn,
  ZoomOut,
  Forward,
  Check,
  Search,
  Lock,
  MessageCircle,
  Users,
  Pin,
  Loader2,
  CornerUpRight,
} from 'lucide-react';
import {
  RealChatMessage,
  RealChatConversation,
  ChatLinkPreview,
  StudentProfile,
  LecturerRecord,
} from '../../types';

// ============================================================================
// 1. VOICE MESSAGE AUDIO PLAYER (WITH DURATION, SEEK & PLAYBACK SPEED)
// ============================================================================
export const VoiceNotePlayer: React.FC<{
  voiceUrl: string;
  durationSec?: number;
  isMine?: boolean;
}> = ({ voiceUrl, durationSec = 0, isMine = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSec || 0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);

  useEffect(() => {
    const audio = new Audio(voiceUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [voiceUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.playbackRate = playbackRate;
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const cycleRate = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = Number(e.target.value);
    setCurrentTime(nextSec);
    if (audioRef.current) {
      audioRef.current.currentTime = nextSec;
    }
  };

  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const maxSec = Math.max(totalDuration, durationSec, 1);

  return (
    <div
      className={`my-1.5 p-2.5 rounded-xl flex items-center gap-2.5 min-w-[215px] max-w-[280px] border ${
        isMine
          ? 'bg-blue-700/60 border-white/20 text-white'
          : 'bg-slate-950/90 border-slate-800 text-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer ${
          isMine
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
        title={isPlaying ? 'Pause voice note' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <input
          type="range"
          min={0}
          max={maxSec}
          step={0.1}
          value={Math.min(currentTime, maxSec)}
          onChange={handleSeek}
          className="w-full h-1.5 accent-sky-400 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] opacity-85 font-mono">
          <span>{formatTime(isPlaying ? currentTime : totalDuration || durationSec)}</span>
          <span className="flex items-center gap-1">
            <Mic className="w-2.5 h-2.5" /> Voice Note
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={cycleRate}
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 cursor-pointer ${
          isMine
            ? 'bg-blue-800/80 text-blue-100 hover:bg-blue-800'
            : 'bg-slate-800 text-sky-300 hover:bg-slate-700'
        }`}
        title="Playback speed"
      >
        {playbackRate}x
      </button>
    </div>
  );
};

// ============================================================================
// 2. VOICE NOTE RECORDER BAR (RECORD, STOP, PREVIEW, CANCEL, SEND)
// ============================================================================
export const VoiceNoteRecorderBar: React.FC<{
  onSendVoiceNote: (blob: Blob, durationSec: number) => Promise<void>;
  onCancel: () => void;
  sending: boolean;
}> = ({ onSendVoiceNote, onCancel, sending }) => {
  const [recording, setRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recError, setRecError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      cleanupStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const cleanupStream = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setRecError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: finalMime });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        cleanupStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setElapsedSec(0);

      timerRef.current = window.setInterval(() => {
        setElapsedSec((prev) => {
          if (prev + 1 >= 180) {
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setRecError(
        'Microphone access is required to record a voice note. Please check your browser permissions.'
      );
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="px-3.5 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
      {recError ? (
        <div className="flex items-center justify-between w-full gap-2 text-xs text-rose-300">
          <span>{recError}</span>
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2.5">
            {recording ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-rose-300">
                  Recording {formatTimer(elapsedSec)}
                </span>
                <span className="text-[10px] text-slate-400">(max 3:00)</span>
              </div>
            ) : previewUrl ? (
              <VoiceNotePlayer voiceUrl={previewUrl} durationSec={elapsedSec} isMine={false} />
            ) : (
              <span className="text-xs text-slate-400">Preparing microphone...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={sending}
              onClick={() => {
                stopRecording();
                cleanupStream();
                onCancel();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              title="Cancel voice note"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>

            {recording ? (
              <button
                type="button"
                onClick={stopRecording}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop &amp; Preview</span>
              </button>
            ) : (
              recordedBlob && (
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => onSendVoiceNote(recordedBlob, Math.max(1, elapsedSec))}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{sending ? 'Uploading...' : 'Send Voice'}</span>
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 3. FILE ATTACHMENT CARD (DOCUMENT / PDF / PPTX / DOCX / XLSX / ZIP)
// ============================================================================
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export const ChatFileAttachmentCard: React.FC<{
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  fileMimeType?: string | null;
  isMine?: boolean;
}> = ({ fileUrl, fileName, fileSize, fileMimeType, isMine = false }) => {
  const ext = (fileName || '')
    .split('.')
    .pop()
    ?.toUpperCase()
    .slice(0, 5) || 'FILE';

  return (
    <div
      className={`my-1.5 p-2.5 rounded-xl border flex items-center justify-between gap-3 max-w-xs ${
        isMine
          ? 'bg-blue-700/60 border-white/20 text-white'
          : 'bg-slate-950/90 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold text-[9px] ${
            isMine
              ? 'bg-white/15 text-white border border-white/20'
              : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
          }`}
        >
          <FileText className="w-3.5 h-3.5 mb-0.5" />
          <span>{ext}</span>
        </div>

        <div className="min-w-0">
          <div className="text-xs font-semibold truncate" title={fileName || 'Attached File'}>
            {fileName || 'Academic Document'}
          </div>
          <div className="text-[10px] opacity-80 flex items-center gap-1.5">
            {fileSize ? <span>{formatFileSize(fileSize)}</span> : null}
            {fileMimeType && (
              <span className="truncate">
                • {fileMimeType.split('/').pop()?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName || undefined}
        className={`p-2 rounded-lg shrink-0 transition cursor-pointer ${
          isMine
            ? 'bg-white/15 hover:bg-white/25 text-white'
            : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
        }`}
        title="Open or download file"
      >
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

// ============================================================================
// 4. LINK PREVIEW CARD (SAFE INTERNAL / ACADEMIC / EXTERNAL LINKS)
// ============================================================================
export const ChatLinkPreviewCard: React.FC<{
  preview: ChatLinkPreview;
  isMine?: boolean;
}> = ({ preview, isMine = false }) => {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`my-1.5 block p-2.5 rounded-xl border transition ${
        isMine
          ? 'bg-blue-700/50 hover:bg-blue-700/70 border-white/20 text-white'
          : 'bg-slate-950/90 hover:bg-slate-950 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                preview.isInternalVenue
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              }`}
            >
              {preview.isInternalVenue ? 'VENUE Link' : preview.domain}
            </span>
          </div>
          <div className="text-xs font-bold truncate">{preview.title}</div>
          {preview.description && (
            <div className="text-[10px] opacity-80 line-clamp-2">{preview.description}</div>
          )}
        </div>
        <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-75 mt-0.5" />
      </div>
    </a>
  );
};

// ============================================================================
// 5. FULL-SCREEN IMAGE LIGHTBOX MODAL (ZOOM, DOWNLOAD, CAPTION)
// ============================================================================
export const ImageLightboxModal: React.FC<{
  imageUrl: string | null;
  caption?: string | null;
  senderName?: string | null;
  onClose: () => void;
}> = ({ imageUrl, caption, senderName, onClose }) => {
  const [zoom, setZoom] = useState(1);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between gap-3 max-w-5xl w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs text-slate-200 truncate">
          {senderName ? <span className="font-bold">{senderName}</span> : 'Shared Image'}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-mono min-w-[44px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.25).toFixed(2))))}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 cursor-pointer"
            title="Open or download image"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-950 text-slate-200 hover:text-rose-300 border border-slate-700 cursor-pointer"
            title="Close viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Viewport */}
      <div
        className="flex-1 flex items-center justify-center overflow-auto my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={caption || 'Full view'}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="max-h-[78vh] max-w-[92vw] object-contain rounded-xl transition-transform duration-150"
        />
      </div>

      {/* Caption Footer */}
      {caption && (
        <div
          className="max-w-2xl w-full mx-auto p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. FORWARD / SHARE MESSAGE MODAL (RESPECTING PERMISSIONS & PRIVACY)
// ============================================================================
export const ForwardMessageModal: React.FC<{
  message: RealChatMessage | null;
  sourceConversation: RealChatConversation | null;
  conversations: RealChatConversation[];
  currentUserUid: string;
  onClose: () => void;
  onForwardToConversation: (targetConversation: RealChatConversation) => Promise<void>;
}> = ({
  message,
  sourceConversation,
  conversations,
  currentUserUid,
  onClose,
  onForwardToConversation,
}) => {
  const [search, setSearch] = useState('');
  const [forwardingToId, setForwardingToId] = useState<string | null>(null);
  const [forwardedIds, setForwardedIds] = useState<Set<string>>(new Set());

  if (!message || !sourceConversation) return null;

  const isPrivateSource =
    sourceConversation.type === 'direct' || sourceConversation.type === 'private_group';

  const eligibleTargets = conversations.filter((c) => {
    if (!c.participantIds?.includes(currentUserUid)) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const title = (c.title || c.communityName || '').toLowerCase();
    const peerMatch = Object.values(c.participants || {}).some((p) =>
      (p.name || '').toLowerCase().includes(q)
    );
    return title.includes(q) || peerMatch;
  });

  const getTargetLabel = (conv: RealChatConversation) => {
    if (conv.type === 'private_group') {
      return {
        name: conv.title || 'Private Study Group',
        badge: 'Private Group',
      };
    }
    if (conv.type === 'community_group') {
      return {
        name: conv.title || conv.communityName || 'Academic Group Chat',
        badge: conv.courseCode || 'Community Chat',
      };
    }
    const otherUid = (conv.participantIds || []).find((id) => id !== currentUserUid) || '';
    const peer = conv.participants?.[otherUid];
    return {
      name: peer?.name || 'Direct Conversation',
      badge: 'Direct Chat',
    };
  };

  const handleTriggerForward = async (target: RealChatConversation) => {
    setForwardingToId(target.conversationId);
    try {
      await onForwardToConversation(target);
      setForwardedIds((prev) => {
        const next = new Set(prev);
        next.add(target.conversationId);
        return next;
      });
    } finally {
      setForwardingToId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CornerUpRight className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-bold text-white">Forward Message</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
          <div className="text-[10px] text-sky-400 font-semibold">
            Original from {message.senderName}
          </div>
          <div className="text-slate-300 line-clamp-2">
            {message.text ||
              (message.imageUrl
                ? '📷 Shared Image'
                : message.fileUrl
                ? `📎 ${message.fileName || 'Document'}`
                : message.voiceUrl
                ? '🎤 Voice Note'
                : 'Message')}
          </div>
        </div>

        {isPrivateSource && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              This message is from a private conversation. Only forward content with appropriate permission.
            </span>
          </div>
        )}

        {/* Search Conversations */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your conversations or groups..."
            className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Destination List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70 rounded-xl border border-slate-800 bg-slate-950/60">
          {eligibleTargets.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No matching conversations found.
            </div>
          ) : (
            eligibleTargets.map((conv) => {
              const info = getTargetLabel(conv);
              const isSent = forwardedIds.has(conv.conversationId);
              const isSending = forwardingToId === conv.conversationId;

              return (
                <div
                  key={conv.conversationId}
                  className="p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{info.name}</div>
                    <div className="text-[10px] text-slate-400">{info.badge}</div>
                  </div>

                  <button
                    type="button"
                    disabled={isSent || isSending}
                    onClick={() => handleTriggerForward(conv)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                      isSent
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isSent ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Sent</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. PINNED MESSAGES BANNER (FOR GROUP / COURSE / INSTITUTIONAL CHATS)
// ============================================================================
export const PinnedMessagesBar: React.FC<{
  pinnedMessages: RealChatMessage[];
  canPin: boolean;
  onJumpToMessage: (messageId: string) => void;
  onUnpinMessage: (messageId: string) => void;
}> = ({ pinnedMessages, canPin, onJumpToMessage, onUnpinMessage }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const safeIdx = activeIndex % pinnedMessages.length;
  const current = pinnedMessages[safeIdx];

  return (
    <div className="px-3.5 py-2 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between gap-2 text-xs">
      <button
        type="button"
        onClick={() => {
          onJumpToMessage(current.messageId);
          if (pinnedMessages.length > 1) {
            setActiveIndex((i) => (i + 1) % pinnedMessages.length);
          }
        }}
        className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer"
      >
        <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
              Pinned Message{' '}
              {pinnedMessages.length > 1 ? `(${safeIdx + 1}/${pinnedMessages.length})` : ''}
            </span>
            <span className="text-[10px] text-slate-400 truncate">• {current.senderName}</span>
          </div>
          <div className="text-xs text-slate-200 truncate">
            {current.text ||
              (current.fileName
                ? `📎 ${current.fileName}`
                : current.imageUrl
                ? '📷 Pinned Image'
                : current.voiceUrl
                ? '🎤 Pinned Voice Note'
                : 'Pinned item')}
          </div>
        </div>
      </button>

      {canPin && (
        <button
          type="button"
          onClick={() => onUnpinMessage(current.messageId)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-300 shrink-0 cursor-pointer"
          title="Unpin message"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
