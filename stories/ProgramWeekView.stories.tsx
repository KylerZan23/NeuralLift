import type { Meta, StoryObj } from '@storybook/react';
import ProgramWeekView from '../components/ProgramWeekView';

const meta: Meta<typeof ProgramWeekView> = { title: 'Components/ProgramWeekView', component: ProgramWeekView, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ProgramWeekView>;

const sampleDays = [
  {
    day_number: 1,
    focus: 'Push',
    exercises: [
      { id: 'bp', name: 'Barbell Bench Press', sets: 4, reps: '8-10', rpe: 7, tempo: '2-0-1', rest_seconds: 120 },
      { id: 'dbf', name: 'Dumbbell Fly', sets: 3, reps: '10-12', rpe: 8, tempo: '2-1-1', rest_seconds: 60 }
    ]
  }
];

export const Default: Story = { args: { weekNumber: 1, days: sampleDays as any } };

