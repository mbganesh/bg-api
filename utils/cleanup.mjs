import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../uploads");
const MINUTES_OLD = 2; // Delete files older than 2 minutes

export async function runCleanup() {
  await deleteOldFiles(UPLOAD_DIR);
}

async function deleteOldFiles(dir) {
  try {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const age = Date.now() - stats.mtimeMs;
        if (age > MINUTES_OLD * 60 * 1000) {
          await fs.unlink(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      } else if (stats.isDirectory()) {
        await deleteOldFiles(filePath); // Recursively clean subfolders
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    console.log("cleanup process done :)");
  }
}
