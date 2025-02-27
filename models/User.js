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


export default mongoose.model("User", UsersSchema);
