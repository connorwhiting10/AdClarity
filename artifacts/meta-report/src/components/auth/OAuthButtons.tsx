import { useState } from "react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function OAuthButtons() {
  const { signInWithOAuth } = useAuth();
  const [busy, setBusy] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onClick = async (provider: "google" | "facebook") => {
    setBusy(provider);
    setError(null);
    const { error: err } = await signInWithOAuth(provider);
    if (err) {
      setError(err);
      setBusy(null);
    }
    // On success the browser redirects; no further state needed.
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onClick("google")}
        disabled={!!busy}
        className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-medium text-sm rounded-xl py-2.5 transition-all disabled:opacity-50"
      >
        <FaGoogle className="w-4 h-4" />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => onClick("facebook")}
        disabled={!!busy}
        className="w-full flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-foreground font-medium text-sm rounded-xl py-2.5 transition-all disabled:opacity-50"
      >
        <FaFacebook className="w-4 h-4" />
        Continue with Facebook
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
