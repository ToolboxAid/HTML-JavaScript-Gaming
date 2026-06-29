/*
Toolbox Aid
David Quesenberry
06/26/2026
TextFoundation.test.mjs
*/
import assert from "node:assert/strict";
import {
  escapeHtml,
  normalizeWhitespace,
  slugify,
  toCamelCase,
  toTitleCase,
  truncate,
} from "../../../www/src/shared/text/text.js";

export function run() {
  assert.equal(normalizeWhitespace("  Alpha\n\tBeta   Gamma  "), "Alpha Beta Gamma");
  assert.equal(normalizeWhitespace(null), "");

  assert.equal(slugify(" Café Racer: Level 12! "), "cafe-racer-level-12");
  assert.equal(slugify(" -- "), "");

  assert.equal(toTitleCase("the QUICK-brown fox"), "The Quick-brown Fox");
  assert.equal(toCamelCase("Café racer level 12"), "cafeRacerLevel12");

  assert.equal(truncate("Hello world", 8), "Hello...");
  assert.equal(truncate("Hello", 8), "Hello");
  assert.equal(truncate("Hello world", 2), "..");
  assert.equal(truncate("Hello world", 8, { suffix: "!" }), "Hello w!");

  assert.equal(escapeHtml("<button data-name=\"A&B\">It's</button>"), "&lt;button data-name=&quot;A&amp;B&quot;&gt;It&#39;s&lt;/button&gt;");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}
