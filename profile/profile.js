const schema = globalThis.ApplyFlowSchema;
let profile = schema.cloneDefaultProfile();

const fieldConfigs = {
  basic: [
    ["nameZh", "中文姓名"], ["nameEn", "英文姓名"], ["phone", "手机号", "tel"], ["email", "邮箱", "email"],
    ["gender", "性别"], ["birthDate", "出生日期", "date"], ["currentCity", "当前城市"], ["hometown", "籍贯"], ["ethnicity", "民族"],
    ["nationality", "国籍"], ["idType", "证件类型"], ["idNumber", "证件号码"],
    ["politicalStatus", "政治面貌"], ["maritalStatus", "婚姻状况"], ["height", "身高 (cm)"],
    ["weight", "体重 (kg)"], ["wechat", "微信 ID"],
    ["website", "个人主页 / GitHub", "url", true],
  ],
  education: [
    ["school", "学校"], ["college", "学院"], ["campus", "所在校区"], ["major", "专业"], ["level", "学历"], ["degree", "学位"],
    ["startDate", "入学时间", "month"], ["endDate", "毕业时间", "month"], ["gpa", "GPA"], ["rank", "成绩排名"],
    ["overseas", "是否海外院校"], ["studyType", "学历类型"], ["discipline", "一级学科"], ["studentLeader", "是否学生干部"],
    ["highest", "是否最高学历"],
    ["courses", "主修课程", "textarea", true], ["laboratory", "实验室"], ["researchDirection", "领域方向"],
    ["advisor", "导师"], ["studentLeaderTitle", "学生干部名称"],
  ],
  experience: [
    ["company", "公司名称"], ["department", "部门"], ["title", "职位"], ["startDate", "开始时间", "month"],
    ["endDate", "结束时间", "month"], ["description", "工作内容", "textarea", true],
  ],
  work: [
    ["company", "公司名称"], ["department", "部门"], ["title", "职位"], ["startDate", "开始时间", "month"],
    ["endDate", "结束时间", "month"], ["description", "工作内容", "textarea", true],
  ],
  projects: [
    ["name", "项目名称"], ["role", "项目角色"], ["startDate", "开始时间", "month"],
    ["endDate", "结束时间", "month"], ["description", "项目描述与成果", "textarea", true],
  ],
  languages: [
    ["language", "语言"], ["level", "语言等级"], ["score", "考试得分"],
    ["proficiency", "熟练程度"], ["description", "补充说明", "textarea", true],
  ],
  awards: [
    ["level", "奖励级别"], ["name", "奖励名称"], ["date", "获奖时间", "month"],
    ["description", "详细描述", "textarea", true],
  ],
  other: [["skills", "专业技能", "textarea", true]],
  preferences: [["desiredRole", "期望岗位"], ["desiredCity1", "第一期望城市"], ["desiredCity2", "第二期望城市"], ["desiredCity3", "第三期望城市"], ["availableDate", "可到岗日期", "date"], ["recruitmentSource", "招聘信息来源"], ["expectedSalary", "期望薪酬"]],
};

function createField(section, config, recordIndex = null) {
  const [key, labelText, type = "text", full = false] = config;
  const label = document.createElement("label");
  label.className = `field${full ? " full" : ""}`;
  const title = document.createElement("span");
  title.textContent = labelText;
  const control = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
  if (control.tagName === "INPUT") control.type = type;
  control.dataset.section = section;
  control.dataset.key = key;
  if (recordIndex !== null) control.dataset.index = String(recordIndex);
  const source = recordIndex === null ? profile[section] : profile[section][recordIndex];
  control.value = source?.[key] || "";
  control.addEventListener("input", () => {
    if (recordIndex === null) profile[section][key] = control.value;
    else profile[section][recordIndex][key] = control.value;
  });
  label.append(title, control);
  return label;
}

function renderStaticSection(section, targetId) {
  const target = document.getElementById(targetId);
  target.replaceChildren(...fieldConfigs[section].map((config) => createField(section, config)));
}

function renderRecords(section) {
  const target = document.getElementById(`${section}List`);
  const records = profile[section];
  if (!records.length) {
    const empty = document.createElement("div");
    empty.className = "empty-records";
    empty.textContent = "暂无记录，点击右上角添加。";
    target.replaceChildren(empty);
    return;
  }

  target.replaceChildren(...records.map((_record, index) => {
    const card = document.createElement("div");
    card.className = "record-card";
    const heading = document.createElement("div");
    heading.className = "record-heading";
    const title = document.createElement("span");
    title.textContent = `第 ${index + 1} 段`;
    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.textContent = "删除";
    remove.addEventListener("click", () => {
      profile[section].splice(index, 1);
      renderRecords(section);
    });
    heading.append(title, remove);
    const grid = document.createElement("div");
    grid.className = "grid";
    grid.append(...fieldConfigs[section].map((config) => createField(section, config, index)));
    card.append(heading, grid);
    return card;
  }));
}

function addRecord(section) {
  const record = {};
  fieldConfigs[section].forEach(([key]) => { record[key] = ""; });
  profile[section].push(record);
  renderRecords(section);
}

function renderAll() {
  renderStaticSection("basic", "basicFields");
  renderStaticSection("other", "otherFields");
  renderStaticSection("preferences", "preferenceFields");
  ["education", "experience", "work", "projects", "languages", "awards"].forEach(renderRecords);
}

function normalizeProfile(raw = {}) {
  return schema.normalizeProfile(raw);
}

function showToast(text) {
  const toast = document.getElementById("toast");
  toast.textContent = text;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 1800);
}

async function saveProfile() {
  await chrome.storage.local.set({ profile });
  showToast("档案已保存到本地");
}

function exportProfile() {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "applyflow-profile.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProfile(file) {
  const parsed = JSON.parse(await file.text());
  profile = normalizeProfile(parsed);
  renderAll();
  await saveProfile();
}

async function parseResume(file) {
  const result = await globalThis.ApplyFlowResumeParser.parseFile(file);
  profile = result.profile;
  renderAll();
  await chrome.storage.local.set({ profile });
  showToast(`已解析并保存 ${result.populated} 项，请检查档案`);
}

document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => addRecord(button.dataset.add)));
document.getElementById("saveButton").addEventListener("click", saveProfile);
document.getElementById("exportButton").addEventListener("click", exportProfile);
document.getElementById("importInput").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try { await importProfile(file); }
  catch { showToast("导入失败，请选择有效的档案文件"); }
  event.target.value = "";
});
document.getElementById("resumeInput").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try { await parseResume(file); }
  catch (error) { showToast(error.message || "简历解析失败"); }
  event.target.value = "";
});
document.getElementById("clearButton").addEventListener("click", async () => {
  if (!confirm("确认清除本地求职档案和使用统计吗？此操作无法撤销。")) return;
  await chrome.storage.local.remove(["profile", "usageStats"]);
  profile = schema.cloneDefaultProfile();
  renderAll();
  showToast("本地数据已清除");
});

chrome.storage.local.get("profile").then((stored) => {
  if (stored.profile) profile = normalizeProfile(stored.profile);
  renderAll();
});
