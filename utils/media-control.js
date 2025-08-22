import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import moment from "moment";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const execAsync = promisify(exec);

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "mbganesh";
const REPO = "media-storage";
const FILE_PATH_VIDEO = "./media/temp.mp4";
const UPLOAD_PATH_VIDEO = "uploads/";

export const addOverlay = async (slogan) => {
  const now = moment().format("YYYY-MM-DD_HHmmss");
  const fileName = `temp_date_${now}.mp4`;
  const outputDir = path.resolve("uploads");
  const outputPath = path.join(outputDir, fileName);

  const dateLabel = moment().format("DD MMMM YYYY");

  // Ensure folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputPath = path.resolve("media/temp.mp4");

  console.log("---FFmpeg Init.... ");

  // Start Loading Indicator
  let dots = "";
  const loadingInterval = setInterval(() => {
    dots = dots.length < 5 ? dots + "." : "";
    process.stdout.write(`\r ☢️☢️☢️ Processing${dots} `);
  }, 2000);

  return new Promise((resolve) => {
    ffmpeg(inputPath)
      .videoFilters([
        {
          filter: "scale",
          options: {
            w: "trunc(iw/2)*2",
            h: "trunc(ih/2)*2",
          },
        },
        {
          filter: "drawtext",
          options: {
            text: dateLabel,
            fontsize: 36,
            fontcolor: "white",
            x: "(w-text_w)/2",
            y: 80,
          },
        },
        {
          filter: "drawtext",
          options: {
            text: slogan,
            fontsize: 36,
            fontcolor: "white",
            x: "(w-text_w)/2",
            y: "h-th-80",
          },
        },
      ])
      .videoCodec("libx264")
      .outputOptions("-pix_fmt", "yuv420p")
      .audioCodec("aac")
      .outputOptions("-strict", "experimental")
      .on("end", () => {
        clearInterval(loadingInterval);
        console.log(`\n---Video processing completed: ${outputPath}`);
        resolve({
          status: true,
          message: "Video processed successfully",
          path: outputPath,
        });
      })
      .on("error", (err) => {
        clearInterval(loadingInterval);
        console.error("\nError:🤡🤡🤡", err.message);
        resolve({
          status: false,
          message: `Processing failed: ${err.message}`,
          path: null,
        });
      })
      .save(outputPath);
  });
};

export const uploadFile = async (localFilePath) => {
  try {
    // Read file (ensure correct local path is passed)
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileContent = fileBuffer.toString("base64");

    // Create unique file name for GitHub repo
    const today = moment().format("YYYY-MM-DD_HHmmss");
    const fileName = `temp_date_${today}.mp4`;
    const UPLOAD_PATH = `${UPLOAD_PATH_VIDEO}${fileName}`;

    // Check if file already exists in repo
    let sha;
    try {
      const { data } = await axios.get(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      sha = data.sha; // Required for updating existing file
    } catch (e) {
      if (e.response?.status !== 404) throw e; // Ignore if file not found
    }

    // Upload or update file
    const res = await axios.put(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
      {
        message: `Upload ${fileName}`,
        content: fileContent,
        ...(sha ? { sha } : {}),
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    console.log("Uploaded:", res.data.content.path);

    // Return raw GitHub URL
    return `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${UPLOAD_PATH}`;
  } catch (err) {
    console.error("❌ Upload failed:", err.response?.data || err.message);
    return err?.response?.data || err?.message;
  }
};

// old methods

export const uploadFileOld = async () => {
  try {
    // Read file
    const fileBuffer = fs.readFileSync(FILE_PATH_VIDEO);
    const fileContent = fileBuffer.toString("base64");

    const today = moment().format("YYYY-MM-DD");
    const fileName = `temp_date_${today}.mp4`;

    const UPLOAD_PATH = UPLOAD_PATH_VIDEO + fileName;

    // Check if file exists
    let sha;
    try {
      const { data } = await axios.get(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      sha = data.sha; // Only needed if updating
    } catch (e) {
      if (e.response?.status !== 404) throw e;
    }

    // Upload or update file
    const res = await axios.put(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
      {
        message: `Upload ${FILE_PATH_VIDEO}`,
        content: fileContent,
        ...(sha ? { sha } : {}), // include sha only if updating
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    console.log("🚀 ~ media-control.js:65 ~ uploadFile ~ res:", res);

    return `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${UPLOAD_PATH}`;
  } catch (err) {
    console.error("❌ Upload failed:", err.response?.data || err.message);
    return err?.response?.data || err?.message;
  }
};

export const addOverlayOld = async (slogan) => {
  const now = moment().format("YYYY-MM-DD_HHmmss");
  const fileName = `temp_date_${now}.mp4`;
  const outputDir = path.resolve("uploads");
  const outputPath = path.join(outputDir, fileName);

  const dateLabel = moment().format("DD MMMM YYYY");

  // Ensure folder exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const inputPath = path.resolve("media/temp.mp4");

  // From local file
  const ffmpegCommand = `ffmpeg -i "${inputPath}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2, drawtext=text='${dateLabel}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=80, drawtext=text='${slogan}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-th-80" -c:v libx264 -pix_fmt yuv420p -c:a aac -strict experimental "${outputPath}"`;

  // From URL
  // const ffmpegCommand = `ffmpeg -i "${url}" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2, drawtext=text='${dateLabel}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=80, drawtext=text='${slogan}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=h-th-80" -c:v libx264 -pix_fmt yuv420p -c:a aac -strict experimental "${outputPath}"`;

  console.log("---FFmpeg Init.... ");

  // Start Loading Indicator
  let dots = "";
  const loadingInterval = setInterval(() => {
    dots = dots.length < 5 ? dots + "." : "";
    process.stdout.write(`\r ☢️☢️☢️ Processing${dots} `);
  }, 2000); // every 2 seconds

  try {
    const { stdout, stderr } = await execAsync(ffmpegCommand);
    clearInterval(loadingInterval);
    console.log("---FFmpeg stderr:", stderr);
    console.log("---FFmpeg stdout:", stdout);
    console.log("---Video processing completed:", outputPath);
    return { status: true, path: outputPath };
  } catch (error) {
    clearInterval(loadingInterval);
    console.error("Error:🤡🤡🤡", error.message);
    return { status: false, path: null };
  }
};
