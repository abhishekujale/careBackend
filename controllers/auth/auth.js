const User = require("../../models/User")
const bcryptjs = require('bcryptjs');
const zod = require('zod');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const signUpBody = zod.object({
    userName: zod.string().min(1).max(50),
    email: zod.string().email(),
    password: zod.string().min(8).max(50),
    phone: zod.number()
})

const signUpUser = (async (req, res) => {
    const success = signUpBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        });
    }

    const existingUser = await User.findOne({
        email: req.body.email
    })

    if (existingUser) {
        return res.status(400).json({
            message: "User is Already exist",
        });
    }
    const hashedPassword = await bcryptjs.hash(req.body.password, 10);
    const user = await User.create({
        userName: req.body.userName,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role
    })

    const userId = user._id;
    const token = jwt.sign({
        userId
    },
        process.env.SECRET_KEY
    )
    return res.json({
        message: "User created successfully",
        data: token
    })

})


const signInUser = zod.object({
    email: zod.string().email(),
    password: zod.string().min(8).max(50)
})

const logInUser = async (req, res) => {
    const success = signInBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs",
        })
    }
    const user = await User.findOne(req.email);
    if (!user) {
        return res.status(400).json({
            message: "User is not exist",
        })
    }
    const decodedPassword = await bcryptjs.compare(req.body.password, user.password);
    if (!decodedPassword) {
        return res.status(401).json({
            message: "Invalid password",
        })
    }

    const token = jwt.sign({
        userId: user._id,
    },
        process.env.SECRET_KEY
    )

    res.status(200).json({
        message: "User logged in successfully",
        data: token
    })
}
module.exports = { signUpUser, logInUser };