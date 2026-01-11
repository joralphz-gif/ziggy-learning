'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, BookOpen, Code, Palette, Heart } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  // Check for existing auth on mount
  useEffect(() => {
    // For now, just show the landing page
    // Auth check would happen here
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ziggy-cream via-white to-ziggy-peach">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-bounce-gentle">
            <span className="text-8xl">🌟</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="text-gradient from-ziggy-coral to-ziggy-sunset">Ziggy</span>{' '}
            <span className="text-gradient from-ziggy-sky to-ziggy-mint">Alpha Hub</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your personal learning adventure awaits! Master 11+, coding, animation, 
            and more with fun, personalised daily lessons.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push('/login')}
              className="learner-button-primary text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Start Learning
              </span>
            </button>
            
            <button
              onClick={() => router.push('/login?role=parent')}
              className="px-8 py-4 rounded-2xl font-semibold text-gray-700 bg-white
                       border-2 border-gray-200 hover:border-ziggy-coral
                       transition-all duration-200 hover:shadow-lg"
            >
              Parent Dashboard
            </button>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="11+ Coach"
              description="Maths, English, VR & NVR mastery"
              color="from-blue-400 to-blue-600"
            />
            <FeatureCard
              icon={<Code className="w-8 h-8" />}
              title="Coding Coach"
              description="Python projects & fun challenges"
              color="from-emerald-400 to-emerald-600"
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title="Animation"
              description="Digital art & creative skills"
              color="from-amber-400 to-amber-600"
            />
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Digital Health"
              description="Wellbeing & healthy habits"
              color="from-rose-400 to-rose-600"
            />
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-white/50 py-16 mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              title="Get Your Daily Plan"
              description="Each day, Ziggy sees a personalised mix of review and new content"
            />
            <StepCard
              number={2}
              title="Learn & Practice"
              description="Work through fun questions, coding challenges, and creative activities"
            />
            <StepCard
              number={3}
              title="Track Mastery"
              description="Watch your skills grow with clear progress tracking"
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 text-center text-gray-500">
        <p>Built with 💜 for Ziggy&apos;s learning journey</p>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) {
  return (
    <div className="learner-card text-center group">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color}
                      flex items-center justify-center text-white
                      transform transition-transform group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-ziggy-coral to-ziggy-sunset
                      flex items-center justify-center text-white text-xl font-bold">
        {number}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
