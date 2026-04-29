import type { Metadata } from "next";
import {
  ClerkProvider,
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import Link from "next/link";
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
            <SignedOut>
              <Link href="/login">Sign in</Link>
<Link href="/register">Sign up</Link>

            </SignedOut>

            <SignedIn>
              <OrganizationSwitcher hidePersonal />
              <UserButton />
            </SignedIn>
          </div>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
