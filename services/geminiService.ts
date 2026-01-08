import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStatementOfPurpose = async (
  experience: string,
  education: string,
  postTitle: string
): Promise<string> => {
  try {
    // Using gemini-3-pro-preview for complex reasoning tasks like writing a professional SOP.
    const model = 'gemini-3-pro-preview';
    const prompt = `
      You are a professional career consultant for a government scientific organization (CSIR).
      Write a concise, professional Statement of Purpose (max 200 words) for an applicant applying for the post of ${postTitle}.
      
      Applicant Background:
      Education: ${education}
      Experience Summary: ${experience}
      
      The tone should be formal, dedicated to national service, and technically sound.
    `;

    // Query GenAI with model name and prompt directly in generateContent.
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Directly access the text property of the response object as per updated API standards.
    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again manually.";
  }
};