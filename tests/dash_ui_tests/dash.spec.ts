import { test, expect } from '@playwright/test';

test('Can render Mito spreadsheet', async ({ page }) => {
  await page.goto('http://localhost:8444/');

  // Check an element with the text "Import" is visible
  await expect(page.getByText('Import')).toBeVisible();
});