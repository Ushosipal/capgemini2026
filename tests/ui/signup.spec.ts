import { expect, test } from '@playwright/test';

async function dismissDemoModal(page: any) {
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelectorAll('#demoWarningModal').forEach((node) => node.remove());
  });
}

function solveSecurityQuestion(question: string): number {
  const numbers: Record<string, number> = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
  };
  const expression = question
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\b(times|multiplied by)\b/g, '*')
    .replace(/\b(plus|added to)\b/g, '+')
    .replace(/\b(minus|less)\b/g, '-')
    .replace(/\b(divided by)\b/g, '/');
  const tokens = expression.split(/\s+/).map((token) => String(numbers[token] ?? token));
  if (tokens.length !== 3 || !/^[+\-*/]$/.test(tokens[1])) {
    throw new Error(`Unsupported Signup security question: ${question}`);
  }
  return Function(`"use strict"; return (${tokens.join(' ')})`)();
}

test.describe('Signup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await dismissDemoModal(page);
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  });

  test('shows the account creation form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'First Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Last Name *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Address *' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password *', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Confirm Password *' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: /Security Check:/i })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: /Terms of Service and Privacy Policy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  test('requires valid values and consent', async ({ page }) => {
    await page.getByRole('button', { name: /Create Account/i }).click({ force: true });

    await expect(page.getByRole('textbox', { name: 'First Name *' })).toBeFocused();
    await expect(page.getByText(/at least 6 characters/i)).toBeVisible();

    await page.getByRole('textbox', { name: 'First Name *' }).fill('Test');
    await page.getByRole('textbox', { name: 'Last Name *' }).fill('User');
    await page.getByRole('textbox', { name: 'Email Address *' }).fill('invalid-email');
    await page.getByRole('textbox', { name: 'Password *', exact: true }).fill('short');
    await page.getByRole('textbox', { name: 'Confirm Password *' }).fill('different');
    await page.getByRole('spinbutton', { name: /Security Check:/i }).fill('8');
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page.getByText(/valid email|invalid|password|correct answer|agree/i).first()).toBeVisible();
  });

  test('navigates to Login', async ({ page }) => {
    await page.getByRole('link', { name: 'Login', exact: true }).first().click({ force: true });

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('creates a new account when explicitly enabled', async ({ page }) => {
    test.skip(process.env.RUN_MUTATING_TESTS !== 'true', 'Set RUN_MUTATING_TESTS=true to create demo data.');

    const email = `playwright-${Date.now()}@example.com`;
    await page.getByRole('textbox', { name: 'First Name *' }).fill('Playwright');
    await page.getByRole('textbox', { name: 'Last Name *' }).fill('User');
    await page.getByRole('textbox', { name: 'Email Address *' }).fill(email);
    await page.getByRole('textbox', { name: 'Password *', exact: true }).fill('Playwright123!');
    await page.getByRole('textbox', { name: 'Confirm Password *' }).fill('Playwright123!');

    const securityQuestion = await page
      .getByRole('spinbutton', { name: /Security Check:/i })
      .getAttribute('aria-label');
    const arithmetic = securityQuestion?.match(/What is (.+?) \?/i)?.[1];
    if (!arithmetic) {
      throw new Error('Unable to read the Signup security question.');
    }
    const answer = solveSecurityQuestion(arithmetic);
    await page.getByRole('spinbutton', { name: /Security Check:/i }).fill(String(answer));
    await page.getByRole('checkbox', { name: /Terms of Service and Privacy Policy/i }).check();
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(page).not.toHaveURL(/\/signup$/);
  });
});
