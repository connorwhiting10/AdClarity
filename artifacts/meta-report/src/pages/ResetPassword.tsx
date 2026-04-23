import { useState } from "react";
import { useLocation } from "wouter";
import { Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/", { replace: true }), 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1117] p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-base text-foreground">AdClarity</span>
        </div>
        <h1 className="font-display font-bold text-[22px] text-foreground mb-4">Set a new password</h1>

        {done ? (
          <p className="text-sm text-emerald-400">Password updated. Redirecting…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-xs text-foreground/70">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password"
                     required minLength={8} value={password}
                     onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-xs text-foreground/70">Confirm</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password"
                     required minLength={8} value={confirm}
                     onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm rounded-xl py-2.5 transition-all disabled:opacity-50"
            >
              {busy ? "…" : "Update password"}
            </button>
            {error && <p className="text-xs text-red-400 text-center">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
