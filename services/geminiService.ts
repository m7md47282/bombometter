
import { GoogleGenAI, Type } from "@google/genai";
import { OrdnanceAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeOrdnance(base64Image: string): Promise<OrdnanceAnalysis> {
  const model = 'gemini-3-pro-preview';
  
  const prompt = `
    As an Expert Explosive Ordnance Disposal (EOD) AI assistant, analyze this image.
    Identify if there is an unexploded ordnance (UXO), IED, or military explosive device present.
    If found, provide a detailed identification, threat level, and safety protocols.
    
    CRITICAL: If the image does NOT contain a bomb or explosive, set isExplosive to false and fill other fields with "None".
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isExplosive: { type: Type.BOOLEAN },
          type: { type: Type.STRING, description: "Specific model or category (e.g., M67 Grenade, Pipe Bomb, Mortar Shell)" },
          confidence: { type: Type.NUMBER, description: "Probability from 0-1" },
          threatLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Extreme"] },
          description: { type: Type.STRING },
          safetyProtocols: { type: Type.ARRAY, items: { type: Type.STRING } },
          componentsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } },
          dimensionsEstimated: { type: Type.STRING }
        },
        required: ["isExplosive", "type", "confidence", "threatLevel", "description", "safetyProtocols"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as OrdnanceAnalysis;
  } catch (e) {
    throw new Error("Failed to parse analysis data.");
  }
}
