import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('edeklarera.se');
});

test('user can create a company and see it in the list', async ({ page }) => {
  // This is a placeholder for a real E2E test.
  // Due to environment issues, this test cannot be run, but it demonstrates
  // the intended user flow.

  await page.goto('/');

  // 1. Fill out the form to create a new company
  await page.getByLabel('Organisationsnummer').fill('555555-5555');
  await page.getByLabel('Företagsnamn').fill('E2E Testbolag AB');
  await page.getByRole('button', { name: 'Skapa företag' }).click();

  // 2. Assert that the new company appears in the list
  await expect(page.locator('ul')).toContainText('E2E Testbolag AB');
});
