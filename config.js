import dotenv from "dotenv";
dotenv.config();

export const GITHUB_MEIDA_CONFIG = {
  TOKEN: process.env.GITHUB_TOKEN,
  OWNER: "mbganesh",
  REPO: "media-storage",
  BRANCH: "main",
  UPLOAD_DIR: "uploads",
  MINUTES_OLD: 2,
};

export const GITHUB_BG_API_CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  OWNER: "mbganesh",
  REPO: "media-storage",
  UPLOAD_PATH_VIDEO: "uploads/",
};
