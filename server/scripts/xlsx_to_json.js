import fs from "fs";
import path from "path";
import xlsx from "xlsx";

function normActivityType(x) {
  const v = String(x || "").trim().toLowerCase();
  if (v === "lessons") return "lesson";
  if (v === "quizzes") return "quiz";
  if (v === "assessments") return "assessment";
  return v; // lesson/quiz/assessment expected
}

function parseDate(x) {
  // Excel can store dates as numbers or strings
  // xlsx.utils.sheet_to_json often gives strings if formatted
  if (x instanceof Date) return x.toISOString();

  const s = String(x || "").trim();
  // if numeric excel date:
  if (!Number.isNaN(Number(s)) && s !== "") {
    // Excel date number to JS date
    const excelDate = Number(s);
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return jsDate.toISOString();
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();

  return null;
}

const inputXlsx = path.resolve("data/teacher_data.xlsx");
const outputJson = path.resolve("data/activities.json");

const wb = xlsx.readFile(inputXlsx);
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];

// Read rows
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

// Map to required format
const activities = rows
  .map((r) => ({
    teacher_id: String(r.teacher_id || r.TeacherID || r["teacher id"] || r["Teacher ID"] || "").trim(),
    teacher_name: String(r.teacher_name || r.TeacherName || r["teacher name"] || r["Teacher Name"] || "").trim(),
    activity_type: normActivityType(r.activity_type || r.ActivityType || r["activity type"] || r["Activity Type"] || ""),
    created_at: parseDate(r.created_at || r.CreatedAt || r["created at"] || r["Created At"] || ""),
    subject: String(r.subject || r.Subject || "").trim(),
    class: String(r.class || r.Class || r["grade"] || r["Grade"] || "").trim(),
  }))
  .filter((a) => a.teacher_id && a.teacher_name && a.activity_type && a.created_at && a.subject && a.class);

// Save
fs.writeFileSync(outputJson, JSON.stringify({ activities }, null, 2), "utf-8");

console.log(`✅ Converted: ${activities.length} rows`);
console.log(`✅ Output: ${outputJson}`);