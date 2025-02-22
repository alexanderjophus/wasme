import FilterTable from "./components/FilterTable";
import { VIDEO_MODES } from "./Filters";
import React, { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedModes, setSelectedModes] = useState([VIDEO_MODES[0]]);
  const [selectedMode, setSelectedMode] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");

  const addVideoMode = () => {
    const modeToAdd = VIDEO_MODES.find(
      (mode) => mode.id.toString() === selectedMode,
    );
    if (modeToAdd && !selectedModes.some((mode) => mode.id === modeToAdd.id)) {
      setSelectedModes([...selectedModes, modeToAdd]);
      setSelectedMode("");
    }
  };

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError("");
      }
    } catch (err) {
      setError(
        "Failed to access webcam. Please ensure you have granted camera permissions.",
      );
      console.error("Error accessing webcam:", err);
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold">WASME</h1>
      <div className="w-full max-w-2xl mx-auto p-4 flex rounded-lg">
        <p className="text-lg text-gray-600 mb-6">WebAssembly Video Effects</p>
        <button
          onClick={isStreaming ? stopStream : startStream}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isStreaming ? "Stop Stream" : "Start Stream"}
        </button>
      </div>
      <div className="w-full max-w-2xl mb-6 flex gap-2">
        <select
          value={selectedMode}
          onChange={(e) => setSelectedMode(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a video filter...</option>
          {VIDEO_MODES.map((mode) => (
            <option
              key={mode.id}
              value={mode.id}
              disabled={selectedModes.some((m) => m.id === mode.id)}
            >
              {mode.name}
            </option>
          ))}
        </select>
        <button
          onClick={addVideoMode}
          disabled={!selectedMode}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          Mode
        </button>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-h-48 rounded-lg"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
      <FilterTable
        filters={selectedModes}
        onFiltersChange={setSelectedModes}
        prevVideoRef={videoRef.current}
      />
    </div>
  );
}
