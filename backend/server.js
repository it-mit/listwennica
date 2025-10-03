// === server.js ===
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HF_MODEL = process.env.HF_MODEL || 'tiiuae/falcon-7b-instruct';

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { model, prompt } = req.body || {};

  if (!model || !prompt) {
    return res.status(400).json({ error: 'Model and prompt are required.' });
  }

  try {
    let text;

    if (model === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      text = response.data.choices?.[0]?.message?.content?.trim();
    } else if (model === 'hf') {
      const apiKey = process.env.HF_API_TOKEN;
      if (!apiKey) {
        return res.status(500).json({ error: 'HF_API_TOKEN is not configured.' });
      }

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${HF_MODEL}`,
        { inputs: prompt },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        text = response.data[0]?.generated_text || response.data[0]?.summary_text;
      } else if (typeof response.data === 'object') {
        text = response.data.generated_text || response.data.summary_text;
      }

      if (!text) {
        text = JSON.stringify(response.data);
      }
    } else {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    if (!text) {
      return res.status(502).json({ error: 'No text returned from model.' });
    }

    res.json({ model, text });
  } catch (error) {
    console.error('Chat error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch response from the model.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
