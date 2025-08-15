'use client';
import PRDashboard from '@/components/PRDashboard';
import ValidityCard from '@/components/ValidityCard';
import { useCallback } from 'react';
import { getSupabaseClient } from '@/lib/integrations/supabase';
import { fetchLatestProgramIdForUser } from '@/lib/programs';
import TopNav from '@/components/TopNav';
import PRProgressChart from '@/components/PRProgressChart';
import { Button } from '@/lib/ui/button';
import { Card } from '@/lib/ui/card';
import Badge from '@/lib/ui/badge';

export default function DashboardPage() {
  const onGenerateNew = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      const programId = await fetchLatestProgramIdForUser(supabase, userId);
      if (!programId) return;
      const res = await fetch('/api/stripe-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ programId, reason: 'regenerate_program', userId }) });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch {}
  }, []);
  return (
    <main className="min-h-screen bg-gradient-to-br from-[oklch(0.985_0.015_240)] via-card to-[oklch(0.985_0.01_240)] text-foreground">
      <TopNav />
      <section className="pt-20 pb-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-primary/20">Overview</Badge>
              <h1 className="font-display text-3xl md:text-4xl">Dashboard</h1>
            </div>
            <Button variant="outline" onClick={onGenerateNew}>Generate a new program</Button>
          </div>

          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <PRProgressChart />
          </Card>

          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <PRDashboard />
          </Card>

          <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border-border/50">
            <h2 className="font-display text-2xl mb-4">Validity</h2>
            <ValidityCard ok={true}>
              <div className="space-y-4 text-foreground">
                <div className="font-display text-xl">How your plan is constructed</div>
                <p className="text-muted-foreground">
                  Your program aligns with established hypertrophy principles: weekly volume per muscle (~10–20 sets), progressive overload,
                  close‑to‑failure effort (RIR 1–3), and appropriate rest for performance.
                </p>
                <div>
                  <div className="font-display text-xl">Selected peer‑reviewed references:</div>
                  <ul className="mt-4 list-disc pl-6 space-y-3 text-foreground">
                    <li>
                      Schoenfeld BJ, et al. Dose–response relationship between weekly resistance training volume and muscle hypertrophy. 2017.{' '}
                      <a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/28713535/" target="_blank" rel="noreferrer">PubMed</a>
                    </li>
                    <li>
                      Schoenfeld BJ, et al. Effects of resistance training frequency on measures of muscle hypertrophy: systematic review & meta‑analysis. 2016.{' '}
                      <a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/27102172/" target="_blank" rel="noreferrer">PubMed</a>
                    </li>
                    <li>
                      Grgic J, et al. Effects of rest interval duration on muscular strength & hypertrophy: meta‑analysis. 2018.{' '}
                      <a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/29481484/" target="_blank" rel="noreferrer">PubMed</a>
                    </li>
                    <li>
                      Rafie Y, et al. Repetitions in reserve vs. %1RM: associations with muscular adaptations. 2020.{' '}
                      <a className="text-primary underline" href="https://pubmed.ncbi.nlm.nih.gov/32584050/" target="_blank" rel="noreferrer">PubMed</a>
                    </li>
                  </ul>
                </div>
              </div>
            </ValidityCard>
          </Card>
        </div>
      </section>
    </main>
  );
}


