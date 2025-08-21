import express from "express";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import {
  addOverlay,
  uploadFile,
  uploadRandomStuff,
} from "../utils/media-control.js";
import fs from "fs";

const router = express.Router();

router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use("/media", express.static(path.join(__dirname, "media")));
console.log(
  `🚀 ~ api.js:20 ~ path.join(__dirname, "media"):`,
  { __filename },
  path.join(__dirname, "media")
);

router.get("/", async (req, res) => {
  res.send("🤡 is working....");
});

router.get("/video", (req, res) => {
  const videoPath = path.join(__dirname, "../media/testv.mp4");
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

router.get("/uploadd", async (req, res) => {
  try {
    // const url = await uploadFile();

    // const dd = addOverlay('https://raw.githubusercontent.com/mbganesh/media-storage/main/uploads/test.png')
    // res.status(200).json({ success: true, url });

    // res.json({ok:dd})

    const dds = await addOverlay("./media/testv.mp4");
    console.log("🎉 Video processed successfully");

    res.send("ok...");
  } catch (error) {
    console.error("❌ Error in /uploadd:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Upload failed",
    });
  }
});

// Schedule job: every day at 10 AM
cron.schedule("*/5 * * * *", () => {
  uploadRandomStuff();
});

export default router;
