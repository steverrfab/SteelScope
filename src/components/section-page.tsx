import { AppShell } from "@/components/app-shell";

export function SectionPage({
  title,
  eyebrow,
  actions,
  children
}: {
  title: string;
  eyebrow: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
        </div>
        {actions}
      </header>
      {children}
    </AppShell>
  );
}
