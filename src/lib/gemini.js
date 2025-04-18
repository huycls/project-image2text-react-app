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
      "Extract content from this image, then format it as a JSON object, don't include anything else. The values should be extracted from the image. The JSON object should be formatted as follows: \n\n";

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
