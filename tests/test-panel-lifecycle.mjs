const connectListeners = [];
const sentMessages = [];

globalThis.chrome = {
  action: {
    onClicked: { addListener: () => undefined },
    setBadgeBackgroundColor: async () => undefined,
    setBadgeText: async () => undefined,
    setTitle: async () => undefined,
  },
  scripting: { insertCSS: async () => undefined, executeScript: async () => undefined },
  sidePanel: { setOptions: async () => undefined, open: async () => undefined },
  runtime: {
    onMessage: { addListener: () => undefined },
    onConnect: { addListener: (listener) => connectListeners.push(listener) },
  },
  tabs: { sendMessage: async (tabId, message) => sentMessages.push({ tabId, type: message.type }) },
};

await import(`../background.js?test=${Date.now()}`);

function createPort() {
  let messageListener;
  let disconnectListener;
  return {
    port: {
      name: "applyflow-sidepanel",
      onMessage: { addListener: (listener) => { messageListener = listener; } },
      onDisconnect: { addListener: (listener) => { disconnectListener = listener; } },
    },
    send: (message) => messageListener(message),
    disconnect: () => disconnectListener(),
  };
}

const nativeClose = createPort();
connectListeners[0](nativeClose.port);
nativeClose.send({ type: "APPLYFLOW_PANEL_TAB", tabId: 11 });
nativeClose.disconnect();

const minimize = createPort();
connectListeners[0](minimize.port);
minimize.send({ type: "APPLYFLOW_PANEL_TAB", tabId: 12 });
minimize.send({ type: "APPLYFLOW_PANEL_MINIMIZE" });
minimize.disconnect();

await new Promise((resolve) => setTimeout(resolve, 0));
const expected = [
  { tabId: 11, type: "APPLYFLOW_DISABLE" },
  { tabId: 12, type: "APPLYFLOW_SHOW_ORB" },
];
const ok = JSON.stringify(sentMessages) === JSON.stringify(expected);
console.log(JSON.stringify({ ok, sentMessages, expected }, null, 2));
if (!ok) process.exitCode = 1;

