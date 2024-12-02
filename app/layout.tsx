import { AuthProvider } from "@/components/auth-provider";
import { SessionProvider } from "@/components/session-provider";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SessionProvider>
            <NavBar />
            <main>{children}</main>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
