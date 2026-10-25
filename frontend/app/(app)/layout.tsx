import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { StoreProvider } from "@/lib/store";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  );
}
