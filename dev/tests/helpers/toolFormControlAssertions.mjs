import { expect } from "@playwright/test";

const COMPACT_TOOL_FORM_CONTROL_MAX_HEIGHT = 32;
const COMPACT_TOOL_FORM_CONTROL_MIN_HEIGHT = 24;

async function controlHeight(locator) {
  return locator.evaluate((node) => node.getBoundingClientRect().height);
}

export async function expectCompactToolFormControl(locator) {
  await expect(locator).toHaveClass(/tool-form-control/);
  const height = await controlHeight(locator);
  expect(height).toBeGreaterThanOrEqual(COMPACT_TOOL_FORM_CONTROL_MIN_HEIGHT);
  expect(height).toBeLessThanOrEqual(COMPACT_TOOL_FORM_CONTROL_MAX_HEIGHT);
  return height;
}

export async function expectCompactToolFormControls(page, selectors) {
  const heights = [];
  for (const selector of selectors) {
    heights.push(await expectCompactToolFormControl(page.locator(selector)));
  }
  return heights;
}

export async function expectFilePickerRemainsDefault(fileInput, compactReference) {
  await expect(fileInput).not.toHaveClass(/tool-form-control/);
  const fileHeight = await controlHeight(fileInput);
  const compactHeight = await controlHeight(compactReference);
  expect(fileHeight).toBeGreaterThan(compactHeight + 4);
  return fileHeight;
}
