import { test as setup } from '@playwright/test';
import assert from 'assert';
import { authFile } from '../playwright.config';

/**
 * Perform authentication.
 * Context is stored in a file for reuse before other tests.
 */
setup('authenticate', async ({ page }) => {
  await page.goto('/');

  // Open microsoft login popup page.
  const popupPromise = page.waitForEvent('popup');
  page.getByRole('button', { name: 'SIGN IN' }).click(); // Assuming only Microsoft button has this.
  const popup = await popupPromise;

  // Prepare credentials.
  const email = process.env.PLAYWRIGHT_MICROSOFT_USERNAME;
  const password = process.env.PLAYWRIGHT_MICROSOFT_PASSWORD;
  assert(email, 'Missing Microsoft email');
  assert(password, 'Missing Microsoft password');

  // Fill in the email and password fields.
  const emailInput = popup.locator('input[type="email"]');
  await emailInput.fill(email);
  await emailInput.press('Enter');
  const passwordInput = popup.locator('input[type="password"]');
  await passwordInput.fill(password);
  await passwordInput.press('Enter');
  await popup.click('input[type="submit"]');
  await popup.click('input[type="submit"]');

  await page.context().storageState({ path: authFile });
});
