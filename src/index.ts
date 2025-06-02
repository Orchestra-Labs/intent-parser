import { Request, Response } from "express";
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import fetch from "node-fetch";
import FormData from "form-data";

dotenv.config();
const app = express();
const upload = multer();
const PORT = process.env.PORT || 3001;

app.post(
  "/transcribe",
  upload.single("file"),
  (req: Request, res: Response): void => {
    void (async () => {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Missing file" });

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: "Missing API key" });

      const form = new FormData();
      form.append("file", file.buffer, "audio.webm");
      form.append("model", "whisper-1");

      try {
        const response = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: form,
          }
        );

        const data = (await response.json()) as { text: string };

        if (response.ok) {
          res.json({ text: data.text });
        } else {
          res.status(500).json({ error: data });
        }
      } catch (error) {
        console.error("Transcription error:", error);
        res.status(500).json({ error: "Failed to transcribe" });
      }
    })();
  }
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
