import type { Metadata } from "next";
import { ClerkProvider, OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "SteelScope",
  description: "Structural steel and miscellaneous metals takeoff and estimating."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="auth-bar">
            <OrganizationSwitcher hidePersonal />
            <UserButton />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
