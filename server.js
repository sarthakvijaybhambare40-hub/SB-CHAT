
const express = require("express");
const path = require("path");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));

app.use(express.static(__dirname, {
  index: false
}));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "SB Chat Backend is running!"
  });
});

// Image Generation API
app.post("/api/generate-image", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image prompt."
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        error: "Image prompt is too long."
      });
    }

    if (!process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === "PASTE_KEY_HERE") {
      return res.status(503).json({
        error: "Image API is not configured yet."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt: prompt.trim(),
      size: "1024x1024"
    });

    res.json({
      image: result.data[0].b64_json
    });

  } catch (error) {
    console.error("Image Error:", error.message);

    res.status(500).json({
      error: "Sorry, image could not be generated."
    });
  }
});

// Real AI Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const message = req.body.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        error: "Message is too long."
      });
    }

    if (!process.env.OPENAI_API_KEY ||
        process.env.OPENAI_API_KEY === "PASTE_KEY_HERE") {
      return res.status(503).json({
        error: "AI API is not configured yet."
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions: "You are SB Chat, a helpful AI assistant. Give clear, friendly and useful answers.",
      input: message
    });

    res.json({
      reply: response.output_text
    });

  } catch (error) {
    console.error("AI Error:", error.message);

    res.status(500).json({
      error: "Sorry, SB Chat could not get an AI response."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SB Chat Server running on port ${PORT}`);
});
