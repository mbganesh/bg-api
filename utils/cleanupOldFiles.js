import axios from "axios";
import dotenv from "dotenv";
import { GITHUB_MEIDA_CONFIG } from "../config.js";
import { hasQuota } from "./common.js";

dotenv.config();

export const cleanupOldFiles = async () => {
  const GITHUB_TOKEN = GITHUB_MEIDA_CONFIG.TOKEN;
  const REPO_OWNER = GITHUB_MEIDA_CONFIG.OWNER;
  const REPO_NAME = GITHUB_MEIDA_CONFIG.REPO;
  const DIR_PATH = GITHUB_MEIDA_CONFIG.UPLOAD_DIR;

  const api = axios.create({
    baseURL: `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`,
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });
  const isValidBackupDate = (filename) => {
    // last 3 days
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (!match) return false;
    const fileDate = new Date(match[1]);
    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
    return Date.now() - fileDate.getTime() > threeDaysInMs;
  };

  if (!(await hasQuota())) {
    console.log("Skipping cleanup – rate limit low.");
    return;
  }

  try {
    const { data } = await api.get(`/${DIR_PATH}`);
    for (const file of data) {
      if (file.type === "file" && isValidBackupDate(file.name)) {
        await api.delete(`/${DIR_PATH}/${file.name}`, {
          data: {
            message: `Delete old file ${file.name}`,
            sha: file.sha,
          },
        });
        console.log(`Deleted: ${file.name}`);
      }
    }
  } catch (error) {
    console.error("Cleanup Error:", error.response?.data || error.message);
  }
};
