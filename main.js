const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { Worker } = require("worker_threads");
const os = require("os");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  win.loadFile("index.html");
}

ipcMain.handle("select-folder", async () => {
  return await dialog.showOpenDialog({ properties: ["openDirectory"] });
});

ipcMain.handle("analyze-folder", async (event, folderPath) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "folderWorker.js"), {
      workerData: folderPath,
    });

    let resolved = false;

    worker.on("message", (msg) => {
      if (msg.type === "done") {
        resolved = true;
        console.log("Folder analysis completed ✅");
        resolve(msg.stats);
      } else if (msg.type === "log") {
        // Send progress log to renderer
        event.sender.send("folder-log", msg.message);
      } else if (msg.type === "error") {
        if (!resolved) {
          resolved = true;
          reject(new Error(msg.error || "Worker error"));
        }
      }
    });

    worker.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    worker.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        if (code === 0) {
          reject(new Error("Worker exited without sending done message"));
        } else {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      }
    });
  });
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
