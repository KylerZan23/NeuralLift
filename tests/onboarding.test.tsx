import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnboardingQuestion from '@/components/OnboardingQuestion';

describe('OnboardingQuestion', () => {
  it('disables next button when invalid and shows busy state when submitting', () => {
    const onNext = jest.fn();
    render(
      <OnboardingQuestion
        step={10}
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
    expect(next).toHaveClass('cursor-not-allowed');
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingQuestion from '@/components/OnboardingQuestion';

describe('OnboardingQuestion', () => {
  it('validates required selection and proceeds', () => {
    const onChange = jest.fn();
    const onNext = jest.fn();
    render(
      <OnboardingQuestion
        step={1}
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

    const nextBtn = screen.getByRole('button', { name: /next/i });
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Hypertrophy' } });
    expect(onChange).toHaveBeenCalled();
  });
});


