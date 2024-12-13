import express from "express";
import uploadVideo from "../middleware/multer.js"; // Import the Multer configuration
import { uploadVideoController } from "../controllers/videos.controller.js"; // Updated import

const router = express.Router();

// Route for video upload
// router.post("/video", uploadVideo.single("video"), uploadVideoController);
router.post("/video", (req, res, next) => {
    uploadVideo.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  }, uploadVideoController);
  

export default router;
