
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTaskSubtasks = async (title: string): Promise<string[]> => {
  if (!process.env.API_KEY) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 to 5 actionable subtasks for a task titled: "${title}". Be concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return [];
  } catch (error) {
    console.error("Gemini AI error:", error);
    return [];
  }
};

export const suggestCategory = async (title: string, description: string): Promise<string> => {
  if (!process.env.API_KEY) return "Personal";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the task title "${title}" and description "${description}", pick the best category from: Work, Personal, Shopping, Health, Urgent. Return only the category name.`,
    });

    return response.text?.trim() || "Personal";
  } catch (error) {
    return "Personal";
  }
};
