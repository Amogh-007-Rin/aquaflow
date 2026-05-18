"use client";

import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form className="glass-card w-full space-y-4 p-6" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold text-cyan-300">Login to Aquaflow</h1>
        <input name="email" type="email" required placeholder="Email" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <div className="flex items-center gap-2">
          <Button type="submit">Sign in</Button>
          <Button type="button" variant="ghost" onClick={() => signIn("google")}>
            Continue with Google
          </Button>
        </div>
      </form>
    </main>
  );
}
