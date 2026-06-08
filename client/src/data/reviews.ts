export interface Review {
  quote: string;
  name: string;
  location: string;
  time: string; // Used for designation/subtitle in UI
  profileName: string;
  datePublished: string;
  ratingValue: string;
}

export const reviews: Review[] = [
  {
    quote: "Paperxify is the best ai notes from yt link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully.",
    name: "David Miller",
    location: "US",
    time: "CS Major, Stanford University",
    profileName: "DavidM",
    datePublished: "2026-05-15",
    ratingValue: "5"
  },
  {
    quote: "Hervorragend! Ich lade meine deutschen Vorlesungs-Links hoch und erhalte perfekte strukturierte Notizen. Die Übersetzungen und Fachbegriffe werden extrem präzise übersetzt. Definitiv besser als NoteGPT.",
    name: "Lukas Weber",
    location: "DE",
    time: "Engineering Student, TU Munich",
    profileName: "LukasW",
    datePublished: "2026-05-20",
    ratingValue: "5"
  },
  {
    quote: "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    name: "Sarah Jenkins",
    location: "AU",
    time: "Medical Student, University of Melbourne",
    profileName: "SarahJ",
    datePublished: "2026-05-22",
    ratingValue: "5"
  },
  {
    quote: "I love the custom document styling. I can print my notes in Lora or EB Garamond sepia themes which matches my paper planner. An essential study tool for college kids.",
    name: "Emily Tremblay",
    location: "CA",
    time: "Biology Sophomore, McGill University",
    profileName: "EmilyT",
    datePublished: "2026-05-25",
    ratingValue: "5"
  },
  {
    quote: "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context.",
    name: "James Sterling",
    location: "UK",
    time: "Economics Student, LSE",
    profileName: "JamesS",
    datePublished: "2026-05-28",
    ratingValue: "5"
  },
  {
    quote: "Paperxify is the fastest youtube notes generator. Instant transcription, excellent quiz integration, and beautiful visual templates. 10/10 recommend.",
    name: "Elena Rostova",
    location: "Global",
    time: "Product Manager & Continuous Learner",
    profileName: "ElenaR",
    datePublished: "2026-06-01",
    ratingValue: "5"
  },
  {
    quote: "Went from failing to top 10% in my class. The flashcards + PDF combo is unreal, especially for technical courses like discrete mathematics.",
    name: "Aditya R.",
    location: "IN",
    time: "CS Student, IIT Bombay",
    profileName: "AdityaR",
    datePublished: "2026-06-03",
    ratingValue: "5"
  },
  {
    quote: "Finalmente uma IA que extrai código e diagramas de forma limpa. Facilita muito para revisar aulas de engenharia de software no final de semana.",
    name: "Matheus Silva",
    location: "BR",
    time: "Computer Engineering, USP Brazil",
    profileName: "MatheusS",
    datePublished: "2026-06-04",
    ratingValue: "5"
  }
];
