import type { Meta, StoryObj } from '@storybook/react';
import Card from '../components/Card';

const meta: Meta<typeof Card> = { title: 'Components/Card', component: Card, parameters: { layout: 'padded' }, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-gray-900">Program week 1</h3>
      <p className="text-gray-700">Push / Pull / Legs split</p>
    </Card>
  )
};

export const Elevated: Story = {
  render: () => (
    <Card className="p-6 shadow-2xl">
      <h3 className="text-xl font-semibold text-gray-900">Coach tip</h3>
      <p className="text-gray-700">Warm up properly.</p>
    </Card>
  )
};

