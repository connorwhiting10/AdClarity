import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [, navigate] = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // supabase-js with detectSessionInUrl:true handles the OAuth/magic-link
      // code exchange automatically. Just wait one tick, then confirm.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) {
        navigate("/", { replace: true });
      } else {
        // If no session after a small delay, send user back to home; the modal
        // will prompt them to try again.
        setTimeout(() => !cancelled && navigate("/", { replace: true }), 500);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
