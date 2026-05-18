"use client";

import { Button } from "@/components/ui/Button";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "Registration failed.");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <form className="glass-card w-full space-y-4 p-6" onSubmit={onSubmit}>
        <h1 className="text-2xl font-semibold text-cyan-300">Create account</h1>
        <input name="name" type="text" placeholder="Name" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2"
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <Button type="submit">Register</Button>
      </form>
    </main>
  );
}
