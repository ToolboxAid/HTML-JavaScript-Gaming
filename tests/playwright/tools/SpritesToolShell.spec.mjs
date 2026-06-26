import { expect, test } from "@playwright/test";
import { startRepoServer } from "../../helpers/playwrightRepoServer.mjs";
import { workspaceV2CoverageReporter } from "../../helpers/workspaceV2CoverageReporter.mjs";

test.afterAll(async () => {
  await workspaceV2CoverageReporter.writeReport();
});

async function openSpritesPage(page, routeHandler) {
  const server = await startRepoServer();
  await routeHandler(page);
  await workspaceV2CoverageReporter.start(page);
  await page.goto(`${server.baseUrl}/toolbox/sprites/index.html`, { waitUntil: "networkidle" });
  return server;
}

test("Sprites shell loads API-backed empty state without inline page code", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ data: { sprites: [] }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.getByRole("heading", { level: 1, name: "Sprites" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sprite Library" })).toBeVisible();
    await expect(page.locator("[data-sprites-api-status]")).toHaveText("Ready");
    await expect(page.locator("[data-sprites-library-status]")).toHaveText("Empty");
    await expect(page.locator("[data-sprites-empty-state]")).toContainText("No Sprites records returned by the API.");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("No Palette/Colors references");
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell is reachable from the Toolbox navigation route", async ({ page }) => {
  const server = await startRepoServer();
  await page.route("**/api/sprites/records", async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: { sprites: [] }, ok: true }),
      contentType: "application/json",
      status: 200,
    });
  });
  await workspaceV2CoverageReporter.start(page);
  try {
    await page.goto(`${server.baseUrl}/`, { waitUntil: "networkidle" });
    const spritesLink = page.locator("[data-toolbox-menu-item][data-route='sprites']").first();
    await expect(spritesLink).toHaveAttribute("href", "toolbox/sprites/index.html");
    const href = await spritesLink.getAttribute("href");
    await page.goto(`${server.baseUrl}/${href}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1, name: "Sprites" })).toBeVisible();
    await expect(page.locator("style, [style], script:not([src])")).toHaveCount(0);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell keeps Palette and storage follow-ups visible without owning color data", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                key: "01J1SPRITEPOLISH0000000000",
                name: "Polish Sprite",
                paletteColorKeys: ["palette_color_polish"],
                status: "ready",
                updatedAt: "2026-06-26T14:00:00.000Z",
                usageCount: 0,
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("1 Palette/Colors key reference");
    await expect(page.locator("[data-sprites-palette-selection-status]")).toContainText("display-only");
    await expect(page.locator("[data-sprites-storage-status]")).toContainText("Binary upload/storage import is not configured");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("palette_color_polish");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell renders records and Palette/Colors key references from API response", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                category: "Characters",
                key: "sprite_01HZZZZZZZZZZZZZZZZZZZZZZZ",
                mimeType: "image/png",
                name: "Hero Idle",
                paletteColorKeys: ["palette_color_01"],
                sizeBytes: 2048,
                sourceName: "hero-idle.png",
                status: "active",
                updatedAt: "2026-06-26T12:00:00.000Z",
                usageCount: 1,
                width: 32,
                height: 32,
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-library-status]")).toHaveText("Ready");
    await expect(page.locator("[data-sprites-count]")).toHaveText("1");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Hero Idle");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("palette_color_01");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("1 Palette/Colors key reference");
    await page.locator("[data-sprites-table-body] tr").first().click();
    await expect(page.locator("[data-sprites-metadata]")).toContainText("Hero Idle");
    await expect(page.locator("[data-sprites-metadata]")).toContainText("image/png");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell shows unavailable state when API contract is missing", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({ error: { message: "Sprites API route is not configured." }, ok: false }),
        contentType: "application/json",
        status: 404,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-api-status]")).toHaveText("Unavailable");
    await expect(page.locator("[data-sprites-error-state]")).toContainText("Sprites API route is not configured.");
    await expect(page.locator("[data-sprites-palette-status]")).toContainText("unavailable until Sprites records load");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell validates and creates records through API without browser-owned keys", async ({ page }) => {
  const createdBodies = [];
  let sprites = [];
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      const request = route.request();
      if (request.method() === "POST") {
        const body = request.postDataJSON();
        createdBodies.push(body);
        const sprite = {
          ...body,
          key: "01J1SPRITECREATEDBYAPI0000",
          updatedAt: "2026-06-26T12:10:00.000Z",
          usageCount: 0,
        };
        sprites = [sprite];
        await route.fulfill({
          body: JSON.stringify({ data: { sprite }, ok: true }),
          contentType: "application/json",
          status: 200,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({ data: { sprites }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await page.getByRole("button", { name: "Add Sprite" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-sprites-validation]")).toContainText("Sprite name is required.");
    await page.getByLabel("Sprite name").fill("  Hero Idle  ");
    await page.getByLabel("Sprite status").selectOption("ready");
    await page.getByLabel("Sprite category").fill("  Player   Characters  ");
    await page.getByLabel("Sprite source reference").fill("assets/sprites/hero-idle.png");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Hero Idle");
    expect(createdBodies).toHaveLength(1);
    expect(createdBodies[0]).toEqual({
      category: "Player Characters",
      name: "Hero Idle",
      source: "assets/sprites/hero-idle.png",
      status: "ready",
    });
    expect(createdBodies[0].key).toBeUndefined();
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell redirects guest save attempts to sign-in", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          body: JSON.stringify({ error: "Sign in is required to save Sprites.", ok: false }),
          contentType: "application/json",
          status: 401,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({ data: { sprites: [] }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await page.getByRole("button", { name: "Add Sprite" }).click();
    await page.getByLabel("Sprite name").fill("Guest Sprite");
    await page.getByLabel("Sprite status").selectOption("draft");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForURL(/\/account\/sign-in\.html$/);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell archives referenced records and deletes only unreferenced records", async ({ page }) => {
  const postedPaths = [];
  let sprites = [
    {
      key: "01J1SPRITEUSED00000000000000",
      name: "Used Sprite",
      status: "ready",
      updatedAt: "2026-06-26T12:20:00.000Z",
      usageCount: 2,
    },
    {
      key: "01J1SPRITEFREE00000000000000",
      name: "Free Sprite",
      status: "draft",
      updatedAt: "2026-06-26T12:15:00.000Z",
      usageCount: 0,
    },
  ];
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records**", async (route) => {
      const url = new URL(route.request().url());
      if (route.request().method() === "POST") {
        postedPaths.push(url.pathname);
        if (url.pathname.endsWith("/archive")) {
          sprites = sprites.map((sprite) => (
            url.pathname.includes(sprite.key)
              ? { ...sprite, archived: true, status: "archived" }
              : sprite
          ));
        }
        if (url.pathname.endsWith("/delete")) {
          sprites = sprites.filter((sprite) => !url.pathname.includes(sprite.key));
        }
        await route.fulfill({
          body: JSON.stringify({ data: { sprite: sprites[0] || null }, ok: true }),
          contentType: "application/json",
          status: 200,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({ data: { sprites }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.getByRole("button", { name: "Delete blocked for Used Sprite" })).toBeDisabled();
    await page.getByRole("button", { name: "Archive safely Used Sprite" }).click();
    await expect(page.locator("[data-sprites-table-body]")).toContainText("archived");
    await page.getByRole("button", { name: "Delete Free Sprite" }).click();
    await expect(page.locator("[data-sprites-table-body]")).not.toContainText("Free Sprite");
    expect(postedPaths).toContain("/api/sprites/records/01J1SPRITEUSED00000000000000/archive");
    expect(postedPaths).toContain("/api/sprites/records/01J1SPRITEFREE00000000000000/delete");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell shows API-provided references and blocks destructive delete", async ({ page }) => {
  const postedPaths = [];
  const referencedKey = "01J1SPRITEREF0000000000000";
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === "POST") {
        postedPaths.push(url.pathname);
        await route.fulfill({
          body: JSON.stringify({ data: { sprite: null }, ok: true }),
          contentType: "application/json",
          status: 200,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                key: referencedKey,
                name: "Referenced Sprite",
                status: "ready",
                updatedAt: "2026-06-26T13:20:00.000Z",
                usageCount: 2,
                references: [
                  {
                    key: "01J1REFOBJECT000000000000",
                    label: "Hero Object",
                    sourceKey: "object_hero",
                    sourceType: "Objects",
                  },
                  {
                    key: "01J1REFWORLD0000000000000",
                    label: "Intro World",
                    sourceKey: "world_intro",
                    sourceType: "Worlds",
                  },
                ],
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await page.locator(`[data-sprites-row-key='${referencedKey}']`).click();
    await expect(page.locator("[data-sprites-reference-status]")).toContainText("2 usage references");
    await expect(page.locator("[data-sprites-reference-panel]")).toContainText("Objects");
    await expect(page.locator("[data-sprites-reference-panel]")).toContainText("Hero Object");
    await expect(page.locator("[data-sprites-reference-panel]")).toContainText("Worlds");
    await expect(page.getByRole("button", { name: "Delete blocked for Referenced Sprite" })).toBeDisabled();
    await page.getByRole("button", { name: "Archive safely Referenced Sprite" }).click();
    expect(postedPaths).toContain(`/api/sprites/records/${referencedKey}/archive`);
    expect(postedPaths).not.toContain(`/api/sprites/records/${referencedKey}/delete`);
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell previews metadata and shows storage and Palette unavailable states", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                key: "01J1SPRITEMETA0000000000000",
                name: "Preview Sprite",
                status: "ready",
                category: "Characters",
                source: "assets/theme-v2/images/image-missing.svg",
                mimeType: "image/svg+xml",
                width: 64,
                height: 32,
                sizeBytes: 4096,
                updatedAt: "2026-06-26T12:30:00.000Z",
                updatedBy: "01J1USER0000000000000000000",
                paletteColorKeys: ["palette_color_preview"],
                usageCount: 0,
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await page.locator("[data-sprites-row-key='01J1SPRITEMETA0000000000000']").click();
    await expect(page.locator("[data-sprites-preview-panel] img")).toHaveAttribute("src", "assets/theme-v2/images/image-missing.svg");
    await expect(page.locator("[data-sprites-preview-panel]")).toContainText("image/svg+xml");
    await expect(page.locator("[data-sprites-preview-panel]")).toContainText("64 x 32");
    await expect(page.locator("[data-sprites-preview-panel]")).toContainText("4096");
    await expect(page.locator("[data-sprites-preview-panel]")).toContainText("palette_color_preview");
    await expect(page.locator("[data-sprites-storage-status]")).toContainText("Binary upload/storage import is not configured");
    await expect(page.locator("[data-sprites-palette-selection-status]")).toContainText("display-only");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell duplicates with API-owned key and replaces metadata through API", async ({ page }) => {
  const posted = [];
  let sprites = [
    {
      key: "01J1SPRITEDUPE0000000000000",
      name: "Duplicate Source",
      status: "ready",
      category: "Characters",
      source: "assets/theme-v2/images/image-missing.svg",
      mimeType: "image/svg+xml",
      width: 32,
      height: 32,
      sizeBytes: 1024,
      updatedAt: "2026-06-26T12:40:00.000Z",
      updatedBy: "01J1USER0000000000000000000",
      paletteColorKeys: ["palette_color_duplicate"],
      usageCount: 0,
    },
  ];
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() === "POST") {
        const body = request.postDataJSON() || {};
        posted.push({ body, path: url.pathname });
        if (url.pathname === "/api/sprites/records") {
          const sprite = {
            ...body,
            key: "01J1SPRITEDUPECOPY000000000",
            updatedAt: "2026-06-26T12:45:00.000Z",
            updatedBy: "01J1USER0000000000000000000",
            usageCount: 0,
          };
          sprites = [...sprites, sprite];
          await route.fulfill({
            body: JSON.stringify({ data: { sprite }, ok: true }),
            contentType: "application/json",
            status: 200,
          });
          return;
        }
        sprites = sprites.map((sprite) => (
          url.pathname.includes(sprite.key)
            ? { ...sprite, ...body, updatedAt: "2026-06-26T12:50:00.000Z" }
            : sprite
        ));
        await route.fulfill({
          body: JSON.stringify({ data: { sprite: sprites[0] }, ok: true }),
          contentType: "application/json",
          status: 200,
        });
        return;
      }
      await route.fulfill({
        body: JSON.stringify({ data: { sprites }, ok: true }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await page.locator("[data-sprites-row-key='01J1SPRITEDUPE0000000000000']").click();
    await page.getByRole("button", { name: "Duplicate Sprite" }).click();
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Duplicate Source Copy");
    await page.locator("[data-sprites-row-key='01J1SPRITEDUPE0000000000000']").click();
    await page.getByRole("button", { name: "Replace Metadata" }).click();
    expect(posted).toEqual(expect.arrayContaining([
      expect.objectContaining({
        path: "/api/sprites/records",
        body: expect.objectContaining({
          name: "Duplicate Source Copy",
          paletteColorKeys: ["palette_color_duplicate"],
        }),
      }),
      expect.objectContaining({
        path: "/api/sprites/records/01J1SPRITEDUPE0000000000000",
        body: expect.objectContaining({
          name: "Duplicate Source",
          source: "assets/theme-v2/images/image-missing.svg",
        }),
      }),
    ]));
    expect(posted[0].body.key).toBeUndefined();
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});

test("Sprites shell filters API-backed records by search, category, status, and tag key", async ({ page }) => {
  const server = await openSpritesPage(page, async (currentPage) => {
    await currentPage.route("**/api/sprites/records", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          data: {
            sprites: [
              {
                category: "Characters",
                key: "01J1FILTERHERO000000000000",
                name: "Hero Walk",
                source: "hero-walk.png",
                status: "ready",
                tagKeys: ["hero", "player"],
                updatedAt: "2026-06-26T13:00:00.000Z",
                usageCount: 0,
              },
              {
                category: "Effects",
                key: "01J1FILTERSPARK00000000000",
                name: "Spark Burst",
                source: "spark.png",
                status: "draft",
                tagKeys: ["effect"],
                updatedAt: "2026-06-26T13:05:00.000Z",
                usageCount: 0,
              },
              {
                category: "Characters",
                key: "01J1FILTERVILLAIN000000000",
                name: "Boss Idle",
                source: "boss-idle.png",
                status: "published",
                tagKeys: ["boss"],
                updatedAt: "2026-06-26T13:10:00.000Z",
                usageCount: 0,
              },
            ],
          },
          ok: true,
        }),
        contentType: "application/json",
        status: 200,
      });
    });
  });

  try {
    await expect(page.locator("[data-sprites-filter-status]")).toHaveText("3 Sprites records available.");
    await page.getByLabel("Search Sprites").fill("hero");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Hero Walk");
    await expect(page.locator("[data-sprites-table-body]")).not.toContainText("Spark Burst");
    await expect(page.locator("[data-sprites-filter-status]")).toHaveText("1 of 3 Sprites records match current filters.");
    await page.getByRole("button", { name: "Clear Filters" }).click();
    await page.getByLabel("Filter Sprites by category").selectOption("Characters");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Hero Walk");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Boss Idle");
    await expect(page.locator("[data-sprites-table-body]")).not.toContainText("Spark Burst");
    await page.getByLabel("Filter Sprites by status").selectOption("published");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Boss Idle");
    await expect(page.locator("[data-sprites-table-body]")).not.toContainText("Hero Walk");
    await page.getByRole("button", { name: "Clear Filters" }).click();
    await page.getByLabel("Filter Sprites by tag key").selectOption("effect");
    await expect(page.locator("[data-sprites-table-body]")).toContainText("Spark Burst");
    await expect(page.locator("[data-sprites-table-body]")).not.toContainText("Hero Walk");
  } finally {
    await workspaceV2CoverageReporter.stop(page);
    await server.close();
  }
});
