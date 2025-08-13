import { OnboardingInput, generateFullProgram, generateProgramWithLLM } from '@/lib/program-generator';

describe('Split enforcement', () => {
  it('deterministic generator respects days per week', () => {
    const cfg = OnboardingInput.parse({
      experience_level: 'Intermediate',
      training_frequency_preference: 4,
      equipment_available: ['Gym'],
      big3_PRs: { bench: 185, squat: 225, deadlift: 275 },
      session_length_min: 60,
      rest_pref: 'auto',
      goals: ['hypertrophy']
    });
    const weeks = generateFullProgram(cfg);
    expect(weeks[0].days.length).toBe(4);
  });

  it('LLM generator output is enforced to match days per week', async () => {
    const cfg = OnboardingInput.parse({
      experience_level: 'Intermediate',
      training_frequency_preference: 5,
      equipment_available: ['Gym'],
      big3_PRs: { bench: 185, squat: 225, deadlift: 275 },
      session_length_min: 60,
      rest_pref: 'auto',
      goals: ['hypertrophy']
    });
    const p = await generateProgramWithLLM(cfg, { programId: 'test' });
    expect(p.weeks[0].days.length).toBe(5);
  });
});


