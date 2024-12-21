"use client";

import { useState } from "react";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.imageUrl) {
        const img = new Image();
        img.onload = () => {
          setImageUrl(data.imageUrl);
        };
        img.src = data.imageUrl;
      }

      setInputText("");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Header */}
      <header className="text-center py-6 bg-black bg-opacity-50">
        <h1 className="text-4xl md:text-6xl font-bold">Zap Studio</h1>
        <p className="text-lg md:text-2xl text-gray-400 mt-2">
          Transform your imagination into reality with Z-AI.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center">
            <div className="loader mb-4"></div>
            <p className="text-gray-400">Generating your image...</p>
          </div>
        )}

        {imageUrl && (
          <div className="w-full max-w-2xl rounded-lg overflow-hidden shadow-lg mt-4">
            <img
              src={imageUrl}
              alt="Generated artwork"
              className="w-full h-auto object-contain"
            />
          </div>
        )}
      </main>

      {/* Footer / Form */}
      <footer className="bg-gray-800 w-full py-6 flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl flex flex-col md:flex-row gap-4"
        >
          <input
            id="imageDescription"
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="flex-1 p-4 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 text-white"
            placeholder="Describe the image you want to generate..."
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate"}
          </button>
        </form>
      </footer>
    </div>
  );
}
