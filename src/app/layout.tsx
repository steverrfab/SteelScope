import type { Metadata } from "next";
import {
  ClerkProvider,
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton
} from "@clerk/nextjs";
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
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
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
