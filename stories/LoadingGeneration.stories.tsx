import type { Meta, StoryObj } from '@storybook/react';
import LoadingGeneration from '../components/LoadingGeneration';

const meta: Meta<typeof LoadingGeneration> = { title: 'Components/LoadingGeneration', component: LoadingGeneration, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof LoadingGeneration>;

export const Default: Story = {
  args: {
    answers: { experience_level: 'Intermediate', split: 'Push/Pull/Legs', equipment: 'Gym' }
  }
};

