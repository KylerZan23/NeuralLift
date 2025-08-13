'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import LoadingGeneration from '@/components/LoadingGeneration';
import OnboardingQuestion from '@/components/OnboardingQuestion';

const steps = [
  { name: 'goal', q: 'What is your primary goal?', options: ['Hypertrophy', 'Strength', 'Recomp', 'Power'] },
  { name: 'experience_level', q: 'What is your experience level?', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { name: 'days_per_week', q: 'How many days per week can you train?', options: [3, 4, 5, 6] },
  { name: 'equipment', q: 'What equipment do you have access to?', options: ['Gym', 'Home with barbell', 'Dumbbells only', 'Bands only'] },
  { name: 'big3_bench', q: 'Your bench press 1RM (lbs)', type: 'number' },
  { name: 'big3_squat', q: 'Your squat 1RM (lbs)', type: 'number' },
  { name: 'big3_deadlift', q: 'Your deadlift 1RM (lbs)', type: 'number' },
  { name: 'split', q: 'Preferred split style?', options: ['Push/Pull/Legs', 'Upper/Lower', 'Full body', 'Custom'] },
  { name: 'session_length', q: 'Preferred session length (minutes)', type: 'number' },
  { name: 'notes', q: 'Tempo preferences or injuries', type: 'text' },
] as const;

export default function OnboardingStepPage() {
  const router = useRouter();
  const params = useParams<{ step: string }>();
  const stepIdx = Math.max(0, Math.min(steps.length - 1, Number(params.step) - 1 || 0));
  const step = steps[stepIdx] as any;

  const [state, setState] = useState<Record<string, string | number>>({});

  // Load persisted answers
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboarding_state');
      if (raw) setState(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem('onboarding_state', JSON.stringify(state)); } catch {}
  }, [state]);

  const isValid = useMemo(() => {
    const v = state[step.name];
    if (['big3_bench', 'big3_squat', 'big3_deadlift', 'session_length'].includes(step.name)) {
      return typeof v === 'number' && v > 0;
    }
    if (step.type === 'text') return typeof v === 'string' && v.length >= 0;
    return !!v;
  }, [state, step]);

  const [submitting, setSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const onNext = async () => {
    if (!isValid) return;
    if (stepIdx < steps.length - 1) {
      router.push(`/onboarding/${stepIdx + 2}`);
    } else {
      // Finalize: POST generate-program and redirect to program page
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const payload = {
        programId: crypto.randomUUID(),
        useGPT: false,
        userId: data.user?.id,
        input: {
          experience_level: (state['experience_level'] as any) ?? 'Intermediate',
          training_frequency_preference: Number(state['days_per_week'] ?? 5),
          equipment_available: [(state['equipment'] as any) ?? 'Gym'],
          goals: ['hypertrophy'],
          big3_PRs: {
            bench: Number(state['big3_bench'] ?? 185),
            squat: Number(state['big3_squat'] ?? 185),
            deadlift: Number(state['big3_deadlift'] ?? 225)
          },
          preferred_split: (state['split'] as any) ?? 'Push/Pull/Legs',
          session_length_min: Number(state['session_length'] ?? 60),
          rest_pref: 'auto',
          nutrition: 'maintenance'
        }
      };
      setSubmitting(true);
      setShowLoader(true);
      fetch('/api/generate-program', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(r => r.json())
        .then((p) => {
          try { localStorage.removeItem('onboarding_state'); } catch {}
          router.push(`/program/${p.program_id}`);
        })
        .catch(() => router.push('/dashboard'))
        .finally(() => setSubmitting(false));
    }
  };

  const onPrev = () => {
    if (stepIdx > 0) router.push(`/onboarding/${stepIdx}`);
    else router.push('/');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {showLoader ? (
          <LoadingGeneration
            answers={{
              split: state['split'],
              equipment: state['equipment'],
              experience_level: state['experience_level']
            }}
          />
        ) : (
          <>
            <OnboardingQuestion
              step={stepIdx + 1}
              question={step.q}
              description="Answer honestly for the best plan."
              name={step.name}
              type={(step as any).type as any}
              options={Array.isArray(step.options) ? step.options.map((o: any) => ({ label: String(o), value: o })) : []}
              value={state[step.name]}
              onChange={(v) => setState(prev => ({ ...prev, [step.name]: v }))}
              onNext={onNext}
              onPrev={onPrev}
              isValid={isValid}
              submitting={submitting}
              nextLabel={stepIdx === steps.length - 1 ? 'Start your journey' : 'Next'}
            />
            <div className="text-center text-white/80">
              Your progress is saved locally. Sign in on the dashboard to store securely.
            </div>
          </>
        )}
      </div>
    </main>
  );
}


