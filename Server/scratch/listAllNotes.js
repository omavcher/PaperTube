const mongoose = require('c:/Users/Om Awchar/Documents/paperxify/Server/node_modules/mongoose');
const MONGO_URI = "mongodb://127.0.0.1:27017/NoteFlux";

// Define schema
const NoteSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  generationDetails: Object
}, { strict: false });

const Note = mongoose.model('Note', NoteSchema);

async function listNotes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
    
    const notes = await Note.find().sort({ createdAt: -1 }).limit(10);
    
    notes.forEach((note, i) => {
      console.log(`\n--- NOTE ${i} ---`);
      console.log("ID:", note._id);
      console.log("Slug:", note.slug);
      console.log("Title:", note.title);
      console.log("Format:", note.generationDetails?.format);
      console.log("Model:", note.generationDetails?.model);
      console.log("Content Preview (first 250 chars):", JSON.stringify(note.content?.substring(0, 250)));
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

listNotes();
