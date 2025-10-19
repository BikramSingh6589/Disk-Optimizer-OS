const { parentPort, workerData } = require("worker_threads");
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

async function getFolderStats(folderPath) {
  let totalSize = 0;
  let fileCount = 0;
  let folderCount = 0;

  async function walkDir(dir) {
    let files;
    try {
      files = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      parentPort.postMessage({ type: "log", message: `Cannot access folder: ${dir}` });
      return;
    }

    await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(dir, file.name);
        try {
          if (file.isDirectory()) {
            folderCount++;
            parentPort.postMessage({ type: "log", message: `Analyzing folder: ${fullPath}` });
            await walkDir(fullPath);
          } else if (file.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            fileCount++;
            parentPort.postMessage({ type: "log", message: `Analyzing file: ${fullPath}` });
          }
        } catch (err) {
          parentPort.postMessage({ type: "log", message: `Cannot read: ${fullPath}` });
        }
      })
    );
  }

  await walkDir(folderPath);
  return { folderSize: totalSize, fileCount, folderCount };
}

// Disk info for the drive containing folder
function getDriveInfo(folderPath) {
  const rootPath = path.parse(folderPath).root;
  const { total, free } = os.totalmem ? os.freemem() : { total: 0, free: 0 };
  // Instead of os, we can fallback to folder stats if disk lib fails
  return { diskTotal: 0, diskFree: 0, diskUsed: 0, fragmentation: "--" };
}

async function analyze() {
  try {
    const folderStats = await getFolderStats(workerData);
    const driveInfo = getDriveInfo(workerData);

    const stats = {
      ...folderStats,
      ...driveInfo,
    };

    parentPort.postMessage({ type: "done", stats });
  } catch (err) {
    parentPort.postMessage({ type: "error", error: err.message });
  }
}

analyze();
