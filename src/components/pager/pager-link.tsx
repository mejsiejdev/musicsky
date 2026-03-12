"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function PagerLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn("font-semibold", isActive && "text-primary")}
      asChild
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}
