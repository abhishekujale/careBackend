const User = require("../../models/User");
const bcryptjs = require('bcryptjs');
const zod = require('zod');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Zod schema for signup validation
const signUpBody = zod.object({
    userName: zod.string().min(1).max(50),
    email: zod.string().email(),
    password: zod.string().min(8).max(50),
    phone: zod.number(),
    role: zod.string().optional()  // in case role is optional
});

const signUpUser = async (req, res) => {
    const parsed = signUpBody.safeParse(req.body);

    if (!parsed.success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        });
    }

    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcryptjs.hash(req.body.password, 10);

        const user = await User.create({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            phone: req.body.phoneNo,
            role: req.body.role
        });

        const userId = user._id;
        const token = jwt.sign({ userId }, process.env.SECRET_KEY);

        console.log("User created successfully, redirecting to home page...");

        res.status(200).json({
            message: "User created successfully, redirecting to home page...",
            data: token
        });

    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};


// Zod schema for signin validation
const signInBody = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8).max(50)
});

const logInUser = async (req, res) => {
    const parsed = signInBody.safeParse(req.body);

    if (!parsed.success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        });
    }

    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({
                message: "User does not exist",
            });
        }

        const passwordMatch = await bcryptjs.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid password",
            });
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);

        console.log("User logged in successfully, redirecting to home page...");

        res.status(200).json({
            message: "User logged in successfully, redirecting to home page...",
            data: token
        });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = { signUpUser, logInUser };
