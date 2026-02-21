import { Router } from "express";
import Activity from "../models/Activity.js";
import { buildDedupeKey } from "../utils/dedupeKey.js"

const router = Router();

/**
 * POST /api/activities/bulk
 * Body: { activities: [ ... ] }
 * Upserts by dedupe_key so duplicates are handled gracefully.
 */
router.post("/bulk", async (req, res) => {
  try {
    const activities = Array.isArray(req.body.activities) ? req.body.activities : [];

    if (activities.length === 0) {
      return res.status(400).json({ ok: false, error: "activities array required" });
    }

    const ops = activities.map((a) => {
      const doc = {
        teacher_id: String(a.teacher_id ?? "").trim(),
        teacher_name: String(a.teacher_name ?? "").trim(),
        activity_type: String(a.activity_type ?? "").trim(),
        created_at: new Date(a.created_at),
        subject: String(a.subject ?? "").trim(),
        class: String(a.class ?? "").trim(),
      };

      const dedupe_key = buildDedupeKey(doc);

      return {
        updateOne: {
          filter: { dedupe_key },
          update: { $setOnInsert: { ...doc, dedupe_key } },
          upsert: true,
        },
      };
    });

    const result = await Activity.bulkWrite(ops, { ordered: false });

    res.json({
      ok: true,
      upserted: result.upsertedCount ?? 0,
      matched: result.matchedCount ?? 0,
      modified: result.modifiedCount ?? 0,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
