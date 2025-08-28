document.addEventListener("DOMContentLoaded", async () => {
  const wordListInput = document.getElementById("wordList");
  const summaryDiv = document.getElementById("summary");

  // โหลด wordList จาก API
  try {
    const res = await fetch("http://localhost:3025/api/codes");
    const data = await res.json();

    const codes = (data.data || []).map(item => ({
      word: item.code,
      color: item.color || "highlight-yellow",
      meaning: item.meaning || "",   // ✅ ใช้ meaning แทน note
      enabled: true
    }));

    console.log("✅ Codes from API:", codes);

    if (codes.length > 0) {
      renderWordListInput(codes);

      // ส่งไปยัง content.js ให้ highlight ทันที
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "highlightWords", words: codes });
      });
    }
  } catch (err) {
    console.error("❌ โหลด word list จาก API ไม่สำเร็จ:", err);
  }

  // --- render word list ไป textarea ---
  function renderWordListInput(words) {
    const activeWords = words.map(w => w.word);
    wordListInput.value = activeWords.join(", ");
  }

  // --- render summary ---
  function renderSummary(summary) {
    summaryDiv.innerHTML = "";
    const keys = Object.keys(summary);

    keys.forEach(word => {
      const { count, styleClass, meaning } = summary[word];
      const wrapper = document.createElement("div");
      wrapper.className = "summary-item";

      const label = document.createElement("span");
      label.className = "summary-label";

      // ✅ แสดง word + meaning + count
      label.innerHTML = `
        <span class="${styleClass}" 
          style="padding:2px 4px;border-radius:3px;font-weight:bold;">
          ${word}
        </span>
        <span style="color:#888; margin-left:6px;">
          (${meaning || "-"})
        </span>
        : ${count}
      `;

      wrapper.appendChild(label);
      summaryDiv.appendChild(wrapper);
    });
  }

  // ✅ ฟังผลลัพธ์ summary จาก content.js
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "updateSummary") {
      renderSummary(msg.summary);
    }
  });
});
