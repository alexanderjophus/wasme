// import React, { useState } from "react";
import type { FilterRowProps, ControlType } from "../Filters";

const FilterSetting = ({
  filter,
  settings,
  onUpdateSettings,
}: FilterRowProps) => {
  const renderControl = (control: ControlType) => {
    if (control.type === "range") {
      const value = (settings[control.id] as number) ?? control.default;
      return (
        <div key={control.id} className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-gray-600">{control.name}: </label>
            <span className="text-sm text-gray-500">{value}</span>
          </div>
          <input
            type="range"
            min={control.min}
            max={control.max}
            value={value}
            onChange={(e) => {
              onUpdateSettings(filter.id, {
                ...settings,
                [control.id]: Number(e.target.value),
              });
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      );
    }

    if (control.type === "checkbox") {
      const checked = (settings[control.id] as boolean) ?? control.default;
      return (
        <div key={control.id} className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={`${filter.id}-${control.id}`}
            checked={checked}
            onChange={(e) => {
              onUpdateSettings(filter.id, {
                ...settings,
                [control.id]: e.target.checked,
              });
            }}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label
            htmlFor={`${filter.id}-${control.id}`}
            className="text-sm text-gray-600 select-none"
          >
            {control.name}
          </label>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">{filter.name}</span>
        </div>
      </div>

      {filter.controls && filter.controls.length > 0 && (
        <div className="px-12 pb-4 space-y-4">
          {filter.controls.map((control) => renderControl(control))}
        </div>
      )}
    </div>
  );
};

export default FilterSetting;
