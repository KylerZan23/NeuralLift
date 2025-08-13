import type { Meta, StoryObj } from '@storybook/react';
import ValidityCard from '../components/ValidityCard';

const meta: Meta<typeof ValidityCard> = { title: 'Components/ValidityCard', component: ValidityCard, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof ValidityCard>;

export const Success: Story = { args: { ok: true, message: 'Program validated: weekly volume in target range.' } };
export const Warning: Story = { args: { ok: false, message: 'Deload scheduled: reduce volume by ~40% this week.' } };

