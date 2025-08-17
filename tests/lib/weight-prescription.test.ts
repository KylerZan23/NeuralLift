import { computeSuggestedWorkingWeight, computeSuggestedWorkingWeightRange } from '@/lib/core/weight-prescription';

describe('computeSuggestedWorkingWeight', () => {
  const prs = { bench: 225, squat: 315, deadlift: 405 };

  it('returns null when no mapping found', () => {
    expect(computeSuggestedWorkingWeight('Cable Crunch', prs, 'Intermediate')).toBeNull();
  });

  it('computes OHP suggestion using high end for Intermediate', () => {
    // Bench 225; OHP high ratio 0.65 => accessory 1RM 146.25; working 0.82 = 120. ? -> 120 after rounding
    const w = computeSuggestedWorkingWeight('Standing Overhead Press', prs, 'Intermediate');
    expect(w).toBe(120);
  });

  it('returns a range for main lifts using 80–85%', () => {
    const rng = computeSuggestedWorkingWeightRange('Barbell Bench Press', prs, 'Intermediate');
    expect(rng).not.toBeNull();
    expect(rng?.low).toBe(180);  // 225 * .80 = 180
    expect(rng?.high).toBe(190); // 225 * .85 = 191.25 -> 190
  });

  it('uses lower bound for Beginner and upper for Advanced', () => {
    const beg = computeSuggestedWorkingWeight('Barbell Row', prs, 'Beginner');
    const adv = computeSuggestedWorkingWeight('Barbell Row', prs, 'Advanced');
    expect(beg).not.toBeNull();
    expect(adv).not.toBeNull();
    expect((beg as number) <= (adv as number)).toBe(true);
  });
});


