import Link from "next/link";
import { SectionPage } from "@/components/section-page";
import { ProjectsList } from "@/components/projects-list";

export default function ProjectsPage() {
  return (
    <SectionPage
      eyebrow="Projects"
      title="Bid projects"
      actions={<Link className="button" href="/projects/new">New project</Link>}
    >
      <ProjectsList />
    </SectionPage>
  );
}
