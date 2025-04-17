import "./App.css";
import { useState } from "react";
import { generateContentWithImage, chatWithGemini } from "./lib/gemini";

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (e) => {
          setImageUrl(e.target.result);
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (!imageUrl) {
        alert("Please upload an image first");
        return;
      }
      setIsLoading(true);

      // Extract the base64 data from the imageUrl
      // The format is typically: data:image/jpeg;base64,/9j/4AAQSkZJRg...
      const base64Data = imageUrl.split(",")[1];

      const response = await chatWithGemini(base64Data);
      setText(response);
      console.log("Response from Gemini:", response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setText("Error processing image. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100`}>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Image to Text Converter
        </h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Image input */}
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Image Input</h2>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex flex-col items-center justify-center"
              onPaste={handlePaste}
              tabIndex="0">
              {imageUrl ? (
                <div className="w-full">
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="max-w-full max-h-[300px] mx-auto object-contain"
                  />
                  <button
                    className="mt-4 bg-red-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => setImageUrl("")}>
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <p className="text-gray-500 text-center mb-4">
                    Upload an image or paste from clipboard
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    You can also paste an image directly (Ctrl+V)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Text output */}
          <div className="flex-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Text Output</h2>
            <textarea
              className="w-[95%] h-[300px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Text extracted from the image will appear here..."
              value={text || ""}
              onChange={(e) => setText(e.target.value)}></textarea>
            <div className="flex justify-end mt-4">
              <button
                className={`bg-blue-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-blue-600 mr-2  ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSubmit}
                disabled={isLoading}>
                {isLoading ? "Processing..." : "Extract Text"}
              </button>
              <button
                className="bg-gray-500 text-white cursor-pointer px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => {
                  setText("");
                }}>
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
