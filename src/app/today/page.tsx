'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Clock, 
  BookOpen, 
  Code, 
  Palette, 
  Heart, 
  RefreshCw, 
  Play,
  ChevronRight,
  Sparkles,
  LogOut,
  Trophy
} from 'lucide-react';
import { TodayPlan, TodayBlock } from '@/types';

const LEARNER_ID = 'ziggy-learner-1'; // Fixed for MVP

const BLOCK_ICONS: Record<string, React.ReactNode> = {
  'track_11plus': <BookOpen className="w-6 h-6" />,
  'track_coding': <Code className="w-6 h-6" />,
  'track_animation': <Palette className="w-6 h-6" />,
  'track_digital_health': <Heart className="w-6 h-6" />,
  'review': <RefreshCw className="w-6 h-6" />,
};

const BLOCK_COLORS: Record<string, string> = {
  'track_11plus': 'from-blue-400 to-blue-600',
  'track_coding': 'from-emerald-400 to-emerald-600',
  'track_animation': 'from-amber-400 to-amber-600',
  'track_digital_health': 'from-rose-400 to-rose-600',
  'review': 'from-indigo-400 to-indigo-600',
};

export default function TodayPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<TodayPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTodayPlan();
  }, []);

  const fetchTodayPlan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/learners/${LEARNER_ID}/today-plan`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to load today\'s plan');
      }
      
      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleStartBlock = (block: TodayBlock) => {
    // Navigate to practice with block context
    router.push(`/practice?block=${block.block_id}&items=${block.item_ids.join(',')}`);
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="learner-view flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce-gentle mb-4">🌟</div>
          <p className="text-xl text-gray-600">Loading your learning adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="learner-view flex items-center justify-center">
        <div className="learner-card text-center max-w-md">
          <div className="text-4xl mb-4">😅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTodayPlan}
            className="learner-button-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalMinutes = plan?.total_minutes_target || 90;
  const completedMinutes = plan?.blocks
    .filter(b => completedBlocks.has(b.block_id))
    .reduce((sum, b) => sum + b.estimated_minutes, 0) || 0;
  const progressPercent = Math.round((completedMinutes / totalMinutes) * 100);

  return (
    <div className="learner-view min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-white/50 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌟</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {getTimeOfDayGreeting()}, Ziggy!
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 
                     hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Greeting Card */}
        <div className="learner-card mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-ziggy-gold/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="text-4xl mb-3 animate-wiggle">✨</div>
            <p className="text-lg text-gray-700 font-medium">
              {plan?.greeting || "Ready to learn something amazing today!"}
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="learner-card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-ziggy-gold" />
              Today&apos;s Progress
            </h2>
            <span className="text-sm text-gray-500">
              {completedMinutes} / {totalMinutes} mins
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-ziggy-coral to-ziggy-gold rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {progressPercent === 100 && (
            <div className="mt-4 p-4 bg-ziggy-gold/10 rounded-xl text-center animate-celebrate">
              <span className="text-2xl">🎉</span>
              <p className="font-bold text-gray-900">Amazing work today!</p>
            </div>
          )}
        </div>

        {/* Learning Blocks */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ziggy-coral" />
          Your Learning Blocks
        </h2>

        <div className="space-y-4">
          {plan?.blocks.map((block, index) => (
            <BlockCard
              key={block.block_id}
              block={block}
              index={index}
              isCompleted={completedBlocks.has(block.block_id)}
              onStart={() => handleStartBlock(block)}
            />
          ))}
        </div>

        {/* Empty state */}
        {(!plan?.blocks || plan.blocks.length === 0) && (
          <div className="learner-card text-center py-12">
            <div className="text-6xl mb-4">🎈</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No blocks for today!
            </h3>
            <p className="text-gray-600">
              Check back tomorrow for your next learning adventure.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function BlockCard({ 
  block, 
  index, 
  isCompleted, 
  onStart 
}: { 
  block: TodayBlock; 
  index: number;
  isCompleted: boolean;
  onStart: () => void;
}) {
  const trackId = block.track_id || 'review';
  const icon = BLOCK_ICONS[trackId] || <BookOpen className="w-6 h-6" />;
  const colorClass = BLOCK_COLORS[trackId] || BLOCK_COLORS.review;
  
  return (
    <div 
      className={`learner-card group cursor-pointer transition-all duration-300
                  ${isCompleted ? 'opacity-60' : 'hover:shadow-elevated hover:scale-[1.01]'}`}
      onClick={!isCompleted ? onStart : undefined}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass}
                        flex items-center justify-center text-white shadow-md
                        group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">{block.title}</h3>
            {isCompleted && (
              <span className="text-sm bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                ✓ Done
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              ~{block.estimated_minutes} mins
            </span>
            {block.topics.length > 0 && (
              <span className="hidden sm:inline">
                {block.topics.slice(0, 2).join(', ')}
                {block.topics.length > 2 && ` +${block.topics.length - 2} more`}
              </span>
            )}
          </div>
        </div>
        
        {/* Action */}
        {!isCompleted && (
          <button className="flex items-center gap-1 px-4 py-2 rounded-xl
                           bg-gray-100 text-gray-700 font-medium
                           group-hover:bg-gradient-to-r group-hover:from-ziggy-coral 
                           group-hover:to-ziggy-sunset group-hover:text-white
                           transition-all duration-200">
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Start</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Item count badge */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {block.item_ids.length} {block.item_ids.length === 1 ? 'question' : 'questions'}
        </span>
        {block.item_ids.length > 0 && (
          <div className="flex -space-x-1">
            {[...Array(Math.min(5, block.item_ids.length))].map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full bg-gradient-to-br ${colorClass}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
