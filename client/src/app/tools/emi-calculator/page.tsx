import EmiCalculatorClient from "@/components/tools/EmiCalculatorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMI Calculator | Home, Car & Personal Loan Planner",
  description: "Calculate your monthly EMI instantly. Plan your home, car, or personal loan with our free EMI calculator. View interest breakdowns and amortization schedules.",
  keywords: ["emi calculator", "loan calculator", "home loan emi", "car loan calculator", "interest rate calculator", "financial planning tool"],
  openGraph: {
    title: "Universal EMI Lab | Neural Tools",
    description: "Visualize your loan repayment instantly. Smart, accurate, and free.",
    type: "website",
  }
};

export default function Page() {
  return <EmiCalculatorClient />;
}