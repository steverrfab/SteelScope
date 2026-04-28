import { SectionPage } from "@/components/section-page";
import { ProjectSearchPanel } from "@/components/project-search-panel";

export default function SearchPage() {
  return (
    <SectionPage eyebrow="Search" title="Full project search">
      <ProjectSearchPanel />
    </SectionPage>
  );
}
