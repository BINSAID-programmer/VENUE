import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { QuizQuestion } from '../../types';

interface UserAnswerRecord {
  selected: number;
  isCorrect: boolean;
}

interface QuizScreenProps {
  questions: QuizQuestion[];
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ questions }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Foundational' | 'Intermediate' | 'Advanced'>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [quizFinished, setQuizFinished] = useState(false);

  const filteredQuestions = questions.filter(
    (q) => selectedDifficulty === 'All' || q.difficulty === selectedDifficulty
  );

  const currentQ = filteredQuestions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQ) return;
    const isCorrect = selectedAnswer === currentQ.correctIndex;
    setIsAnswerSubmitted(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { selected: selectedAnswer, isCorrect },
    }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setQuizFinished(false);
  };

  // Weak topics calculation
  const weakTopics = (Object.entries(userAnswers) as [string, UserAnswerRecord][])
    .filter(([_, data]) => !data.isCorrect)
    .map(([qId]) => {
      const q = questions.find((item) => item.id === qId);
      return q ? `${q.courseCode}: ${q.topic}` : '';
    })
    .filter(Boolean);

  const totalAnswered = Object.keys(userAnswers).length;
  const totalCorrect = (Object.values(userAnswers) as UserAnswerRecord[]).filter((a) => a.isCorrect).length;
  const scorePercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Quiz & Practice</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Reinforce theorems, proofs, and distributions with instantaneous feedback
        </p>
      </div>

      {/* Difficulty Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['All', 'Foundational', 'Intermediate', 'Advanced'] as const).map((diff) => (
          <button
            key={diff}
            id={`quiz-diff-${diff.toLowerCase()}`}
            onClick={() => {
              setSelectedDifficulty(diff);
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedDifficulty === diff
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Finished Summary State */}
      {quizFinished ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-600/30">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white">Quiz Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">Here is your performance breakdown</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400">Score</p>
              <p className="text-xl font-black text-sky-400">{scorePercent}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Correct</p>
              <p className="text-xl font-black text-emerald-400">{totalCorrect}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Total Questions</p>
              <p className="text-xl font-black text-white">{filteredQuestions.length}</p>
            </div>
          </div>

          {/* Weak Topics Identification */}
          {weakTopics.length > 0 ? (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Identified Weak Topics to Revise:</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {Array.from(new Set(weakTopics)).map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: You can ask the VENUE AI Tutor to explain these topics step-by-step!
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
              Outstanding work! You solved all tested concepts with 100% accuracy.
            </div>
          )}

          <button
            id="quiz-restart-btn"
            onClick={handleRestart}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Practice Questions</span>
          </button>
        </div>
      ) : currentQ ? (
        /* Active Question Card */
        <div className="space-y-4">
          {/* Progress Bar & Header */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-sky-400">
              Question {currentIndex + 1} of {filteredQuestions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold text-[10px] text-white">
                {currentQ.courseCode}
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-semibold">
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
            />
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Topic: {currentQ.topic}
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let optionStyle = 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-500/50';
                  } else {
                    optionStyle = 'bg-slate-950/40 border-slate-850 text-slate-500';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-blue-600/20 border-blue-500 text-white ring-1 ring-blue-500/50';
                }

                return (
                  <button
                    key={idx}
                    id={`quiz-opt-${idx}`}
                    type="button"
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${optionStyle} cursor-pointer`}
                  >
                    <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium flex-1">{option}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Button */}
            {isAnswerSubmitted ? (
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed space-y-1">
                  <span className="font-bold text-sky-400 block">Explanation:</span>
                  <p className="text-slate-300">{currentQ.explanation}</p>
                </div>

                <button
                  id="quiz-next-question-btn"
                  onClick={handleNext}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentIndex < filteredQuestions.length - 1 ? 'Next Question' : 'View Final Score'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  id="quiz-submit-answer-btn"
                  disabled={selectedAnswer === null}
                  onClick={handleSubmitAnswer}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No questions found for this difficulty.</p>
        </div>
      )}
    </div>
  );
};
