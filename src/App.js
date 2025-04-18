import "./App.css";
import { useState } from "react";
import { generateContentWithImage, chatWithGemini } from "./lib/gemini";

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [outputFormat, setOutputFormat] = useState("text");
  const [copySuccess, setCopySuccess] = useState(false);

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

      const response = await chatWithGemini(base64Data, outputFormat);
      // remove ```json in the begining and ``` in the end from the response
      const responseText = response.replace(/```json\n/, "").replace(/```/, "");
      setText(responseText);
      setIsLoading(false);
    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      setText("Error processing image. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
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
            {/* Output format selection */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="text-format"
                    name="output-format"
                    value="text"
                    checked={outputFormat === "text"}
                    onChange={() => setOutputFormat("text")}
                    className="mr-2"
                  />
                  <label htmlFor="text-format">Text</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="json-format"
                    name="output-format"
                    value="json"
                    checked={outputFormat === "json"}
                    onChange={() => setOutputFormat("json")}
                    className="mr-2"
                  />
                  <label htmlFor="json-format">JSON</label>
                </div>
              </div>
              <div>
                {text && (
                  <button
                    onClick={handleCopyText}
                    className={` bg-gray-200 cursor-pointer hover:bg-gray-300 text-gray-700 p-1 rounded-md transition-colors ${
                      copySuccess ? "bg-green-500 text-white" : ""
                    }`}
                    title="Copy to clipboard">
                    {copySuccess ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <textarea
                className="w-[95%] h-[300px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Text extracted from the image will appear here..."
                value={text || ""}
                onChange={(e) => setText(e.target.value)}></textarea>
            </div>
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
