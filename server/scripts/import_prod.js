import fs from "fs";

const BASE = "https://savraapp.onrender.com"; // your deployed backend
const payload = JSON.parse(fs.readFileSync("data/activities.json", "utf-8"));

const res = await fetch(`${BASE}/api/activities/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // If your /bulk is protected later, we'd add credentials/token here
    body: JSON.stringify(payload),
});

const json = await res.json();
console.log(json);