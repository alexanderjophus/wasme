import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FilterSetting from "./FilterSetting";
import type { Filter, FilterSettings } from "../Filters";

const meta: Meta<typeof FilterSetting> = {
  title: "Components/FilterSetting",
  component: FilterSetting,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      // Create state management wrapper
      const [filter, setFilter] = useState<Filter>(context.args.filter);
      const [settings, setSettings] = useState<FilterSettings>(
        context.args.settings,
      );

      const handleSettings = (id: string, newSettings: FilterSettings) => {
        setSettings(newSettings);
      };

      return (
        <div className="w-96 border rounded-lg">
          <Story
            args={{
              ...context.args,
              filter,
              settings,
              onUpdateSettings: handleSettings,
            }}
          />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof FilterSetting>;

export const Basic: Story = {
  args: {
    filter: {
      id: "greyscale",
      name: "Greyscale",
      controls: [],
    },
    settings: {},
    onUpdateSettings: () => {},
  },
};

export const RangeControl: Story = {
  args: {
    filter: {
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
    },
    settings: {
      kernelSize: 3,
    },
    onUpdateSettings: () => {},
  },
};

export const CheckboxControl: Story = {
  args: {
    filter: {
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
    },
    settings: {
      horizontal: false,
    },
    onUpdateSettings: () => {},
  },
};

export const MultipleControls: Story = {
  args: {
    filter: {
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
    },
    settings: {
      r: 128,
      g: 64,
      b: 192,
    },
    onUpdateSettings: () => {},
  },
};
