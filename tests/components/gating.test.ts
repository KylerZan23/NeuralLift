import { canViewWeek } from '@/lib/core/program-generator';

describe('gating logic', () => {
  it('allows week 1 free', () => {
    expect(canViewWeek(1, false)).toBe(true);
  });
  it('blocks week > 1 when unpaid', () => {
    expect(canViewWeek(2, false)).toBe(false);
  });
  it('allows all weeks when paid', () => {
    for (let w = 1; w <= 12; w++) expect(canViewWeek(w, true)).toBe(true);
  });
});


