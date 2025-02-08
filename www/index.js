import {
  invert_colors,
  greyscale,
  threshold,
  edge_detection,
  pixelate,
} from "wasme";

let isInverted = false;
let isGreyscale = false;
let isThreshold = false;
let isEdges = false;
let isPixelate = false;

async function startCamera() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("output-canvas");
  const ctx = canvas.getContext("2d");

  try {
    console.log("Requesting video stream...");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    video.play();

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };

    function processFrame() {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0);
        if (isInverted) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = new Uint8Array(imageData.data.buffer);

          invert_colors(pixels);
          ctx.putImageData(imageData, 0, 0);
        } else if (isGreyscale) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = new Uint8Array(imageData.data.buffer);

          greyscale(pixels);
          ctx.putImageData(imageData, 0, 0);
        } else if (isThreshold) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = new Uint8Array(imageData.data.buffer);

          threshold(pixels, 128);
          ctx.putImageData(imageData, 0, 0);
        } else if (isEdges) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = new Uint8Array(imageData.data.buffer);

          edge_detection(pixels, canvas.width, canvas.height);
          ctx.putImageData(imageData, 0, 0);
        } else if (isPixelate) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = new Uint8Array(imageData.data.buffer);

          pixelate(pixels, canvas.width, canvas.height, 16);
          ctx.putImageData(imageData, 0, 0);
        }
      }
      requestAnimationFrame(processFrame);
    }

    video.onplay = () => {
      processFrame();
    };
  } catch (err) {
    console.error("Error accessing camera:", err);
  }
}

document.querySelectorAll('input[name="mode"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    isInverted = e.target.value === "inverted";
    isGreyscale = e.target.value === "greyscale";
    isThreshold = e.target.value === "threshold";
    isEdges = e.target.value === "edges";
    isPixelate = e.target.value === "pixelate";
  });
});

document.getElementById("start-camera").onclick = startCamera;
