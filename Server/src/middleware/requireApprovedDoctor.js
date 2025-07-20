module.exports = function requireApprovedDoctor(req, res, next) {
  if (!req.user || req.user.role !== 'doctor') {
    return res.status(403).json({ success: false, message: 'Access denied: Not a doctor' });
  }
  if (!req.user.is_approved) {
    return res.status(403).json({ success: false, message: 'Access denied: Doctor not approved yet' });
  }
  next();
};
