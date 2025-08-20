import express from "express";

import {
  addOverlay,
  uploadFile,
  uploadRandomStuff,
} from "../utils/media-control.js";

const router = express.Router();

router.use(express.json());

router.get("/", async (req, res) => {
  res.send("🤡 is working....");
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
