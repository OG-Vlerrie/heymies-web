import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-md p-6">Loading…</main>}>
      <LoginClient />
    </Suspense>
  );
}
