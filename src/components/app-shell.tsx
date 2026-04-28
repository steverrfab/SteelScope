import Link from "next/link";

const nav = [
  ["Dashboard", "/"],
  ["Projects", "/projects"],
  ["Upload Center", "/upload-center"],
  ["Document Viewer", "/document-viewer"],
  ["Drawing Viewer", "/drawing-viewer"],
  ["Search", "/search"],
  ["Takeoff", "/takeoff"],
  ["Estimate", "/estimate"],
  ["Scope Review", "/scope-review"],
  ["Addenda", "/addenda"],
  ["Reports", "/reports"],
  ["Pricing Database", "/pricing-database"],
  ["Settings", "/settings"]
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">SteelScope</div>
        <nav className="nav" aria-label="Primary">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
