import { Router } from "express";
import Activity from "../models/Activity.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
const router = Router();
router.use(requireAuth);
router.use(requireRole("principal"));
function teacherMatch(req) {
  const teacher_id = req.query.teacher_id?.trim();
  return teacher_id ? { teacher_id } : {};
}

// 1) Per-teacher totals
// GET /api/insights/teachers/summary
router.get("/teachers/summary", async (req, res) => {
  try {
    const pipeline = [
      { $match: teacherMatch(req) },
      {
        $group: {
          _id: { teacher_id: "$teacher_id", teacher_name: "$teacher_name", activity_type: "$activity_type" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { teacher_id: "$_id.teacher_id", teacher_name: "$_id.teacher_name" },
          counts: { $push: { k: "$_id.activity_type", v: "$count" } },
          total: { $sum: "$count" },
        },
      },
      {
        $addFields: {
          countsObj: { $arrayToObject: "$counts" },
        },
      },
      {
        $project: {
          _id: 0,
          teacher_id: "$_id.teacher_id",
          teacher_name: "$_id.teacher_name",
          lessons: { $ifNull: ["$countsObj.lesson", 0] },
          quizzes: { $ifNull: ["$countsObj.quiz", 0] },
          assessments: { $ifNull: ["$countsObj.assessment", 0] },
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
    const match = teacherMatch(req);

    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$created_at" },
            week: { $isoWeek: "$created_at" },
            activity_type: "$activity_type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", week: "$_id.week" },
          counts: { $push: { k: "$_id.activity_type", v: "$count" } },
          total: { $sum: "$count" },
        },
      },
      { $addFields: { countsObj: { $arrayToObject: "$counts" } } },
      {
        $project: {
          _id: 0,
          week: {
            $concat: [
              { $toString: "$_id.year" },
              "-W",
              { $cond: [{ $lt: ["$_id.week", 10] }, { $concat: ["0", { $toString: "$_id.week" }] }, { $toString: "$_id.week" }] },
            ],
          },
          lesson: { $ifNull: ["$countsObj.lesson", 0] },
          quiz: { $ifNull: ["$countsObj.quiz", 0] },
          assessment: { $ifNull: ["$countsObj.assessment", 0] },
          total: 1,
        },
      },
      { $sort: { week: 1 } },
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