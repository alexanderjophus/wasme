"use client";

import { Camera, CameraOff, Settings, Sliders } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import init, {
  flip,
} from "wasme";
import { ModeSettings, VIDEO_MODES } from "../Filters";

const WebcamFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [modeSettings, setModeSettings] = useState<ModeSettings>({});

  // Initialize default settings for each mode
  useEffect(() => {
    init();
    const defaults: ModeSettings = {};
    VIDEO_MODES.forEach((mode) => {
      defaults[mode.id] = {};
      mode.controls.forEach((control) => {
        defaults[mode.id][control.id] = control.default;
      });
    });
    setModeSettings(defaults);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.videoWidth && video.videoHeight) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const currentMode = VIDEO_MODES.find(
          (mode) => mode.id === selectedMode,
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = new Uint8Array(imageData.data.buffer);
        flip(pixels, canvas.width, canvas.height);

        if (currentMode?.processor) {
          currentMode.processor(
            pixels,
            canvas.width,
            canvas.height,
            modeSettings[selectedMode],
          );
        }
        ctx.putImageData(imageData, 0, 0);
      }

      animationRef.current = requestAnimationFrame(processFrame);
    };

    animationRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedMode, modeSettings, VIDEO_MODES]);

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

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  const handleModeChange = (modeId: string) => setSelectedMode(modeId);

  const handleSettingChange = (controlId: string, value: string) => {
    setModeSettings((prev) => ({
      ...prev,
      [selectedMode]: {
        ...prev[selectedMode],
        [controlId]: Number(value),
      },
    }));
  };

  const currentMode = VIDEO_MODES.find((mode) => mode.id === selectedMode);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Webcam Feed</h2>
          <button
            onClick={isStreaming ? stopStream : startStream}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
              isStreaming
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Settings size={20} />
            Video Mode
          </button>
          {/* Settings Panel */}
          {isStreaming && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Mode Controls */}
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {VIDEO_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        selectedMode === mode.id
                          ? "bg-blue-500 text-white"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Mode Settings */}
              {currentMode && currentMode.controls.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sliders size={20} />
                    <h3 className="text-lg font-medium">Mode Settings</h3>
                  </div>
                  <div className="space-y-4">
                    {currentMode.controls.map((control) => (
                      <div key={control.id} className="space-y-2">
                        <div className="flex justify-between">
                          <label
                            htmlFor={control.id}
                            className="text-sm font-medium"
                          >
                            {control.name}
                          </label>
                          {": "}
                          <span className="text-sm text-gray-500">
                            {modeSettings[selectedMode]?.[control.id]}
                          </span>
                        </div>
                        {control.type === "range" && (
                          <input
                            type="range"
                            id={control.id}
                            min={control.min}
                            max={control.max}
                            value={modeSettings[selectedMode]?.[control.id]}
                            onChange={(e) =>
                              handleSettingChange(control.id, e.target.value)
                            }
                          />
                        )}
                        {control.type === "checkbox" && (
                          <input
                            type="checkbox"
                            id={control.id}
                            checked={modeSettings[selectedMode]?.[control.id]}
                            onChange={(e) =>
                              handleSettingChange(
                                control.id,
                                e.target.checked ? "1" : "0",
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center">
              {!error && (
                <div className="text-gray-500">{"Camera is turned off"}</div>
              )}

              {error && (
                <div className="text-red-500 px-4 text-center">{error}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebcamFeed;
