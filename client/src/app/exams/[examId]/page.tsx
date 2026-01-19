"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Info, Clock, CheckCircle, 
  PlayCircle, AlertCircle, ArrowLeft,
  Settings, UserCheck
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

// Mock Data for a Specific Exam
const EXAM_DETAILS = {
  name: "GATE (Graduate Aptitude Test in Engineering)",
  description: "An all-India examination that primarily tests the comprehensive understanding of various undergraduate subjects in engineering and science.",
  criteria: "Graduate degree in Engineering/Technology/Architecture/Science/Commerce/Arts.",
  duration: "180 Minutes",
  conductedBy: "IITs and IISc",
  years: [
    { year: 2025, shifts: ["Morning (9-12)", "Afternoon (2-5)"] },
    { year: 2024, shifts: ["Shift 1", "Shift 2", "Shift 3"] },
    { year: 2023, shifts: ["Forenoon", "Afternoon"] },
    { year: 2022, shifts: ["Single Shift"] }
  ]
};

export default function ExamDetailsPage() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Section: Exam Profile */}
      <div className="bg-neutral-900/30 border-b border-neutral-800 py-12">
        <div className="container mx-auto px-4">
          <Link href="/exams" className="flex items-center text-sm text-neutral-500 hover:text-yellow-500 mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Exams
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="h-24 w-24 bg-yellow-500 rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <span className="text-black font-black text-3xl">G</span>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">National Level</Badge>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Engineering</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4">{EXAM_DETAILS.name}</h1>
              <p className="text-neutral-400 leading-relaxed mb-6 max-w-4xl">{EXAM_DETAILS.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-500">Eligibility</p>
                    <p className="text-sm">Graduate</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-500">Duration</p>
                    <p className="text-sm">{EXAM_DETAILS.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-neutral-500">Conducted By</p>
                    <p className="text-sm">{EXAM_DETAILS.conductedBy}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Selection Logic */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* STEP 1: Select Year */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-yellow-500" /> Select Exam Year
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {EXAM_DETAILS.years.map((y) => (
                  <button
                    key={y.year}
                    onClick={() => { setSelectedYear(y.year); setSelectedShift(null); }}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all text-center group",
                      selectedYear === y.year 
                        ? "border-yellow-500 bg-yellow-500/5" 
                        : "border-neutral-800 bg-neutral-900/30 hover:border-neutral-700"
                    )}
                  >
                    <p className={cn(
                      "text-2xl font-black",
                      selectedYear === y.year ? "text-yellow-500" : "text-neutral-300"
                    )}>{y.year}</p>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1">Available</p>
                  </button>
                ))}
              </div>
            </section>

            {/* STEP 2: Select Shift (Shown only if year is selected) */}
            <AnimatePresence>
              {selectedYear && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 border-t border-neutral-800"
                >
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-500" /> Select Exam Shift
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {EXAM_DETAILS.years.find(y => y.year === selectedYear)?.shifts.map((shift) => (
                      <button
                        key={shift}
                        onClick={() => setSelectedShift(shift)}
                        className={cn(
                          "p-4 rounded-xl border-2 flex items-center justify-between transition-all",
                          selectedShift === shift 
                            ? "border-yellow-500 bg-yellow-500/5 text-white" 
                            : "border-neutral-800 bg-neutral-900/30 text-neutral-400 hover:border-neutral-700"
                        )}
                      >
                        <span className="font-medium">{shift}</span>
                        {selectedShift === shift && <CheckCircle className="h-5 w-5 text-yellow-500" />}
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE: Ready to Start Widget */}
          <div className="lg:col-span-1">
            <Card className="bg-neutral-900/50 border-neutral-800 sticky top-24">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
                    <PlayCircle className="h-8 w-8 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Ready for the Test?</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-neutral-800">
                      <span className="text-neutral-500">Selected Year:</span>
                      <span className="text-yellow-500 font-bold">{selectedYear || "None"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-neutral-800">
                      <span className="text-neutral-500">Selected Shift:</span>
                      <span className="text-yellow-500 font-bold">{selectedShift || "None"}</span>
                    </div>
                  </div>

                  <Link href={`/exams/test-engine?exam=gate&year=${selectedYear}&shift=${selectedShift}`}>
                    <Button 
                      disabled={!selectedYear || !selectedShift}
                      className="w-full h-12 mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg rounded-xl shadow-[0_10px_20px_rgba(234,179,8,0.2)]"
                    >
                      Start Test Now
                    </Button>
                  </Link>

                  <p className="text-[10px] text-neutral-500 mt-4 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Calculator & timer will be enabled.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}