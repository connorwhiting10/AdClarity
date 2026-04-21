import { SignInButton, SignUpButton } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="Logo" className="h-8 w-8" />
            <span className="font-semibold tracking-tight text-lg">SaaS Starter</span>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Get Started</Button>
            </SignUpButton>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center items-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground max-w-3xl mb-6">
            The foundation for your next great idea.
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            A precise, beautifully engineered SaaS starter. Auth, API, Database, and UI components configured for speed and scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <SignUpButton mode="modal">
              <Button size="lg" className="h-12 px-8 text-base">
                Start Building Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignUpButton>
          </div>
        </section>

        <section className="bg-muted/50 py-24 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Auth by Clerk</h3>
                <p className="text-muted-foreground">Complete authentication flow with beautiful modals, session management, and proper routing.</p>
              </div>
              <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Modern Stack</h3>
                <p className="text-muted-foreground">React, Vite, Tailwind CSS, and shadcn/ui. Type-safe API client generated from OpenAPI.</p>
              </div>
              <div className="bg-background p-6 rounded-xl border border-border shadow-sm">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Production Ready</h3>
                <p className="text-muted-foreground">Proper environment variables, proxy setup, and structured routing right out of the box.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>Built with precision.</p>
      </footer>
    </div>
  );
}
