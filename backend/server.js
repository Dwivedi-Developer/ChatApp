const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Gemini API
import 'dotenv/config'
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "chat_database", // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database", err);
  } else {
    console.log("Connected to MySQL database");

    // Create messages table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.query(createTableQuery, (err) => {
      if (err) {
        console.error("Error creating messages table", err);
      } else {
        console.log("Messages table created or already exists");
      }
    });
  }
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyB7ed0OMbgQxCPdjBhh574OlIuaW0ALs5k"); // Replace with your Gemini API key

// Function to fetch data from Gemini API
const fetchDataFromGemini = async (query) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Use the Gemini Pro model
    const result = await model.generateContent(query);
    const response = await result.response;
    const text = response.text();

    // Limit the response to 50 words
    const limitedResponse = text.split(" ").slice(0, 50).join(" ");
    return limitedResponse;
  } catch (error) {
    console.error("Error fetching data from Gemini API", error);
    return "Sorry, I couldn't fetch the data. Please try again later.";
  }
};

// API to send and receive messages
app.post("/api/messages", async (req, res) => {
  const { sender, message } = req.body;

  // Save the user's message in the database
  const saveUserMessageQuery = `INSERT INTO messages (sender, message) VALUES (?, ?)`;
  db.query(saveUserMessageQuery, [sender, message], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch a response from Gemini API
    const botResponse = await fetchDataFromGemini(message);

    // Save the bot's response in the database
    const saveBotMessageQuery = `INSERT INTO messages (sender, message) VALUES (?, ?)`;
    db.query(saveBotMessageQuery, ["Bot", botResponse], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: results.insertId, sender: "Bot", message: botResponse });
    });
  });
});

// API to fetch all messages
app.get("/api/messages", (req, res) => {
  const query = `SELECT * FROM messages ORDER BY timestamp ASC`;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});