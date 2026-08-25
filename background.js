const INJECTION_FILES = ["shared/schema.js", "content/content.js"];

async function enableForTab(tab) {
  if (!tab?.id || !tab.url) return;
  if (!/^(https?|file):\/\//.test(tab.url)) {
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#C74B50" });
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    await chrome.action.setTitle({ tabId: tab.id, title: "此浏览器内部页面不允许加载扩展，请在招聘网页中使用" });
    return;
  }

  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["content/content.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content/page-bridge.js"],
    world: "MAIN",
  });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: INJECTION_FILES,
  });
  await chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "sidepanel/sidepanel.html",
    enabled: true,
  });
  await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
  await chrome.action.setTitle({ tabId: tab.id, title: "ApplyFlow 已开启，点击页面悬浮球打开侧边栏" });
}

chrome.action.onClicked.addListener((tab) => {
  enableForTab(tab).catch(async (error) => {
    console.warn("ApplyFlow enable failed", error);
    if (!tab?.id) return;
    await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: "#C74B50" });
    await chrome.action.setBadgeText({ tabId: tab.id, text: "!" });
    const hint = tab.url?.startsWith("file:")
      ? "请在扩展详情页开启“允许访问文件 URL”，然后重试"
      : "当前页面无法启用 ApplyFlow，请刷新招聘页面后重试";
    await chrome.action.setTitle({ tabId: tab.id, title: hint });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "APPLYFLOW_OPEN_PANEL") return false;
  const tabId = sender.tab?.id;
  if (!tabId) return false;

  chrome.sidePanel
    .open({ tabId })
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "applyflow-sidepanel") return;
  let tabId = null;
  let minimized = false;
  port.onMessage.addListener((message) => {
    if (message?.type === "APPLYFLOW_PANEL_TAB" && Number.isInteger(message.tabId)) tabId = message.tabId;
    if (message?.type === "APPLYFLOW_PANEL_MINIMIZE") minimized = true;
  });
  port.onDisconnect.addListener(() => {
    if (!tabId) return;
    const type = minimized ? "APPLYFLOW_SHOW_ORB" : "APPLYFLOW_DISABLE";
    chrome.tabs.sendMessage(tabId, { type }).catch(() => undefined);
  });
});
