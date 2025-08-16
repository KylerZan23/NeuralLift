import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/lib/ui/button';
import { Input } from '@/lib/ui/input';
import { Label } from '@/lib/ui/label';
import { Card } from '@/lib/ui/card';

const meta: Meta = {
  title: 'UI/ShadcnPrimitives',
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj;

export const Buttons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  )
};

export const Inputs: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
  )
};

export const Cards: Story = {
  render: () => (
    <Card className="p-6">Card content</Card>
  )
};


