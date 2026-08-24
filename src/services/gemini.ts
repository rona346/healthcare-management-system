import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getDiagnosisSuggestions(symptoms: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `As a professional medical assistant, analyze the following symptoms and suggest 3-5 possible conditions, their typical severity, and recommended next steps (tests or specialist consultations). 
      
      Symptoms: ${symptoms}
      
      Format the response in clear Markdown with headers. Include a strong disclaimer that this is not a final diagnosis and a doctor must be consulted.`,
      config: {
        systemInstruction: "You are a highly accurate medical diagnostic assistant. Provide concise, professional, and evidence-based suggestions.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI error:", error);
    return "Unable to generate suggestions at this time. Please consult a medical professional directly.";
  }
}
