import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useAuth as useClerkAuth } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/context/AdminContext";
import { AuthProvider } from "@/context/AuthContext";
import Dashboard from "@/pages/Dashboard";
import Pricing from "@/pages/Pricing";
import Legal from "@/pages/Legal";
import Account from "@/pages/Account";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#1877F2",
    colorForeground: "#f1f5f9",
    colorMutedForeground: "#94a3b8",
    colorDanger: "#ef4444",
    colorBackground: "#0f172a",
    colorInput: "#1e293b",
    colorInputForeground: "#f1f5f9",
    colorNeutral: "#334155",
    colorModalBackdrop: "rgba(0,0,0,0.75)",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
    fontSize: "15px",
    spacingUnit: "1rem",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: {
      background: "#0f172a",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "1.25rem",
      width: "420px",
      maxWidth: "100%",
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
      overflow: "hidden",
    },
    card: {
      boxShadow: "none",
      border: "none",
      background: "transparent",
      padding: "8px 8px 0",
    },
    footer: {
      boxShadow: "none",
      border: "none",
      background: "transparent",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "16px 24px",
    },
    headerTitle: {
      color: "#ffffff",
      fontWeight: "700",
      fontSize: "1.375rem",
    },
    headerSubtitle: {
      color: "#94a3b8",
      fontSize: "0.9rem",
      marginTop: "4px",
    },
    logoBox: { paddingBottom: "8px" },
    logoImage: { height: "36px" },
    main: { gap: "20px", padding: "0 8px" },
    socialButtonsBlockButton: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "0.75rem",
      height: "44px",
      color: "#f1f5f9",
      fontWeight: "500",
    },
    socialButtonsBlockButtonText: { color: "#f1f5f9", fontWeight: "500" },
    dividerRow: { margin: "4px 0" },
    dividerText: { color: "#64748b", fontSize: "0.8rem" },
    dividerLine: { background: "rgba(255,255,255,0.08)" },
    formFieldLabel: {
      color: "#cbd5e1",
      fontSize: "0.85rem",
      fontWeight: "500",
      marginBottom: "6px",
    },
    formFieldInput: {
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "0.75rem",
      color: "#f1f5f9",
      fontSize: "0.95rem",
      padding: "12px 14px",
      height: "46px",
    },
    formButtonPrimary: {
      background: "#1877F2",
      borderRadius: "0.75rem",
      height: "46px",
      fontWeight: "600",
      fontSize: "0.95rem",
      boxShadow: "0 4px 14px rgba(24,119,242,0.35)",
      marginTop: "4px",
    },
    footerActionLink: { color: "#60a5fa", fontWeight: "600" },
    footerActionText: { color: "#64748b" },
    identityPreviewEditButton: { color: "#60a5fa" },
    formFieldSuccessText: { color: "#34d399" },
    alertText: { color: "#f1f5f9" },
    alert: {
      border: "1px solid rgba(239,68,68,0.25)",
      background: "rgba(239,68,68,0.08)",
      borderRadius: "0.75rem",
    },
    otpCodeFieldInput: {
      background: "#1e293b",
      border: "1px solid #334155",
      color: "#f1f5f9",
      borderRadius: "0.75rem",
    },
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={basePath || "/"}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={basePath || "/"}
      />
    </div>
  );
}

function QueryClientCacheInvalidator() {
  const { userId } = useClerkAuth();
  const qc = useQueryClient();
  const prevIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevIdRef.current !== undefined && prevIdRef.current !== userId) {
      qc.clear();
    }
    prevIdRef.current = userId;
  }, [userId, qc]);

  return null;
}

function ProtectedAccount() {
  const [, navigate] = useLocation();
  return (
    <>
      <Show when="signed-in">
        <Account />
      </Show>
      <Show when="signed-out">
        <RedirectToHome />
      </Show>
    </>
  );
}

function RedirectToHome() {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/legal" component={Legal} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/account" component={ProtectedAccount} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your AdClarity account",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Get 3 free reports per month",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <QueryClientCacheInvalidator />
        <TooltipProvider>
          <AuthProvider>
            <AdminProvider>
              <Router />
            </AdminProvider>
          </AuthProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Auth configuration loading…</p>
      </div>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
