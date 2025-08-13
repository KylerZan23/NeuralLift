import type { Meta, StoryObj } from '@storybook/react';
import LandingHero from '../components/LandingHero';

const meta: Meta<typeof LandingHero> = { title: 'Pages/LandingHero', component: LandingHero, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof LandingHero>;

export const Default: Story = { render: () => (
  <main className="min-h-screen bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
    <LandingHero />
  </main>
) };

