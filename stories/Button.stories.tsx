import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/lib/ui/button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Create your science-based program', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Unlock full 12 weeks', variant: 'secondary' } };
export const Ghost: Story = { args: { children: 'Generate a new program', variant: 'ghost' } };
export const Danger: Story = { args: { children: 'Delete', variant: 'danger' } };

