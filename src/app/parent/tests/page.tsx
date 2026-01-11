'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestsPage() {
  const [tests] = useState([
    { id: 1, name: 'Diagnostic Assessment', status: 'completed', score: '78%', date: '2024-01-05' },
    { id: 2, name: 'Maths Mini Test', status: 'completed', score: '85%', date: '2024-01-08' },
    { id: 3, name: 'English Practice', status: 'available', score: null, date: null },
    { id: 4, name: 'Mock Exam 1', status: 'locked', score: null, date: null },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Tests & Assessments</h1>
          <Link href="/parent/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{test.name}</h3>
                {test.date && (
                  <p className="text-sm text-gray-500">Completed: {test.date}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {test.score && (
                  <span className="text-2xl font-bold text-green-600">{test.score}</span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'completed' ? 'bg-green-100 text-green-700' :
                  test.status === 'available' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {test.status === 'completed' ? '✓ Completed' :
                   test.status === 'available' ? 'Start Test' :
                   '🔒 Locked'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-800 mb-2">📅 Upcoming</h3>
          <p className="text-blue-700">Mock Exam 2 scheduled for next week</p>
        </div>
      </div>
    </div>
  );
}
