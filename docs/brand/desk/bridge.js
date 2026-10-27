// Local-only adapter: real content listeners calculate scan/fill results against the fixture DOM.
// No UI-test canned responses, persistence, product source edits, or real personal data.
globalThis.__applyflowListeners = [];
globalThis.chrome = {
  storage: { local: {
    get: async (key) => typeof key === 'string' ? { [key]: parent.__materialEvidence.memory[key] } : { ...parent.__materialEvidence.memory },
    set: async (values) => { Object.assign(parent.__materialEvidence.memory, values); },
  } },
  tabs: {
    query: async () => [{ id: 1 }],
    sendMessage: async (_tabId, message) => parent.pageMessage(message.type),
  },
  runtime: {
    onMessage: { addListener: (listener) => globalThis.__applyflowListeners.push(listener) },
    connect: () => ({ postMessage() {}, onMessage: { addListener() {} }, onDisconnect: { addListener() {} } }),
    sendMessage: async () => ({ ok: true }),
    openOptionsPage: async () => { alert('此素材工作台仅使用虚构档案，不打开真实档案。'); },
  },
};
