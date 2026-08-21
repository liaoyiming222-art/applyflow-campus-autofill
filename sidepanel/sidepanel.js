const elements = {
  emptyState: document.getElementById("emptyState"),
  assistantView: document.getElementById("assistantView"),
  pageStatus: document.getElementById("pageStatus"),
  fillableCount: document.getElementById("fillableCount"),
  manualCount: document.getElementById("manualCount"),
  estimatedTime: document.getElementById("estimatedTime"),
  fillButton: document.getElementById("fillButton"),
  fieldList: document.getElementById("fieldList"),
  resultCard: document.getElementById("resultCard"),
  totalSaved: document.getElementById("totalSaved"),
};

let activeTabId = null;

function formatTime(seconds) {
  if (seconds < 60) return `约 ${Math.max(0, seconds)} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `约 ${minutes} 分 ${remainder} 秒` : `约 ${minutes} 分钟`;
}

async function getActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id || null;
}

function sendToPage(type) {
  if (!activeTabId) return Promise.reject(new Error("页面未开启"));
  return chrome.tabs.sendMessage(activeTabId, { type });
}

function showUnavailable() {
  elements.emptyState.classList.remove("hidden");
  elements.assistantView.classList.add("hidden");
}

function renderFields(entries) {
  if (!entries.length) {
    elements.fieldList.innerHTML = '<div class="empty-list">未发现可匹配的通用字段</div>';
    return;
  }
  elements.fieldList.replaceChildren(...entries.slice(0, 40).map((entry) => {
    const row = document.createElement("div");
    row.className = "field-row";
    const icon = document.createElement("div");
    icon.className = `field-icon${entry.canFill ? "" : " missing"}`;
    icon.textContent = entry.canFill ? "✓" : "!";
    const copy = document.createElement("div");
    copy.className = "field-copy";
    const label = document.createElement("div");
    label.className = "field-label";
    label.textContent = entry.label;
    const value = document.createElement("div");
    value.className = "field-value";
    value.textContent = entry.canFill
      ? entry.valuePreview
      : entry.unsupported
        ? "该选项不能从档案安全推断，请手动选择"
        : "档案中暂无内容，需要你填写";
    copy.append(label, value);
    row.append(icon, copy);
    return row;
  }));
}

async function refreshStats() {
  const stored = await chrome.storage.local.get("usageStats");
  const stats = stored.usageStats || { filledFields: 0, savedSeconds: 0 };
  elements.totalSaved.textContent = `已填写 ${stats.filledFields} 项 · 累计节省${formatTime(stats.savedSeconds)}`;
}

async function scan() {
  elements.pageStatus.textContent = "正在识别表单…";
  elements.fillButton.disabled = true;
  try {
    activeTabId = await getActiveTabId();
    const result = await sendToPage("APPLYFLOW_SCAN");
    elements.emptyState.classList.add("hidden");
    elements.assistantView.classList.remove("hidden");
    elements.pageStatus.textContent = result.entries.length
      ? `发现 ${result.detectedControlCount} 个控件 · 匹配 ${result.matchedFieldCount} 个通用字段`
      : `发现 ${result.detectedControlCount || 0} 个控件 · 未匹配通用字段`;
    elements.fillableCount.textContent = result.fillableCount;
    elements.manualCount.textContent = result.manualCount + result.missingCount;
    const reviewSeconds = result.fillableCount * 2;
    const savedSeconds = Math.max(0, Math.floor((result.estimatedManualSeconds - reviewSeconds) / 10) * 10);
    elements.estimatedTime.textContent = formatTime(savedSeconds);
    elements.fillButton.disabled = result.fillableCount === 0;
    renderFields(result.entries);
  } catch {
    showUnavailable();
  }
  await refreshStats();
}

elements.fillButton.addEventListener("click", async () => {
  elements.fillButton.disabled = true;
  elements.fillButton.textContent = "正在填写…";
  elements.resultCard.classList.add("hidden");
  try {
    const result = await sendToPage("APPLYFLOW_FILL");
    const failedDetail = result.failedDetails?.length
      ? `：${result.failedDetails.slice(0, 3).map((item) => `${item.label}（${item.reason}）`).join("、")}${result.failedDetails.length > 3 ? "等" : ""}`
      : result.failedLabels?.length ? `：${result.failedLabels.slice(0, 5).join("、")}${result.failedLabels.length > 5 ? "等" : ""}` : "";
    const addedCount = Object.values(result.repeatable?.added || {}).reduce((total, count) => total + count, 0);
    const addText = addedCount ? `，自动新增 ${addedCount} 段经历` : "";
    const addFailure = result.repeatable?.failed?.length ? `；${result.repeatable.failed.join("、")}未能自动新增，请手动添加后重新识别` : "";
    elements.resultCard.textContent = `已完成 ${result.filledCount} 项通用字段${addText}${result.failedCount ? `，另有 ${result.failedCount} 项填写失败${failedDetail}` : ""}${addFailure}。本次预计节省${formatTime(result.savedSeconds)}。`;
    elements.resultCard.classList.remove("hidden");
    await refreshStats();
  } catch {
    elements.resultCard.textContent = "页面发生变化，请重新识别后再试。";
    elements.resultCard.classList.remove("hidden");
  } finally {
    elements.fillButton.textContent = "填写通用字段";
    elements.fillButton.disabled = false;
  }
});

document.getElementById("rescanButton").addEventListener("click", scan);
document.getElementById("profileButton").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("disableButton").addEventListener("click", async () => {
  try { await sendToPage("APPLYFLOW_DISABLE"); } catch { /* page already unavailable */ }
  window.close();
});

scan();
