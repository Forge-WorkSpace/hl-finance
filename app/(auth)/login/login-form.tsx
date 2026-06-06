"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F4F6] grid place-items-center p-6">
      <div className="w-full max-w-sm animate-[fadeUp_320ms_cubic-bezier(0.2,0.7,0.2,1)]">
        <div className="rounded-2xl border border-[#EFEFEF] bg-white p-8 shadow-xl">
          <div className="mb-8 flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]">
              HL
            </div>
            <h1 className="mt-4 text-center text-[22px] font-semibold text-[var(--text-primary)]">
              HL Finance
            </h1>
            <p className="mt-1 text-center text-sm text-gray-400">Management Portal</p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)]"
              >
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                disabled={isPending}
                placeholder="nama@perusahaan.id"
                className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium tracking-wide text-[var(--text-secondary)]"
              >
                PASSWORD
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 pr-10 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isPending}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] disabled:opacity-60"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {state.error ? (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] px-3 py-2.5 text-sm text-[var(--danger)] animate-[fadeUp_180ms_ease-out]"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{state.error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[var(--text-tertiary)]">
          © 2026 HL Finance · Internal use only
        </p>
      </div>
    </div>
  );
}
