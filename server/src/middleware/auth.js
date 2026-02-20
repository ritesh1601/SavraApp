export function requireAuth(req, res, next) {
    if (req.user) return next();
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  
  export function requireRole(role) {
    return (req, res, next) => {
      if (!req.user) return res.status(401).json({ ok: false, error: "Unauthorized" });
      if (req.user.role !== role) return res.status(403).json({ ok: false, error: "Forbidden" });
      next();
    };
  }