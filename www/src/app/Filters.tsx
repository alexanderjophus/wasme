"use client";

import {
  threshold,
  gaussian_blur,
  edge_detection,
  invert_colors,
  pixelate,
  emboss,
  greyscale,
  emboss_grayscale,
  colorize,
  gaussian_noise,
  sepia,
} from "wasme";

export type ControlType = {
  id: string;
  name: string;
} & (
  | {
      type: "range";
      min: number;
      max: number;
      default: number;
    }
  | {
      type: "checkbox";
      default: boolean;
    }
);

export interface Filter {
  id: string;
  name: string;
  controls: ControlType[];
  processor?: (
    imageData: Uint8Array,
    width: number,
    height: number,
    settings: { [key: string]: number },
  ) => void;
}

export type FilterSettings = {
  [key: string]: number | boolean;
};

export interface FilterRowProps {
  filter: Filter;
  settings: FilterSettings;
  onUpdateSettings: (filterId: string, settings: FilterSettings) => void;
}

export const VIDEO_MODES: Filter[] = [
  {
    id: "inverted",
    name: "Inverted",
    controls: [],
    processor: (imageData) => {
      invert_colors(imageData);
    },
  },
  {
    id: "greyscale",
    name: "Greyscale",
    controls: [],
    processor: (imageData) => {
      greyscale(imageData);
    },
  },
  {
    id: "blur",
    name: "Gaussian Blur",
    controls: [
      {
        id: "kernelSize",
        name: "Kernel Size",
        type: "range",
        min: 1,
        max: 10,
        default: 3,
      },
    ],
    processor: (imageData, width, height, settings) => {
      gaussian_blur(imageData, width, height, settings.kernelSize);
    },
  },
  {
    id: "noise",
    name: "Gaussian Noise",
    controls: [
      {
        id: "std_dev",
        name: "Standard Deviation",
        type: "range",
        min: 0,
        max: 100,
        default: 25,
      },
    ],
    processor: (imageData, _w, _h, settings) => {
      gaussian_noise(imageData, settings.std_dev);
    },
  },
  {
    id: "threshold",
    name: "Threshold",
    controls: [
      {
        id: "threshold",
        name: "Threshold Level",
        type: "range",
        min: 0,
        max: 255,
        default: 128,
      },
    ],
    processor: (imageData, _w, _h, settings) => {
      threshold(imageData, settings.threshold);
    },
  },
  {
    id: "pixelate",
    name: "Pixelate",
    controls: [
      {
        id: "blockSize",
        name: "Block Size",
        type: "range",
        min: 1,
        max: 100,
        default: 10,
      },
    ],
    processor: (imageData, width, height, settings) => {
      pixelate(imageData, width, height, settings.blockSize);
    },
  },
  {
    id: "edge",
    name: "Edge Detection",
    controls: [
      {
        id: "kernelSize",
        name: "Kernel Size",
        type: "range",
        min: 1,
        max: 10,
        default: 3,
      },
    ],
    processor: (imageData, width, height, settings) => {
      edge_detection(imageData, width, height, settings.kernelSize);
    },
  },
  {
    id: "emboss",
    name: "Emboss",
    controls: [
      {
        id: "horizontal",
        name: "Horizontal",
        type: "checkbox",
        default: false,
      },
    ],
    processor: (imageData, width, height, settings) => {
      emboss(imageData, width, height, settings.horizontal === 1);
    },
  },
  {
    id: "emboss_greyscale",
    name: "Emboss Greyscale",
    controls: [
      {
        id: "horizontal",
        name: "Horizontal",
        type: "checkbox",
        default: false,
      },
    ],
    processor: (imageData, width, height, settings) => {
      emboss_grayscale(imageData, width, height, settings.horizontal === 1);
    },
  },
  {
    id: "colorize",
    name: "Colorize",
    controls: [
      {
        id: "r",
        name: "Red",
        type: "range",
        min: 0,
        max: 255,
        default: 0,
      },
      {
        id: "g",
        name: "Green",
        type: "range",
        min: 0,
        max: 255,
        default: 0,
      },
      {
        id: "b",
        name: "Blue",
        type: "range",
        min: 0,
        max: 255,
        default: 0,
      },
    ],
    processor: (imageData, _w, _h, settings) => {
      colorize(imageData, settings.r, settings.g, settings.b);
    },
  },
  {
    id: "sepia",
    name: "Sepia",
    controls: [],
    processor: (imageData) => {
      sepia(imageData);
    },
  },
];
