'use client';
import { motion } from 'framer-motion';

export default function LoadingGeneration({ answers }: { answers: Record<string, any> }) {
  const freq = answers.days_per_week ?? 'selected frequency';
  const equip = answers.equipment ?? 'available equipment';
  const level = answers.experience_level ?? 'experience level';

  const messages = [
    'Building your personalized 12-week plan…',
    `Designing an optimal hypertrophy split for ${freq} days/week with your ${equip}…`,
    `Fine-tuning volume to match your experience level: ${level}.`,
    'Almost done — optimizing sets and rest for your goals.',
  ];

  return (
    <div className="rounded-3xl bg-white/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '90%' }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
        />
      </div>
      <ul className="mt-4 space-y-1 text-gray-800">
        {messages.map((m, i) => (
          <li key={i} className="text-sm">{m}</li>
        ))}
      </ul>
    </div>
  );
}


