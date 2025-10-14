import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/session-provider";
import { auth } from "@/server/auth";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "cEDH Game Tracker",
  description: "Record and analyze competitive EDH games with rich analytics."
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider session={session}>
            <AppShell>{children}</AppShell>
            <Toaster richColors position="bottom-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
