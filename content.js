console.log("🚀 Multi Highlight content.js loaded");

let lastWordsJSON = "";

// 🔹 ลบ highlight ทั้งหมด
function removeHighlights() {
  const markInstance = new Mark(document.body);
  markInstance.unmark();
  lastWordsJSON = "";
}

// 🔹 highlight คำ
function highlightWords(words) {
  if (!Array.isArray(words) || words.length === 0) {
    removeHighlights();
    return;
  }

  const currentJSON = JSON.stringify(words);
  if (currentJSON === lastWordsJSON) return; // กัน highlight ซ้ำ
  lastWordsJSON = currentJSON;

  removeHighlights();

  const markInstance = new Mark(document.body);
  let results = {};
  let doneCount = 0;

  words.forEach(({ word, color }) => {
    const styleClass = "__multi_highlight__ " + (color || "highlight-yellow");

    markInstance.mark(word, {
      separateWordSearch: false,
      caseSensitive: false,
      className: styleClass,
      acrossElements: true,
      iframes: true,
      done: (count) => {
        results[word] = { count, styleClass: color };
        doneCount++;
        if (doneCount === words.length) {
          // ✅ ส่ง summary กลับไป popup.js
          chrome.runtime.sendMessage({ action: "updateSummary", summary: results });
        }
      }
    });
  });
}

// ✅ ฟัง message จาก popup.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "highlightWords") {
    highlightWords(msg.words);
  }
});
