(function initializeApplyFlowContent() {
  if (globalThis.__applyFlowContentReady) {
    ensureOrb();
    scanPage().then(updateOrbCount);
    return;
  }
  globalThis.__applyFlowContentReady = true;

  const schema = globalThis.ApplyFlowSchema;
  const elementMap = new Map();
  let lastScan = null;
  let rescanTimer = null;
  let workflowRunning = false;

  const REPEATABLE_SECTIONS = [
    {
      key: "education",
      countFields: ["education.school", "education.startDate", "education.major"],
      addLabels: ["添加新的教育经历", "添加教育经历", "新增教育经历"],
    },
    {
      key: "experience",
      countFields: ["experience.company", "experience.title", "experience.startDate"],
      addLabels: ["添加新的实习经历", "添加实习经历", "新增实习经历"],
    },
    {
      key: "work",
      countFields: ["work.company", "work.title", "work.startDate"],
      addLabels: ["添加新的工作经历", "添加工作经历", "新增工作经历"],
    },
    {
      key: "projects",
      countFields: ["projects.name", "projects.startDate", "projects.description"],
      addLabels: ["添加新的项目经验", "添加项目经验", "添加项目经历", "新增项目经历", "添加项目"],
    },
    {
      key: "languages",
      countFields: ["languages.language", "languages.level", "languages.score"],
      addLabels: ["添加新的外语水平", "添加外语水平", "新增外语水平", "添加外语能力", "新增外语能力"],
    },
    {
      key: "awards",
      countFields: ["awards.name", "awards.date", "awards.description"],
      addLabels: ["添加新的奖励荣誉", "添加奖励荣誉", "新增奖励荣誉", "添加获奖经历", "新增获奖经历"],
    },
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\s\u3000:*：＊()（）\[\]【】_\-/]/g, "")
      .trim();
  }

  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function visible(element) {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  }

  function allInteractiveControls() {
    return Array.from(document.querySelectorAll("input, textarea, select, [role='combobox']"))
      .filter((element) => !element.disabled && visible(element))
      .filter((element) => !["hidden", "submit", "button", "file", "password", "checkbox"].includes(element.type));
  }

  function labelCandidates(element) {
    const candidates = [];
    const add = (text, priority) => {
      const cleaned = String(text || "").replace(/\s+/g, " ").trim().slice(0, 180);
      if (cleaned && !candidates.some((item) => item.text === cleaned)) candidates.push({ text: cleaned, priority });
    };
    const associatedLabels = element.labels ? Array.from(element.labels).filter((item) => item.innerText?.trim()) : [];
    associatedLabels.forEach((item) => add(item.innerText, 120));
    const frameworkLabel = element.closest(".ant-form-item")?.querySelector(".ant-form-item-label");
    add(frameworkLabel?.innerText, 118);
    add(element.getAttribute("aria-label"), 115);
    add(element.getAttribute("data-label"), 110);
    add(element.getAttribute("placeholder"), 70);
    const hasStrongLabel = associatedLabels.length > 0 || Boolean(frameworkLabel) || element.hasAttribute("aria-label") || element.hasAttribute("data-label");
    let node = element.parentElement;
    for (let depth = 0; !hasStrongLabel && node && depth < 5; depth += 1, node = node.parentElement) {
      const directText = Array.from(node.childNodes)
        .filter((child) => child.nodeType === Node.TEXT_NODE)
        .map((child) => child.textContent)
        .join(" ");
      const nearbyLabels = node.querySelectorAll(":scope > label, :scope > .label, :scope > [class*='label'], :scope > [class*='title'], :scope > [class*='name'], :scope > [data-label]");
      nearbyLabels.forEach((label) => {
        if (!label.contains(element)) add(label.textContent, 105 - depth * 8);
      });
      add(directText, 100 - depth * 8);
    }
    add(element.getAttribute("name"), 45);
    add(element.id, 35);
    return candidates.sort((left, right) => right.priority - left.priority);
  }

  function textFromLabel(element) {
    return labelCandidates(element)[0]?.text || "";
  }

  function contextFor(element) {
    let node = element.parentElement;
    for (let depth = 0; node && depth < 10; depth += 1, node = node.parentElement) {
      const heading = node.querySelector(":scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > [class*='title'], :scope > [class*='header']");
      const siblingText = Array.from(node.children || [])
        .filter((child) => !child.contains(element))
        .map((child) => child.innerText || "")
        .join(" ")
        .slice(0, 200);
      const identity = [node.id, node.className, node.getAttribute?.("data-section"), heading?.textContent, siblingText]
        .filter((value) => typeof value === "string")
        .join(" ")
        .slice(0, 300);
      if (/外语|语言能力|语言水平|language/i.test(identity)) return "language";
      if (/奖励|获奖|荣誉|award|honor/i.test(identity)) return "award";
      if (/实习|internship/i.test(identity)) return "experience";
      if (/工作经历|任职|employment|work\s*experience/i.test(identity)) return "work";
      if (/项目|课题|project/i.test(identity)) return "project";
      if (/教育|学历|院校|education/i.test(identity)) return "education";
    }
    return "";
  }

  function matchDefinition(candidates, context) {
    let best = null;
    for (const candidate of candidates) {
      const normalizedLabel = normalize(candidate.text);
      if (!normalizedLabel || schema.MANUAL_PATTERNS.some((pattern) => normalizedLabel.includes(normalize(pattern)))) continue;
      for (const definition of schema.FIELD_DEFINITIONS) {
        if (definition.context && definition.context !== context) continue;
        for (const alias of definition.labels) {
          const normalizedAlias = normalize(alias);
          if (!normalizedAlias) continue;
          const exact = normalizedLabel === normalizedAlias;
          const contains = normalizedLabel.includes(normalizedAlias);
          if (!exact && !contains) continue;
          const score = (exact ? 1000 : 100) + normalizedAlias.length + candidate.priority + (definition.context ? 20 : 0);
          if (!best || score > best.score) best = { definition, score, label: candidate.text };
        }
      }
    }
    return best || null;
  }

  function getPathValue(profile, key, occurrence) {
    const [section, property] = key.split(".");
    if (["education", "experience", "work", "projects", "languages", "awards"].includes(section)) {
      const records = profile[section] || [];
      if (section === "education" && property === "graduationYear") return String(records[occurrence]?.endDate || "").slice(0, 4);
      const value = records[occurrence]?.[property] ?? "";
      if (key === "awards.level" && String(value).trim()) return /国家级及以上|^国家级$/.test(String(value).trim()) ? "国家级及以上" : "其他";
      return value;
    }
    return profile[section]?.[property] ?? "";
  }

  function controlType(element) {
    if (element.tagName === "TEXTAREA") return "textarea";
    if (element.tagName === "SELECT") return "select";
    if (/calendar|date-picker/i.test(element.className)) return "custom-date";
    if (element.readOnly || element.getAttribute("role") === "combobox" || /select|picker|dropdown/i.test(element.className)) return "custom-select";
    if (element.type === "date" || element.type === "month") return "date";
    if (element.type === "radio") return "radio";
    return "text";
  }

  function preview(value) {
    const text = String(value || "");
    if (!text) return "";
    if (/^1\d{10}$/.test(text)) return `${text.slice(0, 3)}****${text.slice(-4)}`;
    if (text.includes("@")) {
      const [name, domain] = text.split("@");
      return `${name.slice(0, 2)}***@${domain}`;
    }
    return text.length > 30 ? `${text.slice(0, 30)}…` : text;
  }

  async function loadProfile() {
    const stored = await chrome.storage.local.get("profile");
    return schema.normalizeProfile(stored.profile || {});
  }

  async function scanPage() {
    const profile = await loadProfile();
    elementMap.clear();
    const controls = allInteractiveControls();

    const occurrence = new Map();
    const radioNames = new Set();
    const entries = [];
    let manualCount = 0;
    let recognizedControlCount = 0;

    for (const element of controls) {
      if (element.matches(".ant-select-search__field, [aria-hidden='true']")) continue;
      const formContainer = element.closest(".ant-form-item");
      const radioContainer = element.closest("[role='radiogroup'], .ant-form-item, fieldset");
      if (element.type === "radio") {
        const radioKey = element.name || radioContainer || textFromLabel(element);
        if (radioNames.has(radioKey)) continue;
        radioNames.add(radioKey);
      }

      const candidates = labelCandidates(element);
      const label = candidates[0]?.text || "";
      const context = contextFor(element);
      let match = matchDefinition(candidates, context);
      let duplicateLanguageValue = false;
      let controlSlot = "";
      if (context === "language" && candidates.some((candidate) => normalize(candidate.text).includes(normalize("语言等级")))) {
        const groupedControls = Array.from(formContainer?.querySelectorAll("[role='combobox']") || []).filter(visible);
        const groupedIndex = groupedControls.indexOf(element);
        const groupedKey = groupedIndex === 0 ? "languages.language" : groupedIndex === 1 ? "languages.level" : "";
        duplicateLanguageValue = groupedIndex === 0;
        controlSlot = groupedIndex === 0 ? "language-level-language" : groupedIndex === 1 ? "language-level-value" : "";
        const groupedDefinition = schema.FIELD_DEFINITIONS.find((definition) => definition.key === groupedKey);
        if (groupedDefinition) match = { definition: groupedDefinition, score: 2000, label: groupedDefinition.labels[0] };
      }
      if (!match) {
        if (label) manualCount += 1;
        continue;
      }
      recognizedControlCount += 1;
      const { definition } = match;

      const indexKey = definition.key;
      const seen = occurrence.get(indexKey) || 0;
      const index = duplicateLanguageValue ? Math.max(0, seen - 1) : seen;
      if (!duplicateLanguageValue) occurrence.set(indexKey, seen + 1);
      const value = getPathValue(profile, definition.key, index);
      const id = `af-${entries.length}-${Date.now()}`;
      element.dataset.applyflowId = id;
      elementMap.set(id, element);
      const type = controlType(element);
      const safeRadioKeys = new Set(["basic.gender", "education.overseas", "education.studentLeader", "education.highest", "education.rank"]);
      const unsupported = type === "radio" && !safeRadioKeys.has(definition.key);
      entries.push({
        id,
        label: match.label || label || definition.labels[0],
        fieldKey: definition.key,
        controlType: type,
        valuePreview: preview(value),
        canFill: String(value).trim().length > 0 && !unsupported,
        unsupported,
        occurrence: index,
        controlSlot,
      });
    }

    lastScan = {
      entries,
      fillableCount: entries.filter((entry) => entry.canFill).length,
      missingCount: entries.filter((entry) => !entry.canFill).length,
      manualCount,
      detectedControlCount: controls.filter((element) => !element.matches(".ant-select-search__field, [aria-hidden='true']")).length,
      matchedFieldCount: entries.length,
      unmatchedControlCount: manualCount,
      recognizedControlCount,
      estimatedManualSeconds: entries
        .filter((entry) => entry.canFill)
        .reduce((total, entry) => total + (schema.FIELD_SECONDS[entry.controlType] || 10), 0),
    };
    updateOrbCount(lastScan);
    return lastScan;
  }

  function findAddButton(labels) {
    const desired = labels.map(normalize);
    const candidates = Array.from(document.querySelectorAll("button, [role='button'], .add-more-btn, [class*='add-more'], [class*='addMore']"))
      .filter(visible);
    return candidates.find((element) => {
      const text = normalize(element.innerText || element.textContent || element.getAttribute("aria-label"));
      return desired.some((label) => text === label || text.includes(label));
    }) || null;
  }

  function countSectionRecords(scan, countFields) {
    return Math.max(0, ...countFields.map((fieldKey) => scan.entries.filter((entry) => entry.fieldKey === fieldKey).length));
  }

  async function waitForRecordCount(countFields, previousCount, timeout = 2500) {
    const startedAt = performance.now();
    while (performance.now() - startedAt < timeout) {
      await wait(120);
      const result = await scanPage();
      const count = countSectionRecords(result, countFields);
      if (count > previousCount) return count;
    }
    return previousCount;
  }

  async function ensureRepeatableSections(profile) {
    const added = { education: 0, experience: 0, work: 0, projects: 0, languages: 0, awards: 0 };
    const failed = [];
    let scan = await scanPage();
    for (const section of REPEATABLE_SECTIONS) {
      const desiredCount = Math.min((profile[section.key] || []).length, 10);
      let currentCount = countSectionRecords(scan, section.countFields);
      while (currentCount < desiredCount) {
        const addButton = findAddButton(section.addLabels);
        if (!addButton) {
          failed.push(section.key);
          break;
        }
        const clickable = addButton.closest("button, [role='button']") || addButton;
        clickable.scrollIntoView?.({ block: "center", behavior: "instant" });
        clickable.click();
        const nextCount = await waitForRecordCount(section.countFields, currentCount);
        if (nextCount <= currentCount) {
          failed.push(section.key);
          break;
        }
        added[section.key] += nextCount - currentCount;
        currentCount = nextCount;
        scan = lastScan;
      }
    }
    return { added, failed };
  }

  function setNativeValue(element, value) {
    const prototype = element.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
    ["input", "change"].forEach((type) => element.dispatchEvent(new Event(type, { bubbles: true })));
  }

  async function setValueInPageWorld(element, value, mode = "text") {
    element.dataset.applyflowBridgeValue = String(value);
    element.dataset.applyflowBridgeMode = mode;
    element.dataset.applyflowBridgeDone = "";
    element.dispatchEvent(new Event("applyflow:set-value", { bubbles: true }));
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await wait(40);
      if (element.dataset.applyflowBridgeDone === "1") break;
    }
    const completed = element.dataset.applyflowBridgeDone === "1";
    delete element.dataset.applyflowBridgeValue;
    delete element.dataset.applyflowBridgeMode;
    delete element.dataset.applyflowBridgeDone;
    return completed;
  }

  function fillSelect(element, value) {
    const desiredValues = comparableValues(value);
    const option = bestMatchingOption(Array.from(element.options), desiredValues);
    if (!option) return false;
    element.value = option.value;
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  function comparableValues(value) {
    const raw = String(value || "").trim();
    const values = [normalize(raw)];
    for (const group of schema.VALUE_SYNONYM_GROUPS || []) {
      const normalizedGroup = group.map(normalize).filter(Boolean);
      if (normalizedGroup.includes(normalize(raw))) values.push(...normalizedGroup);
    }
    const dateMatch = raw.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
    if (dateMatch) {
      values.push(dateMatch[1], normalize(`${dateMatch[1]}年`));
      if (dateMatch[2]) values.push(normalize(`${dateMatch[1]}年${Number(dateMatch[2])}月`));
    }
    return [...new Set(values.filter(Boolean))];
  }

  function optionMatchScore(text, desiredValues) {
    const candidate = normalize(text);
    if (!candidate) return 0;
    let best = 0;
    for (const desired of desiredValues) {
      if (candidate === desired) best = Math.max(best, 1000 + candidate.length);
      else if (candidate.startsWith(desired)) best = Math.max(best, 700 + desired.length);
      else if (desired.startsWith(candidate)) best = Math.max(best, candidate.length <= 2 && desired.length >= candidate.length + 3 ? 0 : 600 + candidate.length);
      else if (candidate.includes(desired)) best = Math.max(best, 400 + desired.length);
      else if (desired.includes(candidate) && candidate.length >= 3) best = Math.max(best, 300 + candidate.length);
    }
    return best;
  }

  function bestMatchingOption(options, desiredValues) {
    return options
      .map((option) => ({ option, score: Math.max(optionMatchScore(option.innerText || option.textContent, desiredValues), optionMatchScore(option.value, desiredValues)) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)[0]?.option || null;
  }

  const POPUP_SELECTORS = [
    ".ant-select-dropdown:not(.ant-select-dropdown-hidden)",
    ".ant-select-tree-dropdown:not(.ant-select-tree-dropdown-hidden)",
    ".ant-cascader-menus", ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)",
    "[role='listbox']", "[role='tree']",
  ];

  function visiblePopups() {
    return Array.from(document.querySelectorAll(POPUP_SELECTORS.join(","))).filter(visible);
  }

  async function dismissOpenPopups() {
    const target = document.activeElement || document.body;
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
    target.dispatchEvent(new KeyboardEvent("keyup", { key: "Escape", code: "Escape", bubbles: true }));
    target.blur?.();
    await wait(80);
  }

  async function openPopupFor(element) {
    await dismissOpenPopups();
    const before = new Set(visiblePopups());
    element.click();
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await wait(100);
      const popups = visiblePopups();
      const popup = popups.find((item) => !before.has(item)) || popups.at(-1);
      if (popup) return popup;
    }
    return null;
  }

  function displayedControlValue(element) {
    return normalize(element.value || element.getAttribute("title") || element.innerText || element.parentElement?.innerText);
  }

  async function fillBeisenTreeSelect(element, popup, value) {
    const path = schema.regionPath(value);
    if (!path.length) return false;
    for (let index = 0; index < path.length; index += 1) {
      const desired = comparableValues(path[index]);
      let nodes = [];
      for (let attempt = 0; attempt < 30; attempt += 1) {
        nodes = Array.from(popup.querySelectorAll(".ant-select-tree-node-content-wrapper, [role='treeitem']"))
          .filter(visible);
        if (bestMatchingOption(nodes, desired)) break;
        await wait(100);
      }
      const node = bestMatchingOption(nodes, desired);
      if (!node) {
        setFillFailure(element, `籍贯树未出现“${path[index]}”节点`);
        return false;
      }
      const item = node.closest("li, [role='treeitem']") || node;
      if (index < path.length - 1) {
        const switcher = item.querySelector(".ant-select-tree-switcher, [aria-expanded]");
        if (switcher && switcher.getAttribute("aria-expanded") !== "true") switcher.click();
        else node.click();
        await wait(180);
      } else {
        (node.matches("[role='treeitem']") ? node.querySelector(".ant-select-tree-node-content-wrapper") || node : node).click();
        await wait(180);
      }
    }
    const displayed = displayedControlValue(element);
    const success = path.every((segment) => displayed.includes(normalize(segment)));
    if (!success) setFillFailure(element, "籍贯叶子节点已点击，但控件没有回写省市");
    return success;
  }

  async function fillBeisenCascader(element, popup, value) {
    const path = schema.regionPath(value);
    if (!path.length) return false;
    for (const segment of path) {
      let options = [];
      for (let attempt = 0; attempt < 30; attempt += 1) {
        options = Array.from(popup.querySelectorAll(".ant-cascader-menu-item, .ant-cascader-menu-item-content")).filter(visible);
        if (bestMatchingOption(options, comparableValues(segment))) break;
        await wait(100);
      }
      const item = bestMatchingOption(options, comparableValues(segment));
      if (!item) {
        setFillFailure(element, `级联选项未出现“${segment}”`);
        return false;
      }
      (item.closest(".ant-cascader-menu-item") || item).click();
      await wait(180);
    }
    const displayed = displayedControlValue(element);
    const success = path.every((segment) => displayed.includes(normalize(segment)));
    if (!success) setFillFailure(element, "级联路径已点击，但控件没有回写完整路径");
    return success;
  }

  async function fillCustomSelect(element, value) {
    clearFillFailure(element);
    const popup = await openPopupFor(element);
    if (!popup) {
      setFillFailure(element, "下拉弹层未能打开");
      return false;
    }
    const desiredValues = comparableValues(value);
    if (popup.matches(".ant-select-tree-dropdown, [role='tree']") || popup.querySelector(".ant-select-tree-node-content-wrapper")) {
      const success = await fillBeisenTreeSelect(element, popup, value);
      await dismissOpenPopups();
      return success;
    }
    if (popup.matches(".ant-cascader-menus") || popup.querySelector(".ant-cascader-menu")) {
      const success = await fillBeisenCascader(element, popup, value);
      await dismissOpenPopups();
      return success;
    }
    const optionSelectors = [
      "[role='option']", ".el-select-dropdown__item", ".ant-select-item-option",
      ".ant-select-dropdown-menu-item", ".ant-cascader-menu-item", ".ant-cascader-menu-item-content",
      ".ivu-select-item", ".select-option", ".dropdown-item", "li"
    ];
    let options = [];
    const searchInput = element.matches("input")
      ? element
      : element.querySelector(".ant-select-search__field, input[role='combobox'], input[type='search']")
        || element.closest(".ant-select")?.querySelector(".ant-select-search__field, input[role='combobox'], input[type='search']");
    if (searchInput && searchInput !== element && !searchInput.readOnly) {
      const bridged = await setValueInPageWorld(searchInput, String(value), "search");
      if (!bridged) setNativeValue(searchInput, String(value));
      await wait(250);
    }
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await wait(100);
      options = Array.from(popup.querySelectorAll(optionSelectors.join(","))).filter(visible);
      if (bestMatchingOption(options, desiredValues)) break;
    }
    const target = bestMatchingOption(options, desiredValues);
    if (!target) {
      setFillFailure(element, searchInput ? "远程选项在 4 秒内未出现" : "当前下拉弹层中没有匹配选项");
      return false;
    }
    target.click();
    await wait(180);
    const displayed = displayedControlValue(element);
    const success = desiredValues.some((desired) => displayed.includes(desired)) || !visible(target);
    if (!success) setFillFailure(element, "选项已点击，但控件没有回写显示值");
    await dismissOpenPopups();
    return success;
  }

  function firstVisible(selector, root = document) {
    return Array.from(root.querySelectorAll(selector))
      .filter((element) => !element.classList.contains("ant-calendar-picker-container-hidden"))
      .filter(visible)
      .at(-1) || null;
  }

  function setFillFailure(element, reason) {
    element.dataset.applyflowFailureReason = reason;
  }

  function clearFillFailure(element) {
    delete element.dataset.applyflowFailureReason;
  }

  function normalizeDateForDayPicker(value, label = "") {
    const match = String(value || "").match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (!match) return String(value || "");
    if (match[3]) return `${match[1]}-${match[2]}-${match[3]}`;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const isEndDate = /结束|毕业|离职|截止|end|graduat/i.test(label);
    const day = isEndDate ? new Date(year, month, 0).getDate() : 1;
    return `${match[1]}-${match[2]}-${String(day).padStart(2, "0")}`;
  }

  async function chooseAntYear(container, year, triggerSelector) {
    const trigger = firstVisible(triggerSelector, container);
    if (!trigger) return false;
    trigger.click();
    await wait(120);
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const options = Array.from(container.querySelectorAll(".ant-calendar-year-panel-year")).filter(visible);
      const target = options.find((option) => Number((option.textContent || "").match(/\d{4}/)?.[0]) === year);
      if (target) {
        target.click();
        await wait(120);
        return true;
      }
      const optionYears = options.map((option) => Number((option.textContent || "").match(/\d{4}/)?.[0])).filter(Boolean);
      const previous = firstVisible(".ant-calendar-year-panel-prev-decade-btn", container);
      const next = firstVisible(".ant-calendar-year-panel-next-decade-btn", container);
      if (optionYears.length && year < Math.min(...optionYears) && previous) previous.click();
      else if (optionYears.length && year > Math.max(...optionYears) && next) next.click();
      else return false;
      await wait(120);
    }
    return false;
  }

  async function chooseAntMonth(container, month) {
    const options = Array.from(container.querySelectorAll(".ant-calendar-month-panel-month")).filter(visible);
    if (options.length < month) return false;
    options[month - 1].click();
    await wait(160);
    return true;
  }

  async function fillAntDatePicker(element, value, label = "") {
    const match = String(value || "").match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
    if (!match) {
      setFillFailure(element, "日期格式不是 YYYY-MM 或 YYYY-MM-DD");
      return false;
    }
    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = dayText ? Number(dayText) : null;
    element.click();
    let container = null;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await wait(100);
      container = firstVisible(".ant-calendar-picker-container, .ant-calendar");
      if (container) break;
    }
    if (!container) {
      setFillFailure(element, "日期面板未能打开");
      return false;
    }

    const monthPickerPanel = firstVisible(".ant-calendar-month-panel", container);
    if (monthPickerPanel) {
      const yearSelected = await chooseAntYear(container, year, ".ant-calendar-month-panel-year-select");
      if (!yearSelected || !(await chooseAntMonth(container, month))) {
        setFillFailure(element, "月份面板未找到目标年月");
        return false;
      }
    } else {
      const normalizedDate = normalizeDateForDayPicker(value, label);
      const normalizedMatch = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const targetDay = normalizedMatch ? Number(normalizedMatch[3]) : day;
      const yearSelected = await chooseAntYear(container, year, ".ant-calendar-year-select");
      if (!yearSelected) {
        setFillFailure(element, "日期面板未找到目标年份");
        return false;
      }
      const monthTrigger = firstVisible(".ant-calendar-month-select", container);
      if (!monthTrigger) {
        setFillFailure(element, "日期面板未找到月份切换按钮");
        return false;
      }
      monthTrigger.click();
      await wait(120);
      if (!(await chooseAntMonth(container, month))) {
        setFillFailure(element, "日期面板未找到目标月份");
        return false;
      }
      if (targetDay !== null) {
        const dateCells = Array.from(container.querySelectorAll(".ant-calendar-date")).filter((cell) => {
          const tableCell = cell.closest("td");
          return visible(cell)
            && Number((cell.textContent || "").trim()) === targetDay
            && !tableCell?.classList.contains("ant-calendar-last-month-cell")
            && !tableCell?.classList.contains("ant-calendar-next-month-cell")
            && !tableCell?.classList.contains("ant-calendar-disabled-cell");
        });
        if (!dateCells.length) {
          setFillFailure(element, "日期面板未找到可选日期");
          return false;
        }
        dateCells[0].click();
        await wait(180);
      }
    }
    const displayed = normalize(element.value || element.parentElement?.innerText);
    const expected = monthPickerPanel ? String(value) : normalizeDateForDayPicker(value, label);
    const success = comparableValues(expected).some((desired) => displayed.includes(desired));
    if (success) clearFillFailure(element);
    else setFillFailure(element, "日期已点击，但网站状态没有回写");
    return success;
  }

  async function fillCustomDate(element, value, label = "") {
    clearFillFailure(element);
    if (element.closest(".ant-calendar-picker") || /ant-calendar-picker-input/.test(element.className)) {
      return fillAntDatePicker(element, value, label);
    }
    setNativeValue(element, String(value));
    element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
    await wait(250);
    if (normalize(element.value).includes(normalize(value))) return true;
    await setValueInPageWorld(element, value);
    await wait(300);
    if (normalize(element.value).includes(normalize(value))) return true;
    return fillAntDatePicker(element, value, label);
  }

  async function fillRadio(element, value) {
    const formContainer = element.closest(".ant-form-item, [role='radiogroup'], fieldset");
    const group = element.name
      ? Array.from(document.querySelectorAll(`input[type="radio"][name="${CSS.escape(element.name)}"]`))
      : Array.from(formContainer?.querySelectorAll("input[type='radio']") || [element]);
    const desiredValues = comparableValues(value);
    const target = group.find((radio) => {
      const labels = labelCandidates(radio).map((candidate) => normalize(candidate.text));
      return optionMatchScore(radio.value, desiredValues) > 0 || labels.some((label) => optionMatchScore(label, desiredValues) > 0);
    });
    if (!target) return false;
    target.click();
    await wait(180);
    return target.checked || target.closest("label")?.classList.contains("ant-radio-wrapper-checked") || target.parentElement?.classList.contains("ant-radio-checked");
  }

  async function fillFields() {
    const startedAt = performance.now();
    const profile = await loadProfile();
    workflowRunning = true;
    try {
      const repeatable = await ensureRepeatableSections(profile);
      await scanPage();
      let filledCount = 0;
      let failedCount = 0;
      let filledManualSeconds = 0;
      const filledLabels = [];
      const failedLabels = [];
      const failedDetails = [];
      const processed = new Set();

      const fillCurrentPass = async () => {
        for (const entry of lastScan.entries.filter((item) => item.canFill)) {
          const fingerprint = `${entry.fieldKey}:${entry.occurrence}:${normalize(entry.label)}:${entry.controlSlot || ""}`;
          if (processed.has(fingerprint)) continue;
          processed.add(fingerprint);
          const element = elementMap.get(entry.id);
          if (!element || !document.contains(element)) continue;
          const value = getPathValue(profile, entry.fieldKey, entry.occurrence);
          let success = false;
          try {
            if (entry.controlType === "select") success = fillSelect(element, value);
            else if (entry.controlType === "custom-select") success = await fillCustomSelect(element, value);
            else if (entry.controlType === "custom-date") success = await fillCustomDate(element, value, entry.label);
            else if (entry.controlType === "radio") success = await fillRadio(element, value);
            else {
              const bridged = await setValueInPageWorld(element, String(value));
              if (!bridged) setNativeValue(element, String(value));
              await wait(100);
              success = String(element.value).trim() === String(value).trim();
              if (!success) setFillFailure(element, bridged ? "页面状态回滚了输入值" : "页面主世界桥接未响应，且备用写入未生效");
            }
          } catch (error) {
            success = false;
            setFillFailure(element, `填写过程异常：${error?.message || "未知错误"}`);
          }

          if (success) {
            filledCount += 1;
            filledManualSeconds += schema.FIELD_SECONDS[entry.controlType] || 10;
            filledLabels.push(entry.label);
            element.classList.add("applyflow-filled");
          } else {
            failedCount += 1;
            failedLabels.push(entry.label);
            failedDetails.push({
              label: entry.label,
              fieldKey: entry.fieldKey,
              controlType: entry.controlType,
              reason: element.dataset.applyflowFailureReason || "网站未接受写入值",
            });
            console.warn("[ApplyFlow] 填写失败", failedDetails.at(-1));
            element.classList.add("applyflow-manual");
          }
        }
      };

      await fillCurrentPass();
      await wait(400);
      await scanPage();
      await fillCurrentPass();

      const executionSeconds = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
      const reviewSeconds = filledCount * 2;
      const manualSeconds = filledManualSeconds;
      const savedSeconds = Math.max(0, Math.floor((manualSeconds - executionSeconds - reviewSeconds) / 10) * 10);
      const existing = await chrome.storage.local.get("usageStats");
      const usageStats = existing.usageStats || { filledFields: 0, savedSeconds: 0 };
      usageStats.filledFields += filledCount;
      usageStats.savedSeconds += savedSeconds;
      await chrome.storage.local.set({ usageStats });

      return { filledCount, failedCount, filledLabels, failedLabels, failedDetails, savedSeconds, usageStats, repeatable };
    } finally {
      workflowRunning = false;
    }
  }

  function ensureOrb() {
    if (document.getElementById("applyflow-root")) return;
    const root = document.createElement("div");
    root.id = "applyflow-root";
    const button = document.createElement("button");
    button.className = "applyflow-orb";
    button.type = "button";
    button.title = "打开 ApplyFlow";
    button.textContent = "AF";
    button.dataset.count = "0";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const response = await chrome.runtime.sendMessage({ type: "APPLYFLOW_OPEN_PANEL" });
        if (response?.ok) hideOrb();
      } finally {
        button.disabled = false;
      }
    });
    root.appendChild(button);
    document.documentElement.appendChild(root);
  }

  function hideOrb() {
    const root = document.getElementById("applyflow-root");
    if (root) root.hidden = true;
  }

  function showOrb() {
    ensureOrb();
    const root = document.getElementById("applyflow-root");
    if (root) root.hidden = false;
  }

  function updateOrbCount(scan) {
    const button = document.querySelector("#applyflow-root .applyflow-orb");
    if (button) button.dataset.count = String(scan?.fillableCount || 0);
  }

  function disableAssistant() {
    document.getElementById("applyflow-root")?.remove();
    document.querySelectorAll(".applyflow-filled, .applyflow-manual").forEach((element) => {
      element.classList.remove("applyflow-filled", "applyflow-manual");
    });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "APPLYFLOW_SCAN") {
      scanPage().then(sendResponse);
      return true;
    }
    if (message?.type === "APPLYFLOW_FILL") {
      fillFields().then(sendResponse);
      return true;
    }
    if (message?.type === "APPLYFLOW_DISABLE") {
      disableAssistant();
      sendResponse({ ok: true });
    }
    if (message?.type === "APPLYFLOW_HIDE_ORB") {
      hideOrb();
      sendResponse({ ok: true });
    }
    if (message?.type === "APPLYFLOW_SHOW_ORB") {
      showOrb();
      sendResponse({ ok: true });
    }
    return false;
  });

  ensureOrb();
  scanPage().catch(() => undefined);
  const observer = new MutationObserver(() => {
    if (workflowRunning) return;
    clearTimeout(rescanTimer);
    rescanTimer = setTimeout(() => scanPage().catch(() => undefined), 500);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
