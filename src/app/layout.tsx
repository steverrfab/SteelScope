import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SteelScope",
  description: "Structural steel and miscellaneous metals takeoff and estimating."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
