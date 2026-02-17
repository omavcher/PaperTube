import ResumeATSClient from "@/components/tools/ResumeATSClient"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker | AI Resume Scanner & Optimizer",
  description: "Check your resume score against Applicant Tracking Systems (ATS). Scan for missing keywords, formatting errors, and get instant feedback for free.",
  keywords: ["ats checker", "resume scanner", "cv optimizer", "ats resume test", "resume keyword scanner", "free resume review"],
  openGraph: {
    title: "ATS Resume Scanner | Neural Tools",
    description: "Optimize your resume for machines. Get a free ATS score and keyword report instantly.",
    type: "website",
  }
};

export default function Page() {
  return <ResumeATSClient />;
}