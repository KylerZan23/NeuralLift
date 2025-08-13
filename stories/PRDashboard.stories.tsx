import type { Meta, StoryObj } from '@storybook/react';
import PRDashboard from '../components/PRDashboard';

const meta: Meta<typeof PRDashboard> = { title: 'Components/PRDashboard', component: PRDashboard, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof PRDashboard>;

export const Default: Story = { render: () => <PRDashboard /> };

