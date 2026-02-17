import SyllabusTrackerClient from "@/components/tools/SyllabusTrackerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GATE CSE 2027 Syllabus Tracker | Exam Prep Dashboard",
  description: "Track your GATE CSE 2027 preparation progress. Interactive syllabus checklist, topic-wise tracking, and cloud sync for engineering students.",
  keywords: ["gate cse syllabus", "syllabus tracker", "exam preparation", "engineering tools", "gate 2027 checklist", "study progress tracker"],
  openGraph: {
    title: "GATE CSE Syllabus Tracker | Neural Tools",
    description: "Master your exam prep. Track topics, visualize progress, and sync across devices.",
    type: "website",
  }
};

export default function Page() {
  return <SyllabusTrackerClient />;
}