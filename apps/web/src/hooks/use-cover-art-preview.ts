"use client";

import { useEffect, useRef, useState } from "react";

export function useCoverArtPreview(initialUrl: string | null) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const previewUrlRef = useRef(previewUrl);

  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  useEffect(
    () => () => {
      if (previewUrlRef.current && previewUrlRef.current !== initialUrl) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [initialUrl],
  );

  function onFileChange(file: File) {
    setPreviewUrl((prev) => {
      if (prev && prev !== initialUrl) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function resetPreview() {
    setPreviewUrl((prev) => {
      if (prev && prev !== initialUrl) URL.revokeObjectURL(prev);
      return initialUrl;
    });
  }

  return { fileInputRef, previewUrl, onFileChange, resetPreview };
}
