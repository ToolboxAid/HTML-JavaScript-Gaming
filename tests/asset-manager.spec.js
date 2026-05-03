const { test, expect } = require('@playwright/test');

test('Asset Manager add/remove', async ({ page }) => {
  await page.goto('http://localhost:PORT/tools/workspace-v2/');

  await page.click('text=Full Reset');

  await page.selectOption('select', 'asset-manager-v2');
  await page.click('text=Load Fixture');
  await page.click('text=Create Session + Launch');

  await page.fill('input[name="id"]', 'asset-002');
  await page.fill('input[name="label"]', 'Enemy Ship');
  await page.fill('input[name="kind"]', 'svg');
  await page.fill('input[name="path"]', 'assets/vectors/enemy-ship.svg');

  await page.click('text=Add Asset');

  await expect(page.locator('text=Enemy Ship')).toBeVisible();

  await page.click('text=Remove asset-002');

  await expect(page.locator('text=Enemy Ship')).toHaveCount(0);
});