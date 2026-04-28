import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";

const activeProjects = [
  {
    name: "North Clinic Expansion",
    bidDate: "2026-05-14",
    pages: 1184,
    pending: 42,
    risk: "AESS and delegated stair design"
  },
  {
    name: "Logistics Dock Addition",
    bidDate: "2026-05-22",
    pages: 436,
    pending: 17,
    risk: "Bollards shown on civil only"
  }
];

export default function DashboardPage() {
  return (
    <AppShell>
      <header className="page-header">
        <div>
          <div className="eyebrow">Bid command center</div>
          <h1>Steel takeoff and estimating</h1>
        </div>
        <Link className="button" href="/projects/new">
          New project
        </Link>
      </header>

      <section className="grid grid-3">
        <div className="card metric">
          Active bids
          <strong>12</strong>
        </div>
        <div className="card metric">
          Pages processing
          <strong>2,841</strong>
        </div>
        <div className="card metric">
          Review flags
          <strong>86</strong>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Estimator review queue</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Bid date</th>
              <th>Pages</th>
              <th>Needs review</th>
              <th>Risk signal</th>
            </tr>
          </thead>
          <tbody>
            {activeProjects.map((project) => (
              <tr key={project.name}>
                <td>
                  <Link href="/projects">{project.name}</Link>
                </td>
                <td>{project.bidDate}</td>
                <td>{project.pages.toLocaleString()}</td>
                <td>
                  <StatusBadge tone="review">{project.pending} items</StatusBadge>
                </td>
                <td>{project.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
