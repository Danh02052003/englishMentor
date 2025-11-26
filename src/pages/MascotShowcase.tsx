import { useState } from 'react';
import { motion } from 'framer-motion';

import InteractiveMascot, { MascotEmotion } from '../components/InteractiveMascot';

const scenarios: Array<{
  id: MascotEmotion;
  label: string;
  description: string;
  message: string;
}> = [
  {
    id: 'shy',
    label: 'Entering Password',
    description: 'Mascot covers eyes with hands when you type password',
    message: 'Don\'t worry, I\'m not looking! 🙈',
  },
  {
    id: 'happy',
    label: 'Correct Answer',
    description: 'Jumps up and sparkles to celebrate',
    message: 'Excellent! 100% correct! 🎉',
  },
  {
    id: 'sad',
    label: 'Wrong Answer',
    description: 'Slightly bows down with tears',
    message: 'No worries, let\'s try again! 💪',
  },
  {
    id: 'thinking',
    label: 'Thinking',
    description: 'Tilts body and shows "Hmm…" bubble',
    message: 'Let me think about this...',
  },
  {
    id: 'processing',
    label: 'Waiting for AI Result',
    description: 'Holds clipboard and shakes slightly while processing',
    message: 'Reviewing your work!',
  },
  {
    id: 'excited',
    label: 'Course Completed',
    description: 'Spins around with sparkle effects',
    message: 'You did it! 🥳',
  },
];

const MascotShowcase = () => {
  const [current, setCurrent] = useState(scenarios[0]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-rose-50 p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <p className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            🎭 Emotion Collection
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Interactive Mascot</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A simple, cute mascot that can be controlled with code. You can attach these emotions to
            different moments in the English learning experience to make it more lively and friendly.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 grid lg:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <InteractiveMascot emotion={current.id} size={220} message={current.message} />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">Scenarios</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Try a scenario 👇</h2>
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setCurrent(scenario)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    current.id === scenario.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{scenario.label}</p>
                      <p className={`text-sm ${current.id === scenario.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                        {scenario.description}
                      </p>
                    </div>
                    {current.id === scenario.id && <span>⭐</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <MiniCard
            title="1. How to Use?"
            items={[
              'Import component: import InteractiveMascot from ...',
              '<InteractiveMascot emotion="happy" />',
              'Combine with UI (Form, results, AI feedback)',
            ]}
          />
          <MiniCard
            title="2. Available Emotions"
            items={[
              'happy, excited → celebrate when correct',
              'sad → encourage when wrong',
              'thinking, processing → show when waiting for AI',
              'shy → use for sensitive fields (password)',
            ]}
          />
          <MiniCard
            title="3. Customize More"
            items={[
              'Change size with size prop',
              'Change color with color prop',
              'Pass custom message with message prop',
            ]}
          />
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Code Snippet</h3>
          <p className="text-gray-600 mb-4">Quick integration example with React:</p>
          <pre className="bg-gray-900 text-gray-100 rounded-2xl p-4 overflow-x-auto text-sm">
{`import InteractiveMascot from '@/components/InteractiveMascot';

function PasswordField({ isFocused }) {
  return (
    <div className="flex items-center gap-4">
      <InteractiveMascot emotion={isFocused ? 'shy' : 'idle'} size={140} />
      <input type="password" className="..." />
    </div>
  );
}`}
          </pre>
        </div>

        <motion.div
          className="p-6 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-center shadow-xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <p className="text-lg font-medium">
            Try attaching the mascot to each step in the learning experience – you'll be surprised by the "companion" feeling it brings!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const MiniCard = ({ title, items }: { title: string; items: string[] }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <h4 className="text-lg font-semibold text-gray-900 mb-4">{title}</h4>
    <ul className="space-y-2 text-sm text-gray-600">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="text-indigo-500 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default MascotShowcase;

