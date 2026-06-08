const fs = require('fs');
const path = require('path');

const regions = {
  us: {
    unis: ["Stanford University", "MIT", "Harvard University", "Princeton University", "Yale University", "UC Berkeley", "Columbia University", "UCLA", "Caltech", "University of Chicago"],
    courses: ["Computer Science", "Molecular Biology", "Macroeconomics", "Organic Chemistry", "Astrophysics", "Calculus BC", "US History", "Psychology"],
    exams: ["AP Computer Science A", "AP Biology", "AP Macroeconomics", "SAT Math", "ACT Science", "AP US History", "AP Psychology", "AP Chemistry"],
    names: ["Emma Smith", "Liam Miller", "Olivia Davis", "Noah Garcia", "Ava Rodriguez", "William Wilson", "Sophia Martinez", "James Anderson", "Isabella Thomas", "Benjamin Taylor", "Mia Moore", "Lucas Jackson", "Charlotte Martin", "Henry Lee", "Amelia Perez", "Alexander Thompson", "Harper White", "Michael Harris", "Evelyn Sanchez", "Elijah Clark"],
    templates: [
      "Paperxify transformed how I study for {exam} at {uni}. The PDF layouts are print-ready!",
      "Summarizing long lecture streams for {course} is instant. Absolutely essential study hack.",
      "The custom flashcards for {exam} save me hours of manual note-taking every week.",
      "Highly recommend this to anyone taking {course}. The math solver handles formulas perfectly.",
      "Went from struggling in {course} to top of my class at {uni}. Truly elite tool."
    ]
  },
  uk: {
    unis: ["University of Oxford", "University of Cambridge", "London School of Economics (LSE)", "UCL", "Imperial College London", "King's College London", "University of Edinburgh", "University of Manchester", "University of Warwick", "University of Bristol"],
    courses: ["Modern History", "Pure Mathematics", "Theoretical Physics", "Economics & Finance", "Biomedical Science", "English Literature", "Law", "Computer Science"],
    exams: ["A-Level Physics", "GCSE Mathematics", "GCSE Chemistry", "A-Level Economics", "A-Level Mathematics", "GCSE Biology", "A-Level Chemistry", "Oxbridge Admissions Test"],
    names: ["Oliver Jones", "George Taylor", "Harry Brown", "Jack Williams", "Jacob Wilson", "Leo Johnson", "Arthur Davies", "Oscar Robinson", "Charlie Wright", "Thomas Thompson", "Amelia Evans", "Isla Roberts", "Emily Carter", "Ava Walker", "Lily Green", "Freya Hughes", "Evie Edwards", "Grace Lewis", "Mia Hall", "Poppy Hill"],
    templates: [
      "Superb tool for {exam} revision at {uni}. The Markdown notes sync perfectly to Obsidian.",
      "Honestly the best study aid for {course}. Transcribing lectures is extremely accurate.",
      "Auto generating flashcards for {exam} changed my entire revision workflow.",
      "Brilliant interface. Navigating through {course} transcripts is so simple on mobile.",
      "Essential for {exam} prep. The structural breakdowns help clarify tricky topics."
    ]
  },
  ca: {
    unis: ["University of Toronto", "University of British Columbia (UBC)", "McGill University", "University of Waterloo", "McMaster University", "University of Alberta", "Queen's University", "Western University"],
    courses: ["Biochemistry", "Civil Engineering", "Cognitive Science", "Software Engineering", "Political Science", "Calculus", "Earth Sciences", "Cellular Biology"],
    exams: ["Ontario OSSLT", "BC Provincial Exam", "AP Biology", "AP Calculus BC", "AP English Literature", "Provincial Math Exam"],
    names: ["William Roy", "Logan Tremblay", "Benjamin Gagnon", "Noah Leblanc", "Lucas Cote", "Oliver Bouchard", "Ethan Gauthier", "Liam Morin", "Lucas Lavoie", "Jacob Fortin", "Emma Pelletier", "Olivia Belanger", "Charlotte Gagnon", "Sophia Bilodeau", "Amelia Gill", "Chloe Roy", "Ella Tremblay", "Maya Leblanc", "Zoe Cote", "Abigail Bouchard"],
    templates: [
      "Outstanding notes quality for {course} at {uni}. Very helpful format layouts.",
      "Helps me summarize massive slide decks and {exam} prep videos in minutes.",
      "The translation features and {course} flashcards are highly precise.",
      "Obsidian exports are clean. A lifesaver for {exam} prep.",
      "I use it daily at {uni} for {course}. The AI study room resolves any math doubts instantly."
    ]
  },
  au: {
    unis: ["University of Melbourne", "University of Sydney", "Australian National University (ANU)", "UNSW Sydney", "University of Queensland", "Monash University", "University of Western Australia", "University of Adelaide"],
    courses: ["Marine Biology", "Mechanical Engineering", "Financial Mathematics", "Data Science", "Psychology", "Clinical Anatomy", "Accounting", "Chemistry"],
    exams: ["NSW HSC Physics", "Victorian VCE Maths", "WACE Chemistry", "ATAR Physics", "ATAR Chemistry", "ATAR Biology", "ATAR Mathematics"],
    names: ["Jack Smith", "William Jones", "Noah Williams", "Oliver Brown", "Thomas Taylor", "Lucas Davies", "Henry Wilson", "Ethan Evans", "Alexander Thomas", "James Roberts", "Charlotte Johnson", "Amelia Smith", "Olivia Jones", "Isla Williams", "Emily Brown", "Mia Taylor", "Ava Davies", "Lily Wilson", "Chloe Evans", "Grace Thomas"],
    templates: [
      "Optimized my HSC revision for {exam}. The diagrams look beautiful.",
      "Truly elite tool for {course} at {uni}. Makes ATAR preparation so much simpler.",
      "Converting lecture streams directly to flashcards helps me study on the train.",
      "Paperxify is the best AI YouTube notes generator. 10/10 for {course} prep.",
      "Passed my {exam} with high marks thanks to these summaries. Highly recommend!"
    ]
  },
  de: {
    unis: ["LMU München", "TU Berlin", "Heidelberg Universität", "Humboldt-Universität Berlin", "RWTH Aachen", "Karlsruher Institut für Technologie", "Universität Hamburg", "TU München"],
    courses: ["Informatik", "Maschinenbau", "Elektrotechnik", "Biochemie", "Volkswirtschaftslehre", "Physik", "Jura", "Medizin"],
    exams: ["Abitur Mathematik", "Abitur Physik", "Abitur Deutsch", "Abitur Biologie", "Abitur Chemie", "Numerus Clausus Prep"],
    names: ["Lukas Schmidt", "Leon Müller", "Ben Weber", "Finn Fischer", "Jonas Becker", "Luis Hoffmann", "Maximilian Wagner", "Felix Meyer", "Noah Schulz", "Elias Becker", "Emma Schmidt", "Mia Müller", "Sofia Weber", "Lina Fischer", "Mila Becker", "Ella Hoffmann", "Clara Wagner", "Lea Meyer", "Marie Schulz", "Leni Becker"],
    templates: [
      "Perfekte Zusammenfassungen für {exam} an der {uni}. Sehr zu empfehlen!",
      "Die Übersetzungen von englischen Fachvorträgen ins Deutsche für {course} sind extrem präzise.",
      "Sp spart mir Stunden beim Erstellen von Karteikarten für {course}. Geniales Tool.",
      "Sehr gute Struktur. Formeln und Programmcode werden fehlerfrei extrahiert.",
      "Die Notizen für {course} an der {uni} helfen mir enorm bei der Klausurvorbereitung."
    ]
  }
};

const database = {};

for (const [region, data] of Object.entries(regions)) {
  database[region] = {
    region: region,
    testimonials: []
  };

  for (let i = 0; i < 20; i++) {
    const name = data.names[i];
    const uni = data.unis[i % data.unis.length];
    const course = data.courses[i % data.courses.length];
    const exam = data.exams[i % data.exams.length];
    
    // Select a template
    const template = data.templates[i % data.templates.length];
    const quote = template.replace("{uni}", uni).replace("{course}", course).replace("{exam}", exam);
    
    // Distribute ratings: mostly 5, some 4, one 3 for realism
    let rating = 5;
    if (i === 7 || i === 15) rating = 4;
    if (i === 11) rating = 3;

    database[region].testimonials.push({
      name,
      university: uni,
      course,
      quote,
      rating,
      exam
    });
  }
}

const outputPath = path.join(__dirname, '../src/data/testimonials-local.json');
fs.writeFileSync(outputPath, JSON.stringify(database, null, 2));
console.log(`✅ Generated 100 localized testimonials at: ${outputPath}`);
