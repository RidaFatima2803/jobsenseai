"use client";

import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={() => router.push("/")}
      className="flex items-center gap-2"
    >
      <Home className="h-4 w-4" />
      Home
    </Button>
  );
}
