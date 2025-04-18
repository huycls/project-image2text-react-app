import {
  GoogleGenerativeAI,
  // HarmCategory,
  // HarmBlockThreshold,
} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCXoHJWFriF0NusmCpIk7YP8Wqy2RLvkek");

// Track any active chat sessions
let activeSession = null;

export async function chatWithGemini(base64ImageData, outputFormat = "text") {
  try {
    const textPrompt =
      "Extract the text content in this image, don't include any additional information. The text should be formatted in the following way: \n\n";

    const jsonPrompt =
      'Extract content from this image, then format it as a JSON object. Important: Place equivalent data items (like list items, credentials, or qualifications) within arrays. Preserve any HTML structure in the content. If the text begin with a "{number}." make it a array\'s item. For hierarchical numbering (like "2.1.1" being a child of "2.1"), maintain the proper nesting structure in the JSON. For example, "2.1" would be a parent object, and "2.1.1" would be a child within that parent. For lists, wrap items in appropriate HTML tags like <ul> and <li>. For links, preserve <a> tags with href attributes. Format sections with proper nesting of objects and arrays. Object keys must be text don\'t include any number, short and concise. Return a clean, valid JSON object or array without any additional text or explanations. Example structure: { "sectionContent": [ { "title": "Section Title", "content": [ { "text": "Regular paragraph text" }, { "subText": "<ul class=\'list-disc\'><li>Item 1</li><li>Item 2</li></ul>", "className": "formatting-class" }, { "items": ["First credential", "Second credential", "Third credential"] } ] } ] }';

    const prompt = outputFormat === "text" ? textPrompt : jsonPrompt;

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageData = {
      inlineData: {
        data: base64ImageData,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            imageData,
          ],
        },
      ],
    });

    // Store the session for potential future use
    activeSession = {
      model,
      lastInteraction: new Date(),
      sessionId: Date.now().toString(),
    };

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in chatWithGemini:", error);
    throw error;
  }
}

export function resetGeminiSession() {
  const hadActiveSession = !!activeSession;

  activeSession = null;

  return {
    success: true,
    message: hadActiveSession
      ? "Gemini session has been reset successfully."
      : "No active session to reset.",
    timestamp: new Date().toISOString(),
  };
}
