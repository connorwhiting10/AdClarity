import { ProtectedRoute, NavBar } from "@/components/NavBar";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Users, CreditCard, Activity } from "lucide-react";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { data: dbUser, isLoading: dbUserLoading } = useGetMe({
    query: {
      enabled: isLoaded && !!user,
      queryKey: getGetMeQueryKey(),
    },
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-muted/20">
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName || "there"}.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All systems operational
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dbUser?.createdAt ? format(new Date(dbUser.createdAt), "MMM d, yyyy") : "-"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Database record created
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Free Tier</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upgrade for more features
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Database Identity</CardTitle>
              <CardDescription>Your information synced from authentication.</CardDescription>
            </CardHeader>
            <CardContent>
              {dbUserLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : dbUser ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Database ID</div>
                      <div className="font-mono bg-muted px-2 py-1 rounded text-sm w-fit">{dbUser.id}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Clerk ID</div>
                      <div className="font-mono bg-muted px-2 py-1 rounded text-sm w-fit truncate max-w-full">{dbUser.clerkUserId}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Email Address</div>
                      <div className="text-sm">{dbUser.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Created At</div>
                      <div className="text-sm">{format(new Date(dbUser.createdAt), "PPpp")}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Database record not found.</p>
                  <p className="text-sm mt-1">This usually happens if you bypassed the onboarding flow.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
