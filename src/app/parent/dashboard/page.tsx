'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Code,
  Palette,
  Heart,
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  LogOut,
  Calendar,
  Activity,
  Loader2
} from 'lucide-react';

interface TrackOverview {
  track_id: string;
  track_name: string;
  icon: string;
  color: string;
  mastered_topics: number;
  total_topics: number;
  red_topics: number;
  amber_topics: number;
  green_topics: number;
  minutes_this_week: number;
  last_activity: string | null;
}

interface LearnerOverview {
  learner_id: string;
  display_name: string;
  avatar_emoji: string;
  exam_date: string | null;
  tracks: TrackOverview[];
  total_attempts_this_week: number;
  accuracy_this_week: number;
}

interface OverviewData {
  learners: LearnerOverview[];
}

const TRACK_ICONS: Record<string, React.ReactNode> = {
  track_11plus: <BookOpen className="w-5 h-5" />,
  track_coding: <Code className="w-5 h-5" />,
  track_animation: <Palette className="w-5 h-5" />,
  track_digital_health: <Heart className="w-5 h-5" />,
};

export default function ParentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [parentId, setParentId] = useState<string>('');

  useEffect(() => {
    // Get parent ID from cookie/session - for now fetch it
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      // First, we need to get the parent ID from auth
      // For MVP, we'll use a fixed approach
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'joseph@ziggyalpha.com', 
          password: 'ziggy2024' 
        }),
      });
      
      if (!authResponse.ok) {
        router.push('/login');
        return;
      }
      
      const authData = await authResponse.json();
      const pId = authData.user.id;
      setParentId(pId);
      
      const response = await fetch(`/api/parent/${pId}/overview`);
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (!response.ok) throw new Error('Failed to load data');
      
      const overviewData = await response.json();
      setData(overviewData);
    } catch (error) {
      console.error('Error loading overview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="parent-view flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-dash-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const learner = data?.learners[0];
  const examDate = learner?.exam_date ? new Date(learner.exam_date) : null;
  const daysUntilExam = examDate 
    ? Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="parent-view min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-dash-border p-4 hidden lg:block">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🌟</span>
          <div>
            <h1 className="font-bold text-gray-900">Ziggy Alpha Hub</h1>
            <p className="text-xs text-gray-500">Parent Dashboard</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          <NavItem icon={<LayoutDashboard />} label="Overview" href="/parent/dashboard" active />
          <NavItem icon={<Target />} label="Topics & Mastery" href="/parent/topics" />
          <NavItem icon={<Activity />} label="Test Runs" href="/parent/tests" />
          <NavItem icon={<Calendar />} label="Schedule" href="/parent/schedule" />
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600
                     hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Joseph
              </h1>
              <p className="text-gray-500">
                Here&apos;s how {learner?.display_name || 'Ziggy'} is progressing
              </p>
            </div>
            
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-lg bg-white border border-dash-border">
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Days Until Exam"
            value={daysUntilExam?.toString() || '—'}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="This Week"
            value={`${learner?.total_attempts_this_week || 0}`}
            subtitle="questions"
            icon={<Activity className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            label="Accuracy"
            value={`${Math.round((learner?.accuracy_this_week || 0) * 100)}%`}
            subtitle="this week"
            icon={<TrendingUp className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            label="Study Time"
            value={`${learner?.tracks.reduce((sum, t) => sum + t.minutes_this_week, 0) || 0}`}
            subtitle="minutes"
            icon={<Clock className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Track Cards */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Track Progress</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {learner?.tracks.map((track) => (
            <TrackCard key={track.track_id} track={track} learnerId={learner.learner_id} />
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <ActionCard
            title="View All Topics"
            description="See mastery breakdown by topic"
            href="/parent/topics"
            icon={<BookOpen className="w-6 h-6" />}
          />
          <ActionCard
            title="Test History"
            description="Review past test results"
            href="/parent/tests"
            icon={<Target className="w-6 h-6" />}
          />
          <ActionCard
            title="Switch to Learner"
            description="View as Ziggy"
            href="/today"
            icon={<span className="text-2xl">🌟</span>}
          />
        </div>
      </main>
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  href, 
  active = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-dash-primary/10 text-dash-primary font-medium' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ 
  label, 
  value, 
  subtitle,
  icon,
  color 
}: { 
  label: string; 
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-2">
        <span className="dash-stat-label">{label}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="dash-stat">{value}</div>
      {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
    </div>
  );
}

function TrackCard({ track, learnerId }: { track: TrackOverview; learnerId: string }) {
  const totalTopics = track.red_topics + track.amber_topics + track.green_topics;
  const progressPercent = totalTopics > 0 
    ? Math.round((track.green_topics / totalTopics) * 100) 
    : 0;

  return (
    <div className="dash-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: track.color }}
          >
            {TRACK_ICONS[track.track_id] || <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{track.track_name}</h3>
            <p className="text-sm text-gray-500">
              {track.mastered_topics} of {totalTopics} topics mastered
            </p>
          </div>
        </div>
        <Link 
          href={`/parent/topics?track=${track.track_id}`}
          className="text-dash-primary hover:underline text-sm flex items-center gap-1"
        >
          Details <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* RAG Summary */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rag-red" />
          <span className="text-sm text-gray-600">{track.red_topics} red</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rag-amber" />
          <span className="text-sm text-gray-600">{track.amber_topics} amber</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rag-green" />
          <span className="text-sm text-gray-600">{track.green_topics} green</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full flex">
          <div 
            className="bg-rag-green transition-all" 
            style={{ width: `${(track.green_topics / Math.max(1, totalTopics)) * 100}%` }}
          />
          <div 
            className="bg-rag-amber transition-all" 
            style={{ width: `${(track.amber_topics / Math.max(1, totalTopics)) * 100}%` }}
          />
          <div 
            className="bg-rag-red transition-all" 
            style={{ width: `${(track.red_topics / Math.max(1, totalTopics)) * 100}%` }}
          />
        </div>
      </div>

      {/* Activity */}
      <div className="mt-4 pt-4 border-t border-dash-border flex items-center justify-between text-sm">
        <span className="text-gray-500">
          <Clock className="w-4 h-4 inline mr-1" />
          {track.minutes_this_week} mins this week
        </span>
        {track.last_activity && (
          <span className="text-gray-400">
            Last active: {new Date(track.last_activity).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function ActionCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string; 
  description: string; 
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="dash-card hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center
                      group-hover:bg-dash-primary/10 group-hover:text-dash-primary transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </Link>
  );
}
