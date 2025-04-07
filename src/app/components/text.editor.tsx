"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Document from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import Image from "@tiptap/extension-image";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from 'lowlight';
import { useState, useRef } from "react";
import {
  Bold,
  Heading,
  Italic,
  List,
  ListOrdered,
  UnderlineIcon,
  Code as CodeIcon,
  Code2,
  Palette,
  Highlighter,
} from "lucide-react";

import { FontSize } from "./font-size-extension";
import FontSizeControl from "./fontsize";
import UploadButton from "./ui/button.upload";
import './code-block.css';

const lowlight = createLowlight(common);

const TextEditor = () => {
  const [headingLevel, setHeadingLevel] = useState(1);
  const [postContent, setPostContent] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const textColorPickerRef = useRef<HTMLInputElement>(null);
  const bgColorPickerRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Document,
      Paragraph,
      Text,
      Image,
      Dropcursor,
      TextStyle,
      FontSize,
      Code,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          spellcheck: 'false',
        },
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none min-h-[250px] bg-white [&_.ProseMirror]:text-black",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return null;                                                                                                                                                          
  }

  // Handle image upload
  const handleImageUpload = (uploadedFiles: { file: File; previewUrl: string }[]) => {
    if (!editor) return;

    // Update files state
    setFiles((prev) => [...prev, ...uploadedFiles.map((f) => f.file)]);

    // Insert image content
    uploadedFiles.forEach(({ previewUrl }) => {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: previewUrl, "data-temp": true },
        })
        .run();
    });
  };

  // Example upload to storage
  const uploadToStorage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { url } = await response.json();
    return url;
  };

  // Handle text color change using color extension
  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    editor?.chain().focus().setColor(color).run();
  };

  // Handle background color change using highlight extension
  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    editor?.chain().focus().toggleHighlight({ color }).run();
  };

  // Save content
  const saveContent = async () => {
    if (!editor) return;

    const content = editor.getJSON();
    
    // Check if content.content exists and is an array
    if (!content.content || !Array.isArray(content.content)) {
      console.log("Nội dung trống hoặc không hợp lệ:", content);
      setPostContent({ content: editor.getHTML(), imageUrls: [] });
      return;
    }

    // Filter and map temporary image nodes
    const images = content.content
      .filter((node) => node && node.type === "image" && node.attrs && node.attrs["data-temp"])
      .map((node) => ({
        src: node.attrs?.src || "", // If attrs undefined, use empty string
        file: files.find((f) => URL.createObjectURL(f) === node.attrs?.src),
      }));

    // Upload images and replace URLs
    const permanentUrls: string[] = [];
    for (let img of images) {
      if (img.file) {
        const permanentUrl = await uploadToStorage(img.file);
        permanentUrls.push(permanentUrl);
        
        // Update content.content with new URL
        content.content = content.content.map((node) => {
          if (
            node && 
            node.type === "image" && 
            node.attrs && 
            node.attrs.src === img.src
          ) {
            return {
              ...node,
              attrs: { ...node.attrs, src: permanentUrl, "data-temp": false },
            };
          }
          return node;
        });
      }
    }

    // Update editor content
    editor.commands.setContent(content);

    // Save content
    const postData = {
      content: editor.getHTML(),
      imageUrls: permanentUrls,
    };
    setPostContent(postData);
    console.log("Post content saved:", postData);
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="w-full p-2">
          <div className="flex space-x-2 mb-2">
            <div className="relative hover:bg-gray-100 rounded">
              <button className={`p-2 hover:bg-gray-100 rounded`}>
                <Heading className="text-black" />
              </button>
              <select
                value={headingLevel}
                onChange={(e) => {
                  const level = Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6;
                  setHeadingLevel(level);
                  editor.chain().focus().setNode("heading", { level }).run();
                }}
                className="absolute top-0 left-0 opacity-0 w-full h-full cursor-pointer hover:bg-gray-100 rounded"
              >
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>
                    Heading {level}
                  </option>
                ))}
              </select>
            </div>
            <FontSizeControl editor={editor} />
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 ${editor.isActive("bold") ? "bg-gray-300" : ""} hover:bg-gray-100 rounded`}
            >
              <Bold className="text-black" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 ${
                editor.isActive("italic") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
            >
              <Italic className="text-black" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 ${
                editor.isActive("underline") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
            >
              <UnderlineIcon className="text-black" />
            </button>
            <div className="relative">
              <button
                onClick={() => textColorPickerRef.current?.click()}
                className={`p-2 hover:bg-gray-100 rounded`}
                title="Màu chữ"
              >
                <Palette className="text-black" />
              </button>
              <input
                ref={textColorPickerRef}
                type="color"
                onChange={handleTextColorChange}
                className="absolute top-0 left-0 opacity-0 w-0 h-0"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => bgColorPickerRef.current?.click()}
                className={`p-2 hover:bg-gray-100 rounded`}
                title="Màu nền"
              >
                <Highlighter className="text-black" />
              </button>
              <input
                ref={bgColorPickerRef}
                type="color"
                onChange={handleBgColorChange}
                className="absolute top-0 left-0 opacity-0 w-0 h-0"
              />
            </div>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`p-2 ${
                editor.isActive("code") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
              title="Inline code"
            >
              <CodeIcon className="text-black" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 ${
                editor.isActive("codeBlock") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
              title="Code block"
            >
              <Code2 className="text-black" />
            </button>
            <UploadButton
              className={`p-2 hover:bg-gray-100 rounded`}
              fileType="image"
              onUpload={handleImageUpload}
              onError={(error) => console.error("Error:", error)}
            />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 ${
                editor.isActive("bulletList") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
            >
              <List className="text-black" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 ${
                editor.isActive("orderedList") ? "bg-gray-300" : ""
              } hover:bg-gray-100 rounded`}
            >
              <ListOrdered className="text-black" />
            </button>
          </div>
          <EditorContent 
            editor={editor} 
            className="border rounded-lg p-2 resize-y overflow-auto text-black" 
            style={{ minHeight: '250px' }}
          />
          <button
            onClick={saveContent}
            className="mt-2 p-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default TextEditor;