import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  FileText,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Loader2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Shuffle,
  Edit3,
  Trash2,
  Plus,
  RotateCw,
  FolderOpen,
  Play,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  AcademicMaterialRecord,
  AIFlashcardCardStyle,
  AIFlashcardDeckData,
  AIFlashcardItem,
  AIFlashcardMasteryStatus,
  AILearningDifficulty,
  Course,
  StudentProfile,
} from '../types';
import { MathRenderer, MathBlock } from './MathRenderer';
import {
  SafeRenderErrorBoundary,
  filterValidCitations,
  recoverStructuredTextIfRawJson,
} from '../utils/aiResponseRenderPipeline';
import { aiTutorMaterialContextService } from '../services/aiTutorMaterialContextService';
import { aiTutorFoundationService } from '../services/aiTutorFoundationService';
import { getActiveUserId } from '../services/aiChatService';
import { analyticsTracker } from '../services/analyticsTrackerService';

interface AIFlashcardsWorkspaceProps {
  profile?: StudentProfile;
  courses: Course[];
  selectedCourseContext: string;
  onSelectCourseContext: (courseCode: string) => void;
  languagePreference: string;
  initialTopic?: string;
  initialDifficulty?: AILearningDifficulty;
  onOpenMaterialSource?: (material: AcademicMaterialRecord, initialPage?: number) => void;
  onLaunchStudyModeForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onLaunchPracticeModeForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onLaunchQuizGeneratorForTopic?: (
    courseCode: string,
    topic: string,
    difficulty?: AILearningDifficulty
  ) => void;
  onAskTutorInChat?: (prompt: string, courseCode?: string) => void;
}

const CARD_COUNT_OPTIONS = [5, 10, 15, 20, 25];

const DIFFICULTY_OPTIONS: Array<{
  id: AILearningDifficulty;
  label: string;
  description: string;
}> = [
  {
    id: 'foundational',
    label: 'Beginner',
    description: 'Core definitions, basic notation, and foundational concepts',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: 'University lecture-level theorems, formulas, and standard applications',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Exam-level proofs, edge cases, and multi-step analytical properties',
  },
  {
    id: 'mixed',
    label: 'Mixed',
    description: 'Balanced progression from foundational definitions to exam formulas',
  },
];

const CARD_STYLE_OPTIONS: Array<{
  id: AIFlashcardCardStyle;
  label: string;
  description: string;
}> = [
  {
    id: 'mixed',
    label: 'Mixed',
    description: 'Balanced mix of definitions, concepts, formulas, and Q&A',
  },
  {
    id: 'definitions',
    label: 'Definitions',
    description: 'Key academic terms and concise formal definitions',
  },
  {
    id: 'concepts',
    label: 'Concepts',
    description: 'Theorems, properties, and when/why to apply methods',
  },
  {
    id: 'formulas',
    label: 'Formulas',
    description: 'LaTeX equations, variable meanings, and usage conditions',
  },
  {
    id: 'qa',
    label: 'Question & Answer',
    description: 'Active-recall prompts and quick calculation checks',
  },
];

const LANGUAGE_CHOICES = [
  { value: 'auto', label: 'Auto' },
  { value: 'English', label: 'English' },
  { value: 'Kiswahili', label: 'Kiswahili' },
  { value: 'French', label: 'Français' },
  { value: 'Arabic', label: 'العربية' },
];

type WorkspaceViewMode = 'setup' | 'review' | 'decks';
type ReviewFilterMode = 'all' | 'review_again' | 'unreviewed' | 'known';

export const AIFlashcardsWorkspace: React.FC<AIFlashcardsWorkspaceProps> = ({
  profile,
  courses,
  selectedCourseContext,
  onSelectCourseContext,
  languagePreference,
  initialTopic,
  initialDifficulty,
  onOpenMaterialSource,
  onLaunchStudyModeForTopic,
  onLaunchPracticeModeForTopic,
  onLaunchQuizGeneratorForTopic,
  onAskTutorInChat,
}) => {
  const effectiveUserId = profile?.uid || getActiveUserId();

  // Workspace navigation state
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>('setup');

  // Flashcard Setup Configuration
  const [courseCode, setCourseCode] = useState<string>(() => {
    if (selectedCourseContext && selectedCourseContext !== 'All Courses') {
      return selectedCourseContext;
    }
    return courses[0]?.code || 'All Courses';
  });
  const [topic, setTopic] = useState<string>(initialTopic || '');
  const [cardCount, setCardCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<AILearningDifficulty>(
    initialDifficulty || 'intermediate'
  );
  const [cardStyle, setCardStyle] = useState<AIFlashcardCardStyle>('mixed');
  const [language, setLanguage] = useState<string>(languagePreference || 'auto');

  // Source Selection: Course/Topic vs Selected Authorized Materials vs Summary Text
  const [sourceType, setSourceType] = useState<
    'course_topic' | 'single_material' | 'multiple_materials' | 'summary'
  >('course_topic');
  const [courseMaterials, setCourseMaterials] = useState<AcademicMaterialRecord[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState<boolean>(false);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [summarySourceText, setSummarySourceText] = useState<string>('');

  // Generation & Active Deck State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [activeDeck, setActiveDeck] = useState<AIFlashcardDeckData | null>(null);
  const [savedDecks, setSavedDecks] = useState<AIFlashcardDeckData[]>([]);

  // Interactive Card Review State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilterMode>('all');
  const [shuffledCardIds, setShuffledCardIds] = useState<string[] | null>(null);

  // Card Editing / Customization State
  const [isEditingCard, setIsEditingCard] = useState<boolean>(false);
  const [editFront, setEditFront] = useState<string>('');
  const [editBack, setEditBack] = useState<string>('');
  const [editFormula, setEditFormula] = useState<string>('');
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);
  const [newCardFront, setNewCardFront] = useState<string>('');
  const [newCardBack, setNewCardBack] = useState<string>('');
  const [newCardFormula, setNewCardFormula] = useState<string>('');

  // Inline AI Follow-up Explanation State for Current Card
  const [cardExplanation, setCardExplanation] = useState<{
    cardId: string;
    type: string;
    content: string;
  } | null>(null);
  const [isExplainingCard, setIsExplainingCard] = useState<boolean>(false);

  // Sync external course selection
  useEffect(() => {
    if (
      selectedCourseContext &&
      selectedCourseContext !== 'All Courses' &&
      selectedCourseContext !== courseCode
    ) {
      setCourseCode(selectedCourseContext);
    }
  }, [selectedCourseContext]);

  // Sync external topic/difficulty handoff
  useEffect(() => {
    if (initialTopic && initialTopic.trim()) {
      setTopic(initialTopic.trim());
    }
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
  }, [initialTopic, initialDifficulty]);

  // Load saved decks for user
  const refreshSavedDecks = () => {
    const list = aiTutorFoundationService.listSavedFlashcardDecks(effectiveUserId);
    setSavedDecks(list);
  };

  useEffect(() => {
    refreshSavedDecks();
  }, [effectiveUserId]);

  // Fetch authorized materials when course changes
  useEffect(() => {
    let cancelled = false;
    setIsLoadingMaterials(true);
    aiTutorMaterialContextService
      .fetchAuthorizedMaterials(profile, courses, courseCode)
      .then((items) => {
        if (!cancelled) {
          setCourseMaterials(items);
          setSelectedMaterialIds((prev) =>
            prev.filter((id) => items.some((m) => m.id === id))
          );
          setIsLoadingMaterials(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourseMaterials([]);
          setIsLoadingMaterials(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [profile, courses, courseCode]);

  const selectedCourseObj = useMemo(
    () =>
      courses.find(
        (c) => (c.code || '').trim().toUpperCase() === courseCode.trim().toUpperCase()
      ),
    [courses, courseCode]
  );

  // Suggested topics from syllabus & course materials
  const suggestedTopics = useMemo(() => {
    const set = new Set<string>();
    if (selectedCourseObj?.syllabus && Array.isArray(selectedCourseObj.syllabus)) {
      for (const s of selectedCourseObj.syllabus) {
        if (s.title && s.title.trim()) {
          set.add(s.title.trim());
        }
      }
    }
    for (const m of courseMaterials) {
      if (m.title && m.title.trim()) {
        set.add(m.title.trim());
      }
    }
    return Array.from(set).slice(0, 8);
  }, [selectedCourseObj, courseMaterials]);

  // Filtered and ordered cards for review
  const reviewCards = useMemo(() => {
    if (!activeDeck) return [];
    let base = [...activeDeck.cards];
    if (reviewFilter === 'review_again') {
      base = base.filter((c) => c.status === 'review_again');
    } else if (reviewFilter === 'unreviewed') {
      base = base.filter((c) => c.status === 'unreviewed');
    } else if (reviewFilter === 'known') {
      base = base.filter((c) => c.status === 'known');
    }

    if (shuffledCardIds && shuffledCardIds.length > 0) {
      const orderMap = new Map(shuffledCardIds.map((id, idx) => [id, idx]));
      base.sort((a, b) => (orderMap.get(a.cardId) ?? 999) - (orderMap.get(b.cardId) ?? 999));
    }
    return base;
  }, [activeDeck, reviewFilter, shuffledCardIds]);

  const currentCard: AIFlashcardItem | undefined =
    reviewCards[Math.min(currentIndex, Math.max(0, reviewCards.length - 1))];

  useEffect(() => {
    if (currentIndex >= reviewCards.length && reviewCards.length > 0) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
    setIsEditingCard(false);
    setCardExplanation(null);
  }, [currentIndex, reviewFilter, activeDeck?.deckId]);

  // Toggle material selection
  const handleToggleMaterialId = (id: string) => {
    if (sourceType === 'single_material') {
      setSelectedMaterialIds([id]);
      return;
    }
    setSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Generate Flashcard Deck
  const handleGenerateFlashcards = async () => {
    if (isGenerating) return;
    setErrorBanner(null);

    if (
      (sourceType === 'single_material' || sourceType === 'multiple_materials') &&
      selectedMaterialIds.length === 0
    ) {
      setErrorBanner('Please select at least one authorized course material to generate flashcards from.');
      return;
    }

    if (sourceType === 'summary' && summarySourceText.trim().length < 20) {
      setErrorBanner('Please paste or enter a summary (at least 20 characters) to convert into flashcards.');
      return;
    }

    setIsGenerating(true);

    try {
      const effectiveTopic =
        topic.trim() ||
        (selectedMaterialIds.length > 0
          ? courseMaterials
              .filter((m) => selectedMaterialIds.includes(m.id))
              .map((m) => m.title)
              .slice(0, 2)
              .join(' & ')
          : selectedCourseObj?.title || courseCode || 'Core Concepts');

      const academicContext = await aiTutorMaterialContextService.buildContextForQuery({
        profile,
        courses,
        selectedCourseContext: courseCode,
        initialCourse: selectedCourseObj || null,
        userQuery: `${effectiveTopic} ${cardStyle} flashcards`,
      });

      const personalizedMemoryContext = await aiTutorFoundationService.getRelevantPersonalizedMemoryContext({
        userId: effectiveUserId,
        courseCode,
        courseId: selectedCourseObj?.id || courseCode,
        topic: effectiveTopic,
        userMessage: `${effectiveTopic} ${cardStyle}`,
        mode: 'FLASHCARDS',
        authorizedCourseCodes: courses.map((c) => c.code),
      });

      const response = await fetch('/api/tutor/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_deck',
          courseContext: courseCode,
          topic: effectiveTopic,
          cardCount,
          difficulty,
          cardStyle,
          language,
          sourceType,
          selectedMaterialIds,
          summarySourceText: sourceType === 'summary' ? summarySourceText.trim() : '',
          academicContext,
          studentId: effectiveUserId,
          personalizedMemoryContext,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success || !json.data?.cards?.length) {
        throw new Error(json.error || json.message || 'Could not generate flashcards.');
      }

      const nowIso = new Date().toISOString();
      const cards: AIFlashcardItem[] = json.data.cards;

      const newDeck: AIFlashcardDeckData = {
        deckId: `deck_${Date.now()}`,
        userId: effectiveUserId,
        courseId: selectedCourseObj?.id || courseCode,
        courseCode: courseCode || 'All Courses',
        courseTitle: selectedCourseObj?.title,
        topic: effectiveTopic,
        deckTitle: json.data.deckTitle || `${courseCode}: ${effectiveTopic}`,
        difficulty,
        cardStyle,
        language,
        sourceType,
        ...(selectedMaterialIds.length > 0 ? { selectedMaterialIds } : {}),
        ...(sourceType === 'summary' ? { summarySourceText: summarySourceText.trim() } : {}),
        cards,
        knownCount: 0,
        reviewAgainCount: 0,
        unreviewedCount: cards.length,
        groundedInMaterials: Boolean(json.data.groundedInMaterials),
        referencedMaterials: json.data.referencedMaterials,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await aiTutorFoundationService.saveFlashcardDeckSession(
        newDeck,
        effectiveUserId,
        true
      );
      refreshSavedDecks();
      setActiveDeck(newDeck);
      setReviewFilter('all');
      setShuffledCardIds(null);
      setCurrentIndex(0);
      setIsFlipped(false);
      setViewMode('review');

      analyticsTracker.trackEvent('ai_tutor_query', 'ai_tutor', {
        mode: 'FLASHCARDS',
        courseCode,
        cardCount: cards.length,
        cardStyle,
        groundedInMaterials: Boolean(json.data.groundedInMaterials),
      });
    } catch (err: any) {
      const normalized = aiTutorFoundationService.normalizeError(err, 'FLASHCARDS');
      setErrorBanner(normalized.userMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Mark card as Known ("I know this") or Needs Review ("Review again")
  const handleMarkCardStatus = async (status: AIFlashcardMasteryStatus) => {
    if (!activeDeck || !currentCard) return;

    const updatedCards = activeDeck.cards.map((c) => {
      if (c.cardId !== currentCard.cardId) return c;
      return {
        ...c,
        status,
        reviewCount: (c.reviewCount || 0) + 1,
        lastReviewedAt: new Date().toISOString(),
      };
    });

    const knownCount = updatedCards.filter((c) => c.status === 'known').length;
    const reviewAgainCount = updatedCards.filter((c) => c.status === 'review_again').length;
    const unreviewedCount = Math.max(0, updatedCards.length - knownCount - reviewAgainCount);

    const isCheckpoint =
      knownCount + reviewAgainCount === updatedCards.length ||
      knownCount === updatedCards.length;

    const updatedDeck: AIFlashcardDeckData = {
      ...activeDeck,
      cards: updatedCards,
      knownCount,
      reviewAgainCount,
      unreviewedCount,
      updatedAt: new Date().toISOString(),
    };

    setActiveDeck(updatedDeck);
    await aiTutorFoundationService.saveFlashcardDeckSession(
      updatedDeck,
      effectiveUserId,
      isCheckpoint
    );
    refreshSavedDecks();

    // Automatically advance to next card if in 'all' filter
    if (reviewFilter === 'all' && currentIndex < reviewCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Shuffle cards in review
  const handleShuffleDeck = () => {
    if (!activeDeck) return;
    const ids = activeDeck.cards.map((c) => c.cardId);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setShuffledCardIds(ids);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Reset deck progress
  const handleRestartDeck = async () => {
    if (!activeDeck) return;
    const resetCards = activeDeck.cards.map((c) => ({
      ...c,
      status: 'unreviewed' as AIFlashcardMasteryStatus,
    }));
    const updatedDeck: AIFlashcardDeckData = {
      ...activeDeck,
      cards: resetCards,
      knownCount: 0,
      reviewAgainCount: 0,
      unreviewedCount: resetCards.length,
      updatedAt: new Date().toISOString(),
    };
    setActiveDeck(updatedDeck);
    setReviewFilter('all');
    setShuffledCardIds(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    await aiTutorFoundationService.saveFlashcardDeckSession(
      updatedDeck,
      effectiveUserId,
      false
    );
    refreshSavedDecks();
  };

  // Edit current card
  const handleStartEditCard = () => {
    if (!currentCard) return;
    setEditFront(currentCard.front);
    setEditBack(currentCard.back);
    setEditFormula(currentCard.formulaBlock || '');
    setIsEditingCard(true);
  };

  const handleSaveCardEdit = async () => {
    if (!activeDeck || !currentCard || !editFront.trim() || !editBack.trim()) return;
    const updatedCards = activeDeck.cards.map((c) => {
      if (c.cardId !== currentCard.cardId) return c;
      return {
        ...c,
        front: editFront.trim(),
        back: editBack.trim(),
        ...(editFormula.trim() ? { formulaBlock: editFormula.trim() } : { formulaBlock: undefined }),
      };
    });
    const updatedDeck: AIFlashcardDeckData = {
      ...activeDeck,
      cards: updatedCards,
      updatedAt: new Date().toISOString(),
    };
    setActiveDeck(updatedDeck);
    setIsEditingCard(false);
    await aiTutorFoundationService.saveFlashcardDeckSession(
      updatedDeck,
      effectiveUserId,
      true
    );
    refreshSavedDecks();
  };

  // Delete current card from deck
  const handleDeleteCurrentCard = async () => {
    if (!activeDeck || !currentCard || activeDeck.cards.length <= 1) return;
    const remaining = activeDeck.cards
      .filter((c) => c.cardId !== currentCard.cardId)
      .map((c, idx) => ({ ...c, cardNumber: idx + 1 }));

    const knownCount = remaining.filter((c) => c.status === 'known').length;
    const reviewAgainCount = remaining.filter((c) => c.status === 'review_again').length;
    const unreviewedCount = Math.max(0, remaining.length - knownCount - reviewAgainCount);

    const updatedDeck: AIFlashcardDeckData = {
      ...activeDeck,
      cards: remaining,
      knownCount,
      reviewAgainCount,
      unreviewedCount,
      updatedAt: new Date().toISOString(),
    };
    setActiveDeck(updatedDeck);
    setCurrentIndex((prev) => Math.max(0, Math.min(prev, remaining.length - 1)));
    await aiTutorFoundationService.saveFlashcardDeckSession(
      updatedDeck,
      effectiveUserId,
      true
    );
    refreshSavedDecks();
  };

  // Add custom card to deck
  const handleAddCustomCard = async () => {
    if (!activeDeck || !newCardFront.trim() || !newCardBack.trim()) return;
    const newItem: AIFlashcardItem = {
      cardId: `fc_custom_${Date.now()}`,
      cardNumber: activeDeck.cards.length + 1,
      style: newCardFormula.trim() ? 'formulas' : 'qa',
      topic: activeDeck.topic || activeDeck.courseCode,
      difficulty:
        activeDeck.difficulty === 'mixed' || activeDeck.difficulty === 'adaptive'
          ? 'intermediate'
          : activeDeck.difficulty,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      ...(newCardFormula.trim() ? { formulaBlock: newCardFormula.trim() } : {}),
      status: 'unreviewed',
      reviewCount: 0,
      groundedInMaterials: false,
    };

    const nextCards = [...activeDeck.cards, newItem];
    const updatedDeck: AIFlashcardDeckData = {
      ...activeDeck,
      cards: nextCards,
      unreviewedCount: activeDeck.unreviewedCount + 1,
      updatedAt: new Date().toISOString(),
    };

    setActiveDeck(updatedDeck);
    setNewCardFront('');
    setNewCardBack('');
    setNewCardFormula('');
    setIsAddingCard(false);
    setReviewFilter('all');
    setCurrentIndex(nextCards.length - 1);
    setIsFlipped(false);

    await aiTutorFoundationService.saveFlashcardDeckSession(
      updatedDeck,
      effectiveUserId,
      true
    );
    refreshSavedDecks();
  };

  // Request AI follow-up explanation on current card
  const handleExplainCurrentCard = async (
    followUpType: 'explain' | 'simpler' | 'example' | 'formula_breakdown'
  ) => {
    if (!activeDeck || !currentCard || isExplainingCard) return;
    setIsExplainingCard(true);
    setCardExplanation(null);

    try {
      const response = await fetch('/api/tutor/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'explain_card',
          courseContext: activeDeck.courseCode,
          topic: currentCard.topic || activeDeck.topic,
          language: activeDeck.language || language,
          cardPayload: currentCard,
          followUpType,
          studentId: effectiveUserId,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success || !json.data?.explanation) {
        throw new Error(json.error || 'Could not generate explanation.');
      }
      setCardExplanation({
        cardId: currentCard.cardId,
        type: followUpType,
        content: json.data.explanation,
      });
    } catch (err: any) {
      const normalized = aiTutorFoundationService.normalizeError(err, 'FLASHCARDS');
      setErrorBanner(normalized.userMessage);
    } finally {
      setIsExplainingCard(false);
    }
  };

  // Open source material viewer
  const handleOpenSourceMaterial = (materialId: string, pageNumber?: number) => {
    if (!onOpenMaterialSource) return;
    const found = courseMaterials.find((m) => m.id === materialId);
    if (found) {
      onOpenMaterialSource(found, pageNumber);
      return;
    }
    const refMat =
      currentCard?.referencedMaterials?.find((r) => r.materialId === materialId) ||
      activeDeck?.referencedMaterials?.find((r) => r.materialId === materialId);
    if (refMat) {
      onOpenMaterialSource(
        {
          id: refMat.materialId,
          title: refMat.title,
          courseCode: refMat.courseCode || activeDeck?.courseCode || courseCode,
          materialType: (refMat.materialType as any) || 'Lecture Notes',
          fileName: `${refMat.title}.pdf`,
          fileUrl: '',
          fileSize: '',
          mimeType: 'application/pdf',
          uploadedBy: refMat.uploaderName || 'University Repository',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
          universityId: profile?.universityId || 'udsm',
          academicUnitId: profile?.academicUnitId || '',
          departmentId: profile?.departmentId || '',
          programmeId: profile?.programmeId || '',
          yearId: profile?.yearOfStudy || 1,
          semesterId: profile?.semester || 1,
          courseId: activeDeck?.courseId || courseCode,
        },
        pageNumber
      );
    }
  };

  const styleLabelMap: Record<string, string> = {
    definitions: 'Definition',
    concepts: 'Concept',
    formulas: 'Formula',
    qa: 'Question & Answer',
    mixed: 'Mixed',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white text-slate-900 px-3 sm:px-6 py-5">
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
        {/* Top Mode Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                AI Flashcards
              </h3>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Smart Active-Recall Revision
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Turn your course materials into smart flashcards for quick revision.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('setup')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'setup'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Cards
            </button>
            {activeDeck && (
              <button
                type="button"
                onClick={() => setViewMode('review')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'review'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Deck ({activeDeck.cards.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                refreshSavedDecks();
                setViewMode('decks');
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'decks'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved Decks ({savedDecks.length})
            </button>
          </div>
        </div>

        {/* Error / Notice Banner */}
        {errorBanner && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW 1: FLASHCARD SETUP & MATERIAL SELECTION                      */}
        {/* ================================================================ */}
        {viewMode === 'setup' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-6 space-y-5">
              {/* Row 1: Course & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Authorized Course
                  </label>
                  <select
                    value={courseCode}
                    onChange={(e) => {
                      const next = e.target.value;
                      setCourseCode(next);
                      onSelectCourseContext(next);
                    }}
                    disabled={isGenerating}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Topic or Concept Focus
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isGenerating}
                    placeholder="e.g. Probability, Conditional Probability, Matrix Inverse..."
                    className="w-full rounded-lg border border-slate-200 bg-white! px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Suggested Topics */}
              {suggestedTopics.length > 0 && (
                <div>
                  <span className="block text-[11px] font-medium text-slate-500 mb-1.5">
                    Course Topics & Materials:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTopics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                          topic.toLowerCase() === t.toLowerCase()
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Create Flashcards From
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'course_topic', label: 'Course & Topic' },
                    { id: 'single_material', label: 'Selected Material' },
                    { id: 'multiple_materials', label: 'Multiple Materials' },
                    { id: 'summary', label: 'AI Summary / Notes' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSourceType(opt.id as any);
                        if (opt.id === 'single_material' && selectedMaterialIds.length > 1) {
                          setSelectedMaterialIds([selectedMaterialIds[0]]);
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold text-left transition-colors cursor-pointer ${
                        sourceType === opt.id
                          ? 'bg-blue-50/80 border-blue-600 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorized Course Material Picker (when single_material or multiple_materials) */}
              {(sourceType === 'single_material' || sourceType === 'multiple_materials') && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800">
                      {sourceType === 'single_material'
                        ? 'Select an Authorized Course Material'
                        : 'Select Authorized Course Materials'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {selectedMaterialIds.length} selected
                    </span>
                  </div>

                  {isLoadingMaterials ? (
                    <div className="flex items-center gap-2 py-4 text-xs text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading authorized course materials...</span>
                    </div>
                  ) : courseMaterials.length === 0 ? (
                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                      No uploaded lecturer/course materials found for{' '}
                      <span className="font-semibold">{courseCode}</span>. Switch to{' '}
                      <button
                        type="button"
                        onClick={() => setSourceType('course_topic')}
                        className="text-blue-600 font-semibold underline cursor-pointer"
                      >
                        Course & Topic
                      </button>{' '}
                      to generate flashcards from your course curriculum.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {courseMaterials.map((mat) => {
                        const isChecked = selectedMaterialIds.includes(mat.id);
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() => handleToggleMaterialId(mat.id)}
                            className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-blue-50/90 border-blue-600 text-slate-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                                isChecked
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate">{mat.title}</p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {mat.materialType} · {mat.courseCode || courseCode}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Existing AI Summary / Study Notes Input (when sourceType === 'summary') */}
              {sourceType === 'summary' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Paste AI Summary or Lecture Notes Excerpt
                  </label>
                  <textarea
                    rows={4}
                    value={summarySourceText}
                    onChange={(e) => setSummarySourceText(e.target.value)}
                    placeholder="Paste your AI-generated summary, key definitions, or lecture summary here to turn into flashcards..."
                    className="w-full rounded-lg border border-slate-200 bg-white! p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}

              {/* Number of Cards & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number of Cards
                  </label>
                  <div className="flex items-center gap-1.5">
                    {CARD_COUNT_OPTIONS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setCardCount(cnt)}
                        className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          cardCount === cnt
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cnt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Language
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {LANGUAGE_CHOICES.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setLanguage(lang.value)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          language === lang.value
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Difficulty
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIFFICULTY_OPTIONS.map((diff) => (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        difficulty === diff.id
                          ? 'bg-blue-50/80 border-blue-600 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-semibold">{diff.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {diff.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Card Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {CARD_STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setCardStyle(style.id)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        cardStyle === style.id
                          ? 'bg-blue-50/80 border-blue-600 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-semibold">{style.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {style.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Action Footer */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {courseMaterials.length > 0 ? (
                    <span>
                      Grounded in{' '}
                      <strong className="text-slate-700">
                        {courseMaterials.length} authorized course material(s)
                      </strong>{' '}
                      for {courseCode}
                    </span>
                  ) : (
                    <span>
                      Using authorized VENUE curriculum context for{' '}
                      <strong className="text-slate-700">{courseCode}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateFlashcards}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating {cardCount} Smart Flashcards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create {cardCount} Flashcards</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW 2: INTERACTIVE FLASHCARD REVIEW & MASTERY TRACKING          */}
        {/* ================================================================ */}
        {viewMode === 'review' && activeDeck && (
          <div className="space-y-5">
            {/* Deck Summary & Mastery Progress Bar */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">
                      {activeDeck.deckTitle}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-600">{activeDeck.courseCode}</span>
                    {activeDeck.groundedInMaterials && (
                      <>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Grounded in course materials
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Deck Toolbar Controls */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleShuffleDeck}
                    title="Shuffle cards"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Shuffle className="w-3.5 h-3.5 text-slate-500" />
                    <span>Shuffle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(!isAddingCard)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-slate-500" />
                    <span>Add Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRestartDeck}
                    title="Reset mastery progress"
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restart</span>
                  </button>
                </div>
              </div>

              {/* Mastery Progress Counters & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-600">
                    Total: <strong className="text-slate-900">{activeDeck.cards.length}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-700">
                    Known: <strong>{activeDeck.knownCount}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-amber-700">
                    Needs Review: <strong>{activeDeck.reviewAgainCount}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">
                    Remaining: <strong>{activeDeck.unreviewedCount}</strong>
                  </span>
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  {[
                    { id: 'all', label: `All (${activeDeck.cards.length})` },
                    {
                      id: 'review_again',
                      label: `Review Missed (${activeDeck.reviewAgainCount})`,
                    },
                    {
                      id: 'unreviewed',
                      label: `Unreviewed (${activeDeck.unreviewedCount})`,
                    },
                    { id: 'known', label: `Known (${activeDeck.knownCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setReviewFilter(tab.id as ReviewFilterMode);
                        setCurrentIndex(0);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        reviewFilter === tab.id
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Custom Flashcard Modal/Drawer Inline */}
            {isAddingCard && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    Add Custom Flashcard to Deck
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Front (Question / Term)
                    </label>
                    <textarea
                      rows={2}
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      placeholder="e.g. State Bayes' Theorem"
                      className="w-full rounded-lg border border-slate-200 bg-white! p-2.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Back (Answer / Definition)
                    </label>
                    <textarea
                      rows={2}
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                      placeholder="e.g. Computes posterior probability of event A given B..."
                      className="w-full rounded-lg border border-slate-200 bg-white! p-2.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Optional Formula (LaTeX)
                  </label>
                  <input
                    type="text"
                    value={newCardFormula}
                    onChange={(e) => setNewCardFormula(e.target.value)}
                    placeholder="e.g. P(A|B) = \frac{P(B|A)P(A)}{P(B)}"
                    className="w-full rounded-lg border border-slate-200 bg-white! px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomCard}
                    disabled={!newCardFront.trim() || !newCardBack.trim()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Save Card
                  </button>
                </div>
              </div>
            )}

            {/* Empty Filter State */}
            {reviewCards.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-8 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-900">
                  No cards in this filter view
                </p>
                <p className="text-xs text-slate-600">
                  {reviewFilter === 'review_again'
                    ? 'Great job! You have no cards marked for "Review again".'
                    : 'Switch back to All Cards to continue reviewing your deck.'}
                </p>
                <button
                  type="button"
                  onClick={() => setReviewFilter('all')}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                >
                  Show All Cards ({activeDeck.cards.length})
                </button>
              </div>
            ) : (
              currentCard && (
                <div className="space-y-4">
                  {/* Card Counter & Edit/Delete Actions */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        Card {currentIndex + 1} of {reviewCards.length}
                      </span>
                      <span>·</span>
                      <span>{styleLabelMap[currentCard.style] || 'Concept'}</span>
                      <span>·</span>
                      <span className="capitalize">{currentCard.difficulty}</span>
                      {currentCard.status === 'known' && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold">
                            Known ✓
                          </span>
                        </>
                      )}
                      {currentCard.status === 'review_again' && (
                        <>
                          <span>·</span>
                          <span className="text-amber-700 font-semibold">
                            Needs Review
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleStartEditCard}
                        title="Edit this card"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {activeDeck.cards.length > 1 && (
                        <button
                          type="button"
                          onClick={handleDeleteCurrentCard}
                          title="Delete this card"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Editing Form OR Interactive Flip Card */}
                  {isEditingCard ? (
                    <div className="rounded-2xl border border-slate-300 bg-white p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Edit Flashcard #{currentCard.cardNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingCard(false)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Front (Question / Prompt)
                        </label>
                        <textarea
                          rows={2}
                          value={editFront}
                          onChange={(e) => setEditFront(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white! p-2.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Back (Answer / Definition)
                        </label>
                        <textarea
                          rows={3}
                          value={editBack}
                          onChange={(e) => setEditBack(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white! p-2.5 text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Formula Block (Optional LaTeX)
                        </label>
                        <input
                          type="text"
                          value={editFormula}
                          onChange={(e) => setEditFormula(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white! px-2.5 py-1.5 text-xs text-slate-900"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingCard(false)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCardEdit}
                          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* INTERACTIVE FLIP FLASHCARD SURFACE */
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsFlipped(!isFlipped);
                        }
                      }}
                      className={`w-full min-h-[280px] sm:min-h-[320px] rounded-2xl p-6 sm:p-8 border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        isFlipped
                          ? 'bg-slate-50/90 border-blue-300 shadow-sm'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Card Top Bar */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {isFlipped ? 'BACK — Answer & Explanation' : 'FRONT — Prompt'}
                          </span>
                          <span>·</span>
                          <span>{currentCard.topic}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>{isFlipped ? 'Click to see front' : 'Click to flip'}</span>
                        </span>
                      </div>

                      {/* Card Center Content */}
                      {!isFlipped ? (
                        <div className="my-auto py-6 text-center max-w-2xl mx-auto">
                          <SafeRenderErrorBoundary
                            mode="FLASHCARDS"
                            messageId={`${currentCard.cardId}-front`}
                            rawText={currentCard.front}
                          >
                            <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                              <MathRenderer content={currentCard.front} />
                            </div>
                          </SafeRenderErrorBoundary>
                        </div>
                      ) : (
                        <SafeRenderErrorBoundary
                          mode="FLASHCARDS"
                          messageId={`${currentCard.cardId}-back`}
                          rawText={currentCard.back}
                          formula={currentCard.formulaBlock}
                        >
                          <div className="my-auto py-4 space-y-4 max-w-2xl mx-auto w-full">
                            <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
                              <MathRenderer content={currentCard.back} />
                            </div>

                            {/* Dedicated Formula Block with KaTeX */}
                            {currentCard.formulaBlock && (
                              <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2">
                                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                  Formula / Mathematical Expression
                                </div>
                                <div className="overflow-x-auto py-1">
                                  {currentCard.formulaBlock.includes('$') ? (
                                    <MathRenderer content={currentCard.formulaBlock} />
                                  ) : (
                                    <MathBlock math={currentCard.formulaBlock} />
                                  )}
                                </div>
                                {currentCard.variableMeaning && (
                                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
                                    <strong className="text-slate-800">Variables: </strong>
                                    <MathRenderer content={currentCard.variableMeaning} />
                                  </div>
                                )}
                                {currentCard.whenToUse && (
                                  <div className="text-xs text-slate-600">
                                    <strong className="text-slate-800">When to use: </strong>
                                    <MathRenderer content={currentCard.whenToUse} />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Optional Brief Example */}
                            {currentCard.exampleNote && (
                              <div className="rounded-lg bg-blue-50/60 border border-blue-200/70 p-3 text-xs text-slate-700">
                                <strong className="text-slate-900">Example: </strong>
                                <MathRenderer content={currentCard.exampleNote} />
                              </div>
                            )}
                          </div>
                        </SafeRenderErrorBoundary>
                      )}

                      {/* Card Bottom Bar: Honest Source Attribution */}
                      <div
                        className="pt-3 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {currentCard.groundedInMaterials &&
                        filterValidCitations(currentCard.referencedMaterials).length > 0 ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-slate-500 font-medium">Source:</span>
                            {filterValidCitations(currentCard.referencedMaterials).map((ref) => (
                              <button
                                key={ref.materialId}
                                type="button"
                                onClick={() =>
                                  handleOpenSourceMaterial(
                                    ref.materialId,
                                    currentCard.sourcePageReferences?.[0]
                                  )
                                }
                                className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium cursor-pointer"
                              >
                                <FileText className="w-3 h-3" />
                                <span>
                                  {ref.title}
                                  {currentCard.sourcePageReferences &&
                                  currentCard.sourcePageReferences.length > 0
                                    ? ` (p. ${currentCard.sourcePageReferences.join(', ')})`
                                    : ''}
                                </span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span>
                            {activeDeck.courseCode} · Academic Revision Card
                          </span>
                        )}

                        <span className="text-slate-400">
                          Press Space or tap card to flip
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Active Recall Self-Evaluation & Navigation Controls */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentIndex((prev) =>
                          prev > 0 ? prev - 1 : reviewCards.length - 1
                        );
                      }}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkCardStatus('review_again')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentCard.status === 'review_again'
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-900 border-amber-200'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Review again</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMarkCardStatus('known')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        currentCard.status === 'known'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>I know this</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentIndex((prev) =>
                          prev < reviewCards.length - 1 ? prev + 1 : 0
                        );
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Next Card</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section 11: Follow-Up Learning Actions for Current Card */}
                  <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        Need deeper understanding of this card?
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isExplainingCard}
                        onClick={() => handleExplainCurrentCard('explain')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Explain this card</span>
                      </button>

                      <button
                        type="button"
                        disabled={isExplainingCard}
                        onClick={() => handleExplainCurrentCard('simpler')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Make it simpler</span>
                      </button>

                      <button
                        type="button"
                        disabled={isExplainingCard}
                        onClick={() => handleExplainCurrentCard('example')}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Give me an example</span>
                      </button>

                      {onLaunchPracticeModeForTopic && (
                        <button
                          type="button"
                          onClick={() =>
                            onLaunchPracticeModeForTopic(
                              activeDeck.courseCode,
                              currentCard.topic || activeDeck.topic,
                              currentCard.difficulty
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Practice this topic</span>
                        </button>
                      )}

                      {onLaunchQuizGeneratorForTopic && (
                        <button
                          type="button"
                          onClick={() =>
                            onLaunchQuizGeneratorForTopic(
                              activeDeck.courseCode,
                              currentCard.topic || activeDeck.topic,
                              currentCard.difficulty
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <GraduationCap className="w-3.5 h-3.5 text-slate-700" />
                          <span>Quiz me on these cards</span>
                        </button>
                      )}

                      {onLaunchStudyModeForTopic && (
                        <button
                          type="button"
                          onClick={() =>
                            onLaunchStudyModeForTopic(
                              activeDeck.courseCode,
                              currentCard.topic || activeDeck.topic,
                              currentCard.difficulty
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>Open in Study Mode</span>
                        </button>
                      )}
                    </div>

                    {isExplainingCard && (
                      <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        <span>Generating explanation for this card...</span>
                      </div>
                    )}

                    {cardExplanation && cardExplanation.cardId === currentCard.cardId && (
                      <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            AI Tutor Card Explanation
                          </span>
                          <button
                            type="button"
                            onClick={() => setCardExplanation(null)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                          <SafeRenderErrorBoundary
                            mode="FLASHCARDS"
                            messageId={`${currentCard.cardId}-ai-exp`}
                            rawText={recoverStructuredTextIfRawJson(cardExplanation.content).text}
                          >
                            <MathRenderer
                              content={recoverStructuredTextIfRawJson(cardExplanation.content).text}
                            />
                          </SafeRenderErrorBoundary>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* VIEW 3: SAVED FLASHCARD DECKS                                    */}
        {/* ================================================================ */}
        {viewMode === 'decks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">
                Your Saved Flashcard Decks ({savedDecks.length})
              </h4>
              <button
                type="button"
                onClick={() => setViewMode('setup')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Deck</span>
              </button>
            </div>

            {savedDecks.length === 0 ? (
              <div className="rounded-xl border border-slate-200 p-8 text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  No saved flashcard decks yet
                </p>
                <p className="text-xs text-slate-500">
                  Create a flashcard deck from your course topics or authorized lecture notes to review anytime.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedDecks.map((deck) => {
                  const pct =
                    deck.cards.length > 0
                      ? Math.round((deck.knownCount / deck.cards.length) * 100)
                      : 0;
                  return (
                    <div
                      key={deck.deckId}
                      className="rounded-xl border border-slate-200/90 bg-white p-4 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {deck.deckTitle}
                          </h5>
                          <button
                            type="button"
                            onClick={() => {
                              aiTutorFoundationService.deleteSavedFlashcardDeck(
                                deck.deckId,
                                effectiveUserId
                              );
                              if (activeDeck?.deckId === deck.deckId) {
                                setActiveDeck(null);
                              }
                              refreshSavedDecks();
                            }}
                            title="Delete deck"
                            className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-700">
                            {deck.courseCode}
                          </span>
                          <span>·</span>
                          <span>{deck.cards.length} cards</span>
                          <span>·</span>
                          <span>{pct}% mastered</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-[11px] text-slate-500">
                          Known: <strong className="text-emerald-700">{deck.knownCount}</strong> ·
                          Review: <strong className="text-amber-700">{deck.reviewAgainCount}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveDeck(deck);
                            setReviewFilter('all');
                            setShuffledCardIds(null);
                            setCurrentIndex(0);
                            setIsFlipped(false);
                            setViewMode('review');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review Deck</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
