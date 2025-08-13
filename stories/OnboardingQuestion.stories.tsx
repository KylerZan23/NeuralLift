import type { Meta, StoryObj } from '@storybook/react';
import OnboardingQuestion from '../components/OnboardingQuestion';

const meta: Meta<typeof OnboardingQuestion> = {
  title: 'Components/OnboardingQuestion',
  component: OnboardingQuestion,
  tags: ['autodocs'],
  parameters: { layout: 'centered' }
};
export default meta;
type Story = StoryObj<typeof OnboardingQuestion>;

export const Choice: Story = {
  args: {
    step: 2,
    totalSteps: 8,
    question: 'What is your training experience level?',
    name: 'experience_level',
    type: 'select',
    options: [
      { label: 'Beginner', value: 'Beginner' },
      { label: 'Intermediate', value: 'Intermediate' },
      { label: 'Advanced', value: 'Advanced' }
    ],
    value: 'Intermediate',
    onChange: () => {},
    onNext: () => {},
    onPrev: () => {},
    isValid: true
  }
};

export const NumberInput: Story = {
  args: {
    step: 5,
    totalSteps: 8,
    question: 'Enter your bench press 1RM (lb)',
    name: 'big3_bench',
    type: 'number',
    value: 185,
    onChange: () => {},
    onNext: () => {},
    onPrev: () => {},
    isValid: true
  }
};

