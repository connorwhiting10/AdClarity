import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useUpsertMe } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/NavBar";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, isLoaded } = useUser();
  const upsertMe = useUpsertMe();
  const processedRef = useRef(false);

  useEffect(() => {
    if (isLoaded && user && !processedRef.current) {
      processedRef.current = true;
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        upsertMe.mutate(
          { data: { email } },
          {
            onSettled: () => {
              // Redirect whether it succeeded or failed (e.g. already exists)
              setLocation("/dashboard");
            },
          }
        );
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isLoaded, user, upsertMe, setLocation]);

  return (
    <ProtectedRoute>
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Setting up your account</h1>
          <p className="text-muted-foreground">Please wait while we prepare your workspace...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
