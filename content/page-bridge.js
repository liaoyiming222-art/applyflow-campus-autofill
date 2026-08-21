(function initializeApplyFlowPageBridge() {
  if (globalThis.__applyFlowPageBridgeReady) return;
  globalThis.__applyFlowPageBridgeReady = true;

  document.addEventListener("applyflow:set-value", (event) => {
    const element = event.target;
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) return;
    const value = element.dataset.applyflowBridgeValue ?? "";
    const mode = element.dataset.applyflowBridgeMode || "text";
    const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
    if (setter) setter.call(element, value);
    else element.value = value;
    element.focus();
    element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    if (mode !== "search") {
      element.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
      element.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true }));
      element.dispatchEvent(new Event("blur", { bubbles: true }));
      element.blur();
    }
    element.dataset.applyflowBridgeDone = "1";
  }, true);
})();
