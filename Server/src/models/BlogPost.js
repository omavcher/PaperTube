const mongoose = require('mongoose');

const ContentBlockSchema = new mongoose.Schema({
  id: String,
  type: { type: String, required: true },
  text: String,
  level: Number,
  author: String,
  src: String,
  caption: String,
  code: String,
  language: String,
  items: [String],
  headers: [String],
  rows: [[String]]
}, { _id: false });

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: String,
  slug: { type: String, required: true, unique: true },
  author: {
    name: { type: String, default: "Admin" },
    role: { type: String, default: "Editor" },
    avatar: String
  },
  meta: {
    readTime: { type: String, default: "5 min" },
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 } 
  },
  tags: [String],
  coverImage: String,
  toc: [{ id: String, label: String }],
  content: [ContentBlockSchema],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);