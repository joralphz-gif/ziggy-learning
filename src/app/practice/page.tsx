'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Trophy,
  Sparkles,
  Clock,
  Loader2
} from 'lucide-react';

const LEARNER_ID = 'ziggy-learner-1';

interface Item {
  id: string;
  typeId: string;
  difficulty: number;
  payload: {
    question: string;
    options?: string[];
    correctIndex?: number;
    correctAnswer?: string | number;
    explanation?: string;
    prompt?: string;
    starterCode?: string;
    hints?: string[];
  };
  topic: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
    icon: string;
  };
  track: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

interface AttemptResult {
  is_correct: boolean;
  score: number;
  feedback?: string;
  correct_answer?: string | number;
  mastery_state?: {
    status: string;
    rag: string;
    percent_correct: number;
  };
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<Item[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  const itemIds = searchParams.get('items')?.split(',') || [];
  const blockId = searchParams.get('block') || 'practice';

  useEffect(() => {
    if (itemIds.length > 0) {
      fetchItems();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/items?ids=${itemIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to load items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentItem = items[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!currentItem || selectedAnswer === null) return;
    
    setIsSubmitting(true);
    const timeTaken = Date.now() - startTime;
    
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learner_id: LEARNER_ID,
          item_id: currentItem.id,
          raw_response: selectedAnswer,
          time_taken_ms: timeTaken,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit answer');
      
      const result = await response.json();
      setAttemptResult(result);
      
      if (result.is_correct) {
        setCorrectCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setTextAnswer('');
      setAttemptResult(null);
      setStartTime(Date.now());
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    router.push('/today');
  };

  if (isLoading) {
    return (
      <div className="learner-view flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-ziggy-coral mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="learner-view flex items-center justify-center min-h-screen">
        <div className="learner-card text-center max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find any questions for this session.
          </p>
          <button onClick={handleBack} className="learner-button-primary">
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    const percentage = Math.round((correctCount / items.length) * 100);
    const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : percentage >= 40 ? 1 : 0;
    
    return (
      <div className="learner-view flex items-center justify-center min-h-screen p-4">
        <div className="learner-card text-center max-w-md w-full animate-fade-in">
          <div className="text-6xl mb-4 animate-celebrate">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👏' : '💪'}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {percentage >= 80 ? 'Amazing Work!' : percentage >= 60 ? 'Great Job!' : 'Keep Going!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            You got {correctCount} out of {items.length} correct!
          </p>
          
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map((star) => (
              <div
                key={star}
                className={`text-4xl transition-all duration-500 ${
                  star <= stars ? 'animate-bounce-gentle' : 'opacity-30 grayscale'
                }`}
                style={{ animationDelay: `${star * 200}ms` }}
              >
                ⭐
              </div>
            ))}
          </div>
          
          {/* Score Bar */}
          <div className="mb-8">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  percentage >= 80 ? 'bg-emerald-500' : 
                  percentage >= 60 ? 'bg-amber-500' : 'bg-red-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{percentage}% correct</p>
          </div>
          
          <button
            onClick={handleBack}
            className="learner-button-primary w-full flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="learner-view min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/50 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Exit</span>
          </button>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              {currentIndex + 1} / {items.length}
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-ziggy-coral to-ziggy-gold rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{currentItem?.subject?.icon}</span>
          </div>
        </div>
      </header>

      {/* Question Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {currentItem && (
          <div className="animate-slide-up">
            {/* Topic Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span 
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: currentItem.track.color }}
              >
                {currentItem.track.icon} {currentItem.topic.name}
              </span>
            </div>

            {/* Question Card */}
            <div className="question-card mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                {currentItem.payload.question || currentItem.payload.prompt}
              </h2>

              {/* MCQ Options */}
              {currentItem.typeId === 'mcq' || currentItem.typeId === 'concept_mcq' ? (
                <div className="space-y-3">
                  {currentItem.payload.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !attemptResult && setSelectedAnswer(index)}
                      disabled={!!attemptResult}
                      className={`answer-option ${
                        selectedAnswer === index ? 'selected' : ''
                      } ${
                        attemptResult && index === currentItem.payload.correctIndex ? 'correct' : ''
                      } ${
                        attemptResult && selectedAnswer === index && !attemptResult.is_correct ? 'incorrect' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {attemptResult && index === currentItem.payload.correctIndex && (
                          <Check className="w-5 h-5 text-emerald-500" />
                        )}
                        {attemptResult && selectedAnswer === index && !attemptResult.is_correct && (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : currentItem.typeId === 'short_answer' ? (
                <div>
                  <input
                    type="text"
                    value={textAnswer}
                    onChange={(e) => {
                      setTextAnswer(e.target.value);
                      setSelectedAnswer(e.target.value);
                    }}
                    disabled={!!attemptResult}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                             focus:border-ziggy-coral focus:ring-0 text-lg"
                    placeholder="Type your answer..."
                  />
                </div>
              ) : currentItem.typeId === 'coding_task' ? (
                <div>
                  <div className="code-editor mb-4">
                    <textarea
                      value={textAnswer || currentItem.payload.starterCode || ''}
                      onChange={(e) => {
                        setTextAnswer(e.target.value);
                        setSelectedAnswer(e.target.value);
                      }}
                      disabled={!!attemptResult}
                      placeholder="Write your code here..."
                      className="w-full min-h-[200px] bg-transparent outline-none resize-none"
                    />
                  </div>
                  {currentItem.payload.hints && currentItem.payload.hints.length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        💡 Need a hint?
                      </summary>
                      <ul className="mt-2 pl-4 space-y-1 text-gray-600">
                        {currentItem.payload.hints.map((hint, i) => (
                          <li key={i}>• {hint}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ) : null}
            </div>

            {/* Feedback */}
            {attemptResult && (
              <div className={`p-4 rounded-xl mb-6 animate-fade-in ${
                attemptResult.is_correct 
                  ? 'bg-emerald-50 border-2 border-emerald-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    attemptResult.is_correct ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {attemptResult.is_correct 
                      ? <Sparkles className="w-5 h-5 text-emerald-600" />
                      : <X className="w-5 h-5 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className={`font-bold ${
                      attemptResult.is_correct ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {attemptResult.feedback}
                    </p>
                    {currentItem.payload.explanation && !attemptResult.is_correct && (
                      <p className="text-gray-600 mt-2 text-sm">
                        {currentItem.payload.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {!attemptResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null || isSubmitting}
                  className={`flex-1 learner-button-primary flex items-center justify-center gap-2
                            ${selectedAnswer === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Check Answer
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 learner-button-secondary flex items-center justify-center gap-2"
                >
                  {currentIndex < items.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5" />
                      See Results
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="learner-view flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-ziggy-coral" />
      </div>
    }>
      <PracticeContent />
    </Suspense>
  );
}
