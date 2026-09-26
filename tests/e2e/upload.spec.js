const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Photo Upload Workflow E2E', () => {
  const smallPath = path.join(process.cwd(), 'fixtures', 'small-detailed.png');
  const largePath = path.join(process.cwd(), 'fixtures', 'large-noisy.png');

  test('should display upload form on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('ARC Photo Demo');
    await expect(page.locator('#uploadForm')).toBeVisible();
  });

  test('should successfully upload small photo (< 8 MiB)', async ({ page }) => {
    await page.goto('/');
    await page.setInputFiles('#photoInput', smallPath);
    await page.click('#uploadBtn');

    await expect(page.locator('#successBanner')).toBeVisible();
    await expect(page.locator('#resultCard')).toBeVisible();
    await expect(page.locator('#photoImg')).toHaveAttribute('src', /\/api\/photos\/[a-f0-9]{64}\/content/);
  });

  test('should display error banner on uploading oversized photo (> 8 MiB)', async ({ page }) => {
    await page.goto('/');
    await page.setInputFiles('#photoInput', largePath);
    await page.click('#uploadBtn');

    await expect(page.locator('#errorBanner')).toBeVisible();
    await expect(page.locator('#errorBanner')).toContainText('File size exceeds maximum allowed limit of 8 MiB');
  });
});
