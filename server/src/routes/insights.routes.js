import { Router } from "express";
import Activity from "../models/Activity.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.use(requireRole("principal"));
function teacherMatch(req) {
  function teacherMatch(req) {
    const teacher_id = req.query.teacher_id?.trim();

    const base = {
      teacher_id: { $exists: true, $ne: null, $ne: "" },
      teacher_name: { $exists: true, $ne: null, $ne: "" },
    };

    return teacher_id ? { ...base, teacher_id } : base;
  }
}

// 1) Per-teacher totals
// GET /api/insights/teachers/summary
router.get("/teachers/summary", async (req, res) => {
  try {
    const match = teacherMatch(req);

    const pipeline = [
      { $match: match },

      // Normalize activity_type safely
      {
        $addFields: {
          activity_type_norm: {
            $switch: {
              branches: [
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["lesson", "lessons"]] },
                  then: "lesson",
                },
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["quiz", "quizzes"]] },
                  then: "quiz",
                },
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["assessment", "assessments"]] },
                  then: "assessment",
                },
              ],
              default: "other",
            },
          },
        },
      },

      {
        $group: {
          _id: { teacher_id: "$teacher_id", teacher_name: "$teacher_name" },
          lessons: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "lesson"] }, 1, 0] } },
          quizzes: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "quiz"] }, 1, 0] } },
          assessments: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "assessment"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },

      {
        $project: {
          _id: 0,
          teacher_id: "$_id.teacher_id",
          teacher_name: "$_id.teacher_name",
          lessons: 1,
          quizzes: 1,
          assessments: 1,
          total: 1,
        },
      },

      { $sort: { total: -1, teacher_name: 1 } },
    ];

    const data = await Activity.aggregate(pipeline);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
// 2) Weekly trend chart
// GET /api/insights/weekly?teacher_id=T1
router.get("/weekly", async (req, res) => {
  try {
    const teacher_id = req.query.teacher_id?.trim();
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const match = {
      created_at: { $gte: since },
      ...(teacher_id ? { teacher_id } : {}),
    };

    const pipeline = [
      { $match: match },
      {
        $addFields: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          activity_type_norm: {
            $switch: {
              branches: [
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["lesson", "lessons"]] },
                  then: "lesson",
                },
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["quiz", "quizzes"]] },
                  then: "quiz",
                },
                {
                  case: { $in: [{ $toLower: { $ifNull: ["$activity_type", ""] } }, ["assessment", "assessments"]] },
                  then: "assessment",
                },
              ],
              default: "other",
            },
          },
        },
      },
      {
        $group: {
          _id: "$day",
          lesson: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "lesson"] }, 1, 0] } },
          quiz: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "quiz"] }, 1, 0] } },
          assessment: { $sum: { $cond: [{ $eq: ["$activity_type_norm", "assessment"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          lesson: 1,
          quiz: 1,
          assessment: 1,
          total: 1,
        },
      },
      { $sort: { day: 1 } },
    ];

    const data = await Activity.aggregate(pipeline);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});
// 3) Teacher drilldown
// GET /api/insights/teacher/:teacher_id
router.get("/teacher/:teacher_id", async (req, res) => {
  try {
    const teacher_id = req.params.teacher_id.trim();

    const [summary] = await Activity.aggregate([
      { $match: { teacher_id } },
      {
        $group: {
          _id: "$activity_type",
          count: { $sum: 1 },
        },
      },
    ]);

    const totals = await Activity.aggregate([
      { $match: { teacher_id } },
      {
        $group: {
          _id: "$activity_type",
          count: { $sum: 1 },
        },
      },
    ]);

    const bySubject = await Activity.aggregate([
      { $match: { teacher_id } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $project: { _id: 0, subject: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    const byClass = await Activity.aggregate([
      { $match: { teacher_id } },
      { $group: { _id: "$class", count: { $sum: 1 } } },
      { $project: { _id: 0, class: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]);

    res.json({ ok: true, data: { teacher_id, totals, bySubject, byClass } });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// 4) Teacher list for dropdown
// GET /api/insights/teachers/list
router.get("/teachers/list", async (req, res) => {
  try {
    const data = await Activity.aggregate([
      { $group: { _id: { teacher_id: "$teacher_id", teacher_name: "$teacher_name" } } },
      { $project: { _id: 0, teacher_id: "$_id.teacher_id", teacher_name: "$_id.teacher_name" } },
      { $sort: { teacher_name: 1 } },
    ]);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;