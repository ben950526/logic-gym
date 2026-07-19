"use client";

import { useState, useTransition } from "react";
import { signIn, signUp } from "@/app/login/actions";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  next: string;
  defaultMode: "signin" | "signup";
}

export function LoginForm({ next, defaultMode }: LoginFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    formData.set("next", next);

    startTransition(async () => {
      const result =
        mode === "signin" ? await signIn(formData) : await signUp(formData);

      if (!result) return;
      if ("error" in result && result.error) {
        setError(result.error);
      } else if ("message" in result && result.message) {
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-zinc-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium",
            mode === "signin" ? "bg-blue-600 text-white" : "text-zinc-600"
          )}
        >
          登入
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-sm font-medium",
            mode === "signup" ? "bg-blue-600 text-white" : "text-zinc-600"
          )}
        >
          註冊
        </button>
      </div>

      <form action={handleSubmit} className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {mode === "signup" && (
          <label className="block space-y-2 text-sm">
            <span className="font-medium">暱稱</span>
            <input
              name="nickname"
              type="text"
              required
              minLength={2}
              maxLength={20}
              placeholder="排行榜只顯示暱稱"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </label>
        )}

        <label className="block space-y-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>

        <label className="block space-y-2 text-sm">
          <span className="font-medium">密碼</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "處理中…" : mode === "signin" ? "登入" : "建立帳號"}
        </button>
      </form>
    </div>
  );
}
