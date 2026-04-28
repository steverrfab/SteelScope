import { SectionPage } from "@/components/section-page";
import { ProjectCreateForm } from "@/components/project-create-form";

export default function NewProjectPage() {
  return (
    <SectionPage eyebrow="Projects" title="Create project">
      <section className="panel">
        <ProjectCreateForm />
      </section>
    </SectionPage>
  );
}
