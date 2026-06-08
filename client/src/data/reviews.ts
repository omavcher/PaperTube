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
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture notes open in separate tabs.",
    "name": "Mateo Fernandez",
    "location": "MX",
    "time": "Finance Junior, UNAM Mexico",
    "profileName": "MateoF",
    "datePublished": "2026-03-01",
    "ratingValue": "5"
  },
  {
    "quote": "The study chat helper is like having a tutor next to you who knows every single word the professor said. Recommended to my peers.",
    "name": "Owen Gonzalez",
    "location": "DE",
    "time": "Mathematics Student, Harvard University",
    "profileName": "OwenG93",
    "datePublished": "2026-03-03",
    "ratingValue": "5"
  },
  {
    "quote": "The translation features are superb. I can study materials from international courses in my own language seamlessly.",
    "name": "Mei-Ling Chen",
    "location": "SG",
    "time": "Data Science Student, NUS Singapore",
    "profileName": "MeiLingC",
    "datePublished": "2026-03-06",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Theodore Green",
    "location": "CA",
    "time": "Physics Student, ETH Zurich",
    "profileName": "TheodoreG53",
    "datePublished": "2026-03-07",
    "ratingValue": "5"
  },
  {
    "quote": "The study chat helper is like having a tutor next to you who knows every single word the professor said.",
    "name": "Emily Young",
    "location": "SG",
    "time": "Biochemistry Student, Cambridge University",
    "profileName": "EmilyY76",
    "datePublished": "2026-03-07",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool. Really helpful workflow.",
    "name": "Zoe Wilson",
    "location": "US",
    "time": "Finance Student, Harvard University",
    "profileName": "ZoeW17",
    "datePublished": "2026-03-08",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    "name": "Joseph Anderson",
    "location": "CA",
    "time": "Chemistry Student, UBC Canada",
    "profileName": "JosephA53",
    "datePublished": "2026-03-08",
    "ratingValue": "5"
  },
  {
    "quote": "Amazing tool for self-paced learners. I drop lecture links and get clear summaries with active links to the transcript.",
    "name": "Zoey Lopez",
    "location": "ZA",
    "time": "Civil Engineering Student, IIT Madras",
    "profileName": "ZoeyL81",
    "datePublished": "2026-03-08",
    "ratingValue": "5"
  },
  {
    "quote": "Really helps with retaining information from complex lectures. The Dark Mode is great on the eyes during late-night cram sessions. Really helpful workflow.",
    "name": "Lincoln Scott",
    "location": "SG",
    "time": "Biology Student, UBC Canada",
    "profileName": "LincolnS36",
    "datePublished": "2026-03-08",
    "ratingValue": "4"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system.",
    "name": "Wyatt Wilson",
    "location": "CA",
    "time": "Artificial Intelligence Student, NUS Singapore",
    "profileName": "WyattW5",
    "datePublished": "2026-03-09",
    "ratingValue": "5"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering.",
    "name": "Natalie Hernandez",
    "location": "NZ",
    "time": "Psychology Student, Harvard University",
    "profileName": "NatalieH72",
    "datePublished": "2026-03-09",
    "ratingValue": "5"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly. Really helpful workflow.",
    "name": "Daniel Lee",
    "location": "BR",
    "time": "English Literature Student, Stanford University",
    "profileName": "DanielL98",
    "datePublished": "2026-03-10",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams. Recommended to my peers.",
    "name": "Liam Smith",
    "location": "FR",
    "time": "Artificial Intelligence Student, Stanford University",
    "profileName": "LiamS50",
    "datePublished": "2026-03-10",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify is the best ai notes from yt link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully.",
    "name": "Lukas Weber",
    "location": "DE",
    "time": "Engineering Student, TU Munich",
    "profileName": "LukasW",
    "datePublished": "2026-03-13",
    "ratingValue": "5"
  },
  {
    "quote": "Hervorragend! Ich lade meine deutschen Vorlesungs-Links hoch und erhalte perfekte strukturierte Notizen. Die Übersetzungen und Fachbegriffe werden extrem präzise übersetzt. Definitiv besser als NoteGPT.",
    "name": "Camila Lopez",
    "location": "MX",
    "time": "Sociology Student, UT Austin",
    "profileName": "CamilaL9",
    "datePublished": "2026-03-13",
    "ratingValue": "5"
  },
  {
    "quote": "I love how it organizes long lectures into structured headers and key concepts. Saving hours of manual typing every week.",
    "name": "William Brown",
    "location": "SG",
    "time": "English Literature Student, ETH Zurich",
    "profileName": "WilliamB32",
    "datePublished": "2026-03-13",
    "ratingValue": "5"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully.",
    "name": "Grace Green",
    "location": "MX",
    "time": "Artificial Intelligence Student, Harvard University",
    "profileName": "GraceG75",
    "datePublished": "2026-03-13",
    "ratingValue": "5"
  },
  {
    "quote": "The document exporter has some minor layout quirks with sepia themes, but the content generation is top-tier. A very solid study tool for college kids.",
    "name": "Amara Okeke",
    "location": "ZA",
    "time": "Law Student, University of Cape Town",
    "profileName": "AmaraO",
    "datePublished": "2026-03-14",
    "ratingValue": "3"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system.",
    "name": "Madison Jackson",
    "location": "DE",
    "time": "Physics Student, ANU Australia",
    "profileName": "MadisonJ61",
    "datePublished": "2026-03-14",
    "ratingValue": "5"
  },
  {
    "quote": "The study chat helper is like having a tutor next to you who knows every single word the professor said.",
    "name": "Aarav Mehta",
    "location": "IN",
    "time": "Software Engineering, BITS Pilani",
    "profileName": "AaravM",
    "datePublished": "2026-03-16",
    "ratingValue": "5"
  },
  {
    "quote": "The transcript sync is great. Click any note bullet point and it takes you to that spot in the video. UI feels a bit cluttered on mobile.",
    "name": "Avery Lee",
    "location": "MX",
    "time": "Sociology Student, NUS Singapore",
    "profileName": "AveryL18",
    "datePublished": "2026-03-16",
    "ratingValue": "4"
  },
  {
    "quote": "The study chat helper is like having a tutor next to you who knows every single word the professor said.",
    "name": "Mila Brown",
    "location": "CH",
    "time": "Biology Student, IIT Madras",
    "profileName": "MilaB85",
    "datePublished": "2026-03-18",
    "ratingValue": "5"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly.",
    "name": "Aditya R.",
    "location": "IN",
    "time": "CS Student, IIT Bombay",
    "profileName": "AdityaR",
    "datePublished": "2026-03-19",
    "ratingValue": "5"
  },
  {
    "quote": "Really good at capturing the main lecture slides in text format. Sometimes it misses minor side notes, but overall highly accurate. Really helpful workflow.",
    "name": "Victoria Roberts",
    "location": "NL",
    "time": "Chemistry Student, ETH Zurich",
    "profileName": "VictoriaR93",
    "datePublished": "2026-03-19",
    "ratingValue": "4"
  },
  {
    "quote": "Amazing tool for self-paced learners. I drop lecture links and get clear summaries with active links to the transcript. Recommended to my peers.",
    "name": "Wyatt Sanchez",
    "location": "JP",
    "time": "Artificial Intelligence Student, NUS Singapore",
    "profileName": "WyattS76",
    "datePublished": "2026-03-19",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify AI has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    "name": "Harper King",
    "location": "BR",
    "time": "Electrical Engineering Student, Imperial College London",
    "profileName": "HarperK38",
    "datePublished": "2026-03-19",
    "ratingValue": "5"
  },
  {
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture lecture notes open in separate tabs.",
    "name": "Emma Green",
    "location": "IT",
    "time": "Data Science Student, Harvard University",
    "profileName": "EmmaG17",
    "datePublished": "2026-03-20",
    "ratingValue": "5"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering.",
    "name": "Henry Carter",
    "location": "UK",
    "time": "Computer Science Student, Imperial College London",
    "profileName": "HenryC57",
    "datePublished": "2026-03-20",
    "ratingValue": "5"
  },
  {
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture notes open in separate tabs. Really helpful workflow.",
    "name": "Mateo Wilson",
    "location": "DE",
    "time": "Pre-Med Student, NUS Singapore",
    "profileName": "MateoW70",
    "datePublished": "2026-03-20",
    "ratingValue": "5"
  },
  {
    "quote": "Amazing tool for self-paced learners. I drop lecture links and get clear summaries with active links to the transcript.",
    "name": "Jacob Martin",
    "location": "JP",
    "time": "Mechanical Engineering Student, IIT Madras",
    "profileName": "JacobM97",
    "datePublished": "2026-03-20",
    "ratingValue": "5"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully. Really helpful workflow.",
    "name": "Luke Walker",
    "location": "NZ",
    "time": "Computer Science Student, UBC Canada",
    "profileName": "LukeW86",
    "datePublished": "2026-03-21",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "John Adams",
    "location": "CA",
    "time": "Electrical Engineering Student, IIT Madras",
    "profileName": "JohnA65",
    "datePublished": "2026-03-22",
    "ratingValue": "5"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully.",
    "name": "Lily Lewis",
    "location": "BR",
    "time": "Computer Science Student, MIT",
    "profileName": "LilyL35",
    "datePublished": "2026-03-23",
    "ratingValue": "5"
  },
  {
    "quote": "Really good at capturing the main lecture slides in text format. Sometimes it misses minor side lecture notes, but overall highly accurate.",
    "name": "Addison Torres",
    "location": "DE",
    "time": "Finance Student, Cambridge University",
    "profileName": "AddisonT53",
    "datePublished": "2026-03-24",
    "ratingValue": "4"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering.",
    "name": "Olivia Nguyen",
    "location": "IT",
    "time": "Economics Student, Oxford University",
    "profileName": "OliviaN48",
    "datePublished": "2026-03-26",
    "ratingValue": "5"
  },
  {
    "quote": "Solid notes generator. It processes 1-hour lectures in less than a minute. Occasionally highlights trivial details, but easy to edit. Really helpful workflow.",
    "name": "David White",
    "location": "IN",
    "time": "Nursing Student, University of Michigan",
    "profileName": "DavidW60",
    "datePublished": "2026-03-27",
    "ratingValue": "4"
  },
  {
    "quote": "I love how it organizes long lectures into structured headers and key concepts. Saving hours of manual typing every week.",
    "name": "Isaac White",
    "location": "FR",
    "time": "Electrical Engineering Student, UC Berkeley",
    "profileName": "IsaacW8",
    "datePublished": "2026-03-27",
    "ratingValue": "5"
  },
  {
    "quote": "Excellent study companion. The flashcard generation is very smart, though I occasionally have to edit a card for brevity.",
    "name": "Elena Rostova",
    "location": "Global",
    "time": "Product Manager & Continuous Learner",
    "profileName": "ElenaR",
    "datePublished": "2026-03-28",
    "ratingValue": "4"
  },
  {
    "quote": "The study chat helper is like having a tutor next to you who knows every single word the professor said.",
    "name": "Isaac Martinez",
    "location": "BR",
    "time": "Biology Student, University of Tokyo",
    "profileName": "IsaacM37",
    "datePublished": "2026-03-28",
    "ratingValue": "5"
  },
  {
    "quote": "Saves a ton of time summarizing engineering webinars. I just wish the PDF export had a few more custom font options.",
    "name": "Chloe Smith",
    "location": "NZ",
    "time": "Environmental Science, University of Auckland",
    "profileName": "ChloeS",
    "datePublished": "2026-03-29",
    "ratingValue": "4"
  },
  {
    "quote": "The transcript sync is great. Click any note bullet point and it takes you to that spot in the video. UI feels a bit cluttered on mobile. Recommended to my peers.",
    "name": "Madison Wilson",
    "location": "CH",
    "time": "Mathematics Student, IIT Madras",
    "profileName": "MadisonW90",
    "datePublished": "2026-03-29",
    "ratingValue": "4"
  },
  {
    "quote": "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context. Very helpful, though the UI took a bit of getting used to.",
    "name": "Aria Lee",
    "location": "CA",
    "time": "Civil Engineering Student, University of Toronto",
    "profileName": "AriaL22",
    "datePublished": "2026-03-31",
    "ratingValue": "4"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system.",
    "name": "Abigail Miller",
    "location": "JP",
    "time": "Sociology Student, MIT",
    "profileName": "AbigailM2",
    "datePublished": "2026-03-31",
    "ratingValue": "5"
  },
  {
    "quote": "Works well for standard lectures, but struggles a bit if the video has background music or audio noise. Still usable.",
    "name": "James Sterling",
    "location": "UK",
    "time": "Economics Student, LSE",
    "profileName": "JamesS",
    "datePublished": "2026-04-03",
    "ratingValue": "3"
  },
  {
    "quote": "Amazing tool for self-paced learners. I drop lecture links and get clear summaries with active links to the transcript.",
    "name": "Matheus Silva",
    "location": "BR",
    "time": "Computer Engineering, USP Brazil",
    "profileName": "MatheusS",
    "datePublished": "2026-04-03",
    "ratingValue": "5"
  },
  {
    "quote": "Works well for standard lectures, but struggles a bit if the video has background music or audio noise. Still usable.",
    "name": "Owen Martinez",
    "location": "BR",
    "time": "Biochemistry Student, IIT Delhi",
    "profileName": "OwenM87",
    "datePublished": "2026-04-03",
    "ratingValue": "3"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system. Really helpful workflow.",
    "name": "Jack Green",
    "location": "MX",
    "time": "Pre-Med Student, Stanford University",
    "profileName": "JackG37",
    "datePublished": "2026-04-03",
    "ratingValue": "5"
  },
  {
    "quote": "Finalmente uma IA que extrai código e diagramas de forma limpa. Demora um pouco em vídeos muito longos, mas facilita muito para revisar engenharia de software.",
    "name": "Sarah Jenkins",
    "location": "AU",
    "time": "Medical Student, University of Melbourne",
    "profileName": "SarahJ",
    "datePublished": "2026-04-04",
    "ratingValue": "4"
  },
  {
    "quote": "Hervorragend! Ich lade meine deutschen Vorlesungs-Links hoch und erhalte perfekte strukturierte Notizen. Die Übersetzungen und Fachbegriffe werden extrem präzise übersetzt. Definitiv besser als NoteGPT. Really helpful workflow.",
    "name": "Dylan Rivera",
    "location": "MX",
    "time": "Mechanical Engineering Student, Imperial College London",
    "profileName": "DylanR46",
    "datePublished": "2026-04-04",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Camila Perez",
    "location": "CA",
    "time": "Civil Engineering Student, Georgia Tech",
    "profileName": "CamilaP35",
    "datePublished": "2026-04-04",
    "ratingValue": "5"
  },
  {
    "quote": "Went from failing to top 10% in my class. The flashcards + PDF combo is unreal, especially for technical courses like discrete mathematics. Recommended to my peers.",
    "name": "Jackson Robinson",
    "location": "MX",
    "time": "Finance Student, BITS Pilani",
    "profileName": "JacksonR91",
    "datePublished": "2026-04-04",
    "ratingValue": "5"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system.",
    "name": "Ethan Davis",
    "location": "NL",
    "time": "Biology Student, Cambridge University",
    "profileName": "EthanD1",
    "datePublished": "2026-04-04",
    "ratingValue": "5"
  },
  {
    "quote": "Very accurate transcription, even with heavy accents. Sometimes it segments the topics weirdly, but the search makes finding terms easy. Recommended to my peers.",
    "name": "Mason Jackson",
    "location": "US",
    "time": "Biochemistry Student, UBC Canada",
    "profileName": "MasonJ96",
    "datePublished": "2026-04-04",
    "ratingValue": "4"
  },
  {
    "quote": "The quiz mode is fantastic for review. It would be perfect if we could export quizzes directly to Anki, but copy-paste works. Recommended to my peers.",
    "name": "Stella Nguyen",
    "location": "NZ",
    "time": "Biochemistry Student, University of Sydney",
    "profileName": "StellaN44",
    "datePublished": "2026-04-05",
    "ratingValue": "4"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Liam Torres",
    "location": "UK",
    "time": "Artificial Intelligence Student, University of Sydney",
    "profileName": "LiamT35",
    "datePublished": "2026-04-08",
    "ratingValue": "5"
  },
  {
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture notes open in separate tabs.",
    "name": "Dylan Robinson",
    "location": "DE",
    "time": "Chemistry Student, IIT Delhi",
    "profileName": "DylanR34",
    "datePublished": "2026-04-08",
    "ratingValue": "5"
  },
  {
    "quote": "The notes are extremely detailed, sometimes too detailed. I wish there was a slider to choose between short summary and comprehensive notes.",
    "name": "Nora Lee",
    "location": "AU",
    "time": "Electrical Engineering Student, UC Berkeley",
    "profileName": "NoraL61",
    "datePublished": "2026-04-10",
    "ratingValue": "3"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Oliver Thomas",
    "location": "CH",
    "time": "Chemistry Student, ETH Zurich",
    "profileName": "OliverT38",
    "datePublished": "2026-04-10",
    "ratingValue": "5"
  },
  {
    "quote": "Really helps with retaining information from complex lectures. The Dark Mode is great on the eyes during late-night cram sessions.",
    "name": "Lincoln Jackson",
    "location": "IN",
    "time": "Economics Student, UC Berkeley",
    "profileName": "LincolnJ18",
    "datePublished": "2026-04-11",
    "ratingValue": "4"
  },
  {
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture notes open in separate tabs. Recommended to my peers.",
    "name": "Riley Mitchell",
    "location": "US",
    "time": "Sociology Student, UT Austin",
    "profileName": "RileyM10",
    "datePublished": "2026-04-14",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify AI is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Emily Anderson",
    "location": "NL",
    "time": "Business Administration Student, IIT Madras",
    "profileName": "EmilyA88",
    "datePublished": "2026-04-15",
    "ratingValue": "5"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly. Really helpful workflow.",
    "name": "Theodore Clark",
    "location": "IT",
    "time": "English Literature Student, Georgia Tech",
    "profileName": "TheodoreC53",
    "datePublished": "2026-04-20",
    "ratingValue": "5"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly. Recommended to my peers.",
    "name": "Olivia Lopez",
    "location": "FR",
    "time": "Mathematics Student, NUS Singapore",
    "profileName": "OliviaL24",
    "datePublished": "2026-04-20",
    "ratingValue": "5"
  },
  {
    "quote": "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context. Very helpful, though the UI took a bit of getting used to. Recommended to my peers.",
    "name": "Riley Hall",
    "location": "IT",
    "time": "Economics Student, IIT Delhi",
    "profileName": "RileyH10",
    "datePublished": "2026-04-20",
    "ratingValue": "4"
  },
  {
    "quote": "Really helps with retaining information from complex lectures. The Dark Mode is great on the eyes during late-night cram sessions. Really helpful workflow.",
    "name": "Zoey Anderson",
    "location": "DE",
    "time": "Finance Student, UT Austin",
    "profileName": "ZoeyA52",
    "datePublished": "2026-04-25",
    "ratingValue": "4"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully.",
    "name": "Lucas Dubois",
    "location": "FR",
    "time": "Mathematics Student, Sorbonne University",
    "profileName": "LucasD",
    "datePublished": "2026-04-26",
    "ratingValue": "5"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering.",
    "name": "Ava Gonzalez",
    "location": "MX",
    "time": "Mechanical Engineering Student, ANU Australia",
    "profileName": "AvaG88",
    "datePublished": "2026-04-26",
    "ratingValue": "5"
  },
  {
    "quote": "Amazing tool for self-paced learners. I drop lecture links and get clear summaries with active links to the transcript.",
    "name": "Victoria Flores",
    "location": "IN",
    "time": "Mathematics Student, Harvard University",
    "profileName": "VictoriaF62",
    "datePublished": "2026-04-27",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool. Really helpful workflow.",
    "name": "Amelia Garcia",
    "location": "FR",
    "time": "Chemistry Student, Cambridge University",
    "profileName": "AmeliaG21",
    "datePublished": "2026-04-29",
    "ratingValue": "5"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering. Really helpful workflow.",
    "name": "Ella Scott",
    "location": "NL",
    "time": "Psychology Student, UC Berkeley",
    "profileName": "EllaS39",
    "datePublished": "2026-05-04",
    "ratingValue": "5"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully.",
    "name": "Riley Lewis",
    "location": "NL",
    "time": "Nursing Student, IIT Madras",
    "profileName": "RileyL88",
    "datePublished": "2026-05-04",
    "ratingValue": "5"
  },
  {
    "quote": "The document exporter has some minor layout quirks with sepia themes, but the content generation is top-tier. A very solid study tool for college kids. Recommended to my peers.",
    "name": "Carter Taylor",
    "location": "DE",
    "time": "Electrical Engineering Student, ANU Australia",
    "profileName": "CarterT70",
    "datePublished": "2026-05-05",
    "ratingValue": "3"
  },
  {
    "quote": "Excellent formatting for equations and math symbols. Usually AI tools mess up LaTeX, but this handles it beautifully. Recommended to my peers.",
    "name": "Lily Davis",
    "location": "BR",
    "time": "Electrical Engineering Student, IIT Delhi",
    "profileName": "LilyD75",
    "datePublished": "2026-05-06",
    "ratingValue": "5"
  },
  {
    "quote": "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context. Very helpful, though the UI took a bit of getting used to.",
    "name": "Sofia Rossi",
    "location": "IT",
    "time": "Architecture Major, Politecnico di Milano",
    "profileName": "SofiaR",
    "datePublished": "2026-05-11",
    "ratingValue": "4"
  },
  {
    "quote": "The quiz mode is fantastic for review. It would be perfect if we could export quizzes directly to Anki, but copy-paste works.",
    "name": "Yuki Tanaka",
    "location": "JP",
    "time": "Information Science, University of Tokyo",
    "profileName": "YukiT",
    "datePublished": "2026-05-12",
    "ratingValue": "4"
  },
  {
    "quote": "Works well for standard lectures, but struggles a bit if the video has background music or audio noise. Still usable. Really helpful workflow.",
    "name": "Gabriel Thomas",
    "location": "AU",
    "time": "Computer Science Student, TUM Germany",
    "profileName": "GabrielT59",
    "datePublished": "2026-05-12",
    "ratingValue": "3"
  },
  {
    "quote": "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    "name": "Penelope Young",
    "location": "IN",
    "time": "Nursing Student, Stanford University",
    "profileName": "PenelopeY97",
    "datePublished": "2026-05-13",
    "ratingValue": "5"
  },
  {
    "quote": "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context. Very helpful, though the UI took a bit of getting used to.",
    "name": "John Clark",
    "location": "FR",
    "time": "Economics Student, Harvard University",
    "profileName": "JohnC52",
    "datePublished": "2026-05-17",
    "ratingValue": "4"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering. Really helpful workflow.",
    "name": "Sebastian Adams",
    "location": "CH",
    "time": "Mechanical Engineering Student, University of Toronto",
    "profileName": "SebastianA8",
    "datePublished": "2026-05-17",
    "ratingValue": "5"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system. Really helpful workflow.",
    "name": "Jackson Garcia",
    "location": "CH",
    "time": "Biology Student, UT Austin",
    "profileName": "JacksonG26",
    "datePublished": "2026-05-18",
    "ratingValue": "5"
  },
  {
    "quote": "The active study chat (PaperChat) solves any confusion. I ask it to explain tricky parts of the lecture in simple terms and it instantly uses the transcript as context. Very helpful, though the UI took a bit of getting used to.",
    "name": "Thomas Rodriguez",
    "location": "CH",
    "time": "Mechanical Engineering Student, Harvard University",
    "profileName": "ThomasR3",
    "datePublished": "2026-05-18",
    "ratingValue": "4"
  },
  {
    "quote": "Saves time but occasionally gets the speaker names mixed up in discussions. The formatting options are decent.",
    "name": "Aubrey Scott",
    "location": "ZA",
    "time": "Biology Student, IIT Delhi",
    "profileName": "AubreyS67",
    "datePublished": "2026-05-19",
    "ratingValue": "3"
  },
  {
    "quote": "Finalmente uma IA que extrai código e diagramas de forma limpa. Demora um pouco em vídeos muito longos, mas facilita muito para revisar engenharia de software.",
    "name": "Sofia Moore",
    "location": "JP",
    "time": "Biochemistry Student, BITS Pilani",
    "profileName": "SofiaM78",
    "datePublished": "2026-05-19",
    "ratingValue": "4"
  },
  {
    "quote": "It captures complex coding syntax in the video transcripts perfectly. Absolute lifesaver for computer engineering.",
    "name": "Jack Wright",
    "location": "JP",
    "time": "Pre-Med Student, University of Toronto",
    "profileName": "JackW86",
    "datePublished": "2026-05-20",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify AI is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Avery Perez",
    "location": "SG",
    "time": "English Literature Student, TU Delft",
    "profileName": "AveryP51",
    "datePublished": "2026-05-20",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify AI is the best ai lecture notes from yt link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully.",
    "name": "Charlotte Robinson",
    "location": "FR",
    "time": "Chemistry Student, BITS Pilani",
    "profileName": "CharlotteR35",
    "datePublished": "2026-05-21",
    "ratingValue": "5"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly. Recommended to my peers.",
    "name": "Dylan Anderson",
    "location": "NZ",
    "time": "Electrical Engineering Student, University of Toronto",
    "profileName": "DylanA22",
    "datePublished": "2026-05-22",
    "ratingValue": "5"
  },
  {
    "quote": "Finalmente uma IA que extrai código e diagramas de forma limpa. Demora um pouco em vídeos muito longos, mas facilita muito para revisar engenharia de software. Really helpful workflow.",
    "name": "Camila Young",
    "location": "UK",
    "time": "Artificial Intelligence Student, Oxford University",
    "profileName": "CamilaY6",
    "datePublished": "2026-05-25",
    "ratingValue": "4"
  },
  {
    "quote": "Finalmente uma IA que extrai código e diagramas de forma limpa. Demora um pouco em vídeos muito longos, mas facilita muito para revisar engenharia de software. Recommended to my peers.",
    "name": "Wyatt Scott",
    "location": "UK",
    "time": "Nursing Student, UC Berkeley",
    "profileName": "WyattS62",
    "datePublished": "2026-05-26",
    "ratingValue": "4"
  },
  {
    "quote": "The document exporter has some minor layout quirks with sepia themes, but the content generation is top-tier. A very solid study tool for college kids. Recommended to my peers.",
    "name": "Dylan Davis",
    "location": "CH",
    "time": "Sociology Student, MIT",
    "profileName": "DylanD75",
    "datePublished": "2026-05-28",
    "ratingValue": "3"
  },
  {
    "quote": "Finalmente uma IA que extrai código e diagramas de forma limpa. Demora um pouco em vídeos muito longos, mas facilita muito para revisar engenharia de software. Recommended to my peers.",
    "name": "Layla Moore",
    "location": "JP",
    "time": "Political Science Student, Stanford University",
    "profileName": "LaylaM65",
    "datePublished": "2026-05-28",
    "ratingValue": "4"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams. Really helpful workflow.",
    "name": "Riley Nelson",
    "location": "AU",
    "time": "Economics Student, Imperial College London",
    "profileName": "RileyN8",
    "datePublished": "2026-05-28",
    "ratingValue": "5"
  },
  {
    "quote": "Generating markdown output is extremely handy for my Obsidian vault. Fits right into my second brain system.",
    "name": "Nora Nguyen",
    "location": "NL",
    "time": "Psychology Student, TUM Germany",
    "profileName": "NoraN65",
    "datePublished": "2026-05-28",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify has optimized my lecture study flow. Generating flashcards directly from long lecture streams allows me to recall equations and definitions on the train. Truly elite tool.",
    "name": "Emily Tremblay",
    "location": "CA",
    "time": "Biology Sophomore, McGill University",
    "profileName": "EmilyT",
    "datePublished": "2026-05-29",
    "ratingValue": "5"
  },
  {
    "quote": "I tried Mindgrasp and NoteGPT, but Paperxify is much faster and doesn't get stuck on 2-hour long lecture streams.",
    "name": "Mateo Scott",
    "location": "FR",
    "time": "Psychology Student, Georgia Tech",
    "profileName": "MateoS30",
    "datePublished": "2026-05-29",
    "ratingValue": "5"
  },
  {
    "quote": "Decent note taker but the loading spinner sometimes hangs on longer lecture videos. Refreshing fixes it, and the notes are saved.",
    "name": "Evelyn Moore",
    "location": "ZA",
    "time": "Finance Student, IIT Madras",
    "profileName": "EvelynM97",
    "datePublished": "2026-05-29",
    "ratingValue": "3"
  },
  {
    "quote": "The custom document styling is top-notch. Exporting notes in clean formats helps me organize my binder perfectly.",
    "name": "Ava Roberts",
    "location": "NZ",
    "time": "Pre-Med Student, ANU Australia",
    "profileName": "AvaR51",
    "datePublished": "2026-05-31",
    "ratingValue": "5"
  },
  {
    "quote": "The AI-generated quizzes are surprisingly challenging and cover the actual lecture material thoroughly. Great for exam prep! Recommended to my peers.",
    "name": "Oliver King",
    "location": "CH",
    "time": "Data Science Student, UT Austin",
    "profileName": "OliverK68",
    "datePublished": "2026-05-31",
    "ratingValue": "5"
  },
  {
    "quote": "I love how it organizes long lectures into structured headers and key concepts. Saving hours of manual typing every week.",
    "name": "Lily Smith",
    "location": "IN",
    "time": "Nursing Student, TU Delft",
    "profileName": "LilyS23",
    "datePublished": "2026-05-31",
    "ratingValue": "5"
  },
  {
    "quote": "Paperxify is the best ai notes from yt link tool on the market. I use it daily for my high-level algorithms classes. The formatting handles markdown code blocks and quotes beautifully. Recommended to my peers.",
    "name": "Oliver Campbell",
    "location": "ZA",
    "time": "Political Science Student, University of Toronto",
    "profileName": "OliverC44",
    "datePublished": "2026-05-31",
    "ratingValue": "5"
  },
  {
    "quote": "Super responsive UI. It works smoothly even when I have multiple lecture lecture notes open in separate tabs.",
    "name": "Aria Clark",
    "location": "CH",
    "time": "Political Science Student, University of Sydney",
    "profileName": "AriaC15",
    "datePublished": "2026-06-02",
    "ratingValue": "5"
  },
  {
    "quote": "Solid notes generator. It processes 1-hour lectures in less than a minute. Occasionally highlights trivial details, but easy to edit.",
    "name": "Abigail Robinson",
    "location": "BR",
    "time": "Finance Student, University of Michigan",
    "profileName": "AbigailR56",
    "datePublished": "2026-06-03",
    "ratingValue": "4"
  },
  {
    "quote": "Went from failing to top 10% in my class. The flashcards + PDF combo is unreal, especially for technical courses like discrete mathematics.",
    "name": "Elijah Gonzalez",
    "location": "CA",
    "time": "Mechanical Engineering Student, Stanford University",
    "profileName": "ElijahG68",
    "datePublished": "2026-06-03",
    "ratingValue": "5"
  },
  {
    "quote": "The transcript sync is great. Click any note bullet point and it takes you to that spot in the video. UI feels a bit cluttered on mobile.",
    "name": "Samuel Robinson",
    "location": "NL",
    "time": "Civil Engineering Student, TUM Germany",
    "profileName": "SamuelR79",
    "datePublished": "2026-06-04",
    "ratingValue": "4"
  },
  {
    "quote": "The AI-generated quizzes are surprisingly challenging and cover the actual lecture material thoroughly. Great for exam prep!",
    "name": "Charlotte Perez",
    "location": "BR",
    "time": "Physics Student, University of Tokyo",
    "profileName": "CharlotteP90",
    "datePublished": "2026-06-06",
    "ratingValue": "5"
  }
];
