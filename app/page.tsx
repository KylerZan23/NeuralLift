'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ensureAuthOrStartOAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { ArrowRight, Zap, Target, Users, Smartphone, BarChart3, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const gotoOnboarding = useCallback(async () => {
    const result = await ensureAuthOrStartOAuth('/onboarding/1');
    if (result === 'proceeded') router.push('/onboarding/1');
  }, [router]);

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
                Sign up with Google
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
                  Elevate Your{' '}
                  <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                    Fitness Journey
                  </span>{' '}
                  with AI Precision
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
                <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-xl">Weekly Overview</h3>
                      <Badge variant="secondary">Week 4</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-primary rounded-full"></div>
                          <span className="font-medium">Upper Body Strength</span>
                        </div>
                        <span className="text-sm text-muted-foreground">45 min</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg border border-accent/10">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-accent rounded-full"></div>
                          <span className="font-medium">HIIT Cardio</span>
                        </div>
                        <span className="text-sm text-muted-foreground">30 min</span>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                          <span className="font-medium">Recovery & Mobility</span>
                        </div>
                        <span className="text-sm text-muted-foreground">20 min</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground text-center">
                        Beautiful weekly views, volume targets, and progression rules built-in.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full blur-3xl -z-10"></div>
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
              <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge exercise science with modern science-based lifting
              methodologies to provide science-based lifting tailored to you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: 'Personalized Workouts Tailored Just for You',
                description:
                  'AI analyzes your fitness level, goals, and available equipment to create the perfect program.',
                color: 'primary'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Real-Time Feedback for Optimal Performance',
                description: 'Track your progress with intelligent insights and adaptive recommendations.',
                color: 'accent'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Join a Community of Achievers',
                description: 'Connect with like-minded individuals and share your fitness journey.',
                color: 'primary'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Science-Based Methodology',
                description: 'Every workout is backed by the latest research in exercise science and physiology.',
                color: 'accent'
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: 'Goal-Oriented Programming',
                description: "Whether it's strength, endurance, or body composition - we've got you covered.",
                color: 'primary'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Adaptive Intelligence',
                description: 'Your program evolves with you, ensuring continuous progress and preventing plateaus.',
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
                  Ready to Transform Your{' '}
                  <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                    Fitness Journey?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of users who have already discovered the power of AI-driven fitness. Your personalized
                  program is just one click away.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={gotoOnboarding}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="border-2 border-border hover:border-primary/50 px-8 py-4 text-lg font-medium transition-all duration-300 hover:scale-105 bg-transparent text-foreground"
                >
                  Learn More
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">No credit card required • 14-day free trial • Cancel anytime</p>
            </div>
          </Card>
        </div>
      </section>

      <footer className="py-12 px-6 lg:px-8 border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-display font-bold text-2xl text-foreground">NeuralLift</div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
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

