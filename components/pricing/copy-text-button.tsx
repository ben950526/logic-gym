"use client";

import { useState } from "react";

interface CopyTextButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyTextButton({
  text,
  label = "複製",
  className,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback ignored */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className ?? "membership-copy-btn"}
    >
      {copied ? "已複製 ✓" : label}
    </button>
  );
}
