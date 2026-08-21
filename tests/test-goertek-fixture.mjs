import { chromium } from "playwright";

const fixtureUrl = new URL("./goertek-fixture.html", import.meta.url).href;
const browser = await chromium.launch({
  headless: true,
  channel: process.env.APPLYFLOW_BROWSER_CHANNEL || "msedge",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleMessages = [];
page.on("console", (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));

try {
  await page.goto(fixtureUrl, { waitUntil: "load" });
  await page.waitForFunction(() => typeof globalThis.runFixture === "function");
  const result = await page.evaluate(() => globalThis.runFixture());
  const values = result.values.map((item) => item.value).filter(Boolean);
  const failures = [];
  const expect = (condition, message) => { if (!condition) failures.push(message); };

  expect(result.counts.education === 2, `教育经历应为 2 段，实际 ${result.counts.education}`);
  expect(result.counts.experience === 2, `实习经历应为 2 段，实际 ${result.counts.experience}`);
  expect(result.counts.work === 2, `工作经历应按档案自动补齐为 2 段，实际 ${result.counts.work}`);
  expect(result.counts.projects === 2, `项目经历应为 2 段，实际 ${result.counts.projects}`);
  expect(result.counts.languages === 1, `外语水平应为 1 段，实际 ${result.counts.languages}`);
  expect(result.counts.awards === 2, `奖励荣誉应为 2 段，实际 ${result.counts.awards}`);
  expect(values.includes("林晨曦"), "姓名未回填");
  expect(values.includes("2003-08-16"), "出生日期未回填");
  expect(values.includes("项目负责人 / 全栈开发"), "项目职务未回填");
  expect(values.includes("前端开发实习生"), "第一段实习职位未回填");
  expect(values.includes("软件开发实习生"), "第二段实习职位未回填");
  expect(values.includes("远山软件有限公司"), "第一段工作单位未回填");
  expect(values.includes("前端开发工程师"), "第一段工作职位未回填");
  expect(values.includes("海川科技有限公司"), "第二段工作单位未回填");
  expect(values.includes("高级前端开发工程师"), "第二段工作职位未回填");
  expect(values.includes("研究生会技术部部长"), "条件出现的学生干部名称未在第二轮填写");
  expect(values.includes("523"), "外语成绩未回填");
  expect(values.includes("熟练"), "外语熟练程度未回填");
  expect(values.includes("可阅读英文技术文档并进行日常书面沟通"), "外语补充说明未回填");
  expect(values.includes("全国大学生计算机设计大赛华东赛区二等奖"), "奖励名称未回填");
  expect(values.includes("2024-2025 学年校级二等奖学金"), "第二段奖励名称未回填");
  expect(result.selected.includes("汉族"), "民族下拉未回填");
  expect(result.selected.filter((value) => value === "英语").length >= 2, "语言字段未按页面两个英语下拉完成选择");
  expect(result.selected.includes("CET 6"), "外语等级未选择 CET 6");
  expect(result.selected.filter((value) => value === "其他").length >= 2, "省级和校级奖励未映射为其他");
  expect(result.selected.includes("上海") && result.selected.includes("杭州") && result.selected.includes("苏州"), "三个工作意向地未分别填写");
  expect(result.selected.includes("校园招聘网站"), "招聘来源同义词未回填");
  expect(result.selected.some((value) => value.includes("江苏省苏州市")), "籍贯 TreeSelect 未选择到苏州市");
  const scopedFailures = result.fill.failedDetails.filter((item) => /^(experience|work|projects|languages|awards)\./.test(item.fieldKey));
  expect(scopedFailures.length === 0, `本次修改范围仍有 ${scopedFailures.length} 项填写失败`);

  const noWorkPage = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await noWorkPage.goto(fixtureUrl, { waitUntil: "load" });
  await noWorkPage.waitForFunction(() => typeof globalThis.runFixture === "function");
  const noWorkState = await noWorkPage.evaluate(async () => {
    profile.work = [];
    await globalThis.runFixture();
    return {
      count: workRecords.children.length,
      values: Array.from(workRecords.querySelectorAll("input, textarea")).map((element) => element.value),
    };
  });
  await noWorkPage.close();
  expect(noWorkState.count === 1, `档案无工作经历时不应新增页面记录，实际 ${noWorkState.count}`);
  expect(noWorkState.values.every((value) => !value), "档案无工作经历时仍写入了工作区块");

  console.log(JSON.stringify({
    ok: failures.length === 0,
    scan: result.scan,
    fill: { filledCount: result.fill.filledCount, failedCount: result.fill.failedCount, scopedFailures, knownUnrelatedFailures: result.fill.failedDetails.filter((item) => !scopedFailures.includes(item)) },
    counts: result.counts,
    selected: result.selected,
    failures,
    browserConsole: consoleMessages.filter((line) => /ApplyFlow|error/i.test(line)),
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
