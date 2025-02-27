import mongoose from mongoose;

const { schema } = mongoose();

const ReportsSchema = new schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    bloodPressure: { type: Number },
    bloodSugar: { type: Number },
    bodyTemperature: { type: Number },
    heartRate: { type: Number },
    age: { type: Number },
    date: { type: Date, required: true }
})

export default mongoose.model("Report", ReportSchema);