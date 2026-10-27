(function initializeApplyFlowContent() {
  // Generated from icons/brand.svg by scripts/export-brand.mjs.
  const APPLYFLOW_BRAND_ICON_DATA = "data:image/png;base64,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";
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
    const brandImage = document.createElement("img");
    brandImage.src = APPLYFLOW_BRAND_ICON_DATA;
    brandImage.alt = "";
    button.appendChild(brandImage);
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
