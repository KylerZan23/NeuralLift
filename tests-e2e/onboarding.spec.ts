import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
  test('Landing -> Start -> Onboarding step 1', async ({ page, baseURL }) => {
    await page.goto(baseURL!);
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible();
    await page.getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/onboarding\/1$/);
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
  });

  test('Completes onboarding and shows loading screen before redirect', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/onboarding/1');
    // Step 1: experience level
    await page.getByRole('button', { name: /Intermediate/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    // Step 2: frequency
    await page.getByRole('button', { name: /^5$/ }).click();
    await page.getByRole('button', { name: /next/i }).click();
    // Step 3: equipment
    await page.getByRole('button', { name: /Gym/i }).click();
    await page.getByRole('button', { name: /next/i }).click();
    // Step 4-6 numbers
    await page.getByLabel(/bench press 1rm/i).fill('185');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/squat 1rm/i).fill('225');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/deadlift 1rm/i).fill('275');
    await page.getByRole('button', { name: /next/i }).click();
    // Step 7 session length
    await page.getByLabel(/session length/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();
    // Step 8 notes (optional)
    await page.getByLabel(/preferences or injury limitations/i).fill('');
    await page.getByRole('button', { name: /start your journey/i }).click();
    // Loader visible
    await expect(page.getByText(/Building your personalized 12-week plan/i)).toBeVisible();
  });
});
