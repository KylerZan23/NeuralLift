'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ensureAuthOrStartOAuth } from '@/lib/utils/auth';
import { Button } from '@/lib/ui/button';
import { Card } from '@/lib/ui/card';
import ProgramWeekView from '@/components/ProgramWeekView';
import Badge from '@/lib/ui/badge';
import { ArrowRight, Zap, Target, Smartphone, BarChart3, Shield } from 'lucide-react';
import { getSupabaseClient } from '@/lib/integrations/supabase';

export default function HomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    const supabase = getSupabaseClient();
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
    };
    getUser();
  }, []);
  const gotoOnboarding = useCallback(async () => {
    const result = await ensureAuthOrStartOAuth('/onboarding/1');
    if (result === 'proceeded') router.push('/onboarding/1');
  }, [router]);
  const gotoAbout = useCallback(() => {
    router.push('/about');
  }, [router]);
  const sampleDays = [
    {
      day_number: 1,
      focus: 'Push',
      exercises: [
        { id: 'bb-bench', name: 'Barbell Bench Press', sets: 3, reps: '5-8', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'incline-db-press', name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'db-shoulder-press', name: 'Seated Dumbbell Shoulder Press', sets: 2, reps: '5-8', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'cable-lateral-raise', name: 'Cable Lateral Raise', sets: 3, reps: '10-12', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'oh-cable-tricep-ext', name: 'Overhead Cable Tricep Extension', sets: 3, reps: '5-8', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'cable-tricep-kickback', name: 'Cable Tricep Kickback', sets: 2, reps: '10-12', rpe: 1, tempo: '', rest_seconds: 180 },
        { id: 'cable-crunches', name: 'Cable Crunches', sets: 2, reps: '10-12', rpe: 1, tempo: '', rest_seconds: 180 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)]">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="font-display font-bold text-2xl text-foreground">NeuralLift</div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Button
                onClick={gotoOnboarding}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {email ? `Continue as ${email}` : 'Sign up with Google'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-accent/10 text-accent border-accent/20">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Training
              </Badge>

              <div className="space-y-6">
                <h1 className="font-display font-bold text-5xl lg:text-7xl leading-tight text-foreground">
                  Take the guesswork out of{' '}
                  <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">science-based</span>{' '}
                  lifting
                </h1>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  An AI that builds you a 12‑week hypertrophy plan rooted in the latest research — tailored to your
                  preferences, equipment, and strength.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={gotoOnboarding}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse-glow"
                >
                  Create Your Program Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-foreground">10k+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-foreground">12 Weeks</div>
                  <div className="text-sm text-muted-foreground">Program Length</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-2xl text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 animate-float">
                <ProgramWeekView
                  weekNumber={1}
                  days={sampleDays}
                  singleColumn
                  twoColumnExercises
                  exerciseSplitLeftCount={4}
                  prs={{ bench: 185 }}
                  experience={'Intermediate'}
                  suggestedWeightOverrides={{
                    'Incline Dumbbell Press': { low: 60, high: 70, perHand: true },
                    'Seated Dumbbell Shoulder Press': { low: 50, high: 60, perHand: true },
                    'Cable Lateral Raise': { low: 15, high: 25, perHand: true },
                    'Cable Crunches': null
                  }}
                />
              </div>

              <div className="absolute -top-2 -right-2 w-56 h-56 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Target className="w-4 h-4 mr-2" />
              Core Features
            </Badge>
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
              Everything You Need to{' '}
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">Progress</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge exercise science with modern science-based lifting
              methodologies to create optimal training tailored to you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: 'Personalized Workouts Tailored Just for You',
                description:
                  'AI analyzes your experience level, preferences, equipment, and strength to create the most optimal program for you.',
                color: 'primary'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Track Your Progress for Optimal Performance',
                description: 'Track your personal records over time to monitor adaptation and growth.',
                color: 'accent'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Science-Based Methodology',
                description: 'Every workout is backed by the latest research in exercise science and physiology.',
                color: 'accent'
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
              >
                <div
                  className={`inline-flex p-3 rounded-xl mb-6 ${
                    feature.color === 'primary'
                      ? 'bg-primary/10 text-primary group-hover:bg-primary/20'
                      : 'bg-accent/10 text-accent group-hover:bg-accent/20'
                  } transition-colors`}
                >
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-border/50 shadow-2xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
                  Ready to train <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">optimally?</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users who have already simplified their science-based lifting journey. Your
                  personalized program is just one click away.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={gotoOnboarding}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Generate Your Program Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={gotoAbout}
                  className="border-2 border-border hover:border-primary/50 px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 bg-transparent text-foreground"
                >
                  Learn More
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">Generate a 12-week program for free</p>
            </div>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-6 lg:px-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-display font-bold text-2xl text-foreground">NeuralLift</div>
            <div className="flex items-center gap-8">
              <a href="/terms#privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-muted-foreground">© 2025 NeuralLift. All rights reserved. Elevating fitness through AI innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

