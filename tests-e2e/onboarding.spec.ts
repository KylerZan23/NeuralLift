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
    // Step 1: select goal
    await page.getByLabel(/what is your primary goal/i).selectOption({ label: 'Hypertrophy' });
    await page.getByRole('button', { name: /next/i }).click();
    // Step 2
    await page.getByLabel(/what is your experience level/i).selectOption({ label: 'Intermediate' });
    await page.getByRole('button', { name: /next/i }).click();
    // Step 3
    await page.getByLabel(/how many days per week/i).selectOption('5');
    await page.getByRole('button', { name: /next/i }).click();
    // Step 4
    await page.getByLabel(/what equipment do you have/i).selectOption({ label: 'Gym' });
    await page.getByRole('button', { name: /next/i }).click();
    // Step 5-7 numbers
    await page.getByLabel(/bench press 1rm/i).fill('185');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/squat 1rm/i).fill('225');
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByLabel(/deadlift 1rm/i).fill('275');
    await page.getByRole('button', { name: /next/i }).click();
    // Step 8 split
    await page.getByLabel(/preferred split/i).selectOption({ label: 'Push\/Pull\/Legs' });
    await page.getByRole('button', { name: /next/i }).click();
    // Step 9 session length
    await page.getByLabel(/session length/i).fill('60');
    await page.getByRole('button', { name: /next/i }).click();
    // Step 10 notes
    await page.getByLabel(/tempo preferences or injuries/i).fill('');
    await page.getByRole('button', { name: /start your journey/i }).click();
    // Loader visible
    await expect(page.getByText(/Building your personalized 12-week plan/i)).toBeVisible();
  });
});
