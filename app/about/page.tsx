'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)] px-6 lg:px-8 py-24">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20">About</Badge>
          <h1 className="font-display font-bold text-4xl lg:text-6xl leading-tight text-foreground">About NeuralLift</h1>
          <p className="text-lg text-muted-foreground">Train smarter with AI‑guided, science‑based programming.</p>
        </div>

        <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50">
          <section className="space-y-6">
            <p className="text-foreground">
              NeuralLift is a modern web app that delivers personalized, science-based hypertrophy training programs in seconds. Using advanced AI, NeuralLift tailors every set, rep, and rest period to your unique preferences, experience level, and performance data—so you can train smarter, not just harder.
            </p>

            <div className="space-y-4">
              <h2 className="font-display font-bold text-2xl text-foreground">Core Features</h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>
                  <span className="font-semibold">AI-Generated 12-Week Training Plans</span> – Built on the latest exercise science for maximum muscle growth
                </li>
                <li>
                  <span className="font-semibold">Evidence-Driven Programming</span> – Exercise selection, splits, and progression inspired by research-backed best practices
                </li>
                <li>
                  <span className="font-semibold">Progress Tracking Dashboard</span> – Log PRs, view progress charts, and get updated programs as you get stronger
                </li>
                <li>
                  <span className="font-semibold">Seamless Experience</span> – Google sign-in, intuitive onboarding, and clean, Apple-like design
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-bold text-2xl text-foreground">What is Science-Based Lifting?</h2>
              <p className="text-foreground">
                Science-based lifting applies proven, peer-reviewed research to strength training. It optimizes exercises, volume, intensity, and recovery to help you achieve your goals efficiently—without falling for gym myths or fad routines.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-display font-bold text-2xl text-foreground">Why I Created NeuralLift</h2>
              <p className="text-foreground">
                The fitness space is overflowing with conflicting advice, complicated training theories, and cookie-cutter plans that don’t adapt to individual needs. Even in the “science-based” lifting world, the information is scattered and often impractical to apply.
              </p>
              <p className="text-foreground">
                I created NeuralLift to cut through the noise, distill the best of modern exercise science, and make it instantly usable for anyone. No spreadsheets. No endless YouTube rabbit holes. Just a simple, beautiful, effective program—tailored to you.
              </p>
              <p className="text-muted-foreground">
                Kyler Zanuck – Creator of <a href="https://www.copacer.com/" target="_blank" rel="noopener noreferrer" className="underline">CoPacer</a>
              </p>
            </div>
          </section>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </div>
  );
}


