"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="login-form">
      {!configured && (
        <div className="editor-note">
          Secure access needs configuration. Run{" "}
          <code>npm run admin:setup</code> locally and follow the README.
        </div>
      )}
      <label className="field">
        <span>Email address</span>
        <input
          name="email"
          autoComplete="username"
          type="email"
          required
          placeholder="Your administrator email"
        />
      </label>
      <label className="field">
        <span>Password</span>
        <div className="password-input">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            maxLength={128}
            required
            placeholder="Your password"
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" disabled={busy || !configured}>
        {busy ? (
          <>
            <LoaderCircle size={18} className="spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in securely
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="login-help">
        <LockKeyhole size={15} />
        Access is configured privately by your website administrator.
      </p>
    </form>
  );
}
