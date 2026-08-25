const elements = {
  emptyState: document.getElementById("emptyState"),
  assistantView: document.getElementById("assistantView"),
  pageStatus: document.getElementById("pageStatus"),
  primaryMetricValue: document.getElementById("primaryMetricValue"),
  primaryMetricLabel: document.getElementById("primaryMetricLabel"),
  secondaryMetricValue: document.getElementById("secondaryMetricValue"),
  secondaryMetricLabel: document.getElementById("secondaryMetricLabel"),
  fillButton: document.getElementById("fillButton"),
  fieldList: document.getElementById("fieldList"),
  resultCard: document.getElementById("resultCard"),
  totalSaved: document.getElementById("totalSaved"),
};

let activeTabId = null;
let lastReadyMetrics = null;
const panelPort = chrome.runtime.connect({ name: "applyflow-sidepanel" });

function formatTime(seconds) {
  if (seconds < 60) return `约 ${Math.max(0, seconds)} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `约 ${minutes} 分 ${remainder} 秒` : `约 ${minutes} 分钟`;
}

function formatMetricTime(seconds) {
  if (seconds < 60) return `${Math.max(0, seconds)} 秒`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder ? `${minutes} 分 ${remainder} 秒` : `${minutes} 分钟`;
}

function setMetrics(primaryValue, primaryLabel, secondaryValue, secondaryLabel) {
  elements.primaryMetricValue.textContent = primaryValue;
  elements.primaryMetricLabel.textContent = primaryLabel;
  elements.secondaryMetricValue.textContent = secondaryValue;
  elements.secondaryMetricLabel.textContent = secondaryLabel;
}

function renderFailureSummary(result) {
  const failedCount = Number(result.failedCount || 0);
  const failedEntries = result.failedDetails?.length
    ? result.failedDetails.map((item) => item.label)
    : result.failedLabels || [];
  const repeatableFailures = result.repeatable?.failed || [];
  if (!failedCount && !repeatableFailures.length) {
    elements.resultCard.classList.add("hidden");
    elements.resultCard.replaceChildren();
    return;
  }

  const title = document.createElement("strong");
  title.textContent = failedCount ? `⚠ ${failedCount} 项未能填写` : "⚠ 部分经历未能自动新增";
  const details = document.createElement("p");
  const labels = [...failedEntries, ...repeatableFailures].slice(0, 3);
  const totalDetails = failedEntries.length + repeatableFailures.length;
  details.textContent = `${labels.join("、")}${totalDetails > 3 ? "等" : ""}`;
  elements.resultCard.replaceChildren(title, details);
  elements.resultCard.classList.remove("hidden");
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
  elements.pageStatus.classList.remove("hidden");
  setMetrics("…", "正在识别", "…", "正在计算");
  elements.fillButton.disabled = true;
  try {
    activeTabId = await getActiveTabId();
    panelPort.postMessage({ type: "APPLYFLOW_PANEL_TAB", tabId: activeTabId });
    await sendToPage("APPLYFLOW_HIDE_ORB");
    const result = await sendToPage("APPLYFLOW_SCAN");
    elements.emptyState.classList.add("hidden");
    elements.assistantView.classList.remove("hidden");
    elements.pageStatus.textContent = "";
    elements.pageStatus.classList.add("hidden");
    const reviewSeconds = result.fillableCount * 2;
    const savedSeconds = Math.max(0, Math.floor((result.estimatedManualSeconds - reviewSeconds) / 10) * 10);
    lastReadyMetrics = { fillableCount: result.fillableCount, savedSeconds };
    setMetrics(String(result.fillableCount), "可自动填写", formatMetricTime(savedSeconds), "预计节省");
    elements.resultCard.classList.add("hidden");
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
  setMetrics("…", "正在填写", "…", "正在计算");
  elements.resultCard.classList.add("hidden");
  try {
    const result = await sendToPage("APPLYFLOW_FILL");
    setMetrics(String(result.filledCount), "已填写字段", formatMetricTime(result.savedSeconds), "本次节省");
    renderFailureSummary(result);
    await refreshStats();
  } catch {
    if (lastReadyMetrics) setMetrics(String(lastReadyMetrics.fillableCount), "可自动填写", formatMetricTime(lastReadyMetrics.savedSeconds), "预计节省");
    elements.resultCard.textContent = "⚠ 页面发生变化，请重新识别后再试。";
    elements.resultCard.classList.remove("hidden");
  } finally {
    elements.fillButton.textContent = "智能填写字段";
    elements.fillButton.disabled = false;
  }
});

document.getElementById("rescanButton").addEventListener("click", scan);
document.getElementById("profileButton").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("closePanelButton").addEventListener("click", async () => {
  panelPort.postMessage({ type: "APPLYFLOW_PANEL_MINIMIZE" });
  try { await sendToPage("APPLYFLOW_SHOW_ORB"); } catch { /* page already unavailable */ }
  window.close();
});

scan();
