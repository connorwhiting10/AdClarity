import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/themes";
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
const basePath = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/legal" component={Legal} />
      <Route path="/account" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#1877F2",
          colorBackground: "#0d1117",
          borderRadius: "0.75rem",
        },
      }}
    >
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <AdminProvider>
                <Router />
              </AdminProvider>
            </AuthProvider>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </WouterRouter>
    </ClerkProvider>
  );
}

export default App;
