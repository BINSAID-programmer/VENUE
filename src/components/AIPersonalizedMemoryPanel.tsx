import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Trash2,
  Sliders,
  ShieldCheck,
  X,
  RefreshCw,
  ChevronRight,
  Award,
  Lightbulb,
} from 'lucide-react';
import {
  AIPersonalizedTutorMemory,
  AIPersonalizationPreferences,
  AIPreferredExplanationLevel,
  AIExplanationStyle,
} from '../types';
import { aiTutorFoundationService } from '../services/aiTutorFoundationService';

interface AIPersonalizedMemoryPanelProps {
  studentId: string;
  selectedCourseCode?: string;
  authorizedCourses: Array<{ code: string; title: string }>;
  onClose: () => void;
  onActionSelect?: (action: {
    type: 'practice' | 'study_mode' | 'quiz' | 'flashcards' | 'exam_prep';
    courseCode: string;
    topic: string;
  }) => void;
  onMemoryUpdated?: () => void;
}

export const AIPersonalizedMemoryPanel: React.FC<AIPersonalizedMemoryPanelProps> = ({
  studentId,
  selectedCourseCode = 'All Courses',
  authorizedCourses,
  onClose,
  onActionSelect,
  onMemoryUpdated,
}) => {
  const [memories, setMemories] = useState<AIPersonalizedTutorMemory[]>([]);
  const [preferences, setPreferences] = useState<AIPersonalizationPreferences>(() =>
    aiTutorFoundationService.getPersonalizationPreferences(studentId)
  );
  const [courseFilter, setCourseFilter] = useState<string>(
    selectedCourseCode && selectedCourseCode !== 'All Courses' ? selectedCourseCode : 'ALL'
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'topics' | 'preferences'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [confirmResetScope, setConfirmResetScope] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load from active course if selected, plus all cached course memories
      if (courseFilter !== 'ALL') {
        await aiTutorFoundationService.getTopicMemoriesForCourse(studentId, courseFilter, 25);
      } else if (selectedCourseCode && selectedCourseCode !== 'All Courses') {
        await aiTutorFoundationService.getTopicMemoriesForCourse(
          studentId,
          selectedCourseCode,
          25
        );
      }
      const allCached = aiTutorFoundationService.getAllCachedTopicMemories(studentId);
      setMemories(allCached);
      setPreferences(aiTutorFoundationService.getPersonalizationPreferences(studentId));
    } catch (err) {
      console.warn('Error loading student learning memory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId, courseFilter]);

  const authorizedCodeSet = useMemo(() => {
    const s = new Set<string>();
    authorizedCourses.forEach((c) => {
      if (c.code) s.add(c.code.trim().toUpperCase());
    });
    return s;
  }, [authorizedCourses]);

  // Filter memories to authorized courses + active course filter
  const filteredMemories = useMemo(() => {
    return memories.filter((m) => {
      const code = (m.courseCode || m.courseId || '').trim().toUpperCase();
      if (authorizedCodeSet.size > 0 && code && code !== 'GENERAL' && code !== 'ALL COURSES') {
        if (!authorizedCodeSet.has(code)) return false;
      }
      if (courseFilter !== 'ALL') {
        return code === courseFilter.trim().toUpperCase();
      }
      return true;
    });
  }, [memories, courseFilter, authorizedCodeSet]);

  const categorized = useMemo(() => {
    const needsReview: AIPersonalizedTutorMemory[] = [];
    const developing: AIPersonalizedTutorMemory[] = [];
    const strong: AIPersonalizedTutorMemory[] = [];

    for (const m of filteredMemories) {
      const ev = aiTutorFoundationService.evaluateMasteryClassification({
        masteryScore: m.masteryScore,
        attempts: m.attempts ?? 1,
        correctCount: m.correctCount ?? 0,
        incorrectCount: m.incorrectCount ?? 0,
        lastPracticedAt: m.lastPracticedAt || m.updatedAt,
      });

      if (ev.masteryLevel === 'needs_review' || ev.masteryLevel === 'novice') {
        needsReview.push(m);
      } else if (
        ev.masteryLevel === 'strong' ||
        ev.masteryLevel === 'proficient' ||
        ev.masteryLevel === 'mastered'
      ) {
        strong.push(m);
      } else if (ev.masteryLevel === 'developing') {
        developing.push(m);
      }
    }

    return { needsReview, developing, strong };
  }, [filteredMemories]);

  const recommendedActions = useMemo(() => {
    return aiTutorFoundationService.getRecommendedNextActionsFromMemory(
      filteredMemories,
      courseFilter !== 'ALL' ? courseFilter : selectedCourseCode
    );
  }, [filteredMemories, courseFilter, selectedCourseCode]);

  const handleToggleMemoryEnabled = (enabled: boolean) => {
    const updated = aiTutorFoundationService.savePersonalizationPreferences(
      { personalizationEnabled: enabled },
      studentId
    );
    setPreferences(updated);
    setStatusBanner(
      enabled
        ? 'Personalized Tutor Memory enabled. The AI Tutor will adapt to your learning progress.'
        : 'Personalized Tutor Memory paused. New sessions will not record or apply memory signals.'
    );
    onMemoryUpdated?.();
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleUpdateExplanationLevel = (level: AIPreferredExplanationLevel) => {
    const updated = aiTutorFoundationService.savePersonalizationPreferences(
      { preferredExplanationLevel: level },
      studentId
    );
    setPreferences(updated);
    setStatusBanner('Preferred explanation depth updated.');
    onMemoryUpdated?.();
    setTimeout(() => setStatusBanner(null), 3000);
  };

  const handleUpdateExplanationStyle = (style: AIExplanationStyle) => {
    const updated = aiTutorFoundationService.savePersonalizationPreferences(
      { preferredExplanationStyle: style },
      studentId
    );
    setPreferences(updated);
    setStatusBanner('Preferred teaching style updated.');
    onMemoryUpdated?.();
    setTimeout(() => setStatusBanner(null), 3000);
  };

  const handleDeleteSingleTopic = async (memoryId: string, topicName: string) => {
    await aiTutorFoundationService.deleteSingleTopicMemory(studentId, memoryId);
    setMemories((prev) => prev.filter((m) => m.id !== memoryId && m.memoryId !== memoryId));
    setStatusBanner(`Removed learning memory for "${topicName}".`);
    onMemoryUpdated?.();
    setTimeout(() => setStatusBanner(null), 3500);
  };

  const handleResetMemory = async (scopeCourseCode?: string) => {
    setIsResetting(true);
    try {
      await aiTutorFoundationService.resetStudentLearningMemory({
        userId: studentId,
        courseCode: scopeCourseCode,
      });
      await loadData();
      setConfirmResetScope(null);
      setStatusBanner(
        scopeCourseCode
          ? `Reset learning memory for ${scopeCourseCode}.`
          : `Reset all Personalized Tutor Memory across courses.`
      );
      onMemoryUpdated?.();
      setTimeout(() => setStatusBanner(null), 4000);
    } finally {
      setIsResetting(false);
    }
  };

  const getMasteryBadge = (m: AIPersonalizedTutorMemory) => {
    const ev = aiTutorFoundationService.evaluateMasteryClassification({
      masteryScore: m.masteryScore,
      attempts: m.attempts ?? 1,
      correctCount: m.correctCount ?? 0,
      incorrectCount: m.incorrectCount ?? 0,
      lastPracticedAt: m.lastPracticedAt || m.updatedAt,
    });
    if (ev.masteryLevel === 'strong' || ev.masteryLevel === 'mastered') {
      return {
        label: 'Strong Mastery',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500',
      };
    }
    if (ev.masteryLevel === 'proficient') {
      return {
        label: 'Proficient',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        bar: 'bg-teal-500',
      };
    }
    if (ev.masteryLevel === 'needs_review' || ev.masteryLevel === 'novice') {
      return {
        label: 'Needs Review',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500',
      };
    }
    if (ev.masteryLevel === 'developing') {
      return {
        label: 'Developing',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        bar: 'bg-blue-500',
      };
    }
    return {
      label: 'Not Assessed Yet',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      bar: 'bg-slate-400',
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Personalized Learning Memory
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    preferences.personalizationEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      preferences.personalizationEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {preferences.personalizationEnabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Academic topic mastery, learning preferences, and tailored study recommendations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close Learning Memory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner */}
        {statusBanner && (
          <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between text-xs text-blue-800 font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              onClick={() => setStatusBanner(null)}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-navigation & Course Filter */}
        <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Learning Insights
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'topics'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Topic Breakdown</span>
              <span className="px-1.5 py-0.2 bg-slate-200/80 text-slate-700 rounded-md text-[10px]">
                {filteredMemories.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Preferences & Privacy</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500">Course:</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">All Authorized Courses</option>
              {authorizedCourses.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/40">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading your personalized learning memory...</p>
            </div>
          ) : activeTab === 'overview' ? (
            <>
              {/* Summary Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-white border border-amber-200/80 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Topics to Review
                    </span>
                    <span className="text-lg font-bold text-amber-700">
                      {categorized.needsReview.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Concepts where recent quiz, practice, or flashcard signals suggest extra reinforcement.
                  </p>
                </div>

                <div className="bg-white border border-blue-200/80 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-blue-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Developing Topics
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {categorized.developing.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Topics actively being studied or practiced with growing confidence.
                  </p>
                </div>

                <div className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Strong Topics
                    </span>
                    <span className="text-lg font-bold text-emerald-700">
                      {categorized.strong.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Concepts consistently answered accurately across multiple attempts.
                  </p>
                </div>
              </div>

              {/* Recommended Next Actions */}
              {recommendedActions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Recommended Next Actions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recommendedActions.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-200 transition-all"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                              {act.courseCode}
                            </span>
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {act.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {act.reason}
                          </p>
                        </div>
                        {onActionSelect && (
                          <button
                            onClick={() => {
                              onActionSelect({
                                type: act.actionType,
                                courseCode: act.courseCode,
                                topic: act.topic,
                              });
                              onClose();
                            }}
                            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            <span>Start</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Two-Column Breakdown: Topics to Review & Strong Topics */}
              {filteredMemories.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    No Learning Signals Recorded Yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    As you study in Study Mode, solve problems in Homework Mode, take Quizzes, practice questions, or review Flashcards, VENUE AI Tutor will build a private learning profile here to personalize explanations for you.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topics to Review */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Topics Needing Review
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {categorized.needsReview.length + categorized.developing.length} topic(s)
                      </span>
                    </div>

                    {categorized.needsReview.length === 0 && categorized.developing.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No weak or developing topics flagged right now. Great job!
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {[...categorized.needsReview, ...categorized.developing]
                          .slice(0, 6)
                          .map((m) => {
                            const badge = getMasteryBadge(m);
                            return (
                              <div
                                key={m.id}
                                className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                                        {m.courseCode || m.courseId}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900">
                                        {m.topic}
                                      </span>
                                    </div>
                                    {m.weaknesses && m.weaknesses.length > 0 && (
                                      <p className="text-[11px] text-amber-700 mt-1">
                                        Focus areas: {m.weaknesses.slice(0, 3).join(', ')}
                                      </p>
                                    )}
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.bg}`}
                                  >
                                    {badge.label} ({m.masteryScore}%)
                                  </span>
                                </div>

                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${badge.bar}`}
                                    style={{ width: `${Math.max(8, m.masteryScore)}%` }}
                                  />
                                </div>

                                {onActionSelect && (
                                  <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                                    <button
                                      onClick={() => {
                                        onActionSelect({
                                          type: 'practice',
                                          courseCode: m.courseCode || m.courseId,
                                          topic: m.topic,
                                        });
                                        onClose();
                                      }}
                                      className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Practice Topic
                                    </button>
                                    <button
                                      onClick={() => {
                                        onActionSelect({
                                          type: 'study_mode',
                                          courseCode: m.courseCode || m.courseId,
                                          topic: m.topic,
                                        });
                                        onClose();
                                      }}
                                      className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Study Step-by-Step
                                    </button>
                                    <button
                                      onClick={() => {
                                        onActionSelect({
                                          type: 'flashcards',
                                          courseCode: m.courseCode || m.courseId,
                                          topic: m.topic,
                                        });
                                        onClose();
                                      }}
                                      className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] font-semibold transition-colors cursor-pointer"
                                    >
                                      Flashcards
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Strong Topics */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" />
                        Strong & Proficient Topics
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {categorized.strong.length} topic(s)
                      </span>
                    </div>

                    {categorized.strong.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        Complete quizzes, practice sessions, or flashcard reviews to build verified topic mastery.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {categorized.strong.slice(0, 6).map((m) => {
                          const badge = getMasteryBadge(m);
                          return (
                            <div
                              key={m.id}
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                      {m.courseCode || m.courseId}
                                    </span>
                                    <span className="text-xs font-bold text-slate-900">
                                      {m.topic}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {m.correctCount || 0}/{m.attempts || 1} accurate signals • Confidence:{' '}
                                    <span className="capitalize font-medium">
                                      {m.confidenceLevel || 'moderate'}
                                    </span>
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.bg}`}
                                >
                                  {badge.label} ({m.masteryScore}%)
                                </span>
                              </div>

                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${badge.bar}`}
                                  style={{ width: `${Math.max(10, m.masteryScore)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'topics' ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  All Recorded Topic Signals ({filteredMemories.length})
                </h3>
                <span className="text-[11px] text-slate-500">
                  You can remove any individual topic signal at any time
                </span>
              </div>

              {filteredMemories.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No topic signals recorded for this filter yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredMemories.map((m) => {
                    const badge = getMasteryBadge(m);
                    return (
                      <div
                        key={m.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                              {m.courseCode || m.courseId}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{m.topic}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}
                            >
                              {badge.label} • {m.masteryScore}%
                            </span>
                            <span className="text-[11px] text-slate-400">
                              ({m.attempts || 1} signal{(m.attempts || 1) > 1 ? 's' : ''},{' '}
                              {m.confidenceLevel || 'low'} confidence)
                            </span>
                          </div>

                          {m.commonMistakes && m.commonMistakes.length > 0 && (
                            <p className="text-xs text-slate-600">
                              <span className="font-semibold text-slate-700">Noted challenges:</span>{' '}
                              {m.commonMistakes.slice(0, 3).join(' • ')}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>
                              Style:{' '}
                              <strong className="text-slate-600">
                                {m.preferredExplanationStyle.replace(/_/g, ' ')}
                              </strong>
                            </span>
                            {m.lastSignalSource && (
                              <span>
                                Last activity:{' '}
                                <strong className="text-slate-600">{m.lastSignalSource}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onActionSelect && (
                            <button
                              onClick={() => {
                                onActionSelect({
                                  type: 'practice',
                                  courseCode: m.courseCode || m.courseId,
                                  topic: m.topic,
                                });
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Practice
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSingleTopic(m.id, m.topic)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove this topic from memory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Preferences & Privacy Tab */
            <div className="space-y-4">
              {/* Toggle Personalized Memory */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Enable Personalized Learning Memory
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When enabled, VENUE AI Tutor remembers your academic topic mastery, common math/coursework mistakes, and preferred explanation style across Study Mode, Homework, Practice, Quizzes, and Flashcards.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleMemoryEnabled(!preferences.personalizationEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    preferences.personalizationEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      preferences.personalizationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Preferred Explanation Level */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Default Explanation Depth
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose how the AI Tutor should pitch explanations by default (you can always override this in any message, e.g., &quot;Explain simply&quot; or &quot;Give me an advanced question&quot;).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      {
                        id: 'very_simple',
                        title: 'Very Simple',
                        desc: 'Everyday analogies & intuitive steps first',
                      },
                      {
                        id: 'beginner',
                        title: 'Beginner',
                        desc: 'Foundational concepts before formal math',
                      },
                      {
                        id: 'intermediate',
                        title: 'Intermediate',
                        desc: 'Balanced undergraduate theory + worked examples',
                      },
                      {
                        id: 'advanced',
                        title: 'Advanced',
                        desc: 'High-yield rigor, derivations & exam depth',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateExplanationLevel(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferences.preferredExplanationLevel === opt.id
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Teaching Style */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Preferred Teaching Style
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select how you prefer mathematical and conceptual explanations to be structured.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      {
                        id: 'step_by_step',
                        title: 'Step-by-Step',
                        desc: 'Numbered sequential derivations and worked steps',
                      },
                      {
                        id: 'visual_intuitive',
                        title: 'Visual & Intuitive',
                        desc: 'Intuition, diagrams, and concrete examples',
                      },
                      {
                        id: 'concise_formula',
                        title: 'Concise & Formula-First',
                        desc: 'Direct equations, definitions, and fast application',
                      },
                      {
                        id: 'rigorous_proof',
                        title: 'Formal & Rigorous',
                        desc: 'Full mathematical proofs and theoretical depth',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateExplanationStyle(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        preferences.preferredExplanationStyle === opt.id
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900">{opt.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Learning Memory Controls */}
              <div className="bg-white border border-red-200/80 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-red-600" />
                      Reset Learning Memory
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Clear your recorded topic mastery and mistake signals. Your saved notes, course materials, and chat history are not affected.
                    </p>
                  </div>
                </div>

                {confirmResetScope ? (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs font-semibold text-red-800">
                      {confirmResetScope === 'ALL'
                        ? 'Are you sure you want to reset ALL Personalized Tutor Memory across all courses?'
                        : `Are you sure you want to reset learning memory for ${confirmResetScope}?`}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={isResetting}
                        onClick={() =>
                          handleResetMemory(confirmResetScope === 'ALL' ? undefined : confirmResetScope)
                        }
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                      >
                        {isResetting ? 'Resetting...' : 'Yes, Reset Memory'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmResetScope(null)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5">
                    {courseFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setConfirmResetScope(courseFilter)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50/60 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset {courseFilter} Memory</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmResetScope('ALL')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset All Learning Memory</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Strict academic privacy: Only course/topic learning signals are stored for your account.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
