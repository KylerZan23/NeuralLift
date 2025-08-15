'use client';
import { motion } from 'framer-motion';

export default function LoadingGeneration({ answers }: { answers: Record<string, string | number | undefined> }) {
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
    <div className="rounded-xl bg-card/70 p-6 backdrop-blur-xl shadow-xl border border-border/50">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '90%' }}
          transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
          className="h-full bg-gradient-to-r from-primary via-accent to-primary"
        />
      </div>
      <ul className="mt-4 space-y-1 text-foreground">
        {messages.map((m, i) => (
          <li key={i} className="text-sm">{m}</li>
        ))}
      </ul>
    </div>
  );
}


