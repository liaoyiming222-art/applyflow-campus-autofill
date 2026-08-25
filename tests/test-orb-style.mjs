import fs from "node:fs/promises";
import { chromium } from "playwright";

const orbCss = await fs.readFile(new URL("../content/content.css", import.meta.url), "utf8");
const browser = await chromium.launch({
  headless: true,
  channel: process.env.APPLYFLOW_BROWSER_CHANNEL || "msedge",
});
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

try {
  await page.setContent(`
    <style>
      button { width: 240px !important; min-width: 240px !important; padding: 30px !important; border-radius: 8px !important; display: block !important; }
      ${orbCss}
    </style>
    <div id="applyflow-root"><button class="applyflow-orb" type="button">AF</button></div>
  `);
  const result = await page.locator(".applyflow-orb").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width: rect.width,
      height: rect.height,
      borderRadius: style.borderRadius,
      padding: style.padding,
    };
  });
  const ok = result.width === 48 && result.height === 48 && result.borderRadius === "50%" && result.padding === "0px";
  console.log(JSON.stringify({ ok, result }, null, 2));
  if (!ok) process.exitCode = 1;
} finally {
  await browser.close();
}
