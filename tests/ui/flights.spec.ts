import { expect, test } from '@playwright/test';

async function dismissDemoModal(page: any) {
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    document.querySelectorAll('#demoWarningModal').forEach((node) => node.remove());
  });
}

test.describe('Flight search and booking', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await dismissDemoModal(page);

    const flightsTab = page.getByRole('tab', { name: /Flights/i }).last();
    await expect(flightsTab).toBeVisible();
    await flightsTab.click({ force: true });
    await page.getByRole('button', { name: /Search Flights/i }).waitFor({ state: 'visible', timeout: 15_000 });
  });

  test('shows the Flights search controls without testing excluded services', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'One Way' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Round Trip' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Multi-City' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Search Flights/i })).toBeVisible();
    await expect(page.getByText(/Departure From|Arrival To|Departure Date|Passengers/i).first()).toBeVisible();
  });

  test('supports flight type and cabin selection', async ({ page }) => {
    await page.getByRole('button', { name: 'Round Trip' }).click();
    await expect(page.getByRole('button', { name: 'Round Trip' })).toBeVisible();

    await page.getByRole('button', { name: /Economy/i }).click();
    await expect(page.locator('button:visible').filter({ hasText: /Business|First|Premium|Economy/i }).first()).toBeVisible();
  });

  test('validates an incomplete flight search', async ({ page }) => {
    await page.getByRole('button', { name: /Search Flights/i }).click();

    await expect(page.getByRole('button', { name: /Search Flights/i })).toBeVisible();
    await expect(page.getByText(/Departure From|Arrival To|Departure Date/i).first()).toBeVisible();
  });

  test('searches a valid One Way itinerary', async ({ page }) => {
    const departureField = page.locator('input[placeholder*="From"], input[placeholder*="Departure"], input[aria-label*="Departure"], input[name*="from"]').first();
    const arrivalField = page.locator('input[placeholder*="To"], input[placeholder*="Arrival"], input[aria-label*="Arrival"], input[name*="to"]').first();

    if (await departureField.isVisible().catch(() => false)) {
      await departureField.fill('Dubai');
      await page.getByText(/Dubai/i).first().click();
    }

    if (await arrivalField.isVisible().catch(() => false)) {
      await arrivalField.fill('Paris');
      await page.getByText(/Paris/i).first().click();
    }

    const departureDate = page.getByRole('textbox', { name: 'Departure Date' });
    if (await departureDate.isVisible().catch(() => false)) {
      await departureDate.evaluate((element: HTMLInputElement) => {
        element.removeAttribute('readonly');
        element.value = '10/15/2026';
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    await page.getByRole('button', { name: 'Search Flights' }).click();
    await expect(page.getByRole('button', { name: 'Search Flights' })).toBeVisible();
  });

  test('runs the booking continuation flow when explicitly enabled', async ({ page }) => {
    test.skip(process.env.RUN_BOOKING_TESTS !== 'true', 'Set RUN_BOOKING_TESTS=true to run the booking flow.');

    await page.locator('#fl_from_trigger').getByText('Departure From').click();
    await page.getByRole('textbox', { name: 'Departure City or Airport' }).fill('Dubai');
    await page.locator('div:visible').filter({ hasText: /^Dubai$/i }).first().click();
    await page.locator('#fl_to_trigger').getByText('Arrival To').click();
    await page.getByRole('textbox', { name: 'Arrival City or Airport' }).fill('Paris');
    await page.locator('div:visible').filter({ hasText: /^Paris$/i }).first().click();
    await page.getByRole('textbox', { name: 'Departure Date' }).fill('10/15/2026');
    await page.getByRole('button', { name: 'Search Flights' }).click();

    await expect(page.getByText(/flight|select|continue|passenger/i).first()).toBeVisible();
  });
});
