import mongoose from "mongoose";

const TeacherStatusSchema = new mongoose.Schema(
  {
    teacher_id: { type: String, required: true, unique: true, index: true },
    teacher_name: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "busy", "break"], // 🟢 🟠 🔴
      default: "break",
    },
    note: { type: String, default: "" },
    updated_at: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("TeacherStatus", TeacherStatusSchema);