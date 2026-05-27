import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

type Mode = "password" | "magic";

export default function SignInForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signInWithPassword, sendMagicLink, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    if (mode === "password") {
      const { error: err } = await signInWithPassword(email, password);
      if (err) setError(err);
      else onSuccess?.();
    } else {
      const { error: err } = await sendMagicLink(email);
      if (err) setError(err);
      else setNotice("Check your inbox for a sign-in link.");
    }
    setBusy(false);
  };

  const onForgot = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await sendPasswordReset(email);
    if (err) setError(err);
    else setNotice("Password reset link sent — check your inbox.");
    setBusy(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="signin-email" className="text-xs text-foreground/70">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {mode === "password" && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="signin-password" className="text-xs text-foreground/70">Password</Label>
            <button
              type="button"
              onClick={onForgot}
              className="text-[11px] text-foreground/50 hover:text-foreground/80 underline-offset-2 hover:underline"
            >
              Forgot?
            </button>
          </div>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl py-2.5 transition-all disabled:opacity-50"
      >
        {busy ? "…" : mode === "password" ? "Sign in" : "Send magic link"}
      </button>

      <button
        type="button"
        onClick={() => { setMode(mode === "password" ? "magic" : "password"); setError(null); setNotice(null); }}
        className="w-full text-xs text-foreground/50 hover:text-foreground/80 transition-colors"
      >
        {mode === "password" ? "Use a magic link instead" : "Use password instead"}
      </button>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      {notice && <p className="text-xs text-emerald-400 text-center">{notice}</p>}
    </form>
  );
}
