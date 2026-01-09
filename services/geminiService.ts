import { GoogleGenAI, Type } from "@google/genai";
import { EducationLevel, GeneratedContent, Question } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateContent = async (
  level: EducationLevel,
  subject: string,
  topic: string,
  contextText: string,
  files: File[],
  includeSummary: boolean
): Promise<GeneratedContent> => {
  
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Determine option count based on level (Rule 2 from user prompt)
  let optionCount = 4;
  let optionLabels = "A, B, C, D";
  
  if (level === EducationLevel.SD_LOW) {
    optionCount = 3;
    optionLabels = "A, B, C";
  } else if (level === EducationLevel.SMA) {
    optionCount = 5;
    optionLabels = "A, B, C, D, E";
  }

  // Define Schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "A concise study module or summary of the material. Use Markdown formatting. If not requested, leave empty.",
        nullable: true,
      },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            stimulus: { type: Type.STRING, description: "The context, story, data, or scenario provided before the question (HOTS requirement)." },
            questionText: { type: Type.STRING, description: "The actual question stem." },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "Option label (A, B, C, etc.)" },
                  text: { type: Type.STRING, description: "The content of the answer option." }
                }
              }
            },
            correctAnswer: { type: Type.STRING, description: "The key of the correct answer." },
            explanation: { type: Type.STRING, description: "Explanation of why the answer is correct and analysis of the logic." }
          }
        }
      }
    },
    required: ["questions"]
  };

  // Construct the prompt
  const systemPrompt = `
    You are an expert educational content creator specialized in HOTS (Higher Order Thinking Skills) for the Indonesian curriculum.
    
    Target Audience: ${level}
    Subject: ${subject}
    Topic: ${topic}

    Your Task:
    1. ${includeSummary ? "Create a concise, essential study module/summary suitable for the student's level." : "Do not create a summary."}
    2. Generate 5 Multiple Choice Questions based on the material provided (text or images) and the summary.

    CRITICAL RULES FOR QUESTIONS (Based on HOTS Guidelines):
    1. **Stimulus**: Every question MUST be preceded by a stimulus (a short text, case study, data description, or scenario). Do not ask direct recall questions.
    2. **Thinking Level**: Focus on C4 (Analyze), C5 (Evaluate), and C6 (Create). Avoid C1 (Remember) and C2 (Understand).
    3. **Contextual**: Problems should relate to real-world contexts or new situations (Transfer of Knowledge).
    4. **Option Count**: You MUST provide exactly ${optionCount} options (${optionLabels}).
    5. **Distractors**: Distractors must be plausible and homogenous.
    
    If the user uploaded an image, analyze it and use it as the source material for the summary and questions.
  `;

  const parts: any[] = [];
  
  // Add text prompt
  parts.push({ text: contextText ? `Material Text:\n${contextText}` : "Material: Generate based on the Topic and Subject provided." });

  // Add images
  if (files.length > 0) {
    for (const file of files) {
      const imagePart = await fileToGenerativePart(file);
      parts.push(imagePart);
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Updated to a valid and robust model
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const parsedData = JSON.parse(text) as GeneratedContent;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // @ts-ignore
    throw new Error(error.message || "Failed to generate content. Please try again.");
  }
};