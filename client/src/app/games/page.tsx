import GamesHubClient from "@/components/GamesHubClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Engineering Games Lab | Logic, Code & Math Puzzles",
  description: "Train your brain with engineering-focused mini-games. Master binary logic, sorting algorithms, circuit design, and SQL queries in a gamified environment.",
  keywords: ["engineering games", "coding games", "binary puzzle", "sql game", "logic puzzles", "programmer training"],
  openGraph: {
    title: "The Void Labs | Engineering Arcade",
    description: "Gamified mastery for developers and engineers.",
    type: "website",
  }
};

export default function Page() {
  return <GamesHubClient />;
}