const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.REACT_APP_GEMINI_API_KEY });

// Gemini API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { inputText } = req.body;
    if (!inputText) return res.status(400).json({ error: 'inputText is required' });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: inputText,
    });
    res.json({ text: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('SpendMe Gemini API Proxy is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 