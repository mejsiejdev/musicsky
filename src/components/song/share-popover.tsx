"use client";

import { Share2Icon, CopyIcon, CheckIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SharePopover({ shareUrl }: { shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Share2Icon
          size={18}
          className="cursor-pointer"
          role="button"
          aria-label="Share song"
        />
      </PopoverTrigger>
      <PopoverContent side="top" className="w-80 p-3">
        <div className="flex flex-row gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-md border px-3 py-1.5 text-sm bg-muted"
          />
          <Button onClick={handleCopy} variant="outline" size="icon">
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
