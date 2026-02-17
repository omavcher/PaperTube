import LogicLabClient from "@/components/tools/LogicLabClient"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logic Gate Simulator & Boolean Algebra Solver | Truth Table Generator",
  description: "Free online Logic Gate Lab. Input boolean expressions to generate instant truth tables. Supports AND, OR, NOT, XOR, NAND gates for digital logic design.",
  keywords: ["logic gate simulator", "truth table generator", "boolean algebra solver", "digital logic design", "engineering tools"],
  openGraph: {
    title: "Logic Gate Lab | Neural Tools",
    description: "Visualize boolean logic instantly. Generate truth tables for complex expressions.",
    type: "website",
  }
};

export default function Page() {
  return <LogicLabClient />;
}