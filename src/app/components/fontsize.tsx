"use client";

import { useEditor } from "@tiptap/react";
import { useState } from "react";
import { Type } from "lucide-react";

interface FontSizeProps {
  editor: ReturnType<typeof useEditor>;
}

const FONT_SIZES = [
  { label: "Tiny", value: "8px" },
  { label: "Small", value: "12px" },
  { label: "Normal", value: "14px" },
  { label: "Medium", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "Extra Large", value: "24px" },
  { label: "Huge", value: "32px" },
  { label: "Gigantic", value: "40px" },
  { label: "Massive", value: "64px" },
  { label: "Huge", value: "128px" },
];

const FontSize = ({ editor }: FontSizeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSize, setCurrentSize] = useState("16px");

  if (!editor) {
    return null;
  }

  // Handle font size
  const handleFontSizeChange = (size: string) => {
    setCurrentSize(size);
    editor.chain().focus().setFontSize(size).run();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded"
        title="Font Size"
      >
        <Type className="text-black" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
          {FONT_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => {
                handleFontSizeChange(size.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                currentSize === size.value ? "bg-gray-100" : ""
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSize;
