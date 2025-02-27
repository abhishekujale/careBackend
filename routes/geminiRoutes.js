const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=${GEMINI_API_KEY}`;

router.post('/ask-gemini', async (req, res) => {
    const { message } = req.body;

    try {
        const prompt = `
            You are a professional AI medical assistant specializing in pregnancy and women's health.
            - Your tone should be **caring, professional, and clear**.
            - Cover pregnancy-related topics such as prenatal care, trimester-specific symptoms, nutrition, and lifestyle advice.
            - Also cover general women's health topics such as menstrual health, fertility, menopause, and gynecological concerns.
            - Emphasize consulting doctors for emergencies but offer useful guidance for day-to-day questions.
            - Limit answers to **100 words**, unless the user asks for detailed information.
            - Structure responses for readability, using bullet points if necessary.

            User's question: ${message}
        `;

        const response = await axios.post(
            apiUrl,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    }
                ]
            }
        );

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      "I'm sorry, I couldn't generate a proper response. Please try again.";

        res.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to get response from Gemini API." });
    }
});

module.exports = router;
