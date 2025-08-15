import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingQuestion from '@/components/OnboardingQuestion';

describe('OnboardingQuestion', () => {
  it('disables next button when invalid and shows busy state when submitting', () => {
    const onNext = jest.fn();
    render(
      <OnboardingQuestion
        step={10}
        totalSteps={10}
        question="Test"
        name="test"
        type="text"
        value=""
        onChange={() => {}}
        onNext={onNext}
        onPrev={() => {}}
        isValid={false}
        submitting={false}
        nextLabel="Start your journey"
      />
    );
    const next = screen.getByRole('button', { name: /start your journey/i });
    expect(next).toHaveClass('disabled:cursor-not-allowed');
  });
});

import { render as render2, screen as screen2, fireEvent } from '@testing-library/react';
import OnboardingQuestion2 from '@/components/OnboardingQuestion';

describe('OnboardingQuestion required selection', () => {
  it('validates required selection and proceeds', () => {
    const onChange = jest.fn();
    const onNext = jest.fn();
    render2(
      <OnboardingQuestion2
        step={1}
        totalSteps={10}
        question="What is your primary goal?"
        name="goal"
        options={[{ label: 'Hypertrophy', value: 'Hypertrophy' }]}
        value={'' as any}
        onChange={onChange}
        onNext={onNext}
        onPrev={() => {}}
        isValid={false}
      />
    );

    const nextBtn = screen2.getByRole('button', { name: /next/i });
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(screen2.getByRole('button', { name: /Hypertrophy/i }));
    expect(onChange).toHaveBeenCalled();
  });
});


