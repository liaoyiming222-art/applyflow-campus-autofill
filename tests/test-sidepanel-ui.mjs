import { chromium } from "playwright";

const sidepanelUrl = new URL("../sidepanel/sidepanel.html", import.meta.url).href;
const browser = await chromium.launch({
  headless: true,
  channel: process.env.APPLYFLOW_BROWSER_CHANNEL || "msedge",
});
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });

try {
  await page.addInitScript(() => {
    const sentMessages = [];
    const portMessages = [];
    globalThis.__applyFlowUiTest = { sentMessages, portMessages };
    globalThis.chrome = {
      tabs: {
        query: async () => [{ id: 7 }],
        sendMessage: async (_tabId, message) => {
          sentMessages.push(message.type);
          if (message.type === "APPLYFLOW_SCAN") {
            return {
              entries: [{ label: "姓名", canFill: true, valuePreview: "林晨曦" }],
              fillableCount: 37,
              missingCount: 0,
              manualCount: 8,
              estimatedManualSeconds: 504,
            };
          }
          if (message.type === "APPLYFLOW_FILL") {
            await new Promise((resolve) => setTimeout(resolve, 250));
            return {
              filledCount: 92,
              failedCount: 10,
              failedLabels: ["招聘信息来源", "第二工作意向地", "第三工作意向地", "其他字段"],
              failedDetails: [],
              savedSeconds: 1130,
              repeatable: { failed: [] },
            };
          }
          return { ok: true };
        },
      },
      storage: { local: { get: async () => ({ usageStats: { filledFields: 92, savedSeconds: 1130 } }) } },
      runtime: {
        connect: () => ({
          postMessage: (message) => portMessages.push(message),
          onMessage: { addListener: () => undefined },
          onDisconnect: { addListener: () => undefined },
        }),
        openOptionsPage: async () => undefined,
      },
    };
  });

  await page.goto(sidepanelUrl, { waitUntil: "load" });
  await page.waitForFunction(() => document.getElementById("primaryMetricValue")?.textContent === "37");
  const before = await page.evaluate(() => ({
    primary: document.getElementById("primaryMetricValue").textContent,
    primaryLabel: document.getElementById("primaryMetricLabel").textContent,
    secondary: document.getElementById("secondaryMetricValue").textContent,
    secondaryLabel: document.getElementById("secondaryMetricLabel").textContent,
    button: document.getElementById("fillButton").textContent,
  }));

  await page.click("#fillButton");
  await page.waitForFunction(() => document.getElementById("primaryMetricLabel")?.textContent === "正在填写");
  const during = await page.evaluate(() => ({
    primary: document.getElementById("primaryMetricValue").textContent,
    primaryLabel: document.getElementById("primaryMetricLabel").textContent,
    secondary: document.getElementById("secondaryMetricValue").textContent,
    secondaryLabel: document.getElementById("secondaryMetricLabel").textContent,
  }));

  await page.waitForFunction(() => document.getElementById("primaryMetricValue")?.textContent === "92");
  const after = await page.evaluate(() => ({
    primary: document.getElementById("primaryMetricValue").textContent,
    primaryLabel: document.getElementById("primaryMetricLabel").textContent,
    secondary: document.getElementById("secondaryMetricValue").textContent,
    secondaryLabel: document.getElementById("secondaryMetricLabel").textContent,
    failure: document.getElementById("resultCard").innerText,
  }));

  const failures = [];
  const expect = (condition, message) => { if (!condition) failures.push(message); };
  expect(before.primary === "37" && before.primaryLabel === "可自动填写", "填写前主指标不正确");
  expect(before.secondary === "7 分 10 秒" && before.secondaryLabel === "预计节省", "填写前预计节省不正确");
  expect(before.button === "智能填写字段", "填写按钮文案不正确");
  expect(during.primary === "…" && during.primaryLabel === "正在填写", "填写中主指标不正确");
  expect(during.secondary === "…" && during.secondaryLabel === "正在计算", "填写中次指标不正确");
  expect(after.primary === "92" && after.primaryLabel === "已填写字段", "填写完成主指标不正确");
  expect(after.secondary === "18 分 50 秒" && after.secondaryLabel === "本次节省", "填写完成节省指标不正确");
  expect(after.failure.includes("10 项未能填写"), "填写失败数量未展示");
  expect(after.failure.includes("招聘信息来源、第二工作意向地、第三工作意向地等"), "填写失败摘要不正确");

  console.log(JSON.stringify({ ok: failures.length === 0, before, during, after, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}

