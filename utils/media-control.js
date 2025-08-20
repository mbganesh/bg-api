import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import moment from "moment";
import path from "path";

const fontPath = path.resolve("./assets/fonts/Roboto.ttf");
const outputVideo = path.resolve("./output.mp4");

ffmpeg.setFfmpegPath(ffmpegPath);

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "mbganesh";
const REPO = "media-storage";
const FILE_PATH = "./media/test.png";
const UPLOAD_PATH = "uploads/test.png"; // FIXME: need to generate randomly...

export const uploadFile = async () => {
  try {
    // read file as base64
    const fileContent = fs.readFileSync(FILE_PATH, { encoding: "base64" });

    const res = await axios.put(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
      {
        message: `Upload ${FILE_PATH}`,
        content: fileContent,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    // Raw file URL
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${UPLOAD_PATH}`;
    console.log("✅ Uploaded! File URL:", url);
    return url;
  } catch (err) {
    console.error("❌ Upload failed:", err.response?.data || err.message);
    return err?.response?.data || err?.message;
  }
};

const fontPathV = path.join(process.cwd(), "assets/fonts/Roboto.ttf");

export const addOverlay = async (url) => {
  const today = moment().format("YYYY-MM-DD");
  const slogan = "some random text";

  return new Promise((resolve, reject) => {
    ffmpeg(url)
      .videoFilter([
        `drawtext=text='${today}':fontcolor=white:fontsize=36:x=(w-tw)/2:y=50`,
        `drawtext=text='${slogan}':fontcolor=yellow:fontsize=28:x=(w-tw)/2:y=h-80`,
      ])
      .output(`medi_${today}`)
      .on("end", () => resolve(outputVideo))
      .on("error", reject)
      .run();
  });

  return new Promise((resolve, reject) => {
    ffmpeg(url)
      .videoFilters({
        filter: "drawtext",
        options: {
          fontfile: fontPath,
          text: "THIS IS TEXT",
          fontsize: 20,
          fontcolor: "white",
          x: "(main_w/2-text_w/2)",
          y: 50,
          shadowcolor: "black",
          shadowx: 2,
          shadowy: 2,
        },
      })
      .on("end", function () {
        console.log("file has been converted succesfully");
      })
      .on("error", function (err) {
        console.log("an error happened: " + err.message);
      })
      // save to file
      .save("./out.mp4");
  });

  return;

  return new Promise((resolve, reject) => {
    ffmpeg(url)
      .videoFilters({
        filter: "drawtext",
        options: {
          text: "Hello Deploy!",
          fontfile: fontPathV,
          fontsize: 36,
          fontcolor: "white",
          x: "(w-text_w)/2",
          y: "(h-text_h)-50",
        },
      })
      .output(outputVideo)
      .on("end", () => {
        console.log("✅ Video created with date & slogan");
        resolve(outputVideo); // resolve with output path
      })
      .on("error", (err) => {
        console.error("❌ Error:", err.message || err);
        reject(err);
      })
      .run();
  });
};

export const uploadRandomStuff = async () => {
  try {
    const now = moment().format("YYYY-MM-DD_HHmmss");

    const UPLOAD_PATH = `uploads/media_${now}.mp4`;
    const FILE_PATH = "./media/testv.mp4";
    // read file as base64

    if (!fs.existsSync(FILE_PATH)) {
      return null;
    }

    const fileContent = fs.readFileSync(FILE_PATH, { encoding: "base64" });

    const res = await axios.put(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${UPLOAD_PATH}`,
      {
        message: `Upload ${FILE_PATH}`,
        content: fileContent,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    // Raw file URL
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${UPLOAD_PATH}`;
    console.log("✅ Uploaded! File URL:", url);
    // return url;
  } catch (err) {
    console.error("❌ Upload failed:", err.response?.data || err.message);
    // return err?.response?.data || err?.message;
  }
};
