console.log("🚀 Multi Highlight content.js loaded");

let lastWordsJSON = "";

// 🔹 ฟังก์ชันลบ highlight ทั้งหมด
function removeHighlights() {
  const markInstance = new Mark(document.body);
  markInstance.unmark();
  chrome.storage.sync.set({ highlightSummary: {} });
  lastWordsJSON = "";
}

// 🔹 ฟังก์ชัน highlight คำ
function highlightWords(words) {
  const activeWords = (words || []).filter(item => item.word && item.enabled !== false);

  if (activeWords.length === 0) {
    removeHighlights();
    return;
  }

  const currentJSON = JSON.stringify(activeWords);
  if (currentJSON === lastWordsJSON) return; // กัน highlight ซ้ำ
  lastWordsJSON = currentJSON;

  removeHighlights();

  const markInstance = new Mark(document.body);
  let results = {};
  let doneCount = 0;

  activeWords.forEach(({ word, color }) => {
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
        if (doneCount === activeWords.length) {
          chrome.storage.sync.set({ highlightSummary: results });
        }
      }
    });
  });
}

// ✅ auto refresh เมื่อมีการเปลี่ยน wordList
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.wordList) {
    highlightWords(changes.wordList.newValue || []);
  }
});

// ✅ auto run highlight เมื่อโหลดเว็บ
chrome.storage.sync.get(["wordList"], (data) => {
  if (Array.isArray(data.wordList) && data.wordList.length > 0) {
    highlightWords(data.wordList);
  } else {
    removeHighlights();
  }
});
