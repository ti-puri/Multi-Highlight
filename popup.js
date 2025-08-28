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
      enabled: true // ✅ บังคับให้ทุกคำเปิดใช้งานตั้งแต่แรก
    }));

    console.log("✅ Codes from API:", codes);

    if (codes.length > 0) {
      chrome.storage.sync.set({ wordList: codes });
      renderWordListInput(codes);
    }
  } catch (err) {
    console.error("❌ โหลด word list จาก API ไม่สำเร็จ:", err);

    // fallback → โหลดจาก storage
    chrome.storage.sync.get(["wordList"], (data) => {
      if (Array.isArray(data.wordList)) {
        renderWordListInput(data.wordList);
      } else {
        wordListInput.value = "";
      }
    });
  }

  // โหลด summary
  chrome.storage.sync.get("highlightSummary", (data) => {
    renderSummary(data.highlightSummary || {});
  });

  // --- render word list ไป textarea ---
  function renderWordListInput(words) {
    const activeWords = words.filter(w => w.enabled !== false).map(w => w.word);
    wordListInput.value = activeWords.join(", ");
  }

  // --- render summary พร้อม checkbox ---
  function renderSummary(summary) {
    const keys = Object.keys(summary);

    chrome.storage.sync.get(["wordList"], (data) => {
      let wordList = (data.wordList || []).map(w => ({ ...w, enabled: true }));
      // ✅ บังคับให้ทุกคำ enabled = true

      keys.forEach(word => {
        const { count, styleClass } = summary[word];

        let wrapper = summaryDiv.querySelector(`.summary-item[data-word="${word}"]`);
        if (!wrapper) {
          wrapper = document.createElement("div");
          wrapper.className = "summary-item";
          wrapper.dataset.word = word;

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = true; // ✅ default checked

          checkbox.addEventListener("change", () => {
            wordList = wordList.map(w =>
              w.word === word ? { ...w, enabled: checkbox.checked } : w
            );
            chrome.storage.sync.set({ wordList });
          });

          const label = document.createElement("span");
          label.className = "summary-label";
          label.style.marginLeft = "6px";

          wrapper.appendChild(checkbox);
          wrapper.appendChild(label);
          summaryDiv.appendChild(wrapper);
        }

        const label = wrapper.querySelector(".summary-label");
        label.innerHTML = `<span class="${styleClass}" 
                        style="padding:2px 4px;border-radius:3px;font-weight:bold;">
                        ${word}
                      </span> : ${count}`;
      });

      // ✅ เขียน wordList กลับไปที่ storage โดยบังคับ enabled = true
      chrome.storage.sync.set({ wordList });
    });
  }

  // sync popup กับ storage
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.wordList) {
      renderWordListInput(changes.wordList.newValue || []);
    }
    if (area === "sync" && changes.highlightSummary) {
      renderSummary(changes.highlightSummary.newValue || {});
    }
  });
});
