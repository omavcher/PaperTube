export interface Subject {
  id: string;
  name: string;
  topics: string[];
}

export interface Exam {
  id: string;
  name: string;
  logo: string;
  subjects: Subject[];
}

export const SYLLABUS_DATA: Record<string, Exam> = {
  // GATE Exams
  "GATE-CSE-2027": {
    id: "gate_cse",
    name: "GATE Computer Science & IT",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/330px-IIT_Madras_Logo.svg.png",
    subjects: [
      { 
        id: "em", 
        name: "Engineering Mathematics", 
        topics: [
          "Discrete Mathematics", 
          "Linear Algebra", 
          "Calculus", 
          "Probability & Statistics",
          "Graph Theory",
          "Mathematical Logic"
        ] 
      },
      { 
        id: "dsa", 
        name: "Data Structures & Algorithms", 
        topics: [
          "Arrays & Linked Lists", 
          "Stacks & Queues", 
          "Trees & Binary Search Trees", 
          "Heaps & Priority Queues",
          "Graph Algorithms", 
          "Dynamic Programming", 
          "Greedy Algorithms", 
          "Divide & Conquer",
          "Complexity Analysis",
          "Searching & Sorting Algorithms"
        ] 
      },
      { 
        id: "os", 
        name: "Operating Systems", 
        topics: [
          "Process Management", 
          "Threads & Concurrency", 
          "CPU Scheduling", 
          "Synchronization",
          "Deadlocks", 
          "Memory Management", 
          "Virtual Memory", 
          "File Systems",
          "I/O Systems"
        ] 
      },
      { 
        id: "cn", 
        name: "Computer Networks", 
        topics: [
          "Network Models (OSI, TCP/IP)", 
          "Physical Layer", 
          "Data Link Layer", 
          "Network Layer",
          "Transport Layer (TCP/UDP)", 
          "Application Layer", 
          "Network Security",
          "Wireless Networks"
        ] 
      },
      { 
        id: "dbms", 
        name: "Database Management Systems", 
        topics: [
          "ER Model & Relational Model", 
          "Relational Algebra & Calculus", 
          "SQL & PL/SQL", 
          "Normalization",
          "Transactions & Concurrency Control", 
          "Indexing & Hashing", 
          "Query Processing"
        ] 
      },
      { 
        id: "coa", 
        name: "Computer Organization", 
        topics: [
          "Digital Logic", 
          "Processor Design", 
          "Instruction Pipeline", 
          "Memory Hierarchy",
          "I/O Interface", 
          "Parallel Processing"
        ] 
      }
    ]
  },

  "GATE-ME-2027": {
    id: "gate_me",
    name: "GATE Mechanical Engineering",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/330px-IIT_Madras_Logo.svg.png",
    subjects: [
      { 
        id: "mechanics", 
        name: "Engineering Mechanics", 
        topics: [
          "Statics", 
          "Dynamics", 
          "Strength of Materials", 
          "Mechanics of Materials",
          "Theory of Machines", 
          "Vibrations"
        ] 
      },
      { 
        id: "thermal", 
        name: "Thermal Engineering", 
        topics: [
          "Thermodynamics", 
          "Heat Transfer", 
          "Refrigeration & Air Conditioning", 
          "IC Engines",
          "Power Plants", 
          "Turbomachinery"
        ] 
      },
      { 
        id: "manufacturing", 
        name: "Manufacturing Engineering", 
        topics: [
          "Engineering Materials", 
          "Metal Casting", 
          "Forming Processes", 
          "Joining Processes",
          "Machining Processes", 
          "Computer Integrated Manufacturing"
        ] 
      },
      { 
        id: "industrial", 
        name: "Industrial Engineering", 
        topics: [
          "Operations Research", 
          "Production Planning", 
          "Inventory Control", 
          "Quality Control",
          "Work Study", 
          "Project Management"
        ] 
      }
    ]
  },

  "GATE-EE-2027": {
    id: "gate_ee",
    name: "GATE Electrical Engineering",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/330px-IIT_Madras_Logo.svg.png",
    subjects: [
      { 
        id: "networks", 
        name: "Electric Circuits", 
        topics: [
          "Network Theory", 
          "Transient Analysis", 
          "AC Circuits", 
          "Resonance",
          "Two-port Networks", 
          "Graph Theory"
        ] 
      },
      { 
        id: "machines", 
        name: "Electrical Machines", 
        topics: [
          "Transformers", 
          "DC Machines", 
          "Synchronous Machines", 
          "Induction Motors",
          "Special Machines", 
          "Testing of Machines"
        ] 
      },
      { 
        id: "power", 
        name: "Power Systems", 
        topics: [
          "Generation", 
          "Transmission", 
          "Distribution", 
          "Fault Analysis",
          "Protection", 
          "Stability"
        ] 
      },
      { 
        id: "control", 
        name: "Control Systems", 
        topics: [
          "Modeling", 
          "Time Response", 
          "Frequency Response", 
          "Stability Analysis",
          "State Space Analysis", 
          "Compensators"
        ] 
      }
    ]
  },

  "GATE-CE-2027": {
    id: "gate_ce",
    name: "GATE Civil Engineering",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/330px-IIT_Madras_Logo.svg.png",
    subjects: [
      { 
        id: "structures", 
        name: "Structural Engineering", 
        topics: [
          "Mechanics", 
          "Structural Analysis", 
          "Concrete Design", 
          "Steel Design",
          "Prestressed Concrete", 
          "Earthquake Engineering"
        ] 
      },
      { 
        id: "geotech", 
        name: "Geotechnical Engineering", 
        topics: [
          "Soil Mechanics", 
          "Foundation Engineering", 
          "Earth Retaining Structures", 
          "Slope Stability",
          "Soil Dynamics", 
          "Ground Improvement"
        ] 
      },
      { 
        id: "water", 
        name: "Water Resources", 
        topics: [
          "Hydrology", 
          "Hydraulics", 
          "Irrigation", 
          "Environmental Engineering",
          "Water Treatment", 
          "Wastewater Treatment"
        ] 
      },
      { 
        id: "transportation", 
        name: "Transportation Engineering", 
        topics: [
          "Highway Engineering", 
          "Railway Engineering", 
          "Airport Planning", 
          "Traffic Engineering",
          "Pavement Design", 
          "Tunnel Engineering"
        ] 
      }
    ]
  },

  // JEE Exams
  "JEE-MAIN-2027": {
    id: "jee_main",
    name: "JEE Main (Engineering)",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/National_Testing_Agency_logo.png/421px-National_Testing_Agency_logo.png",
    subjects: [
      { 
        id: "phy", 
        name: "Physics", 
        topics: [
          "Kinematics", 
          "Laws of Motion", 
          "Work, Energy & Power", 
          "Rotational Motion",
          "Gravitation", 
          "Thermodynamics", 
          "Electrostatics", 
          "Current Electricity",
          "Magnetism", 
          "Optics", 
          "Modern Physics"
        ] 
      },
      { 
        id: "chem", 
        name: "Chemistry", 
        topics: [
          "Physical Chemistry", 
          "Organic Chemistry", 
          "Inorganic Chemistry", 
          "Atomic Structure",
          "Chemical Bonding", 
          "Thermodynamics", 
          "Equilibrium", 
          "Hydrocarbons",
          "Coordination Compounds", 
          "Biomolecules"
        ] 
      },
      { 
        id: "math", 
        name: "Mathematics", 
        topics: [
          "Algebra", 
          "Trigonometry", 
          "Coordinate Geometry", 
          "Calculus",
          "Vectors & 3D Geometry", 
          "Probability", 
          "Statistics", 
          "Mathematical Reasoning"
        ] 
      }
    ]
  },

  "JEE-ADVANCED-2027": {
    id: "jee_adv",
    name: "JEE Advanced",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/National_Testing_Agency_logo.png/421px-National_Testing_Agency_logo.png",
    subjects: [
      { 
        id: "phy", 
        name: "Physics", 
        topics: [
          "Mechanics", 
          "Thermal Physics", 
          "Electromagnetism", 
          "Optics",
          "Modern Physics", 
          "Experimental Physics", 
          "Advanced Topics"
        ] 
      },
      { 
        id: "chem", 
        name: "Chemistry", 
        topics: [
          "Physical Chemistry", 
          "Organic Chemistry", 
          "Inorganic Chemistry", 
          "Analytical Chemistry",
          "Polymer Chemistry", 
          "Bio-organic Chemistry"
        ] 
      },
      { 
        id: "math", 
        name: "Mathematics", 
        topics: [
          "Advanced Algebra", 
          "Calculus", 
          "Coordinate Geometry", 
          "Vectors",
          "Probability & Statistics", 
          "Number Theory"
        ] 
      }
    ]
  },

  // NEET
  "NEET-UG-2027": {
    id: "neet_ug",
    name: "NEET (Medical Entrance)",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/National_Testing_Agency_logo.png/421px-National_Testing_Agency_logo.png",
    subjects: [
      { 
        id: "bio", 
        name: "Biology", 
        topics: [
          "Diversity in Living World", 
          "Structural Organization", 
          "Cell Structure & Function", 
          "Plant Physiology",
          "Human Physiology", 
          "Reproduction", 
          "Genetics & Evolution", 
          "Biology in Human Welfare",
          "Biotechnology", 
          "Ecology"
        ] 
      },
      { 
        id: "phy", 
        name: "Physics", 
        topics: [
          "Physical World & Measurement", 
          "Kinematics", 
          "Laws of Motion", 
          "Work, Energy & Power",
          "Motion of System of Particles", 
          "Gravitation", 
          "Properties of Bulk Matter",
          "Thermodynamics", 
          "Behavior of Perfect Gas", 
          "Oscillations & Waves",
          "Electrostatics", 
          "Current Electricity", 
          "Magnetic Effects of Current",
          "Electromagnetic Induction", 
          "Electromagnetic Waves", 
          "Optics",
          "Dual Nature of Matter", 
          "Atoms & Nuclei", 
          "Electronic Devices"
        ] 
      },
      { 
        id: "chem", 
        name: "Chemistry", 
        topics: [
          "Some Basic Concepts", 
          "Structure of Atom", 
          "Classification of Elements",
          "Chemical Bonding", 
          "States of Matter", 
          "Thermodynamics", 
          "Equilibrium",
          "Redox Reactions", 
          "Hydrogen", 
          "s-Block Elements", 
          "p-Block Elements",
          "Organic Chemistry", 
          "Hydrocarbons", 
          "Environmental Chemistry",
          "Solid State", 
          "Solutions", 
          "Electrochemistry", 
          "Chemical Kinetics",
          "Surface Chemistry", 
          "General Principles", 
          "Coordination Compounds"
        ] 
      }
    ]
  },

  // CAT
  "CAT-2027": {
    id: "cat_exam",
    name: "CAT (MBA Entrance)",
    logo: "https://www.uxdt.nic.in/wp-content/uploads/2024/06/iim-ahmedabad--feture-img-01.jpg",
    subjects: [
      { 
        id: "qa", 
        name: "Quantitative Aptitude", 
        topics: [
          "Arithmetic", 
          "Algebra", 
          "Geometry & Mensuration", 
          "Number Systems",
          "Modern Mathematics", 
          "Data Interpretation", 
          "Logical Reasoning"
        ] 
      },
      { 
        id: "dilr", 
        name: "Data Interpretation & Logical Reasoning", 
        topics: [
          "Data Tables", 
          "Bar Graphs", 
          "Pie Charts", 
          "Line Graphs",
          "Caselets", 
          "Seating Arrangement", 
          "Blood Relations", 
          "Syllogisms",
          "Puzzles", 
          "Venn Diagrams"
        ] 
      },
      { 
        id: "varc", 
        name: "Verbal Ability & Reading Comprehension", 
        topics: [
          "Reading Comprehension", 
          "Para Jumbles", 
          "Para Summary", 
          "Para Completion",
          "Sentence Correction", 
          "Vocabulary", 
          "Grammar", 
          "Critical Reasoning"
        ] 
      }
    ]
  },

  // NDA
  "NDA-2027": {
    id: "nda",
    name: "NDA (National Defence Academy)",
    logo: "https://imgs.search.brave.com/GBZ0-7CeovveFKW1iCtTuXkY79iFTwarWkMj8W6XJR8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy82/LzZlL05hdGlvbmFs/X0RlZmVuY2VfQWNh/ZGVteV9OREEucG5n",
    subjects: [
      { 
        id: "math", 
        name: "Mathematics", 
        topics: [
          "Algebra", 
          "Matrices & Determinants", 
          "Trigonometry", 
          "Analytical Geometry",
          "Differential Calculus", 
          "Integral Calculus", 
          "Vector Algebra", 
          "Statistics & Probability"
        ] 
      },
      { 
        id: "gaw", 
        name: "General Ability Test", 
        topics: [
          "English (Grammar & Vocabulary)", 
          "Physics", 
          "Chemistry", 
          "General Science",
          "History", 
          "Geography", 
          "Current Events", 
          "General Knowledge"
        ] 
      }
    ]
  },

  // CA Exams
  "CA-FOUNDATION-2027": {
    id: "ca_foundation",
    name: "CA Foundation",
    logo: "https://imgs.search.brave.com/AJAA364ELyG5WNXkKd-rv06ZzYEjDSSMAVbWlI5kO44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzEzLzEvdGhlLWlu/c3RpdHV0ZS1vZi1j/aGFydGVyZWQtYWNj/b3VudGFudHMtb2Yt/aW5kaWEtbG9nby1w/bmdfc2Vla2xvZ28t/MTM4NjE4LnBuZw",
    subjects: [
      { 
        id: "principles", 
        name: "Principles & Practice of Accounting", 
        topics: [
          "Accounting Process", 
          "Bank Reconciliation", 
          "Inventories", 
          "Depreciation",
          "Bills of Exchange", 
          "Final Accounts", 
          "Partnership Accounts", 
          "Company Accounts"
        ] 
      },
      { 
        id: "business_law", 
        name: "Business Laws & Business Correspondence", 
        topics: [
          "Indian Contract Act", 
          "Sale of Goods Act", 
          "Partnership Act", 
          "Company Law",
          "Business Communication", 
          "Report Writing", 
          "Business Correspondence"
        ] 
      },
      { 
        id: "business_mathematics", 
        name: "Business Mathematics & Statistics", 
        topics: [
          "Ratio & Proportion", 
          "Equations", 
          "Time Value of Money", 
          "Permutations & Combinations",
          "Theoretical Distributions", 
          "Correlation & Regression", 
          "Index Numbers"
        ] 
      },
      { 
        id: "business_economics", 
        name: "Business Economics & Business Commercial Knowledge", 
        topics: [
          "Micro Economics", 
          "Macro Economics", 
          "Business Environment", 
          "Business Organizations",
          "Government Policies", 
          "Commercial Knowledge"
        ] 
      }
    ]
  },

  "CA-INTERMEDIATE-2027": {
    id: "ca_intermediate",
    name: "CA Intermediate",
    logo: "https://imgs.search.brave.com/AJAA364ELyG5WNXkKd-rv06ZzYEjDSSMAVbWlI5kO44/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMuc2Vla2xvZ28u/Y29tL2xvZ28tcG5n/LzEzLzEvdGhlLWlu/c3RpdHV0ZS1vZi1j/aGFydGVyZWQtYWNj/b3VudGFudHMtb2Yt/aW5kaWEtbG9nby1w/bmdfc2Vla2xvZ28t/MTM4NjE4LnBuZw",
    subjects: [
      { 
        id: "accounting", 
        name: "Accounting", 
        topics: [
          "Process & Basis", 
          "Special Transactions", 
          "Banking Companies", 
          "Insurance Companies",
          "Partnership", 
          "Company Accounts", 
          "Accounting Standards"
        ] 
      },
      { 
        id: "corporate_law", 
        name: "Corporate & Other Laws", 
        topics: [
          "Companies Act", 
          "Corporate Governance", 
          "Other Business Laws", 
          "SEBI Regulations",
          "Competition Act", 
          "Insolvency & Bankruptcy Code"
        ] 
      },
      { 
        id: "cost_accounting", 
        name: "Cost & Management Accounting", 
        topics: [
          "Cost Concepts", 
          "Material & Labour Cost", 
          "Overheads", 
          "Cost Sheet",
          "Budgeting", 
          "Standard Costing", 
          "Marginal Costing"
        ] 
      },
      { 
        id: "taxation", 
        name: "Taxation", 
        topics: [
          "Income Tax", 
          "GST", 
          "Tax Planning", 
          "Assessment Procedures",
          "International Taxation", 
          "Tax Deduction at Source"
        ] 
      },
      { 
        id: "auditing", 
        name: "Auditing & Ethics", 
        topics: [
          "Auditing Standards", 
          "Audit Planning", 
          "Internal Control", 
          "Audit Evidence",
          "Audit Report", 
          "Professional Ethics"
        ] 
      },
      { 
        id: "financial_management", 
        name: "Financial Management & Strategic Management", 
        topics: [
          "Financial Analysis", 
          "Working Capital", 
          "Capital Budgeting", 
          "Cost of Capital",
          "Strategic Analysis", 
          "Strategic Planning", 
          "Business Environment"
        ] 
      }
    ]
  }
};