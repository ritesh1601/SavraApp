import fs from "fs";

const BASE = "http://localhost:5000";
const payload = JSON.parse(fs.readFileSync("data/activities.json", "utf-8"));

const res = await fetch(`${BASE}/api/activities/bulk`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const json = await res.json();
console.log(json);