export async function ctrlTap(page) {
  await page.keyboard.down("Control");
  await page.keyboard.up("Control");
}

export async function ctrlTapClick(page, locator) {
  await ctrlTap(page);
  await locator.click();
}
