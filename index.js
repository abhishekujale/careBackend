const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// MongoDB Connection
const mongoURI = 'mongodb+srv://omkarkore789:abc005@cluster0.dhsz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((err) => {
    console.error("MongoDB connection error:", err);
});

// User Schema
const userSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    mobile: String,
    password: String,   // (Consider hashing this in real app)
    role: String,
});

const User = mongoose.model('User', userSchema);

// ========================= SIGNUP ROUTE =========================
app.post('/api/auth/Signup', async (req, res) => {
    try {
        const { fullName, email, mobile, password, role } = req.body;

        if (!fullName || !email || !mobile || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const newUser = new User({ fullName, email, mobile, password, role });
        await newUser.save();

        res.status(201).json({ message: "Signup successful", user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// ========================= SIGNIN ROUTE =========================
app.post('/api/auth/Signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Simple password check (for production, compare hashed passwords using bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.status(200).json({
            message: "Signin successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in .env file");
    process.exit(1);
}

const GEMINI_CHAT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/ask-gemini', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ message: "Message is required" });
    }

    const prompt = `
        You are a caring virtual medical assistant specializing in pregnancy care.
        Please provide accurate, concise, and compassionate responses.
        Always remind users to consult healthcare providers for emergencies.
        Maximum 100 words unless asked for more detail.

        User's question: ${message}
    `;

    try {
        const response = await axios.post(GEMINI_CHAT_API_URL, {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        });

        console.log("✅ Gemini API Response:", JSON.stringify(response.data, null, 2));

        const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't understand that.";

        res.json({ reply });
    } catch (error) {
        console.error("❌ Gemini API Error:", error.response?.status, error.response?.data || error.message);
        res.status(500).json({ message: "Failed to communicate with Gemini API.", error: error.message });
    }
});

app.listen(5000, () => {
    console.log(`🚀 Server running on http://localhost: 5000`);
});
