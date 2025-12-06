// app/data/education/examsData.ts

export interface Exam {
    id: string;
    name: string;
    fullName: string;
    shortDescription: string;
    longDescription: string;
    conductingBody: string;
    website: string;
    eligibility: {
      minAge: number;
      maxAge: number;
      education: string[];
      nationality: string[];
      other: string[];
    };
    examPattern: {
      mode: "Online" | "Offline" | "Both";
      duration: string;
      subjects: Array<{
        name: string;
        marks: number;
        questions: number;
        duration?: string;
      }>;
      totalMarks: number;
      negativeMarking: boolean;
      markingScheme: string;
    };
    importantDates: {
      applicationStart: string;
      applicationEnd: string;
      admitCard: string;
      examDate: string;
      resultDate: string;
      nextSession: string;
    };
    preparationTips: string[];
    bestBooks: Array<{
      name: string;
      author: string;
      publisher: string;
      edition?: string;
    }>;
    cutOff: {
      previousYear: Array<{
        year: number;
        general: number;
        obc: number;
        sc: number;
        st: number;
      }>;
      expected: {
        general: number;
        obc: number;
        sc: number;
        st: number;
      };
    };
    benefits: string[];
    careerOpportunities: string[];
    topColleges: Array<{
      name: string;
      location: string;
      nirfRank?: number;
      website: string;
    }>;
    syllabus: string[];
    previousYearPapers: Array<{
      year: number;
      pdfUrl: string;
      solutionUrl?: string;
    }>;
    applicationProcess: string[];
    fees: {
      general: number;
      obc: number;
      sc: number;
      st: number;
      pwd: number;
      girls: number;
    };
    examCenters: number;
    tags: string[];
    popularity: number;
    difficulty: "Easy" | "Moderate" | "Hard" | "Very Hard";
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  }
  
  // Detailed sample exams
  export const detailedExams: Exam[] = [
    {
      id: "jee-mains-2024",
      name: "JEE Mains 2024",
      fullName: "Joint Entrance Examination Main 2024",
      shortDescription: "National level engineering entrance exam for NITs, IIITs, and CFTIs",
      longDescription: "JEE Main is a national level engineering entrance exam conducted by National Testing Agency (NTA) for admission to various undergraduate engineering programs in NITs, IIITs, other centrally funded technical institutions, and institutions funded by participating state governments. It also serves as eligibility test for JEE Advanced.",
      conductingBody: "National Testing Agency (NTA)",
      website: "https://jeemain.nta.nic.in",
      eligibility: {
        minAge: 17,
        maxAge: 25,
        education: [
          "10+2 or equivalent with Physics, Chemistry, and Mathematics",
          "Minimum 75% marks (65% for SC/ST/PwD)",
          "Appearing in 12th class in 2024 can also apply"
        ],
        nationality: ["Indian", "OCI", "PIO", "Foreign Nationals"],
        other: [
          "Can attempt maximum 3 times in consecutive years",
          "No limit on number of attempts"
        ]
      },
      examPattern: {
        mode: "Online",
        duration: "3 hours",
        subjects: [
          { name: "Physics", marks: 100, questions: 30 },
          { name: "Chemistry", marks: 100, questions: 30 },
          { name: "Mathematics", marks: 100, questions: 30 }
        ],
        totalMarks: 300,
        negativeMarking: true,
        markingScheme: "+4 for correct, -1 for incorrect, 0 for unattempted"
      },
      importantDates: {
        applicationStart: "2024-01-15",
        applicationEnd: "2024-02-15",
        admitCard: "2024-03-20",
        examDate: "2024-04-06",
        resultDate: "2024-05-15",
        nextSession: "January 2025"
      },
      preparationTips: [
        "Focus on NCERT books for basic concepts",
        "Solve previous year papers regularly",
        "Take mock tests weekly",
        "Revise formulas daily",
        "Practice time management"
      ],
      bestBooks: [
        { name: "Concepts of Physics", author: "H.C. Verma", publisher: "Bharti Bhawan", edition: "Latest" },
        { name: "Organic Chemistry", author: "Morrison & Boyd", publisher: "Pearson" },
        { name: "Mathematics for JEE", author: "R.D. Sharma", publisher: "Dhanpat Rai" }
      ],
      cutOff: {
        previousYear: [
          { year: 2023, general: 90, obc: 73, sc: 51, st: 39 },
          { year: 2022, general: 88, obc: 67, sc: 46, st: 34 },
          { year: 2021, general: 87, obc: 68, sc: 46, st: 34 }
        ],
        expected: {
          general: 92,
          obc: 75,
          sc: 53,
          st: 41
        }
      },
      benefits: [
        "Gateway to top engineering colleges (NITs, IIITs)",
        "Eligibility for JEE Advanced",
        "Admission in government-funded institutions",
        "Scholarship opportunities",
        "High placement packages"
      ],
      careerOpportunities: [
        "Software Engineer at FAANG companies",
        "Research Scientist",
        "Data Scientist",
        "Mechanical Engineer",
        "Civil Engineer",
        "Aerospace Engineer"
      ],
      topColleges: [
        { name: "NIT Trichy", location: "Tamil Nadu", nirfRank: 9, website: "https://www.nitt.edu" },
        { name: "NIT Surathkal", location: "Karnataka", nirfRank: 10, website: "https://www.nitk.ac.in" },
        { name: "NIT Rourkela", location: "Odisha", nirfRank: 16, website: "https://www.nitrkl.ac.in" },
        { name: "IIIT Hyderabad", location: "Telangana", nirfRank: 1, website: "https://www.iiit.ac.in" }
      ],
      syllabus: [
        "Physics: Mechanics, Electrodynamics, Modern Physics, Optics, Thermodynamics",
        "Chemistry: Physical, Organic, Inorganic Chemistry",
        "Mathematics: Algebra, Calculus, Coordinate Geometry, Trigonometry"
      ],
      previousYearPapers: [
        { year: 2023, pdfUrl: "/papers/jee-mains-2023.pdf" },
        { year: 2022, pdfUrl: "/papers/jee-mains-2022.pdf", solutionUrl: "/solutions/jee-mains-2022-sol.pdf" },
        { year: 2021, pdfUrl: "/papers/jee-mains-2021.pdf", solutionUrl: "/solutions/jee-mains-2021-sol.pdf" }
      ],
      applicationProcess: [
        "Register on NTA website",
        "Fill personal and educational details",
        "Upload documents (photo, signature)",
        "Pay application fee",
        "Download confirmation page"
      ],
      fees: {
        general: 1000,
        obc: 500,
        sc: 250,
        st: 250,
        pwd: 0,
        girls: 500
      },
      examCenters: 300,
      tags: ["Engineering", "National", "Undergraduate", "NTA", "IIT"],
      popularity: 95,
      difficulty: "Hard",
      seo: {
        title: "JEE Mains 2024: Complete Guide, Syllabus, Dates, Preparation Tips",
        description: "Complete guide for JEE Mains 2024 including syllabus, important dates, exam pattern, preparation tips, cut-off, and career opportunities. Get all information about Joint Entrance Examination Main.",
        keywords: ["JEE Mains 2024", "engineering entrance exam", "NIT admission", "JEE preparation", "NTA exam"]
      }
    },
    {
      id: "neet-ug-2024",
      name: "NEET UG 2024",
      fullName: "National Eligibility cum Entrance Test for Undergraduate 2024",
      shortDescription: "National level medical entrance exam for MBBS, BDS, and AYUSH courses",
      longDescription: "NEET UG is a single national level medical entrance examination conducted by National Testing Agency (NTA) for admission to undergraduate medical courses (MBBS/BDS) in government and private medical colleges across India. It replaced all state-level medical entrance exams.",
      conductingBody: "National Testing Agency (NTA)",
      website: "https://neet.nta.nic.in",
      eligibility: {
        minAge: 17,
        maxAge: 25,
        education: [
          "10+2 or equivalent with Physics, Chemistry, Biology/Biotechnology",
          "Minimum 50% marks (40% for SC/ST/OBC)",
          "Must have passed 12th with PCB subjects"
        ],
        nationality: ["Indian", "OCI", "PIO", "Foreign Nationals"],
        other: [
          "Maximum 3 attempts for general category",
          "No limit for SC/ST/OBC"
        ]
      },
      examPattern: {
        mode: "Offline",
        duration: "3 hours 20 minutes",
        subjects: [
          { name: "Physics", marks: 180, questions: 45 },
          { name: "Chemistry", marks: 180, questions: 45 },
          { name: "Biology", marks: 360, questions: 90 }
        ],
        totalMarks: 720,
        negativeMarking: true,
        markingScheme: "+4 for correct, -1 for incorrect, 0 for unattempted"
      },
      importantDates: {
        applicationStart: "2024-03-06",
        applicationEnd: "2024-04-06",
        admitCard: "2024-05-04",
        examDate: "2024-05-05",
        resultDate: "2024-06-14",
        nextSession: "May 2025"
      },
      preparationTips: [
        "Focus on NCERT biology thoroughly",
        "Practice diagram-based questions",
        "Solve sample papers daily",
        "Learn chemical reactions",
        "Understand physics concepts deeply"
      ],
      bestBooks: [
        { name: "Biology NCERT", author: "NCERT", publisher: "NCERT" },
        { name: "Objective Biology", author: "Dinesh", publisher: "Dinesh Publications" },
        { name: "Physical Chemistry", author: "O.P. Tandon", publisher: "GRB Publications" }
      ],
      cutOff: {
        previousYear: [
          { year: 2023, general: 137, obc: 107, sc: 137, st: 137 },
          { year: 2022, general: 117, obc: 93, sc: 117, st: 117 },
          { year: 2021, general: 138, obc: 108, sc: 138, st: 138 }
        ],
        expected: {
          general: 140,
          obc: 110,
          sc: 140,
          st: 140
        }
      },
      benefits: [
        "Admission to MBBS/BDS courses nationwide",
        "Eligibility for AIIMS and JIPMER (now merged)",
        "State quota seats availability",
        "Scholarships for meritorious students",
        "International recognition"
      ],
      careerOpportunities: [
        "Doctor/Surgeon",
        "Medical Researcher",
        "Pharmacist",
        "Medical Officer",
        "Professor in Medical College"
      ],
      topColleges: [
        { name: "AIIMS Delhi", location: "Delhi", nirfRank: 1, website: "https://www.aiims.edu" },
        { name: "CMC Vellore", location: "Tamil Nadu", nirfRank: 2, website: "https://www.cmch-vellore.edu" },
        { name: "PGIMER Chandigarh", location: "Chandigarh", nirfRank: 3, website: "https://pgimer.edu.in" },
        { name: "KGMU Lucknow", location: "Uttar Pradesh", nirfRank: 6, website: "https://kgmu.org" }
      ],
      syllabus: [
        "Biology: Botany and Zoology as per NCERT",
        "Physics: Class 11 & 12 NCERT syllabus",
        "Chemistry: Physical, Organic, Inorganic Chemistry"
      ],
      previousYearPapers: [
        { year: 2023, pdfUrl: "/papers/neet-2023.pdf" },
        { year: 2022, pdfUrl: "/papers/neet-2022.pdf", solutionUrl: "/solutions/neet-2022-sol.pdf" },
        { year: 2021, pdfUrl: "/papers/neet-2021.pdf", solutionUrl: "/solutions/neet-2021-sol.pdf" }
      ],
      applicationProcess: [
        "Register on NTA NEET website",
        "Fill application form with personal details",
        "Upload documents (photo, signature, thumb impression)",
        "Pay application fee online",
        "Print confirmation page"
      ],
      fees: {
        general: 1700,
        obc: 1600,
        sc: 1000,
        st: 1000,
        pwd: 1000,
        girls: 1000
      },
      examCenters: 400,
      tags: ["Medical", "MBBS", "BDS", "National", "Biology"],
      popularity: 94,
      difficulty: "Very Hard",
      seo: {
        title: "NEET UG 2024: Complete Guide, Syllabus, Dates, Preparation Tips",
        description: "Complete guide for NEET UG 2024 including syllabus, important dates, exam pattern, preparation tips, cut-off, and career opportunities. Get all information about National Eligibility cum Entrance Test.",
        keywords: ["NEET 2024", "medical entrance exam", "MBBS admission", "NEET preparation", "medical colleges"]
      }
    }
  ];
  
  // More exams with basic info (you can expand these later)
  export const allExams: Exam[] = [
    ...detailedExams,
    {
      id: "gate-2024",
      name: "GATE 2024",
      fullName: "Graduate Aptitude Test in Engineering 2024",
      shortDescription: "National level exam for M.Tech admissions and PSU recruitment",
      longDescription: "",
      conductingBody: "IIT Bombay",
      website: "https://gate.iitb.ac.in",
      eligibility: { minAge: 21, maxAge: 35, education: [], nationality: [], other: [] },
      examPattern: { mode: "Online", duration: "3 hours", subjects: [], totalMarks: 100, negativeMarking: true, markingScheme: "" },
      importantDates: { applicationStart: "2023-08-30", applicationEnd: "2023-10-12", admitCard: "2024-01-03", examDate: "2024-02-03", resultDate: "2024-03-16", nextSession: "2025" },
      preparationTips: [],
      bestBooks: [],
      cutOff: { previousYear: [], expected: { general: 0, obc: 0, sc: 0, st: 0 } },
      benefits: [],
      careerOpportunities: [],
      topColleges: [],
      syllabus: [],
      previousYearPapers: [],
      applicationProcess: [],
      fees: { general: 1800, obc: 900, sc: 450, st: 450, pwd: 450, girls: 900 },
      examCenters: 200,
      tags: ["Engineering", "Postgraduate", "PSU", "M.Tech"],
      popularity: 88,
      difficulty: "Very Hard",
      seo: { title: "", description: "", keywords: [] }
    },
    {
      id: "upsc-cse-2024",
      name: "UPSC CSE 2024",
      fullName: "Union Public Service Commission Civil Services Examination 2024",
      shortDescription: "Civil services exam for IAS, IPS, IFS and other central services",
      longDescription: "",
      conductingBody: "UPSC",
      website: "https://upsc.gov.in",
      eligibility: { minAge: 21, maxAge: 32, education: [], nationality: [], other: [] },
      examPattern: { mode: "Offline", duration: "Varies", subjects: [], totalMarks: 2025, negativeMarking: false, markingScheme: "" },
      importantDates: { applicationStart: "2024-02-14", applicationEnd: "2024-03-05", admitCard: "2024-05-01", examDate: "2024-05-26", resultDate: "2024-06-12", nextSession: "2025" },
      preparationTips: [],
      bestBooks: [],
      cutOff: { previousYear: [], expected: { general: 0, obc: 0, sc: 0, st: 0 } },
      benefits: [],
      careerOpportunities: [],
      topColleges: [],
      syllabus: [],
      previousYearPapers: [],
      applicationProcess: [],
      fees: { general: 100, obc: 0, sc: 0, st: 0, pwd: 0, girls: 0 },
      examCenters: 100,
      tags: ["Civil Services", "Government", "IAS", "IPS"],
      popularity: 96,
      difficulty: "Very Hard",
      seo: { title: "", description: "", keywords: [] }
    },
    {
      id: "cat-2024",
      name: "CAT 2024",
      fullName: "Common Admission Test 2024",
      shortDescription: "Management entrance exam for IIMs and other top B-schools",
      longDescription: "",
      conductingBody: "IIM Lucknow",
      website: "https://iimcat.ac.in",
      eligibility: { minAge: 21, maxAge: 35, education: [], nationality: [], other: [] },
      examPattern: { mode: "Online", duration: "2 hours", subjects: [], totalMarks: 198, negativeMarking: true, markingScheme: "" },
      importantDates: { applicationStart: "2024-08-01", applicationEnd: "2024-09-15", admitCard: "2024-10-25", examDate: "2024-11-24", resultDate: "2024-12-20", nextSession: "2025" },
      preparationTips: [],
      bestBooks: [],
      cutOff: { previousYear: [], expected: { general: 0, obc: 0, sc: 0, st: 0 } },
      benefits: [],
      careerOpportunities: [],
      topColleges: [],
      syllabus: [],
      previousYearPapers: [],
      applicationProcess: [],
      fees: { general: 2400, obc: 1200, sc: 600, st: 600, pwd: 600, girls: 1200 },
      examCenters: 150,
      tags: ["Management", "MBA", "IIM", "Business"],
      popularity: 93,
      difficulty: "Hard",
      seo: { title: "", description: "", keywords: [] }
    },
    {
      id: "clat-2024",
      name: "CLAT 2024",
      fullName: "Common Law Admission Test 2024",
      shortDescription: "National level law entrance exam for NLUs and other law colleges",
      longDescription: "",
      conductingBody: "Consortium of NLUs",
      website: "https://consortiumofnlus.ac.in",
      eligibility: { minAge: 17, maxAge: 20, education: [], nationality: [], other: [] },
      examPattern: { mode: "Online", duration: "2 hours", subjects: [], totalMarks: 150, negativeMarking: true, markingScheme: "" },
      importantDates: { applicationStart: "2024-03-01", applicationEnd: "2024-04-15", admitCard: "2024-05-10", examDate: "2024-05-26", resultDate: "2024-06-10", nextSession: "2025" },
      preparationTips: [],
      bestBooks: [],
      cutOff: { previousYear: [], expected: { general: 0, obc: 0, sc: 0, st: 0 } },
      benefits: [],
      careerOpportunities: [],
      topColleges: [],
      syllabus: [],
      previousYearPapers: [],
      applicationProcess: [],
      fees: { general: 4000, obc: 3500, sc: 3500, st: 3500, pwd: 3500, girls: 3500 },
      examCenters: 120,
      tags: ["Law", "NLU", "Undergraduate", "Legal"],
      popularity: 83,
      difficulty: "Moderate",
      seo: { title: "", description: "", keywords: [] }
    },
    {
      id: "ssc-cgl-2024",
      name: "SSC CGL 2024",
      fullName: "Staff Selection Commission Combined Graduate Level 2024",
      shortDescription: "Government job exam for various Group B and C posts",
      longDescription: "",
      conductingBody: "SSC",
      website: "https://ssc.nic.in",
      eligibility: { minAge: 18, maxAge: 32, education: [], nationality: [], other: [] },
      examPattern: { mode: "Online", duration: "1 hour", subjects: [], totalMarks: 200, negativeMarking: true, markingScheme: "" },
      importantDates: { applicationStart: "2024-04-01", applicationEnd: "2024-04-30", admitCard: "2024-06-01", examDate: "2024-07-01", resultDate: "2024-08-15", nextSession: "2025" },
      preparationTips: [],
      bestBooks: [],
      cutOff: { previousYear: [], expected: { general: 0, obc: 0, sc: 0, st: 0 } },
      benefits: [],
      careerOpportunities: [],
      topColleges: [],
      syllabus: [],
      previousYearPapers: [],
      applicationProcess: [],
      fees: { general: 100, obc: 0, sc: 0, st: 0, pwd: 0, girls: 0 },
      examCenters: 300,
      tags: ["Government", "SSC", "Graduate", "Jobs"],
      popularity: 87,
      difficulty: "Moderate",
      seo: { title: "", description: "", keywords: [] }
    }
  ];
  
  // Helper functions
  export function getExamById(id: string): Exam | undefined {
    return allExams.find(exam => exam.id === id);
  }
  
  export function getUpcomingExams(): Exam[] {
    const now = new Date();
    return allExams.filter(exam => 
      new Date(exam.importantDates.examDate) > now
    ).sort((a, b) => 
      new Date(a.importantDates.examDate).getTime() - new Date(b.importantDates.examDate).getTime()
    );
  }
  
  export function getExamsByCategory(category: string): Exam[] {
    return allExams.filter(exam => exam.tags.includes(category));
  }
  
  export function calculateDaysLeft(targetDate: string): number {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  
  export function getExamStatus(exam: Exam): "Upcoming" | "Ongoing" | "Completed" {
    const now = new Date();
    const examDate = new Date(exam.importantDates.examDate);
    const applicationEnd = new Date(exam.importantDates.applicationEnd);
    
    if (now < applicationEnd) return "Upcoming";
    if (now >= applicationEnd && now <= examDate) return "Ongoing";
    return "Completed";
  }