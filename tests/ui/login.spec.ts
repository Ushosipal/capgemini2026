import { expect, test } from '@playwright/test';

async function dismissDemoModal(page: any) {
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelectorAll('#demoWarningModal').forEach((node) => node.remove());
  });
}

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await dismissDemoModal(page);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });

  test('shows the login form and related navigation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Remember Me' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to your account/i })).toBeVisible();
  });

  test('rejects empty and invalid credentials', async ({ page }) => {
    await page.getByRole('button', { name: /Sign In to your account/i }).click({ force: true });
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toBeFocused();

    await page.getByRole('textbox', { name: 'Email Address' }).fill('not-an-email');
    await page.getByRole('textbox', { name: 'Password' }).fill('incorrect-password');
    await page.getByRole('button', { name: /Sign In to your account/i }).click({ force: true });

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('textbox', { name: 'Email Address' })).toHaveValue('not-an-email');
    await expect(page.getByRole('button', { name: /Sign In to your account/i })).toBeVisible();
  });

  test('supports Remember Me and password visibility controls', async ({ page }) => {
    const password = page.getByRole('textbox', { name: 'Password', exact: true });
    const rememberMe = page.locator('#remember_me');
    await expect(password).toHaveAttribute('type', 'password');

    await rememberMe.evaluate((element: HTMLInputElement) => {
      element.checked = true;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(rememberMe).toBeChecked();

    await password.fill('secret-value');
    await page.locator('#toggle-password').evaluate((element: HTMLElement) => element.click());
    await expect(password).toHaveAttribute('type', 'text');
  });

  test('opens Forgot Password', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot Password?' }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('logs in with configured credentials when explicitly enabled', async ({ page }) => {
    test.skip(
      process.env.RUN_AUTH_TESTS !== 'true' || !process.env.PHPTRAVELS_EMAIL || !process.env.PHPTRAVELS_PASSWORD,
      'Set RUN_AUTH_TESTS=true, PHPTRAVELS_EMAIL, and PHPTRAVELS_PASSWORD to run authenticated tests.',
    );

    await page.getByRole('textbox', { name: 'Email Address' }).fill(process.env.PHPTRAVELS_EMAIL!);
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.PHPTRAVELS_PASSWORD!);
    await page.getByRole('button', { name: /Sign In to your account/i }).click();

    await expect(page).not.toHaveURL(/\/login$/);
  });
});
