import { OnboardingInput, generateProgramWithLLM } from '@/lib/core/program-generator';

describe('AI Program Generation', () => {
  // Skip test if no OpenAI API key is available
  const skipIfNoKey = process.env.OPENAI_API_KEY ? it : it.skip;

  skipIfNoKey('AI generator respects training frequency preference', async () => {
    const cfg = OnboardingInput.parse({
      experience_level: 'Intermediate',
      training_frequency_preference: 4,
      equipment_available: ['Gym'],
      big3_PRs: { bench: 185, squat: 225, deadlift: 275 },
      session_length_min: 60,
      rest_pref: 'auto',
      goals: ['hypertrophy']
    });
    const p = await generateProgramWithLLM(cfg, { programId: 'test' });
    expect(p.weeks[0].days.length).toBe(4);
    expect(p.program_id).toBe('test');
    expect(p.weeks.length).toBe(12);
  });

  skipIfNoKey('AI generator respects training frequency (5 days)', async () => {
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
    expect(p.program_id).toBe('test');
    expect(p.weeks.length).toBe(12);
  });

  it('AI generator throws error when no API key is available', async () => {
    // Temporarily remove API key
    const originalKey = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    
    const cfg = OnboardingInput.parse({
      experience_level: 'Intermediate',
      training_frequency_preference: 3,
      equipment_available: ['Gym'],
      big3_PRs: { bench: 185, squat: 225, deadlift: 275 },
      session_length_min: 60,
      rest_pref: 'auto',
      goals: ['hypertrophy']
    });
    
    await expect(generateProgramWithLLM(cfg, { programId: 'test' }))
      .rejects.toThrow('OpenAI API key is required');
    
    // Restore API key
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey;
    }
  });
});


