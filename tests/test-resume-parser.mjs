import { readFile } from "node:fs/promises";

await import("../shared/schema.js");
await import("../profile/resume-parser.js");

const file = await readFile(new URL("./虚构测试简历-林晨曦_新增工作经历.docx", import.meta.url));
const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
const text = await globalThis.ApplyFlowResumeParser.extractDocxText(buffer);
const result = globalThis.ApplyFlowResumeParser.parseResumeText(text);

const checks = [
  [result.populated, 112, "非空结构化字段总数"],
  [result.profile.basic.nameZh, "林晨曦", "姓名"],
  [result.profile.basic.phone, "13800138027", "手机号"],
  [result.profile.education[0]?.school, "上海交通大学", "研究生学校"],
  [result.profile.education[0]?.college, "计算机学院", "研究生学院"],
  [result.profile.education[0]?.campus, "闵行校区", "研究生校区"],
  [result.profile.education[0]?.level, "硕士研究生", "研究生学历"],
  [result.profile.education.length, 2, "教育经历数量"],
  [result.profile.education[1]?.school, "苏州大学", "本科学校"],
  [result.profile.education[1]?.college, "计算机科学与技术学院（软件学院）", "本科院系"],
  [result.profile.education[1]?.campus, "北校区", "本科校区"],
  [result.profile.education[1]?.level, "本科", "本科学历"],
  [result.profile.experience.length, 2, "实习经历数量"],
  [result.profile.work.length, 2, "工作经历数量"],
  [result.profile.work[0]?.company, "澄星云创科技有限公司", "第一段工作单位"],
  [result.profile.projects.length, 2, "项目经历数量"],
  [result.profile.projects[1]?.role, "独立开发者", "第二段项目职务"],
  [result.profile.languages.length, 1, "外语能力数量"],
  [result.profile.languages[0]?.language, "英语", "外语语种"],
  [result.profile.languages[0]?.level, "CET 6", "外语等级"],
  [result.profile.languages[0]?.score, "523", "外语成绩"],
  [result.profile.awards.length, 2, "奖励荣誉数量"],
  [result.profile.awards[0]?.level, "省级", "第一项奖励级别"],
  [result.profile.languages[0]?.proficiency, "熟练", "外语熟练程度"],
  [result.profile.languages[0]?.description, "可阅读英文技术文档并进行日常书面沟通", "外语补充说明"],
  [result.profile.awards[0]?.date, "2025-08-20", "第一项获奖时间"],
  [result.profile.awards[1]?.level, "校级", "第二项奖励级别"],
  [result.profile.awards[1]?.date, "2025-10-15", "第二项获奖时间"],
  [result.profile.preferences.desiredCity1, "上海", "第一期望城市"],
  [result.profile.preferences.desiredCity2, "杭州", "第二期望城市"],
  [result.profile.preferences.desiredCity3, "苏州", "第三期望城市"],
  [result.profile.basic.nationality, "中国", "国籍"],
  [result.profile.basic.idType, "身份证", "证件类型"],
  [result.profile.basic.idNumber, "TEST-CERT-2027-001", "证件号码"],
  [result.profile.basic.wechat, "chenxi_lin_demo", "微信ID"],
  [result.profile.basic.maritalStatus, "未婚", "婚姻状况"],
  [result.profile.basic.height, "165", "身高"],
  [result.profile.basic.weight, "52", "体重"],
  [result.profile.basic.politicalStatus, "共青团员", "政治面貌"],
  [result.profile.basic.ethnicity, "汉族", "民族"],
  [result.profile.basic.hometown, "江苏省苏州市", "籍贯"],
  [result.profile.education[0].rank, "前 15%", "研究生学习成绩排名"],
  [result.profile.education[0]?.studyType, "全日制", "学历类型"],
  [result.profile.education[0]?.discipline, "计算机科学与技术", "一级学科"],
  [result.profile.education[0]?.studentLeader, "是", "学生干部"],
  [result.profile.education[0]?.highest, "是", "最高学历"],
  [result.profile.education[0]?.campus, "闵行校区", "所在校区"],
  [result.profile.education[0]?.courses, "高级算法、分布式系统、机器学习、软件工程方法", "主修课程"],
  [result.profile.education[0]?.laboratory, "智能软件工程实验室", "实验室"],
  [result.profile.education[0]?.researchDirection, "智能软件工程与人机协作", "领域方向"],
  [result.profile.education[0]?.advisor, "周明远（虚构）", "导师"],
  [result.profile.education[0]?.studentLeaderTitle, "研究生会技术部部长", "学生干部名称"],
  [result.profile.experience[0]?.company, "星河互联科技有限公司", "实习企业名称"],
  [result.profile.preferences.recruitmentSource, "校园招聘官网", "招聘来源"],
  [result.profile.preferences.expectedSalary, "15000", "期望薪酬"],
];

for (const [actual, expected, label] of checks) {
  if (actual !== expected) throw new Error(`${label}解析失败：${actual} !== ${expected}`);
}

for (const alias of ["项目职务", "项目职责", "项目岗位"]) {
  const aliasResult = globalThis.ApplyFlowResumeParser.parseResumeText(`项目经历\n第 1 段\n项目名称：别名测试\n${alias}：项目负责人`);
  if (aliasResult.profile.projects[0]?.role !== "项目负责人") throw new Error(`${alias}未映射到 projects.role`);
}

const workResult = globalThis.ApplyFlowResumeParser.parseResumeText(`工作经历
第 1 段
公司名称：远山软件有限公司
职位：前端开发工程师
开始时间：2027-07
结束时间：2028-06
工作描述：负责企业管理平台前端模块开发与维护。`);
if (workResult.profile.work.length !== 1 || workResult.profile.work[0]?.company !== "远山软件有限公司") {
  throw new Error("工作经历未解析到独立 work 数组");
}
if (workResult.profile.experience.length !== 0) throw new Error("工作经历被错误写入实习数组");

const migrated = globalThis.ApplyFlowSchema.normalizeProfile({
  languages: [{ language: "英语", examType: "大学英语", level: "六级", score: "523" }],
  preferences: { desiredCity: "上海、杭州、苏州" },
});
if (migrated.languages[0]?.level !== "CET 6" || "examType" in migrated.languages[0]) {
  throw new Error("旧外语档案未迁移为无考试类型的 CET 6 结构");
}
if (migrated.preferences.desiredCity1 !== "上海" || migrated.preferences.desiredCity2 !== "杭州" || migrated.preferences.desiredCity3 !== "苏州") {
  throw new Error("旧期望城市未迁移为三个独立城市字段");
}
if ("desiredCity" in migrated.preferences) throw new Error("迁移后仍保留旧期望城市字段");

console.log(JSON.stringify({ populated: result.populated, checks: checks.length + 8, ok: true }));
