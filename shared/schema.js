(function initializeApplyFlowSchema(globalScope) {
  if (globalScope.ApplyFlowSchema) return;

  const DEFAULT_PROFILE = {
    basic: {
      nameZh: "",
      nameEn: "",
      phone: "",
      email: "",
      gender: "",
      birthDate: "",
      currentCity: "",
      hometown: "",
      ethnicity: "",
      nationality: "",
      idType: "",
      idNumber: "",
      politicalStatus: "",
      maritalStatus: "",
      height: "",
      weight: "",
      wechat: "",
      website: "",
    },
    education: [],
    experience: [],
    work: [],
    projects: [],
    languages: [],
    awards: [],
    other: { skills: "" },
    preferences: { desiredRole: "", desiredCity: "", availableDate: "", recruitmentSource: "", expectedSalary: "" },
  };

  const FIELD_DEFINITIONS = [
    { key: "basic.nameZh", labels: ["姓名", "中文姓名", "真实姓名", "候选人姓名", "name"] },
    { key: "basic.nameEn", labels: ["英文姓名", "english name", "英文名"] },
    { key: "basic.phone", labels: ["手机号", "手机号码", "联系电话", "移动电话", "电话", "mobile", "phone"] },
    { key: "basic.email", labels: ["邮箱", "电子邮箱", "联系邮箱", "email", "e-mail"] },
    { key: "basic.gender", labels: ["性别", "gender"] },
    { key: "basic.birthDate", labels: ["出生日期", "出生年月", "生日", "date of birth", "birth date"] },
    { key: "basic.currentCity", labels: ["当前城市", "现居城市", "现居地", "当前所在地", "居住地", "所在城市", "现所在城市"] },
    { key: "basic.hometown", labels: ["籍贯", "家乡"] },
    { key: "basic.ethnicity", labels: ["民族", "民族类别", "ethnicity"] },
    { key: "basic.nationality", labels: ["国籍", "nationality"] },
    { key: "basic.idType", labels: ["证件类型", "证件种类", "证件类别"] },
    { key: "basic.idNumber", labels: ["证件号码", "证件号", "身份证号码", "身份证号"] },
    { key: "basic.politicalStatus", labels: ["政治面貌"] },
    { key: "basic.maritalStatus", labels: ["婚姻状况", "婚姻状态"] },
    { key: "basic.height", labels: ["身高", "身高cm"] },
    { key: "basic.weight", labels: ["体重", "体重kg"] },
    { key: "basic.wechat", labels: ["微信", "微信号", "微信id", "wechat"] },
    { key: "basic.website", labels: ["个人主页", "个人网站", "github", "作品链接", "portfolio"] },

    { key: "education.school", context: "education", labels: ["学校", "院校", "学校名称", "院校名称", "毕业院校", "university", "school"] },
    { key: "education.college", context: "education", labels: ["学院", "院系", "所在院系", "college", "department"] },
    { key: "education.campus", context: "education", labels: ["所在校区", "校区", "campus"] },
    { key: "education.major", context: "education", labels: ["专业", "所学专业", "专业名称", "major"] },
    { key: "education.level", context: "education", labels: ["学历", "最高学历", "教育程度", "education level"] },
    { key: "education.degree", context: "education", labels: ["学位", "degree"] },
    { key: "education.startDate", context: "education", labels: ["入学时间", "入学日期", "就读开始时间", "开始时间", "start date"] },
    { key: "education.endDate", context: "education", labels: ["毕业时间", "毕业日期", "预计毕业时间", "就读结束时间", "结束时间", "end date"] },
    { key: "education.graduationYear", labels: ["毕业年份", "毕业年", "graduation year"] },
    { key: "education.gpa", context: "education", labels: ["gpa", "平均绩点", "绩点"] },
    { key: "education.rank", context: "education", labels: ["专业排名", "成绩排名", "学习成绩排名", "排名"] },
    { key: "education.overseas", context: "education", labels: ["是否海外院校毕业", "是否海外院校", "海外院校"] },
    { key: "education.studyType", context: "education", labels: ["学历类型", "学习形式", "培养方式"] },
    { key: "education.discipline", context: "education", labels: ["一级学科", "学科门类"] },
    { key: "education.studentLeader", context: "education", labels: ["是否学生干部", "学生干部"] },
    { key: "education.highest", context: "education", labels: ["是否最高学历", "最高学历"] },
    { key: "education.courses", context: "education", labels: ["主修课程", "主要课程", "核心课程"] },
    { key: "education.laboratory", context: "education", labels: ["实验室", "所属实验室"] },
    { key: "education.researchDirection", context: "education", labels: ["领域方向", "研究方向", "专业方向"] },
    { key: "education.advisor", context: "education", labels: ["导师", "指导教师", "研究生导师"] },
    { key: "education.studentLeaderTitle", context: "education", labels: ["学生干部名称", "学生干部职务", "干部名称"] },

    { key: "experience.company", context: "experience", labels: ["公司", "公司名称", "企业名称", "单位名称", "实习单位", "工作单位", "company"] },
    { key: "experience.department", context: "experience", labels: ["部门", "所在部门", "department"] },
    { key: "experience.title", context: "experience", labels: ["职位", "岗位", "职务", "实习岗位", "职位名称", "job title", "position"] },
    { key: "experience.startDate", context: "experience", labels: ["开始时间", "入职时间", "实习开始时间", "start date"] },
    { key: "experience.endDate", context: "experience", labels: ["结束时间", "离职时间", "实习结束时间", "end date"] },
    { key: "experience.description", context: "experience", labels: ["工作内容", "工作描述", "实习内容", "主要职责", "经历描述", "description"] },

    { key: "work.company", context: "work", labels: ["公司", "公司名称", "企业名称", "单位名称", "工作单位", "任职单位", "company"] },
    { key: "work.department", context: "work", labels: ["部门", "所在部门", "任职部门", "department"] },
    { key: "work.title", context: "work", labels: ["职位", "岗位", "职务", "职位名称", "工作岗位", "job title", "position"] },
    { key: "work.startDate", context: "work", labels: ["开始时间", "入职时间", "任职开始时间", "start date"] },
    { key: "work.endDate", context: "work", labels: ["结束时间", "离职时间", "任职结束时间", "end date"] },
    { key: "work.description", context: "work", labels: ["工作内容", "工作描述", "主要职责", "任职描述", "经历描述", "description"] },

    { key: "projects.name", context: "project", labels: ["项目名称", "课题名称", "project name"] },
    { key: "projects.role", context: "project", labels: ["项目角色", "项目职务", "项目职责", "项目岗位", "担任角色", "项目职位", "role"] },
    { key: "projects.startDate", context: "project", labels: ["开始时间", "项目开始时间", "start date"] },
    { key: "projects.endDate", context: "project", labels: ["结束时间", "项目结束时间", "end date"] },
    { key: "projects.description", context: "project", labels: ["项目描述", "项目内容", "项目职责", "项目成果", "description"] },

    { key: "other.skills", labels: ["技能", "专业技能", "技能特长", "skills"] },
    { key: "languages.language", context: "language", labels: ["语言", "语种", "外语语种", "language"] },
    { key: "languages.examType", context: "language", labels: ["考试类型", "语言考试类型", "考试类别", "exam type"] },
    { key: "languages.level", context: "language", labels: ["语言等级", "考试等级", "等级", "language level"] },
    { key: "languages.score", context: "language", labels: ["考试得分", "等级考试得分", "分数", "成绩", "score"] },
    { key: "languages.proficiency", context: "language", labels: ["熟练程度", "语言熟练程度", "掌握程度", "proficiency"] },
    { key: "languages.description", context: "language", labels: ["补充说明", "语言说明", "能力描述", "description"] },

    { key: "awards.level", context: "award", labels: ["奖励级别", "奖项级别", "荣誉级别", "award level"] },
    { key: "awards.name", context: "award", labels: ["奖励名称", "奖项名称", "荣誉名称", "award name"] },
    { key: "awards.date", context: "award", labels: ["获奖时间", "奖励时间", "获奖日期", "award date"] },
    { key: "awards.description", context: "award", labels: ["详细描述", "奖励描述", "获奖描述", "description"] },
    { key: "preferences.desiredRole", labels: ["期望岗位", "求职意向", "意向职位", "目标岗位"] },
    { key: "preferences.desiredCity", labels: ["期望城市", "意向城市", "期望工作地点", "工作意向地", "第一工作意向地", "第二工作意向地", "第三工作意向地"] },
    { key: "preferences.availableDate", labels: ["到岗时间", "最快到岗时间", "可到岗日期"] },
    { key: "preferences.recruitmentSource", labels: ["招聘信息来源", "信息来源", "获知渠道", "招聘渠道"] },
    { key: "preferences.expectedSalary", labels: ["期望薪资", "期望薪酬", "期望月薪", "薪资期望"] },
  ];

  const MANUAL_PATTERNS = [
    "户籍", "生源地",
    "是否接受", "是否服从", "是否愿意", "为什么", "原因", "职业规划",
    "亲属", "家庭关系", "海外派遣", "开放性问题", "验证码",
  ];

  const FIELD_SECONDS = { text: 10, textarea: 30, select: 15, "custom-select": 15, "custom-date": 20, date: 20, radio: 15 };

  const VALUE_SYNONYM_GROUPS = [
    ["校园招聘官网", "校园招聘网站", "校园招聘", "学校官网"],
    ["全日制统招", "全日制"],
    ["非全日制", "在职"],
    ["硕士研究生", "硕士", "研究生"],
    ["博士研究生", "博士"],
    ["大学英语", "英语"],
  ];

  const CITY_CASCADER_PATHS = {
    北京: ["北京"], 上海: ["上海"], 天津: ["天津"], 重庆: ["重庆"],
    广州: ["广东", "广州"], 深圳: ["广东", "深圳"], 东莞: ["广东", "东莞"],
    杭州: ["浙江", "杭州"], 宁波: ["浙江", "宁波"],
    南京: ["江苏", "南京"], 苏州: ["江苏", "苏州"], 无锡: ["江苏", "无锡"],
    武汉: ["湖北", "武汉"], 成都: ["四川", "成都"], 西安: ["陕西", "西安"],
    长沙: ["湖南", "长沙"], 合肥: ["安徽", "合肥"], 济南: ["山东", "济南"], 青岛: ["山东", "青岛"],
  };

  function cloneDefaultProfile() {
    return JSON.parse(JSON.stringify(DEFAULT_PROFILE));
  }

  function emptyLanguage() {
    return { language: "", examType: "", level: "", score: "", proficiency: "", description: "" };
  }

  function emptyAward() {
    return { level: "", name: "", date: "", description: "" };
  }

  function normalizeProfile(raw = {}) {
    const defaults = cloneDefaultProfile();
    const legacyOther = raw.other || {};
    const languages = Array.isArray(raw.languages) ? raw.languages.slice() : [];
    const awards = Array.isArray(raw.awards) ? raw.awards.slice() : [];
    if (!languages.length && String(legacyOther.languages || "").trim()) {
      languages.push({ ...emptyLanguage(), description: String(legacyOther.languages).trim() });
    }
    if (!awards.length && String(legacyOther.awards || "").trim()) {
      awards.push({ ...emptyAward(), description: String(legacyOther.awards).trim() });
    }
    return {
      ...defaults,
      ...raw,
      basic: { ...defaults.basic, ...(raw.basic || {}) },
      other: { ...defaults.other, skills: legacyOther.skills || "" },
      preferences: { ...defaults.preferences, ...(raw.preferences || {}) },
      education: Array.isArray(raw.education) ? raw.education : [],
      experience: Array.isArray(raw.experience) ? raw.experience : [],
      work: Array.isArray(raw.work) ? raw.work : [],
      projects: Array.isArray(raw.projects) ? raw.projects : [],
      languages,
      awards,
    };
  }

  function regionPath(value) {
    const raw = String(value || "").replace(/\s+/g, "");
    if (!raw) return [];
    for (const [city, path] of Object.entries(CITY_CASCADER_PATHS)) {
      if (raw.includes(city)) return path;
    }
    const matched = raw.match(/^(.+?(?:省|自治区|特别行政区))(.+?(?:市|州|盟|地区))?$/);
    if (matched) return [matched[1], matched[2]].filter(Boolean);
    return [raw];
  }

  globalScope.ApplyFlowSchema = {
    DEFAULT_PROFILE,
    FIELD_DEFINITIONS,
    MANUAL_PATTERNS,
    FIELD_SECONDS,
    VALUE_SYNONYM_GROUPS,
    CITY_CASCADER_PATHS,
    cloneDefaultProfile,
    normalizeProfile,
    regionPath,
  };
})(globalThis);
