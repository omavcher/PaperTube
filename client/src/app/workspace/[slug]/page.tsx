import { Metadata } from "next";
import { AgentStudioClient } from "./AgentStudioClient";

export const metadata: Metadata = {
  title: "AI Workspace | Paperxify",
  description: "Autonomous AI workspace for notes, presentations, system architecture diagrams, coding, and academic research.",
};

export default function WorkspaceSlugPage() {
  return <AgentStudioClient />;
}
