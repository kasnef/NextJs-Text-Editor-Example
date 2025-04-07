"use client";

import { useEffect, useState } from "react";
import { Image } from "lucide-react";

interface UploadButtonProps {
  className?: string;
  multiple?: boolean;
  fileType?: "image";
  accept?: string;
  onUpload?: (files: { file: File; previewUrl: string }[]) => void;
  onRemove?: (file: File) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
  onCancel?: () => void;
}

export default function UploadButton({
  className,
  multiple = false,
  fileType = "image",
  accept = multiple ? "image/*" : "image/*",
  onUpload,
  onRemove,
  onError,
  onProgress,
  onCancel,
}: UploadButtonProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files; // Get the selected files from the input

    if (!selectedFiles || selectedFiles.length === 0) return; // If no files are selected, return

    try {
      // check the file limit
      if (!multiple && selectedFiles.length > 1) {
        setError("File limit exceeded");
        return;
      }

      // check the file type
      const newFiles = Array.from(selectedFiles);
      // filter the invalid files
      const invalidFiles = newFiles.filter((file) => {
        if (fileType === "image") {
          return (
            !file.type.startsWith("image/") &&
            ![".jpg", ".jpeg", ".png", ".webp", ".gif"].some((ext) =>
              file.name.endsWith(ext)
            )
          );
        }
        return false;
      });

      if (invalidFiles.length > 0) {
        setError("Invalid file type");
        return;
      }

      // create the preview url
      const filesWithPreview = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      // update the files state
      setFiles((prevFiles) =>
        multiple ? [...prevFiles, ...newFiles] : [newFiles[0]]
      );

      // call the onUpload callback 
      if (onUpload) onUpload(filesWithPreview);

      setError(null);
    } catch (error) {
      setError("Upload failed");
      if (onError) onError(error as Error);
    }
  };

  // remove the file
  const handleRemove = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    if (onRemove) onRemove(fileToRemove);
  };

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  return (
    <div className={`${className} relative`}>
      <label className="cursor-pointer flex items-center gap-2">
        <Image className="w-6 h-6 text-black" />
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
}
