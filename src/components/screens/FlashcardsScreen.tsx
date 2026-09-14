import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { FlashcardDeck } from '../../types';

interface FlashcardsScreenProps {
  decks: FlashcardDeck[];
}

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({ decks }) => {
  const [selectedDeckId, setSelectedDeckId] = useState(decks[0]?.id || 'deck-1');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<{ [id: string]: boolean }>({});

  const currentDeck = decks.find((d) => d.id === selectedDeckId) || decks[0];
  const currentCard = currentDeck?.cards[cardIndex];

  const handleNext = () => {
    if (!currentDeck) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % currentDeck.cards.length);
  };

  const handlePrev = () => {
    if (!currentDeck) return;
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + currentDeck.cards.length) % currentDeck.cards.length);
  };

  const handleToggleMastered = (cardId: string) => {
    setMasteredCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const masteredCount = currentDeck?.cards.filter((c) => masteredCards[c.id]).length || 0;

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Flashcards</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Spaced repetition for definitions, statements, and distribution properties
        </p>
      </div>

      {/* Deck Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {decks.map((deck) => (
          <button
            key={deck.id}
            id={`deck-btn-${deck.id}`}
            onClick={() => {
              setSelectedDeckId(deck.id);
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedDeckId === deck.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {deck.courseCode}: {deck.title.split(' ')[0]} ({deck.cards.length})
          </button>
        ))}
      </div>

      {/* Deck Progress Bar */}
      {currentDeck && (
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Card {cardIndex + 1} of {currentDeck.cards.length}
          </span>
          <span className="text-emerald-400 font-semibold">
            {masteredCount} of {currentDeck.cards.length} Mastered
          </span>
        </div>
      )}

      {/* Interactive 3D Flip Card Container */}
      {currentCard && (
        <div className="relative perspective-1000 w-full min-h-[320px] sm:min-h-[360px]">
          <div
            id="flashcard-interactive-box"
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-6 border transition-transform duration-500 transform-style-3d cursor-pointer flex flex-col justify-between shadow-xl ${
              isFlipped
                ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border-sky-500/40 rotate-y-180'
                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Front & Back Content depending on Flip */}
            {!isFlipped ? (
              // FRONT SIDE
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                    {currentDeck.courseCode} • {currentCard.concept}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    Tap to reveal answer
                  </span>
                </div>

                <div className="my-auto py-4 text-center">
                  <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                    {currentCard.front}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Theorem / Concept Statement</span>
                  <span className="text-sky-400 font-medium">Click to flip ↷</span>
                </div>
              </div>
            ) : (
              // BACK SIDE (Reversed backface text)
              <div className="flex-1 flex flex-col justify-between rotate-y-180">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                    Solution / Definition
                  </span>
                  <span className="text-[10px] text-slate-400">Tap to flip back</span>
                </div>

                <div className="my-auto py-4 text-left">
                  <p className="text-xs sm:text-sm font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    id="flashcard-mark-mastered-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMastered(currentCard.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      masteredCards[currentCard.id]
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{masteredCards[currentCard.id] ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">VENUE Revision Deck</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          id="flashcards-prev-btn"
          onClick={handlePrev}
          className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-center gap-1 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          id="flashcards-flip-btn"
          onClick={() => setIsFlipped(!isFlipped)}
          className="p-2.5 rounded-xl bg-slate-800 text-sky-400 hover:text-white transition-colors cursor-pointer"
          title="Flip card"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          id="flashcards-next-btn"
          onClick={handleNext}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1 text-xs font-semibold shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
