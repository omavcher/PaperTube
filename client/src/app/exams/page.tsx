"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, BookOpen, GraduationCap, Clock, 
  ChevronRight, Star, TrendingUp, Trophy 
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const EXAM_CATEGORIES = [
  { id: "eng", name: "Engineering", icon: <GraduationCap className="h-5 w-5" /> },
  { id: "med", name: "Medical", icon: <Trophy className="h-5 w-5" /> },
  { id: "ssc", name: "SSC & Banking", icon: <TrendingUp className="h-5 w-5" /> },
];

const EXAMS = [
  { 
    id: "gate-2026", 
    name: "GATE 2026", 
    category: "Engineering", 
    papers: 24, 
    popularity: "High",
    path: "/exams/gate-2026",
    color: "from-blue-600 to-indigo-600"
  },
  { 
    id: "jee-mains", 
    name: "JEE Mains", 
    category: "Engineering", 
    papers: 45, 
    popularity: "Trending",
    path: "/exams/jee-mains",
    color: "from-orange-500 to-red-600"
  },
  { 
    id: "ssc-cgl", 
    name: "SSC CGL", 
    category: "SSC & Banking", 
    papers: 120, 
    popularity: "Popular",
    path: "/exams/ssc-cgl",
    color: "from-emerald-500 to-teal-600"
  }
];

export default function ExamHubPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 mb-4">
            Official Previous Year Papers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Practice Like the <span className="text-yellow-500">Real Exam</span>
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto mb-8">
            Access year-wise and shift-wise papers for all major competitive exams. 
            Real-time interface for an authentic testing experience.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <input 
              type="text"
              placeholder="Search for GATE, JEE, SSC..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 focus:border-yellow-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          {EXAM_CATEGORIES.map(cat => (
            <Button key={cat.id} variant="outline" className="rounded-full border-neutral-800 hover:border-yellow-500 hover:bg-yellow-500/5">
              {cat.icon} <span className="ml-2">{cat.name}</span>
            </Button>
          ))}
        </div>

        {/* Exam Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXAMS.map(exam => (
            <Link href={exam.path} key={exam.id}>
              <Card className="bg-neutral-900/50 border-neutral-800 hover:border-yellow-500/50 transition-all cursor-pointer group">
                <div className={`h-2 w-full bg-gradient-to-r ${exam.color}`} />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-neutral-800 rounded-xl">
                      <BookOpen className="h-6 w-6 text-yellow-500" />
                    </div>
                    <Badge variant="outline" className="border-yellow-500/20 text-yellow-500">
                      {exam.popularity}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">{exam.name}</h3>
                  <p className="text-sm text-neutral-500 mb-6">{exam.category} • {exam.papers} Total Papers</p>
                  <div className="flex items-center text-sm font-bold text-yellow-500">
                    View All Years <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}