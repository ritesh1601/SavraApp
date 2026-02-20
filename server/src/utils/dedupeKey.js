export function toDayISOString(d) {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return null;
    // day-level precision to avoid mismatched timestamps from Excel
    const yyyy = x.getUTCFullYear();
    const mm = String(x.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(x.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  
  export function buildDedupeKey(a) {
    const day = toDayISOString(a.created_at);
    return [
      a.teacher_id?.trim(),
      a.activity_type?.trim(),
      day,
      a.subject?.trim(),
      a.class?.trim(),
    ].join("|");
  }