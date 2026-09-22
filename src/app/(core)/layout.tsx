import { AuthProvider } from "@/contexts/auth-context";
import DashboardLayout from "./dashboard-layout";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const CoreLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return (
    <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthProvider>
  );
};

export default CoreLayout;
