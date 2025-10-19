const { ipcRenderer } = require("electron");

function formatBytes(bytes) {
  if (!bytes) return "--";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

function resetStats() {
  document.getElementById("total-space").innerText = "--";
  document.getElementById("used-space").innerText = "--";
  document.getElementById("free-space").innerText = "--";
  document.getElementById("fragmentation").innerText = "--";
  document.getElementById("file-count").innerText = "--";
  document.getElementById("folder-count").innerText = "--";
  document.getElementById("output").innerText = "Waiting for analysis...";
}

async function updateFolderStats(folderPath) {
  resetStats();
  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = true;

  try {
    const stats = await ipcRenderer.invoke("analyze-folder", folderPath);

    document.getElementById("file-count").innerText = stats.fileCount || 0;
    document.getElementById("folder-count").innerText = stats.folderCount || 0;
    document.getElementById("total-space").innerText = formatBytes(stats.folderSize || 0);
    document.getElementById("used-space").innerText = formatBytes(stats.folderSize || 0);
    document.getElementById("free-space").innerText = "--";
    document.getElementById("fragmentation").innerText = "--";

    console.log("✅ Analysis completed successfully!");
  } catch (err) {
    console.error("Error analyzing folder:", err);
  } finally {
    analyzeBtn.disabled = false;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const selectBtn = document.getElementById("select-folder");
  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.disabled = true;

  selectBtn.addEventListener("click", async () => {
    const result = await ipcRenderer.invoke("select-folder");
    if (!result.canceled && result.filePaths?.length > 0) {
      const folderPath = result.filePaths[0];
      document.getElementById("selected-path").innerText = `Selected: ${folderPath}`;
      analyzeBtn.disabled = false;
      analyzeBtn.dataset.path = folderPath;
    }
  });

  analyzeBtn.addEventListener("click", () => {
    const folderPath = analyzeBtn.dataset.path;
    if (!folderPath) return alert("Please select a folder first!");
    updateFolderStats(folderPath);
  });

  ipcRenderer.on("folder-log", (event, message) => {
    const outputEl = document.getElementById("output");
    outputEl.innerText += message + "\n";
    outputEl.scrollTop = outputEl.scrollHeight;
  });
});
