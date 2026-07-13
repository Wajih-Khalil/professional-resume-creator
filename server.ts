import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

console.log("==================================");
console.log("Server starting...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", PORT);
console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
console.log("==================================");

// Body parsing middleware
app.use(express.json({ limit: "5mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Gemini SDK lazily to avoid crashing on start if API key is not yet set
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("Initializing Gemini...");
    console.log("API Key exists:", !!apiKey);

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required.");
    }

    aiClient = new GoogleGenAI({ apiKey });
  }

  return aiClient;
}

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI custom theme generator
app.post("/api/ai/theme", async (req, res) => {
  const { prompt } = req.body;
  console.log("Theme request body:", req.body);

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ success: false, error: "Prompt is required and must be a string." });
  }

  try {
    const ai = getAiClient();
    const systemInstruction = `
      You are an elite graphic designer and resume typographer.
      The user wants to generate a high-contrast, professional, and visually stunning custom theme for their resume based on their prompt.
      You must respond with a complete, cohesive design package in JSON matching the requested schema.

      Design guidelines:
      - Primary color: The main accent (e.g. headers, icons, sidebar backgrounds). Must have a high contrast against white (at least 4.5:1 ratio). Avoid pure light colors for text or main headings.
      - Secondary color: Complementary to the primary (e.g. job titles, dates).
      - Accent color: A punchy accent color used sparingly (e.g., highlights, skills background badges).
      - background: Keep it standard white (#ffffff) or very soft white (#fafafa, #f9fafb, #f3f4f6, #f4f4f5) for resume print readability. Do NOT make the page background dark unless the user explicitly demands a full dark-mode resume (in which case, set textPrimary to a light color).
      - textPrimary: Dark text (#111827 or #0f172a) for high readability, unless dark-mode is active.
      - textSecondary: A legible gray (#4b5563 or #374151).
      - border: Light divider color (#e5e7eb or #d1d5db).
      - fontSans: A standard professional web font like "Inter", "Outfit", "Plus Jakarta Sans", "Roboto", "Helvetica Neue", "system-ui".
      - fontDisplay: A prominent typeface for headers, like "Space Grotesk", "Playfair Display", "Lora", "Cinzel", "Montserrat", "Inter".
      - fontMono: JetBrains Mono, SFMono-Regular, or Courier.
      - layoutStyle: Select "classic", "modern", "sidebar", or "minimal".
      - fontSize: Select "sm", "base", or "lg".
      - spacing: Select "compact", "normal", or "relaxed".
      - customStylingTips: A short sentence summarizing the stylistic concept or design vibe (e.g., "A sophisticated editorial aesthetic with forest green accents and elegant serif typography").
    `;

    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Generate a theme for this wishful description: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["fontSans", "fontDisplay", "fontMono", "colors", "layoutStyle", "fontSize", "spacing", "customStylingTips"],
          properties: {
            fontSans: { type: Type.STRING, description: "Sans-serif font name" },
            fontDisplay: { type: Type.STRING, description: "Heading font name" },
            fontMono: { type: Type.STRING, description: "Monospace font name" },
            colors: {
              type: Type.OBJECT,
              required: ["primary", "secondary", "accent", "background", "textPrimary", "textSecondary", "border"],
              properties: {
                primary: { type: Type.STRING, description: "Hex color code for primary accents (e.g., #0284c7)" },
                secondary: { type: Type.STRING, description: "Hex color code for secondary elements" },
                accent: { type: Type.STRING, description: "Hex color for small interactive elements/badges" },
                background: { type: Type.STRING, description: "Hex color for the page background (recommend #ffffff or very light)" },
                textPrimary: { type: Type.STRING, description: "Hex color for primary copy/headings" },
                textSecondary: { type: Type.STRING, description: "Hex color for subtitles/paragraph details" },
                border: { type: Type.STRING, description: "Hex color for dividers and borders" },
              }
            },
            layoutStyle: {
              type: Type.STRING,
              enum: ["classic", "modern", "sidebar", "minimal"],
              description: "The visual structural template layout to use"
            },
            fontSize: {
              type: Type.STRING,
              enum: ["sm", "base", "lg"],
              description: "Standard body text scale"
            },
            spacing: {
              type: Type.STRING,
              enum: ["compact", "normal", "relaxed"],
              description: "Inter-component layout breathing room"
            },
            customStylingTips: { type: Type.STRING, description: "A summary of the custom theme vibe" }
          }
        }
      }
    });

    console.log("Gemini response:");
    console.dir(response, { depth: null });
    console.log("Gemini response text:", response.text);

    console.log("Parsing Gemini JSON...");

    let parsedTheme;

    try {
        parsedTheme = JSON.parse(response.text.trim());
    } catch (e) {
        console.error("JSON PARSE FAILED");
        console.error(response.text);
        throw e;
    }

    return res.json({
        success: true,
        themeConfig: parsedTheme
    });
    return res.json({ success: true, themeConfig: parsedTheme });

  } catch (err: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(err);

    console.error("Status:", err?.status);
    console.error("Code:", err?.code);
    console.error("Name:", err?.name);
    console.error("Message:", err?.message);

    if (err?.response) {
        console.error("Response:");
        console.dir(err.response, { depth: null });
    }

    if (err?.cause) {
        console.error("Cause:");
        console.dir(err.cause, { depth: null });
    }

    console.error("Stack:");
    console.error(err?.stack);
    console.error("==================================");

    return res.status(500).json({ success: false, error: err?.message || "Gemini request failed." });
  }
});

// AI Resume Bullet Optimizer and Career Polisher
app.post("/api/ai/optimize-bullet", async (req, res) => {
  const { text, jobTitle, company } = req.body;
  console.log("Optimize Bullet:", req.body);

  if (!text || typeof text !== "string") {
    return res.status(400).json({ success: false, error: "Text to optimize is required." });
  }

  try {
    const ai = getAiClient();
    const systemInstruction = `
      You are an expert executive resume writer and career coach.
      Your task is to take a raw description of a job responsibility or accomplishment and rewrite it into 3 polished, highly impactful, action-oriented bullet points suitable for a world-class professional resume.

      Rules for rewriting:
      - Always start with strong, dynamic action verbs (e.g., "Spearheaded", "Optimized", "Architected", "Engineered", "Cultivated").
      - Focus heavily on results, metrics, and business impact where possible (e.g., adding realistic percentages, dollar amounts, or timeframe indicators if suggested by the input).
      - Maintain a concise, powerful, professional tone.
      - Return exactly an array of strings in JSON, with 3 optimized options.
    `;

    const contextStr = jobTitle ? `For a ${jobTitle} role at ${company || 'the company'}: ` : "";

    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Rewrite this raw work history draft into 3 powerful, result-oriented bullet points: "${contextStr}${text}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          },
          description: "An array of 3 optimized resume bullet points."
        }
      }
    });

    console.log("Gemini response:");
    console.dir(response, { depth: null });
    console.log("Gemini response text:", response.text);

    const suggestions = JSON.parse(response.text.trim());
    return res.json({ success: true, suggestions });

  } catch (err: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(err);

    console.error("Status:", err?.status);
    console.error("Code:", err?.code);
    console.error("Name:", err?.name);
    console.error("Message:", err?.message);

    if (err?.response) {
        console.error("Response:");
        console.dir(err.response, { depth: null });
    }

    if (err?.cause) {
        console.error("Cause:");
        console.dir(err.cause, { depth: null });
    }

    console.error("Stack:");
    console.error(err?.stack);
    console.error("==================================");

    return res.status(500).json({ success: false, error: err?.message || "Gemini request failed." });
  }
});

// AI Skills Suggester
app.post("/api/ai/suggest-skills", async (req, res) => {
  const { jobTitle } = req.body;
  console.log("Suggest Skills:", req.body);

  if (!jobTitle || typeof jobTitle !== "string") {
    return res.status(400).json({ success: false, error: "jobTitle is required and must be a string." });
  }

  try {
    const ai = getAiClient();
    const systemInstruction = `
      You are an elite talent acquisition specialist and career counselor.
      Your task is to take a professional job title and suggest 3 cohesive and highly relevant skill categories/groups (such as 'Languages', 'Frameworks & Libraries', 'Core Capabilities', 'Soft Skills & Leadership', or 'Tools').
      Each group must contain exactly 4 to 6 industry-standard skills that are extremely sought-after for a resume with this job title.
      Respond only with the JSON array matching the requested schema.
    `;

    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Provide 3 standard, high-impact skill groups for the job title: "${jobTitle}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["category", "skills"],
            properties: {
              category: {
                type: Type.STRING,
                description: "Name of the skill category (e.g. Languages, Frameworks & Tools, Databases, Soft Skills)"
              },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of 4 to 6 standard industry skills for this category"
              }
            }
          }
        }
      }
    });

    console.log("Gemini response:");
    console.dir(response, { depth: null });
    console.log("Gemini response text:", response.text);

    const suggestedGroups = JSON.parse(response.text.trim());
    return res.json({ success: true, suggestedGroups });

  } catch (err: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(err);

    console.error("Status:", err?.status);
    console.error("Code:", err?.code);
    console.error("Name:", err?.name);
    console.error("Message:", err?.message);

    if (err?.response) {
        console.error("Response:");
        console.dir(err.response, { depth: null });
    }

    if (err?.cause) {
        console.error("Cause:");
        console.dir(err.cause, { depth: null });
    }

    console.error("Stack:");
    console.error(err?.stack);
    console.error("==================================");

    return res.status(500).json({ success: false, error: err?.message || "Gemini request failed." });
  }
});

// AI Single Bullet Polisher
app.post("/api/ai/polish-bullet", async (req, res) => {
  const { text, jobTitle } = req.body;
  console.log("Polish Bullet:", req.body);

  if (!text || typeof text !== "string") {
    return res.status(400).json({ success: false, error: "Text to polish is required and must be a string." });
  }

  try {
    const ai = getAiClient();
    const systemInstruction = `
      You are an expert executive resume writer.
      Your task is to take a draft of a resume achievement or work experience bullet point and rewrite it to be a single, extremely professional, active, and result-driven bullet point.
      - Start with a powerful and elegant action verb.
      - Enhance the vocabulary, professional tone, and impact.
      - Keep it concise, focused, and under 250 characters.
      - Respond only with the polished string (no markdown, no quotes, no conversational filler).
    `;

    const contextStr = jobTitle ? `For a ${jobTitle} role: ` : "";

    console.log("Calling Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Polish this resume accomplishment: "${contextStr}${text}"`,
      config: { systemInstruction }
    });

    console.log("Gemini response:");
    console.dir(response, { depth: null });
    console.log("Gemini response text:", response.text);

    return res.json({ success: true, polishedText: response.text.trim() });

  } catch (err: any) {
    console.error("========== GEMINI ERROR ==========");
    console.error(err);

    console.error("Status:", err?.status);
    console.error("Code:", err?.code);
    console.error("Name:", err?.name);
    console.error("Message:", err?.message);

    if (err?.response) {
        console.error("Response:");
        console.dir(err.response, { depth: null });
    }

    if (err?.cause) {
        console.error("Cause:");
        console.dir(err.cause, { depth: null });
    }

    console.error("Stack:");
    console.error(err?.stack);
    console.error("==================================");

    return res.status(500).json({ success: false, error: err?.message || "Gemini request failed." });
  }
});

// Vite Integration & Static Asset Delivery
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
