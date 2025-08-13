import { test, expect } from '@playwright/test';

test.describe('Dashboard PR save flow', () => {
  test('Shows inputs and allows saving (no auth required in dev)', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/dashboard');
    await expect(page.getByLabel(/bench/i)).toBeVisible();
    await page.getByLabel(/bench/i).fill('200');
    await page.getByLabel(/squat/i).fill('250');
    await page.getByLabel(/deadlift/i).fill('300');
    await page.getByRole('button', { name: /save/i }).click();
  });
});


