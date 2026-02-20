import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    teacher_id: { type: String, required: true, index: true },
    teacher_name: { type: String, required: true },
    activity_type: {
      type: String,
      required: true,
      enum: ["lesson", "quiz", "assessment"],
      index: true,
    },
    created_at: { type: Date, required: true, index: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    dedupe_key: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

// Helpful composite index for analytics
ActivitySchema.index({ teacher_id: 1, created_at: 1 });

export default mongoose.model("Activity", ActivitySchema);