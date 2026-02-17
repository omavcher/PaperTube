import SQLArchitectClient from "@/components/tools/SQLArchitectClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQL Architect | Visual Database Schema Generator",
  description: "Visualize SQL queries instantly. Turn raw SQL code into beautiful schema diagrams and blueprints. Perfect for developers, DBAs, and students.",
  keywords: ["sql visualizer", "database schema generator", "sql diagram", "entity relationship diagram", "erd tool", "sql parser"],
  openGraph: {
    title: "SQL Architect | Neural Tools",
    description: "Turn code into blueprints. Visualize database structures instantly.",
    type: "website",
  }
};

export default function Page() {
  return <SQLArchitectClient />;
}