import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import FilterSetting from "./FilterSetting";
import { VIDEO_MODES } from "../Filters";
import type { Filter, FilterSettings } from "../Filters";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import init from "wasme";

const FilterTable = ({
  filters,
  onFiltersChange,
  prevVideoRef,
}: {
  filters: Filter[];
  onFiltersChange: (newFilters: Filter[]) => void;
  prevVideoRef: HTMLVideoElement | null;
}) => {
  init();
  const [filterSettings, setFilterSettings] = useState<{
    [key: string]: FilterSettings;
  }>(
    Object.fromEntries(
      VIDEO_MODES.map((mode) => [
        mode.id,
        Object.fromEntries(
          mode.controls.map((control) => [control.id, control.default]),
        ),
      ]),
    ),
  );

  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const updateSettings = (filterId: string, settings: FilterSettings) => {
    setFilterSettings((prev) => ({
      ...prev,
      [filterId]: settings,
    }));
  };

  // Function to apply filter to video frame
  const applyFilter = (
    sourceVideo: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    filter: Filter,
    settings: FilterSettings,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video size while maintaining aspect ratio
    const videoAspect = sourceVideo.videoWidth / sourceVideo.videoHeight;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth / videoAspect;

    // Draw the current frame
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = new Uint8Array(imageData.data.buffer);

    // Apply the filter's processing function with current settings
    if (filter.processor) {
      const numericSettings = Object.fromEntries(
        Object.entries(settings).filter(
          ([_, value]) => typeof value === "number",
        ),
      ) as { [key: string]: number };

      filter.processor(pixels, canvas.width, canvas.height, numericSettings);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  // Set up animation loop for each canvas
  useEffect(() => {
    let animationFrames: number[] = [];

    filters.forEach((filter, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;

      // Determine video source (previous canvas or prevVideoRef for first row)
      const sourceVideo =
        index === 0 ? prevVideoRef : videoRefs.current[index - 1];
      if (!sourceVideo) return;

      const videoEl = videoRefs.current[index];
      if (videoEl) {
        connectCanvasToVideo(canvas, videoEl);
      }

      const animate = () => {
        if (sourceVideo.readyState >= 2) {
          applyFilter(sourceVideo, canvas, filter, filterSettings[filter.id]);
        }
        animationFrames[index] = requestAnimationFrame(animate);
      };

      animate();
    });

    return () => {
      animationFrames.forEach((frame) => cancelAnimationFrame(frame));

      videoRefs.current.forEach((video) => {
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });
    };
  }, [filters, filterSettings, prevVideoRef]);

  const connectCanvasToVideo = (
    canvasEl: HTMLCanvasElement,
    videoEl: HTMLVideoElement,
  ) => {
    try {
      const stream = canvasEl.captureStream(30); // 30 FPS
      videoEl.srcObject = stream;
      videoEl.play().catch((err) => console.error("Error playing video:", err));
    } catch (err) {
      console.error("Error capturing canvas stream:", err);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(filters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onFiltersChange(items);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex border rounded-lg">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="list">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              className="flex-1 flex flex-col gap-2"
              {...provided.droppableProps}
            >
              {filters.map((filter, index) => (
                <Draggable
                  key={filter.id}
                  draggableId={filter.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                      }}
                      className="p-2 border rounded-lg mb-2 flex flex-row items-center gap-4"
                    >
                      <FilterSetting
                        key={filter.id}
                        filter={filter}
                        settings={filterSettings[filter.id]}
                        onUpdateSettings={updateSettings}
                      />
                      <canvas
                        ref={(el) => {
                          if (canvasRefs.current) {
                            canvasRefs.current[index] = el;
                          }
                        }}
                        className="w-64 rounded-lg"
                        style={{ transform: "scaleX(-1)" }}
                      />
                      <video
                        ref={(el) => {
                          if (videoRefs.current) {
                            videoRefs.current[index] = el;
                          }
                        }}
                        style={{ display: "none" }}
                        autoPlay
                        playsInline
                        muted
                      />
                      <button
                        onClick={() =>
                          onFiltersChange(
                            filters.filter((f) => f.id !== filter.id),
                          )
                        }
                        className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default FilterTable;
