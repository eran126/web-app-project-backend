const axios = require('axios');

const generatePost = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
};

export default { generatePost };