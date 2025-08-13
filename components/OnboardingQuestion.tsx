'use client';
import { useEffect, useMemo } from 'react';

type Option = { label: string; value: string | number };
type Props = {
  step: number;
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
  step, question, description, name, type = 'select', options = [], value, onChange, onNext, onPrev, isValid, submitting = false, nextLabel,
}: Props) {
  const inputId = useMemo(() => `oq-${name}`, [name]);

  useEffect(() => {
    const el = document.getElementById(inputId);
    el?.focus();
  }, [inputId]);

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl shadow-xl">
      <div aria-live="polite" className="text-sm text-gray-600">Step {step} of 10</div>
      <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">{question}</h2>
      {description ? <p className="mt-2 text-gray-700">{description}</p> : null}

      <div className="mt-6">
        {type === 'select' && (
          <select
            id={inputId}
            aria-label={question}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">Select an option</option>
            {options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
          </select>
        )}

        {type === 'text' && (
          <input
            id={inputId}
            type="text"
            aria-label={question}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
          />
        )}

        {type === 'number' && (
          <input
            id={inputId}
            type="number"
            aria-label={question}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onPrev}
          className="rounded-xl px-4 py-2 border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Back
        </button>
        <button
          onClick={onNext}
          aria-disabled={!isValid || submitting}
          disabled={!isValid || submitting}
          aria-busy={submitting}
          className={`rounded-xl px-4 py-2 font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-500 ${isValid && !submitting ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          {submitting ? 'Submitting…' : (nextLabel ?? 'Next')}
        </button>
      </div>
    </div>
  );
}


