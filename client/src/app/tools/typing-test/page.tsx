import TypingTestClient from "@/components/tools/TypingTestClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typing Speed Test | Neural Velocity WPM Checker",
  description: "Test your typing speed and accuracy with engineering-grade precision. Real-time WPM tracking, error analysis, and sharable neural reports.",
  keywords: ["typing speed test", "wpm test", "typing accuracy", "keyboard test", "programmer typing test", "neural velocity"],
  openGraph: {
    title: "Neural Velocity | Typing Benchmark",
    description: "Measure your synaptic throughput. Real-time WPM and Accuracy analysis.",
    type: "website",
  }
};

export default function Page() {
  return <TypingTestClient />;
}