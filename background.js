chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "refreshHighlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // inject ให้ชัวร์ว่ามี content.js
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["mark.min.js", "content.js"]
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "refreshHighlight" });
        });
      }
    });
  }
});
