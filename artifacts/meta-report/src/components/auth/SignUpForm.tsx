import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

export default function SignUpForm({ onSuccess }: { onSuccess?: () => void }) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error: err, needsEmailConfirmation } = await signUp(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (needsEmailConfirmation) {
      setNotice("Check your email to confirm your account.");
      return;
    }
    onSuccess?.();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="signup-email" className="text-xs text-foreground/70">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password" className="text-xs text-foreground/70">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-[11px] text-foreground/40">At least 8 characters.</p>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl py-2.5 transition-all disabled:opacity-50"
      >
        {busy ? "…" : "Create account"}
      </button>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
      {notice && <p className="text-xs text-emerald-400 text-center">{notice}</p>}
    </form>
  );
}
