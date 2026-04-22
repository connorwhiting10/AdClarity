import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Activity, User, Mail, Calendar, LogOut, ChevronLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/context/AdminContext";
import { useAuth } from "@/context/AuthContext";

export default function Account() {
  const { user, isLoaded, isLoggedIn, logout } = useAuth();
  const [, navigate] = useLocation();
  const { isAdmin } = useAdmin();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    navigate("/");
    return null;
  }

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
    : user.email?.split("@")[0] ?? "User";

  const email = user.email ?? "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_-3px_rgba(24,119,242,0.5)]">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">AdClarity</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl font-display font-bold mb-2">Your Account</h2>
          <p className="text-muted-foreground mb-10">Manage your profile and account settings.</p>

          <div className="space-y-4 max-w-xl">
            <div className="rounded-2xl border border-white/8 bg-card p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">{displayName}</p>
                  <p className="text-sm text-muted-foreground">Free plan</p>
                </div>
              </div>

              <div className="space-y-4">
                {email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted/20 border border-white/5 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email address</p>
                      <p className="font-medium text-foreground">{email}</p>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Role</p>
                      <p className="font-medium text-violet-400">Admin · Pro</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-card p-4 space-y-1">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all text-left"
              >
                <Activity className="w-4 h-4" />
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all text-left"
              >
                <Shield className="w-4 h-4" />
                View Plans
              </button>
            </div>

            <Button
              variant="outline"
              className="w-full border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/5 hover:border-red-500/30"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
