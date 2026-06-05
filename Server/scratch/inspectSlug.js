const mongoose = require('c:/Users/Om Awchar/Documents/paperxify/Server/node_modules/mongoose');
const MONGO_URI = "mongodb://127.0.0.1:27017/NoteFlux";

// Define schema
const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  img_with_url: Array
}, { strict: false });

const Note = mongoose.model('Note', NoteSchema);

async function inspect() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");
    
    // Find note by slug
    const slug = "notes-reproduction-complete-unit-in-one-shot-all-c-4d1c5cd0";
    let note = await Note.findOne({ slug });
    
    if (!note) {
      console.log(`Note with slug ${slug} not found!`);
      process.exit(1);
    }
    
    console.log("--- NOTE INFO ---");
    console.log("ID:", note._id);
    console.log("Title:", note.title);
    console.log("Content length:", note.content?.length);
    console.log("--- CONTENT PREVIEW ---");
    console.log(note.content ? note.content.substring(0, 1000) : "No content");
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

inspect();
