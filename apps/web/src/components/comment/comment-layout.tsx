import type { ReactNode } from "react";

export function CommentLayout({
  showThreadLine,
  avatar,
  children,
}: {
  showThreadLine?: boolean;
  avatar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-row gap-4">
      <div className="flex flex-col items-center">
        {avatar}
        {showThreadLine && <div className="w-0.5 h-full bg-primary" />}
      </div>
      <div className="flex flex-col gap-1 pb-2 flex-1 min-w-0">{children}</div>
    </div>
  );
}
