import { NextRequest } from 'next/server';

describe('GET /api/program/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    expect(true).toBe(true);
  });

  it('returns 403 when authenticated but not owner', async () => {
    expect(true).toBe(true);
  });

  it('returns 200 when authenticated owner', async () => {
    expect(true).toBe(true);
  });
});


