(function initializeResumeParser(globalScope) {
  const emptyProfile = () => globalScope.ApplyFlowSchema.cloneDefaultProfile();

  function clean(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
  }

  async function extractDocxText(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    const uint32 = (offset) => view.getUint32(offset, true);
    let eocd = -1;
    for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65557); index -= 1) {
      if (uint32(index) === 0x06054b50) { eocd = index; break; }
    }
    if (eocd < 0) throw new Error("DOCX 文件结构无效");

    const totalEntries = view.getUint16(eocd + 10, true);
    let cursor = uint32(eocd + 16);
    const decoder = new TextDecoder("utf-8");
    let entry = null;
    for (let count = 0; count < totalEntries; count += 1) {
      if (uint32(cursor) !== 0x02014b50) break;
      const method = view.getUint16(cursor + 10, true);
      const compressedSize = uint32(cursor + 20);
      const fileNameLength = view.getUint16(cursor + 28, true);
      const extraLength = view.getUint16(cursor + 30, true);
      const commentLength = view.getUint16(cursor + 32, true);
      const localOffset = uint32(cursor + 42);
      const fileName = decoder.decode(bytes.slice(cursor + 46, cursor + 46 + fileNameLength));
      if (fileName === "word/document.xml") entry = { method, compressedSize, localOffset };
      cursor += 46 + fileNameLength + extraLength + commentLength;
    }
    if (!entry) throw new Error("DOCX 中缺少正文内容");

    const nameLength = view.getUint16(entry.localOffset + 26, true);
    const extraLength = view.getUint16(entry.localOffset + 28, true);
    const start = entry.localOffset + 30 + nameLength + extraLength;
    const compressed = bytes.slice(start, start + entry.compressedSize);
    let xmlBytes;
    if (entry.method === 0) xmlBytes = compressed;
    else if (entry.method === 8 && typeof DecompressionStream !== "undefined") {
      const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      xmlBytes = new Uint8Array(await new Response(stream).arrayBuffer());
    } else throw new Error("当前 Edge 版本不支持此 DOCX 压缩格式");

    const xml = decoder.decode(xmlBytes);
    const decodeXml = (value) => value
      .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'").replace(/&amp;/g, "&");
    return xml.split(/<\/w:p>/)
      .map((paragraph) => Array.from(paragraph.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g))
        .map((match) => decodeXml(match[1])).join(""))
      .map(clean).filter(Boolean).join("\n");
  }

  function labelValue(line) {
    const match = line.match(/^([^：:]{1,20})[：:]\s*(.+)$/);
    return match ? [clean(match[1]), clean(match[2])] : null;
  }

  function newRecord(section) {
    const templates = {
      education: { school: "", college: "", campus: "", major: "", level: "", degree: "", startDate: "", endDate: "", gpa: "", rank: "", overseas: "", studyType: "", discipline: "", studentLeader: "", highest: "", courses: "", laboratory: "", researchDirection: "", advisor: "", studentLeaderTitle: "" },
      experience: { company: "", department: "", title: "", startDate: "", endDate: "", description: "" },
      work: { company: "", department: "", title: "", startDate: "", endDate: "", description: "" },
      projects: { name: "", role: "", startDate: "", endDate: "", description: "" },
      languages: { language: "", examType: "", level: "", score: "", proficiency: "", description: "" },
      awards: { level: "", name: "", date: "", description: "" },
    };
    return { ...templates[section] };
  }

  function parseResumeText(text) {
    const profile = emptyProfile();
    const lines = String(text || "").split(/\r?\n/).map(clean).filter(Boolean);
    let section = "basic";
    let current = null;
    const sectionMap = [
      [/^基本信息$/, "basic"], [/^教育经历$/, "education"], [/^实习经历$/, "experience"], [/^工作经历$/, "work"],
      [/^项目经历$/, "projects"], [/^(技能|专业技能)$/, "skills"], [/^(语言能力|外语能力|外语水平)$/, "languages"],
      [/^(获奖经历|荣誉经历|奖励荣誉|荣誉奖励)$/, "awards"], [/^求职偏好$/, "preferences"],
    ];
    const basicMap = { 姓名: "nameZh", 中文姓名: "nameZh", 英文姓名: "nameEn", 手机号: "phone", 手机号码: "phone", 邮箱: "email", 性别: "gender", 出生日期: "birthDate", 当前城市: "currentCity", 现居城市: "currentCity", 籍贯: "hometown", 民族: "ethnicity", 国籍: "nationality", 证件类型: "idType", 证件号码: "idNumber", 政治面貌: "politicalStatus", 婚姻状况: "maritalStatus", 身高: "height", 体重: "weight", 微信ID: "wechat", 微信号: "wechat", 个人主页: "website", GitHub: "website" };
    const recordMaps = {
      education: { 学校: "school", 学院: "college", 所在院系: "college", 所在校区: "campus", 校区: "campus", 专业: "major", 学历: "level", 学位: "degree", 入学时间: "startDate", 毕业时间: "endDate", GPA: "gpa", 成绩排名: "rank", 学习成绩排名: "rank", 是否海外院校: "overseas", 学历类型: "studyType", 一级学科: "discipline", 是否学生干部: "studentLeader", 是否最高学历: "highest", 主修课程: "courses", 实验室: "laboratory", 领域方向: "researchDirection", 研究方向: "researchDirection", 导师: "advisor", 学生干部名称: "studentLeaderTitle" },
      experience: { 公司名称: "company", 公司: "company", 部门: "department", 职位: "title", 开始时间: "startDate", 结束时间: "endDate", 工作内容: "description", 工作描述: "description" },
      work: { 公司名称: "company", 公司: "company", 部门: "department", 职位: "title", 开始时间: "startDate", 结束时间: "endDate", 工作内容: "description", 工作描述: "description" },
      projects: { 项目名称: "name", 项目角色: "role", 项目职务: "role", 项目职责: "role", 项目岗位: "role", 开始时间: "startDate", 结束时间: "endDate", 项目描述: "description", 项目成果: "description" },
      languages: { 语言: "language", 语种: "language", 考试类型: "examType", 语言等级: "level", 考试等级: "level", 等级考试得分: "score", 考试得分: "score", 熟练程度: "proficiency", 补充说明: "description" },
      awards: { 奖励级别: "level", 奖项级别: "level", 奖励名称: "name", 奖项名称: "name", 获奖时间: "date", 获奖日期: "date", 详细描述: "description", 奖励描述: "description" },
    };

    for (const line of lines) {
      const heading = sectionMap.find(([pattern]) => pattern.test(line));
      if (heading) { section = heading[1]; current = null; continue; }
      if (/^第\s*\d+\s*段$/.test(line) && ["education", "experience", "work", "projects", "languages", "awards"].includes(section)) {
        current = newRecord(section); profile[section].push(current); continue;
      }
      const pair = labelValue(line);
      if (!pair) {
        if (section === "skills") profile.other.skills = [profile.other.skills, line].filter(Boolean).join("\n");
        if (["languages", "awards"].includes(section) && current) current.description = [current.description, line].filter(Boolean).join("\n");
        continue;
      }
      const [label, value] = pair;
      if (section === "basic" && basicMap[label]) profile.basic[basicMap[label]] = value;
      else if (["education", "experience", "work", "projects", "languages", "awards"].includes(section)) {
        if (!current) { current = newRecord(section); profile[section].push(current); }
        const key = recordMaps[section][label];
        if (key) current[key] = current[key] && key === "description" ? `${current[key]}\n${value}` : value;
      } else if (section === "preferences") {
        if (/岗位|职位/.test(label)) profile.preferences.desiredRole = value;
        else if (/城市|地点/.test(label)) profile.preferences.desiredCity = value;
        else if (/到岗/.test(label)) profile.preferences.availableDate = value;
        else if (/来源|渠道/.test(label)) profile.preferences.recruitmentSource = value;
        else if (/薪资|薪酬|月薪/.test(label)) profile.preferences.expectedSalary = value;
      } else if (section === "skills") profile.other.skills = [profile.other.skills, value].filter(Boolean).join("\n");
    }

    const populated = [
      ...Object.values(profile.basic), ...profile.education.flatMap(Object.values),
      ...profile.experience.flatMap(Object.values), ...profile.work.flatMap(Object.values), ...profile.projects.flatMap(Object.values),
      ...profile.languages.flatMap(Object.values), ...profile.awards.flatMap(Object.values),
      ...Object.values(profile.other), ...Object.values(profile.preferences),
    ].filter((value) => String(value).trim()).length;
    if (!populated) throw new Error("未识别到结构化简历内容，请使用带有明确章节和字段标签的 DOCX/TXT");
    return { profile, populated, rawText: text };
  }

  async function parseFile(file) {
    const extension = file.name.split(".").pop().toLowerCase();
    const text = extension === "docx" ? await extractDocxText(await file.arrayBuffer()) : await file.text();
    return parseResumeText(text);
  }

  globalScope.ApplyFlowResumeParser = { parseFile, parseResumeText, extractDocxText };
})(globalThis);
