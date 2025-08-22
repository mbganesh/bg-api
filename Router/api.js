import express from "express";
import cron from "node-cron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { addOverlay, uploadFile } from "../utils/media-control.js";
import { cleanupOldFiles } from "../utils/cleanupOldFiles.js";

const router = express.Router();

router.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use("/media", express.static(path.join(__dirname, "media")));

router.get("/", async (req, res) => {
  res.send("🤡 is working....");
});

router.get("/video", (req, res) => {
  const videoPath = path.join(__dirname, "../media/temp.mp4");
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
    // step:2
    const url = await uploadFile();

    res.json({ url });
  } catch (error) {
    console.error("❌ Error in /uploadd:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Upload failed",
    });
  }
});

router.get("/ffmpeg", async (req, res) => {
  try {
    const slogan = "Why try when failure comes so naturally?";

    // step:1
    const updateOverlay = await addOverlay(slogan);

    if (updateOverlay?.status) {
      const url = await uploadFile(updateOverlay?.path);

      if (url) {
        res.json({
          path: url,
          message: "successfully deployed",
        });
      } else {
        res.json({
          path: updateOverlay?.path,
          message: "successfully updated",
        });
      }
    } else {
      res.send("unable to processing");
    }
  } catch (error) {
    console.error("❌ Error in /uploadd:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "api failed 🤡",
    });
  }
});

const initDailyRemenderCron = async () => {
  try {
    const slogan = "🤡🤡🤡 sHittt 🤡🤡🤡?";

    const updateOverlay = await addOverlay(slogan);

    if (updateOverlay?.status) {
      const { error, status, url } = await uploadFile(updateOverlay?.path);

      if (status) {
        await cleanupOldFiles();
        console.log({
          path: url,
          message: "Successfully deployed",
        });
      } else {
        console.log({
          path: updateOverlay?.path,
          message: error,
        });
      }
    } else {
      console.log("Unable to process overlay");
    }
  } catch (error) {
    console.error("❌ Cron job failed:", error?.message || error);
  }
};

initDailyRemenderCron();

// const cronSlot = "*/15 * * * *"; // every 15 mins

// const cronSlot = "*/5 * * * *"; // Runs every 5 minutes

const cronSlot = "0 */2 * * *"; // every 2 hr

cron.schedule(cronSlot, async () => {
  // initDailyRemenderCron();
});
export default router;
