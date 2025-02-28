import mongoose from "mongoose"

const { Schema } = mongoose
const UsersSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    role: { type: String, required: true },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
})

const User = mongoose.model('User', UsersSchema);

app.post('/api/auth/Signup', async (req, res) => {
    const { fullName, email, mobile, password, role } = req.body;

    try {
        const newUser = new User({ fullName, email, mobile, password, role });
        await newUser.save();  // This saves the data to MongoDB
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});



export default mongoose.model("User", UsersSchema);
