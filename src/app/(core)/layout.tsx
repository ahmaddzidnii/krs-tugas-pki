import { AuthProvider } from "@/contexts/auth-context";
import DashboardLayout from "./dashboard-layout";
import { requireAuth } from "@/lib/auth";
import { AlertDialogProvider } from "@/hooks/use-alert-dialog";
import { ConfirmationDialogProvider } from "@/hooks/use-confirmation-dialog";

export const dynamic = "force-dynamic";

const CoreLayout = async ({ children }: { children: React.ReactNode }) => {
  await requireAuth();
  return (
    <AuthProvider>
      <ConfirmationDialogProvider>
        <AlertDialogProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </AlertDialogProvider>
      </ConfirmationDialogProvider>
    </AuthProvider>
  );
};

export default CoreLayout;
