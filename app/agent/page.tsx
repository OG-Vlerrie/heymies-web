"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return <main className="p-6">Loading…</main>;
}
