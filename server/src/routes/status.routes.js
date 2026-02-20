import { Router } from "express";
import TeacherStatus from "../models/TeacherStatus.js";
import Activity from "../models/Activity.js";

const router = Router();

/**
 * GET /api/status
 * Returns list of teacher statuses.
 * If a teacher hasn't updated recently -> treat as "break" (stale).
 */
router.get("/", async (req, res) => {
  try {
    const staleMinutes = Number(req.query.stale_minutes || 30);
    const cutoff = new Date(Date.now() - staleMinutes * 60 * 1000);

    const raw = await TeacherStatus.find({}, { _id: 0, __v: 0 }).lean();

    const data = raw.map((s) => {
      const isStale = !s.updated_at || new Date(s.updated_at) < cutoff;
      return {
        ...s,
        computed_status: isStale ? "break" : s.status,
        is_stale: isStale,
      };
    });

    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

/**
 * POST /api/status
 * Body: { teacher_id, teacher_name, status, note }
 * Upsert per teacher_id.
 * Security: Only allows status updates for teachers that exist in Activity (verified in system).
 */
router.post("/", async (req, res) => {
  try {
    const { teacher_id, teacher_name, status, note = "" } = req.body || {};

    if (!teacher_id || !teacher_name || !status) {
      return res.status(400).json({ ok: false, error: "teacher_id, teacher_name, status required" });
    }

    const tid = String(teacher_id).trim();
    const tname = String(teacher_name).trim();

    // Verify teacher exists in Activity collection (prevents arbitrary ID spoofing)
    const exists = await Activity.exists({ teacher_id: tid });
    if (!exists) {
      return res.status(403).json({ ok: false, error: "Teacher not found in system" });
    }

    const doc = await TeacherStatus.findOneAndUpdate(
      { teacher_id: tid },
      {
        $set: {
          teacher_name: tname,
          status: String(status).trim(),
          note: String(note || "").trim(),
          updated_at: new Date(),
        },
      },
      { upsert: true, new: true }
    ).lean();

    res.json({ ok: true, data: doc });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;