const express = require('express');
const router = express.Router();

require("dotenv").config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/', async (req, res) => {
  const { message } = req.body;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: message,
    max_tokens: 3000,
    temperature: 0.3,
  });
  res.json({ botResponse: response.data.choices[0].text });
});

router.post('/task', async (req, res) => {
  console.log(req.body);
})

router.post('/project', async (req, res) => {
  console.log(req.body.tasks);
})

module.exports = router;