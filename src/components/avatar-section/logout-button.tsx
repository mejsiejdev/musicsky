"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/oauth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
      Log out
    </DropdownMenuItem>
  );
}
