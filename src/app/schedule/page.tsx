'use client';

import Link from 'next/link';

export default function SchedulePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const schedule = {
    Monday: [
      { time: '16:00', subject: 'Maths', duration: '30 min', color: 'bg-blue-100 text-blue-800' },
      { time: '16:30', subject: 'English', duration: '30 min', color: 'bg-purple-100 text-purple-800' },
    ],
    Tuesday: [
      { time: '16:00', subject: 'Verbal Reasoning', duration: '30 min', color: 'bg-green-100 text-green-800' },
      { time: '16:30', subject: 'Python Coding', duration: '30 min', color: 'bg-yellow-100 text-yellow-800' },
    ],
    Wednesday: [
      { time: '16:00', subject: 'Maths', duration: '30 min', color: 'bg-blue-100 text-blue-800' },
      { time: '16:30', subject: 'Non-Verbal Reasoning', duration: '30 min', color: 'bg-pink-100 text-pink-800' },
    ],
    Thursday: [
      { time: '16:00', subject: 'English', duration: '30 min', color: 'bg-purple-100 text-purple-800' },
      { time: '16:30', subject: 'Python Coding', duration: '30 min', color: 'bg-yellow-100 text-yellow-800' },
    ],
    Friday: [
      { time: '16:00', subject: 'Mixed Review', duration: '45 min', color: 'bg-orange-100 text-orange-800' },
    ],
    Saturday: [
      { time: '10:00', subject: 'Mock Test Practice', duration: '60 min', color: 'bg-red-100 text-red-800' },
    ],
    Sunday: [
      { time: '', subject: 'Rest Day 🌟', duration: '', color: 'bg-gray-100 text-gray-600' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Weekly Schedule</h1>
          <Link href="/parent/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-4">
          {days.map((day) => (
            <div key={day} className="bg-white rounded-xl shadow p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">{day}</h3>
              <div className="flex flex-wrap gap-3">
                {schedule[day as keyof typeof schedule].map((item, idx) => (
                  <div key={idx} className={`px-4 py-2 rounded-lg ${item.color}`}>
                    {item.time && <span className="font-medium">{item.time}</span>}
                    <span className="mx-2">{item.subject}</span>
                    {item.duration && <span className="text-sm opacity-75">({item.duration})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-green-50 rounded-xl">
          <h3 className="font-semibold text-green-800 mb-2">💡 Tip</h3>
          <p className="text-green-700">Consistent daily practice is more effective than long weekend sessions!</p>
        </div>
      </div>
    </div>
  );
}
