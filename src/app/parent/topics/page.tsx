'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Target,
  Calendar,
  Activity,
  LogOut,
  Filter,
  Search,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface TopicMastery {
  topic_id: string;
  topic_name: string;
  subject_id: string;
  subject_name: string;
  track_id: string;
  track_name: string;
  level: string;
  mastery_status: string;
  rag: string;
  percent_correct: number;
  attempts_count: number;
  last_updated_at: string | null;
}

interface Track {
  id: string;
  name: string;
  icon: string;
  color: string;
  subjects: { id: string; name: string; icon: string }[];
}

const LEARNER_ID = 'ziggy-learner-1';

function TopicsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrack, setFilterTrack] = useState(searchParams.get('track') || 'all');
  const [filterRag, setFilterRag] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [topicsRes, tracksRes] = await Promise.all([
        fetch(`/api/learners/${LEARNER_ID}/mastery`),
        fetch('/api/tracks'),
      ]);
      
      if (topicsRes.status === 401) {
        router.push('/login');
        return;
      }
      
      const [topicsData, tracksData] = await Promise.all([
        topicsRes.json(),
        tracksRes.json(),
      ]);
      
      setTopics(topicsData);
      setTracks(tracksData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    if (filterTrack !== 'all' && topic.track_id !== filterTrack) return false;
    if (filterRag !== 'all' && topic.rag !== filterRag) return false;
    if (filterStatus !== 'all' && topic.mastery_status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        topic.topic_name.toLowerCase().includes(query) ||
        topic.subject_name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group by subject
  const groupedTopics = filteredTopics.reduce((acc, topic) => {
    const key = `${topic.track_id}-${topic.subject_id}`;
    if (!acc[key]) {
      acc[key] = {
        track_id: topic.track_id,
        track_name: topic.track_name,
        subject_id: topic.subject_id,
        subject_name: topic.subject_name,
        topics: [],
      };
    }
    acc[key].topics.push(topic);
    return acc;
  }, {} as Record<string, { track_id: string; track_name: string; subject_id: string; subject_name: string; topics: TopicMastery[] }>);

  if (isLoading) {
    return (
      <div className="parent-view flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-dash-primary" />
      </div>
    );
  }

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
          <NavItem icon={<LayoutDashboard />} label="Overview" href="/parent/dashboard" />
          <NavItem icon={<Target />} label="Topics & Mastery" href="/parent/topics" active />
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
        <header className="mb-6">
          <Link 
            href="/parent/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Topics & Mastery</h1>
          <p className="text-gray-500">
            Track progress across all subjects and topics
          </p>
        </header>

        {/* Filters */}
        <div className="dash-card mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-dash-border
                           focus:border-dash-primary focus:ring-1 focus:ring-dash-primary/20"
                />
              </div>
            </div>

            {/* Track Filter */}
            <div className="relative">
              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-dash-border
                         bg-white focus:border-dash-primary cursor-pointer"
              >
                <option value="all">All Tracks</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.icon} {track.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* RAG Filter */}
            <div className="relative">
              <select
                value={filterRag}
                onChange={(e) => setFilterRag(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-dash-border
                         bg-white focus:border-dash-primary cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="red">🔴 Red</option>
                <option value="amber">🟡 Amber</option>
                <option value="green">🟢 Green</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Mastery Status Filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-dash-border
                         bg-white focus:border-dash-primary cursor-pointer"
              >
                <option value="all">All Mastery Levels</option>
                <option value="not_started">Not Started</option>
                <option value="learning">Learning</option>
                <option value="practising">Practising</option>
                <option value="nearly_there">Nearly There</option>
                <option value="mastered">Mastered</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active filter count */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
        </div>

        {/* Topics Table */}
        <div className="space-y-6">
          {Object.values(groupedTopics).map((group) => (
            <div key={`${group.track_id}-${group.subject_id}`} className="dash-card">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dash-border">
                <BookOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="font-bold text-gray-900">{group.subject_name}</h3>
                  <p className="text-sm text-gray-500">{group.track_name}</p>
                </div>
                <span className="ml-auto text-sm text-gray-400">
                  {group.topics.length} topics
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-dash-border">
                      <th className="pb-2 font-medium">Topic</th>
                      <th className="pb-2 font-medium text-center">Level</th>
                      <th className="pb-2 font-medium text-center">Status</th>
                      <th className="pb-2 font-medium text-center">RAG</th>
                      <th className="pb-2 font-medium text-center">Accuracy</th>
                      <th className="pb-2 font-medium text-center">Attempts</th>
                      <th className="pb-2 font-medium">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.topics.map((topic) => (
                      <tr key={topic.topic_id} className="border-b border-dash-border/50 last:border-0">
                        <td className="py-3">
                          <span className="font-medium text-gray-900">{topic.topic_name}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            topic.level === 'foundation' ? 'bg-blue-50 text-blue-600' :
                            topic.level === 'intermediate' ? 'bg-purple-50 text-purple-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {topic.level}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`mastery-${topic.mastery_status}`}>
                            {topic.mastery_status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`rag-${topic.rag}`}>
                            {topic.rag}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-medium">
                            {Math.round(topic.percent_correct * 100)}%
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {topic.attempts_count}
                        </td>
                        <td className="py-3 text-sm text-gray-500">
                          {topic.last_updated_at 
                            ? new Date(topic.last_updated_at).toLocaleDateString()
                            : '—'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filteredTopics.length === 0 && (
            <div className="dash-card text-center py-12">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No topics found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or start practicing to see mastery data.
              </p>
            </div>
          )}
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

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <div className="parent-view flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-dash-primary" />
      </div>
    }>
      <TopicsContent />
    </Suspense>
  );
}
