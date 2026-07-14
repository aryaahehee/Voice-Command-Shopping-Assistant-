import { AuthProvider } from "@/context/auth-context";
import { ShoppingProvider } from "@/context/shopping-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ShoppingProvider>
        {children}
      </ShoppingProvider>
    </AuthProvider>
  );
}
