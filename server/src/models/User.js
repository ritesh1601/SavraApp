import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    provider: { type: String, required: true }, // "google"
    provider_id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["principal", "teacher"], required: true },
    teacher_id: { type: String, default: "" }, // optional mapping later
    last_login: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);