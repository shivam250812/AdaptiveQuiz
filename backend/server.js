const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Seed Data
const seedData = [
  // Math Easy
  { id: 'm_e1', subject: 'math', difficulty: 'easy', question: 'What is 15 + 27?', options: JSON.stringify(['32', '42', '45', '38']), answer: '42' },
  { id: 'm_e2', subject: 'math', difficulty: 'easy', question: 'What is the square root of 64?', options: JSON.stringify(['6', '8', '10', '12']), answer: '8' },
  { id: 'm_e3', subject: 'math', difficulty: 'easy', question: 'Solve for x: x - 5 = 10', options: JSON.stringify(['5', '15', '2', '20']), answer: '15' },
  { id: 'm_e4', subject: 'math', difficulty: 'easy', question: 'What is 5 × 8?', options: JSON.stringify(['35', '40', '45', '50']), answer: '40' },
  { id: 'm_e5', subject: 'math', difficulty: 'easy', question: 'What is half of 50?', options: JSON.stringify(['20', '25', '30', '35']), answer: '25' },
  // Math Medium
  { id: 'm_m1', subject: 'math', difficulty: 'medium', question: 'What is the value of pi to two decimal places?', options: JSON.stringify(['3.12', '3.14', '3.16', '3.18']), answer: '3.14' },
  { id: 'm_m2', subject: 'math', difficulty: 'medium', question: 'Solve for x: 2x + 4 = 16', options: JSON.stringify(['6', '8', '10', '12']), answer: '6' },
  { id: 'm_m3', subject: 'math', difficulty: 'medium', question: 'What is 15% of 200?', options: JSON.stringify(['15', '20', '30', '40']), answer: '30' },
  { id: 'm_m4', subject: 'math', difficulty: 'medium', question: 'What is the area of a square with side length 5?', options: JSON.stringify(['20', '25', '10', '15']), answer: '25' },
  { id: 'm_m5', subject: 'math', difficulty: 'medium', question: 'If a triangle has angles 90° and 45°, what is the third angle?', options: JSON.stringify(['30°', '45°', '60°', '90°']), answer: '45°' },
  // Math Hard
  { id: 'm_h1', subject: 'math', difficulty: 'hard', question: 'Solve for x: x² - 5x + 6 = 0', options: JSON.stringify(['x=1, x=6', 'x=2, x=3', 'x=-2, x=-3', 'x=3, x=4']), answer: 'x=2, x=3' },
  { id: 'm_h2', subject: 'math', difficulty: 'hard', question: 'What is the derivative of x²?', options: JSON.stringify(['x', '2x', 'x²/2', '2']), answer: '2x' },
  { id: 'm_h3', subject: 'math', difficulty: 'hard', question: 'In a right triangle, if sides are 3 and 4, what is the hypotenuse?', options: JSON.stringify(['5', '6', '7', '8']), answer: '5' },
  { id: 'm_h4', subject: 'math', difficulty: 'hard', question: 'What is the sum of angles in a hexagon?', options: JSON.stringify(['360°', '540°', '720°', '900°']), answer: '720°' },
  { id: 'm_h5', subject: 'math', difficulty: 'hard', question: 'Simplify: (a+b)²', options: JSON.stringify(['a²+b²', 'a²+2ab+b²', 'a²-2ab+b²', 'a²+ab+b²']), answer: 'a²+2ab+b²' },
  // Science Easy
  { id: 's_e1', subject: 'science', difficulty: 'easy', question: 'What planet is known as the Red Planet?', options: JSON.stringify(['Venus', 'Jupiter', 'Mars', 'Saturn']), answer: 'Mars' },
  { id: 's_e2', subject: 'science', difficulty: 'easy', question: 'What is the boiling point of water in Celsius?', options: JSON.stringify(['50°C', '90°C', '100°C', '120°C']), answer: '100°C' },
  { id: 's_e3', subject: 'science', difficulty: 'easy', question: 'What gas do humans breathe out?', options: JSON.stringify(['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium']), answer: 'Carbon Dioxide' },
  { id: 's_e4', subject: 'science', difficulty: 'easy', question: 'Which part of the plant conducts photosynthesis?', options: JSON.stringify(['Root', 'Stem', 'Leaf', 'Flower']), answer: 'Leaf' },
  { id: 's_e5', subject: 'science', difficulty: 'easy', question: 'How many legs does a spider have?', options: JSON.stringify(['6', '8', '10', '12']), answer: '8' },
  // Science Medium
  { id: 's_m1', subject: 'science', difficulty: 'medium', question: 'What is the chemical symbol for Gold?', options: JSON.stringify(['Ag', 'Au', 'Gd', 'Go']), answer: 'Au' },
  { id: 's_m2', subject: 'science', difficulty: 'medium', question: 'What is the powerhouse of the cell?', options: JSON.stringify(['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum']), answer: 'Mitochondria' },
  { id: 's_m3', subject: 'science', difficulty: 'medium', question: 'Which force keeps planets in orbit?', options: JSON.stringify(['Magnetism', 'Friction', 'Gravity', 'Tension']), answer: 'Gravity' },
  { id: 's_m4', subject: 'science', difficulty: 'medium', question: 'What type of rock is formed from volcanic lava?', options: JSON.stringify(['Sedimentary', 'Metamorphic', 'Igneous', 'Limestone']), answer: 'Igneous' },
  { id: 's_m5', subject: 'science', difficulty: 'medium', question: 'What is the speed of light?', options: JSON.stringify(['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '50,000 km/s']), answer: '300,000 km/s' },
  // Science Hard
  { id: 's_h1', subject: 'science', difficulty: 'hard', question: 'What is the most abundant gas in Earth\'s atmosphere?', options: JSON.stringify(['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen']), answer: 'Nitrogen' },
  { id: 's_h2', subject: 'science', difficulty: 'hard', question: 'What law states that for every action, there is an equal and opposite reaction?', options: JSON.stringify(['Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Law of Gravity']), answer: 'Newton\'s Third Law' },
  { id: 's_h3', subject: 'science', difficulty: 'hard', question: 'What is the pH level of pure water?', options: JSON.stringify(['5', '6', '7', '8']), answer: '7' },
  { id: 's_h4', subject: 'science', difficulty: 'hard', question: 'Which particle in an atom has a negative charge?', options: JSON.stringify(['Proton', 'Neutron', 'Electron', 'Photon']), answer: 'Electron' },
  { id: 's_h5', subject: 'science', difficulty: 'hard', question: 'What process do cells use to divide?', options: JSON.stringify(['Meiosis', 'Mitosis', 'Osmosis', 'Diffusion']), answer: 'Mitosis' },
];

let db;

// Initialize Database
async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      subject TEXT,
      difficulty TEXT,
      question TEXT,
      options TEXT,
      answer TEXT
    )
  `);

  // Check if DB is already seeded
  const countRes = await db.get(`SELECT COUNT(*) as count FROM questions`);
  if (countRes.count === 0) {
    console.log("Seeding database...");
    const stmt = await db.prepare(`INSERT INTO questions (id, subject, difficulty, question, options, answer) VALUES (?, ?, ?, ?, ?, ?)`);
    for (const q of seedData) {
      await stmt.run(q.id, q.subject, q.difficulty, q.question, q.options, q.answer);
    }
    await stmt.finalize();
    console.log("Database seeded successfully.");
  } else {
    console.log(`Database already seeded with ${countRes.count} questions.`);
  }
}

// API Route to fetch questions by subject
app.get('/api/questions', async (req, res) => {
  const { subject } = req.query;
  
  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  try {
    const rows = await db.all(`SELECT * FROM questions WHERE subject = ?`, [subject]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No questions found for this subject' });
    }

    // Transform flat DB rows into the nested structure the frontend expects:
    // { easy: [], medium: [], hard: [] }
    const formattedData = { easy: [], medium: [], hard: [] };
    
    rows.forEach(row => {
      if (formattedData[row.difficulty]) {
        formattedData[row.difficulty].push({
          id: row.id,
          question: row.question,
          options: JSON.parse(row.options),
          answer: row.answer
        });
      }
    });

    res.json(formattedData);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend static files for Render deployment
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Catch-all route to serve React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database", err);
});
