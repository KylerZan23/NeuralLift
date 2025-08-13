'use client';
import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import LoadingGeneration from '@/components/LoadingGeneration';
import OnboardingQuestion from '@/components/OnboardingQuestion';

export default function OnboardingStepPage() {
  const router = useRouter();
  const params = useParams<{ step: string }>();

  const [state, setState] = useState<Record<string, string | number>>(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('onboarding_state');
        return raw ? JSON.parse(raw) : {};
      }
    } catch {}
    return {};
  });

  const steps = useMemo(() => {
    const base: Array<any> = [
      { name: 'experience_level', q: 'What is your experience level?', options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'days_per_week', q: 'How many days per week can you train?', options: [2, 3, 4, 5, 6] },
      { name: 'equipment', q: 'What equipment do you have access to?', options: ['Gym', 'Home with barbell', 'Dumbbells only'] },
      { name: 'big3_bench', q: 'Your bench press 1RM (lbs)', type: 'number' },
      { name: 'big3_squat', q: 'Your squat 1RM (lbs)', type: 'number' },
      { name: 'big3_deadlift', q: 'Your deadlift 1RM (lbs)', type: 'number' },
      { name: 'session_length', q: 'Preferred session length (minutes)', options: [30, 45, 60, 90] },
    ];
    if (Number(state['days_per_week']) === 6) {
      const idx = base.findIndex(s => s.name === 'days_per_week');
      const focusStep = { name: 'focus_point', q: 'Because you are training 6x week, pick a weak point to emphasize', options: ['Arms', 'Chest', 'Back', 'Quads', 'Glutes', 'Delts'] };
      base.splice(idx + 1, 0, focusStep);
    }
    base.push({ name: 'notes', q: 'Any preferences or injury limitations? (optional)', type: 'text' });
    return base as ReadonlyArray<any>;
  }, [state['days_per_week']]);

  const stepIdx = Math.max(0, Math.min(steps.length - 1, (Number(params.step) || 1) - 1));
  const step = steps[stepIdx] as any;

  // No separate load effect; initial state reads from localStorage synchronously

  // Persist on change
  useEffect(() => {
    try { localStorage.setItem('onboarding_state', JSON.stringify(state)); } catch {}
  }, [state]);

  const totalSteps = steps.length;
  const isValid = useMemo(() => {
    const v = state[step.name];
    if (['big3_bench', 'big3_squat', 'big3_deadlift'].includes(step.name)) {
      return typeof v === 'number' && Number.isFinite(v) && v > 0;
    }
    if (step.name === 'session_length') {
      return [30,45,60,90].includes(Number(v));
    }
    if (step.name === 'experience_level') {
      return ['Beginner','Intermediate','Advanced'].includes(String(v));
    }
    if (step.name === 'days_per_week') {
      const n = Number(v);
      return Number.isFinite(n) && n >= 2 && n <= 6;
    }
    if (step.name === 'focus_point') {
      const days = Number(state['days_per_week']);
      const ok = ['Arms', 'Chest', 'Back', 'Quads', 'Glutes', 'Delts'].includes(String(v));
      return days === 6 ? ok : true;
    }
    if (step.type === 'text') return true;
    return v != null && String(v).length > 0;
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
      const toNum = (v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
      };
      const exp = state['experience_level'] as string | undefined;
      const days = toNum(state['days_per_week']);
      const sess = toNum(state['session_length']);
      if (!exp || !['Beginner', 'Intermediate', 'Advanced'].includes(exp)) {
        alert('Please select your experience level.');
        return;
      }
      if (days == null || days < 2 || days > 6) {
        alert('Please select valid training days per week (2–6).');
        return;
      }
      if (sess == null || ![30, 45, 60, 90].includes(sess)) {
        alert('Please select a valid session length (30, 45, 60, or 90 minutes).');
        return;
      }
      const payload = {
        programId: crypto.randomUUID(),
        useGPT: true,
        userId: data.user?.id,
        input: {
          experience_level: exp as any,
          training_frequency_preference: days,
          equipment_available: state['equipment'] ? [state['equipment'] as any] : [],
          goals: ['hypertrophy'],
          big3_PRs: {
            bench: toNum(state['big3_bench']),
            squat: toNum(state['big3_squat']),
            deadlift: toNum(state['big3_deadlift'])
          },
          preferred_split: undefined,
          focus_point: state['focus_point'] as any,
          session_length_min: sess,
          rest_pref: 'auto',
          nutrition: 'maintenance'
        }
      };
      setSubmitting(true);
      setShowLoader(true);
      // Save PRs entered during onboarding so the dashboard is prefilled
      try {
        if (data.user?.id) {
          const res = await fetch('/api/pr/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bench: Number(state['big3_bench']),
              squat: Number(state['big3_squat']),
              deadlift: Number(state['big3_deadlift'])
            })
          });
          if (!res.ok) {
            try {
              localStorage.setItem('pending_prs', JSON.stringify({
                bench: Number(state['big3_bench']),
                squat: Number(state['big3_squat']),
                deadlift: Number(state['big3_deadlift'])
              }));
            } catch {}
          }
        } else {
          // Persist locally so dashboard can prefill before sign-in
          try {
            localStorage.setItem('pending_prs', JSON.stringify({
              bench: Number(state['big3_bench']),
              squat: Number(state['big3_squat']),
              deadlift: Number(state['big3_deadlift'])
            }));
          } catch {}
        }
      } catch {}
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
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)]">
      <div className="pt-24 pb-12 px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 relative">
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-accent/15 to-primary/15 rounded-full blur-3xl -z-10" />
        {showLoader ? (
          <LoadingGeneration
            answers={{
              days_per_week: state['days_per_week'],
              equipment: state['equipment'],
              experience_level: state['experience_level']
            }}
          />
        ) : (
          <>
              <OnboardingQuestion
                step={stepIdx + 1}
                totalSteps={totalSteps}
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
              <div className="text-center text-muted-foreground">
                Your progress is saved locally. Sign in on the dashboard to store securely.
              </div>
          </>
        )}
        </div>
      </div>
    </main>
  );
}


