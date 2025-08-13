'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import AuthButton from '@/components/AuthButton';
import { ensureAuthOrStartOAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const onPrimaryClick = useCallback(async () => {
    const result = await ensureAuthOrStartOAuth('/onboarding/1');
    if (result === 'proceeded') router.push('/onboarding/1');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between backdrop-blur-sm">
        <div className="font-semibold tracking-tight">NeuralLift</div>
        <nav className="space-x-4 flex items-center gap-3">
          <Link href="/onboarding/1" className="underline underline-offset-4 hover:opacity-90">Get Started</Link>
          <Link href="/dashboard" className="opacity-80 hover:opacity-100">Dashboard</Link>
          <AuthButton />
        </nav>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg"
          >
            Take the guesswork out of science-based lifting.
          </motion.h1>
          <p className="mt-6 text-lg md:text-xl text-white/90">
            An AI that builds you a 12‑week hypertrophy plan rooted in the latest research — tailored to your body, goals, and equipment.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <button
              onClick={onPrimaryClick}
              className="rounded-2xl bg-white text-gray-900 px-6 py-3 font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.02] transition-transform"
            >
              Create your own science-based training program now
            </button>
            <a
              href="#demo"
              className="rounded-2xl border border-white/30 px-6 py-3 font-semibold backdrop-blur-md hover:bg-white/10"
            >
              View a demo week
            </a>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="h-72 rounded-2xl bg-gradient-to-br from-cyan-400/30 via-teal-300/30 to-emerald-300/30" />
          <p className="mt-4 text-white/80">Beautiful weekly views, volume targets, and progression rules built-in.</p>
        </motion.div>
      </section>
    </main>
  );
}


