import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(express.json());

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({ apiKey });
};

// Skill suggestions
app.post("/api/ai/suggest-skills", async (req, res) => {
  const { jobTitle } = req.body;
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    const suggestedGroups = JSON.parse(response.text.trim());
    return res.json({ success: true, suggestedGroups });

  } catch (err: any) {
    console.error("Error generating skill suggestions:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to generate skill suggestions. Check your GEMINI_API_KEY." 
    });
  }
});

// Polish accomplishment bullet
app.post("/api/ai/polish-bullet", async (req, res) => {
  const { text, jobTitle } = req.body;
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Polish this resume accomplishment: "${contextStr}${text}"`,
      config: { systemInstruction }
    });

    return res.json({ success: true, polishedText: response.text.trim() });

  } catch (err: any) {
    console.error("Error polishing resume bullet with Gemini:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to polish bullet point. Check your GEMINI_API_KEY." 
    });
  }
});

export default app;
