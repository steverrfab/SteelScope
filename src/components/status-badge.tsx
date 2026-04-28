import { clsx } from "clsx";

type Tone = "ok" | "review" | "danger";

export function StatusBadge({
  children,
  tone = "ok"
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return <span className={clsx("status", tone)}>{children}</span>;
}
