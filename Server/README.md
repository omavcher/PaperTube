# Notes Maker Backend

## Overview
Notes Maker is a simple backend application built with Node.js, Express, and MongoDB. It allows users to create and manage notes with a title, content, and an optional video URL.

## Features
- Create new notes
- Retrieve all notes
- Error handling middleware

## Technologies Used
- Node.js
- Express
- MongoDB (Mongoose)
- dotenv
- CORS

## Getting Started

### Prerequisites
- Node.js installed on your machine
- MongoDB installed and running locally

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd notes-maker-backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Configuration
1. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/notesMaker
   ```

### Running the Application
To start the server in development mode, run:
```
npm run dev
```
The backend will be live at `http://localhost:5000/api/notes`.

### API Endpoints
- **GET /api/notes**: Retrieve all notes
- **POST /api/notes**: Create a new note

### Example Usage
To fetch all notes, you can use the following fetch request in your frontend application:
```javascript
fetch("http://localhost:5000/api/notes")
  .then(res => res.json())
  .then(data => console.log(data));
```

## License
This project is licensed under the MIT License.