'use client';
import { useEffect, useMemo } from 'react';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';

type Option = { label: string; value: string | number };
type Props = {
  step: number;
  totalSteps: number;
  question: string;
  description?: string;
  name: string;
  type?: 'select' | 'text' | 'number' | 'radio';
  options?: Option[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
  isValid: boolean;
  submitting?: boolean;
  nextLabel?: string;
};

export default function OnboardingQuestion({
  step, totalSteps, question, description, name, type = 'select', options = [], value, onChange, onNext, onPrev, isValid, submitting = false, nextLabel,
}: Props) {
  const inputId = useMemo(() => `oq-${name}`, [name]);

  useEffect(() => {
    const el = document.getElementById(inputId);
    el?.focus();
  }, [inputId]);

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl">
      <div aria-live="polite" className="text-sm text-gray-600">Step {step} of {totalSteps}</div>
      <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">{question}</h2>
      {description ? <p className="mt-2 text-gray-700">{description}</p> : null}

      <div className="mt-6">
        {type === 'select' && (
          <div role="group" aria-label={question} id={inputId} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map(o => {
              const isActive = String(value ?? '') === String(o.value);
              return (
                <button
                  key={String(o.value)}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onChange(o.value)}
                  className={`w-full text-left rounded-2xl border p-4 transition focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                >
                  <span className="font-medium text-gray-900">{o.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {type === 'text' && (
          <Input
            id={inputId}
            type="text"
            aria-label={question}
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {type === 'number' && (
          <Input
            id={inputId}
            type="number"
            aria-label={question}
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={onPrev}>Back</Button>
        <Button onClick={onNext} aria-disabled={!isValid || submitting} disabled={!isValid || submitting} aria-busy={submitting}>
          {submitting ? 'Submitting…' : (nextLabel ?? 'Next')}
        </Button>
      </div>
    </div>
  );
}


