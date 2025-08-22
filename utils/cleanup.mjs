// NOTES:
// ----------------
// Currently im not using this file keep it for backup

import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { GITHUB_MEIDA_CONFIG } from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_UPLOAD_PATH = path.join(__dirname, "../uploads");

export async function runCleanup() {
  await deleteOldFiles(LOCAL_UPLOAD_PATH);
}

async function deleteOldFiles(dir) {
  try {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        const age = Date.now() - stats.mtimeMs;
        if (age > GITHUB_MEIDA_CONFIG.MINUTES_OLD * 60 * 1000) {
          await deleteFileFromGitHub(file);
          console.log(`Deleted from GitHub: ${file}`);
        }
      } else if (stats.isDirectory()) {
        await deleteOldFiles(filePath);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

const deleteFileFromGitHub = async (filename) => {
  try {
    const githubApiUrl = `https://api.github.com/repos/${GITHUB_MEIDA_CONFIG.OWNER}/${GITHUB_MEIDA_CONFIG.REPO}/contents/${GITHUB_MEIDA_CONFIG.UPLOAD_DIR}/${filename}?ref=${GITHUB_MEIDA_CONFIG.BRANCH}`;

    console.log("🚀 ~ cleanup.mjs:43 ~  ~ githubApiUrl:", githubApiUrl);

    const { data } = await axios.get(githubApiUrl, {
      headers: { Authorization: `token ${GITHUB_MEIDA_CONFIG.TOKEN}` },
    });
    console.log(
      "🚀 ~ 666999 cleanup.mjs:46 ~ deleteFileFromGitHub ~ data:",
      data
    );

    const delResp = await axios.delete(githubApiUrl, {
      headers: { Authorization: `token ${GITHUB_MEIDA_CONFIG.TOKEN}` },
      data: {
        message: `Delete ${filename}`,
        sha: data.sha,
        branch: GITHUB_MEIDA_CONFIG.BRANCH,
      },
    });
    console.log("🚀 ~ cleanup.mjs:56 delResp:", delResp?.data);
  } catch (er) {
    console.log("GIT_DEL_ERR:", er?.message || er);
  }
};
